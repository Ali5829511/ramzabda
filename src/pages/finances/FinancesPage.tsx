import { useStore } from '../../data/store';
import { DollarSign, TrendingUp, TrendingDown, BarChart2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const MONTHLY_SEEDS = [0.93, 1.07, 0.85, 1.15, 0.90, 1.10];
const MONTHLY_LABELS = ['أكتوبر', 'نوفمبر', 'ديسمبر', 'يناير', 'فبراير', 'مارس'];

export default function FinancesPage() {
  const { payments, expenses, contracts, properties, currentUser } = useStore();

  const myProperties = currentUser?.role === 'owner'
    ? properties.filter(p => p.ownerId === currentUser.id)
    : properties;
  const myPropertyIds = myProperties.map(p => p.id);
  const myContracts = contracts.filter(c => myPropertyIds.includes(c.propertyId));
  const myPayments = payments.filter(p => myContracts.some(c => c.id === p.contractId));
  const myExpenses = expenses.filter(e => !e.propertyId || myPropertyIds.includes(e.propertyId));

  const totalRevenue = myPayments.filter(p => p.paymentStatus === 'paid').reduce((s, p) => s + p.paymentAmount, 0);
  const totalPending = myPayments.filter(p => p.paymentStatus === 'pending').reduce((s, p) => s + p.paymentAmount, 0);
  const totalOverdue = myPayments.filter(p => p.paymentStatus === 'overdue').reduce((s, p) => s + p.paymentAmount, 0);
  const totalExpenses = myExpenses.reduce((s, e) => s + e.amount, 0);
  const netProfit = totalRevenue - totalExpenses;

  const monthly = MONTHLY_LABELS.map((month, i) => ({
    month,
    إيرادات: (totalRevenue / 6) * MONTHLY_SEEDS[i] | 0,
    مصروفات: (totalExpenses / 6) * (MONTHLY_SEEDS[5 - i] * 0.9) | 0,
  }));

  const expenseByCategory = ['maintenance', 'utilities', 'management', 'marketing', 'other'].map(cat => ({
    name: { maintenance: 'صيانة', utilities: 'خدمات', management: 'إدارة', marketing: 'تسويق', other: 'أخرى' }[cat],
    value: myExpenses.filter(e => e.category === cat).reduce((s, e) => s + e.amount, 0)
  })).filter(c => c.value > 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="section-title">التقارير المالية</h1>
        <p className="section-subtitle">ملخص الأداء المالي</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'إجمالي الإيرادات', value: totalRevenue, color: 'bg-green-500', icon: <TrendingUp className="w-5 h-5" /> },
          { label: 'إجمالي المصروفات', value: totalExpenses, color: 'bg-red-500', icon: <TrendingDown className="w-5 h-5" /> },
          { label: 'صافي الربح', value: netProfit, color: netProfit >= 0 ? 'bg-emerald-500' : 'bg-red-500', icon: <DollarSign className="w-5 h-5" /> },
          { label: 'مستحقات معلقة', value: totalPending + totalOverdue, color: 'bg-yellow-500', icon: <BarChart2 className="w-5 h-5" /> },
        ].map((s, i) => (
          <div key={i} className="card p-4">
            <div className={`${s.color} w-10 h-10 rounded-xl flex items-center justify-center text-white mb-3`}>{s.icon}</div>
            <p className="text-xl font-bold text-gray-900">{s.value.toLocaleString()} ر</p>
            <p className="text-sm text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-bold text-gray-800 mb-4">الإيرادات والمصروفات الشهرية</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monthly}>
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: unknown) => `${Number(v).toLocaleString()} ر`} />
              <Bar dataKey="إيرادات" fill="#10B981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="مصروفات" fill="#EF4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="font-bold text-gray-800 mb-4">توزيع المصروفات</h3>
          {expenseByCategory.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">لا توجد بيانات مصروفات</p>
          ) : (
            <div className="space-y-3 mt-4">
              {expenseByCategory.map((c, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{c.name}</span>
                    <span className="font-semibold">{c.value.toLocaleString()} ر</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-yellow-500 rounded-full h-2" style={{ width: `${(c.value / totalExpenses) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <h3 className="font-bold text-gray-800 mb-4">تفاصيل المدفوعات</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="table-header">المبلغ</th>
                <th className="table-header">تاريخ الاستحقاق</th>
                <th className="table-header">تاريخ الدفع</th>
                <th className="table-header">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {myPayments.slice(0, 10).map(p => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="table-cell font-semibold text-yellow-600">{p.paymentAmount.toLocaleString()} ر</td>
                  <td className="table-cell">{p.paymentDate}</td>
                  <td className="table-cell">{p.paymentDate || '-'}</td>
                  <td className="table-cell">
                    <span className={`badge ${p.paymentStatus === 'paid' ? 'badge-green' : p.paymentStatus === 'overdue' ? 'badge-red' : 'badge-yellow'}`}>
                      {p.paymentStatus === 'paid' ? 'مدفوع' : p.paymentStatus === 'overdue' ? 'متأخر' : 'معلق'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
