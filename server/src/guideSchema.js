import { z } from 'zod'

const text = z.string().trim().min(1).max(900)
const stringList = z.array(text).max(8)

export const wellnessGuideSchema = z.object({
  summary: text,
  remedies: z.array(z.object({
    title: text,
    summary: text,
    ingredients: z.array(z.object({ name: text, amount: text }).strict()).max(8),
    steps: stringList,
    usage: text,
    precautions: stringList,
  }).strict()).max(5),
  yoga: z.array(z.object({
    title: text,
    summary: text,
    durationMinutes: z.number().int().min(1).max(30),
    steps: stringList,
    precautions: stringList,
  }).strict()).max(4),
}).strict()

// Keep the provider schema to portable JSON Schema keywords. Zod remains the
// authoritative validator after the model responds.
export const wellnessGuideJsonSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    summary: { type: 'string', description: 'A short, neutral wellness overview. Never diagnose or claim a cure.' },
    remedies: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          title: { type: 'string' },
          summary: { type: 'string' },
          ingredients: {
            type: 'array',
            items: { type: 'object', additionalProperties: false, properties: { name: { type: 'string' }, amount: { type: 'string' } }, required: ['name', 'amount'] },
          },
          steps: { type: 'array', items: { type: 'string' } },
          usage: { type: 'string' },
          precautions: { type: 'array', items: { type: 'string' } },
        },
        required: ['title', 'summary', 'ingredients', 'steps', 'usage', 'precautions'],
      },
    },
    yoga: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          title: { type: 'string' },
          summary: { type: 'string' },
          durationMinutes: { type: 'integer' },
          steps: { type: 'array', items: { type: 'string' } },
          precautions: { type: 'array', items: { type: 'string' } },
        },
        required: ['title', 'summary', 'durationMinutes', 'steps', 'precautions'],
      },
    },
  },
  required: ['summary', 'remedies', 'yoga'],
}

export const safetyNote = 'This is general wellness information, not a diagnosis or treatment plan. Do not stop or replace care from a qualified health professional. Seek urgent care for severe, rapidly worsening, or emergency symptoms.'
