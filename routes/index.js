import { Router } from "express";
import homeRoutes from './homeRoutes.js'
import inventoryRoutes from './inventoryRoutes.js'
import ordersRoutes from './orderRoutes.js'
import paymentsRoutes from './paymentRoutes.js'
import razorpayRoutes from './razorpayRoutes.js'

const router = Router();

router.use('/home', homeRoutes);
router.use('/inventory', inventoryRoutes)
router.use('/orders', ordersRoutes)
router.use('/payments', paymentsRoutes)
router.use('/razorpay', razorpayRoutes)

export default router;