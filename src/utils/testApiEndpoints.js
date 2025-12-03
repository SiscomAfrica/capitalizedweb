/**
 * Simple API endpoint testing utility
 * Use this to verify that API endpoints are working correctly
 */

import { API_ENDPOINTS } from './constants'
import authClient from '../api/authClient'

/**
 * Test a single endpoint
 * @param {string} url - URL to test
 * @param {string} name - Endpoint name for logging
 */
const testEndpoint = async (url, name) => {
  try {
    console.log(`Testing ${name}: ${url}`)
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      mode: 'cors',
    })
    
    console.log(`✅ ${name}: ${response.status} ${response.statusText}`)
    
    if (response.redirected) {
      console.warn(`⚠️ ${name}: Redirected from ${url} to ${response.url}`)
    }
    
    return {
      success: response.ok,
      status: response.status,
      redirected: response.redirected,
      finalUrl: response.url,
    }
  } catch (error) {
    console.error(`❌ ${name}: ${error.message}`)
    return {
      success: false,
      error: error.message,
    }
  }
}

/**
 * Test all API endpoints
 */
export const testAllEndpoints = async () => {
  console.group('🔍 Testing API Endpoints')
  
  const results = {}
  
  // Test health endpoints (these should be publicly accessible)
  const endpoints = [
    { url: `${API_ENDPOINTS.AUTH}/health/`, name: 'Auth Health' },
    { url: `${API_ENDPOINTS.INVESTMENT}/health/`, name: 'Investment Health' },
    { url: `${API_ENDPOINTS.SUBSCRIPTION}/health/`, name: 'Subscription Health' },
  ]
  
  for (const endpoint of endpoints) {
    results[endpoint.name] = await testEndpoint(endpoint.url, endpoint.name)
  }
  
  console.groupEnd()
  
  // Summary
  const successful = Object.values(results).filter(r => r.success).length
  const total = Object.keys(results).length
  
  console.log(`📊 Results: ${successful}/${total} endpoints accessible`)
  
  if (successful < total) {
    console.warn('⚠️ Some endpoints are not accessible. Check server configuration.')
  }
  
  return results
}

/**
 * Test specific endpoint with detailed logging
 * @param {string} url - URL to test
 */
export const debugEndpoint = async (url) => {
  console.group(`🔍 Debug Endpoint: ${url}`)
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      mode: 'cors',
    })
    
    console.log('Status:', response.status, response.statusText)
    console.log('Headers:', Object.fromEntries(response.headers.entries()))
    console.log('Redirected:', response.redirected)
    console.log('Final URL:', response.url)
    console.log('Type:', response.type)
    
    if (response.ok) {
      try {
        const data = await response.json()
        console.log('Response Data:', data)
      } catch (e) {
        console.log('Response is not JSON')
      }
    }
    
  } catch (error) {
    console.error('Error:', error)
    console.log('Error Type:', error.name)
    console.log('Error Message:', error.message)
  }
  
  console.groupEnd()
}

/**
 * Test the auth client URL construction
 */
export const testAuthClientUrl = () => {
  console.group('🔍 Testing Auth Client URL Construction')
  
  // Test environment variables
  console.log('Environment variables:')
  console.log('  VITE_AUTH_SERVICE_URL:', import.meta.env.VITE_AUTH_SERVICE_URL)
  console.log('  VITE_DEV_MODE:', import.meta.env.VITE_DEV_MODE)
  console.log('  All env vars:', import.meta.env)
  
  console.log('API_ENDPOINTS.AUTH:', API_ENDPOINTS.AUTH)
  console.log('authClient.baseURL:', authClient.baseURL)
  
  // Test URL construction logic from getProfile method
  const baseUrl = authClient.baseURL.endsWith('/') ? authClient.baseURL.slice(0, -1) : authClient.baseURL
  const constructedUrl = `${baseUrl}/me/`
  
  console.log('Constructed URL for /me endpoint:', constructedUrl)
  console.log('Expected URL: https://siscom.africa/api/v1/auth/me/')
  console.log('URLs match:', constructedUrl === 'https://siscom.africa/api/v1/auth/me/')
  
  // Test the new method in getProfile
  const authServiceUrl = import.meta.env.VITE_AUTH_SERVICE_URL || 'https://siscom.africa/api/v1/auth'
  const newBaseUrl = authServiceUrl.endsWith('/') ? authServiceUrl.slice(0, -1) : authServiceUrl
  const newConstructedUrl = `${newBaseUrl}/me/`
  console.log('New method - Auth Service URL:', authServiceUrl)
  console.log('New method - Constructed URL:', newConstructedUrl)
  
  console.groupEnd()
}

