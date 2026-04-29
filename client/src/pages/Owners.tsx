import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Plus, Search, Users, Building2, Phone, Mail, Key, Edit, Trash2, FileText, CreditCard, X } from "lucide-react";

function OwnerForm({ owner, onSuccess }: { owner?: any; onSuccess: () => void }) {
  const [form, setForm] = useState({
    name: owner?.name || "",
    identityNumber: owner?.identityNumber || "",
    phone: owner?.phone || "",
    email: owner?.email || "",
    portalAccess: owner?.portalAccess ? true : false,
    portalPin: owner?.portalPin || "",
    notes: owner?.notes || "",
  });

  const createMutation = trpc.owners.create.useMutation({
    onSuccess: () => { toast.success("تم إضافة المالك بنجاح"); onSuccess(); },
    onError: (e) => toast.error(e.message),
  });
  const updateMutation = trpc.owners.update.useMutation({
    onSuccess: () => { toast.success("تم تحديث بيانات المالك"); onSuccess(); },
    onError: (e) => toast.error(e.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = { ...form, portalAccess: form.portalAccess ? 1 : 0 };
    if (owner) {
      updateMutation.mutate({ id: owner.id, ...data });
    } else {
      createMutation.mutate(data as any);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>اسم المالك *</Label>
          <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
        </div>
        <div>
          <Label>رقم الهوية</Label>
          <Input value={form.identityNumber} onChange={e => setForm(p => ({ ...p, identityNumber: e.target.value }))} />
        </div>
        <div>
          <Label>رقم الجوال</Label>
          <Input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
        </div>
        <div>
          <Label>البريد الإلكتروني</Label>
          <Input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
        </div>
      </div>
      <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
        <Switch
          checked={form.portalAccess}
          onCheckedChange={v => setForm(p => ({ ...p, portalAccess: v }))}
        />
        <div>
          <p className="font-medium text-sm">تفعيل بوابة المالك</p>
          <p className="text-xs text-muted-foreground">يتيح للمالك الاطلاع على عقاراته وعقوده</p>
        </div>
      </div>
      {form.portalAccess && (
        <div>
          <Label>رمز PIN للبوابة</Label>
          <Input value={form.portalPin} onChange={e => setForm(p => ({ ...p, portalPin: e.target.value }))} maxLength={6} placeholder="رمز من 4-6 أرقام" />
        </div>
      )}
      <div>
        <Label>ملاحظات</Label>
        <Textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={2} />
      </div>
      <Button type="submit" className="w-full bg-amber-600 hover:bg-amber-700" disabled={createMutation.isPending || updateMutation.isPending}>
        {owner ? "تحديث البيانات" : "إضافة المالك"}
      </Button>
    </form>
  );
}

function OwnerDetailsPanel({ owner, onClose }: { owner: any; onClose: () => void }) {
  const { data, isLoading } = trpc.owners.details.useQuery({ ownerName: owner.name }, { enabled: !!owner.name });

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b bg-amber-50">
          <div>
            <h2 className="text-xl font-bold text-amber-800">{owner.name}</h2>
            <p className="text-sm text-muted-foreground">{owner.phone} • {owner.email || "لا يوجد بريد"}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}><X className="h-4 w-4" /></Button>
        </div>
        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">جاري التحميل...</div>
          ) : (
            <Tabs defaultValue="properties" dir="rtl" className="p-4">
              <TabsList className="mb-4">
                <TabsTrigger value="properties">
                  <Building2 className="h-4 w-4 ml-1" />
                  العقارات ({data?.properties?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="contracts">
                  <FileText className="h-4 w-4 ml-1" />
                  العقود ({data?.contracts?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="payments">
                  <CreditCard className="h-4 w-4 ml-1" />
                  الدفعات ({data?.payments?.length || 0})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="properties">
                {data?.properties?.length === 0 ? (
                  <p className="text-center text-muted-foreground py-6">لا توجد عقارات مسجلة لهذا المالك</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="text-right p-2 font-semibold">اسم العقار</th>
                          <th className="text-right p-2 font-semibold">النوع</th>
                          <th className="text-right p-2 font-semibold">المدينة</th>
                          <th className="text-right p-2 font-semibold">الوحدات</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data?.properties?.map((p: any) => (
                          <tr key={p.id} className="border-b hover:bg-gray-50">
                            <td className="p-2 font-medium">{p.name}</td>
                            <td className="p-2">{p.propertyType || "-"}</td>
                            <td className="p-2">{p.city || "-"}</td>
                            <td className="p-2">{p.totalUnits || 0}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="contracts">
                {data?.contracts?.length === 0 ? (
                  <p className="text-center text-muted-foreground py-6">لا توجد عقود لهذا المالك</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="text-right p-2 font-semibold">رقم العقد</th>
                          <th className="text-right p-2 font-semibold">المستأجر</th>
                          <th className="text-right p-2 font-semibold">تاريخ البداية</th>
                          <th className="text-right p-2 font-semibold">تاريخ النهاية</th>
                          <th className="text-right p-2 font-semibold">القيمة</th>
                          <th className="text-right p-2 font-semibold">الحالة</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data?.contracts?.map((c: any) => (
                          <tr key={c.id} className="border-b hover:bg-gray-50">
                            <td className="p-2 font-mono text-xs">{c.contractNumber}</td>
                            <td className="p-2">{c.tenantName}</td>
                            <td className="p-2">{c.startDate}</td>
                            <td className="p-2">{c.endDate}</td>
                            <td className="p-2 font-medium">{Number(c.totalAmount || 0).toLocaleString('ar-SA')} ر.س</td>
                            <td className="p-2">
                              <Badge className={c.status === 'نشط' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}>
                                {c.status || "غير محدد"}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="payments">
                {data?.payments?.length === 0 ? (
                  <p className="text-center text-muted-foreground py-6">لا توجد دفعات لعقود هذا المالك</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="text-right p-2 font-semibold">رقم الفاتورة</th>
                          <th className="text-right p-2 font-semibold">المستأجر</th>
                          <th className="text-right p-2 font-semibold">تاريخ الاستحقاق</th>
                          <th className="text-right p-2 font-semibold">المبلغ</th>
                          <th className="text-right p-2 font-semibold">المدفوع</th>
                          <th className="text-right p-2 font-semibold">الحالة</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data?.payments?.map((p: any) => (
                          <tr key={p.id} className="border-b hover:bg-gray-50">
                            <td className="p-2 font-mono text-xs">{p.invoiceNumber}</td>
                            <td className="p-2">{p.tenantName}</td>
                            <td className="p-2">{p.invoiceDueDate}</td>
                            <td className="p-2">{Number(p.totalAmount || 0).toLocaleString('ar-SA')} ر.س</td>
                            <td className="p-2">{Number(p.paidAmount || 0).toLocaleString('ar-SA')} ر.س</td>
                            <td className="p-2">
                              <Badge className={
                                p.invoiceStatus === 'مدفوع' ? 'bg-green-100 text-green-700' :
                                p.invoiceStatus === 'متأخر' ? 'bg-red-100 text-red-700' :
                                'bg-yellow-100 text-yellow-700'
                              }>
                                {p.invoiceStatus || "معلق"}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Owners() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [editOwner, setEditOwner] = useState<any>(null);
  const [selectedOwner, setSelectedOwner] = useState<any>(null);

  const { data, refetch } = trpc.owners.list.useQuery({ search, page, limit: 15 });
  const deleteMutation = trpc.owners.delete.useMutation({
    onSuccess: () => { toast.success("تم حذف المالك"); refetch(); },
    onError: (e) => toast.error(e.message),
  });

  const owners = data?.data || [];
  const total = data?.total || 0;

  return (
    <div className="space-y-6">
      {/* Owner Details Panel */}
      {selectedOwner && (
        <OwnerDetailsPanel owner={selectedOwner} onClose={() => setSelectedOwner(null)} />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">بوابة الملاك</h1>
          <p className="text-muted-foreground mt-1">إدارة ملاك العقارات وصلاحيات البوابة الإلكترونية</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-amber-600 hover:bg-amber-700 gap-2" onClick={() => setEditOwner(null)}>
              <Plus className="h-4 w-4" />
              إضافة مالك
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg" dir="rtl">
            <DialogHeader>
              <DialogTitle>{editOwner ? "تعديل بيانات المالك" : "إضافة مالك جديد"}</DialogTitle>
            </DialogHeader>
            <OwnerForm owner={editOwner} onSuccess={() => { setOpen(false); refetch(); }} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4 flex items-center gap-3">
            <Users className="h-8 w-8 text-amber-600" />
            <div>
              <p className="text-2xl font-bold text-amber-700">{total}</p>
              <p className="text-sm text-muted-foreground">إجمالي الملاك</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4 flex items-center gap-3">
            <Key className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold text-green-700">{owners.filter((o: any) => o.portalAccess).length}</p>
              <p className="text-sm text-muted-foreground">لديهم بوابة مفعّلة</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4 flex items-center gap-3">
            <Building2 className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-2xl font-bold text-blue-700">{owners.filter((o: any) => !o.portalAccess).length}</p>
              <p className="text-sm text-muted-foreground">بدون بوابة</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="البحث باسم المالك..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="pr-10"
        />
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-right p-3 font-semibold">اسم المالك</th>
                  <th className="text-right p-3 font-semibold">رقم الهوية</th>
                  <th className="text-right p-3 font-semibold">الجوال</th>
                  <th className="text-right p-3 font-semibold">البريد الإلكتروني</th>
                  <th className="text-right p-3 font-semibold">بوابة المالك</th>
                  <th className="text-right p-3 font-semibold">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {owners.map((owner: any) => (
                  <tr key={owner.id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="p-3">
                      <button
                        className="font-medium text-amber-700 hover:text-amber-900 hover:underline text-right"
                        onClick={() => setSelectedOwner(owner)}
                      >
                        {owner.name}
                      </button>
                    </td>
                    <td className="p-3 text-muted-foreground">{owner.identityNumber || "-"}</td>
                    <td className="p-3">
                      {owner.phone ? (
                        <a href={`tel:${owner.phone}`} className="flex items-center gap-1 text-blue-600 hover:underline">
                          <Phone className="h-3 w-3" />
                          {owner.phone}
                        </a>
                      ) : "-"}
                    </td>
                    <td className="p-3">
                      {owner.email ? (
                        <a href={`mailto:${owner.email}`} className="flex items-center gap-1 text-blue-600 hover:underline">
                          <Mail className="h-3 w-3" />
                          {owner.email}
                        </a>
                      ) : "-"}
                    </td>
                    <td className="p-3">
                      {owner.portalAccess ? (
                        <Badge className="bg-green-100 text-green-700">مفعّلة</Badge>
                      ) : (
                        <Badge variant="outline" className="text-gray-500">غير مفعّلة</Badge>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-amber-600"
                          onClick={() => setSelectedOwner(owner)}
                          title="عرض التفاصيل"
                        >
                          <Building2 className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => { setEditOwner(owner); setOpen(true); }}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => {
                            if (confirm("هل أنت متأكد من حذف هذا المالك؟")) {
                              deleteMutation.mutate({ id: owner.id });
                            }
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {owners.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center p-8 text-muted-foreground">
                      لا يوجد ملاك مسجلون
                    </td>
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
