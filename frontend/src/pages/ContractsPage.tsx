import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'
import toast from 'react-hot-toast'
import { Plus, FileText, X } from 'lucide-react'
import { CONTRACT_TYPES, CONTRACT_STATUS } from '../lib/constants'
import { useAuthStore } from '../store/authStore'

export default function ContractsPage() {
  const { user } = useAuthStore()
  const qc = useQueryClient()
  const [status, setStatus] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ propertyId: '', tenantId: '', type: 'RENTAL', startDate: '', endDate: '', monthlyRent: '', salePrice: '', deposit: '', terms: '' })

  const { data, isLoading } = useQuery({
    queryKey: ['contracts', status],
    queryFn: () => api.get('/contracts', { params: { status } }).then(r => r.data)
  })
  const { data: properties } = useQuery({
    queryKey: ['props-list'],
    queryFn: () => api.get('/properties').then(r => r.data.properties),
    enabled: showAdd
  })
  const { data: tenants } = useQuery({
    queryKey: ['tenants-list'],
    queryFn: () => api.get('/users').then(r => r.data.filter((u: any) => u.role === 'TENANT')),
    enabled: showAdd && ['ADMIN', 'OWNER', 'AGENT'].includes(user?.role || '')
  })

  const mutation = useMutation({
    mutationFn: (data: any) => api.post('/contracts', data),
    onSuccess: () => { toast.success('تم إنشاء العقد'); qc.invalidateQueries({ queryKey: ['contracts'] }); setShowAdd(false) },
    onError: (e: any) => toast.error(e.response?.data?.error || 'حدث خطأ')
  })

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutation.mutate({
      ...form,
      monthlyRent: form.monthlyRent ? parseFloat(form.monthlyRent) : undefined,
      salePrice: form.salePrice ? parseFloat(form.salePrice) : undefined,
      deposit: form.deposit ? parseFloat(form.deposit) : undefined,
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">العقود</h1>
          <p className="text-gray-500 text-sm">إدارة عقود الإيجار والبيع</p>
        </div>
        {['ADMIN', 'OWNER', 'AGENT'].includes(user?.role || '') && (
          <button className="btn-primary" onClick={() => setShowAdd(true)}>
            <Plus size={18} /> عقد جديد
          </button>
        )}
      </div>

      <div className="flex gap-2">
        {['', 'ACTIVE', 'EXPIRED', 'TERMINATED', 'PENDING'].map(s => (
          <button key={s} onClick={() => setStatus(s)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${status === s ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50 border'}`}>
            {s === '' ? 'الكل' : CONTRACT_STATUS[s]}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" /></div>
      ) : (
        <div className="space-y-3">
          {data?.contracts?.map((c: any) => (
            <div key={c.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FileText size={18} className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{c.property?.title}</h3>
                    <p className="text-sm text-gray-500">{c.property?.city} - {c.property?.address}</p>
                    <p className="text-sm text-gray-600 mt-1">المستأجر: <span className="font-medium">{c.tenant?.name}</span></p>
                    <div className="flex gap-4 mt-2 text-xs text-gray-500">
                      <span>{new Date(c.startDate).toLocaleDateString('ar-SA')}</span>
                      <span>←</span>
                      <span>{new Date(c.endDate).toLocaleDateString('ar-SA')}</span>
                    </div>
                  </div>
                </div>
                <div className="text-left flex flex-col items-end gap-2">
                  <span className={c.status === 'ACTIVE' ? 'badge-active' : c.status === 'EXPIRED' ? 'badge-sold' : 'badge-pending'}>
                    {CONTRACT_STATUS[c.status]}
                  </span>
                  <span className="text-sm text-gray-500">{CONTRACT_TYPES[c.type]}</span>
                  {c.monthlyRent && <span className="font-bold text-primary-600">{c.monthlyRent.toLocaleString()} ر.س/شهر</span>}
                </div>
              </div>
            </div>
          ))}
          {!data?.contracts?.length && (
            <div className="text-center py-12"><FileText size={48} className="text-gray-300 mx-auto mb-3" /><p className="text-gray-500">لا توجد عقود</p></div>
          )}
        </div>
      )}

      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-lg font-bold">عقد جديد</h2>
              <button onClick={() => setShowAdd(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="label">العقار *</label>
                <select className="select" value={form.propertyId} onChange={e => set('propertyId', e.target.value)} required>
                  <option value="">اختر عقار</option>
                  {properties?.map((p: any) => <option key={p.id} value={p.id}>{p.title}</option>)}
                </select>
              </div>
              <div>
                <label className="label">المستأجر *</label>
                <select className="select" value={form.tenantId} onChange={e => set('tenantId', e.target.value)} required>
                  <option value="">اختر مستأجر</option>
                  {tenants?.map((u: any) => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">نوع العقد</label>
                  <select className="select" value={form.type} onChange={e => set('type', e.target.value)}>
                    <option value="RENTAL">إيجار</option>
                    <option value="SALE">بيع</option>
                  </select>
                </div>
                <div>
                  <label className="label">الإيجار الشهري</label>
                  <input className="input" type="number" value={form.monthlyRent} onChange={e => set('monthlyRent', e.target.value)} placeholder="ر.س" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">تاريخ البداية *</label>
                  <input className="input" type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} required />
                </div>
                <div>
                  <label className="label">تاريخ النهاية *</label>
                  <input className="input" type="date" value={form.endDate} onChange={e => set('endDate', e.target.value)} required />
                </div>
              </div>
              <div>
                <label className="label">التأمين</label>
                <input className="input" type="number" value={form.deposit} onChange={e => set('deposit', e.target.value)} placeholder="ر.س" />
              </div>
              <div>
                <label className="label">شروط العقد</label>
                <textarea className="input" rows={3} value={form.terms} onChange={e => set('terms', e.target.value)} />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" className="btn-secondary" onClick={() => setShowAdd(false)}>إلغاء</button>
                <button type="submit" className="btn-primary" disabled={mutation.isPending}>
                  {mutation.isPending ? 'جاري الحفظ...' : 'إنشاء العقد'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
