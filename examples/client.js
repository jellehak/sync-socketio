import { io } from "https://cdn.socket.io/4.3.2/socket.io.esm.min.js";

export function SyncClient(players = {}, config = {}) {
    const socket = io("ws://localhost:9123", { transports: ["websocket"] });

    const fallback = () => {}
    const onChange = config.onChange || fallback

    const mutate = (patch) => {
        Object.assign(players[patch.id], patch)
        onChange()
    }

    socket.on('init', function (data) {
        // Clean players ( the hard way to keep it a const )
        // players = data.players
        Object.keys(players).forEach(key => {
            delete players[key];
        })
        Object.values(data.players).forEach(player => {
            players[player.id] = player
        })
        onChange()
    });

    socket.on('join', function (data) {
        players[data.id] = {}
        mutate(data)
    });

    socket.on('patch', function (data) {
        mutate(data)
    });

    socket.on('left', function (data) {
        delete players[data.id]
        onChange()
    });

    socket.on('warn', function (data) {
        console.warn(data)
    });

    // Boot
    socket.on("connect", () => {
        const params = new URLSearchParams(window.location.search);
        const name = params.get("name");
        socket.emit('patch', { name: name || 'guest', $return: true })
    })

    return {
        socket
    }
}
