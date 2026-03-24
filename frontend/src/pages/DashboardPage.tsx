import { useQuery } from '@tanstack/react-query'
import api from '../lib/api'
import { Building2, FileText, Wrench, CreditCard, TrendingUp, AlertCircle, CheckCircle, Clock } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { MAINTENANCE_STATUS, PROPERTY_STATUS } from '../lib/constants'

export default function DashboardPage() {
  const { user } = useAuthStore()
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.get('/dashboard').then(r => r.data)
  })

  if (isLoading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" /></div>

  const stats = data?.stats || {}

  const statCards = [
    { label: 'إجمالي العقارات', value: stats.totalProperties || 0, icon: Building2, color: 'blue', link: '/properties' },
    { label: 'العقارات المتاحة', value: stats.availableProperties || 0, icon: CheckCircle, color: 'green', link: '/properties?status=AVAILABLE' },
    { label: 'العقود النشطة', value: stats.activeContracts || 0, icon: FileText, color: 'purple', link: '/contracts' },
    { label: 'طلبات الصيانة المعلقة', value: stats.pendingMaintenance || 0, icon: Wrench, color: 'orange', link: '/maintenance' },
    { label: 'المدفوعات المعلقة', value: stats.pendingPayments || 0, icon: CreditCard, color: 'red', link: '/payments' },
    { label: 'إجمالي الإيرادات', value: `${(stats.totalRevenue || 0).toLocaleString()} ر.س`, icon: TrendingUp, color: 'emerald', link: '/payments' },
  ]

  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
    red: 'bg-red-50 text-red-600',
    emerald: 'bg-emerald-50 text-emerald-600',
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">لوحة التحكم</h1>
        <p className="text-gray-500 mt-1">مرحباً {user?.name}، إليك نظرة عامة على النظام</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((s, i) => (
          <Link key={i} to={s.link} className="card hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{s.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{s.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorMap[s.color]}`}>
                <s.icon size={22} />
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Building2 size={20} className="text-primary-600" />
            أحدث العقارات
          </h2>
          <div className="space-y-3">
            {data?.recentProperties?.length ? data.recentProperties.map((p: any) => (
              <Link key={p.id} to={`/properties/${p.id}`}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors border border-gray-100">
                <div>
                  <p className="font-medium text-gray-900 text-sm">{p.title}</p>
                  <p className="text-xs text-gray-500">{p.city} - {p.address}</p>
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-primary-600">{p.price.toLocaleString()} ر.س</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    p.status === 'AVAILABLE' ? 'bg-green-100 text-green-700' :
                    p.status === 'RENTED' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                  }`}>{PROPERTY_STATUS[p.status]}</span>
                </div>
              </Link>
            )) : <p className="text-gray-400 text-center py-4">لا توجد عقارات بعد</p>}
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Wrench size={20} className="text-orange-500" />
            طلبات الصيانة الأخيرة
          </h2>
          <div className="space-y-3">
            {data?.recentMaintenance?.length ? data.recentMaintenance.map((m: any) => (
              <div key={m.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-100">
                <div className="flex items-center gap-3">
                  {m.status === 'PENDING' ? <Clock size={16} className="text-yellow-500" /> :
                   m.status === 'IN_PROGRESS' ? <AlertCircle size={16} className="text-blue-500" /> :
                   <CheckCircle size={16} className="text-green-500" />}
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{m.title}</p>
                    <p className="text-xs text-gray-500">{m.property?.title}</p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  m.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                  m.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                  m.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                }`}>{MAINTENANCE_STATUS[m.status]}</span>
              </div>
            )) : <p className="text-gray-400 text-center py-4">لا توجد طلبات صيانة</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
