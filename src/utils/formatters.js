// Formatting utilities for currency, dates, numbers, and percentages
import { format, formatDistanceToNow, parseISO, isValid } from 'date-fns'

/**
 * Format currency values with proper symbols and locale
 * @param {number} amount - The amount to format
 * @param {string} currency - Currency code (KES, USD, etc.)
 * @param {string} locale - Locale for formatting (default: 'en-KE')
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = 'KES', locale = 'en-KE') => {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return currency === 'KES' ? 'KSh 0.00' : '$0.00'
  }

  try {
    // Use Intl.NumberFormat for proper currency formatting
    const formatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })

    return formatter.format(amount)
  } catch {
    // Fallback formatting if Intl.NumberFormat fails
    const formattedAmount = amount.toLocaleString(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })

    switch (currency) {
      case 'KES':
        return `KSh ${formattedAmount}`
      case 'USD':
        return `$${formattedAmount}`
      default:
        return `${currency} ${formattedAmount}`
    }
  }
}

/**
 * Format large numbers with K, M, B suffixes
 * @param {number} num - The number to format
 * @param {number} decimals - Number of decimal places (default: 1)
 * @returns {string} Formatted number string
 */
export const formatLargeNumber = (num, decimals = 1) => {
  if (typeof num !== 'number' || isNaN(num)) {
    return '0'
  }

  if (num === 0) return '0'

  const k = 1000
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['', 'K', 'M', 'B', 'T']

  const i = Math.floor(Math.log(Math.abs(num)) / Math.log(k))

  if (i === 0) {
    return num.toString()
  }

  return parseFloat((num / Math.pow(k, i)).toFixed(dm)) + sizes[i]
}

/**
 * Format percentage values
 * @param {number} value - The decimal value (0.15 for 15%)
 * @param {number} decimals - Number of decimal places (default: 2)
 * @param {boolean} showSign - Whether to show + for positive values (default: false)
 * @returns {string} Formatted percentage string
 */
export const formatPercentage = (value, decimals = 2, showSign = false) => {
  if (typeof value !== 'number' || isNaN(value)) {
    return '0%'
  }

  const percentage = value * 100
  const formattedValue = percentage.toFixed(decimals)
  const sign = showSign && percentage > 0 ? '+' : ''

  return `${sign}${formattedValue}%`
}

/**
 * Format decimal numbers with specified precision
 * @param {number} num - The number to format
 * @param {number} decimals - Number of decimal places (default: 2)
 * @param {string} locale - Locale for formatting (default: 'en-US')
 * @returns {string} Formatted number string
 */
