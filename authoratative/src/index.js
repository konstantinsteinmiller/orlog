import { LocalPresence, Server } from 'colyseus'
import { WebSocketTransport } from '@colyseus/ws-transport'
import { defineRoutes } from './routes.js'
import { defineRooms } from './rooms.js'
import { createServer } from 'http'
import express from 'express'
import cors from 'cors'

const port = Number(process.env.port) || 3789

console.log('cors', cors)
const app = express({ port })
app.use(express.json())
app.use(
  cors({
    // origin: 'http://127.0.0.1',
    // optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  }),
)

const gameServer = new Server({
  port,
  server: createServer(app),
  // presence: new RedisPresence(),
  presence: new LocalPresence(),
  transport: new WebSocketTransport({}),
})

app.get('/', (req, res) => {
  res.send('"It\'s time to kick ass and chew bubblegum!"')
})

defineRooms(gameServer)
defineRoutes(app)

// Make sure to never call the `simulateLatency()` method in production.
if (process.env.NODE_ENV !== 'production') {
  // simulate 200ms latency between server and client.
  gameServer.simulateLatency(200)
}

gameServer.onShutdown(() => {
  console.log('onShutdown: ')
})

gameServer.listen(port)
console.log('Running on ws://localhost:', port)
