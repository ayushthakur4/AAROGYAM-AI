from copy import deepcopy
from pathlib import Path
import hashlib
from PIL import Image, ImageDraw, ImageFont
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_CELL_VERTICAL_ALIGNMENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

ROOT = Path(r'C:\Users\thaku\OneDrive\Desktop\AAROGYAM AI')
SOURCE = Path(r'C:\Users\thaku\OneDrive\Desktop\AyurSathi_MCA_Project_Report.docx')
OUT = Path(r'C:\Users\thaku\OneDrive\Desktop\AAROGYAM_AI_MCA_Project_Report.docx')
WORK = ROOT / 'doc_work'
FIG = WORK / 'figures'
FIG.mkdir(exist_ok=True)

GREEN = '#204C3C'; DEEP = '#16372E'; MINT = '#E8F1E8'; CREAM = '#FBF5EB'
ORANGE = '#CC7440'; DARK = '#2F2A25'; MUTED = '#71685E'; BLUE = '#EAF0F5'

def font(size, bold=False):
    choices = [r'C:\Windows\Fonts\segoeuib.ttf' if bold else r'C:\Windows\Fonts\segoeui.ttf',
               r'C:\Windows\Fonts\arialbd.ttf' if bold else r'C:\Windows\Fonts\arial.ttf']
    for path in choices:
        if Path(path).exists(): return ImageFont.truetype(path, size)
    return ImageFont.load_default()

def rounded(draw, box, fill, outline='#D5DED5', radius=24, width=3):
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)

def wrap(draw, text, fnt, max_width):
    words = text.split(); lines=[]; line=''
    for w in words:
        test = (line + ' ' + w).strip()
        if draw.textbbox((0,0), test, font=fnt)[2] <= max_width: line=test
        else:
            if line: lines.append(line)
            line=w
    if line: lines.append(line)
    return lines

def label(draw, x, y, text, fnt, fill=DARK, max_width=460, leading=1.28, anchor='mm'):
    lines = wrap(draw, text, fnt, max_width)
    h = fnt.size * leading
    for i, line in enumerate(lines):
        draw.text((x, y + (i-(len(lines)-1)/2)*h), line, font=fnt, fill=fill, anchor=anchor)

