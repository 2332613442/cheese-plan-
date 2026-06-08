import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8 text-center">
          <span className="text-6xl mb-4">🧀</span>
          <h2 className="text-xl font-bold text-gray-800 mb-2">页面出错了</h2>
          <p className="text-gray-500 text-sm mb-6">
            {this.state.error?.message || '发生了未知错误'}
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null })
              window.location.reload()
            }}
            className="px-6 py-2 bg-cheese text-gray-800 rounded-full font-medium hover:bg-cheese-dark transition"
          >
            刷新重试
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
