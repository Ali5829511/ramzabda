import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Building2, FileText, CheckCircle, Clock, AlertCircle,
  Link2, RefreshCw, Download, Upload, Shield, Globe, Zap
} from "lucide-react";

const ejarFeatures = [
  {
    icon: <FileText className="h-5 w-5 text-blue-600" />,
    title: "تسجيل العقود",
    description: "تسجيل عقود الإيجار إلكترونياً في منصة إيجار الحكومية",
    status: "متاح",
    color: "border-blue-200 bg-blue-50",
  },
  {
    icon: <Shield className="h-5 w-5 text-green-600" />,
    title: "التحقق من الهوية",
    description: "التحقق من هوية المستأجر والمالك عبر أبشر",
    status: "متاح",
    color: "border-green-200 bg-green-50",
  },
  {
    icon: <CheckCircle className="h-5 w-5 text-purple-600" />,
    title: "توثيق العقود",
    description: "توثيق العقود إلكترونياً وإصدار الوثيقة الرسمية",
    status: "متاح",
    color: "border-purple-200 bg-purple-50",
  },
  {
    icon: <RefreshCw className="h-5 w-5 text-amber-600" />,
    title: "تجديد العقود",
    description: "تجديد عقود الإيجار المنتهية عبر المنصة",
    status: "متاح",
    color: "border-amber-200 bg-amber-50",
  },
  {
    icon: <AlertCircle className="h-5 w-5 text-red-600" />,
    title: "بلاغات الإخلاء",
    description: "تقديم بلاغات الإخلاء وإدارة النزاعات",
    status: "قريباً",
    color: "border-red-200 bg-red-50",
  },
  {
    icon: <Download className="h-5 w-5 text-gray-600" />,
    title: "استيراد العقود",
    description: "استيراد العقود المسجلة في إيجار إلى المنصة",
    status: "قريباً",
    color: "border-gray-200 bg-gray-50",
  },
];

const contractSteps = [
  { step: 1, title: "إدخال بيانات العقد", desc: "أدخل بيانات المالك والمستأجر والوحدة" },
  { step: 2, title: "التحقق من الهوية", desc: "التحقق من هوية الأطراف عبر أبشر" },
  { step: 3, title: "مراجعة الشروط", desc: "مراجعة شروط العقد والموافقة عليها" },
  { step: 4, title: "التوثيق الإلكتروني", desc: "توثيق العقد وإصدار الرقم المرجعي" },
  { step: 5, title: "الدفع الإلكتروني", desc: "دفع رسوم التوثيق عبر البوابة" },
  { step: 6, title: "استلام الوثيقة", desc: "استلام وثيقة العقد الموثقة" },
];

function EjarContractForm() {
  const [form, setForm] = useState({
    contractNumber: "",
    landlordId: "",
    tenantId: "",
    propertyAddress: "",
    rentAmount: "",
    startDate: "",
    endDate: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.info("سيتم توجيهك إلى منصة إيجار لإتمام التسجيل", {
      description: "هذه الميزة تتطلب ربط حساب إيجار الخاص بالشركة",
      duration: 5000,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>رقم العقد</Label>
          <Input value={form.contractNumber} onChange={e => setForm(p => ({ ...p, contractNumber: e.target.value }))} placeholder="سيتم توليده تلقائياً" />
        </div>
        <div>
          <Label>هوية المالك</Label>
          <Input value={form.landlordId} onChange={e => setForm(p => ({ ...p, landlordId: e.target.value }))} placeholder="رقم الهوية الوطنية" />
        </div>
        <div>
          <Label>هوية المستأجر</Label>
          <Input value={form.tenantId} onChange={e => setForm(p => ({ ...p, tenantId: e.target.value }))} placeholder="رقم الهوية / الإقامة" />
        </div>
        <div>
          <Label>قيمة الإيجار السنوي (ريال)</Label>
          <Input type="number" value={form.rentAmount} onChange={e => setForm(p => ({ ...p, rentAmount: e.target.value }))} />
        </div>
        <div>
          <Label>تاريخ بداية العقد</Label>
          <Input type="date" value={form.startDate} onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))} />
        </div>
        <div>
          <Label>تاريخ نهاية العقد</Label>
          <Input type="date" value={form.endDate} onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))} />
        </div>
        <div className="col-span-2">
          <Label>عنوان العقار</Label>
          <Input value={form.propertyAddress} onChange={e => setForm(p => ({ ...p, propertyAddress: e.target.value }))} placeholder="المدينة، الحي، رقم المبنى" />
        </div>
      </div>
      <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 gap-2">
        <Link2 className="h-4 w-4" />
        إرسال إلى منصة إيجار
      </Button>
    </form>
  );
}

