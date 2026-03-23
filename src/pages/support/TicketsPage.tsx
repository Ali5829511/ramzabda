import { useState, useMemo } from 'react';
import { useStore, generateId } from '../../data/store';
import type { SupportTicket, TicketComment } from '../../types';
import {
  Ticket, Plus, Search, Filter, ChevronDown, ChevronUp, Edit, Trash2,
  MessageCircle, CheckCircle, Clock, AlertTriangle, XCircle, ArrowUpCircle,
  User, Phone, Building2, Send, Star, Printer, Tag,
  TrendingUp, BarChart2, AlertCircle, Flag, Eye, EyeOff,
  MessageSquare, ThumbsUp, Zap, Calendar, Hash, Smartphone, RefreshCw
} from 'lucide-react';

// ── Ticket Number Generator ────────────────────────────────────
const categoryPrefix: Record<string, string> = {
  complaint: 'A',
  inquiry: 'I',
  request: 'R',
  maintenance: 'M',
  billing: 'F',
  legal: 'L',
  other: 'O',
};

function generateTicketNumber(category: string, existingTickets: SupportTicket[]): string {
  const prefix = categoryPrefix[category] ?? 'T';
  const prefixTickets = existingTickets.filter(t => (t.ticketPrefix ?? categoryPrefix[t.category]) === prefix);
  const nextNum = 1000 + prefixTickets.length;
  return `${prefix}${nextNum}`;
}

// ── SMS / WhatsApp helpers ─────────────────────────────────────
function sendSMS(phone: string, ticket: SupportTicket) {
  if (!phone) return;
  const num = phone.replace(/\D/g, '');
  const intl = num.startsWith('966') ? num : `966${num.replace(/^0/, '')}`;
  const msg = encodeURIComponent(
    `رمز الإبداع لإدارة الأملاك\nتذكرة رقم: ${ticket.ticketNumber}\nالموضوع: ${ticket.title}\nالحالة: ${ticket.status === 'open' ? 'مفتوح' : ticket.status === 'resolved' ? 'محلول' : ticket.status === 'closed' ? 'مغلق' : 'قيد المعالجة'}\nللاستفسار: 920000000`
  );
  window.open(`sms:+${intl}?body=${msg}`, '_blank');
}

function sendWhatsApp(phone: string, ticket: SupportTicket) {
  if (!phone) return;
  const num = phone.replace(/\D/g, '');
  const intl = num.startsWith('966') ? num : `966${num.replace(/^0/, '')}`;
  const msg = encodeURIComponent(
    `*رمز الإبداع لإدارة الأملاك*\n\n` +
    `تذكرة رقم: *${ticket.ticketNumber}*\n` +
    `الموضوع: ${ticket.title}\n` +
    `الفئة: ${ticket.category === 'complaint' ? 'شكوى' : ticket.category === 'inquiry' ? 'استفسار' : ticket.category === 'maintenance' ? 'صيانة' : 'طلب'}\n` +
    `الأولوية: ${ticket.priority === 'urgent' ? 'عاجلة 🔴' : ticket.priority === 'high' ? 'عالية 🟠' : ticket.priority === 'medium' ? 'متوسطة 🟡' : 'منخفضة 🟢'}\n` +
    `الحالة: ${ticket.status === 'open' ? 'مفتوح' : ticket.status === 'resolved' ? 'محلول ✅' : ticket.status === 'closed' ? 'مغلق' : 'قيد المعالجة ⏳'}\n\n` +
    `شكراً لتواصلك معنا، سيتم متابعتك في أقرب وقت.`
  );
  window.open(`https://wa.me/${intl}?text=${msg}`, '_blank');
}

// ── Maps ──────────────────────────────────────────────────────
const categoryLabels: Record<string, string> = {
  complaint: 'شكوى', inquiry: 'استفسار', request: 'طلب خدمة',
  maintenance: 'صيانة', billing: 'فواتير ومالية', legal: 'قانوني', other: 'أخرى'
};
const categoryColors: Record<string, string> = {
  complaint: 'bg-red-100 text-red-700',
  inquiry: 'bg-blue-100 text-blue-700',
  request: 'bg-green-100 text-green-700',
  maintenance: 'bg-orange-100 text-orange-700',
  billing: 'bg-yellow-100 text-yellow-800',
  legal: 'bg-purple-100 text-purple-700',
  other: 'bg-gray-100 text-gray-600'
};
const priorityLabels: Record<string, string> = {
  low: 'منخفضة', medium: 'متوسطة', high: 'عالية', urgent: 'عاجلة'
};
const priorityColors: Record<string, string> = {
  low: 'bg-gray-100 text-gray-500',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700 animate-pulse'
};
const statusLabels: Record<string, string> = {
  open: 'مفتوح', in_progress: 'قيد المعالجة', pending_customer: 'بانتظار العميل',
  escalated: 'مُصعَّد', resolved: 'محلول', closed: 'مغلق'
};
const statusColors: Record<string, string> = {
  open: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-yellow-100 text-yellow-800',
  pending_customer: 'bg-purple-100 text-purple-700',
  escalated: 'bg-red-100 text-red-700',
  resolved: 'bg-green-100 text-green-700',
  closed: 'bg-gray-100 text-gray-500'
};
const channelLabels: Record<string, string> = {
  phone: 'هاتف', whatsapp: 'واتساب', email: 'بريد إلكتروني',
  walk_in: 'حضور شخصي', portal: 'بوابة إلكترونية', sms: 'رسالة نصية'
};
const channelIcons: Record<string, string> = {
  phone: '📞', whatsapp: '💬', email: '📧',
  walk_in: '🚶', portal: '🌐', sms: '📱'
};

// SLA hours by priority
const slHours: Record<string, number> = { low: 72, medium: 48, high: 24, urgent: 4 };

function getSlaStatus(ticket: SupportTicket): 'ok' | 'warning' | 'breached' {
  if (ticket.status === 'resolved' || ticket.status === 'closed') return 'ok';
  const created = new Date(ticket.createdAt).getTime();
  const deadline = created + slHours[ticket.priority] * 3600000;
  const now = Date.now();
  const remaining = deadline - now;
  if (remaining < 0) return 'breached';
  if (remaining < 3600000 * 4) return 'warning';
  return 'ok';
}

function formatHoursAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return 'منذ أقل من ساعة';
  if (h < 24) return `منذ ${h} ساعة`;
  return `منذ ${Math.floor(h / 24)} يوم`;
}

// ── KPI Card ─────────────────────────────────────────────────
function KpiCard({ label, value, icon, color, sub, urgent }: {
  label: string; value: string | number; icon: React.ReactNode; color: string; sub?: string; urgent?: boolean;
}) {
  return (
    <div className={`card flex items-center gap-3 ${urgent ? 'border-red-300 bg-red-50' : ''}`}>
      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${color}`}>{icon}</div>
      <div>
        <p className="text-xl font-bold text-gray-800">{value}</p>
        <p className="text-xs text-gray-500">{label}</p>
        {sub && <p className="text-xs text-green-600 font-semibold">{sub}</p>}
      </div>
    </div>
  );
}

// ── Star Rating ───────────────────────────────────────────────
function StarRating({ value, onChange }: { value?: number; onChange?: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(s => (
        <button key={s} type="button" onClick={() => onChange?.(s)}
          className={`text-xl transition-transform hover:scale-110 ${s <= (value ?? 0) ? 'text-yellow-400' : 'text-gray-300'}`}>
          ★
        </button>
      ))}
    </div>
  );
}

// ── Print ticket ──────────────────────────────────────────────
function printTicket(ticket: SupportTicket, assigneeName?: string) {
  const win = window.open('', '_blank');
  if (!win) return;
  const sla = getSlaStatus(ticket);
  win.document.write(`<!DOCTYPE html><html dir="rtl" lang="ar"><head>
  <meta charset="UTF-8"><title>تذكرة #${ticket.ticketNumber}</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:'Segoe UI',Arial,sans-serif;direction:rtl;color:#1a1a2e;background:#f8f9fa}
    .page{max-width:794px;margin:0 auto;padding:32px;background:#fff}
    .header{background:linear-gradient(135deg,#1a1a2e,#2d2d5e);color:#fff;padding:24px 28px;border-radius:16px 16px 0 0;display:flex;justify-content:space-between;align-items:flex-start}
    .header h1{font-size:18px;font-weight:900}
    .header p{font-size:11px;opacity:.8;margin-top:4px}
    .ticket-meta{background:#f1f5f9;padding:18px 24px;display:flex;gap:16px;flex-wrap:wrap;border-bottom:1px solid #e2e8f0}
    .meta-item{display:flex;flex-direction:column;gap:2px}
    .meta-lbl{font-size:10px;color:#64748b}
    .meta-val{font-size:12px;font-weight:700;color:#1e293b}
    .badge{display:inline-block;padding:2px 10px;border-radius:20px;font-size:11px;font-weight:700}
    .badge-open{background:#dbeafe;color:#1d4ed8}
    .badge-resolved{background:#dcfce7;color:#16a34a}
    .badge-escalated{background:#fee2e2;color:#dc2626}
    .badge-urgent{background:#fee2e2;color:#dc2626}
    .badge-high{background:#ffedd5;color:#c2410c}
    .badge-medium{background:#dbeafe;color:#1d4ed8}
    .badge-low{background:#f1f5f9;color:#475569}
    .body{padding:24px}
    .section{margin-bottom:20px}
    .section-title{font-size:12px;font-weight:800;color:#6366f1;border-right:3px solid #6366f1;padding:4px 10px;margin-bottom:10px;background:#f0f0ff;border-radius:0 6px 6px 0}
    .desc{background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:14px;font-size:13px;line-height:1.7;color:#334155}
    .resolution{background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:14px;font-size:13px;color:#166534}
    .comment{border-right:3px solid #6366f1;padding:8px 12px;margin-bottom:8px;background:#f8f8ff;border-radius:0 8px 8px 0}
    .comment.internal{border-color:#f59e0b;background:#fffbeb}
    .comment-meta{font-size:10px;color:#94a3b8;margin-bottom:4px}
    .comment-text{font-size:12px;color:#334155}
    .history-item{display:flex;gap:8px;align-items:flex-start;margin-bottom:8px;font-size:11px;color:#475569}
    .history-dot{width:8px;height:8px;border-radius:50%;background:#6366f1;margin-top:3px;shrink:0}
    .sla-ok{color:#16a34a} .sla-warning{color:#d97706} .sla-breached{color:#dc2626}
    .footer{text-align:center;font-size:10px;color:#94a3b8;margin-top:24px;padding-top:16px;border-top:1px solid #e2e8f0}
    .stars{color:#f59e0b;font-size:16px;letter-spacing:2px}
    @media print{body{print-color-adjust:exact;-webkit-print-color-adjust:exact}}
  </style></head><body><div class="page">
  <div class="header">
    <div>
      <h1>🎫 تذكرة دعم وشكاوى</h1>
      <p>رمز الإبداع لإدارة الأملاك | نظام تتبع الشكاوى</p>
    </div>
    <div style="text-align:left">
      <div style="font-size:22px;font-weight:900;font-family:monospace">#${ticket.ticketNumber}</div>
      <div style="font-size:10px;opacity:.7">${new Date(ticket.createdAt).toLocaleString('ar-SA')}</div>
    </div>
  </div>
  <div class="ticket-meta">
    <div class="meta-item"><span class="meta-lbl">الحالة</span><span class="badge badge-${ticket.status}">${statusLabels[ticket.status]}</span></div>
    <div class="meta-item"><span class="meta-lbl">الأولوية</span><span class="badge badge-${ticket.priority}">${priorityLabels[ticket.priority]}</span></div>
    <div class="meta-item"><span class="meta-lbl">الفئة</span><span class="meta-val">${categoryLabels[ticket.category]}</span></div>
    <div class="meta-item"><span class="meta-lbl">القناة</span><span class="meta-val">${channelIcons[ticket.channel]} ${channelLabels[ticket.channel]}</span></div>
    ${assigneeName ? `<div class="meta-item"><span class="meta-lbl">المسؤول</span><span class="meta-val">${assigneeName}</span></div>` : ''}
    <div class="meta-item"><span class="meta-lbl">SLA</span><span class="meta-val sla-${sla}">${sla === 'ok' ? '✅ ضمن المدة' : sla === 'warning' ? '⚠️ ينتهي قريباً' : '❌ تجاوز المدة'}</span></div>
    ${ticket.resolvedAt ? `<div class="meta-item"><span class="meta-lbl">تاريخ الحل</span><span class="meta-val">${new Date(ticket.resolvedAt).toLocaleDateString('ar-SA')}</span></div>` : ''}
  </div>
  <div class="body">
    ${ticket.customerName ? `<div class="section">
      <div class="section-title">بيانات العميل</div>
      <div class="desc"><strong>${ticket.customerName}</strong>${ticket.customerPhone ? ` — ${ticket.customerPhone}` : ''}</div>
    </div>` : ''}
    <div class="section">
      <div class="section-title">عنوان التذكرة</div>
      <div class="desc" style="font-size:15px;font-weight:700">${ticket.title}</div>
    </div>
    <div class="section">
      <div class="section-title">تفاصيل الشكوى / الطلب</div>
      <div class="desc">${ticket.description}</div>
    </div>
    ${ticket.resolution ? `<div class="section">
      <div class="section-title">✅ الحل والإجراء المتخذ</div>
      <div class="resolution">${ticket.resolution}</div>
    </div>` : ''}
    ${ticket.satisfactionRating ? `<div class="section">
      <div class="section-title">تقييم رضا العميل</div>
      <div class="desc">
        <div class="stars">${'★'.repeat(ticket.satisfactionRating)}${'☆'.repeat(5 - ticket.satisfactionRating)}</div>
        ${ticket.satisfactionNote ? `<p style="margin-top:6px;font-size:12px;color:#475569">${ticket.satisfactionNote}</p>` : ''}
      </div>
    </div>` : ''}
    ${ticket.comments && ticket.comments.filter(c => !c.isInternal).length > 0 ? `<div class="section">
      <div class="section-title">التعليقات والمراسلات</div>
      ${ticket.comments.filter(c => !c.isInternal).map(c => `
        <div class="comment">
          <div class="comment-meta">${c.authorName} — ${new Date(c.createdAt).toLocaleString('ar-SA')}</div>
          <div class="comment-text">${c.text}</div>
        </div>`).join('')}
    </div>` : ''}
    ${ticket.statusHistory && ticket.statusHistory.length > 0 ? `<div class="section">
      <div class="section-title">سجل الحالات</div>
      ${ticket.statusHistory.map(h => `
        <div class="history-item">
          <div class="history-dot"></div>
          <span><strong>${statusLabels[h.status] ?? h.status}</strong> — ${h.changedBy} — ${new Date(h.changedAt).toLocaleString('ar-SA')}${h.note ? ` — ${h.note}` : ''}</span>
        </div>`).join('')}
    </div>` : ''}
  </div>
  <div class="footer">طُبع: ${new Date().toLocaleString('ar-SA')} | رمز الإبداع لإدارة الأملاك | ramzabdae.com</div>
</div></body></html>`);
  win.document.close();
  win.print();
}

// ── Ticket Detail Modal ───────────────────────────────────────
function TicketDetail({ ticket, onClose, onUpdate }: {
  ticket: SupportTicket;
  onClose: () => void;
  onUpdate: (id: string, data: Partial<SupportTicket>) => void;
}) {
  const { users, currentUser } = useStore();
  const [newComment, setNewComment] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [resolution, setResolution] = useState(ticket.resolution ?? '');
  const [status, setStatus] = useState(ticket.status);
  const [rating, setRating] = useState<number | undefined>(ticket.satisfactionRating);
  const [ratingNote, setRatingNote] = useState(ticket.satisfactionNote ?? '');
  const [assignedTo, setAssignedTo] = useState(ticket.assignedTo ?? '');
  const [priority, setPriority] = useState(ticket.priority);
  const [escalationReason, setEscalationReason] = useState(ticket.escalationReason ?? '');

  const assignee = users.find(u => u.id === ticket.assignedTo);
  const sla = getSlaStatus(ticket);

  const addComment = () => {
    if (!newComment.trim()) return;
    const comment: TicketComment = {
      id: generateId(),
      authorId: currentUser?.id ?? 'system',
      authorName: currentUser?.name ?? 'النظام',
      authorRole: currentUser?.role ?? 'employee',
      text: newComment.trim(),
      isInternal,
      createdAt: new Date().toISOString(),
    };
    const updated = [...(ticket.comments ?? []), comment];
    onUpdate(ticket.id, { comments: updated, updatedAt: new Date().toISOString() });
    setNewComment('');
  };

  const changeStatus = (newStatus: SupportTicket['status'], note?: string) => {
    const historyEntry = {
      status: newStatus,
      changedBy: currentUser?.name ?? 'النظام',
      changedAt: new Date().toISOString(),
      note,
    };
    const history = [...(ticket.statusHistory ?? []), historyEntry];
    const patch: Partial<SupportTicket> = {
      status: newStatus,
      statusHistory: history,
      updatedAt: new Date().toISOString(),
    };
    if (newStatus === 'resolved') patch.resolvedAt = new Date().toISOString();
    if (newStatus === 'closed') patch.closedAt = new Date().toISOString();
    if (newStatus === 'escalated') patch.escalationReason = escalationReason;
    onUpdate(ticket.id, patch);
    setStatus(newStatus);
  };

  const saveChanges = () => {
    onUpdate(ticket.id, {
      resolution,
      status,
      assignedTo: assignedTo || undefined,
      priority,
      satisfactionRating: rating as SupportTicket['satisfactionRating'],
      satisfactionNote: ratingNote || undefined,
      escalationReason: escalationReason || undefined,
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl my-4">
        {/* Header */}
        <div className="bg-gradient-to-l from-indigo-600 to-violet-700 rounded-t-2xl p-5 text-white">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-sm bg-white/20 px-2 py-0.5 rounded">#{ticket.ticketNumber}</span>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${priorityColors[ticket.priority]}`}>
                  {priorityLabels[ticket.priority]}
                </span>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${statusColors[ticket.status]}`}>
                  {statusLabels[ticket.status]}
                </span>
              </div>
              <h2 className="text-lg font-bold">{ticket.title}</h2>
              <p className="text-white/70 text-xs mt-1">{formatHoursAgo(ticket.createdAt)} • {channelIcons[ticket.channel]} {channelLabels[ticket.channel]}</p>
            </div>
            <div className="flex gap-2 items-center">
              <button onClick={() => printTicket(ticket, assignee?.name)}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/20 hover:bg-white/30" title="طباعة">
                <Printer className="w-4 h-4" />
              </button>
              {ticket.customerPhone && (
                <>
                  <button onClick={() => sendSMS(ticket.customerPhone!, ticket)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-500/30 hover:bg-blue-500/50 text-white" title="إرسال SMS">
                    <Smartphone className="w-4 h-4" />
                  </button>
                  <button onClick={() => sendWhatsApp(ticket.customerPhone!, ticket)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-green-500/30 hover:bg-green-500/50 text-white" title="إرسال واتساب">
                    <MessageCircle className="w-4 h-4" />
                  </button>
                </>
              )}
              <button onClick={onClose} className="text-white/70 hover:text-white text-2xl leading-none">×</button>
            </div>
          </div>
          {/* SLA bar */}
          <div className={`mt-3 flex items-center gap-2 text-xs px-3 py-2 rounded-xl ${
            sla === 'ok' ? 'bg-green-500/20' : sla === 'warning' ? 'bg-orange-500/30' : 'bg-red-500/30'
          }`}>
            <Clock className="w-3.5 h-3.5" />
            <span>SLA ({slHours[ticket.priority]}س): </span>
            <span className="font-semibold">
              {sla === 'ok' ? '✅ ضمن الوقت المحدد' : sla === 'warning' ? '⚠️ ينتهي قريباً' : '❌ تجاوز وقت الاستجابة'}
            </span>
          </div>
        </div>

        <div className="p-5 space-y-5">
          {/* Info grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-gray-400 mb-1">العميل</p>
              <p className="font-semibold">{ticket.customerName || '—'}</p>
              {ticket.customerPhone && <p className="text-gray-500">{ticket.customerPhone}</p>}
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-gray-400 mb-1">الفئة</p>
              <p className="font-semibold">{categoryLabels[ticket.category]}</p>
              {ticket.subCategory && <p className="text-gray-500">{ticket.subCategory}</p>}
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-gray-400 mb-1">تاريخ الإنشاء</p>
              <p className="font-semibold">{new Date(ticket.createdAt).toLocaleDateString('ar-SA')}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-gray-400 mb-1">آخر تحديث</p>
              <p className="font-semibold">{formatHoursAgo(ticket.updatedAt)}</p>
            </div>
          </div>

          {/* Description */}
          <div>
            <p className="text-xs font-bold text-gray-500 mb-2">تفاصيل الشكوى / الطلب</p>
            <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
              {ticket.description}
            </div>
          </div>

          {/* Tags */}
          {ticket.tags && ticket.tags.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {ticket.tags.map(t => (
                <span key={t} className="text-xs bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <Tag className="w-3 h-3" />{t}
                </span>
              ))}
            </div>
          )}

          {/* Edit controls */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div>
              <label className="label">الحالة</label>
              <select className="input-field text-sm" value={status} onChange={e => setStatus(e.target.value as SupportTicket['status'])}>
                {Object.entries(statusLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="label">الأولوية</label>
              <select className="input-field text-sm" value={priority} onChange={e => setPriority(e.target.value as SupportTicket['priority'])}>
                {Object.entries(priorityLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="label">تعيين إلى</label>
              <select className="input-field text-sm" value={assignedTo} onChange={e => setAssignedTo(e.target.value)}>
                <option value="">— غير معيّن —</option>
                {users.filter(u => ['admin', 'employee'].includes(u.role)).map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>
          </div>

          {status === 'escalated' && (
            <div>
              <label className="label">سبب التصعيد</label>
              <input className="input-field text-sm" value={escalationReason} onChange={e => setEscalationReason(e.target.value)} placeholder="اذكر سبب تصعيد التذكرة..." />
            </div>
          )}

          {/* Resolution */}
          <div>
            <label className="label">الحل والإجراء المتخذ</label>
            <textarea className="input-field text-sm" rows={3} value={resolution}
              onChange={e => setResolution(e.target.value)}
              placeholder="اكتب وصف الحل أو الإجراء المتخذ..." />
          </div>

          {/* Satisfaction */}
          {(ticket.status === 'resolved' || ticket.status === 'closed' || status === 'resolved' || status === 'closed') && (
            <div className="bg-yellow-50 rounded-xl p-4">
              <p className="text-sm font-bold text-yellow-800 mb-3 flex items-center gap-2">
                <Star className="w-4 h-4" /> تقييم رضا العميل
              </p>
              <StarRating value={rating} onChange={v => setRating(v as SupportTicket['satisfactionRating'])} />
              <input className="input-field text-sm mt-3" value={ratingNote}
                onChange={e => setRatingNote(e.target.value)}
                placeholder="ملاحظة العميل (اختياري)..." />
            </div>
          )}

          <button onClick={saveChanges} className="btn-primary w-full flex items-center justify-center gap-2">
            <CheckCircle className="w-4 h-4" /> حفظ التغييرات
          </button>

          {/* Quick status actions */}
          <div className="flex gap-2 flex-wrap">
            {ticket.status === 'open' && (
              <button onClick={() => changeStatus('in_progress')}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-yellow-100 text-yellow-800 hover:bg-yellow-200 font-medium">
                <RefreshCw className="w-3.5 h-3.5" /> بدء المعالجة
              </button>
            )}
            {ticket.status !== 'resolved' && ticket.status !== 'closed' && (
              <button onClick={() => changeStatus('resolved')}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-green-100 text-green-800 hover:bg-green-200 font-medium">
                <CheckCircle className="w-3.5 h-3.5" /> تحديد كمحلول
              </button>
            )}
            {ticket.status === 'resolved' && (
              <button onClick={() => changeStatus('closed')}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium">
                <XCircle className="w-3.5 h-3.5" /> إغلاق
              </button>
            )}
            {ticket.status !== 'escalated' && ticket.status !== 'closed' && ticket.status !== 'resolved' && (
              <button onClick={() => changeStatus('escalated', escalationReason || 'تم التصعيد')}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 font-medium">
                <ArrowUpCircle className="w-3.5 h-3.5" /> تصعيد
              </button>
            )}
            {ticket.status !== 'pending_customer' && (
              <button onClick={() => changeStatus('pending_customer')}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-purple-100 text-purple-700 hover:bg-purple-200 font-medium">
                <Clock className="w-3.5 h-3.5" /> انتظار رد العميل
              </button>
            )}
          </div>

          {/* Status history */}
          {ticket.statusHistory && ticket.statusHistory.length > 0 && (
            <div>
              <p className="text-xs font-bold text-gray-500 mb-2">سجل الحالات</p>
              <div className="space-y-1.5">
                {ticket.statusHistory.map((h, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-gray-600">
                    <div className="w-2 h-2 rounded-full bg-indigo-400 mt-1 shrink-0" />
                    <span><strong className="text-indigo-700">{statusLabels[h.status] ?? h.status}</strong> — {h.changedBy} — {new Date(h.changedAt).toLocaleString('ar-SA')}{h.note ? ` — ${h.note}` : ''}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Comments */}
          <div>
            <p className="text-xs font-bold text-gray-500 mb-3 flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5" /> التعليقات ({(ticket.comments ?? []).length})
            </p>
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {(ticket.comments ?? []).length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-4">لا توجد تعليقات بعد</p>
              ) : (ticket.comments ?? []).map(c => (
                <div key={c.id} className={`rounded-xl p-3 text-sm ${c.isInternal ? 'bg-amber-50 border border-amber-200' : 'bg-gray-50 border border-gray-200'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-xs text-gray-700">{c.authorName}</span>
                    <div className="flex items-center gap-2">
                      {c.isInternal && <span className="text-xs text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">داخلي</span>}
                      <span className="text-xs text-gray-400">{formatHoursAgo(c.createdAt)}</span>
                    </div>
                  </div>
                  <p className="text-gray-700 text-sm">{c.text}</p>
                </div>
              ))}
            </div>

            {/* Add comment */}
            <div className="mt-3 space-y-2">
              <textarea className="input-field text-sm" rows={2} value={newComment}
                onChange={e => setNewComment(e.target.value)}
                placeholder="اكتب تعليقاً أو رداً..." />
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-600">
                  <input type="checkbox" checked={isInternal} onChange={e => setIsInternal(e.target.checked)}
                    className="w-4 h-4 accent-amber-500" />
                  ملاحظة داخلية (لا يراها العميل)
                </label>
                <button onClick={addComment} disabled={!newComment.trim()}
                  className="btn-primary text-xs py-1.5 px-4 flex items-center gap-1.5 disabled:opacity-50">
                  <Send className="w-3.5 h-3.5" /> إرسال
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── New Ticket Form ────────────────────────────────────────────
function TicketForm({ editing, onSave, onClose }: {
  editing: SupportTicket | null;
  onSave: (data: Partial<SupportTicket>) => void;
  onClose: () => void;
}) {
  const { customers, properties, units, users } = useStore();
  const [form, setForm] = useState({
    customerName: editing?.customerName ?? '',
    customerPhone: editing?.customerPhone ?? '',
    customerId: editing?.customerId ?? '',
    title: editing?.title ?? '',
    description: editing?.description ?? '',
    category: editing?.category ?? 'complaint',
    subCategory: editing?.subCategory ?? '',
    priority: editing?.priority ?? 'medium',
    status: editing?.status ?? 'open',
    channel: editing?.channel ?? 'phone',
    assignedTo: editing?.assignedTo ?? '',
    propertyId: editing?.propertyId ?? '',
    unitId: editing?.unitId ?? '',
    dueDate: editing?.dueDate ?? '',
    tags: (editing?.tags ?? []).join(', '),
    isPublic: editing?.isPublic ?? false,
  });

  const set = (patch: Partial<typeof form>) => setForm(p => ({ ...p, ...patch }));

  const fillCustomer = (id: string) => {
    const c = customers.find(x => x.id === id);
    if (c) set({ customerId: id, customerName: c.name, customerPhone: c.phone ?? '' });
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl my-4">
        <div className="bg-gradient-to-l from-indigo-600 to-violet-700 rounded-t-2xl p-5 text-white flex items-center justify-between">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Ticket className="w-5 h-5" />
            {editing ? 'تعديل التذكرة' : 'تذكرة شكوى / طلب جديد'}
          </h2>
          <button onClick={onClose} className="text-white/70 hover:text-white text-2xl leading-none">×</button>
        </div>

        <div className="p-5 space-y-4">
          {/* Customer */}
          <div>
            <label className="label">العميل (اختياري من القائمة)</label>
            <select className="input-field text-sm" onChange={e => fillCustomer(e.target.value)}>
              <option value="">— اختر من القائمة أو أدخل يدوياً —</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name} — {c.phone}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">اسم العميل *</label>
              <input className="input-field text-sm" value={form.customerName}
                onChange={e => set({ customerName: e.target.value })} required placeholder="اسم مقدم الشكوى" />
            </div>
            <div>
              <label className="label">رقم الجوال</label>
              <input className="input-field text-sm" value={form.customerPhone}
                onChange={e => set({ customerPhone: e.target.value })} placeholder="05xxxxxxxx" />
            </div>
          </div>

          {/* Ticket info */}
          <div>
            <label className="label">عنوان التذكرة *</label>
            <input className="input-field text-sm" value={form.title}
              onChange={e => set({ title: e.target.value })} required
              placeholder="وصف مختصر للشكوى أو الطلب..." />
          </div>
          <div>
            <label className="label">التفاصيل *</label>
            <textarea className="input-field text-sm" rows={4} value={form.description}
              onChange={e => set({ description: e.target.value })} required
              placeholder="اشرح الشكوى أو الطلب بالتفصيل..." />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">الفئة *</label>
              <select className="input-field text-sm" value={form.category} onChange={e => set({ category: e.target.value as SupportTicket['category'] })}>
                {Object.entries(categoryLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="label">التصنيف الفرعي</label>
              <input className="input-field text-sm" value={form.subCategory}
                onChange={e => set({ subCategory: e.target.value })} placeholder="مثال: ضوضاء، تسرب..." />
            </div>
            <div>
              <label className="label">الأولوية</label>
              <select className="input-field text-sm" value={form.priority} onChange={e => set({ priority: e.target.value as SupportTicket['priority'] })}>
                {Object.entries(priorityLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="label">قناة الاستقبال</label>
              <select className="input-field text-sm" value={form.channel} onChange={e => set({ channel: e.target.value as SupportTicket['channel'] })}>
                {Object.entries(channelLabels).map(([v, l]) => <option key={v} value={v}>{channelIcons[v]} {l}</option>)}
              </select>
            </div>
            <div>
              <label className="label">تعيين إلى</label>
              <select className="input-field text-sm" value={form.assignedTo} onChange={e => set({ assignedTo: e.target.value })}>
                <option value="">— غير معيّن —</option>
                {users.filter(u => ['admin', 'employee'].includes(u.role)).map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">تاريخ الاستحقاق</label>
              <input type="date" className="input-field text-sm" value={form.dueDate}
                onChange={e => set({ dueDate: e.target.value })} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">العقار المرتبط</label>
              <select className="input-field text-sm" value={form.propertyId} onChange={e => set({ propertyId: e.target.value })}>
                <option value="">—</option>
                {properties.map(p => <option key={p.id} value={p.id}>{p.propertyName || p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">الوحدة المرتبطة</label>
              <select className="input-field text-sm" value={form.unitId} onChange={e => set({ unitId: e.target.value })}>
                <option value="">—</option>
                {units.filter(u => !form.propertyId || u.propertyId === form.propertyId).map(u => (
                  <option key={u.id} value={u.id}>{u.unitNumber}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="label">وسوم / تاغز (مفصولة بفاصلة)</label>
            <input className="input-field text-sm" value={form.tags}
              onChange={e => set({ tags: e.target.value })}
              placeholder="مثال: عاجل، ضوضاء، مشكلة متكررة" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" className="btn-secondary flex-1" onClick={onClose}>إلغاء</button>
            <button type="button" className="btn-primary flex-1 flex items-center justify-center gap-2"
              onClick={() => onSave({
                ...form,
                tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
                assignedTo: form.assignedTo || undefined,
                propertyId: form.propertyId || undefined,
                unitId: form.unitId || undefined,
                dueDate: form.dueDate || undefined,
                customerId: form.customerId || undefined,
                subCategory: form.subCategory || undefined,
              })}>
              <CheckCircle className="w-4 h-4" />
              {editing ? 'حفظ التعديلات' : 'إنشاء التذكرة'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function TicketsPage() {
  const { supportTickets, users, currentUser, addSupportTicket, updateSupportTicket, deleteSupportTicket } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<SupportTicket | null>(null);
  const [selected, setSelected] = useState<SupportTicket | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterAssignee, setFilterAssignee] = useState('all');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'createdAt' | 'priority' | 'updatedAt'>('createdAt');
  const [view, setView] = useState<'list' | 'kanban'>('list');

  const canManage = ['admin', 'employee'].includes(currentUser?.role ?? '');

  const myTickets = currentUser?.role === 'tenant'
    ? supportTickets.filter(t => t.customerPhone === currentUser.phone || t.customerId === currentUser.id)
    : supportTickets;

  const priorityOrder: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 };

  const filtered = useMemo(() => {
    let list = myTickets
      .filter(t => filterStatus === 'all' || t.status === filterStatus)
      .filter(t => filterCategory === 'all' || t.category === filterCategory)
      .filter(t => filterPriority === 'all' || t.priority === filterPriority)
      .filter(t => filterAssignee === 'all' || t.assignedTo === filterAssignee)
      .filter(t => {
        if (!search) return true;
        const q = search.toLowerCase();
        return t.ticketNumber.toLowerCase().includes(q) ||
          t.title.toLowerCase().includes(q) ||
          (t.customerName ?? '').toLowerCase().includes(q) ||
          (t.customerPhone ?? '').includes(q);
      });
    if (sortBy === 'priority') list = [...list].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    else if (sortBy === 'updatedAt') list = [...list].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    else list = [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return list;
  }, [myTickets, filterStatus, filterCategory, filterPriority, filterAssignee, search, sortBy]);

  const kpis = useMemo(() => {
    const now = Date.now();
    return {
      total: myTickets.length,
      open: myTickets.filter(t => t.status === 'open').length,
      inProgress: myTickets.filter(t => t.status === 'in_progress').length,
      escalated: myTickets.filter(t => t.status === 'escalated').length,
      resolved: myTickets.filter(t => t.status === 'resolved' || t.status === 'closed').length,
      urgent: myTickets.filter(t => t.priority === 'urgent' && !['resolved', 'closed'].includes(t.status)).length,
      breached: myTickets.filter(t => getSlaStatus(t) === 'breached').length,
      avgRating: (() => {
        const rated = myTickets.filter(t => t.satisfactionRating);
        if (!rated.length) return 0;
        return (rated.reduce((s, t) => s + (t.satisfactionRating ?? 0), 0) / rated.length).toFixed(1);
      })(),
    };
  }, [myTickets]);

  const handleSave = (data: Partial<SupportTicket>) => {
    const now = new Date().toISOString();
    if (editing) {
      updateSupportTicket(editing.id, { ...data, updatedAt: now });
    } else {
      const category = data.category ?? 'complaint';
      const prefix = categoryPrefix[category] ?? 'T';
      const ticketNum = generateTicketNumber(category, supportTickets);
      const ticket: SupportTicket = {
        id: generateId(),
        ticketNumber: ticketNum,
        ticketPrefix: prefix,
        title: data.title ?? '',
        description: data.description ?? '',
        category,
        priority: data.priority ?? 'medium',
        status: 'open',
        channel: data.channel ?? 'phone',
        comments: [],
        statusHistory: [{ status: 'open', changedBy: currentUser?.name ?? 'النظام', changedAt: now }],
        createdAt: now,
        updatedAt: now,
        createdBy: currentUser?.id,
        ...data,
      };
      addSupportTicket(ticket);
    }
    setShowForm(false);
    setEditing(null);
  };

  // Kanban columns
  const kanbanCols = ['open', 'in_progress', 'pending_customer', 'escalated', 'resolved', 'closed'];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="section-title flex items-center gap-2">
            <Ticket className="w-6 h-6 text-indigo-500" />
            نظام تذاكر الشكاوى والمتابعة
          </h1>
          <p className="section-subtitle">إدارة شكاوى العملاء والطلبات مع تتبع كامل ومؤشرات SLA</p>
        </div>
        <div className="flex gap-2">
          <div className="flex rounded-xl overflow-hidden border border-gray-200">
            <button onClick={() => setView('list')}
              className={`px-3 py-1.5 text-xs font-medium ${view === 'list' ? 'bg-indigo-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
              قائمة
            </button>
            <button onClick={() => setView('kanban')}
              className={`px-3 py-1.5 text-xs font-medium ${view === 'kanban' ? 'bg-indigo-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
              كانبان
            </button>
          </div>
          {canManage && (
            <button className="btn-primary flex items-center gap-2 text-sm"
              onClick={() => { setEditing(null); setShowForm(true); }}>
              <Plus className="w-4 h-4" /> تذكرة جديدة
            </button>
          )}
        </div>
      </div>

      {/* Prefix legend */}
      <div className="flex gap-2 flex-wrap text-xs text-gray-500 bg-gray-50 rounded-xl px-4 py-2.5 border border-gray-200">
        <span className="font-semibold text-gray-700 ml-2">ترميز التذاكر:</span>
        <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded font-mono font-bold">A</span><span>شكاوى</span>
        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded font-mono font-bold mx-1">I</span><span>استفسارات</span>
        <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded font-mono font-bold mx-1">R</span><span>طلبات</span>
        <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded font-mono font-bold mx-1">M</span><span>صيانة</span>
        <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded font-mono font-bold mx-1">F</span><span>فواتير</span>
        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded font-mono font-bold mx-1">L</span><span>قانوني</span>
        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded font-mono font-bold mx-1">O</span><span>أخرى</span>
        <span className="mr-3 text-gray-400">• الترقيم يبدأ من 1000</span>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        <KpiCard label="إجمالي التذاكر" value={kpis.total} icon={<Ticket className="w-5 h-5 text-indigo-600" />} color="bg-indigo-100" />
        <KpiCard label="مفتوحة" value={kpis.open} icon={<AlertCircle className="w-5 h-5 text-blue-600" />} color="bg-blue-100" />
        <KpiCard label="قيد المعالجة" value={kpis.inProgress} icon={<RefreshCw className="w-5 h-5 text-yellow-600" />} color="bg-yellow-100" />
        <KpiCard label="مُصعَّدة" value={kpis.escalated} icon={<ArrowUpCircle className="w-5 h-5 text-red-600" />} color="bg-red-100" urgent={kpis.escalated > 0} />
        <KpiCard label="محلولة" value={kpis.resolved} icon={<CheckCircle className="w-5 h-5 text-green-600" />} color="bg-green-100" />
        <KpiCard label="عاجلة" value={kpis.urgent} icon={<Zap className="w-5 h-5 text-orange-600" />} color="bg-orange-100" urgent={kpis.urgent > 0} />
        <KpiCard label="تجاوز SLA" value={kpis.breached} icon={<AlertTriangle className="w-5 h-5 text-red-600" />} color="bg-red-50" urgent={Number(kpis.breached) > 0} />
        <KpiCard label="متوسط الرضا" value={`${kpis.avgRating} ★`} icon={<Star className="w-5 h-5 text-yellow-500" />} color="bg-yellow-50" />
      </div>

      {/* Alerts */}
      {kpis.breached > 0 && (
        <div className="bg-red-50 border border-red-300 rounded-2xl p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
          <p className="text-sm text-red-800 font-medium">
            <strong>{kpis.breached}</strong> تذكرة تجاوزت وقت SLA المحدد — يرجى المتابعة الفورية
          </p>
        </div>
      )}
      {kpis.urgent > 0 && (
        <div className="bg-orange-50 border border-orange-300 rounded-2xl p-4 flex items-center gap-3">
          <Zap className="w-5 h-5 text-orange-500 shrink-0" />
          <p className="text-sm text-orange-800 font-medium">
            <strong>{kpis.urgent}</strong> تذكرة بأولوية عاجلة تنتظر المعالجة
          </p>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 flex-wrap items-center">
        <div className="relative flex-1 min-w-52">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input className="input-field pr-9" placeholder="بحث برقم التذكرة، الاسم، الجوال..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input-field w-36" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
          <option value="all">كل الفئات</option>
          {Object.entries(categoryLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <select className="input-field w-32" value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
          <option value="all">كل الأولويات</option>
          {Object.entries(priorityLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        {canManage && (
          <select className="input-field w-36" value={filterAssignee} onChange={e => setFilterAssignee(e.target.value)}>
            <option value="all">كل المعيّنين</option>
            {users.filter(u => ['admin', 'employee'].includes(u.role)).map(u => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
        )}
        <select className="input-field w-36" value={sortBy} onChange={e => setSortBy(e.target.value as 'createdAt' | 'priority' | 'updatedAt')}>
          <option value="createdAt">الأحدث أولاً</option>
          <option value="updatedAt">آخر تحديث</option>
          <option value="priority">حسب الأولوية</option>
        </select>
        <span className="text-xs text-gray-400">{filtered.length} تذكرة</span>
      </div>

      {/* Status tabs */}
      <div className="flex gap-2 flex-wrap">
        {['all', ...Object.keys(statusLabels)].map(s => {
          const cnt = s === 'all' ? myTickets.length : myTickets.filter(t => t.status === s).length;
          return (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-colors ${filterStatus === s ? 'bg-indigo-500 text-white shadow' : 'bg-white border text-gray-600 hover:bg-gray-50'}`}>
              {s === 'all' ? 'الكل' : statusLabels[s]}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${filterStatus === s ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>{cnt}</span>
            </button>
          );
        })}
      </div>

      {/* List View */}
      {view === 'list' && (
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="card text-center py-14 text-gray-400">
              <Ticket className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">لا توجد تذاكر</p>
              {canManage && (
                <button className="btn-primary mt-4 text-sm" onClick={() => { setEditing(null); setShowForm(true); }}>
                  + إنشاء تذكرة جديدة
                </button>
              )}
            </div>
          ) : filtered.map(ticket => {
            const sla = getSlaStatus(ticket);
            const assignee = users.find(u => u.id === ticket.assignedTo);
            return (
              <div key={ticket.id}
                className={`card hover:shadow-md transition-all cursor-pointer
                  ${ticket.priority === 'urgent' ? 'border-l-4 border-red-500' : ''}
                  ${ticket.priority === 'high' ? 'border-l-4 border-orange-400' : ''}
                  ${sla === 'breached' ? 'bg-red-50' : ''}
                `}
                onClick={() => setSelected(ticket)}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-sm font-bold ${categoryColors[ticket.category]}`}>
                      {ticket.category === 'complaint' ? '⚠' : ticket.category === 'maintenance' ? '🔧' : ticket.category === 'billing' ? '💰' : ticket.category === 'inquiry' ? '❓' : '📋'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-mono text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">#{ticket.ticketNumber}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${categoryColors[ticket.category]}`}>{categoryLabels[ticket.category]}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${priorityColors[ticket.priority]}`}>{priorityLabels[ticket.priority]}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${statusColors[ticket.status]}`}>{statusLabels[ticket.status]}</span>
                        {sla === 'breached' && <span className="text-xs text-red-600 font-bold flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> تجاوز SLA</span>}
                        {sla === 'warning' && <span className="text-xs text-orange-600 flex items-center gap-1"><Clock className="w-3 h-3" /> ينتهي قريباً</span>}
                      </div>
                      <p className="font-bold text-gray-800 truncate">{ticket.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-2">
                        {ticket.customerName && <span className="flex items-center gap-1"><User className="w-3 h-3" />{ticket.customerName}</span>}
                        {ticket.customerPhone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{ticket.customerPhone}</span>}
                        <span>{channelIcons[ticket.channel]} {channelLabels[ticket.channel]}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1.5 shrink-0 text-xs text-gray-500">
                    <span>{formatHoursAgo(ticket.createdAt)}</span>
                    {assignee && <span className="flex items-center gap-1 text-indigo-600"><User className="w-3 h-3" />{assignee.name}</span>}
                    {ticket.satisfactionRating && (
                      <span className="text-yellow-500">{'★'.repeat(ticket.satisfactionRating)}</span>
                    )}
                    {(ticket.comments?.length ?? 0) > 0 && (
                      <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" />{ticket.comments!.length}</span>
                    )}
                  </div>
                </div>

                {/* Tags */}
                {ticket.tags && ticket.tags.length > 0 && (
                  <div className="flex gap-1.5 flex-wrap mt-2">
                    {ticket.tags.map(t => (
                      <span key={t} className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">{t}</span>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                  <span className="text-xs text-gray-400">
                    {ticket.dueDate && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />الاستحقاق: {new Date(ticket.dueDate).toLocaleDateString('ar-SA')}</span>}
                  </span>
                  <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                    <button onClick={() => printTicket(ticket, assignee?.name)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200" title="طباعة">
                      <Printer className="w-3.5 h-3.5" />
                    </button>
                    {ticket.customerPhone && (
                      <>
                        <button onClick={() => sendSMS(ticket.customerPhone!, ticket)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200" title="إرسال SMS">
                          <Smartphone className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => sendWhatsApp(ticket.customerPhone!, ticket)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg bg-green-100 text-green-600 hover:bg-green-200" title="إرسال واتساب">
                          <MessageCircle className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                    {canManage && (
                      <>
                        <button onClick={() => { setEditing(ticket); setShowForm(true); }}
                          className="w-7 h-7 flex items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 hover:bg-indigo-200">
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => { if (confirm('حذف التذكرة؟')) deleteSupportTicket(ticket.id); }}
                          className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-100 text-red-500 hover:bg-red-200">
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
      )}

      {/* Kanban View */}
      {view === 'kanban' && (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {kanbanCols.map(col => {
            const colTickets = filtered.filter(t => t.status === col);
            return (
              <div key={col} className="flex-none w-72">
                <div className={`flex items-center justify-between mb-3 px-1`}>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusColors[col]}`}>{statusLabels[col]}</span>
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{colTickets.length}</span>
                </div>
                <div className="space-y-2 min-h-32">
                  {colTickets.map(ticket => (
                    <div key={ticket.id}
                      className={`bg-white rounded-xl p-3 shadow-sm border cursor-pointer hover:shadow-md transition-all
                        ${ticket.priority === 'urgent' ? 'border-red-300' : ticket.priority === 'high' ? 'border-orange-200' : 'border-gray-200'}
                      `}
                      onClick={() => setSelected(ticket)}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-mono text-xs text-gray-400">#{ticket.ticketNumber}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${priorityColors[ticket.priority]}`}>{priorityLabels[ticket.priority]}</span>
                      </div>
                      <p className="text-sm font-semibold text-gray-800 leading-snug">{ticket.title}</p>
                      <p className="text-xs text-gray-500 mt-1">{ticket.customerName}</p>
                      <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
                        <span>{formatHoursAgo(ticket.createdAt)}</span>
                        <span className={`px-2 py-0.5 rounded-full ${categoryColors[ticket.category]}`}>{categoryLabels[ticket.category]}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      {showForm && (
        <TicketForm
          editing={editing}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditing(null); }}
        />
      )}
      {selected && (
        <TicketDetail
          ticket={selected}
          onClose={() => setSelected(null)}
          onUpdate={(id, data) => {
            updateSupportTicket(id, data);
            setSelected(prev => prev ? { ...prev, ...data } : null);
          }}
        />
      )}
    </div>
  );
}
