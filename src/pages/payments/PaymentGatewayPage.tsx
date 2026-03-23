import { useState } from 'react';
import { useStore } from '../../data/store';
import {
  CreditCard, Smartphone, CheckCircle, AlertCircle,
  QrCode, Copy, Shield, FileText, Lock
} from 'lucide-react';

const GATEWAYS = [
  { id: 'stc', name: 'STC Pay', icon: '📱', color: 'bg-purple-100 border-purple-200 text-purple-700', desc: 'دفع سريع عبر تطبيق STC Pay' },
  { id: 'mada', name: 'مدى', icon: '💳', color: 'bg-green-100 border-green-200 text-green-700', desc: 'بطاقة مدى المصرفية' },
  { id: 'visa', name: 'Visa / Mastercard', icon: '🌐', color: 'bg-blue-100 border-blue-200 text-blue-700', desc: 'بطاقات الائتمان الدولية' },
  { id: 'bank', name: 'تحويل بنكي', icon: '🏦', color: 'bg-yellow-100 border-yellow-200 text-yellow-700', desc: 'تحويل مباشر للحساب البنكي' },
];

const BANK_DETAILS = {
  bankName: 'بنك الراجحي',
  accountName: 'شركة رمز الإبداع لإدارة الأملاك',
  iban: 'SA00 8000 0000 6080 1030 0608',
  swift: 'RJHISARI',
};

