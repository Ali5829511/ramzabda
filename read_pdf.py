from pypdf import PdfReader
r = PdfReader('C:/Users/aliay/Downloads/ERD_Property_Management_Model.pdf')
print('Pages:', len(r.pages))
for i in range(len(r.pages)):
    print(f'--- Page {i+1} ---')
    print(r.pages[i].extract_text())
