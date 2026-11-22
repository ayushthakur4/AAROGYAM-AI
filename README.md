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

## Deployment preparation

Deploy the `client/` Vite build as a static site and the `server/` Node API as a separate service. Configure `VITE_API_URL`, `VITE_SUPABASE_URL`, and `VITE_SUPABASE_PUBLISHABLE_KEY` in the client host. Configure `PORT`, `CLIENT_ORIGINS`, `GEMINI_API`, `GEMINI_MODEL`, `SUPABASE_URL`, and `SUPABASE_PUBLISHABLE_KEY` in the server host.
