import { useState, useRef } from 'react';
import { useStore } from '../../data/store';
import { Printer, ChevronDown, Building2, MapPin, FileText, Layers, Users, Briefcase, StickyNote, BarChart3 } from 'lucide-react';
import type { Property } from '../../types';

const propTypeLabels: Record<string, string> = {
  residential: 'سكني', commercial: 'تجاري', mixed: 'سكني تجاري',
  land: 'أرض', villa: 'فيلا', building: 'عمارة', apartment: 'شقة',
};

const v = (val: string | number | undefined | null, fallback = '—') =>
  val !== undefined && val !== null && val !== '' ? String(val) : fallback;

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6 print:mb-4">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b-2 border-yellow-500">
        <span className="text-yellow-600">{icon}</span>
        <h3 className="font-bold text-gray-800 text-base">{title}</h3>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3 text-sm">
        {children}
      </div>
    </div>
  );
}

function Field({ label, value, full }: { label: string; value?: string | number | null; full?: boolean }) {
  return (
    <div className={full ? 'col-span-full' : ''}>
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <p className="font-medium text-gray-800 border-b border-gray-200 pb-0.5 min-h-[20px]">{v(value)}</p>
    </div>
  );
}

export default function PropertyReportPage() {
  const { properties } = useStore();
  const [selectedId, setSelectedId] = useState<string>(properties[0]?.id ?? '');
  const printRef = useRef<HTMLDivElement>(null);

  const prop: Property | undefined = properties.find(p => p.id === selectedId);

  const handlePrint = () => window.print();

  const today = new Date().toLocaleDateString('ar-SA', { year: 'numeric', month: '2-digit', day: '2-digit' });

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between flex-wrap gap-3 print:hidden">
        <div>
          <h1 className="section-title">تقرير بيانات العقار</h1>
          <p className="section-subtitle">تقرير احترافي شامل بجميع بيانات العقار</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <select
              className="input-field pl-8 pr-3 appearance-none min-w-[220px]"
              value={selectedId}
              onChange={e => setSelectedId(e.target.value)}
            >
              {properties.map(p => (
                <option key={p.id} value={p.id}>{p.propertyName}</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
          <button onClick={handlePrint} className="btn-primary flex items-center gap-2">
            <Printer className="w-4 h-4" /> طباعة التقرير
          </button>
        </div>
      </div>

      {/* REPORT */}
      <div ref={printRef} className="bg-white rounded-2xl shadow-lg overflow-hidden print:shadow-none print:rounded-none">

        {/* Header */}
        <div className="bg-gradient-to-l from-yellow-500 to-yellow-600 p-6 print:p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src="/logo.png" alt="رمز الإبداع" className="w-16 h-16 object-contain bg-white rounded-xl p-1" />
              <div>
                <h2 className="text-white font-bold text-xl">شركة رمز الإبداع لإدارة الأملاك</h2>
                <p className="text-yellow-100 text-sm">تقرير بيانات العقار الشامل</p>
              </div>
            </div>
            <div className="text-left text-white text-sm">
              <p>تاريخ التقرير</p>
              <p className="font-bold text-base">{prop?.reportDate ?? today}</p>
            </div>
          </div>
        </div>

        {/* Property Title Bar */}
        <div className="bg-gray-800 px-6 py-3 flex items-center gap-3">
          <Building2 className="w-5 h-5 text-yellow-400" />
          <h2 className="text-white font-bold text-lg">{prop?.propertyName ?? '—'}</h2>
          <span className="bg-yellow-500 text-white text-xs px-3 py-1 rounded-full font-medium">
            {propTypeLabels[prop?.propertyType ?? ''] ?? prop?.propertyType ?? '—'}
          </span>
          <span className={`text-xs px-3 py-1 rounded-full font-medium ml-auto ${prop?.isActive ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}`}>
            {prop?.isActive ? 'نشط' : 'غير نشط'}
          </span>
        </div>

        {/* Body */}
        <div className="p-6 print:p-4 space-y-2">

          {/* 1. البيانات الأساسية */}
          <Section icon={<FileText className="w-4 h-4" />} title="البيانات الأساسية">
            <Field label="اسم العقار" value={prop?.propertyName} />
            <Field label="تاريخ التقرير" value={prop?.reportDate ?? today} />
            <Field label="نوع العقار" value={propTypeLabels[prop?.propertyType ?? ''] ?? prop?.propertyType} />
            <Field label="الحالة" value={prop?.isActive ? 'نشط' : 'غير نشط'} />
            <Field label="رابط الصورة" value={prop?.imageUrl} full />
          </Section>

          {/* 2. بيانات الموقع */}
          <Section icon={<MapPin className="w-4 h-4" />} title="بيانات الموقع">
            <Field label="المنطقة" value={prop?.region} />
            <Field label="المدينة" value={prop?.city} />
            <Field label="الحي" value={prop?.district} />
            <Field label="العنوان" value={prop?.address} full />
            <Field label="العنوان الوطني" value={prop?.nationalAddress} full />
          </Section>

          {/* 3. بيانات الصك */}
          <Section icon={<FileText className="w-4 h-4" />} title="بيانات الصك والسجل العيني">
            <Field label="رقم وثيقة الملكية" value={prop?.titleDeedNumber} />
            <Field label="نوع وثيقة الملكية" value={prop?.titleDeedType} />
            <Field label="تاريخ الإصدار" value={prop?.titleDeedIssueDate} />
            <Field label="جهة الإصدار" value={prop?.titleDeedIssuedBy} />
            <Field label="رقم المستند" value={prop?.titleDeedDocumentNumber} />
            <Field label="رقم القطعة" value={prop?.plotNumber} />
            <Field label="رقم المخطط" value={prop?.planNumber} />
            <Field label="مساحة الصك م²" value={prop?.deedArea} />
            <div className="col-span-full border-t border-dashed border-gray-200 pt-3 mt-1">
              <p className="text-xs font-semibold text-gray-500 mb-2">التسجيل العيني</p>
              <div className="grid grid-cols-3 gap-x-6 gap-y-3">
                <Field label="رقم التسجيل العيني" value={prop?.realEstateRegNumber} />
                <Field label="تاريخ التسجيل" value={prop?.realEstateRegDate} />
                <Field label="حالة التسجيل العيني" value={prop?.realEstateRegStatus} />
              </div>
            </div>
          </Section>

          {/* 4. بيانات المبنى */}
          <Section icon={<Layers className="w-4 h-4" />} title="بيانات المبنى والمرافق">
            <Field label="نوع المبنى" value={prop?.buildingType} />
            <Field label="نوع استخدام العقار" value={prop?.propertyUsage} />
            <Field label="الغرض من الاستخدام" value={prop?.usagePurpose} />
            <Field label="مرفق العقار" value={prop?.propertyFacility} />
            <Field label="الطوابق" value={prop?.floors} />
            <Field label="الوحدات" value={prop?.totalUnits} />
            <Field label="المصاعد" value={prop?.elevators} />
            <Field label="المواقف" value={prop?.parkingSpots} />
            <Field label="المرافق" value={prop?.utilities?.join('، ')} full />
          </Section>

          {/* 5. إجماليات */}
          <div className="mb-6 print:mb-4">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b-2 border-yellow-500">
              <BarChart3 className="w-4 h-4 text-yellow-600" />
              <h3 className="font-bold text-gray-800 text-base">إجماليات الوحدات والعقود والرسوم</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {/* Units */}
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs font-semibold text-gray-500 mb-3 border-b border-gray-200 pb-1">الوحدات</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><p className="text-xs text-gray-400">إجمالي الوحدات</p><p className="font-bold text-gray-800">{v(prop?.totalUnits)}</p></div>
                  <div><p className="text-xs text-gray-400">المحجوزة</p><p className="font-bold text-yellow-600">{v(prop?.reservedUnits)}</p></div>
                  <div><p className="text-xs text-gray-400">المؤجرة</p><p className="font-bold text-blue-600">{v(prop?.rentedUnits)}</p></div>
                  <div><p className="text-xs text-gray-400">المتاحة</p><p className="font-bold text-green-600">{v(prop?.availableUnits)}</p></div>
                </div>
              </div>
              {/* Contracts */}
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs font-semibold text-gray-500 mb-3 border-b border-gray-200 pb-1">العقود والرسوم</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><p className="text-xs text-gray-400">إجمالي العقود</p><p className="font-bold text-gray-800">{v(prop?.totalContracts)}</p></div>
                  <div><p className="text-xs text-gray-400">إجمالي مبلغ العقود ر.س</p><p className="font-bold text-yellow-600">{prop?.totalContractValue ? prop.totalContractValue.toLocaleString() : '—'}</p></div>
                  <div><p className="text-xs text-gray-400">إجمالي رسوم التوثيق ر.س</p><p className="font-bold text-gray-800">{prop?.totalDocumentationFees ? prop.totalDocumentationFees.toLocaleString() : '—'}</p></div>
                  <div><p className="text-xs text-gray-400">إجمالي رسوم السعي ر.س</p><p className="font-bold text-gray-800">{prop?.totalCommission ? prop.totalCommission.toLocaleString() : '—'}</p></div>
                </div>
              </div>
            </div>
          </div>

          {/* 6. بيانات المالك */}
          <Section icon={<Users className="w-4 h-4" />} title="بيانات المالك">
            <Field label="اسم المالك" value={prop?.ownerName} />
            <Field label="هوية المالك" value={prop?.ownerIdentity} />
            <Field label="الجنسية" value={prop?.ownerNationality} />
            <Field label="نسبة الملكية" value={prop?.ownershipPercentage} />
            <Field label="مساحة الملكية م²" value={prop?.ownershipArea} />
            <Field label="نوع المالك" value={prop?.ownerType} />
          </Section>

          {/* 7. اتحاد الملاك */}
          <div className="mb-6 print:mb-4">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b-2 border-yellow-500">
              <Users className="w-4 h-4 text-yellow-600" />
              <h3 className="font-bold text-gray-800 text-base">اتحاد الملاك</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3 text-sm">
              <Field label="اسم الجمعية" value={prop?.associationName} />
              <Field label="رقم التسجيل" value={prop?.associationRegNumber} />
              <Field label="الرقم الموحد" value={prop?.associationUnifiedNumber} />
              <Field label="حالة الجمعية" value={prop?.associationStatus} />
              <Field label="تاريخ السريان" value={prop?.associationStartDate} />
              <Field label="تاريخ الانتهاء" value={prop?.associationEndDate} />
              <Field label="اسم رئيس الجمعية" value={prop?.associationPresidentName} />
              <Field label="جوال رئيس الجمعية" value={prop?.associationPresidentMobile} />
              <Field label="اسم مدير العقار" value={prop?.propertyManagerName} />
              <Field label="جوال مدير العقار" value={prop?.propertyManagerMobile} />
            </div>
            <div className="mt-4 pt-3 border-t border-dashed border-gray-200">
              <p className="text-xs font-semibold text-gray-500 mb-2">نتائج التصويت والرسوم</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-3 text-sm">
                <Field label="إجمالي الرسوم ر.س" value={prop?.associationTotalFees} />
                <Field label="عدد المصوتين" value={prop?.associationVotersCount} />
                <Field label="نسبة القبول" value={prop?.associationAcceptanceRate} />
                <Field label="غير المصوتين" value={prop?.associationNonVoters} />
              </div>
            </div>
          </div>

          {/* 8. الوسيط */}
          <Section icon={<Briefcase className="w-4 h-4" />} title="الوسيط العقاري">
            <Field label="اسم المنشأة" value={prop?.brokerEstablishmentName} />
            <Field label="السجل التجاري" value={prop?.brokerCommercialReg} />
          </Section>

          {/* 9. الملاحظات */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b-2 border-yellow-500">
              <StickyNote className="w-4 h-4 text-yellow-600" />
              <h3 className="font-bold text-gray-800 text-base">الملاحظات</h3>
            </div>
            {prop?.reportNotes && prop.reportNotes.length > 0 ? (
              <ul className="space-y-2">
                {prop.reportNotes.map((note, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="w-5 h-5 bg-yellow-100 text-yellow-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</span>
                    {note}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-400 italic">لا توجد ملاحظات</p>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 px-6 py-4 bg-gray-50 flex items-center justify-between text-xs text-gray-400 print:bg-white">
          <span>شركة رمز الإبداع لإدارة الأملاك | ramzabdae.com</span>
          <span>تم إنشاء التقرير بتاريخ: {today}</span>
          <span>جميع البيانات سرية وخاصة</span>
        </div>

      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #print-area, #print-area * { visibility: visible; }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
}
