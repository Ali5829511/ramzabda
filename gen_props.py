import json

with open(r'C:\Users\aliay\.verdent\verdent-projects\RAMZABDAE\properties_data.json', encoding='utf-8') as f:
    records = json.load(f)

prop_type_map = {
    'فيلا': 'villa',
    'عمارة': 'building',
    'شقة': 'apartment',
    'أرض': 'land',
    'تجاري': 'commercial',
    'سكني': 'residential',
    'سكني - تجاري': 'mixed',
    'أخرى': 'residential',
}

lines = []
for r in records:
    name = r['propertyName'].replace("'", "\\'")
    deed = str(r['titleDeedNumber']).replace("'", "\\'")
    deedType = r['titleDeedType'].replace("'", "\\'")
    pType = prop_type_map.get(r['propertyType'], 'residential')
    pUsage = r['propertyUsage'].replace("'", "\\'")
    facility = r['propertyFacility'].replace("'", "\\'")
    region = r['region'].replace("'", "\\'")
    city = r['city'].replace("'", "\\'")
    block = (
        "  {\n"
        f"    id: '{r['id']}',\n"
        f"    propertyName: '{name}',\n"
        f"    titleDeedNumber: '{deed}',\n"
        f"    titleDeedType: '{deedType}',\n"
        f"    ownerId: 'u3',\n"
        f"    propertyType: '{pType}',\n"
        f"    propertyUsage: '{pUsage}',\n"
        f"    propertyFacility: '{facility}',\n"
        f"    totalUnits: {r['totalUnits']},\n"
        f"    totalContracts: {r['totalContracts']},\n"
        f"    reservedUnits: {r['reservedUnits']},\n"
        f"    rentedUnits: {r['rentedUnits']},\n"
        f"    availableUnits: {r['availableUnits']},\n"
        f"    totalDocumentationFees: {r['totalDocumentationFees']},\n"
        f"    totalContractValue: {r['totalContractValue']},\n"
        f"    totalCommission: {r['totalCommission']},\n"
        f"    region: '{region}',\n"
        f"    city: '{city}',\n"
        "    createdAt: now,\n"
        "    isActive: true,\n"
        "  }"
    )
    lines.append(block)

result = ',\n'.join(lines)
with open(r'C:\Users\aliay\.verdent\verdent-projects\RAMZABDAE\props_ts_block.txt', 'w', encoding='utf-8') as f:
    f.write(result)
print(f'Done, total: {len(records)} properties')
