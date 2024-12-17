import http from "http";
import app from "./app.js";
import { initializeSocket } from "./socket/index.js";

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

// Initialize WebSocket
initializeSocket(server);

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));