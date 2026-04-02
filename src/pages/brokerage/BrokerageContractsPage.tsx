import { useState, useMemo } from 'react';
import { useStore, generateId } from '../../data/store';
import {
  FileText, Plus, Edit, Trash2, Printer, CheckCircle,
  Clock, AlertTriangle, Search, User, Building2, Shield, Star, DollarSign,
  Calendar, Hash, MapPin, Award, ChevronDown, ChevronUp, TrendingUp
} from 'lucide-react';
import type { BrokerageContract } from '../../types';
import { ContractAnalyzerWidget, type ExtractedContractData } from '../../components/ContractAnalyzerWidget';

// ─── Label Maps ──────────────────────────────────────────────
const contractTypeLabels: Record<string, string> = {
  rent: 'وساطة إيجار', sale: 'وساطة بيع', management: 'إدارة أملاك'
};
const contractTypeColors: Record<string, string> = {
  rent: 'bg-blue-100 text-blue-700',
  sale: 'bg-green-100 text-green-700',
  management: 'bg-purple-100 text-purple-700'
};
const statusLabels: Record<string, string> = {
  draft: 'مسودة', active: 'ساري', completed: 'منتهي بصفقة',
  cancelled: 'ملغي', expired: 'منتهي المدة'
};
const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600',
  active: 'bg-green-100 text-green-700',
  completed: 'bg-blue-100 text-blue-700',
  cancelled: 'bg-red-100 text-red-700',
  expired: 'bg-orange-100 text-orange-700'
};
const dealStatusLabels: Record<string, string> = {
  pending: 'لا يوجد صفقة', in_progress: 'جاري التفاوض',
  deal_done: 'تمت الصفقة ✓', no_deal: 'لم تتم صفقة'
};
const dealStatusColors: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-500',
  in_progress: 'bg-yellow-100 text-yellow-800',
  deal_done: 'bg-green-100 text-green-700',
  no_deal: 'bg-red-100 text-red-700'
};
const commissionPayerLabels: Record<string, string> = {
  owner: 'على المالك', buyer_tenant: 'على المشتري/المستأجر', shared: 'مشترك'
};
const identityTypeLabels: Record<string, string> = {
  national_id: 'هوية وطنية', iqama: 'إقامة', passport: 'جواز سفر', commercial_reg: 'سجل تجاري'
};

