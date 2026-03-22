import { useState, useRef, useCallback } from 'react';
import { useStore, generateId } from '../../data/store';
import type { Contract } from '../../types';
import {
  FileText, Upload, CheckCircle, ChevronRight, ChevronLeft,
  AlertCircle, Loader2, Building2, User, DollarSign,
  Hash, Clipboard, X, Eye, EyeOff, Save,
  Sparkles, FileCheck
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────
interface ExtractedContractData {
  // Contract core
  contractNumber?: string;
  ejarContractId?: string;
  versionNumber?: string;
  contractStartDate?: string;
  contractEndDate?: string;
  contractDurationMonths?: number;
  contractDurationYears?: number;
  annualRent?: number;
  monthlyRent?: number;
  totalRentAmount?: number;
  paymentFrequency?: string;
  firstPaymentDate?: string;
  insuranceAmount?: number;

  // Tenant
  tenantName?: string;
  tenantNationalId?: string;
  tenantPhone?: string;
  tenantNationality?: string;
  tenantIdType?: string;

  // Landlord
  landlordName?: string;
  landlordNationalId?: string;
  landlordPhone?: string;
  landlordIban?: string;

  // Property / Unit
  propertyName?: string;
  unitNumber?: string;
  unitType?: string;
  city?: string;
  district?: string;
  address?: string;
  titleDeedNumber?: string;
  unitArea?: number;
  floorsCount?: number;
  roomsCount?: number;
  bathroomsCount?: number;

  // Extras
  usagePurpose?: string;
  conditions?: string;
  specialClauses?: string;
  electricityAccountNumber?: string;
  waterAccountNumber?: string;
  commissionAmount?: number;
  commissionPercentage?: number;
  brokerName?: string;
  brokerLicense?: string;
  taxNumber?: string;
  status?: string;
}

// ─── PDF Text Extractor (browser-native) ─────────────────────
async function extractTextFromPDF(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        // Dynamic import to avoid SSR issues
        const { getDocument, GlobalWorkerOptions } = await import('pdfjs-dist');
        GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

        const typedArray = new Uint8Array(e.target?.result as ArrayBuffer);
        const pdf = await getDocument({ data: typedArray }).promise;

        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          const pageText = content.items.map((item: { str?: string }) => (item as { str?: string }).str ?? '').join(' ');
          fullText += pageText + '\n';
        }
        resolve(fullText);
      } catch {
        // Fallback: return mock extraction message
        resolve('PDF_PARSE_FAILED');
      }
    };
    reader.readAsArrayBuffer(file);
  });
}

