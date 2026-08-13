import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import ProtectedRoute from '../ProtectedRoute'
import { AuthProvider } from '../../context/AuthContext'

function renderProtected(initialPath = '/favourites') {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path="/login" element={<p>Login screen</p>} />
          <Route
            path="/favourites"
            element={
              <ProtectedRoute>
                <p>Secret favourites</p>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  )
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('redirects to /login when no user is signed in', async () => {
    renderProtected()
    expect(await screen.findByText('Login screen')).toBeInTheDocument()
  })

  it('renders the protected content once a session exists', async () => {
    localStorage.setItem('skywatch-session', JSON.stringify({ email: 'demo@example.com' }))
    renderProtected()
    expect(await screen.findByText('Secret favourites')).toBeInTheDocument()
  })
})
