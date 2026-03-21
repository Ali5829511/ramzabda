import pandas as pd, re

path = r'C:\Users\aliay\Downloads\financial.report.2026-03-20مالية.xlsx'
df = pd.read_excel(path, sheet_name=0, header=2)  # header at row index 2

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
print(f'Unique contracts: {df["contractNumber"].nunique()}')
print(f'Unique invoices:  {df["invoiceNumber"].nunique()}')
print(f'Unique installments: {df["installmentNumber"].nunique()}')
print(f'Rows with payments: {len(df.dropna(subset=["paymentNumber"]))}')
print(f'Unique payments: {df["paymentNumber"].dropna().nunique()}')
print(f'\ninvoiceStatus: {df["invoiceStatus"].value_counts().to_dict()}')
print(f'installmentStatus: {df["installmentStatus"].value_counts().to_dict()}')
print(f'paymentStatus: {df["paymentStatus"].value_counts().to_dict()}')
