import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { FileText, Plus, Edit, Printer, CheckCircle2, Clock, AlertCircle, Send } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const TYPES = ['إيجار','صيانة','خدمات','رسوم_إدارية','أخرى'];
const STATUSES = ['مسودة','مرسلة','مدفوعة','متأخرة','ملغاة'];

const STATUS_STYLES: Record<string, string> = {
  'مسودة': 'bg-slate-100 text-slate-600',
  'مرسلة': 'bg-blue-100 text-blue-700',
  'مدفوعة': 'bg-green-100 text-green-700',
  'متأخرة': 'bg-red-100 text-red-700',
  'ملغاة': 'bg-gray-100 text-gray-500',
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  'مسودة': <FileText className="h-4 w-4" />,
  'مرسلة': <Send className="h-4 w-4" />,
  'مدفوعة': <CheckCircle2 className="h-4 w-4" />,
  'متأخرة': <AlertCircle className="h-4 w-4" />,
  'ملغاة': <FileText className="h-4 w-4" />,
};

function InvoiceForm({ initial, onSave, onCancel, loading }: any) {
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState(initial ?? {
    invoiceNumber: `INV-${Date.now()}`, type: 'إيجار', tenantName: '', tenantPhone: '',
    propertyName: '', unitNumber: '', total: '', subtotal: '', tax: '0', discount: '0',
    issueDate: today, dueDate: '', notes: '', status: 'مسودة',
  });
  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  return (
    <div className="grid grid-cols-2 gap-4 py-2 max-h-[75vh] overflow-y-auto">
      <div>
        <Label>رقم الفاتورة *</Label>
        <Input value={form.invoiceNumber} onChange={e => set('invoiceNumber', e.target.value)} className="mt-1" />
      </div>
      <div>
        <Label>النوع</Label>
        <Select value={form.type} onValueChange={v => set('type', v)}>
          <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
          <SelectContent>{TYPES.map(t => <SelectItem key={t} value={t}>{t.replace(/_/g, ' ')}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div>
        <Label>اسم المستأجر</Label>
        <Input value={form.tenantName} onChange={e => set('tenantName', e.target.value)} placeholder="الاسم الكامل" className="mt-1" />
      </div>
      <div>
        <Label>هاتف المستأجر</Label>
        <Input value={form.tenantPhone} onChange={e => set('tenantPhone', e.target.value)} placeholder="05xxxxxxxx" className="mt-1" />
      </div>
      <div>
        <Label>اسم العقار</Label>
        <Input value={form.propertyName} onChange={e => set('propertyName', e.target.value)} placeholder="اسم العقار" className="mt-1" />
      </div>
      <div>
        <Label>رقم الوحدة</Label>
        <Input value={form.unitNumber} onChange={e => set('unitNumber', e.target.value)} placeholder="رقم الوحدة" className="mt-1" />
      </div>
      <div>
        <Label>المبلغ الإجمالي (ريال) *</Label>
        <Input type="number" value={form.total} onChange={e => set('total', e.target.value)} className="mt-1" min={0} />
      </div>
      <div>
        <Label>ضريبة القيمة المضافة (ريال)</Label>
        <Input type="number" value={form.tax} onChange={e => set('tax', e.target.value)} className="mt-1" min={0} />
      </div>
      <div>
        <Label>تاريخ الإصدار *</Label>
        <Input type="date" value={form.issueDate} onChange={e => set('issueDate', e.target.value)} className="mt-1" />
      </div>
      <div>
        <Label>تاريخ الاستحقاق</Label>
        <Input type="date" value={form.dueDate} onChange={e => set('dueDate', e.target.value)} className="mt-1" />
      </div>
      <div>
        <Label>الحالة</Label>
        <Select value={form.status} onValueChange={v => set('status', v)}>
          <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
          <SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div className="col-span-2">
        <Label>ملاحظات</Label>
        <Textarea value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="ملاحظات" className="mt-1" rows={2} />
      </div>
      <div className="col-span-2 flex gap-3 justify-end pt-2">
        <Button variant="outline" onClick={onCancel}>إلغاء</Button>
        <Button onClick={() => onSave(form)} disabled={loading} className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold">
          {loading ? 'جاري الحفظ...' : 'حفظ'}
        </Button>
      </div>
    </div>
  );
}

function PrintInvoice({ invoice }: { invoice: any }) {
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8" />
        <title>فاتورة ${invoice.invoiceNumber}</title>
        <style>
          body { font-family: 'Arial', sans-serif; direction: rtl; padding: 40px; color: #1e293b; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #d97706; padding-bottom: 20px; }
          .logo-title { font-size: 24px; font-weight: bold; color: #d97706; }
          .subtitle { font-size: 14px; color: #64748b; }
          .invoice-title { font-size: 20px; font-weight: bold; margin: 20px 0 10px; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px; }
          .info-item { background: #f8fafc; padding: 10px; border-radius: 8px; }
          .info-label { font-size: 12px; color: #64748b; }
          .info-value { font-size: 14px; font-weight: bold; }
          .total-section { background: #1e293b; color: white; padding: 15px 20px; border-radius: 8px; text-align: center; margin-top: 20px; }
          .total-amount { font-size: 28px; font-weight: bold; color: #fbbf24; }
          .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #94a3b8; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo-title">رمز الإبداع لإدارة الأملاك</div>
          <div class="subtitle">فاتورة ضريبية</div>
        </div>
        <div class="invoice-title">فاتورة رقم: ${invoice.invoiceNumber}</div>
        <div class="info-grid">
          <div class="info-item"><div class="info-label">اسم المستأجر</div><div class="info-value">${invoice.tenantName || '-'}</div></div>
          <div class="info-item"><div class="info-label">هاتف المستأجر</div><div class="info-value">${invoice.tenantPhone || '-'}</div></div>
          <div class="info-item"><div class="info-label">اسم العقار</div><div class="info-value">${invoice.propertyName || '-'}</div></div>
          <div class="info-item"><div class="info-label">رقم الوحدة</div><div class="info-value">${invoice.unitNumber || '-'}</div></div>
          <div class="info-item"><div class="info-label">تاريخ الإصدار</div><div class="info-value">${invoice.issueDate ? new Date(invoice.issueDate).toLocaleDateString('ar-SA') : '-'}</div></div>
          <div class="info-item"><div class="info-label">تاريخ الاستحقاق</div><div class="info-value">${invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('ar-SA') : '-'}</div></div>
          <div class="info-item"><div class="info-label">نوع الفاتورة</div><div class="info-value">${invoice.type || '-'}</div></div>
          <div class="info-item"><div class="info-label">الحالة</div><div class="info-value">${invoice.status || '-'}</div></div>
        </div>
        ${invoice.notes ? `<div class="info-item" style="margin-bottom:10px"><div class="info-label">ملاحظات</div><div class="info-value">${invoice.notes}</div></div>` : ''}
        <div class="total-section">
          <div>إجمالي الفاتورة</div>
          <div class="total-amount">${parseFloat(String(invoice.total || 0)).toLocaleString('ar-SA')} ريال</div>
          ${parseFloat(String(invoice.tax || 0)) > 0 ? `<div style="font-size:13px;margin-top:5px">شامل ضريبة القيمة المضافة: ${parseFloat(String(invoice.tax)).toLocaleString('ar-SA')} ريال</div>` : ''}
        </div>
        <div class="footer">رمز الإبداع لإدارة الأملاك - هذه الفاتورة صادرة إلكترونياً</div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };
  return (
    <Button size="sm" variant="ghost" onClick={handlePrint} className="h-8 w-8 p-0 text-slate-600">
      <Printer className="h-4 w-4" />
    </Button>
  );
}

export default function Invoices() {
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const utils = trpc.useUtils();

  const { data, isLoading } = trpc.invoices.list.useQuery({ status: statusFilter || undefined, page, limit: 20 });

  const createMutation = trpc.invoices.create.useMutation({
    onSuccess: () => { utils.invoices.list.invalidate(); setShowAdd(false); toast.success('تم إنشاء الفاتورة'); },
    onError: (e) => toast.error(e.message),
  });
  const updateMutation = trpc.invoices.update.useMutation({
    onSuccess: () => { utils.invoices.list.invalidate(); setEditItem(null); toast.success('تم تحديث الفاتورة'); },
    onError: (e) => toast.error(e.message),
  });

  const invoices = data?.data ?? [];
  const totalPages = Math.ceil((data?.total ?? 0) / 20);
  const totalAmount = invoices.reduce((sum, inv) => sum + parseFloat(String(inv.total) || '0'), 0);
  const paidAmount = invoices.filter(i => i.status === 'مدفوعة').reduce((sum, inv) => sum + parseFloat(String(inv.total) || '0'), 0);
  const pendingAmount = invoices.filter(i => i.status === 'مرسلة' || i.status === 'متأخرة').reduce((sum, inv) => sum + parseFloat(String(inv.total) || '0'), 0);

  return (
    <div className="space-y-5 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="h-6 w-6 text-amber-500" /> الفواتير
          </h1>
          <p className="text-sm text-muted-foreground mt-1">إجمالي {data?.total ?? 0} فاتورة</p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold gap-2">
          <Plus className="h-4 w-4" /> فاتورة جديدة
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-slate-50 border-0">
          <CardContent className="p-4 text-center">
            <div className="text-xl font-bold text-slate-700">{totalAmount.toLocaleString('ar-SA')} ريال</div>
            <div className="text-xs text-muted-foreground mt-1">إجمالي الفواتير</div>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-0">
          <CardContent className="p-4 text-center">
            <div className="text-xl font-bold text-green-700">{paidAmount.toLocaleString('ar-SA')} ريال</div>
            <div className="text-xs text-muted-foreground mt-1">تم سداده</div>
          </CardContent>
        </Card>
        <Card className="bg-amber-50 border-0">
          <CardContent className="p-4 text-center">
            <div className="text-xl font-bold text-amber-700">{pendingAmount.toLocaleString('ar-SA')} ريال</div>
            <div className="text-xs text-muted-foreground mt-1">قيد التحصيل</div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <Select value={statusFilter} onValueChange={v => { setStatusFilter(v === 'all' ? '' : v); setPage(1); }}>
        <SelectTrigger className="w-48"><SelectValue placeholder="تصفية بالحالة" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">جميع الفواتير</SelectItem>
          {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
        </SelectContent>
      </Select>

      {/* Invoices List */}
      {isLoading ? (
        <div className="text-center py-10 text-muted-foreground">جاري التحميل...</div>
      ) : invoices.length === 0 ? (
        <Card><CardContent className="py-16 text-center text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>لا توجد فواتير</p>
        </CardContent></Card>
      ) : (
        <div className="space-y-2">
          {invoices.map(invoice => (
            <Card key={invoice.id} className="border hover:shadow-md transition-all">
              <CardContent className="p-4 flex items-center gap-4">
                <div className={`flex-shrink-0 p-2 rounded-lg ${STATUS_STYLES[invoice.status ?? 'مسودة']}`}>
                  {STATUS_ICONS[invoice.status ?? 'مسودة']}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-semibold text-slate-900">{invoice.invoiceNumber}</span>
                    <Badge className={`text-xs ${STATUS_STYLES[invoice.status ?? 'مسودة']}`}>{invoice.status}</Badge>
                    {invoice.type && <Badge variant="outline" className="text-xs">{invoice.type.replace(/_/g, ' ')}</Badge>}
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground flex-wrap">
                    {invoice.tenantName && <span>{invoice.tenantName}</span>}
                    {invoice.propertyName && <span>{invoice.propertyName}</span>}
                    {invoice.unitNumber && <span>وحدة: {invoice.unitNumber}</span>}
                    {invoice.issueDate && <span>{new Date(invoice.issueDate).toLocaleDateString('ar-SA')}</span>}
                  </div>
                </div>
                <div className="flex-shrink-0 text-left">
                  <div className="text-lg font-bold text-slate-900">
                    {parseFloat(String(invoice.total)).toLocaleString('ar-SA')} ريال
                  </div>
                  {invoice.dueDate && (
                    <div className="text-xs text-muted-foreground">
                      الاستحقاق: {new Date(invoice.dueDate).toLocaleDateString('ar-SA')}
                    </div>
                  )}
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <PrintInvoice invoice={invoice} />
                  <Button size="sm" variant="ghost" onClick={() => setEditItem(invoice)} className="h-8 w-8 p-0">
                    <Edit className="h-4 w-4" />
                  </Button>
                  {invoice.status !== 'مدفوعة' && (
                    <Button size="sm" variant="ghost" onClick={() => updateMutation.mutate({ id: invoice.id, status: 'مدفوعة' })} className="h-8 px-2 text-green-600 text-xs">
                      سدد
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex gap-2 justify-center">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>السابق</Button>
          <span className="px-3 py-2 text-sm">{page} / {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>التالي</Button>
        </div>
      )}

      {/* Add Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-2xl" dir="rtl">
          <DialogHeader><DialogTitle>إنشاء فاتورة جديدة</DialogTitle></DialogHeader>
          <InvoiceForm
            onSave={(form: any) => {
              if (!form.invoiceNumber || !form.total || !form.issueDate) { toast.error('يرجى تعبئة الحقول المطلوبة'); return; }
              createMutation.mutate(form);
            }}
            onCancel={() => setShowAdd(false)}
            loading={createMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editItem} onOpenChange={v => !v && setEditItem(null)}>
        <DialogContent className="max-w-2xl" dir="rtl">
          <DialogHeader><DialogTitle>تعديل الفاتورة</DialogTitle></DialogHeader>
          {editItem && (
            <InvoiceForm
              initial={{ ...editItem, issueDate: editItem.issueDate ? new Date(editItem.issueDate).toISOString().slice(0, 10) : '', dueDate: editItem.dueDate ? new Date(editItem.dueDate).toISOString().slice(0, 10) : '' }}
              onSave={(form: any) => updateMutation.mutate({ id: editItem.id, status: form.status, notes: form.notes })}
              onCancel={() => setEditItem(null)}
              loading={updateMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
