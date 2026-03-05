// AdminPage.jsx — admin-only panel for managing users and viewing stats.
// Only reachable via AdminRoute in App.jsx — non-admins are redirected away.
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

// Maps widget type keys to readable names for the dashboard view modal.
const WIDGET_NAMES = {
  claude: 'Ask Claude', clock: 'Clock', todo: 'To-Do List',
  quote: 'Daily Quote', quicklinks: 'Quick Links', weather: 'Weather',
  notes: 'Daily Notes', habits: 'Habit Tracker', pomodoro: 'Pomodoro',
  rss: 'RSS Feed', currency: 'Currency', goal: 'Goals', countdown: 'Countdown',
}

function formatDate(str) {
  if (!str) return '—'
  return new Date(str).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' })
}

export default function AdminPage({ session }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [sortDir, setSortDir] = useState('desc') // 'asc' | 'desc' by signup date
  const [viewingUser, setViewingUser] = useState(null) // user whose widgets are shown in modal
  const [actionMsg, setActionMsg] = useState(null)
  const navigate = useNavigate()

  useEffect(() => { fetchUsers() }, [])

  async function fetchUsers() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setUsers(data.users)
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }

  function flash(msg) {
    setActionMsg(msg)
    setTimeout(() => setActionMsg(null), 3000)
  }

  async function handleResetPassword(email) {
    try {
      const res = await fetch('/api/admin/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      flash(`Password reset email sent to ${email}`)
    } catch (err) {
      flash(err.message || 'Failed to send reset email.')
    }
  }

  async function handleDeactivate(userId, isBanned) {
    try {
      const res = await fetch('/api/admin/deactivate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ userId, deactivate: !isBanned }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      flash(isBanned ? 'Account reactivated.' : 'Account deactivated.')
      fetchUsers() // refresh the table
    } catch (err) {
      flash(err.message || 'Action failed.')
    }
  }

  // --- Overview stats ---
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const stats = [
    { label: 'Total Users',          value: users.length },
    { label: 'Signed Up This Week',  value: users.filter(u => new Date(u.created_at) > weekAgo).length },
    { label: 'Paid Users',           value: users.filter(u => u.plan === 'paid').length },
    { label: 'Free Users',           value: users.filter(u => u.plan === 'free').length },
  ]

  // --- Filtered + sorted user list ---
  const filtered = users
    .filter(u => u.email.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const diff = new Date(a.created_at) - new Date(b.created_at)
      return sortDir === 'asc' ? diff : -diff
    })

  if (loading) return <div className="admin-loading">Loading admin panel…</div>
  if (error)   return <div className="admin-loading admin-loading--error">Error: {error}</div>

  return (
    <div className="admin-page">

      {/* ---- Header ---- */}
      <header className="admin-header">
        <span className="admin-brand">Admin Panel</span>
        <button className="btn btn-secondary btn-sm" onClick={() => navigate('/dashboard')}>
          ← Back to Dashboard
        </button>
      </header>

      <div className="admin-content">

        {/* ---- Action feedback toast ---- */}
        {actionMsg && <div className="admin-toast">{actionMsg}</div>}

        {/* ---- Overview cards ---- */}
        <div className="admin-stats-grid">
          {stats.map(s => (
            <div key={s.label} className="admin-stat-card">
              <div className="admin-stat-value">{s.value}</div>
              <div className="admin-stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* ---- Users table ---- */}
        <div className="admin-section">
          <div className="admin-section-header">
            <h2>Users <span className="admin-count">({filtered.length})</span></h2>
            <div className="admin-controls">
              <input
                className="admin-search"
                placeholder="Search by email…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')}
              >
                Signed Up {sortDir === 'asc' ? '↑ Oldest' : '↓ Newest'}
              </button>
            </div>
          </div>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Signed Up</th>
                  <th>Last Login</th>
                  <th>Plan</th>
                  <th>Widgets</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => (
                  <tr key={u.id} className={u.is_banned ? 'admin-row--banned' : ''}>
                    <td className="admin-cell-email">
                      {u.email}
                      {u.role === 'admin'  && <span className="admin-badge admin-badge--purple">Admin</span>}
                      {u.is_banned        && <span className="admin-badge admin-badge--red">Deactivated</span>}
                    </td>
                    <td>{formatDate(u.created_at)}</td>
                    <td>{formatDate(u.last_sign_in_at)}</td>
                    <td>
                      <span className={`admin-badge ${u.plan === 'paid' ? 'admin-badge--green' : 'admin-badge--grey'}`}>
                        {u.plan}
                      </span>
                    </td>
                    <td>{u.widget_count}</td>
                    <td>
                      <div className="admin-actions">
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleResetPassword(u.email)}
                        >
                          Reset PW
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => setViewingUser(u)}
                        >
                          View
                        </button>
                        <button
                          className={`btn btn-sm ${u.is_banned ? 'btn-primary' : 'btn-danger'}`}
                          onClick={() => handleDeactivate(u.id, u.is_banned)}
                          disabled={u.role === 'admin'} // can't deactivate other admins
                        >
                          {u.is_banned ? 'Reactivate' : 'Deactivate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="admin-empty-row">No users found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ---- Dashboard view modal ---- */}
      {viewingUser && (
        <div className="modal-overlay" onClick={() => setViewingUser(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{viewingUser.email}'s Dashboard</h2>
              <button className="btn btn-secondary btn-sm" onClick={() => setViewingUser(null)}>
                ✕ Close
              </button>
            </div>
            <div className="modal-body">
              {viewingUser.widgets.length === 0 ? (
                <p style={{ color: '#a0aec0' }}>This user hasn't added any widgets yet.</p>
              ) : (
                <ul className="admin-widget-list">
                  {viewingUser.widgets.map(w => (
                    <li key={w.id} className="admin-widget-item">
                      {WIDGET_NAMES[w.type] || w.type}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
