import { useState, useRef, useCallback } from 'react';
import { useStore, generateId } from '../../data/store';
import type { AppState } from '../../data/store';
import type { Property, Unit, Contract, Payment, Customer, MaintenanceRequest, User } from '../../types';
import {
  Upload, FileSpreadsheet, CheckCircle, AlertCircle, Loader2,
  Building2, Home, FileText, DollarSign, Wrench, Users, UserCheck,
  Download, RefreshCw, ChevronDown, ChevronUp,
  AlertTriangle, X, Plus, Table2, ArrowRight, Info
} from 'lucide-react';
import * as XLSX from 'xlsx';

// ─── Import types config ──────────────────────────────────────
interface ImportTypeConfig {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  description: string;
  columns: { key: string; label: string; required?: boolean; type?: 'text' | 'number' | 'date' | 'select'; options?: string[] }[];
  sampleData: Record<string, string | number>[];
  storeAction: string;
}

const IMPORT_TYPES: ImportTypeConfig[] = [
  {
    id: 'properties',
    label: 'العقارات',
    icon: <Building2 className="w-5 h-5" />,
    color: 'bg-blue-100 text-blue-700',
    description: 'استيراد بيانات العقارات والأملاك',
    columns: [
      { key: 'propertyName', label: 'اسم العقار', required: true },
      { key: 'titleDeedNumber', label: 'رقم وثيقة الملكية', required: true },
      { key: 'propertyType', label: 'نوع العقار (residential/commercial/villa/building)', type: 'text' },
      { key: 'city', label: 'المدينة', required: true },
      { key: 'region', label: 'المنطقة' },
      { key: 'district', label: 'الحي' },
      { key: 'address', label: 'العنوان' },
      { key: 'totalUnits', label: 'عدد الوحدات', type: 'number' },
      { key: 'floors', label: 'عدد الطوابق', type: 'number' },
      { key: 'ownerName', label: 'اسم المالك' },
      { key: 'ownerIdentity', label: 'رقم هوية المالك' },
      { key: 'deedArea', label: 'مساحة الصك م²', type: 'number' },
    ],
    sampleData: [
      { propertyName: 'عمارة الياسمين', titleDeedNumber: '1234567890', propertyType: 'building', city: 'الرياض', region: 'منطقة الرياض', district: 'العليا', totalUnits: 12, floors: 4, ownerName: 'محمد أحمد', deedArea: 800 },
      { propertyName: 'فيلا النخيل', titleDeedNumber: '0987654321', propertyType: 'villa', city: 'جدة', region: 'منطقة مكة', district: 'الروضة', totalUnits: 1, floors: 2, ownerName: 'سالم علي', deedArea: 450 },
    ],
    storeAction: 'addProperty',
  },
  {
    id: 'units',
    label: 'الوحدات',
    icon: <Home className="w-5 h-5" />,
    color: 'bg-green-100 text-green-700',
    description: 'استيراد بيانات الوحدات العقارية',
    columns: [
      { key: 'unitNumber', label: 'رقم الوحدة', required: true },
      { key: 'titleDeedNumber', label: 'رقم وثيقة ملكية العقار', required: true },
      { key: 'unitType', label: 'نوع الوحدة (شقة/محل/مكتب...)', required: true },
      { key: 'unitStatus', label: 'الحالة (available/rented/reserved/maintenance)' },
      { key: 'unitArea', label: 'المساحة م²', type: 'number' },
      { key: 'rentPrice', label: 'سعر الإيجار ر.س', type: 'number' },
      { key: 'bedrooms', label: 'غرف النوم', type: 'number' },
      { key: 'bathrooms', label: 'دورات المياه', type: 'number' },
      { key: 'floor', label: 'الطابق', type: 'number' },
      { key: 'city', label: 'المدينة', required: true },
      { key: 'furnishedStatus', label: 'التأثيث (furnished/unfurnished/semi-furnished)' },
    ],
    sampleData: [
      { unitNumber: '101', titleDeedNumber: '1234567890', unitType: 'شقة', unitStatus: 'available', unitArea: 120, rentPrice: 30000, bedrooms: 3, bathrooms: 2, floor: 1, city: 'الرياض' },
      { unitNumber: '102', titleDeedNumber: '1234567890', unitType: 'شقة', unitStatus: 'rented', unitArea: 95, rentPrice: 25000, bedrooms: 2, bathrooms: 1, floor: 1, city: 'الرياض' },
    ],
    storeAction: 'addUnit',
  },
  {
    id: 'contracts',
    label: 'العقود',
    icon: <FileText className="w-5 h-5" />,
    color: 'bg-yellow-100 text-yellow-800',
    description: 'استيراد عقود الإيجار',
    columns: [
      { key: 'contractNumber', label: 'رقم العقد', required: true },
      { key: 'titleDeedNumber', label: 'رقم وثيقة الملكية', required: true },
      { key: 'unitNumber', label: 'رقم الوحدة' },
      { key: 'tenantName', label: 'اسم المستأجر', required: true },
      { key: 'tenantPhone', label: 'جوال المستأجر' },
      { key: 'tenantNationalId', label: 'هوية المستأجر' },
      { key: 'landlordName', label: 'اسم المالك' },
      { key: 'contractStartDate', label: 'تاريخ البداية (YYYY-MM-DD)', required: true, type: 'date' },
      { key: 'contractEndDate', label: 'تاريخ الانتهاء (YYYY-MM-DD)', required: true, type: 'date' },
      { key: 'annualRent', label: 'الإيجار السنوي ر.س', type: 'number' },
      { key: 'status', label: 'الحالة (active/expired/terminated/pending)' },
    ],
    sampleData: [
      { contractNumber: 'CNT-2025-001', titleDeedNumber: '1234567890', unitNumber: '101', tenantName: 'أحمد خالد', tenantPhone: '0501234567', contractStartDate: '2025-01-01', contractEndDate: '2026-01-01', annualRent: 30000, status: 'active' },
    ],
    storeAction: 'addContract',
  },
  {
    id: 'payments',
    label: 'الدفعات المالية',
    icon: <DollarSign className="w-5 h-5" />,
    color: 'bg-purple-100 text-purple-700',
    description: 'استيراد سجلات الدفعات المالية',
    columns: [
      { key: 'paymentNumber', label: 'رقم الدفعة', required: true },
      { key: 'contractNumber', label: 'رقم العقد', required: true },
      { key: 'paymentAmount', label: 'مبلغ الدفعة ر.س', required: true, type: 'number' },
      { key: 'paymentDate', label: 'تاريخ الدفع (YYYY-MM-DD)', required: true, type: 'date' },
      { key: 'paymentMethod', label: 'طريقة الدفع (cash/bank_transfer/cheque/online)' },
      { key: 'paymentStatus', label: 'الحالة (completed/pending/failed)' },
      { key: 'referenceNumber', label: 'رقم المرجع/الإيصال' },
      { key: 'bankName', label: 'اسم البنك' },
      { key: 'notes', label: 'ملاحظات' },
    ],
    sampleData: [
      { paymentNumber: 'PAY-2025-001', contractNumber: 'CNT-2025-001', paymentAmount: 7500, paymentDate: '2025-01-15', paymentMethod: 'bank_transfer', paymentStatus: 'completed', referenceNumber: 'REF123456' },
    ],
    storeAction: 'addPayment',
  },
  {
    id: 'maintenance',
    label: 'طلبات الصيانة',
    icon: <Wrench className="w-5 h-5" />,
    color: 'bg-orange-100 text-orange-700',
    description: 'استيراد بلاغات الصيانة',
    columns: [
      { key: 'title', label: 'عنوان البلاغ', required: true },
      { key: 'description', label: 'وصف المشكلة', required: true },
      { key: 'category', label: 'الفئة (plumbing/electrical/ac/painting/other)', required: true },
      { key: 'priority', label: 'الأولوية (low/medium/high/urgent)' },
      { key: 'status', label: 'الحالة (new/assigned/in_progress/completed)' },
      { key: 'unitId', label: 'رقم الوحدة' },
      { key: 'propertyName', label: 'اسم العقار' },
      { key: 'tenantName', label: 'اسم المستأجر' },
      { key: 'createdAt', label: 'تاريخ البلاغ (YYYY-MM-DD)', type: 'date' },
      { key: 'estimatedCost', label: 'التكلفة التقديرية ر.س', type: 'number' },
    ],
    sampleData: [
      { title: 'تسرب مياه في الحمام', description: 'يوجد تسرب مياه من صنبور الحمام', category: 'plumbing', priority: 'high', status: 'new', propertyName: 'عمارة الياسمين', tenantName: 'أحمد خالد' },
    ],
    storeAction: 'addMaintenanceRequest',
  },
  {
    id: 'customers',
    label: 'العملاء',
    icon: <Users className="w-5 h-5" />,
    color: 'bg-pink-100 text-pink-700',
    description: 'استيراد قائمة العملاء والمستأجرين المحتملين',
    columns: [
      { key: 'name', label: 'الاسم الكامل', required: true },
      { key: 'phone', label: 'رقم الجوال', required: true },
      { key: 'email', label: 'البريد الإلكتروني' },
      { key: 'nationalId', label: 'رقم الهوية' },
      { key: 'type', label: 'النوع (tenant/owner/investor/broker)' },
      { key: 'city', label: 'المدينة' },
      { key: 'nationality', label: 'الجنسية' },
      { key: 'propertyInterest', label: 'اهتمامات العميل' },
      { key: 'source', label: 'مصدر العميل (phone/whatsapp/website/referral)' },
      { key: 'notes', label: 'ملاحظات' },
    ],
    sampleData: [
      { name: 'فيصل محمد', phone: '0551234567', email: 'faisal@email.com', nationalId: '1098765432', type: 'tenant', city: 'الرياض', nationality: 'سعودي', source: 'phone' },
    ],
    storeAction: 'addCustomer',
  },
  {
    id: 'users',
    label: 'المستخدمون',
    icon: <UserCheck className="w-5 h-5" />,
    color: 'bg-indigo-100 text-indigo-700',
    description: 'استيراد بيانات المستخدمين والموظفين',
    columns: [
      { key: 'name', label: 'الاسم الكامل', required: true },
      { key: 'email', label: 'البريد الإلكتروني', required: true },
      { key: 'phone', label: 'رقم الجوال' },
      { key: 'role', label: 'الدور (admin/employee/owner/tenant/technician/broker)', required: true },
      { key: 'password', label: 'كلمة المرور (اختياري - ستُنشأ افتراضية)' },
    ],
    sampleData: [
      { name: 'خالد العمري', email: 'khalid@ramzabdae.com', phone: '0561234567', role: 'employee' },
    ],
    storeAction: 'addUser',
  },
];

// ─── Helpers ──────────────────────────────────────────────────
function normalizeDate(v: unknown): string {
  if (!v) return new Date().toISOString().slice(0, 10);
  const s = String(v).trim();
  // Excel serial number
  if (/^\d{4,5}$/.test(s)) {
    const d = XLSX.SSF.parse_date_code(Number(s));
    if (d) return `${d.y}-${String(d.m).padStart(2, '0')}-${String(d.d).padStart(2, '0')}`;
  }
  // dd/mm/yyyy
  const m1 = s.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})$/);
  if (m1) return `${m1[3]}-${m1[2].padStart(2, '0')}-${m1[1].padStart(2, '0')}`;
  // already ISO
  return s.slice(0, 10) || new Date().toISOString().slice(0, 10);
}

function safeNum(v: unknown): number {
  const n = parseFloat(String(v).replace(/,/g, ''));
  return isNaN(n) ? 0 : n;
}

function str(v: unknown): string {
  return v === undefined || v === null ? '' : String(v).trim();
}

// ─── Row mapper ───────────────────────────────────────────────
function mapRow(typeId: string, row: Record<string, unknown>, store: AppState) {
  const now = new Date().toISOString();
  const id = generateId();

  switch (typeId) {
    case 'properties': {
      const prop: Property = {
        id,
        propertyName: str(row.propertyName) || str(row['اسم العقار']),
        titleDeedNumber: str(row.titleDeedNumber) || str(row['رقم وثيقة الملكية']),
        titleDeedType: str(row.titleDeedType) || str(row['نوع وثيقة الملكية']) || 'صك',
        ownerId: store.users.find(u => u.name === str(row.ownerName))?.id || '',
        propertyType: (str(row.propertyType) || 'building') as Property['propertyType'],
        propertyUsage: str(row.propertyUsage) || str(row['الاستخدام']) || 'سكني',
        propertyFacility: str(row.propertyFacility) || '',
        totalUnits: safeNum(row.totalUnits || row['عدد الوحدات']),
        totalContracts: safeNum(row.totalContracts),
        reservedUnits: safeNum(row.reservedUnits),
        rentedUnits: safeNum(row.rentedUnits),
        availableUnits: safeNum(row.availableUnits),
        totalDocumentationFees: safeNum(row.totalDocumentationFees),
        totalContractValue: safeNum(row.totalContractValue),
        totalCommission: safeNum(row.totalCommission),
        region: str(row.region) || str(row['المنطقة']) || '',
        city: str(row.city) || str(row['المدينة']),
        district: str(row.district) || str(row['الحي']) || undefined,
        address: str(row.address) || str(row['العنوان']) || undefined,
        floors: row.floors ? safeNum(row.floors) : undefined,
        elevators: row.elevators ? safeNum(row.elevators) : undefined,
        parkingSpots: row.parkingSpots ? safeNum(row.parkingSpots) : undefined,
        deedArea: row.deedArea ? safeNum(row.deedArea) : undefined,
        ownerName: str(row.ownerName) || str(row['اسم المالك']) || undefined,
        ownerIdentity: str(row.ownerIdentity) || str(row['رقم هوية المالك']) || undefined,
        createdAt: now,
        isActive: true,
      };
      return prop;
    }
    case 'units': {
      const tdNum = str(row.titleDeedNumber) || str(row['رقم وثيقة الملكية']);
      const prop = store.properties.find(p => p.titleDeedNumber === tdNum);
      const unit: Unit = {
        id,
        propertyId: prop?.id || '',
        titleDeedNumber: tdNum,
        unitNumber: str(row.unitNumber) || str(row['رقم الوحدة']),
        unitStatus: (str(row.unitStatus) || 'available') as Unit['unitStatus'],
        unitType: str(row.unitType) || str(row['نوع الوحدة']) || 'شقة',
        unitArea: safeNum(row.unitArea || row['المساحة']),
        unitServices: str(row.unitServices) || '',
        furnishedStatus: (str(row.furnishedStatus) || 'unfurnished') as Unit['furnishedStatus'],
        unitFacilities: str(row.unitFacilities) || '',
        rentPrice: row.rentPrice ? safeNum(row.rentPrice) : undefined,
        salePrice: row.salePrice ? safeNum(row.salePrice) : undefined,
        bedrooms: row.bedrooms ? safeNum(row.bedrooms) : undefined,
        bathrooms: row.bathrooms ? safeNum(row.bathrooms) : undefined,
        floor: row.floor ? safeNum(row.floor) : undefined,
        region: str(row.region) || prop?.region || '',
        city: str(row.city) || str(row['المدينة']) || prop?.city || '',
        createdAt: now,
      };
      return unit;
    }
    case 'contracts': {
      const tdNum = str(row.titleDeedNumber) || str(row['رقم وثيقة الملكية']);
      const unitNum = str(row.unitNumber) || str(row['رقم الوحدة']);
      const unit = store.units.find(u => u.unitNumber === unitNum && u.titleDeedNumber === tdNum)
        || store.units.find(u => u.unitNumber === unitNum);
      const prop = unit ? store.properties.find(p => p.id === unit.propertyId) : undefined;
      const contract: Contract = {
        id,
        contractNumber: str(row.contractNumber) || str(row['رقم العقد']),
        versionNumber: str(row.versionNumber) || '1.0',
        tenantId: store.users.find(u => u.name === str(row.tenantName))?.id || id + '_t',
        tenantName: str(row.tenantName) || str(row['اسم المستأجر']),
        landlordId: store.users.find(u => u.name === str(row.landlordName))?.id || '',
        landlordName: str(row.landlordName) || str(row['اسم المالك']),
        unitId: unit?.id || '',
        propertyId: prop?.id || '',
        propertyName: prop?.propertyName || str(row.propertyName) || '',
        titleDeedNumber: tdNum,
        contractStartDate: normalizeDate(row.contractStartDate || row['تاريخ البداية']),
        contractEndDate: normalizeDate(row.contractEndDate || row['تاريخ الانتهاء']),
        status: (str(row.status) || 'active') as Contract['status'],
        notes: [
          row.annualRent ? `الإيجار السنوي: ${row.annualRent} ر.س` : '',
          str(row.notes),
        ].filter(Boolean).join(' | ') || undefined,
        createdAt: now,
      };
      return contract;
    }
    case 'payments': {
      const contractNum = str(row.contractNumber) || str(row['رقم العقد']);
      const contract = store.contracts.find(c => c.contractNumber === contractNum);
      const payment: Payment = {
        id,
        paymentNumber: str(row.paymentNumber) || str(row['رقم الدفعة']) || `PAY-${id.slice(0, 6)}`,
        installmentId: '',
        installmentNumber: str(row.installmentNumber) || '',
        contractId: contract?.id || '',
        invoiceId: '',
        paymentAmount: safeNum(row.paymentAmount || row['مبلغ الدفعة']),
        paymentDate: normalizeDate(row.paymentDate || row['تاريخ الدفع']),
        paymentMethod: (str(row.paymentMethod) || 'bank_transfer') as Payment['paymentMethod'],
        paymentStatus: (str(row.paymentStatus) || 'completed') as Payment['paymentStatus'],
        receivingMethod: str(row.receivingMethod) || 'تحويل بنكي',
        referenceNumber: str(row.referenceNumber) || undefined,
        bankName: str(row.bankName) || undefined,
        notes: str(row.notes) || undefined,
        createdAt: now,
      };
      return payment;
    }
    case 'maintenance': {
      const req: MaintenanceRequest = {
        id,
        requestNumber: `MNT-${Date.now().toString().slice(-6)}`,
        title: str(row.title) || str(row['عنوان البلاغ']),
        description: str(row.description) || str(row['وصف المشكلة']),
        category: (str(row.category) || 'other') as MaintenanceRequest['category'],
        priority: (str(row.priority) || 'medium') as MaintenanceRequest['priority'],
        status: (str(row.status) || 'new') as MaintenanceRequest['status'],
        requestSource: 'employee',
        unitId: str(row.unitId) || '',
        propertyId: '',
        tenantId: '',
        estimatedCost: row.estimatedCost ? safeNum(row.estimatedCost) : undefined,
        statusHistory: [],
        createdAt: row.createdAt ? normalizeDate(row.createdAt) + 'T00:00:00.000Z' : now,
        updatedAt: now,
      };
      return req;
    }
    case 'customers': {
      const customer: Customer = {
        id,
        name: str(row.name) || str(row['الاسم']),
        phone: str(row.phone) || str(row['الجوال']),
        email: str(row.email) || str(row['البريد']) || undefined,
        type: (str(row.type) || 'tenant') as Customer['type'],
        status: 'new' as Customer['status'],
        source: 'other' as Customer['source'],
        city: str(row.city) || str(row['المدينة']) || undefined,
        nationality: str(row.nationality) || str(row['الجنسية']) || 'سعودي',
        notes: str(row.notes) || undefined,
        createdAt: now,
      };
      return customer;
    }
    case 'users': {
      const user: User = {
        id,
        name: str(row.name) || str(row['الاسم']),
        email: str(row.email) || str(row['البريد']),
        phone: str(row.phone) || str(row['الجوال']) || undefined,
        password: str(row.password) || '123456',
        role: (str(row.role) || 'employee') as User['role'],
        isActive: true,
        createdAt: now,
      };
      return user;
    }
    default:
      return null;
  }
}

