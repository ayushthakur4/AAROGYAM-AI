import { createServer as createHttpServer } from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { z } from 'zod'
import { generateWellnessGuide } from './gemini.js'
import { saveGuideForSession } from './persistence.js'
import { emergencyResponse, isEmergencyQuery } from './safety.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const searchRequestSchema = z.object({ query: z.string().trim().min(1).max(180) }).strict()
const bodyLimit = 8 * 1024
const windowMs = 15 * 60 * 1000
const requestLimit = 20

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8',
}

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
  try {
    const url = new URL(origin)
    if (allowLocalhost) {
      if ((url.hostname === 'localhost' || url.hostname === '127.0.0.1') && ['http:', 'https:'].includes(url.protocol)) {
        return true
      }
      if (url.protocol === 'https:' && (url.hostname.endsWith('.vercel.app') || url.hostname.endsWith('.onrender.com'))) {
        return true
      }
    }
  } catch {}
  return false
}

function serveStaticFile(request, response, distDir) {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return sendJson(response, 405, { error: 'Method not allowed.' })
  }

  if (!distDir || !fs.existsSync(distDir)) {
    return sendJson(response, 404, { error: 'Static build assets not found. Run npm run build first.' })
  }

  const reqUrl = new URL(request.url, `http://${request.headers.host || 'localhost'}`)
  let decodedPath
  try {
    decodedPath = decodeURIComponent(reqUrl.pathname)
  } catch {
    return sendJson(response, 400, { error: 'Invalid URL encoding.' })
  }

  const safeRelativePath = path.normalize(decodedPath).replace(/^(\.\.[\/\\])+/, '')
  let filePath = path.join(distDir, safeRelativePath)

  if (!filePath.startsWith(distDir)) {
    return sendJson(response, 403, { error: 'Access denied.' })
  }

  let stat
  try {
    stat = fs.statSync(filePath)
    if (stat.isDirectory()) {
      filePath = path.join(filePath, 'index.html')
      stat = fs.statSync(filePath)
    }
  } catch {
    stat = null
  }

  if (!stat || !stat.isFile()) {
    const hasExt = path.extname(safeRelativePath).length > 0
    if (hasExt) {
      return sendJson(response, 404, { error: 'File not found.' })
    }
    const indexPath = path.join(distDir, 'index.html')
    if (fs.existsSync(indexPath)) {
      filePath = indexPath
      stat = fs.statSync(filePath)
    } else {
      return sendJson(response, 404, { error: 'Index file not found.' })
    }
  }

  const ext = path.extname(filePath).toLowerCase()
  const contentType = MIME_TYPES[ext] || 'application/octet-stream'
  const normalizedPosixPath = decodedPath.replace(/\\/g, '/')
  const isImmutableAsset = normalizedPosixPath.startsWith('/assets/')

  const headers = {
    'Content-Type': contentType,
    'Content-Length': stat.size,
    'Cache-Control': isImmutableAsset ? 'public, max-age=31536000, immutable' : 'no-cache',
  }

  if (request.method === 'HEAD') {
    response.writeHead(200, headers)
    return response.end()
  }

  response.writeHead(200, headers)
  const stream = fs.createReadStream(filePath)
  stream.on('error', () => {
    if (!response.headersSent) {
      sendJson(response, 500, { error: 'Error reading file.' })
    }
  })
  stream.pipe(response)
}

export function createRequestHandler(options = {}) {
  const customOriginsProvided = Boolean(options.allowedOrigins)
  const configuredOrigins = options.allowedOrigins || process.env.CLIENT_ORIGINS || 'http://localhost:5173,http://127.0.0.1:5173'
  const allowedOrigins = new Set((Array.isArray(configuredOrigins) ? configuredOrigins : configuredOrigins.split(',')).map((origin) => origin.trim()).filter(Boolean))
  const allowLocalhost = !customOriginsProvided
  const generateGuide = options.generateGuide || generateWellnessGuide
  const saveGuide = options.saveGuide || saveGuideForSession
  const isLimited = options.isRateLimited || createRateLimiter()
  const distDir = options.distDir || (
    fs.existsSync(path.resolve(__dirname, '../../dist'))
      ? path.resolve(__dirname, '../../dist')
      : path.resolve(__dirname, '../../client/dist')
  )

  return async (request, response) => {
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

    const reqUrl = new URL(request.url, `http://${request.headers.host || 'localhost'}`)
    const pathname = reqUrl.pathname

    if (pathname === '/api/health' && request.method === 'GET') {
      return sendJson(response, 200, { status: 'ok', service: 'aarogyam-ai-api' }, corsHeaders)
    }

    if (pathname.startsWith('/api/')) {
      if (request.method !== 'POST' || pathname !== '/api/search') {
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

      const ip = request.socket?.remoteAddress || 'unknown'
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
    }

    // Static asset & SPA fallback handling for Render fullstack deployment
    return serveStaticFile(request, response, distDir)
  }
}

export function createServer(options = {}) {
  const handler = createRequestHandler(options)
  return createHttpServer(handler)
}
