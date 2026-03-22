import { useState, useMemo } from 'react';
import { useStore, generateId } from '../../data/store';
import {
  Users, Plus, Phone, MessageCircle, Mail, MapPin, Calendar,
  FileText, Star, TrendingUp, Clock, CheckCircle,
  Edit, Trash2, Search, BarChart2, Target,
  AlertCircle, User, Bell, ArrowRight, RefreshCw,
  PhoneCall, Ticket, Headphones
} from 'lucide-react';
import type { Customer, Interaction, SupportTicket } from '../../types';

// ─── Label Maps ─────────────────────────────────────────────────────────────
const statusLabels: Record<string, string> = {
  new: 'جديد', contacted: 'تم التواصل', interested: 'مهتم',
  negotiating: 'تفاوض', closed: 'مكتمل', lost: 'خسارة'
};
const statusColors: Record<string, string> = {
  new: 'bg-yellow-100 text-yellow-800', contacted: 'bg-blue-100 text-blue-800',
  interested: 'bg-indigo-100 text-indigo-800', negotiating: 'bg-orange-100 text-orange-700',
  closed: 'bg-green-100 text-green-800', lost: 'bg-gray-100 text-gray-500'
};
const typeLabels: Record<string, string> = {
  owner: 'مالك', tenant: 'مستأجر', buyer: 'مشتري', investor: 'مستثمر', broker: 'وسيط'
};
const typeColors: Record<string, string> = {
  owner: 'bg-purple-100 text-purple-700', tenant: 'bg-blue-100 text-blue-700',
  buyer: 'bg-green-100 text-green-700', investor: 'bg-yellow-100 text-yellow-800', broker: 'bg-pink-100 text-pink-700'
};
const sourceLabels: Record<string, string> = {
  website: 'الموقع', whatsapp: 'واتساب', referral: 'توصية',
  social: 'سوشيال', walk_in: 'زيارة', phone: 'هاتف', other: 'أخرى'
};
const interactionIcons: Record<string, React.ReactNode> = {
  call: <PhoneCall className="w-3.5 h-3.5" />,
  visit: <MapPin className="w-3.5 h-3.5" />,
  whatsapp: <MessageCircle className="w-3.5 h-3.5" />,
  email: <Mail className="w-3.5 h-3.5" />,
  meeting: <Calendar className="w-3.5 h-3.5" />,
  note: <FileText className="w-3.5 h-3.5" />,
};
const interactionLabels: Record<string, string> = {
  call: 'مكالمة', visit: 'زيارة', whatsapp: 'واتساب',
  email: 'بريد إلكتروني', meeting: 'اجتماع', note: 'ملاحظة'
};
const ticketStatusLabels: Record<string, string> = {
  open: 'مفتوح', in_progress: 'جاري', pending_customer: 'انتظار العميل',
  resolved: 'محلول', closed: 'مغلق'
};
const ticketStatusColors: Record<string, string> = {
  open: 'bg-red-100 text-red-700', in_progress: 'bg-blue-100 text-blue-700',
  pending_customer: 'bg-yellow-100 text-yellow-800', resolved: 'bg-green-100 text-green-700',
  closed: 'bg-gray-100 text-gray-500'
};
const ticketCategoryLabels: Record<string, string> = {
  complaint: 'شكوى', inquiry: 'استفسار', request: 'طلب',
  maintenance: 'صيانة', billing: 'فواتير', other: 'أخرى'
};
const ticketChannelLabels: Record<string, string> = {
  phone: 'هاتف', whatsapp: 'واتساب', email: 'بريد', walk_in: 'زيارة', portal: 'البوابة'
};
const pipelineSteps = ['new', 'contacted', 'interested', 'negotiating', 'closed', 'lost'];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function StarRating({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <button key={i} type="button" onClick={() => onChange?.(i)}
          className={`text-base leading-none ${i<=value?'text-yellow-400':'text-gray-300'} ${onChange?'hover:text-yellow-400 cursor-pointer':'cursor-default'}`}>★</button>
      ))}
    </div>
  );
}

function KpiCard({ label, value, icon, color, sub }: { label: string; value: string|number; icon: React.ReactNode; color: string; sub?: string }) {
  return (
    <div className="card flex items-center gap-3">
      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${color}`}>{icon}</div>
      <div>
        <p className="text-xl font-bold text-gray-800">{value}</p>
        <p className="text-xs text-gray-500">{label}</p>
        {sub && <p className="text-xs text-green-600 font-medium">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Customer Profile Modal ──────────────────────────────────────────────────
function CustomerProfile({
  customer, onClose, onAddInteraction
}: {
  customer: Customer;
  onClose: () => void;
  onAddInteraction: (customerId: string) => void;
}) {
  const { interactions, users, appointments, contracts } = useStore();
  const customerInteractions = [...interactions.filter(i => i.customerId === customer.id)]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const assignedUser = users.find(u => u.id === customer.assignedTo);
  const relatedContracts = contracts.filter(c => c.tenantName === customer.name);

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl my-auto">
        <div className="bg-gradient-to-l from-yellow-500 to-amber-600 rounded-t-2xl p-6 text-white">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-2xl font-bold">
                {customer.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-xl font-bold">{customer.name}</h2>
                <p className="text-yellow-100 text-sm">{customer.phone}</p>
                {customer.email && <p className="text-yellow-100 text-xs">{customer.email}</p>}
              </div>
            </div>
            <button onClick={onClose} className="text-white/70 hover:text-white text-2xl leading-none">×</button>
          </div>
          <div className="flex gap-2 mt-4 flex-wrap">
            <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full">{typeLabels[customer.type]}</span>
            <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full">{statusLabels[customer.status]}</span>
            <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full">{sourceLabels[customer.source]}</span>
            {customer.city && <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full">{customer.city}</span>}
          </div>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4 text-sm">
            {customer.budget != null && customer.budget > 0 && (
              <div><p className="text-gray-400 text-xs mb-0.5">الميزانية</p><p className="font-semibold">{customer.budget.toLocaleString()} ر.س</p></div>
            )}
            {customer.preferredArea && (
              <div><p className="text-gray-400 text-xs mb-0.5">المنطقة المفضلة</p><p className="font-semibold">{customer.preferredArea}</p></div>
            )}
            {customer.preferredType && (
              <div><p className="text-gray-400 text-xs mb-0.5">نوع العقار المفضل</p><p className="font-semibold">{customer.preferredType}</p></div>
            )}
            {assignedUser && (
              <div><p className="text-gray-400 text-xs mb-0.5">المسؤول</p><p className="font-semibold">{assignedUser.name}</p></div>
            )}
            {customer.nextFollowUp && (
              <div><p className="text-gray-400 text-xs mb-0.5">متابعة قادمة</p><p className="font-semibold text-orange-600">{new Date(customer.nextFollowUp).toLocaleDateString('ar-SA')}</p></div>
            )}
            {customer.rating != null && customer.rating > 0 && (
              <div><p className="text-gray-400 text-xs mb-0.5">التقييم</p><StarRating value={customer.rating} /></div>
            )}
          </div>

          {customer.notes && (
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-1">ملاحظات</p>
              <p className="text-sm text-gray-700">{customer.notes}</p>
            </div>
          )}

          {relatedContracts.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1"><FileText className="w-3.5 h-3.5" /> عقود مرتبطة ({relatedContracts.length})</p>
              <div className="space-y-1.5">
                {relatedContracts.slice(0,3).map(c => (
                  <div key={c.id} className="flex justify-between items-center bg-blue-50 rounded-lg px-3 py-2 text-xs">
                    <span className="font-medium">{c.contractNumber}</span>
                    <span className="text-blue-700">{c.totalContractAmount?.toLocaleString()} ر.س</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-gray-500 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> سجل التواصل ({customerInteractions.length})
              </p>
              <button onClick={() => onAddInteraction(customer.id)} className="btn-primary text-xs py-1 px-3 flex items-center gap-1">
                <Plus className="w-3 h-3" /> تسجيل تواصل
              </button>
            </div>
            {customerInteractions.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">لا يوجد سجل تواصل بعد</p>
            ) : (
              <div className="space-y-2 max-h-52 overflow-y-auto">
                {customerInteractions.map(i => {
                  const emp = users.find(u => u.id === i.employeeId);
                  return (
                    <div key={i.id} className="flex gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="w-7 h-7 bg-yellow-100 text-yellow-700 rounded-lg flex items-center justify-center shrink-0 text-xs">
                        {interactionIcons[i.type]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-semibold text-gray-700">{interactionLabels[i.type]}</span>
                          <span className="text-xs text-gray-400 shrink-0">{new Date(i.createdAt).toLocaleDateString('ar-SA')}</span>
                        </div>
                        <p className="text-xs text-gray-600 mt-0.5">{i.summary}</p>
                        {i.outcome && <p className="text-xs text-green-700 mt-0.5">النتيجة: {i.outcome}</p>}
                        {emp && <p className="text-xs text-gray-400 mt-0.5">بواسطة: {emp.name}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <a href={`tel:${customer.phone}`} className="btn-secondary flex-1 flex items-center justify-center gap-2 text-sm">
              <Phone className="w-4 h-4" /> اتصال
            </a>
            <a href={`https://wa.me/966${customer.phone.replace(/^0/, '')}`} target="_blank" rel="noreferrer"
              className="btn-primary flex-1 flex items-center justify-center gap-2 text-sm">
              <MessageCircle className="w-4 h-4" /> واتساب
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Pipeline Board ──────────────────────────────────────────────────────────
function PipelineBoard({ customers, onSelectCustomer }: { customers: Customer[]; onSelectCustomer: (c: Customer) => void }) {
  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-3 min-w-max">
        {pipelineSteps.map(step => {
          const cols = customers.filter(c => c.status === step);
          return (
            <div key={step} className="w-52 shrink-0">
              <div className={`text-xs font-bold px-3 py-2 rounded-xl mb-2 flex items-center justify-between ${statusColors[step]}`}>
                <span>{statusLabels[step]}</span>
                <span className="bg-white/60 rounded-full px-2 py-0.5">{cols.length}</span>
              </div>
              <div className="space-y-2">
                {cols.slice(0, 8).map(c => (
                  <div key={c.id} onClick={() => onSelectCustomer(c)}
                    className="bg-white border border-gray-200 rounded-xl p-3 cursor-pointer hover:shadow-md hover:border-yellow-400 transition-all">
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-7 h-7 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {c.name.charAt(0)}
                      </div>
                      <p className="text-xs font-semibold text-gray-800 truncate">{c.name}</p>
                    </div>
                    <p className="text-xs text-gray-500 flex items-center gap-1"><Phone className="w-2.5 h-2.5" />{c.phone}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className={`text-xs px-1.5 py-0.5 rounded-md ${typeColors[c.type]}`}>{typeLabels[c.type]}</span>
                      {c.budget ? <span className="text-xs text-green-700 font-medium">{(c.budget/1000).toFixed(0)}K</span> : null}
                    </div>
                  </div>
                ))}
                {cols.length > 8 && <p className="text-xs text-center text-gray-400">+{cols.length-8} أخرى</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Support Tickets ─────────────────────────────────────────────────────────
function TicketsTab() {
  const { supportTickets, customers, users, addSupportTicket, updateSupportTicket, deleteSupportTicket, currentUser } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<SupportTicket | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const employees = users.filter(u => u.role === 'employee' || u.role === 'admin');

  const emptyTicket = {
    customerId: '', title: '', description: '', category: 'inquiry',
    priority: 'medium', status: 'open', assignedTo: currentUser?.id ?? '',
    resolution: '', channel: 'phone'
  };
  const [form, setForm] = useState(emptyTicket);

  const filtered = filterStatus === 'all' ? supportTickets : supportTickets.filter(t => t.status === filterStatus);
  const sorted = [...filtered].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const openEdit = (t: SupportTicket) => {
    setEditing(t);
    setForm({ customerId: t.customerId ?? '', title: t.title, description: t.description,
      category: t.category, priority: t.priority, status: t.status,
      assignedTo: t.assignedTo ?? '', resolution: t.resolution ?? '', channel: t.channel });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date().toISOString();
    if (editing) {
      updateSupportTicket(editing.id, {
        ...form,
        category: form.category as SupportTicket['category'],
        priority: form.priority as SupportTicket['priority'],
        status: form.status as SupportTicket['status'],
        channel: form.channel as SupportTicket['channel'],
        updatedAt: now,
        resolvedAt: (form.status === 'resolved' || form.status === 'closed') && !editing.resolvedAt ? now : editing.resolvedAt,
      });
    } else {
      addSupportTicket({
        ...form, id: generateId(),
        ticketNumber: `TKT-${Date.now().toString().slice(-6)}`,
        category: form.category as SupportTicket['category'],
        priority: form.priority as SupportTicket['priority'],
        status: form.status as SupportTicket['status'],
        channel: form.channel as SupportTicket['channel'],
        customerId: form.customerId || undefined,
        assignedTo: form.assignedTo || undefined,
        resolution: form.resolution || undefined,
        createdAt: now, updatedAt: now,
      });
    }
    setShowForm(false);
    setEditing(null);
    setForm(emptyTicket);
  };

  const kpis = {
    open: supportTickets.filter(t => t.status === 'open').length,
    inProgress: supportTickets.filter(t => t.status === 'in_progress').length,
    resolved: supportTickets.filter(t => t.status === 'resolved' || t.status === 'closed').length,
    urgent: supportTickets.filter(t => t.priority === 'urgent' && t.status !== 'closed').length,
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="مفتوحة" value={kpis.open} icon={<Ticket className="w-5 h-5 text-red-600" />} color="bg-red-100" />
        <KpiCard label="جارية" value={kpis.inProgress} icon={<RefreshCw className="w-5 h-5 text-blue-600" />} color="bg-blue-100" />
        <KpiCard label="محلولة" value={kpis.resolved} icon={<CheckCircle className="w-5 h-5 text-green-600" />} color="bg-green-100" />
        <KpiCard label="عاجلة" value={kpis.urgent} icon={<AlertCircle className="w-5 h-5 text-orange-600" />} color="bg-orange-100" />
      </div>

      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex gap-2 flex-wrap">
          {['all', 'open', 'in_progress', 'pending_customer', 'resolved', 'closed'].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${filterStatus===s?'bg-yellow-500 text-white shadow':'bg-white border text-gray-600 hover:bg-gray-50'}`}>
              {s === 'all' ? 'الكل' : ticketStatusLabels[s]}
            </button>
          ))}
        </div>
        <button className="btn-primary text-sm flex items-center gap-2" onClick={() => { setEditing(null); setForm(emptyTicket); setShowForm(true); }}>
          <Plus className="w-4 h-4" /> تذكرة جديدة
        </button>
      </div>

      <div className="space-y-3">
        {sorted.length === 0 ? (
          <div className="card text-center py-10 text-gray-400">
            <Ticket className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p>لا توجد تذاكر</p>
          </div>
        ) : sorted.map(t => {
          const customer = customers.find(c => c.id === t.customerId);
          const assignee = users.find(u => u.id === t.assignedTo);
          const priorityColor = { low: 'bg-gray-100 text-gray-600', medium: 'bg-yellow-100 text-yellow-700', high: 'bg-orange-100 text-orange-700', urgent: 'bg-red-100 text-red-700' }[t.priority];
          return (
            <div key={t.id} className={`card ${t.priority === 'urgent' ? 'border-l-4 border-red-500' : ''}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-gray-400 font-mono">#{t.ticketNumber}</span>
                    <p className="font-bold text-gray-800">{t.title}</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{t.description.slice(0, 100)}{t.description.length > 100 ? '...' : ''}</p>
                  <div className="flex items-center gap-3 mt-2 flex-wrap text-xs text-gray-500">
                    <span>{ticketCategoryLabels[t.category]}</span>
                    <span>{ticketChannelLabels[t.channel]}</span>
                    {customer && <span className="flex items-center gap-1"><User className="w-3 h-3" />{customer.name}</span>}
                    {assignee && <span className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full"><User className="w-3 h-3" />{assignee.name}</span>}
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(t.createdAt).toLocaleDateString('ar-SA')}</span>
                  </div>
                  {t.resolution && (
                    <div className="mt-2 bg-green-50 rounded-lg px-3 py-1.5 text-xs text-green-800">
                      <span className="font-semibold">الحل: </span>{t.resolution}
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${ticketStatusColors[t.status]}`}>{ticketStatusLabels[t.status]}</span>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${priorityColor}`}>{t.priority === 'urgent' ? 'عاجل' : t.priority === 'high' ? 'عالية' : t.priority === 'medium' ? 'متوسطة' : 'منخفضة'}</span>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(t)} className="btn-secondary text-xs py-1 px-2.5 flex items-center gap-1">
                      <Edit className="w-3 h-3" />
                    </button>
                    <button onClick={() => deleteSupportTicket(t.id)} className="text-xs py-1 px-2.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl my-auto">
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Ticket className="w-5 h-5 text-yellow-500" />
              {editing ? 'تعديل التذكرة' : 'تذكرة دعم جديدة'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="label">العميل (اختياري)</label>
                <select className="input-field" value={form.customerId} onChange={e => setForm({ ...form, customerId: e.target.value })}>
                  <option value="">-- بدون عميل --</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name} - {c.phone}</option>)}
                </select>
              </div>
              <div>
                <label className="label">عنوان الطلب *</label>
                <input className="input-field" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div>
                <label className="label">التفاصيل *</label>
                <textarea className="input-field" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">الفئة</label>
                  <select className="input-field" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                    {Object.entries(ticketCategoryLabels).map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">القناة</label>
                  <select className="input-field" value={form.channel} onChange={e => setForm({ ...form, channel: e.target.value })}>
                    {Object.entries(ticketChannelLabels).map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">الأولوية</label>
                  <select className="input-field" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                    <option value="low">منخفضة</option>
                    <option value="medium">متوسطة</option>
                    <option value="high">عالية</option>
                    <option value="urgent">عاجل</option>
                  </select>
                </div>
                <div>
                  <label className="label">الحالة</label>
                  <select className="input-field" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                    {Object.entries(ticketStatusLabels).map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="label">المسؤول</label>
                <select className="input-field" value={form.assignedTo} onChange={e => setForm({ ...form, assignedTo: e.target.value })}>
                  <option value="">-- غير محدد --</option>
                  {employees.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
              {(form.status === 'resolved' || form.status === 'closed') && (
                <div>
                  <label className="label">الحل / الإجراء المتخذ</label>
                  <textarea className="input-field" rows={2} value={form.resolution} onChange={e => setForm({ ...form, resolution: e.target.value })} placeholder="وصف الحل المقدم..." />
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary flex-1">{editing ? 'حفظ' : 'إنشاء التذكرة'}</button>
                <button type="button" className="btn-secondary flex-1" onClick={() => { setShowForm(false); setEditing(null); }}>إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main CRM Page ───────────────────────────────────────────────────────────
const emptyCustomer = {
  name: '', phone: '', email: '', nationalId: '', nationality: '', city: '',
  type: 'tenant', source: 'phone', status: 'new', assignedTo: '',
  notes: '', budget: 0, preferredArea: '', preferredType: '',
  rating: 0, nextFollowUp: '', tags: ''
};

export default function CRMPage() {
  const { customers, interactions, users, addCustomer, updateCustomer, deleteCustomer,
    addInteraction, currentUser } = useStore();

  const [activeTab, setActiveTab] = useState<'overview' | 'list' | 'pipeline' | 'interactions' | 'tickets'>('overview');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [showInteractionForm, setShowInteractionForm] = useState(false);
  const [profileCustomer, setProfileCustomer] = useState<Customer | null>(null);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [form, setForm] = useState(emptyCustomer);
  const [iForm, setIForm] = useState({ customerId: '', type: 'call', summary: '', outcome: '' });

  const threeDaysFromNow = useMemo(() => new Date(Date.now() + 86400000 * 3), []);

  const employees = users.filter(u => u.role === 'employee' || u.role === 'broker');
  const myCustomers = currentUser?.role === 'broker'
    ? customers.filter(c => c.assignedTo === currentUser.id)
    : customers;

  const filtered = useMemo(() => myCustomers
    .filter(c => {
      if (filterStatus !== 'all' && c.status !== filterStatus) return false;
      if (filterType !== 'all' && c.type !== filterType) return false;
      if (search) {
        const q = search.toLowerCase();
        return c.name.toLowerCase().includes(q) || c.phone.includes(q) || (c.email ?? '').toLowerCase().includes(q) || (c.city ?? '').includes(q);
      }
      return true;
    }), [myCustomers, filterStatus, filterType, search]);

  const kpis = useMemo(() => ({
    total: myCustomers.length,
    new: myCustomers.filter(c => c.status === 'new').length,
    negotiating: myCustomers.filter(c => c.status === 'negotiating').length,
    closed: myCustomers.filter(c => c.status === 'closed').length,
    totalInteractions: interactions.length,
    followUps: myCustomers.filter(c => c.nextFollowUp && new Date(c.nextFollowUp) <= threeDaysFromNow).length,
  }), [myCustomers, interactions, threeDaysFromNow]);

  const sourceDistribution = useMemo(() => {
    const d: Record<string, number> = {};
    myCustomers.forEach(c => { d[c.source] = (d[c.source] || 0) + 1; });
    return Object.entries(d).sort((a,b) => b[1]-a[1]);
  }, [myCustomers]);

  const recentInteractions = useMemo(() =>
    [...interactions].sort((a,b) => new Date(b.createdAt).getTime()-new Date(a.createdAt).getTime()).slice(0, 10),
    [interactions]);

  const openEdit = (c: Customer) => {
    setEditing(c);
    setForm({
      name: c.name, phone: c.phone, email: c.email ?? '', nationalId: c.nationalId ?? '',
      nationality: c.nationality ?? '', city: c.city ?? '', type: c.type, source: c.source,
      status: c.status, assignedTo: c.assignedTo ?? '', notes: c.notes ?? '',
      budget: c.budget ?? 0, preferredArea: c.preferredArea ?? '', preferredType: c.preferredType ?? '',
      rating: c.rating ?? 0, nextFollowUp: c.nextFollowUp ?? '', tags: (c.tags ?? []).join(', ')
    });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...form,
      type: form.type as Customer['type'],
      source: form.source as Customer['source'],
      status: form.status as Customer['status'],
      budget: form.budget || undefined,
      assignedTo: form.assignedTo || undefined,
      email: form.email || undefined,
      nationalId: form.nationalId || undefined,
      nationality: form.nationality || undefined,
      city: form.city || undefined,
      preferredArea: form.preferredArea || undefined,
      preferredType: form.preferredType || undefined,
      rating: form.rating || undefined,
      nextFollowUp: form.nextFollowUp || undefined,
      notes: form.notes || undefined,
      tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : undefined,
    };
    if (editing) {
      updateCustomer(editing.id, data);
    } else {
      addCustomer({ ...data, id: generateId(), createdAt: new Date().toISOString() });
    }
    setShowForm(false);
    setEditing(null);
    setForm(emptyCustomer);
  };

  const handleAddInteraction = (customerId: string) => {
    setIForm({ customerId, type: 'call', summary: '', outcome: '' });
    setShowInteractionForm(true);
  };

  const submitInteraction = (e: React.FormEvent) => {
    e.preventDefault();
    addInteraction({
      ...iForm,
      type: iForm.type as Interaction['type'],
      id: generateId(),
      employeeId: currentUser?.id ?? '',
      createdAt: new Date().toISOString()
    });
    updateCustomer(iForm.customerId, { lastContact: new Date().toISOString() });
    setShowInteractionForm(false);
  };

  const tabs = [
    { id: 'overview', label: 'نظرة عامة', icon: <BarChart2 className="w-4 h-4" /> },
    { id: 'list', label: 'العملاء', icon: <Users className="w-4 h-4" /> },
    { id: 'pipeline', label: 'خط الفرص', icon: <Target className="w-4 h-4" /> },
    { id: 'interactions', label: 'سجل التواصل', icon: <MessageCircle className="w-4 h-4" /> },
    { id: 'tickets', label: 'الدعم والشكاوى', icon: <Headphones className="w-4 h-4" /> },
  ] as const;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="section-title flex items-center gap-2">
            <Headphones className="w-6 h-6 text-yellow-500" /> إدارة العملاء وخدمة الدعم
          </h1>
          <p className="section-subtitle">{myCustomers.length} عميل • {interactions.length} تفاعل مسجل</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary flex items-center gap-2 text-sm" onClick={() => { setShowInteractionForm(true); setIForm({ customerId: customers[0]?.id ?? '', type: 'call', summary: '', outcome: '' }); }}>
            <PhoneCall className="w-4 h-4" /> تسجيل تواصل
          </button>
          <button className="btn-primary flex items-center gap-2 text-sm" onClick={() => { setEditing(null); setForm(emptyCustomer); setShowForm(true); }}>
            <Plus className="w-4 h-4" /> عميل جديد
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-2xl p-1 overflow-x-auto">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${activeTab===t.id?'bg-white shadow text-yellow-700':'text-gray-600 hover:text-gray-800'}`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <KpiCard label="إجمالي العملاء" value={kpis.total} icon={<Users className="w-5 h-5 text-blue-600" />} color="bg-blue-100" />
            <KpiCard label="جدد" value={kpis.new} icon={<Plus className="w-5 h-5 text-yellow-600" />} color="bg-yellow-100" />
            <KpiCard label="في التفاوض" value={kpis.negotiating} icon={<TrendingUp className="w-5 h-5 text-orange-600" />} color="bg-orange-100" />
            <KpiCard label="صفقات مكتملة" value={kpis.closed} icon={<CheckCircle className="w-5 h-5 text-green-600" />} color="bg-green-100" />
            <KpiCard label="إجمالي التواصل" value={kpis.totalInteractions} icon={<MessageCircle className="w-5 h-5 text-purple-600" />} color="bg-purple-100" />
            <KpiCard label="متابعات قريبة" value={kpis.followUps} icon={<Bell className="w-5 h-5 text-red-600" />} color="bg-red-100" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="card">
              <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-yellow-500" /> مصادر العملاء
              </h3>
              <div className="space-y-2.5">
                {sourceDistribution.map(([src, cnt]) => (
                  <div key={src} className="flex items-center gap-3">
                    <span className="text-xs w-20 text-gray-600 shrink-0">{sourceLabels[src]}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
                      <div className="h-2.5 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500"
                        style={{ width: `${myCustomers.length ? (cnt/myCustomers.length)*100 : 0}%` }} />
                    </div>
                    <span className="text-xs font-semibold text-gray-700 w-6 text-right shrink-0">{cnt}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="card">
              <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-yellow-500" /> آخر التواصل
              </h3>
              <div className="space-y-2 max-h-52 overflow-y-auto">
                {recentInteractions.map(i => {
                  const cust = customers.find(c => c.id === i.customerId);
                  return (
                    <div key={i.id} className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-xl">
                      <div className="w-7 h-7 bg-yellow-100 text-yellow-700 rounded-lg flex items-center justify-center shrink-0">
                        {interactionIcons[i.type]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-700 truncate">{cust?.name ?? 'عميل غير معروف'}</p>
                        <p className="text-xs text-gray-500 truncate">{i.summary}</p>
                      </div>
                      <span className="text-xs text-gray-400 shrink-0">{new Date(i.createdAt).toLocaleDateString('ar-SA')}</span>
                    </div>
                  );
                })}
                {recentInteractions.length === 0 && <p className="text-xs text-gray-400 text-center py-4">لا يوجد سجل تواصل</p>}
              </div>
            </div>
          </div>

          {/* Follow up reminders */}
          {kpis.followUps > 0 && (
            <div className="card border-l-4 border-orange-400">
              <h3 className="font-bold text-orange-700 mb-3 flex items-center gap-2">
                <Bell className="w-4 h-4" /> متابعات مستحقة خلال 3 أيام
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {myCustomers.filter(c => c.nextFollowUp && new Date(c.nextFollowUp) <= threeDaysFromNow).map(c => (
                  <div key={c.id} onClick={() => setProfileCustomer(c)}
                    className="flex items-center gap-3 p-2.5 bg-orange-50 rounded-xl cursor-pointer hover:bg-orange-100">
                    <div className="w-8 h-8 bg-orange-200 rounded-xl flex items-center justify-center text-sm font-bold text-orange-700">{c.name.charAt(0)}</div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{c.name}</p>
                      <p className="text-xs text-orange-700">{new Date(c.nextFollowUp!).toLocaleDateString('ar-SA')}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-orange-400 mr-auto" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* List Tab */}
      {activeTab === 'list' && (
        <div className="space-y-4">
          <div className="flex gap-3 flex-wrap">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input className="input-field pr-9" placeholder="بحث بالاسم، الهاتف، البريد، المدينة..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="input-field w-36" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="all">كل الحالات</option>
              {Object.entries(statusLabels).map(([v,l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            <select className="input-field w-36" value={filterType} onChange={e => setFilterType(e.target.value)}>
              <option value="all">كل الأنواع</option>
              {Object.entries(typeLabels).map(([v,l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <p className="text-xs text-gray-400">{filtered.length} نتيجة</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filtered.map(c => {
              const assignee = users.find(u => u.id === c.assignedTo);
              const cInteractions = interactions.filter(i => i.customerId === c.id).length;
              return (
                <div key={c.id} className="card hover:shadow-md transition-all cursor-pointer" onClick={() => setProfileCustomer(c)}>
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-2xl flex items-center justify-center text-white text-lg font-bold shrink-0">
                      {c.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-gray-800">{c.name}</p>
                        {c.rating != null && c.rating > 0 && <StarRating value={c.rating} />}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
                        <Phone className="w-3 h-3" />{c.phone}
                        {c.city && <><span>•</span>{c.city}</>}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[c.status]}`}>{statusLabels[c.status]}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-md ${typeColors[c.type]}`}>{typeLabels[c.type]}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-gray-100 text-xs text-gray-500">
                    <div className="flex gap-3">
                      <span>{sourceLabels[c.source]}</span>
                      <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" />{cInteractions} تواصل</span>
                      {c.budget ? <span>{(c.budget/1000).toFixed(0)}K ر.س</span> : null}
                      {assignee && <span className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full"><User className="w-3 h-3" />{assignee.name}</span>}
                    </div>
                    <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                      <button onClick={() => openEdit(c)} className="btn-secondary text-xs py-1 px-2">
                        <Edit className="w-3 h-3" />
                      </button>
                      <button onClick={() => { if(confirm('حذف العميل؟')) deleteCustomer(c.id); }}
                        className="text-xs py-1 px-2 rounded-lg border border-red-200 text-red-500 hover:bg-red-50">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div className="col-span-2 card text-center py-12 text-gray-400">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>لا توجد نتائج</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pipeline Tab */}
      {activeTab === 'pipeline' && (
        <div>
          <p className="text-xs text-gray-500 mb-4">عرض المسار البيعي — اضغط على العميل لعرض الملف الكامل</p>
          <PipelineBoard customers={filtered} onSelectCustomer={setProfileCustomer} />
        </div>
      )}

      {/* Interactions Tab */}
      {activeTab === 'interactions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <p className="text-sm text-gray-600">{interactions.length} تفاعل مسجل</p>
            <button className="btn-primary text-sm flex items-center gap-2"
              onClick={() => { setIForm({ customerId: customers[0]?.id ?? '', type: 'call', summary: '', outcome: '' }); setShowInteractionForm(true); }}>
              <Plus className="w-4 h-4" /> تسجيل تواصل
            </button>
          </div>
          <div className="space-y-2">
            {[...interactions].sort((a,b) => new Date(b.createdAt).getTime()-new Date(a.createdAt).getTime()).map(i => {
              const cust = customers.find(c => c.id === i.customerId);
              const emp = users.find(u => u.id === i.employeeId);
              return (
                <div key={i.id} className="card flex items-start gap-3">
                  <div className="w-9 h-9 bg-yellow-100 text-yellow-700 rounded-xl flex items-center justify-center shrink-0">
                    {interactionIcons[i.type]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <p className="font-semibold text-sm text-gray-800">{cust?.name ?? '—'}</p>
                      <span className="text-xs text-gray-400">{new Date(i.createdAt).toLocaleDateString('ar-SA', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' })}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-md">{interactionLabels[i.type]}</span>
                      {emp && <span>{emp.name}</span>}
                    </div>
                    <p className="text-sm text-gray-700 mt-1">{i.summary}</p>
                    {i.outcome && <p className="text-xs text-green-700 mt-0.5 bg-green-50 px-2 py-1 rounded-lg">النتيجة: {i.outcome}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tickets Tab */}
      {activeTab === 'tickets' && <TicketsTab />}

      {/* Customer Profile Modal */}
      {profileCustomer && (
        <CustomerProfile
          customer={profileCustomer}
          onClose={() => setProfileCustomer(null)}
          onAddInteraction={(cid) => { handleAddInteraction(cid); setProfileCustomer(null); }}
        />
      )}

      {/* Customer Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl my-auto">
            <h2 className="font-bold text-lg mb-5 flex items-center gap-2">
              <User className="w-5 h-5 text-yellow-500" />
              {editing ? 'تعديل بيانات العميل' : 'إضافة عميل جديد'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="label">اسم العميل *</label>
                  <input className="input-field" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
                </div>
                <div>
                  <label className="label">رقم الجوال *</label>
                  <input className="input-field" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} required />
                </div>
                <div>
                  <label className="label">البريد الإلكتروني</label>
                  <input type="email" className="input-field" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                </div>
                <div>
                  <label className="label">رقم الهوية</label>
                  <input className="input-field" value={form.nationalId} onChange={e => setForm({...form, nationalId: e.target.value})} />
                </div>
                <div>
                  <label className="label">المدينة</label>
                  <input className="input-field" value={form.city} onChange={e => setForm({...form, city: e.target.value})} />
                </div>
                <div>
                  <label className="label">نوع العميل</label>
                  <select className="input-field" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                    {Object.entries(typeLabels).map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">مصدر العميل</label>
                  <select className="input-field" value={form.source} onChange={e => setForm({...form, source: e.target.value})}>
                    {Object.entries(sourceLabels).map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">الحالة</label>
                  <select className="input-field" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                    {Object.entries(statusLabels).map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">المسؤول عنه</label>
                  <select className="input-field" value={form.assignedTo} onChange={e => setForm({...form, assignedTo: e.target.value})}>
                    <option value="">-- غير محدد --</option>
                    {employees.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">الميزانية ر.س</label>
                  <input type="number" min="0" className="input-field" value={form.budget || ''} onChange={e => setForm({...form, budget: +e.target.value})} />
                </div>
                <div>
                  <label className="label">تاريخ المتابعة</label>
                  <input type="date" className="input-field" value={form.nextFollowUp} onChange={e => setForm({...form, nextFollowUp: e.target.value})} />
                </div>
                <div>
                  <label className="label">المنطقة المفضلة</label>
                  <input className="input-field" value={form.preferredArea} onChange={e => setForm({...form, preferredArea: e.target.value})} />
                </div>
                <div>
                  <label className="label">نوع العقار المفضل</label>
                  <input className="input-field" value={form.preferredType} onChange={e => setForm({...form, preferredType: e.target.value})} placeholder="شقة، فيلا، محل..." />
                </div>
                <div className="col-span-2">
                  <label className="label">الوسوم (مفصولة بفاصلة)</label>
                  <input className="input-field" value={form.tags} onChange={e => setForm({...form, tags: e.target.value})} placeholder="VIP, مهتم بالشمال, ..." />
                </div>
                <div className="col-span-2">
                  <label className="label">ملاحظات</label>
                  <textarea className="input-field" rows={2} value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} />
                </div>
                <div className="col-span-2">
                  <label className="label flex items-center gap-1"><Star className="w-3.5 h-3.5 text-yellow-500" /> التقييم</label>
                  <StarRating value={form.rating} onChange={v => setForm({...form, rating: v})} />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary flex-1">{editing ? 'حفظ' : 'إضافة'}</button>
                <button type="button" className="btn-secondary flex-1" onClick={() => { setShowForm(false); setEditing(null); }}>إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Interaction Form */}
      {showInteractionForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-yellow-500" /> تسجيل تواصل
            </h2>
            <form onSubmit={submitInteraction} className="space-y-3">
              <div>
                <label className="label">العميل *</label>
                <select className="input-field" value={iForm.customerId} onChange={e => setIForm({...iForm, customerId: e.target.value})} required>
                  <option value="">-- اختر العميل --</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name} - {c.phone}</option>)}
                </select>
              </div>
              <div>
                <label className="label">نوع التواصل</label>
                <select className="input-field" value={iForm.type} onChange={e => setIForm({...iForm, type: e.target.value})}>
                  {Object.entries(interactionLabels).map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="label">ملخص التواصل *</label>
                <textarea className="input-field" rows={3} value={iForm.summary} onChange={e => setIForm({...iForm, summary: e.target.value})} required placeholder="ما الذي تم التواصل بشأنه؟" />
              </div>
              <div>
                <label className="label">النتيجة / الخطوة التالية</label>
                <input className="input-field" value={iForm.outcome} onChange={e => setIForm({...iForm, outcome: e.target.value})} placeholder="اتفقنا على موعد، سيتواصل لاحقاً..." />
              </div>
              <div className="flex gap-3">
                <button type="submit" className="btn-primary flex-1">حفظ</button>
                <button type="button" className="btn-secondary flex-1" onClick={() => setShowInteractionForm(false)}>إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
