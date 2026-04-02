import { useState } from 'react';
import { useStore, generateId } from '../../data/store';
import { Plus, Edit, Trash2 } from 'lucide-react';
import type { Unit } from '../../types';

const statusLabels: Record<string, string> = { available: 'متاحة', rented: 'مؤجرة', reserved: 'محجوزة', maintenance: 'صيانة', sold: 'مباعة' };
const statusColors: Record<string, string> = { available: 'badge-green', rented: 'badge-blue', reserved: 'badge-yellow', maintenance: 'badge-red', sold: 'badge-gray' };
const furnishedLabels: Record<string, string> = { furnished: 'مؤثث', unfurnished: 'غير مؤثث', 'semi-furnished': 'مؤثث جزئياً' };

export default function UnitsPage() {
  const { units, properties, addUnit, updateUnit, deleteUnit, currentUser } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Unit | null>(null);
  const [filterProp, setFilterProp] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const visibleProps = currentUser?.role === 'owner'
    ? properties.filter(p => p.ownerId === currentUser.id)
    : properties;

  const filtered = units
    .filter(u => visibleProps.some(p => p.id === u.propertyId))
    .filter(u => filterProp === 'all' || u.propertyId === filterProp)
    .filter(u => filterStatus === 'all' || u.unitStatus === filterStatus);

  const [form, setForm] = useState({
    propertyId: visibleProps[0]?.id || '', unitNumber: '', unitType: 'شقة سكنية',
    unitArea: 0, unitStatus: 'available', furnishedStatus: 'unfurnished',
    unitServices: '', unitFacilities: '', rentPrice: 0, salePrice: 0,
    bedrooms: 0, bathrooms: 0, floor: 1, region: '', city: '',
    mainContractNumber: '', brokerageAgreementNumber: ''
  });

  const resetForm = () => {
    setForm({ propertyId: visibleProps[0]?.id || '', unitNumber: '', unitType: 'شقة سكنية', unitArea: 0, unitStatus: 'available', furnishedStatus: 'unfurnished', unitServices: '', unitFacilities: '', rentPrice: 0, salePrice: 0, bedrooms: 0, bathrooms: 0, floor: 1, region: '', city: '', mainContractNumber: '', brokerageAgreementNumber: '' });
    setEditing(null);
  };

  const openEdit = (u: Unit) => {
    setEditing(u);
    setForm({ propertyId: u.propertyId, unitNumber: u.unitNumber, unitType: u.unitType, unitArea: u.unitArea, unitStatus: u.unitStatus, furnishedStatus: u.furnishedStatus, unitServices: u.unitServices, unitFacilities: u.unitFacilities, rentPrice: u.rentPrice ?? 0, salePrice: u.salePrice || 0, bedrooms: u.bedrooms || 0, bathrooms: u.bathrooms || 0, floor: u.floor || 1, region: u.region, city: u.city, mainContractNumber: u.mainContractNumber || '', brokerageAgreementNumber: u.brokerageAgreementNumber || '' });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const prop = visibleProps.find(p => p.id === form.propertyId);
    if (editing) {
      updateUnit(editing.id, { ...form, unitStatus: form.unitStatus as Unit['unitStatus'], furnishedStatus: form.furnishedStatus as Unit['furnishedStatus'] });
    } else {
      addUnit({
        ...form,
        unitStatus: form.unitStatus as Unit['unitStatus'],
        furnishedStatus: form.furnishedStatus as Unit['furnishedStatus'],
        titleDeedNumber: prop?.titleDeedNumber || '',
        id: generateId(), createdAt: new Date().toISOString()
      });
    }
    setShowForm(false);
    resetForm();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">إدارة الوحدات</h1>
          <p className="section-subtitle">{filtered.length} وحدة</p>
        </div>
        {(currentUser?.role === 'admin' || currentUser?.role === 'employee') && (
          <button className="btn-primary" onClick={() => { resetForm(); setShowForm(true); }}>
            <Plus className="w-4 h-4" /> إضافة وحدة
          </button>
        )}
      </div>

      <div className="flex gap-3 flex-wrap">
        <select className="input-field w-auto" value={filterProp} onChange={e => setFilterProp(e.target.value)}>
          <option value="all">كل العقارات</option>
          {visibleProps.map(p => <option key={p.id} value={p.id}>{p.propertyName}</option>)}
        </select>
        <select className="input-field w-auto" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="all">كل الحالات</option>
          {Object.entries(statusLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold mb-4">{editing ? 'تعديل الوحدة' : 'إضافة وحدة جديدة'}</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="label">العقار</label>
                  <select className="input-field" value={form.propertyId} onChange={e => {
                    const prop = visibleProps.find(p => p.id === e.target.value);
                    setForm({ ...form, propertyId: e.target.value, region: prop?.region || '', city: prop?.city || '' });
                  }}>
                    {visibleProps.map(p => <option key={p.id} value={p.id}>{p.propertyName} ({p.titleDeedNumber})</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">رقم الوحدة</label>
                  <input className="input-field" value={form.unitNumber} onChange={e => setForm({ ...form, unitNumber: e.target.value })} required />
                </div>
                <div>
                  <label className="label">نوع الوحدة</label>
                  <input className="input-field" value={form.unitType} onChange={e => setForm({ ...form, unitType: e.target.value })} placeholder="شقة، محل، مكتب..." />
                </div>
                <div>
                  <label className="label">المساحة (م²)</label>
                  <input type="number" className="input-field" value={form.unitArea} onChange={e => setForm({ ...form, unitArea: +e.target.value })} required />
                </div>
                <div>
                  <label className="label">الطابق</label>
                  <input type="number" className="input-field" value={form.floor} onChange={e => setForm({ ...form, floor: +e.target.value })} />
                </div>
                <div>
                  <label className="label">غرف النوم</label>
                  <input type="number" className="input-field" value={form.bedrooms} onChange={e => setForm({ ...form, bedrooms: +e.target.value })} />
                </div>
                <div>
                  <label className="label">دورات المياه</label>
                  <input type="number" className="input-field" value={form.bathrooms} onChange={e => setForm({ ...form, bathrooms: +e.target.value })} />
                </div>
                <div>
                  <label className="label">حالة التأثيث</label>
                  <select className="input-field" value={form.furnishedStatus} onChange={e => setForm({ ...form, furnishedStatus: e.target.value })}>
                    {Object.entries(furnishedLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">حالة الوحدة</label>
                  <select className="input-field" value={form.unitStatus} onChange={e => setForm({ ...form, unitStatus: e.target.value })}>
                    {Object.entries(statusLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">سعر الإيجار الشهري</label>
                  <input type="number" className="input-field" value={form.rentPrice} onChange={e => setForm({ ...form, rentPrice: +e.target.value })} />
                </div>
                <div>
                  <label className="label">سعر البيع</label>
                  <input type="number" className="input-field" value={form.salePrice} onChange={e => setForm({ ...form, salePrice: +e.target.value })} />
                </div>
                <div className="col-span-2">
                  <label className="label">خدمات الوحدة</label>
                  <input className="input-field" value={form.unitServices} onChange={e => setForm({ ...form, unitServices: e.target.value })} placeholder="تكييف، سخان، مياه..." />
                </div>
                <div className="col-span-2">
                  <label className="label">مرافق الوحدة</label>
                  <input className="input-field" value={form.unitFacilities} onChange={e => setForm({ ...form, unitFacilities: e.target.value })} placeholder="3 غرف، 2 حمام..." />
                </div>
                <div>
                  <label className="label">رقم اتفاقية الوساطة</label>
                  <input className="input-field font-mono" value={form.brokerageAgreementNumber} onChange={e => setForm({ ...form, brokerageAgreementNumber: e.target.value })} />
                </div>
                <div>
                  <label className="label">رقم العقد الأساسي</label>
                  <input className="input-field font-mono" value={form.mainContractNumber} onChange={e => setForm({ ...form, mainContractNumber: e.target.value })} />
                </div>
              </div>
              <div className="flex gap-3 mt-2">
                <button type="submit" className="btn-primary flex-1">{editing ? 'حفظ' : 'إضافة'}</button>
                <button type="button" className="btn-secondary flex-1" onClick={() => { setShowForm(false); resetForm(); }}>إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden overflow-x-auto">
        <table className="w-full min-w-max">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="table-header">رقم الوحدة</th>
              <th className="table-header">العقار</th>
              <th className="table-header">رقم الوثيقة</th>
              <th className="table-header">النوع</th>
              <th className="table-header">المساحة</th>
              <th className="table-header">التأثيث</th>
              <th className="table-header">الإيجار</th>
              <th className="table-header">الحالة</th>
              <th className="table-header">العقد</th>
              <th className="table-header">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map(u => {
              const prop = properties.find(p => p.id === u.propertyId);
              return (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="table-cell font-medium">{u.unitNumber}</td>
                  <td className="table-cell text-gray-500">{prop?.propertyName}</td>
                  <td className="table-cell font-mono text-xs text-gray-400">{u.titleDeedNumber}</td>
                  <td className="table-cell">{u.unitType}</td>
                  <td className="table-cell">{u.unitArea} م²</td>
                  <td className="table-cell text-xs">{furnishedLabels[u.furnishedStatus]}</td>
                  <td className="table-cell font-semibold text-yellow-600">{(u.rentPrice ?? 0).toLocaleString()} ر</td>
                  <td className="table-cell"><span className={`badge ${statusColors[u.unitStatus]}`}>{statusLabels[u.unitStatus]}</span></td>
                  <td className="table-cell font-mono text-xs">{u.mainContractNumber || '-'}</td>
                  <td className="table-cell">
                    {(currentUser?.role === 'admin' || currentUser?.role === 'employee') && (
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(u)} className="p-1.5 hover:bg-gray-100 rounded text-gray-500"><Edit className="w-3.5 h-3.5" /></button>
                        <button onClick={() => deleteUnit(u.id)} className="p-1.5 hover:bg-red-50 rounded text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
