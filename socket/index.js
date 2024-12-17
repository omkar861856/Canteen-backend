import { Server } from 'socket.io';

export const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: ["http://localhost:5173", "http://localhost:5174"],
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log(`A user connected: ${socket.id}`);

    socket.on('message', (data) => {
      console.log(`Message received: ${data}`);
      io.emit('message', data);
    });

    socket.on('order-update', (data) => {
      console.log(data);
      io.emit('order-update', data);
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
};