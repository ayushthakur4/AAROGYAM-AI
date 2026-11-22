from docx import Document
p=r'C:\Users\thaku\OneDrive\Desktop\AAROGYAM_AI_MCA_Project_Report.docx'; d=Document(p)
for i,p in enumerate(d.paragraphs):
    br=[(x.get(qn) if False else x.get('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}type')) for x in p._p.xpath('.//w:br')]
    pb=bool(p._p.xpath('./w:pPr/w:pageBreakBefore'))
    if br or pb or (not p.text and i>115): print(i,'txt=',repr(p.text[:45]),'breaks',br,'before',pb)
for s in d.sections:
 for name,part in [('header',s.header),('footer',s.footer)]:
  for p in part.paragraphs: print(name,p._p.xml[:1200])
