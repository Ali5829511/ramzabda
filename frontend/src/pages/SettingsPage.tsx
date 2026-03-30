import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'
import {
  Bell, Shield, Globe, Moon, LogOut, ChevronRight,
  Smartphone, Mail, Volume2, Eye, Trash2
} from 'lucide-react'

interface NotifSettings {
  emailNotifications: boolean
  pushNotifications: boolean
  smsNotifications: boolean
  maintenanceAlerts: boolean
  paymentReminders: boolean
  contractAlerts: boolean
  marketingEmails: boolean
}

interface PrivacySettings {
  showProfile: boolean
  showPhone: boolean
  showEmail: boolean
}

const STORAGE_KEY_NOTIF = 'ramz-notif-settings'
const STORAGE_KEY_PRIVACY = 'ramz-privacy-settings'

function loadSettings<T>(key: string, defaults: T): T {
  try {
    return { ...defaults, ...JSON.parse(localStorage.getItem(key) || '{}') }
  } catch {
    return defaults
  }
}

export default function SettingsPage() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const [notifSettings, setNotifSettings] = useState<NotifSettings>(() =>
    loadSettings(STORAGE_KEY_NOTIF, {
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: false,
      maintenanceAlerts: true,
      paymentReminders: true,
      contractAlerts: true,
      marketingEmails: false,
    })
  )

  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>(() =>
    loadSettings(STORAGE_KEY_PRIVACY, {
      showProfile: true,
      showPhone: false,
      showEmail: false,
    })
  )

  const [darkMode] = useState(false)
  const [language] = useState('ar')
  const [activeSection, setActiveSection] = useState<string>('notifications')

  const saveNotifSettings = (updated: NotifSettings) => {
    setNotifSettings(updated)
    localStorage.setItem(STORAGE_KEY_NOTIF, JSON.stringify(updated))
    toast.success('تم حفظ إعدادات الإشعارات')
  }

  const savePrivacySettings = (updated: PrivacySettings) => {
    setPrivacySettings(updated)
    localStorage.setItem(STORAGE_KEY_PRIVACY, JSON.stringify(updated))
    toast.success('تم حفظ إعدادات الخصوصية')
  }

  const toggleNotif = (key: keyof NotifSettings) => {
    const updated = { ...notifSettings, [key]: !notifSettings[key] }
    saveNotifSettings(updated)
  }

  const togglePrivacy = (key: keyof PrivacySettings) => {
    const updated = { ...privacySettings, [key]: !privacySettings[key] }
    savePrivacySettings(updated)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
    toast.success('تم تسجيل الخروج بنجاح')
  }

  const sections = [
    { id: 'notifications', label: 'الإشعارات', icon: Bell },
    { id: 'privacy', label: 'الخصوصية', icon: Shield },
    { id: 'appearance', label: 'المظهر', icon: Moon },
    { id: 'account', label: 'الحساب', icon: LogOut },
  ]

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <button onClick={onChange}
      className={`relative w-11 h-6 rounded-full transition-colors ${checked ? 'bg-primary-600' : 'bg-gray-200'}`}>
      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${
        checked ? 'right-0.5' : 'left-0.5'
      }`} />
    </button>
  )

  const SettingRow = ({ label, description, checked, onChange }: {
    label: string; description?: string; checked: boolean; onChange: () => void
  }) => (
    <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
      <div>
        <p className="text-sm font-medium text-gray-900">{label}</p>
        {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  )

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">الإعدادات</h1>
        <p className="text-gray-500 text-sm mt-1">تخصيص تجربتك في المنصة</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="md:col-span-1">
          <div className="card p-2 space-y-0.5">
            {sections.map(s => (
              <button key={s.id} onClick={() => setActiveSection(s.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeSection === s.id
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}>
                <s.icon size={16} />
                {s.label}
                <ChevronRight size={14} className="mr-auto opacity-40" />
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="md:col-span-3 space-y-4">
          {/* Notifications */}
          {activeSection === 'notifications' && (
            <div className="card">
              <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Bell size={18} className="text-primary-600" />
                إعدادات الإشعارات
              </h3>
              <div className="space-y-0">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">قنوات الإشعارات</p>
                <SettingRow label="إشعارات البريد الإلكتروني"
                  description="استقبال الإشعارات عبر البريد الإلكتروني"
                  checked={notifSettings.emailNotifications}
                  onChange={() => toggleNotif('emailNotifications')} />
                <SettingRow label="الإشعارات الفورية"
                  description="إشعارات داخل التطبيق"
                  checked={notifSettings.pushNotifications}
                  onChange={() => toggleNotif('pushNotifications')} />
                <SettingRow label="إشعارات الرسائل النصية"
                  description="استقبال تنبيهات عبر SMS"
                  checked={notifSettings.smsNotifications}
                  onChange={() => toggleNotif('smsNotifications')} />

                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 mt-4">أنواع الإشعارات</p>
                <SettingRow label="تنبيهات الصيانة"
                  description="إشعارات طلبات الصيانة والتحديثات"
                  checked={notifSettings.maintenanceAlerts}
                  onChange={() => toggleNotif('maintenanceAlerts')} />
                <SettingRow label="تذكيرات المدفوعات"
                  description="تنبيهات مواعيد الدفع والمتأخرات"
                  checked={notifSettings.paymentReminders}
                  onChange={() => toggleNotif('paymentReminders')} />
                <SettingRow label="تنبيهات العقود"
                  description="إشعارات انتهاء وتجديد العقود"
                  checked={notifSettings.contractAlerts}
                  onChange={() => toggleNotif('contractAlerts')} />
                <SettingRow label="رسائل تسويقية"
                  description="عروض وأخبار المنصة"
                  checked={notifSettings.marketingEmails}
                  onChange={() => toggleNotif('marketingEmails')} />
              </div>
            </div>
          )}

          {/* Privacy */}
          {activeSection === 'privacy' && (
            <div className="card">
              <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Shield size={18} className="text-primary-600" />
                إعدادات الخصوصية
              </h3>
              <SettingRow label="إظهار الملف الشخصي"
                description="السماح للآخرين برؤية ملفك الشخصي"
                checked={privacySettings.showProfile}
                onChange={() => togglePrivacy('showProfile')} />
              <SettingRow label="إظهار رقم الهاتف"
                description="عرض رقم هاتفك للمستخدمين الآخرين"
                checked={privacySettings.showPhone}
                onChange={() => togglePrivacy('showPhone')} />
              <SettingRow label="إظهار البريد الإلكتروني"
                description="عرض بريدك الإلكتروني للمستخدمين الآخرين"
                checked={privacySettings.showEmail}
                onChange={() => togglePrivacy('showEmail')} />
            </div>
          )}

          {/* Appearance */}
          {activeSection === 'appearance' && (
            <div className="card">
              <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Moon size={18} className="text-primary-600" />
                إعدادات المظهر
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="label">اللغة</label>
                  <select className="select" value={language} disabled>
                    <option value="ar">العربية</option>
                    <option value="en">English</option>
                  </select>
                  <p className="text-xs text-gray-400 mt-1">سيتم دعم تغيير اللغة قريباً</p>
                </div>
                <div className="flex items-center justify-between py-3 border-t border-gray-100">
                  <div>
                    <p className="text-sm font-medium text-gray-900">الوضع الليلي</p>
                    <p className="text-xs text-gray-500 mt-0.5">سيتم دعمه قريباً</p>
                  </div>
                  <button disabled
                    className="relative w-11 h-6 rounded-full bg-gray-200 opacity-50 cursor-not-allowed">
                    <span className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Account */}
          {activeSection === 'account' && (
            <div className="space-y-4">
              <div className="card">
                <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <LogOut size={18} className="text-primary-600" />
                  إدارة الحساب
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    <span className="text-xs bg-primary-100 text-primary-700 px-2.5 py-1 rounded-full font-medium">
                      {user?.role}
                    </span>
                  </div>
                  <button onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 py-3 text-red-600 hover:bg-red-50 rounded-xl border border-red-100 text-sm font-medium transition-colors">
                    <LogOut size={16} />
                    تسجيل الخروج
                  </button>
                </div>
              </div>

              <div className="card border-red-100">
                <h3 className="text-base font-bold text-red-600 mb-2 flex items-center gap-2">
                  <Trash2 size={18} />
                  منطقة الخطر
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  حذف الحساب نهائياً. هذا الإجراء لا يمكن التراجع عنه.
                </p>
                <button
                  onClick={() => toast.error('يرجى التواصل مع الدعم لحذف الحساب')}
                  className="btn-danger text-sm">
                  <Trash2 size={15} />
                  حذف الحساب
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
