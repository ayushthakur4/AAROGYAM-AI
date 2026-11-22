import assert from 'node:assert/strict'
import test from 'node:test'
import { saveGuideForSession } from '../src/persistence.js'

test('validates the user session and saves only the provided guide through the user token', async () => {
  let authToken
  let rpcCall
  const result = await saveGuideForSession('Bearer user-token', 'sleep', {
    summary: 'A calm guide.', safetyNote: 'General information.', modelVersion: 'test',
    remedies: [{ title: 'Tea', summary: 'Comfort', ingredients: [], steps: [], usage: 'Optional', precautions: [] }],
    yoga: [{ title: 'Rest', summary: 'Gentle', durationMinutes: 3, steps: [], precautions: [] }],
    videos: [],
  }, {
    url: 'https://project.example', key: 'publishable',
    createClient: (url, key, config) => {
      assert.equal(url, 'https://project.example')
      assert.equal(key, 'publishable')
      assert.equal(config.global.headers.Authorization, 'Bearer user-token')
      return {
        auth: { getUser: async (token) => { authToken = token; return { data: { user: { id: 'user-1' } }, error: null } } },
        rpc: async (name, args) => { rpcCall = { name, args }; return { data: { searchId: 'search-1', remedyIds: ['r1'], yogaIds: ['y1'] }, error: null } },
      }
    },
  })
  assert.equal(authToken, 'user-token')
  assert.equal(rpcCall.name, 'save_wellness_guide')
  assert.equal(rpcCall.args.p_query, 'sleep')
  assert.equal(rpcCall.args.p_guide.yoga[0].duration_minutes, 3)
  assert.deepEqual(result, { status: 'saved', searchId: 'search-1', remedies: ['r1'], yoga: ['y1'] })
})

test('does not persist anonymous or invalid sessions', async () => {
  assert.deepEqual(await saveGuideForSession('', 'sleep', {}), { status: 'anonymous' })
  const invalid = await saveGuideForSession('Bearer expired', 'sleep', {}, {
    url: 'https://project.example', key: 'publishable',
    createClient: () => ({ auth: { getUser: async () => ({ data: { user: null }, error: new Error('expired') }) } }),
  })
  assert.deepEqual(invalid, { status: 'invalid' })
})
