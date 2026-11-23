# AAROGYAM AI

Ancient Wisdom. Intelligent Wellness.

## Project structure

- `client/` — React + Vite frontend, written in plain JavaScript. It owns its package manifest, Vite/Vitest configuration, and client environment files.
- `server/` — Node.js API, written in plain JavaScript, with its own package and private environment files.
- `supabase/` — shared database configuration, migrations, and database checks.
- Root `package.json` — npm workspace coordinator and unified development scripts.

## Install and run

Install workspace dependencies from the project root:

```sh
npm install
```

Configure `client/.env` and `server/.env` based on the `.env.example` templates.

Start both the backend API server and frontend client with a single command:

```sh
npm run dev
```

Alternatively, you can run them individually:

```sh
npm run dev:server   # Node API on http://localhost:3000
npm run dev:client   # Vite client on http://localhost:5173
```

- Client: `http://localhost:5173`
- Server health endpoint: `http://localhost:3000/api/health`

Use the Supabase publishable key in both `client/.env` and `server/.env`. The server validates the user's bearer token and calls a restricted, owner-scoped database function; it does not need a service-role key. Keep AI provider keys only in `server/.env`; never add a `VITE_` prefix to them.

## Gemini wellness search

Set `GEMINI_API` (or `GEMINI_API_KEY`) in `server/.env`. Search requests go from the browser to the Node server, which calls Gemini with structured JSON output and validates the response against strict health, safety, and database schemas.

- **Primary Model**: `gemini-3.1-flash-lite` (fast response, low latency).
- **Fallback Models**: Automatic fallback to `gemini-3.5-flash-lite` and `gemini-3.6-flash` if a model experiences high demand or temporary provider downtime.
- **Emergency Filter**: Obvious emergency symptoms (e.g., chest pain, difficulty breathing, stroke signs) are intercepted immediately and returned with urgent care guidance without calling the AI model.
- **Persistence**: Signed-in guides are saved through the `save_wellness_guide` RPC and remain scoped to the authenticated owner. Anonymous searches provide the full guide without persisting to history.

Run a live provider smoke check with:

```sh
npm run test:gemini
```

## Checks & Tests

```sh
npm test         # Run client and server test suites
npm run build    # Build client for production
npm run test:db  # Database RLS and persistence checks
```

## Deployment Guide (Render & Vercel Ready)

AAROGYAM AI is configured for zero-friction deployment to **Render** and **Vercel** with full support for both unified fullstack deployments and split architectures.

### Option 1: Deploy to Render (Fullstack Web Service - Recommended)

Deploy frontend and backend together on a single Render Web Service ($0 free tier):

1. Push your code to a GitHub repository.
2. In the [Render Dashboard](https://dashboard.render.com), click **New +** > **Blueprint**.
3. Select your repository. Render will automatically detect the [`render.yaml`](file:///c:/Users/thaku/OneDrive/Desktop/AAROGYAM%20AI/render.yaml) blueprint:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
4. In the Environment Variables screen, fill in:
   - `GEMINI_API_KEY`: Your Gemini API key from Google AI Studio.
   - `SUPABASE_URL` / `SUPABASE_ANON_KEY` (Optional for persistence): Your Supabase project credentials.
5. Click **Apply**. Your app is live at `https://<your-service>.onrender.com`!

### Option 2: Deploy to Vercel (Frontend SPA + Serverless API)

Deploy both the Vite client and Node.js API functions serverless on Vercel:

1. Push your code to a GitHub repository.
2. In the [Vercel Dashboard](https://vercel.com/new), import your repository.
3. Vercel automatically detects [`vercel.json`](file:///c:/Users/thaku/OneDrive/Desktop/AAROGYAM%20AI/vercel.json):
   - **Build Command**: `npm run build`
   - **Output Directory**: `client/dist`
   - **Serverless API**: Handled automatically by [`api/index.js`](file:///c:/Users/thaku/OneDrive/Desktop/AAROGYAM%20AI/api/index.js).
4. Under **Environment Variables**, add:
   - `GEMINI_API_KEY`: Your Gemini API key.
   - (Optional) `SUPABASE_URL` and `SUPABASE_ANON_KEY`.
5. Click **Deploy**. Your app is live at `https://<your-project>.vercel.app`!

### Option 3: Split Deployment (Vercel Frontend + Render Backend)

- **Backend on Render**: Deploy as a Web Service running `node server/index.js`.
- **Frontend on Vercel**: In Vercel Project Settings, add `VITE_API_URL=https://<your-render-service>.onrender.com`.
- **CORS**: The backend server automatically accepts requests from `*.vercel.app` and `*.onrender.com` domains out of the box. Additional domains can be configured via `CLIENT_ORIGINS`.
