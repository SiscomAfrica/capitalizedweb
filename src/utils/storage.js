// Local storage utilities with error handling and secure token storage
import { STORAGE_KEYS } from './constants.js'

// Simple encryption/decryption for sensitive data (tokens)
// Note: This is basic obfuscation, not cryptographically secure
// For production, consider using a proper encryption library
const ENCRYPTION_KEY = 'africa_web_client_key_2024'

/**
 * Simple XOR encryption for basic token obfuscation
 * @param {string} text - Text to encrypt/decrypt
 * @param {string} key - Encryption key
 * @returns {string} Encrypted/decrypted text
 */
const simpleEncrypt = (text, key = ENCRYPTION_KEY) => {
  let result = ''
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length))
  }
  return btoa(result) // Base64 encode
}

/**
 * Simple XOR decryption for basic token obfuscation
 * @param {string} encryptedText - Encrypted text to decrypt
 * @param {string} key - Encryption key
 * @returns {string} Decrypted text
 */
const simpleDecrypt = (encryptedText, key = ENCRYPTION_KEY) => {
  try {
    const text = atob(encryptedText) // Base64 decode
    let result = ''
    for (let i = 0; i < text.length; i++) {
      result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length))
    }
    return result
  } catch (error) {
    console.warn('Error decrypting data:', error)
    return null
  }
}

/**
 * Safely get an item from localStorage
 * @param {string} key - The storage key
 * @param {any} defaultValue - Default value if key doesn't exist
 * @returns {any} The stored value or default value
 */
export const getStorageItem = (key, defaultValue = null) => {
  try {
    if (typeof window === 'undefined') return defaultValue
    
    const item = localStorage.getItem(key)
    if (item === null) return defaultValue
    
    // Handle JWT tokens (they are stored as plain strings)
    if (key === 'africa_access_token' || key === 'africa_refresh_token') {
      return item; // Return as plain string
    }
    
    // Try to parse as JSON, fallback to plain string
    try {
      return JSON.parse(item)
    } catch (parseError) {
      // If JSON parsing fails, return as plain string
      return item
    }
  } catch (error) {
    console.warn(`Error reading from localStorage key "${key}":`, error)
    return defaultValue
  }
}

/**
 * Safely set an item in localStorage
 * @param {string} key - The storage key
 * @param {any} value - The value to store
 * @returns {boolean} Success status
 */
export const setStorageItem = (key, value) => {
  try {
    if (typeof window === 'undefined') return false
    
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch (error) {
    console.warn(`Error writing to localStorage key "${key}":`, error)
    return false
  }
}

/**
 * Safely remove an item from localStorage
 * @param {string} key - The storage key
 * @returns {boolean} Success status
 */
export const removeStorageItem = (key) => {
  try {
    if (typeof window === 'undefined') return false
    
    localStorage.removeItem(key)
    return true
  } catch (error) {
    console.warn(`Error removing from localStorage key "${key}":`, error)
    return false
  }
}

/**
 * Clear all items from localStorage
 * @returns {boolean} Success status
 */
export const clearStorage = () => {
  try {
    if (typeof window === 'undefined') return false
    
    localStorage.clear()
    return true
  } catch (error) {
    console.warn('Error clearing localStorage:', error)
    return false
  }
}

/**
 * Check if localStorage is available
 * @returns {boolean} Availability status
 */
export const isStorageAvailable = () => {
  try {
    if (typeof window === 'undefined') return false
    
    const testKey = '__storage_test__'
    localStorage.setItem(testKey, 'test')
    localStorage.removeItem(testKey)
    return true
  } catch (error) {
    return false
  }
}

/**
 * Get storage usage information
 * @returns {object} Storage usage stats
 */
export const getStorageInfo = () => {
  if (!isStorageAvailable()) {
    return { available: false, used: 0, remaining: 0 }
  }

  try {
    let used = 0
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        used += localStorage[key].length + key.length
      }
    }

    // Estimate total storage (usually 5-10MB, we'll use 5MB as conservative estimate)
    const total = 5 * 1024 * 1024 // 5MB in bytes
    const remaining = total - used

    return {
      available: true,
      used,
      remaining,
      total,
      usedPercentage: (used / total) * 100,
    }
  } catch (error) {
    console.warn('Error getting storage info:', error)
    return { available: true, used: 0, remaining: 0, total: 0, usedPercentage: 0 }
  }
}

/**
 * Secure token storage utilities with encryption
 */
