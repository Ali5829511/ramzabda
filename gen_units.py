import pandas as pd

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

# Map Arabic status to English
status_map = {
    'متاحة': 'available',
    'مؤجرة': 'rented',
    'تحت الاجراء في عقد': 'reserved',
    'محجوزة': 'reserved',
    'صيانة': 'maintenance',
}
furnished_map = {
    'غير مؤثثة': 'unfurnished',
    'مؤثثة - جديد': 'furnished',
    'مؤثثة - مستعمل': 'semi-furnished',
}

def clean_str(v):
    if v is None or (isinstance(v, float)):
        return ''
    s = str(v).strip().replace("'", "\\'").replace('\n', '، ')
    return '' if s == 'nan' or s == 'NaT' else s

def clean_num(v):
    try:
        f = float(v)
        return int(f) if not (f != f) else 0  # nan check
    except:
        return 0

lines = []
for i, row in df.iterrows():
    deed = clean_str(row['titleDeedNumber'])
    unit_num = clean_str(row['unitNumber'])
    status_ar = clean_str(row['unitStatus'])
    status_en = status_map.get(status_ar, 'available')
    unit_type = clean_str(row['unitType'])
    area = clean_num(row['unitArea'])
    services = clean_str(row['unitServices'])
    furnished_ar = clean_str(row['furnishedStatus'])
    furnished_en = furnished_map.get(furnished_ar, 'unfurnished')
    facilities = clean_str(row['unitFacilities'])
    brokerage = clean_str(row['brokerageAgreementNumber'])
    version = clean_str(row['versionNumber'])
    main_contract = clean_str(row['mainContractNumber'])
    sub_contract = clean_str(row['subContractNumber'])
    contract_status = clean_str(row['contractStatus'])
    region = clean_str(row['region']) or 'الرياض'
    city = clean_str(row['city']) or 'الرياض'

    start_date = ''
    end_date = ''
    try:
        if str(row['contractStartDate']) not in ('nan', 'NaT', ''):
            start_date = str(row['contractStartDate'])[:10]
    except: pass
    try:
        if str(row['contractEndDate']) not in ('nan', 'NaT', ''):
            end_date = str(row['contractEndDate'])[:10]
    except: pass

    block = (
        "  {\n"
        f"    id: 'unit-real-{i}',\n"
        f"    propertyId: '',\n"
        f"    titleDeedNumber: '{deed}',\n"
        f"    unitNumber: '{unit_num}',\n"
        f"    unitStatus: '{status_en}',\n"
        f"    unitType: '{unit_type}',\n"
        f"    unitArea: {area},\n"
        f"    unitServices: '{services}',\n"
        f"    furnishedStatus: '{furnished_en}',\n"
        f"    unitFacilities: '{facilities}',\n"
        f"    brokerageAgreementNumber: '{brokerage}',\n"
        f"    versionNumber: '{version}',\n"
        f"    mainContractNumber: '{main_contract}',\n"
        f"    contractStatus: '{contract_status}',\n"
        f"    contractStartDate: '{start_date}',\n"
        f"    contractEndDate: '{end_date}',\n"
        f"    region: '{region}',\n"
        f"    city: '{city}',\n"
        "    createdAt: now,\n"
        "  }"
    )
    lines.append(block)

result = ',\n'.join(lines)
with open(r'C:\Users\aliay\.verdent\verdent-projects\RAMZABDAE\units_ts_block.txt', 'w', encoding='utf-8') as f:
    f.write(result)
print(f'Done: {len(lines)} units written')
