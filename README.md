> State syncing server written in NodeJs. 

By default a user has full read allowance but can only patch it's own state.

# Usage
```js
import { io } from "https://cdn.socket.io/4.3.2/socket.io.esm.min.js";

const socket = io("ws://localhost:9123", { transports: ["websocket"] });
```

# Links
- https://stackoverflow.com/questions/10112178/differences-between-socket-io-and-websockets
- https://developer.playcanvas.com/en/tutorials/real-time-multiplayer/
- https://glitch.com/edit/#!/sore-bloom-beech
