import { useState, useMemo } from 'react';
import { useStore, generateId } from '../../data/store';
import {
  Megaphone, Plus, Eye, MessageCircle, ExternalLink, Trash2, Edit,
  TrendingUp, Star, BarChart2, Calendar, Clock, CheckCircle, User, Building2, DollarSign, Target, Zap,
  Play, Pause, Search, Copy, Home, Tag
} from 'lucide-react';
import type { MarketingListing, MarketingCampaign, Appointment } from '../../types';

// ─── Label Maps ──────────────────────────────────────────────────────────────
const platformLabels: Record<string, string> = {
  whatsapp: 'واتساب', sms: 'رسائل نصية', social: 'سوشيال ميديا',
  email: 'بريد إلكتروني', website: 'الموقع', other: 'أخرى'
};
const platformColors: Record<string, string> = {
  whatsapp: 'bg-green-100 text-green-700', sms: 'bg-blue-100 text-blue-700',
  social: 'bg-purple-100 text-purple-700', email: 'bg-indigo-100 text-indigo-700',
  website: 'bg-yellow-100 text-yellow-800', other: 'bg-gray-100 text-gray-600'
};
const campaignStatusLabels: Record<string, string> = {
  draft: 'مسودة', active: 'نشطة', paused: 'موقوفة', completed: 'منتهية'
};
const campaignStatusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600', active: 'bg-green-100 text-green-700',
  paused: 'bg-yellow-100 text-yellow-800', completed: 'bg-blue-100 text-blue-700'
};
const apptTypeLabels: Record<string, string> = {
  viewing: 'زيارة عقار', handover: 'تسليم/استلام', maintenance: 'صيانة',
  contract: 'توقيع عقد', other: 'أخرى'
};
const apptStatusLabels: Record<string, string> = {
  scheduled: 'مجدول', confirmed: 'مؤكد', completed: 'مكتمل',
  cancelled: 'ملغي', no_show: 'لم يحضر'
};
const apptStatusColors: Record<string, string> = {
  scheduled: 'bg-yellow-100 text-yellow-800', confirmed: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700', cancelled: 'bg-gray-100 text-gray-500',
  no_show: 'bg-red-100 text-red-700'
};
const amenitiesList = [
  'مصعد', 'موقف سيارة', 'حديقة', 'مسبح', 'أمن ٢٤ ساعة', 'نادي رياضي',
  'غرفة خادمة', 'مكيفات', 'كاميرات', 'مستودع', 'شرفة', 'تشطيب فاخر'
];

