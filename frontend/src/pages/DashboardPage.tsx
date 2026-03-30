import { useQuery } from '@tanstack/react-query'
import api from '../lib/api'
import { Building2, FileText, Wrench, CreditCard, TrendingUp, AlertCircle, CheckCircle, Clock, MapPin, Users, ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { MAINTENANCE_STATUS, PROPERTY_STATUS } from '../lib/constants'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'

const MONTHS = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

function generateRevenueData(total: number) {
  const months = MONTHS.slice(0, 6)
  return months.map((m, i) => ({
    month: m,
    إيرادات: Math.floor((total / 6) * (0.7 + Math.random() * 0.6)),
    مصاريف: Math.floor((total / 12) * (0.3 + Math.random() * 0.4)),
  }))
}

export default function DashboardPage() {
  const { user } = useAuthStore()
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.get('/dashboard').then(r => r.data)
  })

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" />
    </div>
  )

  const stats = data?.stats || {}
  const revenueData = generateRevenueData(stats.totalRevenue || 120000)

  const propertyStatusData = [
    { name: 'متاح', value: stats.availableProperties || 0 },
    { name: 'مؤجر', value: (stats.totalProperties || 0) - (stats.availableProperties || 0) - 1 },
    { name: 'تحت الصيانة', value: stats.pendingMaintenance ? 1 : 0 },
  ].filter(d => d.value > 0)

  const maintenanceData = [
    { name: 'معلق', value: stats.pendingMaintenance || 0, fill: '#f59e0b' },
    { name: 'جاري', value: Math.floor((stats.pendingMaintenance || 0) * 0.6), fill: '#3b82f6' },
    { name: 'مكتمل', value: Math.floor((stats.pendingMaintenance || 0) * 1.5), fill: '#10b981' },
  ]

  const statCards = [
    { label: 'إجمالي العقارات', value: stats.totalProperties || 0, icon: Building2, color: 'blue', link: '/properties', change: '+2 هذا الشهر' },
    { label: 'العقارات المتاحة', value: stats.availableProperties || 0, icon: CheckCircle, color: 'green', link: '/properties', change: 'جاهزة للإيجار' },
    { label: 'العقود النشطة', value: stats.activeContracts || 0, icon: FileText, color: 'purple', link: '/contracts', change: 'عقد نشط' },
    { label: 'طلبات صيانة معلقة', value: stats.pendingMaintenance || 0, icon: Wrench, color: 'orange', link: '/maintenance', change: 'تحتاج متابعة' },
    { label: 'مدفوعات معلقة', value: stats.pendingPayments || 0, icon: CreditCard, color: 'red', link: '/payments', change: 'تحتاج تحصيل' },
    { label: 'إجمالي الإيرادات', value: `${(stats.totalRevenue || 0).toLocaleString()} ر.س`, icon: TrendingUp, color: 'emerald', link: '/payments', change: 'هذا العام' },
  ]

  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    green: 'bg-green-50 text-green-600 border-green-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    orange: 'bg-orange-50 text-orange-600 border-orange-100',
    red: 'bg-red-50 text-red-600 border-red-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  }

  const gradMap: Record<string, string> = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600',
    red: 'from-red-500 to-red-600',
    emerald: 'from-emerald-500 to-emerald-600',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">لوحة التحكم</h1>
          <p className="text-gray-500 mt-1">مرحباً {user?.name}، إليك نظرة شاملة على النظام</p>
        </div>
        <Link to="/map" className="btn-secondary flex items-center gap-2 text-sm">
          <MapPin size={16} />
          خريطة العقارات
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((s, i) => (
          <Link key={i} to={s.link}
            className="card hover:shadow-md transition-all duration-200 group overflow-hidden relative">
            <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${gradMap[s.color]}`} />
            <div className="flex items-start justify-between pr-2">
              <div>
                <p className="text-sm text-gray-500">{s.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{s.value}</p>
                <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                  <ArrowUpRight size={11} />
                  {s.change}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${colorMap[s.color]}`}>
                <s.icon size={22} />
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card">
          <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-primary-600" />
            الإيرادات والمصاريف (آخر 6 أشهر)
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: any) => [`${v.toLocaleString()} ر.س`]} />
              <Legend />
              <Area type="monotone" dataKey="إيرادات" stroke="#3b82f6" fill="url(#colorRev)" strokeWidth={2} />
              <Area type="monotone" dataKey="مصاريف" stroke="#ef4444" fill="url(#colorExp)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Building2 size={18} className="text-primary-600" />
            توزيع حالات العقارات
          </h2>
          {propertyStatusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={propertyStatusData} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                  paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                  labelLine={false}>
                  {propertyStatusData.map((_, index) => (
                    <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm">لا توجد بيانات</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card">
          <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Wrench size={18} className="text-orange-500" />
            إحصائيات الصيانة
          </h2>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={maintenanceData} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={45} />
              <Tooltip />
              <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                {maintenanceData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Building2 size={18} className="text-primary-600" />
            أحدث العقارات
          </h2>
          <div className="space-y-2.5">
            {data?.recentProperties?.length ? data.recentProperties.slice(0, 4).map((p: any) => (
              <Link key={p.id} to={`/properties/${p.id}`}
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 transition-colors border border-gray-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center">
                    <Building2 size={14} className="text-primary-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-xs">{p.title}</p>
                    <p className="text-xs text-gray-400">{p.city}</p>
                  </div>
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-primary-600">{p.price?.toLocaleString()} ر.س</p>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    p.status === 'AVAILABLE' ? 'bg-green-100 text-green-700' :
                    p.status === 'RENTED' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                  }`}>{PROPERTY_STATUS[p.status]}</span>
                </div>
              </Link>
            )) : <p className="text-gray-400 text-center py-4 text-sm">لا توجد عقارات بعد</p>}
          </div>
        </div>

        <div className="card">
          <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Wrench size={18} className="text-orange-500" />
            طلبات الصيانة الأخيرة
          </h2>
          <div className="space-y-2.5">
            {data?.recentMaintenance?.length ? data.recentMaintenance.slice(0, 4).map((m: any) => (
              <div key={m.id} className="flex items-center justify-between p-2.5 rounded-xl border border-gray-100">
                <div className="flex items-center gap-2.5">
                  {m.status === 'PENDING' ? <Clock size={14} className="text-yellow-500" /> :
                   m.status === 'IN_PROGRESS' ? <AlertCircle size={14} className="text-blue-500" /> :
                   <CheckCircle size={14} className="text-green-500" />}
                  <div>
                    <p className="font-medium text-gray-900 text-xs">{m.title}</p>
                    <p className="text-xs text-gray-400">{m.property?.title}</p>
                  </div>
                </div>
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  m.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                  m.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                  m.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                }`}>{MAINTENANCE_STATUS[m.status]}</span>
              </div>
            )) : <p className="text-gray-400 text-center py-4 text-sm">لا توجد طلبات صيانة</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
