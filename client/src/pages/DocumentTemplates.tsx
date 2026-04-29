import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Plus, FileText, MessageSquare, Mail, Phone, Printer, Edit, Trash2, Copy, Eye } from "lucide-react";

const CATEGORY_COLORS: Record<string, string> = {
  "عقد_إيجار": "bg-blue-100 text-blue-800",
  "عقد_بيع": "bg-green-100 text-green-800",
  "عقد_إدارة": "bg-purple-100 text-purple-800",
  "إشعار": "bg-yellow-100 text-yellow-800",
  "فاتورة": "bg-orange-100 text-orange-800",
  "تقرير": "bg-gray-100 text-gray-800",
  "أخرى": "bg-red-100 text-red-800",
};

const TYPE_ICONS: Record<string, React.ReactNode> = {
  "واتساب": <MessageSquare className="h-4 w-4 text-green-600" />,
  "بريد_إلكتروني": <Mail className="h-4 w-4 text-blue-600" />,
  "رسالة_نصية": <Phone className="h-4 w-4 text-purple-600" />,
  "PDF": <FileText className="h-4 w-4 text-red-600" />,
  "طباعة": <Printer className="h-4 w-4 text-gray-600" />,
};

const DEFAULT_TEMPLATES = [
  {
    name: "إشعار استحقاق الإيجار",
    category: "إشعار",
    type: "واتساب",
    subject: "تذكير بموعد الإيجار",
    content: `السلام عليكم ورحمة الله وبركاته

عزيزي/عزيزتي {{tenant_name}}،

نود تذكيركم بأن موعد سداد إيجار الوحدة رقم {{unit_number}} في عقار {{property_name}} قد حلّ.

تفاصيل الدفعة:
- المبلغ المستحق: {{amount}} ريال
- تاريخ الاستحقاق: {{due_date}}
- رقم العقد: {{contract_number}}

يرجى التكرم بالسداد في أقرب وقت ممكن.

شركة رمز الإبداع لإدارة الأملاك
📞 {{company_phone}}`,
    variables: '["tenant_name","unit_number","property_name","amount","due_date","contract_number","company_phone"]',
  },
  {
    name: "ترحيب بمستأجر جديد",
    category: "إشعار",
    type: "واتساب",
    subject: "مرحباً بك في مجمعنا",
    content: `السلام عليكم ورحمة الله وبركاته

عزيزي/عزيزتي {{tenant_name}}،

يسعدنا الترحيب بكم في عقار {{property_name}} - الوحدة رقم {{unit_number}}.

تفاصيل عقدكم:
- تاريخ بداية العقد: {{start_date}}
- تاريخ نهاية العقد: {{end_date}}
- قيمة الإيجار الشهري: {{monthly_rent}} ريال

للتواصل مع الإدارة:
📞 {{company_phone}}
📧 {{company_email}}

نتمنى لكم إقامة طيبة ومريحة.

شركة رمز الإبداع لإدارة الأملاك`,
    variables: '["tenant_name","property_name","unit_number","start_date","end_date","monthly_rent","company_phone","company_email"]',
  },
  {
    name: "إشعار انتهاء العقد",
    category: "إشعار",
    type: "واتساب",
    subject: "إشعار انتهاء عقد الإيجار",
    content: `السلام عليكم ورحمة الله وبركاته

عزيزي/عزيزتي {{tenant_name}}،

نودّ إعلامكم بأن عقد إيجار الوحدة رقم {{unit_number}} في عقار {{property_name}} سينتهي بتاريخ {{end_date}}.

يرجى التواصل معنا لتجديد العقد أو ترتيب إخلاء الوحدة قبل {{days_remaining}} يوم من تاريخ الانتهاء.

للتواصل: {{company_phone}}

شركة رمز الإبداع لإدارة الأملاك`,
    variables: '["tenant_name","unit_number","property_name","end_date","days_remaining","company_phone"]',
  },
  {
    name: "عقد إيجار سكني",
    category: "عقد_إيجار",
    type: "PDF",
    subject: "عقد إيجار وحدة سكنية",
    content: `عقد إيجار وحدة سكنية

بسم الله الرحمن الرحيم

تم الاتفاق بين كل من:

الطرف الأول (المؤجر): {{landlord_name}}
رقم الهوية: {{landlord_id}}
رقم الجوال: {{landlord_phone}}

الطرف الثاني (المستأجر): {{tenant_name}}
رقم الهوية: {{tenant_id}}
رقم الجوال: {{tenant_phone}}

على تأجير الوحدة السكنية رقم {{unit_number}} في عقار {{property_name}} الواقع في {{property_address}}.

مدة الإيجار: من {{start_date}} إلى {{end_date}}
قيمة الإيجار السنوي: {{annual_rent}} ريال سعودي
قيمة الإيجار الشهري: {{monthly_rent}} ريال سعودي
مبلغ التأمين: {{deposit}} ريال سعودي

الشروط والأحكام:
1. يلتزم المستأجر بسداد الإيجار في موعده المحدد.
2. لا يحق للمستأجر التنازل عن العقد أو التأجير من الباطن.
3. يلتزم المستأجر بالحفاظ على الوحدة وعدم إحداث أي تعديلات.
4. يتحمل المستأجر تكاليف الصيانة الناتجة عن الإهمال.

توقيع المؤجر: ________________  التاريخ: {{date}}
توقيع المستأجر: ________________  التاريخ: {{date}}`,
    variables: '["landlord_name","landlord_id","landlord_phone","tenant_name","tenant_id","tenant_phone","unit_number","property_name","property_address","start_date","end_date","annual_rent","monthly_rent","deposit","date"]',
  },
  {
    name: "إشعار تأخر السداد",
    category: "إشعار",
    type: "رسالة_نصية",
    subject: "تأخر سداد الإيجار",
    content: `عزيزي {{tenant_name}}، نذكركم بتأخر سداد إيجار {{property_name}} - الوحدة {{unit_number}} بمبلغ {{amount}} ريال. يرجى السداد فوراً. رمز الإبداع: {{company_phone}}`,
    variables: '["tenant_name","property_name","unit_number","amount","company_phone"]',
  },
  {
    name: "تقرير مالي شهري للمالك",
    category: "تقرير",
    type: "بريد_إلكتروني",
    subject: "التقرير المالي الشهري - {{month_year}}",
    content: `السيد/السيدة {{owner_name}} المحترم/ة،

السلام عليكم ورحمة الله وبركاته،

يسرّنا تقديم التقرير المالي الشهري لعقاراتكم لشهر {{month_year}}.

ملخص الأداء المالي:
- إجمالي الإيرادات المحصّلة: {{total_collected}} ريال
- إجمالي المبالغ المتأخرة: {{total_overdue}} ريال
- عدد الوحدات المؤجرة: {{occupied_units}}
- عدد الوحدات الشاغرة: {{vacant_units}}
- نسبة الإشغال: {{occupancy_rate}}%

تفاصيل العقارات مرفقة بهذا التقرير.

مع تحيات،
شركة رمز الإبداع لإدارة الأملاك
{{company_phone}} | {{company_email}}`,
    variables: '["owner_name","month_year","total_collected","total_overdue","occupied_units","vacant_units","occupancy_rate","company_phone","company_email"]',
  },
];

