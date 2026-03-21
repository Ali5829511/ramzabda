import { useState } from 'react';
import { useStore, generateId } from '../../data/store';
import { Plus, DollarSign, CheckCircle, Clock, AlertCircle, ChevronRight, ChevronDown, CreditCard } from 'lucide-react';
import type { Payment } from '../../types';

const invoiceStatusLabels: Record<string, string> = { pending: 'معلقة', paid: 'مدفوعة', overdue: 'متأخرة', partial: 'جزئي', cancelled: 'ملغاة' };
const invoiceStatusColors: Record<string, string> = { pending: 'badge-yellow', paid: 'badge-green', overdue: 'badge-red', partial: 'badge-blue', cancelled: 'badge-gray' };
const paymentMethodLabels: Record<string, string> = { cash: 'نقداً', bank_transfer: 'تحويل بنكي', cheque: 'شيك', online: 'إلكتروني' };

export default function PaymentsPage() {
  const { invoices, installments, payments, contracts, units, properties, users, updateInvoice, addPayment, updateInstallment, currentUser } = useStore();
  const [expandedInvoice, setExpandedInvoice] = useState<string | null>(null);
  const [showPayForm, setShowPayForm] = useState<string | null>(null); // installmentId
  const [filterStatus, setFilterStatus] = useState('all');

  const visibleInvoices = currentUser?.role === 'tenant'
    ? invoices.filter(inv => {
        const c = contracts.find(c => c.id === inv.contractId);
        return c?.tenantId === currentUser.id;
      })
    : currentUser?.role === 'owner'
    ? invoices.filter(inv => {
        const c = contracts.find(c => c.id === inv.contractId);
        return c?.landlordId === currentUser.id;
      })
    : invoices;

  const filtered = filterStatus === 'all' ? visibleInvoices : visibleInvoices.filter(i => i.invoiceStatus === filterStatus);

  const totalPaid = visibleInvoices.reduce((s, i) => s + i.paidAmount, 0);
  const totalPending = visibleInvoices.filter(i => i.invoiceStatus === 'pending').reduce((s, i) => s + i.remainingAmount, 0);
  const totalOverdue = visibleInvoices.filter(i => i.invoiceStatus === 'overdue').reduce((s, i) => s + i.remainingAmount, 0);

  const [payForm, setPayForm] = useState({
    paymentAmount: 0, paymentMethod: 'bank_transfer', iban: '', accountName: '',
    bankName: '', referenceNumber: '', receivingMethod: 'تحويل بنكي'
  });

  const handlePay = (installmentId: string, e: React.FormEvent) => {
    e.preventDefault();
    const inst = installments.find(i => i.id === installmentId);
    if (!inst) return;

    const paymentNumber = `PAY-${new Date().getFullYear()}-${String(payments.length + 1).padStart(3, '0')}`;
    addPayment({
      ...payForm,
      id: generateId(),
      paymentNumber,
      installmentId,
      installmentNumber: inst.installmentNumber,
      contractId: inst.contractId,
      invoiceId: inst.invoiceId,
      paymentDate: new Date().toISOString().split('T')[0],
      paymentStatus: 'completed',
      paymentMethod: payForm.paymentMethod as Payment['paymentMethod'],
      notes: '',
      createdAt: new Date().toISOString(),
    });

    const newPaid = inst.installmentPaid + payForm.paymentAmount;
    const newRemaining = Math.max(0, inst.installmentValue - newPaid);
    updateInstallment(installmentId, {
      installmentPaid: newPaid,
      installmentRemaining: newRemaining,
      installmentStatus: newRemaining === 0 ? 'paid' : 'partial',
    });

    const invoice = invoices.find(i => i.id === inst.invoiceId);
    if (invoice) {
      const invInsts = installments.filter(i => i.invoiceId === invoice.id && i.id !== installmentId);
      const totalPaidInv = invInsts.reduce((s, i) => s + i.installmentPaid, 0) + newPaid;
      const remaining = Math.max(0, invoice.totalAmount - totalPaidInv);
      updateInvoice(invoice.id, {
        paidAmount: totalPaidInv,
        remainingAmount: remaining,
        invoiceStatus: remaining === 0 ? 'paid' : totalPaidInv > 0 ? 'partial' : invoice.invoiceStatus,
        invoiceStatusDescription: remaining === 0 ? 'مدفوع بالكامل' : 'مدفوع جزئياً',
      });
    }

    setShowPayForm(null);
    setPayForm({ paymentAmount: 0, paymentMethod: 'bank_transfer', iban: '', accountName: '', bankName: '', referenceNumber: '', receivingMethod: 'تحويل بنكي' });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="section-title">الفواتير والمدفوعات</h1>
        <p className="section-subtitle">Property → Units → Contracts → Invoices → Installments → Payments</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="card p-4 bg-green-50 border-green-200">
          <div className="flex items-center gap-2 mb-1"><CheckCircle className="w-4 h-4 text-green-600" /><p className="text-sm font-medium text-green-700">محصّل</p></div>
          <p className="text-xl font-bold text-green-700">{totalPaid.toLocaleString()} ر</p>
        </div>
        <div className="card p-4 bg-yellow-50 border-yellow-200">
          <div className="flex items-center gap-2 mb-1"><Clock className="w-4 h-4 text-yellow-600" /><p className="text-sm font-medium text-yellow-700">معلق</p></div>
          <p className="text-xl font-bold text-yellow-700">{totalPending.toLocaleString()} ر</p>
        </div>
        <div className="card p-4 bg-red-50 border-red-200">
          <div className="flex items-center gap-2 mb-1"><AlertCircle className="w-4 h-4 text-red-600" /><p className="text-sm font-medium text-red-700">متأخر</p></div>
          <p className="text-xl font-bold text-red-700">{totalOverdue.toLocaleString()} ر</p>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {['all', 'pending', 'paid', 'overdue', 'partial'].map(s => (
          <button key={s} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${filterStatus === s ? 'bg-yellow-500 text-white' : 'bg-white border text-gray-600 hover:bg-gray-50'}`} onClick={() => setFilterStatus(s)}>
            {s === 'all' ? 'الكل' : invoiceStatusLabels[s]}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.map(inv => {
          const contract = contracts.find(c => c.id === inv.contractId);
          const unit = units.find(u => u.id === contract?.unitId);
          const prop = properties.find(p => p.id === contract?.propertyId);
          const tenant = users.find(u => u.id === contract?.tenantId);
          const invInstallments = installments.filter(i => i.invoiceId === inv.id);
          const isExpanded = expandedInvoice === inv.id;

          return (
            <div key={inv.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-bold font-mono text-gray-800">{inv.invoiceNumber}</p>
                    <span className={`badge ${invoiceStatusColors[inv.invoiceStatus]}`}>{invoiceStatusLabels[inv.invoiceStatus]}</span>
                  </div>
                  <p className="text-sm text-gray-500">{prop?.propertyName} - وحدة {unit?.unitNumber}</p>
                  <p className="text-xs text-gray-400">المستأجر: {tenant?.name} | عقد: {contract?.contractNumber}</p>
                </div>
                <div className="text-left">
                  <p className="text-lg font-bold text-yellow-600">{inv.totalAmount.toLocaleString()} ر</p>
                  <p className="text-xs text-gray-500">مدفوع: {inv.paidAmount.toLocaleString()} ر</p>
                  <p className="text-xs text-red-500">متبقي: {inv.remainingAmount.toLocaleString()} ر</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
                <div><span className="text-gray-400">الاستحقاق: </span>{inv.invoiceDueDate}</div>
                <div><span className="text-gray-400">الإصدار: </span>{inv.invoiceIssueDate}</div>
                <div><span className="text-gray-400">آخر مهلة: </span><span className="text-red-500 font-medium">{inv.invoiceGraceDate}</span></div>
              </div>

              {invInstallments.length > 0 && (
                <button className="flex items-center gap-1 mt-3 text-xs text-gray-500 hover:text-yellow-600 transition-colors" onClick={() => setExpandedInvoice(isExpanded ? null : inv.id)}>
                  {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                  الأقساط ({invInstallments.length})
                </button>
              )}

              {isExpanded && (
                <div className="mt-3 space-y-2">
                  {invInstallments.map(inst => {
                    const instPayments = payments.filter(p => p.installmentId === inst.id);
                    return (
                      <div key={inst.id} className="border border-gray-200 rounded-xl p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="font-mono text-sm font-medium">{inst.installmentNumber}</p>
                            <p className="text-xs text-gray-400">استحقاق: {inst.installmentDueDate} | مهلة: {inst.installmentGraceDate}</p>
                          </div>
                          <div className="text-left">
                            <p className="font-semibold text-sm">{inst.installmentValue.toLocaleString()} ر</p>
                            <p className="text-xs text-gray-500">متبقي: {inst.installmentRemaining.toLocaleString()} ر</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`badge ${inst.installmentStatus === 'paid' ? 'badge-green' : inst.installmentStatus === 'overdue' ? 'badge-red' : 'badge-yellow'}`}>
                              {inst.installmentStatus === 'paid' ? 'مدفوع' : inst.installmentStatus === 'overdue' ? 'متأخر' : 'معلق'}
                            </span>
                            {inst.installmentStatus !== 'paid' && (currentUser?.role === 'admin' || currentUser?.role === 'employee') && (
                              <button onClick={() => setShowPayForm(inst.id)} className="btn-primary text-xs py-1 px-2">
                                <CreditCard className="w-3 h-3" /> تسجيل دفعة
                              </button>
                            )}
                          </div>
                        </div>

                        {instPayments.length > 0 && (
                          <div className="space-y-1 mt-2 pt-2 border-t border-gray-100">
                            {instPayments.map(pay => (
                              <div key={pay.id} className="flex items-center justify-between text-xs text-gray-500 bg-green-50 rounded p-2">
                                <span className="font-mono">{pay.paymentNumber}</span>
                                <span>{pay.paymentDate}</span>
                                <span className="font-medium text-green-700">{pay.paymentAmount.toLocaleString()} ر</span>
                                <span>{paymentMethodLabels[pay.paymentMethod]}</span>
                                {pay.referenceNumber && <span className="font-mono text-gray-400">{pay.referenceNumber}</span>}
                              </div>
                            ))}
                          </div>
                        )}

                        {showPayForm === inst.id && (
                          <form onSubmit={e => handlePay(inst.id, e)} className="mt-3 pt-3 border-t border-gray-100 space-y-3">
                            <p className="text-sm font-semibold text-gray-700">تسجيل دفعة جديدة</p>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="label text-xs">المبلغ المدفوع</label>
                                <input type="number" className="input-field text-sm" value={payForm.paymentAmount} onChange={e => setPayForm({ ...payForm, paymentAmount: +e.target.value })} max={inst.installmentRemaining} required />
                              </div>
                              <div>
                                <label className="label text-xs">طريقة الدفع</label>
                                <select className="input-field text-sm" value={payForm.paymentMethod} onChange={e => setPayForm({ ...payForm, paymentMethod: e.target.value })}>
                                  {Object.entries(paymentMethodLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                                </select>
                              </div>
                              <div>
                                <label className="label text-xs">الآيبان (IBAN)</label>
                                <input className="input-field text-sm font-mono" value={payForm.iban} onChange={e => setPayForm({ ...payForm, iban: e.target.value })} placeholder="SA..." />
                              </div>
                              <div>
                                <label className="label text-xs">اسم الحساب</label>
                                <input className="input-field text-sm" value={payForm.accountName} onChange={e => setPayForm({ ...payForm, accountName: e.target.value })} />
                              </div>
                              <div>
                                <label className="label text-xs">اسم البنك</label>
                                <input className="input-field text-sm" value={payForm.bankName} onChange={e => setPayForm({ ...payForm, bankName: e.target.value })} />
                              </div>
                              <div>
                                <label className="label text-xs">الرقم المرجعي</label>
                                <input className="input-field text-sm font-mono" value={payForm.referenceNumber} onChange={e => setPayForm({ ...payForm, referenceNumber: e.target.value })} />
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button type="submit" className="btn-primary text-xs py-1.5 flex-1">تأكيد الدفع</button>
                              <button type="button" className="btn-secondary text-xs py-1.5 flex-1" onClick={() => setShowPayForm(null)}>إلغاء</button>
                            </div>
                          </form>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