// ─── Smart Parser ─────────────────────────────────────────────
function parseEjarContract(text: string): ExtractedContractData {
  if (text === 'PDF_PARSE_FAILED') return {};

  const data: ExtractedContractData = {};

  // Helper
  const find = (patterns: RegExp[]): string | undefined => {
    for (const p of patterns) {
      const m = text.match(p);
      if (m?.[1]?.trim()) return m[1].trim();
    }
    return undefined;
  };
  const findNum = (patterns: RegExp[]): number | undefined => {
    const v = find(patterns);
    if (!v) return undefined;
    const n = parseFloat(v.replace(/,/g, '').replace(/[^\d.]/g, ''));
    return isNaN(n) ? undefined : n;
  };

  // Contract number
  data.contractNumber = find([
    /رقم\s*العقد[:\s]+([A-Z0-9-]+)/,
    /Contract\s*(?:No|Number)[.:\s]+([A-Z0-9-]+)/i,
    /عقد\s*رقم[:\s]+([A-Z0-9-]+)/,
    /(\d{4}-\d{6,})/,
  ]);

  data.ejarContractId = find([
    /رقم\s*الطلب[:\s]+([A-Z0-9-]+)/,
    /Ejar\s*(?:ID|Contract)[:\s]+([A-Z0-9-]+)/i,
    /منصة\s*إيجار[:\s]+([A-Z0-9-]+)/,
  ]);

  // Dates
  data.contractStartDate = find([
    /تاريخ\s*(?:بداية|البداية|بدء|البدء)\s*العقد[:\s]+(\d{1,2}[/\-.]\d{1,2}[/\-.]\d{4})/,
    /تاريخ\s*البدء[:\s]+(\d{1,2}[/\-.]\d{1,2}[/\-.]\d{4})/,
    /Start\s*Date[:\s]+(\d{1,2}[/\-.]\d{1,2}[/\-.]\d{4})/i,
    /من\s*تاريخ[:\s]+(\d{1,2}[/\-.]\d{1,2}[/\-.]\d{4})/,
  ]);

  data.contractEndDate = find([
    /تاريخ\s*(?:نهاية|الانتهاء|النهاية|انتهاء)\s*العقد[:\s]+(\d{1,2}[/\-.]\d{1,2}[/\-.]\d{4})/,
    /تاريخ\s*الانتهاء[:\s]+(\d{1,2}[/\-.]\d{1,2}[/\-.]\d{4})/,
    /End\s*Date[:\s]+(\d{1,2}[/\-.]\d{1,2}[/\-.]\d{4})/i,
    /إلى\s*تاريخ[:\s]+(\d{1,2}[/\-.]\d{1,2}[/\-.]\d{4})/,
  ]);

  // Rent
  data.annualRent = findNum([
    /الإيجار\s*السنوي[:\s]+([\d,]+(?:\.\d+)?)/,
    /قيمة\s*الإيجار\s*السنوية[:\s]+([\d,]+(?:\.\d+)?)/,
    /Annual\s*Rent[:\s]+([\d,]+(?:\.\d+)?)/i,
    /مبلغ\s*الإيجار[:\s]+([\d,]+(?:\.\d+)?)/,
  ]);
  data.monthlyRent = findNum([
    /الإيجار\s*الشهري[:\s]+([\d,]+(?:\.\d+)?)/,
    /Monthly\s*Rent[:\s]+([\d,]+(?:\.\d+)?)/i,
    /الدفعة\s*الشهرية[:\s]+([\d,]+(?:\.\d+)?)/,
  ]);
  data.totalRentAmount = findNum([
    /إجمالي\s*(?:قيمة|مبلغ)\s*العقد[:\s]+([\d,]+(?:\.\d+)?)/,
    /Total\s*(?:Rent|Amount)[:\s]+([\d,]+(?:\.\d+)?)/i,
    /القيمة\s*الإجمالية[:\s]+([\d,]+(?:\.\d+)?)/,
  ]);
  data.insuranceAmount = findNum([
    /(?:مبلغ|قيمة)\s*التأمين[:\s]+([\d,]+(?:\.\d+)?)/,
    /Deposit[:\s]+([\d,]+(?:\.\d+)?)/i,
    /عربون[:\s]+([\d,]+(?:\.\d+)?)/,
  ]);
  data.paymentFrequency = find([
    /(?:دفعة|طريقة\s*الدفع|الدفع)[:\s]+(شهري|سنوي|ربع\s*سنوي|نصف\s*سنوي|فصلي)/,
    /Payment\s*(?:Frequency|Schedule)[:\s]+(\w+)/i,
  ]);

  // Tenant
  data.tenantName = find([
    /اسم\s*المستأجر[:\s]+([^\n\r،,]+)/,
    /Tenant\s*Name[:\s]+([^\n\r,]+)/i,
    /الطرف\s*الثاني[:\s]+([^\n\r،]+)/,
    /المستأجر[:\s]+([^\n\r،,—-]+)/,
  ]);
  data.tenantNationalId = find([
    /هوية\s*المستأجر[:\s]+(\d{10})/,
    /رقم\s*(?:هوية|الهوية)\s*المستأجر[:\s]+(\d{10})/,
    /Tenant\s*(?:ID|Identity)[:\s]+(\d{10})/i,
    /\b(1\d{9})\b/,
  ]);
  data.tenantPhone = find([
    /جوال\s*المستأجر[:\s]+([0-9+\s-]+)/,
    /هاتف\s*المستأجر[:\s]+([0-9+\s-]+)/,
    /Tenant\s*(?:Phone|Mobile)[:\s]+([0-9+\s-]+)/i,
    /\b(05\d{8})\b/,
  ]);
  data.tenantNationality = find([
    /جنسية\s*المستأجر[:\s]+([^\n\r،,]+)/,
    /Nationality[:\s]+([^\n\r,]+)/i,
  ]);

  // Landlord
  data.landlordName = find([
    /اسم\s*(?:المالك|المؤجر)[:\s]+([^\n\r،,]+)/,
    /Landlord\s*Name[:\s]+([^\n\r,]+)/i,
    /الطرف\s*الأول[:\s]+([^\n\r،]+)/,
    /المؤجر[:\s]+([^\n\r،,—-]+)/,
  ]);
  data.landlordNationalId = find([
    /هوية\s*(?:المالك|المؤجر)[:\s]+(\d{10})/,
    /رقم\s*(?:هوية|الهوية)\s*المالك[:\s]+(\d{10})/,
    /Landlord\s*ID[:\s]+(\d{10})/i,
  ]);
  data.landlordPhone = find([
    /جوال\s*(?:المالك|المؤجر)[:\s]+([0-9+\s-]+)/,
    /هاتف\s*المالك[:\s]+([0-9+\s-]+)/,
  ]);
  data.landlordIban = find([
    /(?:رقم\s*)?(?:الآيبان|IBAN)[:\s]+([A-Z]{2}\d{2}[A-Z0-9]+)/i,
    /(SA\d{22})/,
  ]);

  // Property
  data.unitNumber = find([
    /رقم\s*(?:الوحدة|الشقة|المكتب)[:\s]+([^\n\r،,]+)/,
    /Unit\s*(?:No|Number)[:\s]+([^\n\r,]+)/i,
    /الوحدة\s*رقم[:\s]+([^\n\r،,]+)/,
  ]);
  data.city = find([
    /(?:مدينة|المدينة)[:\s]+([^\n\r،,]+)/,
    /City[:\s]+([^\n\r,]+)/i,
  ]);
  data.district = find([
    /(?:حي|الحي)[:\s]+([^\n\r،,]+)/,
    /District[:\s]+([^\n\r,]+)/i,
  ]);
  data.address = find([
    /(?:العنوان|عنوان\s*العقار)[:\s]+([^\n\r،]+)/,
    /Address[:\s]+([^\n\r]+)/i,
  ]);
  data.titleDeedNumber = find([
    /رقم\s*(?:الصك|وثيقة\s*الملكية)[:\s]+([^\n\r،,\s]+)/,
    /Title\s*Deed[:\s]+([^\n\r,]+)/i,
  ]);
  data.unitArea = findNum([
    /(?:مساحة|المساحة)[:\s]+([\d,]+(?:\.\d+)?)\s*م/,
    /Area[:\s]+([\d,]+(?:\.\d+)?)/i,
  ]);
  data.unitType = find([
    /نوع\s*(?:الوحدة|العقار)[:\s]+([^\n\r،,]+)/,
    /(?:شقة|فيلا|استوديو|دور|مكتب|محل)/,
  ]);
  data.roomsCount = findNum([
    /(?:غرف|عدد\s*الغرف)[:\s]+(\d+)/,
    /Rooms[:\s]+(\d+)/i,
  ]);
  data.bathroomsCount = findNum([
    /(?:حمامات|دورات\s*المياه)[:\s]+(\d+)/,
    /Bathrooms[:\s]+(\d+)/i,
  ]);
  data.usagePurpose = find([
    /(?:الغرض|غرض\s*الاستخدام)[:\s]+([^\n\r،,]+)/,
    /Usage[:\s]+([^\n\r,]+)/i,
    /(سكني|تجاري|صناعي)/,
  ]);

  // Broker
  data.brokerName = find([
    /(?:اسم\s*)?(?:الوسيط|الوكيل|السمسار)[:\s]+([^\n\r،,]+)/,
    /Broker[:\s]+([^\n\r,]+)/i,
    /رمز\s*الإبداع/i,
  ]);
  data.brokerLicense = find([
    /رخصة\s*(?:فال|الوسيط)[:\s]+([^\n\r،,\s]+)/,
    /FAL\s*License[:\s]+([^\n\r,]+)/i,
    /رقم\s*الرخصة[:\s]+([^\n\r،,\s]+)/,
  ]);

  return data;
}

