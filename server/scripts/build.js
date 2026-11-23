import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const clientDist = path.resolve(__dirname, '../../client/dist')
const rootDist = path.resolve(__dirname, '../../dist')

// If client was already built by workspace pipeline, ensure root dist is synced
if (fs.existsSync(clientDist)) {
  fs.rmSync(rootDist, { recursive: true, force: true })
  fs.cpSync(clientDist, rootDist, { recursive: true })
  console.log('✓ Synced client/dist to root dist/ for deployment.')
}

console.log('✓ Server build step completed.')
