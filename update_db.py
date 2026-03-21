import re

# Read the ts block
with open(r'C:\Users\aliay\.verdent\verdent-projects\RAMZABDAE\props_ts_block.txt', encoding='utf-8') as f:
    props_block = f.read()

# Read db.ts
with open(r'C:\Users\aliay\.verdent\verdent-projects\RAMZABDAE\src\data\db.ts', encoding='utf-8') as f:
    db_content = f.read()

# Replace the properties array content
# Find "export const properties: Property[] = [" ... "];"
old_pattern = r'(export const properties: Property\[\] = \[).*?(\];)'
new_props = r'\1\n' + props_block + r'\n\2'
new_content = re.sub(old_pattern, new_props, db_content, flags=re.DOTALL)

with open(r'C:\Users\aliay\.verdent\verdent-projects\RAMZABDAE\src\data\db.ts', 'w', encoding='utf-8') as f:
    f.write(new_content)

print('db.ts updated successfully!')
# count lines
print(f'Total lines: {len(new_content.splitlines())}')
