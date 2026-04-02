import { useState } from 'react';
import { useStore, generateId } from '../../data/store';
import { Plus, Edit } from 'lucide-react';
import type { User as UserType } from '../../types';

const roleLabels: Record<string, string> = {
  admin: 'مدير عام', employee: 'موظف', owner: 'مالك عقار',
  tenant: 'مستأجر', technician: 'فني', broker: 'وسيط'
};
const roleColors: Record<string, string> = {
  admin: 'badge-red', employee: 'badge-blue', owner: 'badge-green',
  tenant: 'badge-yellow', technician: 'badge-gray', broker: 'badge-blue'
};

export default function UsersPage() {
  const { users, addUser, updateUser } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [filterRole, setFilterRole] = useState('all');
  const [editing, setEditing] = useState<UserType | null>(null);

  const filtered = filterRole === 'all' ? users : users.filter(u => u.role === filterRole);

  const [form, setForm] = useState({
    name: '', email: '', password: '', role: 'employee', phone: '', isActive: true
  });

  const resetForm = () => {
    setForm({ name: '', email: '', password: '', role: 'employee', phone: '', isActive: true });
    setEditing(null);
  };

  const openEdit = (u: UserType) => {
    setEditing(u);
    setForm({ name: u.name, email: u.email, password: u.password, role: u.role, phone: u.phone || '', isActive: u.isActive });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      updateUser(editing.id, { ...form, role: form.role as UserType['role'] });
    } else {
      addUser({ ...form, role: form.role as UserType['role'], id: generateId(), createdAt: new Date().toISOString() });
    }
    setShowForm(false);
    resetForm();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">إدارة المستخدمين</h1>
          <p className="section-subtitle">{users.length} مستخدم</p>
        </div>
        <button className="btn-primary" onClick={() => { resetForm(); setShowForm(true); }}>
          <Plus className="w-4 h-4" /> مستخدم جديد
        </button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {['all', ...Object.keys(roleLabels)].map(r => (
          <button key={r} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${filterRole === r ? 'bg-yellow-500 text-white' : 'bg-white border text-gray-600 hover:bg-gray-50'}`} onClick={() => setFilterRole(r)}>
            {r === 'all' ? 'الكل' : roleLabels[r]}
          </button>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-lg font-bold mb-4">{editing ? 'تعديل المستخدم' : 'إضافة مستخدم جديد'}</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="label">الاسم الكامل</label>
                <input className="input-field" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div>
                <label className="label">البريد الإلكتروني</label>
                <input type="email" className="input-field" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
              </div>
              <div>
                <label className="label">كلمة المرور</label>
                <input type="password" className="input-field" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required={!editing} placeholder={editing ? 'اتركه فارغاً للإبقاء على الحالي' : ''} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">الدور</label>
                  <select className="input-field" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                    {Object.entries(roleLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">رقم الجوال</label>
                  <input className="input-field" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="active" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} className="rounded" />
                <label htmlFor="active" className="text-sm text-gray-700">حساب نشط</label>
              </div>
              <div className="flex gap-3">
                <button type="submit" className="btn-primary flex-1">{editing ? 'حفظ' : 'إضافة'}</button>
                <button type="button" className="btn-secondary flex-1" onClick={() => { setShowForm(false); resetForm(); }}>إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="table-header">الاسم</th>
              <th className="table-header">البريد الإلكتروني</th>
              <th className="table-header">الجوال</th>
              <th className="table-header">الدور</th>
              <th className="table-header">الحالة</th>
              <th className="table-header">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map(u => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="table-cell">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-yellow-500 rounded-full flex items-center justify-center text-white text-xs font-bold">{u.name[0]}</div>
                    <span className="font-medium">{u.name}</span>
                  </div>
                </td>
                <td className="table-cell text-gray-500">{u.email}</td>
                <td className="table-cell">{u.phone || '-'}</td>
                <td className="table-cell"><span className={`badge ${roleColors[u.role]}`}>{roleLabels[u.role]}</span></td>
                <td className="table-cell">
                  <span className={`badge ${u.isActive ? 'badge-green' : 'badge-gray'}`}>{u.isActive ? 'نشط' : 'معطّل'}</span>
                </td>
                <td className="table-cell">
                  <button onClick={() => openEdit(u)} className="p-1.5 hover:bg-gray-100 rounded text-gray-500"><Edit className="w-3.5 h-3.5" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
