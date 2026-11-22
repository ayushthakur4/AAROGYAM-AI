from docx import Document
from docx.oxml.ns import qn
p=r'C:\Users\thaku\OneDrive\Desktop\AAROGYAM_AI_MCA_Project_Report.docx';d=Document(p)
for i,x in enumerate(d.paragraphs):
 sect=x._p.xpath('./w:pPr/w:sectPr')
 if sect: print('SECT',i,repr(x.text),sect[0].xml)
for i,x in enumerate(d.paragraphs):
 if 'CHAPTER 4' in x.text or 'CHAPTER 3' in x.text:
  print('PARA',i,x._p.xml)
