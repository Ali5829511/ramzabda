import { useQuery } from '@tanstack/react-query'
import api from '../lib/api'
import { TrendingUp, Building2, FileText, Wrench, CreditCard } from 'lucide-react'

export default function MarketingPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-report'],
    queryFn: () => api.get('/dashboard').then(r => r.data)
  })

  if (isLoading) return <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" /></div>

  const stats = data?.stats || {}

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">التقارير والإحصائيات</h1>
        <p className="text-gray-500 text-sm">نظرة شاملة على أداء المنصة العقارية</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'إجمالي العقارات', value: stats.totalProperties || 0, sub: `${stats.availableProperties || 0} متاح`, icon: Building2, color: 'blue' },
          { label: 'العقود النشطة', value: stats.activeContracts || 0, sub: `من ${stats.totalContracts || 0} إجمالي`, icon: FileText, color: 'purple' },
          { label: 'الصيانة الجارية', value: stats.inProgressMaintenance || 0, sub: `${stats.pendingMaintenance || 0} معلق`, icon: Wrench, color: 'orange' },
          { label: 'الإيرادات المحصلة', value: `${(stats.totalRevenue || 0).toLocaleString()} ر.س`, sub: `${stats.pendingPayments || 0} مدفوعة معلقة`, icon: CreditCard, color: 'green' },
        ].map((s, i) => (
          <div key={i} className="card">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500">{s.label}</span>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                s.color === 'blue' ? 'bg-blue-50 text-blue-600' :
                s.color === 'purple' ? 'bg-purple-50 text-purple-600' :
                s.color === 'orange' ? 'bg-orange-50 text-orange-600' : 'bg-green-50 text-green-600'
              }`}>
                <s.icon size={18} />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><TrendingUp size={18} className="text-primary-600" />توزيع حالات العقارات</h2>
          <div className="space-y-3">
            {[
              { label: 'متاح', value: stats.availableProperties || 0, total: stats.totalProperties || 1, color: 'bg-green-500' },
              { label: 'مؤجر', value: stats.rentedProperties || 0, total: stats.totalProperties || 1, color: 'bg-blue-500' },
              { label: 'تحت الصيانة', value: (stats.totalProperties || 0) - (stats.availableProperties || 0) - (stats.rentedProperties || 0), total: stats.totalProperties || 1, color: 'bg-orange-500' },
            ].map((item, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">{item.label}</span>
                  <span className="font-medium">{item.value} ({Math.round((item.value / item.total) * 100)}%)</span>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full ${item.color} rounded-full transition-all duration-500`}
                    style={{ width: `${Math.round((item.value / item.total) * 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Wrench size={18} className="text-orange-500" />حالات الصيانة</h2>
          <div className="space-y-3">
            {[
              { label: 'معلق', value: stats.pendingMaintenance || 0, color: 'bg-yellow-500' },
              { label: 'جاري', value: stats.inProgressMaintenance || 0, color: 'bg-blue-500' },
            ].map((item, i) => {
              const total = (stats.pendingMaintenance || 0) + (stats.inProgressMaintenance || 0) || 1
              return (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{item.label}</span>
                    <span className="font-medium">{item.value}</span>
                  </div>
                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${item.color} rounded-full`} style={{ width: `${(item.value / total) * 100}%` }} />
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-6 pt-4 border-t">
            <h3 className="font-medium text-gray-900 mb-3">الإعلانات العقارية</h3>
            <div className="flex items-center justify-between p-3 bg-primary-50 rounded-xl">
              <span className="text-primary-700 font-medium">إعلانات نشطة</span>
              <span className="text-2xl font-bold text-primary-700">{stats.listingsCount || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
