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
  MessageSquare, Mail, Phone, Send, Clock, CheckCircle, XCircle,
  Bell, Smartphone, Globe, Users, FileText, AlertCircle
} from "lucide-react";

function SendMessageForm({ onSuccess }: { onSuccess: () => void }) {
  const [form, setForm] = useState({
    channel: "whatsapp",
    recipient: "",
    subject: "",
    message: "",
    recipientType: "custom",
  });

  const sendMutation = trpc.communicationLog.send.useMutation({
    onSuccess: () => {
      toast.success("تم إرسال الرسالة بنجاح");
      setForm({ channel: "whatsapp", recipient: "", subject: "", message: "", recipientType: "custom" });
      onSuccess();
    },
    onError: (e) => toast.error(e.message),
  });

  const channelIcons: Record<string, any> = {
    whatsapp: <MessageSquare className="h-4 w-4 text-green-600" />,
    sms: <Smartphone className="h-4 w-4 text-blue-600" />,
    email: <Mail className="h-4 w-4 text-red-600" />,
  };

  const channelLabels: Record<string, string> = {
    whatsapp: "واتساب",
    sms: "رسالة نصية",
    email: "بريد إلكتروني",
  };

  return (
    <form onSubmit={(e: React.FormEvent) => { e.preventDefault(); sendMutation.mutate(form as any); }} className="space-y-4">
      <div>
        <Label>قناة التواصل</Label>
        <div className="grid grid-cols-3 gap-2 mt-2">
          {['whatsapp', 'sms', 'email'].map(ch => (
            <button
              key={ch}
              type="button"
              onClick={() => setForm(p => ({ ...p, channel: ch }))}
              className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all ${form.channel === ch ? 'border-amber-500 bg-amber-50' : 'border-gray-200 hover:border-gray-300'}`}
            >
              {channelIcons[ch]}
              <span className="text-sm font-medium">{channelLabels[ch]}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label>نوع المستلم</Label>
        <Select value={form.recipientType} onValueChange={v => setForm(p => ({ ...p, recipientType: v }))}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="custom">رقم / بريد مخصص</SelectItem>
            <SelectItem value="all_tenants">جميع المستأجرين</SelectItem>
            <SelectItem value="overdue_tenants">المستأجرون المتأخرون</SelectItem>
            <SelectItem value="all_owners">جميع الملاك</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {form.recipientType === 'custom' && (
        <div>
          <Label>{form.channel === 'email' ? 'البريد الإلكتروني' : 'رقم الجوال'}</Label>
          <Input
            value={form.recipient}
            onChange={e => setForm(p => ({ ...p, recipient: e.target.value }))}
            placeholder={form.channel === 'email' ? 'example@email.com' : '05xxxxxxxx'}
            required={form.recipientType === 'custom'}
          />
        </div>
      )}

      {form.channel === 'email' && (
        <div>
          <Label>الموضوع</Label>
          <Input value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} />
        </div>
      )}

      <div>
        <Label>نص الرسالة *</Label>
        <Textarea
          value={form.message}
          onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
          rows={4}
          required
          placeholder="اكتب نص الرسالة هنا..."
        />
      </div>

      <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-sm text-amber-800">
        <AlertCircle className="h-4 w-4 inline ml-1" />
        {form.recipientType === 'all_tenants' && "سيتم إرسال الرسالة لجميع المستأجرين المسجلين"}
        {form.recipientType === 'overdue_tenants' && "سيتم إرسال الرسالة للمستأجرين الذين لديهم دفعات متأخرة"}
        {form.recipientType === 'all_owners' && "سيتم إرسال الرسالة لجميع الملاك المسجلين"}
        {form.recipientType === 'custom' && "سيتم إرسال الرسالة للمستلم المحدد فقط"}
      </div>

      <Button type="submit" className="w-full bg-amber-600 hover:bg-amber-700 gap-2" disabled={sendMutation.isPending}>
        <Send className="h-4 w-4" />
        {sendMutation.isPending ? "جاري الإرسال..." : "إرسال الرسالة"}
      </Button>
    </form>
  );
}

export default function Communications() {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);

  const { data, refetch } = trpc.communicationLog.list.useQuery({ page, limit: 15 });

  const paymentReminderMutation = trpc.quickActions.sendPaymentReminders.useMutation({
    onSuccess: (res) => { toast.success(res.message); refetch(); },
    onError: (e) => toast.error(e.message),
  });
  const contractExpiryMutation = trpc.quickActions.sendContractExpiryNotices.useMutation({
    onSuccess: (res) => { toast.success(res.message); refetch(); },
    onError: (e) => toast.error(e.message),
  });
  const welcomeMutation = trpc.quickActions.sendWelcomeMessages.useMutation({
    onSuccess: (res) => { toast.success(res.message); refetch(); },
    onError: (e) => toast.error(e.message),
  });
  const monthlyReportMutation = trpc.quickActions.sendMonthlyReports.useMutation({
    onSuccess: (res) => { toast.success(res.message); refetch(); },
    onError: (e) => toast.error(e.message),
  });
  const messages = data?.data || [];
  const total = data?.total || 0;

  const channelConfig: Record<string, { icon: any; color: string; label: string }> = {
    whatsapp: { icon: <MessageSquare className="h-4 w-4" />, color: "text-green-600 bg-green-50", label: "واتساب" },
    sms: { icon: <Smartphone className="h-4 w-4" />, color: "text-blue-600 bg-blue-50", label: "رسالة نصية" },
    email: { icon: <Mail className="h-4 w-4" />, color: "text-red-600 bg-red-50", label: "بريد إلكتروني" },
  };

  const statusConfig: Record<string, { icon: any; color: string; label: string }> = {
    sent: { icon: <CheckCircle className="h-3 w-3" />, color: "bg-green-100 text-green-700", label: "مُرسل" },
    pending: { icon: <Clock className="h-3 w-3" />, color: "bg-yellow-100 text-yellow-700", label: "قيد الإرسال" },
    failed: { icon: <XCircle className="h-3 w-3" />, color: "bg-red-100 text-red-700", label: "فشل" },
  };

  const sentCount = messages.filter((m: any) => m.status === 'sent').length;
  const pendingCount = messages.filter((m: any) => m.status === 'pending').length;
  const failedCount = messages.filter((m: any) => m.status === 'failed').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">التواصل والإشعارات</h1>
          <p className="text-muted-foreground mt-1">إرسال رسائل واتساب والبريد الإلكتروني والرسائل النصية</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-amber-600 hover:bg-amber-700 gap-2">
              <Send className="h-4 w-4" />
              إرسال رسالة
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg" dir="rtl">
            <DialogHeader>
              <DialogTitle>إرسال رسالة جديدة</DialogTitle>
            </DialogHeader>
            <SendMessageForm onSuccess={() => { setOpen(false); refetch(); }} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Integration Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <MessageSquare className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="font-semibold">واتساب</p>
                <p className="text-xs text-muted-foreground">WhatsApp Business</p>
              </div>
              <Badge className="mr-auto bg-green-100 text-green-700 text-xs">نشط</Badge>
            </div>
            <p className="text-sm text-muted-foreground">إرسال إشعارات الدفع والعقود والتذكيرات عبر واتساب</p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Smartphone className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold">رسائل SMS</p>
                <p className="text-xs text-muted-foreground">خدمة الرسائل النصية</p>
              </div>
              <Badge className="mr-auto bg-green-100 text-green-700 text-xs">نشط</Badge>
            </div>
            <p className="text-sm text-muted-foreground">إرسال رسائل نصية قصيرة للمستأجرين والملاك</p>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-gradient-to-br from-red-50 to-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Mail className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="font-semibold">البريد الإلكتروني</p>
                <p className="text-xs text-muted-foreground">Email Service</p>
              </div>
              <Badge className="mr-auto bg-green-100 text-green-700 text-xs">نشط</Badge>
            </div>
            <p className="text-sm text-muted-foreground">إرسال العقود والتقارير والإشعارات عبر البريد</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">إجراءات سريعة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button
              variant="outline"
              className="h-auto py-3 flex-col gap-2 border-amber-200 hover:bg-amber-50"
              onClick={() => paymentReminderMutation.mutate()}
              disabled={paymentReminderMutation.isPending}
            >
              <Bell className="h-5 w-5 text-amber-600" />
              <span className="text-xs">{paymentReminderMutation.isPending ? 'جاري...' : 'تذكير الدفع المتأخر'}</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-3 flex-col gap-2 border-blue-200 hover:bg-blue-50"
              onClick={() => contractExpiryMutation.mutate()}
              disabled={contractExpiryMutation.isPending}
            >
              <FileText className="h-5 w-5 text-blue-600" />
              <span className="text-xs">{contractExpiryMutation.isPending ? 'جاري...' : 'إشعار انتهاء العقد'}</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-3 flex-col gap-2 border-green-200 hover:bg-green-50"
              onClick={() => welcomeMutation.mutate({})}
              disabled={welcomeMutation.isPending}
            >
              <Users className="h-5 w-5 text-green-600" />
              <span className="text-xs">{welcomeMutation.isPending ? 'جاري...' : 'ترحيب بمستأجر جديد'}</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-3 flex-col gap-2 border-purple-200 hover:bg-purple-50"
              onClick={() => monthlyReportMutation.mutate()}
              disabled={monthlyReportMutation.isPending}
            >
              <Globe className="h-5 w-5 text-purple-600" />
              <span className="text-xs">{monthlyReportMutation.isPending ? 'جاري...' : 'تقرير شهري للملاك'}</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{total}</p>
            <p className="text-sm text-muted-foreground">إجمالي الرسائل</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{sentCount}</p>
            <p className="text-sm text-muted-foreground">مُرسلة</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
            <p className="text-sm text-muted-foreground">قيد الإرسال</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-red-600">{failedCount}</p>
            <p className="text-sm text-muted-foreground">فشل الإرسال</p>
          </CardContent>
        </Card>
      </div>

      {/* Messages Log */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">سجل الرسائل</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-right p-3 font-semibold">القناة</th>
                  <th className="text-right p-3 font-semibold">المستلم</th>
                  <th className="text-right p-3 font-semibold">الرسالة</th>
                  <th className="text-right p-3 font-semibold">التاريخ</th>
                  <th className="text-right p-3 font-semibold">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {messages.map((msg: any) => {
                  const ch = channelConfig[msg.channel] || channelConfig.sms;
                  const st = statusConfig[msg.status] || statusConfig.pending;
                  return (
                    <tr key={msg.id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="p-3">
                        <span className={`flex items-center gap-1 w-fit px-2 py-1 rounded-full text-xs font-medium ${ch.color}`}>
                          {ch.icon}
                          {ch.label}
                        </span>
                      </td>
                      <td className="p-3 text-muted-foreground">{msg.recipient || msg.recipientType}</td>
                      <td className="p-3 max-w-xs truncate">{msg.message}</td>
                      <td className="p-3 text-muted-foreground">
                        {msg.createdAt ? new Date(msg.createdAt).toLocaleString('ar-SA') : "-"}
                      </td>
                      <td className="p-3">
                        <Badge className={`${st.color} flex items-center gap-1 w-fit`}>
                          {st.icon}
                          {st.label}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
                {messages.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center p-8 text-muted-foreground">
                      <Send className="h-8 w-8 mx-auto mb-2 opacity-30" />
                      <p>لا توجد رسائل مرسلة حتى الآن</p>
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
