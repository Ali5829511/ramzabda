import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'
import toast from 'react-hot-toast'
import { Plus, Wrench, X, AlertTriangle, Clock, CheckCircle } from 'lucide-react'
import { MAINTENANCE_CATEGORIES, MAINTENANCE_PRIORITY, MAINTENANCE_STATUS } from '../lib/constants'
import { useAuthStore } from '../store/authStore'

const priorityColors: Record<string, string> = {
  LOW: 'bg-gray-100 text-gray-600',
  MEDIUM: 'bg-yellow-100 text-yellow-700',
  HIGH: 'bg-orange-100 text-orange-700',
  URGENT: 'bg-red-100 text-red-700',
}

export default function MaintenancePage() {
  const { user } = useAuthStore()
  const qc = useQueryClient()
  const [status, setStatus] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ propertyId: '', title: '', description: '', category: 'PLUMBING', priority: 'MEDIUM' })

  const { data, isLoading } = useQuery({
    queryKey: ['maintenance', status],
    queryFn: () => api.get('/maintenance', { params: { status } }).then(r => r.data)
  })

  const { data: properties } = useQuery({
    queryKey: ['props-for-maint'],
    queryFn: () => api.get('/properties').then(r => r.data.properties),
    enabled: showAdd
  })

  const addMutation = useMutation({
    mutationFn: (data: any) => api.post('/maintenance', data),
    onSuccess: () => { toast.success('تم إرسال طلب الصيانة'); qc.invalidateQueries({ queryKey: ['maintenance'] }); setShowAdd(false) },
    onError: (e: any) => toast.error(e.response?.data?.error || 'حدث خطأ')
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: any) => api.put(`/maintenance/${id}`, { status }),
    onSuccess: () => { toast.success('تم تحديث الحالة'); qc.invalidateQueries({ queryKey: ['maintenance'] }) },
    onError: (e: any) => toast.error(e.response?.data?.error || 'حدث خطأ')
  })

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">الصيانة</h1>
          <p className="text-gray-500 text-sm">إدارة طلبات الصيانة والإصلاح</p>
        </div>
        <button className="btn-primary" onClick={() => setShowAdd(true)}>
          <Plus size={18} /> طلب صيانة
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {['', 'PENDING', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD'].map(s => (
          <button key={s} onClick={() => setStatus(s)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${status === s ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50 border'}`}>
            {s === '' ? 'الكل' : MAINTENANCE_STATUS[s]}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" /></div>
      ) : (
        <div className="space-y-3">
          {data?.requests?.map((m: any) => (
            <div key={m.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    m.status === 'PENDING' ? 'bg-yellow-50' : m.status === 'IN_PROGRESS' ? 'bg-blue-50' : 'bg-green-50'
                  }`}>
                    {m.status === 'PENDING' ? <Clock size={18} className="text-yellow-600" /> :
                     m.status === 'IN_PROGRESS' ? <AlertTriangle size={18} className="text-blue-600" /> :
                     <CheckCircle size={18} className="text-green-600" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{m.title}</h3>
                    <p className="text-sm text-gray-500">{m.property?.title}</p>
                    <p className="text-sm text-gray-600 mt-1">{m.description}</p>
                    <div className="flex gap-2 mt-2">
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{MAINTENANCE_CATEGORIES[m.category]}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${priorityColors[m.priority]}`}>{MAINTENANCE_PRIORITY[m.priority]}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    m.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                    m.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                    m.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}>{MAINTENANCE_STATUS[m.status]}</span>
                  {['ADMIN', 'OWNER', 'AGENT'].includes(user?.role || '') && m.status !== 'COMPLETED' && (
                    <div className="flex gap-1">
                      {m.status === 'PENDING' && (
                        <button onClick={() => updateMutation.mutate({ id: m.id, status: 'IN_PROGRESS' })}
                          className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-600 px-2 py-1 rounded-lg">بدء</button>
                      )}
                      {m.status === 'IN_PROGRESS' && (
                        <button onClick={() => updateMutation.mutate({ id: m.id, status: 'COMPLETED' })}
                          className="text-xs bg-green-50 hover:bg-green-100 text-green-600 px-2 py-1 rounded-lg">إتمام</button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          {!data?.requests?.length && (
            <div className="text-center py-12"><Wrench size={48} className="text-gray-300 mx-auto mb-3" /><p className="text-gray-500">لا توجد طلبات صيانة</p></div>
          )}
        </div>
      )}

      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-lg font-bold">طلب صيانة جديد</h2>
              <button onClick={() => setShowAdd(false)}><X size={20} /></button>
            </div>
            <form onSubmit={e => { e.preventDefault(); addMutation.mutate(form) }} className="p-6 space-y-4">
              <div>
                <label className="label">العقار *</label>
                <select className="select" value={form.propertyId} onChange={e => set('propertyId', e.target.value)} required>
                  <option value="">اختر عقار</option>
                  {properties?.map((p: any) => <option key={p.id} value={p.id}>{p.title}</option>)}
                </select>
              </div>
              <div>
                <label className="label">عنوان الطلب *</label>
                <input className="input" value={form.title} onChange={e => set('title', e.target.value)} required placeholder="وصف مختصر للمشكلة" />
              </div>
              <div>
                <label className="label">الوصف التفصيلي *</label>
                <textarea className="input" rows={3} value={form.description} onChange={e => set('description', e.target.value)} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">التصنيف</label>
                  <select className="select" value={form.category} onChange={e => set('category', e.target.value)}>
                    {Object.entries(MAINTENANCE_CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">الأولوية</label>
                  <select className="select" value={form.priority} onChange={e => set('priority', e.target.value)}>
                    {Object.entries(MAINTENANCE_PRIORITY).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" className="btn-secondary" onClick={() => setShowAdd(false)}>إلغاء</button>
                <button type="submit" className="btn-primary" disabled={addMutation.isPending}>
                  {addMutation.isPending ? 'جاري الإرسال...' : 'إرسال الطلب'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
