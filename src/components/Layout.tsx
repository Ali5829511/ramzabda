import { useState } from 'react';
import { useStore } from '../data/store';
import {
   LayoutDashboard, Home, FileText, Wrench,
  Users, Megaphone, FileStack, Settings, ClipboardList, Calculator, LogOut, ChevronDown, ChevronRight, Menu, X,
  DollarSign, UserCheck, Briefcase, TrendingUp,
  Search, FileWarning, Link2, Ticket, FileSpreadsheet,
  Archive, MapPin, Target, CreditCard
} from 'lucide-react';
import NotificationCenter from './NotificationCenter';
import type { UserRole } from '../types';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  roles: UserRole[];
  children?: { id: string; label: string; roles: UserRole[] }[];
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'لوحة التحكم', icon: <LayoutDashboard className="w-5 h-5" />, roles: ['admin', 'employee', 'owner', 'tenant', 'technician', 'broker'] },
  { id: 'properties', label: 'العقارات والوحدات', icon: <Home className="w-5 h-5" />, roles: ['admin', 'employee', 'owner'], children: [
    { id: 'properties-list', label: 'قائمة العقارات', roles: ['admin', 'employee', 'owner'] },
    { id: 'units', label: 'الوحدات', roles: ['admin', 'employee', 'owner'] },
  ]},
  { id: 'contracts', label: 'العقود والإيجار', icon: <FileText className="w-5 h-5" />, roles: ['admin', 'employee', 'owner', 'tenant'], children: [
    { id: 'contracts-list', label: 'العقود', roles: ['admin', 'employee', 'owner', 'tenant'] },
    { id: 'payments', label: 'المدفوعات', roles: ['admin', 'employee', 'owner', 'tenant'] },
  ]},
  { id: 'maintenance', label: 'الصيانة', icon: <Wrench className="w-5 h-5" />, roles: ['admin', 'employee', 'owner', 'tenant', 'technician'] },
  { id: 'tickets', label: 'الشكاوى والتذاكر', icon: <Ticket className="w-5 h-5" />, roles: ['admin', 'employee', 'owner', 'tenant'] },
  { id: 'crm', label: 'إدارة العملاء', icon: <Users className="w-5 h-5" />, roles: ['admin', 'employee', 'broker'], children: [
    { id: 'crm', label: 'خدمة العملاء (CRM)', roles: ['admin', 'employee', 'broker'] },
    { id: 'customers', label: 'قائمة العملاء', roles: ['admin', 'employee', 'broker'] },
    { id: 'interactions', label: 'سجل التواصل', roles: ['admin', 'employee'] },
  ]},
  { id: 'marketing', label: 'التسويق العقاري', icon: <Megaphone className="w-5 h-5" />, roles: ['admin', 'employee', 'broker'], children: [
    { id: 'marketing', label: 'العروض والحملات', roles: ['admin', 'employee', 'broker'] },
    { id: 'brokerage', label: 'عقود الوساطة (REGA)', roles: ['admin', 'employee', 'broker'] },
    { id: 'ad-licenses', label: 'تراخيص الإعلانات (REGA)', roles: ['admin', 'employee', 'broker'] },
    { id: 'appointments', label: 'المواعيد والزيارات', roles: ['admin', 'employee', 'tenant', 'broker'] },
  ]},
  { id: 'finances', label: 'التقارير المالية', icon: <DollarSign className="w-5 h-5" />, roles: ['admin', 'owner'] },
  { id: 'accounting', label: 'بوابة المحاسبة', icon: <Calculator className="w-5 h-5" />, roles: ['admin', 'owner', 'employee'] },
  { id: 'contract-alerts', label: 'متابعة العقود', icon: <FileWarning className="w-5 h-5" />, roles: ['admin', 'employee', 'owner'] },
  { id: 'integrations', label: 'التكاملات', icon: <Link2 className="w-5 h-5" />, roles: ['admin'] },
  { id: 'print-center', label: 'الطباعة والتصدير', icon: <Briefcase className="w-5 h-5" />, roles: ['admin', 'employee', 'owner'] },
  { id: 'templates', label: 'النماذج والقوالب', icon: <FileStack className="w-5 h-5" />, roles: ['admin', 'employee'] },
  { id: 'pricing-market', label: 'التسعير والدراسة السوقية', icon: <TrendingUp className="w-5 h-5" />, roles: ['admin', 'employee'] },
  { id: 'map-view', label: 'خريطة العقارات', icon: <MapPin className="w-5 h-5" />, roles: ['admin', 'employee', 'owner', 'broker'] },
  { id: 'document-archive', label: 'أرشيف الوثائق', icon: <Archive className="w-5 h-5" />, roles: ['admin', 'employee', 'owner'] },
  { id: 'roi-reports', label: 'تقارير الأداء والـ ROI', icon: <Target className="w-5 h-5" />, roles: ['admin'] },
  { id: 'payment-gateway', label: 'بوابة الدفع الإلكتروني', icon: <CreditCard className="w-5 h-5" />, roles: ['admin', 'employee', 'tenant'] },
  { id: 'data-import', label: 'استيراد البيانات', icon: <FileSpreadsheet className="w-5 h-5" />, roles: ['admin'] },
  { id: 'property-report', label: 'تقرير العقار', icon: <ClipboardList className="w-5 h-5" />, roles: ['admin', 'employee', 'owner'] },
  { id: 'users', label: 'المستخدمون', icon: <UserCheck className="w-5 h-5" />, roles: ['admin'] },
  { id: 'settings', label: 'الإعدادات', icon: <Settings className="w-5 h-5" />, roles: ['admin'] },
];

interface Props {
  activePage: string;
  onNavigate: (page: string) => void;
  children: React.ReactNode;
}

