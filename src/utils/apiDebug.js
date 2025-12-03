/**
 * API Debugging Utilities
 * Helps troubleshoot API connection and CORS issues
 */

import { API_ENDPOINTS } from './constants'

/**
 * Test API endpoint connectivity
 * @param {string} endpoint - API endpoint to test
 * @returns {Promise<Object>} Test result
 */
export const testEndpoint = async (endpoint) => {
  const startTime = Date.now()
  
  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      mode: 'cors', // Explicitly set CORS mode
    })
    
    const endTime = Date.now()
    const duration = endTime - startTime
    
    return {
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      duration,
      headers: Object.fromEntries(response.headers.entries()),
      url: response.url,
      redirected: response.redirected,
    }
  } catch (error) {
    const endTime = Date.now()
    const duration = endTime - startTime
    
    return {
      success: false,
      error: error.message,
      duration,
      type: error.name,
    }
  }
}

/**
 * Test all configured API endpoints
 * @returns {Promise<Object>} Test results for all endpoints
 */
export const testAllEndpoints = async () => {
  const results = {}
  
  // Test health endpoints for each service
  const endpoints = {
    auth: `${API_ENDPOINTS.AUTH}/health`,
    subscription: `${API_ENDPOINTS.SUBSCRIPTION}/health`,
    investment: `${API_ENDPOINTS.INVESTMENT}/health`,
  }
  
  for (const [service, endpoint] of Object.entries(endpoints)) {
    console.log(`Testing ${service} endpoint: ${endpoint}`)
    results[service] = await testEndpoint(endpoint)
  }
  
  return results
}

/**
 * Log API configuration for debugging
 */
export const logApiConfig = () => {
  console.group('🔧 API Configuration')
  console.log('Auth Service:', API_ENDPOINTS.AUTH)
  console.log('Subscription Service:', API_ENDPOINTS.SUBSCRIPTION)
  console.log('Investment Service:', API_ENDPOINTS.INVESTMENT)
  console.log('Environment Variables:')
  console.log('  VITE_AUTH_SERVICE_URL:', import.meta.env.VITE_AUTH_SERVICE_URL)
  console.log('  VITE_SUBSCRIPTION_SERVICE_URL:', import.meta.env.VITE_SUBSCRIPTION_SERVICE_URL)
  console.log('  VITE_INVESTMENT_SERVICE_URL:', import.meta.env.VITE_INVESTMENT_SERVICE_URL)
  console.groupEnd()
}

/**
 * Check for common CORS issues
 * @param {string} url - URL to check
 * @returns {Object} CORS check results
 */
export const checkCorsIssues = (url) => {
  const issues = []
  const suggestions = []
  
  // Check for trailing slash issues
  if (url.endsWith('/')) {
    issues.push('URL ends with trailing slash')
    suggestions.push('Try removing the trailing slash')
  }
  
  // Check for double slashes
  if (url.includes('//') && !url.startsWith('http')) {
    issues.push('URL contains double slashes')
    suggestions.push('Check for path concatenation issues')
  }
  
  // Check protocol
  if (!url.startsWith('https://') && !url.startsWith('http://')) {
    issues.push('URL missing protocol')
    suggestions.push('Ensure URL starts with https:// or http://')
  }
  
  // Check for localhost in production
  if (url.includes('localhost') && window.location.hostname !== 'localhost') {
    issues.push('Using localhost URL in production')
    suggestions.push('Update API endpoints for production environment')
  }
  
  return {
    url,
    issues,
    suggestions,
    hasIssues: issues.length > 0,
  }
}

/**
 * Debug API request
 * @param {string} method - HTTP method
 * @param {string} url - Request URL
 * @param {Object} options - Request options
 */
export const debugApiRequest = (method, url, options = {}) => {
  console.group(`🌐 API Request: ${method} ${url}`)
  console.log('URL:', url)
  console.log('Method:', method)
  console.log('Headers:', options.headers || {})
  console.log('Body:', options.body || 'No body')
  console.log('Timestamp:', new Date().toISOString())
  
  // Check for potential issues
  const corsCheck = checkCorsIssues(url)
  if (corsCheck.hasIssues) {
    console.warn('⚠️ Potential CORS Issues:')
    corsCheck.issues.forEach(issue => console.warn(`  - ${issue}`))
    console.log('💡 Suggestions:')
    corsCheck.suggestions.forEach(suggestion => console.log(`  - ${suggestion}`))
  }
  
  console.groupEnd()
}

/**
 * Run comprehensive API diagnostics
 */
export const runApiDiagnostics = async () => {
  console.group('🔍 API Diagnostics')
  
  // Log configuration
  logApiConfig()
  
  // Test endpoints
  console.log('\n📡 Testing API Endpoints...')
  const results = await testAllEndpoints()
  
  console.table(results)
  
  // Check for issues
  const hasIssues = Object.values(results).some(result => !result.success)
  
  if (hasIssues) {
    console.warn('⚠️ Issues detected:')
    Object.entries(results).forEach(([service, result]) => {
      if (!result.success) {
        console.warn(`  ${service}: ${result.error || `HTTP ${result.status}`}`)
      }
    })
  } else {
    console.log('✅ All endpoints are accessible')
  }
  
  console.groupEnd()
  
  return results
}

// Auto-run diagnostics in development mode
if (import.meta.env.VITE_DEV_MODE === 'true') {
  // Run diagnostics after a short delay to avoid blocking app startup
  setTimeout(() => {
    runApiDiagnostics()
  }, 2000)
}