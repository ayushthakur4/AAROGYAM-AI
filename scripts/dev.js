import { spawn } from 'node:child_process'

const isWindows = process.platform === 'win32'
const npmCmd = isWindows ? 'npm.cmd' : 'npm'

console.log('\x1b[36m%s\x1b[0m', '🌱 Starting AAROGYAM AI (Backend Server + Frontend Client)...')

const server = spawn(npmCmd, ['run', 'dev', '--workspace', 'server'], {
  stdio: 'inherit',
  shell: true,
})

const client = spawn(npmCmd, ['run', 'dev', '--workspace', 'client'], {
  stdio: 'inherit',
  shell: true,
})

function cleanup() {
  try {
    if (server?.pid) {
      if (isWindows) {
        spawn('taskkill', ['/pid', String(server.pid), '/f', '/t'], { stdio: 'ignore', shell: true })
      } else {
        server.kill('SIGINT')
      }
    }
  } catch {}

  try {
    if (client?.pid) {
      if (isWindows) {
        spawn('taskkill', ['/pid', String(client.pid), '/f', '/t'], { stdio: 'ignore', shell: true })
      } else {
        client.kill('SIGINT')
      }
    }
  } catch {}
}

process.on('SIGINT', () => { cleanup(); process.exit(0) })
process.on('SIGTERM', () => { cleanup(); process.exit(0) })

server.on('exit', (code) => {
  if (code !== 0 && code !== null) {
    console.error(`\x1b[31m[Server exited with code ${code}]\x1b[0m`)
  }
})

client.on('exit', (code) => {
  if (code !== 0 && code !== null) {
    console.error(`\x1b[31m[Client exited with code ${code}]\x1b[0m`)
  }
})
