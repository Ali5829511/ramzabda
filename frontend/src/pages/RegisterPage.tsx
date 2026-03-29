import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import api from '../lib/api'
import toast from 'react-hot-toast'
import { Building2, Eye, EyeOff, User, Mail, Phone, Lock } from 'lucide-react'

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'TENANT',
  })
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password !== form.confirmPassword) {
      toast.error('كلمتا المرور غير متطابقتين')
      return
    }
    if (form.password.length < 6) {
      toast.error('كلمة المرور يجب أن تكون 6 أحرف على الأقل')
      return
    }
    setLoading(true)
    try {
      const { data } = await api.post('/auth/register', {
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        role: form.role,
      })
      setAuth(data.user, data.token)
      toast.success(`مرحباً ${data.user.name}! تم إنشاء حسابك بنجاح`)
      navigate('/')
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'فشل إنشاء الحساب')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur rounded-2xl mb-4">
            <Building2 size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">رمز الإبداع</h1>
          <p className="text-primary-200 mt-2">منصة إدارة الأملاك العقارية المتكاملة</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">إنشاء حساب جديد</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">الاسم الكامل</label>
              <div className="relative">
                <User size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" className="input pr-10" value={form.name}
                  onChange={set('name')} placeholder="أدخل اسمك الكامل" required />
              </div>
            </div>

            <div>
              <label className="label">البريد الإلكتروني</label>
              <div className="relative">
                <Mail size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="email" className="input pr-10" value={form.email}
                  onChange={set('email')} placeholder="أدخل بريدك الإلكتروني" required />
              </div>
            </div>

            <div>
              <label className="label">رقم الهاتف</label>
              <div className="relative">
                <Phone size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="tel" className="input pr-10" value={form.phone}
                  onChange={set('phone')} placeholder="05xxxxxxxx" />
              </div>
            </div>

            <div>
              <label className="label">نوع الحساب</label>
              <select className="select" value={form.role} onChange={set('role')}>
                <option value="TENANT">مستأجر</option>
                <option value="OWNER">مالك عقار</option>
                <option value="AGENT">وكيل عقاري</option>
              </select>
            </div>

            <div>
              <label className="label">كلمة المرور</label>
              <div className="relative">
                <Lock size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type={showPass ? 'text' : 'password'} className="input pr-10 pl-10"
                  value={form.password} onChange={set('password')}
                  placeholder="6 أحرف على الأقل" required />
                <button type="button" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPass(!showPass)}>
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="label">تأكيد كلمة المرور</label>
              <div className="relative">
                <Lock size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type={showConfirm ? 'text' : 'password'} className="input pr-10 pl-10"
                  value={form.confirmPassword} onChange={set('confirmPassword')}
                  placeholder="أعد إدخال كلمة المرور" required />
                <button type="button" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowConfirm(!showConfirm)}>
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-xl transition-all duration-200 disabled:opacity-60 mt-2">
              {loading ? 'جاري إنشاء الحساب...' : 'إنشاء الحساب'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-600">
              لديك حساب بالفعل؟{' '}
              <Link to="/login" className="text-primary-600 font-semibold hover:text-primary-700">
                تسجيل الدخول
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
