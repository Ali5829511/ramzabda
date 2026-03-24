import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import {
  Home, Building2, FileText, Wrench, Megaphone, CreditCard, Users, LogOut, Menu, X, Bell, TrendingUp
} from 'lucide-react'
import { useState } from 'react'

const navItems = [
  { path: '/', icon: Home, label: 'لوحة التحكم', roles: ['ADMIN', 'OWNER', 'AGENT', 'TENANT'] },
  { path: '/properties', icon: Building2, label: 'العقارات', roles: ['ADMIN', 'OWNER', 'AGENT'] },
  { path: '/listings', icon: Megaphone, label: 'التسويق العقاري', roles: ['ADMIN', 'OWNER', 'AGENT', 'TENANT'] },
  { path: '/contracts', icon: FileText, label: 'العقود', roles: ['ADMIN', 'OWNER', 'AGENT', 'TENANT'] },
  { path: '/maintenance', icon: Wrench, label: 'الصيانة', roles: ['ADMIN', 'OWNER', 'AGENT', 'TENANT'] },
  { path: '/payments', icon: CreditCard, label: 'المدفوعات', roles: ['ADMIN', 'OWNER', 'AGENT', 'TENANT'] },
  { path: '/marketing', icon: TrendingUp, label: 'التقارير', roles: ['ADMIN', 'OWNER'] },
  { path: '/users', icon: Users, label: 'المستخدمون', roles: ['ADMIN'] },
]

export default function Layout() {
  const { user, logout } = useAuthStore()
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const filtered = navItems.filter(i => user && i.roles.includes(user.role))

  return (
    <div className="min-h-screen flex bg-gray-50">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed top-0 right-0 h-full w-64 bg-white border-l border-gray-200 shadow-lg z-50 transform transition-transform duration-300 
        ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'} md:relative md:translate-x-0 md:block flex flex-col`}>
        
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-800 rounded-xl flex items-center justify-center">
              <Building2 size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-900">رمز الإبداع</h1>
              <p className="text-xs text-gray-500">إدارة الأملاك</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {filtered.map(item => {
            const isActive = location.pathname === item.path
            return (
              <Link key={item.path} to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                  ${isActive ? 'bg-primary-50 text-primary-700 shadow-sm' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                onClick={() => setSidebarOpen(false)}>
                <item.icon size={18} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-primary-700 font-bold text-sm">{user?.name?.[0]}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button onClick={handleLogout}
            className="flex items-center gap-2 w-full px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-xl text-sm font-medium transition-colors">
            <LogOut size={16} />
            تسجيل الخروج
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 rounded-lg hover:bg-gray-100">
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-3 mr-auto">
            <button className="p-2 rounded-xl hover:bg-gray-100 relative">
              <Bell size={18} className="text-gray-600" />
              <span className="absolute top-1.5 left-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="hidden md:flex items-center gap-2 text-sm text-gray-600">
              <span className="font-medium">{user?.name}</span>
            </div>
          </div>
        </header>
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
