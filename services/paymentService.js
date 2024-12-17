import Razorpay from "razorpay";

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const createRazorpayOrder = async (totalPrice) => {
  const options = {
    amount: totalPrice * 100,
    currency: "INR",
    receipt: `receipt#${Date.now()}`,
  };
  return await razorpayInstance.orders.create(options);
};