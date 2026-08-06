const { MercadoPagoConfig, Payment } = require('mercadopago');
const admin = require('firebase-admin');

if (!admin.apps.length) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}');
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}

const db = admin.firestore();

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

            console.log(`[Webhook] Payment notification: ${status} for user ${userId}, plan: ${planId}`);

            if (status === 'approved' && userId && planId) {
                await db.collection('users').doc(userId).set({
                    planId: planId,
                    planTrial: false,
                    planTrialExpiry: null,
                    subscriptionStatus: 'active',
                    paidAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                }, { merge: true });

                console.log(`[Webhook] Plan updated to ${planId} for user ${userId}`);
            } else if (status === 'rejected') {
                console.log(`[Webhook] Payment rejected for user ${userId}`);
            }
        }

        return res.status(200).json({ received: true });
    } catch (error) {
        console.error('[Webhook] Error:', error);
        return res.status(200).json({ received: true });
    }
};
