import { useState } from 'react';
import { useStore, generateId } from '../../data/store';
import { Plus, User, Phone, Edit, Trash2, MessageCircle } from 'lucide-react';
import type { Customer } from '../../types';

const statusLabels: Record<string, string> = { new: 'جديد', contacted: 'تم التواصل', interested: 'مهتم', negotiating: 'تفاوض', closed: 'مكتمل', lost: 'مفقود' };
const statusColors: Record<string, string> = { new: 'badge-yellow', contacted: 'badge-blue', interested: 'badge-blue', negotiating: 'badge-yellow', closed: 'badge-green', lost: 'badge-gray' };
const typeLabels: Record<string, string> = { owner: 'مالك', tenant: 'مستأجر', buyer: 'مشتري', investor: 'مستثمر', broker: 'وسيط' };
const sourceLabels: Record<string, string> = { website: 'الموقع', whatsapp: 'واتساب', referral: 'توصية', social: 'سوشيال', walk_in: 'زيارة', other: 'أخرى' };

export default function CustomersPage() {
  const { customers, users, addCustomer, updateCustomer, deleteCustomer, addInteraction, currentUser } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const employees = users.filter(u => u.role === 'employee' || u.role === 'broker');
  const myCustomers = currentUser?.role === 'broker'
    ? customers.filter(c => c.assignedTo === currentUser.id)
    : customers;

  const filtered = myCustomers
    .filter(c => c.name.includes(search) || c.phone.includes(search))
    .filter(c => filterStatus === 'all' || c.status === filterStatus);

  const [form, setForm] = useState({
    name: '', phone: '', email: '', type: 'tenant', source: 'website',
    status: 'new', assignedTo: employees[0]?.id || '', notes: '', budget: 0,
    preferredArea: '', preferredType: ''
  });

  const resetForm = () => {
    setForm({ name: '', phone: '', email: '', type: 'tenant', source: 'website', status: 'new', assignedTo: employees[0]?.id || '', notes: '', budget: 0, preferredArea: '', preferredType: '' });
    setEditing(null);
  };

  const openEdit = (c: Customer) => {
    setEditing(c);
    setForm({ name: c.name, phone: c.phone, email: c.email || '', type: c.type, source: c.source, status: c.status, assignedTo: c.assignedTo || '', notes: c.notes || '', budget: c.budget || 0, preferredArea: c.preferredArea || '', preferredType: c.preferredType || '' });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      updateCustomer(editing.id, { ...form, type: form.type as Customer['type'], source: form.source as Customer['source'], status: form.status as Customer['status'] });
    } else {
      addCustomer({ ...form, type: form.type as Customer['type'], source: form.source as Customer['source'], status: form.status as Customer['status'], id: generateId(), createdAt: new Date().toISOString() });
    }
    setShowForm(false);
    resetForm();
  };

  const sendWhatsApp = (phone: string, name: string) => {
    window.open(`https://wa.me/966${phone.replace(/^0/, '')}?text=السلام عليكم ${name}`, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">إدارة العملاء (CRM)</h1>
          <p className="section-subtitle">{filtered.length} عميل</p>
        </div>
        <button className="btn-primary" onClick={() => { resetForm(); setShowForm(true); }}>
          <Plus className="w-4 h-4" /> عميل جديد
        </button>
      </div>

      <div className="flex gap-3 flex-wrap">
        <input className="input-field max-w-xs" placeholder="بحث بالاسم أو الجوال..." value={search} onChange={e => setSearch(e.target.value)} />
        <div className="flex gap-2 flex-wrap">
          {['all', 'new', 'contacted', 'interested', 'negotiating', 'closed'].map(s => (
            <button key={s} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${filterStatus === s ? 'bg-yellow-500 text-white' : 'bg-white border text-gray-600 hover:bg-gray-50'}`} onClick={() => setFilterStatus(s)}>
              {s === 'all' ? 'الكل' : statusLabels[s]}
            </button>
          ))}
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold mb-4">{editing ? 'تعديل بيانات العميل' : 'إضافة عميل جديد'}</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="label">الاسم الكامل</label>
                  <input className="input-field" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div>
                  <label className="label">رقم الجوال</label>
                  <input className="input-field" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required />
                </div>
                <div>
                  <label className="label">البريد الإلكتروني</label>
                  <input type="email" className="input-field" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                </div>
                <div>
                  <label className="label">النوع</label>
                  <select className="input-field" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                    {Object.entries(typeLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">المصدر</label>
                  <select className="input-field" value={form.source} onChange={e => setForm({ ...form, source: e.target.value })}>
                    {Object.entries(sourceLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">الحالة</label>
                  <select className="input-field" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                    {Object.entries(statusLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">المسؤول</label>
                  <select className="input-field" value={form.assignedTo} onChange={e => setForm({ ...form, assignedTo: e.target.value })}>
                    {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">الميزانية</label>
                  <input type="number" className="input-field" value={form.budget} onChange={e => setForm({ ...form, budget: +e.target.value })} />
                </div>
                <div>
                  <label className="label">المنطقة المفضلة</label>
                  <input className="input-field" value={form.preferredArea} onChange={e => setForm({ ...form, preferredArea: e.target.value })} />
                </div>
                <div className="col-span-2">
                  <label className="label">ملاحظات</label>
                  <textarea className="input-field" rows={2} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
                </div>
              </div>
              <div className="flex gap-3">
                <button type="submit" className="btn-primary flex-1">{editing ? 'حفظ' : 'إضافة'}</button>
                <button type="button" className="btn-secondary flex-1" onClick={() => { setShowForm(false); resetForm(); }}>إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(c => {
          const assignee = users.find(u => u.id === c.assignedTo);
          return (
            <div key={c.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                    {c.name[0]}
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">{c.name}</p>
                    <p className="text-xs text-gray-500">{typeLabels[c.type]} - {sourceLabels[c.source]}</p>
                  </div>
                </div>
                <span className={`badge ${statusColors[c.status]}`}>{statusLabels[c.status]}</span>
              </div>
              <div className="space-y-1.5 text-sm text-gray-600">
                <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-gray-400" />{c.phone}</div>
                {c.budget && <div className="text-xs text-gray-500">الميزانية: {c.budget.toLocaleString()} ر</div>}
                {c.preferredArea && <div className="text-xs text-gray-500">المنطقة: {c.preferredArea}</div>}
                {assignee && <div className="text-xs text-gray-400">المسؤول: {assignee.name}</div>}
              </div>
              <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                <button onClick={() => sendWhatsApp(c.phone, c.name)} className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-lg text-xs hover:bg-green-100 transition-colors">
                  <MessageCircle className="w-3 h-3" /> واتساب
                </button>
                <button onClick={() => openEdit(c)} className="flex items-center gap-1 px-2 py-1 bg-gray-50 text-gray-600 rounded-lg text-xs hover:bg-gray-100 transition-colors">
                  <Edit className="w-3 h-3" /> تعديل
                </button>
                {currentUser?.role === 'admin' && (
                  <button onClick={() => deleteCustomer(c.id)} className="flex items-center gap-1 px-2 py-1 bg-red-50 text-red-500 rounded-lg text-xs hover:bg-red-100 transition-colors">
                    <Trash2 className="w-3 h-3" /> حذف
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
