import axios from 'axios'
import type { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios'

export const API_BASE_URL = window.location.hostname === 'localhost'
  ? '/api/v1'
  : 'https://siscom.africa/api/v1'

export const STORAGE_KEYS = {
  ACCESS_TOKEN: '@capitalized_access_token',
  REFRESH_TOKEN: '@capitalized_refresh_token',
  USER_DATA: '@capitalized_user_data',
}

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      console.log('🔍 Checking for access token...')
      
      const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
      
      console.log('🔍 Token retrieval result:', token ? 'FOUND' : 'NOT FOUND')
      
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`
        console.log('✅ Token found and added to request')
        console.log('🔑 Token preview:', `${token.substring(0, 20)}...`)
      } else if (!token) {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        console.log('⚠️ NO TOKEN FOUND IN STORAGE!')
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        console.log('🔍 Storage key checked:', STORAGE_KEYS.ACCESS_TOKEN)
        console.log('⚠️ This request will be UNAUTHENTICATED')
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      }
      
      // Debug logging
      console.log('🚀 API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        baseURL: config.baseURL,
        fullURL: `${config.baseURL}${config.url}`,
        hasToken: !!token,
        tokenPreview: token ? `${token.substring(0, 20)}...` : 'none',
        authHeader: config.headers?.Authorization ? 'Present' : 'Missing',
      })
      
      return config
    } catch (error) {
      console.error('❌ Error in request interceptor:', error)
      return config
    }
  },
  (error: AxiosError) => {
    console.error('❌ Request Error:', error)
    return Promise.reject(error)
  }
)

apiClient.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', {
      status: response.status,
      url: response.config.url,
      data: response.data,
    })
    return response
  },
  async (error: AxiosError) => {
    console.error('❌ API Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      data: error.response?.data,
      message: error.message,
    })
    
    if (error.response?.status === 401) {
      console.log('🚫 Unauthorized (401) - clearing tokens and redirecting to login')
      await handleTokenExpiration()
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login'
      }
    }
    return Promise.reject(error)
  }
)

const handleTokenExpiration = async () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
    localStorage.removeItem(STORAGE_KEYS.USER_DATA)
  } catch (error) {
    console.error('Error handling token expiration:', error)
  }
}

export const tokenManager = {
  getAccessToken: (): string | null => {
    try {
      const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
      console.log('🔑 getAccessToken:', token ? 'Token exists' : 'No token')
      return token
    } catch (error) {
      console.error('❌ Error getting access token:', error)
      return null
    }
  },

  getRefreshToken: (): string | null => {
    try {
      const token = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)
      console.log('🔑 getRefreshToken:', token ? 'Token exists' : 'No token')
      return token
    } catch (error) {
      console.error('❌ Error getting refresh token:', error)
      return null
    }
  },

  setTokens: (accessToken: string, refreshToken: string): void => {
    try {
      console.log('💾 Setting tokens...')
      console.log('🔑 Access token length:', accessToken?.length)
      console.log('🔑 Refresh token length:', refreshToken?.length)
      console.log('🔑 Storage key:', STORAGE_KEYS.ACCESS_TOKEN)
      
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken)
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken)
      
      // Verify tokens were stored
      const storedAccessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
      const storedRefreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)
      
      console.log('✅ Tokens stored successfully')
      console.log('✅ Access token verified:', !!storedAccessToken)
      console.log('✅ Refresh token verified:', !!storedRefreshToken)
    } catch (error) {
      console.error('❌ Error setting tokens:', error)
      throw error
    }
  },

  clearAll: (): void => {
    try {
      console.log('🗑️ Clearing all tokens and user data...')
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
      localStorage.removeItem(STORAGE_KEYS.USER_DATA)
      console.log('✅ All tokens cleared')
    } catch (error) {
      console.error('❌ Error clearing tokens:', error)
    }
  },

  verifyToken: (): boolean => {
    try {
      const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
      const exists = !!token
      console.log('🔍 verifyToken:', exists ? 'Token exists' : 'No token')
      return exists
    } catch (error) {
      console.error('❌ Error verifying token:', error)
      return false
    }
  },
}

export default apiClient
