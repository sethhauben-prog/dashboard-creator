// DailyNotesWidget.jsx — a simple text area for quick notes.
// The content is saved to Supabase via onChange (debounced by the dashboard).
import React, { useState } from 'react'

export default function DailyNotesWidget({ config, onChange }) {
  const [text, setText] = useState(config.text || '')

  function handleChange(e) {
    setText(e.target.value)
    onChange({ text: e.target.value })
  }

  return (
    <div>
      <textarea
        className="notes-area"
        value={text}
        onChange={handleChange}
        placeholder="Jot down quick thoughts, ideas, or reminders…"
      />
      <div style={{ fontSize: '0.75rem', color: '#a0aec0', marginTop: '0.25rem' }}>
        Auto-saves as you type.
      </div>
    </div>
  )
}
