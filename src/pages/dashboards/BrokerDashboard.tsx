import { useMemo } from 'react';
import { useStore } from '../../data/store';
import { Users, Calendar, Megaphone, Eye, TrendingUp, DollarSign, FileText, Star } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#F59E0B', '#10B981', '#3B82F6', '#EF4444', '#8B5CF6'];

const customerStatusLabel: Record<string, string> = {
  new: 'جديد', contacted: 'تم التواصل', interested: 'مهتم', negotiating: 'تفاوض', closed: 'مكتمل'
};
const customerStatusColor: Record<string, string> = {
  new: 'badge-gray', contacted: 'badge-blue', interested: 'badge-yellow', negotiating: 'badge-blue', closed: 'badge-green'
};

export default function BrokerDashboard() {
  const { currentUser, customers, appointments, marketingListings, brokerageContracts } = useStore();

  const myListings = marketingListings.filter(l => l.brokerId === currentUser?.id || !l.brokerId);
  const myCustomers = customers.filter(c => c.assignedTo === currentUser?.id);
  const myAppointments = appointments.filter(a => a.employeeId === currentUser?.id);
  const myBrokerageContracts = brokerageContracts.filter(c =>
    c.brokerUserId === currentUser?.id || !c.brokerUserId
  );

  // Commission from brokerage contracts
  const totalCommission = useMemo(() =>
    myBrokerageContracts.reduce((s, c) => s + (c.commissionAmount ?? 0), 0),
    [myBrokerageContracts]
  );
  const pendingCommission = useMemo(() =>
    myBrokerageContracts.filter(c => c.status === 'active').reduce((s, c) => s + (c.commissionAmount ?? 0), 0),
    [myBrokerageContracts]
  );

  // Customer status breakdown for chart
  const customerStatusData = useMemo(() => {
    const map: Record<string, number> = {};
    myCustomers.forEach(c => { map[c.status] = (map[c.status] ?? 0) + 1; });
    return Object.entries(map).map(([status, value]) => ({ name: customerStatusLabel[status] ?? status, value }));
  }, [myCustomers]);

  // Listings performance
  const topListings = [...myListings].sort((a, b) => b.views - a.views).slice(0, 4);

  // Conversion rate
  const closedCustomers = myCustomers.filter(c => c.status === 'closed').length;
  const conversionRate = myCustomers.length ? Math.round((closedCustomers / myCustomers.length) * 100) : 0;

  const kpis = [
    { label: 'عملائي', value: myCustomers.length, icon: <Users className="w-5 h-5" />, color: 'bg-blue-500' },
    { label: 'مواعيد نشطة', value: myAppointments.filter(a => a.status !== 'cancelled').length, icon: <Calendar className="w-5 h-5" />, color: 'bg-yellow-500' },
    { label: 'إعلاناتي', value: myListings.length, icon: <Megaphone className="w-5 h-5" />, color: 'bg-green-500' },
    { label: 'إجمالي المشاهدات', value: myListings.reduce((s, l) => s + l.views, 0).toLocaleString(), icon: <Eye className="w-5 h-5" />, color: 'bg-purple-500' },
    { label: 'العمولة المحصّلة', value: `${totalCommission.toLocaleString()} ر`, icon: <DollarSign className="w-5 h-5" />, color: 'bg-emerald-500' },
    { label: 'معدل التحويل', value: `${conversionRate}%`, icon: <TrendingUp className="w-5 h-5" />, color: 'bg-orange-500' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="section-title">مرحباً، {currentUser?.name}</h1>
        <p className="section-subtitle">بوابة الوسيط العقاري</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpis.map((s, i) => (
          <div key={i} className="card p-4 flex items-center gap-3">
            <div className={`${s.color} p-2.5 rounded-xl text-white shrink-0`}>{s.icon}</div>
            <div>
              <p className="text-xl font-bold">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer Status Pie */}
        <div className="card">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-yellow-500" /> توزيع حالات العملاء
          </h3>
          {customerStatusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={customerStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} label={({ name, value }) => `${name}: ${value}`}>
                  {customerStatusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">لا يوجد عملاء بعد</div>
          )}
        </div>

        {/* Top Listings Performance */}
        <div className="card">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-yellow-500" /> أداء الإعلانات
          </h3>
          {topListings.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={topListings.map(l => ({ name: l.title.slice(0, 12), مشاهدات: l.views, استفسارات: l.inquiries }))}>
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="مشاهدات" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                <Bar dataKey="استفسارات" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">لا توجد إعلانات</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Customers */}
        <div className="card">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-500" /> أحدث العملاء
          </h3>
          <div className="space-y-3">
            {myCustomers.slice(0, 5).map(c => (
              <div key={c.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-800">{c.name}</p>
                  <p className="text-xs text-gray-500">{c.phone}</p>
                </div>
                <span className={`badge ${customerStatusColor[c.status] ?? 'badge-gray'}`}>
                  {customerStatusLabel[c.status] ?? c.status}
                </span>
              </div>
            ))}
            {myCustomers.length === 0 && <p className="text-sm text-gray-400 text-center py-4">لا يوجد عملاء معيّنون لك</p>}
          </div>
        </div>

        {/* Commission Summary */}
        <div className="card">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FileText className="w-4 h-4 text-yellow-500" /> ملخص العمولات
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-lg border border-emerald-100">
              <span className="text-sm text-emerald-700 font-medium">إجمالي العمولات</span>
              <span className="font-bold text-emerald-800">{totalCommission.toLocaleString()} ر.س</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg border border-yellow-100">
              <span className="text-sm text-yellow-700 font-medium">عمولات معلّقة</span>
              <span className="font-bold text-yellow-800">{pendingCommission.toLocaleString()} ر.س</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-100">
              <span className="text-sm text-blue-700 font-medium">عقود وساطة</span>
              <span className="font-bold text-blue-800">{myBrokerageContracts.length}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
              <span className="text-sm text-gray-700 font-medium">صفقات مكتملة</span>
              <span className="font-bold text-gray-800">{closedCustomers}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
