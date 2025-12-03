// Application constants

// API Configuration
export const API_ENDPOINTS = {
  AUTH: import.meta.env.VITE_AUTH_SERVICE_URL || 'https://siscom.africa/api/v1/auth',
  SUBSCRIPTION: import.meta.env.VITE_SUBSCRIPTION_SERVICE_URL || 'https://siscom.africa/api/v1/subscription',
  INVESTMENT: import.meta.env.VITE_INVESTMENT_SERVICE_URL || 'https://siscom.africa/api/v1/investments',
}

// API Base URLs (for reference)
export const API_BASE_URLS = {
  PRODUCTION: {
    AUTH: 'https://siscom.africa/api/v1/auth',
    SUBSCRIPTION: 'https://siscom.africa/api/v1/subscription',
    INVESTMENT: 'https://siscom.africa/api/v1/investments',
  },
  DEVELOPMENT: {
    AUTH: 'http://localhost:8001/api/v1/auth',
    SUBSCRIPTION: 'http://localhost:8002/api/v1/subscriptions',
    INVESTMENT: 'http://localhost:8003/api/v1/investments',
  },
}

// App Configuration
export const APP_CONFIG = {
  NAME: import.meta.env.VITE_APP_NAME || 'Africa Web Client',
  VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  DEV_MODE: import.meta.env.VITE_DEV_MODE === 'true',
  LOG_LEVEL: import.meta.env.VITE_LOG_LEVEL || 'info',
}

// Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'africa_access_token',
  REFRESH_TOKEN: 'africa_refresh_token',
  USER_DATA: 'africa_user_data',
  THEME: 'africa_theme',
  LANGUAGE: 'africa_language',
}

// Route Paths
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  VERIFY_PHONE: '/verify-phone',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  PRODUCTS: '/products',
  PRODUCT_DETAIL: '/products/:slug',
  INQUIRIES: '/inquiries',
  PORTFOLIO: '/portfolio',
  PLANS: '/plans',
  MY_SUBSCRIPTION: '/my-subscription',
}

// Form Validation
export const VALIDATION_RULES = {
  EMAIL: {
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    MESSAGE: 'Please enter a valid email address',
  },
  PHONE: {
    PATTERN: /^\+?[1-9]\d{1,14}$/,
    MESSAGE: 'Please enter a valid phone number',
  },
  PASSWORD: {
    MIN_LENGTH: 8,
    PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    MESSAGE: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character',
  },
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 50,
    PATTERN: /^[a-zA-Z\s'-]+$/,
    MESSAGE: 'Name must contain only letters, spaces, hyphens, and apostrophes',
  },
  OTP: {
    LENGTH: 6,
    PATTERN: /^\d{6}$/,
    MESSAGE: 'OTP must be 6 digits',
  },
  AMOUNT: {
    MIN: 1,
    MAX: 1000000, // 1 million USD
    MESSAGE: 'Please enter a valid amount',
  },
}

// Investment Constants
export const INVESTMENT_LIMITS = {
  MIN_INVESTMENT: 10, // USD 10 minimum
  MAX_INVESTMENT: 100000, // USD 100,000 maximum
  MIN_WITHDRAWAL: 5, // USD 5 minimum withdrawal
}

// Subscription Constants
export const SUBSCRIPTION_LIMITS = {
  TRIAL_DAYS: 14, // Default trial period
  MAX_PLANS_PER_USER: 1, // One active subscription per user
}

// File Upload
export const FILE_UPLOAD = {
  KYC: {
    MAX_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_TYPES: ['application/pdf', 'image/jpeg', 'image/png'],
    ALLOWED_EXTENSIONS: ['.pdf', '.jpg', '.jpeg', '.png'],
  },
}

// UI Constants
export const UI_CONFIG = {
  BREAKPOINTS: {
    MOBILE: 768,
    TABLET: 1024,
    DESKTOP: 1280,
  },
  ANIMATION_DURATION: {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500,
  },
  DEBOUNCE_DELAY: 300,
  TOAST_DURATION: 5000,
}

