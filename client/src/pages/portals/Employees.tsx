import { trpc } from "@/lib/trpc";
import { Users, TrendingUp, FileText, Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function formatCurrency(value: number) {
  return new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR', maximumFractionDigits: 0 }).format(value);
}

export default function Employees() {
  const { data: employees, isLoading } = trpc.employees.list.useQuery();

  const totalContracts = (employees ?? []).reduce((s: number, e: any) => s + Number(e.totalContracts ?? 0), 0);
  const totalAmount = (employees ?? []).reduce((s: number, e: any) => s + Number(e.totalContractAmounts ?? 0), 0);

  return (
    <div className="space-y-5 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">إدارة الموظفين</h1>
        <p className="text-sm text-muted-foreground mt-1">أداء موظفي مكتب الوساطة العقارية</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-amber-100 p-2.5 rounded-lg"><Users className="h-5 w-5 text-amber-600" /></div>
              <div>
                <p className="text-xs text-muted-foreground">إجمالي الموظفين</p>
                <p className="text-2xl font-bold text-amber-600">{(employees ?? []).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2.5 rounded-lg"><FileText className="h-5 w-5 text-blue-600" /></div>
              <div>
                <p className="text-xs text-muted-foreground">إجمالي العقود</p>
                <p className="text-2xl font-bold text-blue-600">{totalContracts}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2.5 rounded-lg"><TrendingUp className="h-5 w-5 text-green-600" /></div>
              <div>
                <p className="text-xs text-muted-foreground">إجمالي المبالغ</p>
                <p className="text-lg font-bold text-green-600">{formatCurrency(totalAmount)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Employees Table */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-slate-800">تفاصيل أداء الموظفين</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">جاري التحميل...</div>
          ) : (employees ?? []).length === 0 ? (
            <div className="p-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">لا توجد بيانات موظفين</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b">
                    <th className="text-right px-4 py-3 font-semibold text-slate-600">#</th>
                    <th className="text-right px-4 py-3 font-semibold text-slate-600">اسم الموظف</th>
                    <th className="text-right px-4 py-3 font-semibold text-slate-600">البريد الإلكتروني</th>
                    <th className="text-right px-4 py-3 font-semibold text-slate-600">الهاتف</th>
                    <th className="text-right px-4 py-3 font-semibold text-slate-600">عدد العقود</th>
                    <th className="text-right px-4 py-3 font-semibold text-slate-600">إجمالي المبالغ</th>
                    <th className="text-right px-4 py-3 font-semibold text-slate-600">الترتيب</th>
                  </tr>
                </thead>
                <tbody>
                  {(employees ?? []).map((emp: any, index: number) => (
                    <tr key={emp.id} className="border-b hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3 text-muted-foreground">{index + 1}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                            <span className="text-sm font-bold text-amber-600">
                              {emp.name?.charAt(0) ?? 'م'}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{emp.name}</p>
                            <p className="text-xs text-muted-foreground">{emp.role ?? 'موظف'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{emp.email ?? '-'}</td>
                      <td className="px-4 py-3 text-slate-600">{emp.phone ?? '-'}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 font-bold text-blue-600">
                          <FileText className="h-3.5 w-3.5" />
                          {emp.totalContracts ?? 0}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-green-600">
                        {formatCurrency(Number(emp.totalContractAmounts ?? 0))}
                      </td>
                      <td className="px-4 py-3">
                        {index === 0 && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                            <Award className="h-3 w-3" /> الأول
                          </span>
                        )}
                        {index === 1 && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                            الثاني
                          </span>
                        )}
                        {index === 2 && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-600">
                            الثالث
                          </span>
                        )}
                        {index > 2 && <span className="text-muted-foreground text-xs">#{index + 1}</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
