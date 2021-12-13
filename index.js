import { createServer } from "http"
import { Server } from "socket.io"
import { SyncServer } from "./SyncServer.js"

// Http server
var server = createServer(function (req, res) {
  // Hosted on glitch ?
  res.write(`Users online: ${Object.keys(players).length}`)

  if (process.env.PROJECT_DOMAIN) {
    res.write(`Network server: https://${process.env.PROJECT_DOMAIN}.glitch.me\n`)
  }
  res.end()
})

var options = {
  cors: true
}

const port = process.env.PORT || 9123

var io = new Server(server, options)

const app = new SyncServer({
  validate(ctx) {
    if (ctx.patch.name === 'guest') {
      console.warn('guest is a reserved username')
      ctx.socket.emit('warn', { message: 'guest is a reserved username' })
      return false
    }
    return true
  }
})

io.on('connection', app.handleSocketConnection)

console.log(`Server started. at http://localhost:${port}`)
server.listen(port)