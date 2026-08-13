import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import NavBar from '../NavBar'
import { AuthProvider } from '../../context/AuthContext'

function renderNav() {
  return render(
    <AuthProvider>
      <MemoryRouter>
        <NavBar />
      </MemoryRouter>
    </AuthProvider>,
  )
}

describe('NavBar', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('shows a Log in link when no one is signed in', async () => {
    renderNav()
    expect(await screen.findByRole('link', { name: /log in/i })).toBeInTheDocument()
  })

  it('shows the signed-in email and a logout button when a session exists', async () => {
    localStorage.setItem('skywatch-session', JSON.stringify({ email: 'demo@example.com' }))
    renderNav()
    expect(await screen.findByText('demo@example.com')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /log out/i })).toBeInTheDocument()
  })
})
