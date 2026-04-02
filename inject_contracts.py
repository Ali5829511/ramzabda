import re

def inject(db_content, array_name, block_file):
    with open(block_file, encoding='utf-8') as f:
        block = f.read()
    pattern = rf'(export const {array_name}[^=]*= \[).*?(\];)'
    new_content = re.sub(pattern, r'\1\n' + block + r'\n\2', db_content, flags=re.DOTALL)
    if new_content == db_content:
        print(f'WARNING: Pattern not found for {array_name}')
    else:
        count = len(re.findall(r"^\s+id: '", block, re.MULTILINE))
        print(f'{array_name}: {count} records injected')
    return new_content

with open(r'C:\Users\aliay\.verdent\verdent-projects\RAMZABDAE\src\data\db.ts', encoding='utf-8') as f:
    db = f.read()

db = inject(db, 'contracts', r'C:\Users\aliay\.verdent\verdent-projects\RAMZABDAE\contracts_block.txt')
db = inject(db, 'invoices', r'C:\Users\aliay\.verdent\verdent-projects\RAMZABDAE\invoices_block.txt')
db = inject(db, 'installments', r'C:\Users\aliay\.verdent\verdent-projects\RAMZABDAE\installments_block.txt')
db = inject(db, 'payments', r'C:\Users\aliay\.verdent\verdent-projects\RAMZABDAE\payments_block.txt')

with open(r'C:\Users\aliay\.verdent\verdent-projects\RAMZABDAE\src\data\db.ts', 'w', encoding='utf-8') as f:
    f.write(db)

print(f'\nTotal lines: {len(db.splitlines())}')
