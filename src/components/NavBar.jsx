import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function NavBar() {
  const { user, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  // Close the mobile menu on route change / resize back to desktop, so it
  // never gets stuck open behind a link click or a viewport change.
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth > 720) setMenuOpen(false)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  function closeMenu() {
    setMenuOpen(false)
  }

  const linkClass = ({ isActive }) => `navbar__link${isActive ? ' is-active' : ''}`

  return (
    <header className="navbar">
      <div className="navbar__inner">
        <NavLink to="/" end className="navbar__brand" onClick={closeMenu}>
          SkyWatch
        </NavLink>

        <button
          type="button"
          className={`navbar__toggle${menuOpen ? ' is-open' : ''}`}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          aria-controls="navbar-menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className="navbar__toggle-bar" />
          <span className="navbar__toggle-bar" />
          <span className="navbar__toggle-bar" />
        </button>

        <nav
          id="navbar-menu"
          className={`navbar__menu${menuOpen ? ' is-open' : ''}`}
          aria-label="Main"
        >
          <NavLink to="/favourites" className={linkClass} onClick={closeMenu}>
            Favourites
          </NavLink>

          {user ? (
            <div className="navbar__user">
              <span className="navbar__username" title={user.email}>
                {user.username || user.email}
              </span>
              <button
                type="button"
                className="navbar__logout"
                onClick={() => {
                  logout()
                  closeMenu()
                }}
              >
                Log out
              </button>
            </div>
          ) : (
            <NavLink to="/login" className={linkClass} onClick={closeMenu}>
              Log in
            </NavLink>
          )}
        </nav>
      </div>

      {menuOpen && <button type="button" className="navbar__scrim" aria-hidden="true" onClick={closeMenu} tabIndex={-1} />}
    </header>
  )
}