export default function DocumentTemplates() {
  const [activeTab, setActiveTab] = useState("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [form, setForm] = useState({
    name: "", category: "أخرى" as any, type: "PDF" as any,
    subject: "", content: "", variables: "",
  });

  const { data, refetch } = trpc.documentTemplates.list.useQuery({});
  const createMutation = trpc.documentTemplates.create.useMutation({
    onSuccess: () => { toast.success("تم إنشاء القالب بنجاح"); setIsCreateOpen(false); refetch(); },
    onError: () => toast.error("فشل إنشاء القالب"),
  });
  const deleteMutation = trpc.documentTemplates.delete.useMutation({
    onSuccess: () => { toast.success("تم حذف القالب"); refetch(); },
  });

  const templates = data?.data || [];
  const allTemplates = templates.length > 0 ? templates : DEFAULT_TEMPLATES.map((t, i) => ({ ...t, id: -(i + 1), isActive: 1, usageCount: 0, createdAt: new Date(), updatedAt: new Date(), createdBy: null }));

  const filtered = activeTab === "all" ? allTemplates : allTemplates.filter((t: any) => t.type === activeTab);

  const handleAddDefaults = async () => {
    for (const t of DEFAULT_TEMPLATES) {
      await createMutation.mutateAsync(t as any);
    }
    toast.success("تم إضافة القوالب الافتراضية");
  };

  const copyContent = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success("تم نسخ محتوى القالب");
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6" dir="rtl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">قوالب المستندات والإشعارات</h1>
            <p className="text-gray-500 mt-1">إدارة قوالب العقود والإشعارات والرسائل</p>
          </div>
          <div className="flex gap-2">
            {templates.length === 0 && (
              <Button variant="outline" onClick={handleAddDefaults} className="border-amber-500 text-amber-700 hover:bg-amber-50">
                <Plus className="h-4 w-4 ml-2" />
                إضافة القوالب الافتراضية
              </Button>
            )}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button className="bg-amber-600 hover:bg-amber-700 text-white">
                  <Plus className="h-4 w-4 ml-2" />
                  قالب جديد
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl" dir="rtl">
                <DialogHeader>
                  <DialogTitle>إنشاء قالب جديد</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>اسم القالب *</Label>
                      <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="اسم القالب" />
                    </div>
                    <div>
                      <Label>الفئة</Label>
                      <Select value={form.category} onValueChange={v => setForm({ ...form, category: v as any })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {["عقد_إيجار","عقد_بيع","عقد_إدارة","إشعار","فاتورة","تقرير","أخرى"].map(c => (
                            <SelectItem key={c} value={c}>{c.replace(/_/g, ' ')}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>نوع الإرسال</Label>
                      <Select value={form.type} onValueChange={v => setForm({ ...form, type: v as any })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {["واتساب","بريد_إلكتروني","رسالة_نصية","PDF","طباعة"].map(t => (
                            <SelectItem key={t} value={t}>{t.replace(/_/g, ' ')}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>الموضوع / العنوان</Label>
                      <Input value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} placeholder="عنوان الرسالة أو المستند" />
                    </div>
                  </div>
                  <div>
                    <Label>محتوى القالب *</Label>
                    <p className="text-xs text-gray-500 mb-1">استخدم {`{{variable_name}}`} للمتغيرات القابلة للاستبدال</p>
                    <Textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} rows={10} placeholder="اكتب محتوى القالب هنا..." className="font-mono text-sm" />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsCreateOpen(false)}>إلغاء</Button>
                    <Button onClick={() => createMutation.mutate(form)} disabled={!form.name || !form.content} className="bg-amber-600 hover:bg-amber-700 text-white">
                      حفظ القالب
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: "الكل", value: allTemplates.length, tab: "all", color: "bg-gray-50 border-gray-200" },
            { label: "واتساب", value: allTemplates.filter((t: any) => t.type === "واتساب").length, tab: "واتساب", color: "bg-green-50 border-green-200" },
            { label: "بريد إلكتروني", value: allTemplates.filter((t: any) => t.type === "بريد_إلكتروني").length, tab: "بريد_إلكتروني", color: "bg-blue-50 border-blue-200" },
            { label: "رسالة نصية", value: allTemplates.filter((t: any) => t.type === "رسالة_نصية").length, tab: "رسالة_نصية", color: "bg-purple-50 border-purple-200" },
            { label: "PDF / طباعة", value: allTemplates.filter((t: any) => t.type === "PDF" || t.type === "طباعة").length, tab: "PDF", color: "bg-red-50 border-red-200" },
          ].map(s => (
            <button key={s.tab} onClick={() => setActiveTab(s.tab)}
              className={`p-4 rounded-lg border-2 text-center transition-all ${s.color} ${activeTab === s.tab ? 'ring-2 ring-amber-500' : ''}`}>
              <div className="text-2xl font-bold">{s.value}</div>
              <div className="text-sm text-gray-600">{s.label}</div>
            </button>
          ))}
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((template: any) => (
            <Card key={template.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {TYPE_ICONS[template.type] || <FileText className="h-4 w-4" />}
                    <CardTitle className="text-sm font-semibold">{template.name}</CardTitle>
                  </div>
                  <Badge className={`text-xs ${CATEGORY_COLORS[template.category] || "bg-gray-100 text-gray-800"}`}>
                    {template.category?.replace(/_/g, ' ')}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-gray-500 line-clamp-3 mb-3 whitespace-pre-line">{template.content}</p>
                {template.subject && (
                  <p className="text-xs text-amber-700 mb-2">📌 {template.subject}</p>
                )}
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">
                    {template.type?.replace(/_/g, ' ')}
                  </Badge>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => { setSelectedTemplate(template); setIsPreviewOpen(true); }}>
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => copyContent(template.content)}>
                      <Copy className="h-3 w-3" />
                    </Button>
                    {template.id > 0 && (
                      <Button variant="ghost" size="sm" className="text-red-500" onClick={() => deleteMutation.mutate({ id: template.id })}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Preview Dialog */}
        <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <DialogContent className="max-w-2xl" dir="rtl">
            <DialogHeader>
              <DialogTitle>معاينة القالب: {selectedTemplate?.name}</DialogTitle>
            </DialogHeader>
            {selectedTemplate && (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Badge className={CATEGORY_COLORS[selectedTemplate.category] || "bg-gray-100"}>
                    {selectedTemplate.category?.replace(/_/g, ' ')}
                  </Badge>
                  <Badge variant="outline">{selectedTemplate.type?.replace(/_/g, ' ')}</Badge>
                </div>
                {selectedTemplate.subject && (
                  <div className="bg-amber-50 p-3 rounded-lg">
                    <span className="font-semibold text-amber-800">الموضوع: </span>
                    <span className="text-amber-700">{selectedTemplate.subject}</span>
                  </div>
                )}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <pre className="whitespace-pre-wrap text-sm font-sans text-gray-800 leading-relaxed">{selectedTemplate.content}</pre>
                </div>
                {selectedTemplate.variables && (
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-2">المتغيرات المستخدمة:</p>
                    <div className="flex flex-wrap gap-2">
                      {JSON.parse(selectedTemplate.variables).map((v: string) => (
                        <Badge key={v} variant="outline" className="text-xs font-mono">{`{{${v}}}`}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => copyContent(selectedTemplate.content)}>
                    <Copy className="h-4 w-4 ml-2" />
                    نسخ المحتوى
                  </Button>
                  <Button className="bg-amber-600 hover:bg-amber-700 text-white" onClick={() => window.print()}>
                    <Printer className="h-4 w-4 ml-2" />
                    طباعة
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
