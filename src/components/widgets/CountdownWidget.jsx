// CountdownWidget.jsx — counts down to any future event the user names.
import React, { useState, useEffect } from 'react'

function getTimeLeft(targetDate) {
  const diff = new Date(targetDate) - new Date()
  if (diff <= 0) return null // event has passed

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)
  return { days, hours, minutes, seconds }
}

export default function CountdownWidget({ config, onChange }) {
  const [eventName, setEventName] = useState(config.eventName || '')
  const [eventDate, setEventDate] = useState(config.eventDate || '')
  const [editing, setEditing] = useState(!config.eventDate)
  const [timeLeft, setTimeLeft] = useState(config.eventDate ? getTimeLeft(config.eventDate) : null)

  // Update the countdown every second.
  useEffect(() => {
    if (!config.eventDate) return
    const timer = setInterval(() => {
      setTimeLeft(getTimeLeft(config.eventDate))
    }, 1000)
    return () => clearInterval(timer)
  }, [config.eventDate])

  function saveEvent() {
    if (!eventDate) return
    onChange({ eventName: eventName.trim() || 'Event', eventDate })
    setEditing(false)
    setTimeLeft(getTimeLeft(eventDate))
  }

  if (editing) {
    return (
      <div className="countdown-form">
        <input
          placeholder="Event name (e.g. Summer vacation)"
          value={eventName}
          onChange={e => setEventName(e.target.value)}
        />
        <input
          type="datetime-local"
          value={eventDate}
          onChange={e => setEventDate(e.target.value)}
        />
        <button className="btn btn-primary btn-sm" onClick={saveEvent} disabled={!eventDate}>
          Set Countdown
        </button>
      </div>
    )
  }

  return (
    <div className="countdown-display">
      <div className="countdown-event">{config.eventName}</div>
      {timeLeft ? (
        <div className="countdown-units">
          {[
            { label: 'Days', value: timeLeft.days },
            { label: 'Hours', value: timeLeft.hours },
            { label: 'Mins', value: timeLeft.minutes },
            { label: 'Secs', value: timeLeft.seconds },
          ].map(u => (
            <div key={u.label} className="countdown-unit">
              <div className="countdown-num">{String(u.value).padStart(2, '0')}</div>
              <div className="countdown-unit-label">{u.label}</div>
            </div>
          ))}
        </div>
      ) : (
        <p style={{ color: '#38a169', fontWeight: 700, fontSize: '1.05rem', marginTop: '0.5rem' }}>
          🎉 The event is here!
        </p>
      )}
      <button
        className="btn btn-secondary btn-sm"
        style={{ marginTop: '0.75rem' }}
        onClick={() => setEditing(true)}
      >
        Change Event
      </button>
    </div>
  )
}
