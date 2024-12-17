import Router from 'express'
import Payment from '../models/Payment.js';

const router = Router();


// routes


  router.get('/', async (req, res) => {
    try {
      const payments = await Payment.find();
      res.json(payments);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // POST  - Save a new payment
  router.post('/', async (req, res) => {
    const paymentData = req.body;
  
    const payment = new Payment(paymentData);
  
    try {
      const savedPayment = await payment.save();
      res.status(201).json(savedPayment);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  
  // DELETE /:id - Delete a payment by ID
  router.delete('/:id', async (req, res) => {
    try {
      const payment = await Payment.findOneAndDelete({ id: req.params.id });
  
      if (!payment) {
        return res.status(404).json({ message: 'Payment not found' });
      }
  
      res.json({ message: 'Payment deleted successfully', id: req.params.id });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  





 
export default router;