export default function Layout({ activePage, onNavigate, children }: Props) {
  const { currentUser, logout, properties, contracts, units, invoices } = useStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedItems, setExpandedItems] = useState<string[]>(['properties', 'contracts']);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  // Global search
  const searchResults = searchQuery.length >= 2 ? [
    ...properties.filter(p => p.propertyName.includes(searchQuery) || p.titleDeedNumber.includes(searchQuery))
      .slice(0, 3).map(p => ({ type: 'عقار', label: p.propertyName, sub: p.titleDeedNumber, page: 'properties-list' })),
    ...contracts.filter(c => c.contractNumber.includes(searchQuery) || (c.tenantName ?? '').includes(searchQuery))
      .slice(0, 3).map(c => ({ type: 'عقد', label: c.contractNumber, sub: c.tenantName ?? '—', page: 'contracts-list' })),
    ...invoices.filter(i => i.invoiceNumber.includes(searchQuery))
      .slice(0, 2).map(i => ({ type: 'فاتورة', label: i.invoiceNumber, sub: `${i.totalAmount.toLocaleString()} ر`, page: 'accounting' })),
    ...units.filter(u => u.unitNumber.includes(searchQuery) || u.titleDeedNumber.includes(searchQuery))
      .slice(0, 2).map(u => ({ type: 'وحدة', label: `وحدة ${u.unitNumber}`, sub: u.titleDeedNumber, page: 'units' })),
  ] : [];

  const userRole = currentUser?.role as UserRole;
  const visibleNav = navItems.filter(item => item.roles.includes(userRole));

  const toggleExpand = (id: string) => {
    setExpandedItems(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const roleLabel: Record<UserRole, string> = {
    admin: 'المدير العام',
    employee: 'موظف',
    owner: 'مالك عقار',
    tenant: 'مستأجر',
    technician: 'فني صيانة',
    broker: 'وسيط عقاري',
  };

  const roleBadgeColor: Record<UserRole, string> = {
    admin: 'bg-purple-100 text-purple-700',
    employee: 'bg-blue-100 text-blue-700',
    owner: 'bg-green-100 text-green-700',
    tenant: 'bg-orange-100 text-orange-700',
    technician: 'bg-red-100 text-red-700',
    broker: 'bg-yellow-100 text-yellow-700',
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <aside className={`${sidebarOpen ? 'w-64' : 'w-0 overflow-hidden'} bg-white border-l border-gray-200 flex flex-col transition-all duration-300 shrink-0`}>
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="رمز الإبداع" className="w-10 h-10 object-contain shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">رمز الإبداع</p>
              <p className="text-xs text-gray-500">لإدارة الأملاك</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {visibleNav.map(item => {
            const hasChildren = item.children && item.children.filter(c => c.roles.includes(userRole)).length > 0;
            const isExpanded = expandedItems.includes(item.id);
            const isActive = activePage === item.id || item.children?.some(c => c.id === activePage);

            return (
              <div key={item.id}>
                <div
                  className={isActive && !hasChildren ? 'sidebar-link-active' : 'sidebar-link-inactive'}
                  onClick={() => hasChildren ? toggleExpand(item.id) : onNavigate(item.id)}
                >
                  {item.icon}
                  <span className="flex-1 text-sm">{item.label}</span>
                  {hasChildren && (isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />)}
                </div>
                {hasChildren && isExpanded && (
                  <div className="mr-8 mt-1 space-y-1">
                    {item.children!.filter(c => c.roles.includes(userRole)).map(child => (
                      <div
                        key={child.id}
                        className={activePage === child.id ? 'sidebar-link-active text-xs py-2' : 'sidebar-link-inactive text-xs py-2'}
                        onClick={() => onNavigate(child.id)}
                      >
                        <span>{child.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="p-3 border-t border-gray-100">
          <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
            <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0">
              {currentUser?.name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-800 truncate">{currentUser?.name}</p>
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${roleBadgeColor[userRole]}`}>
                {roleLabel[userRole]}
              </span>
            </div>
            <button onClick={logout} className="text-gray-400 hover:text-red-500 transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shrink-0 gap-3">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 shrink-0">
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Global Search */}
          <div className="relative flex-1 max-w-lg">
            <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="w-full border border-gray-200 rounded-xl pr-9 pl-4 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-300 bg-gray-50"
              placeholder="بحث في العقارات، العقود، الفواتير، الوحدات..."
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setShowSearch(true); }}
              onFocus={() => setShowSearch(true)}
              onBlur={() => setTimeout(() => setShowSearch(false), 200)}
            />
            {showSearch && searchResults.length > 0 && (
              <div className="absolute top-full mt-1 w-full bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                {searchResults.map((r, i) => (
                  <button key={i} onMouseDown={() => { onNavigate(r.page); setSearchQuery(''); setShowSearch(false); }}
                    className="w-full flex items-center gap-3 p-3 hover:bg-yellow-50 text-right transition-colors">
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium shrink-0">{r.type}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{r.label}</p>
                      <p className="text-xs text-gray-400 truncate">{r.sub}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
            {showSearch && searchQuery.length >= 2 && searchResults.length === 0 && (
              <div className="absolute top-full mt-1 w-full bg-white rounded-xl shadow-xl border border-gray-100 z-50 p-4 text-center text-sm text-gray-400">
                لا توجد نتائج لـ "{searchQuery}"
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Smart Notification Center */}
            <NotificationCenter onNavigate={onNavigate} />

            <div className="flex items-center gap-2 text-sm text-gray-700">
              <div className="w-7 h-7 bg-yellow-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                {currentUser?.name[0]}
              </div>
              <span className="font-medium hidden sm:block">{currentUser?.name}</span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
