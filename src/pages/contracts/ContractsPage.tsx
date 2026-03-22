import { useState } from 'react';
import { useStore, generateId } from '../../data/store';
import { Plus, FileText, Edit, ChevronDown, ChevronRight, DollarSign, Sparkles, Receipt, Shield, Handshake, Hash, PenTool } from 'lucide-react';
import type { Contract } from '../../types';
import EjarContractAnalyzer from './EjarContractAnalyzer';
import ElectronicSignature from '../../components/ElectronicSignature';
import { ContractAnalyzerWidget, type ExtractedContractData } from '../../components/ContractAnalyzerWidget';

const statusLabels: Record<string, string> = { active: 'فعّال', expired: 'منتهي', terminated: 'ملغي', pending: 'معلق', renewed: 'مجدد' };
const statusColors: Record<string, string> = { active: 'badge-green', expired: 'badge-gray', terminated: 'badge-red', pending: 'badge-yellow', renewed: 'badge-blue' };

interface FormState {
  contractNumber: string;
  versionNumber: string;
  tenantId: string;
  landlordId: string;
  unitId: string;
  contractStartDate: string;
  contractEndDate: string;
  status: string;
  notes: string;
  ejarDocumentationFees: string;
  securityDeposit: string;
  brokerageCommission: string;
  brokerageAgreementNumber: string;
}

const getDaysLeft = (endDate: string) => Math.ceil((new Date(endDate).getTime() - Date.now()) / 86400000);

