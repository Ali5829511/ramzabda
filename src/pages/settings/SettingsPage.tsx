import { useState } from 'react';
import { useStore } from '../../data/store';
import { Settings, Bell, Shield, Lock, Building2, CheckCircle, Eye, EyeOff } from 'lucide-react';

export default function SettingsPage() {
  const { currentUser, updateUser } = useStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [saved, setSaved] = useState(false);

  // Password change state
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwError, setPwError] = useState('');
  const [pwSaved, setPwSaved] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  // Notifications state
  const [notifSettings, setNotifSettings] = useState({
    payments: true,
    maintenance: true,
    contracts: true,
    appointments: true,
  });

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser) {
      updateUser(currentUser.id, { name, phone });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPwError('');
    if (!currentUser) return;
    if (currentPw !== currentUser.password) { setPwError('كلمة المرور الحالية غير صحيحة'); return; }
    if (newPw.length < 6) { setPwError('يجب أن تكون كلمة المرور الجديدة 6 أحرف على الأقل'); return; }
    if (newPw !== confirmPw) { setPwError('كلمة المرور الجديدة وتأكيدها غير متطابقتين'); return; }
    updateUser(currentUser.id, { password: newPw });
    setCurrentPw(''); setNewPw(''); setConfirmPw('');
    setPwSaved(true);
    setTimeout(() => setPwSaved(false), 2500);
  };

  const tabs = [
    { id: 'profile', label: 'الملف الشخصي', icon: <Shield className="w-4 h-4" /> },
    { id: 'password', label: 'كلمة المرور', icon: <Lock className="w-4 h-4" /> },
    { id: 'notifications', label: 'الإشعارات', icon: <Bell className="w-4 h-4" /> },
    { id: 'system', label: 'النظام', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="section-title">الإعدادات</h1>
        <p className="section-subtitle">ضبط إعدادات النظام والحساب</p>
      </div>

      <div className="flex gap-2 border-b border-gray-200 pb-2 flex-wrap">
        {tabs.map(t => (
          <button key={t.id} className={`flex items-center gap-2 px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${activeTab === t.id ? 'bg-yellow-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`} onClick={() => setActiveTab(t.id)}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'profile' && (
        <div className="card max-w-lg">
          <h3 className="font-bold text-gray-800 mb-4">بيانات الحساب</h3>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="label">الاسم الكامل</label>
              <input className="input-field" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div>
              <label className="label">البريد الإلكتروني</label>
              <input className="input-field bg-gray-50 text-gray-500" value={currentUser?.email} disabled />
            </div>
            <div>
              <label className="label">رقم الجوال</label>
              <input className="input-field" value={phone} onChange={e => setPhone(e.target.value)} />
            </div>
            <div>
              <label className="label">الدور</label>
              <input className="input-field bg-gray-50 text-gray-500" value={currentUser?.role} disabled />
            </div>
            <button type="submit" className={`btn-primary flex items-center gap-2 transition-colors ${saved ? 'bg-green-500 hover:bg-green-600' : ''}`}>
              {saved ? <><CheckCircle className="w-4 h-4" /> تم الحفظ!</> : 'حفظ التغييرات'}
            </button>
          </form>
        </div>
      )}

      {activeTab === 'password' && (
        <div className="card max-w-lg">
          <h3 className="font-bold text-gray-800 mb-1">تغيير كلمة المرور</h3>
          <p className="text-sm text-gray-500 mb-4">تأكد من اختيار كلمة مرور قوية لحماية حسابك</p>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="label">كلمة المرور الحالية</label>
              <div className="relative">
                <input type={showCurrent ? 'text' : 'password'} className="input-field pl-10" value={currentPw} onChange={e => setCurrentPw(e.target.value)} required />
                <button type="button" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" onClick={() => setShowCurrent(!showCurrent)}>
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="label">كلمة المرور الجديدة</label>
              <div className="relative">
                <input type={showNew ? 'text' : 'password'} className="input-field pl-10" value={newPw} onChange={e => setNewPw(e.target.value)} required minLength={6} placeholder="6 أحرف على الأقل" />
                <button type="button" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" onClick={() => setShowNew(!showNew)}>
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="label">تأكيد كلمة المرور الجديدة</label>
              <input type="password" className="input-field" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} required placeholder="أعد إدخال كلمة المرور الجديدة" />
            </div>
            {pwError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-lg">{pwError}</div>
            )}
            <button type="submit" className={`btn-primary flex items-center gap-2 transition-colors ${pwSaved ? 'bg-green-500 hover:bg-green-600' : ''}`}>
              {pwSaved ? <><CheckCircle className="w-4 h-4" /> تم تغيير كلمة المرور!</> : 'تغيير كلمة المرور'}
            </button>
          </form>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="card max-w-lg">
          <h3 className="font-bold text-gray-800 mb-4">إعدادات الإشعارات</h3>
          <div className="space-y-4">
            {([
              { key: 'payments' as const, label: 'إشعارات الدفع', desc: 'تنبيه عند حلول موعد الإيجار' },
              { key: 'maintenance' as const, label: 'إشعارات الصيانة', desc: 'تحديثات بلاغات الصيانة' },
              { key: 'contracts' as const, label: 'إشعارات العقود', desc: 'تنبيه قبل انتهاء العقد بـ 60 يوم' },
              { key: 'appointments' as const, label: 'إشعارات المواعيد', desc: 'تذكير قبل الموعد بساعة' },
            ]).map(item => (
              <div key={item.key} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-800">{item.label}</p>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={notifSettings[item.key]} onChange={e => setNotifSettings(s => ({ ...s, [item.key]: e.target.checked }))} className="sr-only peer" />
                  <div className="w-10 h-6 bg-gray-300 rounded-full peer peer-checked:bg-yellow-500 transition-colors after:content-[''] after:absolute after:top-0.5 after:right-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-[-100%]" />
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'system' && (
        <div className="space-y-6 max-w-lg">
          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Building2 className="w-5 h-5 text-yellow-600" />
              </div>
              <h3 className="font-bold text-gray-800">معلومات الشركة</h3>
            </div>
            <div className="space-y-3">
              {[
                { label: 'اسم الشركة', value: 'شركة رمز الإبداع لإدارة الأملاك' },
                { label: 'الموقع الرسمي', value: 'ramzabdae.com', link: 'https://ramzabdae.com' },
                { label: 'البريد الإلكتروني', value: 'info@ramzabdae.com' },
                { label: 'رقم السجل التجاري', value: '1010XXXXXX' },
                { label: 'رقم الترخيص (REGA)', value: 'FA-XXXXXXX' },
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                  <span className="text-sm text-gray-500">{item.label}</span>
                  {item.link
                    ? <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-yellow-600 hover:underline">{item.value}</a>
                    : <span className="text-sm font-medium text-gray-800">{item.value}</span>
                  }
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <h3 className="font-bold text-gray-800 mb-4">معلومات النظام</h3>
            <div className="space-y-3">
              {[
                { label: 'إصدار النظام', value: '1.0.0', badge: 'badge-green' },
                { label: 'قاعدة البيانات', value: 'متصلة', badge: 'badge-blue' },
                { label: 'وضع التشغيل', value: 'إنتاج', badge: 'badge-yellow' },
                { label: 'اللغة الافتراضية', value: 'العربية (SA)', badge: '' },
                { label: 'العملة', value: 'ريال سعودي (SAR)', badge: '' },
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                  <span className="text-sm text-gray-600">{item.label}</span>
                  {item.badge
                    ? <span className={`badge ${item.badge} text-xs`}>{item.value}</span>
                    : <span className="text-sm font-medium">{item.value}</span>
                  }
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
