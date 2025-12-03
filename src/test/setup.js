import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock environment variables for tests
Object.defineProperty(globalThis, 'import', {
  value: {
    meta: {
      env: {
        VITE_AUTH_SERVICE_URL: 'https://siscom.africa/api/v1/auth',
        VITE_SUBSCRIPTION_SERVICE_URL: 'https://siscom.africa/api/v1/subscriptions',
        VITE_INVESTMENT_SERVICE_URL: 'https://siscom.africa/api/v1/investments',
        VITE_APP_NAME: 'Africa Web Client',
        VITE_APP_VERSION: '1.0.0',
        VITE_DEV_MODE: 'true',
        VITE_LOG_LEVEL: 'debug',
      },
    },
  },
})

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
global.localStorage = localStorageMock

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
global.sessionStorage = sessionStorageMock

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})