export const formatDecimal = (num, decimals = 2, locale = 'en-US') => {
  if (typeof num !== 'number' || isNaN(num)) {
    return '0'
  }

  return num.toLocaleString(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

/**
 * Format date strings in various formats
 * @param {string|Date} date - The date to format
 * @param {string} formatString - Format pattern (default: 'MMM dd, yyyy')
 * @returns {string} Formatted date string
 */
export const formatDate = (date, formatString = 'MMM dd, yyyy') => {
  if (!date) return ''

  try {
    let dateObj = date
    
    // Convert string to Date object if needed
    if (typeof date === 'string') {
      dateObj = parseISO(date)
    }

    // Check if date is valid
    if (!isValid(dateObj)) {
      return 'Invalid date'
    }

    return format(dateObj, formatString)
  } catch (error) {
    console.warn('Error formatting date:', error)
    return 'Invalid date'
  }
}

/**
 * Format date as relative time (e.g., "2 days ago", "in 3 hours")
 * @param {string|Date} date - The date to format
 * @param {object} options - Options for formatting
 * @returns {string} Relative time string
 */
export const formatRelativeTime = (date, options = {}) => {
  if (!date) return ''

  try {
    let dateObj = date
    
    // Convert string to Date object if needed
    if (typeof date === 'string') {
      dateObj = parseISO(date)
    }

    // Check if date is valid
    if (!isValid(dateObj)) {
      return 'Invalid date'
    }

    return formatDistanceToNow(dateObj, {
      addSuffix: true,
      ...options,
    })
  } catch (error) {
    console.warn('Error formatting relative time:', error)
    return 'Invalid date'
  }
}

/**
 * Format date for display in different contexts
 */
export const formatDateDisplay = {
  /**
   * Short date format (Jan 15, 2024)
   */
  short: (date) => formatDate(date, 'MMM dd, yyyy'),

  /**
   * Long date format (January 15, 2024)
   */
  long: (date) => formatDate(date, 'MMMM dd, yyyy'),

  /**
   * Date with time (Jan 15, 2024 at 2:30 PM)
   */
  withTime: (date) => formatDate(date, 'MMM dd, yyyy \'at\' h:mm a'),

  /**
   * Time only (2:30 PM)
   */
  timeOnly: (date) => formatDate(date, 'h:mm a'),

  /**
   * ISO date (2024-01-15)
   */
  iso: (date) => formatDate(date, 'yyyy-MM-dd'),

  /**
   * Relative time (2 days ago)
   */
  relative: (date) => formatRelativeTime(date),
}

/**
 * Format phone numbers for display
 * @param {string} phone - The phone number to format
 * @param {string} format - Format type ('international', 'national', 'display')
 * @param {string} countryCode - Country code (default: '254' for Kenya)
 * @returns {string} Formatted phone number
 */
export const formatPhoneNumber = (phone, format = 'display', countryCode = '254') => {
  if (!phone || typeof phone !== 'string') {
    return ''
  }

  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '')

  // Handle different formats
  switch (format) {
    case 'international':
      // Add + prefix and country code if not present
      if (digits.startsWith(countryCode)) {
        return `+${digits}`
      } else if (digits.startsWith('0')) {
        // Remove leading 0 and add country code
        return `+${countryCode}${digits.slice(1)}`
      } else if (digits.length === 9) {
        // 9 digits without country code or leading 0
        return `+${countryCode}${digits}`
      }
      return `+${countryCode}${digits.slice(-9)}`
    
    case 'national':
      // Format as national number (0712345678)
      if (digits.startsWith(countryCode)) {
        return `0${digits.slice(countryCode.length)}`
      }
      return digits.startsWith('0') ? digits : `0${digits}`
    
    case 'api':
      // Format for API calls - E.164 format with +
      if (digits.startsWith(countryCode)) {
        return `+${digits}`
      } else if (digits.startsWith('0')) {
        return `+${countryCode}${digits.slice(1)}`
      } else if (digits.length === 9) {
        return `+${countryCode}${digits}`
      }
      return `+${countryCode}${digits.slice(-9)}`
    
    case 'display':
    default: {
      // Format for display with spaces (0712 345 678)
      let displayNumber = digits
      if (displayNumber.startsWith(countryCode)) {
        displayNumber = `0${displayNumber.slice(countryCode.length)}`
      } else if (!displayNumber.startsWith('0')) {
        displayNumber = `0${displayNumber}`
      }
      
      // Add spaces for readability
      if (displayNumber.length === 10) {
        return `${displayNumber.slice(0, 4)} ${displayNumber.slice(4, 7)} ${displayNumber.slice(7)}`
      }
      return displayNumber
    }
  }
}

/**
 * Format file sizes in human readable format
 * @param {number} bytes - File size in bytes
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes, decimals = 2) => {
  if (typeof bytes !== 'number' || bytes === 0) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

/**
 * Format investment duration
 * @param {number} months - Duration in months
 * @returns {string} Formatted duration string
 */
export const formatDuration = (months) => {
  if (typeof months !== 'number' || months <= 0) {
    return '0 months'
  }

  if (months < 12) {
    return `${months} month${months === 1 ? '' : 's'}`
  }

  const years = Math.floor(months / 12)
  const remainingMonths = months % 12

  if (remainingMonths === 0) {
    return `${years} year${years === 1 ? '' : 's'}`
  }

  return `${years} year${years === 1 ? '' : 's'} ${remainingMonths} month${remainingMonths === 1 ? '' : 's'}`
}

/**
 * Format status badges with appropriate styling classes
 * @param {string} status - The status value
 * @param {string} type - The type of status (kyc, inquiry, investment, etc.)
 * @returns {object} Object with formatted text and CSS classes
 */
export const formatStatus = (status, type = 'general') => {
  if (!status) {
    return { text: 'Unknown', className: 'bg-gray-100 text-gray-800' }
  }

  const statusLower = status.toLowerCase()

  // Define status configurations
  const statusConfig = {
    kyc: {
      not_submitted: { text: 'Not Submitted', className: 'bg-gray-100 text-gray-800' },
      pending: { text: 'Pending Review', className: 'bg-yellow-100 text-yellow-800' },
      approved: { text: 'Approved', className: 'bg-green-100 text-green-800' },
      rejected: { text: 'Rejected', className: 'bg-red-100 text-red-800' },
    },
    inquiry: {
      pending: { text: 'Pending Payment', className: 'bg-yellow-100 text-yellow-800' },
      paid: { text: 'Paid', className: 'bg-green-100 text-green-800' },
      cancelled: { text: 'Cancelled', className: 'bg-red-100 text-red-800' },
    },
    investment: {
      active: { text: 'Active', className: 'bg-blue-100 text-blue-800' },
      matured: { text: 'Matured', className: 'bg-green-100 text-green-800' },
      withdrawn: { text: 'Withdrawn', className: 'bg-gray-100 text-gray-800' },
    },
    withdrawal: {
      pending: { text: 'Pending', className: 'bg-yellow-100 text-yellow-800' },
      processing: { text: 'Processing', className: 'bg-blue-100 text-blue-800' },
      completed: { text: 'Completed', className: 'bg-green-100 text-green-800' },
      rejected: { text: 'Rejected', className: 'bg-red-100 text-red-800' },
    },
    subscription: {
      active: { text: 'Active', className: 'bg-green-100 text-green-800' },
      cancelled: { text: 'Cancelled', className: 'bg-red-100 text-red-800' },
      expired: { text: 'Expired', className: 'bg-gray-100 text-gray-800' },
      trial: { text: 'Trial', className: 'bg-blue-100 text-blue-800' },
    },
  }

  const typeConfig = statusConfig[type] || {}
  const config = typeConfig[statusLower]

  if (config) {
    return config
  }

  // Fallback for unknown statuses
  return {
    text: status.charAt(0).toUpperCase() + status.slice(1),
    className: 'bg-gray-100 text-gray-800',
  }
}