import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import {
  Home, Building2, FileText, Wrench, Megaphone, CreditCard, Users,
  LogOut, Menu, Bell, TrendingUp, MapPin, X, CheckCheck, Clock, AlertTriangle, Sparkles,
  Search, Heart, Settings, HelpCircle, User, ChevronDown
} from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'

const navItems = [
  { path: '/', icon: Home, label: 'لوحة التحكم', roles: ['ADMIN', 'OWNER', 'AGENT', 'TENANT'] },
  { path: '/properties', icon: Building2, label: 'العقارات', roles: ['ADMIN', 'OWNER', 'AGENT'] },
  { path: '/search', icon: Search, label: 'البحث المتقدم', roles: ['ADMIN', 'OWNER', 'AGENT', 'TENANT'] },
  { path: '/map', icon: MapPin, label: 'خريطة العقارات', roles: ['ADMIN', 'OWNER', 'AGENT', 'TENANT'] },
  { path: '/suggestions', icon: Sparkles, label: 'اقتراحات ذكية', roles: ['ADMIN', 'OWNER', 'AGENT', 'TENANT'] },
  { path: '/favorites', icon: Heart, label: 'المفضلة', roles: ['ADMIN', 'OWNER', 'AGENT', 'TENANT'] },
  { path: '/listings', icon: Megaphone, label: 'التسويق العقاري', roles: ['ADMIN', 'OWNER', 'AGENT', 'TENANT'] },
  { path: '/contracts', icon: FileText, label: 'العقود', roles: ['ADMIN', 'OWNER', 'AGENT', 'TENANT'] },
  { path: '/maintenance', icon: Wrench, label: 'الصيانة', roles: ['ADMIN', 'OWNER', 'AGENT', 'TENANT'] },
  { path: '/payments', icon: CreditCard, label: 'المدفوعات', roles: ['ADMIN', 'OWNER', 'AGENT', 'TENANT'] },
  { path: '/marketing', icon: TrendingUp, label: 'التقارير', roles: ['ADMIN', 'OWNER'] },
  { path: '/users', icon: Users, label: 'المستخدمون', roles: ['ADMIN'] },
]

const notifIcons: Record<string, any> = {
  MAINTENANCE: Wrench,
  PAYMENT: CreditCard,
  CONTRACT: FileText,
  ALERT: AlertTriangle,
}

