import { useState } from 'react';
import { useStore, generateId } from '../../data/store';
import { Plus, MessageCircle, Phone, MapPin, Mail, FileText, Calendar } from 'lucide-react';
import type { Interaction } from '../../types';

const typeLabels: Record<string, string> = { call: 'مكالمة', visit: 'زيارة', whatsapp: 'واتساب', email: 'بريد', meeting: 'اجتماع', note: 'ملاحظة' };
const typeIcons: Record<string, React.ReactNode> = {
  call: <Phone className="w-4 h-4" />,
  visit: <MapPin className="w-4 h-4" />,
  whatsapp: <MessageCircle className="w-4 h-4" />,
  email: <Mail className="w-4 h-4" />,
  meeting: <Calendar className="w-4 h-4" />,
  note: <FileText className="w-4 h-4" />,
};

export default function InteractionsPage() {
  const { interactions, customers, users, addInteraction, currentUser } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [filterCustomer, setFilterCustomer] = useState('all');

  const [form, setForm] = useState({
    customerId: customers[0]?.id || '', type: 'call', summary: '', outcome: '', employeeId: currentUser?.id || ''
  });

  const filtered = filterCustomer === 'all' ? interactions : interactions.filter(i => i.customerId === filterCustomer);
  const sorted = [...filtered].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addInteraction({ ...form, type: form.type as Interaction['type'], id: generateId(), createdAt: new Date().toISOString() });
    setForm({ customerId: customers[0]?.id || '', type: 'call', summary: '', outcome: '', employeeId: currentUser?.id || '' });
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">سجل التواصل مع العملاء</h1>
          <p className="section-subtitle">{interactions.length} تفاعل</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4" /> تسجيل تفاعل
        </button>
      </div>

      <select className="input-field max-w-xs" value={filterCustomer} onChange={e => setFilterCustomer(e.target.value)}>
        <option value="all">كل العملاء</option>
        {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-lg font-bold mb-4">تسجيل تفاعل جديد</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="label">العميل</label>
                <select className="input-field" value={form.customerId} onChange={e => setForm({ ...form, customerId: e.target.value })}>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">نوع التفاعل</label>
                <select className="input-field" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                  {Object.entries(typeLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="label">ملخص التفاعل</label>
                <textarea className="input-field" rows={3} value={form.summary} onChange={e => setForm({ ...form, summary: e.target.value })} required />
              </div>
              <div>
                <label className="label">النتيجة</label>
                <input className="input-field" value={form.outcome} onChange={e => setForm({ ...form, outcome: e.target.value })} placeholder="ماذا تم الاتفاق عليه؟" />
              </div>
              <div className="flex gap-3">
                <button type="submit" className="btn-primary flex-1">تسجيل</button>
                <button type="button" className="btn-secondary flex-1" onClick={() => setShowForm(false)}>إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="relative">
        <div className="absolute right-5 top-0 bottom-0 w-0.5 bg-gray-200" />
        <div className="space-y-4">
          {sorted.map(i => {
            const customer = customers.find(c => c.id === i.customerId);
            const employee = users.find(u => u.id === i.employeeId);
            return (
              <div key={i.id} className="relative pr-10">
                <div className="absolute right-2.5 top-3 w-5 h-5 rounded-full bg-yellow-500 flex items-center justify-center text-white">
                  {typeIcons[i.type]}
                </div>
                <div className="card p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-gray-800">{customer?.name}</p>
                      <span className="badge badge-blue text-xs">{typeLabels[i.type]}</span>
                    </div>
                    <div className="text-left">
                      <p className="text-xs text-gray-400">{i.createdAt.split('T')[0]}</p>
                      {employee && <p className="text-xs text-gray-500">{employee.name}</p>}
                    </div>
                  </div>
                  <p className="text-sm text-gray-700">{i.summary}</p>
                  {i.outcome && <p className="text-xs text-green-700 bg-green-50 rounded p-2 mt-2">النتيجة: {i.outcome}</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
