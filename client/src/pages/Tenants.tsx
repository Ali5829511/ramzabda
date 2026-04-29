import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Plus, Search, Users, Phone, Mail, Key, Edit, Trash2, FileText, CreditCard, Wrench, X, Globe } from "lucide-react";

function TenantForm({ tenant, onSuccess }: { tenant?: any; onSuccess: () => void }) {
  const [form, setForm] = useState({
    name: tenant?.name || "",
    identityNumber: tenant?.identityNumber || "",
    phone: tenant?.phone || "",
    email: tenant?.email || "",
    nationality: tenant?.nationality || "",
    portalAccess: tenant?.portalAccess ? true : false,
    notes: tenant?.notes || "",
  });

  const createMutation = trpc.tenants.create.useMutation({
    onSuccess: () => { toast.success("تم إضافة المستأجر بنجاح"); onSuccess(); },
    onError: (e) => toast.error(e.message),
  });
  const updateMutation = trpc.tenants.update.useMutation({
    onSuccess: () => { toast.success("تم تحديث بيانات المستأجر"); onSuccess(); },
    onError: (e) => toast.error(e.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = { ...form, portalAccess: form.portalAccess ? 1 : 0 };
    if (tenant) {
      updateMutation.mutate({ id: tenant.id, ...data });
    } else {
      createMutation.mutate(data as any);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>اسم المستأجر *</Label>
          <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
        </div>
        <div>
          <Label>رقم الهوية / الإقامة</Label>
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
        <div className="col-span-2">
          <Label>الجنسية</Label>
          <Input value={form.nationality} onChange={e => setForm(p => ({ ...p, nationality: e.target.value }))} placeholder="مثال: سعودي، مصري..." />
        </div>
      </div>
      <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <Switch
          checked={form.portalAccess}
          onCheckedChange={v => setForm(p => ({ ...p, portalAccess: v }))}
        />
        <div>
          <p className="font-medium text-sm">تفعيل بوابة المستأجر</p>
          <p className="text-xs text-muted-foreground">يتيح للمستأجر الاطلاع على عقوده وفواتيره وتقديم طلبات الصيانة</p>
        </div>
      </div>
      <div>
        <Label>ملاحظات</Label>
        <Textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={2} />
      </div>
      <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={createMutation.isPending || updateMutation.isPending}>
        {tenant ? "تحديث البيانات" : "إضافة المستأجر"}
      </Button>
    </form>
  );
}

function TenantDetailsPanel({ tenant, onClose }: { tenant: any; onClose: () => void }) {
  const { data, isLoading } = trpc.tenants.details.useQuery(
    { tenantIdentity: tenant.identityNumber || tenant.name },
    { enabled: !!(tenant.identityNumber || tenant.name) }
  );

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b bg-blue-50">
          <div>
            <h2 className="text-xl font-bold text-blue-800">{tenant.name}</h2>
            <p className="text-sm text-muted-foreground">{tenant.phone} • {tenant.nationality || "غير محدد"}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}><X className="h-4 w-4" /></Button>
        </div>
        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">جاري التحميل...</div>
          ) : (
            <Tabs defaultValue="contracts" dir="rtl" className="p-4">
              <TabsList className="mb-4">
                <TabsTrigger value="contracts">
                  <FileText className="h-4 w-4 ml-1" />
                  العقود ({data?.contracts?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="payments">
                  <CreditCard className="h-4 w-4 ml-1" />
                  الفواتير ({data?.payments?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="maintenance">
                  <Wrench className="h-4 w-4 ml-1" />
                  الصيانة ({data?.maintenance?.length || 0})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="contracts">
                {!data?.contracts?.length ? (
                  <p className="text-center text-muted-foreground py-6">لا توجد عقود لهذا المستأجر</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="text-right p-2 font-semibold">رقم العقد</th>
                          <th className="text-right p-2 font-semibold">العقار</th>
                          <th className="text-right p-2 font-semibold">من</th>
                          <th className="text-right p-2 font-semibold">إلى</th>
                          <th className="text-right p-2 font-semibold">القيمة</th>
                          <th className="text-right p-2 font-semibold">الحالة</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.contracts.map((c: any) => (
                          <tr key={c.id} className="border-b hover:bg-gray-50">
                            <td className="p-2 font-mono text-xs">{c.contractNumber}</td>
                            <td className="p-2">{c.propertyName || c.landlordName}</td>
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
                {!data?.payments?.length ? (
                  <p className="text-center text-muted-foreground py-6">لا توجد فواتير لهذا المستأجر</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="text-right p-2 font-semibold">رقم الفاتورة</th>
                          <th className="text-right p-2 font-semibold">تاريخ الاستحقاق</th>
                          <th className="text-right p-2 font-semibold">المبلغ</th>
                          <th className="text-right p-2 font-semibold">المدفوع</th>
                          <th className="text-right p-2 font-semibold">المتبقي</th>
                          <th className="text-right p-2 font-semibold">الحالة</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.payments.map((p: any) => (
                          <tr key={p.id} className="border-b hover:bg-gray-50">
                            <td className="p-2 font-mono text-xs">{p.invoiceNumber}</td>
                            <td className="p-2">{p.invoiceDueDate}</td>
                            <td className="p-2">{Number(p.totalAmount || 0).toLocaleString('ar-SA')} ر.س</td>
                            <td className="p-2 text-green-700">{Number(p.paidAmount || 0).toLocaleString('ar-SA')} ر.س</td>
                            <td className="p-2 text-red-700">{Number(p.remainingAmount || 0).toLocaleString('ar-SA')} ر.س</td>
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

              <TabsContent value="maintenance">
                {!data?.maintenance?.length ? (
                  <p className="text-center text-muted-foreground py-6">لا توجد طلبات صيانة</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="text-right p-2 font-semibold">العنوان</th>
                          <th className="text-right p-2 font-semibold">الفئة</th>
                          <th className="text-right p-2 font-semibold">الأولوية</th>
                          <th className="text-right p-2 font-semibold">الحالة</th>
                          <th className="text-right p-2 font-semibold">التاريخ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.maintenance.map((m: any) => (
                          <tr key={m.id} className="border-b hover:bg-gray-50">
                            <td className="p-2 font-medium">{m.title}</td>
                            <td className="p-2">{m.category}</td>
                            <td className="p-2">
                              <Badge className={m.priority === 'عاجل' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}>
                                {m.priority}
                              </Badge>
                            </td>
                            <td className="p-2">
                              <Badge className={m.status === 'مكتمل' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}>
                                {m.status}
                              </Badge>
                            </td>
                            <td className="p-2 text-muted-foreground">{new Date(m.requestDate).toLocaleDateString('ar-SA')}</td>
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

export default function Tenants() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [editTenant, setEditTenant] = useState<any>(null);
  const [selectedTenant, setSelectedTenant] = useState<any>(null);

  const { data, refetch } = trpc.tenants.list.useQuery({ search, page, limit: 15 });
  const deleteMutation = trpc.tenants.delete.useMutation({
    onSuccess: () => { toast.success("تم حذف المستأجر"); refetch(); },
    onError: (e) => toast.error(e.message),
  });

  const tenants = data?.data || [];
  const total = data?.total || 0;

  return (
    <div className="space-y-6">
      {selectedTenant && (
        <TenantDetailsPanel tenant={selectedTenant} onClose={() => setSelectedTenant(null)} />
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">بوابة المستأجرين</h1>
          <p className="text-muted-foreground mt-1">إدارة المستأجرين وصلاحيات البوابة الإلكترونية</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 gap-2" onClick={() => setEditTenant(null)}>
              <Plus className="h-4 w-4" />
              إضافة مستأجر
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg" dir="rtl">
            <DialogHeader>
              <DialogTitle>{editTenant ? "تعديل بيانات المستأجر" : "إضافة مستأجر جديد"}</DialogTitle>
            </DialogHeader>
            <TenantForm tenant={editTenant} onSuccess={() => { setOpen(false); refetch(); }} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4 flex items-center gap-3">
            <Users className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-2xl font-bold text-blue-700">{total}</p>
              <p className="text-sm text-muted-foreground">إجمالي المستأجرين</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4 flex items-center gap-3">
            <Key className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold text-green-700">{tenants.filter((t: any) => t.portalAccess).length}</p>
              <p className="text-sm text-muted-foreground">بوابة مفعّلة</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="p-4 flex items-center gap-3">
            <Globe className="h-8 w-8 text-purple-600" />
            <div>
              <p className="text-2xl font-bold text-purple-700">{tenants.filter((t: any) => t.nationality && t.nationality !== 'سعودي').length}</p>
              <p className="text-sm text-muted-foreground">غير سعوديين</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-gray-200 bg-gray-50">
          <CardContent className="p-4 flex items-center gap-3">
            <Users className="h-8 w-8 text-gray-600" />
            <div>
              <p className="text-2xl font-bold text-gray-700">{tenants.filter((t: any) => !t.portalAccess).length}</p>
              <p className="text-sm text-muted-foreground">بدون بوابة</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="البحث باسم المستأجر أو رقم الجوال..."
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
                  <th className="text-right p-3 font-semibold">اسم المستأجر</th>
                  <th className="text-right p-3 font-semibold">رقم الهوية</th>
                  <th className="text-right p-3 font-semibold">الجنسية</th>
                  <th className="text-right p-3 font-semibold">الجوال</th>
                  <th className="text-right p-3 font-semibold">البريد</th>
                  <th className="text-right p-3 font-semibold">البوابة</th>
                  <th className="text-right p-3 font-semibold">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {tenants.map((tenant: any) => (
                  <tr key={tenant.id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="p-3">
                      <button
                        className="font-medium text-blue-700 hover:text-blue-900 hover:underline"
                        onClick={() => setSelectedTenant(tenant)}
                      >
                        {tenant.name}
                      </button>
                    </td>
                    <td className="p-3 text-muted-foreground">{tenant.identityNumber || "-"}</td>
                    <td className="p-3 text-muted-foreground">{tenant.nationality || "-"}</td>
                    <td className="p-3">
                      {tenant.phone ? (
                        <a href={`tel:${tenant.phone}`} className="flex items-center gap-1 text-blue-600 hover:underline">
                          <Phone className="h-3 w-3" />
                          {tenant.phone}
                        </a>
                      ) : "-"}
                    </td>
                    <td className="p-3">
                      {tenant.email ? (
                        <a href={`mailto:${tenant.email}`} className="flex items-center gap-1 text-blue-600 hover:underline">
                          <Mail className="h-3 w-3" />
                          {tenant.email}
                        </a>
                      ) : "-"}
                    </td>
                    <td className="p-3">
                      {tenant.portalAccess ? (
                        <Badge className="bg-green-100 text-green-700">مفعّلة</Badge>
                      ) : (
                        <Badge variant="outline" className="text-gray-500">غير مفعّلة</Badge>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="text-blue-600" onClick={() => setSelectedTenant(tenant)} title="عرض التفاصيل">
                          <FileText className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => { setEditTenant(tenant); setOpen(true); }}>
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600" onClick={() => {
                          if (confirm("هل أنت متأكد من حذف هذا المستأجر؟")) deleteMutation.mutate({ id: tenant.id });
                        }}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {tenants.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center p-8 text-muted-foreground">لا يوجد مستأجرون مسجلون</td>
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
