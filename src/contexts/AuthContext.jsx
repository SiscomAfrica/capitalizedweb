import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react'
import authClient from '../api/authClient'
import { getStorageItem, setStorageItem, removeStorageItem } from '../utils/storage'
import { STORAGE_KEYS, SUCCESS_MESSAGES } from '../utils/constants'
import { getAccessToken, getRefreshToken, clearTokens, setTokens } from '../api/axiosConfig'

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  tokens: {
    accessToken: null,
    refreshToken: null,
  },
}

// Action types
const AUTH_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGOUT: 'LOGOUT',
  UPDATE_USER: 'UPDATE_USER',
  SET_TOKENS: 'SET_TOKENS',
  INITIALIZE_AUTH: 'INITIALIZE_AUTH',
}

// Auth reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      }

    case AUTH_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      }

    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      }

    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        tokens: {
          accessToken: action.payload.accessToken,
          refreshToken: action.payload.refreshToken,
        },
        isAuthenticated: true,
        isLoading: false,
        error: null,
      }

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        tokens: {
          accessToken: null,
          refreshToken: null,
        },
        isAuthenticated: false,
        isLoading: false,
        error: null,
      }

    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: {
          ...state.user,
          ...action.payload,
        },
      }

    case AUTH_ACTIONS.SET_TOKENS:
      return {
        ...state,
        tokens: {
          accessToken: action.payload.accessToken,
          refreshToken: action.payload.refreshToken,
        },
      }

    case AUTH_ACTIONS.INITIALIZE_AUTH:
      return {
        ...state,
        user: action.payload.user,
        tokens: {
          accessToken: action.payload.accessToken,
          refreshToken: action.payload.refreshToken,
        },
        isAuthenticated: action.payload.isAuthenticated,
        isLoading: false,
      }

    default:
      return state
  }
}

// Create context
const AuthContext = createContext(null)

// Token refresh interval (refresh 5 minutes before expiry)
const TOKEN_REFRESH_BUFFER = 5 * 60 * 1000 // 5 minutes in milliseconds

