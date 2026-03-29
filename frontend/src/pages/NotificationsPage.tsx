import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'
import toast from 'react-hot-toast'
import {
  Bell, Wrench, CreditCard, FileText, AlertTriangle,
  CheckCheck, Trash2, Filter, Clock, CheckCircle
} from 'lucide-react'

const TYPE_LABELS: Record<string, string> = {
  MAINTENANCE: 'صيانة',
  PAYMENT: 'مدفوعات',
  CONTRACT: 'عقود',
  ALERT: 'تنبيهات',
}

const TYPE_ICONS: Record<string, any> = {
  MAINTENANCE: Wrench,
  PAYMENT: CreditCard,
  CONTRACT: FileText,
  ALERT: AlertTriangle,
}

const TYPE_COLORS: Record<string, string> = {
  MAINTENANCE: 'bg-orange-100 text-orange-600',
  PAYMENT: 'bg-green-100 text-green-600',
  CONTRACT: 'bg-blue-100 text-blue-600',
  ALERT: 'bg-red-100 text-red-600',
}

export default function NotificationsPage() {
  const queryClient = useQueryClient()
  const [filter, setFilter] = useState<'ALL' | 'UNREAD' | string>('ALL')

  const { data, isLoading } = useQuery({
    queryKey: ['notifications-page'],
    queryFn: () => api.get('/notifications').then(r => r.data).catch(() => ({ notifications: [] })),
  })

  const markAll = useMutation({
    mutationFn: () => api.put('/notifications/read-all'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications-page'] })
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['notifications-count'] })
      toast.success('تم تعليم جميع الإشعارات كمقروءة')
    },
    onError: () => toast.error('فشل تحديث الإشعارات'),
  })

  const markOne = useMutation({
    mutationFn: (id: string) => api.put(`/notifications/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications-page'] })
      queryClient.invalidateQueries({ queryKey: ['notifications-count'] })
    },
  })

  const deleteOne = useMutation({
    mutationFn: (id: string) => api.delete(`/notifications/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications-page'] })
      queryClient.invalidateQueries({ queryKey: ['notifications-count'] })
      toast.success('تم حذف الإشعار')
    },
    onError: () => toast.error('فشل حذف الإشعار'),
  })

  const allNotifications: any[] = data?.notifications || []

  const filtered = allNotifications.filter(n => {
    if (filter === 'UNREAD') return !n.read
    if (filter !== 'ALL') return n.type === filter
    return true
  })

  const unreadCount = allNotifications.filter(n => !n.read).length

  const filterOptions = [
    { value: 'ALL', label: 'الكل' },
    { value: 'UNREAD', label: 'غير مقروء' },
    { value: 'MAINTENANCE', label: 'صيانة' },
    { value: 'PAYMENT', label: 'مدفوعات' },
    { value: 'CONTRACT', label: 'عقود' },
    { value: 'ALERT', label: 'تنبيهات' },
  ]

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">الإشعارات</h1>
          <p className="text-gray-500 text-sm mt-1">
            {unreadCount > 0 ? `${unreadCount} إشعار غير مقروء` : 'جميع الإشعارات مقروءة'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button onClick={() => markAll.mutate()} disabled={markAll.isPending}
            className="btn-secondary text-sm">
            <CheckCheck size={16} />
            تعليم الكل كمقروء
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter size={15} className="text-gray-400" />
        {filterOptions.map(opt => (
          <button key={opt.value} onClick={() => setFilter(opt.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filter === opt.value
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}>
            {opt.label}
            {opt.value === 'UNREAD' && unreadCount > 0 && (
              <span className="mr-1.5 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="card p-0 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-gray-400">
            <Bell size={48} className="mb-3 opacity-30" />
            <p className="text-base font-medium">لا توجد إشعارات</p>
            <p className="text-sm mt-1">ستظهر هنا الإشعارات الجديدة</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map((n: any) => {
              const Icon = TYPE_ICONS[n.type] || Bell
              const colorClass = TYPE_COLORS[n.type] || 'bg-gray-100 text-gray-600'
              return (
                <div key={n.id}
                  className={`flex items-start gap-4 px-5 py-4 hover:bg-gray-50 transition-colors ${!n.read ? 'bg-primary-50/30' : ''}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${colorClass}`}>
                    <Icon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className={`text-sm font-semibold ${!n.read ? 'text-gray-900' : 'text-gray-700'}`}>
                          {n.title}
                        </p>
                        <p className="text-sm text-gray-500 mt-0.5">{n.message}</p>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Clock size={11} />
                            {new Date(n.createdAt).toLocaleDateString('ar-SA', {
                              year: 'numeric', month: 'short', day: 'numeric',
                              hour: '2-digit', minute: '2-digit'
                            })}
                          </span>
                          {n.type && (
                            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                              {TYPE_LABELS[n.type] || n.type}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {!n.read && (
                          <button onClick={() => markOne.mutate(n.id)}
                            className="p-1.5 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                            title="تعليم كمقروء">
                            <CheckCircle size={16} />
                          </button>
                        )}
                        <button onClick={() => deleteOne.mutate(n.id)}
                          className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                          title="حذف">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                  {!n.read && (
                    <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 shrink-0" />
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {filtered.length > 0 && (
        <p className="text-center text-xs text-gray-400">{filtered.length} إشعار</p>
      )}
    </div>
  )
}
