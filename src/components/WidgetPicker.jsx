// WidgetPicker.jsx — modal showing all widget options.
// Premium widgets are locked for free users with an "Unlock" button that triggers Stripe Checkout.
import React, { useState } from 'react'

const FREE_WIDGETS = [
  { type: 'claude',      icon: '🤖', name: 'Ask Claude',    desc: 'Chat with Claude AI' },
  { type: 'clock',       icon: '🕐', name: 'Clock',         desc: 'Current time & date' },
  { type: 'todo',        icon: '✅', name: 'To-Do List',    desc: 'Track daily tasks' },
  { type: 'quote',       icon: '💬', name: 'Daily Quote',   desc: 'Inspirational quote' },
  { type: 'quicklinks',  icon: '🔗', name: 'Quick Links',   desc: 'Favorite websites' },
  { type: 'weather',     icon: '🌤', name: 'Weather',       desc: 'Live local forecast' },
  { type: 'notes',       icon: '📝', name: 'Daily Notes',   desc: 'Scratch pad' },
  { type: 'habits',      icon: '💪', name: 'Habit Tracker', desc: 'Daily habit streaks' },
  { type: 'pomodoro',    icon: '🍅', name: 'Pomodoro',      desc: '25-min focus timer' },
  { type: 'rss',         icon: '📰', name: 'RSS Feed',      desc: 'Read your news' },
  { type: 'currency',    icon: '💱', name: 'Currency',      desc: 'Live exchange rates' },
  { type: 'goal',        icon: '🎯', name: 'Goal Tracker',  desc: 'Progress toward goals' },
  { type: 'countdown',   icon: '⏳', name: 'Countdown',     desc: 'Count to any event' },
]

const PREMIUM_WIDGETS = [
  { type: 'ai-brief',    icon: '✨', name: 'AI Daily Brief',  desc: 'Claude writes your personalized daily briefing — motivation + productivity tip' },
  { type: 'stocks',      icon: '📈', name: 'Stock Ticker',    desc: 'Live stock prices and daily change for any symbols you choose' },
  { type: 'kanban',      icon: '🗂', name: 'Kanban Board',    desc: 'Drag-and-drop task board with To Do, In Progress, and Done columns' },
  { type: 'worldclocks', icon: '🌍', name: 'World Clocks',    desc: 'Live times across multiple cities and time zones simultaneously' },
]

export default function WidgetPicker({ onAdd, onClose, plan, session }) {
  const isPaid = plan === 'paid'
  const [unlocking, setUnlocking] = useState(false)

  async function handleUnlock() {
    setUnlocking(true)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      // Redirect to Stripe Checkout.
      window.location.href = data.url
    } catch (err) {
      console.error('Checkout error:', err)
      setUnlocking(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Choose a Widget</h2>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>✕ Close</button>
        </div>

        <div className="modal-body">
          {/* Free widgets */}
          <div className="widget-picker-grid">
            {FREE_WIDGETS.map(w => (
              <div
                key={w.type}
                className="widget-option"
                onClick={() => onAdd(w.type)}
                role="button"
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && onAdd(w.type)}
              >
                <div className="wo-icon">{w.icon}</div>
                <div className="wo-name">{w.name}</div>
                <div className="wo-desc">{w.desc}</div>
              </div>
            ))}
          </div>

          {/* Premium widgets section */}
          <div className="premium-section-header">
            <span className="premium-label">⭐ Premium Widgets</span>
            {!isPaid && (
              <span className="premium-sublabel">$1/mo unlocks all four</span>
            )}
          </div>

          <div className="widget-picker-grid">
            {PREMIUM_WIDGETS.map(w => (
              isPaid ? (
                // Paid users — fully clickable, just like free widgets.
                <div
                  key={w.type}
                  className="widget-option widget-option--premium"
                  onClick={() => onAdd(w.type)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => e.key === 'Enter' && onAdd(w.type)}
                >
                  <div className="wo-icon">{w.icon}</div>
                  <div className="wo-name">{w.name}</div>
                  <div className="wo-desc">{w.desc}</div>
                  <div className="premium-unlocked-badge">✓ Unlocked</div>
                </div>
              ) : (
                // Free users — locked card with unlock button.
                <div key={w.type} className="widget-option widget-option--locked">
                  <div className="locked-overlay">🔒</div>
                  <div className="wo-icon" style={{ filter: 'blur(0px)' }}>{w.icon}</div>
                  <div className="wo-name">{w.name}</div>
                  <div className="wo-desc" style={{ opacity: 0.7 }}>{w.desc}</div>
                  <button
                    className="btn-unlock"
                    onClick={e => { e.stopPropagation(); handleUnlock() }}
                    disabled={unlocking}
                  >
                    {unlocking ? 'Redirecting…' : 'Unlock for $1/mo'}
                  </button>
                </div>
              )
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