// ─── KPI Card ────────────────────────────────────────────────
function KpiCard({ label, value, icon, color, sub }: {
  label: string; value: string | number; icon: React.ReactNode; color: string; sub?: string
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

// ─── Print Function ───────────────────────────────────────────
function printContract(c: BrokerageContract) {
  const win = window.open('', '_blank');
  if (!win) return;
  win.document.write(`<!DOCTYPE html><html dir="rtl" lang="ar"><head>
    <meta charset="UTF-8">
    <title>عقد وساطة عقارية - ${c.contractNumber}</title>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: 'Segoe UI', Arial, sans-serif; direction: rtl; color: #1a1a2e; background: white; }
      .page { max-width: 850px; margin: 0 auto; padding: 32px; }
      /* HEADER */
      .header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 20px; border-bottom: 4px solid #d97706; margin-bottom: 20px; }
      .logo-block h1 { font-size: 22px; font-weight: 900; color: #d97706; letter-spacing: -0.5px; }
      .logo-block p { font-size: 12px; color: #666; margin-top: 3px; }
      .contract-badge { text-align: center; }
      .contract-badge .badge-title { font-size: 18px; font-weight: 800; color: #1a1a2e; border: 2px solid #d97706; padding: 8px 20px; border-radius: 8px; }
      .contract-badge .contract-num { font-size: 12px; color: #666; margin-top: 6px; }
      .rega-badge { text-align: left; font-size: 11px; color: #666; border: 1px solid #e5e7eb; border-radius: 8px; padding: 8px 12px; }
      .rega-badge strong { display: block; color: #374151; font-size: 12px; margin-bottom: 3px; }
      /* SECTIONS */
      .section { margin-bottom: 20px; }
      .section-title { font-size: 13px; font-weight: 800; color: #d97706; background: #fef3c7; padding: 6px 12px; border-right: 4px solid #d97706; border-radius: 0 6px 6px 0; margin-bottom: 12px; }
      .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
      .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }
      .field { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 8px 12px; }
      .field-label { font-size: 10px; color: #9ca3af; margin-bottom: 2px; }
      .field-value { font-size: 13px; font-weight: 600; color: #1f2937; }
      .field-value.empty { color: #d1d5db; font-style: italic; }
      /* AUTHORITIES */
      .auth-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; }
      .auth-item { text-align: center; padding: 10px 6px; border-radius: 8px; border: 2px solid; font-size: 11px; font-weight: 700; }
      .auth-yes { border-color: #16a34a; background: #f0fdf4; color: #16a34a; }
      .auth-no { border-color: #e5e7eb; background: #f9fafb; color: #9ca3af; }
      /* TERMS */
      .terms { font-size: 11px; color: #374151; line-height: 2; }
      .terms li { margin-bottom: 4px; }
      /* SIGNATURES */
      .sig-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-top: 24px; }
      .sig-box { border: 1px dashed #d1d5db; border-radius: 8px; padding: 16px; text-align: center; }
      .sig-box .sig-title { font-size: 12px; font-weight: 700; color: #374151; margin-bottom: 4px; }
      .sig-box .sig-name { font-size: 13px; color: #1f2937; margin-bottom: 8px; }
      .sig-box .sig-line { border-top: 1px solid #9ca3af; margin: 20px 10px 4px; }
      .sig-box .sig-hint { font-size: 10px; color: #9ca3af; }
      /* DEAL BOX */
      .deal-box { background: #f0fdf4; border: 2px solid #16a34a; border-radius: 10px; padding: 14px 16px; margin-top: 16px; }
      .deal-box .deal-title { font-size: 13px; font-weight: 800; color: #16a34a; margin-bottom: 8px; }
      /* FOOTER */
      .footer { margin-top: 28px; padding-top: 14px; border-top: 1px solid #e5e7eb; display: flex; justify-content: space-between; font-size: 10px; color: #9ca3af; }
      .stamp-area { width: 100px; height: 100px; border: 2px dashed #d97706; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #d97706; font-size: 10px; font-weight: 700; }
      @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
    </style>
  </head><body><div class="page">
    <div class="header">
      <div class="logo-block">
        <h1>رمز الإبداع لإدارة الأملاك</h1>
        <p>مرخّصة من هيئة العقار — رمز الوساطة: ${c.brokerLicenseNumber}</p>
        <p style="margin-top:4px">📞 ${c.brokerPhone}</p>
      </div>
      <div class="contract-badge">
        <div class="badge-title">عقد وساطة عقارية</div>
        <div class="contract-num">${c.contractNumber}</div>
        <div style="font-size:11px;color:#6b7280;margin-top:4px">${contractTypeLabels[c.contractType]} • ${c.exclusivity === 'exclusive' ? 'حصري' : 'غير حصري'}</div>
      </div>
      <div class="rega-badge">
        <strong>🏛️ هيئة العقار السعودية</strong>
        رخصة فال: <strong>${c.brokerLicenseNumber}</strong>
        ${c.regaApprovalNumber ? `<br>رقم الاعتماد: ${c.regaApprovalNumber}` : ''}
        ${c.ejarPlatformRef ? `<br>مرجع إيجار: ${c.ejarPlatformRef}` : ''}
      </div>
    </div>

    <div class="section">
      <div class="section-title">أولاً: بيانات الموكّل (المالك)</div>
      <div class="grid-3">
        <div class="field"><div class="field-label">اسم الموكّل</div><div class="field-value">${c.ownerName}</div></div>
        <div class="field"><div class="field-label">نوع الهوية</div><div class="field-value">${identityTypeLabels[c.ownerIdentityType]}</div></div>
        <div class="field"><div class="field-label">رقم الهوية</div><div class="field-value">${c.ownerIdentity}</div></div>
        <div class="field"><div class="field-label">رقم الجوال</div><div class="field-value">${c.ownerPhone}</div></div>
        ${c.ownerEmail ? `<div class="field"><div class="field-label">البريد الإلكتروني</div><div class="field-value">${c.ownerEmail}</div></div>` : ''}
        ${c.ownerIban ? `<div class="field"><div class="field-label">رقم الآيبان</div><div class="field-value" style="font-size:11px">${c.ownerIban}</div></div>` : ''}
        ${c.ownerAddress ? `<div class="field"><div class="field-label">العنوان</div><div class="field-value">${c.ownerAddress}</div></div>` : ''}
      </div>
    </div>

    <div class="section">
      <div class="section-title">ثانياً: بيانات الوسيط العقاري</div>
      <div class="grid-3">
        <div class="field"><div class="field-label">اسم المنشأة / الوسيط</div><div class="field-value">${c.brokerName}</div></div>
        <div class="field" style="border-color:#d97706"><div class="field-label">🏅 رقم رخصة فال</div><div class="field-value" style="color:#d97706">${c.brokerLicenseNumber}</div></div>
        ${c.brokerCommercialReg ? `<div class="field"><div class="field-label">السجل التجاري</div><div class="field-value">${c.brokerCommercialReg}</div></div>` : ''}
        <div class="field"><div class="field-label">رقم الجوال</div><div class="field-value">${c.brokerPhone}</div></div>
        ${c.brokerEmail ? `<div class="field"><div class="field-label">البريد الإلكتروني</div><div class="field-value">${c.brokerEmail}</div></div>` : ''}
        ${c.brokerNationalAddress ? `<div class="field"><div class="field-label">العنوان الوطني</div><div class="field-value">${c.brokerNationalAddress}</div></div>` : ''}
      </div>
    </div>

    <div class="section">
      <div class="section-title">ثالثاً: بيانات العقار المفوَّض</div>
      <div class="grid-3">
        <div class="field" style="grid-column:span 2"><div class="field-label">وصف العقار</div><div class="field-value">${c.propertyDescription}</div></div>
        ${c.titleDeedNumber ? `<div class="field"><div class="field-label">رقم الصك</div><div class="field-value">${c.titleDeedNumber}</div></div>` : ''}
        <div class="field"><div class="field-label">المدينة</div><div class="field-value">${c.propertyCity}</div></div>
        ${c.propertyDistrict ? `<div class="field"><div class="field-label">الحي</div><div class="field-value">${c.propertyDistrict}</div></div>` : ''}
        <div class="field"><div class="field-label">العنوان</div><div class="field-value">${c.propertyAddress}</div></div>
        ${c.propertyType ? `<div class="field"><div class="field-label">نوع العقار</div><div class="field-value">${c.propertyType}</div></div>` : ''}
        ${c.propertyArea ? `<div class="field"><div class="field-label">المساحة</div><div class="field-value">${c.propertyArea} م²</div></div>` : ''}
      </div>
    </div>

    <div class="section">
      <div class="section-title">رابعاً: شروط التفويض والعمولة</div>
      <div class="grid-3">
        ${c.authorizedPrice ? `<div class="field"><div class="field-label">السعر المفوَّض ر.س</div><div class="field-value" style="color:#16a34a">${c.authorizedPrice.toLocaleString()}</div></div>` : ''}
        ${c.minAcceptablePrice ? `<div class="field"><div class="field-label">أدنى سعر مقبول ر.س</div><div class="field-value">${c.minAcceptablePrice.toLocaleString()}</div></div>` : ''}
        <div class="field" style="border-color:#d97706"><div class="field-label">نسبة العمولة</div><div class="field-value" style="color:#d97706">${c.commissionRate}%</div></div>
        ${c.commissionAmount ? `<div class="field"><div class="field-label">مبلغ العمولة ر.س</div><div class="field-value">${c.commissionAmount.toLocaleString()}</div></div>` : ''}
        <div class="field"><div class="field-label">العمولة على</div><div class="field-value">${commissionPayerLabels[c.commissionPayer]}</div></div>
        ${c.advertisingBudget ? `<div class="field"><div class="field-label">ميزانية الإعلان ر.س</div><div class="field-value">${c.advertisingBudget.toLocaleString()}</div></div>` : ''}
        <div class="field"><div class="field-label">تاريخ البداية</div><div class="field-value">${new Date(c.startDate).toLocaleDateString('ar-SA')}</div></div>
        <div class="field"><div class="field-label">تاريخ الانتهاء</div><div class="field-value">${new Date(c.endDate).toLocaleDateString('ar-SA')}</div></div>
        ${c.renewalDays ? `<div class="field"><div class="field-label">تجديد تلقائي</div><div class="field-value">${c.renewalDays} يوم</div></div>` : ''}
      </div>
    </div>

    <div class="section">
      <div class="section-title">خامساً: الصلاحيات الممنوحة للوسيط</div>
      <div class="auth-grid">
        <div class="auth-item ${c.canAdvertise ? 'auth-yes' : 'auth-no'}">📢<br>الإعلان</div>
        <div class="auth-item ${c.canNegotiate ? 'auth-yes' : 'auth-no'}">🤝<br>التفاوض</div>
        <div class="auth-item ${c.canSignContracts ? 'auth-yes' : 'auth-no'}">✍️<br>توقيع العقود</div>
        <div class="auth-item ${c.canReceivePayments ? 'auth-yes' : 'auth-no'}">💰<br>استلام المدفوعات</div>
        <div class="auth-item ${c.canKeyHandover ? 'auth-yes' : 'auth-no'}">🔑<br>تسليم المفاتيح</div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">سادساً: الشروط والأحكام</div>
      <div class="terms">
        <ol>
          <li>يلتزم الوسيط بمتطلبات نظام الوساطة العقارية الصادر عن هيئة العقار ولوائحه التنفيذية.</li>
          <li>يُعدّ هذا العقد ${c.exclusivity === 'exclusive' ? '<strong>حصرياً</strong> ولا يحق للموكّل التعاقد مع وسيط آخر خلال مدة العقد' : 'غير حصري ويحق للموكّل التعاقد مع أكثر من وسيط'}.</li>
          <li>تستحق العمولة فور إتمام الصفقة وتوثيقها على منصة إيجار أو كاتب العدل حسب نوع العقد.</li>
          <li>يلتزم الوسيط بالإفصاح عن أي تعارض في المصالح فور علمه به.</li>
          <li>لا يحق للوسيط تقاضي أي مبالغ إضافية خارج العمولة المتفق عليها دون موافقة كتابية من الموكّل.</li>
          <li>في حال انتهاء مدة العقد دون إتمام صفقة، ينتهي التفويض تلقائياً ${c.renewalDays ? `ما لم يُجدَّد كتابياً قبل ${c.renewalDays} يوماً من انتهائه` : 'دون أي التزامات إضافية'}.</li>
          <li>يخضع هذا العقد لأنظمة المملكة العربية السعودية ويُفصل في نزاعاته أمام الجهات القضائية المختصة.</li>
          ${c.notes ? `<li>ملاحظات خاصة: ${c.notes}</li>` : ''}
        </ol>
      </div>
    </div>

    ${c.tenantBuyerName ? `<div class="deal-box">
      <div class="deal-title">✅ بيانات المستأجر / المشتري (تُعبأ عند إتمام الصفقة)</div>
      <div class="grid-3">
        <div class="field"><div class="field-label">الاسم</div><div class="field-value">${c.tenantBuyerName}</div></div>
        ${c.tenantBuyerIdentity ? `<div class="field"><div class="field-label">رقم الهوية</div><div class="field-value">${c.tenantBuyerIdentity}</div></div>` : ''}
        ${c.tenantBuyerPhone ? `<div class="field"><div class="field-label">الجوال</div><div class="field-value">${c.tenantBuyerPhone}</div></div>` : ''}
        ${c.dealAmount ? `<div class="field"><div class="field-label">مبلغ الصفقة ر.س</div><div class="field-value" style="color:#16a34a">${c.dealAmount.toLocaleString()}</div></div>` : ''}
        ${c.dealDate ? `<div class="field"><div class="field-label">تاريخ الصفقة</div><div class="field-value">${new Date(c.dealDate).toLocaleDateString('ar-SA')}</div></div>` : ''}
      </div>
    </div>` : ''}

    <div class="sig-grid">
      <div class="sig-box">
        <div class="sig-title">الموكّل (المالك)</div>
        <div class="sig-name">${c.ownerName}</div>
        <div class="sig-line"></div>
        <div class="sig-hint">التوقيع والتاريخ</div>
        <div style="margin-top:8px;font-size:10px;color:#9ca3af">الهوية: ${c.ownerIdentity}</div>
      </div>
      <div class="sig-box" style="display:flex;flex-direction:column;align-items:center;justify-content:space-between">
        <div>
          <div class="sig-title">الوسيط العقاري</div>
          <div class="sig-name">${c.brokerName}</div>
          <div style="font-size:11px;color:#d97706;font-weight:600">رخصة فال: ${c.brokerLicenseNumber}</div>
          <div class="sig-line" style="margin:16px 0 4px"></div>
          <div class="sig-hint">التوقيع والختم</div>
        </div>
        <div class="stamp-area">الختم الرسمي</div>
      </div>
    </div>
    ${c.witnessName ? `<div style="margin-top:16px;padding:10px 14px;background:#f9fafb;border-radius:8px;font-size:12px">
      <strong>الشاهد:</strong> ${c.witnessName} ${c.witnessIdentity ? `— الهوية: ${c.witnessIdentity}` : ''}
    </div>` : ''}

    <div class="footer">
      <div>طُبع في: ${new Date().toLocaleString('ar-SA')}</div>
      <div>رمز الإبداع لإدارة الأملاك • ramzabdae.com</div>
      <div>صفحة 1 من 1</div>
    </div>
  </div></body></html>`);
  win.document.close();
  win.print();
}

// ─── Contract Card ────────────────────────────────────────────
function ContractCard({ c, onEdit, onDelete, onPrint, currentUserRole }: {
  c: BrokerageContract; onEdit: () => void; onDelete: () => void; onPrint: () => void; currentUserRole?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const today = new Date();
  const endDate = new Date(c.endDate);
  const daysLeft = Math.ceil((endDate.getTime() - today.getTime()) / 86400000);
  const isExpiringSoon = daysLeft > 0 && daysLeft <= 14;
  const canEdit = currentUserRole === 'admin' || currentUserRole === 'employee' || currentUserRole === 'broker';

  return (
    <div className={`card transition-all hover:shadow-md
      ${c.status === 'active' && isExpiringSoon ? 'border-l-4 border-orange-400' : ''}
      ${c.exclusivity === 'exclusive' ? 'ring-1 ring-yellow-300' : ''}
    `}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-2xl flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="font-mono text-xs text-gray-400">{c.contractNumber}</span>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${contractTypeColors[c.contractType]}`}>
                {contractTypeLabels[c.contractType]}
              </span>
              {c.exclusivity === 'exclusive' && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 font-semibold flex items-center gap-1">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" /> حصري
                </span>
              )}
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${statusColors[c.status]}`}>
                {statusLabels[c.status]}
              </span>
            </div>
            <p className="font-bold text-gray-800">{c.ownerName}</p>
            <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
              <MapPin className="w-3 h-3" />{c.propertyCity}{c.propertyDistrict ? ` — ${c.propertyDistrict}` : ''} • {c.propertyDescription.slice(0, 50)}{c.propertyDescription.length > 50 ? '...' : ''}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <div className="text-right">
            <p className="text-base font-bold text-yellow-600">{c.commissionRate}%</p>
            <p className="text-xs text-gray-400">العمولة</p>
          </div>
          {c.authorizedPrice != null && c.authorizedPrice > 0 && (
            <p className="text-xs text-green-700 font-semibold">{(c.authorizedPrice / 1000).toFixed(0)}K ر.س</p>
          )}
          {c.dealStatus && (
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${dealStatusColors[c.dealStatus]}`}>
              {dealStatusLabels[c.dealStatus]}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 gap-2 flex-wrap">
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Award className="w-3 h-3 text-yellow-500" /> {c.brokerLicenseNumber}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {new Date(c.startDate).toLocaleDateString('ar-SA')} — {new Date(c.endDate).toLocaleDateString('ar-SA')}
          </span>
          {c.status === 'active' && (
            <span className={`flex items-center gap-1 font-semibold ${daysLeft <= 7 ? 'text-red-600' : isExpiringSoon ? 'text-orange-600' : 'text-green-600'}`}>
              <Clock className="w-3 h-3" />
              {daysLeft > 0 ? `${daysLeft} يوم متبقي` : 'منتهي'}
            </span>
          )}
        </div>
        <div className="flex gap-1.5">
          <button onClick={() => setExpanded(v => !v)} className="text-xs text-gray-500 hover:text-gray-800 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-gray-100">
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          <button onClick={onPrint} className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors" title="طباعة العقد">
            <Printer className="w-3.5 h-3.5" />
          </button>
          {canEdit && (
            <>
              <button onClick={onEdit} className="btn-secondary text-xs py-1 px-2.5">
                <Edit className="w-3 h-3" />
              </button>
              <button onClick={onDelete} className="text-xs py-1 px-2.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50">
                <Trash2 className="w-3 h-3" />
              </button>
            </>
          )}
        </div>
      </div>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-gray-400 mb-1">رقم هوية المالك</p>
              <p className="font-semibold">{identityTypeLabels[c.ownerIdentityType]}: {c.ownerIdentity}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-gray-400 mb-1">جوال المالك</p>
              <p className="font-semibold">{c.ownerPhone}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-gray-400 mb-1">العمولة على</p>
              <p className="font-semibold">{commissionPayerLabels[c.commissionPayer]}</p>
            </div>
            {c.commissionAmount != null && c.commissionAmount > 0 && (
              <div className="bg-yellow-50 rounded-xl p-3">
                <p className="text-gray-400 mb-1">مبلغ العمولة ر.س</p>
                <p className="font-bold text-yellow-700">{c.commissionAmount.toLocaleString()}</p>
              </div>
            )}
            {c.titleDeedNumber && (
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-gray-400 mb-1">رقم الصك</p>
                <p className="font-semibold">{c.titleDeedNumber}</p>
              </div>
            )}
            {c.ejarPlatformRef && (
              <div className="bg-blue-50 rounded-xl p-3">
                <p className="text-gray-400 mb-1">مرجع إيجار</p>
                <p className="font-semibold text-blue-700">{c.ejarPlatformRef}</p>
              </div>
            )}
            {c.regaApprovalNumber && (
              <div className="bg-green-50 rounded-xl p-3">
                <p className="text-gray-400 mb-1">رقم اعتماد REGA</p>
                <p className="font-semibold text-green-700">{c.regaApprovalNumber}</p>
              </div>
            )}
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-500 mb-2">الصلاحيات الممنوحة</p>
            <div className="flex gap-2 flex-wrap">
              {[
                { key: 'canAdvertise', label: 'الإعلان', icon: '📢' },
                { key: 'canNegotiate', label: 'التفاوض', icon: '🤝' },
                { key: 'canSignContracts', label: 'توقيع العقود', icon: '✍️' },
                { key: 'canReceivePayments', label: 'استلام المدفوعات', icon: '💰' },
                { key: 'canKeyHandover', label: 'تسليم المفاتيح', icon: '🔑' },
              ].map(({ key, label, icon }) => (
                <span key={key}
                  className={`text-xs px-3 py-1.5 rounded-full font-medium ${(c as any)[key] ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400 line-through'}`}>
                  {icon} {label}
                </span>
              ))}
            </div>
          </div>

          {c.tenantBuyerName && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-3">
              <p className="text-xs font-bold text-green-700 mb-2">✅ بيانات المستأجر / المشتري</p>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div><p className="text-gray-400">الاسم</p><p className="font-semibold">{c.tenantBuyerName}</p></div>
                {c.tenantBuyerIdentity && <div><p className="text-gray-400">الهوية</p><p className="font-semibold">{c.tenantBuyerIdentity}</p></div>}
                {c.tenantBuyerPhone && <div><p className="text-gray-400">الجوال</p><p className="font-semibold">{c.tenantBuyerPhone}</p></div>}
                {c.dealAmount && <div><p className="text-gray-400">مبلغ الصفقة</p><p className="font-bold text-green-700">{c.dealAmount.toLocaleString()} ر.س</p></div>}
                {c.dealDate && <div><p className="text-gray-400">تاريخ الصفقة</p><p className="font-semibold">{new Date(c.dealDate).toLocaleDateString('ar-SA')}</p></div>}
              </div>
            </div>
          )}

          {c.notes && (
            <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-700">
              <p className="font-semibold text-gray-500 mb-1">ملاحظات</p>
              {c.notes}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────
const emptyForm: Omit<BrokerageContract, 'id' | 'contractNumber' | 'createdAt'> = {
  contractType: 'rent', exclusivity: 'non_exclusive', status: 'active',
  ownerName: '', ownerIdentity: '', ownerIdentityType: 'national_id', ownerPhone: '',
  ownerEmail: '', ownerIban: '', ownerAddress: '',
  brokerName: 'رمز الإبداع لإدارة الأملاك',
  brokerLicenseNumber: '', brokerCommercialReg: '',
  brokerPhone: '', brokerEmail: '', brokerNationalAddress: '',
  propertyDescription: '', propertyAddress: '', propertyCity: '', propertyDistrict: '',
  titleDeedNumber: '', propertyType: '', propertyArea: undefined,
  authorizedPrice: undefined, minAcceptablePrice: undefined,
  commissionRate: 2.5, commissionAmount: undefined,
  commissionPayer: 'owner', advertisingBudget: undefined,
  startDate: new Date().toISOString().slice(0, 10),
  endDate: new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10),
  renewalDays: 30,
  canSignContracts: false, canReceivePayments: false,
  canAdvertise: true, canNegotiate: true, canKeyHandover: false,
  ejarPlatformRef: '', regaApprovalNumber: '',
  dealStatus: 'pending', dealAmount: undefined, dealDate: '',
  tenantBuyerName: '', tenantBuyerIdentity: '', tenantBuyerPhone: '',
  witnessName: '', witnessIdentity: '', notes: '',
};

export default function BrokerageContractsPage() {
  const { brokerageContracts, users, currentUser,
    addBrokerageContract, updateBrokerageContract, deleteBrokerageContract } = useStore();

  const [showForm, setShowForm] = useState(false);
  const [formStep, setFormStep] = useState(1);
  const [editing, setEditing] = useState<BrokerageContract | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(emptyForm);

  const handleExtracted = (data: ExtractedContractData) => {
    setForm(prev => ({
      ...prev,
      ...(data.sellerName && { ownerName: data.sellerName }),
      ...(data.buyerName && { clientName: data.buyerName }),
      ...(data.landlordName && { ownerName: data.landlordName }),
      ...(data.tenantName && { clientName: data.tenantName }),
      ...(data.tenantPhone && { clientPhone: data.tenantPhone }),
      ...(data.landlordPhone && { ownerPhone: data.landlordPhone }),
      ...(data.brokerName && { brokerName: data.brokerName }),
      ...(data.brokerLicense && { faalLicenseNumber: data.brokerLicense }),
      ...(data.salePrice && { propertyValue: data.salePrice }),
      ...(data.annualRent && { propertyValue: data.annualRent }),
      ...(data.brokerageCommission && { commissionAmount: data.brokerageCommission }),
      ...(data.commissionRate && { commissionRate: parseFloat(data.commissionRate) || prev.commissionRate }),
      ...(data.contractStartDate && { startDate: data.contractStartDate }),
      ...(data.contractEndDate && { endDate: data.contractEndDate }),
      ...(data.city && { propertyCity: data.city }),
      ...(data.address && { propertyAddress: data.address }),
      ...(data.titleDeedNumber && { titleDeedNumber: data.titleDeedNumber }),
      ...(data.brokerageAgreementNumber && { contractNumber: data.brokerageAgreementNumber }),
    }));
  };

  const brokers = users.filter(u => u.role === 'broker');

  const myContracts = currentUser?.role === 'broker'
    ? brokerageContracts.filter(c => c.brokerUserId === currentUser.id)
    : brokerageContracts;

  const filtered = useMemo(() => myContracts
    .filter(c => filterStatus === 'all' || c.status === filterStatus)
    .filter(c => filterType === 'all' || c.contractType === filterType)
    .filter(c => {
      if (!search) return true;
      const q = search.toLowerCase();
      return c.ownerName.toLowerCase().includes(q) ||
        c.contractNumber.toLowerCase().includes(q) ||
        c.propertyCity.toLowerCase().includes(q) ||
        c.brokerLicenseNumber.toLowerCase().includes(q);
    }), [myContracts, filterStatus, filterType, search]);

  const kpis = useMemo(() => ({
    total: myContracts.length,
    active: myContracts.filter(c => c.status === 'active').length,
    exclusive: myContracts.filter(c => c.exclusivity === 'exclusive' && c.status === 'active').length,
    deals: myContracts.filter(c => c.dealStatus === 'deal_done').length,
    expiringSoon: myContracts.filter(c => {
      const d = Math.ceil((new Date(c.endDate).getTime() - Date.now()) / 86400000);
      return c.status === 'active' && d > 0 && d <= 14;
    }).length,
    totalCommission: myContracts
      .filter(c => c.dealStatus === 'deal_done')
      .reduce((s, c) => s + (c.commissionAmount ?? (c.dealAmount ?? 0) * c.commissionRate / 100), 0),
  }), [myContracts]);

  const openEdit = (c: BrokerageContract) => {
    setEditing(c);
    setForm({ ...c });
    setFormStep(1);
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date().toISOString();
    if (editing) {
      updateBrokerageContract(editing.id, { ...form, updatedAt: now });
    } else {
      addBrokerageContract({
        ...form,
        id: generateId(),
        contractNumber: `WS-${new Date().getFullYear()}-${String(myContracts.length + 1).padStart(4, '0')}`,
        createdBy: currentUser?.id,
        createdAt: now,
      });
    }
    setShowForm(false);
    setEditing(null);
    setForm(emptyForm);
    setFormStep(1);
  };

  const fillFromBroker = (brokerId: string) => {
    const b = users.find(u => u.id === brokerId);
    if (b) setForm(f => ({ ...f, brokerName: b.name, brokerPhone: b.phone ?? '', brokerUserId: brokerId }));
  };

  const stepTitles = ['بيانات المالك', 'بيانات الوسيط والعقار', 'الشروط والصلاحيات', 'التوثيق والصفقة'];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="section-title flex items-center gap-2">
            <Award className="w-6 h-6 text-yellow-500" />
            عقود الوساطة العقارية
          </h1>
          <p className="section-subtitle">وفق اشتراطات هيئة العقار (REGA) ونظام الوساطة العقارية</p>
        </div>
        <button className="btn-primary flex items-center gap-2 text-sm" onClick={() => { setEditing(null); setForm(emptyForm); setFormStep(1); setShowForm(true); }}>
          <Plus className="w-4 h-4" /> عقد وساطة جديد
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <KpiCard label="إجمالي العقود" value={kpis.total} icon={<FileText className="w-5 h-5 text-blue-600" />} color="bg-blue-100" />
        <KpiCard label="سارية" value={kpis.active} icon={<CheckCircle className="w-5 h-5 text-green-600" />} color="bg-green-100" />
        <KpiCard label="حصرية نشطة" value={kpis.exclusive} icon={<Star className="w-5 h-5 text-yellow-600" />} color="bg-yellow-100" />
        <KpiCard label="صفقات منجزة" value={kpis.deals} icon={<TrendingUp className="w-5 h-5 text-purple-600" />} color="bg-purple-100" />
        <KpiCard label="تنتهي قريباً" value={kpis.expiringSoon} icon={<AlertTriangle className="w-5 h-5 text-orange-600" />} color="bg-orange-100" />
        <KpiCard label="إجمالي العمولات ر.س" value={kpis.totalCommission.toLocaleString()} icon={<DollarSign className="w-5 h-5 text-green-600" />} color="bg-green-50" />
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input className="input-field pr-9" placeholder="بحث بالاسم، رقم العقد، المدينة، رقم الرخصة..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input-field w-36" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="all">كل الحالات</option>
          {Object.entries(statusLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <select className="input-field w-40" value={filterType} onChange={e => setFilterType(e.target.value)}>
          <option value="all">كل الأنواع</option>
          {Object.entries(contractTypeLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>

      {/* Expiry Alerts */}
      {kpis.expiringSoon > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-orange-500 shrink-0" />
          <p className="text-sm text-orange-800">
            <strong>{kpis.expiringSoon}</strong> عقد وساطة تنتهي خلال 14 يوماً — تأكد من تجديدها أو إغلاقها
          </p>
        </div>
      )}

      {/* Contracts List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="card text-center py-14 text-gray-400">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">لا توجد عقود تطابق البحث</p>
          </div>
        ) : filtered.map(c => (
          <ContractCard
            key={c.id}
            c={c}
            currentUserRole={currentUser?.role}
            onEdit={() => openEdit(c)}
            onDelete={() => { if (confirm('حذف عقد الوساطة؟')) deleteBrokerageContract(c.id); }}
            onPrint={() => printContract(c)}
          />
        ))}
      </div>

      {/* Multi-Step Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl my-auto">
            {/* Form Header */}
            <div className="bg-gradient-to-l from-yellow-500 to-amber-600 rounded-t-2xl p-5 text-white">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  {editing ? 'تعديل عقد الوساطة' : 'عقد وساطة عقارية جديد'}
                </h2>
                <button onClick={() => { setShowForm(false); setEditing(null); setFormStep(1); }} className="text-white/70 hover:text-white text-2xl leading-none">×</button>
              </div>
              {/* Step indicator */}
              <div className="flex gap-2">
                {stepTitles.map((title, i) => (
                  <button key={i} onClick={() => setFormStep(i + 1)}
                    className={`flex-1 text-center py-1.5 rounded-lg text-xs font-medium transition-all ${formStep === i + 1 ? 'bg-white text-yellow-700' : formStep > i + 1 ? 'bg-white/40 text-white' : 'bg-white/20 text-white/70'}`}>
                    <span className="block text-lg leading-none">{i + 1}</span>
                    <span className="hidden sm:block">{title}</span>
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              {/* Analyzer Widget */}
              <div className="mb-5">
                <ContractAnalyzerWidget onExtracted={handleExtracted} mode="brokerage" />
              </div>
              {/* Step 1: Owner Data */}
              {formStep === 1 && (
                <div className="space-y-4">
                  <h3 className="font-bold text-gray-700 flex items-center gap-2"><User className="w-4 h-4 text-yellow-500" /> بيانات الموكّل (المالك)</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <label className="label">اسم الموكّل الكامل *</label>
                      <input className="input-field" value={form.ownerName} onChange={e => setForm({ ...form, ownerName: e.target.value })} required />
                    </div>
                    <div>
                      <label className="label">نوع الهوية</label>
                      <select className="input-field" value={form.ownerIdentityType} onChange={e => setForm({ ...form, ownerIdentityType: e.target.value as any })}>
                        {Object.entries(identityTypeLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="label">رقم الهوية *</label>
                      <input className="input-field" value={form.ownerIdentity} onChange={e => setForm({ ...form, ownerIdentity: e.target.value })} required placeholder="10 أرقام" />
                    </div>
                    <div>
                      <label className="label">رقم الجوال *</label>
                      <input className="input-field" value={form.ownerPhone} onChange={e => setForm({ ...form, ownerPhone: e.target.value })} required placeholder="05XXXXXXXX" />
                    </div>
                    <div>
                      <label className="label">البريد الإلكتروني</label>
                      <input type="email" className="input-field" value={form.ownerEmail ?? ''} onChange={e => setForm({ ...form, ownerEmail: e.target.value })} />
                    </div>
                    <div className="col-span-2">
                      <label className="label">رقم الآيبان (IBAN)</label>
                      <input className="input-field font-mono" value={form.ownerIban ?? ''} onChange={e => setForm({ ...form, ownerIban: e.target.value })} placeholder="SA0000000000000000000000" />
                    </div>
                    <div className="col-span-2">
                      <label className="label">عنوان الموكّل</label>
                      <input className="input-field" value={form.ownerAddress ?? ''} onChange={e => setForm({ ...form, ownerAddress: e.target.value })} />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Broker + Property */}
              {formStep === 2 && (
                <div className="space-y-4">
                  <h3 className="font-bold text-gray-700 flex items-center gap-2"><Award className="w-4 h-4 text-yellow-500" /> بيانات الوسيط والعقار</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {brokers.length > 0 && (
                      <div className="col-span-2">
                        <label className="label">اختر وسيطاً من قائمة الموظفين</label>
                        <select className="input-field" onChange={e => fillFromBroker(e.target.value)}>
                          <option value="">-- اختياري --</option>
                          {brokers.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>
                      </div>
                    )}
                    <div className="col-span-2">
                      <label className="label">اسم المنشأة / الوسيط *</label>
                      <input className="input-field" value={form.brokerName} onChange={e => setForm({ ...form, brokerName: e.target.value })} required />
                    </div>
                    <div>
                      <label className="label flex items-center gap-1"><Star className="w-3 h-3 text-yellow-500" /> رقم رخصة فال *</label>
                      <input className="input-field" value={form.brokerLicenseNumber} onChange={e => setForm({ ...form, brokerLicenseNumber: e.target.value })} required placeholder="FXXXXXXXX" />
                    </div>
                    <div>
                      <label className="label">السجل التجاري</label>
                      <input className="input-field" value={form.brokerCommercialReg ?? ''} onChange={e => setForm({ ...form, brokerCommercialReg: e.target.value })} />
                    </div>
                    <div>
                      <label className="label">جوال الوسيط *</label>
                      <input className="input-field" value={form.brokerPhone} onChange={e => setForm({ ...form, brokerPhone: e.target.value })} required />
                    </div>
                    <div>
                      <label className="label">بريد الوسيط</label>
                      <input type="email" className="input-field" value={form.brokerEmail ?? ''} onChange={e => setForm({ ...form, brokerEmail: e.target.value })} />
                    </div>
                    <div className="col-span-2 border-t pt-3 mt-1">
                      <p className="text-xs font-semibold text-gray-500 mb-3 flex items-center gap-1"><Building2 className="w-3.5 h-3.5" /> بيانات العقار</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2">
                          <label className="label">وصف العقار *</label>
                          <input className="input-field" value={form.propertyDescription} onChange={e => setForm({ ...form, propertyDescription: e.target.value })} required placeholder="مثال: شقة 3 غرف بالدور الثاني" />
                        </div>
                        <div>
                          <label className="label">المدينة *</label>
                          <input className="input-field" value={form.propertyCity} onChange={e => setForm({ ...form, propertyCity: e.target.value })} required />
                        </div>
                        <div>
                          <label className="label">الحي</label>
                          <input className="input-field" value={form.propertyDistrict ?? ''} onChange={e => setForm({ ...form, propertyDistrict: e.target.value })} />
                        </div>
                        <div className="col-span-2">
                          <label className="label">العنوان الكامل *</label>
                          <input className="input-field" value={form.propertyAddress} onChange={e => setForm({ ...form, propertyAddress: e.target.value })} required />
                        </div>
                        <div>
                          <label className="label">رقم الصك</label>
                          <input className="input-field" value={form.titleDeedNumber ?? ''} onChange={e => setForm({ ...form, titleDeedNumber: e.target.value })} />
                        </div>
                        <div>
                          <label className="label">نوع العقار</label>
                          <input className="input-field" value={form.propertyType ?? ''} onChange={e => setForm({ ...form, propertyType: e.target.value })} placeholder="شقة، فيلا، محل تجاري..." />
                        </div>
                        <div>
                          <label className="label">المساحة م²</label>
                          <input type="number" min="0" className="input-field" value={form.propertyArea ?? ''} onChange={e => setForm({ ...form, propertyArea: e.target.value ? +e.target.value : undefined })} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Terms + Permissions */}
              {formStep === 3 && (
                <div className="space-y-4">
                  <h3 className="font-bold text-gray-700 flex items-center gap-2"><Shield className="w-4 h-4 text-yellow-500" /> شروط التفويض والصلاحيات</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="label">نوع العقد *</label>
                      <select className="input-field" value={form.contractType} onChange={e => setForm({ ...form, contractType: e.target.value as any })}>
                        {Object.entries(contractTypeLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="label">نوع التفويض</label>
                      <select className="input-field" value={form.exclusivity} onChange={e => setForm({ ...form, exclusivity: e.target.value as any })}>
                        <option value="exclusive">حصري</option>
                        <option value="non_exclusive">غير حصري</option>
                      </select>
                    </div>
                    <div>
                      <label className="label">السعر المفوَّض ر.س</label>
                      <input type="number" min="0" className="input-field" value={form.authorizedPrice ?? ''} onChange={e => setForm({ ...form, authorizedPrice: e.target.value ? +e.target.value : undefined })} />
                    </div>
                    <div>
                      <label className="label">أدنى سعر مقبول ر.س</label>
                      <input type="number" min="0" className="input-field" value={form.minAcceptablePrice ?? ''} onChange={e => setForm({ ...form, minAcceptablePrice: e.target.value ? +e.target.value : undefined })} />
                    </div>
                    <div>
                      <label className="label">نسبة العمولة % *</label>
                      <input type="number" min="0" max="10" step="0.5" className="input-field" value={form.commissionRate} onChange={e => setForm({ ...form, commissionRate: +e.target.value })} required />
                    </div>
                    <div>
                      <label className="label">مبلغ العمولة ر.س (اختياري)</label>
                      <input type="number" min="0" className="input-field" value={form.commissionAmount ?? ''} onChange={e => setForm({ ...form, commissionAmount: e.target.value ? +e.target.value : undefined })} />
                    </div>
                    <div>
                      <label className="label">العمولة على</label>
                      <select className="input-field" value={form.commissionPayer} onChange={e => setForm({ ...form, commissionPayer: e.target.value as any })}>
                        {Object.entries(commissionPayerLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="label">ميزانية الإعلان ر.س</label>
                      <input type="number" min="0" className="input-field" value={form.advertisingBudget ?? ''} onChange={e => setForm({ ...form, advertisingBudget: e.target.value ? +e.target.value : undefined })} />
                    </div>
                    <div>
                      <label className="label">تاريخ البداية *</label>
                      <input type="date" className="input-field" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} required />
                    </div>
                    <div>
                      <label className="label">تاريخ الانتهاء *</label>
                      <input type="date" className="input-field" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} required />
                    </div>
                    <div>
                      <label className="label">أيام التجديد التلقائي</label>
                      <input type="number" min="0" className="input-field" value={form.renewalDays ?? ''} onChange={e => setForm({ ...form, renewalDays: e.target.value ? +e.target.value : undefined })} placeholder="30" />
                    </div>
                  </div>

                  <div>
                    <label className="label mb-2">الصلاحيات الممنوحة للوسيط</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {[
                        { key: 'canAdvertise', label: '📢 صلاحية الإعلان' },
                        { key: 'canNegotiate', label: '🤝 صلاحية التفاوض' },
                        { key: 'canSignContracts', label: '✍️ توقيع العقود' },
                        { key: 'canReceivePayments', label: '💰 استلام المدفوعات' },
                        { key: 'canKeyHandover', label: '🔑 تسليم المفاتيح' },
                      ].map(({ key, label }) => (
                        <label key={key} className={`flex items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all ${(form as any)[key] ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                          <input type="checkbox" checked={(form as any)[key]} onChange={e => setForm({ ...form, [key]: e.target.checked })} className="w-4 h-4 accent-yellow-500" />
                          <span className="text-sm font-medium">{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Documentation + Deal */}
              {formStep === 4 && (
                <div className="space-y-4">
                  <h3 className="font-bold text-gray-700 flex items-center gap-2"><Hash className="w-4 h-4 text-yellow-500" /> التوثيق والصفقة</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="label">حالة العقد</label>
                      <select className="input-field" value={form.status} onChange={e => setForm({ ...form, status: e.target.value as any })}>
                        {Object.entries(statusLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="label">مرجع منصة إيجار</label>
                      <input className="input-field" value={form.ejarPlatformRef ?? ''} onChange={e => setForm({ ...form, ejarPlatformRef: e.target.value })} placeholder="رقم الطلب في إيجار" />
                    </div>
                    <div>
                      <label className="label">رقم اعتماد هيئة العقار</label>
                      <input className="input-field" value={form.regaApprovalNumber ?? ''} onChange={e => setForm({ ...form, regaApprovalNumber: e.target.value })} />
                    </div>
                    <div>
                      <label className="label">اسم الشاهد</label>
                      <input className="input-field" value={form.witnessName ?? ''} onChange={e => setForm({ ...form, witnessName: e.target.value })} />
                    </div>
                    <div>
                      <label className="label">هوية الشاهد</label>
                      <input className="input-field" value={form.witnessIdentity ?? ''} onChange={e => setForm({ ...form, witnessIdentity: e.target.value })} />
                    </div>

                    <div className="col-span-2 border-t pt-3">
                      <label className="label mb-2 flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5 text-green-500" /> حالة الصفقة (بعد الاتفاق)</label>
                      <select className="input-field" value={form.dealStatus ?? 'pending'} onChange={e => setForm({ ...form, dealStatus: e.target.value as any })}>
                        {Object.entries(dealStatusLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                      </select>
                    </div>

                    {(form.dealStatus === 'deal_done' || form.dealStatus === 'in_progress') && (
                      <>
                        <div className="col-span-2">
                          <label className="label">اسم المستأجر / المشتري</label>
                          <input className="input-field" value={form.tenantBuyerName ?? ''} onChange={e => setForm({ ...form, tenantBuyerName: e.target.value })} />
                        </div>
                        <div>
                          <label className="label">هوية المستأجر / المشتري</label>
                          <input className="input-field" value={form.tenantBuyerIdentity ?? ''} onChange={e => setForm({ ...form, tenantBuyerIdentity: e.target.value })} />
                        </div>
                        <div>
                          <label className="label">جوال المستأجر / المشتري</label>
                          <input className="input-field" value={form.tenantBuyerPhone ?? ''} onChange={e => setForm({ ...form, tenantBuyerPhone: e.target.value })} />
                        </div>
                        <div>
                          <label className="label">مبلغ الصفقة ر.س</label>
                          <input type="number" min="0" className="input-field" value={form.dealAmount ?? ''} onChange={e => setForm({ ...form, dealAmount: e.target.value ? +e.target.value : undefined })} />
                        </div>
                        <div>
                          <label className="label">تاريخ الصفقة</label>
                          <input type="date" className="input-field" value={form.dealDate ?? ''} onChange={e => setForm({ ...form, dealDate: e.target.value })} />
                        </div>
                      </>
                    )}

                    <div className="col-span-2">
                      <label className="label">ملاحظات</label>
                      <textarea className="input-field" rows={2} value={form.notes ?? ''} onChange={e => setForm({ ...form, notes: e.target.value })} />
                    </div>
                  </div>
                </div>
              )}

              {/* Form Navigation */}
              <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
                {formStep > 1 && (
                  <button type="button" className="btn-secondary flex-1" onClick={() => setFormStep(s => s - 1)}>→ السابق</button>
                )}
                {formStep < 4 ? (
                  <button type="button" className="btn-primary flex-1" onClick={() => setFormStep(s => s + 1)}>التالي ←</button>
                ) : (
                  <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    {editing ? 'حفظ التعديلات' : 'حفظ العقد'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
