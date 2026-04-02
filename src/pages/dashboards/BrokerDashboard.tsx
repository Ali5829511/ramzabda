import { useStore } from '../../data/store';
import { Users, Calendar, Megaphone, Eye } from 'lucide-react';

export default function BrokerDashboard() {
  const { currentUser, customers, appointments, marketingListings } = useStore();
  const myListings = marketingListings.filter(l => l.brokerId === currentUser?.id || !l.brokerId);
  const myCustomers = customers.filter(c => c.assignedTo === currentUser?.id);
  const myAppointments = appointments.filter(a => a.employeeId === currentUser?.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="section-title">مرحباً، {currentUser?.name}</h1>
        <p className="section-subtitle">بوابة الوسيط العقاري</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'عملائي', value: myCustomers.length, icon: <Users className="w-5 h-5" />, color: 'bg-blue-500' },
          { label: 'مواعيد نشطة', value: myAppointments.filter(a => a.status !== 'cancelled').length, icon: <Calendar className="w-5 h-5" />, color: 'bg-yellow-500' },
          { label: 'إعلاناتي', value: myListings.length, icon: <Megaphone className="w-5 h-5" />, color: 'bg-green-500' },
          { label: 'إجمالي المشاهدات', value: myListings.reduce((s, l) => s + l.views, 0), icon: <Eye className="w-5 h-5" />, color: 'bg-purple-500' },
        ].map((s, i) => (
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
        <div className="card">
          <h3 className="font-bold text-gray-800 mb-4">عملائي المحتملين</h3>
          <div className="space-y-3">
            {myCustomers.slice(0, 5).map(c => (
              <div key={c.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-800">{c.name}</p>
                  <p className="text-xs text-gray-500">{c.phone}</p>
                </div>
                <span className={`badge ${
                  c.status === 'closed' ? 'badge-green' :
                  c.status === 'negotiating' ? 'badge-yellow' :
                  c.status === 'interested' ? 'badge-blue' : 'badge-gray'
                }`}>
                  {c.status === 'closed' ? 'مكتمل' : c.status === 'negotiating' ? 'تفاوض' : c.status === 'interested' ? 'مهتم' : c.status === 'contacted' ? 'تم التواصل' : 'جديد'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="font-bold text-gray-800 mb-4">إعلاناتي العقارية</h3>
          <div className="space-y-3">
            {myListings.slice(0, 4).map(l => (
              <div key={l.id} className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-800 truncate">{l.title}</p>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                  <span><Eye className="w-3 h-3 inline ml-1" />{l.views} مشاهدة</span>
                  <span>{l.inquiries} استفسار</span>
                  <span className="font-semibold text-yellow-600">{l.price.toLocaleString()} ر</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
