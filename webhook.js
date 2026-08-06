const { MercadoPagoConfig, Payment } = require('mercadopago');

const client = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN,
});

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(200).end();
    }

    try {
        const { type, data } = req.body;

        if (type === 'payment') {
            const payment = new Payment(client);
            const paymentData = await payment.get({ id: data.id });

            const userId = paymentData.external_reference;
            const status = paymentData.status;
            const planId = paymentData.metadata?.plan_id;

            if (status === 'approved' && userId && planId) {
                console.log(`[Webhook] Payment approved for user ${userId}, plan: ${planId}`);

                return res.status(200).json({
                    received: true,
                    userId: userId,
                    planId: planId,
                    status: status,
                });
            }
        }

        return res.status(200).json({ received: true });
    } catch (error) {
        console.error('[Webhook] Error:', error);
        return res.status(200).json({ received: true });
    }
};
