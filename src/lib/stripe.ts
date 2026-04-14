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

/**
 * Stripe prices are immutable — to update a price we create a new one on the
 * same product and archive the old one. Returns the newly created price.
 */
export async function updateStripePrice(
  productId: string,
  oldPriceId: string,
  unitAmount: number,
  currency = 'usd'
): Promise<Stripe.Price> {
  const newPrice = await stripe.prices.create({
    product: productId,
    unit_amount: unitAmount,
    currency,
    recurring: { interval: 'month' },
  })
  await stripe.prices.update(oldPriceId, { active: false })
  return newPrice
}

export async function createCheckoutSession({
  priceId,
  specialistId,
  subscriberId,
  successUrl,
  cancelUrl,
  customerEmail,
}: {
  priceId: string
  specialistId: string
  subscriberId: string
  successUrl: string
  cancelUrl: string
  customerEmail?: string
}) {
  // Platform fee: Sagevu keeps 15%, creator receives 85% of subscription revenue.
  return stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    customer_email: customerEmail,
    metadata: { specialistId, subscriberId, platform_fee_percent: '15' },
    subscription_data: {
      metadata: { specialistId, subscriberId, platform_fee_percent: '15' },
    },
  })
}
