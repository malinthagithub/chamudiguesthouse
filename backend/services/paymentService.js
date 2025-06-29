const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

module.exports = {
    processPayment: async (amount, paymentMethodId) => {
        try {
            const paymentIntent = await stripe.paymentIntents.create({
                amount: Math.round(amount * 100),
                currency: 'usd',
                payment_method: paymentMethodId,
                confirm: true,
                automatic_payment_methods: {
                    enabled: true,
                    allow_redirects: 'never',
                },
            });
            return paymentIntent;
        } catch (err) {
            throw err;
        }
    }
};