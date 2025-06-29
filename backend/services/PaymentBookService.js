const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

class PaymentService {
  static async processPayment(payment_method_id, amount) {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Convert to cents
      currency: "usd",
      payment_method_data: {
        type: "card",
        card: {
          token: payment_method_id,
        },
      },
      confirm: true,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: "never",
      },
    });

    if (paymentIntent.status !== "succeeded") {
      throw new Error("Payment failed");
    }

    return paymentIntent;
  }
}

module.exports = PaymentService;