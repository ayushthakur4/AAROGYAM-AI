from pathlib import Path
import pypdfium2 as pdfium
from PIL import Image, ImageOps, ImageDraw, ImageFont
pdf=pdfium.PdfDocument(r'C:\Users\thaku\OneDrive\Desktop\AAROGYAM AI\doc_work\final-report.pdf')
out=Path(r'C:\Users\thaku\OneDrive\Desktop\AAROGYAM AI\doc_work\final-render')
out.mkdir(exist_ok=True)
thumbs=[]
for i in range(len(pdf)):
    page=pdf[i]; bmp=page.render(scale=1.05); img=bmp.to_pil().convert('RGB'); img.save(out/f'page-{i+1:02d}.png')
    im=img.copy(); im.thumbnail((550,715));
    tile=Image.new('RGB',(570,755),'#e5e1d9'); tile.paste(im,((570-im.width)//2,25));
    ImageDraw.Draw(tile).text((16,5),f'PAGE {i+1}',fill='#173c2f')
    thumbs.append(tile)
for start in range(0,len(thumbs),6):
    group=thumbs[start:start+6]; sheet=Image.new('RGB',(1140,2265),'#d4d1ca')
    for j,im in enumerate(group): sheet.paste(im,((j%2)*570,(j//2)*755))
    sheet.save(out/f'contact-{start//6+1}.jpg',quality=88)
print('pages',len(pdf),'sheets',len(list(out.glob('contact-*.jpg'))))
