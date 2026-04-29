import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Building2, FileText, CheckCircle, AlertCircle,
  Link2, RefreshCw, Download, Upload, Shield,
  KeyRound, User, IdCard, Wifi, WifiOff, ChevronRight, ExternalLink, Eye, EyeOff, Save
} from "lucide-react";

const ejarServices = [
  { icon: FileText, title: "تسجيل العقود", desc: "تسجيل عقود الإيجار إلكترونياً في إيجار", available: true, color: "text-blue-600 bg-blue-50" },
  { icon: Shield, title: "التحقق من الهوية", desc: "التحقق من هوية المستأجر والمالك عبر أبشر", available: true, color: "text-green-600 bg-green-50" },
  { icon: CheckCircle, title: "توثيق العقود", desc: "توثيق العقود وإصدار الوثيقة الرسمية", available: true, color: "text-purple-600 bg-purple-50" },
  { icon: RefreshCw, title: "تجديد العقود", desc: "تجديد عقود الإيجار المنتهية عبر المنصة", available: true, color: "text-amber-600 bg-amber-50" },
  { icon: AlertCircle, title: "بلاغات الإخلاء", desc: "تقديم بلاغات الإخلاء وإدارة النزاعات", available: false, color: "text-red-600 bg-red-50" },
  { icon: Download, title: "استيراد العقود", desc: "استيراد العقود المسجلة من إيجار", available: false, color: "text-gray-600 bg-gray-50" },
];

const contractSteps = [
  { step: 1, title: "إدخال بيانات العقد", desc: "أدخل بيانات المالك والمستأجر والوحدة" },
  { step: 2, title: "التحقق من الهوية", desc: "التحقق من هوية الأطراف عبر أبشر" },
  { step: 3, title: "مراجعة الشروط", desc: "مراجعة شروط العقد والموافقة عليها" },
  { step: 4, title: "التوثيق الإلكتروني", desc: "توثيق العقد وإصدار الرقم المرجعي" },
  { step: 5, title: "الدفع الإلكتروني", desc: "دفع رسوم التوثيق عبر البوابة" },
  { step: 6, title: "استلام الوثيقة", desc: "استلام وثيقة العقد الموثقة" },
];

function EjarContractForm({ disabled }: { disabled?: boolean }) {
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
          <Input disabled={disabled} value={form.contractNumber} onChange={e => setForm(p => ({ ...p, contractNumber: e.target.value }))} placeholder="سيتم توليده تلقائياً" />
        </div>
        <div>
          <Label>هوية المالك</Label>
          <Input disabled={disabled} value={form.landlordId} onChange={e => setForm(p => ({ ...p, landlordId: e.target.value }))} placeholder="رقم الهوية الوطنية" />
        </div>
        <div>
          <Label>هوية المستأجر</Label>
          <Input disabled={disabled} value={form.tenantId} onChange={e => setForm(p => ({ ...p, tenantId: e.target.value }))} placeholder="رقم الهوية / الإقامة" />
        </div>
        <div>
          <Label>قيمة الإيجار السنوي (ريال)</Label>
          <Input disabled={disabled} type="number" value={form.rentAmount} onChange={e => setForm(p => ({ ...p, rentAmount: e.target.value }))} />
        </div>
        <div>
          <Label>تاريخ بداية العقد</Label>
          <Input disabled={disabled} type="date" value={form.startDate} onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))} />
        </div>
        <div>
          <Label>تاريخ نهاية العقد</Label>
          <Input disabled={disabled} type="date" value={form.endDate} onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))} />
        </div>
        <div className="col-span-2">
          <Label>عنوان العقار</Label>
          <Input disabled={disabled} value={form.propertyAddress} onChange={e => setForm(p => ({ ...p, propertyAddress: e.target.value }))} placeholder="المدينة، الحي، رقم المبنى" />
        </div>
      </div>
      <Button disabled={disabled} type="submit" className="w-full bg-blue-600 hover:bg-blue-700 gap-2">
        <Link2 className="h-4 w-4" />
        إرسال إلى منصة إيجار
      </Button>
    </form>
  );
}

