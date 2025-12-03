import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { AuthProvider } from '../contexts/AuthContext'
import useAuth from './useAuth'

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

const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>

describe('useAuth', () => {
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

  it('provides authentication state and methods', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })

    // Check that all expected properties are available
    expect(result.current).toHaveProperty('user')
    expect(result.current).toHaveProperty('isAuthenticated')
    expect(result.current).toHaveProperty('isLoading')
    expect(result.current).toHaveProperty('error')
    expect(result.current).toHaveProperty('login')
    expect(result.current).toHaveProperty('register')
    expect(result.current).toHaveProperty('verifyPhone')
    expect(result.current).toHaveProperty('logout')
    expect(result.current).toHaveProperty('clearError')
  })

  it('provides user helper methods', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })

    expect(result.current).toHaveProperty('getUserName')
    expect(result.current).toHaveProperty('getUserInitials')
    expect(result.current).toHaveProperty('isKYCApproved')
    expect(result.current).toHaveProperty('isKYCPending')
    expect(result.current).toHaveProperty('isKYCRejected')
    expect(result.current).toHaveProperty('isPhoneVerified')
  })

  it('provides permission helper methods', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })

    expect(result.current).toHaveProperty('canAccessProtectedRoutes')
    expect(result.current).toHaveProperty('canMakeInvestments')
  })

  it('provides token helper methods', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })

    expect(result.current).toHaveProperty('hasValidTokens')
    expect(result.current).toHaveProperty('getAccessToken')
    expect(result.current).toHaveProperty('getRefreshToken')
    expect(result.current).toHaveProperty('refreshToken')
  })

  it('returns empty string for user name when no user', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })

    expect(result.current.getUserName()).toBe('')
  })

  it('returns empty string for user initials when no user', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })

    expect(result.current.getUserInitials()).toBe('')
  })

  it('throws error when used outside AuthProvider', () => {
    expect(() => {
      renderHook(() => useAuth())
    }).toThrow('useAuthContext must be used within an AuthProvider')
  })
})