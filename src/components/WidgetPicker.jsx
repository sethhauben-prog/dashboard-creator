// WidgetPicker.jsx — a modal that shows all 12 available widget options.
// The user clicks one to add it to their dashboard.
import React from 'react'

// List of all available widgets with their metadata.
const WIDGET_CATALOG = [
  { type: 'claude',      icon: '🤖', name: 'Ask Claude',   desc: 'Chat with Claude AI' },
  { type: 'clock',       icon: '🕐', name: 'Clock',        desc: 'Current time & date' },
  { type: 'todo',        icon: '✅', name: 'To-Do List',   desc: 'Track daily tasks' },
  { type: 'quote',       icon: '💬', name: 'Daily Quote',  desc: 'Inspirational quote' },
  { type: 'quicklinks',  icon: '🔗', name: 'Quick Links',  desc: 'Favorite websites' },
  { type: 'weather',     icon: '🌤', name: 'Weather',      desc: 'Live local forecast' },
  { type: 'notes',       icon: '📝', name: 'Daily Notes',  desc: 'Scratch pad' },
  { type: 'habits',      icon: '💪', name: 'Habit Tracker',desc: 'Daily habit streaks' },
  { type: 'pomodoro',    icon: '🍅', name: 'Pomodoro',     desc: '25-min focus timer' },
  { type: 'rss',         icon: '📰', name: 'RSS Feed',     desc: 'Read your news' },
  { type: 'currency',    icon: '💱', name: 'Currency',     desc: 'Live exchange rates' },
  { type: 'goal',        icon: '🎯', name: 'Goal Tracker', desc: 'Progress toward goals' },
  { type: 'countdown',   icon: '⏳', name: 'Countdown',    desc: 'Count to any event' },
]

export default function WidgetPicker({ onAdd, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      {/* Stop clicks inside the box from closing the modal */}
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Choose a Widget</h2>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>✕ Close</button>
        </div>
        <div className="modal-body">
          <div className="widget-picker-grid">
            {WIDGET_CATALOG.map(w => (
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
        </div>
      </div>
    </div>
  )
}
