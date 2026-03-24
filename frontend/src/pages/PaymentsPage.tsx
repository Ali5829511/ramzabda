import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'
import toast from 'react-hot-toast'
import { CreditCard, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { PAYMENT_STATUS } from '../lib/constants'
import { useAuthStore } from '../store/authStore'

export default function PaymentsPage() {
  const { user } = useAuthStore()
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['payments'],
    queryFn: () => api.get('/payments').then(r => r.data)
  })

  const markPaid = useMutation({
    mutationFn: (id: string) => api.put(`/payments/${id}`, { status: 'PAID' }),
    onSuccess: () => { toast.success('تم تسجيل الدفع'); qc.invalidateQueries({ queryKey: ['payments'] }) },
    onError: (e: any) => toast.error(e.response?.data?.error || 'حدث خطأ')
  })

  const statusIcon = (s: string) => {
    if (s === 'PAID') return <CheckCircle size={16} className="text-green-500" />
    if (s === 'OVERDUE') return <AlertCircle size={16} className="text-red-500" />
    return <Clock size={16} className="text-yellow-500" />
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">المدفوعات</h1>
        <p className="text-gray-500 text-sm">متابعة المدفوعات والإيجارات</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" /></div>
      ) : (
        <div className="space-y-3">
          {data?.payments?.map((p: any) => (
            <div key={p.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <CreditCard size={18} className="text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{p.contract?.property?.title}</h3>
                    <p className="text-sm text-gray-500">{p.user?.name}</p>
                    <p className="text-xs text-gray-400 mt-1">الاستحقاق: {new Date(p.dueDate).toLocaleDateString('ar-SA')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-left">
                    <p className="text-xl font-bold text-gray-900">{p.amount.toLocaleString()} <span className="text-sm font-normal text-gray-500">ر.س</span></p>
                    <div className="flex items-center gap-1 justify-end">
                      {statusIcon(p.status)}
                      <span className={`text-xs ${p.status === 'PAID' ? 'text-green-600' : p.status === 'OVERDUE' ? 'text-red-600' : 'text-yellow-600'}`}>
                        {PAYMENT_STATUS[p.status]}
                      </span>
                    </div>
                  </div>
                  {['ADMIN', 'OWNER', 'AGENT'].includes(user?.role || '') && p.status === 'PENDING' && (
                    <button onClick={() => markPaid.mutate(p.id)}
                      className="btn-primary text-sm py-1.5 px-3">
                      تسجيل الدفع
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {!data?.payments?.length && (
            <div className="text-center py-12"><CreditCard size={48} className="text-gray-300 mx-auto mb-3" /><p className="text-gray-500">لا توجد مدفوعات</p></div>
          )}
        </div>
      )}
    </div>
  )
}
