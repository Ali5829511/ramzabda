import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { CheckSquare, Plus, Search, Edit, Trash2, Clock, AlertTriangle, CheckCircle2, Circle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const CATEGORIES = ['متابعة_عقد','صيانة','تحصيل','تسويق','إداري','أخرى'];
const PRIORITIES = ['عاجل','عالي','متوسط','منخفض'];
const STATUSES = ['جديدة','قيد_التنفيذ','مكتملة','ملغاة'];

const STATUS_STYLES: Record<string, string> = {
  'جديدة': 'bg-blue-100 text-blue-700',
  'قيد_التنفيذ': 'bg-amber-100 text-amber-700',
  'مكتملة': 'bg-green-100 text-green-700',
  'ملغاة': 'bg-slate-100 text-slate-500',
};

const PRIORITY_STYLES: Record<string, string> = {
  'عاجل': 'bg-red-100 text-red-700',
  'عالي': 'bg-orange-100 text-orange-700',
  'متوسط': 'bg-amber-100 text-amber-700',
  'منخفض': 'bg-green-100 text-green-700',
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  'جديدة': <Circle className="h-4 w-4 text-blue-500" />,
  'قيد_التنفيذ': <Clock className="h-4 w-4 text-amber-500" />,
  'مكتملة': <CheckCircle2 className="h-4 w-4 text-green-500" />,
  'ملغاة': <Circle className="h-4 w-4 text-slate-400" />,
};

function TaskForm({ initial, onSave, onCancel, loading }: any) {
  const [form, setForm] = useState(initial ?? {
    title: '', description: '', category: 'أخرى', priority: 'متوسط',
    status: 'جديدة', dueDate: '', relatedType: '', notes: '',
  });
  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  return (
    <div className="grid grid-cols-2 gap-4 py-2 max-h-[70vh] overflow-y-auto">
      <div className="col-span-2">
        <Label>عنوان المهمة *</Label>
        <Input value={form.title} onChange={e => set('title', e.target.value)} placeholder="عنوان المهمة" className="mt-1" />
      </div>
      <div>
        <Label>التصنيف</Label>
        <Select value={form.category} onValueChange={v => set('category', v)}>
          <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
          <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c.replace(/_/g, ' ')}</SelectItem>)}</SelectContent>
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
          <SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div>
        <Label>تاريخ الاستحقاق</Label>
        <Input type="date" value={form.dueDate} onChange={e => set('dueDate', e.target.value)} className="mt-1" />
      </div>
      <div className="col-span-2">
        <Label>الوصف</Label>
        <Textarea value={form.description} onChange={e => set('description', e.target.value)} placeholder="تفاصيل المهمة" className="mt-1" rows={3} />
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

