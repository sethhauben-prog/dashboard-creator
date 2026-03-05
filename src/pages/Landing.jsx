// Landing.jsx — the home page everyone sees when they visit the app.
// If the user is already logged in, we show a "Go to Dashboard" button instead.
import React from 'react'
import { Link, useNavigate } from 'react-router-dom'

const features = [
  { icon: '🕐', name: 'Clock', desc: 'Always know the time' },
  { icon: '✅', name: 'To-Do List', desc: 'Track daily tasks' },
  { icon: '💬', name: 'Quote of Day', desc: 'Stay inspired' },
  { icon: '🔗', name: 'Quick Links', desc: 'Your favorite sites' },
  { icon: '🌤', name: 'Weather', desc: 'Live local forecast' },
  { icon: '📝', name: 'Daily Notes', desc: 'Jot quick thoughts' },
  { icon: '💪', name: 'Habits', desc: 'Build streaks' },
  { icon: '🍅', name: 'Pomodoro', desc: 'Focus timer' },
  { icon: '📰', name: 'RSS Feed', desc: 'Read your news' },
  { icon: '💱', name: 'Currency', desc: 'Live exchange rates' },
  { icon: '🎯', name: 'Goals', desc: 'Track progress' },
  { icon: '⏳', name: 'Countdown', desc: 'Count to any event' },
]

export default function Landing({ session }) {
  const navigate = useNavigate()

  return (
    <div>
      {/* Top navigation bar */}
      <nav className="landing-nav">
        <span className="brand">Dashboard Creator</span>
        <div className="nav-links">
          {session ? (
            // Already logged in — offer a shortcut to the dashboard
            <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
              Go to Dashboard
            </button>
          ) : (
            <>
              <Link to="/login"><button className="btn btn-secondary">Log In</button></Link>
              <Link to="/signup"><button className="btn btn-primary">Sign Up Free</button></Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero section */}
      <section className="landing-hero">
        <h1>Your personal dashboard,<br /><span>built your way.</span></h1>
        <p>
          Pick from 12 widgets to create a custom start page.
          Your layout saves automatically and syncs across devices.
        </p>
        <div className="cta-buttons">
          {session ? (
            <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
              Open My Dashboard
            </button>
          ) : (
            <>
              <Link to="/signup"><button className="btn btn-primary" style={{ fontSize: '1.05rem', padding: '0.7rem 1.75rem' }}>Get Started — It's Free</button></Link>
              <Link to="/login"><button className="btn btn-secondary" style={{ fontSize: '1.05rem', padding: '0.7rem 1.75rem' }}>Log In</button></Link>
            </>
          )}
        </div>
      </section>

      {/* Widget features grid */}
      <div className="landing-features">
        {features.map(f => (
          <div key={f.name} className="feature-card">
            <div className="icon">{f.icon}</div>
            <h3>{f.name}</h3>
            <p>{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
