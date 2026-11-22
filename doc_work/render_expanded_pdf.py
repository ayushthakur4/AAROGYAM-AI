from pathlib import Path
import pypdfium2 as pdfium
from PIL import Image,ImageDraw
pdf=pdfium.PdfDocument(r'C:\Users\thaku\OneDrive\Desktop\AAROGYAM AI\doc_work\expanded-report.pdf')
out=Path(r'C:\Users\thaku\OneDrive\Desktop\AAROGYAM AI\doc_work\expanded-render');out.mkdir(exist_ok=True)
thumbs=[]
for i in range(len(pdf)):
    img=pdf[i].render(scale=.95).to_pil().convert('RGB');img.save(out/f'page-{i+1:02d}.png')
    img.thumbnail((550,715));tile=Image.new('RGB',(570,755),'#e5e1d9');tile.paste(img,((570-img.width)//2,25));ImageDraw.Draw(tile).text((15,5),f'PAGE {i+1}',fill='#173c2f');thumbs.append(tile)
for start in range(0,len(thumbs),6):
    sheet=Image.new('RGB',(1140,2265),'#d4d1ca')
    for j,img in enumerate(thumbs[start:start+6]):sheet.paste(img,((j%2)*570,(j//2)*755))
    sheet.save(out/f'contact-{start//6+1:02d}.jpg',quality=88)
print('PAGES',len(pdf),'SHEETS',(len(pdf)+5)//6)
