import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import api from '../lib/api'
import toast from 'react-hot-toast'
import { ArrowRight, Building2 } from 'lucide-react'
import { PROPERTY_TYPES } from '../lib/constants'
import { useAuthStore } from '../store/authStore'

export default function AddPropertyPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [form, setForm] = useState({
    title: '', description: '', type: 'APARTMENT', status: 'AVAILABLE',
    price: '', area: '', bedrooms: '', bathrooms: '', floor: '',
    address: '', city: '', district: '',
    images: [''], amenities: ['']
  })

  const { data: owners } = useQuery({
    queryKey: ['owners'],
    queryFn: () => api.get('/users').then(r => r.data.filter((u: any) => u.role === 'OWNER')),
    enabled: user?.role === 'ADMIN'
  })

  const mutation = useMutation({
    mutationFn: (data: any) => api.post('/properties', data),
    onSuccess: () => { toast.success('تم إضافة العقار بنجاح'); navigate('/properties') },
    onError: (e: any) => toast.error(e.response?.data?.error || 'حدث خطأ')
  })

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const data = {
      ...form,
      price: parseFloat(form.price),
      area: parseFloat(form.area),
      bedrooms: form.bedrooms ? parseInt(form.bedrooms) : undefined,
      bathrooms: form.bathrooms ? parseInt(form.bathrooms) : undefined,
      floor: form.floor ? parseInt(form.floor) : undefined,
      images: form.images.filter(Boolean),
      amenities: form.amenities.filter(Boolean),
    }
    mutation.mutate(data)
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowRight size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">إضافة عقار جديد</h1>
          <p className="text-gray-500 text-sm">أدخل بيانات العقار الجديد</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card space-y-4">
          <h2 className="font-bold text-gray-900 flex items-center gap-2"><Building2 size={18} />المعلومات الأساسية</h2>
          <div>
            <label className="label">عنوان العقار *</label>
            <input className="input" value={form.title} onChange={e => set('title', e.target.value)} required placeholder="مثال: شقة فاخرة في حي النرجس" />
          </div>
          <div>
            <label className="label">الوصف</label>
            <textarea className="input" rows={3} value={form.description} onChange={e => set('description', e.target.value)} placeholder="وصف تفصيلي للعقار" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">نوع العقار *</label>
              <select className="select" value={form.type} onChange={e => set('type', e.target.value)}>
                {Object.entries(PROPERTY_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="label">الحالة *</label>
              <select className="select" value={form.status} onChange={e => set('status', e.target.value)}>
                <option value="AVAILABLE">متاح</option>
                <option value="RENTED">مؤجر</option>
                <option value="SOLD">مباع</option>
                <option value="RESERVED">محجوز</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">السعر (ر.س) *</label>
              <input className="input" type="number" value={form.price} onChange={e => set('price', e.target.value)} required placeholder="0" />
            </div>
            <div>
              <label className="label">المساحة (م²) *</label>
              <input className="input" type="number" value={form.area} onChange={e => set('area', e.target.value)} required placeholder="0" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="label">غرف النوم</label>
              <input className="input" type="number" value={form.bedrooms} onChange={e => set('bedrooms', e.target.value)} placeholder="0" />
            </div>
            <div>
              <label className="label">الحمامات</label>
              <input className="input" type="number" value={form.bathrooms} onChange={e => set('bathrooms', e.target.value)} placeholder="0" />
            </div>
            <div>
              <label className="label">الطابق</label>
              <input className="input" type="number" value={form.floor} onChange={e => set('floor', e.target.value)} placeholder="0" />
            </div>
          </div>
        </div>

        <div className="card space-y-4">
          <h2 className="font-bold text-gray-900">الموقع</h2>
          <div>
            <label className="label">العنوان التفصيلي *</label>
            <input className="input" value={form.address} onChange={e => set('address', e.target.value)} required placeholder="الشارع والمبنى" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">المدينة *</label>
              <input className="input" value={form.city} onChange={e => set('city', e.target.value)} required placeholder="الرياض" />
            </div>
            <div>
              <label className="label">الحي</label>
              <input className="input" value={form.district} onChange={e => set('district', e.target.value)} placeholder="حي النرجس" />
            </div>
          </div>
        </div>

        <div className="card space-y-4">
          <h2 className="font-bold text-gray-900">الصور والمميزات</h2>
          <div>
            <label className="label">روابط الصور</label>
            {form.images.map((img, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input className="input flex-1" value={img} onChange={e => {
                  const imgs = [...form.images]; imgs[i] = e.target.value; set('images', imgs)
                }} placeholder="https://..." />
                {i === form.images.length - 1 && (
                  <button type="button" className="btn-secondary px-3" onClick={() => set('images', [...form.images, ''])}>+</button>
                )}
              </div>
            ))}
          </div>
          <div>
            <label className="label">المميزات</label>
            {form.amenities.map((a, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input className="input flex-1" value={a} onChange={e => {
                  const arr = [...form.amenities]; arr[i] = e.target.value; set('amenities', arr)
                }} placeholder="مثال: مواقف سيارات" />
                {i === form.amenities.length - 1 && (
                  <button type="button" className="btn-secondary px-3" onClick={() => set('amenities', [...form.amenities, ''])}>+</button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <button type="button" className="btn-secondary" onClick={() => navigate(-1)}>إلغاء</button>
          <button type="submit" className="btn-primary" disabled={mutation.isPending}>
            {mutation.isPending ? 'جاري الحفظ...' : 'حفظ العقار'}
          </button>
        </div>
      </form>
    </div>
  )
}
