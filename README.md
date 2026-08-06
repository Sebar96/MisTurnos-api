# MisTurnos API

Backend serverless for Mercado Pago integration.

## Environment Variables

Set these in Vercel dashboard → Settings → Environment Variables:

- `MP_ACCESS_TOKEN` - Your Mercado Pago Access Token (Production)

## Endpoints

- `POST /api/create-checkout` - Creates a Mercado Pago checkout preference
- `POST /api/webhook` - Receives payment notifications from Mercado Pago
