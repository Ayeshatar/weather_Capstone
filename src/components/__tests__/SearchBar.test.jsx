import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import SearchBar from '../SearchBar'

const place = { id: 1, name: 'Multan', admin1: 'Punjab', country: 'Pakistan' }

describe('SearchBar', () => {
  it('debounces typing and shows search results', async () => {
    const user = userEvent.setup()
    const onSearch = vi.fn().mockResolvedValue([place])

    render(<SearchBar onSearch={onSearch} onSelect={vi.fn()} onUseLocation={vi.fn()} />)

    await user.type(screen.getByLabelText(/search for a location/i), 'Mul')

    await waitFor(() => expect(onSearch).toHaveBeenCalledWith('Mul'), { timeout: 2000 })
    expect(await screen.findByText('Multan')).toBeInTheDocument()
  })

  it('calls onSelect and clears the input when a result is chosen', async () => {
    const user = userEvent.setup()
    const onSearch = vi.fn().mockResolvedValue([place])
    const onSelect = vi.fn()

    render(<SearchBar onSearch={onSearch} onSelect={onSelect} onUseLocation={vi.fn()} />)

    const input = screen.getByLabelText(/search for a location/i)
    await user.type(input, 'Mul')

    const option = await screen.findByText('Multan')
    await user.click(option)

    expect(onSelect).toHaveBeenCalledWith(place)
    expect(input).toHaveValue('')
  })

  it('calls onUseLocation when the locate button is activated', async () => {
    const user = userEvent.setup()
    const onUseLocation = vi.fn()

    render(<SearchBar onSearch={vi.fn().mockResolvedValue([])} onSelect={vi.fn()} onUseLocation={onUseLocation} />)

    await user.click(screen.getByRole('button', { name: /use my current location/i }))
    expect(onUseLocation).toHaveBeenCalledTimes(1)
  })
})
