// TodoWidget.jsx — a simple to-do list.
// Tasks are stored in the widget's config object and saved to Supabase via onChange.
import React, { useState } from 'react'

export default function TodoWidget({ config, onChange }) {
  // config.items is our list of to-do tasks. Default to empty array if none yet.
  const items = config.items || []
  const [text, setText] = useState('')

  function addItem() {
    if (!text.trim()) return
    const newItems = [...items, { id: crypto.randomUUID(), text: text.trim(), done: false }]
    onChange({ items: newItems })
    setText('')
  }

  function toggleItem(id) {
    const newItems = items.map(item =>
      item.id === id ? { ...item, done: !item.done } : item
    )
    onChange({ items: newItems })
  }

  function removeItem(id) {
    onChange({ items: items.filter(item => item.id !== id) })
  }

  function handleKey(e) {
    if (e.key === 'Enter') addItem()
  }

  return (
    <div>
      <div className="todo-input-row">
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Add a task…"
        />
        <button className="btn btn-primary btn-sm" onClick={addItem}>Add</button>
      </div>
      <ul className="todo-list">
        {items.map(item => (
          <li key={item.id} className="todo-item">
            <input
              type="checkbox"
              checked={item.done}
              onChange={() => toggleItem(item.id)}
            />
            <span className={`todo-text ${item.done ? 'done' : ''}`}>{item.text}</span>
            <button className="rm-btn" onClick={() => removeItem(item.id)} title="Remove">✕</button>
          </li>
        ))}
        {items.length === 0 && (
          <li style={{ color: '#a0aec0', fontSize: '0.85rem', padding: '0.25rem 0.5rem' }}>
            No tasks yet — add one above!
          </li>
        )}
      </ul>
    </div>
  )
}
