import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Building2, Search, Home, MapPin, DollarSign, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocation } from "wouter";

const UNIT_TYPES = ['جميع الأنواع', 'شقة', 'استوديو', 'فيلا', 'دوبلكس', 'مكتب', 'محل', 'مستودع', 'أخرى'];

export default function VacantProperties() {
  const [, navigate] = useLocation();
  const [search, setSearch] = useState("");
  const [unitType, setUnitType] = useState("جميع الأنواع");

  const { data: unitsData, isLoading } = trpc.units.list.useQuery({
    search: search || undefined,
    status: "متاحة",
    page: 1,
    limit: 100,
  });

  const units = unitsData?.units ?? [];

  const filtered = unitType === "جميع الأنواع"
    ? units
    : units.filter((u: any) => u.unitType === unitType);

  const grouped = filtered.reduce((acc: Record<string, any[]>, unit: any) => {
    const key = unit.propertyName || "غير محدد";
    if (!acc[key]) acc[key] = [];
    acc[key].push(unit);
    return acc;
  }, {});

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">العقارات الشاغرة</h1>
          <p className="text-muted-foreground mt-1">جميع الوحدات المتاحة للإيجار</p>
        </div>
        <Button onClick={() => navigate("/units")} className="bg-amber-600 hover:bg-amber-700 gap-2">
          <Plus className="h-4 w-4" />
          إضافة وحدة
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-xl">
              <Home className="h-6 w-6 text-green-700" />
            </div>
            <div>
              <p className="text-sm text-green-700">إجمالي الشاغر</p>
              <p className="text-2xl font-bold text-green-800">{filtered.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Building2 className="h-6 w-6 text-blue-700" />
            </div>
            <div>
              <p className="text-sm text-blue-700">عدد العقارات</p>
              <p className="text-2xl font-bold text-blue-800">{Object.keys(grouped).length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 bg-amber-100 rounded-xl">
              <DollarSign className="h-6 w-6 text-amber-700" />
            </div>
            <div>
              <p className="text-sm text-amber-700">متوسط الإيجار</p>
              <p className="text-2xl font-bold text-amber-800">
                {filtered.length > 0
                  ? Math.round(
                      filtered.reduce((sum: number, u: any) => sum + (parseFloat(u.rentPrice || 0)), 0) / filtered.length
                    ).toLocaleString("ar-SA")
                  : 0} ريال
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="h-4 w-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="بحث بالعقار أو رقم الوحدة..."
                className="pr-9"
              />
            </div>
            <Select value={unitType} onValueChange={setUnitType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="نوع الوحدة" />
              </SelectTrigger>
              <SelectContent>
                {UNIT_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">جاري التحميل...</div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Home className="h-12 w-12 mx-auto mb-4 text-slate-300" />
            <p className="text-lg font-medium text-slate-600">لا توجد وحدات شاغرة</p>
            <p className="text-sm text-muted-foreground mt-1">جميع الوحدات مؤجرة حالياً</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([propertyName, propertyUnits]) => (
            <Card key={propertyName} className="overflow-hidden">
              <CardHeader className="bg-slate-50 border-b py-3 px-5">
                <CardTitle className="text-base flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-amber-600" />
                  {propertyName}
                  <Badge className="mr-auto bg-green-100 text-green-700 font-normal">
                    {(propertyUnits as any[]).length} وحدة شاغرة
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-slate-100">
                  {(propertyUnits as any[]).map((unit: any) => (
                    <div key={unit.id} className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors">
                      <div className="p-2.5 bg-amber-100 rounded-lg flex-shrink-0">
                        <Home className="h-5 w-5 text-amber-700" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900">وحدة {unit.unitNumber}</span>
                          {unit.unitType && (
                            <Badge variant="outline" className="text-xs">{unit.unitType}</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground flex-wrap">
                          {unit.floor && <span>الطابق: {unit.floor}</span>}
                          {unit.area && <span>المساحة: {unit.area} م²</span>}
                          {unit.rooms && <span>{unit.rooms} غرف</span>}
                          {unit.bathrooms && <span>{unit.bathrooms} حمام</span>}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        {unit.rentPrice ? (
                          <div className="font-bold text-amber-600 text-lg">
                            {parseFloat(unit.rentPrice).toLocaleString("ar-SA")}
                            <span className="text-xs text-muted-foreground font-normal mr-1">ريال/سنة</span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">السعر غير محدد</span>
                        )}
                        <Badge className="bg-green-100 text-green-700 mt-1 text-xs">متاحة</Badge>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-shrink-0 gap-1"
                        onClick={() => navigate("/contracts")}
                      >
                        <Plus className="h-3.5 w-3.5" />
                        إضافة عقد
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
