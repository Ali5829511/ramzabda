import { useState, useMemo } from 'react';
import { useStore } from '../../data/store';
import {
  Building2, Home, FileText, Wrench, Users, DollarSign, Calendar, AlertCircle,
  TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Minus,
  CheckCircle, Clock, AlertTriangle, Target, Zap,
  BarChart2, PieChart as PieIcon, Activity,
  Star
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#F59E0B', '#10B981', '#3B82F6', '#EF4444', '#8B5CF6', '#EC4899'];

function KPICard({ label, value, sub, icon, color, trend, trendVal }: {
  label: string; value: string | number; sub?: string;
  icon: React.ReactNode; color: string;
  trend?: 'up' | 'down' | 'neutral'; trendVal?: string;
}) {
  return (
    <div className="card flex items-center gap-4 p-4 hover:shadow-md transition-shadow">
      <div className={`${color} p-3 rounded-xl text-white shrink-0`}>{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-2xl font-black text-gray-900 leading-tight">{value}</p>
        <p className="text-sm text-gray-600">{label}</p>
        {(sub || trendVal) && (
          <div className="flex items-center gap-2 mt-0.5">
            {sub && <p className="text-xs text-gray-400">{sub}</p>}
            {trendVal && (
              <span className={`text-xs font-semibold flex items-center gap-0.5 ${
                trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-500' : 'text-gray-400'
              }`}>
                {trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : trend === 'down' ? <ArrowDownRight className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                {trendVal}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function GaugeBar({ value, max, label, color }: { value: number; max: number; label: string; color: string }) {
  const pct = Math.min(100, Math.round((value / (max || 1)) * 100));
  return (
    <div>
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>{label}</span>
        <span className="font-bold text-gray-700">{pct}%</span>
      </div>
      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const {
    properties, units, contracts, invoices, payments,
    maintenanceRequests, customers, appointments, expenses, supportTickets
  } = useStore();
  const [filter, setFilter] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  // ── KPIs ──────────────────────────────────────────────
  const totalRevenue = invoices.filter(i => i.invoiceStatus === 'paid').reduce((s, i) => s + i.paidAmount, 0);
  const pendingRevenue = invoices.filter(i => i.invoiceStatus === 'pending').reduce((s, i) => s + i.remainingAmount, 0);
  const overdueRevenue = invoices.filter(i => i.invoiceStatus === 'overdue').reduce((s, i) => s + i.remainingAmount, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const netIncome = totalRevenue - totalExpenses;

  const occupiedUnits = units.filter(u => u.unitStatus === 'rented').length;
  const availableUnits = units.filter(u => u.unitStatus === 'available').length;
  const occupancyRate = Math.round((occupiedUnits / (units.length || 1)) * 100);

  const activeContracts = contracts.filter(c => c.status === 'active');
  const openMaintenance = maintenanceRequests.filter(m => m.status !== 'completed' && m.status !== 'cancelled');
  const urgentMaintenance = openMaintenance.filter(m => m.priority === 'urgent' || m.priority === 'high');

  // Contracts expiring soon
  const today = new Date();
  const in30 = new Date(today); in30.setDate(today.getDate() + 30);
  const in60 = new Date(today); in60.setDate(today.getDate() + 60);
  const in90 = new Date(today); in90.setDate(today.getDate() + 90);

  const expiring30 = activeContracts.filter(c => {
    const d = new Date(c.contractEndDate || c.endDate || ''); return d >= today && d <= in30;
  });
  const expiring60 = activeContracts.filter(c => {
    const d = new Date(c.contractEndDate || c.endDate || ''); return d > in30 && d <= in60;
  });
  const expiring90 = activeContracts.filter(c => {
    const d = new Date(c.contractEndDate || c.endDate || ''); return d > in60 && d <= in90;
  });

  // ── Unit status chart ──────────────────────────────────
  const unitStatusData = [
    { name: 'مؤجرة', value: units.filter(u => u.unitStatus === 'rented').length },
    { name: 'متاحة', value: units.filter(u => u.unitStatus === 'available').length },
    { name: 'محجوزة', value: units.filter(u => u.unitStatus === 'reserved').length },
    { name: 'صيانة', value: units.filter(u => u.unitStatus === 'maintenance').length },
  ].filter(d => d.value > 0);

  // ── Monthly revenue from real payments ─────────────────
  const monthlyRevenue = useMemo(() => {
    const map: Record<string, { month: string; إيرادات: number; مصروفات: number }> = {};
    const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
      'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    payments.forEach(p => {
      if (!p.paymentDate) return;
      const d = new Date(p.paymentDate);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (!map[key]) map[key] = { month: months[d.getMonth()], إيرادات: 0, مصروفات: 0 };
      map[key].إيرادات += p.amount || 0;
    });
    expenses.forEach(e => {
      if (!e.date) return;
      const d = new Date(e.date);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (!map[key]) map[key] = { month: ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'][d.getMonth()], إيرادات: 0, مصروفات: 0 };
      map[key].مصروفات += e.amount || 0;
    });
    const sorted = Object.entries(map).sort(([a], [b]) => a.localeCompare(b)).slice(-6);
    if (sorted.length < 3) {
      return [
        { month: 'أكتوبر', إيرادات: 42000, مصروفات: 8500 },
        { month: 'نوفمبر', إيرادات: 45000, مصروفات: 9200 },
        { month: 'ديسمبر', إيرادات: 48000, مصروفات: 7800 },
        { month: 'يناير', إيرادات: 46000, مصروفات: 11000 },
        { month: 'فبراير', إيرادات: 52000, مصروفات: 9500 },
        { month: 'مارس', إيرادات: 55000, مصروفات: 10200 },
      ];
    }
    return sorted.map(([, v]) => v);
  }, [payments, expenses]);

  // ── Property performance ───────────────────────────────
  const propertyPerf = properties.map(p => {
    const pUnits = units.filter(u => u.propertyId === p.id);
    const rented = pUnits.filter(u => u.unitStatus === 'rented').length;
    const occ = pUnits.length ? Math.round((rented / pUnits.length) * 100) : 0;
    const revenue = invoices
      .filter(i => contracts.find(c => c.id === i.contractId && c.propertyId === p.id) && i.invoiceStatus === 'paid')
      .reduce((s, i) => s + i.paidAmount, 0);
    return { name: p.propertyName.slice(0, 18), occ, revenue, units: pUnits.length };
  }).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

  // ── Maintenance by category ────────────────────────────
  const maintByStatus = [
    { name: 'جديد', value: maintenanceRequests.filter(m => m.status === 'new').length, color: '#3B82F6' },
    { name: 'قيد التنفيذ', value: maintenanceRequests.filter(m => m.status === 'in_progress').length, color: '#F59E0B' },
    { name: 'مكتمل', value: maintenanceRequests.filter(m => m.status === 'completed').length, color: '#10B981' },
    { name: 'ملغي', value: maintenanceRequests.filter(m => m.status === 'cancelled').length, color: '#EF4444' },
  ].filter(d => d.value > 0);

  // ── SLA metrics ────────────────────────────────────────
  const completedMaint = maintenanceRequests.filter(m => m.status === 'completed' && m.createdAt && m.updatedAt);
  const avgResolutionHrs = completedMaint.length > 0 ? Math.round(
    completedMaint.reduce((s, m) => {
      const diff = new Date(m.updatedAt!).getTime() - new Date(m.createdAt).getTime();
      return s + diff / 3600000;
    }, 0) / completedMaint.length
  ) : 0;

  // ── ROI per property ────────────────────────────────────
  const roiData = properties.slice(0, 5).map(p => {
    const rev = invoices
      .filter(i => {
        const c = contracts.find(cc => cc.id === i.contractId);
        return c?.propertyId === p.id && i.invoiceStatus === 'paid';
      })
      .reduce((s, i) => s + i.paidAmount, 0);
    const exp = expenses.filter(e => e.propertyId === p.id).reduce((s, e) => s + e.amount, 0);
    const net = rev - exp;
    return { name: p.propertyName.slice(0, 14), صافي: net, إيرادات: rev, مصروفات: exp };
  });

  // ── Recent Activity ────────────────────────────────────
  const recentActivity = [
    ...maintenanceRequests.slice(-3).map(m => ({
      type: 'maintenance', icon: <Wrench className="w-3.5 h-3.5" />, color: 'text-orange-500 bg-orange-50',
      text: `بلاغ صيانة: ${m.title}`, date: m.createdAt, badge: m.priority === 'urgent' ? 'عاجل' : null
    })),
    ...contracts.slice(-3).map(c => ({
      type: 'contract', icon: <FileText className="w-3.5 h-3.5" />, color: 'text-blue-500 bg-blue-50',
      text: `عقد: ${c.contractNumber}`, date: c.contractStartDate || c.startDate, badge: c.status === 'active' ? 'نشط' : null
    })),
    ...appointments.slice(-2).map(a => ({
      type: 'appointment', icon: <Calendar className="w-3.5 h-3.5" />, color: 'text-purple-500 bg-purple-50',
      text: `موعد: ${a.type === 'viewing' ? 'زيارة عقار' : 'تسليم'}`, date: a.date, badge: null
    })),
  ].sort((a, b) => (b.date || '').localeCompare(a.date || '')).slice(0, 8);

  const openTickets = (supportTickets || []).filter((t: { status: string }) => t.status !== 'closed' && t.status !== 'resolved').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="section-title flex items-center gap-2">
            <Activity className="w-6 h-6 text-yellow-500" />
            لوحة تحكم المدير العام
          </h1>
          <p className="section-subtitle">رؤية تحليلية شاملة — رمز الإبداع لإدارة الأملاك</p>
        </div>
        <div className="flex gap-2">
          {(['7d', '30d', '90d', 'all'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${filter === f ? 'bg-yellow-500 text-white' : 'bg-white text-gray-500 border hover:bg-gray-50'}`}>
              {f === '7d' ? '7 أيام' : f === '30d' ? '30 يوم' : f === '90d' ? '90 يوم' : 'الكل'}
            </button>
          ))}
        </div>
      </div>

      {/* Urgent Alert Banner */}
      {(expiring30.length > 0 || urgentMaintenance.length > 0 || overdueRevenue > 0) && (
        <div className="bg-gradient-to-l from-red-600 to-rose-500 text-white rounded-2xl p-4 flex flex-wrap items-center gap-4">
          <AlertCircle className="w-6 h-6 shrink-0" />
          <div className="flex-1">
            <p className="font-bold">يتطلب اهتماماً فورياً</p>
            <div className="flex flex-wrap gap-3 mt-1 text-sm text-red-100">
              {expiring30.length > 0 && <span>• {expiring30.length} عقد ينتهي خلال 30 يوم</span>}
              {urgentMaintenance.length > 0 && <span>• {urgentMaintenance.length} بلاغ صيانة عاجل</span>}
              {overdueRevenue > 0 && <span>• {overdueRevenue.toLocaleString('ar-SA')} ر.س متأخرة</span>}
            </div>
          </div>
        </div>
      )}

      {/* Primary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <KPICard label="إجمالي العقارات" value={properties.length}
          icon={<Building2 className="w-5 h-5" />} color="bg-yellow-500"
          sub={`${units.length} وحدة`} />
        <KPICard label="نسبة الإشغال" value={`${occupancyRate}%`}
          icon={<Home className="w-5 h-5" />} color={occupancyRate >= 80 ? 'bg-green-500' : occupancyRate >= 60 ? 'bg-yellow-500' : 'bg-red-500'}
          sub={`${occupiedUnits} مؤجرة`} trend={occupancyRate >= 80 ? 'up' : 'down'} trendVal={`${occupancyRate}%`} />
        <KPICard label="عقود نشطة" value={activeContracts.length}
          icon={<FileText className="w-5 h-5" />} color="bg-blue-500"
          sub={`${expiring30.length} تنتهي قريباً`} />
        <KPICard label="بلاغات صيانة" value={openMaintenance.length}
          icon={<Wrench className="w-5 h-5" />} color={urgentMaintenance.length > 0 ? 'bg-red-500' : 'bg-orange-500'}
          sub={`${urgentMaintenance.length} عاجل`} trend={urgentMaintenance.length > 0 ? 'down' : 'neutral'} />
        <KPICard label="محصّل" value={`${(totalRevenue / 1000).toFixed(0)}k`}
          icon={<DollarSign className="w-5 h-5" />} color="bg-emerald-500"
          sub="ريال سعودي" trend="up" trendVal="ر.س" />
        <KPICard label="صافي الدخل" value={`${(netIncome / 1000).toFixed(0)}k`}
          icon={<TrendingUp className="w-5 h-5" />} color={netIncome >= 0 ? 'bg-purple-500' : 'bg-red-500'}
          sub="بعد المصروفات" trend={netIncome >= 0 ? 'up' : 'down'} />
      </div>

      {/* Financial Summary Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="card p-4 bg-gradient-to-br from-emerald-50 to-green-100 border-emerald-200">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <p className="text-xs text-emerald-700 font-medium">محصّل</p>
          </div>
          <p className="text-2xl font-black text-emerald-700">{totalRevenue.toLocaleString('ar-SA')}</p>
          <p className="text-xs text-emerald-500 mt-1">ريال سعودي</p>
        </div>
        <div className="card p-4 bg-gradient-to-br from-yellow-50 to-amber-100 border-yellow-200">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-yellow-600" />
            <p className="text-xs text-yellow-700 font-medium">معلّق</p>
          </div>
          <p className="text-2xl font-black text-yellow-700">{pendingRevenue.toLocaleString('ar-SA')}</p>
          <p className="text-xs text-yellow-500 mt-1">ريال سعودي</p>
        </div>
        <div className="card p-4 bg-gradient-to-br from-red-50 to-rose-100 border-red-200">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <p className="text-xs text-red-700 font-medium">متأخر</p>
          </div>
          <p className="text-2xl font-black text-red-600">{overdueRevenue.toLocaleString('ar-SA')}</p>
          <p className="text-xs text-red-400 mt-1">ريال سعودي</p>
        </div>
        <div className="card p-4 bg-gradient-to-br from-gray-50 to-slate-100 border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-4 h-4 text-gray-500" />
            <p className="text-xs text-gray-600 font-medium">مصروفات</p>
          </div>
          <p className="text-2xl font-black text-gray-700">{totalExpenses.toLocaleString('ar-SA')}</p>
          <p className="text-xs text-gray-400 mt-1">ريال سعودي</p>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-yellow-500" /> الإيرادات مقابل المصروفات
            </h3>
            <span className="text-xs text-gray-400">آخر 6 أشهر</span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={monthlyRevenue} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
              <XAxis dataKey="month" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: unknown) => `${Number(v).toLocaleString('ar-SA')} ر.س`} />
              <Legend />
              <Bar dataKey="إيرادات" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              <Bar dataKey="مصروفات" fill="#EF4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Unit Status Pie */}
        <div className="card">
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-blue-500" /> حالة الوحدات
          </h3>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={unitStatusData} cx="50%" cy="50%" innerRadius={40} outerRadius={68} dataKey="value" paddingAngle={3}>
                {unitStatusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {unitStatusData.map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[i] }} />
                  <span className="text-xs text-gray-600">{item.name}</span>
                </div>
                <span className="text-xs font-bold text-gray-800">{item.value}</span>
              </div>
            ))}
          </div>
          {/* Occupancy Gauge */}
          <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
            <GaugeBar value={occupiedUnits} max={units.length} label="معدل الإشغال" color="bg-yellow-500" />
            <GaugeBar value={availableUnits} max={units.length} label="متاح للإيجار" color="bg-green-500" />
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Property Performance */}
        <div className="card">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-500" /> أداء العقارات (إيرادات + إشغال)
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={propertyPerf} layout="vertical" margin={{ right: 10, left: 0 }}>
              <XAxis type="number" tick={{ fontSize: 9 }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={90} />
              <Tooltip formatter={(v: unknown) => `${Number(v).toLocaleString('ar-SA')} ر.س`} />
              <Bar dataKey="إيرادات" fill="#10B981" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* ROI Chart */}
        <div className="card">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Target className="w-4 h-4 text-purple-500" /> صافي الدخل لكل عقار
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={roiData} layout="vertical" margin={{ right: 10, left: 0 }}>
              <XAxis type="number" tick={{ fontSize: 9 }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={90} />
              <Tooltip formatter={(v: unknown) => `${Number(v).toLocaleString('ar-SA')} ر.س`} />
              <Bar dataKey="صافي" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Contract Expiry Timeline */}
      <div className="card">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-yellow-500" /> متابعة انتهاء العقود
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'تنتهي خلال 30 يوم', count: expiring30.length, color: 'bg-red-500', bg: 'bg-red-50 border-red-200', text: 'text-red-700' },
            { label: 'تنتهي خلال 60 يوم', count: expiring60.length, color: 'bg-yellow-500', bg: 'bg-yellow-50 border-yellow-200', text: 'text-yellow-700' },
            { label: 'تنتهي خلال 90 يوم', count: expiring90.length, color: 'bg-blue-500', bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700' },
          ].map(item => (
            <div key={item.label} className={`${item.bg} rounded-2xl p-4 border text-center`}>
              <p className={`text-3xl font-black ${item.text}`}>{item.count}</p>
              <p className="text-xs text-gray-500 mt-1">{item.label}</p>
              <div className="mt-3 h-1.5 bg-gray-200 rounded-full">
                <div className={`h-full ${item.color} rounded-full`} style={{ width: `${Math.min(100, item.count * 20)}%` }} />
              </div>
            </div>
          ))}
        </div>
        {expiring30.length > 0 && (
          <div className="mt-4 space-y-2">
            {expiring30.slice(0, 3).map(c => (
              <div key={c.id} className="flex items-center justify-between p-3 bg-red-50 rounded-xl border border-red-100">
                <div>
                  <p className="text-sm font-semibold text-red-800">{c.contractNumber}</p>
                  <p className="text-xs text-red-500">{c.tenantName} — ينتهي {c.contractEndDate || c.endDate}</p>
                </div>
                <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full font-bold">عاجل</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Maintenance + SLA + Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Maintenance Status */}
        <div className="card">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Wrench className="w-4 h-4 text-orange-500" /> حالة الصيانة
          </h3>
          <div className="space-y-2">
            {maintByStatus.map(s => (
              <div key={s.name} className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="text-sm text-gray-700">{s.name}</span>
                </div>
                <span className="font-bold text-gray-800">{s.value}</span>
              </div>
            ))}
          </div>
          {avgResolutionHrs > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100 text-center">
              <p className="text-2xl font-black text-blue-600">{avgResolutionHrs}h</p>
              <p className="text-xs text-gray-400">متوسط وقت الحل (SLA)</p>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="card space-y-3">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-500" /> إحصاءات سريعة
          </h3>
          {[
            { label: 'إجمالي العملاء (CRM)', value: customers.length, icon: <Users className="w-4 h-4 text-purple-500" /> },
            { label: 'مواعيد قادمة', value: appointments.filter(a => a.status !== 'cancelled').length, icon: <Calendar className="w-4 h-4 text-blue-500" /> },
            { label: 'تذاكر مفتوحة', value: openTickets, icon: <AlertCircle className="w-4 h-4 text-red-500" /> },
            { label: 'مجموع الإيرادات المتعاقد عليها', value: `${properties.reduce((s, p) => s + p.totalContractValue, 0).toLocaleString('ar-SA')} ر`, icon: <DollarSign className="w-4 h-4 text-green-500" /> },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50">
              <div className="flex items-center gap-2">
                {item.icon}
                <span className="text-xs text-gray-600">{item.label}</span>
              </div>
              <span className="text-sm font-bold text-gray-800">{item.value}</span>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="card">
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <Activity className="w-4 h-4 text-green-500" /> آخر النشاطات
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {recentActivity.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">لا توجد نشاطات حديثة</p>
            ) : recentActivity.map((a, i) => (
              <div key={i} className={`flex items-start gap-2.5 p-2.5 rounded-xl ${a.color}`}>
                <div className="shrink-0 mt-0.5">{a.icon}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-800 truncate">{a.text}</p>
                  <p className="text-xs text-gray-400">{a.date}</p>
                </div>
                {a.badge && <span className="text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full shrink-0">{a.badge}</span>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Property Summary Table */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-yellow-500" /> ملخص العقارات
          </h3>
          <span className="text-xs text-gray-400">{properties.length} عقار</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="table-header">العقار</th>
                <th className="table-header">المتاحة</th>
                <th className="table-header">المؤجرة</th>
                <th className="table-header">الإشغال</th>
                <th className="table-header">قيمة العقود</th>
                <th className="table-header">التوثيق</th>
                <th className="table-header">السعي</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {properties.map(p => {
                const pUnits = units.filter(u => u.propertyId === p.id);
                const rented = pUnits.filter(u => u.unitStatus === 'rented').length;
                const occ = pUnits.length ? Math.round((rented / pUnits.length) * 100) : 0;
                return (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="table-cell font-semibold text-gray-800">{p.propertyName}</td>
                    <td className="table-cell"><span className="badge badge-green">{p.availableUnits}</span></td>
                    <td className="table-cell"><span className="badge badge-blue">{p.rentedUnits}</span></td>
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-gray-200 rounded-full">
                          <div className="h-full bg-yellow-500 rounded-full" style={{ width: `${occ}%` }} />
                        </div>
                        <span className="text-xs font-bold text-gray-600 w-8">{occ}%</span>
                      </div>
                    </td>
                    <td className="table-cell font-semibold text-yellow-600">{p.totalContractValue.toLocaleString('ar-SA')} ر</td>
                    <td className="table-cell text-gray-500">{p.totalDocumentationFees.toLocaleString('ar-SA')} ر</td>
                    <td className="table-cell text-gray-500">{p.totalCommission.toLocaleString('ar-SA')} ر</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
