from docx import Document
p=r'C:\Users\thaku\OneDrive\Desktop\AAROGYAM_AI_MCA_Project_Report.docx';d=Document(p)
for i,x in enumerate(d.paragraphs):
 b=[n.get('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}type') for n in x._p.xpath('.//w:br')]
 if i>115 and i<145: print(i,repr(x.text[:60]),b)
