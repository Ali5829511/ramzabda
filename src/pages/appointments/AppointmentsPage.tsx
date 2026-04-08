import { useState } from 'react';
import { useStore, generateId } from '../../data/store';
import { Plus, Calendar, Clock, MapPin, CheckCircle } from 'lucide-react';
import type { Appointment } from '../../types';

const typeLabels: Record<string, string> = { viewing: 'زيارة عقار', handover: 'تسليم/استلام', maintenance: 'صيانة', contract: 'توقيع عقد', other: 'أخرى' };
const statusLabels: Record<string, string> = { scheduled: 'مجدول', confirmed: 'مؤكد', completed: 'مكتمل', cancelled: 'ملغي', no_show: 'لم يحضر' };
const statusColors: Record<string, string> = { scheduled: 'badge-yellow', confirmed: 'badge-blue', completed: 'badge-green', cancelled: 'badge-gray', no_show: 'badge-red' };

export default function AppointmentsPage() {
  const { appointments, customers, properties, users, addAppointment, updateAppointment, currentUser } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  const employees = users.filter(u => u.role === 'employee' || u.role === 'broker' || u.role === 'admin');
  const myAppointments = currentUser?.role === 'tenant'
    ? appointments.filter(a => a.customerId === currentUser.id)
    : currentUser?.role === 'broker' || currentUser?.role === 'employee'
    ? appointments.filter(a => a.employeeId === currentUser.id)
    : appointments;

  const filtered = filterStatus === 'all' ? myAppointments : myAppointments.filter(a => a.status === filterStatus);
  const sorted = [...filtered].sort((a, b) => `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`));

  const [form, setForm] = useState({
    customerId: customers[0]?.id || '', propertyId: properties[0]?.id || '',
    unitId: '', employeeId: employees[0]?.id || '', date: '', time: '',
    duration: 60, type: 'viewing', status: 'scheduled', notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addAppointment({ ...form, type: form.type as Appointment['type'], status: form.status as Appointment['status'], id: generateId(), createdAt: new Date().toISOString() });
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">المواعيد والزيارات</h1>
          <p className="section-subtitle">{myAppointments.length} موعد</p>
        </div>
        {currentUser?.role !== 'tenant' && (
          <button className="btn-primary" onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4" /> موعد جديد
          </button>
        )}
      </div>

      <div className="flex gap-2 flex-wrap">
        {['all', 'scheduled', 'confirmed', 'completed', 'cancelled'].map(s => (
          <button key={s} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${filterStatus === s ? 'bg-yellow-500 text-white' : 'bg-white border text-gray-600 hover:bg-gray-50'}`} onClick={() => setFilterStatus(s)}>
            {s === 'all' ? 'الكل' : statusLabels[s]}
          </button>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl">
            <h2 className="text-lg font-bold mb-4">جدولة موعد جديد</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="label">العميل</label>
                  <select className="input-field" value={form.customerId} onChange={e => setForm({ ...form, customerId: e.target.value })}>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">العقار</label>
                  <select className="input-field" value={form.propertyId} onChange={e => setForm({ ...form, propertyId: e.target.value })}>
                    {properties.map(p => <option key={p.id} value={p.id}>{p.propertyName}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">المسؤول</label>
                  <select className="input-field" value={form.employeeId} onChange={e => setForm({ ...form, employeeId: e.target.value })}>
                    {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">التاريخ</label>
                  <input type="date" className="input-field" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required />
                </div>
                <div>
                  <label className="label">الوقت</label>
                  <input type="time" className="input-field" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} required />
                </div>
                <div>
                  <label className="label">النوع</label>
                  <select className="input-field" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                    {Object.entries(typeLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">المدة (دقيقة)</label>
                  <input type="number" className="input-field" value={form.duration} onChange={e => setForm({ ...form, duration: +e.target.value })} />
                </div>
                <div className="col-span-2">
                  <label className="label">ملاحظات</label>
                  <textarea className="input-field" rows={2} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
                </div>
              </div>
              <div className="flex gap-3">
                <button type="submit" className="btn-primary flex-1">جدولة</button>
                <button type="button" className="btn-secondary flex-1" onClick={() => setShowForm(false)}>إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {sorted.map(a => {
          const customer = customers.find(c => c.id === a.customerId);
          const prop = properties.find(p => p.id === a.propertyId);
          const emp = users.find(u => u.id === a.employeeId);
          return (
            <div key={a.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">{customer?.name}</p>
                    <p className="text-sm text-gray-500">{typeLabels[a.type]}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`badge ${statusColors[a.status]}`}>{statusLabels[a.status]}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 pt-3 border-t border-gray-100 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  {a.date}
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="w-4 h-4 text-gray-400" />
                  {a.time} ({a.duration} د)
                </div>
                {prop && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    {prop.propertyName}
                  </div>
                )}
                {emp && <div className="text-gray-500 text-xs">المسؤول: {emp.name}</div>}
              </div>
              {a.notes && <p className="mt-2 text-xs text-gray-500 bg-gray-50 rounded p-2">{a.notes}</p>}
              {(currentUser?.role === 'admin' || currentUser?.role === 'employee') && a.status === 'scheduled' && (
                <div className="flex gap-2 mt-3">
                  <button onClick={() => updateAppointment(a.id, { status: 'confirmed' })} className="btn-primary text-xs py-1 px-3">
                    <CheckCircle className="w-3 h-3" /> تأكيد
                  </button>
                  <button onClick={() => updateAppointment(a.id, { status: 'completed' })} className="btn-secondary text-xs py-1 px-3">
                    إكمال
                  </button>
                  <button onClick={() => updateAppointment(a.id, { status: 'cancelled' })} className="text-xs px-3 py-1 bg-red-50 text-red-600 rounded-lg hover:bg-red-100">
                    إلغاء
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
