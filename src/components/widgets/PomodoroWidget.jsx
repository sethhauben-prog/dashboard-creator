// PomodoroWidget.jsx — a Pomodoro focus timer (25 min work / 5 min break).
// The timer counts down and switches between work and break modes automatically.
import React, { useState, useEffect, useRef } from 'react'

const WORK_MINS = 25
const BREAK_MINS = 5

export default function PomodoroWidget() {
  const [mode, setMode] = useState('work')       // 'work' or 'break'
  const [secondsLeft, setSecondsLeft] = useState(WORK_MINS * 60)
  const [running, setRunning] = useState(false)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (running) {
      // Tick every second.
      intervalRef.current = setInterval(() => {
        setSecondsLeft(prev => {
          if (prev <= 1) {
            // Timer finished — switch modes automatically.
            const nextMode = mode === 'work' ? 'break' : 'work'
            setMode(nextMode)
            setRunning(false)
            return nextMode === 'work' ? WORK_MINS * 60 : BREAK_MINS * 60
          }
          return prev - 1
        })
      }, 1000)
    } else {
      clearInterval(intervalRef.current)
    }

    return () => clearInterval(intervalRef.current)
  }, [running, mode])

  function toggleTimer() {
    setRunning(r => !r)
  }

  function resetTimer() {
    setRunning(false)
    setSecondsLeft(mode === 'work' ? WORK_MINS * 60 : BREAK_MINS * 60)
  }

  function switchMode(newMode) {
    setRunning(false)
    setMode(newMode)
    setSecondsLeft(newMode === 'work' ? WORK_MINS * 60 : BREAK_MINS * 60)
  }

  // Format seconds as MM:SS.
  const mins = String(Math.floor(secondsLeft / 60)).padStart(2, '0')
  const secs = String(secondsLeft % 60).padStart(2, '0')

  const modeColor = mode === 'work' ? '#4f46e5' : '#38a169'

  return (
    <div className="pomo-display">
      <div className="pomo-time" style={{ color: modeColor }}>{mins}:{secs}</div>
      <div className="pomo-label" style={{ color: modeColor }}>
        {mode === 'work' ? '🍅 Focus time' : '☕ Break time'}
      </div>
      <div className="pomo-controls">
        <button className="btn btn-primary btn-sm" onClick={toggleTimer}>
          {running ? '⏸ Pause' : '▶ Start'}
        </button>
        <button className="btn btn-secondary btn-sm" onClick={resetTimer}>↺ Reset</button>
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => switchMode(mode === 'work' ? 'break' : 'work')}
        >
          {mode === 'work' ? '☕ Break' : '🍅 Work'}
        </button>
      </div>
    </div>
  )
}
