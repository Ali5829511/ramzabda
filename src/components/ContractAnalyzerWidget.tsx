import { useState, useRef, useCallback } from 'react';
import { Upload, FileText, Loader2, CheckCircle, AlertCircle, X, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';

export interface ExtractedContractData {
  contractNumber?: string;
  ejarContractId?: string;
  versionNumber?: string;
  contractStartDate?: string;
  contractEndDate?: string;
  annualRent?: number;
  monthlyRent?: number;
  paymentFrequency?: string;
  ejarDocumentationFees?: number;
  securityDeposit?: number;
  brokerageCommission?: number;
  brokerageAgreementNumber?: string;
  tenantName?: string;
  tenantNationalId?: string;
  tenantPhone?: string;
  tenantNationality?: string;
  landlordName?: string;
  landlordNationalId?: string;
  landlordPhone?: string;
  landlordIban?: string;
  propertyName?: string;
  unitNumber?: string;
  unitType?: string;
  city?: string;
  district?: string;
  address?: string;
  titleDeedNumber?: string;
  unitArea?: number;
  roomsCount?: number;
  usagePurpose?: string;
  brokerName?: string;
  brokerLicense?: string;
  taxNumber?: string;
  notes?: string;
  // Brokerage-specific
  sellerName?: string;
  buyerName?: string;
  salePrice?: number;
  commissionRate?: string;
  propertyType?: string;
}

async function extractTextFromFile(file: File): Promise<string> {
  if (file.type === 'application/pdf') {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const { getDocument, GlobalWorkerOptions } = await import('pdfjs-dist');
          GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
          const typedArray = new Uint8Array(e.target?.result as ArrayBuffer);
          const pdf = await getDocument({ data: typedArray }).promise;
          let fullText = '';
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            fullText += content.items.filter(item => 'str' in item).map(item => (item as { str: string }).str).join(' ') + '\n';
          }
          resolve(fullText || 'EMPTY_PDF');
        } catch {
          resolve('PDF_PARSE_FAILED');
        }
      };
      reader.readAsArrayBuffer(file);
    });
  }
  // For images: return filename-based mock (OCR not available in browser without API)
  return `IMAGE_FILE:${file.name}`;
}

