import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Search, Briefcase, Phone, Mail, Award, Edit, Trash2, TrendingUp } from "lucide-react";

function BrokerForm({ broker, onSuccess }: { broker?: any; onSuccess: () => void }) {
  const [form, setForm] = useState({
    name: broker?.name || "",
    licenseNumber: broker?.licenseNumber || "",
    phone: broker?.phone || "",
    email: broker?.email || "",
    company: broker?.company || "",
    notes: broker?.notes || "",
  });

  const createMutation = trpc.brokers.create.useMutation({
    onSuccess: () => { toast.success("تم إضافة الوسيط بنجاح"); onSuccess(); },
    onError: (e) => toast.error(e.message),
  });
  const updateMutation = trpc.brokers.update.useMutation({
    onSuccess: () => { toast.success("تم تحديث بيانات الوسيط"); onSuccess(); },
    onError: (e) => toast.error(e.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (broker) {
      updateMutation.mutate({ id: broker.id, ...form });
    } else {
      createMutation.mutate(form as any);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>اسم الوسيط *</Label>
          <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
        </div>
        <div>
          <Label>رقم الترخيص</Label>
          <Input value={form.licenseNumber} onChange={e => setForm(p => ({ ...p, licenseNumber: e.target.value }))} placeholder="رقم ترخيص فال" />
        </div>
        <div>
          <Label>رقم الجوال</Label>
          <Input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
        </div>
        <div>
          <Label>البريد الإلكتروني</Label>
          <Input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
        </div>
        <div className="col-span-2">
          <Label>اسم الشركة / المكتب</Label>
          <Input value={form.company} onChange={e => setForm(p => ({ ...p, company: e.target.value }))} />
        </div>
      </div>
      <div>
        <Label>ملاحظات</Label>
        <Textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={2} />
      </div>
      <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={createMutation.isPending || updateMutation.isPending}>
        {broker ? "تحديث البيانات" : "إضافة الوسيط"}
      </Button>
    </form>
  );
}

export default function Brokers() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [editBroker, setEditBroker] = useState<any>(null);

  const { data, refetch } = trpc.brokers.list.useQuery({ search, page, limit: 15 });
  const deleteMutation = trpc.brokers.delete.useMutation({
    onSuccess: () => { toast.success("تم حذف الوسيط"); refetch(); },
    onError: (e) => toast.error(e.message),
  });

  const brokers = data?.data || [];
  const total = data?.total || 0;
  const totalContracts = brokers.reduce((s: number, b: any) => s + (b.totalContracts || 0), 0);
  const totalCommissions = brokers.reduce((s: number, b: any) => s + Number(b.totalCommissions || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">بوابة الوسطاء العقاريين</h1>
          <p className="text-muted-foreground mt-1">إدارة الوسطاء العقاريين وتتبع عمولاتهم وعقودهم</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-700 gap-2" onClick={() => setEditBroker(null)}>
              <Plus className="h-4 w-4" />
              إضافة وسيط
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg" dir="rtl">
            <DialogHeader>
              <DialogTitle>{editBroker ? "تعديل بيانات الوسيط" : "إضافة وسيط جديد"}</DialogTitle>
            </DialogHeader>
            <BrokerForm broker={editBroker} onSuccess={() => { setOpen(false); refetch(); }} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="p-4 flex items-center gap-3">
            <Briefcase className="h-8 w-8 text-purple-600" />
            <div>
              <p className="text-2xl font-bold text-purple-700">{total}</p>
              <p className="text-sm text-muted-foreground">إجمالي الوسطاء</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4 flex items-center gap-3">
            <Award className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-2xl font-bold text-blue-700">{totalContracts}</p>
              <p className="text-sm text-muted-foreground">إجمالي العقود</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4 flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold text-green-700">{totalCommissions.toLocaleString('ar-SA')}</p>
              <p className="text-sm text-muted-foreground">إجمالي العمولات (ريال)</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="البحث باسم الوسيط أو الشركة..."
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
                  <th className="text-right p-3 font-semibold">اسم الوسيط</th>
                  <th className="text-right p-3 font-semibold">رقم الترخيص</th>
                  <th className="text-right p-3 font-semibold">الشركة / المكتب</th>
                  <th className="text-right p-3 font-semibold">الجوال</th>
                  <th className="text-right p-3 font-semibold">عدد العقود</th>
                  <th className="text-right p-3 font-semibold">إجمالي العمولات</th>
                  <th className="text-right p-3 font-semibold">الحالة</th>
                  <th className="text-right p-3 font-semibold">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {brokers.map((broker: any) => (
                  <tr key={broker.id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="p-3 font-medium">{broker.name}</td>
                    <td className="p-3 text-muted-foreground">{broker.licenseNumber || "-"}</td>
                    <td className="p-3 text-muted-foreground">{broker.company || "-"}</td>
                    <td className="p-3">
                      {broker.phone ? (
                        <a href={`tel:${broker.phone}`} className="flex items-center gap-1 text-blue-600 hover:underline">
                          <Phone className="h-3 w-3" />
                          {broker.phone}
                        </a>
                      ) : "-"}
                    </td>
                    <td className="p-3 text-center font-medium">{broker.totalContracts || 0}</td>
                    <td className="p-3 font-medium text-green-700">
                      {Number(broker.totalCommissions || 0).toLocaleString('ar-SA')} ريال
                    </td>
                    <td className="p-3">
                      {broker.isActive ? (
                        <Badge className="bg-green-100 text-green-700">نشط</Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-700">غير نشط</Badge>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => { setEditBroker(broker); setOpen(true); }}>
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => {
                            if (confirm("هل أنت متأكد من حذف هذا الوسيط؟")) {
                              deleteMutation.mutate({ id: broker.id });
                            }
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {brokers.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center p-8 text-muted-foreground">لا يوجد وسطاء مسجلون</td>
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
