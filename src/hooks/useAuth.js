import { useAuthContext } from '../contexts/AuthContext'

/**
 * Custom hook for authentication
 * Provides a clean interface to the AuthContext
 * 
 * @returns {Object} Authentication state and methods
 */
const useAuth = () => {
  const context = useAuthContext()

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  const {
    // State
    user,
    isAuthenticated,
    isLoading,
    error,
    tokens,
    
    // Actions
    login,
    register,
    verifyPhone,
    logout,
    updateUser,
    refreshToken,
    clearError,
  } = context

  // Derived state
  const isLoggedIn = isAuthenticated && !!user
  const hasError = !!error
  
  // User profile helpers
  const getUserName = () => {
    if (!user) return ''
    return user.full_name || user.email || ''
  }

  const getUserInitials = () => {
    if (!user) return ''
    
    if (user.full_name) {
      const names = user.full_name.trim().split(' ')
      if (names.length >= 2) {
        return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase()
      }
      return names[0].charAt(0).toUpperCase()
    }
    
    if (user.email) {
      return user.email.charAt(0).toUpperCase()
    }
    
    return ''
  }

  const isKYCApproved = () => {
    // Handle different field name formats from backend
    const kycStatus = user?.kyc_status || user?.kycStatus || user?.kyc?.status
    return kycStatus === 'approved'
  }

  const isKYCPending = () => {
    const kycStatus = user?.kyc_status || user?.kycStatus || user?.kyc?.status
    return kycStatus === 'pending'
  }

  const isKYCRejected = () => {
    const kycStatus = user?.kyc_status || user?.kycStatus || user?.kyc?.status
    return kycStatus === 'rejected'
  }

  const isPhoneVerified = () => {
    // Handle different field name formats from backend
    return user?.phone_verified === true || user?.phoneVerified === true || user?.is_phone_verified === true
  }

  const getKYCStatus = () => {
    // Handle different field name formats from backend
    return user?.kyc_status || user?.kycStatus || user?.kyc?.status || 'not_submitted'
  }

  // Authentication helpers
  const canAccessProtectedRoutes = () => {
    return isAuthenticated && isPhoneVerified()
  }

  const canMakeInvestments = () => {
    return canAccessProtectedRoutes() && isKYCApproved()
  }

  // Enhanced login with error handling
  const handleLogin = async (identifier, password) => {
    try {
      clearError()
      const result = await login(identifier, password)
      return result
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  // Enhanced register with error handling
  const handleRegister = async (userData) => {
    try {
      clearError()
      const result = await register(userData)
      return result
    } catch (error) {
      console.error('Registration error:', error)
      throw error
    }
  }

  // Enhanced phone verification with error handling
  const handleVerifyPhone = async (phone, otp) => {
    try {
      clearError()
      const result = await verifyPhone(phone, otp)
      return result
    } catch (error) {
      console.error('Phone verification error:', error)
      throw error
    }
  }

  // Enhanced logout with confirmation
  const handleLogout = async (skipConfirmation = false) => {
    if (!skipConfirmation) {
      const confirmed = window.confirm('Are you sure you want to log out?')
      if (!confirmed) return false
    }

    try {
      await logout()
      return true
    } catch (error) {
      console.error('Logout error:', error)
      // Even if logout fails, we should still clear local state
      return true
    }
  }

  // Token management helpers
  const hasValidTokens = () => {
    return !!(tokens.accessToken && tokens.refreshToken)
  }

  const getAccessToken = () => {
    return tokens.accessToken
  }

  const getRefreshTokenValue = () => {
    return tokens.refreshToken
  }

  // Force token refresh
  const forceTokenRefresh = async () => {
    try {
      await refreshToken()
      return true
    } catch (error) {
      console.error('Force token refresh failed:', error)
      return false
    }
  }

  return {
    // Core state
    user,
    isAuthenticated,
    isLoading,
    error,
    tokens,
    
    // Derived state
    isLoggedIn,
    hasError,
    
    // Core actions
    login: handleLogin,
    register: handleRegister,
    verifyPhone: handleVerifyPhone,
    logout: handleLogout,
    updateUser,
    clearError,
    
    // User helpers
    getUserName,
    getUserInitials,
    isKYCApproved,
    isKYCPending,
    isKYCRejected,
    isPhoneVerified,
    
    // Permission helpers
    canAccessProtectedRoutes,
    canMakeInvestments,
    getKYCStatus,
    
    // Token helpers
    hasValidTokens,
    getAccessToken,
    getRefreshToken: getRefreshTokenValue,
    refreshToken: forceTokenRefresh,
  }
}

export default useAuth