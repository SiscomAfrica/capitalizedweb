import axios from 'axios'
import { getStorageItem, setStorageItem, removeStorageItem } from '../utils/storage'
import { STORAGE_KEYS, ERROR_MESSAGES } from '../utils/constants'

/**
 * Get stored access token
 * @returns {string|null} Access token or null
 */
export const getAccessToken = () => {
  return getStorageItem(STORAGE_KEYS.ACCESS_TOKEN)
}

/**
 * Get stored refresh token
 * @returns {string|null} Refresh token or null
 */
export const getRefreshToken = () => {
  return getStorageItem(STORAGE_KEYS.REFRESH_TOKEN)
}

/**
 * Store authentication tokens
 * @param {string} accessToken - JWT access token
 * @param {string} refreshToken - JWT refresh token
 */
export const setTokens = (accessToken, refreshToken) => {
  setStorageItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken)
  setStorageItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken)
}

/**
 * Clear stored authentication tokens
 */
export const clearTokens = () => {
  removeStorageItem(STORAGE_KEYS.ACCESS_TOKEN)
  removeStorageItem(STORAGE_KEYS.REFRESH_TOKEN)
  removeStorageItem(STORAGE_KEYS.USER_DATA)
}

/**
 * Check if user is authenticated
 * @returns {boolean} Authentication status
 */
export const isAuthenticated = () => {
  const accessToken = getAccessToken()
  return !!accessToken
}

// Create base Axios instance
const axiosInstance = axios.create({
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: false, // Don't send cookies for CORS
  maxRedirects: 5, // Allow some redirects
})

// Track if we're currently refreshing token to avoid multiple refresh attempts
let isRefreshing = false
let failedQueue = []

/**
 * Process failed request queue after token refresh
 * @param {Error|null} error - Error if refresh failed
 * @param {string|null} token - New access token if refresh succeeded
 */
const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error)
    } else {
      resolve(token)
    }
  })
  
  failedQueue = []
}

/**
 * Refresh access token using refresh token
 * @returns {Promise<string>} New access token
 */
const refreshAccessToken = async () => {
  const refreshToken = getRefreshToken()
  
  if (!refreshToken) {
    throw new Error('No refresh token available')
  }

  try {
    // Create a new axios instance for token refresh to avoid interceptor loops
    const refreshInstance = axios.create({
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const response = await refreshInstance.post(`${import.meta.env.VITE_AUTH_SERVICE_URL}/refresh`, {
      refresh_token: refreshToken,
    })

    const { access_token, refresh_token: newRefreshToken } = response.data
    
    // Store new tokens
    setTokens(access_token, newRefreshToken || refreshToken)
    
    return access_token
  } catch (error) {
    // If refresh fails, clear tokens and redirect to login
    clearTokens()
    
    // Redirect to login page
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
    
    throw error
  }
}

// Request interceptor to add Bearer token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getAccessToken()
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling and token refresh
axiosInstance.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config

    // Handle network errors
    if (!error.response) {
      // Check if it's a timeout error
      if (error.code === 'ECONNABORTED') {
        return Promise.reject({
          message: 'Request timeout. Please try again.',
          type: 'network',
          code: 'TIMEOUT',
          originalError: error,
        })
      }
      
      // Check if it's a network error
      if (error.message === 'Network Error' || !navigator.onLine) {
        return Promise.reject({
          message: ERROR_MESSAGES.NETWORK,
          type: 'network',
          code: 'NETWORK_ERROR',
          originalError: error,
        })
      }
      
      // Generic network error
      return Promise.reject({
        message: ERROR_MESSAGES.NETWORK,
        type: 'network',
        code: 'CONNECTION_ERROR',
        originalError: error,
      })
    }

    const { status } = error.response

    // Handle 401 errors (token expired/invalid)
    if (status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return axiosInstance(originalRequest)
        }).catch((err) => {
          return Promise.reject(err)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const newToken = await refreshAccessToken()
        processQueue(null, newToken)
        
        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return axiosInstance(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        
        // Clear tokens and redirect to login
        clearTokens()
        
        // Redirect to login page
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }
        
        return Promise.reject({
          message: ERROR_MESSAGES.UNAUTHORIZED,
          type: 'unauthorized',
          status: 401,
          originalError: error,
        })
      } finally {
        isRefreshing = false
      }
    }

    // Handle other HTTP errors
    let errorMessage = ERROR_MESSAGES.SERVER_ERROR
    let errorType = 'server'

    switch (status) {
      case 400:
        errorMessage = error.response.data?.message || ERROR_MESSAGES.VALIDATION
        errorType = 'validation'
        break
      case 403:
        errorMessage = ERROR_MESSAGES.FORBIDDEN
        errorType = 'forbidden'
        // For 403 errors, also clear tokens as the user may not have valid permissions
        if (typeof window !== 'undefined') {
          clearTokens()
        }
        break
      case 404:
        errorMessage = ERROR_MESSAGES.NOT_FOUND
        errorType = 'not_found'
        break
      case 422:
        errorMessage = error.response.data?.message || ERROR_MESSAGES.VALIDATION
        errorType = 'validation'
        break
      case 500:
      case 502:
      case 503:
      case 504:
        // Sanitize server error messages to avoid exposing technical details
        errorMessage = ERROR_MESSAGES.SERVER_ERROR
        errorType = 'server'
        break
      default:
        errorMessage = error.response.data?.message || ERROR_MESSAGES.SERVER_ERROR
        errorType = 'unknown'
    }

    return Promise.reject({
      message: errorMessage,
      type: errorType,
      status,
      data: error.response.data,
      originalError: error,
    })
  }
)

export default axiosInstance