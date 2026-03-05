// DashboardView.jsx — the full-screen live dashboard.
// Loads the user's saved widgets and displays them in a clean, immersive layout.
// No editing here — use the "Edit Dashboard" button to go back to the Set Up page.
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient.js'
import WidgetGrid from '../components/WidgetGrid.jsx'

export default function DashboardView({ session }) {
  const [widgets, setWidgets] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  // Load the user's saved widgets from Supabase on mount.
  useEffect(() => {
    async function loadWidgets() {
      const { data, error } = await supabase
        .from('dashboards')
        .select('widgets')
        .eq('user_id', session.user.id)
        .single()

      if (!error && data?.widgets) {
        setWidgets(data.widgets)
      }

      setLoading(false)
    }

    loadWidgets()
  }, [session])

  if (loading) {
    return (
      <div className="view-loading">
        <p>Loading your dashboard…</p>
      </div>
    )
  }

  return (
    <div className="dashboard-view-page">
      {/* Top bar — minimal, just the title and edit button */}
      <header className="view-header">
        <span className="view-brand">My Dashboard</span>
        <div className="view-header-right">
          <span className="view-user-email">{session.user.email}</span>
          <button
            className="btn btn-edit-dashboard"
            onClick={() => navigate('/dashboard')}
          >
            Edit Dashboard
          </button>
        </div>
      </header>

      {/* Widget area */}
      <main className="view-content">
        {widgets.length === 0 ? (
          // No widgets — prompt the user to set up their dashboard first.
          <div className="view-empty">
            <div className="view-empty-icon">🧩</div>
            <p>Your dashboard has no widgets yet.</p>
            <button className="btn btn-edit-dashboard" onClick={() => navigate('/dashboard')}>
              Go to Set Up
            </button>
          </div>
        ) : (
          // viewOnly=true hides all remove/edit controls inside the grid.
          <WidgetGrid
            widgets={widgets}
            onRemove={() => {}}
            onUpdate={() => {}}
            viewOnly={true}
          />
        )}
      </main>
    </div>
  )
}
