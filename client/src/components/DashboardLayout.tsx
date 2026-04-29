import { useAuth } from "@/_core/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { getLoginUrl } from "@/const";
import { useIsMobile } from "@/hooks/useMobile";
import {
  LayoutDashboard,
  Building2,
  Home,
  FileText,
  CreditCard,
  Wrench,
  Users,
  BarChart3,
  LogOut,
  ChevronLeft,
  Menu,
  Settings,
  UserCheck,
  UserCog,
  Hammer,
  Briefcase,
  Megaphone,
  MessageSquare,
  Link2,
} from "lucide-react";
import { CSSProperties, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { DashboardLayoutSkeleton } from './DashboardLayoutSkeleton';
import { Button } from "./ui/button";

const LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663538106461/mVj998sunPYSva3VMbB5zS/ramz-logo_a0de6d1f.png";

const menuGroups = [
  {
    label: "الرئيسية",
    items: [
      { icon: LayoutDashboard, label: "لوحة التحكم", path: "/" },
      { icon: Building2, label: "العقارات", path: "/properties" },
      { icon: Home, label: "الوحدات", path: "/units" },
      { icon: FileText, label: "العقود", path: "/contracts" },
      { icon: CreditCard, label: "الدفعات المالية", path: "/payments" },
      { icon: Wrench, label: "الصيانة", path: "/maintenance" },
    ],
  },
  {
    label: "البوابات",
    items: [
      { icon: UserCheck, label: "بوابة الملاك", path: "/owners" },
      { icon: Users, label: "بوابة المستأجرين", path: "/tenants" },
      { icon: Hammer, label: "بوابة الفنيين", path: "/technicians" },
      { icon: Briefcase, label: "الوسطاء العقاريون", path: "/brokers" },
      { icon: UserCog, label: "الموظفون", path: "/employees" },
    ],
  },
  {
    label: "التسويق والتواصل",
    items: [
      { icon: Megaphone, label: "التسويق العقاري", path: "/marketing" },
      { icon: MessageSquare, label: "التواصل والإشعارات", path: "/communications" },
      { icon: Link2, label: "تكامل إيجار", path: "/ejar" },
      { icon: BarChart3, label: "التقارير", path: "/reports" },
    ],
  },
];

const SIDEBAR_WIDTH_KEY = "sidebar-width";
const DEFAULT_WIDTH = 260;
const MIN_WIDTH = 220;
const MAX_WIDTH = 340;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_WIDTH_KEY);
    return saved ? parseInt(saved, 10) : DEFAULT_WIDTH;
  });
  const { loading, user } = useAuth();

  useEffect(() => {
    localStorage.setItem(SIDEBAR_WIDTH_KEY, sidebarWidth.toString());
  }, [sidebarWidth]);

  if (loading) {
    return <DashboardLayoutSkeleton />;
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="flex flex-col items-center gap-8 p-10 max-w-md w-full bg-white rounded-2xl shadow-2xl">
          <img src={LOGO_URL} alt="رمز الإبداع" className="h-24 w-24 object-contain" />
          <div className="flex flex-col items-center gap-3 text-center">
            <h1 className="text-2xl font-bold text-slate-900">منصة رمز الإبداع</h1>
            <p className="text-base text-slate-600 font-medium">لإدارة الأملاك العقارية</p>
            <p className="text-sm text-muted-foreground mt-1">
              يرجى تسجيل الدخول للوصول إلى لوحة التحكم
            </p>
          </div>
          <Button
            onClick={() => { window.location.href = getLoginUrl(); }}
            size="lg"
            className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold text-base shadow-lg"
          >
            تسجيل الدخول
          </Button>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider
      style={{ "--sidebar-width": `${sidebarWidth}px` } as CSSProperties}
    >
      <DashboardLayoutContent setSidebarWidth={setSidebarWidth}>
        {children}
      </DashboardLayoutContent>
    </SidebarProvider>
  );
}

type DashboardLayoutContentProps = {
  children: React.ReactNode;
  setSidebarWidth: (width: number) => void;
};

