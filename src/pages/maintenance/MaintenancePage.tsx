import { useState, useMemo } from 'react';
import { useStore, generateId } from '../../data/store';
import type { AppState } from '../../data/store';
import type { MaintenanceRequest, MaintenanceStatusHistory, PriceQuote, QuoteItem } from '../../types';
import {
  Wrench, Plus, Edit, Trash2, CheckCircle, Clock, AlertTriangle, XCircle,
  User, Building2, Search, BarChart2, Star,
  ChevronDown, ChevronUp, Calendar, DollarSign, MessageSquare,
  TrendingUp, Eye, ThumbsUp, ThumbsDown, Smartphone, MessageCircle,
  Home, Shield, UserCheck, Send, FileText,
  Zap, ClipboardList, MapPin, Hash, ChevronRight, FileCheck, Receipt, PlusCircle, Minus
} from 'lucide-react';

// ─── Constants ────────────────────────────────────────────────
const statusLabels: Record<string, string> = {
  new: 'جديد', pending_approval: 'بانتظار موافقة المالك',
  quote_submitted: 'تم رفع عرض السعر', quote_approved: 'عرض السعر موافق عليه',
  approved: 'موافق عليه', rejected: 'مرفوض',
  assigned: 'معيّن للفني', in_progress: 'جاري التنفيذ',
  completed: 'مكتمل', cancelled: 'ملغي'
};
const statusColors: Record<string, string> = {
  new: 'bg-yellow-100 text-yellow-800',
  pending_approval: 'bg-orange-100 text-orange-800',
  quote_submitted: 'bg-purple-100 text-purple-800',
  quote_approved: 'bg-teal-100 text-teal-800',
  approved: 'bg-teal-100 text-teal-800',
  rejected: 'bg-red-100 text-red-700',
  assigned: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-indigo-100 text-indigo-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-gray-100 text-gray-600'
};
const priorityLabels: Record<string, string> = {
  low: 'منخفضة', medium: 'متوسطة', high: 'عالية', urgent: 'عاجل'
};
const priorityColors: Record<string, string> = {
  low: 'bg-gray-100 text-gray-600',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700 animate-pulse'
};
const categoryLabels: Record<string, string> = {
  plumbing: 'سباكة', electrical: 'كهرباء', hvac: 'تكييف',
  painting: 'دهانات', cleaning: 'نظافة', carpentry: 'نجارة',
  civil: 'أعمال مدنية', pest: 'مكافحة آفات', other: 'أخرى'
};
const categoryIcons: Record<string, string> = {
  plumbing: '🔧', electrical: '⚡', hvac: '❄️',
  painting: '🎨', cleaning: '🧹', carpentry: '🪚',
  civil: '🏗️', pest: '🐛', other: '🔩'
};
const sourceLabels: Record<string, string> = {
  tenant: 'مستأجر', employee: 'موظف', owner: 'مالك', system: 'نظام'
};

// ─── Helpers ──────────────────────────────────────────────────
function daysSince(d: string) {
  return Math.floor((Date.now() - new Date(d).getTime()) / 86400000);
}
function genRequestNumber(list: MaintenanceRequest[]) {
  return `M${1000 + list.length}`;
}
function sendSMS(phone: string, req: MaintenanceRequest) {
  if (!phone) return;
  const num = phone.replace(/\D/g, '');
  const intl = num.startsWith('966') ? num : `966${num.replace(/^0/, '')}`;
  const msg = encodeURIComponent(`رمز الإبداع لإدارة الأملاك\nبلاغ صيانة رقم: ${req.requestNumber ?? req.id}\nالموضوع: ${req.title}\nالحالة: ${statusLabels[req.status]}\nشكراً لتواصلك.`);
  window.open(`sms:+${intl}?body=${msg}`, '_blank');
}
function sendWhatsApp(phone: string, req: MaintenanceRequest) {
  if (!phone) return;
  const num = phone.replace(/\D/g, '');
  const intl = num.startsWith('966') ? num : `966${num.replace(/^0/, '')}`;
  const msg = encodeURIComponent(
    `*رمز الإبداع لإدارة الأملاك*\n\n` +
    `بلاغ صيانة رقم: *${req.requestNumber ?? req.id}*\n` +
    `الموضوع: ${req.title}\n` +
    `الفئة: ${categoryLabels[req.category]}\n` +
    `الأولوية: ${priorityLabels[req.priority]}\n` +
    `الحالة: ${statusLabels[req.status]}\n\n` +
    `سيتم التواصل معك قريباً.`
  );
  window.open(`https://wa.me/${intl}?text=${msg}`, '_blank');
}

// ─── Sub-Components ───────────────────────────────────────────
function KpiCard({ label, value, icon, color, sub, urgent }: {
  label: string; value: string | number; icon: React.ReactNode;
  color: string; sub?: string; urgent?: boolean;
}) {
  return (
    <div className={`card flex items-center gap-4 ${urgent ? 'ring-2 ring-red-400' : ''}`}>
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${color}`}>{icon}</div>
      <div className="min-w-0">
        <p className="text-2xl font-bold text-gray-800">{value}</p>
        <p className="text-sm text-gray-500 leading-tight">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function StarRating({ value, onChange, size = 'md' }: { value: number; onChange?: (v: number) => void; size?: 'sm' | 'md' }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <button key={i} type="button" onClick={() => onChange?.(i)}
          className={`${size === 'sm' ? 'text-base' : 'text-xl'} ${i <= value ? 'text-yellow-400' : 'text-gray-300'} ${onChange ? 'hover:text-yellow-400 transition-colors cursor-pointer' : 'cursor-default'}`}>
          ★
        </button>
      ))}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusColors[status] ?? 'bg-gray-100 text-gray-600'}`}>
      {status === 'completed' ? <CheckCircle className="w-3 h-3" /> :
        status === 'in_progress' ? <Clock className="w-3 h-3" /> :
          status === 'pending_approval' ? <AlertTriangle className="w-3 h-3" /> :
            status === 'rejected' ? <XCircle className="w-3 h-3" /> : null}
      {statusLabels[status] ?? status}
    </span>
  );
}

