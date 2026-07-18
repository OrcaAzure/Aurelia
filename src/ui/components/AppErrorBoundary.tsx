import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Aurelia render error:', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-ink px-6 text-center text-parchment">
          <h1 className="font-display text-2xl text-amber-light">Something went wrong</h1>
          <p className="mt-3 max-w-md text-sm text-parchment/65">
            The game hit an unexpected error. Try refreshing the page. If it keeps happening,
            use Settings → Reset all progress or clear site data for this URL.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-6 rounded-lg border border-amber bg-amber/15 px-6 py-2 font-display text-xs uppercase tracking-widest text-amber-light"
          >
            Reload
          </button>
        </main>
      )
    }

    return this.props.children
  }
}