function parseContract(text: string): ExtractedContractData {
  if (!text || text === 'PDF_PARSE_FAILED' || text === 'EMPTY_PDF') return {};

  const data: ExtractedContractData = {};

  const find = (patterns: RegExp[]): string | undefined => {
    for (const p of patterns) {
      const m = text.match(p);
      if (m?.[1]?.trim()) return m[1].trim();
    }
  };
  const findNum = (patterns: RegExp[]): number | undefined => {
    const v = find(patterns);
    if (!v) return undefined;
    const n = parseFloat(v.replace(/,/g, '').replace(/[^\d.]/g, ''));
    return isNaN(n) ? undefined : n;
  };
  const normalizeDate = (d?: string): string | undefined => {
    if (!d) return undefined;
    const parts = d.split(/[/\-.]/);
    if (parts.length === 3) {
      const [a, b, c] = parts;
      if (c.length === 4) return `${c}-${b.padStart(2,'0')}-${a.padStart(2,'0')}`;
      if (a.length === 4) return `${a}-${b.padStart(2,'0')}-${c.padStart(2,'0')}`;
    }
    return d;
  };

  data.contractNumber = find([
    /رقم\s*العقد[:\s]+([A-Z0-9\-/]+)/,
    /Contract\s*(?:No|Number)[.:\s]+([A-Z0-9-]+)/i,
    /عقد\s*رقم[:\s]+([A-Z0-9\-/]+)/,
    /(\d{4}[-/]\d{5,})/,
  ]);

  data.ejarContractId = find([
    /رقم\s*الطلب[:\s]+([A-Z0-9-]+)/,
    /Ejar\s*(?:ID|Contract)[:\s]+([A-Z0-9-]+)/i,
    /منصة\s*إيجار[:\s]+([A-Z0-9-]+)/,
  ]);

  data.versionNumber = find([
    /(?:رقم\s*)?(?:نسخة|الإصدار|الإصدار\s*رقم)[:\s]+(\d+)/,
    /Version[:\s]+(\d+)/i,
  ]);

  data.contractStartDate = normalizeDate(find([
    /تاريخ\s*(?:بداية|البداية|بدء|البدء)\s*العقد[:\s]+(\d{1,2}[/\-.]\d{1,2}[/\-.]\d{4})/,
    /تاريخ\s*البدء[:\s]+(\d{1,2}[/\-.]\d{1,2}[/\-.]\d{4})/,
    /من\s*تاريخ[:\s]+(\d{1,2}[/\-.]\d{1,2}[/\-.]\d{4})/,
    /Start\s*Date[:\s]+(\d{1,2}[/\-.]\d{1,2}[/\-.]\d{4})/i,
  ]));

  data.contractEndDate = normalizeDate(find([
    /تاريخ\s*(?:نهاية|الانتهاء|النهاية|انتهاء)\s*العقد[:\s]+(\d{1,2}[/\-.]\d{1,2}[/\-.]\d{4})/,
    /تاريخ\s*الانتهاء[:\s]+(\d{1,2}[/\-.]\d{1,2}[/\-.]\d{4})/,
    /إلى\s*تاريخ[:\s]+(\d{1,2}[/\-.]\d{1,2}[/\-.]\d{4})/,
    /End\s*Date[:\s]+(\d{1,2}[/\-.]\d{1,2}[/\-.]\d{4})/i,
  ]));

  data.annualRent = findNum([
    /الإيجار\s*السنوي[:\s]+([\d,]+(?:\.\d+)?)/,
    /قيمة\s*الإيجار\s*السنوية[:\s]+([\d,]+(?:\.\d+)?)/,
    /Annual\s*Rent[:\s]+([\d,]+(?:\.\d+)?)/i,
    /مبلغ\s*الإيجار[:\s]+([\d,]+(?:\.\d+)?)/,
  ]);

  data.monthlyRent = findNum([
    /الإيجار\s*الشهري[:\s]+([\d,]+(?:\.\d+)?)/,
    /Monthly\s*Rent[:\s]+([\d,]+(?:\.\d+)?)/i,
  ]);

  data.ejarDocumentationFees = findNum([
    /رسوم\s*التوثيق[:\s]+([\d,]+(?:\.\d+)?)/,
    /Documentation\s*Fees[:\s]+([\d,]+(?:\.\d+)?)/i,
    /رسوم\s*الإيجار[:\s]+([\d,]+(?:\.\d+)?)/,
  ]);

  data.securityDeposit = findNum([
    /(?:مبلغ|قيمة)\s*(?:التأمين|الضمان)[:\s]+([\d,]+(?:\.\d+)?)/,
    /Security\s*Deposit[:\s]+([\d,]+(?:\.\d+)?)/i,
    /ضمان[:\s]+([\d,]+(?:\.\d+)?)/,
    /Deposit[:\s]+([\d,]+(?:\.\d+)?)/i,
  ]);

  data.brokerageCommission = findNum([
    /(?:عمولة|رسوم)\s*الوساطة[:\s]+([\d,]+(?:\.\d+)?)/,
    /Commission[:\s]+([\d,]+(?:\.\d+)?)/i,
    /رسوم\s*(?:السمسرة|الوسيط)[:\s]+([\d,]+(?:\.\d+)?)/,
  ]);

  data.brokerageAgreementNumber = find([
    /رقم\s*(?:اتفاقية|عقد)\s*الوساطة[:\s]+([A-Z0-9\-/]+)/,
    /Brokerage\s*(?:Agreement|Contract)[:\s]+([A-Z0-9-]+)/i,
  ]);

  data.paymentFrequency = find([
    /(?:دفعة|طريقة\s*الدفع|الدفع)[:\s]+(شهري|سنوي|ربع\s*سنوي|نصف\s*سنوي|فصلي)/,
    /Payment\s*(?:Frequency|Schedule)[:\s]+(\w+)/i,
  ]);

  data.tenantName = find([
    /اسم\s*المستأجر[:\s]+([^\n\r،,\-—]+)/,
    /الطرف\s*الثاني[:\s]+([^\n\r،\-—]+)/,
    /Tenant\s*Name[:\s]+([^\n\r,]+)/i,
    /المستأجر[:\s]+([^\n\r،,—-]+)/,
  ])?.replace(/\s+/g, ' ');

  data.tenantNationalId = find([
    /هوية\s*المستأجر[:\s]+(\d{10})/,
    /رقم\s*(?:هوية|الهوية)\s*المستأجر[:\s]+(\d{10})/,
    /Tenant\s*(?:ID|Identity)[:\s]+(\d{10})/i,
    /\b(1\d{9})\b/,
  ]);

  data.tenantPhone = find([
    /جوال\s*المستأجر[:\s]+([\d+\s-]{10,})/,
    /هاتف\s*المستأجر[:\s]+([\d+\s-]{10,})/,
    /\b(05\d{8})\b/,
  ]);

  data.tenantNationality = find([
    /جنسية\s*المستأجر[:\s]+([^\n\r،,]+)/,
    /Nationality[:\s]+([^\n\r,]+)/i,
  ]);

  data.landlordName = find([
    /اسم\s*(?:المالك|المؤجر)[:\s]+([^\n\r،,\-—]+)/,
    /الطرف\s*الأول[:\s]+([^\n\r،\-—]+)/,
    /Landlord\s*Name[:\s]+([^\n\r,]+)/i,
    /المالك[:\s]+([^\n\r،,—-]+)/,
  ])?.replace(/\s+/g, ' ');

  data.landlordNationalId = find([
    /هوية\s*(?:المالك|المؤجر)[:\s]+(\d{10})/,
    /رقم\s*هوية\s*المالك[:\s]+(\d{10})/,
  ]);

  data.landlordPhone = find([
    /جوال\s*(?:المالك|المؤجر)[:\s]+([\d+\s-]{10,})/,
    /هاتف\s*(?:المالك|المؤجر)[:\s]+([\d+\s-]{10,})/,
  ]);

  data.landlordIban = find([
    /(?:رقم\s*)?الآيبان[:\s]+(SA\d{22})/i,
    /IBAN[:\s]+(SA\d{22})/i,
    /\b(SA\d{22})\b/,
  ]);

  data.titleDeedNumber = find([
    /رقم\s*(?:الصك|وثيقة\s*الملكية)[:\s]+([A-Z0-9\-/]+)/,
    /Deed\s*Number[:\s]+([A-Z0-9-]+)/i,
    /صك\s*رقم[:\s]+([A-Z0-9\-/]+)/,
  ]);

  data.unitNumber = find([
    /رقم\s*الوحدة[:\s]+([A-Z0-9\-/]+)/,
    /Unit\s*(?:No|Number)[:\s]+([A-Z0-9-]+)/i,
    /الشقة\s*رقم[:\s]+(\d+)/,
  ]);

  data.unitArea = findNum([
    /مساحة\s*الوحدة[:\s]+([\d,]+(?:\.\d+)?)/,
    /Unit\s*Area[:\s]+([\d,]+(?:\.\d+)?)/i,
    /المساحة[:\s]+([\d,]+(?:\.\d+)?)\s*م/,
  ]);

  data.city = find([
    /(?:المدينة|مدينة)[:\s]+([^\n\r،,]+)/,
    /City[:\s]+([^\n\r,]+)/i,
  ])?.trim();

  data.district = find([
    /(?:الحي|حي)[:\s]+([^\n\r،,]+)/,
    /District[:\s]+([^\n\r,]+)/i,
  ])?.trim();

  data.address = find([
    /(?:العنوان|عنوان\s*الوحدة)[:\s]+([^\n\r،]+)/,
    /Address[:\s]+([^\n\r,]+)/i,
  ])?.trim();

  data.usagePurpose = find([
    /(?:غرض|الغرض)\s*(?:الاستخدام|الاستعمال)[:\s]+([^\n\r،,]+)/,
    /Purpose[:\s]+([^\n\r,]+)/i,
    /الاستخدام[:\s]+([^\n\r،]+)/,
  ]);

  data.brokerName = find([
    /اسم\s*(?:الوسيط|الوكيل)[:\s]+([^\n\r،,]+)/,
    /Broker\s*Name[:\s]+([^\n\r,]+)/i,
  ])?.replace(/\s+/g, ' ');

  data.brokerLicense = find([
    /(?:رقم\s*)?رخصة\s*الوسيط[:\s]+([A-Z0-9\-/]+)/,
    /Broker\s*License[:\s]+([A-Z0-9-]+)/i,
  ]);

  // Brokerage specific
  data.sellerName = find([
    /اسم\s*البائع[:\s]+([^\n\r،,]+)/,
    /Seller[:\s]+([^\n\r,]+)/i,
  ]);
  data.buyerName = find([
    /اسم\s*المشتري[:\s]+([^\n\r،,]+)/,
    /Buyer[:\s]+([^\n\r,]+)/i,
  ]);
  data.salePrice = findNum([
    /سعر\s*(?:البيع|الصفقة)[:\s]+([\d,]+(?:\.\d+)?)/,
    /Sale\s*Price[:\s]+([\d,]+(?:\.\d+)?)/i,
  ]);
  data.commissionRate = find([
    /(?:نسبة|معدل)\s*العمولة[:\s]+([\d.]+\s*%)/,
    /Commission\s*Rate[:\s]+([\d.]+\s*%)/i,
  ]);

  return data;
}

