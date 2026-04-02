import { useState, useMemo } from 'react';
import { useStore, generateId } from '../../data/store';
import {
  Shield, Plus, Edit, Trash2, Printer, Search, CheckCircle,
  Clock, AlertTriangle, XCircle, Eye, FileText,
  Building2, MapPin, User, Award, Calendar, DollarSign,
  Globe, RefreshCw, ChevronDown, ChevronUp, ExternalLink
} from 'lucide-react';
import type { AdLicense } from '../../types';

// ─── Maps ─────────────────────────────────────────────────────
const adTypeLabels: Record<string, string> = {
  rent: 'إيجار', sale: 'بيع', waqf: 'وقف', auction: 'مزاد'
};
const adTypeColors: Record<string, string> = {
  rent: 'bg-blue-100 text-blue-700',
  sale: 'bg-green-100 text-green-700',
  waqf: 'bg-purple-100 text-purple-700',
  auction: 'bg-orange-100 text-orange-700'
};
const propertyUseLabels: Record<string, string> = {
  residential: 'سكني', commercial: 'تجاري',
  industrial: 'صناعي', agricultural: 'زراعي', mixed: 'متعدد الاستخدام'
};
const statusLabels: Record<string, string> = {
  draft: 'مسودة', submitted: 'مُقدَّم', under_review: 'قيد المراجعة',
  approved: 'مُعتمد', rejected: 'مرفوض', expired: 'منتهي', cancelled: 'ملغي'
};
const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600',
  submitted: 'bg-blue-100 text-blue-700',
  under_review: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  expired: 'bg-orange-100 text-orange-700',
  cancelled: 'bg-gray-100 text-gray-400'
};
const statusIcons: Record<string, React.ReactNode> = {
  draft: <FileText className="w-3.5 h-3.5" />,
  submitted: <Clock className="w-3.5 h-3.5" />,
  under_review: <RefreshCw className="w-3.5 h-3.5" />,
  approved: <CheckCircle className="w-3.5 h-3.5" />,
  rejected: <XCircle className="w-3.5 h-3.5" />,
  expired: <AlertTriangle className="w-3.5 h-3.5" />,
  cancelled: <XCircle className="w-3.5 h-3.5" />
};
const platformLabels: Record<string, string> = {
  website: 'موقع إلكتروني', social_media: 'سوشيال ميديا',
  print: 'مطبوعات', outdoor: 'لافتات خارجية', sms: 'رسائل نصية', other: 'أخرى'
};
const advertiserTypeLabels: Record<string, string> = {
  owner: 'المالك مباشرة', broker: 'وسيط عقاري', developer: 'مطوّر عقاري'
};
const identityTypeLabels: Record<string, string> = {
  national_id: 'هوية وطنية', iqama: 'إقامة',
  passport: 'جواز سفر', commercial_reg: 'سجل تجاري'
};

