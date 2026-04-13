import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
  typescript: true,
})

export async function createStripeProduct(name: string, description?: string) {
  return stripe.products.create({ name, description })
}

export async function createStripePrice(
  productId: string,
  unitAmount: number,
  currency = 'usd'
) {
  return stripe.prices.create({
    product: productId,
    unit_amount: unitAmount,
    currency,
    recurring: { interval: 'month' },
  })
}

export async function createCheckoutSession({
  priceId,
  personaId,
  subscriberId,
  successUrl,
  cancelUrl,
  customerEmail,
}: {
  priceId: string
  personaId: string
  subscriberId: string
  successUrl: string
  cancelUrl: string
  customerEmail?: string
}) {
  return stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    customer_email: customerEmail,
    metadata: { personaId, subscriberId },
    subscription_data: { metadata: { personaId, subscriberId } },
  })
}
