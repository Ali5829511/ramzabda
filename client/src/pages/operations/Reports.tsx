import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { BarChart3, TrendingUp, FileText, CreditCard, Building2, Home, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from "recharts";
import { toast } from "sonner";

const LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663538106461/mVj998sunPYSva3VMbB5zS/ramz-logo_47a89254.png";

function formatCurrency(value: number) {
  return new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR', maximumFractionDigits: 0 }).format(value);
}

export default function Reports() {
  const { data: stats } = trpc.dashboard.stats.useQuery();
  const { data: propertiesData } = trpc.properties.list.useQuery({ page: 1, limit: 100 });
  const { data: contractsData } = trpc.contracts.list.useQuery({ page: 1, limit: 100 });
  const { data: paymentsData } = trpc.payments.list.useQuery({ page: 1, limit: 100 });
  const { data: employees } = trpc.employees.list.useQuery();

  const properties = propertiesData?.data ?? [];
  const contracts = contractsData?.data ?? [];
  const payments = paymentsData?.data ?? [];

  // City distribution
  const cityMap: Record<string, number> = {};
  properties.forEach((p: any) => {
    const city = p.city ?? 'غير محدد';
    cityMap[city] = (cityMap[city] ?? 0) + 1;
  });
  const cityData = Object.entries(cityMap).map(([name, value]) => ({ name, value }));

  // Contract status distribution
  const statusMap: Record<string, number> = {};
  contracts.forEach((c: any) => {
    const status = c.status ?? 'غير محدد';
    statusMap[status] = (statusMap[status] ?? 0) + 1;
  });
  const contractStatusData = Object.entries(statusMap).map(([name, value]) => ({ name, value }));

  // Payment summary
  const totalPaid = payments.reduce((s: number, p: any) => s + Number(p.paidAmount ?? 0), 0);
  const totalRemaining = payments.reduce((s: number, p: any) => s + Number(p.remainingAmount ?? 0), 0);
  const paymentData = [
    { name: 'مدفوع', value: totalPaid, color: '#22c55e' },
    { name: 'متبقي', value: totalRemaining, color: '#ef4444' },
  ];

  // Employee performance
  const empData = (employees ?? []).slice(0, 10).map((e: any) => ({
    name: e.name?.split(' ').slice(0, 2).join(' ') ?? 'موظف',
    contracts: Number(e.totalContracts ?? 0),
    amount: Number(e.totalContractAmounts ?? 0),
  }));

  const COLORS = ['#f59e0b', '#1e293b', '#22c55e', '#3b82f6', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">التقارير والإحصائيات</h1>
          <p className="text-sm text-muted-foreground mt-1">نظرة شاملة على أداء المنصة</p>
        </div>
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => toast.info('ميزة تصدير التقارير قيد التطوير')}
        >
          <Download className="h-4 w-4" />
          تصدير التقرير
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'إجمالي العقارات', value: stats?.totalProperties ?? 0, icon: Building2, color: 'text-amber-600', bg: 'bg-amber-50' },
          { title: 'إجمالي الوحدات', value: stats?.totalUnits ?? 0, icon: Home, color: 'text-blue-600', bg: 'bg-blue-50' },
          { title: 'إجمالي العقود', value: stats?.totalContracts ?? 0, icon: FileText, color: 'text-green-600', bg: 'bg-green-50' },
          { title: 'العقود النشطة', value: stats?.activeContracts ?? 0, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map((card, i) => (
          <Card key={i} className="shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">{card.title}</p>
                  <p className={`text-3xl font-bold ${card.color}`}>{card.value}</p>
                </div>
                <div className={`${card.bg} p-3 rounded-xl`}>
                  <card.icon className={`h-6 w-6 ${card.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="shadow-sm">
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground mb-1">إجمالي قيمة العقود</p>
            <p className="text-2xl font-bold text-amber-600">{formatCurrency(stats?.totalContractValue ?? 0)}</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground mb-1">المبالغ المحصّلة</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(stats?.paidAmount ?? 0)}</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground mb-1">المبالغ المتبقية</p>
            <p className="text-2xl font-bold text-red-600">{formatCurrency(stats?.remainingAmount ?? 0)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* City Distribution */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-slate-800">توزيع العقارات حسب المدينة</CardTitle>
          </CardHeader>
          <CardContent>
            {cityData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={cityData} barSize={36}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fontFamily: 'Cairo' }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v) => [v, 'عقار']} />
                  <Bar dataKey="value" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">لا توجد بيانات</div>
            )}
          </CardContent>
        </Card>

        {/* Contract Status Pie */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-slate-800">توزيع حالات العقود</CardTitle>
          </CardHeader>
          <CardContent>
            {contractStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={contractStatusData} cx="50%" cy="50%" outerRadius={90} paddingAngle={3} dataKey="value">
                    {contractStatusData.map((_: any, index: number) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => [v, 'عقد']} />
                  <Legend formatter={(v) => v} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">لا توجد بيانات</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Distribution */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-slate-800">توزيع الدفعات المالية</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={paymentData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                  {paymentData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: any) => [formatCurrency(Number(v)), '']} />
                <Legend formatter={(v) => v} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Employee Performance */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-slate-800">أداء الموظفين (عدد العقود)</CardTitle>
          </CardHeader>
          <CardContent>
            {empData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={empData} barSize={28} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fontFamily: 'Cairo' }} width={80} />
                  <Tooltip formatter={(v) => [v, 'عقد']} />
                  <Bar dataKey="contracts" fill="#1e293b" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">لا توجد بيانات</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Report Footer */}
      <div className="flex items-center justify-between bg-slate-900 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <img src={LOGO_URL} alt="رمز الإبداع" className="h-10 w-10 object-contain" />
          <div>
            <p className="text-amber-400 font-bold">شركة رمز الإبداع لإدارة الأملاك</p>
            <p className="text-white/60 text-xs">تقرير شامل - {new Date().toLocaleDateString('ar-SA')}</p>
          </div>
        </div>
        <p className="text-white/40 text-xs">جميع الحقوق محفوظة © {new Date().getFullYear()}</p>
      </div>
    </div>
  );
}
