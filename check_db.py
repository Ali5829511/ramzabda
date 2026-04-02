import re
with open(r'C:\Users\aliay\.verdent\verdent-projects\RAMZABDAE\src\data\db.ts', encoding='utf-8') as f:
    content = f.read()
props = re.findall(r"id: 'prop-real-\d+'", content)
print(f'Total real properties: {len(props)}')
names = re.findall(r"propertyName: '([^']+)'", content)
print(f'First: {names[0]}')
print(f'Last: {names[-1]}')