// ─── Download sample template ─────────────────────────────────
function downloadTemplate(config: ImportTypeConfig) {
  const wb = XLSX.utils.book_new();
  const headers = config.columns.map(c => c.label);
  const sampleRows = config.sampleData.map(row =>
    config.columns.map(c => row[c.key] ?? '')
  );
  const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleRows]);

  // Column widths
  ws['!cols'] = config.columns.map(() => ({ wch: 22 }));

  XLSX.utils.book_append_sheet(wb, ws, config.label);
  XLSX.writeFile(wb, `نموذج_استيراد_${config.label}.xlsx`);
}

// ─── Preview table ────────────────────────────────────────────
function PreviewTable({ rows, columns, errors }: {
  rows: Record<string, unknown>[];
  columns: ImportTypeConfig['columns'];
  errors: Record<number, string[]>;
}) {
  const [expanded, setExpanded] = useState(true);
  const show = rows.slice(0, 10);

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 text-sm font-medium text-gray-700"
        onClick={() => setExpanded(v => !v)}>
        <span className="flex items-center gap-2">
          <Table2 className="w-4 h-4" />
          معاينة البيانات ({rows.length} صف)
        </span>
        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      {expanded && (
        <div className="overflow-x-auto max-h-72">
          <table className="w-full text-xs">
            <thead className="bg-gray-100 sticky top-0">
              <tr>
                <th className="px-2 py-2 text-right font-semibold text-gray-600">#</th>
                {columns.map(c => (
                  <th key={c.key} className="px-2 py-2 text-right font-semibold text-gray-600 whitespace-nowrap">
                    {c.label}{c.required && <span className="text-red-400">*</span>}
                  </th>
                ))}
                <th className="px-2 py-2 text-right font-semibold text-gray-600">حالة</th>
              </tr>
            </thead>
            <tbody>
              {show.map((row, i) => (
                <tr key={i} className={`border-t ${errors[i]?.length ? 'bg-red-50' : 'hover:bg-gray-50'}`}>
                  <td className="px-2 py-1.5 text-gray-400">{i + 1}</td>
                  {columns.map(c => (
                    <td key={c.key} className="px-2 py-1.5 text-gray-700 whitespace-nowrap max-w-32 truncate">
                      {String(row[c.key] ?? row[c.label] ?? '—')}
                    </td>
                  ))}
                  <td className="px-2 py-1.5">
                    {errors[i]?.length
                      ? <span className="text-red-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors[i][0]}</span>
                      : <span className="text-green-600 flex items-center gap-1"><CheckCircle className="w-3 h-3" />جاهز</span>}
                  </td>
                </tr>
              ))}
              {rows.length > 10 && (
                <tr>
                  <td colSpan={columns.length + 2} className="px-2 py-2 text-center text-xs text-gray-400">
                    ... و {rows.length - 10} صف إضافي
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Import Card (per type) ───────────────────────────────────
function ImportCard({ config }: { config: ImportTypeConfig }) {
  const store = useStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [errors, setErrors] = useState<Record<number, string[]>>({});
  const [isImporting, setIsImporting] = useState(false);
  const [result, setResult] = useState<{ imported: number; skipped: number; failed: number } | null>(null);
  const [fileName, setFileName] = useState('');

  const parseFile = useCallback((file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const wb = XLSX.read(e.target?.result, { type: 'array', cellDates: true });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const jsonRaw = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: '' });
      setRows(jsonRaw);

      // Validate required fields
      const errs: Record<number, string[]> = {};
      jsonRaw.forEach((row, i) => {
        const missing = config.columns
          .filter(c => c.required)
          .filter(c => !row[c.key] && !row[c.label])
          .map(c => c.label);
        if (missing.length) errs[i] = [`حقول مطلوبة: ${missing.join(', ')}`];
      });
      setErrors(errs);
      setResult(null);
    };
    reader.readAsArrayBuffer(file);
  }, [config]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) parseFile(f);
  };

  const handleImport = async () => {
    setIsImporting(true);
    let imported = 0, skipped = 0, failed = 0;

    for (let i = 0; i < rows.length; i++) {
      if (errors[i]?.length) { failed++; continue; }
      try {
        const mapped = mapRow(config.id, rows[i], store);
        if (!mapped) { failed++; continue; }

        // Check duplicates
        const isDupe = checkDuplicate(config.id, mapped, store);
        if (isDupe) { skipped++; continue; }

        // Call store action
        (store as unknown as Record<string, (data: unknown) => void>)[config.storeAction](mapped);
        imported++;
      } catch {
        failed++;
      }
    }

    setResult({ imported, skipped, failed });
    setIsImporting(false);
  };

  const handleUpdate = async () => {
    setIsImporting(true);
    let imported = 0;
    const skipped = 0;
    let failed = 0;

    for (let i = 0; i < rows.length; i++) {
      if (errors[i]?.length) { failed++; continue; }
      try {
        const mapped = mapRow(config.id, rows[i], store);
        if (!mapped) { failed++; continue; }

        const existing = findExisting(config.id, mapped, store);
        if (existing) {
          (store as Record<string, (id: string, data: unknown) => void>)[config.storeAction.replace('add', 'update')](existing.id, mapped);
          imported++;
        } else {
          (store as Record<string, (data: unknown) => void>)[config.storeAction](mapped);
          imported++;
        }
      } catch {
        failed++;
      }
    }

    setResult({ imported, skipped, failed });
    setIsImporting(false);
  };

  const validRows = rows.length - Object.keys(errors).length;

  return (
    <div className="card space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${config.color}`}>
            {config.icon}
          </div>
          <div>
            <h3 className="font-bold text-gray-800">{config.label}</h3>
            <p className="text-xs text-gray-500">{config.description}</p>
          </div>
        </div>
        <button
          onClick={() => downloadTemplate(config)}
          className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg">
          <Download className="w-3.5 h-3.5" /> نموذج Excel
        </button>
      </div>

      {/* Drop zone */}
      <div
        className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer
          ${isDragging ? 'border-yellow-400 bg-yellow-50' : rows.length ? 'border-green-400 bg-green-50' : 'border-gray-300 bg-gray-50 hover:border-yellow-400 hover:bg-yellow-50'}`}
        onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}>
        <input ref={fileRef} type="file"
          accept=".xlsx,.xls,.csv"
          className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) parseFile(f); }} />

        {rows.length > 0 ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="w-8 h-8 text-green-500" />
              <div className="text-right">
                <p className="font-semibold text-green-700 text-sm">{fileName}</p>
                <p className="text-xs text-gray-500">{rows.length} صف — {validRows} صالح للاستيراد</p>
              </div>
            </div>
            <button onClick={e => { e.stopPropagation(); setRows([]); setErrors({}); setResult(null); setFileName(''); }}
              className="text-gray-400 hover:text-red-500 p-1">
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <Upload className="w-10 h-10 mx-auto text-gray-400" />
            <p className="text-sm font-medium text-gray-600">اضغط لاختيار الملف أو اسحبه هنا</p>
            <p className="text-xs text-yellow-600">ملفات Excel (.xlsx, .xls, .csv)</p>
          </div>
        )}
      </div>

      {/* Preview */}
      {rows.length > 0 && (
        <PreviewTable rows={rows} columns={config.columns} errors={errors} />
      )}

      {/* Validation summary */}
      {rows.length > 0 && Object.keys(errors).length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 text-xs text-orange-800 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{Object.keys(errors).length} صف يحتوي على أخطاء وسيتم تخطيه — تأكد من ملء الحقول الإلزامية</span>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className={`rounded-xl p-4 text-sm ${result.failed === 0 ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className={`w-4 h-4 ${result.failed === 0 ? 'text-green-600' : 'text-yellow-600'}`} />
            <span className="font-bold">اكتمل الاستيراد</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-green-100 rounded-lg p-2"><p className="text-lg font-bold text-green-700">{result.imported}</p><p className="text-xs text-gray-600">مُستورَد</p></div>
            <div className="bg-yellow-100 rounded-lg p-2"><p className="text-lg font-bold text-yellow-700">{result.skipped}</p><p className="text-xs text-gray-600">مكرر (تخطّى)</p></div>
            <div className="bg-red-100 rounded-lg p-2"><p className="text-lg font-bold text-red-700">{result.failed}</p><p className="text-xs text-gray-600">فشل</p></div>
          </div>
        </div>
      )}

      {/* Actions */}
      {rows.length > 0 && !result && (
        <div className="flex gap-2">
          <button
            onClick={handleImport}
            disabled={isImporting || validRows === 0}
            className="flex-1 btn-primary flex items-center justify-center gap-2 text-sm disabled:opacity-50">
            {isImporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            استيراد ({validRows} صف)
          </button>
          <button
            onClick={handleUpdate}
            disabled={isImporting || validRows === 0}
            className="flex-1 btn-secondary flex items-center justify-center gap-2 text-sm disabled:opacity-50">
            {isImporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            تحديث / دمج
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Duplicate / Find helpers ─────────────────────────────────
function checkDuplicate(typeId: string, mapped: Record<string, unknown>, store: AppState): boolean {
  switch (typeId) {
    case 'properties': return store.properties.some(p => p.titleDeedNumber === mapped.titleDeedNumber);
    case 'units': return store.units.some(u => u.unitNumber === mapped.unitNumber && u.titleDeedNumber === mapped.titleDeedNumber);
    case 'contracts': return store.contracts.some(c => c.contractNumber === mapped.contractNumber);
    case 'payments': return store.payments.some(p => p.paymentNumber === mapped.paymentNumber);
    case 'customers': return store.customers.some(c => c.phone === mapped.phone);
    case 'users': return store.users.some(u => u.email === mapped.email);
    default: return false;
  }
}

function findExisting(typeId: string, mapped: Record<string, unknown>, store: AppState): Record<string, unknown> | undefined {
  switch (typeId) {
    case 'properties': return store.properties.find(p => p.titleDeedNumber === mapped.titleDeedNumber);
    case 'units': return store.units.find(u => u.unitNumber === mapped.unitNumber && u.titleDeedNumber === mapped.titleDeedNumber);
    case 'contracts': return store.contracts.find(c => c.contractNumber === mapped.contractNumber);
    case 'payments': return store.payments.find(p => p.paymentNumber === mapped.paymentNumber);
    case 'customers': return store.customers.find(c => c.phone === mapped.phone);
    case 'users': return store.users.find(u => u.email === mapped.email);
    default: return null;
  }
}

// ─── Main Page ────────────────────────────────────────────────
export default function DataImportPage() {
  const store = useStore();
  const [activeType, setActiveType] = useState<string | null>(null);

  const stats = [
    { label: 'عقارات', value: store.properties.length, icon: <Building2 className="w-4 h-4" />, color: 'text-blue-600' },
    { label: 'وحدات', value: store.units.length, icon: <Home className="w-4 h-4" />, color: 'text-green-600' },
    { label: 'عقود', value: store.contracts.length, icon: <FileText className="w-4 h-4" />, color: 'text-yellow-700' },
    { label: 'دفعات', value: store.payments.length, icon: <DollarSign className="w-4 h-4" />, color: 'text-purple-600' },
    { label: 'صيانة', value: store.maintenanceRequests.length, icon: <Wrench className="w-4 h-4" />, color: 'text-orange-600' },
    { label: 'عملاء', value: store.customers.length, icon: <Users className="w-4 h-4" />, color: 'text-pink-600' },
    { label: 'مستخدمون', value: store.users.length, icon: <UserCheck className="w-4 h-4" />, color: 'text-indigo-600' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="section-title flex items-center gap-2">
          <FileSpreadsheet className="w-6 h-6 text-yellow-500" />
          استيراد وتحديث البيانات من Excel
        </h1>
        <p className="section-subtitle">حمّل ملف Excel واختر نوع البيانات لإضافتها أو تحديثها في النظام</p>
      </div>

      {/* Current data stats */}
      <div className="card">
        <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
          <Info className="w-4 h-4 text-blue-500" /> إحصائيات البيانات الحالية في النظام
        </h3>
        <div className="grid grid-cols-4 md:grid-cols-7 gap-3">
          {stats.map(s => (
            <div key={s.label} className="text-center">
              <div className={`flex justify-center mb-1 ${s.color}`}>{s.icon}</div>
              <p className="text-xl font-bold text-gray-800">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-sm text-blue-800 space-y-2">
        <p className="font-bold flex items-center gap-2"><Info className="w-4 h-4" /> تعليمات الاستيراد:</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 text-xs text-blue-700">
          <span className="flex items-center gap-1.5"><ArrowRight className="w-3 h-3" /> نزّل نموذج Excel من كل بطاقة وأضف بياناتك</span>
          <span className="flex items-center gap-1.5"><ArrowRight className="w-3 h-3" /> <strong>استيراد</strong>: يضيف صفوف جديدة فقط ويتخطى المكرر</span>
          <span className="flex items-center gap-1.5"><ArrowRight className="w-3 h-3" /> <strong>تحديث/دمج</strong>: يحدّث السجلات الموجودة ويضيف الجديدة</span>
          <span className="flex items-center gap-1.5"><ArrowRight className="w-3 h-3" /> الحقول المميزة بـ (*) إلزامية لإتمام الاستيراد</span>
          <span className="flex items-center gap-1.5"><ArrowRight className="w-3 h-3" /> تواريخ بصيغة: YYYY-MM-DD أو DD/MM/YYYY</span>
          <span className="flex items-center gap-1.5"><ArrowRight className="w-3 h-3" /> يدعم xlsx, xls, csv — الصف الأول هو رأس الجدول</span>
        </div>
      </div>

      {/* Type selector */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setActiveType(null)}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeType === null ? 'bg-gray-800 text-white shadow' : 'bg-white border text-gray-600 hover:bg-gray-50'}`}>
          عرض الكل
        </button>
        {IMPORT_TYPES.map(t => (
          <button key={t.id}
            onClick={() => setActiveType(activeType === t.id ? null : t.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-1.5 transition-all
              ${activeType === t.id ? 'bg-yellow-500 text-white shadow' : 'bg-white border text-gray-600 hover:bg-gray-50'}`}>
            <span className={activeType === t.id ? 'text-white' : ''}>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {IMPORT_TYPES
          .filter(t => activeType === null || t.id === activeType)
          .map(config => (
            <ImportCard key={config.id} config={config} />
          ))}
      </div>
    </div>
  );
}
