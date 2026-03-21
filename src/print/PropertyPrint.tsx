import { useStore } from '../data/store';
import type { Property } from '../types';

interface Props {
  property: Property;
  onClose: () => void;
}

const GOLD = '#C9A44A';
const CREAM = '#F8F5EE';
const DARK = '#1A1A1A';
const BEIGE_CARD = '#F2EDE4';
const TEXT_MUTED = '#6B6B6B';
const SECTION_BG = '#EDE8DF';

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
    zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center',
    overflow: 'auto', padding: '20px',
  },
  toolbar: {
    display: 'flex', gap: '10px', marginBottom: '16px',
    background: '#fff', padding: '10px 16px', borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
  },
  btnPrint: {
    background: GOLD, color: '#fff', border: 'none', padding: '8px 20px',
    borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '14px',
  },
  btnClose: {
    background: '#6b7280', color: '#fff', border: 'none', padding: '8px 20px',
    borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '14px',
  },
  page: {
    width: '794px', background: CREAM, fontFamily: '"Segoe UI", Tahoma, Arial, sans-serif',
    direction: 'rtl', boxShadow: '0 4px 30px rgba(0,0,0,0.3)',
  },
  // Cover
  coverHeader: {
    background: CREAM, textAlign: 'center', padding: '48px 40px 32px',
    borderBottom: `3px solid ${GOLD}`,
  },
  logoTitle: {
    fontSize: '42px', fontWeight: 900, color: DARK, letterSpacing: '2px', margin: 0,
  },
  logoSubtitle: {
    fontSize: '20px', color: GOLD, fontWeight: 700, margin: '4px 0 0',
  },
  logoTagline: {
    fontSize: '14px', color: TEXT_MUTED, margin: '8px 0 0', fontStyle: 'italic',
  },
  goldDivider: {
    width: '200px', height: '2px', background: `linear-gradient(to right, transparent, ${GOLD}, transparent)`,
    margin: '20px auto',
  },
  coverTitle: {
    fontSize: '30px', fontWeight: 900, color: DARK, margin: '0 0 8px',
  },
  coverSubtitle: {
    fontSize: '13px', color: TEXT_MUTED, margin: '0 0 8px',
  },
  coverDate: {
    fontSize: '15px', color: GOLD, fontWeight: 700, margin: '0',
  },
  contactRow: {
    display: 'flex', justifyContent: 'center', gap: '32px',
    marginTop: '24px', fontSize: '13px', color: TEXT_MUTED,
  },
  contactItem: { display: 'flex', alignItems: 'center', gap: '6px' },
  websiteRow: { textAlign: 'center', fontSize: '12px', color: GOLD, marginTop: '6px' },
  // Dark header band
  darkBand: {
    background: DARK, padding: '14px 28px',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  },
  darkBandRight: { textAlign: 'right' },
  darkBandCompany: { color: GOLD, fontWeight: 800, fontSize: '15px', margin: 0 },
  darkBandSub: { color: '#aaa', fontSize: '11px', margin: '2px 0 0' },
  darkBandLeft: { textAlign: 'left' },
  darkBandTitle: { color: '#fff', fontWeight: 700, fontSize: '13px', margin: 0 },
  darkBandDate: { color: '#aaa', fontSize: '11px', margin: '2px 0 0' },
  // Content
  contentArea: { padding: '28px 32px', background: CREAM },
  // Section header
  sectionHeader: {
    display: 'flex', alignItems: 'center', gap: '10px',
    marginBottom: '14px', marginTop: '24px',
  },
  sectionIcon: {
    width: '36px', height: '36px', background: BEIGE_CARD,
    borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '18px', flexShrink: 0,
  },
  sectionTitle: {
    fontSize: '17px', fontWeight: 800, color: DARK, margin: 0,
    borderBottom: `2px solid ${GOLD}`, paddingBottom: '4px', flexGrow: 1,
  },
  // Grid
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' },
  grid3: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' },
  grid4: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px' },
  // Field card
  fieldCard: {
    background: BEIGE_CARD, borderRadius: '8px', padding: '12px 14px',
    minHeight: '56px',
  },
  fieldLabel: { fontSize: '11px', color: TEXT_MUTED, margin: '0 0 4px', textAlign: 'right' },
  fieldValue: { fontSize: '14px', fontWeight: 700, color: DARK, margin: 0, textAlign: 'right' },
  fieldValueEmpty: { fontSize: '13px', color: '#bbb', margin: 0, textAlign: 'right' },
  // KPI card
  kpiCard: {
    background: BEIGE_CARD, borderRadius: '8px', padding: '12px',
    textAlign: 'center',
  },
  kpiValue: { fontSize: '24px', fontWeight: 900, color: DARK, margin: 0 },
  kpiLabel: { fontSize: '11px', color: TEXT_MUTED, margin: '2px 0 0' },
  // Finance row
  finRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '8px 14px', borderRadius: '6px', fontSize: '13px', marginBottom: '4px',
  },
  finLabel: { color: TEXT_MUTED },
  finValue: { fontWeight: 700, color: DARK },
  // Signature
  signRow: {
    display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
    gap: '20px', marginTop: '36px',
  },
  signBox: { textAlign: 'center' },
  signLine: {
    borderTop: `1px solid ${DARK}`, paddingTop: '6px',
    fontSize: '11px', color: TEXT_MUTED, marginTop: '28px',
  },
  signRole: { fontSize: '12px', color: DARK, fontWeight: 600 },
  // Footer
  footer: {
    borderTop: `4px solid ${GOLD}`,
    background: SECTION_BG, padding: '18px 32px',
  },
  footerContactRow: {
    display: 'flex', justifyContent: 'center', gap: '40px',
    fontSize: '12px', color: TEXT_MUTED, marginBottom: '12px',
  },
  footerContact: { display: 'flex', alignItems: 'center', gap: '6px' },
  footerCompany: { textAlign: 'center' },
  footerCompanyName: { fontSize: '15px', fontWeight: 800, color: DARK, margin: 0 },
  footerTagline: { fontSize: '12px', color: GOLD, margin: '2px 0 0' },
  footerCopy: { fontSize: '11px', color: TEXT_MUTED, margin: '4px 0 0' },
};