// ─── Quote Card (inside detail) ───────────────────────────────
function QuoteCard({ quote, req, onUpdate, canOwner, canTenant, now, addHistory }: {
  quote: PriceQuote;
  req: MaintenanceRequest;
  onUpdate: (id: string, data: Partial<MaintenanceRequest>) => void;
  canOwner: boolean;
  canTenant: boolean;
  now: () => string;
  addHistory: (status: MaintenanceRequest['status'], note?: string) => MaintenanceStatusHistory[];
}) {
  const [ownerNote, setOwnerNote] = useState('');
  const [tenantNote, setTenantNote] = useState('');

  const updateQuote = (patch: Partial<PriceQuote>) => {
    const updated = (req.priceQuotes ?? []).map(q => q.id === quote.id ? { ...q, ...patch } : q);
    onUpdate(req.id, { priceQuotes: updated });
  };

  const ownerApprove = () => {
    updateQuote({ ownerApproval: 'approved', ownerApprovalNote: ownerNote, ownerApprovedAt: now() });
    onUpdate(req.id, {
      ownerApprovalStatus: 'approved', ownerApprovedAt: now(),
      status: 'quote_approved',
      estimatedCost: quote.total,
      priceQuotes: (req.priceQuotes ?? []).map(q => q.id === quote.id
        ? { ...q, ownerApproval: 'approved', ownerApprovalNote: ownerNote, ownerApprovedAt: now() }
        : q),
      statusHistory: addHistory('quote_approved', `موافقة المالك على عرض السعر: ${quote.total.toLocaleString()} ر.س`)
    });
  };
  const ownerReject = () => {
    updateQuote({ ownerApproval: 'rejected', ownerApprovalNote: ownerNote });
    onUpdate(req.id, {
      priceQuotes: (req.priceQuotes ?? []).map(q => q.id === quote.id
        ? { ...q, ownerApproval: 'rejected', ownerApprovalNote: ownerNote }
        : q),
      statusHistory: addHistory(req.status, `رفض المالك لعرض السعر: ${ownerNote}`)
    });
  };
  const tenantApprove = () => {
    updateQuote({ tenantApproval: 'approved', tenantApprovalNote: tenantNote });
    onUpdate(req.id, {
      priceQuotes: (req.priceQuotes ?? []).map(q => q.id === quote.id
        ? { ...q, tenantApproval: 'approved', tenantApprovalNote: tenantNote }
        : q),
      statusHistory: addHistory(req.status, `موافقة المستأجر على عرض السعر`)
    });
  };

  const approvalBg = quote.ownerApproval === 'approved' ? 'border-green-300 bg-green-50'
    : quote.ownerApproval === 'rejected' ? 'border-red-200 bg-red-50'
    : 'border-orange-200 bg-orange-50';

  return (
    <div className={`rounded-2xl border-2 overflow-hidden ${approvalBg}`}>
      {/* Quote header */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between flex-wrap gap-2">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-gray-800 text-sm flex items-center gap-1">
              <Receipt className="w-3.5 h-3.5 text-orange-500" />
              {quote.companyName ?? 'عرض سعر'}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
              quote.ownerApproval === 'approved' ? 'bg-green-100 text-green-700'
              : quote.ownerApproval === 'rejected' ? 'bg-red-100 text-red-700'
              : 'bg-orange-100 text-orange-700'
            }`}>
              {quote.ownerApproval === 'approved' ? '✅ موافق المالك' : quote.ownerApproval === 'rejected' ? '❌ مرفوض' : '⏳ انتظار موافقة المالك'}
            </span>
            {quote.tenantApproval === 'approved' && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-semibold">✅ موافق المستأجر</span>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            بواسطة {quote.submittedByName} — {new Date(quote.submittedAt).toLocaleDateString('ar-SA')}
            {quote.validUntil && ` • صالح حتى ${new Date(quote.validUntil).toLocaleDateString('ar-SA')}`}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-orange-600">{quote.total.toLocaleString()} ر.س</p>
          <p className="text-xs text-gray-400">شامل الضريبة {quote.vat}%</p>
        </div>
      </div>

      {/* Quote items table */}
      <div className="px-4 pt-3 pb-2">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-gray-400 border-b">
              <th className="text-right pb-1.5 font-semibold">البيان</th>
              <th className="text-center pb-1.5 font-semibold w-12">الكمية</th>
              <th className="text-center pb-1.5 font-semibold w-20">سعر الوحدة</th>
              <th className="text-center pb-1.5 font-semibold w-20">الإجمالي</th>
            </tr>
          </thead>
          <tbody>
            {quote.items.map((it, i) => (
              <tr key={i} className="border-b border-gray-100">
                <td className="py-1.5 text-gray-700">{it.description}</td>
                <td className="text-center text-gray-600">{it.quantity}</td>
                <td className="text-center text-gray-600">{it.unitPrice.toLocaleString()}</td>
                <td className="text-center font-semibold text-gray-800">{it.total.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end mt-2 space-y-0.5">
          <div className="text-xs space-y-1 w-48">
            <div className="flex justify-between text-gray-500"><span>المجموع:</span><span>{quote.subtotal.toLocaleString()} ر.س</span></div>
            {quote.vatAmount !== undefined && <div className="flex justify-between text-gray-500"><span>ضريبة {quote.vat}%:</span><span>{quote.vatAmount.toLocaleString()} ر.س</span></div>}
            <div className="flex justify-between font-bold text-gray-900 border-t pt-1"><span>الإجمالي الكلي:</span><span className="text-orange-600">{quote.total.toLocaleString()} ر.س</span></div>
          </div>
        </div>

        {/* Notes & file link */}
        {quote.notes && <p className="text-xs text-gray-500 mt-2 italic">{quote.notes}</p>}
        {quote.fileUrl && (
          <a href={quote.fileUrl} target="_blank" rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 mt-1.5">
            <FileText className="w-3 h-3" /> عرض ملف عرض السعر
          </a>
        )}
      </div>

      {/* Approval actions */}
      <div className="border-t px-4 py-3 space-y-2 bg-white/60">
        {/* Owner approval */}
        {canOwner && quote.ownerApproval === 'pending' && (
          <div>
            <p className="text-xs font-bold text-orange-700 mb-1.5 flex items-center gap-1"><Shield className="w-3 h-3" />قرار المالك</p>
            <div className="flex gap-2 items-center">
              <input className="input-field text-xs flex-1 py-1.5" value={ownerNote} onChange={e => setOwnerNote(e.target.value)} placeholder="ملاحظة (اختياري)..." />
              <button onClick={ownerApprove} className="px-3 py-1.5 rounded-lg bg-green-500 text-white text-xs font-bold flex items-center gap-1 hover:bg-green-600 shrink-0">
                <ThumbsUp className="w-3 h-3" /> موافقة
              </button>
              <button onClick={ownerReject} className="px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-bold flex items-center gap-1 hover:bg-red-600 shrink-0">
                <ThumbsDown className="w-3 h-3" /> رفض
              </button>
            </div>
          </div>
        )}
        {quote.ownerApproval === 'approved' && quote.ownerApprovalNote && (
          <p className="text-xs text-green-700">✅ ملاحظة المالك: {quote.ownerApprovalNote}</p>
        )}
        {quote.ownerApproval === 'rejected' && quote.ownerApprovalNote && (
          <p className="text-xs text-red-600">❌ سبب الرفض: {quote.ownerApprovalNote}</p>
        )}

        {/* Tenant approval (shown after owner approves) */}
        {canTenant && quote.ownerApproval === 'approved' && quote.tenantApproval === 'pending' && (
          <div className="border-t pt-2 mt-2">
            <p className="text-xs font-bold text-blue-700 mb-1.5 flex items-center gap-1"><User className="w-3 h-3" />قرار المستأجر</p>
            <div className="flex gap-2 items-center">
              <input className="input-field text-xs flex-1 py-1.5" value={tenantNote} onChange={e => setTenantNote(e.target.value)} placeholder="ملاحظة..." />
              <button onClick={tenantApprove} className="px-3 py-1.5 rounded-lg bg-blue-500 text-white text-xs font-bold flex items-center gap-1 hover:bg-blue-600 shrink-0">
                <ThumbsUp className="w-3 h-3" /> موافقة
              </button>
            </div>
          </div>
        )}
        {quote.tenantApproval === 'approved' && (
          <p className="text-xs text-blue-700">✅ وافق المستأجر على عرض السعر</p>
        )}
      </div>
    </div>
  );
}

// ─── Add Quote Inline ──────────────────────────────────────────
function AddQuoteInline({ req, onUpdate, now, addHistory, currentUser }: {
  req: MaintenanceRequest;
  onUpdate: (id: string, data: Partial<MaintenanceRequest>) => void;
  now: () => string;
  addHistory: (status: MaintenanceRequest['status'], note?: string) => MaintenanceStatusHistory[];
  currentUser: { id?: string; name?: string } | null;
}) {
  const [open, setOpen] = useState(false);
  const [company, setCompany] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [items, setItems] = useState<QuoteItem[]>([{ description: '', quantity: 1, unitPrice: 0, total: 0 }]);
  const [vat, setVat] = useState(15);
  const [notes, setNotes] = useState('');
  const [fileUrl, setFileUrl] = useState('');

  const subtotal = items.reduce((s, it) => s + it.total, 0);
  const vatAmt = Math.round(subtotal * (vat / 100));
  const total = subtotal + vatAmt;

  const submit = () => {
    if (!items.some(it => it.description && it.total > 0)) return;
    const quote: PriceQuote = {
      id: generateId(),
      submittedBy: currentUser?.id ?? 'system',
      submittedByName: currentUser?.name ?? 'الموظف',
      submittedAt: now(),
      companyName: company || undefined,
      validUntil: validUntil || undefined,
      items: items.filter(it => it.description),
      subtotal, vat, vatAmount: vatAmt, total,
      notes: notes || undefined,
      fileUrl: fileUrl || undefined,
      ownerApproval: req.ownerApprovalStatus === 'approved' ? 'not_required' as PriceQuote['ownerApproval'] : 'pending',
      tenantApproval: 'pending',
    };
    const updated = [...(req.priceQuotes ?? []), quote];
    onUpdate(req.id, {
      priceQuotes: updated,
      activeQuoteId: quote.id,
      estimatedCost: total,
      status: 'quote_submitted',
      ownerApprovalStatus: req.ownerApprovalStatus === 'approved' ? 'approved' : 'pending',
      statusHistory: addHistory('quote_submitted', `رفع عرض سعر: ${total.toLocaleString()} ر.س${company ? ` — ${company}` : ''}`)
    });
    setOpen(false);
  };

  if (!open) {
    return (
      <button onClick={() => setOpen(true)}
        className="w-full py-2.5 rounded-xl border-2 border-dashed border-orange-300 text-orange-600 text-xs font-semibold hover:bg-orange-50 flex items-center justify-center gap-2">
        <PlusCircle className="w-4 h-4" /> إضافة عرض سعر جديد
      </button>
    );
  }

  return (
    <div className="bg-white rounded-2xl border-2 border-orange-300 overflow-hidden">
      <div className="bg-gradient-to-l from-orange-500 to-amber-600 px-4 py-3 text-white flex items-center justify-between">
        <span className="font-bold text-sm flex items-center gap-2"><Receipt className="w-4 h-4" />إضافة عرض سعر جديد</span>
        <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white">×</button>
      </div>
      <div className="p-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label text-xs">اسم الشركة / المقاول</label>
            <input className="input-field text-xs py-1.5" value={company} onChange={e => setCompany(e.target.value)} placeholder="شركة الفيصل للصيانة..." />
          </div>
          <div>
            <label className="label text-xs">صلاحية العرض حتى</label>
            <input type="date" className="input-field text-xs py-1.5" value={validUntil} onChange={e => setValidUntil(e.target.value)} />
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-3 border">
          <p className="text-xs font-bold text-gray-600 mb-2">بنود عرض السعر</p>
          <QuoteItemsEditor items={items} onChange={setItems} />
          <div className="mt-3 pt-2 border-t space-y-1 text-xs">
            <div className="flex items-center gap-2 justify-end text-gray-600">
              <span>ضريبة</span>
              <input type="number" min="0" max="100" className="w-12 input-field text-xs py-1 text-center" value={vat} onChange={e => setVat(+e.target.value)} />
              <span>%</span>
              <span className="text-gray-500">{vatAmt.toLocaleString()} ر.س</span>
            </div>
            <div className="flex justify-end gap-4 font-bold text-base text-orange-600">
              <span>الإجمالي:</span>
              <span>{total.toLocaleString()} ر.س</span>
            </div>
          </div>
        </div>

        <div>
          <label className="label text-xs">ملاحظات</label>
          <textarea className="input-field text-xs py-1.5" rows={2} value={notes} onChange={e => setNotes(e.target.value)} placeholder="شروط الدفع، ضمانات..." />
        </div>
        <div>
          <label className="label text-xs">رابط ملف PDF</label>
          <input className="input-field text-xs py-1.5" value={fileUrl} onChange={e => setFileUrl(e.target.value)} placeholder="https://drive.google.com/..." />
        </div>

        <div className="flex gap-2 pt-1">
          <button onClick={() => setOpen(false)} className="btn-secondary flex-1 text-xs py-2">إلغاء</button>
          <button onClick={submit} disabled={!items.some(it => it.description && it.total > 0)}
            className="btn-primary flex-1 text-xs py-2 flex items-center justify-center gap-1 disabled:opacity-40">
            <Send className="w-3.5 h-3.5" /> رفع عرض السعر
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Request Detail Modal ──────────────────────────────────────
function RequestDetail({ req, onClose, onUpdate, role, users, units, properties }: {
  req: MaintenanceRequest;
  onClose: () => void;
  onUpdate: (id: string, data: Partial<MaintenanceRequest>) => void;
  role: string;
  users: AppState['users'];
  units: AppState['units'];
  properties: AppState['properties'];
}) {
  const unit = units.find(u => u.id === req.unitId);
  const prop = properties.find(p => p.id === req.propertyId);
  const tech = users.find(u => u.id === req.technicianId);
  const tenantUser = users.find(u => u.id === req.tenantId);
  const owner = users.find(u => u.id === prop?.ownerId);
  const technicians = users.filter(u => u.role === 'technician');

  const [techId, setTechId] = useState(req.technicianId ?? '');
  const [scheduledDate, setScheduledDate] = useState(req.scheduledDate ?? '');
  const [estimatedCost, setEstimatedCost] = useState(req.estimatedCost ?? 0);
  const [actualCost, setActualCost] = useState(req.actualCost ?? 0);
  const [techNotes, setTechNotes] = useState(req.technicianNotes ?? '');
  const [ownerNote, setOwnerNote] = useState(req.ownerApprovalNote ?? '');
  const [ownerNotes, setOwnerNotes] = useState(req.ownerNotes ?? '');
  const [tenantFeedback, setTenantFeedback] = useState(req.tenantFeedback ?? '');
  const [tenantRating, setTenantRating] = useState(req.tenantRating ?? 0);
  const [rejectNote, setRejectNote] = useState('');
  const now = () => new Date().toISOString();
  const { currentUser } = useStore();

  const addHistory = (status: MaintenanceRequest['status'], note?: string) => {
    const h: MaintenanceStatusHistory = { status, changedAt: now(), changedBy: currentUser?.name ?? 'النظام', note };
    return [...(req.statusHistory ?? []), h];
  };

  const approve = () => {
    onUpdate(req.id, {
      status: 'approved', ownerApprovalStatus: 'approved',
      ownerApprovedBy: currentUser?.name, ownerApprovedAt: now(),
      ownerApprovalNote: ownerNote, ownerNotes,
      statusHistory: addHistory('approved', ownerNote || 'تمت الموافقة من المالك')
    });
  };
  const reject = () => {
    onUpdate(req.id, {
      status: 'rejected', ownerApprovalStatus: 'rejected',
      ownerApprovedBy: currentUser?.name, ownerApprovedAt: now(),
      ownerApprovalNote: rejectNote,
      statusHistory: addHistory('rejected', rejectNote || 'تم الرفض من المالك')
    });
  };
  const assignTech = () => {
    onUpdate(req.id, {
      status: 'assigned', technicianId: techId, scheduledDate,
      estimatedCost, statusHistory: addHistory('assigned', `تعيين ${technicians.find(t => t.id === techId)?.name ?? ''}`)
    });
  };
  const startWork = () => {
    onUpdate(req.id, { status: 'in_progress', startedAt: now(), statusHistory: addHistory('in_progress', 'بدء التنفيذ') });
  };
  const complete = () => {
    onUpdate(req.id, {
      status: 'completed', completedAt: now(), actualCost, technicianNotes: techNotes,
      statusHistory: addHistory('completed', 'إغلاق البلاغ')
    });
  };
  const cancel = () => {
    onUpdate(req.id, { status: 'cancelled', statusHistory: addHistory('cancelled', 'إلغاء') });
  };
  const saveOwnerCost = () => {
    onUpdate(req.id, { costApprovedByOwner: true, ownerNotes });
  };
  const saveFeedback = () => {
    onUpdate(req.id, { tenantFeedback, tenantRating });
  };

  const canAdmin = ['admin', 'employee'].includes(role);
  const canTech = role === 'technician' || canAdmin;
  const canOwner = role === 'owner' || canAdmin;
  const canTenant = role === 'tenant' || canAdmin;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl my-4">
        {/* Header */}
        <div className="bg-gradient-to-l from-orange-500 to-amber-600 rounded-t-2xl p-5 text-white">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="font-mono text-sm bg-white/20 px-2 py-0.5 rounded">#{req.requestNumber ?? req.id.slice(-6)}</span>
                <StatusBadge status={req.status} />
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${priorityColors[req.priority]}`}>{priorityLabels[req.priority]}</span>
              </div>
              <h2 className="text-lg font-bold">{req.title}</h2>
              <p className="text-white/70 text-xs mt-1">
                {categoryIcons[req.category]} {categoryLabels[req.category]} •
                {prop?.propertyName ?? '—'} • وحدة {unit?.unitNumber ?? '—'} •
                {daysSince(req.createdAt) === 0 ? ' اليوم' : ` منذ ${daysSince(req.createdAt)} يوم`}
              </p>
            </div>
            <div className="flex gap-2 items-center">
              {tenantUser?.phone && canAdmin && (
                <>
                  <button onClick={() => sendSMS(tenantUser.phone!, req)} title="SMS" className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-500/30 hover:bg-blue-500/50">
                    <Smartphone className="w-4 h-4" />
                  </button>
                  <button onClick={() => sendWhatsApp(tenantUser.phone!, req)} title="واتساب" className="w-8 h-8 flex items-center justify-center rounded-lg bg-green-500/30 hover:bg-green-500/50">
                    <MessageCircle className="w-4 h-4" />
                  </button>
                </>
              )}
              <button onClick={onClose} className="text-white/70 hover:text-white text-2xl leading-none">×</button>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-5">
          {/* Info grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="bg-orange-50 rounded-xl p-3">
              <p className="text-gray-400 mb-1">العقار / الوحدة</p>
              <p className="font-semibold">{prop?.propertyName ?? '—'}</p>
              <p className="text-gray-500">وحدة {unit?.unitNumber ?? '—'}</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-3">
              <p className="text-gray-400 mb-1">المستأجر</p>
              <p className="font-semibold">{tenantUser?.name ?? '—'}</p>
              <p className="text-gray-500">{tenantUser?.phone ?? '—'}</p>
            </div>
            <div className="bg-green-50 rounded-xl p-3">
              <p className="text-gray-400 mb-1">المالك</p>
              <p className="font-semibold">{owner?.name ?? prop?.ownerName ?? '—'}</p>
              <p className="text-gray-500">{owner?.phone ?? '—'}</p>
            </div>
            <div className="bg-purple-50 rounded-xl p-3">
              <p className="text-gray-400 mb-1">الفني المعيّن</p>
              <p className="font-semibold">{tech?.name ?? 'غير معيّن'}</p>
              {req.scheduledDate && <p className="text-gray-500">{new Date(req.scheduledDate).toLocaleDateString('ar-SA')}</p>}
            </div>
          </div>

          {/* Description */}
          <div>
            <p className="text-xs font-bold text-gray-500 mb-2 flex items-center gap-1"><FileText className="w-3.5 h-3.5" /> وصف البلاغ</p>
            <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-3 leading-relaxed">{req.description}</p>
          </div>

          {/* ── Price Quotes section ── */}
          {req.priceQuotes && req.priceQuotes.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-bold text-gray-500 flex items-center gap-1.5">
                <Receipt className="w-3.5 h-3.5 text-orange-500" /> عروض الأسعار
              </p>
              {req.priceQuotes.map(q => (
                <QuoteCard key={q.id} quote={q} req={req} onUpdate={onUpdate} canOwner={canOwner} canTenant={canTenant} now={now} addHistory={addHistory} />
              ))}
              {/* Add new quote button (admin/employee) */}
              {canAdmin && (
                <AddQuoteInline req={req} onUpdate={onUpdate} now={now} addHistory={addHistory} currentUser={currentUser} />
              )}
            </div>
          )}

          {/* Add quote button if no quotes yet */}
          {(!req.priceQuotes || req.priceQuotes.length === 0) && canAdmin && (
            <AddQuoteInline req={req} onUpdate={onUpdate} now={now} addHistory={addHistory} currentUser={currentUser} />
          )}

          {/* Owner Approval section */}
          {(req.ownerApprovalStatus === 'pending' || req.ownerApprovalStatus === 'approved' || req.ownerApprovalStatus === 'rejected') && (
            <div className={`rounded-xl p-4 border-2 ${req.ownerApprovalStatus === 'approved' ? 'border-green-300 bg-green-50' : req.ownerApprovalStatus === 'rejected' ? 'border-red-300 bg-red-50' : 'border-orange-300 bg-orange-50'}`}>
              <p className="text-sm font-bold mb-2 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                موافقة المالك: {req.ownerApprovalStatus === 'approved' ? '✅ تمت الموافقة' : req.ownerApprovalStatus === 'rejected' ? '❌ مرفوض' : '⏳ بانتظار الموافقة'}
              </p>
              {req.ownerApprovalNote && <p className="text-xs text-gray-600">ملاحظة: {req.ownerApprovalNote}</p>}
              {req.ownerApprovedBy && <p className="text-xs text-gray-500 mt-1">بواسطة: {req.ownerApprovedBy} — {req.ownerApprovedAt ? new Date(req.ownerApprovedAt).toLocaleDateString('ar-SA') : ''}</p>}
              {canOwner && req.ownerApprovalStatus === 'pending' && (
                <div className="mt-3 space-y-2">
                  <textarea className="input-field text-xs" rows={2} value={ownerNote} onChange={e => setOwnerNote(e.target.value)} placeholder="ملاحظة الموافقة (اختياري)..." />
                  <div className="flex gap-2">
                    <button onClick={approve} className="flex-1 py-2 rounded-xl bg-green-500 text-white text-xs font-bold flex items-center justify-center gap-1 hover:bg-green-600">
                      <ThumbsUp className="w-3.5 h-3.5" /> موافقة
                    </button>
                    <input className="flex-1 input-field text-xs" value={rejectNote} onChange={e => setRejectNote(e.target.value)} placeholder="سبب الرفض..." />
                    <button onClick={reject} className="px-3 py-2 rounded-xl bg-red-500 text-white text-xs font-bold flex items-center gap-1 hover:bg-red-600">
                      <ThumbsDown className="w-3.5 h-3.5" /> رفض
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Assign Technician (admin/employee) */}
          {canAdmin && ['approved', 'new'].includes(req.status) && (
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <p className="text-sm font-bold text-blue-800 mb-3 flex items-center gap-2"><UserCheck className="w-4 h-4" /> تعيين الفني</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">الفني</label>
                  <select className="input-field text-sm" value={techId} onChange={e => setTechId(e.target.value)}>
                    <option value="">— اختر فني —</option>
                    {technicians.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">تاريخ الزيارة</label>
                  <input type="date" className="input-field text-sm" value={scheduledDate} onChange={e => setScheduledDate(e.target.value)} />
                </div>
                <div>
                  <label className="label">التكلفة التقديرية (ر.س)</label>
                  <input type="number" className="input-field text-sm" value={estimatedCost} onChange={e => setEstimatedCost(+e.target.value)} />
                </div>
              </div>
              <button onClick={assignTech} disabled={!techId} className="mt-3 btn-primary text-sm disabled:opacity-50 flex items-center gap-2">
                <UserCheck className="w-4 h-4" /> تعيين وإرسال
              </button>
            </div>
          )}

          {/* Technician Work Panel */}
          {canTech && ['assigned', 'in_progress'].includes(req.status) && (
            <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-200">
              <p className="text-sm font-bold text-indigo-800 mb-3 flex items-center gap-2"><Wrench className="w-4 h-4" /> لوحة الفني</p>
              <div className="space-y-3">
                <div>
                  <label className="label">ملاحظات التنفيذ</label>
                  <textarea className="input-field text-sm" rows={3} value={techNotes} onChange={e => setTechNotes(e.target.value)} placeholder="اكتب تفاصيل العمل المنجز..." />
                </div>
                <div>
                  <label className="label">التكلفة الفعلية (ر.س)</label>
                  <input type="number" className="input-field text-sm" value={actualCost} onChange={e => setActualCost(+e.target.value)} />
                </div>
                <div className="flex gap-2">
                  {req.status === 'assigned' && (
                    <button onClick={startWork} className="btn-secondary text-sm flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> بدء التنفيذ
                    </button>
                  )}
                  <button onClick={complete} className="btn-primary text-sm flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> إغلاق البلاغ
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Owner Cost Approval */}
          {canOwner && req.status === 'completed' && req.actualCost && !req.costApprovedByOwner && (
            <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
              <p className="text-sm font-bold text-amber-800 mb-3 flex items-center gap-2"><DollarSign className="w-4 h-4" /> مراجعة التكلفة</p>
              <p className="text-sm">التكلفة الفعلية: <strong>{req.actualCost.toLocaleString()} ر.س</strong></p>
              <textarea className="input-field text-sm mt-2" rows={2} value={ownerNotes} onChange={e => setOwnerNotes(e.target.value)} placeholder="ملاحظات المالك..." />
              <button onClick={saveOwnerCost} className="mt-2 btn-primary text-sm flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> اعتماد التكلفة
              </button>
            </div>
          )}

          {/* Tenant Feedback */}
          {canTenant && req.status === 'completed' && !req.tenantRating && (
            <div className="bg-green-50 rounded-xl p-4 border border-green-200">
              <p className="text-sm font-bold text-green-800 mb-3 flex items-center gap-2"><Star className="w-4 h-4" /> تقييم الخدمة</p>
              <StarRating value={tenantRating} onChange={setTenantRating} />
              <textarea className="input-field text-sm mt-2" rows={2} value={tenantFeedback} onChange={e => setTenantFeedback(e.target.value)} placeholder="شاركنا رأيك في الخدمة..." />
              <button onClick={saveFeedback} className="mt-2 btn-primary text-sm">حفظ التقييم</button>
            </div>
          )}
          {req.tenantRating && (
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs font-semibold text-gray-500 mb-1">تقييم المستأجر</p>
              <StarRating value={req.tenantRating} size="sm" />
              {req.tenantFeedback && <p className="text-xs text-gray-600 mt-1">{req.tenantFeedback}</p>}
            </div>
          )}

          {/* Costs summary */}
          {(req.estimatedCost || req.actualCost) && (
            <div className="grid grid-cols-2 gap-3 text-sm">
              {req.estimatedCost && (
                <div className="bg-yellow-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-gray-500 mb-1">التكلفة التقديرية</p>
                  <p className="font-bold text-yellow-800">{req.estimatedCost.toLocaleString()} ر.س</p>
                </div>
              )}
              {req.actualCost && (
                <div className="bg-green-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-gray-500 mb-1">التكلفة الفعلية</p>
                  <p className="font-bold text-green-800">{req.actualCost.toLocaleString()} ر.س</p>
                  {req.costApprovedByOwner && <p className="text-xs text-green-600">✅ معتمد من المالك</p>}
                </div>
              )}
            </div>
          )}

          {/* Technician notes (visible all) */}
          {req.technicianNotes && (
            <div>
              <p className="text-xs font-bold text-gray-500 mb-1 flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5" /> ملاحظات الفني</p>
              <p className="text-sm text-gray-700 bg-blue-50 rounded-xl px-3 py-2">{req.technicianNotes}</p>
            </div>
          )}

          {/* Status history */}
          {req.statusHistory && req.statusHistory.length > 0 && (
            <div>
              <p className="text-xs font-bold text-gray-500 mb-2">سجل الحالات</p>
              <div className="space-y-1.5">
                {req.statusHistory.map((h, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${h.status === 'completed' ? 'bg-green-500' : h.status === 'rejected' || h.status === 'cancelled' ? 'bg-red-400' : 'bg-blue-500'}`} />
                    <span className="font-semibold text-gray-700">{statusLabels[h.status]}</span>
                    <span className="text-gray-400">{new Date(h.changedAt).toLocaleString('ar-SA', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                    {h.changedBy && <span className="text-indigo-500">— {h.changedBy}</span>}
                    {h.note && <span className="text-gray-500">| {h.note}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cancel button */}
          {canAdmin && !['completed', 'cancelled', 'rejected'].includes(req.status) && (
            <div className="flex justify-end">
              <button onClick={cancel} className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1">
                <XCircle className="w-3.5 h-3.5" /> إلغاء البلاغ
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Quote Item Editor ─────────────────────────────────────────
function QuoteItemsEditor({ items, onChange }: { items: QuoteItem[]; onChange: (items: QuoteItem[]) => void }) {
  const add = () => onChange([...items, { description: '', quantity: 1, unitPrice: 0, total: 0 }]);
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  const update = (i: number, field: keyof QuoteItem, val: string | number) => {
    const updated = items.map((it, idx) => {
      if (idx !== i) return it;
      const newIt = { ...it, [field]: val };
      newIt.total = newIt.quantity * newIt.unitPrice;
      return newIt;
    });
    onChange(updated);
  };
  const subtotal = items.reduce((s, it) => s + it.total, 0);
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-12 gap-1 text-xs font-bold text-gray-500 px-1">
        <span className="col-span-5">البيان</span>
        <span className="col-span-2 text-center">الكمية</span>
        <span className="col-span-2 text-center">سعر الوحدة</span>
        <span className="col-span-2 text-center">الإجمالي</span>
        <span className="col-span-1" />
      </div>
      {items.map((it, i) => (
        <div key={i} className="grid grid-cols-12 gap-1 items-center">
          <input className="input-field text-xs col-span-5 py-1.5" value={it.description} onChange={e => update(i, 'description', e.target.value)} placeholder="وصف البند..." />
          <input type="number" min="1" className="input-field text-xs col-span-2 py-1.5 text-center" value={it.quantity} onChange={e => update(i, 'quantity', +e.target.value)} />
          <input type="number" min="0" className="input-field text-xs col-span-2 py-1.5 text-center" value={it.unitPrice} onChange={e => update(i, 'unitPrice', +e.target.value)} />
          <div className="col-span-2 text-center text-xs font-semibold text-gray-700">{it.total.toLocaleString()}</div>
          <button type="button" onClick={() => remove(i)} className="col-span-1 flex items-center justify-center text-red-400 hover:text-red-600">
            <Minus className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
      <button type="button" onClick={add} className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-semibold pt-1">
        <PlusCircle className="w-3.5 h-3.5" /> إضافة بند
      </button>
      {items.length > 0 && (
        <div className="flex justify-end gap-4 text-sm border-t pt-2 mt-2">
          <span className="text-gray-500">المجموع:</span>
          <span className="font-bold text-gray-800">{subtotal.toLocaleString()} ر.س</span>
        </div>
      )}
    </div>
  );
}

// ─── New Request Form (Wizard) ─────────────────────────────────
function RequestForm({ editing, onSave, onClose }: {
  editing: MaintenanceRequest | null;
  onSave: (data: Partial<MaintenanceRequest>) => void;
  onClose: () => void;
}) {
  const { units, properties, users, currentUser } = useStore();
  const technicians = users.filter(u => u.role === 'technician');
  const [step, setStep] = useState(1);

  // Step 1 — Location
  const [propertyId, setPropertyId] = useState(editing?.propertyId ?? '');
  const [unitId, setUnitId] = useState(editing?.unitId ?? '');

  // Step 2 — Details
  const [title, setTitle] = useState(editing?.title ?? '');
  const [description, setDescription] = useState(editing?.description ?? '');
  const [category, setCategory] = useState<MaintenanceRequest['category']>(editing?.category ?? 'plumbing');
  const [priority, setPriority] = useState<MaintenanceRequest['priority']>(editing?.priority ?? 'medium');
  const [requestSource, setRequestSource] = useState<MaintenanceRequest['requestSource']>(editing?.requestSource ?? 'tenant');
  const [notes, setNotes] = useState(editing?.notes ?? '');
  const [images, setImages] = useState<string[]>(editing?.images ?? []);

  // Step 3 — Quote
  const [hasQuote, setHasQuote] = useState(false);
  const [quoteCompany, setQuoteCompany] = useState('');
  const [quoteValidUntil, setQuoteValidUntil] = useState('');
  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([{ description: '', quantity: 1, unitPrice: 0, total: 0 }]);
  const [quoteVat, setQuoteVat] = useState(15);
  const [quoteNotes, setQuoteNotes] = useState('');
  const [quoteFileUrl, setQuoteFileUrl] = useState('');

  // Step 4 — Approval settings
  const [needsOwnerApproval, setNeedsOwnerApproval] = useState(true);
  const [technicianId, setTechnicianId] = useState(editing?.technicianId ?? '');
  const [scheduledDate, setScheduledDate] = useState(editing?.scheduledDate ?? '');

  const propUnits = units.filter(u => !propertyId || u.propertyId === propertyId);
  const selProp = properties.find(p => p.id === propertyId);
  const selUnit = units.find(u => u.id === unitId);
  const owner = users.find(u => u.id === selProp?.ownerId);

  const quoteSubtotal = quoteItems.reduce((s, it) => s + it.total, 0);
  const quoteVatAmount = hasQuote ? Math.round(quoteSubtotal * (quoteVat / 100)) : 0;
  const quoteTotal = quoteSubtotal + quoteVatAmount;

  const steps = [
    { n: 1, label: 'تحديد الموقع', icon: <MapPin className="w-4 h-4" /> },
    { n: 2, label: 'تفاصيل البلاغ', icon: <FileText className="w-4 h-4" /> },
    { n: 3, label: 'عرض السعر', icon: <Receipt className="w-4 h-4" /> },
    { n: 4, label: 'الموافقة والإرسال', icon: <Shield className="w-4 h-4" /> },
  ];

  const canNext1 = !!propertyId && !!unitId;
  const canNext2 = !!title.trim() && !!description.trim();

  const handleSubmit = () => {
    const now = new Date().toISOString();
    let quote: PriceQuote | undefined;
    if (hasQuote && quoteItems.some(it => it.description)) {
      quote = {
        id: generateId(),
        submittedBy: currentUser?.id ?? 'system',
        submittedByName: currentUser?.name ?? 'الموظف',
        submittedAt: now,
        companyName: quoteCompany || undefined,
        validUntil: quoteValidUntil || undefined,
        items: quoteItems.filter(it => it.description),
        subtotal: quoteSubtotal,
        vat: quoteVat,
        vatAmount: quoteVatAmount,
        total: quoteTotal,
        notes: quoteNotes || undefined,
        fileUrl: quoteFileUrl || undefined,
        ownerApproval: needsOwnerApproval ? 'pending' : 'not_required' as PriceQuote['ownerApproval'],
        tenantApproval: 'not_required',
      };
    }
    onSave({
      propertyId,
      unitId,
      title,
      description,
      category,
      priority,
      requestSource,
      notes: notes || undefined,
      images: images.length ? images : undefined,
      technicianId: technicianId || undefined,
      scheduledDate: scheduledDate || undefined,
      estimatedCost: quoteTotal || undefined,
      priceQuotes: quote ? [quote] : undefined,
      activeQuoteId: quote?.id,
      needsOwnerApproval,
    } as Partial<MaintenanceRequest>);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl my-4">
        {/* Header */}
        <div className="bg-gradient-to-l from-orange-500 to-amber-600 rounded-t-2xl p-5 text-white">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <Wrench className="w-5 h-5" />
            {editing ? 'تعديل بلاغ صيانة' : 'بلاغ صيانة جديد'}
          </h2>
          {/* Step indicator */}
          <div className="flex items-center gap-1 mt-4">
            {steps.map((s, i) => (
              <div key={s.n} className="flex items-center gap-1 flex-1">
                <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-semibold transition-all ${step === s.n ? 'bg-white text-orange-600 shadow' : step > s.n ? 'bg-white/30 text-white' : 'bg-white/10 text-white/60'}`}>
                  {step > s.n ? <CheckCircle className="w-3.5 h-3.5" /> : s.icon}
                  <span className="hidden sm:inline">{s.label}</span>
                  <span className="sm:hidden">{s.n}</span>
                </div>
                {i < steps.length - 1 && <ChevronRight className="w-3 h-3 text-white/40 shrink-0" />}
              </div>
            ))}
          </div>
        </div>

        <div className="p-5">

          {/* ── Step 1: Location ── */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="text-center mb-2">
                <p className="font-bold text-gray-800 text-base">تحديد موقع البلاغ</p>
                <p className="text-xs text-gray-500 mt-1">اختر العقار ورقم الوحدة أولاً</p>
              </div>

              <div>
                <label className="label">العقار *</label>
                <select className="input-field" value={propertyId} onChange={e => { setPropertyId(e.target.value); setUnitId(''); }}>
                  <option value="">— اختر العقار —</option>
                  {properties.map(p => (
                    <option key={p.id} value={p.id}>{p.propertyName} — {p.city}</option>
                  ))}
                </select>
              </div>

              {propertyId && selProp && (
                <div className="bg-orange-50 rounded-2xl p-4 border border-orange-200 space-y-1 text-sm">
                  <div className="flex items-center gap-2 font-bold text-orange-800">
                    <Building2 className="w-4 h-4" />
                    {selProp.propertyName}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mt-2">
                    <span>📍 {selProp.city}{selProp.district ? ` — ${selProp.district}` : ''}</span>
                    <span>🏗️ {selProp.totalUnits} وحدة</span>
                    {owner && <span>👤 المالك: {owner.name}</span>}
                    {owner?.phone && <span>📞 {owner.phone}</span>}
                  </div>
                </div>
              )}

              <div>
                <label className="label">رقم الوحدة *</label>
                {propUnits.length === 0 && propertyId ? (
                  <p className="text-xs text-red-500 mt-1">لا توجد وحدات في هذا العقار</p>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-1">
                    {propUnits.map(u => (
                      <button key={u.id} type="button"
                        onClick={() => setUnitId(u.id)}
                        className={`py-3 rounded-xl border-2 text-sm font-bold transition-all ${unitId === u.id ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-200 bg-white text-gray-700 hover:border-orange-300'}`}>
                        {u.unitNumber}
                        <div className="text-xs font-normal mt-0.5 text-gray-500">{u.unitType}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {unitId && selUnit && (
                <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200 text-xs space-y-1">
                  <p className="font-bold text-blue-800 text-sm mb-2">✅ الوحدة المختارة</p>
                  <div className="grid grid-cols-2 gap-2 text-gray-600">
                    <span>رقم الوحدة: <strong>{selUnit.unitNumber}</strong></span>
                    <span>النوع: <strong>{selUnit.unitType}</strong></span>
                    <span>الطابق: <strong>{selUnit.floor ?? '—'}</strong></span>
                    <span>المساحة: <strong>{selUnit.unitArea || selUnit.area} م²</strong></span>
                    <span>الحالة: <strong>{selUnit.unitStatus}</strong></span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Step 2: Details ── */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="text-center mb-2">
                <p className="font-bold text-gray-800 text-base">تفاصيل بلاغ الصيانة</p>
                <div className="flex items-center justify-center gap-2 text-xs text-gray-500 mt-1">
                  <Building2 className="w-3.5 h-3.5 text-orange-500" />
                  {selProp?.propertyName} —
                  <Hash className="w-3 h-3 text-blue-500" />
                  وحدة {selUnit?.unitNumber}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">فئة الصيانة *</label>
                  <div className="grid grid-cols-3 gap-1.5 mt-1">
                    {Object.entries(categoryLabels).map(([v, l]) => (
                      <button key={v} type="button" onClick={() => setCategory(v as MaintenanceRequest['category'])}
                        className={`flex flex-col items-center gap-1 py-2 rounded-xl border-2 text-xs font-semibold transition-all ${category === v ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-200 hover:border-orange-200 text-gray-600'}`}>
                        <span className="text-base">{categoryIcons[v]}</span>
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="label">درجة الأولوية *</label>
                    <div className="grid grid-cols-2 gap-1.5 mt-1">
                      {Object.entries(priorityLabels).map(([v, l]) => (
                        <button key={v} type="button" onClick={() => setPriority(v as MaintenanceRequest['priority'])}
                          className={`py-2 rounded-xl border-2 text-xs font-bold transition-all ${priority === v ? `border-orange-500 ${priorityColors[v]}` : 'border-gray-200 text-gray-600 hover:border-orange-200'}`}>
                          {v === 'urgent' ? '🔴' : v === 'high' ? '🟠' : v === 'medium' ? '🟡' : '🟢'} {l}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="label">مصدر البلاغ</label>
                    <select className="input-field text-sm" value={requestSource} onChange={e => setRequestSource(e.target.value as MaintenanceRequest['requestSource'])}>
                      {Object.entries(sourceLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="label">عنوان البلاغ *</label>
                <input className="input-field" value={title} onChange={e => setTitle(e.target.value)} placeholder="مثال: تسرب مياه من سقف الحمام..." />
              </div>
              <div>
                <label className="label">وصف المشكلة بالتفصيل *</label>
                <textarea className="input-field" rows={4} value={description} onChange={e => setDescription(e.target.value)} placeholder="اشرح المشكلة بوضوح: متى بدأت؟ شدتها؟ أي جزء من الوحدة؟..." />
              </div>
              <div>
                <label className="label">ملاحظات إضافية</label>
                <textarea className="input-field" rows={2} value={notes} onChange={e => setNotes(e.target.value)} placeholder="أي معلومات إضافية مفيدة..." />
              </div>
              <div>
                <label className="label">صور المشكلة (روابط)</label>
                <div className="space-y-1.5">
                  {images.map((img, i) => (
                    <div key={i} className="flex gap-2">
                      <input className="input-field text-sm flex-1" value={img} onChange={e => { const n = [...images]; n[i] = e.target.value; setImages(n); }} placeholder="https://..." />
                      <button type="button" onClick={() => setImages(images.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-600 px-2">×</button>
                    </div>
                  ))}
                  <button type="button" onClick={() => setImages([...images, ''])} className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1">
                    <PlusCircle className="w-3.5 h-3.5" /> إضافة رابط صورة
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Step 3: Price Quote ── */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="text-center mb-2">
                <p className="font-bold text-gray-800 text-base">عرض السعر</p>
                <p className="text-xs text-gray-500 mt-1">أضف عرض سعر من مقاول أو شركة صيانة (اختياري)</p>
              </div>

              <label className="flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all select-none
                  ${hasQuote ? 'border-orange-400 bg-orange-50' : 'border-gray-200 hover:border-orange-200'}">
                <input type="checkbox" className="w-5 h-5 rounded accent-orange-500" checked={hasQuote} onChange={e => setHasQuote(e.target.checked)} />
                <div>
                  <p className="font-semibold text-gray-800">رفع عرض سعر</p>
                  <p className="text-xs text-gray-500">سيتم إرساله للمالك والمستأجر للموافقة قبل البدء</p>
                </div>
                <Receipt className="w-5 h-5 text-orange-500 mr-auto" />
              </label>

              {hasQuote && (
                <div className="space-y-4 animate-in slide-in-from-top-2">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="label">اسم الشركة / المقاول</label>
                      <input className="input-field text-sm" value={quoteCompany} onChange={e => setQuoteCompany(e.target.value)} placeholder="مثال: شركة الفيصل للصيانة" />
                    </div>
                    <div>
                      <label className="label">صلاحية العرض حتى</label>
                      <input type="date" className="input-field text-sm" value={quoteValidUntil} onChange={e => setQuoteValidUntil(e.target.value)} />
                    </div>
                  </div>

                  {/* Quote items */}
                  <div className="bg-gray-50 rounded-xl p-4 border">
                    <p className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-orange-500" /> بنود عرض السعر
                    </p>
                    <QuoteItemsEditor items={quoteItems} onChange={setQuoteItems} />

                    {/* VAT + Total */}
                    <div className="mt-3 pt-3 border-t space-y-1.5 text-sm">
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 text-gray-600">
                          ضريبة القيمة المضافة
                          <input type="number" min="0" max="100" className="w-14 input-field text-xs py-1 text-center" value={quoteVat} onChange={e => setQuoteVat(+e.target.value)} />
                          <span className="text-xs">%</span>
                        </label>
                        <span className="text-gray-700 font-medium">{quoteVatAmount.toLocaleString()} ر.س</span>
                      </div>
                      <div className="flex justify-between font-bold text-gray-900 text-base">
                        <span>الإجمالي الكلي</span>
                        <span className="text-orange-600">{quoteTotal.toLocaleString()} ر.س</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="label">ملاحظات عرض السعر</label>
                    <textarea className="input-field text-sm" rows={2} value={quoteNotes} onChange={e => setQuoteNotes(e.target.value)} placeholder="شروط الدفع، الضمانات، أوقات التنفيذ..." />
                  </div>
                  <div>
                    <label className="label">رابط ملف عرض السعر (PDF)</label>
                    <input className="input-field text-sm" value={quoteFileUrl} onChange={e => setQuoteFileUrl(e.target.value)} placeholder="https://drive.google.com/..." />
                  </div>

                  {/* Preview summary */}
                  <div className="bg-gradient-to-l from-orange-50 to-amber-50 rounded-xl border border-orange-200 p-4">
                    <p className="text-xs font-bold text-orange-800 mb-2 flex items-center gap-1"><FileCheck className="w-3.5 h-3.5" /> ملخص عرض السعر</p>
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div><p className="text-gray-500">المجموع قبل الضريبة</p><p className="font-bold text-gray-800">{quoteSubtotal.toLocaleString()} ر.س</p></div>
                      <div><p className="text-gray-500">ضريبة {quoteVat}%</p><p className="font-bold text-yellow-700">{quoteVatAmount.toLocaleString()} ر.س</p></div>
                      <div><p className="text-gray-500">الإجمالي الكلي</p><p className="font-bold text-orange-700 text-base">{quoteTotal.toLocaleString()} ر.س</p></div>
                    </div>
                  </div>
                </div>
              )}

              {!hasQuote && (
                <div className="bg-blue-50 rounded-xl p-4 text-xs text-blue-700 border border-blue-200">
                  <p className="font-semibold mb-1">💡 يمكن رفع عرض السعر لاحقاً</p>
                  <p>إذا لم يتوفر عرض السعر الآن، يمكن إضافته لاحقاً من صفحة تفاصيل البلاغ.</p>
                </div>
              )}
            </div>
          )}

          {/* ── Step 4: Approval & Send ── */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="text-center mb-2">
                <p className="font-bold text-gray-800 text-base">إعدادات الموافقة والإرسال</p>
                <p className="text-xs text-gray-500 mt-1">راجع إعدادات الموافقة قبل إرسال البلاغ</p>
              </div>

              {/* Summary card */}
              <div className="bg-gradient-to-l from-orange-50 to-amber-50 rounded-2xl border border-orange-200 p-4 space-y-2 text-sm">
                <p className="font-bold text-orange-800 mb-1">ملخص البلاغ</p>
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-700">
                  <div className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5 text-orange-500" /><span>{selProp?.propertyName}</span></div>
                  <div className="flex items-center gap-1.5"><Hash className="w-3.5 h-3.5 text-blue-500" /><span>وحدة {selUnit?.unitNumber}</span></div>
                  <div className="flex items-center gap-1.5"><span>{categoryIcons[category]}</span><span>{categoryLabels[category]}</span></div>
                  <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full w-fit ${priorityColors[priority]}`}>
                    {priorityLabels[priority]}
                  </div>
                </div>
                <p className="text-xs text-gray-700 mt-2 font-semibold">{title}</p>
                {hasQuote && <div className="mt-1 bg-white rounded-lg px-3 py-2 text-xs"><span className="text-gray-500">عرض السعر: </span><span className="font-bold text-orange-700">{quoteTotal.toLocaleString()} ر.س</span></div>}
              </div>

              {/* Owner info */}
              {owner && (
                <div className="flex items-center gap-3 bg-amber-50 rounded-xl p-3 border border-amber-200">
                  <div className="w-10 h-10 bg-amber-200 rounded-xl flex items-center justify-center text-sm font-bold text-amber-800">{owner.name[0]}</div>
                  <div>
                    <p className="text-xs text-gray-500">المالك</p>
                    <p className="font-semibold text-gray-800">{owner.name}</p>
                    {owner.phone && <p className="text-xs text-gray-500">{owner.phone}</p>}
                  </div>
                  <div className="mr-auto flex gap-2">
                    {owner.phone && (
                      <>
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-lg flex items-center gap-1"><MessageCircle className="w-3 h-3" />واتساب</span>
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-lg flex items-center gap-1"><Smartphone className="w-3 h-3" />SMS</span>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Approval options */}
              <div className="space-y-2">
                <label className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${needsOwnerApproval ? 'border-orange-400 bg-orange-50' : 'border-gray-200'}`}>
                  <input type="checkbox" className="mt-0.5 w-4 h-4 rounded accent-orange-500" checked={needsOwnerApproval} onChange={e => setNeedsOwnerApproval(e.target.checked)} />
                  <div>
                    <p className="font-semibold text-gray-800 text-sm flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-orange-500" />يتطلب موافقة المالك قبل التنفيذ</p>
                    <p className="text-xs text-gray-500 mt-0.5">سيتلقى المالك إشعاراً للموافقة على البلاغ{hasQuote ? ' وعرض السعر' : ''}</p>
                  </div>
                </label>
              </div>

              {/* Technician & schedule (optional) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">تعيين فني (اختياري)</label>
                  <select className="input-field text-sm" value={technicianId} onChange={e => setTechnicianId(e.target.value)}>
                    <option value="">— يُعيَّن لاحقاً —</option>
                    {technicians.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">تاريخ الجدولة (اختياري)</label>
                  <input type="date" className="input-field text-sm" value={scheduledDate} onChange={e => setScheduledDate(e.target.value)} />
                </div>
              </div>

              {/* What happens next */}
              <div className="bg-gray-50 rounded-xl p-4 border text-xs space-y-2">
                <p className="font-bold text-gray-700 mb-2">📋 ما الذي سيحدث بعد الإرسال؟</p>
                <div className="flex items-start gap-2"><div className="w-5 h-5 bg-orange-500 text-white rounded-full flex items-center justify-center text-[10px] shrink-0 mt-0.5">1</div><p>يُنشأ البلاغ برقم <strong>M{1000}+</strong> ويُسجَّل في النظام</p></div>
                {needsOwnerApproval && <div className="flex items-start gap-2"><div className="w-5 h-5 bg-amber-500 text-white rounded-full flex items-center justify-center text-[10px] shrink-0 mt-0.5">2</div><p>يتلقى المالك إشعاراً{hasQuote ? ' مع عرض السعر' : ''} للموافقة أو الرفض</p></div>}
                {hasQuote && <div className="flex items-start gap-2"><div className="w-5 h-5 bg-purple-500 text-white rounded-full flex items-center justify-center text-[10px] shrink-0 mt-0.5">{needsOwnerApproval ? 3 : 2}</div><p>بعد الموافقة يُرسَل عرض السعر للمالك والمستأجر</p></div>}
                <div className="flex items-start gap-2"><div className="w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-[10px] shrink-0 mt-0.5">{needsOwnerApproval ? (hasQuote ? 4 : 3) : (hasQuote ? 3 : 2)}</div><p>يُعيَّن الفني ويبدأ التنفيذ بعد الموافقة</p></div>
                <div className="flex items-start gap-2"><div className="w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center text-[10px] shrink-0 mt-0.5">✓</div><p>يُغلق البلاغ وتُقيَّم الخدمة</p></div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 pt-4 border-t mt-4">
            <button type="button" className="btn-secondary flex-none px-4" onClick={step === 1 ? onClose : () => setStep(s => s - 1)}>
              {step === 1 ? 'إلغاء' : '← السابق'}
            </button>
            <div className="flex-1" />
            {step < 4 ? (
              <button type="button"
                disabled={(step === 1 && !canNext1) || (step === 2 && !canNext2)}
                className="btn-primary flex items-center gap-2 disabled:opacity-40"
                onClick={() => setStep(s => s + 1)}>
                التالي ←
                {step === 1 && !canNext1 && <span className="text-xs opacity-70">(اختر العقار والوحدة)</span>}
                {step === 2 && !canNext2 && <span className="text-xs opacity-70">(أكمل الحقول المطلوبة)</span>}
              </button>
            ) : (
              <button type="button" className="btn-primary flex items-center gap-2" onClick={handleSubmit}>
                <Send className="w-4 h-4" /> إرسال البلاغ
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Property View Card ────────────────────────────────────────
function PropertyMaintenanceCard({ propertyId, requests, onSelect, units, properties }: {
  propertyId: string;
  requests: MaintenanceRequest[];
  onSelect: (r: MaintenanceRequest) => void;
  units: AppState['units'];
  properties: AppState['properties'];
}) {
  const prop = properties.find(p => p.id === propertyId);
  const [open, setOpen] = useState(false);
  const active = requests.filter(r => !['completed', 'cancelled'].includes(r.status));
  const urgent = requests.filter(r => r.priority === 'urgent' && !['completed', 'cancelled'].includes(r.status));

  return (
    <div className="card border-l-4 border-orange-400">
      <div className="flex items-center justify-between cursor-pointer" onClick={() => setOpen(v => !v)}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-lg shrink-0">🏢</div>
          <div>
            <p className="font-bold text-gray-800">{prop?.propertyName ?? propertyId}</p>
            <p className="text-xs text-gray-500">{prop?.city} • {requests.length} بلاغ</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {urgent.length > 0 && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">{urgent.length} عاجل</span>}
          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">{active.length} نشط</span>
          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{requests.filter(r => r.status === 'completed').length} مكتمل</span>
          {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </div>
      </div>
      {open && (
        <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
          {requests.map(r => {
            const unit = units.find(u => u.id === r.unitId);
            return (
              <div key={r.id} className="flex items-center justify-between gap-2 bg-gray-50 rounded-xl p-2.5 cursor-pointer hover:bg-orange-50"
                onClick={() => onSelect(r)}>
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="text-base">{categoryIcons[r.category]}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{r.title}</p>
                    <p className="text-xs text-gray-500">وحدة {unit?.unitNumber ?? '—'} • {daysSince(r.createdAt)} يوم</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <StatusBadge status={r.status} />
                  <span className={`text-xs px-1.5 py-0.5 rounded ${priorityColors[r.priority]}`}>{priorityLabels[r.priority]}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────
export default function MaintenancePage() {
  const { maintenanceRequests, units, properties, users, addMaintenanceRequest, updateMaintenanceRequest, deleteMaintenanceRequest, currentUser } = useStore();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'all' | 'by_property' | 'approval' | 'technician' | 'tenant' | 'owner'>('dashboard');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<MaintenanceRequest | null>(null);
  const [selected, setSelected] = useState<MaintenanceRequest | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterProperty, setFilterProperty] = useState('all');
  const [search, setSearch] = useState('');

  const role = currentUser?.role ?? 'employee';
  const canManage = ['admin', 'employee'].includes(role);

  // Role-based data scope
  const scopedRequests = useMemo(() => {
    if (role === 'tenant') return maintenanceRequests.filter(r => r.tenantId === currentUser?.id);
    if (role === 'technician') return maintenanceRequests.filter(r => r.technicianId === currentUser?.id);
    if (role === 'owner') {
      const ownerPropIds = properties.filter(p => p.ownerId === currentUser?.id).map(p => p.id);
      return maintenanceRequests.filter(r => ownerPropIds.includes(r.propertyId));
    }
    return maintenanceRequests;
  }, [maintenanceRequests, currentUser, role, properties]);

  const filtered = useMemo(() => {
    return scopedRequests.filter(r => {
      if (filterStatus !== 'all' && r.status !== filterStatus) return false;
      if (filterPriority !== 'all' && r.priority !== filterPriority) return false;
      if (filterCategory !== 'all' && r.category !== filterCategory) return false;
      if (filterProperty !== 'all' && r.propertyId !== filterProperty) return false;
      if (search) {
        const q = search.toLowerCase();
        const unit = units.find(u => u.id === r.unitId);
        const prop = properties.find(p => p.id === r.propertyId);
        return r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q)
          || (unit?.unitNumber?.toLowerCase() ?? '').includes(q)
          || (prop?.propertyName?.toLowerCase() ?? '').includes(q)
          || (r.requestNumber ?? '').toLowerCase().includes(q);
      }
      return true;
    });
  }, [scopedRequests, filterStatus, filterPriority, filterCategory, filterProperty, search, units, properties]);

  const kpis = useMemo(() => ({
    total: scopedRequests.length,
    active: scopedRequests.filter(r => !['completed', 'cancelled', 'rejected'].includes(r.status)).length,
    pendingApproval: scopedRequests.filter(r => r.ownerApprovalStatus === 'pending').length,
    urgent: scopedRequests.filter(r => r.priority === 'urgent' && !['completed', 'cancelled'].includes(r.status)).length,
    completed: scopedRequests.filter(r => r.status === 'completed').length,
    avgCost: (() => {
      const done = scopedRequests.filter(r => r.actualCost);
      if (!done.length) return 0;
      return Math.round(done.reduce((s, r) => s + (r.actualCost ?? 0), 0) / done.length);
    })(),
    avgRating: (() => {
      const rated = scopedRequests.filter(r => r.tenantRating);
      if (!rated.length) return 0;
      return (rated.reduce((s, r) => s + (r.tenantRating ?? 0), 0) / rated.length).toFixed(1);
    })(),
    totalCost: scopedRequests.reduce((s, r) => s + (r.actualCost ?? 0), 0),
  }), [scopedRequests]);

  const byProperty = useMemo(() => {
    const map: Record<string, MaintenanceRequest[]> = {};
    scopedRequests.forEach(r => {
      if (!map[r.propertyId]) map[r.propertyId] = [];
      map[r.propertyId].push(r);
    });
    return map;
  }, [scopedRequests]);

  const handleSave = (data: Partial<MaintenanceRequest>) => {
    const now = new Date().toISOString();
    if (editing) {
      updateMaintenanceRequest(editing.id, { ...data, });
    } else {
      const needsApproval = (data as Partial<MaintenanceRequest> & { needsOwnerApproval?: boolean }).needsOwnerApproval !== false;
      const initialStatus: MaintenanceRequest['status'] = needsApproval ? 'pending_approval' : 'new';
      const req: MaintenanceRequest = {
        id: generateId(),
        requestNumber: genRequestNumber(maintenanceRequests),
        unitId: data.unitId ?? '',
        propertyId: data.propertyId ?? units.find(u => u.id === data.unitId)?.propertyId ?? '',
        title: data.title ?? '',
        description: data.description ?? '',
        category: data.category ?? 'other',
        priority: data.priority ?? 'medium',
        status: initialStatus,
        requestSource: data.requestSource ?? 'tenant',
        ownerApprovalStatus: needsApproval ? 'pending' : 'not_required',
        tenantId: role === 'tenant' ? currentUser?.id : undefined,
        statusHistory: [{ status: initialStatus, changedAt: now, changedBy: currentUser?.name ?? 'النظام' }],
        createdAt: now,
        ...data,
      };
      addMaintenanceRequest(req);
    }
    setShowForm(false);
    setEditing(null);
  };

  const handleUpdate = (id: string, data: Partial<MaintenanceRequest>) => {
    updateMaintenanceRequest(id, data);
    if (selected?.id === id) setSelected(prev => prev ? { ...prev, ...data } : null);
  };

  // Tab definitions
  const tabs = [
    { id: 'dashboard', label: 'لوحة التحكم', icon: <BarChart2 className="w-4 h-4" />, roles: ['admin', 'employee', 'owner'] },
    { id: 'all', label: 'جميع البلاغات', icon: <ClipboardList className="w-4 h-4" />, roles: ['admin', 'employee'] },
    { id: 'by_property', label: 'حسب العقار', icon: <Building2 className="w-4 h-4" />, roles: ['admin', 'employee', 'owner'] },
    { id: 'approval', label: 'موافقة الملاك', icon: <Shield className="w-4 h-4" />, roles: ['admin', 'employee', 'owner'], badge: kpis.pendingApproval },
    { id: 'technician', label: 'قائمة الفنيين', icon: <Wrench className="w-4 h-4" />, roles: ['admin', 'employee', 'technician'] },
    { id: 'tenant', label: 'بوابة المستأجر', icon: <Home className="w-4 h-4" />, roles: ['admin', 'employee', 'tenant'] },
    { id: 'owner', label: 'بوابة المالك', icon: <UserCheck className="w-4 h-4" />, roles: ['admin', 'employee', 'owner'] },
  ].filter(t => t.roles.includes(role));

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="section-title flex items-center gap-2">
            <Wrench className="w-6 h-6 text-orange-500" />
            نظام إدارة الصيانة المتكامل
          </h1>
          <p className="section-subtitle">إدارة بلاغات الصيانة مع ربط الملاك والمستأجرين والفنيين</p>
        </div>
        <button className="btn-primary flex items-center gap-2 text-sm" onClick={() => { setEditing(null); setShowForm(true); }}>
          <Plus className="w-4 h-4" /> بلاغ جديد
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 flex-wrap border-b border-gray-200 pb-1">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-t-xl text-xs font-semibold transition-colors relative ${activeTab === tab.id ? 'bg-orange-500 text-white shadow' : 'text-gray-600 hover:bg-orange-50'}`}>
            {tab.icon} {tab.label}
            {(tab.badge ?? 0) > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white rounded-full text-[10px] flex items-center justify-center font-bold">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ══ TAB: Dashboard ══ */}
      {activeTab === 'dashboard' && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
            <KpiCard label="إجمالي البلاغات" value={kpis.total} icon={<ClipboardList className="w-5 h-5 text-orange-600" />} color="bg-orange-100" />
            <KpiCard label="نشطة" value={kpis.active} icon={<Clock className="w-5 h-5 text-yellow-600" />} color="bg-yellow-100" />
            <KpiCard label="بانتظار الموافقة" value={kpis.pendingApproval} icon={<AlertTriangle className="w-5 h-5 text-orange-600" />} color="bg-orange-50" urgent={kpis.pendingApproval > 0} />
            <KpiCard label="عاجلة" value={kpis.urgent} icon={<Zap className="w-5 h-5 text-red-600" />} color="bg-red-100" urgent={kpis.urgent > 0} />
            <KpiCard label="مكتملة" value={kpis.completed} icon={<CheckCircle className="w-5 h-5 text-green-600" />} color="bg-green-100" />
            <KpiCard label="متوسط التكلفة" value={`${kpis.avgCost.toLocaleString()} ر.س`} icon={<DollarSign className="w-5 h-5 text-blue-600" />} color="bg-blue-100" />
            <KpiCard label="إجمالي التكاليف" value={`${kpis.totalCost.toLocaleString()} ر.س`} icon={<TrendingUp className="w-5 h-5 text-purple-600" />} color="bg-purple-100" />
            <KpiCard label="متوسط التقييم" value={`${kpis.avgRating} ★`} icon={<Star className="w-5 h-5 text-yellow-500" />} color="bg-yellow-50" />
          </div>

          {/* Alerts */}
          {kpis.pendingApproval > 0 && (
            <div className="bg-orange-50 border border-orange-300 rounded-2xl p-4 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-500 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-bold text-orange-800">{kpis.pendingApproval} بلاغ بانتظار موافقة المالك</p>
                <p className="text-xs text-orange-600 mt-0.5">يرجى مراجعة البلاغات ومتابعة الموافقة مع الملاك</p>
              </div>
              <button onClick={() => setActiveTab('approval')} className="text-xs bg-orange-500 text-white px-3 py-1.5 rounded-lg hover:bg-orange-600">عرض</button>
            </div>
          )}
          {kpis.urgent > 0 && (
            <div className="bg-red-50 border border-red-300 rounded-2xl p-4 flex items-center gap-3">
              <Zap className="w-5 h-5 text-red-500 shrink-0" />
              <p className="text-sm font-bold text-red-800">{kpis.urgent} بلاغ عاجل يتطلب تدخلاً فورياً</p>
            </div>
          )}

          {/* Category breakdown */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="card">
              <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2"><BarChart2 className="w-4 h-4 text-orange-500" />توزيع البلاغات حسب الفئة</h3>
              {(() => {
                const data = Object.entries(categoryLabels).map(([k, label]) => ({
                  k, label, count: scopedRequests.filter(r => r.category === k).length
                })).filter(d => d.count > 0);
                const total = data.reduce((s, d) => s + d.count, 0);
                const colors = ['bg-blue-500', 'bg-yellow-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 'bg-orange-500', 'bg-gray-400', 'bg-teal-500', 'bg-red-400'];
                return total ? (
                  <div className="space-y-2.5">
                    {data.map((d, i) => (
                      <div key={d.k} className="flex items-center gap-3">
                        <span className="text-xs w-20 text-gray-600 shrink-0">{categoryIcons[d.k]} {d.label}</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
                          <div className={`h-2.5 rounded-full ${colors[i % colors.length]}`} style={{ width: `${(d.count / total) * 100}%` }} />
                        </div>
                        <span className="text-xs font-bold text-gray-700 w-5 text-right">{d.count}</span>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-sm text-gray-400 text-center py-4">لا توجد بيانات</p>;
              })()}
            </div>

            <div className="card">
              <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-indigo-500" /> توزيع حسب الحالة</h3>
              {(() => {
                const data = Object.entries(statusLabels).map(([k, label]) => ({
                  k, label, count: scopedRequests.filter(r => r.status === k).length
                })).filter(d => d.count > 0);
                const total = data.reduce((s, d) => s + d.count, 0);
                return total ? (
                  <div className="space-y-2">
                    {data.map(d => (
                      <div key={d.k} className="flex items-center justify-between">
                        <StatusBadge status={d.k} />
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                            <div className="h-1.5 rounded-full bg-orange-400" style={{ width: `${(d.count / total) * 100}%` }} />
                          </div>
                          <span className="text-xs font-bold text-gray-700 w-5 text-right">{d.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-sm text-gray-400 text-center py-4">لا توجد بيانات</p>;
              })()}
            </div>
          </div>

          {/* Recent urgent */}
          {scopedRequests.filter(r => r.priority === 'urgent' && !['completed', 'cancelled'].includes(r.status)).length > 0 && (
            <div className="card">
              <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2"><Zap className="w-4 h-4 text-red-500" />البلاغات العاجلة النشطة</h3>
              <div className="space-y-2">
                {scopedRequests.filter(r => r.priority === 'urgent' && !['completed', 'cancelled'].includes(r.status)).slice(0, 5).map(r => {
                  const prop = properties.find(p => p.id === r.propertyId);
                  const unit = units.find(u => u.id === r.unitId);
                  return (
                    <div key={r.id} className="flex items-center justify-between bg-red-50 rounded-xl p-3 cursor-pointer hover:bg-red-100" onClick={() => setSelected(r)}>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{r.title}</p>
                        <p className="text-xs text-gray-500">{prop?.propertyName} • وحدة {unit?.unitNumber}</p>
                      </div>
                      <StatusBadge status={r.status} />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══ TAB: All Requests ══ */}
      {activeTab === 'all' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex gap-3 flex-wrap items-center">
            <div className="relative flex-1 min-w-52">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input className="input-field pr-9" placeholder="بحث برقم البلاغ، العنوان، العقار..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="input-field w-36" value={filterProperty} onChange={e => setFilterProperty(e.target.value)}>
              <option value="all">كل العقارات</option>
              {properties.map(p => <option key={p.id} value={p.id}>{p.propertyName}</option>)}
            </select>
            <select className="input-field w-32" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
              <option value="all">كل الفئات</option>
              {Object.entries(categoryLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            <select className="input-field w-32" value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
              <option value="all">كل الأولويات</option>
              {Object.entries(priorityLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          {/* Status tabs */}
          <div className="flex gap-2 flex-wrap">
            {['all', ...Object.keys(statusLabels)].map(s => {
              const cnt = s === 'all' ? scopedRequests.length : scopedRequests.filter(r => r.status === s).length;
              return (
                <button key={s} onClick={() => setFilterStatus(s)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1 transition-colors ${filterStatus === s ? 'bg-orange-500 text-white shadow' : 'bg-white border text-gray-600 hover:bg-orange-50'}`}>
                  {s === 'all' ? 'الكل' : statusLabels[s]}
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${filterStatus === s ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>{cnt}</span>
                </button>
              );
            })}
          </div>
          {/* List */}
          <div className="space-y-3">
            {filtered.length === 0 ? (
              <div className="card text-center py-12 text-gray-400">
                <Wrench className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>لا توجد بلاغات مطابقة</p>
              </div>
            ) : filtered.map(r => {
              const unit = units.find(u => u.id === r.unitId);
              const prop = properties.find(p => p.id === r.propertyId);
              const tech = users.find(u => u.id === r.technicianId);
              const tenantUser = users.find(u => u.id === r.tenantId);
              return (
                <div key={r.id}
                  className={`card hover:shadow-md transition-all cursor-pointer ${r.priority === 'urgent' ? 'border-l-4 border-red-500' : r.priority === 'high' ? 'border-l-4 border-orange-400' : ''}`}
                  onClick={() => setSelected(r)}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="w-11 h-11 bg-orange-50 rounded-xl flex items-center justify-center text-xl shrink-0">{categoryIcons[r.category]}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-mono text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">#{r.requestNumber}</span>
                          <StatusBadge status={r.status} />
                          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${priorityColors[r.priority]}`}>{priorityLabels[r.priority]}</span>
                          {r.ownerApprovalStatus === 'pending' && <span className="text-xs text-orange-600 font-bold flex items-center gap-1"><Shield className="w-3 h-3" />بانتظار الموافقة</span>}
                        </div>
                        <p className="font-bold text-gray-800 truncate">{r.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-2">
                          <Building2 className="w-3 h-3" />{prop?.propertyName ?? '—'} • وحدة {unit?.unitNumber ?? '—'}
                          {tenantUser && <span className="flex items-center gap-1"><User className="w-3 h-3" />{tenantUser.name}</span>}
                          {tech && <span className="flex items-center gap-1 text-blue-600"><Wrench className="w-3 h-3" />{tech.name}</span>}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0 text-xs text-gray-500">
                      <span>{daysSince(r.createdAt) === 0 ? 'اليوم' : `${daysSince(r.createdAt)} يوم`}</span>
                      {r.estimatedCost && <span className="text-yellow-700"><DollarSign className="w-3 h-3 inline" />{r.estimatedCost.toLocaleString()}</span>}
                      {r.tenantRating && <StarRating value={r.tenantRating} size="sm" />}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                    <span className="text-xs text-gray-400">{categoryLabels[r.category]} • {sourceLabels[r.requestSource]}</span>
                    <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                      {canManage && (
                        <>
                          <button onClick={() => { setEditing(r); setShowForm(true); }} className="w-7 h-7 flex items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 hover:bg-indigo-200">
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => { if (confirm('حذف البلاغ؟')) deleteMaintenanceRequest(r.id); }} className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-100 text-red-500 hover:bg-red-200">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ══ TAB: By Property ══ */}
      {activeTab === 'by_property' && (
        <div className="space-y-3">
          {Object.keys(byProperty).length === 0 ? (
            <div className="card text-center py-12 text-gray-400"><Building2 className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>لا توجد بلاغات</p></div>
          ) : (
            Object.entries(byProperty)
              .sort((a, b) => b[1].filter(r => !['completed', 'cancelled'].includes(r.status)).length - a[1].filter(r => !['completed', 'cancelled'].includes(r.status)).length)
              .map(([propId, reqs]) => (
                <PropertyMaintenanceCard key={propId} propertyId={propId} requests={reqs} onSelect={setSelected} units={units} properties={properties} />
              ))
          )}
        </div>
      )}

      {/* ══ TAB: Owner Approval ══ */}
      {activeTab === 'approval' && (
        <div className="space-y-4">
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4">
            <p className="text-sm font-bold text-orange-800 flex items-center gap-2"><Shield className="w-4 h-4" />قائمة البلاغات بانتظار موافقة الملاك</p>
            <p className="text-xs text-orange-600 mt-1">يجب على المالك الموافقة قبل بدء التنفيذ</p>
          </div>
          {scopedRequests.filter(r => r.ownerApprovalStatus === 'pending').length === 0 ? (
            <div className="card text-center py-12 text-gray-400">
              <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-30 text-green-400" />
              <p className="text-green-600 font-medium">لا توجد بلاغات معلقة — جميعها تمت مراجعتها</p>
            </div>
          ) : (
            scopedRequests.filter(r => r.ownerApprovalStatus === 'pending').map(r => {
              const prop = properties.find(p => p.id === r.propertyId);
              const unit = units.find(u => u.id === r.unitId);
              const owner = users.find(u => u.id === prop?.ownerId);
              return (
                <div key={r.id} className="card border-2 border-orange-300 cursor-pointer hover:shadow-md" onClick={() => setSelected(r)}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-11 h-11 bg-orange-100 rounded-xl flex items-center justify-center text-xl">{categoryIcons[r.category]}</div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-xs text-gray-400">#{r.requestNumber}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${priorityColors[r.priority]}`}>{priorityLabels[r.priority]}</span>
                        </div>
                        <p className="font-bold text-gray-800">{r.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{prop?.propertyName} • وحدة {unit?.unitNumber}</p>
                        {owner && <p className="text-xs text-indigo-600 mt-0.5 flex items-center gap-1"><UserCheck className="w-3 h-3" />المالك: {owner.name} — {owner.phone}</p>}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5 shrink-0 text-right text-xs text-gray-500">
                      <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-bold">⏳ بانتظار الموافقة</span>
                      <span>{daysSince(r.createdAt)} يوم</span>
                      {r.estimatedCost && <span><DollarSign className="w-3 h-3 inline" />{r.estimatedCost.toLocaleString()} ر.س</span>}
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-100 flex gap-2 justify-end" onClick={e => e.stopPropagation()}>
                    {owner?.phone && canManage && (
                      <>
                        <button onClick={() => sendSMS(owner.phone!, r)} className="text-xs flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-lg hover:bg-blue-200">
                          <Smartphone className="w-3 h-3" />SMS
                        </button>
                        <button onClick={() => sendWhatsApp(owner.phone!, r)} className="text-xs flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-lg hover:bg-green-200">
                          <MessageCircle className="w-3 h-3" />واتساب
                        </button>
                      </>
                    )}
                    <button onClick={() => setSelected(r)} className="text-xs flex items-center gap-1 bg-orange-100 text-orange-700 px-2 py-1 rounded-lg hover:bg-orange-200">
                      <Eye className="w-3 h-3" />مراجعة وموافقة
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ══ TAB: Technician Queue ══ */}
      {activeTab === 'technician' && (
        <div className="space-y-4">
          {users.filter(u => u.role === 'technician').length === 0 ? (
            <div className="card text-center py-12 text-gray-400"><User className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>لا يوجد فنيون مسجلون</p></div>
          ) : (
            users.filter(u => u.role === 'technician').map(tech => {
              const techReqs = scopedRequests.filter(r => r.technicianId === tech.id && !['completed', 'cancelled'].includes(r.status));
              return (
                <div key={tech.id} className="card">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-sm font-bold text-blue-700">{tech.name[0]}</div>
                    <div>
                      <p className="font-bold text-gray-800">{tech.name}</p>
                      <p className="text-xs text-gray-500">{tech.phone ?? '—'}</p>
                    </div>
                    <div className="mr-auto flex gap-1.5">
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">{techReqs.length} مهمة نشطة</span>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{scopedRequests.filter(r => r.technicianId === tech.id && r.status === 'completed').length} مكتمل</span>
                    </div>
                  </div>
                  {techReqs.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-3">لا توجد مهام نشطة</p>
                  ) : (
                    <div className="space-y-2">
                      {techReqs.sort((a, b) => {
                        const po: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 };
                        return po[a.priority] - po[b.priority];
                      }).map(r => {
                        const prop = properties.find(p => p.id === r.propertyId);
                        const unit = units.find(u => u.id === r.unitId);
                        return (
                          <div key={r.id} className="flex items-center justify-between bg-gray-50 rounded-xl p-2.5 cursor-pointer hover:bg-blue-50" onClick={() => setSelected(r)}>
                            <div className="flex items-center gap-2">
                              <span className="text-base">{categoryIcons[r.category]}</span>
                              <div>
                                <p className="text-sm font-semibold text-gray-800">{r.title}</p>
                                <p className="text-xs text-gray-500">{prop?.propertyName} • وحدة {unit?.unitNumber}</p>
                                {r.scheduledDate && <p className="text-xs text-indigo-600 flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(r.scheduledDate).toLocaleDateString('ar-SA')}</p>}
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <StatusBadge status={r.status} />
                              <span className={`text-xs px-1.5 py-0.5 rounded ${priorityColors[r.priority]}`}>{priorityLabels[r.priority]}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ══ TAB: Tenant Portal ══ */}
      {activeTab === 'tenant' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-l from-indigo-50 to-blue-50 border border-indigo-200 rounded-2xl p-4">
            <p className="font-bold text-indigo-800 flex items-center gap-2"><Home className="w-4 h-4" />بوابة المستأجر للصيانة</p>
            <p className="text-xs text-indigo-600 mt-1">يمكنك تقديم بلاغ صيانة جديد أو متابعة بلاغاتك الحالية</p>
          </div>
          <button className="btn-primary w-full flex items-center justify-center gap-2" onClick={() => { setEditing(null); setShowForm(true); }}>
            <Plus className="w-4 h-4" /> تقديم بلاغ صيانة جديد
          </button>
          {scopedRequests.filter(r => r.tenantId === currentUser?.id || role !== 'tenant').length === 0 ? (
            <div className="card text-center py-12 text-gray-400"><Wrench className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>لا توجد بلاغات مقدمة</p></div>
          ) : (
            <div className="space-y-3">
              {(role === 'tenant' ? scopedRequests : scopedRequests.slice(0, 10)).map(r => {
                const prop = properties.find(p => p.id === r.propertyId);
                const unit = units.find(u => u.id === r.unitId);
                return (
                  <div key={r.id} className="card cursor-pointer hover:shadow-md border-r-4 border-indigo-400" onClick={() => setSelected(r)}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-xl">{categoryIcons[r.category]}</div>
                        <div>
                          <p className="font-bold text-gray-800">{r.title}</p>
                          <p className="text-xs text-gray-500">{prop?.propertyName} • وحدة {unit?.unitNumber}</p>
                          <p className="text-xs text-gray-400 mt-0.5">تاريخ التقديم: {new Date(r.createdAt).toLocaleDateString('ar-SA')}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <StatusBadge status={r.status} />
                        {r.ownerApprovalStatus === 'pending' && <span className="text-xs text-orange-600 flex items-center gap-1"><Shield className="w-3 h-3" />انتظار موافقة</span>}
                        {r.ownerApprovalStatus === 'rejected' && <span className="text-xs text-red-600">مرفوض من المالك</span>}
                        {r.tenantRating ? <StarRating value={r.tenantRating} size="sm" /> : (r.status === 'completed' ? <span className="text-xs text-indigo-500 underline cursor-pointer">قيّم الخدمة</span> : null)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ══ TAB: Owner Portal ══ */}
      {activeTab === 'owner' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-l from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl p-4">
            <p className="font-bold text-amber-800 flex items-center gap-2"><UserCheck className="w-4 h-4" />بوابة المالك — رؤية شاملة لصيانة عقاراتك</p>
            <div className="grid grid-cols-4 gap-3 mt-3 text-center text-xs">
              <div className="bg-white rounded-xl p-2"><p className="text-xl font-bold text-amber-700">{kpis.total}</p><p className="text-gray-500">إجمالي البلاغات</p></div>
              <div className="bg-white rounded-xl p-2"><p className="text-xl font-bold text-orange-600">{kpis.pendingApproval}</p><p className="text-gray-500">تنتظر موافقتك</p></div>
              <div className="bg-white rounded-xl p-2"><p className="text-xl font-bold text-green-600">{kpis.completed}</p><p className="text-gray-500">مكتملة</p></div>
              <div className="bg-white rounded-xl p-2"><p className="text-xl font-bold text-blue-600">{kpis.totalCost.toLocaleString()}</p><p className="text-gray-500">ر.س تكاليف</p></div>
            </div>
          </div>

          {/* Pending approval for owner */}
          {scopedRequests.filter(r => r.ownerApprovalStatus === 'pending').length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-bold text-orange-700 flex items-center gap-1"><AlertTriangle className="w-4 h-4" />تتطلب موافقتك ({scopedRequests.filter(r => r.ownerApprovalStatus === 'pending').length})</p>
              {scopedRequests.filter(r => r.ownerApprovalStatus === 'pending').map(r => {
                const prop = properties.find(p => p.id === r.propertyId);
                const unit = units.find(u => u.id === r.unitId);
                return (
                  <div key={r.id} className="card border-2 border-orange-300 cursor-pointer hover:bg-orange-50" onClick={() => setSelected(r)}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{categoryIcons[r.category]}</span>
                        <div>
                          <p className="font-bold">{r.title}</p>
                          <p className="text-xs text-gray-500">{prop?.propertyName} • وحدة {unit?.unitNumber} • {priorityLabels[r.priority]}</p>
                          {r.estimatedCost && <p className="text-xs text-yellow-700 mt-0.5">التكلفة التقديرية: {r.estimatedCost.toLocaleString()} ر.س</p>}
                        </div>
                      </div>
                      <div className="text-xs text-orange-600 font-bold">انقر للموافقة / الرفض</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* All owner requests by property */}
          <div className="space-y-3">
            <p className="text-sm font-bold text-gray-700">جميع بلاغات الصيانة حسب العقار</p>
            {Object.entries(byProperty).map(([propId, reqs]) => (
              <PropertyMaintenanceCard key={propId} propertyId={propId} requests={reqs} onSelect={setSelected} units={units} properties={properties} />
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      {showForm && (
        <RequestForm editing={editing} onSave={handleSave} onClose={() => { setShowForm(false); setEditing(null); }} />
      )}
      {selected && (
        <RequestDetail
          req={selected}
          onClose={() => setSelected(null)}
          onUpdate={handleUpdate}
          role={role}
          users={users}
          units={units}
          properties={properties}
        />
      )}
    </div>
  );
}
