import { useState, useRef, useMemo } from 'react';
import { useStore, generateId } from '../../data/store';
import {
  Archive, Upload, Search,
  Trash2, Eye, FolderOpen, Plus, Calendar,
  AlertCircle, Clock,
} from 'lucide-react';

interface Document {
  id: string;
  name: string;
  type: 'deed' | 'contract' | 'id' | 'permit' | 'invoice' | 'other';
  propertyId?: string;
  unitId?: string;
  contractId?: string;
  tags: string[];
  uploadedAt: string;
  expiresAt?: string;
  size: string;
  url?: string;
  notes?: string;
}

const TYPE_CONFIG = {
  deed:     { label: 'صك ملكية',       icon: '📜', color: 'bg-yellow-100 text-yellow-700' },
  contract: { label: 'عقد إيجار',       icon: '📝', color: 'bg-blue-100 text-blue-700' },
  id:       { label: 'هوية / إقامة',   icon: '🪪', color: 'bg-purple-100 text-purple-700' },
  permit:   { label: 'رخصة / تصريح',   icon: '📋', color: 'bg-green-100 text-green-700' },
  invoice:  { label: 'فاتورة',          icon: '💰', color: 'bg-orange-100 text-orange-700' },
  other:    { label: 'مستند آخر',       icon: '📁', color: 'bg-gray-100 text-gray-700' },
};

const SEED_DOCS: Document[] = [
  { id: 'd1', name: 'صك ملكية - برج النرجس', type: 'deed', tags: ['ملكية', 'الرياض'], uploadedAt: '2024-01-15', size: '2.4 MB' },
  { id: 'd2', name: 'عقد إيجار - أحمد الشمري', type: 'contract', tags: ['عقد', 'مستأجر'], uploadedAt: '2024-03-01', expiresAt: '2025-03-01', size: '1.1 MB' },
  { id: 'd3', name: 'هوية مالك - محمد العتيبي', type: 'id', tags: ['هوية', 'مالك'], uploadedAt: '2024-02-10', expiresAt: '2028-02-10', size: '0.5 MB' },
  { id: 'd4', name: 'رخصة بناء - المجمع التجاري', type: 'permit', tags: ['رخصة', 'بناء'], uploadedAt: '2023-11-20', expiresAt: '2026-11-20', size: '3.2 MB' },
  { id: 'd5', name: 'فاتورة صيانة - يناير 2025', type: 'invoice', tags: ['صيانة', 'فاتورة'], uploadedAt: '2025-01-31', size: '0.8 MB' },
  { id: 'd6', name: 'شهادة إتمام تسليم - وحدة 205', type: 'other', tags: ['تسليم'], uploadedAt: '2024-05-15', size: '1.0 MB' },
];