/**
 * AuthProvider component that wraps the app and provides authentication state
 */
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Parse JWT token to get expiry time
  const parseJWT = useCallback((token) => {
    if (!token || typeof token !== 'string') {
      return null
    }
    
    try {
      const parts = token.split('.')
      if (parts.length !== 3) {
        return null
      }
      
      const base64Url = parts[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      )
      return JSON.parse(jsonPayload)
    } catch (error) {
      console.error('Error parsing JWT:', error)
      return null
    }
  }, [])

  // Check if token is expired or will expire soon
  const isTokenExpired = useCallback((token, buffer = TOKEN_REFRESH_BUFFER) => {
    if (!token) return true
    
    const payload = parseJWT(token)
    if (!payload || !payload.exp) return true
    
    const expiryTime = payload.exp * 1000 // Convert to milliseconds
    const currentTime = Date.now()
    
    return currentTime >= (expiryTime - buffer)
  }, [parseJWT])

  // Refresh access token
  const refreshToken = useCallback(async () => {
    const refreshTokenValue = getRefreshToken()
    
    if (!refreshTokenValue) {
      throw new Error('No refresh token available')
    }

    try {
      // Don't use getProfile for refresh as it can cause loops
      // The axios interceptor should handle token refresh automatically
      const newAccessToken = getAccessToken()
      const newRefreshToken = getRefreshToken()
      
      if (newAccessToken && newRefreshToken) {
        dispatch({
          type: AUTH_ACTIONS.SET_TOKENS,
          payload: {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
          },
        })
      }
      
      return newAccessToken
    } catch (error) {
      console.error('Token refresh failed:', error)
      await logout()
      throw error
    }
  }, [])

  // Set up automatic token refresh
  useEffect(() => {
    let refreshInterval

    if (state.isAuthenticated && state.tokens.accessToken) {
      const setupTokenRefresh = () => {
        const token = state.tokens.accessToken
        const payload = parseJWT(token)
        
        if (payload && payload.exp) {
          const expiryTime = payload.exp * 1000
          const currentTime = Date.now()
          const timeUntilRefresh = expiryTime - currentTime - TOKEN_REFRESH_BUFFER
          
          if (timeUntilRefresh > 0) {
            refreshInterval = setTimeout(async () => {
              try {
                await refreshToken()
              } catch (error) {
                console.error('Automatic token refresh failed:', error)
              }
            }, timeUntilRefresh)
          } else {
            // Token is already expired or will expire soon, refresh immediately
            refreshToken().catch((error) => {
              console.error('Immediate token refresh failed:', error)
            })
          }
        }
      }

      setupTokenRefresh()
    }

    return () => {
      if (refreshInterval) {
        clearTimeout(refreshInterval)
      }
    }
  }, [state.isAuthenticated, state.tokens.accessToken, parseJWT, refreshToken])

  // Initialize authentication state on app load
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const accessToken = getAccessToken()
        const refreshTokenValue = getRefreshToken()
        const userData = getStorageItem(STORAGE_KEYS.USER_DATA)

        if (accessToken && refreshTokenValue) {
          // Check if access token is expired
          if (isTokenExpired(accessToken, 0)) {
            // Try to refresh the token
            try {
              await refreshToken()
              const newAccessToken = getAccessToken()
              const newRefreshToken = getRefreshToken()
              
              dispatch({
                type: AUTH_ACTIONS.INITIALIZE_AUTH,
                payload: {
                  user: userData,
                  accessToken: newAccessToken,
                  refreshToken: newRefreshToken,
                  isAuthenticated: true,
                },
              })
            } catch (error) {
              // Refresh failed, clear everything
              clearTokens()
              removeStorageItem(STORAGE_KEYS.USER_DATA)
              
              dispatch({
                type: AUTH_ACTIONS.INITIALIZE_AUTH,
                payload: {
                  user: null,
                  accessToken: null,
                  refreshToken: null,
                  isAuthenticated: false,
                },
              })
            }
          } else {
            // Token is still valid
            dispatch({
              type: AUTH_ACTIONS.INITIALIZE_AUTH,
              payload: {
                user: userData,
                accessToken,
                refreshToken: refreshTokenValue,
                isAuthenticated: true,
              },
            })
          }
        } else {
          // No tokens found
          dispatch({
            type: AUTH_ACTIONS.INITIALIZE_AUTH,
            payload: {
              user: null,
              accessToken: null,
              refreshToken: null,
              isAuthenticated: false,
            },
          })
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        dispatch({
          type: AUTH_ACTIONS.INITIALIZE_AUTH,
          payload: {
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
          },
        })
      }
    }

    initializeAuth()
  }, [isTokenExpired, refreshToken])

  // Login function
  const login = useCallback(async (identifier, password) => {
    dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true })
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR })

    try {
      const response = await authClient.login(identifier, password)
      
      // Store user data
      if (response.user) {
        setStorageItem(STORAGE_KEYS.USER_DATA, response.user)
      }

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: {
          user: response.user,
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
        },
      })

      return {
        success: true,
        message: SUCCESS_MESSAGES.LOGIN,
        user: response.user,
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      }
    } catch (error) {
      dispatch({
        type: AUTH_ACTIONS.SET_ERROR,
        payload: error.message || 'Login failed',
      })
      
      throw error
    }
  }, [])

  // Register function
  const register = useCallback(async (userData) => {
    dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true })
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR })

    try {
      const response = await authClient.register(userData)
      
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false })
      
      return {
        success: true,
        message: SUCCESS_MESSAGES.REGISTRATION,
        data: response,
      }
    } catch (error) {
      dispatch({
        type: AUTH_ACTIONS.SET_ERROR,
        payload: error.message || 'Registration failed',
      })
      
      throw error
    }
  }, [])

  // Verify phone function
  const verifyPhone = useCallback(async (phone, otp) => {
    dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true })
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR })

    try {
      const response = await authClient.verifyPhone(phone, otp)
      
      // If verification returns tokens, user is now authenticated
      if (response.accessToken && response.refreshToken) {
        // Fetch updated user data with the new tokens
        try {
          const userResponse = await authClient.getProfile()
          
          // Store user data
          setStorageItem(STORAGE_KEYS.USER_DATA, userResponse)

          dispatch({
            type: AUTH_ACTIONS.LOGIN_SUCCESS,
            payload: {
              user: userResponse,
              accessToken: response.accessToken,
              refreshToken: response.refreshToken,
            },
          })
        } catch (profileError) {
          console.error('Failed to fetch user profile after phone verification:', profileError)
          // Still update tokens even if profile fetch fails
          dispatch({
            type: AUTH_ACTIONS.SET_TOKENS,
            payload: {
              accessToken: response.accessToken,
              refreshToken: response.refreshToken,
            },
          })
          dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false })
        }
      } else {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false })
      }

      return {
        success: true,
        message: SUCCESS_MESSAGES.PHONE_VERIFIED,
        data: response,
      }
    } catch (error) {
      dispatch({
        type: AUTH_ACTIONS.SET_ERROR,
        payload: error.message || 'Phone verification failed',
      })
      
      throw error
    }
  }, [])

  // Logout function
  const logout = useCallback(async () => {
    dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true })

    try {
      // Call logout on the server (optional, but good practice)
      await authClient.logout()
    } catch (error) {
      // Even if server logout fails, we should clear local state
      console.error('Server logout failed:', error)
    } finally {
      // Clear local storage and state
      clearTokens()
      removeStorageItem(STORAGE_KEYS.USER_DATA)
      
      dispatch({ type: AUTH_ACTIONS.LOGOUT })
      
      // Redirect to login page
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
    }
  }, [])

  // Update user profile
  const updateUser = useCallback((userData) => {
    // Update user data in storage
    const currentUser = getStorageItem(STORAGE_KEYS.USER_DATA)
    const updatedUser = { ...currentUser, ...userData }
    setStorageItem(STORAGE_KEYS.USER_DATA, updatedUser)
    
    // Update state
    dispatch({
      type: AUTH_ACTIONS.UPDATE_USER,
      payload: userData,
    })
  }, [])

  // Clear error
  const clearError = useCallback(() => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR })
  }, [])

  // Context value
  const value = {
    // State
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,
    tokens: state.tokens,
    
    // Actions
    login,
    register,
    verifyPhone,
    logout,
    updateUser,
    refreshToken,
    clearError,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook to use auth context
export const useAuthContext = () => {
  const context = useContext(AuthContext)
  
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  
  return context
}

export default AuthContext