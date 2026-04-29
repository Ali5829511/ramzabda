import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Home, Plus, Search, Edit, Trash2, Filter } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const UNIT_TYPES = ['شقة','فيلا','استوديو','غرفة','مكتب','محل','مستودع','أخرى'];
const UNIT_STATUSES = ['متاحة','مؤجرة','محجوزة','تحت_الصيانة'];

const STATUS_STYLES: Record<string, string> = {
  'متاحة': 'bg-green-100 text-green-700',
  'مؤجرة': 'bg-amber-100 text-amber-700',
  'محجوزة': 'bg-blue-100 text-blue-700',
  'تحت_الصيانة': 'bg-red-100 text-red-700',
};

function UnitForm({ initial, onSave, onCancel, loading }: any) {
  const [form, setForm] = useState(initial ?? {
    propertyName: '', unitNumber: '', unitType: 'شقة', floor: '',
    rooms: '', bathrooms: '', status: 'متاحة', rentPrice: '',
    city: '', region: '', ownerName: '', notes: '',
  });
  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  return (
    <div className="grid grid-cols-2 gap-4 py-2">
      <div>
        <Label>اسم العقار</Label>
        <Input value={form.propertyName} onChange={e => set('propertyName', e.target.value)} placeholder="اسم العقار" className="mt-1" />
      </div>
      <div>
        <Label>رقم الوحدة</Label>
        <Input value={form.unitNumber} onChange={e => set('unitNumber', e.target.value)} placeholder="رقم الوحدة" className="mt-1" />
      </div>
      <div>
        <Label>نوع الوحدة</Label>
        <Select value={form.unitType} onValueChange={v => set('unitType', v)}>
          <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
          <SelectContent>{UNIT_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div>
        <Label>الحالة</Label>
        <Select value={form.status} onValueChange={v => set('status', v)}>
          <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
          <SelectContent>{UNIT_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div>
        <Label>الطابق</Label>
        <Input value={form.floor} onChange={e => set('floor', e.target.value)} placeholder="الطابق" className="mt-1" />
      </div>
      <div>
        <Label>سعر الإيجار (ريال)</Label>
        <Input type="number" value={form.rentPrice} onChange={e => set('rentPrice', e.target.value)} placeholder="0" className="mt-1" />
      </div>
      <div>
        <Label>عدد الغرف</Label>
        <Input type="number" value={form.rooms} onChange={e => set('rooms', Number(e.target.value))} className="mt-1" />
      </div>
      <div>
        <Label>عدد الحمامات</Label>
        <Input type="number" value={form.bathrooms} onChange={e => set('bathrooms', Number(e.target.value))} className="mt-1" />
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
        <Label>اسم المالك</Label>
        <Input value={form.ownerName} onChange={e => set('ownerName', e.target.value)} placeholder="اسم المالك" className="mt-1" />
      </div>
      <div>
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

export default function Units() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const utils = trpc.useUtils();

  const { data, isLoading } = trpc.units.list.useQuery({
    search, status: statusFilter || undefined, page, limit: 20
  });

  const createMutation = trpc.units.create.useMutation({
    onSuccess: () => { utils.units.list.invalidate(); setShowAdd(false); toast.success('تم إضافة الوحدة بنجاح'); },
    onError: (e) => toast.error(e.message),
  });
  const updateMutation = trpc.units.update.useMutation({
    onSuccess: () => { utils.units.list.invalidate(); setEditItem(null); toast.success('تم تحديث الوحدة'); },
    onError: (e) => toast.error(e.message),
  });
  const deleteMutation = trpc.units.delete.useMutation({
    onSuccess: () => { utils.units.list.invalidate(); toast.success('تم حذف الوحدة'); },
    onError: (e) => toast.error(e.message),
  });

  const totalPages = Math.ceil((data?.total ?? 0) / 20);

  return (
    <div className="space-y-5 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">إدارة الوحدات</h1>
          <p className="text-sm text-muted-foreground mt-1">إجمالي {data?.total ?? 0} وحدة</p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold gap-2">
          <Plus className="h-4 w-4" /> إضافة وحدة
        </Button>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="البحث برقم الوحدة..." className="pr-9" />
        </div>
        <Select value={statusFilter} onValueChange={v => { setStatusFilter(v === 'all' ? '' : v); setPage(1); }}>
          <SelectTrigger className="w-40">
            <Filter className="h-4 w-4 ml-2" />
            <SelectValue placeholder="الحالة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">الكل</SelectItem>
            {UNIT_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Card className="shadow-sm">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">جاري التحميل...</div>
          ) : (data?.data ?? []).length === 0 ? (
            <div className="p-12 text-center">
              <Home className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">لا توجد وحدات مسجلة</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b">
                    <th className="text-right px-4 py-3 font-semibold text-slate-600">رقم الوحدة</th>
                    <th className="text-right px-4 py-3 font-semibold text-slate-600">العقار</th>
                    <th className="text-right px-4 py-3 font-semibold text-slate-600">النوع</th>
                    <th className="text-right px-4 py-3 font-semibold text-slate-600">الطابق</th>
                    <th className="text-right px-4 py-3 font-semibold text-slate-600">الموقع</th>
                    <th className="text-right px-4 py-3 font-semibold text-slate-600">الإيجار</th>
                    <th className="text-right px-4 py-3 font-semibold text-slate-600">الحالة</th>
                    <th className="text-right px-4 py-3 font-semibold text-slate-600">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {(data?.data ?? []).map((unit: any) => (
                    <tr key={unit.id} className="border-b hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3 font-bold text-slate-800">{unit.unitNumber ?? '-'}</td>
                      <td className="px-4 py-3 text-slate-700">{unit.propertyName ?? '-'}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs">{unit.unitType ?? '-'}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{unit.floor ?? '-'}</td>
                      <td className="px-4 py-3 text-xs text-slate-600">{unit.city ?? '-'} / {unit.region ?? '-'}</td>
                      <td className="px-4 py-3 font-semibold text-amber-600">
                        {unit.rentPrice ? `${Number(unit.rentPrice).toLocaleString('ar-SA')} ر.س` : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[unit.status ?? ''] ?? 'bg-slate-100 text-slate-600'}`}>
                          {unit.status ?? '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => setEditItem(unit)} className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-blue-50 text-blue-600 transition-colors">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button onClick={() => { if (confirm('هل أنت متأكد من حذف هذه الوحدة؟')) deleteMutation.mutate({ id: unit.id }); }} className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-500 transition-colors">
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
        <DialogContent className="max-w-2xl" dir="rtl">
          <DialogHeader><DialogTitle className="text-right">إضافة وحدة جديدة</DialogTitle></DialogHeader>
          <UnitForm onSave={(form: any) => createMutation.mutate(form)} onCancel={() => setShowAdd(false)} loading={createMutation.isPending} />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editItem} onOpenChange={() => setEditItem(null)}>
        <DialogContent className="max-w-2xl" dir="rtl">
          <DialogHeader><DialogTitle className="text-right">تعديل الوحدة</DialogTitle></DialogHeader>
          {editItem && (
            <UnitForm
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
