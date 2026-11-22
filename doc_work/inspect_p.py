from docx import Document
p=r'C:\Users\thaku\OneDrive\Desktop\AAROGYAM_AI_MCA_Project_Report.docx';d=Document(p)
for i in range(123,132):
 x=d.paragraphs[i];print(i,repr(x.text),x.style.name,'pb',x.paragraph_format.page_break_before,'xml',x._p.xml[-350:])