function NotificationsPanel({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get('/notifications').then(r => r.data).catch(() => ({ notifications: [] }))
  })

  const markAll = useMutation({
    mutationFn: () => api.put('/notifications/read-all').catch(() => {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] })
  })

  const notifications = data?.notifications || []
  const unread = notifications.filter((n: any) => !n.read)

  return (
    <div className="absolute left-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-200 z-50 overflow-hidden"
      style={{ right: 'auto', left: '-220px' }}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Bell size={16} className="text-primary-600" />
          <span className="font-bold text-gray-900 text-sm">الإشعارات</span>
          {unread.length > 0 && (
            <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">{unread.length}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unread.length > 0 && (
            <button onClick={() => markAll.mutate()}
              className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1">
              <CheckCheck size={13} />
              قراءة الكل
            </button>
          )}
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X size={14} className="text-gray-500" />
          </button>
        </div>
      </div>

      <div className="max-h-80 overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center py-6">
            <div className="animate-spin w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center py-8 text-gray-400">
            <Bell size={28} className="mb-2 opacity-40" />
            <p className="text-sm">لا توجد إشعارات</p>
          </div>
        ) : (
          notifications.slice(0, 15).map((n: any) => {
            const Icon = notifIcons[n.type] || Bell
            return (
              <div key={n.id}
                className={`flex items-start gap-3 px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${!n.read ? 'bg-primary-50/40' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${!n.read ? 'bg-primary-100' : 'bg-gray-100'}`}>
                  <Icon size={14} className={!n.read ? 'text-primary-600' : 'text-gray-500'} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-semibold truncate ${!n.read ? 'text-gray-900' : 'text-gray-700'}`}>{n.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                    <Clock size={10} />
                    {new Date(n.createdAt).toLocaleDateString('ar-SA')}
                  </p>
                </div>
                {!n.read && <div className="w-2 h-2 bg-primary-500 rounded-full mt-1 shrink-0" />}
              </div>
            )
          })
        )}
      </div>

      {notifications.length > 0 && (
        <div className="px-4 py-2 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400">{notifications.length} إشعار</p>
        </div>
      )}
    </div>
  )
}

function UserMenu({ user, onLogout }: { user: any; onLogout: () => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div className="hidden md:block relative" ref={ref}>
      <button onClick={() => setOpen(!open)}
        className="flex items-center gap-2 pl-2 border-r border-gray-200 pr-3 mr-1 hover:bg-gray-50 rounded-lg py-1 transition-colors">
        <div className="w-7 h-7 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-xs">{user?.name?.[0]}</span>
        </div>
        <span className="text-sm font-medium text-gray-700">{user?.name}</span>
        <ChevronDown size={14} className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden py-1">
          <Link to="/profile" onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
            <User size={15} className="text-gray-400" /> الملف الشخصي
          </Link>
          <Link to="/notifications" onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
            <Bell size={15} className="text-gray-400" /> الإشعارات
          </Link>
          <Link to="/settings" onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
            <Settings size={15} className="text-gray-400" /> الإعدادات
          </Link>
          <Link to="/support" onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
            <HelpCircle size={15} className="text-gray-400" /> الدعم
          </Link>
          <div className="border-t border-gray-100 mt-1 pt-1">
            <button onClick={() => { setOpen(false); onLogout() }}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-right">
              <LogOut size={15} /> تسجيل الخروج
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Layout() {
  const { user, logout } = useAuthStore()
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)

  const { data: notifData } = useQuery({
    queryKey: ['notifications-count'],
    queryFn: () => api.get('/notifications').then(r => r.data).catch(() => ({ notifications: [] })),
    refetchInterval: 30000,
  })
  const unreadCount = (notifData?.notifications || []).filter((n: any) => !n.read).length

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

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
            <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-800 rounded-xl flex items-center justify-center shadow-sm">
              <Building2 size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-900">رمز الإبداع</h1>
              <p className="text-xs text-gray-500">إدارة الأملاك العقارية</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-0.5 overflow-y-auto">
          {filtered.map(item => {
            const isActive = location.pathname === item.path ||
              (item.path !== '/' && location.pathname.startsWith(item.path))
            return (
              <Link key={item.path} to={item.path}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                  ${isActive
                    ? 'bg-primary-50 text-primary-700 shadow-sm border border-primary-100'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                onClick={() => setSidebarOpen(false)}>
                <item.icon size={17} className={isActive ? 'text-primary-600' : ''} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-sm">{user?.name?.[0]}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <div className="space-y-0.5 mb-2">
            <Link to="/profile" onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-2 w-full px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-xl text-sm font-medium transition-colors">
              <User size={15} /> الملف الشخصي
            </Link>
            <Link to="/notifications" onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-2 w-full px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-xl text-sm font-medium transition-colors">
              <Bell size={15} /> الإشعارات
              {unreadCount > 0 && (
                <span className="mr-auto bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">{unreadCount}</span>
              )}
            </Link>
            <Link to="/settings" onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-2 w-full px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-xl text-sm font-medium transition-colors">
              <Settings size={15} /> الإعدادات
            </Link>
            <Link to="/support" onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-2 w-full px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-xl text-sm font-medium transition-colors">
              <HelpCircle size={15} /> الدعم والمساعدة
            </Link>
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
          <div className="flex items-center gap-2 mr-auto" ref={notifRef}>
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className={`p-2 rounded-xl transition-colors relative ${notifOpen ? 'bg-primary-50 text-primary-600' : 'hover:bg-gray-100 text-gray-600'}`}>
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 left-1 min-w-[16px] h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center px-0.5 font-bold">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              {notifOpen && <NotificationsPanel onClose={() => setNotifOpen(false)} />}
            </div>
            <UserMenu user={user} onLogout={handleLogout} />
          </div>
        </header>
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
