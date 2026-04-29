import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { CreditCard, Search, Filter, TrendingUp, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const PAYMENT_STATUSES = ['مدفوع','متبقي','متأخر','ملغي'];

const STATUS_STYLES: Record<string, string> = {
  'مدفوع': 'bg-green-100 text-green-700',
  'متبقي': 'bg-amber-100 text-amber-700',
  'متأخر': 'bg-red-100 text-red-700',
  'ملغي': 'bg-slate-100 text-slate-600',
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR', maximumFractionDigits: 0 }).format(value);
}

export default function Payments() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = trpc.payments.list.useQuery({
    search, status: statusFilter || undefined, page, limit: 20,
  });

  const totalPages = Math.ceil((data?.total ?? 0) / 20);

  // Summary stats from data
  const payments = data?.data ?? [];
  const totalAmount = payments.reduce((s: number, p: any) => s + Number(p.totalAmount ?? 0), 0);
  const paidAmount = payments.reduce((s: number, p: any) => s + Number(p.paidAmount ?? 0), 0);
  const remainingAmount = payments.reduce((s: number, p: any) => s + Number(p.remainingAmount ?? 0), 0);

  return (
    <div className="space-y-5 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">الدفعات المالية</h1>
          <p className="text-sm text-muted-foreground mt-1">إجمالي {data?.total ?? 0} سجل مالي</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-amber-100 p-2.5 rounded-lg"><TrendingUp className="h-5 w-5 text-amber-600" /></div>
              <div>
                <p className="text-xs text-muted-foreground">إجمالي المبالغ</p>
                <p className="text-lg font-bold text-amber-600">{formatCurrency(totalAmount)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2.5 rounded-lg"><CheckCircle2 className="h-5 w-5 text-green-600" /></div>
              <div>
                <p className="text-xs text-muted-foreground">المبالغ المدفوعة</p>
                <p className="text-lg font-bold text-green-600">{formatCurrency(paidAmount)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-red-100 p-2.5 rounded-lg"><AlertCircle className="h-5 w-5 text-red-600" /></div>
              <div>
                <p className="text-xs text-muted-foreground">المبالغ المتبقية</p>
                <p className="text-lg font-bold text-red-600">{formatCurrency(remainingAmount)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="البحث برقم العقد..." className="pr-9" />
        </div>
        <Select value={statusFilter} onValueChange={v => { setStatusFilter(v === 'all' ? '' : v); setPage(1); }}>
          <SelectTrigger className="w-40">
            <Filter className="h-4 w-4 ml-2" />
            <SelectValue placeholder="الحالة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">الكل</SelectItem>
            {PAYMENT_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card className="shadow-sm">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">جاري التحميل...</div>
          ) : payments.length === 0 ? (
            <div className="p-12 text-center">
              <CreditCard className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">لا توجد دفعات مالية مسجلة</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b">
                    <th className="text-right px-4 py-3 font-semibold text-slate-600">رقم العقد</th>
                    <th className="text-right px-4 py-3 font-semibold text-slate-600">المستأجر</th>
                    <th className="text-right px-4 py-3 font-semibold text-slate-600">العقار</th>
                    <th className="text-right px-4 py-3 font-semibold text-slate-600">رقم الفاتورة</th>
                    <th className="text-right px-4 py-3 font-semibold text-slate-600">إجمالي المبلغ</th>
                    <th className="text-right px-4 py-3 font-semibold text-slate-600">المدفوع</th>
                    <th className="text-right px-4 py-3 font-semibold text-slate-600">المتبقي</th>
                    <th className="text-right px-4 py-3 font-semibold text-slate-600">تاريخ الاستحقاق</th>
                    <th className="text-right px-4 py-3 font-semibold text-slate-600">الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment: any) => (
                    <tr key={payment.id} className="border-b hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-slate-600">{payment.contractNumber ?? '-'}</td>
                      <td className="px-4 py-3 font-medium text-slate-900">{payment.tenantName ?? '-'}</td>
                      <td className="px-4 py-3 text-slate-700">{payment.propertyName ?? '-'}</td>
                      <td className="px-4 py-3 font-mono text-xs">{payment.invoiceNumber ?? '-'}</td>
                      <td className="px-4 py-3 font-semibold text-slate-800">{formatCurrency(Number(payment.totalAmount ?? 0))}</td>
                      <td className="px-4 py-3 font-semibold text-green-600">{formatCurrency(Number(payment.paidAmount ?? 0))}</td>
                      <td className="px-4 py-3 font-semibold text-red-600">{formatCurrency(Number(payment.remainingAmount ?? 0))}</td>
                      <td className="px-4 py-3 text-slate-600 text-xs">
                        {payment.dueDate ? new Date(payment.dueDate).toLocaleDateString('ar-SA') : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[payment.invoiceStatus ?? ''] ?? 'bg-slate-100 text-slate-600'}`}>
                          {payment.invoiceStatus ?? '-'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>السابق</Button>
          <span className="text-sm text-muted-foreground">صفحة {page} من {totalPages}</span>
          <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>التالي</Button>
        </div>
      )}
    </div>
  );
}
