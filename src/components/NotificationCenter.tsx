import { useState, useEffect, useRef } from 'react';
import { useStore } from '../data/store';
import {
  Bell, X, CheckCheck, AlertCircle, AlertTriangle, Info,
  FileText, Wrench, DollarSign, Calendar,
  Trash2, CheckCircle, Volume2, VolumeX
} from 'lucide-react';

type AlertCategory = 'all' | 'contract' | 'invoice' | 'maintenance' | 'appointment' | 'system';

interface SmartAlert {
  id: string;
  type: 'danger' | 'warning' | 'info' | 'success';
  category: 'contract' | 'invoice' | 'maintenance' | 'appointment' | 'system';
  title: string;
  detail: string;
  createdAt: string;
  isRead: boolean;
  actionPage?: string;
}

interface ContractLike { id: string; status: string; endDate?: string; contractNumber: string; tenantName?: string; }
interface InvoiceLike { id: string; invoiceStatus: string; remainingAmount: number; invoiceNumber: string; invoiceGraceDate?: string; totalAmount: number; }
interface MaintenanceLike { id: string; priority: string; status: string; title: string; createdAt?: string; }
interface AppointmentLike { id: string; status: string; date: string; type: string; time?: string; }

function buildSmartAlerts(
  contracts: ContractLike[], invoices: InvoiceLike[], maintenanceRequests: MaintenanceLike[], appointments: AppointmentLike[]
): SmartAlert[] {
  const alerts: SmartAlert[] = [];
  const today = new Date();
  const fmt = (d: Date) => d.toISOString().slice(0, 10);

  // Expiring contracts
  contracts.filter(c => c.status === 'active' && c.endDate).forEach(c => {
    const end = new Date(c.endDate!);
    const days = Math.round((end.getTime() - today.getTime()) / 86400000);
    if (days < 0) {
      alerts.push({ id: `ce-${c.id}`, type: 'danger', category: 'contract', isRead: false,
        title: `عقد منتهٍ: ${c.contractNumber}`, detail: `المستأجر: ${c.tenantName ?? '—'} | انتهى منذ ${Math.abs(days)} يوم`,
        createdAt: fmt(today), actionPage: 'contracts-list' });
    } else if (days <= 30) {
      alerts.push({ id: `ce-${c.id}`, type: 'danger', category: 'contract', isRead: false,
        title: `عقد ينتهي قريباً: ${c.contractNumber}`, detail: `المستأجر: ${c.tenantName ?? '—'} | متبقي ${days} يوم`,
        createdAt: fmt(today), actionPage: 'contracts-list' });
    } else if (days <= 60) {
      alerts.push({ id: `cw-${c.id}`, type: 'warning', category: 'contract', isRead: false,
        title: `تجديد عقد قريباً: ${c.contractNumber}`, detail: `ينتهي خلال ${days} يوم`,
        createdAt: fmt(today), actionPage: 'contracts-list' });
    }
  });

  // Overdue invoices
  invoices.filter(i => i.invoiceStatus === 'overdue').forEach(i => {
    alerts.push({ id: `io-${i.id}`, type: 'danger', category: 'invoice', isRead: false,
      title: `فاتورة متأخرة: ${i.invoiceNumber}`, detail: `المبلغ: ${i.remainingAmount.toLocaleString('ar-SA')} ر.س | تاريخ الاستحقاق: ${i.invoiceGraceDate ?? '—'}`,
      createdAt: fmt(today), actionPage: 'accounting' });
  });

  // Pending invoices near due
  invoices.filter(i => i.invoiceStatus === 'pending' && i.invoiceGraceDate).forEach(i => {
    const due = new Date(i.invoiceGraceDate!);
    const days = Math.round((due.getTime() - today.getTime()) / 86400000);
    if (days >= 0 && days <= 7) {
      alerts.push({ id: `ip-${i.id}`, type: 'warning', category: 'invoice', isRead: false,
        title: `فاتورة تستحق قريباً: ${i.invoiceNumber}`, detail: `تستحق خلال ${days} يوم — ${i.totalAmount.toLocaleString('ar-SA')} ر.س`,
        createdAt: fmt(today), actionPage: 'accounting' });
    }
  });

  // Urgent maintenance
  maintenanceRequests.filter(m => (m.priority === 'urgent' || m.priority === 'high') && m.status !== 'completed' && m.status !== 'cancelled').forEach(m => {
    alerts.push({ id: `mu-${m.id}`, type: m.priority === 'urgent' ? 'danger' : 'warning', category: 'maintenance', isRead: false,
      title: `صيانة ${m.priority === 'urgent' ? 'عاجلة' : 'عالية الأولوية'}: ${m.title}`,
      detail: `الحالة: ${m.status === 'new' ? 'جديد' : m.status === 'in_progress' ? 'قيد التنفيذ' : m.status}`,
      createdAt: m.createdAt ?? fmt(today), actionPage: 'maintenance' });
  });

  // Upcoming appointments
  appointments.filter(a => a.status !== 'cancelled' && a.date).forEach(a => {
    const d = new Date(a.date);
    const days = Math.round((d.getTime() - today.getTime()) / 86400000);
    if (days >= 0 && days <= 3) {
      alerts.push({ id: `ap-${a.id}`, type: 'info', category: 'appointment', isRead: false,
        title: `موعد قادم: ${a.type === 'viewing' ? 'زيارة عقار' : a.type === 'handover' ? 'تسليم' : 'موعد'}`,
        detail: `في ${days === 0 ? 'اليوم' : days === 1 ? 'الغد' : `${days} أيام`} — ${a.time ?? '—'}`,
        createdAt: fmt(today), actionPage: 'appointments' });
    }
  });

  return alerts;
}