export const tokenStorage = {
  /**
   * Store access token securely
   * @param {string} token - Access token to store
   * @returns {boolean} Success status
   */
  setAccessToken: (token) => {
    if (!token) return false
    const encryptedToken = simpleEncrypt(token)
    return setStorageItem(STORAGE_KEYS.ACCESS_TOKEN, encryptedToken)
  },

  /**
   * Get access token securely
   * @returns {string|null} Decrypted access token or null
   */
  getAccessToken: () => {
    const encryptedToken = getStorageItem(STORAGE_KEYS.ACCESS_TOKEN)
    if (!encryptedToken) return null
    return simpleDecrypt(encryptedToken)
  },

  /**
   * Store refresh token securely
   * @param {string} token - Refresh token to store
   * @returns {boolean} Success status
   */
  setRefreshToken: (token) => {
    if (!token) return false
    const encryptedToken = simpleEncrypt(token)
    return setStorageItem(STORAGE_KEYS.REFRESH_TOKEN, encryptedToken)
  },

  /**
   * Get refresh token securely
   * @returns {string|null} Decrypted refresh token or null
   */
  getRefreshToken: () => {
    const encryptedToken = getStorageItem(STORAGE_KEYS.REFRESH_TOKEN)
    if (!encryptedToken) return null
    return simpleDecrypt(encryptedToken)
  },

  /**
   * Store both tokens at once
   * @param {object} tokens - Object with accessToken and refreshToken
   * @returns {boolean} Success status
   */
  setTokens: (tokens) => {
    if (!tokens || !tokens.accessToken || !tokens.refreshToken) {
      return false
    }
    
    const accessSuccess = tokenStorage.setAccessToken(tokens.accessToken)
    const refreshSuccess = tokenStorage.setRefreshToken(tokens.refreshToken)
    
    return accessSuccess && refreshSuccess
  },

  /**
   * Get both tokens at once
   * @returns {object|null} Object with accessToken and refreshToken or null
   */
  getTokens: () => {
    const accessToken = tokenStorage.getAccessToken()
    const refreshToken = tokenStorage.getRefreshToken()
    
    if (!accessToken || !refreshToken) {
      return null
    }
    
    return { accessToken, refreshToken }
  },

  /**
   * Clear all tokens
   * @returns {boolean} Success status
   */
  clearTokens: () => {
    const accessSuccess = removeStorageItem(STORAGE_KEYS.ACCESS_TOKEN)
    const refreshSuccess = removeStorageItem(STORAGE_KEYS.REFRESH_TOKEN)
    
    return accessSuccess && refreshSuccess
  },

  /**
   * Check if tokens exist
   * @returns {boolean} True if both tokens exist
   */
  hasTokens: () => {
    const accessToken = tokenStorage.getAccessToken()
    const refreshToken = tokenStorage.getRefreshToken()
    
    return !!(accessToken && refreshToken)
  },
}

/**
 * User data storage utilities
 */
export const userStorage = {
  /**
   * Store user data
   * @param {object} userData - User data to store
   * @returns {boolean} Success status
   */
  setUser: (userData) => {
    return setStorageItem(STORAGE_KEYS.USER_DATA, userData)
  },

  /**
   * Get user data
   * @returns {object|null} User data or null
   */
  getUser: () => {
    return getStorageItem(STORAGE_KEYS.USER_DATA)
  },

  /**
   * Update specific user fields
   * @param {object} updates - Fields to update
   * @returns {boolean} Success status
   */
  updateUser: (updates) => {
    const currentUser = userStorage.getUser()
    if (!currentUser) return false
    
    const updatedUser = { ...currentUser, ...updates }
    return userStorage.setUser(updatedUser)
  },

  /**
   * Clear user data
   * @returns {boolean} Success status
   */
  clearUser: () => {
    return removeStorageItem(STORAGE_KEYS.USER_DATA)
  },

  /**
   * Check if user data exists
   * @returns {boolean} True if user data exists
   */
  hasUser: () => {
    const userData = userStorage.getUser()
    return !!(userData && userData.id)
  },
}

/**
 * App preferences storage utilities
 */
export const preferencesStorage = {
  /**
   * Set theme preference
   * @param {string} theme - Theme name ('light', 'dark', 'system')
   * @returns {boolean} Success status
   */
  setTheme: (theme) => {
    return setStorageItem(STORAGE_KEYS.THEME, theme)
  },

  /**
   * Get theme preference
   * @returns {string} Theme name or 'light' as default
   */
  getTheme: () => {
    return getStorageItem(STORAGE_KEYS.THEME, 'light')
  },

  /**
   * Set language preference
   * @param {string} language - Language code ('en', 'sw', etc.)
   * @returns {boolean} Success status
   */
  setLanguage: (language) => {
    return setStorageItem(STORAGE_KEYS.LANGUAGE, language)
  },

  /**
   * Get language preference
   * @returns {string} Language code or 'en' as default
   */
  getLanguage: () => {
    return getStorageItem(STORAGE_KEYS.LANGUAGE, 'en')
  },
}

/**
 * Session storage utilities (similar to localStorage but for session only)
 */
export const sessionStorage = {
  get: (key, defaultValue = null) => {
    try {
      if (typeof window === 'undefined') return defaultValue
      
      const item = window.sessionStorage.getItem(key)
      if (item === null) return defaultValue
      
      return JSON.parse(item)
    } catch (error) {
      console.warn(`Error reading from sessionStorage key "${key}":`, error)
      return defaultValue
    }
  },

  set: (key, value) => {
    try {
      if (typeof window === 'undefined') return false
      
      window.sessionStorage.setItem(key, JSON.stringify(value))
      return true
    } catch (error) {
      console.warn(`Error writing to sessionStorage key "${key}":`, error)
      return false
    }
  },

  remove: (key) => {
    try {
      if (typeof window === 'undefined') return false
      
      window.sessionStorage.removeItem(key)
      return true
    } catch (error) {
      console.warn(`Error removing from sessionStorage key "${key}":`, error)
      return false
    }
  },

  clear: () => {
    try {
      if (typeof window === 'undefined') return false
      
      window.sessionStorage.clear()
      return true
    } catch (error) {
      console.warn('Error clearing sessionStorage:', error)
      return false
    }
  },
}

/**
 * Clear all application data (tokens, user data, preferences)
 * @returns {boolean} Success status
 */
export const clearAllAppData = () => {
  const tokenSuccess = tokenStorage.clearTokens()
  const userSuccess = userStorage.clearUser()
  
  // Clear other app-specific data but keep preferences
  const otherKeys = Object.values(STORAGE_KEYS).filter(key => 
    key !== STORAGE_KEYS.THEME && key !== STORAGE_KEYS.LANGUAGE
  )
  
  let otherSuccess = true
  otherKeys.forEach(key => {
    if (!removeStorageItem(key)) {
      otherSuccess = false
    }
  })
  
  return tokenSuccess && userSuccess && otherSuccess
}