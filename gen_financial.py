import pandas as pd, re

path = r'C:\Users\aliay\Downloads\financial.report.2026-03-20مالية.xlsx'
df = pd.read_excel(path, sheet_name=0, header=2)

cols = [
    'contractNumber','versionNumber','tenantId','tenantName','landlordId','landlordName',
    'contractStartDate','contractEndDate','propertyName',
    'invoiceNumber','invoiceDueDate','invoiceIssueDate','invoiceGraceDate',
    'invoiceStatus','invoiceStatusDescription','totalAmount','paidAmount','remainingAmount',
    'installmentNumber','installmentValue','installmentStatus',
    'installmentPaid','installmentRemaining','installmentDueDate','installmentGraceDate',
    'paymentMethod','paymentStatus','paymentNumber','paymentAmount','paymentDate',
    'receivingMethod','iban','accountName','transferStatus',
    'referenceNumber','uti','transferDate','bankName'
]
df.columns = cols
df = df.dropna(subset=['contractNumber'])
df['contractNumber'] = df['contractNumber'].astype(str).str.strip()
df = df[df['contractNumber'] != 'nan']

def s(v):
    if v is None: return ''
    sv = str(v).strip()
    return '' if sv in ('nan','NaT','None') else sv.replace("'", "\\'")

def n(v):
    try:
        f = float(v)
        return 0 if f != f else round(f)
    except: return 0

def date_str(v):
    sv = s(v)
    if not sv: return ''
    m = re.match(r'(\d{1,2})-(\d{1,2})-(\d{4})', sv)
    if m:
        return f"{m.group(3)}-{m.group(2).zfill(2)}-{m.group(1).zfill(2)}"
    if len(sv) >= 10:
        return sv[:10]
    return sv

inv_status_map = {'موافقة': 'pending', 'مغلقة': 'paid', 'تم الإنهاء': 'cancelled', 'مسودة': 'pending'}
inst_status_map = {'لم يتم الدفع': 'pending', 'تم الدفع': 'paid', 'غير مفعلة': 'pending', 'مدفوعة جزئياً': 'partial'}
pay_status_map = {'success': 'completed', 'pending': 'pending', 'inprogress': 'pending'}
pay_method_map = {'سداد': 'bank_transfer', 'نقداً': 'cash', 'شيك': 'cheque'}

# ---- CONTRACTS ----
contracts_seen = {}
contracts_lines = []
for _, row in df.iterrows():
    cn = s(row['contractNumber'])
    if cn in contracts_seen: continue
    contracts_seen[cn] = True
    start = date_str(row['contractStartDate'])
    end = date_str(row['contractEndDate'])
    prop = s(row['propertyName'])
    contracts_lines.append(
        "  {\n"
        f"    id: 'cr-{cn}',\n"
        f"    contractNumber: '{cn}',\n"
        f"    versionNumber: '{s(row['versionNumber'])}',\n"
        f"    tenantId: 'u4',\n"
        f"    tenantName: '{s(row['tenantName'])}',\n"
        f"    landlordId: 'u3',\n"
        f"    landlordName: '{s(row['landlordName'])}',\n"
        f"    unitId: '',\n"
        f"    propertyId: '',\n"
        f"    propertyName: '{prop}',\n"
        f"    titleDeedNumber: '',\n"
        f"    contractStartDate: '{start}',\n"
        f"    contractEndDate: '{end}',\n"
        f"    status: 'active',\n"
        "    createdAt: now,\n"
        "  }"
    )

