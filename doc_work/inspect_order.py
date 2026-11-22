from docx import Document
from docx.oxml.ns import qn
p=r'C:\Users\thaku\OneDrive\Desktop\AAROGYAM_AI_MCA_Project_Report.docx';d=Document(p)
body=d._element.body
idx=0
for el in body.iterchildren():
 if el.tag.endswith('}p'):
  from docx.text.paragraph import Paragraph
  x=Paragraph(el,d)
  if x.text.strip() and (x.text.startswith('B.') or x.text.startswith('APPENDIX B') or x.text.startswith('Source file') or x.text.startswith('The') or x.text.startswith('Zod')):
   print('P',repr(x.text[:95]))
 elif el.tag.endswith('}tbl'):
  print('T',repr(el.xpath('.//w:t/text()')[:2]))
