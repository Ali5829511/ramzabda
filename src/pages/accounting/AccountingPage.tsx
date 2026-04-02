import { useState, useMemo } from 'react';
import { useStore } from '../../data/store';
import {
  DollarSign, TrendingUp, TrendingDown, CheckCircle, Clock, AlertCircle,
  FileText, CreditCard, BarChart2, Download, Filter, Search, ChevronDown, ChevronUp
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';

const COLORS = ['#F59E0B', '#10B981', '#3B82F6', '#EF4444', '#8B5CF6'];

type Tab = 'overview' | 'invoices' | 'payments' | 'report';

const invStatusLabel: Record<string, string> = { pending: 'معلقة', paid: 'مدفوعة', overdue: 'متأخرة', partial: 'جزئي', cancelled: 'ملغاة' };
const invStatusColor: Record<string, string> = { pending: 'badge-yellow', paid: 'badge-green', overdue: 'badge-red', partial: 'badge-blue', cancelled: 'badge-gray' };
const instStatusLabel: Record<string, string> = { pending: 'معلق', paid: 'مدفوع', overdue: 'متأخر', partial: 'جزئي' };
const payMethodLabel: Record<string, string> = { cash: 'نقداً', bank_transfer: 'تحويل بنكي', cheque: 'شيك', online: 'إلكتروني' };

function StatCard({ label, value, sub, color, icon }: { label: string; value: string; sub?: string; color: string; icon: React.ReactNode }) {
  return (
    <div className={`card p-4 border-r-4 ${color}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-500 mb-1">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>
        <div className="opacity-20 text-gray-600">{icon}</div>
      </div>
    </div>
  );
}

export default function AccountingPage() {
  const { invoices, installments, payments, contracts, properties, expenses, currentUser } = useStore();
  const [tab, setTab] = useState<Tab>('overview');
  const [invFilter, setInvFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  // Scope by role
  const visibleContracts = currentUser?.role === 'owner'
    ? contracts.filter(c => c.landlordId === currentUser.id)
    : currentUser?.role === 'tenant'
    ? contracts.filter(c => c.tenantId === currentUser.id)
    : contracts;
  const cids = new Set(visibleContracts.map(c => c.id));

  const visibleInvoices = invoices.filter(i => cids.has(i.contractId));
  const visibleInstallments = installments.filter(i => cids.has(i.contractId));
  const visiblePayments = payments.filter(p => cids.has(p.contractId));

  // KPIs
  const totalAmount = useMemo(() => visibleInvoices.reduce((s, i) => s + i.totalAmount, 0), [visibleInvoices]);
  const totalPaid = useMemo(() => visibleInvoices.reduce((s, i) => s + i.paidAmount, 0), [visibleInvoices]);
  const totalRemaining = useMemo(() => visibleInvoices.reduce((s, i) => s + i.remainingAmount, 0), [visibleInvoices]);
  const totalOverdue = useMemo(() => visibleInvoices.filter(i => i.invoiceStatus === 'overdue').reduce((s, i) => s + i.remainingAmount, 0), [visibleInvoices]);
  const totalExpenses = useMemo(() => expenses.reduce((s, e) => s + e.amount, 0), [expenses]);
  const netProfit = totalPaid - totalExpenses;
  const collectionRate = totalAmount > 0 ? Math.round((totalPaid / totalAmount) * 100) : 0;

  // Chart: monthly payments
  const monthlyPayments = useMemo(() => {
    const map: Record<string, number> = {};
    visiblePayments.forEach(p => {
      const m = p.paymentDate?.slice(0, 7) ?? '';
      if (m) map[m] = (map[m] ?? 0) + p.paymentAmount;
    });
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b)).slice(-6).map(([k, v]) => ({
      month: new Date(k + '-01').toLocaleDateString('ar', { month: 'short', year: '2-digit' }),
      مدفوعات: v,
    }));
  }, [visiblePayments]);

  // Chart: invoice status distribution
  const invStatusData = useMemo(() => {
    const map: Record<string, number> = {};
    visibleInvoices.forEach(i => { map[i.invoiceStatus] = (map[i.invoiceStatus] ?? 0) + 1; });
    return Object.entries(map).map(([k, v]) => ({ name: invStatusLabel[k] ?? k, value: v }));
  }, [visibleInvoices]);

  // Chart: installment status
  const instStatusData = useMemo(() => {
    const map: Record<string, { count: number; amount: number }> = {};
    visibleInstallments.forEach(i => {
      if (!map[i.installmentStatus]) map[i.installmentStatus] = { count: 0, amount: 0 };
      map[i.installmentStatus].count++;
      map[i.installmentStatus].amount += i.installmentValue;
    });
    return Object.entries(map).map(([k, v]) => ({
      name: instStatusLabel[k] ?? k,
      أقساط: v.count,
      قيمة: v.amount,
    }));
  }, [visibleInstallments]);

  // Filter invoices
  const filteredInvoices = useMemo(() => {
    let list = visibleInvoices;
    if (invFilter !== 'all') list = list.filter(i => i.invoiceStatus === invFilter);
    if (search) list = list.filter(i => i.invoiceNumber.includes(search) || i.contractNumber?.includes(search));
    list = [...list].sort((a, b) => {
      const da = a.invoiceDueDate ?? '', db = b.invoiceDueDate ?? '';
      return sortDir === 'asc' ? da.localeCompare(db) : db.localeCompare(da);
    });
    return list;
  }, [visibleInvoices, invFilter, search, sortDir]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="section-title">بوابة المحاسبة</h1>
          <p className="section-subtitle">الفواتير · الأقساط · المدفوعات · التقارير المالية</p>
        </div>
        <button onClick={() => window.print()} className="btn-secondary flex items-center gap-2 print:hidden">
          <Download className="w-4 h-4" /> تصدير التقرير
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="إجمالي الفواتير" value={`${totalAmount.toLocaleString()} ر`} sub={`${visibleInvoices.length} فاتورة`} color="border-yellow-500" icon={<FileText className="w-8 h-8" />} />
        <StatCard label="إجمالي المحصّل" value={`${totalPaid.toLocaleString()} ر`} sub={`نسبة التحصيل ${collectionRate}%`} color="border-green-500" icon={<CheckCircle className="w-8 h-8" />} />
        <StatCard label="المتبقي للتحصيل" value={`${totalRemaining.toLocaleString()} ر`} sub={`متأخر: ${totalOverdue.toLocaleString()} ر`} color="border-blue-500" icon={<Clock className="w-8 h-8" />} />
        <StatCard label="صافي الربح" value={`${netProfit.toLocaleString()} ر`} sub={`مصروفات: ${totalExpenses.toLocaleString()} ر`} color={netProfit >= 0 ? 'border-emerald-500' : 'border-red-500'} icon={<TrendingUp className="w-8 h-8" />} />
      </div>

      {/* Collection Rate Bar */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold text-gray-700">نسبة التحصيل الإجمالية</p>
          <p className="text-lg font-bold text-yellow-600">{collectionRate}%</p>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3">
          <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-3 rounded-full transition-all" style={{ width: `${collectionRate}%` }} />
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>محصّل: {totalPaid.toLocaleString()} ر</span>
          <span>متبقي: {totalRemaining.toLocaleString()} ر</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {([
          ['overview', 'نظرة عامة', <BarChart2 className="w-4 h-4" />],
          ['invoices', 'الفواتير', <FileText className="w-4 h-4" />],
          ['payments', 'المدفوعات', <CreditCard className="w-4 h-4" />],
          ['report', 'التقرير المالي', <DollarSign className="w-4 h-4" />],
        ] as [Tab, string, React.ReactNode][]).map(([id, label, icon]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === id ? 'bg-white shadow text-yellow-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {icon}{label}
          </button>
        ))}
      </div>

      {/* === OVERVIEW === */}
      {tab === 'overview' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Monthly Payments Chart */}
            <div className="lg:col-span-2 card p-4">
              <h3 className="font-bold text-gray-800 mb-4">المدفوعات الشهرية</h3>
              {monthlyPayments.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={monthlyPayments}>
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(v: unknown) => `${Number(v).toLocaleString()} ر`} />
                    <Bar dataKey="مدفوعات" fill="#F59E0B" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : <p className="text-center text-gray-400 py-12">لا توجد بيانات</p>}
            </div>

            {/* Invoice Status Pie */}
            <div className="card p-4">
              <h3 className="font-bold text-gray-800 mb-4">حالة الفواتير</h3>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={invStatusData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value">
                    {invStatusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-1">
                {invStatusData.map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-gray-600">{item.name}</span>
                    </div>
                    <span className="font-semibold">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Installments Status Chart */}
          <div className="card p-4">
            <h3 className="font-bold text-gray-800 mb-4">حالة الأقساط ({visibleInstallments.length} قسط)</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={instStatusData} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={70} />
                <Tooltip formatter={(v: unknown) => Number(v).toLocaleString()} />
                <Bar dataKey="أقساط" fill="#3B82F6" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Overdue Invoices Alert */}
          {visibleInvoices.filter(i => i.invoiceStatus === 'overdue').length > 0 && (
            <div className="card border-red-200 bg-red-50 p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <h3 className="font-bold text-red-700">فواتير متأخرة تحتاج متابعة</h3>
              </div>
              <div className="space-y-2">
                {visibleInvoices.filter(i => i.invoiceStatus === 'overdue').slice(0, 5).map(inv => {
                  const c = contracts.find(c => c.id === inv.contractId);
                  return (
                    <div key={inv.id} className="flex items-center justify-between bg-white rounded-lg p-3 text-sm">
                      <div>
                        <p className="font-mono font-medium text-gray-800">{inv.invoiceNumber}</p>
                        <p className="text-xs text-gray-500">{c?.tenantName} | عقد: {c?.contractNumber}</p>
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-red-600">{inv.remainingAmount.toLocaleString()} ر</p>
                        <p className="text-xs text-gray-400">آخر مهلة: {inv.invoiceGraceDate}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* === INVOICES === */}
      {tab === 'invoices' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input className="input-field pr-9" placeholder="بحث برقم الفاتورة أو العقد..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {['all', 'pending', 'paid', 'overdue', 'partial', 'cancelled'].map(s => (
                <button key={s} onClick={() => setInvFilter(s)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${invFilter === s ? 'bg-yellow-500 text-white' : 'bg-white border text-gray-600 hover:bg-gray-50'}`}>
                  {s === 'all' ? 'الكل' : invStatusLabel[s]}
                </button>
              ))}
            </div>
            <button onClick={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')} className="btn-secondary flex items-center gap-1 text-xs">
              {sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />} الاستحقاق
            </button>
          </div>

          <p className="text-xs text-gray-400">{filteredInvoices.length} فاتورة</p>

          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="table-header">رقم الفاتورة</th>
                  <th className="table-header">العقد</th>
                  <th className="table-header">المستأجر</th>
                  <th className="table-header">الإجمالي</th>
                  <th className="table-header">المدفوع</th>
                  <th className="table-header">المتبقي</th>
                  <th className="table-header">الاستحقاق</th>
                  <th className="table-header">آخر مهلة</th>
                  <th className="table-header">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredInvoices.map(inv => {
                  const c = contracts.find(x => x.id === inv.contractId);
                  const invInstallments = installments.filter(i => i.invoiceId === inv.id);
                  const paidInst = invInstallments.filter(i => i.installmentStatus === 'paid').length;
                  return (
                    <tr key={inv.id} className="hover:bg-gray-50">
                      <td className="table-cell font-mono font-medium text-yellow-700">{inv.invoiceNumber}</td>
                      <td className="table-cell font-mono text-xs text-gray-500">{inv.contractNumber}</td>
                      <td className="table-cell text-gray-700">{c?.tenantName ?? '—'}</td>
                      <td className="table-cell font-semibold">{inv.totalAmount.toLocaleString()}</td>
                      <td className="table-cell text-green-600 font-semibold">{inv.paidAmount.toLocaleString()}</td>
                      <td className="table-cell text-red-500 font-semibold">{inv.remainingAmount.toLocaleString()}</td>
                      <td className="table-cell text-gray-500">{inv.invoiceDueDate}</td>
                      <td className="table-cell text-red-400 font-medium">{inv.invoiceGraceDate}</td>
                      <td className="table-cell">
                        <div className="flex flex-col gap-1">
                          <span className={`badge ${invStatusColor[inv.invoiceStatus] ?? 'badge-gray'}`}>{invStatusLabel[inv.invoiceStatus] ?? inv.invoiceStatus}</span>
                          {invInstallments.length > 0 && <span className="text-xs text-gray-400">{paidInst}/{invInstallments.length} قسط</span>}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* === PAYMENTS === */}
      {tab === 'payments' && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="card p-4 bg-green-50 border-green-100">
              <p className="text-xs text-green-600">إجمالي الدفعات</p>
              <p className="text-xl font-bold text-green-700">{visiblePayments.reduce((s, p) => s + p.paymentAmount, 0).toLocaleString()} ر</p>
              <p className="text-xs text-gray-400 mt-1">{visiblePayments.length} دفعة</p>
            </div>
            <div className="card p-4 bg-blue-50 border-blue-100">
              <p className="text-xs text-blue-600">تحويل بنكي</p>
              <p className="text-xl font-bold text-blue-700">{visiblePayments.filter(p => p.paymentMethod === 'bank_transfer').length} دفعة</p>
            </div>
            <div className="card p-4 bg-yellow-50 border-yellow-100">
              <p className="text-xs text-yellow-600">نقداً / شيكات</p>
              <p className="text-xl font-bold text-yellow-700">{visiblePayments.filter(p => p.paymentMethod !== 'bank_transfer').length} دفعة</p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="table-header">رقم الدفعة</th>
                  <th className="table-header">الفاتورة</th>
                  <th className="table-header">العقد</th>
                  <th className="table-header">المبلغ</th>
                  <th className="table-header">التاريخ</th>
                  <th className="table-header">طريقة الدفع</th>
                  <th className="table-header">الآيبان</th>
                  <th className="table-header">اسم الحساب</th>
                  <th className="table-header">الرقم المرجعي</th>
                  <th className="table-header">UTI</th>
                  <th className="table-header">حالة التحويل</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {visiblePayments.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="table-cell font-mono text-yellow-700 font-medium">{p.paymentNumber}</td>
                    <td className="table-cell font-mono text-xs text-gray-500">{p.invoiceId?.replace('inv-', '')}</td>
                    <td className="table-cell font-mono text-xs text-gray-500">{p.contractId?.replace('cr-', '')}</td>
                    <td className="table-cell font-bold text-green-600">{p.paymentAmount.toLocaleString()} ر</td>
                    <td className="table-cell text-gray-600">{p.paymentDate}</td>
                    <td className="table-cell">{payMethodLabel[p.paymentMethod] ?? p.paymentMethod}</td>
                    <td className="table-cell font-mono text-xs text-gray-500 max-w-[120px] truncate">{p.iban ?? '—'}</td>
                    <td className="table-cell text-gray-600">{p.accountName ?? '—'}</td>
                    <td className="table-cell font-mono text-xs text-gray-500">{p.referenceNumber ?? '—'}</td>
                    <td className="table-cell font-mono text-xs text-gray-400">{p.uti ?? '—'}</td>
                    <td className="table-cell">
                      <span className={`badge ${p.transferStatus === 'تم التحويل' ? 'badge-green' : p.paymentStatus === 'completed' ? 'badge-green' : 'badge-yellow'}`}>
                        {p.transferStatus || (p.paymentStatus === 'completed' ? 'مكتمل' : 'معلق')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* === FINANCIAL REPORT === */}
      {tab === 'report' && (
        <div className="space-y-6">
          {/* Summary */}
          <div className="card p-6 bg-gradient-to-br from-yellow-50 to-white border-yellow-200">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-yellow-500 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">التقرير المالي الإجمالي</h3>
                <p className="text-xs text-gray-500">شركة رمز الإبداع لإدارة الأملاك</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'إجمالي الفواتير', value: totalAmount, color: 'text-gray-800' },
                { label: 'إجمالي المحصّل', value: totalPaid, color: 'text-green-600' },
                { label: 'إجمالي المتبقي', value: totalRemaining, color: 'text-blue-600' },
                { label: 'إجمالي المتأخر', value: totalOverdue, color: 'text-red-500' },
                { label: 'إجمالي المصروفات', value: totalExpenses, color: 'text-orange-600' },
                { label: 'صافي الربح', value: netProfit, color: netProfit >= 0 ? 'text-emerald-600' : 'text-red-600' },
                { label: 'عدد العقود', value: visibleContracts.length, color: 'text-gray-700' },
                { label: 'نسبة التحصيل', value: `${collectionRate}%`, color: 'text-yellow-600' },
              ].map((item, i) => (
                <div key={i} className="bg-white rounded-xl p-3 border border-gray-100">
                  <p className="text-xs text-gray-400 mb-1">{item.label}</p>
                  <p className={`text-lg font-bold ${item.color}`}>
                    {typeof item.value === 'number' && item.value > 999 ? item.value.toLocaleString() + ' ر' : item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Contracts Table */}
          <div className="card p-4">
            <h3 className="font-bold text-gray-800 mb-4">ملخص مالي لكل عقد</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="table-header">رقم العقد</th>
                    <th className="table-header">اسم العقار</th>
                    <th className="table-header">المستأجر</th>
                    <th className="table-header">البداية</th>
                    <th className="table-header">النهاية</th>
                    <th className="table-header">إجمالي الفواتير</th>
                    <th className="table-header">المحصّل</th>
                    <th className="table-header">المتبقي</th>
                    <th className="table-header">نسبة الإنجاز</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {visibleContracts.map(c => {
                    const cInvoices = visibleInvoices.filter(i => i.contractId === c.id);
                    const cTotal = cInvoices.reduce((s, i) => s + i.totalAmount, 0);
                    const cPaid = cInvoices.reduce((s, i) => s + i.paidAmount, 0);
                    const cRemaining = cInvoices.reduce((s, i) => s + i.remainingAmount, 0);
                    const pct = cTotal > 0 ? Math.round((cPaid / cTotal) * 100) : 0;
                    return (
                      <tr key={c.id} className="hover:bg-gray-50">
                        <td className="table-cell font-mono text-yellow-700 font-medium">{c.contractNumber}</td>
                        <td className="table-cell text-gray-700 max-w-[150px] truncate">{c.propertyName}</td>
                        <td className="table-cell text-gray-600">{c.tenantName}</td>
                        <td className="table-cell text-gray-500">{c.contractStartDate}</td>
                        <td className="table-cell text-gray-500">{c.contractEndDate}</td>
                        <td className="table-cell font-semibold">{cTotal.toLocaleString()} ر</td>
                        <td className="table-cell text-green-600 font-semibold">{cPaid.toLocaleString()} ر</td>
                        <td className="table-cell text-red-500">{cRemaining.toLocaleString()} ر</td>
                        <td className="table-cell">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-100 rounded-full h-2 min-w-[60px]">
                              <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-xs font-bold text-yellow-700">{pct}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-yellow-50 border-t-2 border-yellow-200">
                  <tr>
                    <td className="table-cell font-bold text-gray-800" colSpan={5}>الإجمالي</td>
                    <td className="table-cell font-bold text-gray-800">{totalAmount.toLocaleString()} ر</td>
                    <td className="table-cell font-bold text-green-700">{totalPaid.toLocaleString()} ر</td>
                    <td className="table-cell font-bold text-red-600">{totalRemaining.toLocaleString()} ر</td>
                    <td className="table-cell font-bold text-yellow-700">{collectionRate}%</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