export default function DocumentArchivePage() {
  const { properties, contracts } = useStore();
  const [docs, setDocs] = useState<Document[]>(SEED_DOCS);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterExpiry, setFilterExpiry] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'other', propertyId: '', contractId: '', expiresAt: '', notes: '', tags: '' });
  const fileRef = useRef<HTMLInputElement>(null);

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const in90Days = useMemo(() => new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10), []);

  const filtered = docs.filter(d => {
    const q = search.toLowerCase();
    return (
      (!q || d.name.toLowerCase().includes(q) || d.tags.some(t => t.includes(q))) &&
      (!filterType || d.type === filterType) &&
      (!filterExpiry || (filterExpiry === 'expired' ? (d.expiresAt ?? '9999') < today : filterExpiry === 'expiring' ? (d.expiresAt ?? '9999') < in90Days && (d.expiresAt ?? '') >= today : true))
    );
  });

  const expiredCount = docs.filter(d => d.expiresAt && d.expiresAt < today).length;
  const expiringCount = docs.filter(d => {
    return d.expiresAt && d.expiresAt >= today && d.expiresAt < in90Days;
  }).length;

  const addDoc = () => {
    if (!form.name) return;
    setDocs(prev => [...prev, {
      id: generateId(), ...form,
      type: form.type as Document['type'],
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      uploadedAt: today, size: '—'
    }]);
    setForm({ name: '', type: 'other', propertyId: '', contractId: '', expiresAt: '', notes: '', tags: '' });
    setShowAdd(false);
  };

  const deleteDoc = (id: string) => setDocs(prev => prev.filter(d => d.id !== id));

  return (
    <div className="space-y-5" dir="rtl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="section-title flex items-center gap-2">
            <Archive className="w-6 h-6 text-purple-500" /> أرشيف الوثائق الذكي
          </h1>
          <p className="section-subtitle">تخزين وتصنيف وتتبع صلاحية جميع المستندات</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> رفع وثيقة
        </button>
      </div>

      {/* Alerts */}
      {(expiredCount > 0 || expiringCount > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {expiredCount > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
              <div>
                <p className="font-bold text-red-700">{expiredCount} وثيقة منتهية الصلاحية</p>
                <button className="text-xs text-red-500 underline" onClick={() => setFilterExpiry('expired')}>عرضها</button>
              </div>
            </div>
          )}
          {expiringCount > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 flex items-center gap-3">
              <Clock className="w-5 h-5 text-yellow-500 shrink-0" />
              <div>
                <p className="font-bold text-yellow-700">{expiringCount} وثيقة تنتهي خلال 90 يوم</p>
                <button className="text-xs text-yellow-500 underline" onClick={() => setFilterExpiry('expiring')}>عرضها</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
        {Object.entries(TYPE_CONFIG).map(([t, cfg]) => {
          const cnt = docs.filter(d => d.type === t).length;
          return (
            <div key={t} className={`card text-center cursor-pointer hover:shadow-md transition-shadow ${filterType === t ? 'ring-2 ring-yellow-400' : ''}`}
              onClick={() => setFilterType(filterType === t ? '' : t)}>
              <div className="text-2xl">{cfg.icon}</div>
              <p className="text-lg font-black text-gray-800 mt-1">{cnt}</p>
              <p className="text-xs text-gray-500">{cfg.label}</p>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="card flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="input-field pr-9 text-sm" placeholder="بحث بالاسم أو الوسم..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input-field text-sm w-40" value={filterType} onChange={e => setFilterType(e.target.value)}>
          <option value="">كل الأنواع</option>
          {Object.entries(TYPE_CONFIG).map(([t, cfg]) => <option key={t} value={t}>{cfg.label}</option>)}
        </select>
        <select className="input-field text-sm w-44" value={filterExpiry} onChange={e => setFilterExpiry(e.target.value)}>
          <option value="">كل الصلاحيات</option>
          <option value="expired">منتهية الصلاحية</option>
          <option value="expiring">تنتهي قريباً</option>
        </select>
        {(filterType || filterExpiry || search) && (
          <button onClick={() => { setFilterType(''); setFilterExpiry(''); setSearch(''); }}
            className="text-xs text-red-500 hover:text-red-700">مسح الفلاتر</button>
        )}
      </div>

      {/* Document list */}
      <div className="card p-0 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <p className="font-semibold text-gray-700 text-sm">{filtered.length} وثيقة</p>
        </div>
        <div className="divide-y divide-gray-50">
          {filtered.length === 0 ? (
            <div className="p-10 text-center">
              <FolderOpen className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400">لا توجد وثائق</p>
            </div>
          ) : filtered.map(doc => {
            const cfg = TYPE_CONFIG[doc.type];
            const isExpired = doc.expiresAt && doc.expiresAt < today;
            const isExpiring = !isExpired && doc.expiresAt && doc.expiresAt < in90Days;
            return (
              <div key={doc.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${cfg.color}`}>
                  {cfg.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-gray-800 text-sm">{doc.name}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.color}`}>{cfg.label}</span>
                    {isExpired && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">منتهية</span>}
                    {isExpiring && <span className="text-xs bg-yellow-100 text-yellow-600 px-2 py-0.5 rounded-full">تنتهي قريباً</span>}
                  </div>
                  <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                    <span className="text-xs text-gray-400 flex items-center gap-1"><Calendar className="w-3 h-3" /> رُفعت {doc.uploadedAt}</span>
                    {doc.expiresAt && <span className={`text-xs flex items-center gap-1 ${isExpired ? 'text-red-500' : 'text-gray-400'}`}><Clock className="w-3 h-3" /> تنتهي {doc.expiresAt}</span>}
                    <span className="text-xs text-gray-400">{doc.size}</span>
                    {doc.tags.map(tag => (
                      <span key={tag} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">#{tag}</span>
                    ))}
                  </div>
                  {doc.notes && <p className="text-xs text-gray-400 mt-1">{doc.notes}</p>}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {doc.url && (
                    <a href={doc.url} target="_blank" rel="noreferrer"
                      className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                      <Eye className="w-4 h-4" />
                    </a>
                  )}
                  <button onClick={() => deleteDoc(doc.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Document Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-gray-800 flex items-center gap-2"><Plus className="w-5 h-5 text-purple-500" /> رفع وثيقة جديدة</h2>
              <button onClick={() => setShowAdd(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">✕</button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="label">اسم الوثيقة *</label>
                <input className="input-field" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="مثال: صك ملكية برج النرجس" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">نوع الوثيقة</label>
                  <select className="input-field" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
                    {Object.entries(TYPE_CONFIG).map(([t, cfg]) => <option key={t} value={t}>{cfg.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">تنتهي في</label>
                  <input type="date" className="input-field" value={form.expiresAt} onChange={e => setForm(p => ({ ...p, expiresAt: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">العقار (اختياري)</label>
                  <select className="input-field" value={form.propertyId} onChange={e => setForm(p => ({ ...p, propertyId: e.target.value }))}>
                    <option value="">—</option>
                    {properties.map(p => <option key={p.id} value={p.id}>{p.propertyName}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">العقد (اختياري)</label>
                  <select className="input-field" value={form.contractId} onChange={e => setForm(p => ({ ...p, contractId: e.target.value }))}>
                    <option value="">—</option>
                    {contracts.slice(0, 20).map(c => <option key={c.id} value={c.id}>{c.contractNumber}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="label">وسوم (مفصولة بفاصلة)</label>
                <input className="input-field" value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} placeholder="ملكية، مستأجر، رخصة..." />
              </div>
              <div>
                <label className="label">ملاحظات</label>
                <textarea className="input-field" rows={2} value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
              </div>
              <div onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center cursor-pointer hover:border-purple-300 hover:bg-purple-50 transition-colors">
                <Upload className="w-6 h-6 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-400">انقر لرفع الملف (PDF, صورة)</p>
                <input ref={fileRef} type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" />
              </div>
            </div>
            <div className="p-4 border-t border-gray-100 flex gap-3">
              <button onClick={addDoc} className="btn-primary flex-1 justify-center">حفظ الوثيقة</button>
              <button onClick={() => setShowAdd(false)} className="btn-secondary px-6">إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
