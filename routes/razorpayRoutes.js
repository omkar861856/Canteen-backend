import Router from 'express'
import Razorpay from 'razorpay';
import { validatePaymentVerification } from 'razorpay/dist/utils/razorpay-utils.js';


const router = Router();

// routes

const instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

router.post("/orders", async (req, res) => {
    const { totalPrice } = req.body;
    let amount = parseInt(totalPrice, 10) * 100;
    try {

        const options = {
            amount: amount,
            currency: "INR",
            receipt: "receipt order no 777"
        }

        const order = await instance.orders.create(options)


        if (!order) { return res.status(200).send({ msg: "Something went wrong" }) }

        res.status(200).send(order);

    } catch (error) {
        res.status(200).send({ error, msg: "entered error block" })
    }
})

router.post("/success", async (req, res) => {
    try {

        // getting the details bacfont-end
        const {
            orderCreationId,
            razorpayPaymentId,
            razorpayOrderId,
            razorpaySignature,
        } = req.body;

        const secret = process.env.RAZORPAY_KEY_SECRET;


        if (!orderCreationId || !razorpayPaymentId || !secret) {
            return res.status(400).json({ error: 'Missing required fields for HMAC generation' });
        }

        const validate = validatePaymentVerification(
            { order_id: razorpayOrderId, payment_id: razorpayPaymentId },
            razorpaySignature,
            secret
        );

        // comaparing our digest with the actual signature 
        if (!validate) {
            console.log("signature varification failed")
            return res.status(400).json({ msg: "Transaction not legit!" });
        }

        // THE PAYMENT IS LEGIT & VERIFIED
        // YOU CAN SAVE THE DETAILS IN YOUR DATABASE IF YOU WANT

        res.status(200).send({
            msg: "success",
            orderId: razorpayOrderId,
            paymentId: razorpayPaymentId,
        })
    } catch (error) {
        res.status(200).send(error)
    }
})

router.get('/payment/:paymentId', async (req, res) => {
    try {

        const { paymentId } = req.params;
        const response = await instance.payments.fetch(paymentId)
        res.status(200).send(response)


    } catch (error) {

        res.status(200).send(error)


    }
})




export default router;