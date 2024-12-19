import { Server } from 'socket.io';

export const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ['GET', 'POST']
    },
    pingTimeout: 60000, // 60 seconds timeout
    pingInterval: 25000,
  });


  io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}`);

    // Emit notifications to specific rooms or globally
    const sendNotification = (room, data) => {
      socket.broadcast.to(room).emit('notification', data);
    };

    // Listen for 'order-update' from any client
    socket.on('order-update', (data) => {
      const { room, ...orderData } = data; // Extract room from the payload

      if (room) {
        console.log(orderData.message)
        // Emit the data to the specific room
        sendNotification(room, orderData.message)
        console.log(`Order update sent to room ${room}:`, orderData.message);
      } else {
        console.log("Room not specified in order-update");
      }
      // After processing or logging, broadcast the event to all clients
      // io.emit('order-update-server', data);
    });

    // Room subscriptions for specific notifications
    socket.on('joinRoom', (room) => {
      socket.join(room);
      console.log(`User ${socket.id} joined room: ${room}`);
    });


    // Log disconnects
    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });



  // // Simulated events
  // setInterval(() => {
  //   sendNotification('order', 'Order status updated!');
  // }, 4000); // Emit every 10 seconds for testing


};