# ---- INVOICES ----
invoices_seen = {}
invoices_lines = []
for _, row in df.iterrows():
    inv = s(row['invoiceNumber'])
    if inv in invoices_seen: continue
    invoices_seen[inv] = True
    cn = s(row['contractNumber'])
    status = inv_status_map.get(s(row['invoiceStatus']), 'pending')
    invoices_lines.append(
        "  {\n"
        f"    id: 'inv-{inv}',\n"
        f"    invoiceNumber: '{inv}',\n"
        f"    contractId: 'cr-{cn}',\n"
        f"    contractNumber: '{cn}',\n"
        f"    invoiceDueDate: '{date_str(row['invoiceDueDate'])}',\n"
        f"    invoiceIssueDate: '{date_str(row['invoiceIssueDate'])}',\n"
        f"    invoiceGraceDate: '{date_str(row['invoiceGraceDate'])}',\n"
        f"    invoiceStatus: '{status}',\n"
        f"    invoiceStatusDescription: '{s(row['invoiceStatusDescription'])}',\n"
        f"    totalAmount: {n(row['totalAmount'])},\n"
        f"    paidAmount: {n(row['paidAmount'])},\n"
        f"    remainingAmount: {n(row['remainingAmount'])},\n"
        "    createdAt: now,\n"
        "  }"
    )

# ---- INSTALLMENTS ----
installments_seen = {}
installments_lines = []
for _, row in df.iterrows():
    inst = s(row['installmentNumber'])
    if inst in installments_seen: continue
    installments_seen[inst] = True
    inv = s(row['invoiceNumber'])
    cn = s(row['contractNumber'])
    status = inst_status_map.get(s(row['installmentStatus']), 'pending')
    installments_lines.append(
        "  {\n"
        f"    id: 'inst-{inst}',\n"
        f"    installmentNumber: '{inst}',\n"
        f"    invoiceId: 'inv-{inv}',\n"
        f"    invoiceNumber: '{inv}',\n"
        f"    contractId: 'cr-{cn}',\n"
        f"    installmentValue: {n(row['installmentValue'])},\n"
        f"    installmentStatus: '{status}',\n"
        f"    installmentPaid: {n(row['installmentPaid'])},\n"
        f"    installmentRemaining: {n(row['installmentRemaining'])},\n"
        f"    installmentDueDate: '{date_str(row['installmentDueDate'])}',\n"
        f"    installmentGraceDate: '{date_str(row['installmentGraceDate'])}',\n"
        "    createdAt: now,\n"
        "  }"
    )

# ---- PAYMENTS ----
payments_seen = {}
payments_lines = []
for _, row in df.iterrows():
    pn = s(row['paymentNumber'])
    if not pn or pn in payments_seen: continue
    payments_seen[pn] = True
    inst = s(row['installmentNumber'])
    inv = s(row['invoiceNumber'])
    cn = s(row['contractNumber'])
    status = pay_status_map.get(s(row['paymentStatus']), 'completed')
    method = pay_method_map.get(s(row['paymentMethod']), 'bank_transfer')
    payments_lines.append(
        "  {\n"
        f"    id: 'pay-{pn}',\n"
        f"    paymentNumber: '{pn}',\n"
        f"    installmentId: 'inst-{inst}',\n"
        f"    installmentNumber: '{inst}',\n"
        f"    contractId: 'cr-{cn}',\n"
        f"    invoiceId: 'inv-{inv}',\n"
        f"    paymentAmount: {n(row['paymentAmount'])},\n"
        f"    paymentDate: '{date_str(row['paymentDate'])}',\n"
        f"    paymentMethod: '{method}',\n"
        f"    paymentStatus: '{status}',\n"
        f"    receivingMethod: '{s(row['receivingMethod'])}',\n"
        f"    iban: '{s(row['iban'])}',\n"
        f"    accountName: '{s(row['accountName'])}',\n"
        f"    bankName: '{s(row['bankName'])}',\n"
        f"    referenceNumber: '{s(row['referenceNumber'])}',\n"
        f"    uti: '{s(row['uti'])}',\n"
        f"    transferDate: '{date_str(row['transferDate'])}',\n"
        f"    transferStatus: '{s(row['transferStatus'])}',\n"
        "    createdAt: now,\n"
        "  }"
    )

base = r'C:\Users\aliay\.verdent\verdent-projects\RAMZABDAE'
for name, lines in [
    ('contracts', contracts_lines), ('invoices', invoices_lines),
    ('installments', installments_lines), ('payments', payments_lines)
]:
    with open(f'{base}\\{name}_block.txt', 'w', encoding='utf-8') as f:
        f.write(',\n'.join(lines))
    print(f'{name}: {len(lines)} records')
