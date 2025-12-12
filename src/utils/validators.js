// Validation utilities for forms and user input
import { VALIDATION_RULES } from './constants.js'

/**
 * Validate email address format
 * @param {string} email - Email address to validate
 * @returns {object} Validation result with isValid and message
 */
export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return {
      isValid: false,
      message: 'Email is required',
    }
  }

  const trimmedEmail = email.trim()
  
  if (trimmedEmail.length === 0) {
    return {
      isValid: false,
      message: 'Email is required',
    }
  }

  if (!VALIDATION_RULES.EMAIL.PATTERN.test(trimmedEmail)) {
    return {
      isValid: false,
      message: VALIDATION_RULES.EMAIL.MESSAGE,
    }
  }

  // Additional checks for common email issues
  if (trimmedEmail.length > 254) {
    return {
      isValid: false,
      message: 'Email address is too long',
    }
  }

  // Check for consecutive dots
  if (trimmedEmail.includes('..')) {
    return {
      isValid: false,
      message: 'Email address cannot contain consecutive dots',
    }
  }

  return {
    isValid: true,
    message: '',
  }
}

/**
 * Validate phone number (International format with country code)
 * @param {string} phone - Phone number to validate (should include country code)
 * @returns {object} Validation result with isValid and message
 */
export const validatePhoneNumber = (phone) => {
  if (!phone || typeof phone !== 'string') {
    return {
      isValid: false,
      message: 'Phone number is required',
    }
  }

  const trimmedPhone = phone.trim()
  
  if (trimmedPhone.length === 0) {
    return {
      isValid: false,
      message: 'Phone number is required',
    }
  }

  // Check if it starts with + (international format)
  if (!trimmedPhone.startsWith('+')) {
    return {
      isValid: false,
      message: 'Phone number should include country code (e.g., +254712345678)',
    }
  }

  // Remove + and any non-digit characters for validation
  const digits = trimmedPhone.substring(1).replace(/\D/g, '')

  // Basic international phone number validation
  if (digits.length < 7 || digits.length > 15) {
    return {
      isValid: false,
      message: 'Phone number should be between 7 and 15 digits',
    }
  }

  // Enhanced validation for specific countries
  // Kenya (+254)
  if (digits.startsWith('254')) {
    const kenyanPart = digits.substring(3) // Remove 254
    
    if (kenyanPart.length !== 9) {
      return {
        isValid: false,
        message: 'Kenyan phone numbers should be 9 digits after +254',
      }
    }
    
    // Kenyan numbers should start with 7 or 1 (not 0)
    if (!/^[71]\d{8}$/.test(kenyanPart)) {
      return {
        isValid: false,
        message: 'Kenyan numbers should start with 7 or 1 (e.g., +254712345678)',
      }
    }
  }
  
  // Uganda (+256)
  else if (digits.startsWith('256')) {
    const ugandanPart = digits.substring(3);
    if (ugandanPart.length !== 9 || !/^[37]\d{8}$/.test(ugandanPart)) {
      return {
        isValid: false,
        message: 'Ugandan numbers should start with 3 or 7 and be 9 digits',
      }
    }
  }
  
  // Tanzania (+255)
  else if (digits.startsWith('255')) {
    const tanzanianPart = digits.substring(3);
    if (tanzanianPart.length !== 9 || !/^[67]\d{8}$/.test(tanzanianPart)) {
      return {
        isValid: false,
        message: 'Tanzanian numbers should start with 6 or 7 and be 9 digits',
      }
    }
  }
  
  // Nigeria (+234)
  else if (digits.startsWith('234')) {
    const nigerianPart = digits.substring(3);
    if (nigerianPart.length !== 10 || !/^[789]\d{9}$/.test(nigerianPart)) {
      return {
        isValid: false,
        message: 'Nigerian numbers should start with 7, 8, or 9 and be 10 digits',
      }
    }
  }
  
  // US/Canada (+1)
  else if (digits.startsWith('1')) {
    const northAmericanPart = digits.substring(1);
    if (northAmericanPart.length !== 10 || !/^\d{10}$/.test(northAmericanPart)) {
      return {
        isValid: false,
        message: 'US/Canadian numbers should be 10 digits after +1',
      }
    }
  }

  return {
    isValid: true,
    message: '',
  }
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {object} Validation result with isValid, message, and strength score
 */
export const validatePassword = (password) => {
  if (!password || typeof password !== 'string') {
    return {
      isValid: false,
      message: 'Password is required',
      strength: 0,
    }
  }

  if (password.length < VALIDATION_RULES.PASSWORD.MIN_LENGTH) {
    return {
      isValid: false,
      message: `Password must be at least ${VALIDATION_RULES.PASSWORD.MIN_LENGTH} characters long`,
      strength: 0,
    }
  }

  // Check password strength criteria
  const criteria = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[@$!%*?&]/.test(password),
  }

  const strengthScore = Object.values(criteria).filter(Boolean).length

  // Check if all criteria are met
  const isValid = Object.values(criteria).every(Boolean)

  let message = ''
  if (!isValid) {
    const missing = []
    if (!criteria.lowercase) missing.push('lowercase letter')
    if (!criteria.uppercase) missing.push('uppercase letter')
    if (!criteria.number) missing.push('number')
    if (!criteria.special) missing.push('special character (@$!%*?&)')
    
    message = `Password must include: ${missing.join(', ')}`
  }

  return {
    isValid,
    message,
    strength: strengthScore,
    criteria,
  }
}