// ─── Print Certificate ────────────────────────────────────────
function printLicenseCertificate(lic: AdLicense) {
  const win = window.open('', '_blank');
  if (!win) return;
  const daysLeft = lic.expiryDate
    ? Math.ceil((new Date(lic.expiryDate).getTime() - Date.now()) / 86400000)
    : null;

  win.document.write(`<!DOCTYPE html><html dir="rtl" lang="ar"><head>
  <meta charset="UTF-8"><title>ترخيص إعلان عقاري - ${lic.licenseNumber}</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:'Segoe UI',Arial,sans-serif;direction:rtl;color:#1a1a2e;background:#fff}
    .page{max-width:794px;margin:0 auto;padding:32px}
    /* certificate border */
    .cert{border:3px solid #d97706;border-radius:16px;overflow:hidden}
    /* header stripe */
    .cert-header{background:linear-gradient(135deg,#d97706,#92400e);padding:28px 32px;color:#fff;display:flex;justify-content:space-between;align-items:center}
    .cert-header h1{font-size:20px;font-weight:900}
    .cert-header p{font-size:11px;opacity:.85;margin-top:4px}
    .cert-number{text-align:center;background:rgba(255,255,255,.15);border-radius:12px;padding:12px 20px}
    .cert-number .num{font-size:22px;font-weight:900;letter-spacing:2px}
    .cert-number .lbl{font-size:10px;opacity:.8}
    /* body */
    .cert-body{padding:28px 32px;background:#fffbf0}
    /* status badge */
    .status-bar{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;padding:12px 16px;border-radius:10px;border:2px solid ${lic.status === 'approved' ? '#16a34a' : '#d97706'};background:${lic.status === 'approved' ? '#f0fdf4' : '#fef3c7'}}
    .status-bar .status-label{font-size:15px;font-weight:800;color:${lic.status === 'approved' ? '#16a34a' : '#92400e'}}
    .status-bar .dates{font-size:11px;color:#555}
    /* sections */
    .section{margin-bottom:18px}
    .section-title{font-size:12px;font-weight:800;color:#d97706;border-right:3px solid #d97706;padding-right:10px;margin-bottom:10px;background:#fef3c7;padding:5px 10px;border-radius:0 6px 6px 0}
    .grid-2{display:grid;grid-template-columns:1fr 1fr;gap:8px}
    .grid-3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px}
    .field{background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:8px 12px}
    .field-lbl{font-size:10px;color:#9ca3af;margin-bottom:2px}
    .field-val{font-size:12px;font-weight:600;color:#1f2937}
    .field-val.primary{color:#d97706;font-size:14px}
    .field-val.green{color:#16a34a}
    .field-val.mono{font-family:monospace;font-size:11px}
    /* platforms */
    .platforms{display:flex;gap:8px;flex-wrap:wrap;margin-top:8px}
    .platform-tag{background:#dbeafe;color:#1d4ed8;border-radius:20px;padding:4px 12px;font-size:11px;font-weight:600}
    /* rega seal */
    .seal-area{display:flex;justify-content:space-between;align-items:flex-end;margin-top:24px;padding-top:18px;border-top:1px solid #e5e7eb}
    .rega-seal{width:90px;height:90px;border:2px solid #d97706;border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#d97706;font-size:9px;font-weight:700;text-align:center;line-height:1.4}
    .sig-line{border-top:1px solid #9ca3af;width:160px;margin-top:36px}
    .sig-hint{font-size:10px;color:#9ca3af;text-align:center;margin-top:4px}
    /* QR placeholder */
    .qr-box{width:70px;height:70px;border:1px solid #e5e7eb;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:9px;color:#9ca3af;text-align:center}
    /* footer */
    .footer{background:#1a1a2e;color:#fff;padding:12px 24px;display:flex;justify-content:space-between;font-size:10px;opacity:.8}
    .disclaimer{margin-top:16px;font-size:10px;color:#6b7280;text-align:center;padding:8px;background:#f9fafb;border-radius:6px}
    @media print{body{print-color-adjust:exact;-webkit-print-color-adjust:exact}}
  </style></head><body><div class="page"><div class="cert">
  <div class="cert-header">
    <div>
      <h1>🏛️ شهادة ترخيص إعلان عقاري</h1>
      <p>هيئة العقار السعودية (REGA) — منصة الترخيصات الإعلانية</p>
      <p style="margin-top:6px;font-size:12px">رمز الإبداع لإدارة الأملاك ${lic.brokerLicenseNumber ? `• رخصة فال: ${lic.brokerLicenseNumber}` : ''}</p>
    </div>
    <div class="cert-number">
      <div class="lbl">رقم الترخيص</div>
      <div class="num">${lic.licenseNumber}</div>
      ${lic.regaRequestNumber ? `<div class="lbl" style="margin-top:6px">رقم الطلب: ${lic.regaRequestNumber}</div>` : ''}
    </div>
  </div>

  <div class="cert-body">
    <div class="status-bar">
      <div>
        <span class="status-label">${statusLabels[lic.status]}</span>
        <span style="font-size:12px;color:#666;margin-right:12px">• ${adTypeLabels[lic.adType]} • ${propertyUseLabels[lic.propertyUse]}</span>
      </div>
      <div class="dates">
        ${lic.issueDate ? `صدر: ${new Date(lic.issueDate).toLocaleDateString('ar-SA')}` : ''}
        ${lic.expiryDate ? ` &nbsp;|&nbsp; ينتهي: ${new Date(lic.expiryDate).toLocaleDateString('ar-SA')} ${daysLeft !== null ? `(${daysLeft > 0 ? daysLeft + ' يوم' : 'منتهي'})` : ''}` : ''}
      </div>
    </div>

    <div class="section">
      <div class="section-title">أولاً: بيانات العقار المُعلَن عنه</div>
      <div class="grid-3">
        <div class="field" style="grid-column:span 2"><div class="field-lbl">وصف العقار</div><div class="field-val">${lic.propertyDescription}</div></div>
        ${lic.titleDeedNumber ? `<div class="field" style="border-color:#d97706"><div class="field-lbl">📜 رقم الصك / وثيقة الملكية</div><div class="field-val primary mono">${lic.titleDeedNumber}</div></div>` : ''}
        <div class="field"><div class="field-lbl">المدينة</div><div class="field-val">${lic.propertyCity}</div></div>
        ${lic.propertyDistrict ? `<div class="field"><div class="field-lbl">الحي</div><div class="field-val">${lic.propertyDistrict}</div></div>` : ''}
        <div class="field"><div class="field-lbl">العنوان</div><div class="field-val">${lic.propertyAddress}</div></div>
        ${lic.propertyType ? `<div class="field"><div class="field-lbl">نوع العقار</div><div class="field-val">${lic.propertyType}</div></div>` : ''}
        ${lic.propertyArea ? `<div class="field"><div class="field-lbl">المساحة</div><div class="field-val">${lic.propertyArea} م²</div></div>` : ''}
        ${lic.advertisedPrice ? `<div class="field"><div class="field-lbl">السعر الإعلاني ر.س</div><div class="field-val green">${lic.advertisedPrice.toLocaleString()} ${lic.priceUnit === 'yearly' ? '/ سنة' : lic.priceUnit === 'monthly' ? '/ شهر' : ''}</div></div>` : ''}
      </div>
    </div>

    <div class="section">
      <div class="section-title">ثانياً: بيانات المالك</div>
      <div class="grid-3">
        <div class="field"><div class="field-lbl">اسم المالك</div><div class="field-val">${lic.ownerName}</div></div>
        <div class="field"><div class="field-lbl">نوع الهوية</div><div class="field-val">${identityTypeLabels[lic.ownerIdentityType]}</div></div>
        <div class="field"><div class="field-lbl">رقم الهوية</div><div class="field-val mono">${lic.ownerIdentity}</div></div>
        <div class="field"><div class="field-lbl">رقم الجوال</div><div class="field-val">${lic.ownerPhone}</div></div>
        ${lic.ownerEmail ? `<div class="field"><div class="field-lbl">البريد</div><div class="field-val">${lic.ownerEmail}</div></div>` : ''}
      </div>
    </div>

    ${lic.advertiserType !== 'owner' && lic.brokerName ? `<div class="section">
      <div class="section-title">ثالثاً: بيانات المُعلِن / الوسيط</div>
      <div class="grid-3">
        <div class="field"><div class="field-lbl">نوع المُعلِن</div><div class="field-val">${advertiserTypeLabels[lic.advertiserType]}</div></div>
        <div class="field"><div class="field-lbl">اسم الوسيط</div><div class="field-val">${lic.brokerName}</div></div>
        ${lic.brokerLicenseNumber ? `<div class="field" style="border-color:#d97706"><div class="field-lbl">🏅 رقم رخصة فال</div><div class="field-val primary">${lic.brokerLicenseNumber}</div></div>` : ''}
        ${lic.brokerPhone ? `<div class="field"><div class="field-lbl">جوال الوسيط</div><div class="field-val">${lic.brokerPhone}</div></div>` : ''}
      </div>
    </div>` : ''}

    <div class="section">
      <div class="section-title">${lic.advertiserType !== 'owner' && lic.brokerName ? 'رابعاً' : 'ثالثاً'}: المنصات الإعلانية المرخّصة</div>
      <div class="platforms">
        ${lic.platforms.map(p => `<span class="platform-tag">✓ ${platformLabels[p]}</span>`).join('')}
      </div>
    </div>

    ${lic.licenseFee != null && lic.licenseFee > 0 ? `<div class="section">
      <div class="section-title">الرسوم</div>
      <div class="grid-2">
        <div class="field"><div class="field-lbl">رسوم الترخيص ر.س</div><div class="field-val green">${lic.licenseFee.toLocaleString()}</div></div>
        <div class="field"><div class="field-lbl">حالة السداد</div><div class="field-val ${lic.feesPaid ? 'green' : ''}">${lic.feesPaid ? '✅ مدفوعة' : '⏳ معلقة'}</div></div>
        ${lic.paymentRef ? `<div class="field"><div class="field-lbl">رقم المرجع</div><div class="field-val mono">${lic.paymentRef}</div></div>` : ''}
      </div>
    </div>` : ''}

    ${lic.notes ? `<div style="background:#fef9ec;border:1px solid #fcd34d;border-radius:8px;padding:10px 14px;font-size:12px;color:#374151">
      <strong>ملاحظات:</strong> ${lic.notes}
    </div>` : ''}

    <div class="disclaimer">
      ⚠️ هذا الترخيص يُجيز نشر الإعلان العقاري على المنصات المحددة أعلاه فقط. يجب ذكر رقم الترخيص في جميع مواد الإعلان وفق المادة (12) من لائحة الإعلانات العقارية.
    </div>

    <div class="seal-area">
      <div>
        <div class="sig-line"></div>
        <div class="sig-hint">توقيع المسؤول المفوَّض</div>
        <div style="font-size:11px;color:#374151;margin-top:4px;font-weight:600">${lic.brokerName ?? 'رمز الإبداع لإدارة الأملاك'}</div>
      </div>
      <div class="qr-box">رمز QR<br>التحقق</div>
      <div class="rega-seal">هيئة<br>العقار<br>السعودية<br>REGA</div>
    </div>
  </div>

  <div class="footer">
    <span>طُبع: ${new Date().toLocaleString('ar-SA')}</span>
    <span>رمز الإبداع لإدارة الأملاك | ramzabdae.com</span>
    <span>ترخيص رقم: ${lic.licenseNumber}</span>
  </div>
</div></div></body></html>`);
  win.document.close();
  win.print();
}

