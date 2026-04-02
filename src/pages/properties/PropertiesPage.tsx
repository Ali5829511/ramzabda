import { useState } from 'react';
import { useStore, generateId } from '../../data/store';
import {
  Plus, Building2, MapPin, Edit, Trash2, FileText,
  ChevronDown, ChevronUp, X, Printer, Download
} from 'lucide-react';
import type { Property } from '../../types';
import { PropertyPrint } from '../../print/PropertyPrint';

function exportPropertiesToCSV(properties: Property[]) {
  const headers = [
    'اسم العقار','نوع العقار','المدينة','المنطقة','الحي','العنوان',
    'رقم وثيقة الملكية','نوع الوثيقة','مساحة الصك','عدد الوحدات',
    'نوع المبنى','الاستخدام','الطوابق','المصاعد','المواقف',
    'اسم المالك','هوية المالك','نسبة الملكية','نوع المالك',
    'رقم التسجيل العيني','حالة التسجيل','اسم الجمعية',
    'الوسيط','السجل التجاري','الحالة','تاريخ الإنشاء'
  ];
  const rows = properties.map(p => [
    p.propertyName, p.propertyType, p.city, p.region, p.district||'', p.address||'',
    p.titleDeedNumber, p.titleDeedType, p.deedArea||'', p.totalUnits,
    p.buildingType||'', p.propertyUsage, p.floors||'', p.elevators||'', p.parkingSpots||'',
    p.ownerName||'', p.ownerIdentity||'', p.ownershipPercentage||'', p.ownerType||'',
    p.realEstateRegNumber||'', p.realEstateRegStatus||'', p.associationName||'',
    p.brokerEstablishmentName||'', p.brokerCommercialReg||'',
    p.isActive?'نشط':'غير نشط', p.createdAt?.slice(0,10)||''
  ]);
  const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url;
  a.download = `العقارات_${new Date().toISOString().slice(0,10)}.csv`;
  a.click(); URL.revokeObjectURL(url);
}

const typeLabels: Record<string, string> = {
  residential: 'سكني', commercial: 'تجاري', mixed: 'مختلط',
  land: 'أرض', villa: 'فيلا', building: 'مبنى', apartment: 'شقق'
};

const SECTIONS = [
  { id: 'basic',       label: 'البيانات الأساسية',          icon: '🏢' },
  { id: 'location',    label: 'بيانات الموقع',               icon: '📍' },
  { id: 'deed',        label: 'بيانات الصك والسجل العيني',   icon: '📜' },
  { id: 'building',    label: 'بيانات المبنى والمرافق',      icon: '🏗️' },
  { id: 'totals',      label: 'الإجماليات',                  icon: '📊' },
  { id: 'owner',       label: 'بيانات المالك',               icon: '👤' },
  { id: 'association', label: 'اتحاد الملاك',                icon: '🏘️' },
  { id: 'broker',      label: 'الوسيط العقاري',              icon: '🧑‍💼' },
  { id: 'docs',        label: 'مستندات إضافية',              icon: '🗂️' },
  { id: 'notes',       label: 'الملاحظات',                   icon: '📝' },
];

const EMPTY_FORM = {
  // Basic
  propertyName: '', reportDate: '', propertyType: 'residential', status: 'active',
  imageUrl: '', images: [] as string[], documents: [] as string[],
  // Location
  region: '', city: '', district: '', address: '', nationalAddress: '',
  coordinates: '', mapLink: '',
  // Deed
  titleDeedNumber: '', titleDeedType: 'ملكية حرة', titleDeedIssueDate: '',
  titleDeedIssuedBy: '', titleDeedDocumentNumber: '', plotNumber: '',
  planNumber: '', deedArea: '', deedDocument: '',
  realEstateRegNumber: '', realEstateRegDate: '', realEstateRegStatus: '',
  realEstateRegDocs: [] as string[],
  // Building
  buildingType: '', propertyUsage: '', usagePurpose: '', propertyFacility: '',
  facilityLink: '', floors: '', totalUnits: '1', elevators: '', parkingSpots: '',
  utilities: [] as string[], buildingDocs: [] as string[],
  keyType: '', keyCount: '',
  // Totals (auto-calculated display only)
  // Owner
  ownerId: '', ownerName: '', ownerIdentity: '', ownerNationality: '',
  ownershipPercentage: '', ownershipArea: '', ownerType: '', ownerDocs: [] as string[],
  // Association
  associationName: '', associationRegNumber: '', associationUnifiedNumber: '',
  associationStatus: '', associationStartDate: '', associationEndDate: '',
  associationPresidentName: '', associationPresidentMobile: '',
  propertyManagerName: '', propertyManagerMobile: '',
  associationCertDocs: [] as string[], associationMeetingDocs: [] as string[], associationOtherDocs: [] as string[],
  associationTotalFees: '', associationVotersCount: '', associationAcceptanceRate: '', associationNonVoters: '',
  // Broker
  brokerEstablishmentName: '', brokerCommercialReg: '', brokerDocs: [] as string[],
  // Docs
  extraDocs: [] as string[],
  // Notes
  reportNotes: '',
};