export function PropertyPrint({ property: p, onClose }: Props) {
  const { units, contracts, users } = useStore();

  const propUnits = units.filter(u => u.propertyId === p.id);
  const propContracts = contracts.filter(c => c.propertyId === p.id && c.status === 'active');
  const owner = users.find(u => u.id === p.ownerId);

  const totalContractValue = propContracts.reduce((s, c) => s + (c.annualRent || 0), 0);
  const totalDocFees = propContracts.reduce((s, c) => s + (c.ejarDocumentationFees || 0), 0);
  const totalCommission = propContracts.reduce((s, c) => s + (c.brokerageCommission || 0), 0);
  const rentedUnits = propUnits.filter(u => u.unitStatus === 'rented').length;
  const reservedUnits = propUnits.filter(u => u.unitStatus === 'reserved').length;
  const availableUnits = propUnits.filter(u => u.unitStatus === 'available').length;
  const totalUnitsCount = propUnits.length || p.totalUnits;
  const occupancyRate = totalUnitsCount > 0 ? Math.round((rentedUnits / totalUnitsCount) * 100) : 0;

  const today = new Date().toLocaleDateString('ar-SA-u-nu-latn', { year: 'numeric', month: 'long', day: 'numeric' });
  const reportDate = p.reportDate
    ? new Date(p.reportDate).toLocaleDateString('ar-SA-u-nu-latn', { year: 'numeric', month: 'long', day: 'numeric' })
    : today;

  const val = (v?: string | number | null) =>
    v ? <p style={styles.fieldValue}>{v}</p> : <p style={styles.fieldValueEmpty}>—</p>;

  const Field = ({ label, value }: { label: string; value?: string | number | null }) => (
    <div style={styles.fieldCard}>
      <p style={styles.fieldLabel}>{label}</p>
      {val(value)}
    </div>
  );

  const SecHeader = ({ icon, title }: { icon: string; title: string }) => (
    <div style={styles.sectionHeader}>
      <div style={styles.sectionIcon}>{icon}</div>
      <h3 style={styles.sectionTitle}>{title}</h3>
    </div>
  );

  return (
    <div style={styles.overlay}>
      {/* Toolbar */}
      <div style={styles.toolbar}>
        <button style={styles.btnPrint} onClick={() => window.print()}>🖨️ طباعة</button>
        <button style={styles.btnClose} onClick={onClose}>✕ إغلاق</button>
      </div>

      {/* Page */}
      <div style={styles.page} id="print-page">

        {/* ===== COVER HEADER ===== */}
        <div style={styles.coverHeader}>
          {/* Logo */}
          <p style={styles.logoTitle}>رمز الإبداع</p>
          <p style={styles.logoSubtitle}>لإدارة الأملاك</p>
          <p style={styles.logoTagline}>الوسيط المناسب يصنع الفرق</p>

          <div style={styles.goldDivider} />

          <h1 style={styles.coverTitle}>تقرير العقار</h1>
          <p style={styles.coverSubtitle}>تقرير شامل لبيانات وتفاصيل العقار والوحدات الإيجارية</p>
          <p style={styles.coverDate}>{reportDate}</p>

          <div style={styles.goldDivider} />

          <div style={styles.contactRow}>
            <div style={styles.contactItem}><span>📞</span><span>920013517</span></div>
            <div style={styles.contactItem}><span>✉️</span><span>info@ramzabdae.com</span></div>
          </div>
          <p style={styles.websiteRow}>www.ramzabdae.com</p>
        </div>

        {/* ===== DARK BAND ===== */}
        <div style={styles.darkBand}>
          <div style={styles.darkBandLeft}>
            <p style={styles.darkBandTitle}>تقرير العقار</p>
            <p style={styles.darkBandDate}>📅 {today}</p>
          </div>
          <div style={styles.darkBandRight}>
            <p style={styles.darkBandCompany}>شركة رمز الإبداع للإبداع</p>
            <p style={styles.darkBandSub}>لإدارة الأملاك والعقارات</p>
            <p style={styles.darkBandSub}>وسيط عقاري معتمد</p>
          </div>
        </div>

        {/* ===== CONTENT ===== */}
        <div style={styles.contentArea}>

          {/* 1. البيانات الأساسية */}
          <SecHeader icon="🏢" title="البيانات الأساسية" />
          <div style={styles.grid3}>
            <Field label="اسم العقار" value={p.propertyName} />
            <Field label="نوع العقار" value={p.propertyType} />
            <Field label="الحالة" value={p.isActive ? 'نشط ✓' : 'غير نشط'} />
            <Field label="تاريخ التقرير" value={reportDate} />
            <Field label="نوع وثيقة الملكية" value={p.titleDeedType} />
            <Field label="رقم وثيقة الملكية" value={p.titleDeedNumber} />
          </div>

          {/* 2. بيانات الموقع */}
          <SecHeader icon="📍" title="بيانات الموقع" />
          <div style={styles.grid3}>
            <Field label="المنطقة" value={p.region} />
            <Field label="المدينة" value={p.city} />
            <Field label="الحي" value={p.district} />
            <Field label="العنوان" value={p.address} />
            <Field label="العنوان الوطني" value={p.nationalAddress} />
          </div>

          {/* 3. بيانات الصك */}
          <SecHeader icon="📜" title="بيانات الصك والسجل العيني" />
          <div style={styles.grid3}>
            <Field label="رقم الصك" value={p.titleDeedNumber} />
            <Field label="رقم المستند" value={p.titleDeedDocumentNumber} />
            <Field label="جهة الإصدار" value={p.titleDeedIssuedBy} />
            <Field label="تاريخ الإصدار" value={p.titleDeedIssueDate} />
            <Field label="مساحة الصك م²" value={p.deedArea ? `${p.deedArea} م²` : undefined} />
            <Field label="رقم القطعة" value={p.plotNumber} />
            <Field label="رقم المخطط" value={p.planNumber} />
            <Field label="رقم التسجيل العيني" value={p.realEstateRegNumber} />
            <Field label="حالة التسجيل العيني" value={p.realEstateRegStatus} />
          </div>

          {/* 4. بيانات المبنى */}
          <SecHeader icon="🏗️" title="بيانات المبنى والمرافق" />
          <div style={styles.grid2}>
            <Field label="اسم المالك" value={p.ownerName || owner?.name} />
            <Field label="المنطقة" value={p.region} />
            <Field label="الحي" value={p.district} />
            <Field label="المنطقة / المدينة" value={`${p.city}${p.region ? ` - ${p.region}` : ''}`} />
            <Field label="الغرض من الاستخدام" value={p.propertyUsage || p.usagePurpose} />
            <Field label="نوع البناء" value={p.buildingType} />
            <Field label="عدد الوحدات" value={p.totalUnits} />
            <Field label="عدد الطوابق" value={p.floors} />
            <Field label="عدد المواقف" value={p.parkingSpots} />
            <Field label="عدد المصاعد" value={p.elevators} />
            <Field label="الحجلة / نوع المفتاح" value={(p as any).keyType} />
            <Field label="المساحة الإجمالية م²" value={p.deedArea ? `${p.deedArea} م²` : undefined} />
          </div>

          {/* 5. الإجماليات */}
          <SecHeader icon="📊" title="إجماليات الوحدات والعقود" />
          <div style={{ ...styles.grid4, marginBottom: '12px' }}>
            {[
              { label: 'إجمالي الوحدات', value: totalUnitsCount, color: DARK },
              { label: 'المؤجرة', value: rentedUnits, color: '#1d4ed8' },
              { label: 'المحجوزة', value: reservedUnits, color: '#92400e' },
              { label: 'المتاحة', value: availableUnits, color: '#065f46' },
            ].map((k, i) => (
              <div key={i} style={styles.kpiCard}>
                <p style={{ ...styles.kpiValue, color: k.color }}>{k.value}</p>
                <p style={styles.kpiLabel}>{k.label}</p>
              </div>
            ))}
          </div>
          {/* Progress bar occupancy */}
          <div style={{ background: BEIGE_CARD, borderRadius: '8px', padding: '12px 14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '12px', color: TEXT_MUTED }}>
              <span>نسبة الإشغال</span>
              <span style={{ fontWeight: 700, color: GOLD }}>{occupancyRate}%</span>
            </div>
            <div style={{ background: '#ddd', borderRadius: '10px', height: '8px' }}>
              <div style={{ background: GOLD, width: `${occupancyRate}%`, height: '8px', borderRadius: '10px' }} />
            </div>
          </div>
          <div style={{ marginTop: '12px' }}>
            {[
              { label: 'إجمالي العقود النشطة', value: `${propContracts.length} عقد`, bg: '#fffbeb' },
              { label: 'إجمالي مبلغ العقود', value: `${totalContractValue.toLocaleString('ar-SA')} ر.س`, bg: BEIGE_CARD },
              { label: 'إجمالي رسوم التوثيق', value: `${totalDocFees.toLocaleString('ar-SA')} ر.س`, bg: '#fffbeb' },
              { label: 'إجمالي رسوم السعي', value: `${totalCommission.toLocaleString('ar-SA')} ر.س`, bg: BEIGE_CARD },
            ].map((r, i) => (
              <div key={i} style={{ ...styles.finRow, background: r.bg }}>
                <span style={styles.finLabel}>{r.label}</span>
                <span style={styles.finValue}>{r.value}</span>
              </div>
            ))}
          </div>

          {/* 6. بيانات المالك */}
          <SecHeader icon="👤" title="بيانات المالك" />
          <div style={styles.grid3}>
            <Field label="اسم المالك" value={p.ownerName || owner?.name} />
            <Field label="هوية المالك" value={p.ownerIdentity} />
            <Field label="الجنسية" value={p.ownerNationality} />
            <Field label="نسبة الملكية" value={p.ownershipPercentage} />
            <Field label="مساحة الملكية م²" value={p.ownershipArea ? `${p.ownershipArea} م²` : undefined} />
            <Field label="نوع المالك" value={p.ownerType} />
          </div>

          {/* 7. اتحاد الملاك */}
          {p.associationName && (
            <>
              <SecHeader icon="🏘️" title="اتحاد الملاك" />
              <div style={styles.grid3}>
                <Field label="اسم الجمعية" value={p.associationName} />
                <Field label="رقم التسجيل" value={p.associationRegNumber} />
                <Field label="الرقم الموحد" value={p.associationUnifiedNumber} />
                <Field label="حالة الجمعية" value={p.associationStatus} />
                <Field label="تاريخ السريان" value={p.associationStartDate} />
                <Field label="تاريخ الانتهاء" value={p.associationEndDate} />
                <Field label="رئيس الجمعية" value={p.associationPresidentName} />
                <Field label="جوال الرئيس" value={p.associationPresidentMobile} />
                <Field label="مدير العقار" value={p.propertyManagerName} />
              </div>
              <div style={{ ...styles.grid4, marginTop: '10px' }}>
                {[
                  { label: 'إجمالي الرسوم ر.س', value: p.associationTotalFees?.toLocaleString('ar-SA') },
                  { label: 'عدد المصوتين', value: p.associationVotersCount },
                  { label: 'نسبة القبول', value: p.associationAcceptanceRate },
                  { label: 'غير المصوتين', value: p.associationNonVoters },
                ].map((k, i) => (
                  <div key={i} style={styles.kpiCard}>
                    <p style={styles.kpiValue}>{k.value ?? '—'}</p>
                    <p style={styles.kpiLabel}>{k.label}</p>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* 8. الوسيط العقاري */}
          {p.brokerEstablishmentName && (
            <>
              <SecHeader icon="🧑‍💼" title="الوسيط العقاري" />
              <div style={styles.grid2}>
                <Field label="اسم المنشأة" value={p.brokerEstablishmentName} />
                <Field label="السجل التجاري" value={p.brokerCommercialReg} />
              </div>
            </>
          )}

          {/* الملاحظات */}
          {p.reportNotes && p.reportNotes.length > 0 && (
            <>
              <SecHeader icon="📝" title="الملاحظات" />
              <div style={{ background: BEIGE_CARD, borderRadius: '8px', padding: '14px', fontSize: '13px', color: DARK, lineHeight: '1.8' }}>
                {p.reportNotes.map((n, i) => <div key={i}>• {n}</div>)}
              </div>
            </>
          )}

          {/* التوقيعات */}
          <div style={styles.signRow}>
            {['مدير العقار', 'مسؤول الملف', 'المالك'].map(role => (
              <div key={role} style={styles.signBox}>
                <p style={styles.signRole}>{role}</p>
                <div style={styles.signLine}>التوقيع والختم</div>
              </div>
            ))}
          </div>
        </div>

        {/* ===== FOOTER ===== */}
        <div style={styles.footer}>
          <div style={styles.footerContactRow}>
            <div style={styles.footerContact}><span>📞</span><span>920013517</span></div>
            <div style={styles.footerContact}><span>✉️</span><span>info@ramzabdae.com</span></div>
            <div style={styles.footerContact}><span>🌐</span><span>www.ramzabdae.com</span></div>
          </div>
          <div style={styles.footerCompany}>
            <p style={styles.footerCompanyName}>شركة رمز الإبداع لإدارة الأملاك</p>
            <p style={styles.footerTagline}>الوسيط المناسب يصنع الفرق</p>
            <p style={styles.footerCopy}>© 2026 جميع الحقوق محفوظة | وسيط عقاري معتمد</p>
          </div>
        </div>
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          body > *:not(#print-page) { display: none !important; }
          #print-page { box-shadow: none !important; width: 100% !important; }
          .no-print { display: none !important; }
        }
      `}</style>
    </div>
  );
}