export default function EjarIntegration() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ licenseNumber: "", username: "", password: "" });
  const [isDirty, setIsDirty] = useState(false);

  const configQuery = trpc.ejar.config.useQuery();
  const utils = trpc.useUtils();

  const saveMutation = trpc.ejar.saveConfig.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      setIsDirty(false);
      utils.ejar.config.invalidate();
    },
    onError: () => toast.error("فشل حفظ البيانات"),
  });

  const testMutation = trpc.ejar.testConnection.useMutation({
    onSuccess: (data) => {
      if (data.success) toast.success(data.message);
      else toast.error(data.message);
    },
  });

  useEffect(() => {
    if (configQuery.data) {
      setFormData({
        licenseNumber: configQuery.data.licenseNumber || "",
        username: configQuery.data.username || "",
        password: configQuery.data.password || "",
      });
    }
  }, [configQuery.data]);

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handleSave = () => {
    saveMutation.mutate(formData);
  };

  const config = configQuery.data;
  const isConfigured = !!(formData.licenseNumber && formData.username && formData.password);

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">تكامل منصة إيجار</h1>
          <p className="text-muted-foreground mt-1">ربط المنصة بخدمات إيجار الحكومية لتوثيق العقود إلكترونياً</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleSave}
            disabled={saveMutation.isPending || !isDirty}
            className="bg-blue-600 hover:bg-blue-700 gap-2"
          >
            <Save className={`h-4 w-4 ${saveMutation.isPending ? "animate-pulse" : ""}`} />
            {saveMutation.isPending ? "جاري الحفظ..." : "حفظ البيانات"}
          </Button>
          <Button
            onClick={() => testMutation.mutate()}
            disabled={testMutation.isPending || !isConfigured}
            className="bg-green-600 hover:bg-green-700 gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${testMutation.isPending ? "animate-spin" : ""}`} />
            {testMutation.isPending ? "جاري المزامنة..." : "مزامنة"}
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => window.open("https://ejar.sa", "_blank")}>
            <ExternalLink className="h-4 w-4" />
            زيارة إيجار
          </Button>
        </div>
      </div>

      {/* Connection Status */}
      <Card className={`border-2 ${isConfigured ? "border-green-300 bg-gradient-to-l from-green-50 to-emerald-50" : "border-amber-300 bg-gradient-to-l from-amber-50 to-yellow-50"}`}>
        <CardContent className="p-5">
          <div className="flex items-center gap-5">
            <div className={`p-4 rounded-2xl ${isConfigured ? "bg-green-100" : "bg-amber-100"}`}>
              <Building2 className={`h-10 w-10 ${isConfigured ? "text-green-600" : "text-amber-600"}`} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h3 className="font-bold text-lg text-gray-800">منصة إيجار - وزارة الإسكان</h3>
                <Badge className={isConfigured ? "bg-green-100 text-green-700 border-green-200" : "bg-amber-100 text-amber-700 border-amber-200"}>
                  {isConfigured ? <><Wifi className="h-3 w-3 ml-1 inline" />مربوط</> : <><WifiOff className="h-3 w-3 ml-1 inline" />غير مربوط</>}
                </Badge>
              </div>
              <p className="text-sm text-gray-600">منصة حكومية سعودية لتوثيق عقود الإيجار وحماية حقوق الأطراف</p>
              {isDirty && (
                <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  يوجد تغييرات غير محفوظة — اضغط "حفظ البيانات" لتطبيقها
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Credentials */}
      <Card className="border border-slate-200 overflow-hidden">
        <CardContent className="p-0">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="p-6 bg-gradient-to-l from-blue-50 to-cyan-50 border-b lg:border-b-0 lg:border-l border-slate-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-blue-100">
                  <Shield className="h-5 w-5 text-blue-700" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">متطلبات تكامل إيجار</h3>
                  <p className="text-sm text-slate-600">بيانات إلزامية للتفعيل والربط مع منصة إيجار</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between p-2 rounded-md bg-white/70 border border-slate-200">
                  <span className="text-slate-700">رقم الرخصة</span>
                  <Badge variant="outline" className={formData.licenseNumber ? "border-green-300 text-green-700" : "border-red-300 text-red-700"}>
                    {formData.licenseNumber ? "مكتمل" : "مطلوب"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-2 rounded-md bg-white/70 border border-slate-200">
                  <span className="text-slate-700">اسم المستخدم</span>
                  <Badge variant="outline" className={formData.username ? "border-green-300 text-green-700" : "border-red-300 text-red-700"}>
                    {formData.username ? "مكتمل" : "مطلوب"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-2 rounded-md bg-white/70 border border-slate-200">
                  <span className="text-slate-700">كلمة المرور</span>
                  <Badge variant="outline" className={formData.password ? "border-green-300 text-green-700" : "border-red-300 text-red-700"}>
                    {formData.password ? "مكتمل" : "مطلوب"}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4 bg-white">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-slate-900">بيانات التكامل</h4>
                <Badge className={isConfigured ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}>
                  {isConfigured ? "جاهز للاستخدام" : "يلزم استكمال البيانات"}
                </Badge>
              </div>

              <div className="space-y-3">
                <div>
                  <Label className="mb-1.5 block">رقم الرخصة *</Label>
                  <div className="relative">
                    <IdCard className="h-4 w-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                    <Input
                      className="pr-9 font-semibold tracking-wide"
                      value={formData.licenseNumber}
                      onChange={e => handleChange("licenseNumber", e.target.value)}
                      placeholder="1200009558"
                    />
                  </div>
                </div>

                <div>
                  <Label className="mb-1.5 block">اسم المستخدم *</Label>
                  <div className="relative">
                    <User className="h-4 w-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                    <Input
                      className="pr-9 font-semibold"
                      value={formData.username}
                      onChange={e => handleChange("username", e.target.value)}
                      placeholder="bo-1010601471"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div>
                  <Label className="mb-1.5 block">كلمة المرور *</Label>
                  <div className="relative">
                    <KeyRound className="h-4 w-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                    <Input
                      className="pr-9 pl-10 font-mono"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={e => handleChange("password", e.target.value)}
                      placeholder="كلمة المرور"
                      dir="ltr"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-slate-700"
                      aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleSave}
                disabled={saveMutation.isPending || !isDirty}
                className="w-full bg-blue-600 hover:bg-blue-700 gap-2"
              >
                <Save className={`h-4 w-4 ${saveMutation.isPending ? "animate-pulse" : ""}`} />
                {saveMutation.isPending ? "جاري الحفظ..." : isDirty ? "حفظ التغييرات" : "البيانات محفوظة"}
              </Button>

              <p className="text-xs text-muted-foreground">* عدّل البيانات ثم اضغط "حفظ" لتحديثها، ثم "مزامنة" لاختبار الاتصال مع منصة إيجار.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="services" dir="rtl">
        <TabsList className="mb-4">
          <TabsTrigger value="services">الخدمات المتاحة</TabsTrigger>
          <TabsTrigger value="register">تسجيل عقد</TabsTrigger>
          <TabsTrigger value="steps">خطوات التوثيق</TabsTrigger>
          <TabsTrigger value="sync">المزامنة</TabsTrigger>
        </TabsList>

        <TabsContent value="services">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ejarServices.map((service, i) => (
              <Card key={i} className="border hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2.5 rounded-xl ${service.color}`}>
                      <service.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-800 text-sm">{service.title}</h3>
                        <Badge className={service.available ? "bg-green-100 text-green-700 text-xs" : "bg-gray-100 text-gray-500 text-xs"}>
                          {service.available ? "متاح" : "قريباً"}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{service.desc}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="register">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                تسجيل عقد إيجار جديد
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!isConfigured && (
                <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  بيانات الربط مع إيجار غير مكتملة. يرجى مراجعة إعدادات الخادم.
                </div>
              )}
              <EjarContractForm disabled={!isConfigured} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="steps">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">خطوات توثيق عقد الإيجار</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {contractSteps.map((step, idx) => (
                  <div key={step.step}>
                    <div className="flex items-center gap-4 py-2">
                      <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                        {step.step}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800 text-sm">{step.title}</h4>
                        <p className="text-xs text-muted-foreground">{step.desc}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-300 flex-shrink-0" />
                    </div>
                    {idx < contractSteps.length - 1 && <Separator />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sync">
          <div className="space-y-4">
            <Card>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">استيراد العقود من إيجار</h4>
                  <p className="text-sm text-muted-foreground">جلب جميع العقود المسجلة في إيجار وإضافتها للمنصة</p>
                </div>
                <Button variant="outline" className="gap-2" disabled={!isConfigured}
                  onClick={() => isConfigured ? toast.info("جاري الاستيراد...") : toast.error("يتطلب ربط حساب إيجار أولاً")}>
                  <Download className="h-4 w-4" />استيراد
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">تصدير العقود إلى إيجار</h4>
                  <p className="text-sm text-muted-foreground">رفع العقود المحلية إلى منصة إيجار للتوثيق</p>
                </div>
                <Button variant="outline" className="gap-2" disabled={!isConfigured}
                  onClick={() => isConfigured ? toast.info("جاري التصدير...") : toast.error("يتطلب ربط حساب إيجار أولاً")}>
                  <Upload className="h-4 w-4" />تصدير
                </Button>
              </CardContent>
            </Card>
            <Card className="border-slate-200 bg-slate-50">
              <CardContent className="p-4">
                <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-slate-600" />
                  حالة الربط الحالية
                </h4>
                <div className="space-y-2">
                  {[
                    { label: "رقم الرخصة", ok: !!config?.licenseNumber },
                    { label: "اسم المستخدم", ok: !!config?.username },
                    { label: "كلمة المرور", ok: isConfigured },
                  ].map(({ label, ok }, i) => (
                    <div key={i}>
                      <div className="flex items-center justify-between text-sm py-1">
                        <span className="text-gray-600">{label}</span>
                        <span className={`font-medium ${ok ? "text-green-700" : "text-red-500"}`}>
                          {ok ? "✓ مُعيَّن" : "✗ مفقود"}
                        </span>
                      </div>
                      {i < 2 && <Separator />}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
