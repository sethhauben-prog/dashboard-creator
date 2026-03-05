// Dashboard.jsx — the main page where users build and view their widget layout.
// We load the user's saved widgets from Supabase on mount, and auto-save on every change.
import React, { useEffect, useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient.js'
import WidgetPicker from '../components/WidgetPicker.jsx'
import WidgetGrid from '../components/WidgetGrid.jsx'

export default function Dashboard({ session, role }) {
  const [widgets, setWidgets] = useState([])        // list of widget objects
  const [showPicker, setShowPicker] = useState(false) // controls the add-widget modal
  const [saveStatus, setSaveStatus] = useState('')   // "Saved ✓" feedback message
  const [loading, setLoading] = useState(true)
  const debounceRef = useRef(null)                   // holds our save timer
  const navigate = useNavigate()

  // --- Load saved widgets from Supabase when the dashboard first opens ---
  useEffect(() => {
    async function loadDashboard() {
      const userId = session.user.id

      const { data, error } = await supabase
        .from('dashboards')
        .select('widgets')
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = row not found (first-time user), which is fine.
        console.error('Error loading dashboard:', error)
      }

      if (data?.widgets) {
        setWidgets(data.widgets)
      }

      setLoading(false)
    }

    loadDashboard()
  }, [session])

  // --- Auto-save with a 1-second debounce ---
  // This means we wait 1 second after the last change before writing to Supabase.
  // It avoids hammering the database on rapid updates.
  const saveDashboard = useCallback(async (widgetsToSave) => {
    setSaveStatus('Saving…')
    const userId = session.user.id

    // upsert = insert if not exists, otherwise update.
    const { error } = await supabase
      .from('dashboards')
      .upsert({ user_id: userId, widgets: widgetsToSave, updated_at: new Date().toISOString() },
               { onConflict: 'user_id' })

    if (error) {
      console.error('Save error:', error)
      setSaveStatus('Save failed')
    } else {
      setSaveStatus('Saved ✓')
      setTimeout(() => setSaveStatus(''), 2000)
    }
  }, [session])

  // Trigger a debounced save whenever widgets change (but not on initial load).
  const isFirstRender = useRef(true)
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return }
    if (loading) return

    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => saveDashboard(widgets), 1000)

    return () => clearTimeout(debounceRef.current)
  }, [widgets, loading, saveDashboard])

  // --- Widget management ---
  function addWidget(type) {
    const newWidget = {
      id: crypto.randomUUID(), // give each widget a unique ID
      type,
      config: {},              // each widget stores its own data in config
    }
    setWidgets(prev => [...prev, newWidget])
    setShowPicker(false)
  }

  function removeWidget(id) {
    setWidgets(prev => prev.filter(w => w.id !== id))
  }

  // updateWidget lets individual widgets save their config (e.g. todo items, city name).
  function updateWidget(id, newConfig) {
    setWidgets(prev =>
      prev.map(w => w.id === id ? { ...w, config: { ...w.config, ...newConfig } } : w)
    )
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    // App.jsx will detect the session change and redirect to landing.
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <p style={{ color: '#718096' }}>Loading your dashboard…</p>
      </div>
    )
  }

  return (
    <div>
      {/* Top header bar */}
      <header className="dashboard-header">
        <span className="brand">Dashboard Creator</span>
        <div className="header-right">
          <span className="user-email">{session.user.email}</span>
          {role === 'admin' && (
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/admin')}>
              Admin
            </button>
          )}
          <button className="btn btn-secondary btn-sm" onClick={handleLogout}>Log Out</button>
        </div>
      </header>

      <div className="dashboard-content">
        {/* Toolbar: title + action buttons */}
        <div className="dashboard-toolbar">
          <h2>Set Up {saveStatus && <span className="save-status">{saveStatus}</span>}</h2>
          <div className="toolbar-actions">
            <button className="btn btn-secondary" onClick={() => setShowPicker(true)}>
              + Add Widget
            </button>
            {widgets.length > 0 && (
              <button className="btn btn-primary" onClick={() => navigate('/view')}>
                Launch Dashboard
              </button>
            )}
          </div>
        </div>

        {/* If no widgets yet, show a friendly empty state */}
        {widgets.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🧩</div>
            <p>Your dashboard is empty. Add your first widget!</p>
            <button className="btn btn-primary" onClick={() => setShowPicker(true)}>
              + Add Widget
            </button>
          </div>
        ) : (
          <WidgetGrid
            widgets={widgets}
            onRemove={removeWidget}
            onUpdate={updateWidget}
          />
        )}
      </div>

      {/* Widget picker modal — shown when user clicks "Add Widget" */}
      {showPicker && (
        <WidgetPicker
          onAdd={addWidget}
          onClose={() => setShowPicker(false)}
        />
      )}
    </div>
  )
}