export default function ContractsPage() {
  const { contracts, units, properties, users, invoices, addContract, updateContract, currentUser } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Contract | null>(null);
  const [expandedContract, setExpandedContract] = useState<string | null>(null);
  const [signingContract, setSigningContract] = useState<string | null>(null);
  const [showEjarAnalyzer, setShowEjarAnalyzer] = useState(false);

  const tenants = users.filter(u => u.role === 'tenant');
  const owners = users.filter(u => u.role === 'owner');

  const visibleContracts = currentUser?.role === 'tenant'
    ? contracts.filter(c => c.tenantId === currentUser.id)
    : currentUser?.role === 'owner'
    ? contracts.filter(c => c.landlordId === currentUser.id)
    : contracts;

  const emptyForm = (): FormState => ({
    contractNumber: `CNT-${new Date().getFullYear()}-${String(contracts.length + 1).padStart(3, '0')}`,
    versionNumber: '1.0',
    tenantId: tenants[0]?.id || '',
    landlordId: owners[0]?.id || '',
    unitId: units[0]?.id || '',
    contractStartDate: '',
    contractEndDate: '',
    status: 'active',
    notes: '',
    ejarDocumentationFees: '',
    securityDeposit: '',
    brokerageCommission: '',
    brokerageAgreementNumber: '',
  });

  const [form, setForm] = useState<FormState>(emptyForm());
  const f = (patch: Partial<FormState>) => setForm(p => ({ ...p, ...patch }));

  const resetForm = () => { setForm(emptyForm()); setEditing(null); };

  const handleExtracted = (data: ExtractedContractData) => {
    f({
      ...(data.contractNumber && { contractNumber: data.contractNumber }),
      ...(data.versionNumber && { versionNumber: data.versionNumber }),
      ...(data.contractStartDate && { contractStartDate: data.contractStartDate }),
      ...(data.contractEndDate && { contractEndDate: data.contractEndDate }),
      ...(data.ejarDocumentationFees && { ejarDocumentationFees: String(data.ejarDocumentationFees) }),
      ...(data.securityDeposit && { securityDeposit: String(data.securityDeposit) }),
      ...(data.brokerageCommission && { brokerageCommission: String(data.brokerageCommission) }),
      ...(data.brokerageAgreementNumber && { brokerageAgreementNumber: data.brokerageAgreementNumber }),
      ...(data.notes && { notes: data.notes }),
    });
  };

  const openEdit = (c: Contract) => {
    setEditing(c);
    setForm({
      contractNumber: c.contractNumber,
      versionNumber: c.versionNumber,
      tenantId: c.tenantId,
      landlordId: c.landlordId,
      unitId: c.unitId,
      contractStartDate: c.contractStartDate,
      contractEndDate: c.contractEndDate,
      status: c.status,
      notes: c.notes || '',
      ejarDocumentationFees: c.ejarDocumentationFees != null ? String(c.ejarDocumentationFees) : '',
      securityDeposit: c.securityDeposit != null ? String(c.securityDeposit) : '',
      brokerageCommission: c.brokerageCommission != null ? String(c.brokerageCommission) : '',
      brokerageAgreementNumber: c.brokerageAgreementNumber || '',
    });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const unit = units.find(u => u.id === form.unitId);
    const prop = properties.find(p => p.id === unit?.propertyId);
    const tenant = users.find(u => u.id === form.tenantId);
    const landlord = users.find(u => u.id === form.landlordId);

    const payload: Partial<Contract> = {
      contractNumber: form.contractNumber,
      versionNumber: form.versionNumber,
      tenantId: form.tenantId,
      landlordId: form.landlordId,
      unitId: form.unitId,
      contractStartDate: form.contractStartDate,
      contractEndDate: form.contractEndDate,
      status: form.status as Contract['status'],
      notes: form.notes || undefined,
      ejarDocumentationFees: form.ejarDocumentationFees ? parseFloat(form.ejarDocumentationFees) : undefined,
      securityDeposit: form.securityDeposit ? parseFloat(form.securityDeposit) : undefined,
      brokerageCommission: form.brokerageCommission ? parseFloat(form.brokerageCommission) : undefined,
      brokerageAgreementNumber: form.brokerageAgreementNumber || undefined,
    };

    if (editing) {
      updateContract(editing.id, payload);
    } else {
      addContract({
        ...payload,
        id: generateId(),
        propertyId: unit?.propertyId || '',
        propertyName: prop?.propertyName || '',
        titleDeedNumber: unit?.titleDeedNumber || '',
        tenantName: tenant?.name || '',
        landlordName: landlord?.name || '',
        createdAt: new Date().toISOString(),
      } as Contract);
    }
    setShowForm(false);
    resetForm();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">إدارة العقود</h1>
          <p className="section-subtitle">{visibleContracts.length} عقد</p>
        </div>
        {(currentUser?.role === 'admin' || currentUser?.role === 'employee') && (
          <div className="flex gap-2">
            <button className="btn-secondary flex items-center gap-2 text-sm" onClick={() => setShowEjarAnalyzer(true)}>
              <Sparkles className="w-4 h-4 text-yellow-500" /> تحليل عقد إيجار
            </button>
            <button className="btn-primary flex items-center gap-2" onClick={() => { resetForm(); setShowForm(true); }}>
              <Plus className="w-4 h-4" /> عقد جديد
            </button>
          </div>
        )}
      </div>

      {/* ── Form Modal ── */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[92vh] overflow-y-auto">
            {/* Modal header */}
            <div className="bg-gradient-to-l from-green-600 to-teal-700 rounded-t-2xl p-5 text-white flex items-center justify-between sticky top-0 z-10">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <FileText className="w-5 h-5" />
                {editing ? 'تعديل العقد' : 'عقد إيجار جديد'}
              </h2>
              <button onClick={() => { setShowForm(false); resetForm(); }} className="text-white/70 hover:text-white text-2xl leading-none">×</button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-5">
              {/* Analyzer Widget */}
              <ContractAnalyzerWidget onExtracted={handleExtracted} mode="rental" />
              {/* Section: بيانات العقد */}
              <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-green-500" /> بيانات العقد
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">رقم العقد *</label>
                    <input className="input-field font-mono" value={form.contractNumber} onChange={e => f({ contractNumber: e.target.value })} required />
                  </div>
                  <div>
                    <label className="label">رقم النسخة</label>
                    <input className="input-field" value={form.versionNumber} onChange={e => f({ versionNumber: e.target.value })} />
                  </div>
                  <div className="col-span-2">
                    <label className="label">الوحدة *</label>
                    <select className="input-field" value={form.unitId} onChange={e => f({ unitId: e.target.value })}>
                      {units.map(u => {
                        const prop = properties.find(p => p.id === u.propertyId);
                        return <option key={u.id} value={u.id}>{prop?.propertyName} — وحدة {u.unitNumber} ({u.titleDeedNumber})</option>;
                      })}
                    </select>
                  </div>
                  <div>
                    <label className="label">المستأجر *</label>
                    <select className="input-field" value={form.tenantId} onChange={e => f({ tenantId: e.target.value })}>
                      {tenants.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">المؤجر / المالك *</label>
                    <select className="input-field" value={form.landlordId} onChange={e => f({ landlordId: e.target.value })}>
                      {owners.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">تاريخ البدء *</label>
                    <input type="date" className="input-field" value={form.contractStartDate} onChange={e => f({ contractStartDate: e.target.value })} required />
                  </div>
                  <div>
                    <label className="label">تاريخ الانتهاء *</label>
                    <input type="date" className="input-field" value={form.contractEndDate} onChange={e => f({ contractEndDate: e.target.value })} required />
                  </div>
                  <div>
                    <label className="label">الحالة</label>
                    <select className="input-field" value={form.status} onChange={e => f({ status: e.target.value })}>
                      {Object.entries(statusLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Section: الرسوم والضمانات */}
              <div className="border-t pt-4">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                  <DollarSign className="w-3.5 h-3.5 text-yellow-500" /> الرسوم والضمانات
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {/* 1 */}
                  <div className="col-span-2 sm:col-span-1">
                    <label className="label flex items-center gap-1.5">
                      <Receipt className="w-3.5 h-3.5 text-blue-500" />
                      رسوم التوثيق في منصة إيجار ر.س
                    </label>
                    <input
                      type="number" min="0" step="0.01"
                      className="input-field"
                      value={form.ejarDocumentationFees}
                      onChange={e => f({ ejarDocumentationFees: e.target.value })}
                      placeholder="0.00"
                    />
                    <p className="text-xs text-gray-400 mt-1">المبلغ المدفوع لمنصة إيجار عند توثيق العقد</p>
                  </div>

                  {/* 2 */}
                  <div className="col-span-2 sm:col-span-1">
                    <label className="label flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-green-500" />
                      مبلغ الضمان المحجوز ر.س
                    </label>
                    <input
                      type="number" min="0" step="0.01"
                      className="input-field"
                      value={form.securityDeposit}
                      onChange={e => f({ securityDeposit: e.target.value })}
                      placeholder="0.00"
                    />
                    <p className="text-xs text-gray-400 mt-1">تأمين يُحجز من المستأجر في بداية العقد</p>
                  </div>

                  {/* 3 */}
                  <div className="col-span-2 sm:col-span-1">
                    <label className="label flex items-center gap-1.5">
                      <Handshake className="w-3.5 h-3.5 text-purple-500" />
                      رسوم مكتب الوساطة ر.س
                    </label>
                    <input
                      type="number" min="0" step="0.01"
                      className="input-field"
                      value={form.brokerageCommission}
                      onChange={e => f({ brokerageCommission: e.target.value })}
                      placeholder="0.00"
                    />
                    <p className="text-xs text-gray-400 mt-1">العمولة المستحقة لمكتب الوساطة من عملية التأجير</p>
                  </div>

                  {/* 4 */}
                  <div className="col-span-2 sm:col-span-1">
                    <label className="label flex items-center gap-1.5">
                      <Hash className="w-3.5 h-3.5 text-orange-500" />
                      رقم اتفاقية الوساطة
                    </label>
                    <input
                      className="input-field font-mono"
                      value={form.brokerageAgreementNumber}
                      onChange={e => f({ brokerageAgreementNumber: e.target.value })}
                      placeholder="مثال: BRK-2025-001"
                    />
                    <p className="text-xs text-gray-400 mt-1">رقم عقد الوساطة المبرم مع مالك العقار</p>
                  </div>
                </div>

                {/* Summary row */}
                {(form.ejarDocumentationFees || form.securityDeposit || form.brokerageCommission) && (
                  <div className="mt-3 grid grid-cols-3 gap-2 p-3 bg-gray-50 rounded-xl text-xs">
                    {form.ejarDocumentationFees && (
                      <div className="text-center">
                        <p className="text-gray-400">رسوم التوثيق</p>
                        <p className="font-bold text-blue-700">{parseFloat(form.ejarDocumentationFees).toLocaleString()} ر.س</p>
                      </div>
                    )}
                    {form.securityDeposit && (
                      <div className="text-center">
                        <p className="text-gray-400">الضمان المحجوز</p>
                        <p className="font-bold text-green-700">{parseFloat(form.securityDeposit).toLocaleString()} ر.س</p>
                      </div>
                    )}
                    {form.brokerageCommission && (
                      <div className="text-center">
                        <p className="text-gray-400">رسوم الوساطة</p>
                        <p className="font-bold text-purple-700">{parseFloat(form.brokerageCommission).toLocaleString()} ر.س</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Notes */}
              <div className="border-t pt-4">
                <label className="label">ملاحظات</label>
                <textarea className="input-field" rows={2} value={form.notes} onChange={e => f({ notes: e.target.value })} />
              </div>

              <div className="flex gap-3 pt-1">
                <button type="submit" className="btn-primary flex-1">{editing ? 'حفظ التعديلات' : 'إنشاء العقد'}</button>
                <button type="button" className="btn-secondary flex-1" onClick={() => { setShowForm(false); resetForm(); }}>إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Contracts list ── */}
      <div className="space-y-4">
        {visibleContracts.map(c => {
          const unit = units.find(u => u.id === c.unitId);
          const prop = properties.find(p => p.id === c.propertyId);
          const daysLeft = getDaysLeft(c.contractEndDate);
          const contractInvoices = invoices.filter(i => i.contractId === c.id);
          const totalPaid = contractInvoices.reduce((s, i) => s + i.paidAmount, 0);
          const totalAmount = contractInvoices.reduce((s, i) => s + i.totalAmount, 0);
          const isExpanded = expandedContract === c.id;

          const hasFees = c.ejarDocumentationFees || c.securityDeposit || c.brokerageCommission || c.brokerageAgreementNumber;

          return (
            <div key={c.id} className="card hover:shadow-md transition-shadow">
              {/* Top row */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <FileText className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-gray-800 font-mono">{c.contractNumber}</p>
                      <span className="text-xs text-gray-400">v{c.versionNumber}</span>
                      {c.brokerageAgreementNumber && (
                        <span className="text-xs text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Hash className="w-3 h-3" />{c.brokerageAgreementNumber}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{prop?.propertyName} — وحدة {unit?.unitNumber}</p>
                    <p className="text-xs text-gray-400">المستأجر: {c.tenantName} | المؤجر: {c.landlordName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`badge ${statusColors[c.status]}`}>{statusLabels[c.status]}</span>
                  {(currentUser?.role === 'admin' || currentUser?.role === 'employee') && (
                    <button onClick={() => openEdit(c)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500">
                      <Edit className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => setSigningContract(signingContract === c.id ? null : c.id)}
                    className={`p-1.5 rounded-lg text-sm flex items-center gap-1 transition-colors ${signingContract === c.id ? 'bg-blue-100 text-blue-600' : 'hover:bg-blue-50 text-gray-400 hover:text-blue-500'}`}
                    title="توقيع إلكتروني">
                    <PenTool className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Dates + basic info */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4 pt-3 border-t border-gray-100 text-sm">
                <div><p className="text-xs text-gray-400">تاريخ البدء</p><p className="font-medium">{c.contractStartDate}</p></div>
                <div><p className="text-xs text-gray-400">تاريخ الانتهاء</p><p className="font-medium">{c.contractEndDate}</p></div>
                <div><p className="text-xs text-gray-400">أيام متبقية</p><p className={`font-bold ${daysLeft < 60 ? 'text-red-500' : 'text-green-600'}`}>{daysLeft}</p></div>
                <div><p className="text-xs text-gray-400">رقم الوثيقة</p><p className="font-mono text-xs">{c.titleDeedNumber}</p></div>
                <div><p className="text-xs text-gray-400">الفواتير</p><p className="font-semibold text-yellow-600">{totalPaid.toLocaleString()} / {totalAmount.toLocaleString()} ر</p></div>
              </div>

              {/* ── Fees & Deposits row ── */}
              {hasFees && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3 pt-3 border-t border-dashed border-gray-200">
                  {c.ejarDocumentationFees != null && (
                    <div className="flex items-center gap-2 bg-blue-50 rounded-xl px-3 py-2">
                      <Receipt className="w-4 h-4 text-blue-500 shrink-0" />
                      <div>
                        <p className="text-xs text-gray-400">رسوم التوثيق (إيجار)</p>
                        <p className="font-bold text-blue-700 text-sm">{c.ejarDocumentationFees.toLocaleString()} ر.س</p>
                      </div>
                    </div>
                  )}
                  {c.securityDeposit != null && (
                    <div className="flex items-center gap-2 bg-green-50 rounded-xl px-3 py-2">
                      <Shield className="w-4 h-4 text-green-500 shrink-0" />
                      <div>
                        <p className="text-xs text-gray-400">الضمان المحجوز</p>
                        <p className="font-bold text-green-700 text-sm">{c.securityDeposit.toLocaleString()} ر.س</p>
                      </div>
                    </div>
                  )}
                  {c.brokerageCommission != null && (
                    <div className="flex items-center gap-2 bg-purple-50 rounded-xl px-3 py-2">
                      <Handshake className="w-4 h-4 text-purple-500 shrink-0" />
                      <div>
                        <p className="text-xs text-gray-400">رسوم الوساطة</p>
                        <p className="font-bold text-purple-700 text-sm">{c.brokerageCommission.toLocaleString()} ر.س</p>
                      </div>
                    </div>
                  )}
                  {c.brokerageAgreementNumber && (
                    <div className="flex items-center gap-2 bg-orange-50 rounded-xl px-3 py-2">
                      <Hash className="w-4 h-4 text-orange-500 shrink-0" />
                      <div>
                        <p className="text-xs text-gray-400">اتفاقية الوساطة</p>
                        <p className="font-bold text-orange-700 text-sm font-mono">{c.brokerageAgreementNumber}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Invoices toggle */}
              {contractInvoices.length > 0 && (
                <button className="flex items-center gap-1 mt-3 text-xs text-gray-500 hover:text-yellow-600 transition-colors"
                  onClick={() => setExpandedContract(isExpanded ? null : c.id)}>
                  {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                  عرض الفواتير ({contractInvoices.length})
                </button>
              )}

              {isExpanded && (
                <div className="mt-3 space-y-2">
                  {contractInvoices.map(inv => (
                    <div key={inv.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg text-sm">
                      <div>
                        <p className="font-mono font-medium text-gray-700">{inv.invoiceNumber}</p>
                        <p className="text-xs text-gray-400">استحقاق: {inv.invoiceDueDate} | آخر مهلة: {inv.invoiceGraceDate}</p>
                      </div>
                      <div className="text-left">
                        <p className="font-semibold">{inv.totalAmount.toLocaleString()} ر</p>
                        <p className="text-xs text-gray-500">متبقي: {inv.remainingAmount.toLocaleString()} ر</p>
                      </div>
                      <span className={`badge ${inv.invoiceStatus === 'paid' ? 'badge-green' : inv.invoiceStatus === 'overdue' ? 'badge-red' : 'badge-yellow'}`}>
                        {inv.invoiceStatus === 'paid' ? 'مدفوعة' : inv.invoiceStatus === 'overdue' ? 'متأخرة' : 'معلقة'}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Electronic Signature Panel */}
              {signingContract === c.id && (
                <div className="mt-4 border-t border-gray-100 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ElectronicSignature
                      signerName={c.tenantName ?? 'المستأجر'}
                      signerRole="tenant"
                      onSign={(sig) => { console.log('Tenant signed', sig); }}
                      onClose={() => setSigningContract(null)}
                    />
                    <ElectronicSignature
                      signerName={c.ownerName ?? 'المالك'}
                      signerRole="owner"
                      onSign={(sig) => { console.log('Owner signed', sig); }}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showEjarAnalyzer && (
        <EjarContractAnalyzer onClose={() => setShowEjarAnalyzer(false)} />
      )}
    </div>
  );
}
