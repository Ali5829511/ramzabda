import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Wrench, Plus, Search, Edit, Filter, AlertTriangle, Clock, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const MAINTENANCE_STATUSES = ['جديد','قيد_المعالجة','منتظر_الموافقة','مكتمل','ملغي'];
const CATEGORIES = ['كهرباء','سباكة','تكييف','نجارة','دهان','نظافة','أمن','أخرى'];
const PRIORITIES = ['عاجل','عالي','متوسط','منخفض'];

const STATUS_STYLES: Record<string, string> = {
  'جديد': 'bg-blue-100 text-blue-700',
  'قيد_المعالجة': 'bg-amber-100 text-amber-700',
  'منتظر_الموافقة': 'bg-purple-100 text-purple-700',
  'مكتمل': 'bg-green-100 text-green-700',
  'ملغي': 'bg-slate-100 text-slate-600',
};

const PRIORITY_STYLES: Record<string, string> = {
  'عاجل': 'bg-red-100 text-red-700',
  'عالي': 'bg-orange-100 text-orange-700',
  'متوسط': 'bg-amber-100 text-amber-700',
  'منخفض': 'bg-green-100 text-green-700',
};

function MaintenanceForm({ initial, onSave, onCancel, loading }: any) {
  const [form, setForm] = useState(initial ?? {
    title: '', propertyName: '', unitNumber: '', tenantName: '', tenantPhone: '',
    category: 'أخرى', description: '', priority: 'متوسط', status: 'جديد',
    assignedTo: '', estimatedCost: '', notes: '',
  });
  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  return (
    <div className="grid grid-cols-2 gap-4 py-2 max-h-[70vh] overflow-y-auto">
      <div className="col-span-2">
        <Label>عنوان الطلب *</Label>
        <Input value={form.title} onChange={e => set('title', e.target.value)} placeholder="وصف مختصر للمشكلة" className="mt-1" />
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
        <Label>اسم المستأجر</Label>
        <Input value={form.tenantName} onChange={e => set('tenantName', e.target.value)} placeholder="اسم المستأجر" className="mt-1" />
      </div>
      <div>
        <Label>هاتف المستأجر</Label>
        <Input value={form.tenantPhone} onChange={e => set('tenantPhone', e.target.value)} placeholder="رقم الهاتف" className="mt-1" />
      </div>
      <div>
        <Label>التصنيف</Label>
        <Select value={form.category} onValueChange={v => set('category', v)}>
          <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
          <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div>
        <Label>الأولوية</Label>
        <Select value={form.priority} onValueChange={v => set('priority', v)}>
          <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
          <SelectContent>{PRIORITIES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div>
        <Label>الحالة</Label>
        <Select value={form.status} onValueChange={v => set('status', v)}>
          <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
          <SelectContent>{MAINTENANCE_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div>
        <Label>المسؤول عن التنفيذ</Label>
        <Input value={form.assignedTo} onChange={e => set('assignedTo', e.target.value)} placeholder="اسم الفني أو الشركة" className="mt-1" />
      </div>
      <div>
        <Label>التكلفة التقديرية (ريال)</Label>
        <Input type="number" value={form.estimatedCost} onChange={e => set('estimatedCost', e.target.value)} className="mt-1" />
      </div>
      <div className="col-span-2">
        <Label>وصف المشكلة</Label>
        <Input value={form.description} onChange={e => set('description', e.target.value)} placeholder="تفاصيل إضافية عن المشكلة" className="mt-1" />
      </div>
      <div className="col-span-2">
        <Label>ملاحظات</Label>
        <Input value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="ملاحظات" className="mt-1" />
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

export default function Maintenance() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const utils = trpc.useUtils();

  const { data, isLoading } = trpc.maintenance.list.useQuery({
    search, status: statusFilter || undefined, page, limit: 20,
  });

  const createMutation = trpc.maintenance.create.useMutation({
    onSuccess: () => { utils.maintenance.list.invalidate(); setShowAdd(false); toast.success('تم إضافة طلب الصيانة'); },
    onError: (e) => toast.error(e.message),
  });
  const updateMutation = trpc.maintenance.update.useMutation({
    onSuccess: () => { utils.maintenance.list.invalidate(); setEditItem(null); toast.success('تم تحديث طلب الصيانة'); },
    onError: (e) => toast.error(e.message),
  });

  const requests = data?.data ?? [];
  const totalPages = Math.ceil((data?.total ?? 0) / 20);

  return (
    <div className="space-y-5 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">إدارة الصيانة</h1>
          <p className="text-sm text-muted-foreground mt-1">إجمالي {data?.total ?? 0} طلب صيانة</p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold gap-2">
          <Plus className="h-4 w-4" /> طلب صيانة جديد
        </Button>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="البحث بعنوان الطلب..." className="pr-9" />
        </div>
        <Select value={statusFilter} onValueChange={v => { setStatusFilter(v === 'all' ? '' : v); setPage(1); }}>
          <SelectTrigger className="w-44">
            <Filter className="h-4 w-4 ml-2" />
            <SelectValue placeholder="الحالة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">الكل</SelectItem>
            {MAINTENANCE_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Card className="shadow-sm">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">جاري التحميل...</div>
          ) : requests.length === 0 ? (
            <div className="p-12 text-center">
              <Wrench className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">لا توجد طلبات صيانة</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b">
                    <th className="text-right px-4 py-3 font-semibold text-slate-600">عنوان الطلب</th>
                    <th className="text-right px-4 py-3 font-semibold text-slate-600">العقار / الوحدة</th>
                    <th className="text-right px-4 py-3 font-semibold text-slate-600">المستأجر</th>
                    <th className="text-right px-4 py-3 font-semibold text-slate-600">التصنيف</th>
                    <th className="text-right px-4 py-3 font-semibold text-slate-600">الأولوية</th>
                    <th className="text-right px-4 py-3 font-semibold text-slate-600">المسؤول</th>
                    <th className="text-right px-4 py-3 font-semibold text-slate-600">التكلفة</th>
                    <th className="text-right px-4 py-3 font-semibold text-slate-600">الحالة</th>
                    <th className="text-right px-4 py-3 font-semibold text-slate-600">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((req: any) => (
                    <tr key={req.id} className="border-b hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-900">{req.title}</p>
                        <p className="text-xs text-muted-foreground">{req.description}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-slate-700">{req.propertyName ?? '-'}</p>
                        <p className="text-xs text-muted-foreground">وحدة {req.unitNumber ?? '-'}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-slate-700">{req.tenantName ?? '-'}</p>
                        <p className="text-xs text-muted-foreground">{req.tenantPhone}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs">{req.category ?? '-'}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${PRIORITY_STYLES[req.priority ?? ''] ?? 'bg-slate-100 text-slate-600'}`}>
                          {req.priority ?? '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-700">{req.assignedTo ?? '-'}</td>
                      <td className="px-4 py-3 font-semibold text-slate-700">
                        {req.estimatedCost ? `${Number(req.estimatedCost).toLocaleString('ar-SA')} ر.س` : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[req.status ?? ''] ?? 'bg-slate-100 text-slate-600'}`}>
                          {req.status ?? '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => setEditItem(req)} className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-blue-50 text-blue-600 transition-colors">
                          <Edit className="h-4 w-4" />
                        </button>
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
        <DialogContent className="max-w-2xl" dir="rtl">
          <DialogHeader><DialogTitle className="text-right">طلب صيانة جديد</DialogTitle></DialogHeader>
          <MaintenanceForm onSave={(form: any) => createMutation.mutate(form)} onCancel={() => setShowAdd(false)} loading={createMutation.isPending} />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editItem} onOpenChange={() => setEditItem(null)}>
        <DialogContent className="max-w-2xl" dir="rtl">
          <DialogHeader><DialogTitle className="text-right">تحديث طلب الصيانة</DialogTitle></DialogHeader>
          {editItem && (
            <MaintenanceForm
              initial={editItem}
              onSave={(form: any) => updateMutation.mutate({ id: editItem.id, status: form.status, assignedTo: form.assignedTo, actualCost: form.estimatedCost, notes: form.notes })}
              onCancel={() => setEditItem(null)}
              loading={updateMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
