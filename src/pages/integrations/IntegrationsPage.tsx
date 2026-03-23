import { useState } from 'react';
import {
  Zap, CheckCircle, Settings, ExternalLink,
  Globe, DollarSign, Building2,
  MessageCircle, BarChart2, Shield, Eye, EyeOff,
  Wifi
} from 'lucide-react';

// ─────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────
const INTEGRATIONS = [
  // ── حكومية / عقارية ──
  {
    id: 'ejar', cat: 'gov', name: 'منصة إيجار', nameEn: 'Ejar',
    logo: '🏛️', color: 'bg-green-50 border-green-200',
    headerColor: 'from-green-600 to-teal-600',
    description: 'ربط كامل مع منصة إيجار لتوثيق العقود وإدارة التأجير',
    status: 'connected',
    features: ['توثيق عقود الإيجار تلقائياً', 'استيراد بيانات العقود', 'تتبع حالة العقود', 'تحليل عقود PDF', 'إشعارات انتهاء العقود'],
    fields: [
      { key: 'username', label: 'اسم المستخدم', type: 'text', placeholder: 'اسم المستخدم في إيجار' },
      { key: 'password', label: 'كلمة المرور', type: 'password', placeholder: '••••••••' },
      { key: 'license', label: 'رقم رخصة الفال', type: 'text', placeholder: 'رقم رخصة هيئة العقار' },
    ],
    docs: 'https://www.ejar.sa',
  },
  {
    id: 'absher', cat: 'gov', name: 'أبشر للأعمال', nameEn: 'Absher Business',
    logo: '🇸🇦', color: 'bg-blue-50 border-blue-200',
    headerColor: 'from-blue-700 to-blue-600',
    description: 'التحقق من هويات المستأجرين والملاك وبياناتهم',
    status: 'available',
    features: ['التحقق من الهوية الوطنية', 'التحقق من الإقامة', 'ربط بيانات المقيم', 'التحقق من السجل التجاري'],
    fields: [
      { key: 'api_key', label: 'مفتاح API', type: 'password', placeholder: 'API Key من بوابة أبشر للأعمال' },
      { key: 'client_id', label: 'Client ID', type: 'text', placeholder: 'معرف التطبيق' },
    ],
    docs: 'https://business.absher.sa',
  },
  {
    id: 'redf', cat: 'gov', name: 'صندوق التنمية العقارية', nameEn: 'REDF',
    logo: '🏗️', color: 'bg-amber-50 border-amber-200',
    headerColor: 'from-amber-600 to-yellow-600',
    description: 'ربط مع صندوق التنمية العقارية لبرامج الدعم السكني',
    status: 'available',
    features: ['التحقق من أهلية التمويل', 'بيانات المستفيدين', 'متابعة طلبات التمويل'],
    fields: [
      { key: 'api_key', label: 'مفتاح API', type: 'password', placeholder: 'مفتاح API الصندوق' },
    ],
    docs: 'https://www.redf.gov.sa',
  },
  {
    id: 'sakani', cat: 'gov', name: 'منصة سكني', nameEn: 'Sakani',
    logo: '🏠', color: 'bg-teal-50 border-teal-200',
    headerColor: 'from-teal-600 to-cyan-600',
    description: 'استيراد مؤشرات الإيجار وأسعار السوق من منصة سكني',
    status: 'connected',
    features: ['مؤشرات أسعار الإيجار', 'أسعار السوق بالمنطقة', 'تحليل السوق العقاري', 'توقعات الأسعار'],
    fields: [],
    docs: 'https://sakani.sa/reports-and-data/rental-units',
  },
  // ── دفع إلكتروني ──
  {
    id: 'stcpay', cat: 'payment', name: 'STC Pay', nameEn: 'STC Pay',
    logo: '💜', color: 'bg-purple-50 border-purple-200',
    headerColor: 'from-purple-700 to-purple-600',
    description: 'قبول مدفوعات الإيجار عبر STC Pay',
    status: 'available',
    features: ['قبول مدفوعات فورية', 'إيصالات تلقائية', 'ربط مع حسابات الشركة', 'تسوية يومية'],
    fields: [
      { key: 'merchant_id', label: 'Merchant ID', type: 'text', placeholder: 'معرف التاجر' },
      { key: 'api_key', label: 'API Key', type: 'password', placeholder: 'مفتاح API' },
      { key: 'webhook', label: 'Webhook URL', type: 'text', placeholder: 'https://...' },
    ],
    docs: 'https://stcpay.com.sa',
  },
  {
    id: 'mada', cat: 'payment', name: 'مدى / بوابة الدفع', nameEn: 'Mada',
    logo: '💳', color: 'bg-green-50 border-green-200',
    headerColor: 'from-green-700 to-green-600',
    description: 'قبول مدفوعات بطاقات مدى وفيزا وماستركارد',
    status: 'available',
    features: ['مدى – فيزا – ماستركارد', 'دفع آمن', 'إيصالات إلكترونية', 'استرداد المدفوعات'],
    fields: [
      { key: 'merchant_id', label: 'Merchant ID', type: 'text', placeholder: 'معرف التاجر' },
      { key: 'secret_key', label: 'Secret Key', type: 'password', placeholder: 'مفتاح الأمان' },
      { key: 'mode', label: 'وضع التشغيل', type: 'select', options: ['sandbox', 'production'] },
    ],
    docs: 'https://mada.com.sa',
  },
  {
    id: 'urpay', cat: 'payment', name: 'Urpay', nameEn: 'Urpay',
    logo: '🟠', color: 'bg-orange-50 border-orange-200',
    headerColor: 'from-orange-600 to-amber-600',
    description: 'تحويلات مباشرة للملاك وسداد الإيجارات',
    status: 'available',
    features: ['تحويلات فورية', 'ربط الحسابات البنكية', 'تسوية أتوماتيكية'],
    fields: [
      { key: 'api_key', label: 'API Key', type: 'password', placeholder: 'مفتاح API' },
    ],
    docs: 'https://urpay.sa',
  },
  // ── واتساب / تواصل ──
  {
    id: 'whatsapp_biz', cat: 'comms', name: 'WhatsApp Business API', nameEn: 'WhatsApp Business',
    logo: '💬', color: 'bg-green-50 border-green-200',
    headerColor: 'from-green-600 to-green-500',
    description: 'إرسال إشعارات تلقائية للمستأجرين والملاك عبر واتساب',
    status: 'available',
    features: ['إشعارات تلقائية', 'قوالب رسائل جاهزة', 'تأكيد المواعيد', 'تذكير السداد', 'تحديثات الصيانة'],
    fields: [
      { key: 'phone_id', label: 'Phone Number ID', type: 'text', placeholder: 'معرف رقم الهاتف من Meta' },
      { key: 'token', label: 'Access Token', type: 'password', placeholder: 'Access Token' },
      { key: 'waba_id', label: 'WABA ID', type: 'text', placeholder: 'WhatsApp Business Account ID' },
    ],
    docs: 'https://developers.facebook.com/docs/whatsapp',
  },
  {
    id: 'msegat', cat: 'comms', name: 'Msegat — SMS', nameEn: 'Msegat',
    logo: '📱', color: 'bg-blue-50 border-blue-200',
    headerColor: 'from-blue-600 to-indigo-600',
    description: 'إرسال رسائل SMS للمستأجرين والملاك',
    status: 'connected',
    features: ['رسائل SMS جماعية', 'رسائل مخصصة', 'جدولة الإرسال', 'تقارير التسليم'],
    fields: [
      { key: 'username', label: 'اسم المستخدم', type: 'text', placeholder: 'اسم مستخدم Msegat' },
      { key: 'api_key', label: 'API Key', type: 'password', placeholder: 'مفتاح API' },
      { key: 'sender', label: 'اسم المرسل', type: 'text', placeholder: 'رمز_الإبداع' },
    ],
    docs: 'https://www.msegat.com',
  },
  {
    id: 'email', cat: 'comms', name: 'البريد الإلكتروني', nameEn: 'Email',
    logo: '📧', color: 'bg-indigo-50 border-indigo-200',
    headerColor: 'from-indigo-600 to-purple-600',
    description: 'إرسال التقارير والعقود والإشعارات بالبريد',
    status: 'available',
    features: ['إرسال العقود', 'التقارير الشهرية', 'إشعارات تلقائية', 'قوالب HTML'],
    fields: [
      { key: 'smtp_host', label: 'SMTP Host', type: 'text', placeholder: 'smtp.gmail.com' },
      { key: 'smtp_port', label: 'SMTP Port', type: 'text', placeholder: '587' },
      { key: 'email', label: 'البريد الإلكتروني', type: 'text', placeholder: 'info@ramzabdae.com' },
      { key: 'password', label: 'كلمة مرور التطبيق', type: 'password', placeholder: '••••••••' },
    ],
    docs: '',
  },
  // ── محاسبة / ERP ──
  {
    id: 'quickbooks', cat: 'accounting', name: 'QuickBooks', nameEn: 'QuickBooks',
    logo: '📊', color: 'bg-green-50 border-green-200',
    headerColor: 'from-green-700 to-emerald-600',
    description: 'ربط مع QuickBooks لمزامنة الحسابات والفواتير',
    status: 'available',
    features: ['مزامنة الفواتير', 'تتبع المصروفات', 'تقارير مالية', 'إدارة الضرائب'],
    fields: [
      { key: 'client_id', label: 'Client ID', type: 'text', placeholder: 'معرف العميل' },
      { key: 'client_secret', label: 'Client Secret', type: 'password', placeholder: 'سر العميل' },
      { key: 'realm_id', label: 'Company ID', type: 'text', placeholder: 'معرف الشركة' },
    ],
    docs: 'https://developer.intuit.com',
  },
  {
    id: 'zatca', cat: 'accounting', name: 'هيئة الزكاة والضريبة (فاتورة)', nameEn: 'ZATCA',
    logo: '🧾', color: 'bg-amber-50 border-amber-200',
    headerColor: 'from-amber-700 to-yellow-600',
    description: 'ربط مع منظومة الفوترة الإلكترونية ZATCA',
    status: 'available',
    features: ['إصدار فواتير ضريبية', 'فاتورة إلكترونية معتمدة', 'رمز QR الضريبي', 'أرشفة الفواتير'],
    fields: [
      { key: 'vat_number', label: 'الرقم الضريبي', type: 'text', placeholder: '3xxxxxxxxxx' },
      { key: 'csid', label: 'CSID', type: 'password', placeholder: 'شهادة الجهاز' },
    ],
    docs: 'https://zatca.gov.sa',
  },
  // ── خرائط / آخر ──
  {
    id: 'google_maps', cat: 'other', name: 'Google Maps', nameEn: 'Google Maps',
    logo: '🗺️', color: 'bg-red-50 border-red-200',
    headerColor: 'from-red-500 to-orange-500',
    description: 'عرض مواقع العقارات على الخريطة التفاعلية',
    status: 'connected',
    features: ['خريطة تفاعلية للعقارات', 'حساب المسافات', 'روابط الموقع', 'الاتجاهات'],
    fields: [
      { key: 'api_key', label: 'Google Maps API Key', type: 'password', placeholder: 'AIza...' },
    ],
    docs: 'https://developers.google.com/maps',
  },
  {
    id: 'nafath', cat: 'gov', name: 'نفاذ (التحقق بالهوية)', nameEn: 'Nafath',
    logo: '🔐', color: 'bg-cyan-50 border-cyan-200',
    headerColor: 'from-cyan-700 to-teal-600',
    description: 'التحقق من هوية المستأجرين والملاك عبر نفاذ',
    status: 'available',
    features: ['تسجيل دخول آمن', 'التحقق بالهوية الوطنية', 'توقيع إلكتروني معتمد'],
    fields: [
      { key: 'client_id', label: 'Client ID', type: 'text', placeholder: 'معرف التطبيق' },
      { key: 'secret', label: 'Client Secret', type: 'password', placeholder: 'سر التطبيق' },
    ],
    docs: 'https://nafath.sa',
  },
];

