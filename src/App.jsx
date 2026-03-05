// App.jsx — sets up routing and listens for auth state changes.
// React Router v6 handles navigating between pages without a full page reload.
import React, { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './supabaseClient.js'
import Landing from './pages/Landing.jsx'
import SignUp from './pages/SignUp.jsx'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import DashboardView from './pages/DashboardView.jsx'
import AdminPage from './pages/AdminPage.jsx'

// ProtectedRoute wraps any page that requires the user to be logged in.
// If there's no session, it sends them back to the landing page.
function ProtectedRoute({ session, children }) {
  if (!session) return <Navigate to="/" replace />
  return children
}

// AdminRoute additionally checks that the logged-in user has the admin role.
// Shows nothing while the role is still loading, then redirects non-admins.
function AdminRoute({ session, role, children }) {
  if (!session) return <Navigate to="/" replace />
  if (role === null) return null // still fetching role — wait silently
  if (role !== 'admin') return <Navigate to="/dashboard" replace />
  return children
}

export default function App() {
  // session holds the current user's login info, or null if not logged in.
  const [session, setSession] = useState(undefined) // undefined = loading
  // role is fetched from the profiles table once a session exists.
  const [role, setRole] = useState(null)

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

  // Fetch the user's role from the profiles table whenever the session changes.
  useEffect(() => {
    if (!session) { setRole(null); return }
    supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()
      .then(({ data }) => setRole(data?.role ?? 'user'))
  }, [session])

  // Show nothing while we're figuring out if the user is logged in.
  if (session === undefined) return null

  return (
    <BrowserRouter>
      <Routes>
        {/* Public pages — anyone can visit these */}
        <Route path="/" element={<Landing session={session} />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />

        {/* Protected pages — only logged-in users can access these */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute session={session}>
              <Dashboard session={session} role={role} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/view"
          element={
            <ProtectedRoute session={session}>
              <DashboardView session={session} />
            </ProtectedRoute>
          }
        />
        {/* Admin-only route — non-admins are redirected to /dashboard */}
        <Route
          path="/admin"
          element={
            <AdminRoute session={session} role={role}>
              <AdminPage session={session} />
            </AdminRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}
