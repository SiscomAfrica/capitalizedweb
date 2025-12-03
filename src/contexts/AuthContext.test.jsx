import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act, waitFor } from '@testing-library/react'
import { AuthProvider, useAuthContext } from './AuthContext'
import authClient from '../api/authClient'

// Mock the auth client
vi.mock('../api/authClient', () => ({
  default: {
    login: vi.fn(),
    register: vi.fn(),
    verifyPhone: vi.fn(),
    logout: vi.fn(),
    getProfile: vi.fn(),
  },
}))

// Mock axios config
vi.mock('../api/axiosConfig', () => ({
  getAccessToken: vi.fn(() => null),
  getRefreshToken: vi.fn(() => null),
  clearTokens: vi.fn(),
  setTokens: vi.fn(),
}))

// Mock storage utilities
vi.mock('../utils/storage', () => ({
  getStorageItem: vi.fn(() => null),
  setStorageItem: vi.fn(),
  removeStorageItem: vi.fn(),
}))

// Test component that uses the auth context
const TestComponent = () => {
  const { user, isAuthenticated, isLoading, login, logout } = useAuthContext()
  
  return (
    <div>
      <div data-testid="loading">{isLoading ? 'loading' : 'not-loading'}</div>
      <div data-testid="authenticated">{isAuthenticated ? 'authenticated' : 'not-authenticated'}</div>
      <div data-testid="user">{user ? user.email : 'no-user'}</div>
      <button onClick={() => login('test@example.com', 'password')}>Login</button>
      <button onClick={() => logout()}>Logout</button>
    </div>
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock localStorage to return null for all keys
    global.localStorage = {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    }
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('provides initial authentication state', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    // Initially should be loading
    expect(screen.getByTestId('loading')).toHaveTextContent('loading')
    
    // Wait for initialization to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading')
    })
    
    // Should not be authenticated initially
    expect(screen.getByTestId('authenticated')).toHaveTextContent('not-authenticated')
    expect(screen.getByTestId('user')).toHaveTextContent('no-user')
  })

  it('handles successful login', async () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
    }

    authClient.login.mockResolvedValue({
      user: mockUser,
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    // Wait for initialization
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading')
    })

    // Perform login
    await act(async () => {
      screen.getByText('Login').click()
    })

    // Should be authenticated after login
    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('authenticated')
    })
    
    expect(screen.getByTestId('user')).toHaveTextContent('test@example.com')
  })

  it('handles logout', async () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
    }

    authClient.login.mockResolvedValue({
      user: mockUser,
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
    })

    authClient.logout.mockResolvedValue({ success: true })

    // Mock window.location.href
    delete window.location
    window.location = { href: '' }

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    // Wait for initialization
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading')
    })

    // Login first
    await act(async () => {
      screen.getByText('Login').click()
    })

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('authenticated')
    })

    // Now logout
    await act(async () => {
      screen.getByText('Logout').click()
    })

    // Should not be authenticated after logout
    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('not-authenticated')
    })
    
    expect(screen.getByTestId('user')).toHaveTextContent('no-user')
  })

  it('throws error when used outside provider', () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    expect(() => {
      render(<TestComponent />)
    }).toThrow('useAuthContext must be used within an AuthProvider')
    
    consoleSpy.mockRestore()
  })
})