function DashboardLayoutContent({ children, setSidebarWidth }: DashboardLayoutContentProps) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const allMenuItems = menuGroups.flatMap(g => g.items);
  const activeMenuItem = allMenuItems.find(item => item.path === location);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isCollapsed) setIsResizing(false);
  }, [isCollapsed]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const sidebarRect = sidebarRef.current?.getBoundingClientRect();
      if (!sidebarRect) return;
      // RTL: measure from right side
      const newWidth = sidebarRect.right - e.clientX;
      if (newWidth >= MIN_WIDTH && newWidth <= MAX_WIDTH) {
        setSidebarWidth(newWidth);
      }
    };
    const handleMouseUp = () => setIsResizing(false);
    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, setSidebarWidth]);

  return (
    <>
      <div className="relative" ref={sidebarRef}>
        <Sidebar
          collapsible="icon"
          className="border-l-0 border-r-0"
          disableTransition={isResizing}
          style={{ background: "oklch(0.14 0.008 240)" }}
          side="right"
        >
          {/* Sidebar Header - Logo */}
          <SidebarHeader className="border-b border-white/10 py-4">
            <div className="flex items-center gap-3 px-3">
              <img
                src={LOGO_URL}
                alt="رمز الإبداع"
                className="h-10 w-10 rounded-lg object-contain shrink-0 bg-white/10 p-1"
              />
              {!isCollapsed && (
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-bold text-amber-400 leading-tight">رمز الإبداع</span>
                  <span className="text-xs text-white/60 leading-tight">لإدارة الأملاك</span>
                </div>
              )}
              <button
                onClick={toggleSidebar}
                className="mr-auto h-7 w-7 flex items-center justify-center hover:bg-white/10 rounded-md transition-colors text-white/60 hover:text-white"
                aria-label="تبديل القائمة"
              >
                <ChevronLeft className={`h-4 w-4 transition-transform ${isCollapsed ? "rotate-180" : ""}`} />
              </button>
            </div>
          </SidebarHeader>

          {/* Sidebar Navigation */}
          <SidebarContent className="gap-0 py-2 overflow-y-auto">
            {menuGroups.map((group) => (
              <div key={group.label} className="mb-1">
                {!isCollapsed && (
                  <p className="px-4 py-1.5 text-xs font-semibold text-white/30 uppercase tracking-wider">
                    {group.label}
                  </p>
                )}
                <SidebarMenu className="px-2 gap-0.5">
                  {group.items.map(item => {
                    const isActive = location === item.path;
                    return (
                      <SidebarMenuItem key={item.path}>
                        <SidebarMenuButton
                          isActive={isActive}
                          onClick={() => setLocation(item.path)}
                          tooltip={item.label}
                          className={`h-9 rounded-lg transition-all font-medium text-sm gap-3 ${
                            isActive
                              ? "bg-amber-500 text-slate-900 hover:bg-amber-400"
                              : "text-white/70 hover:bg-white/10 hover:text-white"
                          }`}
                        >
                          <item.icon className="h-4 w-4 shrink-0" />
                          <span>{item.label}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </div>
            ))}
          </SidebarContent>

          {/* Sidebar Footer - User */}
          <SidebarFooter className="border-t border-white/10 p-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-white/10 transition-colors w-full focus:outline-none">
                  <Avatar className="h-8 w-8 shrink-0 border border-amber-500/50">
                    <AvatarFallback className="text-xs font-bold bg-amber-500 text-slate-900">
                      {user?.name?.charAt(0)?.toUpperCase() ?? "م"}
                    </AvatarFallback>
                  </Avatar>
                  {!isCollapsed && (
                    <div className="flex-1 min-w-0 text-right">
                      <p className="text-sm font-medium text-white truncate leading-none">
                        {user?.name || "المستخدم"}
                      </p>
                      <p className="text-xs text-white/50 truncate mt-1">
                        {user?.role === "admin" ? "مدير النظام" : "موظف"}
                      </p>
                    </div>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={logout}
                  className="cursor-pointer text-destructive focus:text-destructive gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span>تسجيل الخروج</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>

        {/* Resize Handle */}
        <div
          className={`absolute top-0 left-0 w-1 h-full cursor-col-resize hover:bg-amber-500/30 transition-colors ${isCollapsed ? "hidden" : ""}`}
          onMouseDown={() => { if (!isCollapsed) setIsResizing(true); }}
          style={{ zIndex: 50 }}
        />
      </div>

      <SidebarInset>
        {/* Mobile Header */}
        {isMobile && (
          <div className="flex border-b h-14 items-center justify-between bg-slate-900 px-4 sticky top-0 z-40">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="h-9 w-9 rounded-lg text-white hover:bg-white/10" />
              <span className="text-white font-medium text-sm">
                {activeMenuItem?.label ?? "القائمة"}
              </span>
            </div>
            <img src={LOGO_URL} alt="رمز الإبداع" className="h-8 w-8 object-contain" />
          </div>
        )}

        {/* Desktop Top Bar */}
        {!isMobile && (
          <div className="flex border-b h-14 items-center justify-between bg-white px-6 sticky top-0 z-40 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {activeMenuItem?.label ?? "لوحة التحكم"}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-slate-700">{user?.name}</span>
              <Avatar className="h-8 w-8 border border-amber-500/50">
                <AvatarFallback className="text-xs font-bold bg-amber-500 text-slate-900">
                  {user?.name?.charAt(0)?.toUpperCase() ?? "م"}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        )}

        <main className="flex-1 p-6 bg-slate-50 min-h-screen">{children}</main>
      </SidebarInset>
    </>
  );
}