/**
 * Validate that passwords match
 * @param {string} password - Original password
 * @param {string} confirmPassword - Confirmation password
 * @returns {object} Validation result
 */
export const validatePasswordMatch = (password, confirmPassword) => {
  if (!confirmPassword || typeof confirmPassword !== 'string') {
    return {
      isValid: false,
      message: 'Please confirm your password',
    }
  }

  if (password !== confirmPassword) {
    return {
      isValid: false,
      message: 'Passwords do not match',
    }
  }

  return {
    isValid: true,
    message: '',
  }
}

/**
 * Validate name fields (first name, last name)
 * @param {string} name - Name to validate
 * @param {string} fieldName - Field name for error messages (default: 'Name')
 * @returns {object} Validation result
 */
export const validateName = (name, fieldName = 'Name') => {
  if (!name || typeof name !== 'string') {
    return {
      isValid: false,
      message: `${fieldName} is required`,
    }
  }

  const trimmedName = name.trim()
  
  if (trimmedName.length === 0) {
    return {
      isValid: false,
      message: `${fieldName} is required`,
    }
  }

  if (trimmedName.length < VALIDATION_RULES.NAME.MIN_LENGTH) {
    return {
      isValid: false,
      message: `${fieldName} must be at least ${VALIDATION_RULES.NAME.MIN_LENGTH} characters long`,
    }
  }

  if (trimmedName.length > VALIDATION_RULES.NAME.MAX_LENGTH) {
    return {
      isValid: false,
      message: `${fieldName} must be no more than ${VALIDATION_RULES.NAME.MAX_LENGTH} characters long`,
    }
  }

  if (!VALIDATION_RULES.NAME.PATTERN.test(trimmedName)) {
    return {
      isValid: false,
      message: VALIDATION_RULES.NAME.MESSAGE,
    }
  }

  return {
    isValid: true,
    message: '',
  }
}

/**
 * Validate investment amount
 * @param {number|string} amount - Amount to validate
 * @param {number} minAmount - Minimum allowed amount
 * @param {number} maxAmount - Maximum allowed amount (optional)
 * @returns {object} Validation result
 */
export const validateAmount = (amount, minAmount, maxAmount = null) => {
  // Convert string to number if needed
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount

  if (isNaN(numAmount) || numAmount === null || numAmount === undefined) {
    return {
      isValid: false,
      message: 'Please enter a valid amount',
    }
  }

  if (numAmount <= 0) {
    return {
      isValid: false,
      message: 'Amount must be greater than zero',
    }
  }

  if (numAmount < minAmount) {
    return {
      isValid: false,
      message: `Minimum amount is ${minAmount.toLocaleString()}`,
    }
  }

  if (maxAmount !== null && numAmount > maxAmount) {
    return {
      isValid: false,
      message: `Maximum amount is ${maxAmount.toLocaleString()}`,
    }
  }

  return {
    isValid: true,
    message: '',
  }
}

/**
 * Validate OTP code
 * @param {string} otp - OTP code to validate
 * @param {number} length - Expected OTP length (default: 6)
 * @returns {object} Validation result
 */
