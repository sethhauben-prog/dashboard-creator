// WorldClocksWidget.jsx — shows live times across multiple time zones.
// Uses the Intl.DateTimeFormat API built into the browser — no dependencies needed.
import React, { useState, useEffect } from 'react'

const PRESETS = [
  { label: 'New York',  tz: 'America/New_York' },
  { label: 'London',    tz: 'Europe/London' },
  { label: 'Tokyo',     tz: 'Asia/Tokyo' },
  { label: 'Sydney',    tz: 'Australia/Sydney' },
  { label: 'Paris',     tz: 'Europe/Paris' },
  { label: 'Dubai',     tz: 'Asia/Dubai' },
  { label: 'LA',        tz: 'America/Los_Angeles' },
  { label: 'Chicago',   tz: 'America/Chicago' },
]

export default function WorldClocksWidget({ config, onChange }) {
  const clocks = config.clocks || [PRESETS[0], PRESETS[1], PRESETS[2]]
  const [now, setNow] = useState(new Date())
  const [adding, setAdding] = useState(false)

  // Tick every second.
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  function getTime(tz) {
    try {
      return now.toLocaleTimeString('en-US', {
        timeZone: tz,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    } catch {
      return '—'
    }
  }

  function addClock(preset) {
    if (clocks.find(c => c.tz === preset.tz)) return // already added
    onChange({ clocks: [...clocks, preset] })
    setAdding(false)
  }

  function removeClock(tz) {
    onChange({ clocks: clocks.filter(c => c.tz !== tz) })
  }

  const available = PRESETS.filter(p => !clocks.find(c => c.tz === p.tz))

  return (
    <div>
      <div className="world-clocks-list">
        {clocks.map(clock => (
          <div key={clock.tz} className="world-clock-row">
            <span className="wc-label">{clock.label}</span>
            <span className="wc-time">{getTime(clock.tz)}</span>
            <button
              className="rm-btn"
              onClick={() => removeClock(clock.tz)}
              title="Remove"
            >✕</button>
          </div>
        ))}
      </div>

      {adding ? (
        <div className="wc-add-list">
          {available.map(p => (
            <button key={p.tz} className="btn btn-secondary btn-sm wc-preset-btn" onClick={() => addClock(p)}>
              {p.label}
            </button>
          ))}
          {available.length === 0 && (
            <p style={{ color: '#a0aec0', fontSize: '0.82rem' }}>All clocks added.</p>
          )}
          <button className="btn btn-secondary btn-sm" onClick={() => setAdding(false)}>Cancel</button>
        </div>
      ) : (
        <button
          className="btn btn-secondary btn-sm"
          style={{ marginTop: '0.5rem' }}
          onClick={() => setAdding(true)}
        >
          + Add City
        </button>
      )}
    </div>
  )
}
