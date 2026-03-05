// App.jsx — sets up routing and listens for auth state changes.
// React Router v6 handles navigating between pages without a full page reload.
import React, { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './supabaseClient.js'
import Landing from './pages/Landing.jsx'
import SignUp from './pages/SignUp.jsx'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'

// ProtectedRoute wraps any page that requires the user to be logged in.
// If there's no session, it sends them back to the landing page.
function ProtectedRoute({ session, children }) {
  if (!session) return <Navigate to="/" replace />
  return children
}

export default function App() {
  // session holds the current user's login info, or null if not logged in.
  const [session, setSession] = useState(undefined) // undefined = loading

  useEffect(() => {
    // Get the existing session when the app first loads.
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    // Listen for login/logout events and update session state accordingly.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    // Clean up the listener when the component unmounts.
    return () => subscription.unsubscribe()
  }, [])

  // Show nothing while we're figuring out if the user is logged in.
  if (session === undefined) return null

  return (
    <BrowserRouter>
      <Routes>
        {/* Public pages — anyone can visit these */}
        <Route path="/" element={<Landing session={session} />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />

        {/* Protected page — only logged-in users can access the dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute session={session}>
              <Dashboard session={session} />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}
