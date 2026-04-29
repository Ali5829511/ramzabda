import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Receipt, Plus, Edit, Trash2, TrendingDown, DollarSign, Building2, Tag } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const PAYMENT_METHODS = ['نقدي','تحويل_بنكي','شيك','بطاقة'];

function ExpenseForm({ initial, onSave, onCancel, loading, categories }: any) {
  const [form, setForm] = useState(initial ?? {
    title: '', categoryId: '', propertyId: '', amount: '', expenseDate: new Date().toISOString().slice(0, 10),
    paymentMethod: 'نقدي', vendor: '', invoiceNumber: '', description: '',
  });
  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  return (
    <div className="grid grid-cols-2 gap-4 py-2 max-h-[70vh] overflow-y-auto">
      <div className="col-span-2">
        <Label>عنوان المصروف *</Label>
        <Input value={form.title} onChange={e => set('title', e.target.value)} placeholder="مثال: إصلاح مضخة المياه" className="mt-1" />
      </div>
      <div>
        <Label>الفئة</Label>
        <Select value={String(form.categoryId)} onValueChange={v => set('categoryId', v ? parseInt(v) : undefined)}>
          <SelectTrigger className="mt-1"><SelectValue placeholder="اختر فئة" /></SelectTrigger>
          <SelectContent>
            {categories?.map((c: any) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>المبلغ (ريال) *</Label>
        <Input type="number" value={form.amount} onChange={e => set('amount', e.target.value)} placeholder="0.00" className="mt-1" min={0} />
      </div>
      <div>
        <Label>تاريخ المصروف *</Label>
        <Input type="date" value={form.expenseDate} onChange={e => set('expenseDate', e.target.value)} className="mt-1" />
      </div>
      <div>
        <Label>طريقة الدفع</Label>
        <Select value={form.paymentMethod} onValueChange={v => set('paymentMethod', v)}>
          <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
          <SelectContent>{PAYMENT_METHODS.map(m => <SelectItem key={m} value={m}>{m.replace(/_/g, ' ')}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div>
        <Label>اسم المورد</Label>
        <Input value={form.vendor} onChange={e => set('vendor', e.target.value)} placeholder="شركة أو شخص" className="mt-1" />
      </div>
      <div>
        <Label>رقم الفاتورة</Label>
        <Input value={form.invoiceNumber} onChange={e => set('invoiceNumber', e.target.value)} placeholder="رقم الفاتورة" className="mt-1" />
      </div>
      <div className="col-span-2">
        <Label>الوصف</Label>
        <Textarea value={form.description} onChange={e => set('description', e.target.value)} placeholder="تفاصيل إضافية" className="mt-1" rows={2} />
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

export default function Expenses() {
  const [page, setPage] = useState(1);
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const utils = trpc.useUtils();

  const { data, isLoading } = trpc.expenses.list.useQuery({ page, limit: 20 });
  const { data: categoriesData } = trpc.expenses.categories.useQuery();

  const createMutation = trpc.expenses.create.useMutation({
    onSuccess: () => { utils.expenses.list.invalidate(); setShowAdd(false); toast.success('تم إضافة المصروف'); },
    onError: (e) => toast.error(e.message),
  });
  const updateMutation = trpc.expenses.update.useMutation({
    onSuccess: () => { utils.expenses.list.invalidate(); setEditItem(null); toast.success('تم تحديث المصروف'); },
    onError: (e) => toast.error(e.message),
  });
  const deleteMutation = trpc.expenses.delete.useMutation({
    onSuccess: () => { utils.expenses.list.invalidate(); toast.success('تم حذف المصروف'); },
    onError: (e) => toast.error(e.message),
  });

  const expenses = data?.data ?? [];
  const totalPages = Math.ceil((data?.total ?? 0) / 20);
  const totalAmount = expenses.reduce((sum, e) => sum + parseFloat(String(e.amount) || '0'), 0);

  // Group by category
  const byCategory = expenses.reduce((acc: Record<string, number>, e) => {
    const cat = categoriesData?.find((c: any) => c.id === e.categoryId)?.name || 'غير مصنف';
    acc[cat] = (acc[cat] || 0) + parseFloat(String(e.amount) || '0');
    return acc;
  }, {});

  return (
    <div className="space-y-5 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <TrendingDown className="h-6 w-6 text-amber-500" /> إدارة المصروفات
          </h1>
          <p className="text-sm text-muted-foreground mt-1">إجمالي {data?.total ?? 0} مصروف</p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold gap-2">
          <Plus className="h-4 w-4" /> مصروف جديد
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-red-50 border-0 col-span-2 md:col-span-2">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-red-700">{totalAmount.toLocaleString('ar-SA')} ريال</div>
                <div className="text-sm text-muted-foreground">إجمالي المصروفات المعروضة</div>
              </div>
            </div>
          </CardContent>
        </Card>
        {Object.entries(byCategory).slice(0, 2).map(([cat, amount]) => (
          <Card key={cat} className="bg-slate-50 border-0">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-slate-500" />
                <span className="text-sm font-medium text-slate-700 truncate">{cat}</span>
              </div>
              <div className="text-xl font-bold text-slate-800 mt-1">{(amount as number).toLocaleString('ar-SA')}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Expenses List */}
      {isLoading ? (
        <div className="text-center py-10 text-muted-foreground">جاري التحميل...</div>
      ) : expenses.length === 0 ? (
        <Card><CardContent className="py-16 text-center text-muted-foreground">
          <Receipt className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>لا توجد مصروفات</p>
        </CardContent></Card>
      ) : (
        <div className="space-y-2">
          {expenses.map(expense => {
            const category = categoriesData?.find((c: any) => c.id === expense.categoryId);
            return (
              <Card key={expense.id} className="border hover:shadow-md transition-all">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="flex-shrink-0 p-2 bg-red-50 rounded-lg">
                    <Receipt className="h-5 w-5 text-red-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-slate-900">{expense.title}</span>
                      {category && (
                        <Badge variant="outline" className="text-xs" style={{ borderColor: category.color, color: category.color }}>
                          {category.name}
                        </Badge>
                      )}
                      {expense.paymentMethod && <Badge variant="outline" className="text-xs">{expense.paymentMethod.replace(/_/g, ' ')}</Badge>}
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      {expense.vendor && <span>المورد: {expense.vendor}</span>}
                      {expense.expenseDate && <span>{new Date(expense.expenseDate).toLocaleDateString('ar-SA')}</span>}
                      {expense.invoiceNumber && <span>ف: {expense.invoiceNumber}</span>}
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-left">
                    <div className="text-lg font-bold text-red-600">
                      {parseFloat(String(expense.amount)).toLocaleString('ar-SA')} ريال
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button size="sm" variant="ghost" onClick={() => setEditItem(expense)} className="h-8 w-8 p-0">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => { if (confirm('هل تريد حذف هذا المصروف؟')) deleteMutation.mutate({ id: expense.id }); }} className="h-8 w-8 p-0 text-red-500">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
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
        <DialogContent className="max-w-xl" dir="rtl">
          <DialogHeader><DialogTitle>إضافة مصروف جديد</DialogTitle></DialogHeader>
          <ExpenseForm
            categories={categoriesData}
            onSave={(form: any) => {
              if (!form.title || !form.amount) { toast.error('يرجى تعبئة الحقول المطلوبة'); return; }
              const data: any = { ...form };
              if (data.categoryId && typeof data.categoryId === 'string') data.categoryId = parseInt(data.categoryId);
              createMutation.mutate(data);
            }}
            onCancel={() => setShowAdd(false)}
            loading={createMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editItem} onOpenChange={v => !v && setEditItem(null)}>
        <DialogContent className="max-w-xl" dir="rtl">
          <DialogHeader><DialogTitle>تعديل المصروف</DialogTitle></DialogHeader>
          {editItem && (
            <ExpenseForm
              initial={{ ...editItem, expenseDate: editItem.expenseDate ? new Date(editItem.expenseDate).toISOString().slice(0, 10) : '' }}
              categories={categoriesData}
              onSave={(form: any) => {
                updateMutation.mutate({ id: editItem.id, title: form.title, amount: String(form.amount), description: form.description });
              }}
              onCancel={() => setEditItem(null)}
              loading={updateMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
