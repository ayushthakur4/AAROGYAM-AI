from pathlib import Path
from copy import deepcopy
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_CELL_VERTICAL_ALIGNMENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.text.paragraph import Paragraph

SOURCE_PATH=Path(r'C:\Users\thaku\OneDrive\Desktop\AAROGYAM_AI_MCA_Project_Report.docx')
DOC_PATH=Path(r'C:\Users\thaku\OneDrive\Desktop\AAROGYAM_AI_MCA_Project_Report_Expanded.docx')
GREEN='204C3C'; WHITE='FFFFFF'; INK='2F2A25'

def set_font(run,size,bold=None,color=None,name='Times New Roman'):
    run.font.name=name; run.font.size=Pt(size)
    if bold is not None: run.bold=bold
    if color: run.font.color.rgb=RGBColor.from_string(color)

def body(doc,text,style='Normal'):
    p=doc.add_paragraph(style=style); p.paragraph_format.space_after=Pt(6); p.paragraph_format.line_spacing=1.15
    r=p.add_run(text); set_font(r,12)
    return p

def heading(doc,text,level=2):
    p=doc.add_heading(text,level=level)
    p.paragraph_format.keep_with_next=True
    for r in p.runs: set_font(r,16 if level==1 else 14,True)
    return p

def bullet(doc,text): return body(doc,text,'List Bullet')

def table(doc,headers,rows,widths=None):
    t=doc.add_table(rows=1,cols=len(headers)); t.style='Table Grid'; t.autofit=False
    trPr=t.rows[0]._tr.get_or_add_trPr(); header_repeat=OxmlElement('w:tblHeader'); header_repeat.set(qn('w:val'),'true'); trPr.append(header_repeat)
    for c,label in zip(t.rows[0].cells,headers):
        c.text=''; p=c.paragraphs[0]; p.paragraph_format.space_after=Pt(2)
        r=p.add_run(label); set_font(r,12,True,WHITE)
        tcPr=c._tc.get_or_add_tcPr(); shd=OxmlElement('w:shd'); shd.set(qn('w:fill'),GREEN); tcPr.append(shd)
        c.vertical_alignment=WD_CELL_VERTICAL_ALIGNMENT.CENTER
    for row in rows:
        cells=t.add_row().cells
        for i,(c,value) in enumerate(zip(cells,row)):
            c.text=''; p=c.paragraphs[0]; p.paragraph_format.space_after=Pt(2); p.paragraph_format.line_spacing=1.05
            r=p.add_run(str(value)); set_font(r,12,color=INK)
            c.vertical_alignment=WD_CELL_VERTICAL_ALIGNMENT.CENTER
    for row in t.rows:
        no_split=OxmlElement('w:cantSplit')
        row._tr.get_or_add_trPr().append(no_split)
    if widths:
        for row in t.rows:
            for i,w in enumerate(widths): row.cells[i].width=Inches(w)
    doc.add_paragraph().paragraph_format.space_after=Pt(1)
    return t

def code(doc,text):
    t=doc.add_table(rows=1,cols=1); t.style='Table Grid'; c=t.cell(0,0); c.text=''
    p=c.paragraphs[0]; p.paragraph_format.space_after=Pt(0); p.paragraph_format.line_spacing=1.0
    for i,line in enumerate(text.strip('\n').splitlines()):
        if i: p.add_run().add_break()
        r=p.add_run(line or ' '); set_font(r,12,color='244337',name='Consolas')
    doc.add_paragraph().paragraph_format.space_after=Pt(1)

def new_appendix(doc,letter,title,opening):
    heading(doc,f'APPENDIX {letter}',1)
    doc.paragraphs[-1].paragraph_format.page_break_before=True
    heading(doc,title,1)
    body(doc,opening)

def add_toc_lines(doc):
    target=None
    for p in doc.paragraphs:
        if p.text.strip()=='LIST OF FIGURES': target=p; break
    if not target: return
    for text in [
      'Appendix C  Detailed Functional Requirements and Use Cases',
      'Appendix D  Database Data Dictionary and Security',
      'Appendix E  API Contract and Backend Algorithms',
      'Appendix F  Installation and Deployment Runbook',
      'Appendix G  Verification Procedures and Results',
      'Appendix H  Safety, Privacy, and Risk Analysis',
      'Appendix I  Future Development Roadmap and Acceptance Criteria',
    ]:
        node=OxmlElement('w:p'); target._p.addprevious(node); p=Paragraph(node,target._parent)
        p.style='Normal'; p.paragraph_format.space_after=Pt(3)
        r=p.add_run(text); set_font(r,12)

