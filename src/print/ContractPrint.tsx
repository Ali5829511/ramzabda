import { PrintLayout, PrintSection, PrintGrid, PrintField, PrintTable } from '../components/PrintLayout';
import { useStore } from '../data/store';
import type { Contract } from '../types';

interface Props {
  contract: Contract;
  onClose: () => void;
}

export function ContractPrint({ contract, onClose }: Props) {
  const { units, properties, users } = useStore();
  const unit = units.find(u => u.id === contract.unitId) ?? units.find(u => u.titleDeedNumber === contract.titleDeedNumber);
  const prop = properties.find(p => p.id === contract.propertyId) ?? properties.find(p => p.titleDeedNumber === contract.titleDeedNumber);
  const tenant = users.find(u => u.id === contract.tenantId);
  const owner = users.find(u => u.id === contract.landlordId);

  const start = contract.contractStartDate;
  const end = contract.contractEndDate;
  const daysTotal = start && end
    ? Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / 86400000)
    : null;

  return (
    <PrintLayout
      title="عقد إيجار"
      subtitle="Rental Contract"
      docNumber={contract.contractNumber}
      date={new Date().toLocaleDateString('ar-SA')}
      watermark="رمز الإبداع"
      onClose={onClose}
    >
      {/* Intro */}
      <div style={{
        background: '#fef3c7', border: '1px solid #fde68a', borderRadius: '8px',
        padding: '12px 16px', marginBottom: '16px', fontSize: '12px', color: '#78350f',
        lineHeight: '1.9',
      }}>
        <strong>بسم الله الرحمن الرحيم</strong>
        <br />
        تم إبرام هذا العقد بين الطرفين الموقّعين أدناه وفقاً لأحكام نظام الإيجار السعودي ومتطلبات منصة إيجار،
        وذلك بموجب رخصة فال الصادرة عن الهيئة العامة للعقار المملكة العربية السعودية.
      </div>

      <PrintSection title="بيانات العقار والوحدة">
        <PrintGrid cols={3}>
          <PrintField label="اسم العقار" value={prop?.propertyName ?? contract.propertyName} />
          <PrintField label="رقم وثيقة الملكية" value={contract.titleDeedNumber} mono />
          <PrintField label="رقم الوحدة" value={unit?.unitNumber} mono />
          <PrintField label="نوع الوحدة" value={unit?.unitType} />
          <PrintField label="مساحة الوحدة م²" value={unit?.unitArea} />
          <PrintField label="حالة التأثيث" value={unit?.furnishedStatus === 'furnished' ? 'مؤثثة' : unit?.furnishedStatus === 'semi-furnished' ? 'مؤثثة جزئياً' : 'غير مؤثثة'} />
          <PrintField label="المنطقة" value={prop?.region} />
          <PrintField label="المدينة" value={prop?.city} />
          <PrintField label="الخدمات" value={unit?.unitServices} />
        </PrintGrid>
      </PrintSection>

      <PrintSection title="بيانات المستأجر (الطرف الأول)">
        <PrintGrid cols={3}>
          <PrintField label="الاسم الكامل" value={contract.tenantName ?? tenant?.name} />
          <PrintField label="رقم الهوية" value={tenant?.phone ?? '—'} mono />
          <PrintField label="الجنسية" value="—" />
          <PrintField label="رقم الجوال" value={tenant?.phone} mono />
          <PrintField label="البريد الإلكتروني" value={tenant?.email} />
          <PrintField label="رقم المستأجر (TenantID)" value={contract.tenantId} mono />
        </PrintGrid>
      </PrintSection>

      <PrintSection title="بيانات المؤجر / الشركة (الطرف الثاني)">
        <PrintGrid cols={3}>
          <PrintField label="الاسم الكامل / الشركة" value={contract.landlordName ?? owner?.name ?? 'شركة رمز الإبداع'} />
          <PrintField label="السجل التجاري" value="—" mono />
          <PrintField label="رقم الجوال" value={owner?.phone} mono />
          <PrintField label="رقم المؤجر (LandlordID)" value={contract.landlordId} mono />
          <PrintField label="رقم اتفاقية الوساطة" value={unit?.brokerageAgreementNumber} mono />
          <PrintField label="رقم النسخة" value={contract.versionNumber} />
        </PrintGrid>
      </PrintSection>

      <PrintSection title="مدة العقد والمبالغ">
        <PrintGrid cols={3}>
          <PrintField label="تاريخ بداية العقد" value={start} />
          <PrintField label="تاريخ نهاية العقد" value={end} />
          <PrintField label="مدة العقد" value={daysTotal ? `${daysTotal} يوم` : '—'} />
          <PrintField label="رقم العقد (ContractNumber)" value={contract.contractNumber} mono />
          <PrintField label="حالة العقد" value={
            contract.status === 'active' ? 'فعّال' :
            contract.status === 'expired' ? 'منتهي' :
            contract.status === 'terminated' ? 'ملغي' : contract.status
          } />
          <PrintField label="ملاحظات" value={contract.notes} />
        </PrintGrid>
      </PrintSection>

      {/* Terms */}
      <PrintSection title="الشروط والأحكام العامة">
        <div style={{ fontSize: '11.5px', color: '#44403c', lineHeight: '2', columnCount: 2, columnGap: '24px' }}>
          {[
            'يلتزم المستأجر بسداد قيمة الإيجار في المواعيد المحددة وفق جدول الأقساط المرفق.',
            'لا يحق للمستأجر التنازل عن العقد أو التأجير من الباطن إلا بموافقة خطية مسبقة من المؤجر.',
            'يلتزم المستأجر بالمحافظة على العقار وإعادته بالحالة ذاتها مع مراعاة الاستهلاك الطبيعي.',
            'يحق للمؤجر فسخ العقد في حال التأخر في السداد لأكثر من 15 يوماً من تاريخ الاستحقاق.',
            'تسري على هذا العقد أحكام نظام الإيجار ولوائحه التنفيذية في المملكة العربية السعودية.',
            'في حال النزاع يُرجع إلى محاكم المملكة العربية السعودية المختصة.',
            'يعتبر هذا العقد ساري المفعول من تاريخ التوقيع عليه من الطرفين.',
            'يلتزم المستأجر بعدم إحداث أي تعديلات إنشائية بدون إذن خطي من المؤجر.',
          ].map((term, i) => (
            <div key={i} style={{ marginBottom: '6px', display: 'flex', gap: '6px', breakInside: 'avoid' }}>
              <span style={{ color: '#d97706', fontWeight: 800, flexShrink: 0 }}>{i + 1}.</span>
              <span>{term}</span>
            </div>
          ))}
        </div>
      </PrintSection>
    </PrintLayout>
  );
}