export default function Tasks() {
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [page, setPage] = useState(1);
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const utils = trpc.useUtils();

  const { data, isLoading } = trpc.tasks.list.useQuery({
    status: statusFilter || undefined,
    priority: priorityFilter || undefined,
    page, limit: 20,
  });

  const createMutation = trpc.tasks.create.useMutation({
    onSuccess: () => { utils.tasks.list.invalidate(); setShowAdd(false); toast.success('تم إضافة المهمة'); },
    onError: (e) => toast.error(e.message),
  });
  const updateMutation = trpc.tasks.update.useMutation({
    onSuccess: () => { utils.tasks.list.invalidate(); setEditItem(null); toast.success('تم تحديث المهمة'); },
    onError: (e) => toast.error(e.message),
  });
  const deleteMutation = trpc.tasks.delete.useMutation({
    onSuccess: () => { utils.tasks.list.invalidate(); toast.success('تم حذف المهمة'); },
    onError: (e) => toast.error(e.message),
  });

  const tasks = data?.data ?? [];
  const totalPages = Math.ceil((data?.total ?? 0) / 20);

  const stats = {
    total: data?.total ?? 0,
    new: tasks.filter(t => t.status === 'جديدة').length,
    inProgress: tasks.filter(t => t.status === 'قيد_التنفيذ').length,
    done: tasks.filter(t => t.status === 'مكتملة').length,
  };

  const quickComplete = (task: any) => {
    updateMutation.mutate({ id: task.id, status: 'مكتملة' });
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <CheckSquare className="h-6 w-6 text-amber-500" /> إدارة المهام
          </h1>
          <p className="text-sm text-muted-foreground mt-1">إجمالي {data?.total ?? 0} مهمة</p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold gap-2">
          <Plus className="h-4 w-4" /> مهمة جديدة
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'إجمالي المهام', value: stats.total, color: 'text-slate-700', bg: 'bg-slate-50' },
          { label: 'جديدة', value: stats.new, color: 'text-blue-700', bg: 'bg-blue-50' },
          { label: 'قيد التنفيذ', value: stats.inProgress, color: 'text-amber-700', bg: 'bg-amber-50' },
          { label: 'مكتملة', value: stats.done, color: 'text-green-700', bg: 'bg-green-50' },
        ].map(s => (
          <Card key={s.label} className={`${s.bg} border-0`}>
            <CardContent className="p-4 text-center">
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <Select value={statusFilter} onValueChange={v => { setStatusFilter(v === 'all' ? '' : v); setPage(1); }}>
          <SelectTrigger className="w-40"><SelectValue placeholder="الحالة" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع الحالات</SelectItem>
            {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={v => { setPriorityFilter(v === 'all' ? '' : v); setPage(1); }}>
          <SelectTrigger className="w-40"><SelectValue placeholder="الأولوية" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع الأولويات</SelectItem>
            {PRIORITIES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Tasks List */}
      {isLoading ? (
        <div className="text-center py-10 text-muted-foreground">جاري التحميل...</div>
      ) : tasks.length === 0 ? (
        <Card><CardContent className="py-16 text-center text-muted-foreground">
          <CheckSquare className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>لا توجد مهام</p>
        </CardContent></Card>
      ) : (
        <div className="space-y-2">
          {tasks.map(task => (
            <Card key={task.id} className={`border transition-all hover:shadow-md ${task.status === 'مكتملة' ? 'opacity-60' : ''}`}>
              <CardContent className="p-4 flex items-center gap-4">
                <button onClick={() => task.status !== 'مكتملة' && quickComplete(task)} className="flex-shrink-0 hover:scale-110 transition-transform">
                  {STATUS_ICONS[task.status ?? 'جديدة']}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`font-semibold text-sm ${task.status === 'مكتملة' ? 'line-through text-muted-foreground' : 'text-slate-900'}`}>
                      {task.title}
                    </span>
                    <Badge className={`text-xs ${PRIORITY_STYLES[task.priority ?? 'متوسط']}`}>{task.priority}</Badge>
                    <Badge className={`text-xs ${STATUS_STYLES[task.status ?? 'جديدة']}`}>{task.status}</Badge>
                    {task.category && <Badge variant="outline" className="text-xs">{task.category.replace(/_/g, ' ')}</Badge>}
                  </div>
                  {task.description && <p className="text-xs text-muted-foreground mt-1 truncate">{task.description}</p>}
                  {task.dueDate && (
                    <div className="flex items-center gap-1 mt-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        الاستحقاق: {new Date(task.dueDate).toLocaleDateString('ar-SA')}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Button size="sm" variant="ghost" onClick={() => setEditItem(task)} className="h-8 w-8 p-0">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => { if (confirm('هل تريد حذف هذه المهمة؟')) deleteMutation.mutate({ id: task.id }); }} className="h-8 w-8 p-0 text-red-500 hover:text-red-700">
                    <Trash2 className="h-4 w-4" />
                  </Button>
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
        <DialogContent className="max-w-xl" dir="rtl">
          <DialogHeader><DialogTitle>إضافة مهمة جديدة</DialogTitle></DialogHeader>
          <TaskForm
            onSave={(form: any) => {
              const data: any = { ...form };
              if (!data.dueDate) delete data.dueDate;
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
          <DialogHeader><DialogTitle>تعديل المهمة</DialogTitle></DialogHeader>
          {editItem && (
            <TaskForm
              initial={editItem}
              onSave={(form: any) => {
                updateMutation.mutate({ id: editItem.id, status: form.status, title: form.title, priority: form.priority });
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