def normalize_sizes(doc):
    cover_titles = {
        'A PROJECT REPORT',
        'PROJECT REPORT',
        'HIMACHAL PRADESH TECHNICAL UNIVERSITY (HPTU)\nHAMIRPUR (H.P.)',
        'HIMACHAL PRADESH TECHNICAL UNIVERSITY (HPTU)\n\nHAMIRPUR (H.P.)',
        'AAROGYAM AI',
    }
    cover_subtitles = {
        'MASTER OF COMPUTER APPLICATIONS (MCA)',
        'AAROGYAM AI: AI-POWERED WELLNESS GUIDANCE PLATFORM',
        'MCA DEPARTMENT\nHPTU DARUHI, HAMIRPUR, H.P.\nNOVEMBER 2026',
    }
    for p in doc.paragraphs:
        if p.style.name=='Heading 1': size=16
        elif p.style.name=='Heading 2': size=14
        else: size=12
        if p.text.strip() in cover_titles: size=16
        elif p.text.strip() in cover_subtitles: size=14
        for r in p.runs:
            if r._r.xpath('.//w:drawing'): continue
            set_font(r,size,bold=True if p.style.name.startswith('Heading') else None)
    for t in doc.tables:
        # Code listings retain monospace styling while following the required 12 pt content size.
        is_code=any(r.font.name=='Consolas' for row in t.rows for c in row.cells for p in c.paragraphs for r in p.runs)
        if len(t.rows)>1:
            h=t.rows[0]._tr.get_or_add_trPr(); repeat=OxmlElement('w:tblHeader'); repeat.set(qn('w:val'),'true'); h.append(repeat)
        for ri,row in enumerate(t.rows):
            for c in row.cells:
                for p in c.paragraphs:
                    for r in p.runs:
                        if is_code:
                            set_font(r,12,name='Consolas')
                        else:
                            set_font(r,12,bold=(True if ri==0 else None),color=(WHITE if ri==0 else None))
    for sec in doc.sections:
        for p in sec.header.paragraphs+sec.footer.paragraphs:
            for r in p.runs: set_font(r,8,color='666666')