interface Props {
  onExtracted: (data: ExtractedContractData) => void;
  mode?: 'rental' | 'brokerage';
}

type Status = 'idle' | 'reading' | 'parsing' | 'done' | 'error' | 'image';

export function ContractAnalyzerWidget({ onExtracted, mode = 'rental' }: Props) {
  const [status, setStatus] = useState<Status>('idle');
  const [fileName, setFileName] = useState('');
  const [extracted, setExtracted] = useState<ExtractedContractData | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState('');
  const dropRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(async (file: File) => {
    setFileName(file.name);
    setExtracted(null);
    setError('');
    setStatus('reading');

    const text = await extractTextFromFile(file);

    if (text === 'PDF_PARSE_FAILED') {
      setStatus('error');
      setError('تعذّر قراءة ملف PDF. تأكد أن الملف غير محمي بكلمة مرور.');
      return;
    }

    if (text.startsWith('IMAGE_FILE:')) {
      setStatus('image');
      setError('الصور لا تدعم التحليل التلقائي — يرجى إدخال البيانات يدوياً، أو استخدم ملف PDF.');
      return;
    }

    setStatus('parsing');
    await new Promise(r => setTimeout(r, 600));

    const data = parseContract(text);
    const count = Object.values(data).filter(Boolean).length;

    if (count === 0) {
      setStatus('error');
      setError('لم يُعثر على بيانات قابلة للاستخراج. الملف قد يكون ممسوحاً ضوئياً (صورة داخل PDF).');
      return;
    }

    setExtracted(data);
    setStatus('done');
    setExpanded(true);
    onExtracted(data);
  }, [onExtracted]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = '';
  };

  const fieldCount = extracted ? Object.values(extracted).filter(Boolean).length : 0;

  return (
    <div className="border-2 border-dashed border-yellow-300 rounded-xl bg-yellow-50/50" dir="rtl">
      {/* Header */}
      <div className="flex items-center gap-3 p-3">
        <div className="w-9 h-9 bg-yellow-100 rounded-xl flex items-center justify-center shrink-0">
          <Sparkles className="w-4 h-4 text-yellow-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-800">
            {mode === 'brokerage' ? 'رفع عقد وساطة وتحليله' : 'رفع عقد إيجار وتحليله'}
          </p>
          <p className="text-xs text-gray-500">PDF — سيتم استخراج البيانات وتعبئة النموذج تلقائياً</p>
        </div>

        {status === 'idle' && (
          <button type="button" onClick={() => inputRef.current?.click()}
            className="btn-secondary text-sm flex items-center gap-2 shrink-0">
            <Upload className="w-4 h-4" /> رفع ملف
          </button>
        )}
        {(status === 'reading' || status === 'parsing') && (
          <div className="flex items-center gap-2 text-yellow-600 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" />
            {status === 'reading' ? 'جاري القراءة...' : 'جاري التحليل...'}
          </div>
        )}
        {status === 'done' && (
          <div className="flex items-center gap-2">
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> {fieldCount} حقل مُستخرج
            </span>
            <button type="button" onClick={() => setExpanded(!expanded)} className="text-gray-400 hover:text-gray-600">
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            <button type="button" onClick={() => { setStatus('idle'); setExtracted(null); setFileName(''); }}
              className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
          </div>
        )}
        {(status === 'error' || status === 'image') && (
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <button type="button" onClick={() => { setStatus('idle'); setFileName(''); }}
              className="text-xs text-blue-600 hover:underline">إعادة</button>
          </div>
        )}
      </div>

      {/* Drop zone when idle */}
      {status === 'idle' && (
        <div ref={dropRef}
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
          className="mx-3 mb-3 border border-dashed border-yellow-200 rounded-xl p-4 text-center cursor-pointer hover:bg-yellow-50 transition-colors"
          onClick={() => inputRef.current?.click()}>
          <Upload className="w-6 h-6 text-yellow-400 mx-auto mb-1" />
          <p className="text-xs text-gray-500">اسحب الملف هنا أو انقر للرفع</p>
          <p className="text-xs text-gray-400 mt-0.5">PDF (يُفضَّل)</p>
        </div>
      )}

      {/* File name while processing */}
      {(status === 'reading' || status === 'parsing') && (
        <div className="mx-3 mb-3 flex items-center gap-2 p-3 bg-yellow-100 rounded-xl">
          <FileText className="w-4 h-4 text-yellow-600 shrink-0" />
          <p className="text-sm text-yellow-800 truncate">{fileName}</p>
        </div>
      )}

      {/* Error */}
      {(status === 'error' || status === 'image') && (
        <div className="mx-3 mb-3 p-3 bg-red-50 rounded-xl">
          <p className="text-sm text-red-600 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />{error}
          </p>
        </div>
      )}

      {/* Extracted preview */}
      {status === 'done' && expanded && extracted && (
        <div className="mx-3 mb-3 space-y-1">
          <p className="text-xs font-bold text-gray-500 mb-2 flex items-center gap-2">
            <CheckCircle className="w-3 h-3 text-green-500" />
            البيانات المُستخرجة — تم تعبئة النموذج تلقائياً
          </p>
          <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto">
            {Object.entries(extracted).filter(([, v]) => v !== undefined && v !== null && v !== '').map(([k, v]) => (
              <div key={k} className="bg-white rounded-lg px-2.5 py-1.5 border border-gray-100">
                <p className="text-xs text-gray-400">{FIELD_LABELS[k] || k}</p>
                <p className="text-xs font-semibold text-gray-800 truncate">{String(v)}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-1">راجع الحقول أدناه وعدّلها إن لزم قبل الحفظ</p>
        </div>
      )}

      <input ref={inputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={handleFile} />
    </div>
  );
}

const FIELD_LABELS: Record<string, string> = {
  contractNumber: 'رقم العقد',
  ejarContractId: 'رقم إيجار',
  versionNumber: 'رقم النسخة',
  contractStartDate: 'تاريخ البداية',
  contractEndDate: 'تاريخ الانتهاء',
  annualRent: 'الإيجار السنوي',
  monthlyRent: 'الإيجار الشهري',
  paymentFrequency: 'دورية الدفع',
  ejarDocumentationFees: 'رسوم التوثيق',
  securityDeposit: 'مبلغ الضمان',
  brokerageCommission: 'عمولة الوساطة',
  brokerageAgreementNumber: 'رقم اتفاقية الوساطة',
  tenantName: 'اسم المستأجر',
  tenantNationalId: 'هوية المستأجر',
  tenantPhone: 'جوال المستأجر',
  tenantNationality: 'جنسية المستأجر',
  landlordName: 'اسم المالك',
  landlordNationalId: 'هوية المالك',
  landlordPhone: 'جوال المالك',
  landlordIban: 'آيبان المالك',
  unitNumber: 'رقم الوحدة',
  unitArea: 'مساحة الوحدة م²',
  city: 'المدينة',
  district: 'الحي',
  address: 'العنوان',
  titleDeedNumber: 'رقم الصك',
  usagePurpose: 'غرض الاستخدام',
  brokerName: 'اسم الوسيط',
  brokerLicense: 'رخصة الوسيط',
  sellerName: 'البائع',
  buyerName: 'المشتري',
  salePrice: 'سعر البيع',
  commissionRate: 'نسبة العمولة',
};
