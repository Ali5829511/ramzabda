import re

with open(r'C:\Users\aliay\.verdent\verdent-projects\RAMZABDAE\units_ts_block.txt', encoding='utf-8') as f:
    units_block = f.read()

with open(r'C:\Users\aliay\.verdent\verdent-projects\RAMZABDAE\src\data\db.ts', encoding='utf-8') as f:
    db_content = f.read()

old_pattern = r'(export const units: Unit\[\] = \[).*?(\];)'
new_units = r'\1\n' + units_block + r'\n\2'
new_content = re.sub(old_pattern, new_units, db_content, flags=re.DOTALL)

if new_content == db_content:
    print('ERROR: Pattern not found - no replacement made!')
else:
    with open(r'C:\Users\aliay\.verdent\verdent-projects\RAMZABDAE\src\data\db.ts', 'w', encoding='utf-8') as f:
        f.write(new_content)
    unit_ids = re.findall(r"id: 'unit-real-\d+'", new_content)
    print(f'db.ts updated: {len(unit_ids)} units injected')
    print(f'Total lines: {len(new_content.splitlines())}')
