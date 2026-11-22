from docx import Document
from pathlib import Path
p=Path(r'C:\Users\thaku\OneDrive\Desktop\AAROGYAM_AI_MCA_Project_Report_Expanded.docx'); d=Document(p)
print('COVER IDENTITY')
for x in d.paragraphs[:22]:
 if any(k.lower() in x.text.lower() for k in ['Ayush Thakur','Roll No','3rd SEMESTER','HPTU']): print(x.text.replace('\n',' / '))
print('APPENDICES',[x.text.replace('\n',' / ') for x in d.paragraphs if 'APPENDIX ' in x.text])
print('DOCX',p.stat().st_size,'TABLES',len(d.tables),'INLINE_IMAGES',len(d.inline_shapes))
for name in ['Normal','Heading 1','Heading 2']:
 s=d.styles[name]; print('STYLE',name,'PT',s.font.size.pt if s.font.size else None)