// ─── Helper: normalize date to ISO yyyy-mm-dd ─────────────────
function normalizeDate(d?: string): string {
  if (!d) return '';
  // dd/mm/yyyy or dd-mm-yyyy
  const m1 = d.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})$/);
  if (m1) return `${m1[3]}-${m1[2].padStart(2, '0')}-${m1[1].padStart(2, '0')}`;
  // yyyy-mm-dd or yyyy/mm/dd
  const m2 = d.match(/^(\d{4})[/\-.](\d{1,2})[/\-.](\d{1,2})$/);
  if (m2) return `${m2[1]}-${m2[2].padStart(2, '0')}-${m2[3].padStart(2, '0')}`;
  return d;
}

// ─── Field Row ────────────────────────────────────────────────
function FieldRow({ label, value, onChange, type = 'text', readOnly }: {
  label: string; value: string; onChange?: (v: string) => void; type?: string; readOnly?: boolean;
}) {
  return (
    <div>
      <label className="label">{label}</label>
      {readOnly
        ? <div className="input-field bg-gray-50 text-gray-700 text-sm">{value || '—'}</div>
        : <input type={type} className="input-field text-sm" value={value}
            onChange={e => onChange?.(e.target.value)} />}
    </div>
  );
}

// ─── Section ─────────────────────────────────────────────────
function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h3 className="flex items-center gap-2 text-sm font-bold text-gray-700 border-b pb-2">
        <span className="text-yellow-500">{icon}</span>{title}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{children}</div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────
