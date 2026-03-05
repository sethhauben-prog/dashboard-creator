// GoalWidget.jsx — lets users track progress toward goals with a visual progress bar.
import React, { useState } from 'react'

export default function GoalWidget({ config, onChange }) {
  const goals = config.goals || []
  const [newTitle, setNewTitle] = useState('')
  const [newCurrent, setNewCurrent] = useState('')
  const [newTarget, setNewTarget] = useState('')

  function addGoal() {
    if (!newTitle.trim() || !newTarget) return
    const updated = [...goals, {
      id: crypto.randomUUID(),
      title: newTitle.trim(),
      current: parseFloat(newCurrent) || 0,
      target: parseFloat(newTarget),
    }]
    onChange({ goals: updated })
    setNewTitle('')
    setNewCurrent('')
    setNewTarget('')
  }

  function updateCurrent(id, value) {
    const updated = goals.map(g =>
      g.id === id ? { ...g, current: Math.min(parseFloat(value) || 0, g.target) } : g
    )
    onChange({ goals: updated })
  }

  function removeGoal(id) {
    onChange({ goals: goals.filter(g => g.id !== id) })
  }

  return (
    <div>
      {goals.map(g => {
        const pct = Math.round((g.current / g.target) * 100)
        return (
          <div key={g.id} className="goal-item">
            <div className="goal-header">
              <span className="goal-title">{g.title}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="goal-pct">{pct}%</span>
                <button
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e53e3e', fontSize: '0.85rem' }}
                  onClick={() => removeGoal(g.id)}
                >✕</button>
              </div>
            </div>
            <div className="goal-bar-bg">
              <div className="goal-bar-fill" style={{ width: `${pct}%` }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.3rem' }}>
              <input
                type="number"
                min="0"
                max={g.target}
                step="any"
                value={g.current}
                onChange={e => updateCurrent(g.id, e.target.value)}
                style={{ width: '70px', padding: '0.25rem 0.4rem', border: '1px solid #cbd5e0', borderRadius: '6px', fontSize: '0.82rem' }}
              />
              <span style={{ fontSize: '0.82rem', color: '#718096' }}>/ {g.target}</span>
            </div>
          </div>
        )
      })}

      {goals.length === 0 && (
        <p style={{ color: '#a0aec0', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
          Add a goal to start tracking!
        </p>
      )}

      <div className="goal-add">
        <input
          placeholder="Goal title (e.g. Read 12 books)"
          value={newTitle}
          onChange={e => setNewTitle(e.target.value)}
        />
        <div className="goal-row">
          <input
            type="number"
            placeholder="Current"
            min="0"
            step="any"
            value={newCurrent}
            onChange={e => setNewCurrent(e.target.value)}
          />
          <input
            type="number"
            placeholder="Target"
            min="1"
            step="any"
            value={newTarget}
            onChange={e => setNewTarget(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addGoal()}
          />
          <button className="btn btn-primary btn-sm" onClick={addGoal}>Add</button>
        </div>
      </div>
    </div>
  )
}