// ─── KPI Card ─────────────────────────────────────────────────
function KpiCard({ label, value, icon, color, sub }: {
  label: string; value: string | number; icon: React.ReactNode; color: string; sub?: string;
}) {
  return (
    <div className="card flex items-center gap-3">
      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${color}`}>{icon}</div>
      <div>
        <p className="text-xl font-bold text-gray-800">{value}</p>
        <p className="text-xs text-gray-500">{label}</p>
        {sub && <p className="text-xs text-green-600 font-semibold">{sub}</p>}
      </div>
    </div>
  );
}

// ─── License Card ─────────────────────────────────────────────
function LicenseCard({ lic, onEdit, onDelete, onPrint, canManage }: {
  lic: AdLicense; onEdit: () => void; onDelete: () => void; onPrint: () => void; canManage: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const daysLeft = lic.expiryDate
    ? Math.ceil((new Date(lic.expiryDate).getTime() - Date.now()) / 86400000)
    : null;
  const expiringSoon = daysLeft !== null && daysLeft > 0 && daysLeft <= 14;

  return (
    <div className={`card transition-all hover:shadow-md
      ${lic.status === 'approved' && expiringSoon ? 'border-l-4 border-orange-400' : ''}
      ${lic.status === 'approved' ? 'border-l-4 border-green-500' : ''}
      ${lic.status === 'rejected' ? 'border-l-4 border-red-500' : ''}
    `}>
      <div className="flex items-start justify-between gap-3">
        {/* Icon + main info */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${statusColors[lic.status]}`}>
            {statusIcons[lic.status]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="font-mono text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">{lic.licenseNumber}</span>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${adTypeColors[lic.adType]}`}>
                {adTypeLabels[lic.adType]}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                {propertyUseLabels[lic.propertyUse]}
              </span>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1 ${statusColors[lic.status]}`}>
                {statusIcons[lic.status]} {statusLabels[lic.status]}
              </span>
            </div>
            <p className="font-bold text-gray-800">{lic.propertyDescription}</p>
            <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
              <MapPin className="w-3 h-3" />{lic.propertyCity}{lic.propertyDistrict ? ` — ${lic.propertyDistrict}` : ''} • {lic.propertyAddress.slice(0, 50)}
            </p>
            <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
              <User className="w-3 h-3" />{lic.ownerName}
              {lic.brokerLicenseNumber && <span className="flex items-center gap-1 text-yellow-700 font-medium mr-2"><Award className="w-3 h-3" />فال: {lic.brokerLicenseNumber}</span>}
            </p>
          </div>
        </div>

        {/* Price + dates */}
        <div className="flex flex-col items-end gap-1 shrink-0">
          {lic.advertisedPrice != null && lic.advertisedPrice > 0 && (
            <p className="text-base font-bold text-yellow-600">
              {(lic.advertisedPrice / 1000).toFixed(0)}K ر.س
            </p>
          )}
          {lic.expiryDate && (
            <p className={`text-xs font-semibold flex items-center gap-1 ${daysLeft !== null && daysLeft <= 7 ? 'text-red-600' : expiringSoon ? 'text-orange-600' : 'text-green-600'}`}>
              <Clock className="w-3 h-3" />
              {daysLeft !== null && daysLeft > 0 ? `${daysLeft} يوم` : 'منتهي'}
            </p>
          )}
          {lic.views != null && lic.views > 0 && (
            <p className="text-xs text-gray-400 flex items-center gap-1"><Eye className="w-3 h-3" />{lic.views}</p>
          )}
        </div>
      </div>

      {/* Platforms row */}
      {lic.platforms.length > 0 && (
        <div className="flex gap-1.5 flex-wrap mt-2">
          {lic.platforms.map(p => (
            <span key={p} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{platformLabels[p]}</span>
          ))}
        </div>
      )}

      {/* Rejection reason */}
      {lic.status === 'rejected' && lic.rejectionReason && (
        <div className="mt-2 text-xs text-red-700 bg-red-50 rounded-lg px-3 py-2">
          <span className="font-semibold">سبب الرفض: </span>{lic.rejectionReason}
        </div>
      )}

      {/* Footer actions */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 gap-2 flex-wrap">
        <div className="flex items-center gap-3 text-xs text-gray-500">
          {lic.issueDate && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />صدر: {new Date(lic.issueDate).toLocaleDateString('ar-SA')}</span>}
          {lic.expiryDate && <span>| ينتهي: {new Date(lic.expiryDate).toLocaleDateString('ar-SA')}</span>}
          {lic.licenseFee != null && lic.licenseFee > 0 && (
            <span className={`flex items-center gap-1 ${lic.feesPaid ? 'text-green-600' : 'text-orange-600'}`}>
              <DollarSign className="w-3 h-3" />{lic.feesPaid ? 'مدفوعة' : 'غير مدفوعة'}
            </span>
          )}
          <button onClick={() => setExpanded(v => !v)} className="flex items-center gap-1 text-gray-400 hover:text-gray-700 transition-colors">
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            {expanded ? 'إخفاء' : 'تفاصيل'}
          </button>
        </div>
        <div className="flex gap-1.5">
          {lic.publishedUrl && (
            <a href={lic.publishedUrl} target="_blank" rel="noreferrer"
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200">
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
          <button onClick={onPrint} className="w-8 h-8 flex items-center justify-center rounded-lg bg-yellow-100 text-yellow-700 hover:bg-yellow-200" title="طباعة شهادة الترخيص">
            <Printer className="w-3.5 h-3.5" />
          </button>
          {canManage && (
            <>
              <button onClick={onEdit} className="btn-secondary text-xs py-1 px-2.5"><Edit className="w-3 h-3" /></button>
              <button onClick={onDelete} className="text-xs py-1 px-2.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50"><Trash2 className="w-3 h-3" /></button>
            </>
          )}
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-gray-400 mb-0.5">رقم الصك</p>
              <p className="font-semibold font-mono">{lic.titleDeedNumber || '—'}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-gray-400 mb-0.5">نوع المُعلِن</p>
              <p className="font-semibold">{advertiserTypeLabels[lic.advertiserType]}</p>
            </div>
            {lic.propertyArea != null && (
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-gray-400 mb-0.5">المساحة</p>
                <p className="font-semibold">{lic.propertyArea} م²</p>
              </div>
            )}
            {lic.durationDays != null && (
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-gray-400 mb-0.5">مدة الترخيص</p>
                <p className="font-semibold">{lic.durationDays} يوم</p>
              </div>
            )}
            {lic.licenseFee != null && lic.licenseFee > 0 && (
              <div className="bg-yellow-50 rounded-xl p-3">
                <p className="text-gray-400 mb-0.5">رسوم الترخيص ر.س</p>
                <p className="font-bold text-yellow-700">{lic.licenseFee.toLocaleString()}</p>
              </div>
            )}
            {lic.regaRequestNumber && (
              <div className="bg-blue-50 rounded-xl p-3">
                <p className="text-gray-400 mb-0.5">رقم طلب هيئة العقار</p>
                <p className="font-semibold text-blue-700 font-mono">{lic.regaRequestNumber}</p>
              </div>
            )}
            {lic.views != null && (
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-gray-400 mb-0.5">مشاهدات الإعلان</p>
                <p className="font-bold">{lic.views.toLocaleString()}</p>
              </div>
            )}
            {lic.inquiries != null && (
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-gray-400 mb-0.5">استفسارات</p>
                <p className="font-bold">{lic.inquiries}</p>
              </div>
            )}
          </div>
          {lic.adTitle && (
            <div className="bg-blue-50 rounded-xl p-3">
              <p className="text-xs font-semibold text-blue-700 mb-1">عنوان الإعلان المنشور</p>
              <p className="text-sm font-medium">{lic.adTitle}</p>
              {lic.adDescription && <p className="text-xs text-gray-600 mt-1">{lic.adDescription}</p>}
            </div>
          )}
          {lic.notes && (
            <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-700">
              <span className="font-semibold text-gray-500">ملاحظات: </span>{lic.notes}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Form Modal ───────────────────────────────────────────────
const STEP_TITLES = ['بيانات العقار والمالك', 'بيانات الترخيص والمُعلِن', 'المنصات والسعر والرسوم'];

const EMPTY: Omit<AdLicense, 'id' | 'licenseNumber' | 'createdAt'> = {
  regaRequestNumber: '', adType: 'rent', propertyUse: 'residential',
  status: 'draft', rejectionReason: '',
  titleDeedNumber: '', titleDeedType: '', propertyDescription: '',
  propertyCity: '', propertyDistrict: '', propertyAddress: '',
  propertyArea: undefined, propertyType: '', buildingAge: undefined,
  floorsCount: undefined, unitsCount: undefined,
  ownerName: '', ownerIdentity: '', ownerIdentityType: 'national_id',
  ownerPhone: '', ownerEmail: '',
  advertiserType: 'broker',
  brokerName: 'رمز الإبداع لإدارة الأملاك', brokerLicenseNumber: '',
  brokerPhone: '', brokerUserId: '',
  advertisedPrice: undefined, priceUnit: 'yearly', negotiable: false,
  platforms: ['website', 'social_media'],
  issueDate: new Date().toISOString().slice(0, 10),
  expiryDate: new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10),
  durationDays: 90,
  licenseFee: 500, feesPaid: false, paymentRef: '',
  adTitle: '', adDescription: '', publishedUrl: '',
  views: 0, inquiries: 0, notes: '',
};

function LicenseForm({ editing, onSave, onClose }: {
  editing: AdLicense | null; onSave: (data: Omit<AdLicense, 'id' | 'licenseNumber' | 'createdAt'>) => void; onClose: () => void;
}) {
  const { users, properties, units } = useStore();
  const brokers = users.filter(u => u.role === 'broker');
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<typeof EMPTY>(editing ? { ...editing } : { ...EMPTY });

  const f = form;
  const set = (patch: Partial<typeof EMPTY>) => setForm(p => ({ ...p, ...patch }));
  const togglePlatform = (p: string) => {
    const plat = p as AdLicense['platforms'][number];
    set({ platforms: f.platforms.includes(plat) ? f.platforms.filter(x => x !== plat) : [...f.platforms, plat] });
  };
  const fillBroker = (uid: string) => {
    const u = users.find(x => x.id === uid);
    if (u) set({ brokerName: u.name, brokerPhone: u.phone ?? '', brokerUserId: uid });
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl my-auto">
        {/* Modal header */}
        <div className="bg-gradient-to-l from-yellow-500 to-amber-600 rounded-t-2xl p-5 text-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Shield className="w-5 h-5" />
              {editing ? 'تعديل ترخيص الإعلان' : 'طلب ترخيص إعلان عقاري جديد'}
            </h2>
            <button onClick={onClose} className="text-white/70 hover:text-white text-2xl leading-none">×</button>
          </div>
          {/* Steps */}
          <div className="flex gap-2">
            {STEP_TITLES.map((t, i) => (
              <button key={i} type="button" onClick={() => setStep(i + 1)}
                className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all ${step === i + 1 ? 'bg-white text-yellow-700 shadow' : step > i + 1 ? 'bg-white/40 text-white' : 'bg-white/20 text-white/70'}`}>
                <span className="block text-base leading-none mb-0.5">{i + 1}</span>
                <span className="hidden sm:block">{t}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {/* Step 1: Property + Owner */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="font-bold text-gray-700 flex items-center gap-2 text-sm">
                <Building2 className="w-4 h-4 text-yellow-500" /> بيانات العقار
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">نوع الإعلان *</label>
                  <select className="input-field" value={f.adType} onChange={e => set({ adType: e.target.value as any })}>
                    {Object.entries(adTypeLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">نوع الاستخدام *</label>
                  <select className="input-field" value={f.propertyUse} onChange={e => set({ propertyUse: e.target.value as any })}>
                    {Object.entries(propertyUseLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="label flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-yellow-500" /> رقم الصك / وثيقة الملكية *
                    <span className="text-red-500 text-xs">(إلزامي من هيئة العقار)</span>
                  </label>
                  <input className="input-field font-mono" value={f.titleDeedNumber} onChange={e => set({ titleDeedNumber: e.target.value })} required placeholder="رقم الصك..." />
                </div>
                <div className="col-span-2">
                  <label className="label">وصف العقار *</label>
                  <input className="input-field" value={f.propertyDescription} onChange={e => set({ propertyDescription: e.target.value })} required placeholder="مثال: شقة 3 غرف بالدور الثاني..." />
                </div>
                <div>
                  <label className="label">نوع العقار</label>
                  <input className="input-field" value={f.propertyType ?? ''} onChange={e => set({ propertyType: e.target.value })} placeholder="شقة، فيلا، محل..." />
                </div>
                <div>
                  <label className="label">المساحة م²</label>
                  <input type="number" min="0" className="input-field" value={f.propertyArea ?? ''} onChange={e => set({ propertyArea: e.target.value ? +e.target.value : undefined })} />
                </div>
                <div>
                  <label className="label">المدينة *</label>
                  <input className="input-field" value={f.propertyCity} onChange={e => set({ propertyCity: e.target.value })} required />
                </div>
                <div>
                  <label className="label">الحي</label>
                  <input className="input-field" value={f.propertyDistrict ?? ''} onChange={e => set({ propertyDistrict: e.target.value })} />
                </div>
                <div className="col-span-2">
                  <label className="label">العنوان الكامل *</label>
                  <input className="input-field" value={f.propertyAddress} onChange={e => set({ propertyAddress: e.target.value })} required />
                </div>
                <div>
                  <label className="label">عمر المبنى (سنة)</label>
                  <input type="number" min="0" className="input-field" value={f.buildingAge ?? ''} onChange={e => set({ buildingAge: e.target.value ? +e.target.value : undefined })} />
                </div>
                <div>
                  <label className="label">عدد الطوابق</label>
                  <input type="number" min="0" className="input-field" value={f.floorsCount ?? ''} onChange={e => set({ floorsCount: e.target.value ? +e.target.value : undefined })} />
                </div>
              </div>
              {/* Owner */}
              <h3 className="font-bold text-gray-700 flex items-center gap-2 text-sm pt-2 border-t">
                <User className="w-4 h-4 text-yellow-500" /> بيانات المالك
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="label">اسم المالك *</label>
                  <input className="input-field" value={f.ownerName} onChange={e => set({ ownerName: e.target.value })} required />
                </div>
                <div>
                  <label className="label">نوع الهوية</label>
                  <select className="input-field" value={f.ownerIdentityType} onChange={e => set({ ownerIdentityType: e.target.value as any })}>
                    {Object.entries(identityTypeLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">رقم الهوية *</label>
                  <input className="input-field font-mono" value={f.ownerIdentity} onChange={e => set({ ownerIdentity: e.target.value })} required />
                </div>
                <div>
                  <label className="label">رقم الجوال *</label>
                  <input className="input-field" value={f.ownerPhone} onChange={e => set({ ownerPhone: e.target.value })} required />
                </div>
                <div>
                  <label className="label">البريد الإلكتروني</label>
                  <input type="email" className="input-field" value={f.ownerEmail ?? ''} onChange={e => set({ ownerEmail: e.target.value })} />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: License + Advertiser */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="font-bold text-gray-700 flex items-center gap-2 text-sm">
                <Shield className="w-4 h-4 text-yellow-500" /> بيانات الترخيص
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">حالة الترخيص</label>
                  <select className="input-field" value={f.status} onChange={e => set({ status: e.target.value as any })}>
                    {Object.entries(statusLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">رقم الطلب على هيئة العقار</label>
                  <input className="input-field font-mono" value={f.regaRequestNumber ?? ''} onChange={e => set({ regaRequestNumber: e.target.value })} placeholder="من منصة هيئة العقار" />
                </div>
                <div>
                  <label className="label">تاريخ الإصدار</label>
                  <input type="date" className="input-field" value={f.issueDate ?? ''} onChange={e => set({ issueDate: e.target.value })} />
                </div>
                <div>
                  <label className="label">تاريخ الانتهاء</label>
                  <input type="date" className="input-field" value={f.expiryDate ?? ''} onChange={e => set({ expiryDate: e.target.value })} />
                </div>
                <div>
                  <label className="label">مدة الترخيص (يوم)</label>
                  <input type="number" min="1" className="input-field" value={f.durationDays ?? 90} onChange={e => set({ durationDays: +e.target.value })} />
                </div>
                {f.status === 'rejected' && (
                  <div className="col-span-2">
                    <label className="label">سبب الرفض</label>
                    <input className="input-field" value={f.rejectionReason ?? ''} onChange={e => set({ rejectionReason: e.target.value })} />
                  </div>
                )}
              </div>

              <h3 className="font-bold text-gray-700 flex items-center gap-2 text-sm pt-2 border-t">
                <Award className="w-4 h-4 text-yellow-500" /> بيانات المُعلِن
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">نوع المُعلِن</label>
                  <select className="input-field" value={f.advertiserType} onChange={e => set({ advertiserType: e.target.value as any })}>
                    {Object.entries(advertiserTypeLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                {brokers.length > 0 && (
                  <div>
                    <label className="label">اختر وسيطاً (اختياري)</label>
                    <select className="input-field" onChange={e => fillBroker(e.target.value)}>
                      <option value="">-- من قائمة الموظفين --</option>
                      {brokers.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                  </div>
                )}
                <div className="col-span-2">
                  <label className="label">اسم المنشأة / الوسيط *</label>
                  <input className="input-field" value={f.brokerName ?? ''} onChange={e => set({ brokerName: e.target.value })} />
                </div>
                <div>
                  <label className="label flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-500" /> رقم رخصة فال
                    {f.advertiserType === 'broker' && <span className="text-red-500 text-xs">(إلزامي للوسيط)</span>}
                  </label>
                  <input className="input-field font-mono" value={f.brokerLicenseNumber ?? ''} onChange={e => set({ brokerLicenseNumber: e.target.value })} placeholder="FXXXXXXXX" />
                </div>
                <div>
                  <label className="label">جوال الوسيط</label>
                  <input className="input-field" value={f.brokerPhone ?? ''} onChange={e => set({ brokerPhone: e.target.value })} />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Platforms + Price + Fees */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="label mb-2 flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-yellow-500" /> منصات الإعلان المرخّصة *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {Object.entries(platformLabels).map(([p, l]) => (
                    <label key={p} className={`flex items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all ${f.platforms.includes(p as any) ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                      <input type="checkbox" checked={f.platforms.includes(p as any)} onChange={() => togglePlatform(p)} className="w-4 h-4 accent-yellow-500" />
                      <span className="text-sm font-medium">{l}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t">
                <div>
                  <label className="label">السعر الإعلاني ر.س</label>
                  <input type="number" min="0" className="input-field" value={f.advertisedPrice ?? ''} onChange={e => set({ advertisedPrice: e.target.value ? +e.target.value : undefined })} />
                </div>
                <div>
                  <label className="label">وحدة السعر</label>
                  <select className="input-field" value={f.priceUnit ?? 'yearly'} onChange={e => set({ priceUnit: e.target.value as any })}>
                    <option value="yearly">سنوي</option>
                    <option value="monthly">شهري</option>
                    <option value="total">إجمالي</option>
                  </select>
                </div>
                <label className="flex items-center gap-2 cursor-pointer col-span-2">
                  <input type="checkbox" checked={f.negotiable ?? false} onChange={e => set({ negotiable: e.target.checked })} className="w-4 h-4 accent-yellow-500" />
                  <span className="text-sm">السعر قابل للتفاوض</span>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t">
                <div>
                  <label className="label">رسوم الترخيص ر.س</label>
                  <input type="number" min="0" className="input-field" value={f.licenseFee ?? ''} onChange={e => set({ licenseFee: e.target.value ? +e.target.value : undefined })} />
                </div>
                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-2 cursor-pointer p-3 border-2 rounded-xl border-gray-200 hover:border-yellow-400">
                    <input type="checkbox" checked={f.feesPaid ?? false} onChange={e => set({ feesPaid: e.target.checked })} className="w-4 h-4 accent-yellow-500" />
                    <span className="text-sm font-medium">تم سداد الرسوم ✓</span>
                  </label>
                </div>
                {f.feesPaid && (
                  <div className="col-span-2">
                    <label className="label">رقم المرجع / الإيصال</label>
                    <input className="input-field font-mono" value={f.paymentRef ?? ''} onChange={e => set({ paymentRef: e.target.value })} />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t">
                <div>
                  <label className="label">عنوان الإعلان المنشور</label>
                  <input className="input-field" value={f.adTitle ?? ''} onChange={e => set({ adTitle: e.target.value })} />
                </div>
                <div>
                  <label className="label">رابط الإعلان</label>
                  <input type="url" className="input-field" value={f.publishedUrl ?? ''} onChange={e => set({ publishedUrl: e.target.value })} placeholder="https://..." />
                </div>
                <div className="col-span-2">
                  <label className="label">وصف الإعلان</label>
                  <textarea className="input-field" rows={2} value={f.adDescription ?? ''} onChange={e => set({ adDescription: e.target.value })} />
                </div>
                <div>
                  <label className="label">عدد المشاهدات</label>
                  <input type="number" min="0" className="input-field" value={f.views ?? ''} onChange={e => set({ views: e.target.value ? +e.target.value : 0 })} />
                </div>
                <div>
                  <label className="label">عدد الاستفسارات</label>
                  <input type="number" min="0" className="input-field" value={f.inquiries ?? ''} onChange={e => set({ inquiries: e.target.value ? +e.target.value : 0 })} />
                </div>
                <div className="col-span-2">
                  <label className="label">ملاحظات</label>
                  <textarea className="input-field" rows={2} value={f.notes ?? ''} onChange={e => set({ notes: e.target.value })} />
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
            {step > 1 && (
              <button type="button" className="btn-secondary flex-1" onClick={() => setStep(s => s - 1)}>→ السابق</button>
            )}
            {step < 3 ? (
              <button type="button" className="btn-primary flex-1" onClick={() => setStep(s => s + 1)}>التالي ←</button>
            ) : (
              <button type="button" className="btn-primary flex-1 flex items-center justify-center gap-2"
                onClick={() => onSave(f)}>
                <CheckCircle className="w-4 h-4" />
                {editing ? 'حفظ التعديلات' : 'رفع الطلب'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────
export default function AdLicensesPage() {
  const { adLicenses, users, currentUser, addAdLicense, updateAdLicense, deleteAdLicense } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<AdLicense | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [search, setSearch] = useState('');

  const canManage = ['admin', 'employee', 'broker'].includes(currentUser?.role ?? '');

  const myLicenses = currentUser?.role === 'broker'
    ? adLicenses.filter(l => l.brokerUserId === currentUser.id)
    : adLicenses;

  const filtered = useMemo(() => myLicenses
    .filter(l => filterStatus === 'all' || l.status === filterStatus)
    .filter(l => filterType === 'all' || l.adType === filterType)
    .filter(l => {
      if (!search) return true;
      const q = search.toLowerCase();
      return l.licenseNumber.toLowerCase().includes(q) ||
        l.ownerName.toLowerCase().includes(q) ||
        l.titleDeedNumber.toLowerCase().includes(q) ||
        l.propertyCity.toLowerCase().includes(q) ||
        (l.brokerLicenseNumber ?? '').toLowerCase().includes(q);
    }), [myLicenses, filterStatus, filterType, search]);

  const kpis = useMemo(() => {
    const now = Date.now();
    return {
      total: myLicenses.length,
      approved: myLicenses.filter(l => l.status === 'approved').length,
      underReview: myLicenses.filter(l => l.status === 'under_review' || l.status === 'submitted').length,
      rejected: myLicenses.filter(l => l.status === 'rejected').length,
      expiringSoon: myLicenses.filter(l => {
        const d = l.expiryDate ? Math.ceil((new Date(l.expiryDate).getTime() - now) / 86400000) : null;
        return l.status === 'approved' && d !== null && d > 0 && d <= 14;
      }).length,
      totalViews: myLicenses.reduce((s, l) => s + (l.views ?? 0), 0),
      feesPending: myLicenses.filter(l => !l.feesPaid && (l.licenseFee ?? 0) > 0).reduce((s, l) => s + (l.licenseFee ?? 0), 0),
    };
  }, [myLicenses]);

  const handleSave = (data: Omit<AdLicense, 'id' | 'licenseNumber' | 'createdAt'>) => {
    const now = new Date().toISOString();
    if (editing) {
      updateAdLicense(editing.id, { ...data, updatedAt: now });
    } else {
      const seq = String(myLicenses.length + 1).padStart(4, '0');
      addAdLicense({
        ...data,
        id: generateId(),
        licenseNumber: `REGA-AD-${new Date().getFullYear()}-${seq}`,
        createdBy: currentUser?.id,
        createdAt: now,
      });
    }
    setShowForm(false);
    setEditing(null);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="section-title flex items-center gap-2">
            <Shield className="w-6 h-6 text-yellow-500" />
            تراخيص الإعلانات العقارية
          </h1>
          <p className="section-subtitle">وفق لائحة الإعلانات العقارية — هيئة العقار السعودية (REGA)</p>
        </div>
        {canManage && (
          <button className="btn-primary flex items-center gap-2 text-sm" onClick={() => { setEditing(null); setShowForm(true); }}>
            <Plus className="w-4 h-4" /> طلب ترخيص جديد
          </button>
        )}
      </div>

      {/* REGA Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3">
        <Shield className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800 space-y-1">
          <p className="font-bold">اشتراطات هيئة العقار للإعلانات العقارية:</p>
          <ul className="text-xs space-y-0.5 text-blue-700">
            <li>• يجب ذكر <strong>رقم الترخيص</strong> في جميع الإعلانات العقارية المنشورة</li>
            <li>• <strong>رقم الصك/وثيقة الملكية</strong> إلزامي في طلب الترخيص</li>
            <li>• يشترط أن يكون المُعلِن (وسيطاً) حاملاً <strong>رخصة فال</strong> سارية</li>
            <li>• مدة الترخيص 90 يوماً قابلة للتجديد — يمنع النشر بعد انتهاء الترخيص</li>
          </ul>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <KpiCard label="إجمالي التراخيص" value={kpis.total} icon={<FileText className="w-5 h-5 text-blue-600" />} color="bg-blue-100" />
        <KpiCard label="معتمدة" value={kpis.approved} icon={<CheckCircle className="w-5 h-5 text-green-600" />} color="bg-green-100" />
        <KpiCard label="قيد المراجعة" value={kpis.underReview} icon={<Clock className="w-5 h-5 text-yellow-600" />} color="bg-yellow-100" />
        <KpiCard label="مرفوضة" value={kpis.rejected} icon={<XCircle className="w-5 h-5 text-red-600" />} color="bg-red-100" />
        <KpiCard label="تنتهي قريباً" value={kpis.expiringSoon} icon={<AlertTriangle className="w-5 h-5 text-orange-600" />} color="bg-orange-100" />
        <KpiCard label="إجمالي المشاهدات" value={kpis.totalViews.toLocaleString()} icon={<Eye className="w-5 h-5 text-purple-600" />} color="bg-purple-100" />
        <KpiCard label="رسوم معلقة ر.س" value={kpis.feesPending.toLocaleString()} icon={<DollarSign className="w-5 h-5 text-orange-600" />} color="bg-orange-50" />
      </div>

      {/* Expiry alert */}
      {kpis.expiringSoon > 0 && (
        <div className="bg-orange-50 border border-orange-300 rounded-2xl p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-orange-500 shrink-0" />
          <p className="text-sm text-orange-800">
            <strong>{kpis.expiringSoon}</strong> ترخيص إعلان تنتهي صلاحيته خلال 14 يوماً — يجب التجديد قبل الانتهاء لتجنب مخالفة لائحة الإعلانات
          </p>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 flex-wrap items-center">
        <div className="relative flex-1 min-w-52">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input className="input-field pr-9" placeholder="بحث برقم الترخيص، المالك، الصك، المدينة..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input-field w-40" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="all">كل الحالات</option>
          {Object.entries(statusLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <select className="input-field w-36" value={filterType} onChange={e => setFilterType(e.target.value)}>
          <option value="all">كل الأنواع</option>
          {Object.entries(adTypeLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <span className="text-xs text-gray-400">{filtered.length} نتيجة</span>
      </div>

      {/* Status tabs */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'approved', 'under_review', 'submitted', 'rejected', 'expired'].map(s => {
          const cnt = s === 'all' ? myLicenses.length : myLicenses.filter(l => l.status === s).length;
          return (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1.5 ${filterStatus === s ? 'bg-yellow-500 text-white shadow' : 'bg-white border text-gray-600 hover:bg-gray-50'}`}>
              {s === 'all' ? 'الكل' : statusLabels[s]}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${filterStatus === s ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>{cnt}</span>
            </button>
          );
        })}
      </div>

      {/* List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="card text-center py-14 text-gray-400">
            <Shield className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">لا توجد تراخيص</p>
            {canManage && <button className="btn-primary mt-4 text-sm" onClick={() => { setEditing(null); setShowForm(true); }}>+ طلب ترخيص جديد</button>}
          </div>
        ) : filtered.map(l => (
          <LicenseCard
            key={l.id}
            lic={l}
            canManage={canManage}
            onEdit={() => { setEditing(l); setShowForm(true); }}
            onDelete={() => { if (confirm('حذف الترخيص؟')) deleteAdLicense(l.id); }}
            onPrint={() => printLicenseCertificate(l)}
          />
        ))}
      </div>

      {/* Form */}
      {showForm && (
        <LicenseForm
          editing={editing}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditing(null); }}
        />
      )}
    </div>
  );
}

import { Star } from 'lucide-react';
