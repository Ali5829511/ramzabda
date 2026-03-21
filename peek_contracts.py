import pandas as pd, openpyxl

path = r'C:\Users\aliay\Downloads\financial.report.2026-03-19 (1)عقود.xlsx'

wb = openpyxl.load_workbook(path, read_only=True, data_only=True)
for name in wb.sheetnames:
    ws = wb[name]
    print(f'[{name}] rows={ws.max_row} cols={ws.max_column}')
wb.close()

df = pd.read_excel(path, sheet_name=0, header=None, nrows=6)
print('\nFirst 6 rows:')
print(df.to_string())
