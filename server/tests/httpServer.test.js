import assert from 'node:assert/strict'
import { once } from 'node:events'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { createServer } from '../src/httpServer.js'

async function withServer(server, run) {
  server.listen(0, '127.0.0.1')
  await once(server, 'listening')
  const { port } = server.address()
  try {
    await run(`http://127.0.0.1:${port}`)
  } finally {
    server.close()
    await once(server, 'close')
  }
}

test('valid search requests return a no-store guide and allow the client origin', async () => {
  let calls = 0
  const server = createServer({
    allowedOrigins: ['http://localhost:5173'],
    generateGuide: async (query) => { calls += 1; return { query, summary: 'A gentle guide.' } },
    saveGuide: async () => ({ status: 'anonymous' }),
  })
  await withServer(server, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: 'http://localhost:5173' },
      body: JSON.stringify({ query: 'mild cold comfort' }),
    })
    assert.equal(response.status, 200)
    assert.equal(response.headers.get('cache-control'), 'no-store')
    assert.equal(response.headers.get('access-control-allow-origin'), 'http://localhost:5173')
    assert.deepEqual(await response.json(), { query: 'mild cold comfort', summary: 'A gentle guide.', videos: [], historySaved: false, historyStatus: 'anonymous' })
    assert.equal(calls, 1)
  })
})

test('persists recommendations for a signed-in user without a YouTube API', async () => {
  const server = createServer({
    generateGuide: async (query) => ({ query, summary: 'A gentle guide.', remedies: [{ title: 'Tea' }], yoga: [{ title: 'Rest' }] }),
    saveGuide: async (authorization, query, guide) => {
      assert.equal(authorization, 'Bearer user-token')
      assert.equal(query, 'relaxation')
      assert.deepEqual(guide.videos, [])
      return { status: 'saved', searchId: 'search-1', remedies: ['remedy-1'], yoga: ['yoga-1'] }
    },
  })
  await withServer(server, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer user-token' },
      body: JSON.stringify({ query: 'relaxation' }),
    })
    const body = await response.json()
    assert.equal(response.status, 200)
    assert.equal(body.historySaved, true)
    assert.equal(body.searchId, 'search-1')
    assert.equal(body.remedies[0].id, 'remedy-1')
    assert.equal(body.yoga[0].id, 'yoga-1')
    assert.deepEqual(body.videos, [])
  })
})

test('validates requests and returns urgent-care instructions without calling Gemini', async () => {
  let calls = 0
  const server = createServer({ generateGuide: async () => { calls += 1; return {} } })
  await withServer(server, async (baseUrl) => {
    const invalid = await fetch(`${baseUrl}/api/search`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query: '  ' }) })
    assert.equal(invalid.status, 400)

    const urgent = await fetch(`${baseUrl}/api/search`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query: 'I have severe chest pain' }) })
    const body = await urgent.json()
    assert.equal(urgent.status, 422)
    assert.equal(body.code, 'urgent_care')
    assert.match(body.error, /emergency department/i)
    assert.equal(calls, 0)
  })
})

test('returns 404 for unknown endpoints and rejects unapproved preflight origins', async () => {
  const server = createServer({ allowedOrigins: ['http://localhost:5173'], generateGuide: async () => ({}) })
  await withServer(server, async (baseUrl) => {
    const missing = await fetch(`${baseUrl}/api/nope`)
    assert.equal(missing.status, 404)
    const preflight = await fetch(`${baseUrl}/api/search`, { method: 'OPTIONS', headers: { Origin: 'https://not-allowed.example' } })
    assert.equal(preflight.status, 403)
  })
})

test('handles health check route', async () => {
  const server = createServer()
  await withServer(server, async (baseUrl) => {
    const res = await fetch(`${baseUrl}/api/health`)
    assert.equal(res.status, 200)
    const body = await res.json()
    assert.equal(body.status, 'ok')
    assert.equal(body.service, 'aarogyam-ai-api')
  })
})

test('allows origins from vercel.app and onrender.com in default configuration', async () => {
  const server = createServer()
  await withServer(server, async (baseUrl) => {
    const vercelPreflight = await fetch(`${baseUrl}/api/search`, {
      method: 'OPTIONS',
      headers: { Origin: 'https://aarogyam-ai-preview.vercel.app' },
    })
    assert.equal(vercelPreflight.status, 204)
    assert.equal(vercelPreflight.headers.get('access-control-allow-origin'), 'https://aarogyam-ai-preview.vercel.app')

    const renderPreflight = await fetch(`${baseUrl}/api/search`, {
      method: 'OPTIONS',
      headers: { Origin: 'https://aarogyam-ai.onrender.com' },
    })
    assert.equal(renderPreflight.status, 204)
    assert.equal(renderPreflight.headers.get('access-control-allow-origin'), 'https://aarogyam-ai.onrender.com')
  })
})

test('serves static files and provides SPA index.html fallback for client routing', async () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'aarogyam-test-dist-'))
  fs.writeFileSync(path.join(tempDir, 'index.html'), '<!doctype html><html><body><h1>AAROGYAM</h1></body></html>', 'utf8')
  fs.mkdirSync(path.join(tempDir, 'assets'))
  fs.writeFileSync(path.join(tempDir, 'assets', 'style.css'), 'body { background: #fff; }', 'utf8')

  const server = createServer({ distDir: tempDir })
  try {
    await withServer(server, async (baseUrl) => {
      // Direct root request
      const rootRes = await fetch(`${baseUrl}/`)
      assert.equal(rootRes.status, 200)
      assert.match(rootRes.headers.get('content-type'), /text\/html/)
      assert.match(await rootRes.text(), /<h1>AAROGYAM<\/h1>/)

      // SPA client route fallback (/results)
      const spaRes = await fetch(`${baseUrl}/results`)
      assert.equal(spaRes.status, 200)
      assert.match(spaRes.headers.get('content-type'), /text\/html/)
      assert.match(await spaRes.text(), /<h1>AAROGYAM<\/h1>/)

      // Static asset request (/assets/style.css)
      const assetRes = await fetch(`${baseUrl}/assets/style.css`)
      assert.equal(assetRes.status, 200)
      assert.match(assetRes.headers.get('content-type'), /text\/css/)
      assert.equal(assetRes.headers.get('cache-control'), 'public, max-age=31536000, immutable')

      // Missing asset with extension returns 404
      const missingAsset = await fetch(`${baseUrl}/assets/missing.png`)
      assert.equal(missingAsset.status, 404)
    })
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true })
  }
})
