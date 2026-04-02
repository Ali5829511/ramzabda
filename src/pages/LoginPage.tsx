import { useState } from 'react';
import { useStore } from '../data/store';
import { Building2, Lock, Eye, EyeOff, User, Shield, ChevronRight, Sparkles } from 'lucide-react';

const roleConfig: Record<string, { label: string; color: string; bg: string; border: string; icon: string; desc: string }> = {
  admin:      { label: 'المدير العام',    color: 'text-purple-700', bg: 'bg-purple-50',  border: 'border-purple-200', icon: '👑', desc: 'صلاحيات كاملة لجميع العمليات' },
  employee:   { label: 'موظف',           color: 'text-blue-700',   bg: 'bg-blue-50',    border: 'border-blue-200',   icon: '💼', desc: 'إدارة العقارات والعملاء' },
  owner:      { label: 'مالك عقار',      color: 'text-green-700',  bg: 'bg-green-50',   border: 'border-green-200',  icon: '🏠', desc: 'متابعة عقاراتك وإيراداتك' },
  tenant:     { label: 'مستأجر',         color: 'text-orange-700', bg: 'bg-orange-50',  border: 'border-orange-200', icon: '🔑', desc: 'عقدك وفواتيرك وبلاغات الصيانة' },
  technician: { label: 'فني صيانة',      color: 'text-red-700',    bg: 'bg-red-50',     border: 'border-red-200',    icon: '🔧', desc: 'طلبات الصيانة الموجهة إليك' },
  broker:     { label: 'وسيط عقاري',     color: 'text-yellow-700', bg: 'bg-amber-50',   border: 'border-amber-200',  icon: '🤝', desc: 'العقارات والعملاء والعمولات' },
};

export default function LoginPage() {
  const login = useStore(s => s.login);
  const users = useStore(s => s.users);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'login' | 'quick'>('login');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    const ok = login(email, password);
    if (!ok) setError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
    setLoading(false);
  };

  const quickLogin = (userEmail: string, userPass: string) => {
    setLoading(true);
    setTimeout(() => { login(userEmail, userPass); setLoading(false); }, 400);
  };

  const roleGroups = Object.entries(roleConfig);

  return (
    <div className="min-h-screen flex" dir="rtl">
      {/* Left Panel — Brand */}
      <div className="hidden lg:flex w-[45%] bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] flex-col items-center justify-center p-12 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-0 left-0 w-80 h-80 bg-yellow-500/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full translate-x-1/2 translate-y-1/2" />

        <div className="relative z-10 text-center space-y-8">
          <img src="/logo.png" alt="رمز الإبداع" className="w-28 h-28 object-contain mx-auto drop-shadow-2xl" />
          <div>
            <h1 className="text-3xl font-black text-white">رمز الإبداع</h1>
            <p className="text-yellow-400 font-semibold mt-1">لإدارة الأملاك</p>
            <p className="text-blue-200 text-sm mt-3 leading-relaxed max-w-xs mx-auto">
              منصة تشغيل عقاري متكاملة تجمع إدارة الأملاك، الصيانة، التسويق، وعلاقات العملاء
            </p>
          </div>

          {/* Portal cards */}
          <div className="grid grid-cols-2 gap-3 max-w-sm">
            {roleGroups.map(([role, cfg]) => (
              <div key={role} className="bg-white/10 backdrop-blur rounded-xl p-3 text-right border border-white/10 hover:bg-white/15 transition-colors">
                <span className="text-lg">{cfg.icon}</span>
                <p className="text-white font-semibold text-xs mt-1">{cfg.label}</p>
                <p className="text-blue-300 text-xs mt-0.5 leading-tight">{cfg.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-6">
            <img src="/logo.png" alt="رمز الإبداع" className="w-20 h-20 object-contain mx-auto mb-2" />
            <h1 className="text-xl font-black text-gray-900">رمز الإبداع لإدارة الأملاك</h1>
          </div>

          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-gray-100">
              {[
                { id: 'login', label: 'تسجيل الدخول', icon: <Lock className="w-4 h-4" /> },
                { id: 'quick', label: 'دخول سريع', icon: <Sparkles className="w-4 h-4" /> },
              ].map(t => (
                <button key={t.id} onClick={() => setActiveTab(t.id as any)}
                  className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-semibold transition-colors ${activeTab === t.id ? 'text-yellow-600 border-b-2 border-yellow-500 bg-yellow-50/50' : 'text-gray-400 hover:text-gray-600'}`}>
                  {t.icon} {t.label}
                </button>
              ))}
            </div>

            <div className="p-8">
              {activeTab === 'login' ? (
                <form onSubmit={handleLogin} className="space-y-5">
                  <div className="text-center mb-2">
                    <div className="w-14 h-14 bg-yellow-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <Shield className="w-7 h-7 text-white" />
                    </div>
                    <p className="text-sm text-gray-500">أدخل بياناتك للوصول إلى لوحة التحكم</p>
                  </div>

                  <div>
                    <label className="label">البريد الإلكتروني</label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input type="email" className="input-field pr-9"
                        placeholder="example@ramzabdae.com"
                        value={email} onChange={e => setEmail(e.target.value)} required />
                    </div>
                  </div>

                  <div>
                    <label className="label">كلمة المرور</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input type={showPass ? 'text' : 'password'} className="input-field pr-9 pl-10"
                        placeholder="كلمة المرور"
                        value={password} onChange={e => setPassword(e.target.value)} required />
                      <button type="button" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        onClick={() => setShowPass(!showPass)}>
                        {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center">
                      <p className="text-red-600 text-sm font-medium">{error}</p>
                    </div>
                  )}

                  <button type="submit" disabled={loading}
                    className="btn-primary w-full justify-center py-3 text-base disabled:opacity-60">
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <><Lock className="w-5 h-5" /> تسجيل الدخول</>
                    )}
                  </button>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="text-center mb-2">
                    <p className="text-sm text-gray-500">اختر حسابك لدخول سريع</p>
                  </div>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {users.filter(u => u.isActive).slice(0, 12).map(u => {
                      const cfg = roleConfig[u.role] ?? roleConfig.employee;
                      return (
                        <button key={u.id} onClick={() => quickLogin(u.email, u.password)}
                          className={`w-full flex items-center gap-3 p-3.5 rounded-xl border ${cfg.border} ${cfg.bg} hover:shadow-sm transition-all text-right group`}>
                          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-lg shadow-sm shrink-0">
                            {cfg.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`font-bold text-sm ${cfg.color} truncate`}>{u.name}</p>
                            <p className="text-xs text-gray-400">{cfg.label}</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                        </button>
                      );
                    })}
                  </div>
                  {loading && (
                    <div className="flex items-center justify-center gap-2 py-2">
                      <div className="w-4 h-4 border-2 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin" />
                      <span className="text-xs text-gray-400">جارٍ الدخول...</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            © 2025 رمز الإبداع لإدارة الأملاك — جميع الحقوق محفوظة
          </p>
        </div>
      </div>
    </div>
  );
}
