import { useMemo, useState } from 'react';
import { useStore } from '../../data/store';
import { useSmartAlerts } from '../../hooks/useLinkedData';
import { AlertCircle, AlertTriangle, CheckCircle, Clock, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

type Range = 'all' | 'expired' | '30' | '60' | '90' | 'active';

export default function ContractAlertsPage() {
  const { contracts, invoices } = useStore();
  const alerts = useSmartAlerts();
  const [range, setRange] = useState<Range>('all');

  const contractsWithDays = useMemo(() => {
    const today = new Date();
    return contracts.map(c => {
      const days = c.contractEndDate
        ? Math.ceil((new Date(c.contractEndDate).getTime() - today.getTime()) / 86400000)
        : null;
      const cInvoices = invoices.filter(i => i.contractId === c.id);
      const totalPaid = cInvoices.reduce((s, i) => s + i.paidAmount, 0);
      const totalAmount = cInvoices.reduce((s, i) => s + i.totalAmount, 0);
      const pct = totalAmount > 0 ? Math.round((totalPaid / totalAmount) * 100) : 0;
      return { ...c, daysLeft: days, paidPct: pct, totalAmount, totalPaid };
    });
  }, [contracts, invoices]);

  const filtered = useMemo(() => {
    const list = contractsWithDays.filter(c => c.status === 'active' || range === 'all' || range === 'expired');
    switch (range) {
      case 'expired': return list.filter(c => c.daysLeft !== null && c.daysLeft <= 0);
      case '30': return list.filter(c => c.daysLeft !== null && c.daysLeft > 0 && c.daysLeft <= 30);
      case '60': return list.filter(c => c.daysLeft !== null && c.daysLeft > 0 && c.daysLeft <= 60);
      case '90': return list.filter(c => c.daysLeft !== null && c.daysLeft > 0 && c.daysLeft <= 90);
      case 'active': return list.filter(c => c.daysLeft !== null && c.daysLeft > 90);
      default: return list;
    }
  }, [contractsWithDays, range]);

  // Stats
  const expired = contractsWithDays.filter(c => c.daysLeft !== null && c.daysLeft <= 0).length;
  const exp30 = contractsWithDays.filter(c => c.daysLeft !== null && c.daysLeft > 0 && c.daysLeft <= 30).length;
  const exp60 = contractsWithDays.filter(c => c.daysLeft !== null && c.daysLeft > 30 && c.daysLeft <= 60).length;
  const exp90 = contractsWithDays.filter(c => c.daysLeft !== null && c.daysLeft > 60 && c.daysLeft <= 90).length;
  const healthy = contractsWithDays.filter(c => c.daysLeft !== null && c.daysLeft > 90).length;

  const chartData = [
    { name: 'منتهية', value: expired, color: '#EF4444' },
    { name: 'أقل من 30 يوم', value: exp30, color: '#F97316' },
    { name: '30-60 يوم', value: exp60, color: '#F59E0B' },
    { name: '60-90 يوم', value: exp90, color: '#3B82F6' },
    { name: 'أكثر من 90 يوم', value: healthy, color: '#10B981' },
  ];

  const contractAlerts = alerts.filter(a => a.category === 'contract');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="section-title">متابعة انتهاء العقود والتنبيهات</h1>
        <p className="section-subtitle">{contracts.length} عقد | {contractAlerts.length} تنبيه نشط</p>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'منتهية', count: expired, color: 'bg-red-100 text-red-700 border-red-200', icon: <AlertCircle className="w-4 h-4" /> },
          { label: 'خلال 30 يوم', count: exp30, color: 'bg-orange-100 text-orange-700 border-orange-200', icon: <AlertTriangle className="w-4 h-4" /> },
          { label: 'خلال 60 يوم', count: exp60, color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: <Clock className="w-4 h-4" /> },
          { label: 'خلال 90 يوم', count: exp90, color: 'bg-blue-100 text-blue-700 border-blue-200', icon: <Calendar className="w-4 h-4" /> },
          { label: 'بصحة جيدة', count: healthy, color: 'bg-green-100 text-green-700 border-green-200', icon: <CheckCircle className="w-4 h-4" /> },
        ].map((item, i) => (
          <div key={i} className={`card border p-4 ${item.color}`}>
            <div className="flex items-center gap-2 mb-1">{item.icon}<p className="text-xs font-medium">{item.label}</p></div>
            <p className="text-3xl font-bold">{item.count}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Chart */}
        <div className="card p-4">
          <h3 className="font-bold text-gray-800 mb-4">توزيع العقود حسب الانتهاء</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={90} />
              <Tooltip />
              <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                {chartData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Active Alerts */}
        <div className="lg:col-span-2 card p-4">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500" /> التنبيهات الحرجة
          </h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {contractAlerts.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">لا توجد تنبيهات</p>
            ) : contractAlerts.map(alert => (
              <div key={alert.id} className={`flex items-start gap-3 p-3 rounded-xl text-sm ${alert.type === 'danger' ? 'bg-red-50 border border-red-100' : 'bg-yellow-50 border border-yellow-100'}`}>
                {alert.type === 'danger'
                  ? <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  : <AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />}
                <div>
                  <p className={`font-medium ${alert.type === 'danger' ? 'text-red-800' : 'text-yellow-800'}`}>{alert.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{alert.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {([
          ['all', 'كل العقود'], ['expired', 'منتهية'], ['30', 'خلال 30 يوم'],
          ['60', 'خلال 60 يوم'], ['90', 'خلال 90 يوم'], ['active', 'صالحة +90'],
        ] as [Range, string][]).map(([id, label]) => (
          <button key={id} onClick={() => setRange(id)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${range === id ? 'bg-yellow-500 text-white' : 'bg-white border text-gray-600 hover:bg-gray-50'}`}>
            {label}
          </button>
        ))}
        <span className="px-3 py-1.5 text-xs text-gray-400 self-center">{filtered.length} عقد</span>
      </div>

      {/* Contracts Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-100">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="table-header">رقم العقد</th>
              <th className="table-header">اسم العقار</th>
              <th className="table-header">المستأجر</th>
              <th className="table-header">تاريخ البداية</th>
              <th className="table-header">تاريخ الانتهاء</th>
              <th className="table-header">الأيام المتبقية</th>
              <th className="table-header">إجمالي العقد</th>
              <th className="table-header">نسبة التحصيل</th>
              <th className="table-header">الحالة</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.sort((a, b) => (a.daysLeft ?? 999) - (b.daysLeft ?? 999)).map(c => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="table-cell font-mono font-medium text-yellow-700">{c.contractNumber}</td>
                <td className="table-cell text-gray-700 max-w-[150px] truncate">{c.propertyName || '—'}</td>
                <td className="table-cell text-gray-600">{c.tenantName}</td>
                <td className="table-cell text-gray-500">{c.contractStartDate}</td>
                <td className="table-cell text-gray-500">{c.contractEndDate}</td>
                <td className="table-cell">
                  {c.daysLeft === null ? '—' : c.daysLeft <= 0 ? (
                    <span className="badge badge-red">منتهي منذ {Math.abs(c.daysLeft)} يوم</span>
                  ) : c.daysLeft <= 30 ? (
                    <span className="font-bold text-red-600">{c.daysLeft} يوم</span>
                  ) : c.daysLeft <= 90 ? (
                    <span className="font-bold text-yellow-600">{c.daysLeft} يوم</span>
                  ) : (
                    <span className="text-green-600">{c.daysLeft} يوم</span>
                  )}
                </td>
                <td className="table-cell font-semibold">{c.totalAmount ? c.totalAmount.toLocaleString() + ' ر' : '—'}</td>
                <td className="table-cell">
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-gray-100 rounded-full h-1.5">
                      <div className={`h-1.5 rounded-full ${c.paidPct >= 80 ? 'bg-green-500' : c.paidPct >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                        style={{ width: `${c.paidPct}%` }} />
                    </div>
                    <span className="text-xs font-semibold text-gray-600">{c.paidPct}%</span>
                  </div>
                </td>
                <td className="table-cell">
                  <span className={`badge ${c.status === 'active' ? 'badge-green' : c.status === 'expired' ? 'badge-red' : 'badge-gray'}`}>
                    {c.status === 'active' ? 'فعال' : c.status === 'expired' ? 'منتهي' : c.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
