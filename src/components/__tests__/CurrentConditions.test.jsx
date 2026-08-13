import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import CurrentConditions from '../CurrentConditions'

const current = {
  temperature_2m: 21,
  apparent_temperature: 19,
  relative_humidity_2m: 55,
  wind_speed_10m: 12,
  is_day: 1,
}

const location = { name: 'Lahore', country: 'Pakistan' }

describe('CurrentConditions', () => {
  it('renders location name, temperature, and readouts', () => {
    render(
      <CurrentConditions
        location={location}
        current={current}
        group="clear"
        label="Clear sky"
        unit="C"
        onToggleUnit={vi.fn()}
        onToggleFavorite={vi.fn()}
      />,
    )

    expect(screen.getByRole('heading', { name: 'Lahore' })).toBeInTheDocument()
    expect(screen.getByText('Pakistan')).toBeInTheDocument()
    expect(screen.getByText('Clear sky')).toBeInTheDocument()
    expect(screen.getByText('21°')).toBeInTheDocument()
  })

  it('calls onToggleUnit when the unit button is activated', async () => {
    const user = userEvent.setup()
    const onToggleUnit = vi.fn()
    render(
      <CurrentConditions
        location={location}
        current={current}
        group="clear"
        label="Clear sky"
        unit="C"
        onToggleUnit={onToggleUnit}
        onToggleFavorite={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('button', { name: /switch to degrees fahrenheit/i }))
    expect(onToggleUnit).toHaveBeenCalledTimes(1)
  })

  it('exposes an accessible label and pressed state for the favourite toggle', () => {
    render(
      <CurrentConditions
        location={location}
        current={current}
        group="clear"
        label="Clear sky"
        unit="C"
        onToggleUnit={vi.fn()}
        onToggleFavorite={vi.fn()}
        canFavorite
        isFavorite
      />,
    )

    const favoriteBtn = screen.getByRole('button', { name: /remove from favourites/i })
    expect(favoriteBtn).toHaveAttribute('aria-pressed', 'true')
  })
})
