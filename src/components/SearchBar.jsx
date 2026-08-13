import { useEffect, useRef, useState } from 'react'

export default function SearchBar({ onSearch, onSelect, onUseLocation }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [open, setOpen] = useState(false)
  const debounceRef = useRef(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (query.trim().length < 2) {
      setResults([])
      return
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const found = await onSearch(query)
        setResults(found)
        setOpen(true)
      } catch {
        setResults([])
      }
    }, 350)
    return () => clearTimeout(debounceRef.current)
  }, [query, onSearch])

  function handleSelect(place) {
    setOpen(false)
    setQuery('')
    setResults([])
    onSelect(place)
  }

  return (
    <div className="search-bar">
      <div className="search-input-row">
        <input
          type="text"
          value={query}
          placeholder="Search a city or place…"
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          aria-label="Search for a location"
        />
        <button
          type="button"
          className="locate-btn"
          onClick={onUseLocation}
          title="Use my location"
          aria-label="Use my current location"
        >
          <span aria-hidden="true">⌖</span>
        </button>
      </div>
      {open && results.length > 0 && (
        <ul className="search-results">
          {results.map((place) => (
            <li key={place.id}>
              <button type="button" onClick={() => handleSelect(place)}>
                <span className="place-name">{place.name}</span>
                <span className="place-context">
                  {[place.admin1, place.country].filter(Boolean).join(', ')}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
