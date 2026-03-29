import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '../store/authStore'
import api from '../lib/api'
import toast from 'react-hot-toast'
import { User, Mail, Phone, Lock, Save, Eye, EyeOff, Shield } from 'lucide-react'
import { USER_ROLES } from '../lib/constants'

export default function ProfilePage() {
  const { user, setAuth } = useAuthStore()
  const queryClient = useQueryClient()

  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  })

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile')

  const setProfile = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setProfileForm(f => ({ ...f, [field]: e.target.value }))

  const setPassword = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setPasswordForm(f => ({ ...f, [field]: e.target.value }))

  const updateProfile = useMutation({
    mutationFn: () => api.put('/auth/profile', profileForm),
    onSuccess: ({ data }) => {
      const token = useAuthStore.getState().token!
      setAuth(data.user, token)
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      toast.success('تم تحديث الملف الشخصي بنجاح')
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'فشل تحديث الملف الشخصي'),
  })

  const updatePassword = useMutation({
    mutationFn: () => api.put('/auth/password', {
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
    }),
    onSuccess: () => {
      toast.success('تم تغيير كلمة المرور بنجاح')
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'فشل تغيير كلمة المرور'),
  })

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateProfile.mutate()
  }

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('كلمتا المرور الجديدتان غير متطابقتين')
      return
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error('كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل')
      return
    }
    updatePassword.mutate()
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">الملف الشخصي</h1>
        <p className="text-gray-500 text-sm mt-1">إدارة بيانات حسابك الشخصي</p>
      </div>

      {/* Avatar & Role Card */}
      <div className="card flex items-center gap-5">
        <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center shadow-md shrink-0">
          <span className="text-white font-bold text-3xl">{user?.name?.[0]}</span>
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
          <p className="text-gray-500 text-sm">{user?.email}</p>
          <div className="flex items-center gap-2 mt-2">
            <Shield size={14} className="text-primary-600" />
            <span className="text-sm font-medium text-primary-700 bg-primary-50 px-2.5 py-0.5 rounded-full">
              {USER_ROLES[user?.role || ''] || user?.role}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'profile' ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'
          }`}>
          <span className="flex items-center gap-2"><User size={15} /> البيانات الشخصية</span>
        </button>
        <button
          onClick={() => setActiveTab('password')}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'password' ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'
          }`}>
          <span className="flex items-center gap-2"><Lock size={15} /> كلمة المرور</span>
        </button>
      </div>

      {/* Profile Form */}
      {activeTab === 'profile' && (
        <div className="card">
          <h3 className="text-base font-bold text-gray-900 mb-5 flex items-center gap-2">
            <User size={18} className="text-primary-600" />
            تعديل البيانات الشخصية
          </h3>
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div>
              <label className="label">الاسم الكامل</label>
              <div className="relative">
                <User size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" className="input pr-10" value={profileForm.name}
                  onChange={setProfile('name')} placeholder="الاسم الكامل" required />
              </div>
            </div>
            <div>
              <label className="label">البريد الإلكتروني</label>
              <div className="relative">
                <Mail size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="email" className="input pr-10" value={profileForm.email}
                  onChange={setProfile('email')} placeholder="البريد الإلكتروني" required />
              </div>
            </div>
            <div>
              <label className="label">رقم الهاتف</label>
              <div className="relative">
                <Phone size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="tel" className="input pr-10" value={profileForm.phone}
                  onChange={setProfile('phone')} placeholder="05xxxxxxxx" />
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button type="submit" disabled={updateProfile.isPending}
                className="btn-primary">
                <Save size={16} />
                {updateProfile.isPending ? 'جاري الحفظ...' : 'حفظ التغييرات'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Password Form */}
      {activeTab === 'password' && (
        <div className="card">
          <h3 className="text-base font-bold text-gray-900 mb-5 flex items-center gap-2">
            <Lock size={18} className="text-primary-600" />
            تغيير كلمة المرور
          </h3>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="label">كلمة المرور الحالية</label>
              <div className="relative">
                <Lock size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type={showCurrent ? 'text' : 'password'} className="input pr-10 pl-10"
                  value={passwordForm.currentPassword} onChange={setPassword('currentPassword')}
                  placeholder="أدخل كلمة المرور الحالية" required />
                <button type="button" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowCurrent(!showCurrent)}>
                  {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div>
              <label className="label">كلمة المرور الجديدة</label>
              <div className="relative">
                <Lock size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type={showNew ? 'text' : 'password'} className="input pr-10 pl-10"
                  value={passwordForm.newPassword} onChange={setPassword('newPassword')}
                  placeholder="6 أحرف على الأقل" required />
                <button type="button" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowNew(!showNew)}>
                  {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div>
              <label className="label">تأكيد كلمة المرور الجديدة</label>
              <div className="relative">
                <Lock size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type={showConfirm ? 'text' : 'password'} className="input pr-10 pl-10"
                  value={passwordForm.confirmPassword} onChange={setPassword('confirmPassword')}
                  placeholder="أعد إدخال كلمة المرور الجديدة" required />
                <button type="button" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowConfirm(!showConfirm)}>
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button type="submit" disabled={updatePassword.isPending}
                className="btn-primary">
                <Save size={16} />
                {updatePassword.isPending ? 'جاري التغيير...' : 'تغيير كلمة المرور'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
