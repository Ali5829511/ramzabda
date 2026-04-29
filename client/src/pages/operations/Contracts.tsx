import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { FileText, Plus, Search, Edit, Trash2, Filter, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const CONTRACT_STATUSES = ['نشط','منتهي','ملغي','قيد_الانتظار','مراجعة'];
const CONTRACT_TYPES = ['سكني','تجاري'];

const STATUS_STYLES: Record<string, string> = {
  'نشط': 'bg-green-100 text-green-700',
  'منتهي': 'bg-slate-100 text-slate-600',
  'ملغي': 'bg-red-100 text-red-700',
  'قيد_الانتظار': 'bg-amber-100 text-amber-700',
  'مراجعة': 'bg-blue-100 text-blue-700',
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR', maximumFractionDigits: 0 }).format(value);
}

function ContractForm({ initial, onSave, onCancel, loading }: any) {
  const [form, setForm] = useState(initial ?? {
    contractNumber: '', contractType: 'سكني', status: 'نشط',
    brokerName: '', startDate: '', endDate: '',
    landlordName: '', landlordIdentity: '', tenantName: '', tenantIdentity: '',
    propertyName: '', unitNumber: '', city: '', region: '',
    totalContractValue: '', totalDocumentationFees: '', totalDepositAmount: '', brokerageFees: '',
    notes: '',
  });
  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  return (
    <div className="grid grid-cols-2 gap-4 py-2 max-h-[70vh] overflow-y-auto">
      <div>
        <Label>رقم العقد *</Label>
        <Input value={form.contractNumber} onChange={e => set('contractNumber', e.target.value)} placeholder="رقم العقد" className="mt-1" />
      </div>
      <div>
        <Label>نوع العقد</Label>
        <Select value={form.contractType} onValueChange={v => set('contractType', v)}>
          <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
          <SelectContent>{CONTRACT_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div>
        <Label>حالة العقد</Label>
        <Select value={form.status} onValueChange={v => set('status', v)}>
          <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
          <SelectContent>{CONTRACT_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div>
        <Label>موظف مكتب الوساطة</Label>
        <Input value={form.brokerName} onChange={e => set('brokerName', e.target.value)} placeholder="اسم الموظف" className="mt-1" />
      </div>
      <div>
        <Label>تاريخ بدء الإيجار</Label>
        <Input type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} className="mt-1" />
      </div>
      <div>
        <Label>تاريخ انتهاء الإيجار</Label>
        <Input type="date" value={form.endDate} onChange={e => set('endDate', e.target.value)} className="mt-1" />
      </div>
      <div>
        <Label>اسم المؤجر</Label>
        <Input value={form.landlordName} onChange={e => set('landlordName', e.target.value)} placeholder="اسم المؤجر" className="mt-1" />
      </div>
      <div>
        <Label>هوية المؤجر</Label>
        <Input value={form.landlordIdentity} onChange={e => set('landlordIdentity', e.target.value)} placeholder="رقم الهوية" className="mt-1" />
      </div>
      <div>
        <Label>اسم المستأجر</Label>
        <Input value={form.tenantName} onChange={e => set('tenantName', e.target.value)} placeholder="اسم المستأجر" className="mt-1" />
      </div>
      <div>
        <Label>هوية المستأجر</Label>
        <Input value={form.tenantIdentity} onChange={e => set('tenantIdentity', e.target.value)} placeholder="رقم الهوية" className="mt-1" />
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
        <Label>المدينة</Label>
        <Input value={form.city} onChange={e => set('city', e.target.value)} placeholder="المدينة" className="mt-1" />
      </div>
      <div>
        <Label>المنطقة</Label>
        <Input value={form.region} onChange={e => set('region', e.target.value)} placeholder="المنطقة" className="mt-1" />
      </div>
      <div>
        <Label>إجمالي قيمة العقد (ريال)</Label>
        <Input type="number" value={form.totalContractValue} onChange={e => set('totalContractValue', e.target.value)} className="mt-1" />
      </div>
      <div>
        <Label>رسوم التوثيق (ريال)</Label>
        <Input type="number" value={form.totalDocumentationFees} onChange={e => set('totalDocumentationFees', e.target.value)} className="mt-1" />
      </div>
      <div>
        <Label>مبلغ الضمان (ريال)</Label>
        <Input type="number" value={form.totalDepositAmount} onChange={e => set('totalDepositAmount', e.target.value)} className="mt-1" />
      </div>
      <div>
        <Label>رسوم الوساطة (ريال)</Label>
        <Input type="number" value={form.brokerageFees} onChange={e => set('brokerageFees', e.target.value)} className="mt-1" />
      </div>
      <div className="col-span-2">
        <Label>ملاحظات</Label>
        <Input value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="ملاحظات إضافية" className="mt-1" />
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

export default function Contracts() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [showAdd, setShowAdd] = useState(false);
  const [showBulkAdd, setShowBulkAdd] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active');
  const [bulkRows, setBulkRows] = useState([
    { contractNumber: '', contractType: 'سكني', tenantName: '', landlordName: '', startDate: '', endDate: '', totalContractValue: '' },
  ]);
  const utils = trpc.useUtils();

  const archivedStatuses = ['منتهي', 'ملغي'];
  const activeStatusFilter = activeTab === 'archived'
    ? (statusFilter || undefined)
    : (statusFilter && !archivedStatuses.includes(statusFilter) ? statusFilter : undefined);

  const { data, isLoading } = trpc.contracts.list.useQuery({
    search,
    status: activeTab === 'archived' ? (statusFilter || 'منتهي') : (statusFilter && !archivedStatuses.includes(statusFilter) ? statusFilter : undefined),
    page,
    limit: 20,
  });

  const createMutation = trpc.contracts.create.useMutation({
    onSuccess: () => { utils.contracts.list.invalidate(); setShowAdd(false); toast.success('تم إضافة العقد بنجاح'); },
    onError: (e) => toast.error(e.message),
  });
  const updateMutation = trpc.contracts.update.useMutation({
    onSuccess: () => { utils.contracts.list.invalidate(); setEditItem(null); toast.success('تم تحديث العقد'); },
    onError: (e) => toast.error(e.message),
  });
  const deleteMutation = trpc.contracts.delete.useMutation({
    onSuccess: () => { utils.contracts.list.invalidate(); toast.success('تم حذف العقد'); },
    onError: (e) => toast.error(e.message),
  });

  const handleBulkSave = async () => {
    const valid = bulkRows.filter(r => r.contractNumber && r.tenantName);
    if (valid.length === 0) return toast.error('يرجى تعبئة بيانات العقود');
    for (const row of valid) {
      await createMutation.mutateAsync(row as any).catch(() => {});
    }
    setShowBulkAdd(false);
    setBulkRows([{ contractNumber: '', contractType: 'سكني', tenantName: '', landlordName: '', startDate: '', endDate: '', totalContractValue: '' }]);
    toast.success(`تم إضافة ${valid.length} عقد بنجاح`);
  };

  const totalPages = Math.ceil((data?.total ?? 0) / 20);

  return (
    <div className="space-y-5 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">إدارة العقود</h1>
          <p className="text-sm text-muted-foreground mt-1">إجمالي {data?.total ?? 0} عقد</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowBulkAdd(true)} className="gap-2">
            <Filter className="h-4 w-4" /> إضافة عقود متعددة
          </Button>
          <Button onClick={() => setShowAdd(true)} className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold gap-2">
            <Plus className="h-4 w-4" /> إضافة عقد
          </Button>
        </div>
      </div>

      {/* Tabs: Active / Archived */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          onClick={() => { setActiveTab('active'); setStatusFilter(''); setPage(1); }}
          className={`pb-2 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'active' ? 'border-amber-500 text-amber-700' : 'border-transparent text-muted-foreground hover:text-slate-700'}`}
        >
          العقود النشطة
        </button>
        <button
          onClick={() => { setActiveTab('archived'); setStatusFilter('منتهي'); setPage(1); }}
          className={`pb-2 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'archived' ? 'border-slate-600 text-slate-700' : 'border-transparent text-muted-foreground hover:text-slate-700'}`}
        >
          العقود المؤرشفة
        </button>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="البحث باسم المستأجر..." className="pr-9" />
        </div>
        <Select value={statusFilter} onValueChange={v => { setStatusFilter(v === 'all' ? '' : v); setPage(1); }}>
          <SelectTrigger className="w-44">
            <Filter className="h-4 w-4 ml-2" />
            <SelectValue placeholder="حالة العقد" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">الكل</SelectItem>
            {CONTRACT_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Card className="shadow-sm">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">جاري التحميل...</div>
          ) : (data?.data ?? []).length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">لا توجد عقود مسجلة</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b">
                    <th className="text-right px-4 py-3 font-semibold text-slate-600">رقم العقد</th>
                    <th className="text-right px-4 py-3 font-semibold text-slate-600">المستأجر</th>
                    <th className="text-right px-4 py-3 font-semibold text-slate-600">المؤجر</th>
                    <th className="text-right px-4 py-3 font-semibold text-slate-600">العقار</th>
                    <th className="text-right px-4 py-3 font-semibold text-slate-600">المدة</th>
                    <th className="text-right px-4 py-3 font-semibold text-slate-600">القيمة</th>
                    <th className="text-right px-4 py-3 font-semibold text-slate-600">النوع</th>
                    <th className="text-right px-4 py-3 font-semibold text-slate-600">الحالة</th>
                    <th className="text-right px-4 py-3 font-semibold text-slate-600">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {(data?.data ?? []).map((contract: any) => (
                    <tr key={contract.id} className="border-b hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-slate-600">{contract.contractNumber}</td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-slate-900">{contract.tenantName ?? '-'}</p>
                          <p className="text-xs text-muted-foreground">{contract.tenantIdentity}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-700">{contract.landlordName ?? '-'}</td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-slate-700">{contract.propertyName ?? '-'}</p>
                          <p className="text-xs text-muted-foreground">وحدة {contract.unitNumber}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-xs text-slate-600">
                          <Calendar className="h-3 w-3" />
                          <span>{contract.startDate ? new Date(contract.startDate).toLocaleDateString('ar-SA') : '-'}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {contract.endDate ? new Date(contract.endDate).toLocaleDateString('ar-SA') : '-'}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-semibold text-amber-600">
                        {formatCurrency(Number(contract.totalContractValue ?? 0))}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs">
                          {contract.contractType ?? '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[contract.status ?? ''] ?? 'bg-slate-100 text-slate-600'}`}>
                          {contract.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => setEditItem(contract)} className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-blue-50 text-blue-600 transition-colors">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button onClick={() => { if (confirm('هل أنت متأكد من حذف هذا العقد؟')) deleteMutation.mutate({ id: contract.id }); }} className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-500 transition-colors">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
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

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-3xl" dir="rtl">
          <DialogHeader><DialogTitle className="text-right">إضافة عقد جديد</DialogTitle></DialogHeader>
          <ContractForm onSave={(form: any) => createMutation.mutate(form)} onCancel={() => setShowAdd(false)} loading={createMutation.isPending} />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editItem} onOpenChange={() => setEditItem(null)}>
        <DialogContent className="max-w-3xl" dir="rtl">
          <DialogHeader><DialogTitle className="text-right">تعديل العقد</DialogTitle></DialogHeader>
          {editItem && (
            <ContractForm
              initial={editItem}
              onSave={(form: any) => updateMutation.mutate({ id: editItem.id, status: form.status, notes: form.notes, brokerName: form.brokerName })}
              onCancel={() => setEditItem(null)}
              loading={updateMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Bulk Add Dialog */}
      <Dialog open={showBulkAdd} onOpenChange={setShowBulkAdd}>
        <DialogContent className="max-w-5xl" dir="rtl">
          <DialogHeader><DialogTitle className="text-right">إضافة عقود متعددة</DialogTitle></DialogHeader>
          <div className="space-y-3 max-h-[60vh] overflow-y-auto py-2">
            {bulkRows.map((row, idx) => (
              <div key={idx} className="grid grid-cols-7 gap-2 items-end border-b pb-3">
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">رقم العقد *</label>
                  <Input value={row.contractNumber} onChange={e => setBulkRows(r => r.map((x, i) => i === idx ? { ...x, contractNumber: e.target.value } : x))} placeholder="C-001" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">النوع</label>
                  <Select value={row.contractType} onValueChange={v => setBulkRows(r => r.map((x, i) => i === idx ? { ...x, contractType: v } : x))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="سكني">سكني</SelectItem><SelectItem value="تجاري">تجاري</SelectItem></SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">المستأجر *</label>
                  <Input value={row.tenantName} onChange={e => setBulkRows(r => r.map((x, i) => i === idx ? { ...x, tenantName: e.target.value } : x))} placeholder="اسم المستأجر" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">المالك</label>
                  <Input value={row.landlordName} onChange={e => setBulkRows(r => r.map((x, i) => i === idx ? { ...x, landlordName: e.target.value } : x))} placeholder="اسم المالك" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">البداية</label>
                  <Input type="date" value={row.startDate} onChange={e => setBulkRows(r => r.map((x, i) => i === idx ? { ...x, startDate: e.target.value } : x))} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">النهاية</label>
                  <Input type="date" value={row.endDate} onChange={e => setBulkRows(r => r.map((x, i) => i === idx ? { ...x, endDate: e.target.value } : x))} />
                </div>
                <button onClick={() => setBulkRows(r => r.filter((_, i) => i !== idx))} className="h-9 w-9 flex items-center justify-center rounded text-red-500 hover:bg-red-50 flex-shrink-0">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex justify-between pt-2">
            <Button variant="outline" onClick={() => setBulkRows(r => [...r, { contractNumber: '', contractType: 'سكني', tenantName: '', landlordName: '', startDate: '', endDate: '', totalContractValue: '' }])}>
              <Plus className="h-4 w-4 ml-1" /> إضافة صف
            </Button>
            <Button onClick={handleBulkSave} disabled={createMutation.isPending} className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold">
              {createMutation.isPending ? 'جاري الحفظ...' : `حفظ ${bulkRows.filter(r => r.contractNumber && r.tenantName).length} عقد`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
