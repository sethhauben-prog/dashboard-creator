// WidgetGrid.jsx — renders all active widgets in a responsive grid.
// It maps each widget's type to the right component.
import React from 'react'
import ClockWidget from './widgets/ClockWidget.jsx'
import TodoWidget from './widgets/TodoWidget.jsx'
import QuoteWidget from './widgets/QuoteWidget.jsx'
import QuickLinksWidget from './widgets/QuickLinksWidget.jsx'
import WeatherWidget from './widgets/WeatherWidget.jsx'
import DailyNotesWidget from './widgets/DailyNotesWidget.jsx'
import HabitTrackerWidget from './widgets/HabitTrackerWidget.jsx'
import PomodoroWidget from './widgets/PomodoroWidget.jsx'
import RSSWidget from './widgets/RSSWidget.jsx'
import CurrencyWidget from './widgets/CurrencyWidget.jsx'
import GoalWidget from './widgets/GoalWidget.jsx'
import CountdownWidget from './widgets/CountdownWidget.jsx'

// Map widget type strings to their components.
const WIDGET_COMPONENTS = {
  clock:      ClockWidget,
  todo:       TodoWidget,
  quote:      QuoteWidget,
  quicklinks: QuickLinksWidget,
  weather:    WeatherWidget,
  notes:      DailyNotesWidget,
  habits:     HabitTrackerWidget,
  pomodoro:   PomodoroWidget,
  rss:        RSSWidget,
  currency:   CurrencyWidget,
  goal:       GoalWidget,
  countdown:  CountdownWidget,
}

const WIDGET_META = {
  clock:      { icon: '🕐', name: 'Clock' },
  todo:       { icon: '✅', name: 'To-Do List' },
  quote:      { icon: '💬', name: 'Daily Quote' },
  quicklinks: { icon: '🔗', name: 'Quick Links' },
  weather:    { icon: '🌤', name: 'Weather' },
  notes:      { icon: '📝', name: 'Daily Notes' },
  habits:     { icon: '💪', name: 'Habit Tracker' },
  pomodoro:   { icon: '🍅', name: 'Pomodoro' },
  rss:        { icon: '📰', name: 'RSS Feed' },
  currency:   { icon: '💱', name: 'Currency' },
  goal:       { icon: '🎯', name: 'Goals' },
  countdown:  { icon: '⏳', name: 'Countdown' },
}

export default function WidgetGrid({ widgets, onRemove, onUpdate }) {
  return (
    <div className="widget-grid">
      {widgets.map(widget => {
        const Component = WIDGET_COMPONENTS[widget.type]
        const meta = WIDGET_META[widget.type] || { icon: '📦', name: widget.type }

        if (!Component) return null // skip unknown widget types

        return (
          <div key={widget.id} className="widget-card">
            {/* Widget header with title and remove button */}
            <div className="widget-card-header">
              <span className="widget-title">
                {meta.icon} {meta.name}
              </span>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => onRemove(widget.id)}
                title="Remove widget"
              >
                ✕
              </button>
            </div>
            {/* Widget body — passes config down and lets widget update it */}
            <div className="widget-card-body">
              <Component
                config={widget.config}
                onChange={newConfig => onUpdate(widget.id, newConfig)}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
