import { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from './AuthContext'

const FAVORITES_KEY = 'skywatch-favorites'

function sameLocation(a, b) {
  return a.name === b.name && a.lat === b.lat && a.lon === b.lon
}

function favoriteStorageKey(user) {
  return user ? `${FAVORITES_KEY}:${user.email}` : `${FAVORITES_KEY}:guest`
}

function readFavorites(user) {
  if (!user) return []
  try {
    const raw = localStorage.getItem(favoriteStorageKey(user))
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function writeFavorites(user, nextFavorites) {
  if (!user) return
  localStorage.setItem(favoriteStorageKey(user), JSON.stringify(nextFavorites))
}

const FavoritesContext = createContext(null)

export function FavoritesProvider({ children }) {
  const { user } = useAuth()
  const [favorites, setFavorites] = useState([])

  useEffect(() => {
    setFavorites(readFavorites(user))
  }, [user])

  function isFavorite(loc) {
    return favorites.some((f) => sameLocation(f, loc))
  }

  async function addFavorite(loc) {
    if (!user || isFavorite(loc)) return
    const nextFavorites = [...favorites, loc]
    setFavorites(nextFavorites)
    writeFavorites(user, nextFavorites)
  }

  async function removeFavorite(loc) {
    if (!user) return
    const nextFavorites = favorites.filter((f) => !sameLocation(f, loc))
    setFavorites(nextFavorites)
    writeFavorites(user, nextFavorites)
  }

  async function toggleFavorite(loc) {
    if (isFavorite(loc)) {
      await removeFavorite(loc)
    } else {
      await addFavorite(loc)
    }
  }

  return (
    <FavoritesContext.Provider
      value={{ favorites, isFavorite, addFavorite, removeFavorite, toggleFavorite }}
    >
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext)
  if (!ctx) throw new Error('useFavorites must be used inside <FavoritesProvider>')
  return ctx
}
