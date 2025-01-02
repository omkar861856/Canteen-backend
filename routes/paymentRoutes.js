import Router from 'express'
import Payment from '../models/Payment.js';

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

  router.get('/', async (req, res) => {
    try {
      const payments = await Payment.find();
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