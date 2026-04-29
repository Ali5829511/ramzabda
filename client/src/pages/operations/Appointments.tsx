import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { CalendarDays, Plus, Edit, Trash2, Clock, CheckCircle2, XCircle, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const TYPES = ['معاينة','توقيع_عقد','تسليم_وحدة','استلام_وحدة','صيانة','اجتماع','أخرى'];
const STATUSES = ['مجدول','مؤكد','مكتمل','ملغي','لم_يحضر'];

const STATUS_STYLES: Record<string, string> = {
  'مجدول': 'bg-blue-100 text-blue-700',
  'مؤكد': 'bg-purple-100 text-purple-700',
  'مكتمل': 'bg-green-100 text-green-700',
  'ملغي': 'bg-slate-100 text-slate-500',
  'لم_يحضر': 'bg-red-100 text-red-700',
};

const TYPE_COLORS: Record<string, string> = {
  'معاينة': 'bg-sky-100 text-sky-700',
  'توقيع_عقد': 'bg-violet-100 text-violet-700',
  'تسليم_وحدة': 'bg-teal-100 text-teal-700',
  'استلام_وحدة': 'bg-emerald-100 text-emerald-700',
  'صيانة': 'bg-orange-100 text-orange-700',
  'اجتماع': 'bg-indigo-100 text-indigo-700',
  'أخرى': 'bg-gray-100 text-gray-700',
};

function AppointmentForm({ initial, onSave, onCancel, loading }: any) {
  const [form, setForm] = useState(initial ?? {
    title: '', type: 'معاينة', clientName: '', clientPhone: '', clientEmail: '',
    appointmentDate: '', appointmentTime: '', duration: 60, status: 'مجدول', notes: '',
  });
  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  return (
    <div className="grid grid-cols-2 gap-4 py-2 max-h-[70vh] overflow-y-auto">
      <div className="col-span-2">
        <Label>عنوان الموعد *</Label>
        <Input value={form.title} onChange={e => set('title', e.target.value)} placeholder="مثال: معاينة شقة 3 في برج الياسمين" className="mt-1" />
      </div>
      <div>
        <Label>النوع</Label>
        <Select value={form.type} onValueChange={v => set('type', v)}>
          <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
          <SelectContent>{TYPES.map(t => <SelectItem key={t} value={t}>{t.replace(/_/g, ' ')}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div>
        <Label>الحالة</Label>
        <Select value={form.status} onValueChange={v => set('status', v)}>
          <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
          <SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s}>{s.replace(/_/g, ' ')}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div>
        <Label>اسم العميل</Label>
        <Input value={form.clientName} onChange={e => set('clientName', e.target.value)} placeholder="الاسم الكامل" className="mt-1" />
      </div>
      <div>
        <Label>هاتف العميل</Label>
        <Input value={form.clientPhone} onChange={e => set('clientPhone', e.target.value)} placeholder="05xxxxxxxx" className="mt-1" />
      </div>
      <div>
        <Label>تاريخ الموعد *</Label>
        <Input type="date" value={form.appointmentDate} onChange={e => set('appointmentDate', e.target.value)} className="mt-1" />
      </div>
      <div>
        <Label>وقت الموعد</Label>
        <Input type="time" value={form.appointmentTime} onChange={e => set('appointmentTime', e.target.value)} className="mt-1" />
      </div>
      <div>
        <Label>المدة (دقائق)</Label>
        <Input type="number" value={form.duration} onChange={e => set('duration', parseInt(e.target.value))} className="mt-1" min={15} max={480} step={15} />
      </div>
      <div>
        <Label>البريد الإلكتروني</Label>
        <Input type="email" value={form.clientEmail} onChange={e => set('clientEmail', e.target.value)} placeholder="email@example.com" className="mt-1" />
      </div>
      <div className="col-span-2">
        <Label>ملاحظات</Label>
        <Textarea value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="أي تفاصيل إضافية" className="mt-1" rows={2} />
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

export default function Appointments() {
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const utils = trpc.useUtils();

  const { data, isLoading } = trpc.appointments.list.useQuery({
    status: statusFilter || undefined, page, limit: 20,
  });

  const createMutation = trpc.appointments.create.useMutation({
    onSuccess: () => { utils.appointments.list.invalidate(); setShowAdd(false); toast.success('تم إضافة الموعد'); },
    onError: (e) => toast.error(e.message),
  });
  const updateMutation = trpc.appointments.update.useMutation({
    onSuccess: () => { utils.appointments.list.invalidate(); setEditItem(null); toast.success('تم تحديث الموعد'); },
    onError: (e) => toast.error(e.message),
  });
  const deleteMutation = trpc.appointments.delete.useMutation({
    onSuccess: () => { utils.appointments.list.invalidate(); toast.success('تم حذف الموعد'); },
    onError: (e) => toast.error(e.message),
  });

  const appointments = data?.data ?? [];
  const totalPages = Math.ceil((data?.total ?? 0) / 20);

  // Group appointments by date
  const grouped = appointments.reduce((acc: Record<string, any[]>, appt) => {
    const dateKey = appt.appointmentDate
      ? new Date(appt.appointmentDate).toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
      : 'غير محدد';
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(appt);
    return acc;
  }, {});

  const stats = {
    total: data?.total ?? 0,
    scheduled: appointments.filter(a => a.status === 'مجدول').length,
    confirmed: appointments.filter(a => a.status === 'مؤكد').length,
    done: appointments.filter(a => a.status === 'مكتمل').length,
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <CalendarDays className="h-6 w-6 text-amber-500" /> المواعيد والتقويم
          </h1>
          <p className="text-sm text-muted-foreground mt-1">إجمالي {data?.total ?? 0} موعد</p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold gap-2">
          <Plus className="h-4 w-4" /> موعد جديد
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'إجمالي المواعيد', value: stats.total, color: 'text-slate-700', bg: 'bg-slate-50' },
          { label: 'مجدول', value: stats.scheduled, color: 'text-blue-700', bg: 'bg-blue-50' },
          { label: 'مؤكد', value: stats.confirmed, color: 'text-purple-700', bg: 'bg-purple-50' },
          { label: 'مكتمل', value: stats.done, color: 'text-green-700', bg: 'bg-green-50' },
        ].map(s => (
          <Card key={s.label} className={`${s.bg} border-0`}>
            <CardContent className="p-4 text-center">
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-3">
        <Select value={statusFilter} onValueChange={v => { setStatusFilter(v === 'all' ? '' : v); setPage(1); }}>
          <SelectTrigger className="w-44"><SelectValue placeholder="تصفية بالحالة" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع المواعيد</SelectItem>
            {STATUSES.map(s => <SelectItem key={s} value={s}>{s.replace(/_/g, ' ')}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Appointments */}
      {isLoading ? (
        <div className="text-center py-10 text-muted-foreground">جاري التحميل...</div>
      ) : appointments.length === 0 ? (
        <Card><CardContent className="py-16 text-center text-muted-foreground">
          <Calendar className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>لا توجد مواعيد</p>
        </CardContent></Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([date, appts]) => (
            <div key={date}>
              <div className="flex items-center gap-2 mb-3">
                <div className="h-px flex-1 bg-border" />
                <span className="text-sm font-semibold text-slate-600 px-2">{date}</span>
                <div className="h-px flex-1 bg-border" />
              </div>
              <div className="space-y-2">
                {appts.map(appt => (
                  <Card key={appt.id} className="border hover:shadow-md transition-all">
                    <CardContent className="p-4 flex items-start gap-4">
                      <div className="flex-shrink-0 text-center w-16">
                        <div className="text-lg font-bold text-slate-900">{appt.appointmentTime || '--:--'}</div>
                        <div className="text-xs text-muted-foreground">{appt.duration} د</div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-slate-900">{appt.title}</span>
                          <Badge className={`text-xs ${TYPE_COLORS[appt.type ?? 'أخرى']}`}>{appt.type?.replace(/_/g, ' ')}</Badge>
                          <Badge className={`text-xs ${STATUS_STYLES[appt.status ?? 'مجدول']}`}>{appt.status?.replace(/_/g, ' ')}</Badge>
                        </div>
                        {appt.clientName && (
                          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                            <span>{appt.clientName}</span>
                            {appt.clientPhone && <span dir="ltr">{appt.clientPhone}</span>}
                          </div>
                        )}
                        {appt.notes && <p className="text-xs text-muted-foreground mt-1">{appt.notes}</p>}
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        {appt.status !== 'مكتمل' && (
                          <Button size="sm" variant="ghost" onClick={() => updateMutation.mutate({ id: appt.id, status: 'مكتمل' })} className="h-8 w-8 p-0 text-green-600">
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" onClick={() => setEditItem(appt)} className="h-8 w-8 p-0">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => { if (confirm('هل تريد حذف هذا الموعد؟')) deleteMutation.mutate({ id: appt.id }); }} className="h-8 w-8 p-0 text-red-500">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
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
          <DialogHeader><DialogTitle>إضافة موعد جديد</DialogTitle></DialogHeader>
          <AppointmentForm
            onSave={(form: any) => {
              if (!form.appointmentDate) { toast.error('يرجى تحديد تاريخ الموعد'); return; }
              createMutation.mutate(form);
            }}
            onCancel={() => setShowAdd(false)}
            loading={createMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editItem} onOpenChange={v => !v && setEditItem(null)}>
        <DialogContent className="max-w-xl" dir="rtl">
          <DialogHeader><DialogTitle>تعديل الموعد</DialogTitle></DialogHeader>
          {editItem && (
            <AppointmentForm
              initial={{ ...editItem, appointmentDate: editItem.appointmentDate ? new Date(editItem.appointmentDate).toISOString().slice(0, 10) : '' }}
              onSave={(form: any) => {
                updateMutation.mutate({ id: editItem.id, status: form.status, notes: form.notes });
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
