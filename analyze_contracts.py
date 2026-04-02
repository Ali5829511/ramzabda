import pandas as pd

path = r'C:\Users\aliay\Downloads\financial.report.2026-03-19 (1)عقود.xlsx'
df = pd.read_excel(path, sheet_name=0, header=0)

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

print(f'Total rows: {len(df)}')
print(f'\nUnique contracts: {df["contractNumber"].nunique()}')
print(f'Unique invoices: {df["invoiceNumber"].nunique()}')
print(f'Unique installments: {df["installmentNumber"].nunique()}')
paid_payments = df.dropna(subset=['paymentNumber'])
print(f'Rows with payments: {len(paid_payments)}')

print(f'\ninvoiceStatus values: {df["invoiceStatus"].value_counts().to_dict()}')
print(f'installmentStatus values: {df["installmentStatus"].value_counts().to_dict()}')
print(f'paymentStatus values: {df["paymentStatus"].value_counts().to_dict()}')
