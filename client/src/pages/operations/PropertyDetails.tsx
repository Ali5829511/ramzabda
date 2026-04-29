import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Building2, MapPin, FileText, Home, DollarSign, Users, Wrench, ChevronRight, Phone, User, Calendar, Hash, Building, Shield, Settings } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function InfoRow({ label, value }: { label: string; value?: string | number | null }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex justify-between py-2 border-b border-slate-100 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-slate-900 text-left max-w-[60%]">{String(value)}</span>
    </div>
  );
}

export default function PropertyDetails() {
  const [location, navigate] = useLocation();
  // Extract ID from URL like /properties/123
  const id = parseInt(location.split('/').pop() ?? '0');

  const { data: property, isLoading } = trpc.properties.byId.useQuery({ id }, { enabled: id > 0 });
  const { data: unitsData } = trpc.units.list.useQuery({ propertyId: id, page: 1, limit: 100 }, { enabled: id > 0 });
  const { data: contractsData } = trpc.contracts.list.useQuery({ propertyId: id, page: 1, limit: 50 }, { enabled: id > 0 });

  const units = unitsData?.data ?? [];
  const contracts = contractsData?.data ?? [];

  if (isLoading) {
    return <div className="text-center py-20 text-muted-foreground">جاري التحميل...</div>;
  }

  if (!property) {
    return (
      <div className="text-center py-20">
        <Building2 className="h-16 w-16 mx-auto opacity-20 mb-4" />
        <p className="text-muted-foreground">العقار غير موجود</p>
        <Button onClick={() => navigate('/properties')} className="mt-4" variant="outline">
          العودة للعقارات
        </Button>
      </div>
    );
  }

  const statusColor = property.status === 'نشط' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600';
  const rentedCount = units.filter(u => u.status === 'مؤجرة').length;
  const availableCount = units.filter(u => u.status === 'متاحة').length;
  const maintenanceCount = units.filter(u => u.status === 'تحت_الصيانة').length;

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <button onClick={() => navigate('/properties')} className="hover:text-amber-600 transition-colors">العقارات</button>
        <ChevronRight className="h-4 w-4 rotate-180" />
        <span className="text-slate-900 font-medium">{property.name}</span>
      </div>

      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="p-3 bg-amber-50 rounded-xl flex-shrink-0">
          <Building2 className="h-8 w-8 text-amber-600" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-slate-900">{property.name}</h1>
            <Badge className={statusColor}>{property.status}</Badge>
            {property.propertyType && <Badge variant="outline">{property.propertyType}</Badge>}
          </div>
          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{[property.city, property.region, property.district].filter(Boolean).join(' - ')}</span>
          </div>
        </div>
        <Button onClick={() => navigate('/properties')} variant="outline" size="sm">
          العودة
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: 'إجمالي الوحدات', value: units.length, color: 'text-slate-700', bg: 'bg-slate-50' },
          { label: 'مؤجرة', value: rentedCount, color: 'text-green-700', bg: 'bg-green-50' },
          { label: 'متاحة', value: availableCount, color: 'text-blue-700', bg: 'bg-blue-50' },
          { label: 'تحت الصيانة', value: maintenanceCount, color: 'text-amber-700', bg: 'bg-amber-50' },
          { label: 'العقود النشطة', value: contracts.filter(c => c.status === 'نشط').length, color: 'text-purple-700', bg: 'bg-purple-50' },
        ].map(s => (
          <Card key={s.label} className={`${s.bg} border-0`}>
            <CardContent className="p-3 text-center">
              <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="info" dir="rtl">
        <TabsList>
          <TabsTrigger value="info">المعلومات الأساسية</TabsTrigger>
          <TabsTrigger value="deed">بيانات الصك</TabsTrigger>
          <TabsTrigger value="owner">بيانات المالك</TabsTrigger>
          <TabsTrigger value="units">الوحدات ({units.length})</TabsTrigger>
          <TabsTrigger value="contracts">العقود ({contracts.length})</TabsTrigger>
          <TabsTrigger value="financial">الإعدادات المالية</TabsTrigger>
        </TabsList>

        {/* Basic Info */}
        <TabsContent value="info">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Building2 className="h-4 w-4 text-amber-500" />المعلومات الأساسية</CardTitle></CardHeader>
              <CardContent>
                <InfoRow label="اسم العقار" value={property.name} />
                <InfoRow label="نوع العقار" value={property.propertyType} />
                <InfoRow label="نوع المبنى" value={property.buildingType} />
                <InfoRow label="الاستخدام" value={property.propertyUsage} />
                <InfoRow label="الغرض" value={property.usagePurpose} />
                <InfoRow label="الحالة" value={property.status} />
                <InfoRow label="عدد الأدوار" value={property.floorsCount} />
                <InfoRow label="عدد المصاعد" value={property.elevatorsCount} />
                <InfoRow label="عدد مواقف السيارات" value={property.parkingCount} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><MapPin className="h-4 w-4 text-amber-500" />الموقع والعنوان</CardTitle></CardHeader>
              <CardContent>
                <InfoRow label="المنطقة" value={property.region} />
                <InfoRow label="المدينة" value={property.city} />
                <InfoRow label="الحي" value={property.district} />
                <InfoRow label="العنوان" value={property.address} />
                <InfoRow label="العنوان الوطني" value={property.nationalAddress} />
                <InfoRow label="رقم المبنى" value={property.buildingNumber} />
                <InfoRow label="اسم الشارع" value={property.streetName} />
                <InfoRow label="الرمز البريدي" value={property.postalCode} />
                <InfoRow label="الرقم الإضافي" value={property.additionalNumber} />
              </CardContent>
            </Card>
          </div>
          {property.notes && (
            <Card className="mt-4">
              <CardHeader><CardTitle className="text-base">ملاحظات</CardTitle></CardHeader>
              <CardContent><p className="text-sm text-slate-700">{property.notes}</p></CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Deed Info */}
        <TabsContent value="deed">
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><FileText className="h-4 w-4 text-amber-500" />بيانات الصك والملكية</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8">
                <div>
                  <InfoRow label="رقم الصك" value={property.deedNumber} />
                  <InfoRow label="نوع الصك" value={property.deedType} />
                  <InfoRow label="تاريخ الصك" value={property.deedIssueDate ? new Date(property.deedIssueDate).toLocaleDateString('ar-SA') : null} />
                  <InfoRow label="جهة الإصدار" value={property.deedIssuer} />
                  <InfoRow label="رقم الوثيقة" value={property.documentNumber} />
                  <InfoRow label="رقم القطعة" value={property.plotNumber} />
                  <InfoRow label="رقم المخطط" value={property.planNumber} />
                  <InfoRow label="مساحة الصك (م²)" value={property.deedArea ? String(property.deedArea) : null} />
                </div>
                <div>
                  <InfoRow label="رقم التسجيل العيني" value={property.realEstateRegistrationNumber} />
                  <InfoRow label="تاريخ التسجيل العيني" value={property.realEstateRegistrationDate ? new Date(property.realEstateRegistrationDate).toLocaleDateString('ar-SA') : null} />
                  <InfoRow label="حالة التسجيل" value={property.realEstateRegistrationStatus} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Owner Info */}
        <TabsContent value="owner">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><User className="h-4 w-4 text-amber-500" />بيانات المالك</CardTitle></CardHeader>
              <CardContent>
                <InfoRow label="اسم المالك" value={property.ownerName} />
                <InfoRow label="رقم الهوية" value={property.ownerIdentity} />
                <InfoRow label="الجنسية" value={property.ownerNationality} />
                <InfoRow label="نوع الملكية" value={property.ownerType} />
                <InfoRow label="نسبة الملكية" value={property.ownershipPercentage ? `${property.ownershipPercentage}%` : null} />
                <InfoRow label="مساحة الملكية (م²)" value={property.ownershipArea ? String(property.ownershipArea) : null} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Settings className="h-4 w-4 text-amber-500" />إدارة رسوم الإدارة</CardTitle></CardHeader>
              <CardContent>
                <InfoRow label="نوع رسوم الإدارة" value={property.managementFeeType} />
                <InfoRow label="نسبة/مبلغ الإدارة" value={property.managementFeeRate ? `${property.managementFeeRate}%` : null} />
                <InfoRow label="مبلغ الإدارة الثابت" value={property.managementFeeAmount ? `${property.managementFeeAmount} ريال` : null} />
                <InfoRow label="نسبة احتياطي الصيانة" value={property.maintenanceReserveRate ? `${property.maintenanceReserveRate}%` : null} />
                <InfoRow label="نسبة الضريبة" value={property.vatRate ? `${property.vatRate}%` : null} />
                <InfoRow label="وسيط العقار" value={property.brokerName} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Units */}
        <TabsContent value="units">
          {units.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground">
              <Home className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p>لا توجد وحدات مسجلة لهذا العقار</p>
            </CardContent></Card>
          ) : (
            <div className="space-y-2">
              {units.map(unit => (
                <Card key={unit.id} className="border hover:shadow-sm transition-all">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="p-2 bg-slate-50 rounded-lg">
                      <Home className="h-5 w-5 text-slate-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-slate-900">وحدة {unit.unitNumber}</span>
                        <Badge variant="outline">{unit.unitType}</Badge>
                        <Badge className={
                          unit.status === 'مؤجرة' ? 'bg-green-100 text-green-700' :
                          unit.status === 'متاحة' ? 'bg-blue-100 text-blue-700' :
                          unit.status === 'محجوزة' ? 'bg-amber-100 text-amber-700' :
                          'bg-red-100 text-red-700'
                        }>{unit.status}</Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        {unit.floor && <span>الدور: {unit.floor}</span>}
                        {unit.area && <span>{unit.area} م²</span>}
                        {unit.rooms && <span>{unit.rooms} غرف</span>}
                        {unit.bathrooms && <span>{unit.bathrooms} دورات مياه</span>}
                      </div>
                    </div>
                    {unit.rentPrice && (
                      <div className="text-right">
                        <div className="font-bold text-amber-600">{parseFloat(String(unit.rentPrice)).toLocaleString('ar-SA')} ريال</div>
                        <div className="text-xs text-muted-foreground">الإيجار السنوي</div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Contracts */}
        <TabsContent value="contracts">
          {contracts.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground">
              <FileText className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p>لا توجد عقود مسجلة لهذا العقار</p>
            </CardContent></Card>
          ) : (
            <div className="space-y-2">
              {contracts.map(contract => (
                <Card key={contract.id} className="border hover:shadow-sm transition-all cursor-pointer" onClick={() => navigate(`/contracts/${contract.id}`)}>
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="p-2 bg-slate-50 rounded-lg">
                      <FileText className="h-5 w-5 text-slate-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold font-mono text-slate-900">{contract.contractNumber}</span>
                        <Badge className={
                          contract.status === 'نشط' ? 'bg-green-100 text-green-700' :
                          contract.status === 'منتهي' ? 'bg-slate-100 text-slate-600' :
                          contract.status === 'ملغي' ? 'bg-red-100 text-red-700' :
                          'bg-amber-100 text-amber-700'
                        }>{contract.status}</Badge>
                        <Badge variant="outline">{contract.contractType}</Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        {contract.tenantName && <span>{contract.tenantName}</span>}
                        {contract.unitNumber && <span>وحدة: {contract.unitNumber}</span>}
                        {contract.startDate && <span>{new Date(contract.startDate).toLocaleDateString('ar-SA')}</span>}
                        {contract.endDate && <span>← {new Date(contract.endDate).toLocaleDateString('ar-SA')}</span>}
                      </div>
                    </div>
                    {contract.totalContractValue && parseFloat(String(contract.totalContractValue)) > 0 && (
                      <div className="text-right">
                        <div className="font-bold text-slate-900">{parseFloat(String(contract.totalContractValue)).toLocaleString('ar-SA')} ريال</div>
                        <div className="text-xs text-muted-foreground">قيمة العقد</div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Financial Settings */}
        <TabsContent value="financial">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-base">الإجماليات</CardTitle></CardHeader>
              <CardContent>
                <InfoRow label="إجمالي الوحدات" value={property.totalUnits} />
                <InfoRow label="إجمالي العقود" value={property.totalContracts} />
                <InfoRow label="الوحدات المؤجرة" value={property.rentedUnits} />
                <InfoRow label="الوحدات المتاحة" value={property.availableUnits} />
                <InfoRow label="الوحدات المحجوزة" value={property.reservedUnits} />
                <InfoRow label="إجمالي مبالغ العقود" value={property.totalContractAmount ? `${parseFloat(String(property.totalContractAmount)).toLocaleString('ar-SA')} ريال` : null} />
                <InfoRow label="إجمالي رسوم التوثيق" value={property.totalDocumentationFees ? `${parseFloat(String(property.totalDocumentationFees)).toLocaleString('ar-SA')} ريال` : null} />
                <InfoRow label="إجمالي رسوم الوساطة" value={property.totalBrokerageFees ? `${parseFloat(String(property.totalBrokerageFees)).toLocaleString('ar-SA')} ريال` : null} />
              </CardContent>
            </Card>
            {property.hasOwnersAssociation ? (
              <Card>
                <CardHeader><CardTitle className="text-base">اتحاد الملاك</CardTitle></CardHeader>
                <CardContent>
                  <InfoRow label="اسم الاتحاد" value={property.associationName} />
                  <InfoRow label="رقم تسجيل الاتحاد" value={property.associationRegNumber} />
                  <InfoRow label="الحالة" value={property.associationStatus} />
                  <InfoRow label="رئيس الاتحاد" value={property.associationPresidentName} />
                  <InfoRow label="هاتف الرئيس" value={property.associationPresidentPhone} />
                  <InfoRow label="مدير العقار" value={property.propertyManagerName} />
                  <InfoRow label="هاتف المدير" value={property.propertyManagerPhone} />
                  <InfoRow label="إجمالي رسوم الاتحاد" value={property.associationTotalFees ? `${parseFloat(String(property.associationTotalFees)).toLocaleString('ar-SA')} ريال` : null} />
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground text-sm">
                  لا يوجد اتحاد ملاك لهذا العقار
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
