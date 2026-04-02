import { PrintLayout, PrintSection, PrintGrid, PrintField } from '../components/PrintLayout';
import { useStore } from '../data/store';
import type { Payment, Installment } from '../types';

interface Props {
  payment: Payment;
  installment?: Installment;
  onClose: () => void;
}

export function PaymentReceiptPrint({ payment, installment, onClose }: Props) {
  const { contracts, invoices } = useStore();
  const contract = contracts.find(c => c.id === payment.contractId);
  const invoice = invoices.find(i => i.id === payment.invoiceId);

  const methodLabel: Record<string, string> = {
    cash: 'نقداً', bank_transfer: 'تحويل بنكي', cheque: 'شيك', online: 'إلكتروني',
  };

  const amountWords = (n: number): string => {
    // Simple arabic number display
    return n.toLocaleString('ar-SA') + ' ريال سعودي';
  };

  return (
    <PrintLayout
      title="إيصال دفعة / سند قبض"
      subtitle="Payment Receipt"
      docNumber={payment.paymentNumber}
      date={payment.paymentDate}
      watermark="مدفوع"
      onClose={onClose}
    >
      {/* Receipt Banner */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: '#f0fdf4', border: '2px solid #86efac', borderRadius: '10px',
        padding: '14px 20px', marginBottom: '20px',
      }}>
        <div>
          <div style={{ fontSize: '11px', color: '#15803d' }}>إجمالي المبلغ المدفوع</div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#15803d' }}>
            {payment.paymentAmount.toLocaleString()} ر.س
          </div>
          <div style={{ fontSize: '11px', color: '#166534', marginTop: '2px' }}>
            {amountWords(payment.paymentAmount)}
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '72px', height: '72px', borderRadius: '50%',
            background: '#22c55e', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '36px', color: 'white',
            margin: '0 auto',
          }}>✓</div>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#15803d', marginTop: '6px' }}>
            {payment.paymentStatus === 'completed' ? 'مدفوع بالكامل' : 'قيد المعالجة'}
          </div>
        </div>
        <div style={{ textAlign: 'left' }}>
          <div style={{ fontSize: '11px', color: '#6b7280' }}>رقم الإيصال</div>
          <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '14px', color: '#1c1917' }}>{payment.paymentNumber}</div>
          <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>تاريخ الدفع</div>
          <div style={{ fontWeight: 600, color: '#1c1917' }}>{payment.paymentDate}</div>
        </div>
      </div>

      <PrintSection title="تفاصيل الدفعة">
        <PrintGrid cols={3}>
          <PrintField label="رقم الدفعة (PaymentNumber)" value={payment.paymentNumber} mono />
          <PrintField label="رقم الفاتورة (InvoiceNumber)" value={payment.invoiceId?.replace('inv-', '')} mono />
          <PrintField label="رقم العقد (ContractNumber)" value={payment.contractId?.replace('cr-', '')} mono />
          <PrintField label="رقم القسط (InstallmentNumber)" value={payment.installmentNumber} mono />
          <PrintField label="المبلغ المدفوع" value={`${payment.paymentAmount.toLocaleString()} ر.س`} />
          <PrintField label="طريقة الدفع" value={methodLabel[payment.paymentMethod] ?? payment.paymentMethod} />
          <PrintField label="تاريخ الدفع" value={payment.paymentDate} />
          <PrintField label="تاريخ التحويل" value={payment.transferDate} />
          <PrintField label="حالة التحويل" value={payment.transferStatus} />
        </PrintGrid>
      </PrintSection>

      <PrintSection title="بيانات التحويل البنكي">
        <PrintGrid cols={3}>
          <PrintField label="رقم الآيبان (IBAN)" value={payment.iban} mono />
          <PrintField label="اسم الحساب" value={payment.accountName} />
          <PrintField label="اسم البنك" value={payment.bankName} />
          <PrintField label="الرقم المرجعي (Reference)" value={payment.referenceNumber} mono />
          <PrintField label="UTI" value={payment.uti} mono />
          <PrintField label="طريقة الاستلام" value={payment.receivingMethod} />
        </PrintGrid>
      </PrintSection>

      {contract && (
        <PrintSection title="بيانات العقد والمستأجر">
          <PrintGrid cols={3}>
            <PrintField label="المستأجر" value={contract.tenantName} />
            <PrintField label="المؤجر" value={contract.landlordName} />
            <PrintField label="العقار" value={contract.propertyName} />
            <PrintField label="بداية العقد" value={contract.contractStartDate} />
            <PrintField label="نهاية العقد" value={contract.contractEndDate} />
            <PrintField label="رقم العقد" value={contract.contractNumber} mono />
          </PrintGrid>
        </PrintSection>
      )}

      {invoice && (
        <PrintSection title="بيانات الفاتورة">
          <PrintGrid cols={3}>
            <PrintField label="إجمالي الفاتورة" value={`${invoice.totalAmount.toLocaleString()} ر.س`} />
            <PrintField label="المبلغ المدفوع" value={`${invoice.paidAmount.toLocaleString()} ر.س`} />
            <PrintField label="المبلغ المتبقي" value={`${invoice.remainingAmount.toLocaleString()} ر.س`} />
            <PrintField label="تاريخ الاستحقاق" value={invoice.invoiceDueDate} />
            <PrintField label="آخر مهلة" value={invoice.invoiceGraceDate} />
            <PrintField label="حالة الفاتورة" value={
              invoice.invoiceStatus === 'paid' ? 'مدفوعة' :
              invoice.invoiceStatus === 'pending' ? 'معلقة' : invoice.invoiceStatusDescription
            } />
          </PrintGrid>
        </PrintSection>
      )}

      {installment && (
        <PrintSection title="بيانات القسط">
          <PrintGrid cols={3}>
            <PrintField label="رقم القسط" value={installment.installmentNumber} mono />
            <PrintField label="قيمة القسط" value={`${installment.installmentValue.toLocaleString()} ر.س`} />
            <PrintField label="المدفوع من القسط" value={`${installment.installmentPaid.toLocaleString()} ر.س`} />
            <PrintField label="المتبقي من القسط" value={`${installment.installmentRemaining.toLocaleString()} ر.س`} />
            <PrintField label="تاريخ استحقاق القسط" value={installment.installmentDueDate} />
            <PrintField label="آخر مهلة للقسط" value={installment.installmentGraceDate} />
          </PrintGrid>
        </PrintSection>
      )}
    </PrintLayout>
  );
}
