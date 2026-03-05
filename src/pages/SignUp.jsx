// SignUp.jsx — registration form.
// Supabase handles creating the user account for us.
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient.js'

export default function SignUp() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // supabase.auth.signUp creates a new user account.
    const { error } = await supabase.auth.signUp({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    // Some Supabase projects require email confirmation.
    // We show a success message and let the user know to check their email.
    setSuccess(true)
    setLoading(false)

    // Try to go to dashboard immediately (works if email confirmation is disabled).
    setTimeout(() => navigate('/dashboard'), 1500)
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Create account</h1>
        <p>Start building your personal dashboard</p>

        {error && <div className="error-msg">{error}</div>}

        {success ? (
          <div style={{ textAlign: 'center', color: '#38a169', padding: '1rem 0' }}>
            <p>✅ Account created! Check your email if confirmation is required, or heading to your dashboard…</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                placeholder="you@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="At least 6 characters"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>
        )}

        <Link to="/login" className="link">Already have an account? Log in</Link>
      </div>
    </div>
  )
}
