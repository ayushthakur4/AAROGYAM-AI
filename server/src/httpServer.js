import { createServer as createHttpServer } from 'node:http'
import { z } from 'zod'
import { generateWellnessGuide } from './gemini.js'
import { saveGuideForSession } from './persistence.js'
import { emergencyResponse, isEmergencyQuery } from './safety.js'

const searchRequestSchema = z.object({ query: z.string().trim().min(1).max(180) }).strict()
const bodyLimit = 8 * 1024
const windowMs = 15 * 60 * 1000
const requestLimit = 20

function createRateLimiter() {
  const requests = new Map()
  return function isRateLimited(ip, now = Date.now()) {
    const current = requests.get(ip)
    if (!current || current.expiresAt <= now) {
      requests.set(ip, { count: 1, expiresAt: now + windowMs })
      if (requests.size > 5000) {
        for (const [key, entry] of requests) if (entry.expiresAt <= now) requests.delete(key)
      }
      return false
    }
    current.count += 1
    return current.count > requestLimit
  }
}

function sendJson(response, statusCode, payload, headers = {}) {
  response.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers })
  response.end(JSON.stringify(payload))
}

async function readJsonBody(request) {
  const chunks = []
  let size = 0
  for await (const chunk of request) {
    size += chunk.length
    if (size > bodyLimit) throw Object.assign(new Error('Request is too large.'), { statusCode: 413 })
    chunks.push(chunk)
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'))
  } catch {
    throw Object.assign(new Error('Send a valid JSON request.'), { statusCode: 400 })
  }
}

function checkOrigin(origin, allowedOrigins, allowLocalhost) {
  if (!origin) return false
  if (allowedOrigins.has(origin)) return true
  if (allowLocalhost) {
    try {
      const url = new URL(origin)
      if ((url.hostname === 'localhost' || url.hostname === '127.0.0.1') && ['http:', 'https:'].includes(url.protocol)) {
        return true
      }
    } catch {}
  }
  return false
}

export function createServer(options = {}) {
  const customOriginsProvided = Boolean(options.allowedOrigins)
  const configuredOrigins = options.allowedOrigins || process.env.CLIENT_ORIGINS || 'http://localhost:5173,http://127.0.0.1:5173'
  const allowedOrigins = new Set((Array.isArray(configuredOrigins) ? configuredOrigins : configuredOrigins.split(',')).map((origin) => origin.trim()).filter(Boolean))
  const allowLocalhost = !customOriginsProvided
  const generateGuide = options.generateGuide || generateWellnessGuide
  const saveGuide = options.saveGuide || saveGuideForSession
  const isLimited = options.isRateLimited || createRateLimiter()

  return createHttpServer(async (request, response) => {
    const origin = request.headers.origin
    const originAllowed = checkOrigin(origin, allowedOrigins, allowLocalhost)
    const corsHeaders = {}
    if (origin && originAllowed) {
      corsHeaders['Access-Control-Allow-Origin'] = origin
      corsHeaders.Vary = 'Origin'
    }

    if (request.method === 'OPTIONS') {
      if (origin && !originAllowed) return sendJson(response, 403, { error: 'Origin not allowed.' })
      response.writeHead(204, { ...corsHeaders, 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization', 'Access-Control-Max-Age': '600' })
      return response.end()
    }

    if (request.method === 'GET' && request.url === '/api/health') {
      return sendJson(response, 200, { status: 'ok', service: 'aarogyam-ai-api' }, corsHeaders)
    }

    if (request.method !== 'POST' || request.url !== '/api/search') {
      return sendJson(response, 404, { error: 'Route not found.' }, corsHeaders)
    }

    let body
    try {
      body = await readJsonBody(request)
    } catch (error) {
      return sendJson(response, error.statusCode || 400, { error: error.message }, corsHeaders)
    }

    const parsed = searchRequestSchema.safeParse(body)
    if (!parsed.success) return sendJson(response, 400, { error: 'Enter a topic between 1 and 180 characters.' }, corsHeaders)

    if (isEmergencyQuery(parsed.data.query)) {
      return sendJson(response, 422, { error: emergencyResponse.message, code: emergencyResponse.code }, corsHeaders)
    }

    const ip = request.socket.remoteAddress || 'unknown'
    if (isLimited(ip)) {
      return sendJson(response, 429, { error: 'Too many searches in a short time. Please wait and try again.' }, { ...corsHeaders, 'Retry-After': '900' })
    }

    try {
      const query = parsed.data.query
      const guide = await generateGuide(query)
      guide.videos = guide.videos || []
      let persistence
      try {
        persistence = await saveGuide(request.headers.authorization, query, guide)
      } catch (error) {
        console.error('Wellness guide persistence failed:', error?.name || 'DatabaseError')
        persistence = { status: 'failed' }
      }
      if (persistence.status === 'invalid') return sendJson(response, 401, { error: 'Your session expired. Sign in again to keep this guide.', code: 'invalid_session' }, corsHeaders)
      if (persistence.status === 'saved') {
        guide.historySaved = true
        guide.historyStatus = 'saved'
        guide.searchId = persistence.searchId
        guide.remedies = guide.remedies.map((item, index) => ({ ...item, id: persistence.remedies[index] }))
        guide.yoga = guide.yoga.map((item, index) => ({ ...item, id: persistence.yoga[index] }))
      } else {
        guide.historySaved = false
        guide.historyStatus = persistence.status
      }
      return sendJson(response, 200, guide, corsHeaders)
    } catch (error) {
      const safeMessage = String(error?.message || '')
        .replace(/AIza[0-9A-Za-z_-]{20,}/g, '[redacted-key]')
        .replace(/AQ\.[0-9A-Za-z_-]+/g, '[redacted-key]')
        .replace(/sb_(?:secret|publishable)_[0-9A-Za-z_-]+/g, '[redacted-key]')
        .slice(0, 300)
      console.error('Wellness search failed:', error?.name || 'ProviderError', safeMessage)
      return sendJson(response, 502, { error: 'We could not prepare a guide right now. Please try again shortly.' }, corsHeaders)
    }
  })
}
