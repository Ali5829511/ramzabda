import { PrintLayout, PrintSection, PrintGrid, PrintField, PrintTable } from '../components/PrintLayout';
import { useStore } from '../data/store';
import type { Contract } from '../types';

interface Props {
  contract: Contract;
  onClose: () => void;
}

export function AccountStatementPrint({ contract, onClose }: Props) {
  const { invoices, installments, payments } = useStore();

  const cInvoices = invoices.filter(i => i.contractId === contract.id);
  const cInstallments = installments.filter(i => i.contractId === contract.id);
  const cPayments = payments.filter(p => p.contractId === contract.id);

  const totalAmount = cInvoices.reduce((s, i) => s + i.totalAmount, 0);
  const totalPaid = cInvoices.reduce((s, i) => s + i.paidAmount, 0);
  const totalRemaining = cInvoices.reduce((s, i) => s + i.remainingAmount, 0);

  const instStatusLabel: Record<string, string> = {
    pending: 'معلق', paid: 'مدفوع', overdue: 'متأخر', partial: 'جزئي',
  };
  const payMethodLabel: Record<string, string> = {
    cash: 'نقداً', bank_transfer: 'تحويل بنكي', cheque: 'شيك', online: 'إلكتروني',
  };

  return (
    <PrintLayout
      title="كشف حساب"
      subtitle="Account Statement"
      docNumber={contract.contractNumber}
      date={new Date().toLocaleDateString('ar-SA')}
      onClose={onClose}
    >
      {/* Summary KPIs */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '10px',
        marginBottom: '18px',
      }}>
        {[
          { label: 'إجمالي قيمة العقد', value: `${totalAmount.toLocaleString()} ر.س`, color: '#1c1917' },
          { label: 'إجمالي المحصّل', value: `${totalPaid.toLocaleString()} ر.س`, color: '#15803d' },
          { label: 'المتبقي للتحصيل', value: `${totalRemaining.toLocaleString()} ر.س`, color: '#b91c1c' },
          { label: 'نسبة الإنجاز', value: totalAmount > 0 ? `${Math.round((totalPaid / totalAmount) * 100)}%` : '—', color: '#d97706' },
        ].map((k, i) => (
          <div key={i} style={{
            background: i === 0 ? '#fafaf9' : i === 1 ? '#f0fdf4' : i === 2 ? '#fef2f2' : '#fef3c7',
            borderRadius: '8px', padding: '10px 12px',
            borderTop: `3px solid ${k.color}`,
          }}>
            <div style={{ fontSize: '10px', color: '#78716c', marginBottom: '4px' }}>{k.label}</div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: k.color }}>{k.value}</div>
          </div>
        ))}
      </div>

      <PrintSection title="بيانات العقد والأطراف">
        <PrintGrid cols={3}>
          <PrintField label="رقم العقد" value={contract.contractNumber} mono />
          <PrintField label="النسخة" value={contract.versionNumber} />
          <PrintField label="العقار" value={contract.propertyName} />
          <PrintField label="المستأجر" value={contract.tenantName} />
          <PrintField label="المؤجر" value={contract.landlordName} />
          <PrintField label="الحالة" value={contract.status === 'active' ? 'فعّال' : contract.status} />
          <PrintField label="تاريخ البدء" value={contract.contractStartDate} />
          <PrintField label="تاريخ الانتهاء" value={contract.contractEndDate} />
          <PrintField label="رقم الوثيقة" value={contract.titleDeedNumber} mono />
        </PrintGrid>
      </PrintSection>

      <PrintSection title="جدول الفواتير">
        <PrintTable
          headers={['رقم الفاتورة', 'الاستحقاق', 'آخر مهلة', 'الإجمالي ر.س', 'المدفوع ر.س', 'المتبقي ر.س', 'الحالة']}
          rows={cInvoices.map(inv => [
            <span style={{ fontFamily: 'monospace', fontSize: '11px' }}>{inv.invoiceNumber}</span>,
            inv.invoiceDueDate ?? '—',
            inv.invoiceGraceDate ?? '—',
            inv.totalAmount.toLocaleString(),
            <span style={{ color: '#15803d', fontWeight: 700 }}>{inv.paidAmount.toLocaleString()}</span>,
            <span style={{ color: inv.remainingAmount > 0 ? '#b91c1c' : '#15803d', fontWeight: 600 }}>
              {inv.remainingAmount.toLocaleString()}
            </span>,
            <span style={{
              padding: '2px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: 700,
              background: inv.invoiceStatus === 'paid' ? '#dcfce7' : inv.invoiceStatus === 'overdue' ? '#fee2e2' : '#fef3c7',
              color: inv.invoiceStatus === 'paid' ? '#15803d' : inv.invoiceStatus === 'overdue' ? '#b91c1c' : '#92400e',
            }}>
              {inv.invoiceStatus === 'paid' ? 'مدفوعة' : inv.invoiceStatus === 'overdue' ? 'متأخرة' : 'معلقة'}
            </span>,
          ])}
          totals={['الإجمالي', '', '', `${totalAmount.toLocaleString()} ر.س`, `${totalPaid.toLocaleString()} ر.س`, `${totalRemaining.toLocaleString()} ر.س`, '']}
        />
      </PrintSection>

      <PrintSection title="جدول الأقساط">
        <PrintTable
          headers={['رقم القسط', 'الفاتورة', 'الاستحقاق', 'آخر مهلة', 'القيمة ر.س', 'المدفوع ر.س', 'المتبقي ر.س', 'الحالة']}
          rows={cInstallments.map(inst => [
            <span style={{ fontFamily: 'monospace', fontSize: '10px' }}>{inst.installmentNumber}</span>,
            <span style={{ fontFamily: 'monospace', fontSize: '10px' }}>{inst.invoiceNumber}</span>,
            inst.installmentDueDate ?? '—',
            inst.installmentGraceDate ?? '—',
            inst.installmentValue.toLocaleString(),
            <span style={{ color: '#15803d', fontWeight: 600 }}>{inst.installmentPaid.toLocaleString()}</span>,
            <span style={{ color: inst.installmentRemaining > 0 ? '#b91c1c' : '#15803d' }}>
              {inst.installmentRemaining.toLocaleString()}
            </span>,
            <span style={{
              padding: '2px 6px', borderRadius: '10px', fontSize: '10px', fontWeight: 700,
              background: inst.installmentStatus === 'paid' ? '#dcfce7' : inst.installmentStatus === 'overdue' ? '#fee2e2' : '#fef3c7',
              color: inst.installmentStatus === 'paid' ? '#15803d' : inst.installmentStatus === 'overdue' ? '#b91c1c' : '#92400e',
            }}>
              {instStatusLabel[inst.installmentStatus] ?? inst.installmentStatus}
            </span>,
          ])}
          totals={['الإجمالي', '', '', '',
            `${cInstallments.reduce((s, i) => s + i.installmentValue, 0).toLocaleString()} ر.س`,
            `${cInstallments.reduce((s, i) => s + i.installmentPaid, 0).toLocaleString()} ر.س`,
            `${cInstallments.reduce((s, i) => s + i.installmentRemaining, 0).toLocaleString()} ر.س`,
            '',
          ]}
        />
      </PrintSection>

      {cPayments.length > 0 && (
        <PrintSection title="سجل المدفوعات">
          <PrintTable
            headers={['رقم الدفعة', 'التاريخ', 'المبلغ ر.س', 'طريقة الدفع', 'الرقم المرجعي', 'البنك', 'الحالة']}
            rows={cPayments.map(p => [
              <span style={{ fontFamily: 'monospace', fontSize: '10px' }}>{p.paymentNumber}</span>,
              p.paymentDate ?? '—',
              <span style={{ color: '#15803d', fontWeight: 700 }}>{p.paymentAmount.toLocaleString()}</span>,
              payMethodLabel[p.paymentMethod] ?? p.paymentMethod,
              <span style={{ fontFamily: 'monospace', fontSize: '10px' }}>{p.referenceNumber ?? '—'}</span>,
              p.bankName ?? '—',
              <span style={{
                padding: '2px 6px', borderRadius: '10px', fontSize: '10px', fontWeight: 700,
                background: '#dcfce7', color: '#15803d',
              }}>
                {p.paymentStatus === 'completed' ? 'مكتمل' : 'معلق'}
              </span>,
            ])}
            totals={['الإجمالي', '', `${cPayments.reduce((s, p) => s + p.paymentAmount, 0).toLocaleString()} ر.س`, '', '', '', '']}
          />
        </PrintSection>
      )}
    </PrintLayout>
  );
}
