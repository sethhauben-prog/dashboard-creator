// api/stripe/checkout.js — creates a Stripe Checkout session and returns the redirect URL.
// The user_id is stored in session metadata so the webhook knows who paid.
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const PRICE_ID = 'price_1T7kOqRd9CH6pmHOo1DJYbc3'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  // Verify the caller is logged in.
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'Unauthorized' })

  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
  const { data: { user } } = await supabase.auth.getUser(token)
  if (!user) return res.status(401).json({ error: 'Unauthorized' })

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
  const origin = req.headers.origin || 'https://dashboard-creator-seven.vercel.app'

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: PRICE_ID, quantity: 1 }],
      success_url: `${origin}/dashboard?payment=success`,
      cancel_url: `${origin}/dashboard`,
      customer_email: user.email,
      // Store user_id in metadata — the webhook reads this to know who to upgrade.
      metadata: { user_id: user.id },
      subscription_data: { metadata: { user_id: user.id } },
    })

    res.status(200).json({ url: session.url })
  } catch (err) {
    console.error('Stripe checkout error:', err)
    res.status(500).json({ error: err.message })
  }
}
