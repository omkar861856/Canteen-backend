import { Server } from 'socket.io';

export const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ['GET', 'POST']
    }
  });
  io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}`);
  
    // Listen for 'order-update' from any client
    socket.on('order-update', (data) => {
      console.log("Received order-update from a client:", data);
  
      // After processing or logging, broadcast the event to all clients
      io.emit('order-update-server', data);
    });
  
    // Log disconnects
    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });
  
};