const catLabels: Record<string, string> = {
  gov: 'جهات حكومية وعقارية',
  payment: 'بوابات الدفع',
  comms: 'التواصل والإشعارات',
  accounting: 'المحاسبة والفوترة',
  other: 'أخرى',
};
const catIcons: Record<string, React.ReactNode> = {
  gov: <Building2 className="w-4 h-4" />,
  payment: <DollarSign className="w-4 h-4" />,
  comms: <MessageCircle className="w-4 h-4" />,
  accounting: <BarChart2 className="w-4 h-4" />,
  other: <Globe className="w-4 h-4" />,
};

// ─────────────────────────────────────────────
type Integration = typeof INTEGRATIONS[0];

function IntegrationCard({ intg, onConfigure }: { intg: Integration; onConfigure: (i: Integration) => void }) {
  const statusColor = intg.status === 'connected' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500';
  const statusLabel = intg.status === 'connected' ? 'متصل' : 'متاح للربط';
  return (
    <div className={`card hover:shadow-md transition-all border ${intg.color} flex flex-col`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-2xl shadow-sm shrink-0">{intg.logo}</div>
          <div>
            <p className="font-bold text-gray-800">{intg.name}</p>
            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${statusColor}`}>
              {intg.status === 'connected' ? '● ' : '○ '}{statusLabel}
            </span>
          </div>
        </div>
        {intg.docs && (
          <a href={intg.docs} target="_blank" rel="noopener noreferrer"
            className="text-gray-400 hover:text-gray-600">
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>
      <p className="text-xs text-gray-500 mb-3 leading-relaxed">{intg.description}</p>
      <ul className="space-y-1 mb-4 flex-1">
        {intg.features.slice(0, 4).map(f => (
          <li key={f} className="flex items-center gap-1.5 text-xs text-gray-600">
            <CheckCircle className="w-3 h-3 text-green-500 shrink-0" />{f}
          </li>
        ))}
        {intg.features.length > 4 && <li className="text-xs text-gray-400">+{intg.features.length - 4} ميزة أخرى</li>}
      </ul>
      <button onClick={() => onConfigure(intg)}
        className={`w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 ${intg.status === 'connected' ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gradient-to-l from-gray-800 to-gray-700 text-white hover:opacity-90'}`}>
        <Settings className="w-3.5 h-3.5" />
        {intg.status === 'connected' ? 'إدارة الربط' : 'ربط الآن'}
      </button>
    </div>
  );
}

function ConfigModal({ intg, onClose }: { intg: Integration; onClose: () => void }) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [show, setShow] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState(false);

  const set = (k: string, v: string) => setValues(p => ({ ...p, [k]: v }));
  const toggle = (k: string) => setShow(p => ({ ...p, [k]: !p[k] }));

  const save = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <div className={`bg-gradient-to-l ${intg.headerColor} rounded-t-2xl p-5 text-white`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{intg.logo}</span>
              <div>
                <h2 className="font-bold text-lg">{intg.name}</h2>
                <p className="text-white/70 text-xs">{intg.nameEn}</p>
              </div>
            </div>
            <button onClick={onClose} className="text-white/70 hover:text-white text-2xl leading-none">×</button>
          </div>
        </div>
        <div className="p-5 space-y-4">
          {intg.status === 'connected' && (
            <div className="flex items-center gap-2 bg-green-50 text-green-700 rounded-xl px-3 py-2 text-xs">
              <CheckCircle className="w-4 h-4" /> هذا التكامل متصل ويعمل بشكل صحيح
            </div>
          )}

          {intg.fields.length === 0 ? (
            <div className="text-center py-4 text-sm text-gray-500">
              <Globe className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p>هذا التكامل لا يتطلب إعداداً إضافياً.</p>
              {intg.docs && (
                <a href={intg.docs} target="_blank" rel="noopener noreferrer"
                  className="text-blue-600 text-xs flex items-center justify-center gap-1 mt-2 hover:underline">
                  <ExternalLink className="w-3 h-3" /> زيارة الموقع الرسمي
                </a>
              )}
            </div>
          ) : (
            <>
              <p className="text-xs text-gray-500">أدخل بيانات الاعتماد الخاصة بك</p>
              {intg.fields.map(f => (
                <div key={f.key}>
                  <label className="label">{f.label}</label>
                  {f.type === 'select' ? (
                    <select className="input-field text-sm" value={values[f.key] ?? ''} onChange={e => set(f.key, e.target.value)}>
                      <option value="">— اختر —</option>
                      {(f as { options?: string[] }).options?.map((o: string) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : (
                    <div className="relative">
                      <input
                        type={f.type === 'password' && !show[f.key] ? 'password' : 'text'}
                        className="input-field text-sm"
                        value={values[f.key] ?? ''}
                        onChange={e => set(f.key, e.target.value)}
                        placeholder={f.placeholder}
                      />
                      {f.type === 'password' && (
                        <button type="button" onClick={() => toggle(f.key)}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                          {show[f.key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
              {intg.docs && (
                <a href={intg.docs} target="_blank" rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                  <ExternalLink className="w-3 h-3" /> كيفية الحصول على بيانات API؟
                </a>
              )}
              <div className="flex gap-3 pt-1">
                <button onClick={onClose} className="btn-secondary flex-1 text-sm">إلغاء</button>
                <button onClick={save}
                  className="btn-primary flex-1 text-sm flex items-center justify-center gap-2">
                  {saved ? <><CheckCircle className="w-4 h-4" />تم الحفظ</> : <><Zap className="w-4 h-4" />حفظ وربط</>}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
export default function IntegrationsPage() {
  const [catFilter, setCatFilter] = useState('all');
  const [configuring, setConfiguring] = useState<Integration | null>(null);

  const connected = INTEGRATIONS.filter(i => i.status === 'connected').length;
  const available = INTEGRATIONS.filter(i => i.status === 'available').length;
  const cats = [...new Set(INTEGRATIONS.map(i => i.cat))];

  const filtered = INTEGRATIONS.filter(i => catFilter === 'all' || i.cat === catFilter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="section-title flex items-center gap-2">
          <Zap className="w-6 h-6 text-yellow-500" />
          التكاملات والربط الخارجي
        </h1>
        <p className="section-subtitle">ربط المنصة مع الأنظمة الحكومية وبوابات الدفع وخدمات التواصل</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="card flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <div><p className="text-2xl font-bold text-gray-800">{connected}</p><p className="text-xs text-gray-500">متصلة</p></div>
        </div>
        <div className="card flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
            <Wifi className="w-5 h-5 text-gray-500" />
          </div>
          <div><p className="text-2xl font-bold text-gray-800">{available}</p><p className="text-xs text-gray-500">متاحة للربط</p></div>
        </div>
        <div className="card flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <Globe className="w-5 h-5 text-blue-600" />
          </div>
          <div><p className="text-2xl font-bold text-gray-800">{INTEGRATIONS.length}</p><p className="text-xs text-gray-500">إجمالي التكاملات</p></div>
        </div>
        <div className="card flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
            <Shield className="w-5 h-5 text-purple-600" />
          </div>
          <div><p className="text-2xl font-bold text-gray-800">SSL</p><p className="text-xs text-gray-500">جميع البيانات مشفرة</p></div>
        </div>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setCatFilter('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold ${catFilter === 'all' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
          الكل ({INTEGRATIONS.length})
        </button>
        {cats.map(c => (
          <button key={c} onClick={() => setCatFilter(c)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1 ${catFilter === c ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {catIcons[c]} {catLabels[c]} ({INTEGRATIONS.filter(i => i.cat === c).length})
          </button>
        ))}
      </div>

      {/* Grid */}
      {cats.filter(c => catFilter === 'all' || c === catFilter).map(c => {
        const items = filtered.filter(i => i.cat === c);
        if (!items.length) return null;
        return (
          <div key={c}>
            <h2 className="text-sm font-bold text-gray-600 flex items-center gap-2 mb-3">
              {catIcons[c]} {catLabels[c]}
            </h2>
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
              {items.map(i => <IntegrationCard key={i.id} intg={i} onConfigure={setConfiguring} />)}
            </div>
          </div>
        );
      })}

      {/* Security notice */}
      <div className="bg-gradient-to-l from-gray-800 to-gray-900 rounded-2xl p-5 text-white">
        <div className="flex items-start gap-3">
          <Shield className="w-6 h-6 text-yellow-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold mb-1">أمان البيانات والتكاملات</p>
            <p className="text-sm text-gray-300 leading-relaxed">
              جميع بيانات الاعتماد (API Keys) مشفّرة ولا تُرسَل إلى أي خادم خارجي.
              يُنصح بعدم مشاركة مفاتيح API مع أي شخص، وتجديدها دورياً من لوحة التحكم الخاصة بكل خدمة.
              جميع الاتصالات تعمل عبر HTTPS/TLS.
            </p>
          </div>
        </div>
      </div>

      {configuring && <ConfigModal intg={configuring} onClose={() => setConfiguring(null)} />}
    </div>
  );
}
