import React, { useState } from 'react'
import { AxiosError } from 'axios'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login, isAuthenticated, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const redirectTo = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname || '/'

  if (!loading && isAuthenticated) {
    return <Navigate to={redirectTo} replace />
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setErrorMessage('')

    try {
      await login(username, password)
      navigate(redirectTo, { replace: true })
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: string }>
      setErrorMessage(axiosError.response?.data?.error || 'Login failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Sign In</h2>
        <p>Authorized Senfrost personnel only.</p>

        <form onSubmit={handleSubmit} className="form auth-form">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />

          {errorMessage && <div className="form-error">{errorMessage}</div>}

          <button type="submit" disabled={submitting}>
            {submitting ? 'Signing In...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  )
}
