import { useState } from 'react';
import { useStore } from '../../data/store';
import type { MaintenanceRequest } from '../../types';
import {
  Wrench, Clock, CheckCircle, AlertCircle,
  MapPin, Star, Eye,
  Play
} from 'lucide-react';

const STATUS_LABEL: Record<string, string> = {
  new: 'جديد', assigned: 'مُعيَّن', in_progress: 'جاري', pending_review: 'مراجعة', completed: 'مكتمل'
};
const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  low:    { label: 'منخفضة',  color: 'bg-gray-100 text-gray-600' },
  medium: { label: 'متوسطة',  color: 'bg-blue-100 text-blue-700' },
  high:   { label: 'عالية',   color: 'bg-orange-100 text-orange-700' },
  urgent: { label: 'عاجل',    color: 'bg-red-100 text-red-700' },
};
const CATEGORY_LABEL: Record<string, string> = {
  plumbing: 'سباكة', electrical: 'كهرباء', hvac: 'تكييف',
  painting: 'دهانات', cleaning: 'نظافة', carpentry: 'نجارة', other: 'أخرى'
};

export default function TechnicianDashboard() {
  const { currentUser, maintenanceRequests, units, properties, updateMaintenanceRequest } = useStore();
  const [activeTab, setActiveTab] = useState<'active' | 'completed' | 'all'>('active');
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [cost, setCost] = useState('');
  const [hours, setHours] = useState('');

  const myRequests = maintenanceRequests.filter(m => m.technicianId === currentUser?.id);
  const allAssigned = maintenanceRequests.filter(m =>
    m.technicianId === currentUser?.id || m.status === 'new' || m.status === 'assigned'
  );

  const activeRequests = allAssigned.filter(m => m.status !== 'completed' && m.status !== 'cancelled');
  const completedRequests = allAssigned.filter(m => m.status === 'completed');

  const displayed = activeTab === 'active' ? activeRequests :
    activeTab === 'completed' ? completedRequests : allAssigned;

  const filtered = displayed;

  const getProperty = (m: MaintenanceRequest) => {
    const unit = units.find(u => u.id === m.unitId);
    const prop = unit ? properties.find(p => p.id === unit.propertyId) : null;
    return { unit, property: prop };
  };

  const updateStatus = (id: string, status: string) => {
    updateMaintenanceRequest(id, {
      status: status as MaintenanceRequest['status'],
      ...(status === 'completed' ? {
        technicianNotes: notes,
        actualCost: parseFloat(cost) || 0,
        actualHours: parseFloat(hours) || 0,
        completedAt: new Date().toISOString().slice(0, 10),
      } : {})
    });
    if (status === 'completed') { setSelectedRequest(null); setNotes(''); setCost(''); setHours(''); }
  };

  const totalCompleted = completedRequests.length;
  const totalHours = myRequests.reduce((s, m) => s + (m.actualHours || 0), 0);
  const totalEarnings = myRequests.reduce((s, m) => s + (m.actualCost || 0), 0);
  const urgentCount = activeRequests.filter(m => m.priority === 'urgent').length;

  const tabs = [
    { id: 'active', label: `المهام الحالية (${activeRequests.length})` },
    { id: 'completed', label: `المكتملة (${completedRequests.length})` },
    { id: 'all', label: 'الكل' },
  ] as const;

  return (
    <div className="space-y-5" dir="rtl">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-l from-red-600 to-orange-500 rounded-2xl p-5 text-white">
        <p className="text-red-100 text-sm font-semibold">بوابة الفني</p>
        <h1 className="text-2xl font-black mt-1">مرحباً، {currentUser?.name ?? 'الفني الكريم'}</h1>
        <p className="text-red-100 text-sm mt-1">
          {activeRequests.length} مهمة نشطة {urgentCount > 0 ? `| ${urgentCount} عاجلة ⚠️` : ''}
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'مهام نشطة', value: activeRequests.length, color: 'text-yellow-600 bg-yellow-50', icon: <Wrench className="w-5 h-5" /> },
          { label: 'عاجلة', value: urgentCount, color: urgentCount > 0 ? 'text-red-600 bg-red-50' : 'text-gray-400 bg-gray-50', icon: <AlertCircle className="w-5 h-5" /> },
          { label: 'مكتملة', value: totalCompleted, color: 'text-green-600 bg-green-50', icon: <CheckCircle className="w-5 h-5" /> },
          { label: 'إجمالي الساعات', value: `${totalHours}h`, color: 'text-blue-600 bg-blue-50', icon: <Clock className="w-5 h-5" /> },
        ].map((k, i) => (
          <div key={i} className={`card flex items-center gap-3 ${k.color}`}>
            <div className="shrink-0">{k.icon}</div>
            <div><p className="text-2xl font-black">{k.value}</p><p className="text-xs opacity-70">{k.label}</p></div>
          </div>
        ))}
      </div>

      {/* Urgent banner */}
      {urgentCount > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <div>
            <p className="font-bold text-red-700">{urgentCount} مهام عاجلة تنتظرك!</p>
            <p className="text-sm text-red-500">يرجى معالجتها على الفور</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 overflow-x-auto">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px whitespace-nowrap transition-colors ${activeTab === t.id ? 'border-red-500 text-red-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Request list */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="card text-center py-8 text-gray-400">
            <Wrench className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p>لا توجد مهام في هذه الفئة</p>
          </div>
        ) : filtered.map(m => {
          const { unit, property: prop } = getProperty(m);
          const isSelected = selectedRequest === m.id;
          const pc = PRIORITY_CONFIG[m.priority] ?? PRIORITY_CONFIG.medium;
          return (
            <div key={m.id} className={`card transition-all hover:shadow-md ${isSelected ? 'border-2 border-red-400' : ''}`}>
              <div className="flex items-start gap-3 cursor-pointer" onClick={() => setSelectedRequest(isSelected ? null : m.id)}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                  m.status === 'completed' ? 'bg-green-100 text-green-600' :
                  m.priority === 'urgent' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'
                }`}>
                  {m.status === 'completed' ? <CheckCircle className="w-6 h-6" /> : <Wrench className="w-6 h-6" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-bold text-gray-800">{m.title}</p>
                    <span className={`text-xs px-2 py-1 rounded-full font-bold shrink-0 ${pc.color}`}>{pc.label}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {prop?.propertyName ?? '—'} | وحدة {unit?.unitNumber ?? '—'}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{CATEGORY_LABEL[m.category] ?? m.category}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      m.status === 'completed' ? 'bg-green-100 text-green-700' :
                      m.status === 'in_progress' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>{STATUS_LABEL[m.status] ?? m.status}</span>
                    <span className="text-xs text-gray-400">{m.createdAt}</span>
                  </div>
                </div>
              </div>

              {/* Expanded actions */}
              {isSelected && m.status !== 'completed' && (
                <div className="mt-4 border-t border-gray-100 pt-4 space-y-3">
                  {m.description && (
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs font-semibold text-gray-500 mb-1">وصف المشكلة</p>
                      <p className="text-sm text-gray-700">{m.description}</p>
                    </div>
                  )}

                  {/* Status progression */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-2">تحديث الحالة</p>
                    <div className="flex gap-2 flex-wrap">
                      {m.status === 'new' || m.status === 'assigned' ? (
                        <button onClick={() => updateStatus(m.id, 'in_progress')}
                          className="flex items-center gap-1 bg-blue-500 text-white px-3 py-1.5 rounded-xl text-sm font-medium hover:bg-blue-600 transition-colors">
                          <Play className="w-3.5 h-3.5" /> بدء التنفيذ
                        </button>
                      ) : null}
                      {m.status === 'in_progress' ? (
                        <button onClick={() => updateStatus(m.id, 'pending_review')}
                          className="flex items-center gap-1 bg-yellow-500 text-white px-3 py-1.5 rounded-xl text-sm font-medium hover:bg-yellow-600 transition-colors">
                          <Eye className="w-3.5 h-3.5" /> طلب المراجعة
                        </button>
                      ) : null}
                    </div>
                  </div>

                  {/* Complete form */}
                  <div className="bg-green-50 rounded-xl p-4 space-y-3 border border-green-100">
                    <p className="text-sm font-bold text-green-700 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" /> إغلاق البلاغ
                    </p>
                    <textarea className="input-field text-sm" rows={2} placeholder="ملاحظات الإغلاق والعمل المنجز..." value={notes} onChange={e => setNotes(e.target.value)} />
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="label text-xs">التكلفة الفعلية ر.س</label>
                        <input type="number" className="input-field text-sm" value={cost} onChange={e => setCost(e.target.value)} placeholder="0" />
                      </div>
                      <div>
                        <label className="label text-xs">الساعات المستغرقة</label>
                        <input type="number" className="input-field text-sm" value={hours} onChange={e => setHours(e.target.value)} placeholder="0" />
                      </div>
                    </div>
                    <button onClick={() => updateStatus(m.id, 'completed')} className="btn-primary w-full justify-center py-2 text-sm flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" /> إغلاق البلاغ نهائياً
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Stats summary */}
      {totalCompleted > 0 && (
        <div className="card bg-gradient-to-l from-green-50 to-emerald-50 border-green-200">
          <p className="font-bold text-green-700 mb-3 text-sm flex items-center gap-2">
            <Star className="w-4 h-4" /> إحصائياتك
          </p>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div><p className="text-2xl font-black text-green-700">{totalCompleted}</p><p className="text-xs text-gray-500">مهمة مكتملة</p></div>
            <div><p className="text-2xl font-black text-blue-700">{totalHours}h</p><p className="text-xs text-gray-500">ساعة عمل</p></div>
            <div><p className="text-2xl font-black text-yellow-700">{totalEarnings.toLocaleString('ar-SA')}</p><p className="text-xs text-gray-500">ر.س منجزة</p></div>
          </div>
        </div>
      )}
    </div>
  );
}