type FormType = typeof EMPTY_FORM;

export default function PropertiesPage() {
  const { properties, units, contracts, addProperty, updateProperty, deleteProperty, currentUser, users } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Property | null>(null);
  const [search, setSearch] = useState('');
  const [openSection, setOpenSection] = useState<string>('basic');
  const [form, setForm] = useState<FormType>({ ...EMPTY_FORM });
  const [printProperty, setPrintProperty] = useState<Property | null>(null);

  const owners = users.filter(u => u.role === 'owner');

  const visibleProps = currentUser?.role === 'owner'
    ? properties.filter(p => p.ownerId === currentUser.id)
    : properties;

  const filtered = visibleProps.filter(p =>
    p.propertyName.includes(search) || p.city.includes(search) ||
    p.region.includes(search) || p.titleDeedNumber.includes(search)
  );

  const set = (key: keyof FormType, val: FormType[keyof FormType]) => setForm(f => ({ ...f, [key]: val }));

  const resetForm = () => { setForm({ ...EMPTY_FORM }); setEditing(null); setOpenSection('basic'); };

  const openEdit = (p: Property) => {
    setEditing(p);
    setForm({
      ...EMPTY_FORM,
      propertyName: p.propertyName, reportDate: p.reportDate || '',
      propertyType: p.propertyType, status: p.isActive ? 'active' : 'inactive',
      imageUrl: p.imageUrl || '', images: p.images || [],
      region: p.region, city: p.city, district: p.district || '',
      address: p.address || '', nationalAddress: p.nationalAddress || '',
      titleDeedNumber: p.titleDeedNumber, titleDeedType: p.titleDeedType,
      titleDeedIssueDate: p.titleDeedIssueDate || '', titleDeedIssuedBy: p.titleDeedIssuedBy || '',
      titleDeedDocumentNumber: p.titleDeedDocumentNumber || '', plotNumber: p.plotNumber || '',
      planNumber: p.planNumber || '', deedArea: p.deedArea?.toString() || '',
      realEstateRegNumber: p.realEstateRegNumber || '', realEstateRegDate: p.realEstateRegDate || '',
      realEstateRegStatus: p.realEstateRegStatus || '',
      buildingType: p.buildingType || '', propertyUsage: p.propertyUsage,
      usagePurpose: p.usagePurpose || '', propertyFacility: p.propertyFacility,
      floors: p.floors?.toString() || '', totalUnits: p.totalUnits.toString(),
      elevators: p.elevators?.toString() || '', parkingSpots: p.parkingSpots?.toString() || '',
      utilities: p.utilities || [],
      ownerId: p.ownerId, ownerName: p.ownerName || '', ownerIdentity: p.ownerIdentity || '',
      ownerNationality: p.ownerNationality || '', ownershipPercentage: p.ownershipPercentage || '',
      ownershipArea: p.ownershipArea?.toString() || '', ownerType: p.ownerType || '',
      associationName: p.associationName || '', associationRegNumber: p.associationRegNumber || '',
      associationUnifiedNumber: p.associationUnifiedNumber || '', associationStatus: p.associationStatus || '',
      associationStartDate: p.associationStartDate || '', associationEndDate: p.associationEndDate || '',
      associationPresidentName: p.associationPresidentName || '', associationPresidentMobile: p.associationPresidentMobile || '',
      propertyManagerName: p.propertyManagerName || '', propertyManagerMobile: p.propertyManagerMobile || '',
      associationTotalFees: p.associationTotalFees?.toString() || '',
      associationVotersCount: p.associationVotersCount?.toString() || '',
      associationAcceptanceRate: p.associationAcceptanceRate || '',
      associationNonVoters: p.associationNonVoters?.toString() || '',
      brokerEstablishmentName: p.brokerEstablishmentName || '', brokerCommercialReg: p.brokerCommercialReg || '',
      reportNotes: p.reportNotes?.join('\n') || '',
    });
    setShowForm(true);
    setOpenSection('basic');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const totalU = parseInt(form.totalUnits) || 1;
    const base: Partial<Property> = {
      propertyName: form.propertyName, reportDate: form.reportDate,
      propertyType: form.propertyType as Property['propertyType'],
      isActive: form.status === 'active', imageUrl: form.imageUrl, images: form.images,
      region: form.region, city: form.city, district: form.district,
      address: form.address, nationalAddress: form.nationalAddress,
      titleDeedNumber: form.titleDeedNumber, titleDeedType: form.titleDeedType,
      titleDeedIssueDate: form.titleDeedIssueDate, titleDeedIssuedBy: form.titleDeedIssuedBy,
      titleDeedDocumentNumber: form.titleDeedDocumentNumber, plotNumber: form.plotNumber,
      planNumber: form.planNumber, deedArea: parseFloat(form.deedArea) || undefined,
      realEstateRegNumber: form.realEstateRegNumber, realEstateRegDate: form.realEstateRegDate,
      realEstateRegStatus: form.realEstateRegStatus,
      buildingType: form.buildingType, propertyUsage: form.propertyUsage,
      usagePurpose: form.usagePurpose, propertyFacility: form.propertyFacility,
      floors: parseInt(form.floors) || undefined, totalUnits: totalU,
      elevators: parseInt(form.elevators) || undefined,
      parkingSpots: parseInt(form.parkingSpots) || undefined, utilities: form.utilities,
      totalContracts: 0, reservedUnits: 0, rentedUnits: 0,
      availableUnits: totalU, totalDocumentationFees: 0,
      totalContractValue: 0, totalCommission: 0,
      ownerId: form.ownerId || owners[0]?.id || '',
      ownerName: form.ownerName, ownerIdentity: form.ownerIdentity,
      ownerNationality: form.ownerNationality, ownershipPercentage: form.ownershipPercentage,
      ownershipArea: parseFloat(form.ownershipArea) || undefined, ownerType: form.ownerType,
      associationName: form.associationName, associationRegNumber: form.associationRegNumber,
      associationUnifiedNumber: form.associationUnifiedNumber, associationStatus: form.associationStatus,
      associationStartDate: form.associationStartDate, associationEndDate: form.associationEndDate,
      associationPresidentName: form.associationPresidentName, associationPresidentMobile: form.associationPresidentMobile,
      propertyManagerName: form.propertyManagerName, propertyManagerMobile: form.propertyManagerMobile,
      associationTotalFees: parseFloat(form.associationTotalFees) || undefined,
      associationVotersCount: parseInt(form.associationVotersCount) || undefined,
      associationAcceptanceRate: form.associationAcceptanceRate,
      associationNonVoters: parseInt(form.associationNonVoters) || undefined,
      brokerEstablishmentName: form.brokerEstablishmentName, brokerCommercialReg: form.brokerCommercialReg,
      reportNotes: form.reportNotes ? form.reportNotes.split('\n').filter(Boolean) : [],
    };
    if (editing) {
      updateProperty(editing.id, base);
    } else {
      addProperty({ ...base as Property, id: generateId(), createdAt: new Date().toISOString() });
    }
    setShowForm(false);
    resetForm();
  };

  const Section = ({ id, children }: { id: string; children: React.ReactNode }) => {
    const sec = SECTIONS.find(s => s.id === id)!;
    const isOpen = openSection === id;
    return (
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <button type="button" onClick={() => setOpenSection(isOpen ? '' : id)}
          className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-right">
          <span className="font-bold text-gray-700 flex items-center gap-2 text-sm">
            <span>{sec.icon}</span> {sec.label}
          </span>
          {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </button>
        {isOpen && <div className="p-4 space-y-3 bg-white">{children}</div>}
      </div>
    );
  };

  const Field = ({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) => (
    <div>
      <label className="label text-xs">{label}{required && <span className="text-red-500 mr-1">*</span>}</label>
      {children}
    </div>
  );

  const G2 = ({ children }: { children: React.ReactNode }) => (
    <div className="grid grid-cols-2 gap-3">{children}</div>
  );

  const UtilitiesInput = () => {
    const [val, setVal] = useState('');
    return (
      <div>
        <div className="flex gap-2">
          <input className="input-field flex-1 text-sm" value={val} onChange={e => setVal(e.target.value)}
            placeholder="أضف مرفق..." onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (val.trim()) { set('utilities', [...form.utilities, val.trim()]); setVal(''); } } }} />
          <button type="button" className="btn-secondary text-sm px-3" onClick={() => { if (val.trim()) { set('utilities', [...form.utilities, val.trim()]); setVal(''); } }}>
            <Plus className="w-4 h-4" />
          </button>
        </div>
        {form.utilities.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {form.utilities.map((u, i) => (
              <span key={i} className="flex items-center gap-1 bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full">
                {u}
                <button type="button" onClick={() => set('utilities', form.utilities.filter((_, j) => j !== i))}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Compute totals from live data
  const getPropertyTotals = (propId: string) => {
    const propUnits = units.filter(u => u.propertyId === propId);
    const propContracts = contracts.filter(c => c.propertyId === propId && c.status === 'active');
    const totalContractValue = propContracts.reduce((s, c) => s + (c.annualRent || 0), 0);
    const totalDocFees = propContracts.reduce((s, c) => s + (c.ejarDocumentationFees || 0), 0);
    const totalCommission = propContracts.reduce((s, c) => s + (c.brokerageCommission || 0), 0);
    return {
      total: propUnits.length,
      reserved: propUnits.filter(u => u.unitStatus === 'reserved').length,
      rented: propUnits.filter(u => u.unitStatus === 'rented').length,
      available: propUnits.filter(u => u.unitStatus === 'available').length,
      contracts: propContracts.length,
      totalContractValue, totalDocFees, totalCommission,
    };
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">إدارة العقارات</h1>
          <p className="section-subtitle">{filtered.length} عقار</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-secondary flex items-center gap-2 text-sm"
            onClick={() => exportPropertiesToCSV(filtered)}
            title="تصدير Excel/CSV">
            <Download className="w-4 h-4" /> تصدير
          </button>
          {(currentUser?.role === 'admin' || currentUser?.role === 'employee') && (
            <button className="btn-primary" onClick={() => { resetForm(); setShowForm(true); }}>
              <Plus className="w-4 h-4" /> إضافة عقار
            </button>
          )}
        </div>
      </div>

      <input className="input-field max-w-sm" placeholder="بحث بالاسم، المدينة، رقم الصك..." value={search} onChange={e => setSearch(e.target.value)} />

      {/* =================== MODAL =================== */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3">
          <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl max-h-[95vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="text-lg font-black text-gray-800">{editing ? 'تعديل بيانات العقار' : 'إضافة عقار جديد'}</h2>
              <button type="button" onClick={() => { setShowForm(false); resetForm(); }} className="p-2 hover:bg-gray-100 rounded-xl">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 p-5 space-y-3">

              {/* 1. البيانات الأساسية */}
              <Section id="basic">
                <G2>
                  <div className="col-span-2">
                    <Field label="اسم العقار" required>
                      <input className="input-field" value={form.propertyName} onChange={e => set('propertyName', e.target.value)} required />
                    </Field>
                  </div>
                  <Field label="تاريخ التقرير">
                    <input type="date" className="input-field" value={form.reportDate} onChange={e => set('reportDate', e.target.value)} />
                  </Field>
                  <Field label="نوع العقار">
                    <select className="input-field" value={form.propertyType} onChange={e => set('propertyType', e.target.value)}>
                      {Object.entries(typeLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  </Field>
                  <Field label="الحالة">
                    <select className="input-field" value={form.status} onChange={e => set('status', e.target.value)}>
                      <option value="active">نشط</option>
                      <option value="inactive">غير نشط</option>
                    </select>
                  </Field>
                  <Field label="رابط الصورة الرئيسية">
                    <input className="input-field" value={form.imageUrl} onChange={e => set('imageUrl', e.target.value)} placeholder="https://..." />
                  </Field>
                  <div className="col-span-2">
                    <Field label="صور العقار (روابط — كل رابط في سطر)">
                      <textarea className="input-field text-sm" rows={2} placeholder="https://image1.jpg&#10;https://image2.jpg"
                        value={form.images.join('\n')} onChange={e => set('images', e.target.value.split('\n').filter(Boolean))} />
                    </Field>
                  </div>
                </G2>
              </Section>

              {/* 2. بيانات الموقع */}
              <Section id="location">
                <G2>
                  <Field label="المنطقة">
                    <input className="input-field" value={form.region} onChange={e => set('region', e.target.value)} />
                  </Field>
                  <Field label="المدينة" required>
                    <input className="input-field" value={form.city} onChange={e => set('city', e.target.value)} required />
                  </Field>
                  <Field label="الحي">
                    <input className="input-field" value={form.district} onChange={e => set('district', e.target.value)} />
                  </Field>
                  <Field label="العنوان" required>
                    <input className="input-field" value={form.address} onChange={e => set('address', e.target.value)} />
                  </Field>
                  <Field label="العنوان الوطني">
                    <input className="input-field" value={form.nationalAddress} onChange={e => set('nationalAddress', e.target.value)} />
                  </Field>
                  <Field label="إحداثيات الموقع">
                    <input className="input-field" value={form.coordinates} onChange={e => set('coordinates', e.target.value)} placeholder="24.7136, 46.6753" />
                  </Field>
                  <div className="col-span-2">
                    <Field label="رابط الموقع على الخرائط">
                      <input className="input-field" value={form.mapLink} onChange={e => set('mapLink', e.target.value)} placeholder="https://maps.google.com/..." />
                    </Field>
                  </div>
                </G2>
              </Section>

              {/* 3. بيانات الصك */}
              <Section id="deed">
                <p className="text-xs font-bold text-gray-500 uppercase">وثيقة الملكية</p>
                <G2>
                  <Field label="رقم وثيقة الملكية" required>
                    <input className="input-field font-mono" value={form.titleDeedNumber} onChange={e => set('titleDeedNumber', e.target.value)} required placeholder="TD-2024-XXX" />
                  </Field>
                  <Field label="نوع وثيقة الملكية">
                    <select className="input-field" value={form.titleDeedType} onChange={e => set('titleDeedType', e.target.value)}>
                      {['ملكية حرة','ملكية مشتركة','ملكية تجارية','وقف','إيجار طويل','صك','وثيقة'].map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </Field>
                  <Field label="تاريخ الإصدار">
                    <input type="date" className="input-field" value={form.titleDeedIssueDate} onChange={e => set('titleDeedIssueDate', e.target.value)} />
                  </Field>
                  <Field label="جهة الإصدار">
                    <input className="input-field" value={form.titleDeedIssuedBy} onChange={e => set('titleDeedIssuedBy', e.target.value)} />
                  </Field>
                  <Field label="رقم المستند">
                    <input className="input-field" value={form.titleDeedDocumentNumber} onChange={e => set('titleDeedDocumentNumber', e.target.value)} />
                  </Field>
                  <Field label="رقم القطعة">
                    <input className="input-field" value={form.plotNumber} onChange={e => set('plotNumber', e.target.value)} />
                  </Field>
                  <Field label="رقم المخطط">
                    <input className="input-field" value={form.planNumber} onChange={e => set('planNumber', e.target.value)} />
                  </Field>
                  <Field label="مساحة الصك م²">
                    <input type="number" className="input-field" value={form.deedArea} onChange={e => set('deedArea', e.target.value)} />
                  </Field>
                </G2>
                <p className="text-xs font-bold text-gray-500 uppercase mt-2">التسجيل العيني</p>
                <G2>
                  <Field label="رقم التسجيل العيني">
                    <input className="input-field" value={form.realEstateRegNumber} onChange={e => set('realEstateRegNumber', e.target.value)} />
                  </Field>
                  <Field label="تاريخ التسجيل">
                    <input type="date" className="input-field" value={form.realEstateRegDate} onChange={e => set('realEstateRegDate', e.target.value)} />
                  </Field>
                  <div className="col-span-2">
                    <Field label="حالة التسجيل العيني">
                      <select className="input-field" value={form.realEstateRegStatus} onChange={e => set('realEstateRegStatus', e.target.value)}>
                        <option value="">-- اختر --</option>
                        <option value="مسجل">مسجل</option>
                        <option value="قيد التسجيل">قيد التسجيل</option>
                        <option value="غير مسجل">غير مسجل</option>
                      </select>
                    </Field>
                  </div>
                </G2>
              </Section>

              {/* 4. بيانات المبنى */}
              <Section id="building">
                <G2>
                  <Field label="نوع المبنى">
                    <input className="input-field" value={form.buildingType} onChange={e => set('buildingType', e.target.value)} placeholder="مبنى سكني، برج تجاري..." />
                  </Field>
                  <Field label="نوع استخدام العقار">
                    <input className="input-field" value={form.propertyUsage} onChange={e => set('propertyUsage', e.target.value)} placeholder="سكني / تجاري / صناعي..." />
                  </Field>
                  <Field label="الغرض من الاستخدام">
                    <input className="input-field" value={form.usagePurpose} onChange={e => set('usagePurpose', e.target.value)} />
                  </Field>
                  <Field label="مرفق العقار">
                    <input className="input-field" value={form.propertyFacility} onChange={e => set('propertyFacility', e.target.value)} />
                  </Field>
                  <div className="col-span-2">
                    <Field label="رابط أو وصف المرفق">
                      <input className="input-field" value={form.facilityLink} onChange={e => set('facilityLink', e.target.value)} />
                    </Field>
                  </div>
                  <Field label="عدد الطوابق">
                    <input type="number" className="input-field" value={form.floors} onChange={e => set('floors', e.target.value)} min="0" />
                  </Field>
                  <Field label="عدد الوحدات">
                    <input type="number" className="input-field" value={form.totalUnits} onChange={e => set('totalUnits', e.target.value)} min="1" />
                  </Field>
                  <Field label="عدد المصاعد">
                    <input type="number" className="input-field" value={form.elevators} onChange={e => set('elevators', e.target.value)} min="0" />
                  </Field>
                  <Field label="عدد المواقف">
                    <input type="number" className="input-field" value={form.parkingSpots} onChange={e => set('parkingSpots', e.target.value)} min="0" />
                  </Field>
                  <Field label="نوع المفتاح">
                    <select className="input-field" value={form.keyType} onChange={e => set('keyType', e.target.value)}>
                      <option value="">-- اختر --</option>
                      {['ميكانيكي','إلكتروني','بطاقة ذكية','ريموت','بيومتري'].map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </Field>
                  <Field label="عدد المفاتيح">
                    <input type="number" className="input-field" value={form.keyCount} onChange={e => set('keyCount', e.target.value)} min="0" />
                  </Field>
                </G2>
                <Field label="المرافق والخدمات">
                  <UtilitiesInput />
                </Field>
              </Section>

              {/* 5. الإجماليات (عرض فقط عند التعديل) */}
              <Section id="totals">
                {editing ? (() => {
                  const t = getPropertyTotals(editing.id);
                  return (
                    <div className="space-y-3">
                      <p className="text-xs font-bold text-gray-500">الوحدات</p>
                      <div className="grid grid-cols-4 gap-2 text-center">
                        {[
                          { label: 'الإجمالي', value: t.total, color: 'text-gray-700' },
                          { label: 'المحجوزة', value: t.reserved, color: 'text-yellow-600' },
                          { label: 'المؤجرة', value: t.rented, color: 'text-blue-600' },
                          { label: 'المتاحة', value: t.available, color: 'text-green-600' },
                        ].map((s, i) => (
                          <div key={i} className="bg-gray-50 rounded-xl p-2">
                            <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
                            <p className="text-xs text-gray-400">{s.label}</p>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs font-bold text-gray-500 mt-2">العقود والرسوم</p>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { label: 'إجمالي العقود', value: t.contracts },
                          { label: 'إجمالي مبلغ العقود ر.س', value: t.totalContractValue.toLocaleString('ar-SA') },
                          { label: 'إجمالي رسوم التوثيق ر.س', value: t.totalDocFees.toLocaleString('ar-SA') },
                          { label: 'إجمالي رسوم السعي ر.س', value: t.totalCommission.toLocaleString('ar-SA') },
                        ].map((s, i) => (
                          <div key={i} className="bg-blue-50 rounded-xl p-3">
                            <p className="text-xs text-gray-500">{s.label}</p>
                            <p className="font-black text-blue-700">{s.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })() : (
                  <p className="text-sm text-gray-400 text-center py-4">الإجماليات تُحسب تلقائياً بعد إضافة العقار والوحدات والعقود.</p>
                )}
              </Section>

              {/* 6. بيانات المالك */}
              <Section id="owner">
                <G2>
                  <Field label="المالك (من النظام)">
                    <select className="input-field" value={form.ownerId} onChange={e => set('ownerId', e.target.value)}>
                      <option value="">-- اختر مالك --</option>
                      {owners.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                    </select>
                  </Field>
                  <Field label="اسم المالك (يدوي)">
                    <input className="input-field" value={form.ownerName} onChange={e => set('ownerName', e.target.value)} />
                  </Field>
                  <Field label="هوية المالك">
                    <input className="input-field" value={form.ownerIdentity} onChange={e => set('ownerIdentity', e.target.value)} />
                  </Field>
                  <Field label="الجنسية">
                    <input className="input-field" value={form.ownerNationality} onChange={e => set('ownerNationality', e.target.value)} />
                  </Field>
                  <Field label="نسبة الملكية">
                    <input className="input-field" value={form.ownershipPercentage} onChange={e => set('ownershipPercentage', e.target.value)} placeholder="100%" />
                  </Field>
                  <Field label="مساحة الملكية م²">
                    <input type="number" className="input-field" value={form.ownershipArea} onChange={e => set('ownershipArea', e.target.value)} />
                  </Field>
                  <div className="col-span-2">
                    <Field label="نوع المالك">
                      <select className="input-field" value={form.ownerType} onChange={e => set('ownerType', e.target.value)}>
                        <option value="">-- اختر --</option>
                        {['فرد','شركة','مؤسسة','حكومي','وقف','ورثة'].map(v => <option key={v} value={v}>{v}</option>)}
                      </select>
                    </Field>
                  </div>
                </G2>
              </Section>

              {/* 7. اتحاد الملاك */}
              <Section id="association">
                <G2>
                  <Field label="اسم الجمعية">
                    <input className="input-field" value={form.associationName} onChange={e => set('associationName', e.target.value)} />
                  </Field>
                  <Field label="رقم التسجيل">
                    <input className="input-field" value={form.associationRegNumber} onChange={e => set('associationRegNumber', e.target.value)} />
                  </Field>
                  <Field label="الرقم الموحد">
                    <input className="input-field" value={form.associationUnifiedNumber} onChange={e => set('associationUnifiedNumber', e.target.value)} />
                  </Field>
                  <Field label="حالة الجمعية">
                    <select className="input-field" value={form.associationStatus} onChange={e => set('associationStatus', e.target.value)}>
                      <option value="">-- اختر --</option>
                      {['نشطة','منتهية','قيد التأسيس'].map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </Field>
                  <Field label="تاريخ السريان">
                    <input type="date" className="input-field" value={form.associationStartDate} onChange={e => set('associationStartDate', e.target.value)} />
                  </Field>
                  <Field label="تاريخ الانتهاء">
                    <input type="date" className="input-field" value={form.associationEndDate} onChange={e => set('associationEndDate', e.target.value)} />
                  </Field>
                  <Field label="اسم رئيس الجمعية">
                    <input className="input-field" value={form.associationPresidentName} onChange={e => set('associationPresidentName', e.target.value)} />
                  </Field>
                  <Field label="جوال رئيس الجمعية">
                    <input className="input-field" value={form.associationPresidentMobile} onChange={e => set('associationPresidentMobile', e.target.value)} />
                  </Field>
                  <Field label="اسم مدير العقار">
                    <input className="input-field" value={form.propertyManagerName} onChange={e => set('propertyManagerName', e.target.value)} />
                  </Field>
                  <Field label="جوال مدير العقار">
                    <input className="input-field" value={form.propertyManagerMobile} onChange={e => set('propertyManagerMobile', e.target.value)} />
                  </Field>
                </G2>
                <p className="text-xs font-bold text-gray-500 mt-2">نتائج التصويت والرسوم</p>
                <G2>
                  <Field label="إجمالي الرسوم ر.س">
                    <input type="number" className="input-field" value={form.associationTotalFees} onChange={e => set('associationTotalFees', e.target.value)} />
                  </Field>
                  <Field label="عدد المصوتين">
                    <input type="number" className="input-field" value={form.associationVotersCount} onChange={e => set('associationVotersCount', e.target.value)} />
                  </Field>
                  <Field label="نسبة القبول">
                    <input className="input-field" value={form.associationAcceptanceRate} onChange={e => set('associationAcceptanceRate', e.target.value)} placeholder="95%" />
                  </Field>
                  <Field label="غير المصوتين">
                    <input type="number" className="input-field" value={form.associationNonVoters} onChange={e => set('associationNonVoters', e.target.value)} />
                  </Field>
                </G2>
              </Section>

              {/* 8. الوسيط العقاري */}
              <Section id="broker">
                <G2>
                  <Field label="اسم المنشأة">
                    <input className="input-field" value={form.brokerEstablishmentName} onChange={e => set('brokerEstablishmentName', e.target.value)} />
                  </Field>
                  <Field label="السجل التجاري">
                    <input className="input-field" value={form.brokerCommercialReg} onChange={e => set('brokerCommercialReg', e.target.value)} />
                  </Field>
                </G2>
              </Section>

              {/* 9. مستندات إضافية */}
              <Section id="docs">
                <Field label="روابط المستندات الإضافية (كل رابط في سطر)">
                  <textarea className="input-field text-sm" rows={3}
                    placeholder="https://doc1.pdf&#10;https://doc2.pdf"
                    value={form.extraDocs.join('\n')}
                    onChange={e => set('extraDocs', e.target.value.split('\n').filter(Boolean))} />
                </Field>
              </Section>

              {/* 10. الملاحظات */}
              <Section id="notes">
                <Field label="الملاحظات">
                  <textarea className="input-field" rows={4} value={form.reportNotes}
                    onChange={e => set('reportNotes', e.target.value)}
                    placeholder="أي ملاحظات إضافية..." />
                </Field>
              </Section>

              {/* Footer */}
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary flex-1 justify-center">
                  {editing ? 'حفظ التعديلات' : 'إضافة العقار'}
                </button>
                <button type="button" className="btn-secondary" onClick={() => { setShowForm(false); resetForm(); }}>
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================== CARDS =================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.map(p => {
          const owner = users.find(u => u.id === p.ownerId);
          const t = getPropertyTotals(p.id);
          return (
            <div key={p.id} className="card hover:shadow-md transition-shadow">
              {p.imageUrl && (
                <img src={p.imageUrl} alt={p.propertyName}
                  className="w-full h-32 object-cover rounded-xl mb-3"
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              )}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">{p.propertyName}</p>
                    <p className="text-xs text-gray-500">{typeLabels[p.propertyType]} | {p.propertyUsage}</p>
                  </div>
                </div>
                {(currentUser?.role === 'admin' || currentUser?.role === 'employee') && (
                  <div className="flex gap-1">
                    <button onClick={() => setPrintProperty(p)} className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-400" title="طباعة تقرير"><Printer className="w-4 h-4" /></button>
                    <button onClick={() => openEdit(p)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => deleteProperty(p.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-400"><Trash2 className="w-4 h-4" /></button>
                  </div>
                )}
              </div>

              <div className="space-y-1.5 text-sm text-gray-600 mb-3">
                <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-gray-400" />{p.city}{p.district ? ` - ${p.district}` : ''}</div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <FileText className="w-3.5 h-3.5" />
                  <span className="font-mono">{p.titleDeedNumber}</span>
                  <span>({p.titleDeedType})</span>
                </div>
                {owner && <div className="text-xs text-gray-400">المالك: {owner.name}</div>}
                {p.floors && <div className="text-xs text-gray-400">الطوابق: {p.floors} | المصاعد: {p.elevators ?? 0}</div>}
              </div>

              <div className="grid grid-cols-4 gap-2 text-center mb-3">
                {[
                  { label: 'المتاحة', value: t.available, color: 'text-green-600' },
                  { label: 'المؤجرة', value: t.rented, color: 'text-blue-600' },
                  { label: 'المحجوزة', value: t.reserved, color: 'text-yellow-600' },
                  { label: 'الإجمالي', value: t.total || p.totalUnits, color: 'text-gray-700' },
                ].map((s, i) => (
                  <div key={i} className="bg-gray-50 rounded-lg p-1.5">
                    <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                    <p className="text-xs text-gray-400">{s.label}</p>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-gray-100 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">إجمالي قيمة العقود</span>
                  <span className="font-semibold text-yellow-600">{t.totalContractValue.toLocaleString('ar-SA')} ر</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">رسوم التوثيق</span>
                  <span className="font-medium">{t.totalDocFees.toLocaleString('ar-SA')} ر</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1">
                  <div className="bg-yellow-500 rounded-full h-1.5"
                    style={{ width: `${(t.total || p.totalUnits) > 0 ? (t.rented / (t.total || p.totalUnits)) * 100 : 0}%` }} />
                </div>
                <p className="text-xs text-gray-400">
                  {(t.total || p.totalUnits) > 0 ? Math.round((t.rented / (t.total || p.totalUnits)) * 100) : 0}% نسبة الإشغال
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Print Modal */}
      {printProperty && (
        <PropertyPrint property={printProperty} onClose={() => setPrintProperty(null)} />
      )}
    </div>
  );
}