def build():
    doc=Document(str(SOURCE_PATH))
    # Keep short source tables from leaving a single continuation row on its own page.
    for t in doc.tables:
        head=[c.text.strip() for c in t.rows[0].cells]
        if head[:2]==['Phase','Work'] and len(t.rows)>6:
            prev=t.rows[-2].cells; last=t.rows[-1].cells
            prev[0].text='Database and verification'
            prev[1].text=prev[1].text+' '+last[1].text
            t._tbl.remove(t.rows[-1]._tr)
        if head[:3]==['Method and path','Purpose','Result'] and len(t.rows)>3:
            t.cell(2,0).text='POST /api/search + Supabase Auth/RPC'
            t.cell(2,1).text='Generate guide and save only for a verified session.'
            t.cell(2,2).text='Validated guide and persistence status.'
            t._tbl.remove(t.rows[-1]._tr)
    for p in doc.paragraphs:
        if p.text.strip().startswith('Ayush Thakur (Roll No.: 2514930020)'):
            alignment=p.alignment; p.clear(); p.alignment=alignment
            r=p.add_run('Ayush Thakur | MCA 3rd Semester | Roll No.: 2514930020'); set_font(r,12)
            break
    add_toc_lines(doc)

    new_appendix(doc,'C','Detailed Functional Requirements and Use Cases',
      'This appendix expands the user-facing and API requirements into observable behaviors. “Implemented” describes behavior present in the checked project source. A server capability that requires an authenticated bearer token is distinguished from a browser feature: the current client does not yet provide sign-in or attach that token to search requests.')
    heading(doc,'C.1 Actors, Boundaries, and Assumptions')
    body(doc,'The visitor is the primary actor. A visitor can use the public landing page, submit a wellness topic, read the returned guide, and open an external yoga keyword search. The API operator configures the service and checks the health route. Supabase Auth is the trust boundary for optional history persistence. Gemini and YouTube are external services: Gemini is called by the server, while YouTube is opened directly by the browser.')
    table(doc,['Actor or system','Capability','Boundary'],[
      ('Visitor','Search and read a guide; open yoga search cards.','No account is required for the current browser flow; guest search is not persisted.'),
      ('Node API','Validate requests, screen emergency phrases, rate-limit, generate and return guides.','Server-only credentials remain in server environment variables.'),
      ('Supabase Auth','Verify a user bearer token when supplied.','A valid token is required before the save RPC is called.'),
      ('Supabase database','Store normalized guide history under row-level security.','The current UI does not send a bearer token.'),
      ('Gemini','Return structured wellness guide data.','The provider output is untrusted until Zod and safety checks pass.'),
      ('YouTube','Show external search results for a topic phrase.','The project does not call YouTube APIs or control video results.'),
    ],[1.45,2.5,2.05])
    heading(doc,'C.2 Functional Requirement Traceability')
    table(doc,['ID','Requirement','Observable evidence','Current status'],[
      ('FR-01','Enter a topic and submit it.','Landing page search control sends POST /api/search.','Implemented'),
      ('FR-02','Show the generated guide in an accessible results layout.','Results page renders query, summary, safety, remedies, yoga and video cards.','Implemented'),
      ('FR-03','Reject empty, oversized, or malformed input.','Zod query schema and 8 KB request body limit.','Implemented'),
      ('FR-04','Screen obvious emergency phrases.','Safety module checks defined phrase patterns and returns urgent-care guidance.','Implemented'),
      ('FR-05','Limit repeated searches.','Per-IP in-memory window permits 20 requests per 15 minutes.','Implemented'),
      ('FR-06','Persist only for an authenticated owner.','Bearer verification and save_wellness_guide RPC with RLS.','Server/database ready; UI auth absent'),
      ('FR-07','Provide pose-specific thumbnail links.','Local SVG assets for warrior, seated pose, and stretch cards.','Implemented'),
      ('FR-08','Open external video discovery without API credentials.','URL points to YouTube keyword search in a new tab.','Implemented'),
      ('FR-09','Offer an API availability endpoint.','GET /api/health returns JSON service status.','Implemented'),
    ],[.58,1.8,2.55,1.07])
    heading(doc,'C.3 Use Case UC-01: Search for a Wellness Guide')
    body(doc,'Goal: obtain a structured set of general comfort suggestions for a short user-entered topic. Preconditions: the client is loaded and the Node API is reachable. The user does not need an account. Trigger: the user submits the search form or the inline results search.')
    for x in [
      '1. The client trims the text and starts a bounded request with a 75-second timeout.',
      '2. The server accepts only POST /api/search, reads at most 8 KB, and parses JSON.',
      '3. Zod validates a single strict object with a query from 1 through 180 characters.',
      '4. The emergency phrase screen runs before rate limiting and model generation.',
      '5. The per-IP limiter counts the accepted search against the current 15-minute window.',
      '6. Gemini receives the topic with safety instructions and a JSON response schema.',
      '7. The server parses the response, checks the Zod schema, caps collection sizes, and rejects unsafe directions.',
      '8. Without an Authorization bearer token, persistence returns anonymous; the guide is still returned.',
      '9. The client navigates to /results and renders the guide sections.',
    ]: bullet(doc,x)
    body(doc,'Postcondition: a valid request displays a guide in the browser. The request is not saved by the current client. A provider or validation failure produces a safe error response and a user-facing message rather than a broken results route.')
    heading(doc,'C.4 Use Case UC-02: Emergency-Like Search')
    body(doc,'Goal: avoid presenting routine wellness content when the submitted phrase matches a defined urgent symptom pattern. The current server patterns cover examples such as chest pain, difficulty breathing, signs of stroke, unconsciousness, severe allergic reaction, overdose/poisoning, and explicit self-harm phrases. These are code-level phrase patterns and do not constitute a complete triage system.')
    table(doc,['Step','Expected behavior','Result'],[
      ('Input','A query matches an emergency pattern.','The request does not call Gemini.'),
      ('Response','API returns HTTP 422 with urgent_care code and a message.','Client presents the API message.'),
      ('Boundary','Unmatched wording may still describe an emergency.','Users must contact local emergency care for urgent symptoms.'),
      ('Verification','Use synthetic phrases only in test environments.','Do not include personal medical data in screenshots or logs.'),
    ],[.8,2.75,2.2])
    heading(doc,'C.5 Use Case UC-03: Open a Yoga Keyword Search')
    body(doc,'The results component builds three search cards from the guide topic: a warrior-pose keyword, a seated relaxation search, and a gentle side-stretch search. Each card has a local illustration. Clicking the card opens a YouTube results URL encoded from the selected term. The external destination may contain videos of varying quality; the project identifies results as external and does not imply endorsement.')
    heading(doc,'C.6 Use Case UC-04: Persist an Authenticated Guide')
    body(doc,'The API path is implemented for a caller that supplies a valid bearer token. The persistence helper verifies the token using Supabase Auth getUser, then invokes save_wellness_guide with the query and structured guide. The SQL function derives its owner from auth.uid(), validates input limits, writes a search and related records, marks the search complete, and returns generated record identifiers. The current web search handler does not attach a token, so this use case is not yet reachable from the regular interface.')
    table(doc,['Alternate condition','Server behavior'],[
      ('No Authorization header','Treat as anonymous; return guide without writing history.'),
      ('Invalid or expired bearer','Return 401 invalid_session; client should ask the user to sign in again once auth is implemented.'),
      ('Database unavailable','Keep the generated guide; report persistence status as failed or unavailable.'),
    ],[2.0,3.75])

    new_appendix(doc,'D','Database Data Dictionary and Security',
      'The schema in the Supabase migrations separates an authenticated search from its generated guide and child recommendations. This data dictionary summarizes the implemented database boundaries; it is not a claim that every table is populated by the current anonymous browser flow.')
    heading(doc,'D.1 Entity Relationship Summary')
    body(doc,'An authenticated user owns one profile and may own many searches. Each search may have one wellness guide. A guide can have multiple remedies, yoga practices, and related video records. Saved items point to exactly one remedy or one yoga practice. The cache stores opaque keys and JSON responses and is intended for trusted server-side access only. Figure A.6 provides the visual relationship overview.')
    table(doc,['Table','Primary purpose','Key relationship','Owner scope'],[
      ('profiles','Display name and account timestamps.','id references auth.users.id.','id = auth.uid().'),
      ('searches','Query text, state, and timestamp.','user_id references auth.users.id.','user_id = auth.uid().'),
      ('wellness_guides','Summary, safety note, model/prompt versions.','Unique search_id references searches.','Via owning search.'),
      ('remedies','Normalized remedy title and preparation data.','guide_id references wellness_guides.','Via guide and search.'),
      ('yoga_practices','Normalized yoga suggestions and precautions.','guide_id references wellness_guides.','Via guide and search.'),
      ('related_videos','Third-party video metadata where present.','guide_id references wellness_guides.','Via guide and search.'),
      ('saved_items','A user-selected remedy or yoga reference.','user_id plus exactly one target ID.','user_id and target owner.'),
      ('wellness_response_cache','Opaque cache key, response, and expiry.','cache_key is a 64-character digest.','RLS enabled; no anon/authenticated grants.'),
    ],[1.5,2.05,1.7,1.15])
    heading(doc,'D.2 Profile and Search Data Dictionary')
    table(doc,['Table / column','Type and constraint','Meaning'],[
      ('profiles.id','UUID primary key; FK auth.users(id), cascade delete.','Account identifier.'),
      ('profiles.display_name','Text; nullable; maximum 80 characters.','Optional display label.'),
      ('profiles.created_at / updated_at','TIMESTAMPTZ, not null; defaults/trigger.','Account record timestamps.'),
      ('searches.id','UUID primary key; generated by database.','Search record identifier.'),
      ('searches.user_id','UUID FK auth.users(id), not null.','Verified owning account.'),
      ('searches.query','Text; trimmed length 1–180.','User-entered topic; sensitive text.'),
      ('searches.status','Text; pending, complete, or failed.','Processing lifecycle indicator.'),
      ('searches.created_at','TIMESTAMPTZ, not null; default now().','Creation timestamp and history ordering.'),
    ],[1.65,2.35,2.4])
    body(doc,'Indexes on searches(user_id, created_at desc) support owner history ordering. A second index on user_id and status supports filtering by search state. The API currently does not expose a browser history page, so these indexes support the schema and future authenticated history use rather than the present UI.')
    heading(doc,'D.3 Guide, Remedy, Yoga, and Video Records')
    table(doc,['Table','Stored fields and constraints','Design intent'],[
      ('wellness_guides','id; unique search_id; non-empty summary; safety_note; model_version; prompt_version; created_at.','One generated guide per saved search.'),
      ('remedies','guide_id; title 1–160 chars; summary; JSON arrays for ingredients, preparation_steps and precautions; usage; sort_order >= 0.','Normalize each comfort suggestion while retaining ordered lists.'),
      ('yoga_practices','guide_id; title 1–160; summary; duration 1–240 minutes; JSON instruction and precaution arrays; sort_order.','Store gentle practice suggestions and presentation order.'),
      ('related_videos','guide_id; 11-character YouTube ID; title; channel; thumbnail URL; optional positive duration; sort_order.','Optional associated video metadata. Current UI uses direct keyword searches instead.'),
    ],[1.35,3.15,1.9])
    body(doc,'Foreign keys cascade from a deleted search through its guide and child rows. JSON array checks prevent a scalar value from being inserted where an ordered list is expected. Related video records are not necessary for the current UI because video discovery is generated by the browser as search terms.')
    heading(doc,'D.4 Saved Items and Cache Records')
    table(doc,['Column or rule','Constraint','Reason'],[
      ('saved_items.user_id','Foreign key to auth.users; not null.','Identifies the owner of the saved reference.'),
      ('saved_items.remedy_id / yoga_practice_id','Exactly one target must be non-null.','Prevents an ambiguous saved item.'),
      ('saved_items uniqueness','Partial unique indexes per owner and target.','Avoids duplicate saves of the same recommendation.'),
      ('cache_key','64 lower-case hexadecimal characters.','Stores a non-reversible key rather than raw query text.'),
      ('response_json','JSONB object; model_version and safety_version required.','Allows version-aware server cache entries.'),
      ('expires_at','Must be later than created_at.','Enforces a valid expiration window.'),
    ],[1.6,2.4,2.1])
    body(doc,'The cache pruning function deletes expired entries and is granted only to the service role. The code comments state that only trusted server-side code should access this cache. Raw queries must not be copied into cache keys or operational logs.')
    heading(doc,'D.5 Row-Level Security and RPC Rules')
    for x in [
      'RLS is enabled on profiles, searches, guides, remedies, yoga practices, videos, saved items, and the response cache.',
      'Profile policies compare profile id with auth.uid(); search policies compare user_id with auth.uid().',
      'Guide and child-table select policies join back to searches and require that the search owner is auth.uid().',
      'Saved-item policies require the owner and verify that the referenced recommendation belongs to that owner.',
      'The save RPC is SECURITY DEFINER with an empty search_path, derives its owner from auth.uid(), and is granted to authenticated only.',
      'The server verifies the bearer with Supabase Auth before invoking the RPC. The current client does not yet provide the session token.',
    ]: bullet(doc,x)
    body(doc,'Security review note: SECURITY DEFINER functions deserve careful code review because they execute with elevated privileges. The project constrains the function search_path, revokes default execution, checks auth.uid(), validates request shape and collection bounds, and grants execution to authenticated users only. A production deployment should continue to review function ownership and grants after migrations.')

    new_appendix(doc,'E','API Contract and Backend Algorithms',
      'This appendix describes the current HTTP boundary and the decisions taken by the server. Request and response examples are illustrative and contain no user credentials or private data.')
    heading(doc,'E.1 Endpoint Contract')
    table(doc,['Method and path','Request','Success','Notes'],[
      ('GET /api/health','No body.','200 JSON: status ok and service identifier.','Operational liveness endpoint.'),
      ('POST /api/search','JSON object with one query string; optional Authorization bearer.','200 JSON guide with query, summary, safety note, remedies, yoga, videos, and history status.','Body limited to 8 KB; query is trimmed and 1–180 characters.'),
      ('OPTIONS','Browser preflight.','204 and CORS headers for allowed origins.','Allowed methods GET, POST and OPTIONS.'),
    ],[1.35,1.8,2.3,1.55])
    heading(doc,'E.2 Request and Response Shape')
    code(doc,'''POST /api/search
Content-Type: application/json
Authorization: Bearer <optional user access token>

{ "query": "gentle relaxation routine" }

Illustrative response fields:
{
  "query": "gentle relaxation routine",
  "summary": "A brief, neutral wellness overview.",
  "safetyNote": "General wellness information; not diagnosis or treatment.",
  "remedies": [{ "title": "...", "ingredients": [], "steps": [],
                  "usage": "...", "precautions": [] }],
  "yoga": [{ "title": "...", "durationMinutes": 5,
             "steps": [], "precautions": [] }],
  "videos": [], "historySaved": false,
  "historyStatus": "anonymous"
}''')
    body(doc,'The example demonstrates field shape only; the text is not a health recommendation and is not copied from a real user search. Gemini output is restricted by a JSON schema and then validated by the server-side Zod schema. Each generated text field has a bounded length. Remedy and yoga arrays have maximum item counts, and their sub-lists have bounded lengths.')
    heading(doc,'E.3 Error Response Matrix')
    table(doc,['HTTP status','Condition','Server behavior','Client interpretation'],[
      ('400','Invalid JSON or query schema fails.','Returns a short validation message.','Ask user to enter a topic and retry.'),
      ('401','A supplied bearer token is invalid/expired.','Does not claim the result was saved.','A future sign-in UI can refresh or re-authenticate.'),
      ('404','Method/path is not registered.','Returns route-not-found JSON.','Show a generic unavailable message.'),
      ('413','Request exceeds 8 KB.','Stops body reading with size error.','Reduce payload; normal client requests are small.'),
      ('422','Emergency phrase screen matches.','Returns urgent-care code and instruction; no model call.','Present urgent-care guidance.'),
      ('429','IP exceeds 20 requests in 15 minutes.','Returns retry guidance and Retry-After.','Wait before trying again.'),
      ('502','Provider call, JSON parse, or generated guide validation fails.','Logs a safe error label and returns a generic error.','Offer retry without exposing provider details.'),
    ],[.75,1.55,2.45,2.05])
    heading(doc,'E.4 Search Orchestration Algorithm')
    for x in [
      'Receive request and resolve the Origin header against configured client origins.',
      'Answer CORS preflight or the GET health request before search handling.',
      'Reject unmatched methods and paths with a JSON 404 response.',
      'Read at most 8 KB and parse JSON; reject malformed bodies.',
      'Apply the strict Zod request schema and enforce query length limits.',
      'Run the emergency phrase screen; if it matches, respond 422 without calling Gemini.',
      'Apply per-IP request limiting. The in-memory map expires entries after 15 minutes.',
      'Call generateWellnessGuide(query), which uses provider schema output and server validation.',
      'Attempt authenticated persistence only if an Authorization bearer is present.',
      'Return the guide with history status or a controlled safe error response.',
    ]: bullet(doc,x)
    heading(doc,'E.5 Rate Limiter Characteristics')
    body(doc,'The current limiter stores one counter and expiration timestamp per remote IP in a process-local Map. A new or expired entry begins at one; each subsequent search increments the count; requests beyond 20 in the 15-minute window are rejected. When the Map exceeds 5,000 keys, expired entries are pruned. This is a simple single-process control: counters reset on server restart and are not shared across multiple replicas. A horizontally scaled deployment should move rate-limiting state to a shared store or gateway.')
    code(doc,'''const windowMs = 15 * 60 * 1000
const requestLimit = 20
if (!current || current.expiresAt <= now) {
  requests.set(ip, { count: 1, expiresAt: now + windowMs })
  return false
}
current.count += 1
return current.count > requestLimit''')
    heading(doc,'E.6 Gemini Validation Layers')
    table(doc,['Layer','Implementation','Failure outcome'],[
      ('Prompt constraints','System instruction forbids diagnosis, cure claims, medication changes and unsafe practices.','Model may still err; prompt is not treated as proof.'),
      ('JSON schema','Provider response requested as application/json with an explicit schema.','Unparseable text produces a controlled failure.'),
      ('Zod schema','Strict object, bounded strings and bounded arrays.','Unexpected shape is rejected.'),
      ('Content checks','Reject selected unsafe directions and medical-unit quantities.','Guide fails validation rather than being displayed.'),
      ('UI notice','Results page displays general wellness/safety language.','User is directed to professional or urgent care when appropriate.'),
    ],[1.25,3.1,1.95])

    new_appendix(doc,'F','Installation and Deployment Runbook',
      'This runbook restates the project’s actual workspace commands and environment boundaries. It is a reproducible local setup guide, not a claim that the project has been deployed to a public host.')
    heading(doc,'F.1 Repository Layout')
    table(doc,['Path','Responsibility','Environment boundary'],[
      ('client/','React/Vite browser app, assets, client tests and build output.','VITE_ variables are browser-visible; only publishable values belong here.'),
      ('server/','Node.js API, Gemini integration, Supabase persistence, server tests.','Keep private Gemini/database configuration here and out of source control.'),
      ('supabase/','TOML config, SQL migrations, and database checks.','Migrations are shared, reviewable schema history.'),
      ('package.json','npm workspace coordinator and scripts.','Run workspace-level commands from the repository root.'),
    ],[1.1,2.65,2.55])
    heading(doc,'F.2 Local Development Setup')
    for x in [
      'Install the supported Node.js runtime and npm on the development machine.',
      'From the repository root, run npm install to install the client and server workspaces.',
      'Copy client/.env.example to client/.env and set VITE_API_URL, VITE_SUPABASE_URL, and VITE_SUPABASE_PUBLISHABLE_KEY as needed.',
      'Copy server/.env.example to server/.env and configure PORT, CLIENT_ORIGINS, GEMINI_API or GEMINI_API_KEY, GEMINI_MODEL, SUPABASE_URL, and SUPABASE_PUBLISHABLE_KEY.',
      'Keep real .env files excluded from Git. Never place Gemini keys or database passwords in VITE_ variables.',
      'Run npm run dev for the development stack, or use npm run dev:client and npm run dev:server in separate terminals.',
      'Open the Vite client at http://localhost:5173 and check the API at http://localhost:3000/api/health.',
    ]: bullet(doc,x)
    body(doc,'For a provider-independent interface demonstration, the results page exposes /results/demo with a sample guide. A provider-backed search requires the server environment to contain a valid Gemini credential. Avoid copying credentials into screenshots, logs, issue reports, or academic appendices.')
    heading(doc,'F.3 Database Migration Procedure')
    body(doc,'The schema is maintained as ordered SQL migrations under supabase/migrations. The initial migration defines tables, indexes, helper triggers, grants, and owner policies. The later migration adds save_wellness_guide and restricts execution to authenticated callers. For a local Supabase stack, start the CLI/Docker-backed stack and apply migrations with the project’s documented reset workflow. For a hosted project, review migration SQL, back up relevant data, apply migrations through the chosen controlled process, and verify objects and grants afterward.')
    table(doc,['Verification item','Expected state'],[
      ('Tables','profiles, searches, wellness_guides, remedies, yoga_practices, related_videos, saved_items, wellness_response_cache exist.'),
      ('RLS','RLS enabled on all user or cache tables.'),
      ('Function','save_wellness_guide accepts only authenticated execution and derives owner from auth.uid().'),
      ('Role grants','Anonymous role cannot execute the save RPC or read owner-only rows.'),
      ('Data checks','Invalid query length and malformed guide arrays fail inside the database function.'),
    ],[1.55,4.75])
    heading(doc,'F.4 Build and Deployment Sequence')
    for x in [
      'Run the automated client and server suites, database checks, and a production client build.',
      'Deploy the client as a static Vite build and deploy the Node API as a separate service.',
      'Set VITE_API_URL and public Supabase values in the client host; set server-only values in the API host.',
      'Configure CLIENT_ORIGINS to exact deployed client origins and verify preflight requests.',
      'Apply the reviewed migrations before using signed-in persistence.',
      'Check /api/health, execute one low-risk synthetic search, and inspect provider and database behavior without real personal health data.',
      'Confirm build artifacts contain no private secrets and that logs omit submitted query text.',
    ]: bullet(doc,x)
    heading(doc,'F.5 Operations and Troubleshooting')
    table(doc,['Symptom','Likely configuration area','Safe diagnostic'],[
      ('Client says service is unreachable','API process, VITE_API_URL, CORS or network.','Open /api/health and inspect browser network status.'),
      ('Search returns 502','Gemini key/model, provider availability, JSON/schema response.','Review server error category; do not log the user query or key.'),
      ('Search returns 429','Per-IP request window.','Wait for Retry-After; check test traffic and proxy IP forwarding.'),
      ('History is not saved','No bearer token, invalid session, missing RPC migration, or database error.','Inspect historyStatus and verify auth/RPC grants.'),
      ('Browser preflight blocked','CLIENT_ORIGINS does not contain exact origin.','Compare scheme, host, and port with deployment settings.'),
    ],[1.45,2.3,2.55])

    new_appendix(doc,'G','Verification Procedures and Results',
      'This appendix provides repeatable verification details. Reported pass counts reflect the project checks already executed: 21 client tests, 8 server tests, 8 database tests, and a successful production build. The database tests use PGlite and should not be mistaken for a full hosted production audit.')
    heading(doc,'G.1 Test Layers')
    table(doc,['Layer','Main concern','Evidence location','Limit'],[
      ('Client component','Visible page behavior, request handling, result content, and pose search URLs.','client/src/**/*.test.jsx','Does not cover every browser, screen-reader, or device combination.'),
      ('Server unit/integration','Health, search input, safety, rate limiting, provider output and persistence branches.','server/tests/*.test.js','Mocks do not prove external provider uptime.'),
      ('Database/RLS','Migration structures, owner boundaries, and save RPC behavior.','supabase/tests/rls.test.js','PGlite differs from a production Supabase deployment.'),
      ('Production build','Vite compiles the static client assets.','npm run build','Build success is not a deployment or runtime availability test.'),
    ],[1.25,2.4,1.55,1.55])
    heading(doc,'G.2 Search Scenario Test Protocol')
    table(doc,['Case','Input or condition','Expected result','Evidence/status'],[
      ('S-01','GET /api/health.','200 status JSON.','Server test PASS.'),
      ('S-02','Empty query, wrong type, extra body property.','400; no provider call.','Server test PASS.'),
      ('S-03','Body beyond 8 KB.','413; parser stops.','Server test PASS.'),
      ('S-04','Query longer than 180 characters.','400 input error.','Server test PASS.'),
      ('S-05','Emergency-pattern synthetic text.','422 urgent-care message; Gemini not called.','Server test PASS.'),
      ('S-06','More than 20 requests in 15 minutes from test IP.','429 plus Retry-After.','Server test PASS.'),
      ('S-07','Valid guide with no bearer.','200 guide and anonymous history status.','Server/persistence tests PASS.'),
      ('S-08','Invalid bearer token.','401 invalid_session.','Server/persistence tests PASS.'),
      ('S-09','Provider unavailable or invalid JSON.','Safe 502 without secret exposure.','Server test PASS.'),
      ('S-10','Valid bearer and successful RPC.','Saved state and generated IDs returned.','Persistence test PASS.'),
    ],[.7,2.15,2.05,1.45])
    heading(doc,'G.3 Browser Acceptance Procedure')
    for x in [
      'Open the home route and confirm the project title, search field, example topics, and page sections render.',
      'Submit a low-risk synthetic wellness topic and wait for the guide response.',
      'Confirm the query label, summary, safety note, remedy tab, yoga tab, and relevant recommendations appear.',
      'Open the yoga keyword cards and confirm each uses its local pose thumbnail and an external YouTube results URL.',
      'Use the inline search control and confirm successful navigation to a new guide.',
      'Force an API/network failure in a test environment and confirm the client gives a readable retry message.',
      'Check layout at narrow and wide viewport sizes and keyboard focus order before deployment.',
    ]: bullet(doc,x)
    heading(doc,'G.4 Interpreting the Recorded Results')
    body(doc,'The client suite records 21 passing tests and the server suite records 8 passing tests. The database checks report 8 passing cases. A production client build completed successfully. The checks are useful evidence of implemented behavior, but they are not proof of clinical accuracy, universal browser accessibility, load capacity, or production security. Provider calls may be environment-dependent; the separate Gemini smoke script is an optional live check and is not included in the pass totals.')
    table(doc,['Claim','Supported by current evidence?','Interpretation'],[
      ('The client compiles for production.','Yes.','Build output was generated successfully.'),
      ('The tested client/server/database cases pass.','Yes.','21 client + 8 server + 8 database cases.'),
      ('Hosted production is deployed and monitored.','No.','Deployment has not been performed.'),
      ('Every emergency is detected.','No.','Phrase screening is limited and rule-based.'),
      ('The guide is medically accurate or effective.','No.','No clinical validation or outcome study is supplied.'),
      ('UI saves signed-in history today.','No.','The current UI does not attach the bearer token.'),
    ],[2.3,1.65,2.35])

    new_appendix(doc,'H','Safety, Privacy, and Risk Analysis',
      'Wellness searches can contain sensitive information even when the application is not a clinical record system. The following analysis separates implemented safeguards from operational and product work that remains.')
    heading(doc,'H.1 Safety Control Layers')
    table(doc,['Control','Implemented behavior','Residual limitation'],[
      ('Emergency phrases','Pattern checks for selected urgent symptoms and self-harm terms before AI generation.','Cannot recognize every phrase, language, spelling, or clinical emergency.'),
      ('System instruction','Prohibits diagnosis, cure/prevention claims, treatment changes, doses, and strenuous yoga.','A provider can still return incorrect or inappropriate content.'),
      ('Structured output','Provider JSON schema, strict Zod schema, bounded text/arrays, selected unsafe-content checks.','Schema validation does not establish factual truth or clinical safety.'),
      ('Safety note','Results interface identifies general information and advises professional care.','A disclaimer does not replace safer product design or expert review.'),
      ('Yoga precautions','Gentle, optional movement instructions and stop-if-unwell guidance.','Individual injuries and physical conditions are unknown.'),
    ],[1.35,2.75,2.2])
    heading(doc,'H.2 Threat and Mitigation Review')
    table(doc,['Threat or failure','Current mitigation','Recommended follow-up'],[
      ('Prompt injection in topic text','Topic is framed as data and strict schemas constrain returned fields.','Expand adversarial tests and review model refusal/unsafe output handling.'),
      ('Credential exposure','Gemini and private Supabase values stay server-side; errors redact known key formats.','Rotate credentials on suspected exposure; scan releases and logs.'),
      ('Cross-origin abuse','Configured origin allowlist and preflight handling.','Keep production origins exact and review trusted proxy behavior.'),
      ('Automated request abuse','Per-IP in-memory rate limiter and 8 KB request cap.','Use a shared gateway/limiter for multiple replicas; monitor abuse safely.'),
      ('Cross-user data access','RLS predicates and owner-scoped SECURITY DEFINER save function.','Review SQL grants and test against hosted Supabase roles before release.'),
      ('Provider error leakage','Generic client error and server redaction.','Audit logs and monitoring to prevent query/key capture.'),
      ('External video quality','Cards disclose external search and use keyword URLs.','Keep external-link disclosure and assess safe browsing expectations.'),
    ],[1.55,2.45,2.25])
    heading(doc,'H.3 Data Flow and Minimization')
    body(doc,'The browser sends the topic to the Node API over HTTP in local development and should use HTTPS when deployed. The API forwards the topic to Gemini for generation. Server code avoids logging the submitted query body. Without a bearer token, the current request is treated as anonymous and is not persisted by the guide-save helper. A valid bearer would be verified and then passed to a narrowly scoped RPC; however, the current UI does not attach a session token. Provider retention, host logs, backups, database policy, and privacy notice still need operational review.')
    for x in [
      'Do not use real user symptoms in demonstrations, screenshots, test fixtures, or public issue logs.',
      'Keep only the minimum data required for the requested feature and document retention/deletion behavior before collecting real accounts.',
      'Avoid recording query text in server logs, analytics, crash reports, or third-party monitoring payloads.',
      'Use synthetic topics for test and smoke requests; remove any accidental sensitive data from exported evidence.',
      'Publish a clear notice describing the Gemini provider, saved-history behavior, external video navigation, and support boundaries.',
    ]: bullet(doc,x)
    heading(doc,'H.4 Wellness Safety Review and Release Gate')
    body(doc,'The product should not present its text as a diagnosis, personalized treatment plan, or substitute for care. Before a public health-related release, an appropriately qualified reviewer should assess the safety instruction, emergency language, recommendation tone, potential allergy and pregnancy concerns, and the interpretation of yoga guidance. The application should avoid implying that a traditional remedy has established efficacy unless supported by reviewed evidence. Users with severe, rapidly worsening, persistent, or urgent symptoms should be directed to qualified care.')
    table(doc,['Release question','Current assessment'],[
      ('Is emergency phrase screening implemented?','Yes, limited rule patterns are present.'),
      ('Is every result clinician-reviewed?','No.'),
      ('Is authenticated history reachable in the current UI?','No; server/database support exists, UI token flow is absent.'),
      ('Are external YouTube results controlled by the application?','No; the browser opens a keyword search.'),
    ],[3.65,2.55])

    new_appendix(doc,'I','Future Development Roadmap and Acceptance Criteria',
      'This roadmap describes potential work based on the current implementation gaps. It is a proposed sequence rather than a claim that the features have already been built or scheduled.')
    heading(doc,'I.1 Priority 1: Complete the Authenticated Client Flow')
    body(doc,'The server and database support owner-scoped guide persistence, but the current client does not expose sign-in or attach the user bearer token to searches. Completing this path is the next functional step if saved history is required. The flow should use Supabase Auth sessions, attach the current access token to the API request, present clear signed-in and guest states, and avoid placing private service credentials in the browser.')
    table(doc,['Work item','Acceptance criteria','Verification evidence'],[
      ('Sign-in and account recovery','User can register/sign in and receive clear validation and recovery messages.','Component and browser tests with synthetic accounts.'),
      ('Session lifecycle','Client restores a valid session, handles expiry, and supports sign out.','Tests for fresh, expired, and absent sessions.'),
      ('API Authorization header','Search request attaches the current Supabase access token only when signed in.','Request test confirms token propagation and excludes secrets.'),
      ('Saved guide state','UI accurately reflects saved, anonymous, unavailable, and invalid-session outcomes.','Server/client contract tests and visible status checks.'),
      ('History view','User can list only their own searches and open a saved guide.','Two-user RLS test proves there is no cross-account access.'),
      ('Deletion and retention','User can delete history and published retention terms match actual behavior.','Database deletion test and privacy review.'),
    ],[1.45,2.55,2.2])
    heading(doc,'I.2 Priority 2: Accessibility and Responsive Review')
    body(doc,'The current React application has semantic headings, form controls, tab roles, safety notices, and text alternatives on yoga artwork. A release review should verify the entire interaction with keyboard-only use and screen readers. Focus must remain visible and move predictably after navigation; the results tabs must expose their selected state; errors should be announced; and decorative artwork should not create redundant speech. Contrast and zoom behavior should be checked on real browser engines at narrow and wide widths.')
    table(doc,['Review area','Acceptance condition','Method'],[
      ('Keyboard navigation','Every interactive control is reachable and has a visible focus indicator.','Manual keyboard walkthrough of home and results routes.'),
      ('Screen reader semantics','Labels, headings, tabs, error messages, and external links are understandable.','NVDA/VoiceOver-style assistive technology review.'),
      ('Zoom and reflow','Content remains usable at 200% zoom and small viewport widths.','Browser zoom and responsive viewport checks.'),
      ('Color and contrast','Text and controls remain distinguishable without color alone.','Contrast tooling plus visual inspection.'),
      ('Reduced motion','Motion does not prevent access or cause unnecessary discomfort.','System reduced-motion preference review.'),
    ],[1.45,2.65,2.1])
    heading(doc,'I.3 Priority 3: Production Operations')
    for x in [
      'Use HTTPS for the deployed client-to-API connection and verify secure headers at the hosting edge.',
      'Use a distributed rate limit if the Node API runs with multiple replicas; the current limiter is process-local.',
      'Set request timeouts, graceful shutdown behavior, and provider concurrency limits appropriate to the deployment tier.',
      'Monitor service health, latency, provider failures, database persistence status, and rate-limit events without recording search topics.',
      'Review log retention, access permissions, alert routing, backup restoration, and incident response before real user onboarding.',
      'Keep staging and production environment values separate and rotate credentials through the hosting provider’s secret manager.',
      'Document how migrations are approved, applied, verified, and rolled back where rollback is safe.',
    ]: bullet(doc,x)
    heading(doc,'I.4 Clinical and Content Governance')
    body(doc,'Before broader use, define who reviews wellness prompts and generated content, how safety changes are versioned, and how user concerns are handled. A qualified reviewer should evaluate the system instruction, emergency guidance, examples, disclaimer placement, ingredient wording, yoga precautions, and third-party video language. Reviewers should be able to trace a guide to model and safety versions without exposing user query text in routine logs. The team should maintain a documented change process for prompts and schemas so safety regressions can be investigated.')
    table(doc,['Governance item','Proposed acceptance condition'],[
      ('Content review','Written review by qualified practitioners; documented scope and limits.'),
      ('Prompt/schema versioning','Each change is recorded and tested against safety-focused fixtures.'),
      ('Incident handling','A documented path exists for reporting a harmful or misleading output.'),
      ('External links','Video cards remain clearly described as third-party search results.'),
      ('User notice','Privacy and wellness notices match deployed data and provider behavior.'),
    ],[1.9,4.3])
    heading(doc,'I.5 Definition of a Release Candidate')
    body(doc,'A release candidate should have a reviewed scope, passing automated checks, successful production build, verified migrations and grants, tested CORS origins, documented environment variables, and a deployment health check. If authenticated persistence is advertised, the client must implement the session flow and prove cross-user isolation against the hosted Supabase project. If sign-in remains absent, product text should state that current browser searches are not saved. The release decision should also consider accessibility findings, professional review of safety language, privacy notice accuracy, and operational support readiness.')

    # Maintain the report's typographic hierarchy as requested.
    normalize_sizes(doc)
    doc.core_properties.title='AAROGYAM AI: AI-Powered Wellness Guidance Platform'
    doc.core_properties.subject='MCA Project Report — Ayush Thakur, MCA 3rd Semester, HPTU'
    doc.save(str(DOC_PATH))
    print('SAVED',DOC_PATH,'bytes',DOC_PATH.stat().st_size)

if __name__=='__main__': build()

