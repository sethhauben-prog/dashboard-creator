// KanbanWidget.jsx — a drag-and-drop Kanban board with 3 columns.
// Uses HTML5 native drag-and-drop. State persists via config/Supabase.
import React, { useState } from 'react'

const COLUMNS = ['To Do', 'In Progress', 'Done']

export default function KanbanWidget({ config, onChange }) {
  const cards = config.cards || []
  const [newText, setNewText] = useState('')
  const [dragging, setDragging] = useState(null) // id of card being dragged

  function addCard() {
    if (!newText.trim()) return
    const updated = [...cards, {
      id: crypto.randomUUID(),
      text: newText.trim(),
      column: 'To Do',
    }]
    onChange({ cards: updated })
    setNewText('')
  }

  function removeCard(id) {
    onChange({ cards: cards.filter(c => c.id !== id) })
  }

  // Called when a card is dropped onto a column.
  function handleDrop(column) {
    if (!dragging) return
    const updated = cards.map(c => c.id === dragging ? { ...c, column } : c)
    onChange({ cards: updated })
    setDragging(null)
  }

  return (
    <div>
      <div className="kanban-board">
        {COLUMNS.map(col => (
          <div
            key={col}
            className="kanban-column"
            onDragOver={e => e.preventDefault()}
            onDrop={() => handleDrop(col)}
          >
            <div className="kanban-col-header">{col}</div>
            <div className="kanban-cards">
              {cards.filter(c => c.column === col).map(card => (
                <div
                  key={card.id}
                  className="kanban-card"
                  draggable
                  onDragStart={() => setDragging(card.id)}
                  onDragEnd={() => setDragging(null)}
                >
                  <span>{card.text}</span>
                  <button
                    className="kanban-rm"
                    onClick={() => removeCard(card.id)}
                    title="Remove"
                  >✕</button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="kanban-add">
        <input
          value={newText}
          onChange={e => setNewText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addCard()}
          placeholder="Add a card…"
        />
        <button className="btn btn-primary btn-sm" onClick={addCard}>Add</button>
      </div>
    </div>
  )
}
