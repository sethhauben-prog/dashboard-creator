// HabitTrackerWidget.jsx — tracks daily habits with a streak counter.
// Each habit records the last-completed date so we can calculate streaks.
import React, { useState } from 'react'

function getTodayStr() {
  return new Date().toISOString().slice(0, 10) // "YYYY-MM-DD"
}

function getYesterdayStr() {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toISOString().slice(0, 10)
}

// Calculate the current streak based on stored streak data.
// If the habit was completed today, streak stays. If completed yesterday, it continues.
// Otherwise, the streak resets to 0.
function currentStreak(habit) {
  const today = getTodayStr()
  if (habit.lastDone === today) return habit.streak
  if (habit.lastDone === getYesterdayStr()) return habit.streak
  return 0
}

export default function HabitTrackerWidget({ config, onChange }) {
  const habits = config.habits || []
  const [newHabit, setNewHabit] = useState('')

  function addHabit() {
    if (!newHabit.trim()) return
    const updated = [...habits, {
      id: crypto.randomUUID(),
      name: newHabit.trim(),
      lastDone: null,
      streak: 0,
    }]
    onChange({ habits: updated })
    setNewHabit('')
  }

  function toggleHabit(id) {
    const today = getTodayStr()
    const updated = habits.map(h => {
      if (h.id !== id) return h

      if (h.lastDone === today) {
        // Already done today — undo it.
        return { ...h, lastDone: getYesterdayStr(), streak: Math.max(0, h.streak - 1) }
      }

      // Mark as done today. If we did it yesterday, the streak continues; otherwise reset to 1.
      const previousStreak = h.lastDone === getYesterdayStr() ? h.streak : 0
      return { ...h, lastDone: today, streak: previousStreak + 1 }
    })
    onChange({ habits: updated })
  }

  function removeHabit(id) {
    onChange({ habits: habits.filter(h => h.id !== id) })
  }

  const today = getTodayStr()

  return (
    <div>
      <div className="habits-list">
        {habits.map(h => {
          const isDoneToday = h.lastDone === today
          const streak = currentStreak(h)
          return (
            <div key={h.id} className="habit-row">
              <div className="habit-left">
                <input
                  type="checkbox"
                  checked={isDoneToday}
                  onChange={() => toggleHabit(h.id)}
                />
                <span className="habit-name" style={{ textDecoration: isDoneToday ? 'line-through' : 'none', color: isDoneToday ? '#a0aec0' : '#2d3748' }}>
                  {h.name}
                </span>
                {streak > 0 && <span className="habit-streak">🔥 {streak}</span>}
              </div>
              <button
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e53e3e', fontSize: '0.85rem' }}
                onClick={() => removeHabit(h.id)}
              >✕</button>
            </div>
          )
        })}
        {habits.length === 0 && (
          <p style={{ color: '#a0aec0', fontSize: '0.85rem' }}>Add a habit to start tracking!</p>
        )}
      </div>
      <div className="habit-add">
        <input
          value={newHabit}
          onChange={e => setNewHabit(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addHabit()}
          placeholder="New habit…"
        />
        <button className="btn btn-primary btn-sm" onClick={addHabit}>Add</button>
      </div>
    </div>
  )
}