interface Props {
  onNavigate?: (page: string) => void;
}

export default function NotificationCenter({ onNavigate }: Props) {
  const { contracts, invoices, maintenanceRequests, appointments } = useStore();
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<AlertCategory>('all');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const ref = useRef<HTMLDivElement>(null);

  const smartAlerts = buildSmartAlerts(contracts, invoices, maintenanceRequests, appointments);
  const allAlerts = smartAlerts.filter(a => !readIds.has(a.id));

  const filtered = filter === 'all' ? allAlerts : allAlerts.filter(a => a.category === filter);
  const unreadCount = allAlerts.filter(a => !readIds.has(a.id)).length;

  const markRead = (id: string) => setReadIds(prev => new Set([...prev, id]));
  const markAllRead = () => setReadIds(new Set(allAlerts.map(a => a.id)));
  const clearAll = () => setReadIds(new Set(smartAlerts.map(a => a.id)));

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const typeConfig = {
    danger:  { color: 'border-r-4 border-red-400 bg-red-50',     icon: <AlertCircle className="w-4 h-4 text-red-500" />,    badge: 'bg-red-100 text-red-700' },
    warning: { color: 'border-r-4 border-yellow-400 bg-yellow-50', icon: <AlertTriangle className="w-4 h-4 text-yellow-500" />, badge: 'bg-yellow-100 text-yellow-700' },
    info:    { color: 'border-r-4 border-blue-400 bg-blue-50',    icon: <Info className="w-4 h-4 text-blue-500" />,           badge: 'bg-blue-100 text-blue-700' },
    success: { color: 'border-r-4 border-green-400 bg-green-50',  icon: <CheckCircle className="w-4 h-4 text-green-500" />,   badge: 'bg-green-100 text-green-700' },
  };

  const catConfig: Record<AlertCategory, { label: string; icon: React.ReactNode }> = {
    all:         { label: 'الكل',       icon: <Bell className="w-3.5 h-3.5" /> },
    contract:    { label: 'عقود',       icon: <FileText className="w-3.5 h-3.5" /> },
    invoice:     { label: 'فواتير',     icon: <DollarSign className="w-3.5 h-3.5" /> },
    maintenance: { label: 'صيانة',      icon: <Wrench className="w-3.5 h-3.5" /> },
    appointment: { label: 'مواعيد',     icon: <Calendar className="w-3.5 h-3.5" /> },
    system:      { label: 'النظام',     icon: <Info className="w-3.5 h-3.5" /> },
  };

  const dangerCount = allAlerts.filter(a => a.type === 'danger').length;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={`relative p-2 rounded-xl transition-colors ${open ? 'bg-yellow-100 text-yellow-600' : 'hover:bg-gray-100 text-gray-600'}`}
      >
        {dangerCount > 0 ? (
          <Bell className="w-5 h-5 animate-[wiggle_1s_ease-in-out_infinite]" style={{ animation: 'wiggle 2s ease-in-out infinite' }} />
        ) : (
          <Bell className="w-5 h-5" />
        )}
        {unreadCount > 0 && (
          <span className={`absolute -top-1 -right-1 min-w-[18px] h-[18px] text-white text-xs rounded-full flex items-center justify-center font-bold px-0.5 ${dangerCount > 0 ? 'bg-red-500' : 'bg-yellow-500'}`}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-2 w-[420px] bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden max-h-[80vh] flex flex-col" style={{ direction: 'rtl' }}>
          {/* Header */}
          <div className="p-4 border-b border-gray-100 bg-gradient-to-l from-gray-50 to-white">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-yellow-500" />
                <p className="font-bold text-gray-800">مركز الإشعارات</p>
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">{unreadCount}</span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => setSoundEnabled(!soundEnabled)} title={soundEnabled ? 'كتم الصوت' : 'تشغيل الصوت'}
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                  {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>
                <button onClick={markAllRead} title="تعليم الكل كمقروء"
                  className="p-1.5 rounded-lg hover:bg-green-50 text-gray-400 hover:text-green-600 transition-colors">
                  <CheckCheck className="w-4 h-4" />
                </button>
                <button onClick={clearAll} title="مسح الكل"
                  className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
                <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Category filters */}
            <div className="flex gap-1.5 flex-wrap">
              {(Object.entries(catConfig) as [AlertCategory, { label: string; icon: React.ReactNode }][]).map(([cat, cfg]) => {
                const cnt = cat === 'all' ? allAlerts.length : allAlerts.filter(a => a.category === cat).length;
                return (
                  <button key={cat} onClick={() => setFilter(cat)}
                    className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${
                      filter === cat ? 'bg-yellow-500 text-white' : cnt > 0 ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-gray-50 text-gray-300'
                    }`}>
                    {cfg.icon} {cfg.label}
                    {cnt > 0 && <span className={`w-4 h-4 rounded-full text-xs flex items-center justify-center font-bold ${filter === cat ? 'bg-white/30' : 'bg-white'} ${filter === cat ? 'text-white' : 'text-gray-600'}`}>{cnt}</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Alert list */}
          <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
            {filtered.length === 0 ? (
              <div className="p-8 text-center">
                <CheckCircle className="w-10 h-10 text-green-400 mx-auto mb-3" />
                <p className="font-semibold text-gray-700">لا توجد تنبيهات</p>
                <p className="text-xs text-gray-400 mt-1">جميع العمليات تسير بشكل طبيعي</p>
              </div>
            ) : filtered.map(alert => {
              const tc = typeConfig[alert.type];
              const isRead = readIds.has(alert.id);
              return (
                <div key={alert.id}
                  className={`flex items-start gap-3 p-3.5 hover:bg-gray-50 transition-colors cursor-pointer ${tc.color} ${isRead ? 'opacity-50' : ''}`}
                  onClick={() => {
                    markRead(alert.id);
                    if (alert.actionPage && onNavigate) { onNavigate(alert.actionPage); setOpen(false); }
                  }}>
                  <div className="shrink-0 mt-0.5">{tc.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-semibold text-gray-800 ${isRead ? 'line-through' : ''}`}>{alert.title}</p>
                      <button onClick={e => { e.stopPropagation(); markRead(alert.id); }}
                        className="shrink-0 p-0.5 hover:bg-white rounded-full transition-colors">
                        <X className="w-3 h-3 text-gray-400" />
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{alert.detail}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${tc.badge}`}>
                        {catConfig[alert.category].label}
                      </span>
                      {alert.actionPage && (
                        <span className="text-xs text-blue-500">انقر للتفاصيل ←</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
            <span className="text-xs text-gray-400">آخر تحديث: الآن</span>
            <div className="flex gap-2">
              <button onClick={markAllRead} className="text-xs text-green-600 hover:text-green-700 font-medium flex items-center gap-1">
                <CheckCheck className="w-3.5 h-3.5" /> تعليم الكل
              </button>
              <span className="text-gray-200">|</span>
              <button onClick={clearAll} className="text-xs text-red-500 hover:text-red-600 font-medium flex items-center gap-1">
                <Trash2 className="w-3.5 h-3.5" /> مسح الكل
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
