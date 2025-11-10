import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary поймал ошибку:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{padding: '50px', textAlign: 'center'}}>
          <h1 style={{color: 'red'}}>Произошла ошибка!</h1>
          <p>{this.state.error?.toString()}</p>
          <button 
            onClick={() => {
              this.setState({ hasError: false, error: null })
              window.location.reload()
            }}
            style={{padding: '10px 20px', marginTop: '20px'}}
          >
            Перезагрузить страницу
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary

