import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function friendlyError(err) {
  return err?.message || 'Something went wrong, please try again'
}

export default function Login() {
  const { login, signup } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo = location.state?.from ?? '/'

  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setSubmitting(true)
    try {
      if (mode === 'signup') {
        await signup(username, email, password)
        setSuccess('Account created! Redirecting…')
      } else {
        await login(email, password)
      }
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setError(friendlyError(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit} noValidate>
        <h1>{mode === 'login' ? 'Log in' : 'Create an account'}</h1>
        <p className="auth-subtitle">
          {mode === 'login'
            ? 'Sign in to save and revisit your favourite cities.'
            : 'Make an account to start saving favourite cities.'}
        </p>

        {mode === 'signup' && (
          <label className="auth-field">
            <span>Username</span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              minLength={2}
              required
            />
          </label>
        )}

        <label className="auth-field">
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </label>

        <label className="auth-field">
          <span>Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            minLength={mode === 'signup' ? 8 : undefined}
            required
            aria-describedby={mode === 'signup' ? 'password-hint' : undefined}
          />
        </label>
        {mode === 'signup' && (
          <p id="password-hint" className="auth-hint">
            At least 8 characters, with a letter and a number.
          </p>
        )}

        {error && (
          <p className="auth-error" role="alert">
            {error}
          </p>
        )}
        {success && (
          <p className="auth-success" role="status">
            {success}
          </p>
        )}

        <button type="submit" className="auth-submit" disabled={submitting}>
          {submitting ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Sign up'}
        </button>

        <button
          type="button"
          className="auth-switch"
          onClick={() => {
            setError(null)
            setSuccess(null)
            setMode((m) => (m === 'login' ? 'signup' : 'login'))
          }}
        >
          {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Log in'}
        </button>
      </form>
    </div>
  )
}
