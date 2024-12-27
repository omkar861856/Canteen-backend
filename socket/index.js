import { Server } from 'socket.io';

const userSockets = new Map(); // { userId: socketId }

export const initializeSocket = (server) => {

  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ['GET', 'POST']
    },
    pingTimeout: 60000, // 60 seconds timeout
    pingInterval: 25000,
  });

  io.of('/kitchen').on('connection', (socket) => {
    console.log('Kitchen connected:', socket.id);
  
    // Notify all users of a new menu item
    socket.on('menuItemCreated', (menuItem) => {
      console.log('New menu item created:', menuItem);
      io.of('/users').emit('menuItemCreated', menuItem);
    });
  
    // Notify a specific user when their order is completed
    socket.on('orderCompleted', ({ userId, orderId }) => {
      const userSocketId = userSockets.get(userId);
      if (userSocketId) {
        io.of('/users').to(userSocketId).emit('orderCompleted', {
          orderId,
          message: `Your order #${orderId} has been completed!`,
        });
        console.log(`Notified user ${userId} about order completion.`);
      }
    });
  
    // Notify all users of kitchen status updates
    socket.on('kitchenStatusUpdated', (status) => {
      console.log('Kitchen status updated:', status);
      io.of('/users').emit('kitchenStatusUpdated', status);
    });
  
    socket.on('disconnect', () => {
      console.log('Kitchen disconnected:', socket.id);
    });
  });
  
  io.of('/users').on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Store user's socket ID for targeted notifications
    socket.on('registerUser', (userId) => {
      userSockets.set(userId, socket.id);
      console.log(`User registered: ${userId} with socket ${socket.id}`);
    });
  
    // Handle order creation by the user
    socket.on('orderCreated', (order) => {
      console.log('Order created:', order);
      io.of('/kitchen').emit('orderCreated', order); // Notify kitchen
    });
  
    // Handle user disconnect
    socket.on('disconnect', () => {
      const userId = [...userSockets.entries()].find(
        ([, id]) => id === socket.id
      )?.[0];
      if (userId) {
        userSockets.delete(userId);
        console.log(`User disconnected: ${userId}`);
      }
    });
  });
  
  // // Simulated events
  // setInterval(() => {
  //   sendNotification('order', 'Order status updated!');
  // }, 4000); // Emit every 10 seconds for testing

};




