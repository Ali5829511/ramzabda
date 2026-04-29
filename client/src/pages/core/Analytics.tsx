import { trpc } from "@/lib/trpc";
import { BarChart3, TrendingUp, TrendingDown, Building2, Home, FileText, CreditCard, Wrench, DollarSign, Users, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend, AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis } from "recharts";

const COLORS = ['#f59e0b', '#1e293b', '#22c55e', '#3b82f6', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16'];

function formatCurrency(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}م`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}ك`;
  return value.toLocaleString('ar-SA');
}

function KpiCard({ title, value, subtitle, icon: Icon, trend, bg, iconColor }: any) {
  return (
    <Card className={`${bg || 'bg-white'} border-0`}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1 text-slate-900">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
          </div>
          <div className={`p-3 rounded-xl ${iconColor || 'bg-amber-100'}`}>
            <Icon className={`h-5 w-5 ${iconColor ? 'text-white' : 'text-amber-600'}`} />
          </div>
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 mt-3 text-xs font-medium ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            <span>{Math.abs(trend)}% مقارنة بالفترة السابقة</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function Analytics() {
  const { data: stats } = trpc.dashboard.stats.useQuery();
  const { data: propertiesData } = trpc.properties.list.useQuery({ page: 1, limit: 200 });
  const { data: contractsData } = trpc.contracts.list.useQuery({ page: 1, limit: 200 });
  const { data: paymentsData } = trpc.payments.list.useQuery({ page: 1, limit: 200 });
  const { data: maintenanceData } = trpc.maintenance.list.useQuery({ page: 1, limit: 200 });
  const { data: tenantsData } = trpc.tenants.list.useQuery({ page: 1, limit: 100 });
  const { data: employees } = trpc.employees.list.useQuery();

  const properties = propertiesData?.data ?? [];
  const contracts = contractsData?.data ?? [];
  const payments = paymentsData?.data ?? [];
  const maintenance = maintenanceData?.data ?? [];

  // --- CITY DISTRIBUTION ---
  const cityMap: Record<string, number> = {};
  properties.forEach((p: any) => {
    const city = p.city ?? 'غير محدد';
    cityMap[city] = (cityMap[city] ?? 0) + 1;
  });
  const cityData = Object.entries(cityMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, value]) => ({ name, value }));

  // --- PROPERTY TYPE ---
  const typeMap: Record<string, number> = {};
  properties.forEach((p: any) => {
    const t = p.propertyType ?? 'أخرى';
    typeMap[t] = (typeMap[t] ?? 0) + 1;
  });
  const propertyTypeData = Object.entries(typeMap).map(([name, value]) => ({ name, value }));

  // --- CONTRACT STATUS ---
  const contractStatusMap: Record<string, number> = {};
  contracts.forEach((c: any) => {
    const s = c.status ?? 'غير محدد';
    contractStatusMap[s] = (contractStatusMap[s] ?? 0) + 1;
  });
  const contractStatusData = Object.entries(contractStatusMap).map(([name, value]) => ({ name, value }));

  // --- PAYMENT ANALYSIS ---
  const totalPaid = payments.reduce((s, p: any) => s + Number(p.paidAmount ?? 0), 0);
  const totalRemaining = payments.reduce((s, p: any) => s + Number(p.remainingAmount ?? 0), 0);
  const totalAmount = payments.reduce((s, p: any) => s + Number(p.totalAmount ?? 0), 0);
  const collectionRate = totalAmount > 0 ? Math.round((totalPaid / totalAmount) * 100) : 0;

  const paymentPieData = [
    { name: 'مدفوع', value: Math.round(totalPaid), color: '#22c55e' },
    { name: 'متبقي', value: Math.round(totalRemaining), color: '#ef4444' },
  ];

  // --- MAINTENANCE STATS ---
  const maintenanceCatMap: Record<string, number> = {};
  maintenance.forEach((m: any) => {
    const cat = m.category ?? 'أخرى';
    maintenanceCatMap[cat] = (maintenanceCatMap[cat] ?? 0) + 1;
  });
  const maintenanceCatData = Object.entries(maintenanceCatMap).map(([name, value]) => ({ name, value }));

  const maintenanceStatusMap: Record<string, number> = {};
  maintenance.forEach((m: any) => {
    const s = m.status ?? 'غير محدد';
    maintenanceStatusMap[s] = (maintenanceStatusMap[s] ?? 0) + 1;
  });
  const maintenanceStatusData = Object.entries(maintenanceStatusMap).map(([name, value]) => ({ name, value }));

  // --- OCCUPANCY ---
  const occupancyRate = stats?.totalUnits && stats.totalUnits > 0
    ? Math.round(((stats.rentedUnits ?? 0) / stats.totalUnits) * 100)
    : 0;

  // --- EMPLOYEE PERFORMANCE ---
  const empData = (employees ?? [])
    .filter((e: any) => (e.totalCommercialContracts ?? 0) + (e.totalResidentialContracts ?? 0) > 0)
    .slice(0, 8)
    .map((e: any) => ({
      name: e.name?.split(' ').slice(0, 2).join(' ') ?? 'موظف',
      تجاري: Number(e.totalCommercialContracts ?? 0),
      سكني: Number(e.totalResidentialContracts ?? 0),
      إجمالي: Number(e.totalContractAmounts ?? 0),
    }));

  // --- OVERVIEW RADAR ---
  const radarData = [
    { subject: 'الإشغال', A: occupancyRate },
    { subject: 'التحصيل', A: collectionRate },
    { subject: 'العقود النشطة', A: Math.min(100, Math.round(((contractStatusMap['نشط'] ?? 0) / Math.max(1, contracts.length)) * 100)) },
    { subject: 'الصيانة المكتملة', A: Math.min(100, Math.round(((maintenanceStatusMap['مكتمل'] ?? 0) / Math.max(1, maintenance.length)) * 100)) },
    { subject: 'الوحدات المتاحة', A: Math.min(100, Math.round(((stats?.availableUnits ?? 0) / Math.max(1, stats?.totalUnits ?? 1)) * 100)) },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-amber-500" />
          لوحة التحليلات المتقدمة
        </h1>
        <p className="text-sm text-muted-foreground mt-1">تحليل شامل لأداء المحفظة العقارية</p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="إجمالي العقارات" value={stats?.totalProperties ?? 0} icon={Building2} bg="bg-amber-50" />
        <KpiCard title="إجمالي الوحدات" value={(stats?.totalUnits ?? 0).toLocaleString('ar-SA')} subtitle={`${stats?.availableUnits ?? 0} متاحة`} icon={Home} bg="bg-blue-50" />
        <KpiCard
          title="إجمالي الإيرادات"
          value={`${formatCurrency(Number(stats?.totalRevenue ?? 0))} ر`}
          subtitle={`نسبة التحصيل ${collectionRate}%`}
          icon={DollarSign}
          bg="bg-green-50"
        />
        <KpiCard
          title="نسبة الإشغال"
          value={`${occupancyRate}%`}
          subtitle={`${stats?.rentedUnits ?? 0} وحدة مؤجرة`}
          icon={Target}
          bg="bg-purple-50"
        />
      </div>

      {/* Row 2: Occupancy + Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Radar Overview */}
        <Card>
          <CardHeader><CardTitle className="text-base">نظرة عامة على الأداء</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
                <Radar name="الأداء" dataKey="A" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Payment Pie */}
        <Card>
          <CardHeader><CardTitle className="text-base">تحليل المدفوعات</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={paymentPieData} dataKey="value" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {paymentPieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(v: any) => `${Number(v).toLocaleString('ar-SA')} ريال`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-around mt-2 text-sm">
              <div className="text-center">
                <div className="font-bold text-green-600">{totalPaid.toLocaleString('ar-SA')}</div>
                <div className="text-xs text-muted-foreground">مدفوع (ريال)</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-red-600">{totalRemaining.toLocaleString('ar-SA')}</div>
                <div className="text-xs text-muted-foreground">متبقي (ريال)</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contract Status */}
        <Card>
          <CardHeader><CardTitle className="text-base">توزيع حالات العقود</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={contractStatusData} dataKey="value" cx="50%" cy="50%" outerRadius={70} label={({ name, value }) => `${name}: ${value}`}>
                  {contractStatusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Row 3: City Bar + Property Types */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">توزيع العقارات حسب المدينة</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={cityData} layout="vertical" margin={{ right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#f59e0b" radius={[0, 4, 4, 0]} name="عدد العقارات" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">أنواع العقارات</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={propertyTypeData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" name="عدد العقارات" radius={[4, 4, 0, 0]}>
                  {propertyTypeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Row 4: Employee Performance */}
      {empData.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">أداء الموظفين - عدد العقود</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={empData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="تجاري" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="سكني" fill="#1e293b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Row 5: Maintenance */}
      {maintenance.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle className="text-base">طلبات الصيانة حسب الفئة</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={maintenanceCatData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="value" name="عدد الطلبات" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">حالات طلبات الصيانة</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={maintenanceStatusData} dataKey="value" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name}: ${value}`}>
                    {maintenanceStatusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-50 border-0">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-slate-800">{contracts.length}</div>
            <div className="text-sm text-muted-foreground">إجمالي العقود</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-50 border-0">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-slate-800">{payments.length}</div>
            <div className="text-sm text-muted-foreground">إجمالي الدفعات</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-50 border-0">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-slate-800">{maintenance.length}</div>
            <div className="text-sm text-muted-foreground">طلبات الصيانة</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-50 border-0">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-slate-800">{tenantsData?.total ?? 0}</div>
            <div className="text-sm text-muted-foreground">إجمالي المستأجرين</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
