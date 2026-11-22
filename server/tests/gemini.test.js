import assert from 'node:assert/strict'
import test from 'node:test'
import { generateWellnessGuide } from '../src/gemini.js'

const validModelGuide = {
  summary: 'Gentle comfort steps may help you feel more at ease while you recover.',
  remedies: [{
    title: 'Rest and fluids',
    summary: 'Make room for rest and drink according to thirst.',
    ingredients: [{ name: 'Water', amount: 'As comfortable' }],
    steps: ['Choose a drink you enjoy.', 'Rest when you can.'],
    usage: 'Use as a comfort measure only.',
    precautions: ['Follow any fluid limits from your clinician.'],
  }],
  yoga: [{
    title: 'Supported seated rest',
    summary: 'A quiet, supported pause.',
    durationMinutes: 2,
    steps: ['Sit with both feet supported.', 'Stop if you feel unwell.'],
    precautions: ['Skip movement if dizzy or short of breath.'],
  }],
}

test('generates and validates a guide before returning the UI shape', async () => {
  let request
  const client = { models: { generateContent: async (value) => { request = value; return { text: JSON.stringify(validModelGuide) } } } }
  const guide = await generateWellnessGuide('mild cold comfort', { apiKey: 'test-only', model: 'test-model', client })

  assert.equal(request.model, 'test-model')
  assert.equal(request.config.responseMimeType, 'application/json')
  assert.equal(guide.query, 'mild cold comfort')
  assert.equal(guide.yoga[0].duration, '2 min')
  assert.match(guide.safetyNote, /not a diagnosis/i)
  assert.deepEqual(guide.videos, [])
})

test('rejects malformed JSON and output that contains unsafe dosage directions', async () => {
  const malformedClient = { models: { generateContent: async () => ({ text: 'not-json' }) } }
  await assert.rejects(generateWellnessGuide('a topic', { apiKey: 'test-only', client: malformedClient }), /unreadable response/i)

  const unsafeGuide = structuredClone(validModelGuide)
  unsafeGuide.remedies[0].usage = 'Take 500 mg three times a day.'
  const unsafeClient = { models: { generateContent: async () => ({ text: JSON.stringify(unsafeGuide) }) } }
  await assert.rejects(generateWellnessGuide('a topic', { apiKey: 'test-only', client: unsafeClient }), /safety checks/i)
})
