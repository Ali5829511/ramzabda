import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Plus, Search, Wrench, Phone, Star, Edit, Trash2, CheckCircle, XCircle } from "lucide-react";

const specialties = ['كهرباء','سباكة','تكييف','نجارة','دهان','نظافة','أمن','عام'];
const specialtyColors: Record<string, string> = {
  'كهرباء': 'bg-yellow-100 text-yellow-700',
  'سباكة': 'bg-blue-100 text-blue-700',
  'تكييف': 'bg-cyan-100 text-cyan-700',
  'نجارة': 'bg-orange-100 text-orange-700',
  'دهان': 'bg-purple-100 text-purple-700',
  'نظافة': 'bg-green-100 text-green-700',
  'أمن': 'bg-red-100 text-red-700',
  'عام': 'bg-gray-100 text-gray-700',
};

function TechnicianForm({ tech, onSuccess }: { tech?: any; onSuccess: () => void }) {
  const [form, setForm] = useState({
    name: tech?.name || "",
    phone: tech?.phone || "",
    email: tech?.email || "",
    specialty: tech?.specialty || "عام",
    isAvailable: tech?.isAvailable !== undefined ? Boolean(tech.isAvailable) : true,
    notes: tech?.notes || "",
  });

  const createMutation = trpc.technicians.create.useMutation({
    onSuccess: () => { toast.success("تم إضافة الفني بنجاح"); onSuccess(); },
    onError: (e) => toast.error(e.message),
  });
  const updateMutation = trpc.technicians.update.useMutation({
    onSuccess: () => { toast.success("تم تحديث بيانات الفني"); onSuccess(); },
    onError: (e) => toast.error(e.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = { ...form, isAvailable: form.isAvailable ? 1 : 0 };
    if (tech) {
      updateMutation.mutate({ id: tech.id, ...data });
    } else {
      createMutation.mutate(data as any);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>اسم الفني *</Label>
          <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
        </div>
        <div>
          <Label>رقم الجوال</Label>
          <Input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
        </div>
        <div>
          <Label>البريد الإلكتروني</Label>
          <Input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
        </div>
        <div>
          <Label>التخصص</Label>
          <Select value={form.specialty} onValueChange={v => setForm(p => ({ ...p, specialty: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {specialties.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
        <Switch
          checked={form.isAvailable}
          onCheckedChange={v => setForm(p => ({ ...p, isAvailable: v }))}
        />
        <div>
          <p className="font-medium text-sm">متاح للعمل</p>
          <p className="text-xs text-muted-foreground">يظهر في قائمة الفنيين المتاحين لطلبات الصيانة</p>
        </div>
      </div>
      <div>
        <Label>ملاحظات</Label>
        <Textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={2} />
      </div>
      <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700" disabled={createMutation.isPending || updateMutation.isPending}>
        {tech ? "تحديث البيانات" : "إضافة الفني"}
      </Button>
    </form>
  );
}

export default function Technicians() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [editTech, setEditTech] = useState<any>(null);

  const { data, refetch } = trpc.technicians.list.useQuery({ search, page, limit: 15 });
  const deleteMutation = trpc.technicians.delete.useMutation({
    onSuccess: () => { toast.success("تم حذف الفني"); refetch(); },
    onError: (e) => toast.error(e.message),
  });

  const techs = data?.data || [];
  const total = data?.total || 0;
  const available = techs.filter((t: any) => t.isAvailable).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">بوابة الفنيين</h1>
          <p className="text-muted-foreground mt-1">إدارة الفنيين وتخصصاتهم وتوافرهم لطلبات الصيانة</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-orange-600 hover:bg-orange-700 gap-2" onClick={() => setEditTech(null)}>
              <Plus className="h-4 w-4" />
              إضافة فني
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg" dir="rtl">
            <DialogHeader>
              <DialogTitle>{editTech ? "تعديل بيانات الفني" : "إضافة فني جديد"}</DialogTitle>
            </DialogHeader>
            <TechnicianForm tech={editTech} onSuccess={() => { setOpen(false); refetch(); }} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4 flex items-center gap-3">
            <Wrench className="h-8 w-8 text-orange-600" />
            <div>
              <p className="text-2xl font-bold text-orange-700">{total}</p>
              <p className="text-sm text-muted-foreground">إجمالي الفنيين</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold text-green-700">{available}</p>
              <p className="text-sm text-muted-foreground">متاحون</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4 flex items-center gap-3">
            <XCircle className="h-8 w-8 text-red-600" />
            <div>
              <p className="text-2xl font-bold text-red-700">{total - available}</p>
              <p className="text-sm text-muted-foreground">غير متاحين</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4 flex items-center gap-3">
            <Star className="h-8 w-8 text-yellow-600" />
            <div>
              <p className="text-2xl font-bold text-yellow-700">
                {techs.length > 0 ? (techs.reduce((s: number, t: any) => s + Number(t.rating || 5), 0) / techs.length).toFixed(1) : "5.0"}
              </p>
              <p className="text-sm text-muted-foreground">متوسط التقييم</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="البحث باسم الفني..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="pr-10"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-right p-3 font-semibold">اسم الفني</th>
                  <th className="text-right p-3 font-semibold">التخصص</th>
                  <th className="text-right p-3 font-semibold">الجوال</th>
                  <th className="text-right p-3 font-semibold">التقييم</th>
                  <th className="text-right p-3 font-semibold">المهام المكتملة</th>
                  <th className="text-right p-3 font-semibold">الحالة</th>
                  <th className="text-right p-3 font-semibold">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {techs.map((tech: any) => (
                  <tr key={tech.id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="p-3 font-medium">{tech.name}</td>
                    <td className="p-3">
                      <Badge className={specialtyColors[tech.specialty] || 'bg-gray-100 text-gray-700'}>
                        {tech.specialty}
                      </Badge>
                    </td>
                    <td className="p-3">
                      {tech.phone ? (
                        <a href={`tel:${tech.phone}`} className="flex items-center gap-1 text-blue-600 hover:underline">
                          <Phone className="h-3 w-3" />
                          {tech.phone}
                        </a>
                      ) : "-"}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                        <span>{Number(tech.rating || 5).toFixed(1)}</span>
                      </div>
                    </td>
                    <td className="p-3 text-center">{tech.completedJobs || 0}</td>
                    <td className="p-3">
                      {tech.isAvailable ? (
                        <Badge className="bg-green-100 text-green-700">متاح</Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-700">غير متاح</Badge>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => { setEditTech(tech); setOpen(true); }}>
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => {
                            if (confirm("هل أنت متأكد من حذف هذا الفني؟")) {
                              deleteMutation.mutate({ id: tech.id });
                            }
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {techs.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center p-8 text-muted-foreground">لا يوجد فنيون مسجلون</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {total > 15 && (
            <div className="flex justify-between items-center p-3 border-t">
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>السابق</Button>
              <span className="text-sm text-muted-foreground">صفحة {page} من {Math.ceil(total / 15)}</span>
              <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page * 15 >= total}>التالي</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
