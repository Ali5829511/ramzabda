import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Settings as SettingsIcon, Save, Building2, Phone, Mail, Globe, Shield, Bell, Palette } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

const LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663538106461/mVj998sunPYSva3VMbB5zS/ramz-logo_a0de6d1f.png";

function SettingField({ label, settingKey, value, onChange, type = 'text', placeholder = '' }: any) {
  return (
    <div>
      <Label className="text-sm font-medium">{label}</Label>
      <Input
        type={type}
        value={value}
        onChange={e => onChange(settingKey, e.target.value)}
        placeholder={placeholder}
        className="mt-1"
      />
    </div>
  );
}

export default function Settings() {
  const utils = trpc.useUtils();
  const { data: settingsData, isLoading } = trpc.settings.list.useQuery();

  const [localSettings, setLocalSettings] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  // Build a settings map from server data + local changes
  const getSettingValue = (key: string, defaultVal = '') => {
    if (key in localSettings) return localSettings[key];
    const found = settingsData?.find(s => s.key === key);
    return found?.value ?? defaultVal;
  };

  const handleChange = (key: string, value: string) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  const upsertMutation = trpc.settings.upsert.useMutation();

  const handleSave = async (category: string, keys: Array<{ key: string; label: string }>) => {
    setSaving(true);
    try {
      for (const { key, label } of keys) {
        const value = getSettingValue(key);
        await upsertMutation.mutateAsync({ key, value, label, category });
      }
      await utils.settings.list.invalidate();
      toast.success('تم حفظ الإعدادات');
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) return <div className="text-center py-10 text-muted-foreground">جاري التحميل...</div>;

  const companyFields = [
    { key: 'company_name', label: 'اسم الشركة' },
    { key: 'company_cr', label: 'السجل التجاري' },
    { key: 'company_vat', label: 'الرقم الضريبي' },
    { key: 'company_address', label: 'العنوان' },
    { key: 'company_phone', label: 'رقم الهاتف' },
    { key: 'company_email', label: 'البريد الإلكتروني' },
    { key: 'company_website', label: 'الموقع الإلكتروني' },
    { key: 'company_license', label: 'رقم رخصة الفال' },
  ];

  const financialFields = [
    { key: 'vat_rate', label: 'نسبة ضريبة القيمة المضافة (%)' },
    { key: 'management_fee_rate', label: 'نسبة رسوم الإدارة (%)' },
    { key: 'late_fee_rate', label: 'نسبة غرامة التأخر (%)' },
    { key: 'bank_account_iban', label: 'رقم الآيبان (IBAN)' },
    { key: 'bank_account_name', label: 'اسم صاحب الحساب' },
    { key: 'bank_name', label: 'اسم البنك' },
  ];

  const notificationFields = [
    { key: 'notify_payment_days_before', label: 'تنبيه الدفع قبل (أيام)' },
    { key: 'notify_contract_expiry_days', label: 'تنبيه انتهاء العقد قبل (أيام)' },
    { key: 'whatsapp_sender', label: 'رقم واتساب الإرسال' },
    { key: 'sms_sender_id', label: 'معرف مرسل الرسائل النصية' },
    { key: 'email_sender', label: 'بريد الإرسال' },
  ];

  const ejarFields = [
    { key: 'ejar_license_number', label: 'رقم الترخيص' },
    { key: 'ejar_username', label: 'اسم المستخدم' },
    { key: 'ejar_company_name', label: 'اسم الشركة في إيجار' },
  ];

  return (
    <div className="space-y-5 animate-fadeIn">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-amber-50 rounded-lg">
          <SettingsIcon className="h-6 w-6 text-amber-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">الإعدادات العامة</h1>
          <p className="text-sm text-muted-foreground">إعدادات النظام وبيانات الشركة</p>
        </div>
      </div>

      <Tabs defaultValue="company" dir="rtl">
        <TabsList className="w-full justify-start flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="company" className="gap-2"><Building2 className="h-4 w-4" />بيانات الشركة</TabsTrigger>
          <TabsTrigger value="financial" className="gap-2"><Shield className="h-4 w-4" />الإعدادات المالية</TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2"><Bell className="h-4 w-4" />التنبيهات والتواصل</TabsTrigger>
          <TabsTrigger value="ejar" className="gap-2"><Globe className="h-4 w-4" />تكامل إيجار</TabsTrigger>
        </TabsList>

        {/* Company Info */}
        <TabsContent value="company">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-amber-500" />
                بيانات وملف الشركة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-6 p-4 bg-slate-50 rounded-xl">
                <img src={LOGO_URL} alt="شعار الشركة" className="h-16 w-16 object-contain" />
                <div>
                  <div className="font-bold text-slate-900 text-lg">{getSettingValue('company_name', 'رمز الإبداع لإدارة الأملاك')}</div>
                  <div className="text-sm text-muted-foreground">{getSettingValue('company_address', 'المملكة العربية السعودية')}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {companyFields.map(f => (
                  <SettingField key={f.key} label={f.label} settingKey={f.key} value={getSettingValue(f.key)} onChange={handleChange} />
                ))}
              </div>
              <Button
                onClick={() => handleSave('company', companyFields)}
                disabled={saving}
                className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold gap-2"
              >
                <Save className="h-4 w-4" /> {saving ? 'جاري الحفظ...' : 'حفظ بيانات الشركة'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Financial Settings */}
        <TabsContent value="financial">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-amber-500" />
                الإعدادات المالية والبنكية
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {financialFields.map(f => (
                  <SettingField key={f.key} label={f.label} settingKey={f.key} value={getSettingValue(f.key)} onChange={handleChange} />
                ))}
              </div>
              <Button
                onClick={() => handleSave('financial', financialFields)}
                disabled={saving}
                className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold gap-2"
              >
                <Save className="h-4 w-4" /> {saving ? 'جاري الحفظ...' : 'حفظ الإعدادات المالية'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-amber-500" />
                إعدادات التنبيهات والتواصل
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {notificationFields.map(f => (
                  <SettingField key={f.key} label={f.label} settingKey={f.key} value={getSettingValue(f.key)} onChange={handleChange} />
                ))}
              </div>
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-sm text-amber-800 font-medium">ملاحظة</p>
                <p className="text-xs text-amber-700 mt-1">لتفعيل الإرسال الفعلي عبر واتساب أو SMS يتطلب ربط مزود خدمة خارجي (مثل Twilio أو 4Jawaly).</p>
              </div>
              <Button
                onClick={() => handleSave('notifications', notificationFields)}
                disabled={saving}
                className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold gap-2"
              >
                <Save className="h-4 w-4" /> {saving ? 'جاري الحفظ...' : 'حفظ إعدادات التنبيهات'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Ejar Integration */}
        <TabsContent value="ejar">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-amber-500" />
                إعدادات تكامل منصة إيجار
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm font-medium text-blue-800">منصة إيجار الحكومي</p>
                <p className="text-xs text-blue-700 mt-1">
                  يمكنك ربط المنصة بحساب إيجار الخاص بك لمزامنة العقود ومتابعة حالتها.
                  تأكد من الحصول على بيانات الدخول من الهيئة العامة للإسكان.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {ejarFields.map(f => (
                  <SettingField key={f.key} label={f.label} settingKey={f.key} value={getSettingValue(f.key)} onChange={handleChange} />
                ))}
              </div>
              <Button
                onClick={() => handleSave('ejar', ejarFields)}
                disabled={saving}
                className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold gap-2"
              >
                <Save className="h-4 w-4" /> {saving ? 'جاري الحفظ...' : 'حفظ إعدادات إيجار'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