export default function EjarIntegration() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">تكامل منصة إيجار</h1>
          <p className="text-muted-foreground mt-1">ربط المنصة بخدمات إيجار الحكومية لتوثيق العقود إلكترونياً</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={() => window.open('https://ejar.sa', '_blank')}>
            <Globe className="h-4 w-4" />
            زيارة منصة إيجار
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 gap-2" onClick={() => toast.info("يرجى التواصل مع فريق الدعم لتفعيل التكامل")}>
            <Zap className="h-4 w-4" />
            تفعيل التكامل
          </Button>
        </div>
      </div>

      {/* Status Banner */}
      <Card className="border-blue-300 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Building2 className="h-8 w-8 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-blue-800 text-lg">منصة إيجار - وزارة الإسكان</h3>
              <p className="text-blue-700 text-sm">منصة حكومية سعودية لتوثيق عقود الإيجار وحماية حقوق الأطراف</p>
            </div>
            <div className="text-left">
              <Badge className="bg-amber-100 text-amber-700 mb-1">في انتظار الربط</Badge>
              <p className="text-xs text-muted-foreground">تواصل مع الدعم للتفعيل</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Features Grid */}
      <div>
        <h2 className="text-lg font-bold text-gray-800 mb-4">الخدمات المتاحة</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ejarFeatures.map((feature, i) => (
            <Card key={i} className={`${feature.color} border`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    {feature.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-800">{feature.title}</h3>
                      <Badge className={feature.status === 'متاح' ? 'bg-green-100 text-green-700 text-xs' : 'bg-gray-100 text-gray-600 text-xs'}>
                        {feature.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Tabs defaultValue="register" dir="rtl">
        <TabsList className="mb-4">
          <TabsTrigger value="register">تسجيل عقد جديد</TabsTrigger>
          <TabsTrigger value="steps">خطوات التوثيق</TabsTrigger>
          <TabsTrigger value="sync">مزامنة البيانات</TabsTrigger>
        </TabsList>

        <TabsContent value="register">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                تسجيل عقد إيجار جديد في المنصة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                <AlertCircle className="h-4 w-4 inline ml-1" />
                يتطلب تسجيل العقد في إيجار توفر حساب موثق في منصة إيجار وأبشر لجميع الأطراف
              </div>
              <EjarContractForm />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="steps">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">خطوات توثيق عقد الإيجار</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {contractSteps.map((step) => (
                  <div key={step.step} className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg border">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {step.step}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">{step.title}</h4>
                      <p className="text-sm text-muted-foreground">{step.desc}</p>
                    </div>
                    <CheckCircle className="h-5 w-5 text-gray-300 mr-auto flex-shrink-0 mt-1" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sync">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <RefreshCw className="h-5 w-5 text-green-600" />
                مزامنة البيانات مع إيجار
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg border">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-semibold">استيراد العقود من إيجار</h4>
                    <p className="text-sm text-muted-foreground">جلب جميع العقود المسجلة في إيجار وإضافتها للمنصة</p>
                  </div>
                  <Button variant="outline" className="gap-2" onClick={() => toast.info("يتطلب ربط حساب إيجار أولاً")}>
                    <Download className="h-4 w-4" />
                    استيراد
                  </Button>
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg border">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-semibold">تصدير العقود إلى إيجار</h4>
                    <p className="text-sm text-muted-foreground">رفع العقود المحلية إلى منصة إيجار للتوثيق</p>
                  </div>
                  <Button variant="outline" className="gap-2" onClick={() => toast.info("يتطلب ربط حساب إيجار أولاً")}>
                    <Upload className="h-4 w-4" />
                    تصدير
                  </Button>
                </div>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-2">لتفعيل التكامل الكامل مع إيجار:</h4>
                <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                  <li>تسجيل الشركة في منصة إيجار كوسيط عقاري</li>
                  <li>الحصول على مفتاح API من إيجار</li>
                  <li>إضافة المفتاح في إعدادات التكاملات</li>
                  <li>اختبار الاتصال والتحقق من الصلاحيات</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
