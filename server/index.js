import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createServer } from './src/httpServer.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Load local .env files if present (never throws in production environments)
const envPaths = [
  path.resolve(__dirname, '.env'),
  path.resolve(__dirname, '../.env'),
]

for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    try {
      process.loadEnvFile(envPath)
    } catch {}
  }
}

const port = Number(process.env.PORT || 3000)
const host = process.env.HOST || '0.0.0.0'
const server = createServer()

server.listen(port, host, () => {
  console.log(`AAROGYAM AI server running on http://${host}:${port}`)
})
