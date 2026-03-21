import { useState } from 'react';
import { useStore } from '../../data/store';
import { Printer, FileText, CreditCard, BookOpen, BarChart3, ChevronDown } from 'lucide-react';
import { ContractPrint } from '../../print/ContractPrint';
import { PaymentReceiptPrint } from '../../print/PaymentReceiptPrint';
import { AccountStatementPrint } from '../../print/AccountStatementPrint';

type PrintType = 'contract' | 'receipt' | 'statement' | null;

export default function PrintCenterPage() {
  const { contracts, payments, installments } = useStore();
  const [printType, setPrintType] = useState<PrintType>(null);
  const [selectedContractId, setSelectedContractId] = useState(contracts[0]?.id ?? '');
  const [selectedPaymentId, setSelectedPaymentId] = useState(payments[0]?.id ?? '');

  const contract = contracts.find(c => c.id === selectedContractId);
  const payment = payments.find(p => p.id === selectedPaymentId);
  const installment = installments.find(i => i.id === payment?.installmentId);

  const docTypes = [
    {
      id: 'contract' as PrintType,
      icon: <FileText className="w-8 h-8" />,
      title: 'عقد إيجار',
      sub: 'طباعة عقد إيجار رسمي بالبيانات الكاملة',
      color: 'border-yellow-400 hover:bg-yellow-50',
      iconColor: 'text-yellow-600 bg-yellow-100',
    },
    {
      id: 'receipt' as PrintType,
      icon: <CreditCard className="w-8 h-8" />,
      title: 'إيصال دفعة / سند قبض',
      sub: 'طباعة إيصال رسمي لكل دفعة مسجّلة',
      color: 'border-green-400 hover:bg-green-50',
      iconColor: 'text-green-600 bg-green-100',
    },
    {
      id: 'statement' as PrintType,
      icon: <BookOpen className="w-8 h-8" />,
      title: 'كشف حساب كامل',
      sub: 'كشف تفصيلي بالفواتير والأقساط والمدفوعات',
      color: 'border-blue-400 hover:bg-blue-50',
      iconColor: 'text-blue-600 bg-blue-100',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="section-title">مركز الطباعة والتصدير</h1>
        <p className="section-subtitle">قوالب احترافية بهوية شركة رمز الإبداع — جاهزة للطباعة والتصدير PDF</p>
      </div>

      {/* Document Type Selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {docTypes.map(doc => (
          <button
            key={doc.id}
            onClick={() => setPrintType(doc.id)}
            className={`card text-right p-6 border-2 transition-all ${doc.color} ${printType === doc.id ? 'ring-2 ring-yellow-400' : ''}`}
          >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${doc.iconColor}`}>
              {doc.icon}
            </div>
            <h3 className="font-bold text-gray-900 mb-1">{doc.title}</h3>
            <p className="text-sm text-gray-500">{doc.sub}</p>
          </button>
        ))}
      </div>

      {/* Config Panel */}
      {printType && (
        <div className="card p-6 space-y-4 border-2 border-yellow-200 bg-yellow-50/30">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <Printer className="w-5 h-5 text-yellow-600" />
            {printType === 'contract' ? 'اختيار العقد' :
             printType === 'receipt' ? 'اختيار الدفعة' :
             'اختيار العقد للكشف'}
          </h3>

          {(printType === 'contract' || printType === 'statement') && (
            <div>
              <label className="label">العقد</label>
              <div className="relative">
                <select
                  className="input-field appearance-none pl-8"
                  value={selectedContractId}
                  onChange={e => setSelectedContractId(e.target.value)}
                >
                  {contracts.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.contractNumber} — {c.tenantName ?? '—'} | {c.propertyName ?? '—'}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
              {contract && (
                <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div className="bg-white rounded-lg p-3 border border-gray-100">
                    <p className="text-xs text-gray-400">المستأجر</p>
                    <p className="font-semibold text-gray-800">{contract.tenantName ?? '—'}</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-gray-100">
                    <p className="text-xs text-gray-400">العقار</p>
                    <p className="font-semibold text-gray-800">{contract.propertyName ?? '—'}</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-gray-100">
                    <p className="text-xs text-gray-400">البداية</p>
                    <p className="font-semibold">{contract.contractStartDate}</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-gray-100">
                    <p className="text-xs text-gray-400">النهاية</p>
                    <p className="font-semibold">{contract.contractEndDate}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {printType === 'receipt' && (
            <div>
              <label className="label">الدفعة</label>
              <div className="relative">
                <select
                  className="input-field appearance-none pl-8"
                  value={selectedPaymentId}
                  onChange={e => setSelectedPaymentId(e.target.value)}
                >
                  {payments.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.paymentNumber} — {p.paymentAmount.toLocaleString()} ر.س | {p.paymentDate}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
              {payment && (
                <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
                  <div className="bg-white rounded-lg p-3 border border-gray-100">
                    <p className="text-xs text-gray-400">المبلغ</p>
                    <p className="font-bold text-green-600 text-lg">{payment.paymentAmount.toLocaleString()} ر</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-gray-100">
                    <p className="text-xs text-gray-400">التاريخ</p>
                    <p className="font-semibold">{payment.paymentDate}</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-gray-100">
                    <p className="text-xs text-gray-400">الرقم المرجعي</p>
                    <p className="font-mono text-sm">{payment.referenceNumber ?? '—'}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          <button
            onClick={() => {
              if (printType === 'contract' && contract) setPrintType('contract');
              else if (printType === 'receipt' && payment) setPrintType('receipt');
              else if (printType === 'statement' && contract) setPrintType('statement');
              setTimeout(() => window.print(), 100);
            }}
            className="btn-primary flex items-center gap-2 w-full justify-center text-base py-3"
          >
            <Printer className="w-5 h-5" /> معاينة وطباعة
          </button>
        </div>
      )}

      {/* Preview Hint */}
      <div className="card p-5 bg-gray-50 border-dashed border-2 border-gray-200">
        <div className="flex items-start gap-4">
          <BarChart3 className="w-10 h-10 text-yellow-500 shrink-0" />
          <div>
            <h4 className="font-bold text-gray-800 mb-2">مميزات قوالب الطباعة</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-gray-600">
              {[
                'هيدر بشعار الشركة والألوان الرسمية',
                'علامة مائية "رمز الإبداع"',
                'حجم A4 مع هوامش احترافية',
                'خط عربي Tajawal',
                'جدول أقساط ومدفوعات مرمّز بالألوان',
                'خانات توقيع المستأجر والمؤجر',
                'شروط وأحكام عامة',
                'فوتر برقم العقد والتاريخ',
                'تصدير PDF مباشر من المتصفح',
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full shrink-0" />
                  {f}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Print Modals */}
      {printType === 'contract' && contract && (
        <ContractPrint contract={contract} onClose={() => setPrintType(null)} />
      )}
      {printType === 'receipt' && payment && (
        <PaymentReceiptPrint payment={payment} installment={installment} onClose={() => setPrintType(null)} />
      )}
      {printType === 'statement' && contract && (
        <AccountStatementPrint contract={contract} onClose={() => setPrintType(null)} />
      )}
    </div>
  );
}
