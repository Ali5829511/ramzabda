import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import api from '../lib/api'
import toast from 'react-hot-toast'
import { Building2, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await api.post('/auth/login', { email, password })
      setAuth(data.user, data.token)
      toast.success(`مرحباً ${data.user.name}!`)
      navigate('/')
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'فشل تسجيل الدخول')
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
          <h2 className="text-xl font-bold text-gray-900 mb-6">تسجيل الدخول</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">البريد الإلكتروني</label>
              <input type="email" className="input" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="أدخل بريدك الإلكتروني" required />
            </div>
            <div>
              <label className="label">كلمة المرور</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} className="input pl-10" value={password}
                  onChange={e => setPassword(e.target.value)} placeholder="أدخل كلمة المرور" required />
                <button type="button" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPass(!showPass)}>
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-xl transition-all duration-200 disabled:opacity-60">
              {loading ? 'جاري الدخول...' : 'دخول'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-500 text-center mb-3">بيانات تجريبية:</p>
            <div className="space-y-1 text-xs text-gray-500 text-center">
              <p>مدير: admin@ramzabda.com / admin123</p>
              <p>مالك: owner@ramzabda.com / owner123</p>
              <p>مستأجر: tenant@ramzabda.com / tenant123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
