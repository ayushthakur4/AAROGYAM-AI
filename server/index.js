import { createServer } from './src/httpServer.js'

const port = Number(process.env.PORT || 3000)
const server = createServer()

server.listen(port, () => {
  console.log(`AAROGYAM AI server listening on http://localhost:${port}`)
})
