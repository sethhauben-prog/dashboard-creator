// api/stripe/webhook.js — receives events from Stripe and updates Supabase.
// Stripe signs every webhook with a secret — we verify that signature first.
// The raw body must be read manually (not pre-parsed) for signature verification to work.
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

// Read the raw request body as a string (needed for Stripe signature verification).
function getRawBody(req) {
  return new Promise((resolve, reject) => {
    let data = ''
    req.on('data', chunk => { data += chunk })
    req.on('end', () => resolve(data))
    req.on('error', reject)
  })
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
  const rawBody = await getRawBody(req)
  const sig = req.headers['stripe-signature']

  let event
  try {
    // constructEvent throws if the signature doesn't match — stops spoofed requests.
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message)
    return res.status(400).json({ error: `Webhook error: ${err.message}` })
  }

  // We only care about successful checkouts.
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const userId = session.metadata?.user_id

    if (userId) {
      const supabase = createClient(
        process.env.VITE_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      )

      // Mark the user as paid in the profiles table.
      const { error } = await supabase
        .from('profiles')
        .update({ plan: 'paid' })
        .eq('id', userId)

      if (error) {
        console.error('Failed to update user plan:', error)
        return res.status(500).json({ error: 'Database update failed' })
      }

      console.log(`User ${userId} upgraded to paid.`)
    }
  }

  // Always return 200 so Stripe knows the webhook was received.
  res.status(200).json({ received: true })
}
