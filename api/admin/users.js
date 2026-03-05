// api/admin/users.js — returns all users with profile and dashboard data.
// Uses the service role key so it can read auth.users. Never exposed to the browser.
import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const supabaseAdmin = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  // Verify the caller is a logged-in admin before returning any data.
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'Unauthorized' })

  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
  if (authError || !user) return res.status(401).json({ error: 'Unauthorized' })

  const { data: callerProfile } = await supabaseAdmin
    .from('profiles').select('role').eq('id', user.id).single()
  if (callerProfile?.role !== 'admin') return res.status(403).json({ error: 'Forbidden' })

  try {
    // Fetch all three data sources in parallel.
    const [
      { data: { users }, error: usersError },
      { data: profiles },
      { data: dashboards },
    ] = await Promise.all([
      supabaseAdmin.auth.admin.listUsers({ perPage: 1000 }),
      supabaseAdmin.from('profiles').select('*'),
      supabaseAdmin.from('dashboards').select('user_id, widgets'),
    ])

    if (usersError) throw usersError

    // Combine into one object per user.
    const combined = users.map(u => {
      const profile = profiles?.find(p => p.id === u.id) || {}
      const dashboard = dashboards?.find(d => d.user_id === u.id)
      const isBanned = u.banned_until ? new Date(u.banned_until) > new Date() : false

      return {
        id: u.id,
        email: u.email,
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at,
        role: profile.role || 'user',
        plan: profile.plan || 'free',
        is_banned: isBanned,
        widget_count: dashboard?.widgets?.length || 0,
        widgets: dashboard?.widgets || [],
      }
    })

    res.status(200).json({ users: combined })
  } catch (err) {
    console.error('Admin users error:', err)
    res.status(500).json({ error: 'Failed to load users.' })
  }
}
