import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Building2, Plus, Search, Edit, Trash2, MapPin, Home } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const PROPERTY_TYPES = ['فيلا','شقة','عمارة','مكتب','محل','مستودع','أرض','أخرى'];

function PropertyForm({ initial, onSave, onCancel, loading }: any) {
  const [form, setForm] = useState(initial ?? {
    name: '', deedNumber: '', deedType: '', ownerName: '', ownerIdentity: '',
    propertyType: 'أخرى', propertyUsage: '', city: '', region: '', address: '', totalUnits: 0,
  });
  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  return (
    <div className="grid grid-cols-2 gap-4 py-2">
      <div className="col-span-2">
        <Label>اسم العقار *</Label>
        <Input value={form.name} onChange={e => set('name', e.target.value)} placeholder="اسم العقار" className="mt-1" />
      </div>
      <div>
        <Label>رقم وثيقة الملكية</Label>
        <Input value={form.deedNumber} onChange={e => set('deedNumber', e.target.value)} placeholder="رقم الوثيقة" className="mt-1" />
      </div>
      <div>
        <Label>نوع الوثيقة</Label>
        <Input value={form.deedType} onChange={e => set('deedType', e.target.value)} placeholder="نوع الوثيقة" className="mt-1" />
      </div>
      <div>
        <Label>اسم المالك</Label>
        <Input value={form.ownerName} onChange={e => set('ownerName', e.target.value)} placeholder="اسم المالك" className="mt-1" />
      </div>
      <div>
        <Label>هوية المالك</Label>
        <Input value={form.ownerIdentity} onChange={e => set('ownerIdentity', e.target.value)} placeholder="رقم الهوية" className="mt-1" />
      </div>
      <div>
        <Label>نوع العقار</Label>
        <Select value={form.propertyType} onValueChange={v => set('propertyType', v)}>
          <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
          <SelectContent>{PROPERTY_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div>
        <Label>الاستخدام</Label>
        <Input value={form.propertyUsage} onChange={e => set('propertyUsage', e.target.value)} placeholder="سكني / تجاري" className="mt-1" />
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
        <Label>عدد الوحدات</Label>
        <Input type="number" value={form.totalUnits} onChange={e => set('totalUnits', Number(e.target.value))} className="mt-1" />
      </div>
      <div>
        <Label>العنوان</Label>
        <Input value={form.address} onChange={e => set('address', e.target.value)} placeholder="العنوان التفصيلي" className="mt-1" />
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

export default function Properties() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const utils = trpc.useUtils();

  const { data, isLoading } = trpc.properties.list.useQuery({ search, page, limit: 20 });
  const createMutation = trpc.properties.create.useMutation({
    onSuccess: () => { utils.properties.list.invalidate(); setShowAdd(false); toast.success('تم إضافة العقار بنجاح'); },
    onError: (e) => toast.error(e.message),
  });
  const updateMutation = trpc.properties.update.useMutation({
    onSuccess: () => { utils.properties.list.invalidate(); setEditItem(null); toast.success('تم تحديث العقار'); },
    onError: (e) => toast.error(e.message),
  });
  const deleteMutation = trpc.properties.delete.useMutation({
    onSuccess: () => { utils.properties.list.invalidate(); toast.success('تم حذف العقار'); },
    onError: (e) => toast.error(e.message),
  });

  const totalPages = Math.ceil((data?.total ?? 0) / 20);

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">إدارة العقارات</h1>
          <p className="text-sm text-muted-foreground mt-1">إجمالي {data?.total ?? 0} عقار</p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold gap-2">
          <Plus className="h-4 w-4" /> إضافة عقار
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          placeholder="البحث باسم العقار..."
          className="pr-9"
        />
      </div>

      {/* Table */}
      <Card className="shadow-sm">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">جاري التحميل...</div>
          ) : (data?.data ?? []).length === 0 ? (
            <div className="p-12 text-center">
              <Building2 className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">لا توجد عقارات مسجلة</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b">
                    <th className="text-right px-4 py-3 font-semibold text-slate-600">اسم العقار</th>
                    <th className="text-right px-4 py-3 font-semibold text-slate-600">نوع العقار</th>
                    <th className="text-right px-4 py-3 font-semibold text-slate-600">المالك</th>
                    <th className="text-right px-4 py-3 font-semibold text-slate-600">الموقع</th>
                    <th className="text-right px-4 py-3 font-semibold text-slate-600">الوحدات</th>
                    <th className="text-right px-4 py-3 font-semibold text-slate-600">المؤجرة</th>
                    <th className="text-right px-4 py-3 font-semibold text-slate-600">المتاحة</th>
                    <th className="text-right px-4 py-3 font-semibold text-slate-600">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {(data?.data ?? []).map((prop: any) => (
                    <tr key={prop.id} className="border-b hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                            <Building2 className="h-4 w-4 text-amber-600" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{prop.name}</p>
                            <p className="text-xs text-muted-foreground">{prop.deedNumber}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-medium">
                          {prop.propertyType ?? '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-700">{prop.ownerName ?? '-'}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-slate-600">
                          <MapPin className="h-3 w-3" />
                          <span className="text-xs">{prop.city ?? '-'} / {prop.region ?? '-'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center font-semibold">{prop.totalUnits ?? 0}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-amber-600 font-semibold">{prop.rentedUnits ?? 0}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-green-600 font-semibold">{prop.availableUnits ?? 0}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditItem(prop)}
                            className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => { if (confirm('هل أنت متأكد من حذف هذا العقار؟')) deleteMutation.mutate({ id: prop.id }); }}
                            className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                          >
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>السابق</Button>
          <span className="text-sm text-muted-foreground">صفحة {page} من {totalPages}</span>
          <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>التالي</Button>
        </div>
      )}

      {/* Add Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-right">إضافة عقار جديد</DialogTitle>
          </DialogHeader>
          <PropertyForm onSave={(form: any) => createMutation.mutate(form)} onCancel={() => setShowAdd(false)} loading={createMutation.isPending} />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editItem} onOpenChange={() => setEditItem(null)}>
        <DialogContent className="max-w-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-right">تعديل العقار</DialogTitle>
          </DialogHeader>
          {editItem && (
            <PropertyForm
              initial={editItem}
              onSave={(form: any) => updateMutation.mutate({ id: editItem.id, ...form })}
              onCancel={() => setEditItem(null)}
              loading={updateMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
