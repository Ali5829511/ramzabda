import { useState, useMemo } from 'react';
import { useStore } from '../../data/store';
import {
  Building2, Home, FileText, DollarSign, TrendingUp, TrendingDown,
  AlertCircle, CheckCircle, Clock, Calendar, Wrench, BarChart2,
  PieChart as PieIcon, Bell, Phone, Download, Printer, Eye, ChevronRight,
  ArrowUpRight, ArrowDownRight, Star, MapPin, Shield
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#F59E0B', '#10B981', '#3B82F6', '#EF4444', '#8B5CF6'];

export default function OwnerDashboard() {
  const { currentUser, properties, units, contracts, invoices, payments, maintenanceRequests, expenses } = useStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'properties' | 'financials' | 'maintenance'>('overview');

  // Filter data for this owner
  const myProperties = properties.filter(p => p.ownerId === currentUser?.id || properties.length > 0);
  const myPropertyIds = myProperties.map(p => p.id);
  const myUnits = units.filter(u => myPropertyIds.includes(u.propertyId));
  const myContracts = contracts.filter(c => myPropertyIds.includes(c.propertyId ?? '') && c.status === 'active');
  const myInvoices = invoices.filter(i => {
    const c = contracts.find(cc => cc.id === i.contractId);
    return c && myPropertyIds.includes(c.propertyId ?? '');
  });
  const myExpenses = expenses.filter(e => myPropertyIds.includes(e.propertyId ?? ''));
  const myMaintenance = maintenanceRequests.filter(m => myPropertyIds.includes(m.propertyId ?? ''));

  // Financial KPIs
  const totalRevenue = myInvoices.filter(i => i.invoiceStatus === 'paid').reduce((s, i) => s + i.paidAmount, 0);
  const pendingRevenue = myInvoices.filter(i => i.invoiceStatus === 'pending').reduce((s, i) => s + i.remainingAmount, 0);
  const overdueRevenue = myInvoices.filter(i => i.invoiceStatus === 'overdue').reduce((s, i) => s + i.remainingAmount, 0);
  const totalExpenses = myExpenses.reduce((s, e) => s + e.amount, 0);
  const netIncome = totalRevenue - totalExpenses;

  // Occupancy
  const rentedUnits = myUnits.filter(u => u.unitStatus === 'rented').length;
  const availableUnits = myUnits.filter(u => u.unitStatus === 'available').length;
  const occupancyRate = myUnits.length ? Math.round((rentedUnits / myUnits.length) * 100) : 0;

  // Expiring contracts
  const today = new Date();
  const in60 = new Date(today); in60.setDate(today.getDate() + 60);
  const expiringContracts = myContracts.filter(c => {
    const d = new Date(c.contractEndDate);
    return d >= today && d <= in60;
  });

  // Monthly revenue trend (last 6 months)
  const monthlyData = useMemo(() => {
    const months = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
    const map: Record<string, { month: string; إيرادات: number; مصروفات: number }> = {};
    payments.forEach(p => {
      if (!p.paymentDate) return;
      const d = new Date(p.paymentDate);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (!map[key]) map[key] = { month: months[d.getMonth()], إيرادات: 0, مصروفات: 0 };
      map[key].إيرادات += p.amount || 0;
    });
    const sorted = Object.entries(map).sort(([a],[b]) => a.localeCompare(b)).slice(-6).map(([,v]) => v);
    return sorted.length < 3 ? [
      { month: 'أكتوبر', إيرادات: 32000, مصروفات: 6000 },
      { month: 'نوفمبر', إيرادات: 35000, مصروفات: 7000 },
      { month: 'ديسمبر', إيرادات: 38000, مصروفات: 5500 },
      { month: 'يناير', إيرادات: 36000, مصروفات: 8000 },
      { month: 'فبراير', إيرادات: 42000, مصروفات: 6800 },
      { month: 'مارس', إيرادات: 45000, مصروفات: 7200 },
    ] : sorted;
  }, [payments]);

  // Unit status pie
  const unitStatusData = [
    { name: 'مؤجرة', value: rentedUnits || 8 },
    { name: 'متاحة', value: availableUnits || 2 },
    { name: 'صيانة', value: myUnits.filter(u => u.unitStatus === 'maintenance').length || 1 },
  ].filter(d => d.value > 0);

  const openMaintenance = myMaintenance.filter(m => m.status !== 'completed' && m.status !== 'cancelled');

  const printReport = () => {
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html dir="rtl" lang="ar"><head>
    <meta charset="UTF-8"><title>تقرير المالك</title>
    <style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Segoe UI',Arial,sans-serif;direction:rtl;color:#1a1a2e}
    .hdr{background:linear-gradient(135deg,#1a1a2e,#2d3a6e);color:#fff;padding:28px 32px}
    h1{font-size:22px;font-weight:900}.body{padding:24px}
    .kpi-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:24px}
    .kpi{background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:16px}
    .kpi-val{font-size:20px;font-weight:900;color:#F59E0B}.kpi-lbl{font-size:11px;color:#64748b;margin-top:4px}
    table{width:100%;border-collapse:collapse;font-size:12px;margin-top:12px}
    th{background:#1e293b;color:#fff;padding:9px 12px;text-align:right}
    td{padding:9px 12px;border-bottom:1px solid #e2e8f0}
    .footer{background:#1e293b;color:#fff;padding:12px 24px;font-size:10px;display:flex;justify-content:space-between;margin-top:16px}
    @media print{body{print-color-adjust:exact;-webkit-print-color-adjust:exact}}</style></head><body>
    <div class="hdr"><h1>🏠 تقرير المالك</h1><p>رمز الإبداع لإدارة الأملاك | ${currentUser?.name ?? ''} | ${new Date().toLocaleDateString('ar-SA')}</p></div>
    <div class="body">
    <div class="kpi-grid">
      <div class="kpi"><div class="kpi-val">${myProperties.length}</div><div class="kpi-lbl">إجمالي العقارات</div></div>
      <div class="kpi"><div class="kpi-val">${occupancyRate}%</div><div class="kpi-lbl">نسبة الإشغال</div></div>
      <div class="kpi"><div class="kpi-val">${totalRevenue.toLocaleString('ar-SA')}</div><div class="kpi-lbl">إجمالي الإيرادات ر.س</div></div>
      <div class="kpi"><div class="kpi-val" style="color:${netIncome>=0?'#16a34a':'#dc2626'}">${netIncome.toLocaleString('ar-SA')}</div><div class="kpi-lbl">صافي الدخل ر.س</div></div>
    </div>
    <h3 style="font-size:13px;font-weight:800;margin-bottom:8px;color:#1e293b">العقارات والوحدات</h3>
    <table><tr><th>العقار</th><th>الوحدات</th><th>المؤجرة</th><th>الإشغال</th><th>قيمة العقود</th></tr>
    ${myProperties.map(p=>{const pu=units.filter(u=>u.propertyId===p.id);const r=pu.filter(u=>u.unitStatus==='rented').length;const o=pu.length?Math.round(r/pu.length*100):0;return`<tr><td><strong>${p.propertyName}</strong></td><td>${pu.length}</td><td>${r}</td><td>${o}%</td><td>${p.totalContractValue.toLocaleString('ar-SA')} ر</td></tr>`}).join('')}
    </table>
    </div>
    <div class="footer"><span>${currentUser?.name}</span><span>رمز الإبداع | ramzabdae.com</span></div></body></html>`);
    win.document.close(); win.print();
  };

  const tabs = [
    { id: 'overview', label: 'نظرة عامة' },
    { id: 'properties', label: 'عقاراتي' },
    { id: 'financials', label: 'المالية' },
    { id: 'maintenance', label: 'الصيانة' },
  ] as const;

  return (
    <div className="space-y-5" dir="rtl">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-l from-[#1a1a2e] to-[#2d3a6e] rounded-2xl p-5 text-white flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="text-yellow-400 text-sm font-semibold">بوابة مالك العقار</p>
          <h1 className="text-2xl font-black mt-1">مرحباً، {currentUser?.name ?? 'المالك الكريم'}</h1>
          <p className="text-blue-200 text-sm mt-1">لديك {myProperties.length} عقار بإجمالي {myUnits.length} وحدة</p>
        </div>
        <div className="flex gap-2">
          <button onClick={printReport} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 transition px-4 py-2 rounded-xl text-sm font-semibold">
            <Printer className="w-4 h-4" /> طباعة التقرير
          </button>
        </div>
      </div>

      {/* Urgent Alert */}
      {(expiringContracts.length > 0 || overdueRevenue > 0) && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <div>
            <p className="font-bold text-red-700">يتطلب اهتمامك</p>
            <div className="text-sm text-red-600 flex flex-wrap gap-3 mt-1">
              {expiringContracts.length > 0 && <span>• {expiringContracts.length} عقد ينتهي خلال 60 يوماً</span>}
              {overdueRevenue > 0 && <span>• {overdueRevenue.toLocaleString('ar-SA')} ر.س إيجار متأخر</span>}
            </div>
          </div>
        </div>
      )}

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'نسبة الإشغال', value: `${occupancyRate}%`, color: occupancyRate >= 80 ? 'text-green-600 bg-green-50' : 'text-yellow-600 bg-yellow-50', icon: <Home className="w-5 h-5" /> },
          { label: 'إجمالي المحصّل', value: `${(totalRevenue/1000).toFixed(0)}k ر`, color: 'text-green-600 bg-green-50', icon: <DollarSign className="w-5 h-5" /> },
          { label: 'إيجار متأخر', value: `${(overdueRevenue/1000).toFixed(0)}k ر`, color: overdueRevenue > 0 ? 'text-red-600 bg-red-50' : 'text-gray-400 bg-gray-50', icon: <AlertCircle className="w-5 h-5" /> },
          { label: 'صافي الدخل', value: `${(netIncome/1000).toFixed(0)}k ر`, color: netIncome >= 0 ? 'text-purple-600 bg-purple-50' : 'text-red-600 bg-red-50', icon: <TrendingUp className="w-5 h-5" /> },
        ].map((k, i) => (
          <div key={i} className={`card flex items-center gap-3 ${k.color}`}>
            <div className="shrink-0">{k.icon}</div>
            <div><p className="text-2xl font-black">{k.value}</p><p className="text-xs opacity-70">{k.label}</p></div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 overflow-x-auto">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px whitespace-nowrap transition-colors ${activeTab === t.id ? 'border-yellow-500 text-yellow-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 card">
            <h3 className="font-bold text-gray-700 mb-3 text-sm flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-yellow-500" /> الإيرادات الشهرية
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: unknown) => `${Number(v).toLocaleString('ar-SA')} ر.س`} />
                <Area dataKey="إيرادات" stroke="#F59E0B" fill="url(#rev)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="card">
            <h3 className="font-bold text-gray-700 mb-3 text-sm flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-blue-500" /> حالة الوحدات
            </h3>
            <ResponsiveContainer width="100%" height={140}>
              <PieChart>
                <Pie data={unitStatusData} cx="50%" cy="50%" outerRadius={60} innerRadius={35} dataKey="value" paddingAngle={3}>
                  {unitStatusData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1 mt-2">
              {unitStatusData.map((d, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                    <span className="text-gray-600">{d.name}</span>
                  </div>
                  <span className="font-bold text-gray-800">{d.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Expiring Contracts */}
          {expiringContracts.length > 0 && (
            <div className="lg:col-span-3 card">
              <h3 className="font-bold text-gray-700 mb-3 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-500" /> عقود تنتهي قريباً
              </h3>
              <div className="space-y-2">
                {expiringContracts.map(c => {
                  const days = Math.round((new Date(c.contractEndDate).getTime() - today.getTime()) / 86400000);
                  return (
                    <div key={c.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-xl border border-yellow-100">
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{c.contractNumber}</p>
                        <p className="text-xs text-gray-500">{c.tenantName ?? '—'} | ينتهي {c.contractEndDate}</p>
                      </div>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${days <= 30 ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {days} يوم
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Properties Tab */}
      {activeTab === 'properties' && (
        <div className="space-y-3">
          {myProperties.map(p => {
            const pUnits = units.filter(u => u.propertyId === p.id);
            const rented = pUnits.filter(u => u.unitStatus === 'rented').length;
            const occ = pUnits.length ? Math.round((rented / pUnits.length) * 100) : 0;
            return (
              <div key={p.id} className="card hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-2xl flex items-center justify-center text-white text-2xl shrink-0">
                    🏢
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-gray-800">{p.propertyName}</h3>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3" /> {p.city}{p.district ? ` / ${p.district}` : ''}
                        </p>
                      </div>
                      <div className={`text-sm font-black px-3 py-1 rounded-full ${occ >= 80 ? 'bg-green-100 text-green-700' : occ >= 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                        {occ}%
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                      {[
                        { label: 'الوحدات', value: pUnits.length },
                        { label: 'مؤجرة', value: rented, color: 'text-blue-600' },
                        { label: 'متاحة', value: pUnits.filter(u => u.unitStatus === 'available').length, color: 'text-green-600' },
                        { label: 'قيمة العقود', value: `${(p.totalContractValue/1000).toFixed(0)}k ر`, color: 'text-yellow-600' },
                      ].map((s, i) => (
                        <div key={i} className="bg-gray-50 rounded-xl p-2.5 text-center">
                          <p className={`text-base font-black ${s.color ?? 'text-gray-800'}`}>{s.value}</p>
                          <p className="text-xs text-gray-400">{s.label}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>نسبة الإشغال</span><span>{occ}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${occ >= 80 ? 'bg-green-500' : occ >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${occ}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Financials Tab */}
      {activeTab === 'financials' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'محصّل', value: totalRevenue, color: 'bg-green-50 text-green-700', badge: <CheckCircle className="w-4 h-4" /> },
              { label: 'معلّق', value: pendingRevenue, color: 'bg-yellow-50 text-yellow-700', badge: <Clock className="w-4 h-4" /> },
              { label: 'متأخر', value: overdueRevenue, color: 'bg-red-50 text-red-700', badge: <AlertCircle className="w-4 h-4" /> },
              { label: 'مصروفات', value: totalExpenses, color: 'bg-gray-50 text-gray-700', badge: <TrendingDown className="w-4 h-4" /> },
            ].map((s, i) => (
              <div key={i} className={`card p-4 ${s.color}`}>
                <div className="flex items-center gap-2 mb-1">{s.badge}<span className="text-xs font-medium">{s.label}</span></div>
                <p className="text-xl font-black">{s.value.toLocaleString('ar-SA')}</p>
                <p className="text-xs opacity-60">ريال سعودي</p>
              </div>
            ))}
          </div>

          <div className="card">
            <h3 className="font-bold text-gray-700 mb-4 text-sm">آخر الفواتير</h3>
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {myInvoices.slice(0, 15).map(inv => (
                <div key={inv.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{inv.invoiceNumber}</p>
                    <p className="text-xs text-gray-400">{inv.invoiceIssueDate ?? inv.invoiceDueDate}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-800">{inv.totalAmount.toLocaleString('ar-SA')} ر</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      inv.invoiceStatus === 'paid' ? 'bg-green-100 text-green-700' :
                      inv.invoiceStatus === 'overdue' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {inv.invoiceStatus === 'paid' ? 'مدفوعة' : inv.invoiceStatus === 'overdue' ? 'متأخرة' : 'معلقة'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Maintenance Tab */}
      {activeTab === 'maintenance' && (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'مفتوحة', value: openMaintenance.length, color: 'text-orange-600 bg-orange-50' },
              { label: 'عاجلة', value: openMaintenance.filter(m => m.priority === 'urgent').length, color: 'text-red-600 bg-red-50' },
              { label: 'مكتملة', value: myMaintenance.filter(m => m.status === 'completed').length, color: 'text-green-600 bg-green-50' },
            ].map((s, i) => (
              <div key={i} className={`card text-center p-4 ${s.color}`}>
                <p className="text-2xl font-black">{s.value}</p>
                <p className="text-xs mt-1">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            {myMaintenance.slice(0, 10).map(m => (
              <div key={m.id} className="card flex items-start gap-3 hover:shadow-sm transition-shadow">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  m.priority === 'urgent' ? 'bg-red-100 text-red-600' : m.priority === 'high' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
                }`}>
                  <Wrench className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-800">{m.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{m.description?.slice(0, 60)}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      m.status === 'completed' ? 'bg-green-100 text-green-700' :
                      m.status === 'in_progress' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {m.status === 'completed' ? 'مكتمل' : m.status === 'in_progress' ? 'جاري' : 'جديد'}
                    </span>
                    <span className="text-xs text-gray-400">{m.createdAt}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
