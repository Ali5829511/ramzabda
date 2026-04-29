import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Plus, Search, Megaphone, Eye, MessageSquare, Home, Building2,
  MapPin, BedDouble, Bath, Square, Edit, Trash2, Calendar, Phone, CheckCircle
} from "lucide-react";

function ListingForm({ listing, onSuccess }: { listing?: any; onSuccess: () => void }) {
  const [form, setForm] = useState({
    title: listing?.title || "",
    description: listing?.description || "",
    unitType: listing?.unitType || "شقة",
    propertyName: listing?.propertyName || "",
    city: listing?.city || "",
    region: listing?.region || "",
    area: listing?.area || "",
    rooms: listing?.rooms || "",
    bathrooms: listing?.bathrooms || "",
    floor: listing?.floor || "",
    rentPrice: listing?.rentPrice || "",
    features: listing?.features || "",
    status: listing?.status || "نشط",
  });

  const createMutation = trpc.listings.create.useMutation({
    onSuccess: () => { toast.success("تم إضافة الإعلان بنجاح"); onSuccess(); },
    onError: (e) => toast.error(e.message),
  });
  const updateMutation = trpc.listings.update.useMutation({
    onSuccess: () => { toast.success("تم تحديث الإعلان"); onSuccess(); },
    onError: (e) => toast.error(e.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data: any = { ...form };
    if (form.rooms) data.rooms = Number(form.rooms);
    if (form.bathrooms) data.bathrooms = Number(form.bathrooms);
    if (listing) {
      updateMutation.mutate({ id: listing.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto">
      <div>
        <Label>عنوان الإعلان *</Label>
        <Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required placeholder="مثال: شقة 3 غرف للإيجار في حي النرجس" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>نوع الوحدة</Label>
          <Select value={form.unitType} onValueChange={v => setForm(p => ({ ...p, unitType: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {['شقة','فيلا','استوديو','غرفة','مكتب','محل','مستودع','أخرى'].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>اسم العقار</Label>
          <Input value={form.propertyName} onChange={e => setForm(p => ({ ...p, propertyName: e.target.value }))} />
        </div>
        <div>
          <Label>المدينة</Label>
          <Input value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} />
        </div>
        <div>
          <Label>الحي / المنطقة</Label>
          <Input value={form.region} onChange={e => setForm(p => ({ ...p, region: e.target.value }))} />
        </div>
        <div>
          <Label>المساحة (م²)</Label>
          <Input type="number" value={form.area} onChange={e => setForm(p => ({ ...p, area: e.target.value }))} />
        </div>
        <div>
          <Label>سعر الإيجار (ريال/سنة)</Label>
          <Input type="number" value={form.rentPrice} onChange={e => setForm(p => ({ ...p, rentPrice: e.target.value }))} />
        </div>
        <div>
          <Label>عدد الغرف</Label>
          <Input type="number" value={form.rooms} onChange={e => setForm(p => ({ ...p, rooms: e.target.value }))} />
        </div>
        <div>
          <Label>عدد دورات المياه</Label>
          <Input type="number" value={form.bathrooms} onChange={e => setForm(p => ({ ...p, bathrooms: e.target.value }))} />
        </div>
        <div>
          <Label>الدور</Label>
          <Input value={form.floor} onChange={e => setForm(p => ({ ...p, floor: e.target.value }))} placeholder="مثال: الثالث" />
        </div>
        <div>
          <Label>حالة الإعلان</Label>
          <Select value={form.status} onValueChange={v => setForm(p => ({ ...p, status: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="نشط">نشط</SelectItem>
              <SelectItem value="مؤجر">مؤجر</SelectItem>
              <SelectItem value="موقوف">موقوف</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label>وصف الوحدة</Label>
        <Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3} placeholder="وصف تفصيلي للوحدة..." />
      </div>
      <div>
        <Label>المميزات (مفصولة بفاصلة)</Label>
        <Input value={form.features} onChange={e => setForm(p => ({ ...p, features: e.target.value }))} placeholder="مثال: مكيف, موقف سيارة, مطبخ مجهز" />
      </div>
      <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={createMutation.isPending || updateMutation.isPending}>
        {listing ? "تحديث الإعلان" : "نشر الإعلان"}
      </Button>
    </form>
  );
}

function ListingCard({ listing, onEdit, onDelete, onStatusChange }: any) {
  const statusColors: Record<string, string> = {
    'نشط': 'bg-green-100 text-green-700',
    'مؤجر': 'bg-blue-100 text-blue-700',
    'موقوف': 'bg-gray-100 text-gray-700',
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">{listing.title}</h3>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span>{listing.city}{listing.region ? ` - ${listing.region}` : ''}</span>
            </div>
          </div>
          <Badge className={statusColors[listing.status] || 'bg-gray-100 text-gray-700'}>
            {listing.status}
          </Badge>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-3 text-sm">
          {listing.rooms && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <BedDouble className="h-3 w-3" />
              <span>{listing.rooms} غرف</span>
            </div>
          )}
          {listing.bathrooms && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Bath className="h-3 w-3" />
              <span>{listing.bathrooms} حمام</span>
            </div>
          )}
          {listing.area && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Square className="h-3 w-3" />
              <span>{listing.area} م²</span>
            </div>
          )}
        </div>

        {listing.rentPrice && (
          <div className="text-lg font-bold text-amber-600 mb-3">
            {Number(listing.rentPrice).toLocaleString('ar-SA')} ريال/سنة
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{listing.viewCount || 0} مشاهدة</span>
            <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" />{listing.inquiryCount || 0} استفسار</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="flex-1" onClick={() => onEdit(listing)}>
            <Edit className="h-3 w-3 ml-1" />
            تعديل
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-red-600 hover:text-red-700"
            onClick={() => onDelete(listing.id)}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Marketing() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [editListing, setEditListing] = useState<any>(null);
  const [viewingPage, setViewingPage] = useState(1);

  const { data: listingsData, refetch: refetchListings } = trpc.listings.list.useQuery({ search, page, limit: 12 });
  const { data: viewingsData, refetch: refetchViewings } = trpc.viewingRequests.list.useQuery({ page: viewingPage, limit: 10 });

  const deleteMutation = trpc.listings.delete.useMutation({
    onSuccess: () => { toast.success("تم حذف الإعلان"); refetchListings(); },
    onError: (e) => toast.error(e.message),
  });

  const updateViewingMutation = trpc.viewingRequests.update.useMutation({
    onSuccess: () => { toast.success("تم تحديث حالة طلب المعاينة"); refetchViewings(); },
    onError: (e) => toast.error(e.message),
  });

  const listings = listingsData?.data || [];
  const totalListings = listingsData?.total || 0;
  const viewings = viewingsData?.data || [];
  const totalViewings = viewingsData?.total || 0;

  const activeListings = listings.filter((l: any) => l.status === 'نشط').length;
  const newViewings = viewings.filter((v: any) => v.status === 'جديد').length;

  const viewingStatusColors: Record<string, string> = {
    'جديد': 'bg-blue-100 text-blue-700',
    'مؤكد': 'bg-green-100 text-green-700',
    'مكتمل': 'bg-gray-100 text-gray-700',
    'ملغي': 'bg-red-100 text-red-700',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">التسويق العقاري</h1>
          <p className="text-muted-foreground mt-1">إدارة إعلانات الوحدات المتاحة وطلبات المعاينة</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700 gap-2" onClick={() => setEditListing(null)}>
              <Plus className="h-4 w-4" />
              إضافة إعلان
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl" dir="rtl">
            <DialogHeader>
              <DialogTitle>{editListing ? "تعديل الإعلان" : "إضافة إعلان جديد"}</DialogTitle>
            </DialogHeader>
            <ListingForm listing={editListing} onSuccess={() => { setOpen(false); refetchListings(); }} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4 flex items-center gap-3">
            <Megaphone className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold text-green-700">{totalListings}</p>
              <p className="text-sm text-muted-foreground">إجمالي الإعلانات</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4 flex items-center gap-3">
            <Home className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-2xl font-bold text-blue-700">{activeListings}</p>
              <p className="text-sm text-muted-foreground">إعلانات نشطة</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4 flex items-center gap-3">
            <Calendar className="h-8 w-8 text-amber-600" />
            <div>
              <p className="text-2xl font-bold text-amber-700">{totalViewings}</p>
              <p className="text-sm text-muted-foreground">طلبات معاينة</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="p-4 flex items-center gap-3">
            <MessageSquare className="h-8 w-8 text-purple-600" />
            <div>
              <p className="text-2xl font-bold text-purple-700">{newViewings}</p>
              <p className="text-sm text-muted-foreground">طلبات جديدة</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="listings">
        <TabsList className="mb-4">
          <TabsTrigger value="listings">الإعلانات ({totalListings})</TabsTrigger>
          <TabsTrigger value="viewings">طلبات المعاينة ({totalViewings})</TabsTrigger>
        </TabsList>

        <TabsContent value="listings">
          <div className="relative mb-4">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="البحث في الإعلانات..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="pr-10"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {listings.map((listing: any) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                onEdit={(l: any) => { setEditListing(l); setOpen(true); }}
                onDelete={(id: number) => {
                  if (confirm("هل أنت متأكد من حذف هذا الإعلان؟")) {
                    deleteMutation.mutate({ id });
                  }
                }}
              />
            ))}
            {listings.length === 0 && (
              <div className="col-span-3 text-center py-12 text-muted-foreground">
                <Megaphone className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>لا توجد إعلانات حتى الآن</p>
                <p className="text-sm">أضف إعلانك الأول لبدء التسويق</p>
              </div>
            )}
          </div>

          {totalListings > 12 && (
            <div className="flex justify-between items-center mt-4">
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>السابق</Button>
              <span className="text-sm text-muted-foreground">صفحة {page} من {Math.ceil(totalListings / 12)}</span>
              <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page * 12 >= totalListings}>التالي</Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="viewings">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-right p-3 font-semibold">اسم المتقدم</th>
                      <th className="text-right p-3 font-semibold">رقم الجوال</th>
                      <th className="text-right p-3 font-semibold">العقار</th>
                      <th className="text-right p-3 font-semibold">التاريخ المفضل</th>
                      <th className="text-right p-3 font-semibold">الوقت</th>
                      <th className="text-right p-3 font-semibold">الحالة</th>
                      <th className="text-right p-3 font-semibold">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewings.map((v: any) => (
                      <tr key={v.id} className="border-b hover:bg-gray-50 transition-colors">
                        <td className="p-3 font-medium">{v.applicantName}</td>
                        <td className="p-3">
                          <a href={`tel:${v.applicantPhone}`} className="flex items-center gap-1 text-blue-600 hover:underline">
                            <Phone className="h-3 w-3" />
                            {v.applicantPhone}
                          </a>
                        </td>
                        <td className="p-3 text-muted-foreground">{v.propertyName || "-"}</td>
                        <td className="p-3 text-muted-foreground">
                          {v.preferredDate ? new Date(v.preferredDate).toLocaleDateString('ar-SA') : "-"}
                        </td>
                        <td className="p-3 text-muted-foreground">{v.preferredTime || "-"}</td>
                        <td className="p-3">
                          <Badge className={viewingStatusColors[v.status] || 'bg-gray-100 text-gray-700'}>
                            {v.status}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <div className="flex gap-1">
                            {v.status === 'جديد' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-green-600 text-xs"
                                  onClick={() => updateViewingMutation.mutate({ id: v.id, status: 'مؤكد' })}
                                >
                                  <CheckCircle className="h-3 w-3 ml-1" />
                                  تأكيد
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-red-600 text-xs"
                                  onClick={() => updateViewingMutation.mutate({ id: v.id, status: 'ملغي' })}
                                >
                                  إلغاء
                                </Button>
                              </>
                            )}
                            {v.status === 'مؤكد' && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-gray-600 text-xs"
                                onClick={() => updateViewingMutation.mutate({ id: v.id, status: 'مكتمل' })}
                              >
                                مكتمل
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {viewings.length === 0 && (
                      <tr>
                        <td colSpan={7} className="text-center p-8 text-muted-foreground">لا توجد طلبات معاينة</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {totalViewings > 10 && (
                <div className="flex justify-between items-center p-3 border-t">
                  <Button variant="outline" size="sm" onClick={() => setViewingPage(p => Math.max(1, p - 1))} disabled={viewingPage === 1}>السابق</Button>
                  <span className="text-sm text-muted-foreground">صفحة {viewingPage} من {Math.ceil(totalViewings / 10)}</span>
                  <Button variant="outline" size="sm" onClick={() => setViewingPage(p => p + 1)} disabled={viewingPage * 10 >= totalViewings}>التالي</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
