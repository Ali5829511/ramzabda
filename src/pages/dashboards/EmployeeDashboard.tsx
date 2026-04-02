import { useState } from 'react';
import { useStore } from '../../data/store';
import {
  Users, Calendar, Building2, FileText, Wrench, TrendingUp,
  DollarSign, Bell, CheckCircle, AlertCircle,
  Phone, ChevronRight,
  Target, BarChart2, Home, Search, Activity, UserCheck,
  ClipboardList, PieChart
} from 'lucide-react';

export default function EmployeeDashboard({ onNavigate }: { onNavigate?: (page: string) => void }) {
  const {
    currentUser, properties, units, contracts, payments, invoices,
    maintenanceRequests, customers, appointments, expenses,
    supportTickets, interactions
  } = useStore();

  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'crm' | 'reports'>('overview');
  const [searchTerm, setSearchTerm] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  // Key metrics
  const activeContracts = contracts.filter(c => c.status === 'active');
  const expiringContracts = contracts.filter(c => {
    const days = Math.round((new Date(c.contractEndDate || c.endDate || '').getTime() - Date.now()) / 86400000);
    return days <= 30 && days > 0 && c.status === 'active';
  });
  const overdueInvoices = invoices.filter(i => i.invoiceStatus === 'overdue');
  const openMaintenance = maintenanceRequests.filter(m => m.status !== 'completed' && m.status !== 'cancelled');
  const urgentMaintenance = openMaintenance.filter(m => m.priority === 'urgent' || m.priority === 'high');
  const todayAppointments = appointments.filter(a => a.date === todayStr && a.status !== 'cancelled');
  const newLeads = customers.filter(c => c.status === 'new' || c.status === 'contacted');
  const openTickets = supportTickets?.filter(t => t.status !== 'closed' && t.status !== 'resolved') ?? [];
  const vacantUnits = units.filter(u => u.unitStatus === 'available');

  // Financial overview (this month)
  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthPayments = payments.filter(p => p.paymentDate?.startsWith(currentMonth));
  const monthRevenue = monthPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const monthExpenses = expenses?.filter(e => e.date?.startsWith(currentMonth)).reduce((sum, e) => sum + (e.amount || 0), 0) ?? 0;

  // Occupied rate
  const totalUnits = units.length;
  const rentedUnits = units.filter(u => u.unitStatus === 'rented').length;
  const occupancyRate = totalUnits > 0 ? Math.round((rentedUnits / totalUnits) * 100) : 0;

  // Recent activity
  const recentInteractions = interactions?.slice(-5).reverse() ?? [];
  const recentMaintenance = maintenanceRequests.slice(-5).reverse();

  // Alerts
  const alerts = [
    ...expiringContracts.map(c => ({ type: 'warning', msg: `عقد ${c.contractNumber} ينتهي خلال ${Math.round((new Date(c.contractEndDate || c.endDate || '').getTime() - Date.now()) / 86400000)} يوم`, link: 'contracts-list' })),
    ...overdueInvoices.slice(0, 3).map(i => ({ type: 'danger', msg: `فاتورة متأخرة ${i.invoiceNumber} - ${i.remainingAmount?.toLocaleString('ar-SA')} ر.س`, link: 'payments' })),
    ...urgentMaintenance.slice(0, 2).map(m => ({ type: 'urgent', msg: `بلاغ صيانة عاجل: ${m.title}`, link: 'maintenance' })),
  ];

  const tabs = [
    { id: 'overview', label: 'نظرة عامة', icon: <BarChart2 className="w-4 h-4" /> },
    { id: 'tasks', label: 'المهام والمواعيد', icon: <ClipboardList className="w-4 h-4" /> },
    { id: 'crm', label: 'العملاء والفرص', icon: <Users className="w-4 h-4" /> },
    { id: 'reports', label: 'التقارير السريعة', icon: <PieChart className="w-4 h-4" /> },
  ] as const;

  const navigateTo = (page: string) => {
    if (onNavigate) onNavigate(page);
  };

  return (
    <div className="space-y-5" dir="rtl">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-l from-blue-700 to-indigo-600 rounded-2xl p-5 text-white">
        <p className="text-blue-100 text-sm font-semibold">بوابة الموظف — لوحة التشغيل</p>
        <h1 className="text-2xl font-black mt-1">مرحباً، {currentUser?.name ?? 'الموظف الكريم'}</h1>
        <div className="flex items-center gap-4 mt-2 text-blue-100 text-sm">
          <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{todayAppointments.length} موعد اليوم</span>
          <span className="flex items-center gap-1"><Bell className="w-3.5 h-3.5" />{alerts.length} تنبيه</span>
          <span className="flex items-center gap-1"><Activity className="w-3.5 h-3.5" />نشط</span>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.slice(0, 3).map((a, i) => (
            <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border text-sm ${
              a.type === 'danger' ? 'bg-red-50 border-red-200 text-red-800' :
              a.type === 'urgent' ? 'bg-orange-50 border-orange-200 text-orange-800' :
              'bg-yellow-50 border-yellow-200 text-yellow-800'
            }`}>
              <AlertCircle className="w-4 h-4 shrink-0" />
              <p className="flex-1">{a.msg}</p>
              <button onClick={() => navigateTo(a.link)} className="text-xs font-medium underline shrink-0">عرض</button>
            </div>
          ))}
        </div>
      )}

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'عقارات', value: properties.length, sub: `${properties.filter(p=>p.status==='active').length} نشط`, color: 'text-blue-700 bg-blue-50', icon: <Building2 className="w-5 h-5" />, page: 'properties-list' },
          { label: 'وحدات شاغرة', value: vacantUnits.length, sub: `${occupancyRate}% مؤجر`, color: vacantUnits.length > 0 ? 'text-orange-700 bg-orange-50' : 'text-green-700 bg-green-50', icon: <Home className="w-5 h-5" />, page: 'units' },
          { label: 'عقود نشطة', value: activeContracts.length, sub: `${expiringContracts.length} تنتهي قريباً`, color: 'text-green-700 bg-green-50', icon: <FileText className="w-5 h-5" />, page: 'contracts-list' },
          { label: 'فواتير متأخرة', value: overdueInvoices.length, sub: `${overdueInvoices.reduce((s,i)=>s+(i.remainingAmount||0),0).toLocaleString('ar-SA')} ر.س`, color: overdueInvoices.length > 0 ? 'text-red-700 bg-red-50' : 'text-green-700 bg-green-50', icon: <DollarSign className="w-5 h-5" />, page: 'payments' },
          { label: 'بلاغات صيانة', value: openMaintenance.length, sub: `${urgentMaintenance.length} عاجل`, color: urgentMaintenance.length > 0 ? 'text-red-700 bg-red-50' : 'text-yellow-700 bg-yellow-50', icon: <Wrench className="w-5 h-5" />, page: 'maintenance' },
          { label: 'مواعيد اليوم', value: todayAppointments.length, sub: 'موعد مجدول', color: 'text-purple-700 bg-purple-50', icon: <Calendar className="w-5 h-5" />, page: 'appointments' },
          { label: 'عملاء جدد', value: newLeads.length, sub: 'فرصة مبيعات', color: 'text-indigo-700 bg-indigo-50', icon: <UserCheck className="w-5 h-5" />, page: 'customers' },
          { label: 'تذاكر مفتوحة', value: openTickets.length, sub: 'طلبات دعم', color: openTickets.length > 0 ? 'text-pink-700 bg-pink-50' : 'text-gray-500 bg-gray-50', icon: <ClipboardList className="w-5 h-5" />, page: 'tickets' },
        ].map((k, i) => (
          <button key={i} onClick={() => navigateTo(k.page)}
            className={`card flex items-center gap-3 ${k.color} hover:shadow-md transition-all text-right`}>
            <div className="shrink-0">{k.icon}</div>
            <div>
              <p className="text-2xl font-black">{k.value}</p>
              <p className="text-xs opacity-75 font-medium">{k.label}</p>
              <p className="text-xs opacity-60">{k.sub}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 overflow-x-auto">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px whitespace-nowrap transition-colors ${activeTab === t.id ? 'border-blue-500 text-blue-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          {/* Financial Summary */}
          <div className="card">
            <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2 text-sm">
              <TrendingUp className="w-4 h-4 text-blue-500" /> الملخص المالي — الشهر الحالي
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-green-50 rounded-xl p-3 text-center">
                <p className="text-lg font-black text-green-700">{monthRevenue.toLocaleString('ar-SA')}</p>
                <p className="text-xs text-gray-500">إيرادات ر.س</p>
              </div>
              <div className="bg-red-50 rounded-xl p-3 text-center">
                <p className="text-lg font-black text-red-700">{monthExpenses.toLocaleString('ar-SA')}</p>
                <p className="text-xs text-gray-500">مصروفات ر.س</p>
              </div>
              <div className={`rounded-xl p-3 text-center ${(monthRevenue - monthExpenses) >= 0 ? 'bg-blue-50' : 'bg-orange-50'}`}>
                <p className={`text-lg font-black ${(monthRevenue - monthExpenses) >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
                  {(monthRevenue - monthExpenses).toLocaleString('ar-SA')}
                </p>
                <p className="text-xs text-gray-500">صافي ر.س</p>
              </div>
            </div>
          </div>

          {/* Occupancy Bar */}
          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-gray-700 text-sm flex items-center gap-2">
                <Home className="w-4 h-4 text-indigo-500" /> نسبة الإشغال
              </h3>
              <span className="text-lg font-black text-indigo-700">{occupancyRate}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className="bg-gradient-to-r from-indigo-500 to-blue-500 h-3 rounded-full transition-all"
                style={{ width: `${occupancyRate}%` }} />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{rentedUnits} وحدة مؤجرة</span>
              <span>{vacantUnits.length} شاغرة</span>
              <span>الإجمالي: {totalUnits}</span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'إضافة عقار', icon: <Building2 className="w-4 h-4" />, color: 'bg-blue-100 text-blue-700', page: 'properties-list' },
              { label: 'عقد جديد', icon: <FileText className="w-4 h-4" />, color: 'bg-green-100 text-green-700', page: 'contracts-list' },
              { label: 'تحصيل دفعة', icon: <DollarSign className="w-4 h-4" />, color: 'bg-yellow-100 text-yellow-700', page: 'payments' },
              { label: 'بلاغ صيانة', icon: <Wrench className="w-4 h-4" />, color: 'bg-red-100 text-red-700', page: 'maintenance' },
              { label: 'إضافة عميل', icon: <UserCheck className="w-4 h-4" />, color: 'bg-purple-100 text-purple-700', page: 'customers' },
              { label: 'جدولة موعد', icon: <Calendar className="w-4 h-4" />, color: 'bg-indigo-100 text-indigo-700', page: 'appointments' },
              { label: 'التسويق', icon: <Target className="w-4 h-4" />, color: 'bg-pink-100 text-pink-700', page: 'marketing' },
              { label: 'النماذج', icon: <ClipboardList className="w-4 h-4" />, color: 'bg-orange-100 text-orange-700', page: 'templates' },
            ].map((a, i) => (
              <button key={i} onClick={() => navigateTo(a.page)}
                className={`card flex items-center gap-2 hover:shadow-md transition-all cursor-pointer ${a.color} text-sm font-semibold`}>
                {a.icon} {a.label}
              </button>
            ))}
          </div>

          {/* Recent Maintenance */}
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-700 text-sm flex items-center gap-2">
                <Wrench className="w-4 h-4 text-orange-500" /> آخر بلاغات الصيانة
              </h3>
              <button onClick={() => navigateTo('maintenance')} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                عرض الكل <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <div className="space-y-2">
              {recentMaintenance.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-3">لا توجد بلاغات</p>
              ) : recentMaintenance.map(m => (
                <div key={m.id} className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-xl">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${
                    m.priority === 'urgent' ? 'bg-red-500' : m.priority === 'high' ? 'bg-orange-500' : 'bg-blue-400'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{m.title}</p>
                    <p className="text-xs text-gray-400">{m.createdAt}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
                    m.status === 'completed' ? 'bg-green-100 text-green-700' :
                    m.status === 'in_progress' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {m.status === 'completed' ? 'مكتمل' : m.status === 'in_progress' ? 'جاري' : 'جديد'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TASKS TAB */}
      {activeTab === 'tasks' && (
        <div className="space-y-4">
          {/* Today's Appointments */}
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-700 flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-purple-500" /> مواعيد اليوم ({todayAppointments.length})
              </h3>
              <button onClick={() => navigateTo('appointments')} className="text-xs text-blue-600 hover:underline">عرض الكل</button>
            </div>
            {todayAppointments.length === 0 ? (
              <div className="text-center py-6 text-gray-400">
                <Calendar className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">لا توجد مواعيد اليوم</p>
              </div>
            ) : todayAppointments.map(a => (
              <div key={a.id} className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl mb-2 last:mb-0">
                <div className="w-10 h-10 bg-purple-200 rounded-xl flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5 text-purple-700" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm text-gray-800">
                    {a.type === 'viewing' ? 'معاينة عقار' : a.type === 'handover' ? 'تسليم وحدة' : a.type === 'maintenance' ? 'صيانة' : a.type}
                  </p>
                  <p className="text-xs text-gray-500">{a.time || 'غير محدد الوقت'} | {a.notes?.slice(0, 40) || ''}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${a.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {a.status === 'confirmed' ? 'مؤكد' : 'انتظار'}
                </span>
              </div>
            ))}
          </div>

          {/* Expiring Contracts */}
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-700 flex items-center gap-2 text-sm">
                <AlertCircle className="w-4 h-4 text-yellow-500" /> عقود تنتهي خلال 30 يوم ({expiringContracts.length})
              </h3>
              <button onClick={() => navigateTo('contracts-list')} className="text-xs text-blue-600 hover:underline">إدارة العقود</button>
            </div>
            {expiringContracts.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-3">لا توجد عقود منتهية قريباً</p>
            ) : expiringContracts.map(c => {
              const days = Math.round((new Date(c.contractEndDate || c.endDate || '').getTime() - Date.now()) / 86400000);
              return (
                <div key={c.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-xl mb-2 last:mb-0">
                  <div>
                    <p className="font-semibold text-sm text-gray-800">{c.contractNumber}</p>
                    <p className="text-xs text-gray-500">{c.contractEndDate || c.endDate}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold text-sm ${days <= 7 ? 'text-red-600' : 'text-yellow-600'}`}>{days} يوم</p>
                    <p className="text-xs text-gray-400">متبقي</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Overdue Invoices */}
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-700 flex items-center gap-2 text-sm">
                <DollarSign className="w-4 h-4 text-red-500" /> فواتير متأخرة ({overdueInvoices.length})
              </h3>
              <button onClick={() => navigateTo('payments')} className="text-xs text-blue-600 hover:underline">إدارة الدفعات</button>
            </div>
            {overdueInvoices.length === 0 ? (
              <p className="text-sm text-green-600 text-center py-3 flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4" /> لا توجد فواتير متأخرة
              </p>
            ) : overdueInvoices.slice(0, 5).map(inv => (
              <div key={inv.id} className="flex items-center justify-between p-3 bg-red-50 rounded-xl mb-2 last:mb-0">
                <div>
                  <p className="font-semibold text-sm text-gray-800">{inv.invoiceNumber}</p>
                  <p className="text-xs text-gray-500">{inv.invoiceDate}</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-red-600 text-sm">{(inv.remainingAmount || 0).toLocaleString('ar-SA')} ر.س</p>
                  <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">متأخرة</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CRM TAB */}
      {activeTab === 'crm' && (
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="input-field pr-9 text-sm"
              placeholder="بحث عن عميل..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Lead Pipeline */}
          <div className="card">
            <h3 className="font-bold text-gray-700 mb-3 text-sm flex items-center gap-2">
              <Target className="w-4 h-4 text-indigo-500" /> خط سير الفرص البيعية
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: 'جديد', status: 'new', color: 'bg-blue-100 text-blue-700' },
                { label: 'تواصل', status: 'contacted', color: 'bg-yellow-100 text-yellow-700' },
                { label: 'مفاوضة', status: 'negotiating', color: 'bg-orange-100 text-orange-700' },
                { label: 'مغلق', status: 'closed', color: 'bg-green-100 text-green-700' },
              ].map(stage => {
                const count = customers.filter(c => c.status === stage.status).length;
                return (
                  <div key={stage.status} className={`rounded-xl p-3 text-center ${stage.color}`}>
                    <p className="text-xl font-black">{count}</p>
                    <p className="text-xs font-medium">{stage.label}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Customer List */}
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-700 text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-500" /> قائمة العملاء
              </h3>
              <button onClick={() => navigateTo('customers')} className="text-xs text-blue-600 hover:underline">عرض الكل</button>
            </div>
            <div className="space-y-2">
              {customers
                .filter(c => !searchTerm || c.name.includes(searchTerm) || c.phone.includes(searchTerm))
                .slice(0, 8).map(c => (
                <div key={c.id} className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => navigateTo('customers')}>
                  <div className="w-9 h-9 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {c.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-800 truncate">{c.name}</p>
                    <p className="text-xs text-gray-400 flex items-center gap-1"><Phone className="w-3 h-3" />{c.phone}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
                    c.status === 'new' ? 'bg-blue-100 text-blue-700' :
                    c.status === 'closed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {c.status === 'new' ? 'جديد' : c.status === 'closed' ? 'مغلق' : c.status === 'contacted' ? 'تواصل' : c.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* REPORTS TAB */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="card bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <p className="text-xs text-green-600 font-semibold mb-1">إجمالي الإيرادات السنوية</p>
              <p className="text-2xl font-black text-green-700">
                {activeContracts.reduce((s, c) => s + (c.annualRent || 0), 0).toLocaleString('ar-SA')}
              </p>
              <p className="text-xs text-gray-500 mt-1">ريال سعودي</p>
            </div>
            <div className="card bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <p className="text-xs text-blue-600 font-semibold mb-1">قيمة العقود الفعالة</p>
              <p className="text-2xl font-black text-blue-700">{activeContracts.length}</p>
              <p className="text-xs text-gray-500 mt-1">عقد نشط</p>
            </div>
            <div className="card bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
              <p className="text-xs text-purple-600 font-semibold mb-1">العملاء الإجماليين</p>
              <p className="text-2xl font-black text-purple-700">{customers.length}</p>
              <p className="text-xs text-gray-500 mt-1">مسجل في النظام</p>
            </div>
            <div className="card bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
              <p className="text-xs text-orange-600 font-semibold mb-1">طلبات صيانة مفتوحة</p>
              <p className="text-2xl font-black text-orange-700">{openMaintenance.length}</p>
              <p className="text-xs text-gray-500 mt-1">بلاغ نشط</p>
            </div>
          </div>

          {/* Property Status */}
          <div className="card">
            <h3 className="font-bold text-gray-700 mb-3 text-sm flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-500" /> حالة الوحدات
            </h3>
            {[
              { label: 'مؤجرة', count: units.filter(u=>u.unitStatus==='rented').length, color: 'bg-green-500', total: totalUnits },
              { label: 'شاغرة', count: vacantUnits.length, color: 'bg-orange-500', total: totalUnits },
              { label: 'محجوزة', count: units.filter(u=>u.unitStatus==='reserved').length, color: 'bg-blue-500', total: totalUnits },
              { label: 'صيانة', count: units.filter(u=>u.unitStatus==='maintenance').length, color: 'bg-red-500', total: totalUnits },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-3 mb-2 last:mb-0">
                <p className="text-sm text-gray-600 w-16 shrink-0">{s.label}</p>
                <div className="flex-1 bg-gray-100 rounded-full h-2">
                  <div className={`${s.color} h-2 rounded-full`} style={{ width: `${s.total > 0 ? (s.count / s.total) * 100 : 0}%` }} />
                </div>
                <p className="text-sm font-bold text-gray-700 w-8 text-left shrink-0">{s.count}</p>
              </div>
            ))}
          </div>

          {/* Quick report links */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'تقرير عقار', page: 'property-report', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: <Building2 className="w-4 h-4" /> },
              { label: 'التقارير المالية', page: 'finances', color: 'bg-green-50 text-green-700 border-green-200', icon: <TrendingUp className="w-4 h-4" /> },
              { label: 'مركز الطباعة', page: 'print-center', color: 'bg-purple-50 text-purple-700 border-purple-200', icon: <FileText className="w-4 h-4" /> },
              { label: 'المحاسبة', page: 'accounting', color: 'bg-yellow-50 text-yellow-700 border-yellow-200', icon: <DollarSign className="w-4 h-4" /> },
            ].map((r, i) => (
              <button key={i} onClick={() => navigateTo(r.page)}
                className={`card flex items-center gap-3 border hover:shadow-md transition-all ${r.color} text-sm font-semibold`}>
                {r.icon} {r.label} <ChevronRight className="w-3 h-3 mr-auto" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
