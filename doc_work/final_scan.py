from docx import Document
from pathlib import Path
import hashlib,re
p=Path(r'C:\Users\thaku\OneDrive\Desktop\AAROGYAM_AI_MCA_Project_Report.docx'); d=Document(p)
text='\n'.join(x.text for x in d.paragraphs)+'\n'+'\n'.join(c.text for t in d.tables for row in t.rows for c in row.cells)
for s in d.sections:
 text+='\n'+'\n'.join(x.text for x in s.header.paragraphs+s.footer.paragraphs)
for term in ['AyurSathi','MongoDB','Mongoose','React Native','Android Application','SCREENSHOT PLACEHOLDER','AIza']:
 print('SCAN',term,term.lower() in text.lower())
print('PARAGRAPHS',len(d.paragraphs),'TABLES',len(d.tables),'IMAGES',len(d.inline_shapes),'SHA256',hashlib.sha256(p.read_bytes()).hexdigest())
