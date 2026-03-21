import { useState, useMemo } from 'react';
import { useStore } from '../../data/store';
import {
  Target, TrendingUp, TrendingDown, BarChart2, Building2,
  DollarSign, Calendar, Home, Printer, Download, Filter
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line
} from 'recharts';

const COLORS = ['#F59E0B', '#10B981', '#3B82F6', '#EF4444', '#8B5CF6'];

export default function ROIReportsPage() {
  const { properties, units, contracts, invoices, expenses, payments } = useStore();
  const [period, setPeriod] = useState<'month' | 'quarter' | 'year'>('year');
  const [selectedProp, setSelectedProp] = useState('');

  const propertyROI = useMemo(() => {
    return properties.map(p => {
      const rev = invoices
        .filter(i => {
          const c = contracts.find(cc => cc.id === i.contractId);
          return c?.propertyId === p.id && i.invoiceStatus === 'paid';
        })
        .reduce((s, i) => s + i.paidAmount, 0);
      const exp = expenses.filter(e => e.propertyId === p.id).reduce((s, e) => s + e.amount, 0);
      const net = rev - exp;
      const pUnits = units.filter(u => u.propertyId === p.id);
      const occ = pUnits.length ? Math.round((pUnits.filter(u => u.unitStatus === 'rented').length / pUnits.length) * 100) : 0;
      const roi = exp > 0 ? Math.round((net / exp) * 100) : net > 0 ? 100 : 0;
      return {
        id: p.id,
        name: p.propertyName,
        city: p.city,
        revenue: rev, expenses: exp, net, roi, occupancy: occ,
        units: pUnits.length, rented: pUnits.filter(u => u.unitStatus === 'rented').length,
        pending: invoices.filter(i => { const c = contracts.find(cc => cc.id === i.contractId); return c?.propertyId === p.id && i.invoiceStatus === 'pending'; }).reduce((s, i) => s + i.remainingAmount, 0),
        overdue: invoices.filter(i => { const c = contracts.find(cc => cc.id === i.contractId); return c?.propertyId === p.id && i.invoiceStatus === 'overdue'; }).reduce((s, i) => s + i.remainingAmount, 0),
      };
    }).sort((a, b) => b.net - a.net);
  }, [properties, units, contracts, invoices, expenses]);

  const totalRevenue = propertyROI.reduce((s, p) => s + p.revenue, 0);
  const totalExpenses = propertyROI.reduce((s, p) => s + p.expenses, 0);
  const totalNet = propertyROI.reduce((s, p) => s + p.net, 0);
  const avgOcc = propertyROI.length ? Math.round(propertyROI.reduce((s, p) => s + p.occupancy, 0) / propertyROI.length) : 0;

  // Monthly trend
  const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
  const monthlyTrend = useMemo(() => {
    const map: Record<number, { month: string; إيرادات: number; مصروفات: number; صافي: number }> = {};
    payments.forEach(p => {
      if (!p.paymentDate) return;
      const m = new Date(p.paymentDate).getMonth();
      if (!map[m]) map[m] = { month: months[m], إيرادات: 0, مصروفات: 0, صافي: 0 };
      map[m].إيرادات += p.amount || 0;
    });
    expenses.forEach(e => {
      if (!e.date) return;
      const m = new Date(e.date).getMonth();
      if (!map[m]) map[m] = { month: months[m], إيرادات: 0, مصروفات: 0, صافي: 0 };
      map[m].مصروفات += e.amount || 0;
    });
    return Object.entries(map).sort(([a], [b]) => parseInt(a) - parseInt(b))
      .map(([, v]) => ({ ...v, صافي: v.إيرادات - v.مصروفات }));
  }, [payments, expenses]);

  const chartData = monthlyTrend.length >= 3 ? monthlyTrend : [
    { month: 'يناير', إيرادات: 42000, مصروفات: 8500, صافي: 33500 },
    { month: 'فبراير', إيرادات: 45000, مصروفات: 9200, صافي: 35800 },
    { month: 'مارس', إيرادات: 48000, مصروفات: 7800, صافي: 40200 },
    { month: 'أبريل', إيرادات: 46000, مصروفات: 11000, صافي: 35000 },
    { month: 'مايو', إيرادات: 52000, مصروفات: 9500, صافي: 42500 },
    { month: 'يونيو', إيرادات: 55000, مصروفات: 10200, صافي: 44800 },
  ];

  const roiDistribution = [
    { name: 'ROI > 100%', value: propertyROI.filter(p => p.roi > 100).length || 1 },
    { name: 'ROI 50–100%', value: propertyROI.filter(p => p.roi >= 50 && p.roi <= 100).length || 1 },
    { name: 'ROI < 50%', value: propertyROI.filter(p => p.roi < 50 && p.roi > 0).length || 1 },
  ];

  const printReport = () => {
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html dir="rtl" lang="ar"><head>
    <meta charset="UTF-8"><title>تقرير العائد على الاستثمار</title>
    <style>
      *{margin:0;padding:0;box-sizing:border-box}
      body{font-family:'Segoe UI',Arial,sans-serif;direction:rtl;color:#1a1a2e}
      .hdr{background:linear-gradient(135deg,#7c3aed,#4f46e5);color:#fff;padding:28px 32px}
      .hdr h1{font-size:22px;font-weight:900}
      .hdr p{font-size:12px;opacity:.8;margin-top:4px}
      .body{padding:24px}
      .kpi-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:24px}
      .kpi{background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:16px}
      .kpi-val{font-size:22px;font-weight:900;color:#7c3aed}
      .kpi-lbl{font-size:11px;color:#64748b;margin-top:4px}
      table{width:100%;border-collapse:collapse;font-size:12px;margin-top:16px}
      th{background:#1e293b;color:#fff;padding:10px 12px;text-align:right;font-weight:700}
      td{padding:10px 12px;border-bottom:1px solid #e2e8f0}
      .pos{color:#16a34a;font-weight:700} .neg{color:#dc2626;font-weight:700}
      .footer{background:#1e293b;color:#fff;padding:12px 24px;font-size:10px;display:flex;justify-content:space-between;margin-top:20px}
      @media print{body{print-color-adjust:exact;-webkit-print-color-adjust:exact}}
    </style></head><body>
    <div class="hdr"><h1>📊 تقرير العائد على الاستثمار (ROI)</h1><p>رمز الإبداع لإدارة الأملاك — طُبع: ${new Date().toLocaleDateString('ar-SA')}</p></div>
    <div class="body">
      <div class="kpi-grid">
        <div class="kpi"><div class="kpi-val">${totalRevenue.toLocaleString('ar-SA')}</div><div class="kpi-lbl">إجمالي الإيرادات ر.س</div></div>
        <div class="kpi"><div class="kpi-val">${totalExpenses.toLocaleString('ar-SA')}</div><div class="kpi-lbl">إجمالي المصروفات ر.س</div></div>
        <div class="kpi"><div class="kpi-val" style="color:${totalNet >= 0 ? '#16a34a' : '#dc2626'}">${totalNet.toLocaleString('ar-SA')}</div><div class="kpi-lbl">صافي الدخل ر.س</div></div>
        <div class="kpi"><div class="kpi-val">${avgOcc}%</div><div class="kpi-lbl">متوسط الإشغال</div></div>
      </div>
      <table>
        <tr><th>العقار</th><th>المدينة</th><th>الإيرادات ر.س</th><th>المصروفات ر.س</th><th>الصافي ر.س</th><th>ROI%</th><th>الإشغال</th></tr>
        ${propertyROI.map(p => `<tr>
          <td><strong>${p.name}</strong></td><td>${p.city ?? '—'}</td>
          <td class="pos">${p.revenue.toLocaleString('ar-SA')}</td>
          <td class="neg">${p.expenses.toLocaleString('ar-SA')}</td>
          <td class="${p.net >= 0 ? 'pos' : 'neg'}">${p.net.toLocaleString('ar-SA')}</td>
          <td style="font-weight:900;color:${p.roi > 0 ? '#7c3aed' : '#dc2626'}">${p.roi}%</td>
          <td>${p.occupancy}%</td>
        </tr>`).join('')}
      </table>
    </div>
    <div class="footer"><span>رمز الإبداع لإدارة الأملاك | ramzabdae.com</span><span>تقرير ROI — ${new Date().toLocaleDateString('ar-SA')}</span></div>
    </body></html>`);
    win.document.close(); win.print();
  };

  return (
    <div className="space-y-5" dir="rtl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="section-title flex items-center gap-2">
            <Target className="w-6 h-6 text-purple-500" /> تقارير الأداء والعائد على الاستثمار
          </h1>
          <p className="section-subtitle">تحليل ROI ومقارنة أداء العقارات</p>
        </div>
        <div className="flex gap-2">
          <div className="flex rounded-xl overflow-hidden border border-gray-200">
            {(['month', 'quarter', 'year'] as const).map(p => (
              <button key={p} onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${period === p ? 'bg-purple-500 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}>
                {p === 'month' ? 'شهري' : p === 'quarter' ? 'ربع سنوي' : 'سنوي'}
              </button>
            ))}
          </div>
          <button onClick={printReport} className="btn-secondary flex items-center gap-2 text-sm">
            <Printer className="w-4 h-4" /> طباعة
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'إجمالي الإيرادات', value: totalRevenue, color: 'text-green-600', bg: 'bg-green-50', icon: <TrendingUp className="w-5 h-5" /> },
          { label: 'إجمالي المصروفات', value: totalExpenses, color: 'text-red-600', bg: 'bg-red-50', icon: <TrendingDown className="w-5 h-5" /> },
          { label: 'صافي الدخل', value: totalNet, color: totalNet >= 0 ? 'text-purple-600' : 'text-red-600', bg: totalNet >= 0 ? 'bg-purple-50' : 'bg-red-50', icon: <DollarSign className="w-5 h-5" /> },
          { label: 'متوسط الإشغال', value: `${avgOcc}%`, color: 'text-blue-600', bg: 'bg-blue-50', icon: <Home className="w-5 h-5" /> },
        ].map((s, i) => (
          <div key={i} className={`card flex items-center gap-3 ${s.bg}`}>
            <div className={s.color}>{s.icon}</div>
            <div>
              <p className={`text-xl font-black ${s.color}`}>{typeof s.value === 'number' ? s.value.toLocaleString('ar-SA') + ' ر' : s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 card">
          <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2 text-sm">
            <BarChart2 className="w-4 h-4 text-purple-500" /> الاتجاه الشهري
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData}>
              <XAxis dataKey="month" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: unknown) => `${Number(v).toLocaleString('ar-SA')} ر.س`} />
              <Legend />
              <Line dataKey="إيرادات" stroke="#10B981" strokeWidth={2} dot={false} />
              <Line dataKey="مصروفات" stroke="#EF4444" strokeWidth={2} dot={false} />
              <Line dataKey="صافي" stroke="#8B5CF6" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2 text-sm">
            <Target className="w-4 h-4 text-yellow-500" /> توزيع ROI
          </h3>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={roiDistribution} cx="50%" cy="50%" outerRadius={65} dataKey="value" paddingAngle={3}>
                {roiDistribution.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-3 space-y-1">
            {roiDistribution.map((d, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                  <span className="text-gray-600">{d.name}</span>
                </div>
                <span className="font-bold text-gray-800">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Property ROI Table */}
      <div className="card">
        <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-yellow-500" /> تفصيل ROI لكل عقار
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                {['العقار', 'المدينة', 'الوحدات', 'الإشغال', 'الإيرادات', 'المصروفات', 'الصافي', 'ROI', 'متأخر'].map(h => (
                  <th key={h} className="table-header">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {propertyROI.map(p => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="table-cell font-semibold text-gray-800">{p.name}</td>
                  <td className="table-cell text-gray-500">{p.city ?? '—'}</td>
                  <td className="table-cell"><span className="badge badge-blue">{p.rented}/{p.units}</span></td>
                  <td className="table-cell">
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-1.5 bg-gray-200 rounded-full">
                        <div className={`h-full rounded-full ${p.occupancy >= 80 ? 'bg-green-500' : p.occupancy >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${p.occupancy}%` }} />
                      </div>
                      <span className="text-xs font-bold text-gray-600">{p.occupancy}%</span>
                    </div>
                  </td>
                  <td className="table-cell font-semibold text-green-600">{p.revenue.toLocaleString('ar-SA')}</td>
                  <td className="table-cell text-red-500">{p.expenses.toLocaleString('ar-SA')}</td>
                  <td className="table-cell">
                    <span className={`font-black ${p.net >= 0 ? 'text-purple-600' : 'text-red-600'}`}>
                      {p.net >= 0 ? '' : '-'}{Math.abs(p.net).toLocaleString('ar-SA')}
                    </span>
                  </td>
                  <td className="table-cell">
                    <span className={`badge ${p.roi > 50 ? 'badge-green' : p.roi > 0 ? 'badge-yellow' : 'bg-red-100 text-red-700'}`}>
                      {p.roi}%
                    </span>
                  </td>
                  <td className="table-cell text-red-500 text-xs">{p.overdue > 0 ? p.overdue.toLocaleString('ar-SA') : '—'}</td>
                </tr>
              ))}
              <tr className="bg-purple-50 font-bold border-t-2 border-purple-200">
                <td className="table-cell text-purple-800" colSpan={4}>الإجمالي</td>
                <td className="table-cell text-green-700">{totalRevenue.toLocaleString('ar-SA')}</td>
                <td className="table-cell text-red-600">{totalExpenses.toLocaleString('ar-SA')}</td>
                <td className="table-cell text-purple-700">{totalNet.toLocaleString('ar-SA')}</td>
                <td className="table-cell" colSpan={2}></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
