import Router from 'express'
import Payment from '../models/Payment.js';
import { instance } from './razorpayRoutes.js';

const router = Router();


// routes


/**
 * @swagger
 * /api/v1/payments/:
 *   get:
 *     summary: Retrieve all payments
 *     responses:
 *       200:
 *         description: A list of all payments.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Payment'
 *       500:
 *         description: Internal server error.
 */

  router.get('/:kitchenId', async (req, res) => {
    const {kitchenId} = req.params;
    try {
      const payments = await Payment.find({kitchenId});
      res.json(payments);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });


  router.get('/:orderId', async (req, res) => {
    const {orderId} = req.params;
    try {
      const payments = await Payment.findOne({order_id:orderId});
      console.log(payments)
      res.status(200).json(payments);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  /**
 * @swagger
 * /api/v1/payments/:
 *   post:
 *     summary: Save a new payment
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Payment'
 *     responses:
 *       201:
 *         description: Payment saved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Payment'
 *       400:
 *         description: Bad request.
 */
  
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
  
  /**
 * @swagger
 * /api/v1/payments/{id}:
 *   delete:
 *     summary: Delete a payment by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: "payment123"
 *     responses:
 *       200:
 *         description: Payment deleted successfully.
 *       404:
 *         description: Payment not found.
 *       500:
 *         description: Internal server error.
 */

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

  // refund

  router.post('/refund', async (req, res) => {
    const { paymentId, refundAmount } = req.body;
  
    if (!paymentId) {
      return res.status(400).json({ message: 'Payment ID is required.' });
    }
  
    try {
      // Step 1: Fetch the payment object from the database
      const payment = await Payment.findOne({ id: paymentId });
  
      if (!payment) {
        return res.status(404).json({ message: 'Payment not found.' });
      }
  
      const availableRefund = payment.amount;
  
      // Validate refund amount
      if (refundAmount > availableRefund) {
        return res.status(400).json({
          message: `Refund amount exceeds available balance. Maximum refundable: ₹${availableRefund / 100}.`,
        });
      }
  
      // Step 2: Send a refund request to Razorpay
      const refundPayload = {
        amount: refundAmount, // Refund amount in paise
      };
  
      const razorpayRefund = await instance.payments.refund(paymentId, refundPayload);
  
      // Step 3: Update the payment in the database
      const newAmountRefunded = payment.amount_refunded + refundAmount;
  
      const refund = {
        id: razorpayRefund.id,
        amount: razorpayRefund.amount,
        created_at: razorpayRefund.created_at,
        status: razorpayRefund.status,
        notes: razorpayRefund.notes || [],
      };
  
      payment.refunds.push(refund);
      payment.amount_refunded = newAmountRefunded;
      payment.refund_status = newAmountRefunded === payment.amount ? 'full' : 'partial';
      payment.amount = payment.amount - refundAmount;
  
      await payment.save();
  
      // Step 4: Respond with the updated payment and refund details
      res.status(200).json({
        message: 'Refund created successfully.',
        payment,
        refund: razorpayRefund,
      });
    } catch (error) {
      console.error('Error creating refund:', error);
      res.status(500).json({ message: 'Internal server error.', error: error.message });
    }
  })
  
  

  /**
 * @swagger
 * paymentscomponents:
 *   schemas:
 *     Payment:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "payment123"
 *         amount:
 *           type: number
 *           example: 100.5
 *         userId:
 *           type: string
 *           example: "user456"
 *         method:
 *           type: string
 *           example: "Credit Card"
 *         status:
 *           type: string
 *           example: "Completed"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2024-12-28T12:00:00Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2024-12-28T14:00:00Z"
 */


export default router;