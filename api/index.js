import { createRequestHandler } from '../server/src/httpServer.js'

const requestHandler = createRequestHandler()

export default async function handler(req, res) {
  // Normalize rewritten base route paths on Vercel
  if (req.url === '/api' || req.url === '/api/' || req.url === '/api/index.js') {
    req.url = req.method === 'POST' ? '/api/search' : '/api/health'
  }
  return requestHandler(req, res)
}
