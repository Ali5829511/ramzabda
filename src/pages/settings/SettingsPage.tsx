import { useState } from 'react';
import { useStore } from '../../data/store';
import { Settings, Bell, Shield } from 'lucide-react';

export default function SettingsPage() {
  const { currentUser, updateUser } = useStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [saved, setSaved] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser) {
      updateUser(currentUser.id, { name, phone });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const tabs = [
    { id: 'profile', label: 'الملف الشخصي', icon: <Shield className="w-4 h-4" /> },
    { id: 'notifications', label: 'الإشعارات', icon: <Bell className="w-4 h-4" /> },
    { id: 'system', label: 'النظام', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="section-title">الإعدادات</h1>
        <p className="section-subtitle">ضبط إعدادات النظام والحساب</p>
      </div>

      <div className="flex gap-2 border-b border-gray-200 pb-2">
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
            <button type="submit" className={`btn-primary ${saved ? 'bg-green-500' : ''}`}>
              {saved ? 'تم الحفظ!' : 'حفظ التغييرات'}
            </button>
          </form>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="card max-w-lg">
          <h3 className="font-bold text-gray-800 mb-4">إعدادات الإشعارات</h3>
          <div className="space-y-4">
            {[
              { label: 'إشعارات الدفع', desc: 'تنبيه عند حلول موعد الإيجار' },
              { label: 'إشعارات الصيانة', desc: 'تحديثات بلاغات الصيانة' },
              { label: 'إشعارات العقود', desc: 'تنبيه قبل انتهاء العقد بـ 60 يوم' },
              { label: 'إشعارات المواعيد', desc: 'تذكير قبل الموعد بساعة' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-800">{item.label}</p>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-10 h-6 bg-gray-300 rounded-full peer peer-checked:bg-yellow-500 transition-colors after:content-[''] after:absolute after:top-0.5 after:right-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-[-100%]" />
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'system' && (
        <div className="card max-w-lg">
          <h3 className="font-bold text-gray-800 mb-4">معلومات النظام</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">اسم الشركة</span>
              <span className="text-sm font-medium">شركة رمز الإبداع لإدارة الأملاك</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">الموقع الرسمي</span>
              <a href="https://ramzabdae.com" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-yellow-600 hover:underline">ramzabdae.com</a>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">إصدار النظام</span>
              <span className="text-sm font-medium badge badge-green">1.0.0</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-600">قاعدة البيانات</span>
              <span className="text-sm font-medium badge badge-blue">متصلة</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
