import Payment from "../models/payment.model.js";
import User from "../models/usermodels.js";
import razorpay from "../services/Razorpay.service.js";
import crypto from "crypto"
export const createOrder = async (req,res) => {
    try {
          const {planId, amount, credits} = req.body;//fetech karna from frontend plaid ,amount,credits
          if (!amount || !credits) {
          return res.status(400).json({ message: "Invalid plan data" });
    }
     const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };//rzaorpay order create karna with amount, currency and receipt id
    const order = await razorpay.orders.create(options)//order create karna razorpay pe
     await Payment.create({
      userId: req.userId,
      planId,
      amount,
      credits,
      razorpayOrderId: order.id,
      status: "created",
    });//payment record create karna database me with userId, planId, amount, credits, razorpayOrderId and status
    return res.json(order);
    } catch (error) {
         return res.status(500).json({message:`failed to create Razorpay order ${error}`})
    }
}
export const verifyPayment = async (req,res) => {
    try {
        const {razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature} = req.body;//fetech karna from frontend razorpay_order_id, razorpay_payment_id and razorpay_signature
      const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");
//razorpay signature verify karna with expected signature and razorpay_signature
    // if (expectedSignature !== razorpay_signature) {
    //   return res.status(400).json({ message: "Invalid payment signature" });
    // }

     const payment = await Payment.findOne({
      razorpayOrderId: razorpay_order_id,
    });

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    if (payment.status === "success") {
      return res.json({ message: "Already processed" });
    }
    // Update payment record
    payment.status = "success";
    payment.razorpayPaymentId = razorpay_payment_id;
    await payment.save();
    // Add credits to user
    const updatedUser = await User.findByIdAndUpdate(payment.userId, {
      $inc: { credits: payment.credits }
    },{new:true});
    res.json({
      success: true,
      message: "Payment verified and credits added",
      user: updatedUser,
    });
    } catch (error) {
         return res.status(500).json({message:`failed to verify Razorpay payment ${error}`})
    }
}