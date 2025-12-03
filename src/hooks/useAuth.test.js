import { renderHook } from '@testing-library/react';
import { vi } from 'vitest';
import useAuth from './useAuth';
import { useAuthContext } from '../contexts/AuthContext';

// Mock the AuthContext
vi.mock('../contexts/AuthContext');

describe('useAuth', () => {
  const mockAuthContext = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    tokens: { accessToken: null, refreshToken: null },
    login: vi.fn(),
    register: vi.fn(),
    verifyPhone: vi.fn(),
    logout: vi.fn(),
    updateUser: vi.fn(),
    refreshToken: vi.fn(),
    clearError: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useAuthContext.mockReturnValue(mockAuthContext);
  });

  describe('isProfileCompleted', () => {
    it('returns false when user is null', () => {
      const { result } = renderHook(() => useAuth());
      expect(result.current.isProfileCompleted()).toBe(false);
    });

    it('returns false when profile fields are missing', () => {
      useAuthContext.mockReturnValue({
        ...mockAuthContext,
        user: {
          id: '123',
          email: 'test@example.com',
          phone_verified: true,
          // Missing profile fields
        }
      });

      const { result } = renderHook(() => useAuth());
      expect(result.current.isProfileCompleted()).toBe(false);
    });

    it('returns false when some profile fields are missing', () => {
      useAuthContext.mockReturnValue({
        ...mockAuthContext,
        user: {
          id: '123',
          email: 'test@example.com',
          phone_verified: true,
          date_of_birth: '1990-01-01T00:00:00Z',
          country: 'Kenya',
          // Missing city and address
        }
      });

      const { result } = renderHook(() => useAuth());
      expect(result.current.isProfileCompleted()).toBe(false);
    });

    it('returns true when all profile fields are present', () => {
      useAuthContext.mockReturnValue({
        ...mockAuthContext,
        user: {
          id: '123',
          email: 'test@example.com',
          phone_verified: true,
          date_of_birth: '1990-01-01T00:00:00Z',
          country: 'Kenya',
          city: 'Nairobi',
          address: '123 Main Street'
        }
      });

      const { result } = renderHook(() => useAuth());
      expect(result.current.isProfileCompleted()).toBe(true);
    });

    it('handles different field name formats', () => {
      useAuthContext.mockReturnValue({
        ...mockAuthContext,
        user: {
          id: '123',
          email: 'test@example.com',
          phone_verified: true,
          dateOfBirth: '1990-01-01T00:00:00Z', // camelCase format
          country: 'Kenya',
          city: 'Nairobi',
          address: '123 Main Street'
        }
      });

      const { result } = renderHook(() => useAuth());
      expect(result.current.isProfileCompleted()).toBe(true);
    });
  });

  describe('canAccessDashboard', () => {
    it('returns false when not authenticated', () => {
      const { result } = renderHook(() => useAuth());
      expect(result.current.canAccessDashboard()).toBe(false);
    });

    it('returns false when phone is not verified', () => {
      useAuthContext.mockReturnValue({
        ...mockAuthContext,
        isAuthenticated: true,
        user: {
          id: '123',
          email: 'test@example.com',
          phone_verified: false, // Not verified
          date_of_birth: '1990-01-01T00:00:00Z',
          country: 'Kenya',
          city: 'Nairobi',
          address: '123 Main Street'
        }
      });

      const { result } = renderHook(() => useAuth());
      expect(result.current.canAccessDashboard()).toBe(false);
    });

    it('returns false when profile is not completed', () => {
      useAuthContext.mockReturnValue({
        ...mockAuthContext,
        isAuthenticated: true,
        user: {
          id: '123',
          email: 'test@example.com',
          phone_verified: true,
          // Missing profile fields
        }
      });

      const { result } = renderHook(() => useAuth());
      expect(result.current.canAccessDashboard()).toBe(false);
    });

    it('returns true when authenticated, phone verified, and profile completed', () => {
      useAuthContext.mockReturnValue({
        ...mockAuthContext,
        isAuthenticated: true,
        user: {
          id: '123',
          email: 'test@example.com',
          phone_verified: true,
          date_of_birth: '1990-01-01T00:00:00Z',
          country: 'Kenya',
          city: 'Nairobi',
          address: '123 Main Street'
        }
      });

      const { result } = renderHook(() => useAuth());
      expect(result.current.canAccessDashboard()).toBe(true);
    });
  });

  describe('isPhoneVerified', () => {
    it('handles different field name formats', () => {
      // Test phone_verified format
      useAuthContext.mockReturnValue({
        ...mockAuthContext,
        user: { phone_verified: true }
      });

      let { result } = renderHook(() => useAuth());
      expect(result.current.isPhoneVerified()).toBe(true);

      // Test phoneVerified format
      useAuthContext.mockReturnValue({
        ...mockAuthContext,
        user: { phoneVerified: true }
      });

      ({ result } = renderHook(() => useAuth()));
      expect(result.current.isPhoneVerified()).toBe(true);

      // Test is_phone_verified format
      useAuthContext.mockReturnValue({
        ...mockAuthContext,
        user: { is_phone_verified: true }
      });

      ({ result } = renderHook(() => useAuth()));
      expect(result.current.isPhoneVerified()).toBe(true);
    });
  });
});