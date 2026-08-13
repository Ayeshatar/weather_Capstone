import { createContext, useContext, useEffect, useState } from 'react'

const USERS_KEY = 'skywatch-users'
const SESSION_KEY = 'skywatch-session'
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function readUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) ?? '{}')
  } catch {
    return {}
  }
}

function writeUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

function normalizeEmail(email) {
  return String(email ?? '').trim().toLowerCase()
}

function normalizeUsername(username) {
  return String(username ?? '').trim()
}

// Passwords are never stored in plaintext. This hashes with SHA-256 + a
// random per-user salt via the browser's Web Crypto API. This is still a
// client-only demo store (see README limitations) — a real deployment
// needs a server-side auth store (e.g. bcrypt/argon2 behind an API), not
// localStorage — but it removes the plaintext-password issue for this
// project's scope.
async function hashPassword(password, salt) {
  const encoder = new TextEncoder()
  const data = encoder.encode(`${salt}:${password}`)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function randomSalt() {
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function usernameTaken(users, username) {
  const target = username.toLowerCase()
  return Object.values(users).some((u) => (u.username ?? '').toLowerCase() === target)
}

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [authReady, setAuthReady] = useState(false)

  useEffect(() => {
    try {
      const savedUser = JSON.parse(localStorage.getItem(SESSION_KEY) ?? 'null')
      setUser(savedUser)
    } catch {
      setUser(null)
    } finally {
      setAuthReady(true)
    }
  }, [])

  function persistSession(nextUser) {
    if (nextUser) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(nextUser))
    } else {
      localStorage.removeItem(SESSION_KEY)
    }
  }

  async function signup(username, email, password) {
    const normalizedUsername = normalizeUsername(username)
    const normalizedEmail = normalizeEmail(email)

    if (!normalizedUsername) {
      throw new Error('Username is required.')
    }
    if (!normalizedEmail || !EMAIL_RE.test(normalizedEmail)) {
      throw new Error('Please enter a valid email address.')
    }
    if (!password || password.length < 8) {
      throw new Error('Password must be at least 8 characters.')
    }
    if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
      throw new Error('Password must include at least one letter and one number.')
    }

    const users = readUsers()
    if (users[normalizedEmail]) {
      throw new Error('An account with this email already exists.')
    }
    if (usernameTaken(users, normalizedUsername)) {
      throw new Error('That username is already taken.')
    }

    const salt = randomSalt()
    const passwordHash = await hashPassword(password, salt)
    users[normalizedEmail] = { username: normalizedUsername, email: normalizedEmail, salt, passwordHash }
    writeUsers(users)

    const nextUser = { username: normalizedUsername, email: normalizedEmail }
    setUser(nextUser)
    persistSession(nextUser)
  }

  async function login(email, password) {
    const normalizedEmail = normalizeEmail(email)
    if (!normalizedEmail || !password) {
      throw new Error('Email and password are required.')
    }

    const users = readUsers()
    const userRecord = users[normalizedEmail]

    if (!userRecord) {
      throw new Error("No account found for that email — try signing up instead.")
    }

    const candidateHash = await hashPassword(password, userRecord.salt)
    if (candidateHash !== userRecord.passwordHash) {
      throw new Error('Incorrect email or password.')
    }

    const nextUser = { username: userRecord.username, email: normalizedEmail }
    setUser(nextUser)
    persistSession(nextUser)
  }

  async function logout() {
    setUser(null)
    persistSession(null)
  }

  return (
    <AuthContext.Provider value={{ user, authReady, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
