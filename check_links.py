import re
with open(r'C:\Users\aliay\.verdent\verdent-projects\RAMZABDAE\src\data\db.ts', encoding='utf-8') as f:
    content = f.read()

prop_deeds = re.findall(r"titleDeedNumber: '([^']+)'", content[:60000])
unit_deeds = re.findall(r"titleDeedNumber: '([^']+)'", content[60000:200000])
print('Sample prop deedNums:', prop_deeds[:3])
print('Sample unit deedNums:', unit_deeds[:3])
overlap = set(prop_deeds) & set(unit_deeds)
print('Total props:', len(prop_deeds))
print('Total units deed:', len(unit_deeds))
print('Matching deedNums:', len(overlap))
if overlap:
    print('Sample matches:', list(overlap)[:3])
