from docx import Document
p=r'C:\Users\thaku\OneDrive\Desktop\AyurSathi_MCA_Project_Report.docx'
d=Document(p)
print('paras',len(d.paragraphs),'tables',len(d.tables),'inline',len(d.inline_shapes))
for ti,t in enumerate(d.tables):
    print('TABLE',ti,len(t.rows),len(t.columns),repr(' | '.join(c.text.replace('\n',' / ') for c in t.rows[0].cells)[:220]))
for i,p in enumerate(d.paragraphs):
    if p._p.xpath('.//w:drawing'): print('IMAGE PARA',i,repr(p.text))
