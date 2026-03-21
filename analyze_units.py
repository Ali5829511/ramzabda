import pandas as pd, json

path = r'C:\Users\aliay\Downloads\units.report.2026-03-19  الواحدات.xlsx'

df = pd.read_excel(path, sheet_name=0, header=0)
df.columns = [
    'propertyName','titleDeedNumber','unitNumber','unitStatus','unitType',
    'unitArea','unitServices','furnishedStatus','unitFacilities',
    'brokerageAgreementNumber','versionNumber','mainContractNumber',
    'subContractNumber','contractStatus','contractStartDate','contractEndDate',
    'region','city'
]

df = df.dropna(subset=['propertyName'])
df['propertyName'] = df['propertyName'].astype(str).str.strip()
df = df[df['propertyName'] != 'nan']

print(f'Total units: {len(df)}')
print(f'\nColumns: {list(df.columns)}')
print(f'\nunitStatus values: {df["unitStatus"].value_counts().to_dict()}')
print(f'unitType values: {df["unitType"].value_counts().to_dict()}')
print(f'furnishedStatus values: {df["furnishedStatus"].value_counts().to_dict()}')
print(f'\nSample row:')
print(df.iloc[0].to_dict())
