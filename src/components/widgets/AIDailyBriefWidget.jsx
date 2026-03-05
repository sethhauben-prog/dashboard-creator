// AIDailyBriefWidget.jsx — asks Claude for a personalized daily brief.
// Calls the existing /api/claude serverless function.
import React, { useState, useEffect } from 'react'

export default function AIDailyBriefWidget() {
  const [brief, setBrief] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Auto-generate on first load.
  useEffect(() => { generateBrief() }, [])

  async function generateBrief() {
    setLoading(true)
    setError(null)
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

    try {
      const res = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{
            role: 'user',
            content: `Today is ${today}. Give me a short, upbeat daily brief in 3 sentences max. Include: one motivational thought, and one practical productivity tip for today. Be warm and encouraging.`,
          }],
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setBrief(data.reply)
    } catch (err) {
      setError('Could not load your brief.')
    }
    setLoading(false)
  }

  return (
    <div className="ai-brief-widget">
      <div className="ai-brief-date">
        {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
      </div>

      {loading && (
        <div className="ai-brief-loading">
          <span /><span /><span />
        </div>
      )}

      {!loading && brief && (
        <p className="ai-brief-text">{brief}</p>
      )}

      {!loading && error && (
        <p style={{ color: '#e53e3e', fontSize: '0.85rem' }}>{error}</p>
      )}

      <button
        className="btn btn-secondary btn-sm"
        onClick={generateBrief}
        disabled={loading}
        style={{ marginTop: '0.75rem' }}
      >
        {loading ? 'Generating…' : '↺ Refresh Brief'}
      </button>
    </div>
  )
}
