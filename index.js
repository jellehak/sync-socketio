import { createServer } from "http"
import { Server } from "socket.io"

function Player(id = '', name = 'guest') {
  this.id = id
  this.name = name
  this.x = 0
  this.y = 0
  this.z = 0
  this.entity = null
}

/**
 * 
 * @param {*} io 
 */
export function SyncServer(config = {}) {
  // State
  var players = {}

  function handleSocketConnection(socket) {
    const { validate } = config

    function join() {
      // Creates a new player object with a unique ID number.
      var id = socket.id
      var newPlayer = new Player(id)

      // Adds the newly created player to the object.
      players[id] = newPlayer

      // Sends the connecting client his unique ID, and data about the other players already connected.
      socket.emit('init', { players })

      // Sends everyone except the connecting player data about the new player.
      socket.broadcast.emit('join', newPlayer)
    }

    // Autojoin
    join()
    // socket.on('join', function (data) {
    //   join()
    // })

    socket.on('patch', function (data) {
      // Should never happen
      if (!players[socket.id]) return

      // Validate Client Patch
      if (validate) {
        const isValid = validate({
          players,
          socket,
          from: players[socket.id],
          patch: data
        })
        if (!isValid) {
          console.warn(`unvalid patch of user: ${socket.id}`)
          return
        }
      }
      // players[data.id].x = data.x
      // players[data.id].y = data.y
      // players[data.id].z = data.z
      Object.assign(players[socket.id], data)

      // Create message
      const message = {
        ...data,
        // Force id from field
        id: socket.id,
      }

      // Player asks for an ACK
      if (data.$return) {
        socket.emit('patch', message)
      }
      // Tell others
      socket.broadcast.emit('patch', message)
    })

    socket.on('disconnect', function () {
      if (!players[socket.id]) return
      delete players[socket.id]
      // Update clients with the new player killed 
      socket.broadcast.emit('left', { id: socket.id })
    })
  }

  return {
    players,
    handleSocketConnection
  }
}

// ====

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

// Http server
var server = createServer(function (req, res) {
  // Hosted on glitch ?
  res.write(`Users online: ${Object.keys(app.players).length}`)

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

io.on('connection', app.handleSocketConnection)

console.log(`Server started. at http://localhost:${port}`)
server.listen(port)