// Status Constants
export const STATUS = {
  KYC: {
    NOT_SUBMITTED: 'not_submitted',
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
  },
  INQUIRY: {
    PENDING: 'pending',
    PAID: 'paid',
    CANCELLED: 'cancelled',
  },
  INVESTMENT: {
    ACTIVE: 'active',
    MATURED: 'matured',
    WITHDRAWN: 'withdrawn',
  },
  WITHDRAWAL: {
    PENDING: 'pending',
    PROCESSING: 'processing',
    COMPLETED: 'completed',
    REJECTED: 'rejected',
  },
  SUBSCRIPTION: {
    ACTIVE: 'active',
    CANCELLED: 'cancelled',
    EXPIRED: 'expired',
    TRIAL: 'trial',
  },
}

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK: 'Network error. Please check your connection and try again.',
  UNAUTHORIZED: 'Your session has expired. Please log in again.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'Something went wrong on our end. Please try again later.',
  VALIDATION: 'Please check your input and try again.',
  FILE_TOO_LARGE: 'File size exceeds the maximum allowed limit.',
  INVALID_FILE_TYPE: 'Invalid file type. Please select a supported file.',
}

// Success Messages
export const SUCCESS_MESSAGES = {
  REGISTRATION: 'Registration successful! Please verify your phone number.',
  LOGIN: 'Welcome back!',
  PHONE_VERIFIED: 'Phone number verified successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  KYC_SUBMITTED: 'KYC documents submitted successfully!',
  INQUIRY_CREATED: 'Investment inquiry created successfully!',
  WITHDRAWAL_REQUESTED: 'Withdrawal request submitted successfully!',
  SUBSCRIPTION_CREATED: 'Subscription created successfully!',
  SUBSCRIPTION_CANCELLED: 'Subscription cancelled successfully!',
}

// Risk Levels
export const RISK_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
}

// Investment Categories
export const INVESTMENT_CATEGORIES = {
  REAL_ESTATE: 'real_estate',
  AGRICULTURE: 'agriculture',
  TECHNOLOGY: 'technology',
  ENERGY: 'energy',
  MANUFACTURING: 'manufacturing',
}

// Billing Periods
export const BILLING_PERIODS = {
  MONTHLY: 'monthly',
  YEARLY: 'yearly',
}

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
}

// Currency Codes
export const CURRENCIES = {
  USD: 'USD',
  KES: 'KES',
  EUR: 'EUR',
  GBP: 'GBP',
}

// Default Currency
export const DEFAULT_CURRENCY = 'USD'

// Country Codes for Phone Numbers
export const COUNTRY_CODES = {
  KENYA: {
    code: '+254',
    name: 'Kenya',
    flag: '🇰🇪',
    pattern: /^(\+254|254|0)?[17]\d{8}$/,
  },
  UGANDA: {
    code: '+256',
    name: 'Uganda', 
    flag: '🇺🇬',
    pattern: /^(\+256|256|0)?[37]\d{8}$/,
  },
  TANZANIA: {
    code: '+255',
    name: 'Tanzania',
    flag: '🇹🇿', 
    pattern: /^(\+255|255|0)?[67]\d{8}$/,
  },
}

// Date Formats
export const DATE_FORMATS = {
  SHORT: 'MMM dd, yyyy',
  LONG: 'MMMM dd, yyyy',
  WITH_TIME: 'MMM dd, yyyy \'at\' h:mm a',
  TIME_ONLY: 'h:mm a',
  ISO: 'yyyy-MM-dd',
  ISO_WITH_TIME: 'yyyy-MM-dd HH:mm:ss',
}

// Pagination Constants
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  MIN_PAGE_SIZE: 5,
}

// Loading States
export const LOADING_STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
}

// Theme Constants
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
}

// Language Constants
export const LANGUAGES = {
  ENGLISH: 'en',
  SWAHILI: 'sw',
}

// Feature Flags (for development)
export const FEATURE_FLAGS = {
  ENABLE_DARK_MODE: import.meta.env.VITE_ENABLE_DARK_MODE === 'true',
  ENABLE_ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  ENABLE_DEBUG_MODE: import.meta.env.VITE_ENABLE_DEBUG_MODE === 'true',
  ENABLE_MOCK_API: import.meta.env.VITE_ENABLE_MOCK_API === 'true',
}