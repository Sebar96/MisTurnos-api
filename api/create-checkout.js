const { MercadoPagoConfig, Preference } = require('mercadopago');

const client = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN,
});

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { planId, planName, price, userId, userEmail } = req.body;

        if (!planId || !price || !userId || !userEmail) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const preference = new Preference(client);

        const result = await preference.create({
            body: {
                items: [
                    {
                        id: planId,
                        title: `MisTurnos - Plan ${planName}`,
                        quantity: 1,
                        unit_price: price,
                        currency_id: 'ARS',
                    },
                ],
                payer: {
                    email: userEmail,
                },
                external_reference: userId,
                back_urls: {
                    success: `https://sebar96.github.io/MisTurnos/#payment=success`,
                    failure: `https://sebar96.github.io/MisTurnos/#payment=failure`,
                    pending: `https://sebar96.github.io/MisTurnos/#payment=pending`,
                },
                auto_return: 'approved',
                metadata: {
                    userId: userId,
                    planId: planId,
                },
            },
        });

        return res.status(200).json({
            id: result.id,
            init_point: result.init_point,
        });
    } catch (error) {
        console.error('[API] Error creating preference:', error);
        return res.status(500).json({ error: 'Error creating checkout' });
    }
};