interface Props {
  onClose: () => void;
  onContractAdded?: () => void;
}

export default function EjarContractAnalyzer({ onClose, onContractAdded }: Props) {
  const { contracts, units, users, properties, addContract } = useStore();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [rawText, setRawText] = useState('');
  const [error, setError] = useState('');
  const [showRaw, setShowRaw] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Editable extracted data
  const [ed, setEd] = useState<ExtractedContractData>({});
  const upd = (patch: Partial<ExtractedContractData>) => setEd(p => ({ ...p, ...patch }));

  // Step 3: map to existing store entities
  const [mappedUnitId, setMappedUnitId] = useState('');
  const [mappedTenantId, setMappedTenantId] = useState('');
  const [mappedLandlordId, setMappedLandlordId] = useState('');

  // ── Drop zone ─────────────────────────────────────────────
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f?.type === 'application/pdf') setFile(f);
    else setError('يرجى رفع ملف PDF فقط');
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f?.type === 'application/pdf') { setFile(f); setError(''); }
    else setError('يرجى رفع ملف PDF فقط');
  };

  // ── Analyze ───────────────────────────────────────────────
  const analyze = async () => {
    if (!file) return;
    setIsAnalyzing(true);
    setError('');
    try {
      const text = await extractTextFromPDF(file);
      setRawText(text);
      if (text === 'PDF_PARSE_FAILED') {
        // Offer manual entry
        setError('تعذّر استخراج النص من الملف تلقائياً. يمكنك إدخال البيانات يدوياً.');
        setEd({});
      } else {
        const parsed = parseEjarContract(text);
        setEd({
          ...parsed,
          contractStartDate: normalizeDate(parsed.contractStartDate),
          contractEndDate: normalizeDate(parsed.contractEndDate),
          versionNumber: parsed.versionNumber || '1.0',
          status: 'active',
        });
        // Auto-match unit
        if (parsed.unitNumber) {
          const match = units.find(u =>
            u.unitNumber?.toLowerCase().includes(parsed.unitNumber!.toLowerCase())
          );
          if (match) { setMappedUnitId(match.id); }
        }
        // Auto-match tenant
        if (parsed.tenantNationalId) {
          const match = users.find(u =>
            u.role === 'tenant' && (u.nationalId === parsed.tenantNationalId || u.name === parsed.tenantName)
          );
          if (match) setMappedTenantId(match.id);
        }
        // Auto-match landlord
        if (parsed.landlordNationalId) {
          const match = users.find(u =>
            u.role === 'owner' && (u.nationalId === parsed.landlordNationalId || u.name === parsed.landlordName)
          );
          if (match) setMappedLandlordId(match.id);
        }
      }
      setStep(2);
    } catch {
      setError('حدث خطأ أثناء تحليل الملف');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // ── Save ─────────────────────────────────────────────────
  const saveContract = () => {
    const unit = units.find(u => u.id === mappedUnitId);
    const prop = unit ? properties.find(p => p.id === unit.propertyId) : null;
    const tenant = users.find(u => u.id === mappedTenantId);
    const landlord = users.find(u => u.id === mappedLandlordId);

    const newContract: Contract = {
      id: generateId(),
      contractNumber: ed.contractNumber || `CNT-EJAR-${Date.now()}`,
      versionNumber: ed.versionNumber || '1.0',
      tenantId: mappedTenantId || generateId(),
      tenantName: tenant?.name || ed.tenantName || '',
      landlordId: mappedLandlordId || generateId(),
      landlordName: landlord?.name || ed.landlordName || '',
      unitId: mappedUnitId || unit?.id || '',
      propertyId: unit?.propertyId || '',
      propertyName: prop?.propertyName || prop?.name || ed.propertyName || '',
      titleDeedNumber: ed.titleDeedNumber || unit?.titleDeedNumber || '',
      contractStartDate: ed.contractStartDate || '',
      contractEndDate: ed.contractEndDate || '',
      status: (ed.status as Contract['status']) || 'active',
      notes: [
        ed.usagePurpose ? `غرض الاستخدام: ${ed.usagePurpose}` : '',
        ed.annualRent ? `الإيجار السنوي: ${ed.annualRent?.toLocaleString()} ر.س` : '',
        ed.paymentFrequency ? `طريقة الدفع: ${ed.paymentFrequency}` : '',
        ed.insuranceAmount ? `مبلغ التأمين: ${ed.insuranceAmount?.toLocaleString()} ر.س` : '',
        ed.ejarContractId ? `رقم عقد إيجار: ${ed.ejarContractId}` : '',
        ed.specialClauses ? `شروط خاصة: ${ed.specialClauses}` : '',
      ].filter(Boolean).join(' | ') || '',
      createdAt: new Date().toISOString(),
    };

    addContract(newContract);
    setStep(3);
    onContractAdded?.();
  };

  // ── Confidence score ──────────────────────────────────────
  const fieldsExtracted = Object.values(ed).filter(v => v !== undefined && v !== '').length;
  const totalFields = 20;
  const confidence = Math.min(100, Math.round((fieldsExtracted / totalFields) * 100));

  const tenants = users.filter(u => u.role === 'tenant');
  const owners = users.filter(u => u.role === 'owner');

  // ─────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl my-4">

        {/* ── Header ── */}
        <div className="bg-gradient-to-l from-gray-900 to-gray-700 rounded-t-2xl p-6 text-white">
          <div className="flex items-start justify-between mb-5">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-400" />
                تحليل عقد إيجار
              </h2>
              <p className="text-white/70 text-sm mt-1">ارفع عقد إيجار PDF من منصة إيجار ليتم استخراج البيانات تلقائياً</p>
            </div>
            <button onClick={onClose} className="text-white/60 hover:text-white text-2xl leading-none">×</button>
          </div>

          {/* Steps */}
          <div className="flex items-center gap-0">
            {[
              { n: 1, label: 'رفع الملف' },
              { n: 2, label: 'مراجعة البيانات' },
              { n: 3, label: 'الحفظ' },
            ].map((s, i) => (
              <div key={s.n} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all
                    ${step === s.n ? 'bg-yellow-400 text-gray-900 shadow-lg scale-110' : step > s.n ? 'bg-green-400 text-white' : 'bg-white/20 text-white/60'}`}>
                    {step > s.n ? <CheckCircle className="w-5 h-5" /> : s.n}
                  </div>
                  <span className={`text-xs mt-1 ${step === s.n ? 'text-yellow-400 font-semibold' : 'text-white/50'}`}>{s.label}</span>
                </div>
                {i < 2 && <div className={`flex-1 h-0.5 -mt-4 ${step > s.n ? 'bg-green-400' : 'bg-white/20'}`} />}
              </div>
            ))}
          </div>
        </div>

        <div className="p-6">

          {/* ─── STEP 1: Upload ─── */}
          {step === 1 && (
            <div className="space-y-5">
              <div
                className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer
                  ${isDragging ? 'border-yellow-400 bg-yellow-50' : file ? 'border-green-400 bg-green-50' : 'border-gray-300 bg-gray-50 hover:border-yellow-400 hover:bg-yellow-50'}`}
                onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}>
                <input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={handleFileSelect} />
                {file ? (
                  <div className="space-y-3">
                    <FileCheck className="w-14 h-14 mx-auto text-green-500" />
                    <p className="font-bold text-green-700 text-lg">{file.name}</p>
                    <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                    <button onClick={e => { e.stopPropagation(); setFile(null); setError(''); }}
                      className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1 mx-auto">
                      <X className="w-4 h-4" /> إزالة الملف
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Upload className="w-14 h-14 mx-auto text-gray-400" />
                    <p className="font-bold text-gray-700 text-lg">اسحب ملف PDF هنا أو انقر للاختيار</p>
                    <p className="text-sm text-gray-400">عقود إيجار من منصة إيجار بصيغة PDF</p>
                  </div>
                )}
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-2 text-sm text-red-700">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800 space-y-1">
                <p className="font-bold flex items-center gap-1"><Sparkles className="w-4 h-4" /> ما الذي يتم استخراجه تلقائياً؟</p>
                <div className="grid grid-cols-2 gap-1 text-xs text-blue-700 mt-2">
                  {['رقم العقد ورقم منصة إيجار', 'بيانات المستأجر والمالك', 'تواريخ بداية ونهاية العقد', 'قيمة الإيجار السنوية والشهرية', 'بيانات الوحدة والعقار', 'مبلغ التأمين وطريقة الدفع', 'رقم الصك ورخصة فال', 'الغرض من الاستخدام والشروط'].map(i => (
                    <span key={i} className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-blue-500" />{i}</span>
                  ))}
                </div>
              </div>

              {/* Manual entry option */}
              <div className="flex items-center gap-3 pt-2">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400">أو</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>
              <button onClick={() => { setEd({}); setStep(2); }}
                className="w-full btn-secondary text-sm flex items-center justify-center gap-2">
                <Clipboard className="w-4 h-4" /> إدخال البيانات يدوياً بدون رفع ملف
              </button>

              <button
                onClick={analyze}
                disabled={!file || isAnalyzing}
                className="w-full btn-primary py-3 text-base font-bold flex items-center justify-center gap-2 disabled:opacity-50">
                {isAnalyzing
                  ? <><Loader2 className="w-5 h-5 animate-spin" /> جاري تحليل العقد...</>
                  : <><Sparkles className="w-5 h-5" /> تحليل العقد واستخراج البيانات</>}
              </button>
            </div>
          )}

          {/* ─── STEP 2: Review ─── */}
          {step === 2 && (
            <div className="space-y-5">
              {/* Confidence */}
              {rawText && rawText !== 'PDF_PARSE_FAILED' && (
                <div className="bg-gradient-to-l from-green-50 to-blue-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-gray-700 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-yellow-500" /> نتيجة التحليل التلقائي
                    </span>
                    <span className={`font-bold text-lg ${confidence >= 70 ? 'text-green-600' : confidence >= 40 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {confidence}% اكتمال
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className={`h-2.5 rounded-full transition-all ${confidence >= 70 ? 'bg-green-500' : confidence >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                      style={{ width: `${confidence}%` }} />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">{fieldsExtracted} حقل مستخرج من أصل {totalFields} — راجع وعدّل البيانات أدناه قبل الحفظ</p>
                  <button onClick={() => setShowRaw(!showRaw)}
                    className="text-xs text-blue-600 flex items-center gap-1 mt-1 hover:underline">
                    {showRaw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    {showRaw ? 'إخفاء' : 'عرض'} النص المستخرج
                  </button>
                  {showRaw && (
                    <pre className="mt-2 text-xs text-gray-600 bg-white border rounded-lg p-3 max-h-40 overflow-y-auto whitespace-pre-wrap">
                      {rawText.slice(0, 2000)}{rawText.length > 2000 ? '...' : ''}
                    </pre>
                  )}
                </div>
              )}

              {/* Edit Fields */}
              <Section title="بيانات العقد" icon={<FileText className="w-4 h-4" />}>
                <FieldRow label="رقم العقد" value={ed.contractNumber ?? ''} onChange={v => upd({ contractNumber: v })} />
                <FieldRow label="رقم العقد على منصة إيجار" value={ed.ejarContractId ?? ''} onChange={v => upd({ ejarContractId: v })} />
                <FieldRow label="تاريخ البداية" value={ed.contractStartDate ?? ''} onChange={v => upd({ contractStartDate: v })} type="date" />
                <FieldRow label="تاريخ الانتهاء" value={ed.contractEndDate ?? ''} onChange={v => upd({ contractEndDate: v })} type="date" />
                <div>
                  <label className="label">حالة العقد</label>
                  <select className="input-field text-sm" value={ed.status ?? 'active'} onChange={e => upd({ status: e.target.value })}>
                    <option value="active">فعّال</option>
                    <option value="pending">معلق</option>
                    <option value="expired">منتهي</option>
                    <option value="terminated">ملغي</option>
                  </select>
                </div>
                <FieldRow label="طريقة الدفع" value={ed.paymentFrequency ?? ''} onChange={v => upd({ paymentFrequency: v })} />
              </Section>

              <Section title="القيم المالية" icon={<DollarSign className="w-4 h-4" />}>
                <div>
                  <label className="label">الإيجار السنوي ر.س</label>
                  <input type="number" className="input-field text-sm" value={ed.annualRent ?? ''}
                    onChange={e => upd({ annualRent: e.target.value ? +e.target.value : undefined })} />
                </div>
                <div>
                  <label className="label">الإيجار الشهري ر.س</label>
                  <input type="number" className="input-field text-sm" value={ed.monthlyRent ?? ''}
                    onChange={e => upd({ monthlyRent: e.target.value ? +e.target.value : undefined })} />
                </div>
                <div>
                  <label className="label">إجمالي قيمة العقد ر.س</label>
                  <input type="number" className="input-field text-sm" value={ed.totalRentAmount ?? ''}
                    onChange={e => upd({ totalRentAmount: e.target.value ? +e.target.value : undefined })} />
                </div>
                <div>
                  <label className="label">مبلغ التأمين ر.س</label>
                  <input type="number" className="input-field text-sm" value={ed.insuranceAmount ?? ''}
                    onChange={e => upd({ insuranceAmount: e.target.value ? +e.target.value : undefined })} />
                </div>
              </Section>

              <Section title="بيانات المستأجر" icon={<User className="w-4 h-4" />}>
                <FieldRow label="اسم المستأجر" value={ed.tenantName ?? ''} onChange={v => upd({ tenantName: v })} />
                <FieldRow label="رقم الهوية" value={ed.tenantNationalId ?? ''} onChange={v => upd({ tenantNationalId: v })} />
                <FieldRow label="رقم الجوال" value={ed.tenantPhone ?? ''} onChange={v => upd({ tenantPhone: v })} />
                <FieldRow label="الجنسية" value={ed.tenantNationality ?? ''} onChange={v => upd({ tenantNationality: v })} />
              </Section>

              <Section title="بيانات المالك" icon={<User className="w-4 h-4" />}>
                <FieldRow label="اسم المالك" value={ed.landlordName ?? ''} onChange={v => upd({ landlordName: v })} />
                <FieldRow label="رقم الهوية" value={ed.landlordNationalId ?? ''} onChange={v => upd({ landlordNationalId: v })} />
                <FieldRow label="رقم الجوال" value={ed.landlordPhone ?? ''} onChange={v => upd({ landlordPhone: v })} />
                <FieldRow label="رقم الآيبان" value={ed.landlordIban ?? ''} onChange={v => upd({ landlordIban: v })} />
              </Section>

              <Section title="بيانات العقار والوحدة" icon={<Building2 className="w-4 h-4" />}>
                <FieldRow label="رقم الوحدة" value={ed.unitNumber ?? ''} onChange={v => upd({ unitNumber: v })} />
                <FieldRow label="نوع الوحدة" value={ed.unitType ?? ''} onChange={v => upd({ unitType: v })} />
                <FieldRow label="المدينة" value={ed.city ?? ''} onChange={v => upd({ city: v })} />
                <FieldRow label="الحي" value={ed.district ?? ''} onChange={v => upd({ district: v })} />
                <div className="sm:col-span-2">
                  <FieldRow label="العنوان" value={ed.address ?? ''} onChange={v => upd({ address: v })} />
                </div>
                <FieldRow label="رقم الصك" value={ed.titleDeedNumber ?? ''} onChange={v => upd({ titleDeedNumber: v })} />
                <div>
                  <label className="label">المساحة م²</label>
                  <input type="number" className="input-field text-sm" value={ed.unitArea ?? ''}
                    onChange={e => upd({ unitArea: e.target.value ? +e.target.value : undefined })} />
                </div>
                <div>
                  <label className="label">عدد الغرف</label>
                  <input type="number" className="input-field text-sm" value={ed.roomsCount ?? ''}
                    onChange={e => upd({ roomsCount: e.target.value ? +e.target.value : undefined })} />
                </div>
                <div>
                  <label className="label">عدد الحمامات</label>
                  <input type="number" className="input-field text-sm" value={ed.bathroomsCount ?? ''}
                    onChange={e => upd({ bathroomsCount: e.target.value ? +e.target.value : undefined })} />
                </div>
                <FieldRow label="الغرض من الاستخدام" value={ed.usagePurpose ?? ''} onChange={v => upd({ usagePurpose: v })} />
              </Section>

              {(ed.brokerName || ed.brokerLicense) && (
                <Section title="بيانات الوسيط" icon={<Hash className="w-4 h-4" />}>
                  <FieldRow label="اسم الوسيط" value={ed.brokerName ?? ''} onChange={v => upd({ brokerName: v })} />
                  <FieldRow label="رخصة فال" value={ed.brokerLicense ?? ''} onChange={v => upd({ brokerLicense: v })} />
                </Section>
              )}

              <div>
                <label className="label">شروط وملاحظات خاصة</label>
                <textarea className="input-field text-sm" rows={3}
                  value={ed.specialClauses ?? ''}
                  onChange={e => upd({ specialClauses: e.target.value })}
                  placeholder="أي شروط أو ملاحظات إضافية..." />
              </div>

              <div className="flex gap-3 pt-2">
                <button className="btn-secondary flex-1 flex items-center justify-center gap-2"
                  onClick={() => setStep(1)}>
                  <ChevronRight className="w-4 h-4" /> رجوع
                </button>
                <button className="btn-primary flex-1 flex items-center justify-center gap-2"
                  onClick={() => setStep(3)}>
                  التالي <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ─── STEP 3: Link & Save ─── */}
          {step === 3 && (
            <div className="space-y-5">
              {/* check if already saved */}
              {contracts.some(c => c.contractNumber === ed.contractNumber) ? (
                <div className="bg-green-50 border border-green-300 rounded-2xl p-6 text-center space-y-3">
                  <CheckCircle className="w-14 h-14 text-green-500 mx-auto" />
                  <h3 className="text-xl font-bold text-green-700">تم حفظ العقد بنجاح!</h3>
                  <p className="text-sm text-gray-600">تم إضافة العقد إلى النظام ويمكنك الآن عرضه في صفحة العقود</p>
                  <button onClick={onClose} className="btn-primary mx-auto">
                    إغلاق والعودة
                  </button>
                </div>
              ) : (
                <>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800">
                    <p className="font-bold mb-2">ربط البيانات بالنظام</p>
                    <p>اختر الوحدة والمستأجر والمالك من النظام إذا كانوا موجودين، أو سيُنشأ سجل جديد تلقائياً.</p>
                  </div>

                  {/* Summary */}
                  <div className="bg-gray-50 rounded-xl p-4 space-y-3 text-sm">
                    <h3 className="font-bold text-gray-700">ملخص العقد المستخرج</h3>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {[
                        ['رقم العقد', ed.contractNumber],
                        ['رقم إيجار', ed.ejarContractId],
                        ['تاريخ البداية', ed.contractStartDate],
                        ['تاريخ الانتهاء', ed.contractEndDate],
                        ['المستأجر', ed.tenantName],
                        ['المالك', ed.landlordName],
                        ['الإيجار السنوي', ed.annualRent ? `${ed.annualRent?.toLocaleString()} ر.س` : undefined],
                        ['الوحدة', ed.unitNumber],
                        ['المدينة', ed.city],
                        ['رقم الصك', ed.titleDeedNumber],
                      ].filter(([, v]) => v).map(([l, v]) => (
                        <div key={l as string} className="bg-white rounded-lg p-2 border">
                          <p className="text-gray-400">{l}</p>
                          <p className="font-semibold text-gray-700">{v}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Link to existing */}
                  <div className="space-y-3">
                    <div>
                      <label className="label">ربط بوحدة موجودة في النظام</label>
                      <select className="input-field text-sm" value={mappedUnitId} onChange={e => setMappedUnitId(e.target.value)}>
                        <option value="">— إنشاء وحدة جديدة تلقائياً —</option>
                        {units.map(u => {
                          const p = properties.find(x => x.id === u.propertyId);
                          return <option key={u.id} value={u.id}>{u.unitNumber} — {p?.propertyName ?? p?.name ?? 'غير محدد'}</option>;
                        })}
                      </select>
                    </div>
                    <div>
                      <label className="label">ربط بمستأجر موجود في النظام</label>
                      <select className="input-field text-sm" value={mappedTenantId} onChange={e => setMappedTenantId(e.target.value)}>
                        <option value="">— إنشاء مستأجر جديد تلقائياً ({ed.tenantName || 'غير محدد'}) —</option>
                        {tenants.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="label">ربط بمالك موجود في النظام</label>
                      <select className="input-field text-sm" value={mappedLandlordId} onChange={e => setMappedLandlordId(e.target.value)}>
                        <option value="">— إنشاء مالك جديد تلقائياً ({ed.landlordName || 'غير محدد'}) —</option>
                        {owners.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button className="btn-secondary flex-1 flex items-center justify-center gap-2"
                      onClick={() => setStep(2)}>
                      <ChevronRight className="w-4 h-4" /> رجوع للمراجعة
                    </button>
                    <button className="btn-primary flex-1 flex items-center justify-center gap-2"
                      onClick={saveContract}>
                      <Save className="w-4 h-4" /> حفظ العقد في النظام
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
