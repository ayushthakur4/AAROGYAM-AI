from docx import Document
p=r'C:\Users\thaku\OneDrive\Desktop\AyurSathi_MCA_Project_Report.docx'; d=Document(p)
for s in d.sections:
 for label,part in [('header',s.header),('footer',s.footer),('firstheader',s.first_page_header),('firstfooter',s.first_page_footer)]:
  print(label,[(x.text,[(r.text, bool(r._r.xpath('.//w:instrText'))) for r in x.runs]) for x in part.paragraphs])
