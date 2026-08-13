import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import WeatherIcon from '../WeatherIcon'

describe('WeatherIcon', () => {
  it('renders a decorative, screen-reader-hidden svg for a known group', () => {
    const { container } = render(<WeatherIcon group="rain" isDay={false} size={20} />)
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
    expect(svg).toHaveAttribute('aria-hidden', 'true')
    expect(svg).toHaveAttribute('width', '20')
  })

  it('falls back to a default icon for an unrecognised group', () => {
    const { container } = render(<WeatherIcon group="not-a-real-group" />)
    expect(container.querySelector('svg circle')).toBeInTheDocument()
  })
})
