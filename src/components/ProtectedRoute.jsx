import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Redirect to /login and remember where the visitor was headed,
// so Login can send them back after a successful sign-in.
//
// `authReady` guards against a false redirect on first load while the
// stored local session is being restored from localStorage.
export default function ProtectedRoute({ children }) {
  const { user, authReady } = useAuth()
  const location = useLocation()

  if (!authReady) return null
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  return children
}
