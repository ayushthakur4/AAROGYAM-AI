import assert from 'node:assert/strict'
import { once } from 'node:events'
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
