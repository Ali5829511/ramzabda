import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { FileText, MapPin, User, Calendar, DollarSign, ChevronRight, Printer, Check, RefreshCw, LogOut, ListOrdered, BarChart3, Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

function InfoRow({ label, value }: { label: string; value?: string | number | null }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex justify-between py-2 border-b border-slate-100 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-slate-900 text-left max-w-[60%]">{String(value)}</span>
    </div>
  );
}

export default function ContractDetails() {
  const [location, navigate] = useLocation();
  const id = parseInt(location.split('/').pop() ?? '0');
  const [showRenewDialog, setShowRenewDialog] = useState(false);
  const [showEvacDialog, setShowEvacDialog] = useState(false);
  const [renewForm, setRenewForm] = useState({ startDate: '', endDate: '', totalContractValue: '' });
  const [evacNotes, setEvacNotes] = useState('');
  const [newInstallment, setNewInstallment] = useState({ invoiceDueDate: '', totalAmount: '', paymentStatus: 'معلق' });

  const { data: contract, isLoading, refetch } = trpc.contracts.byId.useQuery({ id }, { enabled: id > 0 });
  const { data: paymentsData, refetch: refetchPayments } = trpc.payments.byContract.useQuery({ contractNumber: contract?.contractNumber ?? '' }, { enabled: !!(contract?.contractNumber) });

  const payments = paymentsData ?? [];

  const updateMutation = trpc.contracts.update.useMutation({
    onSuccess: () => { refetch(); toast.success("تم تحديث العقد بنجاح"); },
    onError: () => toast.error("فشل تحديث العقد"),
  });

  const addPaymentMutation = trpc.payments.create.useMutation({
    onSuccess: () => { refetchPayments(); setNewInstallment({ invoiceDueDate: '', totalAmount: '', paymentStatus: 'معلق' }); toast.success("تم إضافة القسط"); },
    onError: () => toast.error("فشل إضافة القسط"),
  });

  const handleRenew = () => {
    if (!renewForm.startDate || !renewForm.endDate) return toast.error("يرجى تحديد تواريخ التجديد");
    updateMutation.mutate({
      id,
      status: 'نشط',
      startDate: renewForm.startDate,
      endDate: renewForm.endDate,
      totalContractValue: renewForm.totalContractValue || contract?.totalContractValue,
    });
    setShowRenewDialog(false);
  };

  const handleEvacuate = () => {
    updateMutation.mutate({ id, status: 'منتهي', notes: evacNotes || 'تم الإخلاء' });
    setShowEvacDialog(false);
  };

  const handleAddInstallment = () => {
    if (!newInstallment.invoiceDueDate || !newInstallment.totalAmount) return toast.error("يرجى تعبئة جميع الحقول");
    addPaymentMutation.mutate({
      contractNumber: contract?.contractNumber ?? '',
      invoiceDueDate: newInstallment.invoiceDueDate,
      totalAmount: newInstallment.totalAmount,
      paymentStatus: newInstallment.paymentStatus,
    });
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8" />
        <title>عقد ${contract?.contractNumber}</title>
        <style>
          body { font-family: 'Arial', sans-serif; direction: rtl; padding: 40px; color: #1e293b; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #d97706; padding-bottom: 20px; }
          .title { font-size: 24px; font-weight: bold; color: #d97706; }
          .contract-section { margin: 20px 0; background: #f8fafc; padding: 15px; border-radius: 8px; }
          .section-title { font-size: 14px; font-weight: bold; color: #1e293b; margin-bottom: 10px; border-bottom: 1px solid #d97706; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
          .info-item { line-height: 1.8; }
          .label { font-size: 12px; color: #64748b; }
          .value { font-size: 13px; font-weight: bold; }
          .total-section { background: #1e293b; color: white; padding: 20px; border-radius: 8px; text-align: center; margin-top: 20px; }
          .total-amount { font-size: 28px; font-weight: bold; color: #fbbf24; }
          .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #94a3b8; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">عقد إيجار / توثيق</div>
          <div style="font-size: 12px; color: #64748b;">رقم العقد: ${contract?.contractNumber}</div>
        </div>
        
        <div class="contract-section">
          <div class="section-title">معلومات العقد</div>
          <div class="info-grid">
            <div class="info-item">
              <div class="label">الحالة</div>
              <div class="value">${contract?.status}</div>
            </div>
            <div class="info-item">
              <div class="label">النوع</div>
              <div class="value">${contract?.contractType}</div>
            </div>
            <div class="info-item">
              <div class="label">تاريخ البدء</div>
              <div class="value">${contract?.startDate ? new Date(contract.startDate).toLocaleDateString('ar-SA') : '-'}</div>
            </div>
            <div class="info-item">
              <div class="label">تاريخ النهاية</div>
              <div class="value">${contract?.endDate ? new Date(contract.endDate).toLocaleDateString('ar-SA') : '-'}</div>
            </div>
          </div>
        </div>

        <div class="contract-section">
          <div class="section-title">بيانات الملالك والمستأجر</div>
          <div class="info-grid">
            <div class="info-item">
              <div class="label">المالك</div>
              <div class="value">${contract?.landlordName}</div>
            </div>
            <div class="info-item">
              <div class="label">المستأجر</div>
              <div class="value">${contract?.tenantName}</div>
            </div>
            <div class="info-item">
              <div class="label">رقم هوية المالك</div>
              <div class="value">${contract?.landlordIdentity || '-'}</div>
            </div>
            <div class="info-item">
              <div class="label">رقم هوية المستأجر</div>
              <div class="value">${contract?.tenantIdentity || '-'}</div>
            </div>
          </div>
        </div>

        <div class="contract-section">
          <div class="section-title">العقار والوحدة</div>
          <div class="info-grid">
            <div class="info-item">
              <div class="label">العقار</div>
              <div class="value">${contract?.propertyName}</div>
            </div>
            <div class="info-item">
              <div class="label">رقم الوحدة</div>
              <div class="value">${contract?.unitNumber || '-'}</div>
            </div>
            <div class="info-item">
              <div class="label">المدينة</div>
              <div class="value">${contract?.city}</div>
            </div>
            <div class="info-item">
              <div class="label">المنطقة</div>
              <div class="value">${contract?.region || '-'}</div>
            </div>
          </div>
        </div>

        <div class="contract-section">
          <div class="section-title">المبالغ المالية</div>
          <div class="info-grid">
            <div class="info-item">
              <div class="label">إجمالي قيمة العقد</div>
              <div class="value">${parseFloat(String(contract?.totalContractValue || 0)).toLocaleString('ar-SA')} ريال</div>
            </div>
            <div class="info-item">
              <div class="label">رسوم التوثيق</div>
              <div class="value">${parseFloat(String(contract?.totalDocumentationFees || 0)).toLocaleString('ar-SA')} ريال</div>
            </div>
            <div class="info-item">
              <div class="label">مبلغ التأمين</div>
              <div class="value">${parseFloat(String(contract?.totalDepositAmount || 0)).toLocaleString('ar-SA')} ريال</div>
            </div>
            <div class="info-item">
              <div class="label">رسوم الوساطة</div>
              <div class="value">${parseFloat(String(contract?.brokerageFees || 0)).toLocaleString('ar-SA')} ريال</div>
            </div>
          </div>
        </div>

        ${contract?.notes ? `<div class="contract-section">
          <div class="section-title">ملاحظات</div>
          <div style="line-height: 1.6; color: #1e293b;">${contract.notes}</div>
        </div>` : ''}

        <div class="footer">
          <p>تم طباعة هذا العقد من منصة رمز الإبداع لإدارة الأملاك</p>
          <p>التاريخ: ${new Date().toLocaleDateString('ar-SA')}</p>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  if (isLoading) {
    return <div className="text-center py-20 text-muted-foreground">جاري التحميل...</div>;
  }

  if (!contract) {
    return (
      <div className="text-center py-20">
        <FileText className="h-16 w-16 mx-auto opacity-20 mb-4" />
        <p className="text-muted-foreground">العقد غير موجود</p>
        <Button onClick={() => navigate('/contracts')} className="mt-4" variant="outline">
          العودة للعقود
        </Button>
      </div>
    );
  }

  const statusColor = contract.status === 'نشط' ? 'bg-green-100 text-green-700' :
                      contract.status === 'منتهي' ? 'bg-slate-100 text-slate-600' :
                      contract.status === 'ملغي' ? 'bg-red-100 text-red-700' :
                      'bg-amber-100 text-amber-700';

  const isPastDue = contract.endDate && new Date(contract.endDate) < new Date();
  const daysUntilEnd = contract.endDate ? Math.ceil((new Date(contract.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null;

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <button onClick={() => navigate('/contracts')} className="hover:text-amber-600 transition-colors">العقود</button>
        <ChevronRight className="h-4 w-4 rotate-180" />
        <span className="text-slate-900 font-medium">{contract.contractNumber}</span>
      </div>

      {/* Header */}
      <div className="flex items-start gap-4 justify-between">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-amber-50 rounded-xl flex-shrink-0">
            <FileText className="h-8 w-8 text-amber-600" />
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-slate-900 font-mono">{contract.contractNumber}</h1>
              <Badge className={statusColor}>{contract.status}</Badge>
              {contract.contractType && <Badge variant="outline">{contract.contractType}</Badge>}
              {isPastDue && <Badge className="bg-red-100 text-red-700">منتهي</Badge>}
              {!isPastDue && daysUntilEnd !== null && daysUntilEnd <= 30 && <Badge className="bg-yellow-100 text-yellow-700">ينتهي قريباً ({daysUntilEnd} يوم)</Badge>}
            </div>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
              {contract.tenantName && <span>المستأجر: {contract.tenantName}</span>}
              {contract.propertyName && <span>{contract.propertyName}</span>}
            </div>
          </div>
        </div>
        <Button onClick={handlePrint} variant="outline" size="sm" className="gap-2">
          <Printer className="h-4 w-4" /> طباعة
        </Button>
      </div>

      {/* Key Info Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'قيمة العقد', value: `${parseFloat(String(contract.totalContractValue || 0)).toLocaleString('ar-SA')} ريال`, color: 'text-amber-700', bg: 'bg-amber-50' },
          { label: 'رسوم التوثيق', value: `${parseFloat(String(contract.totalDocumentationFees || 0)).toLocaleString('ar-SA')} ريال`, color: 'text-blue-700', bg: 'bg-blue-50' },
          { label: 'مبلغ التأمين', value: `${parseFloat(String(contract.totalDepositAmount || 0)).toLocaleString('ar-SA')} ريال`, color: 'text-green-700', bg: 'bg-green-50' },
          { label: 'رسوم الوساطة', value: `${parseFloat(String(contract.brokerageFees || 0)).toLocaleString('ar-SA')} ريال`, color: 'text-purple-700', bg: 'bg-purple-50' },
        ].map(s => (
          <Card key={s.label} className={`${s.bg} border-0`}>
            <CardContent className="p-3">
              <div className="text-xs text-muted-foreground">{s.label}</div>
              <div className={`text-lg font-bold ${s.color} mt-1`}>{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="details" dir="rtl">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="details">التفاصيل</TabsTrigger>
          <TabsTrigger value="parties">الأطراف</TabsTrigger>
          <TabsTrigger value="property">العقار والوحدة</TabsTrigger>
          <TabsTrigger value="payments">الدفعات ({payments.length})</TabsTrigger>
          <TabsTrigger value="installments" className="flex items-center gap-1"><ListOrdered className="h-3.5 w-3.5" />الأقساط</TabsTrigger>
          <TabsTrigger value="statement" className="flex items-center gap-1"><BarChart3 className="h-3.5 w-3.5" />كشف الحساب</TabsTrigger>
          <TabsTrigger value="renew" className="flex items-center gap-1"><RefreshCw className="h-3.5 w-3.5" />تجديد</TabsTrigger>
          <TabsTrigger value="evacuate" className="flex items-center gap-1"><LogOut className="h-3.5 w-3.5" />إخلاء</TabsTrigger>
        </TabsList>

        {/* Details */}
        <TabsContent value="details">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Calendar className="h-4 w-4 text-amber-500" />معلومات العقد</CardTitle></CardHeader>
              <CardContent>
                <InfoRow label="رقم العقد" value={contract.contractNumber} />
                <InfoRow label="نسخة العقد" value={contract.versionNumber ? `${contract.versionNumber}` : '1'} />
                <InfoRow label="النوع" value={contract.contractType} />
                <InfoRow label="الحالة" value={contract.status} />
                <InfoRow label="تاريخ الإنشاء" value={contract.createdDate ? new Date(contract.createdDate).toLocaleDateString('ar-SA') : '-'} />
                <InfoRow label="تاريخ البدء" value={contract.startDate ? new Date(contract.startDate).toLocaleDateString('ar-SA') : '-'} />
                <InfoRow label="تاريخ النهاية" value={contract.endDate ? new Date(contract.endDate).toLocaleDateString('ar-SA') : '-'} />
                <InfoRow label="الوسيط" value={contract.brokerName} />
                <InfoRow label="رقم اتفاقية الوسيط" value={contract.brokerAgreementNumber} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><DollarSign className="h-4 w-4 text-amber-500" />التفاصيل المالية</CardTitle></CardHeader>
              <CardContent>
                <InfoRow label="إجمالي قيمة العقد" value={contract.totalContractValue ? `${parseFloat(String(contract.totalContractValue)).toLocaleString('ar-SA')} ريال` : '-'} />
                <InfoRow label="رسوم التوثيق" value={contract.totalDocumentationFees ? `${parseFloat(String(contract.totalDocumentationFees)).toLocaleString('ar-SA')} ريال` : '-'} />
                <InfoRow label="مبلغ التأمين" value={contract.totalDepositAmount ? `${parseFloat(String(contract.totalDepositAmount)).toLocaleString('ar-SA')} ريال` : '-'} />
                <InfoRow label="رسوم الوساطة" value={contract.brokerageFees ? `${parseFloat(String(contract.brokerageFees)).toLocaleString('ar-SA')} ريال` : '-'} />
              </CardContent>
            </Card>
          </div>
          {contract.notes && (
            <Card className="mt-4">
              <CardHeader><CardTitle className="text-base">ملاحظات</CardTitle></CardHeader>
              <CardContent><p className="text-sm text-slate-700 whitespace-pre-wrap">{contract.notes}</p></CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Parties */}
        <TabsContent value="parties">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><User className="h-4 w-4 text-amber-500" />المالك (المؤجر)</CardTitle></CardHeader>
              <CardContent>
                <InfoRow label="الاسم" value={contract.landlordName} />
                <InfoRow label="رقم الهوية" value={contract.landlordIdentity} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><User className="h-4 w-4 text-blue-500" />المستأجر</CardTitle></CardHeader>
              <CardContent>
                <InfoRow label="الاسم" value={contract.tenantName} />
                <InfoRow label="رقم الهوية" value={contract.tenantIdentity} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Property */}
        <TabsContent value="property">
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><MapPin className="h-4 w-4 text-amber-500" />بيانات العقار والوحدة</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8">
                <div>
                  <InfoRow label="اسم العقار" value={contract.propertyName} />
                  <InfoRow label="نوع العقار" value={contract.propertyType} />
                  <InfoRow label="رقم الوحدة" value={contract.unitNumber} />
                  <InfoRow label="نوع الوحدة" value={contract.unitType} />
                </div>
                <div>
                  <InfoRow label="المدينة" value={contract.city} />
                  <InfoRow label="المنطقة" value={contract.region} />
                  <InfoRow label="رقم الصك" value={contract.deedNumber} />
                  <InfoRow label="رقم العقد الإيجار (إيجار)" value={contract.ejarContractId} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payments */}
        <TabsContent value="payments">
          {payments.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground">
              <DollarSign className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p>لا توجد دفعات مسجلة لهذا العقد</p>
            </CardContent></Card>
          ) : (
            <div className="space-y-2">
              {payments.map((payment: any, idx: number) => (
                <Card key={idx} className="border hover:shadow-sm transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900">دفعة #{idx + 1}</span>
                          {payment.invoiceStatus && <Badge variant="outline" className="text-xs">{payment.invoiceStatus}</Badge>}
                          {payment.paymentStatus && <Badge className="text-xs">{payment.paymentStatus}</Badge>}
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
                          {payment.invoiceNumber && <span>فاتورة: {payment.invoiceNumber}</span>}
                          {payment.invoiceDueDate && <span>الاستحقاق: {payment.invoiceDueDate}</span>}
                          {payment.paymentDate && <span>تاريخ الدفع: {payment.paymentDate}</span>}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-amber-600">{parseFloat(String(payment.totalAmount || 0)).toLocaleString('ar-SA')} ريال</div>
                        <div className="text-xs text-muted-foreground mt-1">الإجمالي</div>
                      </div>
                    </div>
                    {payment.paidAmount && (
                      <div className="flex items-center gap-3 mt-2 pt-2 border-t border-slate-100">
                        <Check className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-muted-foreground">مدفوع: {parseFloat(String(payment.paidAmount)).toLocaleString('ar-SA')} ريال</span>
                        {payment.remainingAmount && parseFloat(String(payment.remainingAmount)) > 0 && (
                          <span className="text-sm text-red-600">متبقي: {parseFloat(String(payment.remainingAmount)).toLocaleString('ar-SA')} ريال</span>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Installments */}
        <TabsContent value="installments">
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Plus className="h-4 w-4 text-amber-600" />
                  إضافة قسط جديد
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="mb-1.5 block">تاريخ الاستحقاق *</Label>
                    <Input type="date" value={newInstallment.invoiceDueDate} onChange={e => setNewInstallment(p => ({ ...p, invoiceDueDate: e.target.value }))} />
                  </div>
                  <div>
                    <Label className="mb-1.5 block">المبلغ (ريال) *</Label>
                    <Input type="number" placeholder="0" value={newInstallment.totalAmount} onChange={e => setNewInstallment(p => ({ ...p, totalAmount: e.target.value }))} />
                  </div>
                  <div>
                    <Label className="mb-1.5 block">الحالة</Label>
                    <Select value={newInstallment.paymentStatus} onValueChange={v => setNewInstallment(p => ({ ...p, paymentStatus: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="معلق">معلق</SelectItem>
                        <SelectItem value="مدفوع">مدفوع</SelectItem>
                        <SelectItem value="متأخر">متأخر</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button className="mt-4 bg-amber-600 hover:bg-amber-700 gap-2" onClick={handleAddInstallment} disabled={addPaymentMutation.isPending}>
                  <Plus className="h-4 w-4" />
                  {addPaymentMutation.isPending ? "جاري الإضافة..." : "إضافة القسط"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">جدول الأقساط ({payments.length})</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {payments.length === 0 ? (
                  <div className="py-10 text-center text-muted-foreground">لا توجد أقساط مسجلة</div>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b">
                      <tr>
                        <th className="text-right px-4 py-2 font-medium">#</th>
                        <th className="text-right px-4 py-2 font-medium">الاستحقاق</th>
                        <th className="text-right px-4 py-2 font-medium">المبلغ</th>
                        <th className="text-right px-4 py-2 font-medium">المدفوع</th>
                        <th className="text-right px-4 py-2 font-medium">المتبقي</th>
                        <th className="text-right px-4 py-2 font-medium">الحالة</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {payments.map((p: any, i: number) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="px-4 py-2">{i + 1}</td>
                          <td className="px-4 py-2">{p.invoiceDueDate || '-'}</td>
                          <td className="px-4 py-2 font-medium">{parseFloat(String(p.totalAmount || 0)).toLocaleString('ar-SA')} ريال</td>
                          <td className="px-4 py-2 text-green-600">{parseFloat(String(p.paidAmount || 0)).toLocaleString('ar-SA')} ريال</td>
                          <td className="px-4 py-2 text-red-600">{parseFloat(String(p.remainingAmount || 0)).toLocaleString('ar-SA')} ريال</td>
                          <td className="px-4 py-2">
                            <Badge className={p.paymentStatus === 'مدفوع' ? 'bg-green-100 text-green-700' : p.paymentStatus === 'متأخر' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}>
                              {p.paymentStatus || 'معلق'}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Statement */}
        <TabsContent value="statement">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-blue-600" />
                كشف حساب العقد — {contract.contractNumber}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {[
                  { label: 'إجمالي العقد', value: parseFloat(String(contract.totalContractValue || 0)), color: 'text-slate-800' },
                  { label: 'إجمالي المدفوع', value: payments.reduce((s: number, p: any) => s + parseFloat(String(p.paidAmount || 0)), 0), color: 'text-green-700' },
                  { label: 'إجمالي المتبقي', value: payments.reduce((s: number, p: any) => s + parseFloat(String(p.remainingAmount || 0)), 0), color: 'text-red-700' },
                  { label: 'عدد الأقساط', value: payments.length, color: 'text-blue-700', isCount: true },
                ].map(s => (
                  <div key={s.label} className="bg-slate-50 rounded-xl p-3 border">
                    <div className="text-xs text-muted-foreground mb-1">{s.label}</div>
                    <div className={`text-xl font-bold ${s.color}`}>
                      {(s as any).isCount ? s.value : `${s.value.toLocaleString('ar-SA')} ريال`}
                    </div>
                  </div>
                ))}
              </div>

              {/* Movement Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-800 text-white">
                    <tr>
                      <th className="text-right px-4 py-2">#</th>
                      <th className="text-right px-4 py-2">رقم الفاتورة</th>
                      <th className="text-right px-4 py-2">تاريخ الاستحقاق</th>
                      <th className="text-right px-4 py-2">تاريخ الدفع</th>
                      <th className="text-right px-4 py-2">المبلغ الكلي</th>
                      <th className="text-right px-4 py-2">المدفوع</th>
                      <th className="text-right px-4 py-2">المتبقي</th>
                      <th className="text-right px-4 py-2">الحالة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {payments.length === 0 ? (
                      <tr><td colSpan={8} className="text-center py-8 text-muted-foreground">لا توجد حركات مالية</td></tr>
                    ) : payments.map((p: any, i: number) => (
                      <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                        <td className="px-4 py-2">{i + 1}</td>
                        <td className="px-4 py-2 font-mono text-xs">{p.invoiceNumber || '-'}</td>
                        <td className="px-4 py-2">{p.invoiceDueDate || '-'}</td>
                        <td className="px-4 py-2">{p.paymentDate || '-'}</td>
                        <td className="px-4 py-2 font-medium">{parseFloat(String(p.totalAmount || 0)).toLocaleString('ar-SA')}</td>
                        <td className="px-4 py-2 text-green-600 font-medium">{parseFloat(String(p.paidAmount || 0)).toLocaleString('ar-SA')}</td>
                        <td className="px-4 py-2 text-red-600">{parseFloat(String(p.remainingAmount || 0)).toLocaleString('ar-SA')}</td>
                        <td className="px-4 py-2">
                          <Badge className={p.paymentStatus === 'مدفوع' ? 'bg-green-100 text-green-700' : p.paymentStatus === 'متأخر' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}>
                            {p.paymentStatus || '-'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Renew */}
        <TabsContent value="renew">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <RefreshCw className="h-4 w-4 text-green-600" />
                تجديد عقد الإيجار
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                <strong>تاريخ انتهاء العقد الحالي:</strong>{" "}
                {contract.endDate ? new Date(contract.endDate).toLocaleDateString('ar-SA') : 'غير محدد'}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="mb-1.5 block">تاريخ بداية التجديد *</Label>
                  <Input type="date" value={renewForm.startDate} onChange={e => setRenewForm(p => ({ ...p, startDate: e.target.value }))} />
                </div>
                <div>
                  <Label className="mb-1.5 block">تاريخ نهاية التجديد *</Label>
                  <Input type="date" value={renewForm.endDate} onChange={e => setRenewForm(p => ({ ...p, endDate: e.target.value }))} />
                </div>
                <div>
                  <Label className="mb-1.5 block">قيمة عقد التجديد (ريال)</Label>
                  <Input type="number" placeholder={String(contract.totalContractValue || '')} value={renewForm.totalContractValue} onChange={e => setRenewForm(p => ({ ...p, totalContractValue: e.target.value }))} />
                </div>
              </div>
              <Button
                className="bg-green-600 hover:bg-green-700 gap-2"
                onClick={handleRenew}
                disabled={updateMutation.isPending}
              >
                <RefreshCw className="h-4 w-4" />
                {updateMutation.isPending ? "جاري التجديد..." : "تجديد العقد"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Evacuate */}
        <TabsContent value="evacuate">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <LogOut className="h-4 w-4 text-red-600" />
                إخلاء الوحدة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className={`p-4 rounded-lg border text-sm ${contract.status === 'منتهي' ? 'bg-slate-50 border-slate-200 text-slate-600' : 'bg-amber-50 border-amber-200 text-amber-800'}`}>
                {contract.status === 'منتهي'
                  ? 'تم إخلاء هذه الوحدة مسبقاً — حالة العقد: منتهي'
                  : 'سيتم تغيير حالة العقد إلى "منتهي" وإتاحة الوحدة للإيجار مرة أخرى.'}
              </div>
              <div>
                <Label className="mb-1.5 block">ملاحظات الإخلاء</Label>
                <Input
                  placeholder="سبب الإخلاء أو ملاحظات إضافية..."
                  value={evacNotes}
                  onChange={e => setEvacNotes(e.target.value)}
                />
              </div>
              <Button
                className="bg-red-600 hover:bg-red-700 gap-2"
                onClick={handleEvacuate}
                disabled={updateMutation.isPending || contract.status === 'منتهي'}
              >
                <LogOut className="h-4 w-4" />
                {updateMutation.isPending ? "جاري الإخلاء..." : "تأكيد الإخلاء"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}
