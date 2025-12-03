import React from 'react'
import { RouterProvider } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ErrorBoundary from './components/common/ErrorBoundary'
import { NetworkStatusBanner } from './components/common/NetworkErrorHandler'
import { router } from './router'
import './styles/globals.css'
import './styles/animations.css'

function App() {
  return (
    <ErrorBoundary>
      <NetworkStatusBanner />
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