// ─── KPI Card ────────────────────────────────────────────────────────────────
function KpiCard({ label, value, icon, color, sub }: {
  label: string; value: string | number; icon: React.ReactNode; color: string; sub?: string;
}) {
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

// ─── Listing Card ─────────────────────────────────────────────────────────────
function ListingCard({
  l, onEdit, onDelete, onShare, onWhatsApp, onCopyLink, canManage, unitLabel, propLabel
}: {
  l: MarketingListing; onEdit: () => void; onDelete: () => void;
  onShare: () => void; onWhatsApp: () => void; onCopyLink: () => void;
  canManage: boolean; unitLabel: string; propLabel: string;
}) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => { onCopyLink(); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <div className={`card hover:shadow-lg transition-all ${l.featured ? 'ring-2 ring-yellow-400' : ''} ${!l.isActive ? 'opacity-60' : ''}`}>
      {l.featured && (
        <div className="flex items-center gap-1 text-yellow-600 text-xs font-bold mb-2">
          <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" /> مميز
        </div>
      )}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {l.listingNumber && <span className="text-xs text-gray-400 font-mono">#{l.listingNumber}</span>}
            <h3 className="font-bold text-gray-800">{l.title}</h3>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">{propLabel} • {unitLabel}</p>
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{l.description}</p>
          {l.amenities && l.amenities.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {l.amenities.slice(0, 4).map(a => (
                <span key={a} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{a}</span>
              ))}
              {l.amenities.length > 4 && <span className="text-xs text-gray-400">+{l.amenities.length - 4}</span>}
            </div>
          )}
        </div>
        <div className="shrink-0 text-right">
          <p className="text-lg font-bold text-yellow-600">{l.price.toLocaleString()}</p>
          <p className="text-xs text-gray-500">ر.س {l.priceUnit === 'yearly' ? '/سنة' : l.priceUnit === 'monthly' ? '/شهر' : ''}</p>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium mt-1 inline-block ${l.type === 'rent' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
            {l.type === 'rent' ? 'إيجار' : 'بيع'}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
        <div className="flex gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{l.views} مشاهدة</span>
          <span className="flex items-center gap-1"><MessageCircle className="w-3.5 h-3.5" />{l.inquiries} استفسار</span>
          {l.commissionRate != null && l.commissionRate > 0 && (
            <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" />عمولة {l.commissionRate}%</span>
          )}
          <span className={`px-2 py-0.5 rounded-full ${l.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
            {l.isActive ? 'نشط' : 'غير نشط'}
          </span>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          <button onClick={onWhatsApp} title="مشاركة واتساب" className="w-8 h-8 flex items-center justify-center rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition-colors">
            <MessageCircle className="w-3.5 h-3.5" />
          </button>
          <button onClick={handleCopy} title="نسخ الرابط" className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${copied ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button onClick={onShare} title="فتح الرابط" className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors">
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
          {canManage && (
            <>
              <button onClick={onEdit} className="btn-secondary text-xs py-1 px-2.5 flex items-center gap-1">
                <Edit className="w-3 h-3" />
              </button>
              <button onClick={onDelete} className="text-xs py-1 px-2.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50">
                <Trash2 className="w-3 h-3" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Appointments Tab ────────────────────────────────────────────────────────
function AppointmentsTab() {
  const { appointments, customers, properties, users, addAppointment, updateAppointment, currentUser } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  const employees = users.filter(u => ['employee', 'broker', 'admin'].includes(u.role));
  const myAppointments = currentUser?.role === 'tenant'
    ? appointments.filter(a => a.customerId === currentUser.id)
    : currentUser?.role === 'broker' || currentUser?.role === 'employee'
    ? appointments.filter(a => a.employeeId === currentUser.id)
    : appointments;

  const filtered = myAppointments
    .filter(a => filterStatus === 'all' || a.status === filterStatus)
    .filter(a => filterType === 'all' || a.type === filterType);
  const sorted = [...filtered].sort((a, b) => `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`));

  const today = new Date().toISOString().slice(0, 10);
  const todayAppts = myAppointments.filter(a => a.date === today);
  const upcoming = myAppointments.filter(a => a.date > today && a.status !== 'cancelled');

  const emptyForm = {
    customerId: customers[0]?.id || '', propertyId: '', unitId: '',
    employeeId: currentUser?.id || employees[0]?.id || '',
    date: '', time: '', duration: 60, type: 'viewing', status: 'scheduled', notes: '', result: ''
  };
  const [form, setForm] = useState(emptyForm);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addAppointment({
      ...form,
      type: form.type as Appointment['type'],
      status: form.status as Appointment['status'],
      id: generateId(),
      createdAt: new Date().toISOString()
    });
    setShowForm(false);
    setForm(emptyForm);
  };

  // Calendar grid (current month)
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).getDay();
  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => {
    const d = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`;
    return { day: i + 1, date: d, appts: myAppointments.filter(a => a.date === d) };
  });

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="مواعيد اليوم" value={todayAppts.length} icon={<Calendar className="w-5 h-5 text-yellow-600" />} color="bg-yellow-100" />
        <KpiCard label="قادمة" value={upcoming.length} icon={<Clock className="w-5 h-5 text-blue-600" />} color="bg-blue-100" />
        <KpiCard label="مكتملة" value={myAppointments.filter(a=>a.status==='completed').length} icon={<CheckCircle className="w-5 h-5 text-green-600" />} color="bg-green-100" />
        <KpiCard label="زيارات عقار" value={myAppointments.filter(a=>a.type==='viewing').length} icon={<Home className="w-5 h-5 text-purple-600" />} color="bg-purple-100" />
      </div>

      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex gap-2 flex-wrap">
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
            <button onClick={() => setViewMode('list')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${viewMode==='list'?'bg-white shadow text-yellow-700':'text-gray-500'}`}>قائمة</button>
            <button onClick={() => setViewMode('calendar')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${viewMode==='calendar'?'bg-white shadow text-yellow-700':'text-gray-500'}`}>تقويم</button>
          </div>
          <select className="input-field text-sm w-36" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="all">كل الحالات</option>
            {Object.entries(apptStatusLabels).map(([v,l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          <select className="input-field text-sm w-36" value={filterType} onChange={e => setFilterType(e.target.value)}>
            <option value="all">كل الأنواع</option>
            {Object.entries(apptTypeLabels).map(([v,l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        {currentUser?.role !== 'tenant' && (
          <button className="btn-primary text-sm flex items-center gap-2" onClick={() => { setForm(emptyForm); setShowForm(true); }}>
            <Plus className="w-4 h-4" /> موعد جديد
          </button>
        )}
      </div>

      {viewMode === 'calendar' ? (
        <div className="card">
          <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-yellow-500" />
            {now.toLocaleDateString('ar-SA', { month: 'long', year: 'numeric' })}
          </h3>
          <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 mb-2">
            {['أح','إث','ثل','أر','خم','جم','سب'].map(d => <div key={d} className="py-1 font-medium">{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({length: firstDay}, (_, i) => <div key={`e${i}`} />)}
            {calendarDays.map(({ day, date, appts }) => (
              <div key={day}
                className={`min-h-[52px] p-1 rounded-xl text-xs border transition-colors cursor-default
                  ${date === today ? 'bg-yellow-50 border-yellow-300' : 'border-gray-100 hover:bg-gray-50'}
                  ${appts.length > 0 ? 'border-blue-200' : ''}`}>
                <div className={`font-semibold mb-0.5 ${date === today ? 'text-yellow-600' : 'text-gray-700'}`}>{day}</div>
                {appts.slice(0, 2).map(a => (
                  <div key={a.id} className={`text-xs truncate px-1 py-0.5 rounded mb-0.5 ${apptStatusColors[a.status]}`}>
                    {a.time} {apptTypeLabels[a.type]?.charAt(0)}
                  </div>
                ))}
                {appts.length > 2 && <div className="text-xs text-gray-400">+{appts.length - 2}</div>}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.length === 0 ? (
            <div className="card text-center py-10 text-gray-400">
              <Calendar className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p>لا توجد مواعيد</p>
            </div>
          ) : sorted.map(a => {
            const cust = customers.find(c => c.id === a.customerId);
            const prop = properties.find(p => p.id === a.propertyId);
            const emp = users.find(u => u.id === a.employeeId);
            const isPast = a.date < today;
            return (
              <div key={a.id} className={`card ${a.date === today ? 'border-l-4 border-yellow-500' : ''}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center shrink-0 text-center
                      ${a.date === today ? 'bg-yellow-500 text-white' : isPast ? 'bg-gray-100 text-gray-500' : 'bg-blue-100 text-blue-700'}`}>
                      <span className="text-xs font-medium">{new Date(a.date+'T00:00:00').toLocaleDateString('ar-SA', {month:'short'})}</span>
                      <span className="text-lg font-bold leading-none">{new Date(a.date+'T00:00:00').getDate()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-gray-800">{apptTypeLabels[a.type]}</p>
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${apptStatusColors[a.status]}`}>{apptStatusLabels[a.status]}</span>
                      </div>
                      {cust && <p className="text-sm text-gray-600 flex items-center gap-1 mt-0.5"><User className="w-3.5 h-3.5" />{cust.name} — {cust.phone}</p>}
                      {prop && <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5"><Building2 className="w-3 h-3" />{prop.propertyName}</p>}
                      {a.notes && <p className="text-xs text-gray-400 mt-1">{a.notes}</p>}
                      {a.result && <p className="text-xs text-green-700 mt-1 bg-green-50 rounded px-2 py-1">النتيجة: {a.result}</p>}
                    </div>
                  </div>
                  <div className="shrink-0 text-right space-y-1.5">
                    <p className="text-sm font-semibold text-gray-700 flex items-center gap-1 justify-end">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />{a.time}
                    </p>
                    <p className="text-xs text-gray-400">{a.duration} دقيقة</p>
                    {emp && <p className="text-xs text-blue-600">{emp.name}</p>}
                    {a.status === 'scheduled' && (
                      <div className="flex gap-1 mt-1">
                        <button onClick={() => updateAppointment(a.id, { status: 'confirmed' })}
                          className="text-xs px-2 py-1 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200">تأكيد</button>
                        <button onClick={() => updateAppointment(a.id, { status: 'completed' })}
                          className="text-xs px-2 py-1 rounded-lg bg-green-100 text-green-700 hover:bg-green-200">مكتمل</button>
                        <button onClick={() => updateAppointment(a.id, { status: 'cancelled' })}
                          className="text-xs px-2 py-1 rounded-lg bg-red-100 text-red-700 hover:bg-red-200">إلغاء</button>
                      </div>
                    )}
                    {a.status === 'confirmed' && (
                      <button onClick={() => updateAppointment(a.id, { status: 'completed' })}
                        className="text-xs px-2 py-1 rounded-lg bg-green-100 text-green-700 hover:bg-green-200">إغلاق كمكتمل</button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl my-auto">
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-yellow-500" /> موعد جديد
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="label">العميل *</label>
                <select className="input-field" value={form.customerId} onChange={e => setForm({...form, customerId: e.target.value})} required>
                  <option value="">-- اختر العميل --</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name} - {c.phone}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">نوع الموعد</label>
                  <select className="input-field" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                    {Object.entries(apptTypeLabels).map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">الموظف المسؤول</label>
                  <select className="input-field" value={form.employeeId} onChange={e => setForm({...form, employeeId: e.target.value})}>
                    {employees.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">التاريخ *</label>
                  <input type="date" className="input-field" value={form.date} onChange={e => setForm({...form, date: e.target.value})} required />
                </div>
                <div>
                  <label className="label">الوقت *</label>
                  <input type="time" className="input-field" value={form.time} onChange={e => setForm({...form, time: e.target.value})} required />
                </div>
                <div>
                  <label className="label">المدة (دقيقة)</label>
                  <input type="number" min="15" step="15" className="input-field" value={form.duration} onChange={e => setForm({...form, duration: +e.target.value})} />
                </div>
                <div>
                  <label className="label">العقار</label>
                  <select className="input-field" value={form.propertyId} onChange={e => setForm({...form, propertyId: e.target.value})}>
                    <option value="">-- اختياري --</option>
                    {useStore.getState().properties.slice(0, 50).map(p => <option key={p.id} value={p.id}>{p.propertyName}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="label">ملاحظات</label>
                <textarea className="input-field" rows={2} value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary flex-1">حفظ الموعد</button>
                <button type="button" className="btn-secondary flex-1" onClick={() => setShowForm(false)}>إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Campaigns Tab ────────────────────────────────────────────────────────────
function CampaignsTab() {
  const { marketingCampaigns, addMarketingCampaign, updateMarketingCampaign, deleteMarketingCampaign, currentUser } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<MarketingCampaign | null>(null);

  const emptyCampaign = {
    title: '', description: '', platform: 'whatsapp', status: 'draft',
    budget: 0, spent: 0, targetAudience: '', startDate: '', endDate: '',
    impressions: 0, clicks: 0, leads: 0, conversions: 0
  };
  const [form, setForm] = useState(emptyCampaign);

  const openEdit = (c: MarketingCampaign) => {
    setEditing(c);
    setForm({ title: c.title, description: c.description ?? '', platform: c.platform,
      status: c.status, budget: c.budget ?? 0, spent: c.spent ?? 0,
      targetAudience: c.targetAudience ?? '', startDate: c.startDate ?? '',
      endDate: c.endDate ?? '', impressions: c.impressions ?? 0,
      clicks: c.clicks ?? 0, leads: c.leads ?? 0, conversions: c.conversions ?? 0 });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      updateMarketingCampaign(editing.id, { ...form, platform: form.platform as MarketingCampaign['platform'], status: form.status as MarketingCampaign['status'] });
    } else {
      addMarketingCampaign({
        ...form, id: generateId(),
        campaignNumber: `CMP-${Date.now().toString().slice(-6)}`,
        platform: form.platform as MarketingCampaign['platform'],
        status: form.status as MarketingCampaign['status'],
        createdAt: new Date().toISOString(),
        createdBy: currentUser?.id
      });
    }
    setShowForm(false);
    setEditing(null);
    setForm(emptyCampaign);
  };

  const totalBudget = marketingCampaigns.reduce((s, c) => s + (c.budget ?? 0), 0);
  const totalLeads = marketingCampaigns.reduce((s, c) => s + (c.leads ?? 0), 0);
  const active = marketingCampaigns.filter(c => c.status === 'active').length;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="إجمالي الحملات" value={marketingCampaigns.length} icon={<Megaphone className="w-5 h-5 text-yellow-600" />} color="bg-yellow-100" />
        <KpiCard label="حملات نشطة" value={active} icon={<Zap className="w-5 h-5 text-green-600" />} color="bg-green-100" />
        <KpiCard label="الميزانية الإجمالية ر.س" value={totalBudget.toLocaleString()} icon={<DollarSign className="w-5 h-5 text-blue-600" />} color="bg-blue-100" />
        <KpiCard label="إجمالي الفرص" value={totalLeads} icon={<Target className="w-5 h-5 text-purple-600" />} color="bg-purple-100" />
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">{marketingCampaigns.length} حملة إعلانية</p>
        <button className="btn-primary text-sm flex items-center gap-2" onClick={() => { setEditing(null); setForm(emptyCampaign); setShowForm(true); }}>
          <Plus className="w-4 h-4" /> حملة جديدة
        </button>
      </div>

      <div className="space-y-3">
        {marketingCampaigns.length === 0 ? (
          <div className="card text-center py-12 text-gray-400">
            <Megaphone className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p>لا توجد حملات بعد</p>
          </div>
        ) : [...marketingCampaigns].sort((a,b) => new Date(b.createdAt).getTime()-new Date(a.createdAt).getTime()).map(c => {
          const roi = c.budget && c.conversions ? ((c.conversions / c.budget) * 100).toFixed(1) : null;
          return (
            <div key={c.id} className="card">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    {c.campaignNumber && <span className="text-xs text-gray-400 font-mono">#{c.campaignNumber}</span>}
                    <h3 className="font-bold text-gray-800">{c.title}</h3>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${campaignStatusColors[c.status]}`}>{campaignStatusLabels[c.status]}</span>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${platformColors[c.platform]}`}>{platformLabels[c.platform]}</span>
                  </div>
                  {c.description && <p className="text-sm text-gray-500 mb-2">{c.description}</p>}
                  {c.targetAudience && <p className="text-xs text-gray-400">الجمهور: {c.targetAudience}</p>}
                  {(c.startDate || c.endDate) && (
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                      <Calendar className="w-3 h-3" />
                      {c.startDate && new Date(c.startDate).toLocaleDateString('ar-SA')}
                      {c.startDate && c.endDate && ' — '}
                      {c.endDate && new Date(c.endDate).toLocaleDateString('ar-SA')}
                    </p>
                  )}
                </div>
                <div className="flex gap-1.5 shrink-0">
                  {c.status === 'active' && (
                    <button onClick={() => updateMarketingCampaign(c.id, { status: 'paused' })}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-yellow-100 text-yellow-700 hover:bg-yellow-200">
                      <Pause className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {c.status === 'paused' && (
                    <button onClick={() => updateMarketingCampaign(c.id, { status: 'active' })}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-green-100 text-green-700 hover:bg-green-200">
                      <Play className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button onClick={() => openEdit(c)} className="btn-secondary text-xs py-1 px-2.5"><Edit className="w-3 h-3" /></button>
                  <button onClick={() => deleteMarketingCampaign(c.id)} className="text-xs py-1 px-2.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50"><Trash2 className="w-3 h-3" /></button>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-3 mt-4 pt-3 border-t border-gray-100">
                {[
                  { label: 'مشاهدات', value: (c.impressions??0).toLocaleString() },
                  { label: 'نقرات', value: (c.clicks??0).toLocaleString() },
                  { label: 'فرص', value: (c.leads??0).toLocaleString() },
                  { label: 'تحويل', value: c.conversions??0 },
                ].map(s => (
                  <div key={s.label} className="text-center bg-gray-50 rounded-xl py-2">
                    <p className="text-base font-bold text-gray-800">{s.value}</p>
                    <p className="text-xs text-gray-500">{s.label}</p>
                  </div>
                ))}
              </div>
              {(c.budget || 0) > 0 && (
                <div className="mt-3 flex items-center gap-3 text-xs text-gray-500">
                  <span>الميزانية: <strong>{c.budget?.toLocaleString()} ر.س</strong></span>
                  <span>المُنفق: <strong>{(c.spent ?? 0).toLocaleString()} ر.س</strong></span>
                  {roi && <span className="text-green-600 font-semibold">ROI: {roi}%</span>}
                  <div className="flex-1 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                    <div className="h-1.5 bg-yellow-500 rounded-full" style={{ width: `${c.budget ? Math.min(((c.spent??0)/c.budget)*100, 100) : 0}%` }} />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl my-auto">
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-yellow-500" />
              {editing ? 'تعديل الحملة' : 'حملة إعلانية جديدة'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="label">اسم الحملة *</label>
                <input className="input-field" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
              </div>
              <div>
                <label className="label">وصف الحملة</label>
                <textarea className="input-field" rows={2} value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">المنصة</label>
                  <select className="input-field" value={form.platform} onChange={e => setForm({...form, platform: e.target.value})}>
                    {Object.entries(platformLabels).map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">الحالة</label>
                  <select className="input-field" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                    {Object.entries(campaignStatusLabels).map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">الميزانية ر.س</label>
                  <input type="number" min="0" className="input-field" value={form.budget||''} onChange={e => setForm({...form, budget: +e.target.value})} />
                </div>
                <div>
                  <label className="label">المُنفق ر.س</label>
                  <input type="number" min="0" className="input-field" value={form.spent||''} onChange={e => setForm({...form, spent: +e.target.value})} />
                </div>
                <div>
                  <label className="label">تاريخ البداية</label>
                  <input type="date" className="input-field" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} />
                </div>
                <div>
                  <label className="label">تاريخ النهاية</label>
                  <input type="date" className="input-field" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="label">الجمهور المستهدف</label>
                <input className="input-field" value={form.targetAudience} onChange={e => setForm({...form, targetAudience: e.target.value})} placeholder="مثال: باحثون عن شقق في الرياض" />
              </div>
              <p className="text-xs font-semibold text-gray-500 mt-2">نتائج الحملة (اختياري)</p>
              <div className="grid grid-cols-4 gap-2">
                {(['impressions','clicks','leads','conversions'] as const).map(f => (
                  <div key={f}>
                    <label className="label text-xs">{{ impressions:'مشاهدات', clicks:'نقرات', leads:'فرص', conversions:'تحويل' }[f]}</label>
                    <input type="number" min="0" className="input-field" value={(form as any)[f]||''} onChange={e => setForm({...form, [f]: +e.target.value})} />
                  </div>
                ))}
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary flex-1">{editing ? 'حفظ' : 'إنشاء'}</button>
                <button type="button" className="btn-secondary flex-1" onClick={() => { setShowForm(false); setEditing(null); }}>إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Marketing Page ──────────────────────────────────────────────────────
const emptyListing = {
  unitId: '', title: '', description: '', price: 0, priceUnit: 'yearly',
  type: 'rent', brokerId: '', isActive: true, featured: false,
  commissionRate: 0, expiresAt: '', tags: '', amenities: [] as string[]
};

export default function MarketingPage() {
  const {
    marketingListings, marketingCampaigns, units, properties, users,
    addMarketingListing, updateMarketingListing, deleteMarketingListing,
    currentUser
  } = useStore();

  const [activeTab, setActiveTab] = useState<'overview' | 'listings' | 'campaigns' | 'appointments'>('overview');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<MarketingListing | null>(null);
  const [filterType, setFilterType] = useState('all');
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(emptyListing);

  const canManage = currentUser?.role === 'admin' || currentUser?.role === 'employee';
  const isBroker = currentUser?.role === 'broker';
  const brokers = users.filter(u => u.role === 'broker');
  const availableUnits = units.filter(u => u.unitStatus === 'available');

  const filteredListings = useMemo(() => marketingListings
    .filter(l => filterType === 'all' || l.type === filterType)
    .filter(l => {
      if (!search) return true;
      const q = search.toLowerCase();
      const prop = properties.find(p => p.id === l.propertyId);
      return l.title.toLowerCase().includes(q) || l.description.toLowerCase().includes(q) || (prop?.propertyName ?? '').toLowerCase().includes(q);
    }), [marketingListings, filterType, search, properties]);

  const kpis = useMemo(() => ({
    total: marketingListings.length,
    active: marketingListings.filter(l => l.isActive).length,
    totalViews: marketingListings.reduce((s,l) => s+l.views, 0),
    totalInquiries: marketingListings.reduce((s,l) => s+l.inquiries, 0),
    forRent: marketingListings.filter(l => l.type === 'rent').length,
    forSale: marketingListings.filter(l => l.type === 'sale').length,
    activeCampaigns: marketingCampaigns.filter(c => c.status === 'active').length,
  }), [marketingListings, marketingCampaigns]);

  const openEdit = (l: MarketingListing) => {
    setEditing(l);
    setForm({ unitId: l.unitId, title: l.title, description: l.description,
      price: l.price, priceUnit: l.priceUnit ?? 'yearly', type: l.type,
      brokerId: l.brokerId ?? '', isActive: l.isActive, featured: l.featured ?? false,
      commissionRate: l.commissionRate ?? 0, expiresAt: l.expiresAt ?? '',
      tags: (l.tags ?? []).join(', '), amenities: l.amenities ?? [] });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const unit = units.find(u => u.id === form.unitId);
    const data = {
      ...form,
      type: form.type as 'rent' | 'sale',
      priceUnit: form.priceUnit as MarketingListing['priceUnit'],
      brokerId: form.brokerId || undefined,
      commissionRate: form.commissionRate || undefined,
      expiresAt: form.expiresAt || undefined,
      tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : undefined,
    };
    if (editing) {
      updateMarketingListing(editing.id, data);
    } else {
      addMarketingListing({
        ...data,
        id: generateId(),
        listingNumber: `LST-${Date.now().toString().slice(-6)}`,
        propertyId: unit?.propertyId ?? '',
        views: 0, inquiries: 0,
        shareLink: `https://ramzabdae.com/listing/${generateId()}`,
        createdAt: new Date().toISOString()
      });
    }
    setShowForm(false);
    setEditing(null);
    setForm(emptyListing);
  };

  const tabs = [
    { id: 'overview', label: 'نظرة عامة', icon: <BarChart2 className="w-4 h-4" /> },
    { id: 'listings', label: 'العروض العقارية', icon: <Home className="w-4 h-4" /> },
    { id: 'campaigns', label: 'الحملات الإعلانية', icon: <Megaphone className="w-4 h-4" /> },
    { id: 'appointments', label: 'المواعيد والزيارات', icon: <Calendar className="w-4 h-4" /> },
  ] as const;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="section-title flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-yellow-500" /> التسويق العقاري
          </h1>
          <p className="section-subtitle">{kpis.active} عرض نشط • {kpis.totalViews.toLocaleString()} مشاهدة • {kpis.activeCampaigns} حملة نشطة</p>
        </div>
        {(canManage || isBroker) && (
          <button className="btn-primary flex items-center gap-2 text-sm" onClick={() => { setEditing(null); setForm(emptyListing); setShowForm(true); }}>
            <Plus className="w-4 h-4" /> عرض عقاري جديد
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-2xl p-1 overflow-x-auto">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${activeTab===t.id?'bg-white shadow text-yellow-700':'text-gray-600 hover:text-gray-800'}`}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            <KpiCard label="إجمالي العروض" value={kpis.total} icon={<Home className="w-5 h-5 text-blue-600" />} color="bg-blue-100" />
            <KpiCard label="عروض نشطة" value={kpis.active} icon={<Zap className="w-5 h-5 text-green-600" />} color="bg-green-100" />
            <KpiCard label="للإيجار" value={kpis.forRent} icon={<Tag className="w-5 h-5 text-blue-600" />} color="bg-blue-50" />
            <KpiCard label="للبيع" value={kpis.forSale} icon={<Tag className="w-5 h-5 text-green-600" />} color="bg-green-50" />
            <KpiCard label="مشاهدات" value={kpis.totalViews.toLocaleString()} icon={<Eye className="w-5 h-5 text-purple-600" />} color="bg-purple-100" />
            <KpiCard label="استفسارات" value={kpis.totalInquiries} icon={<MessageCircle className="w-5 h-5 text-orange-600" />} color="bg-orange-100" />
            <KpiCard label="حملات نشطة" value={kpis.activeCampaigns} icon={<Megaphone className="w-5 h-5 text-yellow-600" />} color="bg-yellow-100" />
          </div>

          {/* Top listings */}
          <div className="card">
            <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-yellow-500" /> أعلى العروض مشاهدةً
            </h3>
            <div className="space-y-2">
              {[...marketingListings].sort((a,b) => b.views-a.views).slice(0,5).map((l, i) => {
                const prop = properties.find(p => p.id === l.propertyId);
                return (
                  <div key={l.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${i===0?'bg-yellow-500 text-white':i===1?'bg-gray-300 text-gray-700':i===2?'bg-amber-700 text-white':'bg-gray-100 text-gray-600'}`}>{i+1}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{l.title}</p>
                      <p className="text-xs text-gray-500">{prop?.propertyName ?? '—'}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-yellow-600">{l.views} <span className="text-xs text-gray-500 font-normal">مشاهدة</span></p>
                      <p className="text-xs text-gray-500">{l.inquiries} استفسار</p>
                    </div>
                  </div>
                );
              })}
              {marketingListings.length === 0 && <p className="text-xs text-gray-400 text-center py-4">لا توجد عروض بعد</p>}
            </div>
          </div>
        </div>
      )}

      {/* Listings Tab */}
      {activeTab === 'listings' && (
        <div className="space-y-4">
          <div className="flex gap-3 flex-wrap">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input className="input-field pr-9" placeholder="بحث في العروض..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
              {[['all','الكل'],['rent','إيجار'],['sale','بيع']].map(([v,l]) => (
                <button key={v} onClick={() => setFilterType(v)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${filterType===v?'bg-white shadow text-yellow-700':'text-gray-500 hover:text-gray-700'}`}>{l}</button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredListings.map(l => {
              const unit = units.find(u => u.id === l.unitId);
              const prop = properties.find(p => p.id === l.propertyId);
              return (
                <ListingCard
                  key={l.id}
                  l={l}
                  unitLabel={unit ? `وحدة ${unit.unitNumber}` : '—'}
                  propLabel={prop?.propertyName ?? '—'}
                  canManage={canManage || (isBroker && l.brokerId === currentUser?.id)}
                  onEdit={() => openEdit(l)}
                  onDelete={() => { if (confirm('حذف العرض؟')) deleteMarketingListing(l.id); }}
                  onShare={() => window.open(l.shareLink, '_blank')}
                  onWhatsApp={() => {
                    const text = `🏠 *${l.title}*\n💰 السعر: ${l.price.toLocaleString()} ريال\n📍 ${prop?.propertyName ?? ''}\n🔗 ${l.shareLink ?? 'https://ramzabdae.com'}`;
                    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                  }}
                  onCopyLink={() => navigator.clipboard.writeText(l.shareLink ?? '')}
                />
              );
            })}
            {filteredListings.length === 0 && (
              <div className="col-span-2 card text-center py-12 text-gray-400">
                <Home className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>لا توجد عروض</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'campaigns' && <CampaignsTab />}
      {activeTab === 'appointments' && <AppointmentsTab />}

      {/* Listing Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 w-full max-w-xl shadow-2xl my-auto">
            <h2 className="font-bold text-lg mb-5 flex items-center gap-2">
              <Home className="w-5 h-5 text-yellow-500" />
              {editing ? 'تعديل العرض' : 'عرض عقاري جديد'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">الوحدة *</label>
                <select className="input-field" value={form.unitId} onChange={e => setForm({...form, unitId: e.target.value})} required>
                  <option value="">-- اختر الوحدة --</option>
                  {(editing ? units : availableUnits).map(u => {
                    const prop = properties.find(p => p.id === u.propertyId);
                    return <option key={u.id} value={u.id}>{prop?.propertyName ?? '—'} - وحدة {u.unitNumber}</option>;
                  })}
                </select>
              </div>
              <div>
                <label className="label">عنوان العرض *</label>
                <input className="input-field" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required placeholder="مثال: شقة فاخرة 3 غرف في حي النرجس" />
              </div>
              <div>
                <label className="label">الوصف التسويقي *</label>
                <textarea className="input-field" rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} required placeholder="وصف تفصيلي للعقار ومميزاته..." />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="label">السعر ر.س *</label>
                  <input type="number" min="0" className="input-field" value={form.price || ''} onChange={e => setForm({...form, price: +e.target.value})} required />
                </div>
                <div>
                  <label className="label">وحدة السعر</label>
                  <select className="input-field" value={form.priceUnit} onChange={e => setForm({...form, priceUnit: e.target.value})}>
                    <option value="yearly">سنوي</option>
                    <option value="monthly">شهري</option>
                    <option value="total">إجمالي</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">نوع العرض</label>
                  <select className="input-field" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                    <option value="rent">إيجار</option>
                    <option value="sale">بيع</option>
                  </select>
                </div>
                <div>
                  <label className="label">الوسيط المسؤول</label>
                  <select className="input-field" value={form.brokerId} onChange={e => setForm({...form, brokerId: e.target.value})}>
                    <option value="">-- بدون وسيط --</option>
                    {brokers.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">نسبة العمولة %</label>
                  <input type="number" min="0" max="100" className="input-field" value={form.commissionRate || ''} onChange={e => setForm({...form, commissionRate: +e.target.value})} />
                </div>
                <div>
                  <label className="label">تاريخ انتهاء العرض</label>
                  <input type="date" className="input-field" value={form.expiresAt} onChange={e => setForm({...form, expiresAt: e.target.value})} />
                </div>
              </div>

              <div>
                <label className="label mb-2">المرافق والمميزات</label>
                <div className="flex flex-wrap gap-2">
                  {amenitiesList.map(a => (
                    <button key={a} type="button"
                      onClick={() => setForm(f => ({
                        ...f,
                        amenities: f.amenities.includes(a) ? f.amenities.filter(x => x !== a) : [...f.amenities, a]
                      }))}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${form.amenities.includes(a) ? 'bg-yellow-500 text-white border-yellow-500' : 'bg-white text-gray-600 border-gray-200 hover:border-yellow-400'}`}>
                      {a}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label">وسوم (مفصولة بفاصلة)</label>
                <input className="input-field" value={form.tags} onChange={e => setForm({...form, tags: e.target.value})} placeholder="فاخر, مميز, قريب من الخدمات..." />
              </div>

              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.isActive} onChange={e => setForm({...form, isActive: e.target.checked})} className="w-4 h-4 accent-yellow-500" />
                  <span className="text-sm">نشط</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.featured} onChange={e => setForm({...form, featured: e.target.checked})} className="w-4 h-4 accent-yellow-500" />
                  <span className="text-sm">مميز ⭐</span>
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary flex-1">{editing ? 'حفظ' : 'نشر العرض'}</button>
                <button type="button" className="btn-secondary flex-1" onClick={() => { setShowForm(false); setEditing(null); }}>إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