def arrow(draw, a, b, color=GREEN, width=6, label_text=None, label_xy=None):
    draw.line([a,b], fill=color, width=width)
    import math
    ang=math.atan2(b[1]-a[1],b[0]-a[0]); L=22; spread=.55
    p1=(b[0]-L*math.cos(ang-spread),b[1]-L*math.sin(ang-spread))
    p2=(b[0]-L*math.cos(ang+spread),b[1]-L*math.sin(ang+spread))
    draw.polygon([b,p1,p2],fill=color)
    if label_text:
        x,y=label_xy or ((a[0]+b[0])//2,(a[1]+b[1])//2-24)
        f=font(22,True); bb=draw.textbbox((x,y),label_text,font=f,anchor='mm')
        draw.rounded_rectangle((bb[0]-10,bb[1]-7,bb[2]+10,bb[3]+7),radius=10,fill=CREAM)
        draw.text((x,y),label_text,font=f,fill=ORANGE,anchor='mm')

def node(draw, box, title, sub, fill=MINT):
    rounded(draw,box,fill,outline='#C8D7CB',radius=25,width=3)
    x=(box[0]+box[2])/2; y=box[1]+47
    label(draw,x,y,title,font(29,True),GREEN,max_width=box[2]-box[0]-40)
    label(draw,x,y+78,sub,font(22),DARK,max_width=box[2]-box[0]-42)

def title_bar(im, kicker, title, subtitle):
    d=ImageDraw.Draw(im)
    d.text((75,50),kicker.upper(),font=font(22,True),fill=ORANGE)
    d.text((75,88),title,font=font(42,True),fill=DEEP)
    d.text((75,146),subtitle,font=font(22),fill=MUTED)

def make_architecture():
    im=Image.new('RGB',(1800,900),CREAM); d=ImageDraw.Draw(im)
    title_bar(im,'AAROGYAM AI • SYSTEM ANALYSIS','DFD Level 0 — System Context','External entities, application boundary, and data stores used by the implemented product')
    node(d,(55,350,315,545),'User','Enters a wellness topic; reads the returned guide',BLUE)
    node(d,(410,325,740,570),'React + Vite','Browser interface • search form • guide rendering\nDirect YouTube keyword-search links')
    node(d,(875,325,1205,570),'Node.js API','HTTP routes • input validation • safety gate\nGemini orchestration • session persistence', '#F8EBDC')
    node(d,(1370,245,1705,425),'Google Gemini','Structured guide generation\n(JSON response contract)',BLUE)
    node(d,(1370,510,1705,690),'Supabase','Auth token verification • PostgreSQL\nRLS • owner-scoped save RPC',MINT)
    arrow(d,(315,430),(410,430),label_text='topic / guide',label_xy=(362,390))
    arrow(d,(740,435),(875,435),label_text='POST /api/search',label_xy=(808,390))
    arrow(d,(1205,370),(1370,335),label_text='prompt / JSON',label_xy=(1286,320))
    arrow(d,(1370,390),(1205,455),label_text='validated guide',label_xy=(1290,438))
    arrow(d,(1205,495),(1370,575),label_text='bearer / RPC',label_xy=(1290,555))
    arrow(d,(1370,630),(1205,535),label_text='save IDs / status',label_xy=(1290,650))
    # Browser-to-YouTube remains a direct user navigation, outside the API.
    rounded(d,(430,680,1190,790),'#F7EEE0',outline='#E5CEB7',radius=20)
    label(d,810,718,'Browser navigation from yoga card',font(24,True),ORANGE,max_width=700)
    label(d,810,756,'YouTube keyword search opens directly; no YouTube API key or server call',font(21),DARK,max_width=700)
    arrow(d,(575,570),(575,680),color=ORANGE,label_text='click card',label_xy=(655,620))
    im.save(FIG/'dfd-level-0.png')

def make_level1():
    im=Image.new('RGB',(1800,1150),CREAM); d=ImageDraw.Draw(im)
    title_bar(im,'AAROGYAM AI • DETAILED DATA FLOW','DFD Level 1 — Search and Guide Persistence','The API returns generated results for guests and writes history only for a verified signed-in session')
    node(d,(45,345,290,540),'User / Browser','Search topic; optionally supplies Supabase bearer token',BLUE)
    node(d,(360,330,650,555),'1. Validate request','POST /api/search • 8 KB body cap\nZod: trimmed query, 1–180 chars',MINT)
    node(d,(720,330,1000,555),'2. Safety controls','Emergency phrase screen • rate limit\n422 urgent guidance / 429 throttling','#F8EBDC')
    node(d,(1070,330,1350,555),'3. Generate guide','Gemini structured JSON\nZod output validation • content checks',BLUE)
    node(d,(1450,250,1740,435),'4. Verify session','Supabase Auth getUser\nNo bearer token = anonymous',MINT)
    node(d,(1450,520,1740,705),'5. Save guide','RPC save_wellness_guide\nOwner-scoped SECURITY DEFINER',MINT)
    node(d,(1060,820,1395,1015),'PostgreSQL','searches • wellness_guides\nremedies • yoga_practices',BLUE)
    node(d,(510,820,850,1015),'6. Return JSON','summary • safety note • remedies • yoga\nhistory status and saved IDs where applicable', '#F8EBDC')
    arrow(d,(290,430),(360,430),label_text='JSON + optional auth',label_xy=(325,390))
    arrow(d,(650,430),(720,430))
    arrow(d,(1000,430),(1070,430),label_text='safe topic',label_xy=(1035,390))
    arrow(d,(1350,390),(1450,345),label_text='guide + bearer',label_xy=(1400,335))
    arrow(d,(1595,435),(1595,520),label_text='verified user',label_xy=(1675,475))
    arrow(d,(1450,620),(1395,875),label_text='RPC writes',label_xy=(1465,760))
    arrow(d,(1060,920),(850,920),label_text='IDs / status',label_xy=(955,880))
    arrow(d,(510,855),(290,510),label_text='200 guide response',label_xy=(365,700))
    # Guest path is explicitly shown as non-persistent.
    rounded(d,(1375,770,1735,880),'#F7EEE0',outline='#E5CEB7',radius=20)
    label(d,1555,805,'Guest / unavailable DB',font(22,True),ORANGE,max_width=310)
    label(d,1555,845,'Guide still returns with status',font(18),DARK,max_width=310)
    arrow(d,(1450,410),(1375,790),color=ORANGE,label_text='anonymous path',label_xy=(1414,650))
    im.save(FIG/'dfd-level-1.png')

def make_backend_flow():
    im=Image.new('RGB',(1800,920),CREAM); d=ImageDraw.Draw(im)
    title_bar(im,'AAROGYAM AI • IMPLEMENTATION','Backend Workflow — Request Lifecycle','Node.js native HTTP server coordinates validation, emergency screening, Gemini, and optional persistence')
    cols=[(100,'CLIENT'),(510,'API SERVER'),(980,'AI PROVIDER'),(1440,'SUPABASE')]
    for x,t in cols:
        d.text((x,240),t,font=font(23,True),fill=GREEN)
        d.line((x+90,280,x+90,830),fill='#C9D5CB',width=3)
    steps=[
      (190,330,'POST /api/search','query + optional Authorization'),
      (600,330,'Parse + validate','8 KB limit; Zod 1–180 chars'),
      (600,455,'Emergency + rate checks','urgent input → 422; limit → 429'),
      (1100,455,'Generate structured JSON','Gemini + response schema'),
      (600,600,'Validate generated guide','Zod structure + unsafe advice checks'),
      (1510,600,'Verify bearer with Auth','getUser(token); invalid → 401'),
      (1510,725,'Call save_wellness_guide','Only for authenticated user'),
      (1100,725,'Database result','search and normalized guide rows'),
      (190,790,'Render results page','guide + historyStatus'),
    ]
    positions={}
    for x,y,t,s in steps:
        box=(x-145,y-44,x+170,y+45); rounded(d,box,'#FFFFFF',outline='#CED9CF',radius=16,width=2)
        label(d,x+12,y-10,t,font(20,True),DEEP,max_width=275)
        label(d,x+12,y+18,s,font(16),MUTED,max_width=280)
        positions[(x,y)]=(box[0],box[1],box[2],box[3])
    arrow(d,(360,330),(455,330))
    arrow(d,(680,375),(680,410))
    arrow(d,(850,455),(955,455))
    arrow(d,(1100,500),(850,575))
    arrow(d,(770,600),(1365,600),color=ORANGE,label_text='if signed in',label_xy=(1050,565))
    arrow(d,(1600,645),(1600,680))
    arrow(d,(1440,725),(1270,725))
    arrow(d,(1090,770),(360,790),label_text='JSON response',label_xy=(720,755))
    d.text((92,865),'Error boundaries: invalid JSON → 400 • oversized body → 413 • emergency → 422 • rate limit → 429 • provider failure → safe 502',font=font(18),fill=MUTED)
    im.save(FIG/'backend-workflow.png')

def make_data_model():
    im=Image.new('RGB',(1800,860),CREAM); d=ImageDraw.Draw(im)
    title_bar(im,'AAROGYAM AI • DATA DESIGN','Supabase Data Model — Owner-Scoped Wellness History','Simplified entity relationship view; exact columns are defined by the project migrations')
    entities={
      'profiles':(100,330,430,520,['id (auth user)','display fields']),
      'searches':(565,260,895,450,['user_id • query','created_at']),
      'wellness_guides':(565,540,895,730,['search_id • summary','safety_note • model']),
      'remedies':(1070,345,1380,535,['guide_id • title','steps • precautions']),
      'yoga_practices':(1450,345,1755,535,['guide_id • title','duration • steps']),
      'saved_items':(1070,620,1380,800,['user_id • item refs']),
    }
    for title,(x1,y1,x2,y2,rows) in entities.items():
        rounded(d,(x1,y1,x2,y2),'#FFFFFF',outline='#BFD0C4',radius=18,width=3)
        d.rounded_rectangle((x1,y1,x2,y1+54),radius=18,fill=GREEN)
        d.rectangle((x1,y1+32,x2,y1+54),fill=GREEN)
        d.text(((x1+x2)//2,y1+27),title,font=font(24,True),fill='white',anchor='mm')
        for i,row in enumerate(rows): d.text(((x1+x2)//2,y1+95+i*40),row,font=font(19),fill=DARK,anchor='mm')
    arrow(d,(430,385),(565,345),label_text='1 : many',label_xy=(495,330))
    arrow(d,(730,450),(730,540),label_text='1 : 1 guide',label_xy=(815,495))
    arrow(d,(895,620),(1070,440),label_text='1 : many',label_xy=(990,510))
    arrow(d,(895,650),(1450,450),label_text='1 : many',label_xy=(1190,570))
    arrow(d,(430,445),(1070,700),color=ORANGE,label_text='owner saves',label_xy=(760,620))
    d.text((110,815),'Row-level security scopes user-owned records. Guest searches do not persist. Writes occur through the authenticated save_wellness_guide RPC.',font=font(19),fill=MUTED)
    im.save(FIG/'database-model.png')

def set_paragraph(p, text, *, bold=None, size=None, color=None, italic=None):
    old = p.runs[0] if p.runs else None
    rpr = deepcopy(old._r.rPr) if old is not None and old._r.rPr is not None else None
    p.clear()
    r=p.add_run(text)
    if rpr is not None: r._r.insert(0,rpr)
    if size: r.font.size=Pt(size)
    if bold is not None: r.bold=bold
    if italic is not None: r.italic=italic
    if color: r.font.color.rgb=RGBColor.from_string(color)
    return p

def set_cell(cell, text, bold=False, size=9, color=None):
    cell.text=''
    p=cell.paragraphs[0]
    p.paragraph_format.space_after=Pt(1)
    r=p.add_run(str(text)); r.bold=bold; r.font.name='Times New Roman'; r.font.size=Pt(size)
    if color: r.font.color.rgb=RGBColor.from_string(color)
    cell.vertical_alignment=WD_CELL_VERTICAL_ALIGNMENT.CENTER

def replace_table(table, rows, *, code=False):
    while len(table.rows)<len(rows): table._tbl.append(deepcopy(table.rows[-1]._tr))
    while len(table.rows)>len(rows): table._tbl.remove(table.rows[-1]._tr)
    for ri,row in enumerate(rows):
        for ci,value in enumerate(row):
            cell=table.cell(ri,ci)
            set_cell(cell,value,bold=(ri==0),size=(8 if code else (7.8 if len(rows[0])>=3 else 9)),color=('FFFFFF' if ri==0 else None))
            if ri==0:
                tcPr=cell._tc.get_or_add_tcPr(); shd=OxmlElement('w:shd'); shd.set(qn('w:fill'),GREEN[1:]); tcPr.append(shd)

def clear_cell(cell):
    for p in cell.paragraphs: p.clear()

def add_image_cell(table, path, width=6.05):
    cell=table.cell(0,0); clear_cell(cell)
    row=table.rows[0]
    trPr=row._tr.get_or_add_trPr()
    for el in list(trPr):
        if el.tag in (qn('w:trHeight'),): trPr.remove(el)
    p=cell.paragraphs[0]; p.alignment=WD_ALIGN_PARAGRAPH.CENTER
    p.add_run().add_picture(str(path),width=Inches(width))
    cell.vertical_alignment=WD_CELL_VERTICAL_ALIGNMENT.CENTER
    # Remove placeholder table borders/background.
    for c in row.cells:
        tcPr=c._tc.get_or_add_tcPr()
        shd=tcPr.find(qn('w:shd'))
        if shd is not None: tcPr.remove(shd)

def set_code_cell(table, code):
    cell=table.cell(0,0); cell.text=''
    p=cell.paragraphs[0]; p.paragraph_format.space_after=Pt(1); p.paragraph_format.left_indent=Inches(.08)
    for i,line in enumerate(code.strip('\n').splitlines()):
        if i: p.add_run().add_break()
        r=p.add_run(line or ' '); r.font.name='Consolas'; r.font.size=Pt(7.8); r.font.color.rgb=RGBColor.from_string('244337')
    cell.vertical_alignment=WD_CELL_VERTICAL_ALIGNMENT.CENTER

def main():
    make_architecture(); make_level1(); make_backend_flow(); make_data_model()
    doc=Document(str(SOURCE))
    para=doc.paragraphs
    replacements={
      12:'AAROGYAM AI: AI-POWERED WELLNESS GUIDANCE PLATFORM',
      13:'(React and Vite Web Client | Node.js API | Supabase Database)',
      23:'This is to certify that the project report entitled “AAROGYAM AI: AI-Powered Wellness Guidance Platform”, submitted to the Department of Computer Applications and Engineering, Himachal Pradesh Technical University (HPTU), Hamirpur, in partial fulfilment of the requirements for the degree of Master of Computer Applications (MCA), is a record of project work carried out by Ayush Thakur (Roll No. 2514930020) under the guidance of Er. Neha Dhiman, Head of Department (MCA), during the academic session 2025–2027.',
      24:'The report documents the implemented React and Vite web client, JavaScript Node.js API, Gemini-generated structured wellness guidance, and Supabase authentication and PostgreSQL persistence. Certification and originality are subject to review and signature by the department and project guide.',
      28:'I, Ayush Thakur (Roll No. 2514930020), student of Master of Computer Applications at Himachal Pradesh Technical University, Hamirpur, declare that this report, entitled “AAROGYAM AI: AI-Powered Wellness Guidance Platform”, presents the work completed for my MCA project to the best of my knowledge. The project is a browser-based React and Vite client with a JavaScript Node.js API and Supabase authentication and database services.',
      29:'I have identified the software frameworks, libraries, and services used in the project and distinguish implemented features from proposed improvements. Wellness guidance is informational, AI-generated, and not a diagnosis or treatment plan; users should consult a qualified healthcare professional for medical concerns.',
      33:'I express my sincere gratitude to Er. Neha Dhiman, my Project Guide and Head of Department (MCA), Department of Computer Applications and Engineering, Himachal Pradesh Technical University, Hamirpur, for her academic guidance and support during this project. I am thankful to the department for the opportunity to apply software engineering concepts to the design and development of AAROGYAM AI.',
      34:'I also thank my family and peers for their encouragement. I acknowledge the authors and communities behind React, Vite, Node.js, Supabase, PostgreSQL, Google Gemini, and the JavaScript ecosystem whose software and documentation supported the implementation.',
      37:'AAROGYAM AI is a browser-based wellness guidance application that combines traditional wellness perspectives with a modern web interface. Users submit a topic through a React and Vite client. A JavaScript Node.js API validates the request, screens emergency phrases, applies rate limits, and requests a structured JSON guide from Google Gemini. The generated response is schema-validated and includes a summary, cautious home-comfort suggestions, gentle yoga practices, and a safety note.',
      38:'The client uses Supabase Auth for account sessions and Supabase PostgreSQL for owner-scoped history. For a valid signed-in session, the server verifies the bearer token and calls a restricted save_wellness_guide database function; guest guides are returned without persistence. Row-level security protects user-owned records. The results page includes locally stored pose artwork linked to direct YouTube keyword searches; it does not use the YouTube API. Automated checks executed for this report passed: 21 client tests, 8 server tests, and 8 database tests. The system is an educational wellness product, not a diagnostic or treatment service.',
      39:'Keywords: React, Vite, JavaScript, Node.js, Supabase, PostgreSQL, Gemini AI, wellness guidance, data-flow diagram.',
      57:'Appendix A  Application Screenshots and Visual Evidence',
      58:'Page numbers can be updated in Microsoft Word after opening this report.',
      61:'Figure 3.1  DFD Level 0 system context',
      62:'Figure 3.2  DFD Level 1 search and persistence flow',
      63:'Figure 3.3  Supabase owner-scoped data model',
      64:'Figure 4.1  Backend request lifecycle workflow',
      65:'Figure A.1  AAROGYAM AI landing page and wellness search',
      66:'Figure A.2  Generated guide and safety notice',
      67:'Figure A.3  Yoga pose cards with direct YouTube keyword search',
      68:'Figure A.4  System context diagram',
      69:'Figure A.5  Detailed backend workflow',
      72:'Digital wellness information is often scattered across websites, apps, and services. AAROGYAM AI provides one web workflow for exploring general comfort ideas and gentle yoga suggestions. It combines a browser interface with a server-side AI integration and a database path for signed-in users who choose to save history.',
      73:'The application is an educational software project. Generative models can provide incomplete or unsuitable information. The interface and API use explicit safety language and emergency screening; these controls reduce some risks but cannot establish clinical accuracy or replace professional care.',
      75:'The engineering problem is to deliver a clear web experience for wellness topic searches while coordinating input validation, emergency handling, AI output checks, optional authenticated persistence, and graceful handling of network or provider failures. The project also needs to protect user-owned history and avoid exposing private server credentials.',
      77:'The aim is to design and implement a web-based wellness guidance application supported by a secure JavaScript API. Its objectives are:',
      78:'Provide a responsive browser search flow for a user-entered wellness topic.',
      79:'Return structured summaries, general comfort suggestions, gentle yoga guidance, and safety notes.',
      80:'Generate schema-constrained JSON using Gemini and validate it before presentation.',
      81:'Support Supabase authentication and owner-scoped guide history for signed-in users.',
      82:'Screen obvious emergencies, limit repeated requests, and communicate service errors safely.',
      83:'Offer pose-specific local thumbnails that open direct YouTube keyword searches.',
      85:'The implemented scope includes a React and Vite client, JavaScript Node.js HTTP API, Gemini integration, Supabase Auth and PostgreSQL schema/RPC, user-owned saved/history records, and the direct YouTube keyword-search cards. The browser opens YouTube search results directly from those cards; no YouTube API integration is used. The project does not provide a native Android application.',
      87:'Chapter 2 defines the requirements and feasibility. Chapter 3 explains the architecture, data flows, API, database, and user flows. Chapter 4 documents the client and server implementation. Chapter 5 records the executed verification checks. Chapter 6 discusses security, privacy, safety, and limitations. Chapter 7 concludes and identifies future development.',
      91:'The proposed system provides a consistent browser workflow rather than requiring users to assemble information from several sources. The client sends a topic to the Node API. The server applies validation and safety checks, requests a structured guide from Gemini, validates the result, and optionally persists it through the authenticated Supabase flow. Unlike a static catalogue, generated content may vary and depends on external service availability.',
      95:'Technical feasibility: the repository uses established JavaScript tools and a clear HTTP boundary. AI generation and authenticated history require valid service configuration and network access.',
      96:'Economic feasibility: the implementation uses open-source development tools; hosting, database, and AI use may be subject to provider quotas or charges.',
      97:'Operational feasibility: users interact with the browser client and do not need direct access to the API or database.',
      100:'The repository does not provide a verified dated work log. The following phases describe the logical development sequence and should not be read as dated completion claims.',
      104:'AAROGYAM AI uses a browser-client/server architecture. The React and Vite client collects a wellness topic, submits it to the Node.js API, and renders the returned guide. The API validates and screens the request, calls Gemini for structured content, validates the response, and attempts owner-scoped persistence for a verified Supabase session. The UI also includes locally bundled yoga illustrations linked to direct YouTube keyword search.',
      105:'Browser user → React + Vite client → Node.js API → Gemini structured generation → response validation → optional Supabase Auth and PostgreSQL persistence → results page',
      107:'The user enters a topic in the browser search form.',
      108:'The client sends POST /api/search with JSON { query }; optional authenticated flows send a Supabase bearer token.',
      109:'The server enforces an 8 KB body limit and validates a trimmed query of 1–180 characters.',
      110:'The API screens emergency phrases and limits each client IP to 20 searches per 15-minute window.',
      111:'For an accepted query, Gemini returns structured JSON which the server validates against Zod schemas and safety checks.',
      112:'For a signed-in user, Supabase Auth verifies the token and the save_wellness_guide RPC persists the guide; a guest receives the guide without saved history.',
      113:'The client renders the summary, safety note, remedies, and yoga suggestions; optional video cards open external YouTube keyword search.',
      116:'Figure 3.1: DFD Level 0 context diagram for the AAROGYAM AI browser client, API, external AI service, and Supabase.',
      118:'Figure 3.2: DFD Level 1 request validation, safety gate, structured generation, and authenticated persistence.',
      120:'GET /api/health returns a service status. POST /api/search accepts a JSON query and returns the validated guide payload, including summary, safetyNote, remedies, yoga, videos, historySaved, and historyStatus. The server returns 400 for invalid input, 413 for an oversized body, 422 for emergency phrases, 429 for rate limits, 401 for an invalid authenticated session, 404 for unknown routes, and a safe 502 if guide generation fails.',
      122:'The Supabase schema defines profiles, searches, wellness_guides, remedies, yoga_practices, related_videos, saved_items, and wellness_response_cache. Owner-specific records use row-level security. The save_wellness_guide function is restricted to authenticated users, verifies the current owner context, and writes the search and normalized guide records. Anonymous searches are not stored. The application uses a publishable Supabase key and a user bearer token, not a service-role key.',
      129:'The client entry point mounts the React application and router. The landing page presents the AAROGYAM AI brand, topic search, wellness categories, and how-it-works section. The search handler posts JSON to the configured VITE_API_URL endpoint and navigates to /results with the returned guide. Request timeouts and API/network failures appear as user-facing messages.',
      130:'The results page displays the query, summary, safety notice, remedy recommendations, and yoga practices. Its video section uses three locally maintained yoga pose illustrations linked to direct YouTube keyword searches, so users navigate to external search results without a YouTube API. Supabase client setup supports authentication and user-scoped history functions in the application routes and data helpers.',
      132:'server/index.js loads the private environment configuration and starts the native Node HTTP server. server/src/httpServer.js configures allowed origins, JSON responses, /api/health, POST /api/search, body-size and Zod validation, emergency screening, IP rate limiting, safe error responses, and persistence status. server/src/gemini.js requests schema-constrained JSON, validates the response, and applies content checks. server/src/persistence.js verifies the bearer token with Supabase Auth and calls save_wellness_guide. Persistence failure does not discard the generated guide; the API reports the history status.',
      134:'The client reads VITE_API_URL, VITE_SUPABASE_URL, and VITE_SUPABASE_PUBLISHABLE_KEY from client environment configuration. The server reads PORT, CLIENT_ORIGINS, GEMINI_API (or GEMINI_API_KEY), GEMINI_MODEL, SUPABASE_URL, and SUPABASE_PUBLISHABLE_KEY from server/.env. Private environment files are excluded from source control. Deployment requires a static client host, separate Node API service, exact CORS origins, and reviewed Supabase migrations.',
      136:'The client handles request timeout, API errors, and unreachable service conditions. The server returns constrained JSON errors, redacts known credential formats from provider error messages, and does not log wellness query text. Invalid sessions receive an authentication error; persistence failures are summarized by status while preserving the guide response. The server includes request size, CORS, and rate-limit controls.',
      140:'Verification was executed against the supplied project source and configured local test environment. The recorded results are 21 passing client tests, 8 passing server tests, 8 passing database/RLS tests, and a successful production client build. The database suite uses PGlite and does not replace a hosted Supabase production review. A separate live Gemini check is available through npm run test:gemini and is not represented as part of these counts.',
      143:'The client can submit an accepted topic to the configured API and render a structured guide.',
      144:'Malformed and oversized inputs are rejected with controlled client/server responses.',
      145:'Emergency screening, rate limiting, response validation, and safe provider failures behave as specified.',
      146:'Authenticated guide persistence remains owner-scoped; anonymous history is not written.',
      147:'Yoga cards show pose-specific artwork and navigate to direct YouTube keyword search.',
      148:'The report and UI identify results as general wellness information and advise professional care.',
      150:'Evidence includes screenshots captured from the working browser application, diagrams based on the current source and migrations, and executed automated test results. No credentials or personal wellness data are reproduced.',
      154:'The client contains only public configuration values such as the Supabase publishable key and project URL. Gemini credentials and all database/service configuration remain in the server environment. Environment files are excluded from version control and should be stored as deployment secrets. A publishable key is not an authorization substitute; user access is constrained by Auth and row-level security.',
      156:'A search topic is sent to the server and then to Gemini as generation input. The server does not log the query body. A generated guide is persisted only when a valid signed-in session is provided; the database policies scope access to the authenticated owner. Provider and database retention policies remain relevant and must be described in the deployed application privacy notice.',
      158:'AAROGYAM AI offers general educational wellness information and is not a diagnostic system. An AI suggestion may be inaccurate, unsuitable, or unsafe for a person’s circumstances. The server screens obvious emergency phrases and applies cautious generation instructions and output checks, but these controls cannot guarantee clinical safety. Users should seek qualified medical care for severe, persistent, worsening, or urgent symptoms.',
      160:'AI output quality, latency, availability, and quotas depend on the configured Gemini service.',
      161:'The service depends on network connectivity and the availability of the client host, API, Supabase, and AI provider.',
      162:'The safety phrase screen is a limited rule-based safeguard and cannot identify every emergency.',
      163:'The generated guide is not reviewed by a clinician and must not be treated as medical advice.',
      164:'Signed-in history depends on a correctly applied Supabase migration and active user session.',
      165:'YouTube cards open keyword search results; the project does not curate or endorse the videos returned by YouTube.',
      166:'The application does not include a native Android/iOS app or a YouTube Data API integration.',
      170:'AAROGYAM AI demonstrates a browser-to-API workflow for cautious, structured wellness guidance. The React and Vite interface communicates with a JavaScript Node server, which validates search requests, applies safety controls, requests structured Gemini output, and optionally persists the result through Supabase Auth and PostgreSQL. The report records the implemented design, screenshots, diagrams, source excerpts, and executed verification results while clarifying that the system is not a medical product.',
      172:'Expand automated tests for browser flows, API edge cases, safety screening, and hosted database access policies.',
      173:'Conduct independent privacy and security review before deploying with real users or health-related data.',
      174:'Add operational monitoring, provider usage controls, retention documentation, and deployment health checks.',
      175:'Have qualified health professionals review the safety language and scope of generated wellness guidance.',
      176:'Improve accessibility, localization, keyboard navigation, and responsive behavior across devices.',
      177:'Consider curated, reviewed educational content that remains available when external services are unavailable.',
      178:'Evaluate video discovery and moderation approaches while preserving clear disclosure that external videos are third-party content.',
      181:'React documentation, https://react.dev/ (accessed November 2026).',
      182:'Vite documentation, https://vite.dev/guide/ (accessed November 2026).',
      183:'Node.js documentation, https://nodejs.org/docs/ (accessed November 2026).',
      184:'Google Gemini API documentation, https://ai.google.dev/gemini-api/docs (accessed November 2026).',
      185:'Supabase documentation: Auth, Database, and Row Level Security, https://supabase.com/docs (accessed November 2026).',
      186:'PostgreSQL documentation, https://www.postgresql.org/docs/ (accessed November 2026).',
      187:'YouTube search interface, https://www.youtube.com/ (external keyword searches opened from the application).',
      188:'Zod documentation, https://zod.dev/ (accessed November 2026).',
      189:'AAROGYAM AI source code and project README, supplied project workspace, November 2026.',
      194:'The following figures are captured from the running AAROGYAM AI browser application. They show the landing page, generated guide interface, and pose-specific YouTube search cards. The figures illustrate the implemented UI and are not medical outcome evidence.',
      196:'Figure A.1: AAROGYAM AI landing page with topic search and quick topics.',
      197:'Figure A.2: Generated wellness guide with summary and safety notice.',
      201:'Figure A.3: Yoga practice discovery cards with pose-specific thumbnails and direct YouTube keyword links.',
      202:'Figure A.4: System context diagram for browser, API, Gemini, Supabase, and direct YouTube navigation.',
      205:'The diagrams below document the implemented backend request lifecycle and relational data model. Code listings in Appendix B provide short source excerpts. All figures are prepared from the project implementation; no credentials or private environment values are displayed.',
      207:'Figure A.5: Backend workflow from request validation to optional owner-scoped persistence.',
      208:'Figure A.6: Simplified Supabase data model and ownership relationships.',
      210:'This appendix maps important source files to their responsibilities and reproduces concise JavaScript and SQL excerpts for the search, validation, generation, persistence, schema, and direct video-search workflows. Private keys and database credentials are intentionally excluded.',
      213:'The client posts the user-entered query to the Node API and passes the structured response to the results route.',
      215:'The HTTP server validates requests, screens emergency phrases, and applies rate limiting before it invokes the model.',
      216:'Gemini returns schema-constrained JSON. The server applies Zod validation and content checks before responding.',
      218:'The AI module requests schema-constrained JSON from Gemini, validates the response with Zod, and applies output safety checks before the guide is returned.',
      220:'Only an authenticated caller reaches save_wellness_guide; row-level security and the function keep records scoped to the verified owner.',
      222:'The migration defines the owner-scoped SQL function and writes search and related guide records in a database transaction.',
      224:'ResultsPage builds a YouTube keyword-search URL from each pose topic and opens it directly in the browser. No YouTube API call is made.',
      226:'Zod validates request and generated response shapes; RPC means remote procedure call; RLS means row-level security; CORS controls which browser origins can call the API; bearer token is a signed user session credential.',
      227:'The server error boundary returns safe status codes and messages; the health route supports service availability checks.',
    }
    for i,text in replacements.items(): set_paragraph(para[i],text)
    # Rewrite document cover title and section labels without disturbing the original cover artwork.
    set_paragraph(para[9],'PROJECT REPORT')
    set_paragraph(para[10],'ON')
    set_paragraph(para[11],'AAROGYAM AI')
    set_paragraph(para[55],'Glossary')
    set_paragraph(para[193],'APPENDIX A\nAPPLICATION SCREENSHOTS AND VISUAL EVIDENCE')
    set_paragraph(para[199],'APPENDIX A\nVISUAL SYSTEM EVIDENCE')
    set_paragraph(para[204],'APPENDIX A\nBACKEND AND DATABASE WORKFLOWS')
    set_paragraph(para[206],'A.2 Backend and Data Model Diagrams')
    set_paragraph(para[128],'4.2 React Client Implementation')
    set_paragraph(para[131],'4.3 Backend Implementation')
    set_paragraph(para[212],'B.2 Client Search and API Request')
    set_paragraph(para[214],'B.3 Backend Request Validation')
    set_paragraph(para[217],'B.4 Gemini Structured Generation')
    set_paragraph(para[219],'B.5 Supabase Session Verification')
    set_paragraph(para[221],'B.6 Database Persistence Function')
    set_paragraph(para[223],'B.7 Direct YouTube Keyword Search')
    set_paragraph(para[225],'B.8 API and Safety Definitions')
    para[126].paragraph_format.page_break_before=False
    para[126].paragraph_format.keep_with_next=False
    set_paragraph(para[209],'APPENDIX B\nIMPORTANT CODE FILES AND DEFINITIONS')
    # Remove obsolete inline Android/Mongo diagrams and place project-specific diagrams.
    for i in [115,117]:
        p=para[i]
        for drawing in list(p._p.xpath('.//w:drawing')): drawing.getparent().remove(drawing)
    para[115].alignment=WD_ALIGN_PARAGRAPH.CENTER
    para[115].add_run().add_picture(str(FIG/'dfd-level-0.png'),width=Inches(6.0))
    para[117].alignment=WD_ALIGN_PARAGRAPH.CENTER
    para[117].add_run().add_picture(str(FIG/'dfd-level-1.png'),width=Inches(6.0))
    # Add implementation flow and data-model diagrams at the relevant chapter locations.
    para[131].add_run().add_break()
    para[131].add_run().add_picture(str(FIG/'backend-workflow.png'),width=Inches(6.0))
    flow_cap=para[132].insert_paragraph_before()
    set_paragraph(flow_cap,'Figure 4.1: Backend request lifecycle from validation to optional Supabase persistence.',size=9,italic=True)
    flow_cap.alignment=WD_ALIGN_PARAGRAPH.CENTER
    db_fig=para[123].insert_paragraph_before()
    db_fig.alignment=WD_ALIGN_PARAGRAPH.CENTER
    db_fig.add_run().add_picture(str(FIG/'database-model.png'),width=Inches(6.0))
    db_cap=para[123].insert_paragraph_before()
    set_paragraph(db_cap,'Figure 3.3: Simplified Supabase data model and owner relationships.',size=9,italic=True)
    db_cap.alignment=WD_ALIGN_PARAGRAPH.CENTER
    # Tables use the original report's designed table styling and positions.
    tables=doc.tables
    table_rows={
      1:[['ID','Functional requirement'],['FR-01','A visitor can enter a wellness topic and request a guide.'],['FR-02','The client displays generated summary, remedies, yoga, and safety note.'],['FR-03','The API accepts only a bounded, validated search request.'],['FR-04','Emergency-like phrases receive urgent-care guidance without AI generation.'],['FR-05','Rate limiting protects the search endpoint from repeated requests.'],['FR-06','The API persists history when a verified user bearer token is supplied.'],['FR-07','A user can access only records allowed by owner-scoped RLS policies.'],['FR-08','Yoga cards open direct YouTube keyword searches in the browser.']],
      2:[['Area','Non-functional requirement'],['Safety','Prominent informational disclaimer, emergency screen, and conservative generation rules.'],['Privacy','No search text in server logs; signed-in history is owner-scoped.'],['Security','Private environment values stay server-side; bounded input and origin checks.'],['Reliability','Controlled JSON responses and user-visible network/provider failure states.'],['Maintainability','Plain JavaScript modules, workspaces, migrations, and focused automated suites.'],['Usability','Responsive React interface with readable guide sections and pose artwork.']],
      3:[['Type','Requirement'],['Client','Modern browser; React and Vite static build.'],['API','Node.js runtime; native HTTP server; JSON requests.'],['AI','Configured Gemini API key and supported model.'],['Database','Supabase Auth and PostgreSQL with applied project migrations.'],['Development','Node.js/npm, Git, and environment files outside version control.']],
      4:[['Phase','Work'],['1. Requirements','Define topic search, wellness response, safety, and persistence scope.'],['2. Client','Build React/Vite landing, search, results, and pose discovery interface.'],['3. API','Implement validation, emergency screen, rate limiting, and health endpoint.'],['4. AI','Add Gemini structured generation and output checks.'],['5. Database','Create Supabase tables, RLS policies, and authenticated save RPC.'],['6. Verification','Run browser/component, server, database checks, and production build.']],
      5:[['Method and path','Purpose','Result'],['GET /api/health','API availability check','200 JSON service status'],['POST /api/search','Generate guide; controlled errors','Validated guide or safe error response'],['Supabase Auth + RPC','Verify bearer and persist if supplied','Owner-scoped search and guide record']],
      6:[['Screen/route','Responsibility'],['/','Brand landing page, wellness topics, and search form.'],['/results','Displays returned guide, safety notice, remedies, yoga, and video-search cards.'],['Not found','Provides a return-to-home link for unknown routes.'],['External YouTube','Keyword search page opened by clicking a yoga illustration/card.'],['API health','GET endpoint used for operational status checks.'],['Authentication','No sign-in or history-management screen is currently wired into the client.']],
      7:[['Actor','Use case','System response'],['Visitor or authenticated caller','Submit a wellness topic','Returns a validated guide; saves only with a valid bearer token.'],['User','Open a yoga card','Opens YouTube keyword results.']],
      8:[['Component','Technology','Role'],['Web UI','React 19, Vite, JavaScript','Client routing, forms, and results rendering.'],['API runtime','Node.js 24, native HTTP','CORS, routes, validation, and safe responses.'],['AI provider','Google Gemini SDK','Structured JSON wellness guide generation.'],['Validation','Zod','Request and model-output shape checks.'],['Auth/data','Supabase JS, Auth, PostgreSQL','Session verification and user-scoped storage.'],['Database security','Postgres RLS + SECURITY DEFINER RPC','Owner-controlled history persistence.'],['Video discovery','Direct YouTube keyword search','External search without YouTube API.']],
      9:[['ID','Test case','Expected result','Status'],['C-01','Landing page renders','Brand, search, and primary sections appear','PASS'],['C-02','Search success route','Guide is passed to results view','PASS'],['C-03','Search rejection/error','User sees a safe message','PASS'],['C-04','Results render','Summary, safety, remedy, and yoga content appear','PASS'],['C-05','YouTube cards','Each pose card uses direct keyword search','PASS'],['S-01','Health endpoint','Returns 200 service status','PASS'],['S-02','Invalid query and large body','Returns bounded 400/413 responses','PASS'],['S-03','Emergency and rate limits','Returns 422/429 without ordinary generation','PASS'],['S-04','Gemini output validation','Valid shape accepted; unsafe output rejected','PASS'],['D-01','Database/RLS persistence checks','Owner-scoped RPC and access policies verified locally','PASS']],
      10:[['Term','Meaning'],['API','Application programming interface.'],['CORS','Browser cross-origin request policy.'],['DFD','Data-flow diagram.'],['Gemini','Google generative AI model service used for structured guide generation.'],['JSON','JavaScript Object Notation; API request and response format.'],['RLS','PostgreSQL row-level security.'],['RPC','Remote procedure call; database function invoked by the client library.'],['Supabase Auth','Authentication service used to verify user bearer sessions.'],['Vite','Frontend development server and build tool.'],['Zod','JavaScript schema validation library.'],['Bearer token','Signed authentication credential sent in an Authorization header.'],['Owner-scoped','Data access restricted to the authenticated user who owns the record.']],
      17:[['File','Definition and responsibility'],['client/src/App.jsx','Search form submission, API request, and results navigation.'],['client/src/AppRoutes.jsx','Browser routes and unknown-path handling.'],['client/src/pages/ResultsPage.jsx','Guide display, yoga practice cards, and YouTube search links.'],['server/index.js','Loads server configuration and starts the HTTP service.'],['server/src/httpServer.js','Health/search endpoints, validation, safety, rate limit, and error handling.'],['server/src/gemini.js','Structured Gemini request, schema validation, and output safety checks.'],['server/src/guideSchema.js','JSON output contract and user-facing safety note.'],['server/src/persistence.js','Supabase bearer verification and save RPC.'],['supabase/migrations/*.sql','Tables, owner policies, and save_wellness_guide function.']],
      24:[['Term','Definition in this project'],['HTTP server','Node runtime that handles health and search routes.'],['Emergency screen','Rule-based rejection of obvious urgent search phrases.'],['Rate limiter','In-memory per-IP limit of 20 searches per 15-minute interval.'],['Structured generation','AI output constrained to a JSON schema before use.'],['Publishable key','Supabase client key designed for browser use with RLS restrictions.'],['Secret key','Private server credential; must never be exposed to the client.'],['YouTube keyword search','External YouTube search URL built from a yoga topic and opened by the user.'],['History status','API field describing whether guide persistence succeeded or was unavailable.'],['Migration','Versioned SQL file that creates/updates database structures.'],['Safety note','Message that wellness content is not medical diagnosis or treatment.'],['PGlite','Embedded PostgreSQL-compatible test engine used by database checks.'],['Vitest','Test runner used for client component checks.']],
    }
    for ix,rows in table_rows.items(): replace_table(tables[ix],rows)
    # Screenshot and visual appendix placeholders are populated with genuine app captures/diagrams.
    for ix,path in [(11,FIG/'app-home.png'),(12,FIG/'app-results.png'),(13,FIG/'app-youtube-search-cards.png'),(14,FIG/'dfd-level-0.png'),(15,FIG/'backend-workflow.png'),(16,FIG/'database-model.png')]: add_image_cell(tables[ix],path)
    # Code appendix excerpts from current source; use short, readable listings.
    code={
      18:"""const apiUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\\/$/, '')
const response = await fetch(`${apiUrl}/api/search`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ query }),
  signal: AbortSignal.timeout(75_000),
})
const guide = await response.json()
if (!response.ok) throw new Error(guide.error)
navigate('/results', { state: { guide } })""",
      19:"""const searchRequestSchema = z.object({
  query: z.string().trim().min(1).max(180),
}).strict()

const parsed = searchRequestSchema.safeParse(body)
if (!parsed.success) return sendJson(response, 400, {
  error: 'Enter a topic between 1 and 180 characters.'
}, corsHeaders)
if (isEmergencyQuery(parsed.data.query)) {
  return sendJson(response, 422, emergencyResponse, corsHeaders)
}""",
      20:"""const response = await ai.models.generateContent({
  model,
  contents: `Create a general wellness guide for this topic. User topic: <topic>${query}</topic>`,
  config: {
    systemInstruction,
    responseMimeType: 'application/json',
    responseJsonSchema: wellnessGuideJsonSchema,
    temperature: 0.2,
    maxOutputTokens: 2600,
  },
})
const parsed = wellnessGuideSchema.safeParse(JSON.parse(response.text))
if (!parsed.success) throw new Error('Unexpected response format.')""",
      21:"""const match = /^Bearer\\s+(.+)$/i.exec(authorization || '')
if (!match) return { status: 'anonymous' }
const client = createClient(url, publishableKey, {
  global: { headers: { Authorization: `Bearer ${match[1]}` } },
})
const { data, error } = await client.auth.getUser(match[1])
if (error || !data?.user?.id) return { status: 'invalid' }
return client.rpc('save_wellness_guide', { p_query: query, p_guide })""",
      22:"""create or replace function public.save_wellness_guide(
  p_query text,
  p_guide jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;
  -- Insert search and related guide rows for auth.uid().
end;
$$;""",
      23:"""return searches.map((search) => ({
  ...search,
  url: `https://www.youtube.com/results?search_query=${encodeURIComponent(search.term)}`,
}))"""
    }
    for ix,txt in code.items(): set_code_cell(tables[ix],txt)
    # Align each source excerpt under its corresponding subsection.
    para[221]._p.addprevious(tables[21]._tbl)
    para[223]._p.addprevious(tables[22]._tbl)
    para[225]._p.addprevious(tables[23]._tbl)
    # Remove the old dense metadata strip from the institution cover page.
    tables[0]._tbl.getparent().remove(tables[0]._tbl)
    # The server/RPC supports bearer-authenticated saves; the current browser search UI sends no session token.
    set_paragraph(para[80],'Provide structured wellness recommendations and safety notes in the results interface.')
    set_paragraph(para[81],'Keep persistence restricted to requests carrying a verified Supabase user bearer token.')
    set_paragraph(para[82],'Screen emergency phrases, limit repeated requests, and handle service errors safely.')
    set_paragraph(para[83],'Offer pose-specific local thumbnails that open direct YouTube keyword searches.')
    set_paragraph(para[85],'The implemented scope includes a React and Vite client, JavaScript Node.js HTTP API, Gemini integration, Supabase Auth and PostgreSQL schema/RPC, and direct YouTube keyword-search cards. The server can persist a guide when a verified user bearer token is supplied. The current browser interface does not yet provide a sign-in or history-management flow, so normal UI searches are anonymous and are not saved. The browser opens YouTube search results directly from the cards; no YouTube API integration is used. The project does not provide a native Android application.')
    set_paragraph(para[112],'If a verified bearer token is supplied, the API persists the guide with the owner-scoped RPC; without one, it returns a guide without saving history.')
    set_paragraph(para[122],'The Supabase schema defines profiles, searches, wellness_guides, remedies, yoga_practices, related_videos, saved_items, and wellness_response_cache. Owner-specific records use row-level security. The save_wellness_guide function verifies the current owner context and writes search and normalized guide records. Anonymous searches are not stored. The API supports optional bearer-token persistence, but the current browser search handler does not send a session token; signed-in history therefore requires a future client authentication flow. The application uses a publishable Supabase key and no service-role key.')
    set_paragraph(para[130],'The results page displays the query, summary, safety notice, remedy recommendations, and yoga practices. Its video section uses three locally maintained yoga pose illustrations linked to direct YouTube keyword searches. The current client does not include sign-in or history-management screens and sends searches without an Authorization bearer token, so searches initiated from the UI are not persisted. The server and database still enforce authenticated, owner-scoped persistence if a valid bearer is supplied.')
    set_paragraph(para[146],'A future client sign-in flow must attach the Supabase bearer token before authenticated persistence can be used from the browser UI.')
    for section in doc.sections:
        for p in section.header.paragraphs:
            if p.text.strip(): set_paragraph(p,'AAROGYAM AI | MCA Project Report | HPTU Hamirpur',size=8,color='666666')
        for p in section.footer.paragraphs:
            if p.text.strip():
                p.clear()
                r=p.add_run('AAROGYAM AI MCA Project Report  |  Page '); r.font.size=Pt(8); r.font.color.rgb=RGBColor(102,102,102)
                fld=OxmlElement('w:fldSimple'); fld.set(qn('w:instr'),'PAGE'); p._p.append(fld)
    # Remove redundant manual page breaks before two chapter headings that follow full pages.
    for i in [125,167]:
        for br in list(para[i]._p.xpath('.//w:br[@w:type="page"]')): br.getparent().remove(br)
    # Remove the empty page-break paragraph before Chapter 4 left by the source template.
    if para[125]._p.getparent() is not None: para[125]._p.getparent().remove(para[125]._p)
    # Include the final appendix figure in the List of Figures.
    fig6=para[70].insert_paragraph_before()
    set_paragraph(fig6,'Figure A.6  Supabase data model and ownership relationships',size=11)
    # Normalize metadata/title.
    doc.core_properties.title='AAROGYAM AI: AI-Powered Wellness Guidance Platform'
    doc.core_properties.subject='MCA Project Report — React, Node.js, Gemini, and Supabase'
    doc.core_properties.keywords='AAROGYAM AI, MCA, React, Node.js, Supabase, Gemini'
    doc.save(str(OUT))
    print('SAVED',OUT,'bytes',OUT.stat().st_size)
    print('SOURCE_SHA256',hashlib.sha256(SOURCE.read_bytes()).hexdigest())

if __name__=='__main__': main()
