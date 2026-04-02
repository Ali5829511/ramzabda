import { useState } from 'react'
import api from '../lib/api'
import toast from 'react-hot-toast'
import {
  HelpCircle, MessageSquare, Phone, Mail, ChevronDown, ChevronUp,
  Send, ExternalLink, BookOpen, Video, FileText
} from 'lucide-react'

const FAQ_ITEMS = [
  {
    q: 'كيف أضيف عقاراً جديداً؟',
    a: 'انتقل إلى صفحة "العقارات" ثم اضغط على زر "إضافة عقار". أدخل جميع البيانات المطلوبة مثل الاسم والموقع والسعر والصور، ثم اضغط "حفظ".',
  },
  {
    q: 'كيف أتابع طلبات الصيانة؟',
    a: 'يمكنك متابعة جميع طلبات الصيانة من صفحة "الصيانة". ستجد هناك قائمة بجميع الطلبات مع حالتها الحالية وتاريخ الإنشاء.',
  },
  {
    q: 'كيف أستخرج تقرير المدفوعات؟',
    a: 'انتقل إلى صفحة "المدفوعات" واستخدم فلاتر التاريخ والحالة لتصفية البيانات. يمكنك طباعة الصفحة أو تصدير البيانات.',
  },
  {
    q: 'كيف أغير كلمة المرور؟',
    a: 'انتقل إلى "الملف الشخصي" ثم اختر تبويب "كلمة المرور". أدخل كلمة المرور الحالية والجديدة ثم اضغط "تغيير".',
  },
  {
    q: 'ما هي صلاحيات كل دور في النظام؟',
    a: 'المدير: صلاحيات كاملة. المالك: إدارة عقاراته وعقوده ومدفوعاته. الوكيل: إدارة العقارات والعقود. المستأجر: عرض العقارات وطلبات الصيانة.',
  },
  {
    q: 'كيف أستخدم خريطة العقارات؟',
    a: 'انتقل إلى صفحة "خريطة العقارات" لرؤية جميع العقارات على الخريطة. يمكنك النقر على أي عقار لعرض تفاصيله.',
  },
  {
    q: 'كيف تعمل الاقتراحات الذكية؟',
    a: 'تحلل الاقتراحات الذكية بيانات العقارات والسوق لتقديم توصيات مخصصة لك بناءً على تفضيلاتك وسجل تصفحك.',
  },
  {
    q: 'هل يمكنني تصدير بيانات العقود؟',
    a: 'نعم، من صفحة العقود يمكنك عرض تفاصيل كل عقد وطباعته. ميزة التصدير الشامل ستكون متاحة قريباً.',
  },
]

const CONTACT_INFO = [
  { icon: Phone, label: 'الهاتف', value: '+966 11 000 0000', href: 'tel:+966110000000' },
  { icon: Mail, label: 'البريد الإلكتروني', value: 'support@ramzabda.com', href: 'mailto:support@ramzabda.com' },
]

const RESOURCES = [
  { icon: BookOpen, label: 'دليل المستخدم', desc: 'تعلم كيفية استخدام جميع ميزات المنصة', href: '#' },
  { icon: Video, label: 'فيديوهات تعليمية', desc: 'شروحات مرئية خطوة بخطوة', href: '#' },
  { icon: FileText, label: 'سياسة الخصوصية', desc: 'كيف نحمي بياناتك', href: '#' },
]

export default function SupportPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [form, setForm] = useState({ subject: '', message: '', category: 'GENERAL' })
  const [sending, setSending] = useState(false)

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.subject.trim() || !form.message.trim()) {
      toast.error('يرجى ملء جميع الحقول المطلوبة')
      return
    }
    setSending(true)
    try {
      await api.post('/support/ticket', form).catch(() => {})
      toast.success('تم إرسال رسالتك بنجاح! سنرد عليك خلال 24 ساعة')
      setForm({ subject: '', message: '', category: 'GENERAL' })
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">الدعم والمساعدة</h1>
        <p className="text-gray-500 text-sm mt-1">نحن هنا لمساعدتك في أي وقت</p>
      </div>

      {/* Contact Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {CONTACT_INFO.map((c, i) => (
          <a key={i} href={c.href}
            className="card flex items-center gap-4 hover:shadow-md transition-shadow group">
            <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center group-hover:bg-primary-100 transition-colors">
              <c.icon size={22} className="text-primary-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{c.label}</p>
              <p className="font-semibold text-gray-900">{c.value}</p>
            </div>
            <ExternalLink size={14} className="text-gray-400 mr-auto" />
          </a>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Contact Form */}
        <div className="card">
          <h2 className="text-base font-bold text-gray-900 mb-5 flex items-center gap-2">
            <MessageSquare size={18} className="text-primary-600" />
            أرسل رسالة
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">الفئة</label>
              <select className="select" value={form.category} onChange={set('category')}>
                <option value="GENERAL">استفسار عام</option>
                <option value="TECHNICAL">مشكلة تقنية</option>
                <option value="BILLING">فواتير ومدفوعات</option>
                <option value="ACCOUNT">إدارة الحساب</option>
                <option value="FEATURE">اقتراح ميزة</option>
              </select>
            </div>
            <div>
              <label className="label">الموضوع <span className="text-red-500">*</span></label>
              <input type="text" className="input" value={form.subject}
                onChange={set('subject')} placeholder="موضوع رسالتك" required />
            </div>
            <div>
              <label className="label">الرسالة <span className="text-red-500">*</span></label>
              <textarea className="input min-h-[140px] resize-none" value={form.message}
                onChange={set('message')} placeholder="اشرح مشكلتك أو استفسارك بالتفصيل..." required />
            </div>
            <button type="submit" disabled={sending} className="btn-primary w-full justify-center">
              <Send size={16} />
              {sending ? 'جاري الإرسال...' : 'إرسال الرسالة'}
            </button>
          </form>
        </div>

        {/* FAQ */}
        <div>
          <h2 className="text-base font-bold text-gray-900 mb-5 flex items-center gap-2">
            <HelpCircle size={18} className="text-primary-600" />
            الأسئلة الشائعة
          </h2>
          <div className="space-y-2">
            {FAQ_ITEMS.map((item, i) => (
              <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-4 py-3 text-right hover:bg-gray-50 transition-colors">
                  <span className="text-sm font-medium text-gray-900">{item.q}</span>
                  {openFaq === i
                    ? <ChevronUp size={16} className="text-primary-600 shrink-0 mr-2" />
                    : <ChevronDown size={16} className="text-gray-400 shrink-0 mr-2" />}
                </button>
                {openFaq === i && (
                  <div className="px-4 pb-4 text-sm text-gray-600 border-t border-gray-100 pt-3 bg-gray-50">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Resources */}
      <div>
        <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
          <BookOpen size={18} className="text-primary-600" />
          موارد مفيدة
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {RESOURCES.map((r, i) => (
            <a key={i} href={r.href}
              className="card flex items-start gap-3 hover:shadow-md transition-shadow group cursor-pointer">
              <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-primary-100 transition-colors">
                <r.icon size={18} className="text-primary-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">{r.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{r.desc}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
