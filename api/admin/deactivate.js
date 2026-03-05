// api/admin/deactivate.js — bans or unbans a user account.
// Uses Supabase's ban_duration feature, which prevents the user from signing in.
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

  const { userId, deactivate } = req.body
  if (!userId) return res.status(400).json({ error: 'userId is required' })

  // Prevent admins from deactivating themselves.
  if (userId === user.id) return res.status(400).json({ error: 'Cannot deactivate your own account.' })

  try {
    const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      // '876000h' is ~100 years — effectively a permanent ban. 'none' lifts it.
      ban_duration: deactivate ? '876000h' : 'none',
    })
    if (error) throw error
    res.status(200).json({ success: true })
  } catch (err) {
    console.error('Deactivate error:', err)
    res.status(500).json({ error: 'Failed to update account status.' })
  }
}