/**
 * Test auth client getProfile method (will fail without token but shows URL)
 */
export const testAuthGetProfile = async () => {
  console.group('🔍 Testing Auth Client getProfile')
  
  try {
    await authClient.getProfile()
  } catch (error) {
    console.log('Expected error (no token):', error)
    
    // Check if the error contains URL information
    if (error.originalError && error.originalError.config) {
      console.log('Actual request URL:', error.originalError.config.url)
      console.log('Request method:', error.originalError.config.method)
      console.log('Request headers:', error.originalError.config.headers)
      console.log('Full config:', error.originalError.config)
    }
    
    // Also check the response if available
    if (error.originalError && error.originalError.response) {
      console.log('Response status:', error.originalError.response.status)
      console.log('Response URL:', error.originalError.response.url)
      console.log('Response headers:', error.originalError.response.headers)
    }
  }
  
  console.groupEnd()
}

/**
 * Test direct fetch to the me endpoint
 */
export const testDirectFetch = async () => {
  console.group('🔍 Testing Direct Fetch to /me endpoint')
  
  const testUrl = 'https://siscom.africa/api/v1/auth/me/'
  console.log('Testing URL:', testUrl)
  
  try {
    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      mode: 'cors',
    })
    
    console.log('Response status:', response.status)
    console.log('Response URL:', response.url)
    console.log('Response redirected:', response.redirected)
    console.log('Response headers:', Object.fromEntries(response.headers.entries()))
    
  } catch (error) {
    console.error('Fetch error:', error)
  }
  
  console.groupEnd()
}

/**
 * Test direct fetch to products endpoint (which works)
 */
export const testProductsFetch = async () => {
  console.group('🔍 Testing Direct Fetch to /products endpoint')
  
  const testUrl = 'https://siscom.africa/api/v1/investments/products'
  console.log('Testing URL:', testUrl)
  
  try {
    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      mode: 'cors',
    })
    
    console.log('Response status:', response.status)
    console.log('Response URL:', response.url)
    console.log('Response redirected:', response.redirected)
    console.log('Response headers:', Object.fromEntries(response.headers.entries()))
    
    if (response.ok) {
      try {
        const data = await response.json()
        console.log('Response data preview:', {
          type: typeof data,
          isArray: Array.isArray(data),
          length: data?.length || Object.keys(data || {}).length,
          firstItem: Array.isArray(data) ? data[0] : data
        })
      } catch (e) {
        console.log('Could not parse JSON response')
      }
    }
    
  } catch (error) {
    console.error('Fetch error:', error)
  }
  
  console.groupEnd()
}

/**
 * Compare both endpoints side by side
 */
export const compareEndpoints = async () => {
  console.group('🔍 Comparing Auth vs Investment Endpoints')
  
  const endpoints = [
    { name: 'Auth /me', url: 'https://siscom.africa/api/v1/auth/me/' },
    { name: 'Investment /products', url: 'https://siscom.africa/api/v1/investments/products' },
    { name: 'Auth health', url: 'https://siscom.africa/auth/health' },
    { name: 'Investment health', url: 'https://siscom.africa/investment/health' }
  ]
  
  for (const endpoint of endpoints) {
    console.log(`\n--- Testing ${endpoint.name} ---`)
    try {
      const response = await fetch(endpoint.url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        mode: 'cors',
      })
      
      console.log(`✅ ${endpoint.name}: ${response.status} ${response.statusText}`)
      console.log(`   URL: ${response.url}`)
      console.log(`   Redirected: ${response.redirected}`)
      
      if (response.redirected) {
        console.warn(`   ⚠️ Redirected from ${endpoint.url} to ${response.url}`)
      }
      
    } catch (error) {
      console.error(`❌ ${endpoint.name}: ${error.message}`)
    }
  }
  
  console.groupEnd()
}

// Auto-run tests in development
if (import.meta.env.VITE_DEV_MODE === 'true') {
  // Run tests after app loads
  setTimeout(() => {
    testAllEndpoints()
    testAuthClientUrl()
    testAuthGetProfile()
    testDirectFetch()
    testProductsFetch()
    compareEndpoints()
  }, 3000)
}