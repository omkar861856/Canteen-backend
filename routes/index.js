import { Router } from "express";
import homeRoutes from './homeRoutes.js'
import inventoryRoutes from './inventoryRoutes.js'
import ordersRoutes from './orderRoutes.js'
import paymentsRoutes from './paymentRoutes.js'
import razorpayRoutes from './razorpayRoutes.js'
import generalFeedbackRoutes from './generalFeedbackRoutes.js'

const router = Router();

router.use('/home', homeRoutes);
router.use('/inventory', inventoryRoutes)
router.use('/orders', ordersRoutes)
router.use('/payments', paymentsRoutes)
router.use('/razorpay', razorpayRoutes)
router.use('/generalfeedback', generalFeedbackRoutes)


export default router;