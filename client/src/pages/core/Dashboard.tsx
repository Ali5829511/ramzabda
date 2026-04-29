import { trpc } from "@/lib/trpc";
import { Building2, Home, FileText, CreditCard, Wrench, TrendingUp, AlertCircle, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663538106461/mVj998sunPYSva3VMbB5zS/ramz-logo_47a89254.png";

function formatCurrency(value: number) {
  return new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR', maximumFractionDigits: 0 }).format(value);
}

const STATUS_COLORS: Record<string, string> = {
  'متاحة': '#22c55e',
  'مؤجرة': '#f59e0b',
  'محجوزة': '#3b82f6',
  'تحت_الصيانة': '#ef4444',
};

const CONTRACT_COLORS = ['#f59e0b', '#1e293b'];

export default function Dashboard() {
  const { data: stats, isLoading } = trpc.dashboard.stats.useQuery();

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-slate-200 rounded w-64" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <div key={i} className="h-28 bg-slate-200 rounded-xl" />)}
        </div>
      </div>
    );
  }

  const statCards = [
    { title: "إجمالي العقارات", value: stats?.totalProperties ?? 0, icon: Building2, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
    { title: "إجمالي الوحدات", value: stats?.totalUnits ?? 0, icon: Home, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
    { title: "العقود النشطة", value: stats?.activeContracts ?? 0, icon: FileText, color: "text-green-600", bg: "bg-green-50", border: "border-green-200" },
    { title: "إجمالي العقود", value: stats?.totalContracts ?? 0, icon: FileText, color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-200" },
    { title: "طلبات الصيانة", value: stats?.pendingMaintenance ?? 0, icon: Wrench, color: "text-red-600", bg: "bg-red-50", border: "border-red-200" },
    { title: "إجمالي قيمة العقود", value: formatCurrency(stats?.totalContractValue ?? 0), icon: TrendingUp, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", isText: true },
    { title: "المبالغ المدفوعة", value: formatCurrency(stats?.paidAmount ?? 0), icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50", border: "border-green-200", isText: true },
    { title: "المبالغ المتبقية", value: formatCurrency(stats?.remainingAmount ?? 0), icon: AlertCircle, color: "text-red-600", bg: "bg-red-50", border: "border-red-200", isText: true },
  ];

  const unitStatusData = (stats?.unitsByStatus ?? []).map((item: any) => ({
    name: item.status ?? 'غير محدد',
    value: Number(item.count),
    color: STATUS_COLORS[item.status ?? ''] ?? '#94a3b8',
  }));

  const contractTypeData = (stats?.contractsByType ?? []).map((item: any, i: number) => ({
    name: item.type ?? 'غير محدد',
    value: Number(item.count),
    color: CONTRACT_COLORS[i] ?? '#94a3b8',
  }));

  const paymentData = [
    { name: 'المدفوع', value: stats?.paidAmount ?? 0 },
    { name: 'المتبقي', value: stats?.remainingAmount ?? 0 },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">لوحة التحكم</h1>
          <p className="text-sm text-muted-foreground mt-1">نظرة عامة على منصة رمز الإبداع لإدارة الأملاك</p>
        </div>
        <div className="flex items-center gap-3 bg-slate-900 rounded-xl px-4 py-2">
          <img src={LOGO_URL} alt="رمز الإبداع" className="h-8 w-8 object-contain" />
          <div className="text-right">
            <p className="text-amber-400 font-bold text-sm leading-tight">رمز الإبداع</p>
            <p className="text-white/60 text-xs">لإدارة الأملاك</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <Card key={i} className={`border ${card.border} shadow-sm hover:shadow-md transition-shadow`}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">{card.title}</p>
                  <p className={`text-2xl font-bold ${card.color} ${card.isText ? 'text-lg' : ''}`}>
                    {card.value}
                  </p>
                </div>
                <div className={`${card.bg} p-2.5 rounded-lg`}>
                  <card.icon className={`h-5 w-5 ${card.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Units Status Pie */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-slate-800">حالة الوحدات</CardTitle>
          </CardHeader>
          <CardContent>
            {unitStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={unitStatusData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                    {unitStatusData.map((entry: any, index: number) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [value, 'وحدة']} />
                  <Legend formatter={(value) => value} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">لا توجد بيانات</div>
            )}
          </CardContent>
        </Card>

        {/* Contract Types */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-slate-800">أنواع العقود</CardTitle>
          </CardHeader>
          <CardContent>
            {contractTypeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={contractTypeData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                    {contractTypeData.map((entry: any, index: number) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [value, 'عقد']} />
                  <Legend formatter={(value) => value} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">لا توجد بيانات</div>
            )}
          </CardContent>
        </Card>

        {/* Payment Status */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-slate-800">حالة الدفعات</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={paymentData} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fontFamily: 'Cairo' }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(value: any) => [formatCurrency(Number(value)), '']} />
                <Bar dataKey="value" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Contracts */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-slate-800">آخر العقود المسجلة</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {(stats?.recentContracts ?? []).length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b">
                    <th className="text-right px-4 py-3 font-semibold text-slate-600">رقم العقد</th>
                    <th className="text-right px-4 py-3 font-semibold text-slate-600">المستأجر</th>
                    <th className="text-right px-4 py-3 font-semibold text-slate-600">العقار</th>
                    <th className="text-right px-4 py-3 font-semibold text-slate-600">القيمة</th>
                    <th className="text-right px-4 py-3 font-semibold text-slate-600">الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  {(stats?.recentContracts ?? []).map((contract: any) => (
                    <tr key={contract.id} className="border-b hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-slate-600">{contract.contractNumber}</td>
                      <td className="px-4 py-3 font-medium">{contract.tenantName ?? '-'}</td>
                      <td className="px-4 py-3 text-slate-600">{contract.propertyName ?? '-'}</td>
                      <td className="px-4 py-3 font-semibold text-amber-600">{formatCurrency(Number(contract.totalContractValue ?? 0))}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          contract.status === 'نشط' ? 'bg-green-100 text-green-700' :
                          contract.status === 'منتهي' ? 'bg-slate-100 text-slate-600' :
                          contract.status === 'ملغي' ? 'bg-red-100 text-red-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {contract.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center text-muted-foreground text-sm">
              لا توجد عقود مسجلة بعد
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
