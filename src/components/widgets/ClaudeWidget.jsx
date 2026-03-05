// ClaudeWidget.jsx — a chat widget powered by the Claude API.
// Conversation history is kept in local state so follow-up questions work.
// The API key never touches the frontend — all requests go through /api/claude.
import React, { useState, useRef, useEffect } from 'react'

// Cap conversation history to keep requests lean.
const MAX_MESSAGES = 20

export default function ClaudeWidget() {
  const [messages, setMessages] = useState([])   // { role: 'user'|'assistant', content: string }
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const bottomRef = useRef(null)

  // Auto-scroll to the latest message whenever messages change.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function sendMessage() {
    const text = input.trim()
    if (!text || loading) return

    // Add the user's message to history immediately for responsiveness.
    const updatedMessages = [
      ...messages,
      { role: 'user', content: text },
    ].slice(-MAX_MESSAGES) // keep only the most recent messages

    setMessages(updatedMessages)
    setInput('')
    setLoading(true)
    setError(null)

    try {
      // POST the full conversation to our serverless function.
      const res = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedMessages }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong.')
      }

      // Append Claude's reply to the conversation.
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
    } catch (err) {
      setError(err.message)
    }

    setLoading(false)
  }

  function handleKey(e) {
    // Send on Enter, allow Shift+Enter for newlines.
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="claude-widget">
      {/* Message history */}
      <div className="claude-messages">
        {messages.length === 0 && (
          <p className="claude-placeholder">Ask me anything…</p>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`claude-bubble claude-bubble--${msg.role}`}>
            {msg.content}
          </div>
        ))}
        {/* Loading dots while waiting for Claude's reply */}
        {loading && (
          <div className="claude-bubble claude-bubble--assistant claude-loading">
            <span /><span /><span />
          </div>
        )}
        {error && (
          <p className="claude-error">{error}</p>
        )}
        {/* Invisible anchor to scroll to */}
        <div ref={bottomRef} />
      </div>

      {/* Input row */}
      <div className="claude-input-row">
        <textarea
          className="claude-input"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Type a question… (Enter to send)"
          rows={1}
          disabled={loading}
        />
        <button
          className="btn btn-primary btn-sm"
          onClick={sendMessage}
          disabled={loading || !input.trim()}
        >
          Send
        </button>
      </div>
    </div>
  )
}
