// ClockWidget.jsx — shows the current time and date, updated every second.
import React, { useEffect, useState } from 'react'

export default function ClockWidget() {
  const [now, setNow] = useState(new Date())

  // setInterval updates the time every 1000ms (1 second).
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer) // clean up when the widget is removed
  }, [])

  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  const dateStr = now.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div className="clock-display">
      <div className="clock-time">{timeStr}</div>
      <div className="clock-date">{dateStr}</div>
    </div>
  )
}