export default function PaymentGatewayPage() {
  const { invoices } = useStore();
  const [gateway, setGateway] = useState('stc');
  const [selectedInvoice, setSelectedInvoice] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVC, setCardCVC] = useState('');
  const [phone, setPhone] = useState('');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [copiedField, setCopiedField] = useState('');
  const paymentRefTs = Date.now().toString().slice(-8);

  const pendingInvoices = invoices.filter(i => i.invoiceStatus === 'pending' || i.invoiceStatus === 'overdue');
  const sel = selectedInvoice ? invoices.find(i => i.id === selectedInvoice) : null;
  const totalPaid = invoices.filter(i => i.invoiceStatus === 'paid').reduce((s, i) => s + i.paidAmount, 0);
  const totalPending = invoices.filter(i => i.invoiceStatus === 'pending').reduce((s, i) => s + i.remainingAmount, 0);
  const totalOverdue = invoices.filter(i => i.invoiceStatus === 'overdue').reduce((s, i) => s + i.remainingAmount, 0);

  const handlePay = async () => {
    setProcessing(true);
    await new Promise(r => setTimeout(r, 2000));
    setProcessing(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 4000);
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(''), 2000);
  };

  if (success) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center" dir="rtl">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-black text-gray-800">تمت عملية الدفع بنجاح!</h2>
          <p className="text-gray-500">تم تسجيل الدفعة وإرسال الإيصال</p>
          <p className="text-sm text-gray-400">رقم المرجع: PAY-{paymentRefTs}</p>
          <button onClick={() => setSuccess(false)} className="btn-primary mt-4">العودة</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h1 className="section-title flex items-center gap-2">
          <CreditCard className="w-6 h-6 text-blue-500" /> بوابة الدفع الإلكتروني
        </h1>
        <p className="section-subtitle">دفع الإيجار والفواتير عبر بوابات دفع آمنة</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card p-4 bg-green-50 border-green-200">
          <p className="text-2xl font-black text-green-700">{totalPaid.toLocaleString('ar-SA')}</p>
          <p className="text-xs text-green-600">إجمالي المدفوع ر.س</p>
        </div>
        <div className="card p-4 bg-yellow-50 border-yellow-200">
          <p className="text-2xl font-black text-yellow-700">{totalPending.toLocaleString('ar-SA')}</p>
          <p className="text-xs text-yellow-600">قيد الانتظار ر.س</p>
        </div>
        <div className="card p-4 bg-red-50 border-red-200">
          <p className="text-2xl font-black text-red-700">{totalOverdue.toLocaleString('ar-SA')}</p>
          <p className="text-xs text-red-600">متأخر ر.س</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Invoice selector */}
        <div className="space-y-4">
          <div className="card">
            <h3 className="font-bold text-gray-700 mb-3 text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-yellow-500" /> اختر الفاتورة
            </h3>
            <select className="input-field text-sm" value={selectedInvoice} onChange={e => setSelectedInvoice(e.target.value)}>
              <option value="">— اختر فاتورة —</option>
              {pendingInvoices.map(i => (
                <option key={i.id} value={i.id}>
                  {i.invoiceNumber} — {i.remainingAmount.toLocaleString('ar-SA')} ر.س ({i.invoiceStatus === 'overdue' ? '⚠️ متأخرة' : 'معلقة'})
                </option>
              ))}
            </select>

            {sel && (
              <div className="mt-3 p-4 bg-yellow-50 rounded-xl border border-yellow-200 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">رقم الفاتورة</span>
                  <span className="font-bold text-gray-800">{sel.invoiceNumber}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">المبلغ الكلي</span>
                  <span className="font-bold text-gray-800">{sel.totalAmount.toLocaleString('ar-SA')} ر.س</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">المبلغ المتبقي</span>
                  <span className="font-black text-yellow-700 text-base">{sel.remainingAmount.toLocaleString('ar-SA')} ر.س</span>
                </div>
                {sel.invoiceStatus === 'overdue' && (
                  <div className="flex items-center gap-2 bg-red-50 text-red-600 text-xs p-2 rounded-lg">
                    <AlertCircle className="w-3.5 h-3.5" /> فاتورة متأخرة — يرجى الدفع فوراً
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Gateway selector */}
          <div className="card">
            <h3 className="font-bold text-gray-700 mb-3 text-sm flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-blue-500" /> طريقة الدفع
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {GATEWAYS.map(g => (
                <button key={g.id} onClick={() => setGateway(g.id)}
                  className={`p-3 rounded-xl border-2 text-right transition-all hover:shadow-sm ${gateway === g.id ? g.color + ' border-2' : 'bg-white border-gray-200 hover:border-gray-300'}`}>
                  <div className="text-xl">{g.icon}</div>
                  <p className="text-sm font-bold mt-1 text-gray-800">{g.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{g.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Payment Form */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-700 text-sm flex items-center gap-2">
              <Lock className="w-4 h-4 text-green-500" /> بيانات الدفع الآمن
            </h3>
            <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
              <Shield className="w-3 h-3" /> SSL محمي
            </div>
          </div>

          {gateway === 'bank' ? (
            <div className="space-y-3">
              <p className="text-sm text-gray-600 font-medium">تفاصيل التحويل البنكي</p>
              {Object.entries({
                'البنك': BANK_DETAILS.bankName,
                'اسم الحساب': BANK_DETAILS.accountName,
                'رقم IBAN': BANK_DETAILS.iban,
                'SWIFT': BANK_DETAILS.swift,
              }).map(([label, value]) => (
                <div key={label} className="bg-gray-50 rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400">{label}</p>
                    <p className="text-sm font-semibold text-gray-800 mt-0.5">{value}</p>
                  </div>
                  <button onClick={() => copyToClipboard(value, label)}
                    className={`p-2 rounded-lg transition-colors ${copiedField === label ? 'text-green-600 bg-green-50' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}>
                    {copiedField === label ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              ))}
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-xs text-yellow-700">
                ⚠️ بعد التحويل أرفق إيصال التحويل عبر واتساب أو البريد الإلكتروني لتأكيد الدفع
              </div>
            </div>
          ) : gateway === 'stc' ? (
            <div className="space-y-4">
              <div>
                <label className="label">رقم الجوال المرتبط بـ STC Pay</label>
                <div className="relative">
                  <Smartphone className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input className="input-field pr-9" type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                    placeholder="05xxxxxxxx" maxLength={10} />
                </div>
              </div>
              <div className="bg-purple-50 rounded-xl p-4 flex flex-col items-center gap-3">
                <QrCode className="w-16 h-16 text-purple-400" />
                <p className="text-xs text-purple-600 text-center">امسح هذا الرمز بتطبيق STC Pay لإتمام الدفع</p>
                <div className="text-center">
                  <p className="text-xl font-black text-purple-700">{sel ? sel.remainingAmount.toLocaleString('ar-SA') : '0'} ر.س</p>
                  <p className="text-xs text-purple-400">المبلغ المطلوب</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="label">رقم البطاقة</label>
                <div className="relative">
                  <CreditCard className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input className="input-field pr-9 font-mono" type="text" value={cardNumber}
                    onChange={e => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim())}
                    placeholder="0000 0000 0000 0000" maxLength={19} />
                </div>
              </div>
              <div>
                <label className="label">اسم حامل البطاقة</label>
                <input className="input-field" type="text" value={cardName} onChange={e => setCardName(e.target.value)} placeholder="الاسم كما يظهر على البطاقة" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">تاريخ الانتهاء</label>
                  <input className="input-field" type="text" value={cardExpiry}
                    onChange={e => setCardExpiry(e.target.value.replace(/\D/g, '').slice(0, 4).replace(/(.{2})/, '$1/'))}
                    placeholder="MM/YY" maxLength={5} />
                </div>
                <div>
                  <label className="label">رمز CVC</label>
                  <input className="input-field" type="password" value={cardCVC}
                    onChange={e => setCardCVC(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="***" maxLength={4} />
                </div>
              </div>
            </div>
          )}

          {/* Pay button */}
          <div className="mt-6 space-y-3">
            <button
              onClick={handlePay}
              disabled={!sel || processing || (!phone && gateway === 'stc') || (!cardNumber && gateway !== 'stc' && gateway !== 'bank')}
              className="btn-primary w-full justify-center py-3 text-base disabled:opacity-40"
            >
              {processing ? (
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  جارٍ المعالجة...
                </div>
              ) : gateway === 'bank' ? (
                'تأكيد التحويل البنكي'
              ) : (
                <>
                  <Lock className="w-5 h-5" />
                  دفع {sel ? sel.remainingAmount.toLocaleString('ar-SA') + ' ر.س' : '—'} بأمان
                </>
              )}
            </button>
            <div className="flex items-center justify-center gap-3">
              {['🔒 SSL', '🛡️ PCI DSS', '✅ 3D Secure'].map(badge => (
                <span key={badge} className="text-xs text-gray-400">{badge}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
