// api/admin/reset-password.js — sends a password reset email to a user.
import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const supabaseAdmin = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  // Verify the caller is an admin.
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'Unauthorized' })

  const { data: { user } } = await supabaseAdmin.auth.getUser(token)
  const { data: profile } = await supabaseAdmin
    .from('profiles').select('role').eq('id', user?.id).single()
  if (profile?.role !== 'admin') return res.status(403).json({ error: 'Forbidden' })

  const { email } = req.body
  if (!email) return res.status(400).json({ error: 'email is required' })

  try {
    const { error } = await supabaseAdmin.auth.resetPasswordForEmail(email)
    if (error) throw error
    res.status(200).json({ success: true })
  } catch (err) {
    console.error('Reset password error:', err)
    res.status(500).json({ error: 'Failed to send reset email.' })
  }
}
