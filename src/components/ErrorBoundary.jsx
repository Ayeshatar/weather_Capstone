import { Component } from 'react'

// Catches errors thrown during rendering anywhere below it in the tree
// (React error boundaries only catch render/lifecycle errors, not errors
// inside event handlers or async callbacks — those are already handled
// locally, e.g. in useWeather and AIWeatherAdvisor). Without this, an
// unexpected render error would unmount the whole app to a blank screen.
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error('SkyWatch crashed:', error, info)
  }

  handleReload = () => {
    this.setState({ hasError: false })
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="app-crash" role="alert">
          <h1>Something went wrong</h1>
          <p>SkyWatch hit an unexpected error. Reloading usually fixes it.</p>
          <button type="button" onClick={this.handleReload}>
            Reload SkyWatch
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
