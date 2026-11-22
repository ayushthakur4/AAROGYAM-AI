from docx import Document
from docx.oxml.ns import qn
p=r'C:\Users\thaku\OneDrive\Desktop\AAROGYAM_AI_MCA_Project_Report.docx';d=Document(p)
for i in [125,126,127,128,137,138,139,150,151,152,153]:
 x=d.paragraphs[i];print(i,repr(x.text[:50]),x.style.name,'direct-before',x.paragraph_format.page_break_before,'style-before',x.style.paragraph_format.page_break_before,[(b.get(qn('w:type'))) for b in x._p.xpath('.//w:br')])
