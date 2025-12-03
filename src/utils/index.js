// Utility functions index - centralized exports for easy importing

// Formatters
export {
  formatCurrency,
  formatLargeNumber,
  formatPercentage,
  formatDecimal,
  formatDate,
  formatRelativeTime,
  formatDateDisplay,
  formatPhoneNumber,
  formatFileSize,
  formatDuration,
  formatStatus,
} from './formatters.js'

// Validators
export {
  validateEmail,
  validatePhoneNumber,
  validatePassword,
  validatePasswordMatch,
  validateName,
  validateAmount,
  validateOTP,
  validateFile,
  validateRequired,
  validateForm,
  validationRules,
  createDebouncedValidator,
} from './validators.js'

// Storage utilities
export {
  getStorageItem,
  setStorageItem,
  removeStorageItem,
  clearStorage,
  isStorageAvailable,
  getStorageInfo,
  tokenStorage,
  userStorage,
  preferencesStorage,
  sessionStorage,
  clearAllAppData,
} from './storage.js'

// Constants
export * from './constants.js'

// Responsive utilities
export * from './responsive.js'

// Image optimization utilities
export * from './imageOptimization.js'