export const validateOTP = (otp, length = 6) => {
  if (!otp || typeof otp !== 'string') {
    return {
      isValid: false,
      message: 'OTP code is required',
    }
  }

  const trimmedOTP = otp.trim()
  
  if (trimmedOTP.length === 0) {
    return {
      isValid: false,
      message: 'OTP code is required',
    }
  }

  if (trimmedOTP.length !== length) {
    return {
      isValid: false,
      message: `OTP code must be ${length} digits`,
    }
  }

  if (!/^\d+$/.test(trimmedOTP)) {
    return {
      isValid: false,
      message: 'OTP code must contain only numbers',
    }
  }

  return {
    isValid: true,
    message: '',
  }
}

/**
 * Validate file upload
 * @param {File} file - File to validate
 * @param {object} options - Validation options
 * @returns {object} Validation result
 */
export const validateFile = (file, options = {}) => {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'],
    allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png'],
  } = options

  if (!file) {
    return {
      isValid: false,
      message: 'Please select a file',
    }
  }

  // Check file size
  if (file.size > maxSize) {
    const maxSizeMB = Math.round(maxSize / (1024 * 1024))
    return {
      isValid: false,
      message: `File size must be less than ${maxSizeMB}MB`,
    }
  }

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      message: `File type not supported. Allowed types: ${allowedExtensions.join(', ')}`,
    }
  }

  // Check file extension as additional validation
  const fileName = file.name.toLowerCase()
  const hasValidExtension = allowedExtensions.some(ext => 
    fileName.endsWith(ext.toLowerCase())
  )

  if (!hasValidExtension) {
    return {
      isValid: false,
      message: `File extension not supported. Allowed extensions: ${allowedExtensions.join(', ')}`,
    }
  }

  return {
    isValid: true,
    message: '',
  }
}

/**
 * Validate required field
 * @param {any} value - Value to validate
 * @param {string} fieldName - Field name for error messages
 * @returns {object} Validation result
 */
export const validateRequired = (value, fieldName = 'Field') => {
  if (value === null || value === undefined) {
    return {
      isValid: false,
      message: `${fieldName} is required`,
    }
  }

  if (typeof value === 'string' && value.trim().length === 0) {
    return {
      isValid: false,
      message: `${fieldName} is required`,
    }
  }

  if (Array.isArray(value) && value.length === 0) {
    return {
      isValid: false,
      message: `${fieldName} is required`,
    }
  }

  return {
    isValid: true,
    message: '',
  }
}

/**
 * Validate form data using multiple validators
 * @param {object} data - Form data to validate
 * @param {object} rules - Validation rules
 * @returns {object} Validation results with errors object
 */
export const validateForm = (data, rules) => {
  const errors = {}
  let isValid = true

  for (const [field, validators] of Object.entries(rules)) {
    const value = data[field]
    
    for (const validator of validators) {
      const result = validator(value)
      
      if (!result.isValid) {
        errors[field] = result.message
        isValid = false
        break // Stop at first error for this field
      }
    }
  }

  return {
    isValid,
    errors,
  }
}

/**
 * Common validation rule sets for forms
 */
export const validationRules = {
  // Registration form
  registration: {
    email: [validateEmail],
    phone: [validatePhoneNumber],
    password: [validatePassword],
    firstName: [(value) => validateName(value, 'First name')],
    lastName: [(value) => validateName(value, 'Last name')],
  },

  // Login form
  login: {
    email: [validateEmail],
    password: [(value) => validateRequired(value, 'Password')],
  },

  // Profile update form
  profile: {
    firstName: [(value) => validateName(value, 'First name')],
    lastName: [(value) => validateName(value, 'Last name')],
  },

  // Investment inquiry form
  inquiry: (minAmount, maxAmount) => ({
    amount: [(value) => validateAmount(value, minAmount, maxAmount)],
  }),

  // Withdrawal form
  withdrawal: (maxAmount) => ({
    amount: [(value) => validateAmount(value, 1, maxAmount)],
  }),

  // OTP verification form
  otp: {
    otp: [validateOTP],
  },
}

/**
 * Debounced validation for real-time form validation
 * @param {Function} validator - Validation function
 * @param {number} delay - Debounce delay in milliseconds
 * @returns {Function} Debounced validator function
 */
export const createDebouncedValidator = (validator, delay = 300) => {
  let timeoutId = null

  return (value, callback) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      const result = validator(value)
      callback(result)
    }, delay)
  }
}