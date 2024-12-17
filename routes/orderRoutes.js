import Router from 'express'

const router = Router();


// routes

// Create Order
router.post('/', async (req, res) => {
    try {
      const order = new Order(req.body);
      await order.save();
      const orders = await Order.find();
  
      res.status(201).json({ message: "Order created successfully", orders });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });
  
  // Update Order for Completion or Cancellation
  router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body; // Expected status: 'Completed' or 'Cancelled'
  
    console.log(id, status)
  
    try {
      const order = await Order.findOneAndUpdate(
        { orderId: id },      // Search for the document by orderId
        { status },           // Update the status field
        { new: true }         // Return the updated document
      ); if (!order) return res.status(404).json({ message: "Order not found" });
      res.status(200).json({ message: "Order updated successfully", order });
    } catch (err) {
      console.log(err)
      res.status(400).json({ error: err.message });
    }
  });
  
  // Delete Order (for Cancellation)
  router.delete('/:id', async (req, res) => {
    const { id } = req.params;
  
    try {
      const order = await Order.findByIdAndDelete(id);
      if (!order) return res.status(404).json({ message: "Order not found" });
      res.status(200).json({ message: "Order deleted successfully" });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });
  
  // Get All Orders
  router.get('/', async (req, res) => {
    try {
      const orders = await Order.find();
      console.log(orders)
      res.status(200).json(orders);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });
  
  // Get All Orders by UserId
  
  router.get('/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
      const orders = await Order.find({ userId: userId });
      res.status(200).json(orders);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  // Get Specific Order by ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
  
    try {
      const order = await Order.findById(id);
      if (!order) return res.status(404).json({ message: "Order not found" });
      res.status(200).json(order);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });
  
  




export default router;