import { Server } from 'socket.io';

const userSockets = new Map(); // { userId: socketId }

/**
 * @swagger
 * sockets:
 *   /kitchen:
 *     description: Events related to kitchen operations.
 *     events:
 *       connection:
 *         description: Triggered when a kitchen socket connects.
 *         events:
 *           menuItemCreated:
 *             description: Notify all users of a new menu item.
 *             payload:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 price:
 *                   type: number
 *             example:
 *               id: "item123"
 *               name: "Pizza"
 *               price: 9.99
 *           orderCompleted:
 *             description: Notify a specific user when their order is completed.
 *             payload:
 *               type: object
 *               properties:
 *                 phoneNumber:
 *                   type: string
 *                 orderId:
 *                   type: string
 *             example:
 *               phoneNumber: "1234567890"
 *               orderId: "order456"
 *           kitchenStatusUpdated:
 *             description: Notify all users of kitchen status updates.
 *             payload:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *             example:
 *               status: "Kitchen is online"
 *           disconnect:
 *             description: Triggered when a kitchen socket disconnects.
 * 
 *   /users:
 *     description: Events related to user interactions.
 *     events:
 *       connection:
 *         description: Triggered when a user socket connects.
 *         events:
 *           registerUser:
 *             description: Register a user's socket ID for targeted notifications.
 *             payload:
 *               type: string
 *             example: "user123"
 *           orderCreated:
 *             description: Notify the kitchen of a new order created by the user.
 *             payload:
 *               type: object
 *               properties:
 *                 orderId:
 *                   type: string
 *                 items:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       itemId:
 *                         type: string
 *                       quantity:
 *                         type: number
 *             example:
 *               orderId: "order789"
 *               items:
 *                 - itemId: "item123"
 *                   quantity: 2
 *           disconnect:
 *             description: Triggered when a user socket disconnects.
 */

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
    socket.on('orderCompleted', ({ phoneNumber, orderId }) => {
      const userSocketId = userSockets.get(phoneNumber);
      if (userSocketId) {
        io.of('/users').to(userSocketId).emit('orderCompleted', {
          orderId,
          message: `Your order #${orderId} has been completed!`,
        });
        console.log(`Notified user ${phoneNumber} about order completion.`);
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
  

};






