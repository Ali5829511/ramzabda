import { useState, useRef, useMemo } from 'react';
import { useStore, generateId } from '../../data/store';
import type { MaintenanceRequest } from '../../types';
import {
  FileText, DollarSign, Wrench, Bell, Calendar, CheckCircle,
  AlertCircle, Plus, Send,
  Home, Camera, X
} from 'lucide-react';

export default function TenantDashboard() {
  const { currentUser, contracts, invoices, maintenanceRequests, appointments, notifications, units, properties, addMaintenanceRequest } = useStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'contract' | 'maintenance' | 'appointments'>('overview');
  const [showNewRequest, setShowNewRequest] = useState(false);
  const [requestForm, setRequestForm] = useState({ title: '', category: 'plumbing', priority: 'medium', description: '' });
  const fileRef = useRef<HTMLInputElement>(null);

  const myContracts = contracts.filter(c => c.tenantId === currentUser?.id && c.status === 'active');
  const myAllContracts = contracts.filter(c => c.tenantId === currentUser?.id);
  const activeContract = myContracts[0];

  const myInvoices = invoices.filter(i => myAllContracts.some(c => c.id === i.contractId));
  const pendingInvoices = myInvoices.filter(i => i.invoiceStatus === 'pending' || i.invoiceStatus === 'overdue');
  const myMaintenance = maintenanceRequests.filter(m => m.tenantId === currentUser?.id);
  const openMaintenance = myMaintenance.filter(m => m.status !== 'completed' && m.status !== 'cancelled');
  const myAppointments = appointments.filter(a => a.customerId === currentUser?.id && a.status !== 'cancelled');
  const myNotifications = notifications.filter(n => n.userId === currentUser?.id && !n.isRead);

  const unit = activeContract ? units.find(u => u.id === activeContract.unitId) : null;
  const property = unit ? properties.find(p => p.id === unit.propertyId) : null;

  const nowTs = Date.now();
  const contractDaysLeft = useMemo(() => activeContract ? Math.round((new Date(activeContract.contractEndDate || activeContract.endDate || '').getTime() - nowTs) / 86400000) : 0, [activeContract, nowTs]);

  const submitRequest = () => {
    if (!requestForm.title) return;
    addMaintenanceRequest({
      id: generateId(),
      title: requestForm.title,
      description: requestForm.description,
      category: requestForm.category as MaintenanceRequest['category'],
      priority: requestForm.priority as MaintenanceRequest['priority'],
      status: 'new',
      requestSource: 'tenant',
      propertyId: property?.id ?? '',
      unitId: unit?.id ?? '',
      tenantId: currentUser?.id ?? '',
      createdAt: new Date().toISOString().slice(0, 10),
    });
    setRequestForm({ title: '', category: 'plumbing', priority: 'medium', description: '' });
    setShowNewRequest(false);
  };

  const categoryOptions = [
    { value: 'plumbing', label: 'سباكة' }, { value: 'electrical', label: 'كهرباء' },
    { value: 'hvac', label: 'تكييف' }, { value: 'painting', label: 'دهانات' },
    { value: 'carpentry', label: 'نجارة' }, { value: 'cleaning', label: 'نظافة' }, { value: 'other', label: 'أخرى' },
  ];

  const tabs = [
    { id: 'overview', label: 'نظرة عامة' },
    { id: 'contract', label: 'عقدي وفواتيري' },
    { id: 'maintenance', label: 'بلاغات الصيانة' },
    { id: 'appointments', label: 'مواعيدي' },
  ] as const;

  return (
    <div className="space-y-5" dir="rtl">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-l from-orange-600 to-amber-500 rounded-2xl p-5 text-white">
        <p className="text-orange-100 text-sm font-semibold">بوابة المستأجر</p>
        <h1 className="text-2xl font-black mt-1">مرحباً، {currentUser?.name ?? 'المستأجر الكريم'}</h1>
        {activeContract && (
          <p className="text-orange-100 text-sm mt-1 flex items-center gap-2">
            <Home className="w-4 h-4" />
            وحدة {unit?.unitNumber ?? '—'} | {property?.propertyName ?? '—'}
          </p>
        )}
      </div>

      {/* Notifications */}
      {myNotifications.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Bell className="w-5 h-5 text-yellow-600" />
            <p className="font-bold text-yellow-800">{myNotifications.length} إشعار غير مقروء</p>
          </div>
          {myNotifications.slice(0, 2).map(n => (
            <p key={n.id} className="text-sm text-yellow-700 mr-7 mt-1">• {n.message}</p>
          ))}
        </div>
      )}

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'متبقي للعقد', value: contractDaysLeft > 0 ? `${contractDaysLeft} يوم` : 'لا يوجد', color: contractDaysLeft < 60 ? 'text-red-600 bg-red-50' : 'text-blue-600 bg-blue-50', icon: <FileText className="w-5 h-5" /> },
          { label: 'فواتير معلقة', value: pendingInvoices.length, color: pendingInvoices.length > 0 ? 'text-orange-600 bg-orange-50' : 'text-green-600 bg-green-50', icon: <DollarSign className="w-5 h-5" /> },
          { label: 'بلاغات مفتوحة', value: openMaintenance.length, color: openMaintenance.length > 0 ? 'text-yellow-600 bg-yellow-50' : 'text-green-600 bg-green-50', icon: <Wrench className="w-5 h-5" /> },
          { label: 'مواعيد قادمة', value: myAppointments.length, color: 'text-purple-600 bg-purple-50', icon: <Calendar className="w-5 h-5" /> },
        ].map((k, i) => (
          <div key={i} className={`card flex items-center gap-3 ${k.color}`}>
            <div className="shrink-0">{k.icon}</div>
            <div><p className="text-2xl font-black">{k.value}</p><p className="text-xs opacity-70">{k.label}</p></div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 overflow-x-auto">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px whitespace-nowrap transition-colors ${activeTab === t.id ? 'border-orange-500 text-orange-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          {activeContract ? (
            <div className="card border-2 border-orange-200 bg-orange-50/50">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold text-orange-700 text-sm">عقد الإيجار الحالي</p>
                  <p className="text-xl font-black text-gray-800 mt-1">{activeContract.contractNumber}</p>
                  <p className="text-sm text-gray-500 mt-1">{activeContract.contractStartDate || activeContract.startDate} — {activeContract.contractEndDate || activeContract.endDate}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-orange-600">{(activeContract.annualRent ?? 0).toLocaleString('ar-SA')}</p>
                  <p className="text-xs text-gray-500">ريال / سنة</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3">
                <div className="bg-white rounded-xl p-3 text-center">
                  <p className="font-bold text-gray-800">{unit?.unitNumber ?? '—'}</p>
                  <p className="text-xs text-gray-400">رقم الوحدة</p>
                </div>
                <div className="bg-white rounded-xl p-3 text-center">
                  <p className="font-bold text-gray-800">{unit?.unitArea ?? unit?.area ?? '—'} م²</p>
                  <p className="text-xs text-gray-400">المساحة</p>
                </div>
                <div className="bg-white rounded-xl p-3 text-center">
                  <p className={`font-bold ${contractDaysLeft < 60 ? 'text-red-600' : 'text-blue-600'}`}>{contractDaysLeft}</p>
                  <p className="text-xs text-gray-400">يوم متبقي</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="card text-center py-8 text-gray-400">
              <Home className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p>لا يوجد عقد نشط حالياً</p>
            </div>
          )}

          {/* Pending invoices */}
          {pendingInvoices.length > 0 && (
            <div className="card">
              <h3 className="font-bold text-gray-700 mb-3 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-orange-500" /> فواتير تنتظر السداد
              </h3>
              {pendingInvoices.slice(0, 3).map(inv => (
                <div key={inv.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-xl mb-2 last:mb-0">
                  <div>
                    <p className="font-semibold text-sm text-gray-800">{inv.invoiceNumber}</p>
                    <p className="text-xs text-gray-500">تستحق: {inv.invoiceGraceDate ?? inv.invoiceDate}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-orange-600">{inv.remainingAmount.toLocaleString('ar-SA')} ر</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${inv.invoiceStatus === 'overdue' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'}`}>
                      {inv.invoiceStatus === 'overdue' ? 'متأخرة' : 'معلقة'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quick actions */}
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => { setActiveTab('maintenance'); setShowNewRequest(true); }}
              className="card flex items-center gap-3 hover:border-orange-300 hover:bg-orange-50 transition-all cursor-pointer text-right">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 shrink-0">
                <Wrench className="w-5 h-5" />
              </div>
              <div><p className="font-bold text-sm text-gray-800">بلاغ صيانة</p><p className="text-xs text-gray-400">أبلغ عن عطل</p></div>
            </button>
            <button onClick={() => setActiveTab('appointments')}
              className="card flex items-center gap-3 hover:border-purple-300 hover:bg-purple-50 transition-all cursor-pointer text-right">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div><p className="font-bold text-sm text-gray-800">مواعيدي</p><p className="text-xs text-gray-400">الزيارات والتسليم</p></div>
            </button>
          </div>
        </div>
      )}

      {/* Contract & Invoices Tab */}
      {activeTab === 'contract' && (
        <div className="space-y-4">
          {myAllContracts.map(c => (
            <div key={c.id} className="card">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium mr-2 ${c.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {c.status === 'active' ? 'نشط' : c.status === 'expired' ? 'منتهي' : c.status}
                  </span>
                  <p className="font-bold text-gray-800 mt-2">{c.contractNumber}</p>
                  <p className="text-xs text-gray-500">{c.contractStartDate || c.startDate} — {c.contractEndDate || c.endDate}</p>
                </div>
                <p className="text-xl font-black text-yellow-600">{(c.annualRent ?? 0).toLocaleString('ar-SA')} ر</p>
              </div>
              <div className="border-t border-gray-100 pt-3">
                <p className="text-xs font-semibold text-gray-500 mb-2">فواتير هذا العقد</p>
                <div className="space-y-2">
                  {invoices.filter(i => i.contractId === c.id).slice(0, 5).map(inv => (
                    <div key={inv.id} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl text-sm">
                      <span className="font-medium text-gray-700">{inv.invoiceNumber}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-800">{inv.totalAmount.toLocaleString('ar-SA')} ر</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${inv.invoiceStatus === 'paid' ? 'bg-green-100 text-green-700' : inv.invoiceStatus === 'overdue' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {inv.invoiceStatus === 'paid' ? 'مدفوعة' : inv.invoiceStatus === 'overdue' ? 'متأخرة' : 'معلقة'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Maintenance Tab */}
      {activeTab === 'maintenance' && (
        <div className="space-y-4">
          <button onClick={() => setShowNewRequest(true)}
            className="btn-primary w-full justify-center flex items-center gap-2">
            <Plus className="w-4 h-4" /> تقديم بلاغ صيانة جديد
          </button>

          {showNewRequest && (
            <div className="card border-2 border-orange-200 bg-orange-50/30 space-y-3">
              <div className="flex items-center justify-between">
                <p className="font-bold text-gray-800 flex items-center gap-2"><Wrench className="w-4 h-4 text-orange-500" /> بلاغ صيانة جديد</p>
                <button onClick={() => setShowNewRequest(false)} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
              </div>
              <input className="input-field" placeholder="عنوان البلاغ *" value={requestForm.title} onChange={e => setRequestForm(p => ({ ...p, title: e.target.value }))} />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">التصنيف</label>
                  <select className="input-field" value={requestForm.category} onChange={e => setRequestForm(p => ({ ...p, category: e.target.value }))}>
                    {categoryOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">الأولوية</label>
                  <select className="input-field" value={requestForm.priority} onChange={e => setRequestForm(p => ({ ...p, priority: e.target.value }))}>
                    <option value="low">منخفضة</option>
                    <option value="medium">متوسطة</option>
                    <option value="high">عالية</option>
                    <option value="urgent">عاجل</option>
                  </select>
                </div>
              </div>
              <textarea className="input-field" rows={3} placeholder="وصف المشكلة بالتفصيل..." value={requestForm.description} onChange={e => setRequestForm(p => ({ ...p, description: e.target.value }))} />
              <button onClick={() => fileRef.current?.click()} className="btn-secondary w-full flex items-center justify-center gap-2 text-sm">
                <Camera className="w-4 h-4" /> إرفاق صورة
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" />
              <button onClick={submitRequest} className="btn-primary w-full justify-center flex items-center gap-2">
                <Send className="w-4 h-4" /> إرسال البلاغ
              </button>
            </div>
          )}

          <div className="space-y-2">
            {myMaintenance.length === 0 ? (
              <div className="card text-center py-8 text-gray-400">
                <Wrench className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p>لا توجد بلاغات</p>
              </div>
            ) : myMaintenance.map(m => (
              <div key={m.id} className="card hover:shadow-sm transition-shadow">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    m.status === 'completed' ? 'bg-green-100 text-green-600' :
                    m.priority === 'urgent' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'
                  }`}>
                    {m.status === 'completed' ? <CheckCircle className="w-5 h-5" /> : <Wrench className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-800">{m.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{m.description?.slice(0, 70)}</p>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        m.status === 'completed' ? 'bg-green-100 text-green-700' :
                        m.status === 'in_progress' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {m.status === 'completed' ? '✓ مكتمل' : m.status === 'in_progress' ? '⚡ جاري التنفيذ' : '⏳ قيد المراجعة'}
                      </span>
                      <span className="text-xs text-gray-400">{m.createdAt}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Appointments Tab */}
      {activeTab === 'appointments' && (
        <div className="space-y-2">
          {myAppointments.length === 0 ? (
            <div className="card text-center py-8 text-gray-400">
              <Calendar className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p>لا توجد مواعيد</p>
            </div>
          ) : myAppointments.map(a => (
            <div key={a.id} className="card flex items-center gap-3 hover:shadow-sm transition-shadow">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm text-gray-800">
                  {a.type === 'viewing' ? 'زيارة عقار' : a.type === 'handover' ? 'تسليم وحدة' : a.type === 'maintenance' ? 'موعد صيانة' : a.type}
                </p>
                <p className="text-xs text-gray-500">{a.date} {a.time ? `| ${a.time}` : ''}</p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${a.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                {a.status === 'confirmed' ? 'مؤكد' : 'قيد التأكيد'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
