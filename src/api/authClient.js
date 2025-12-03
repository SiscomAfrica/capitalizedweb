import axiosInstance, { setTokens, clearTokens } from './axiosConfig'
import { API_ENDPOINTS } from '../utils/constants'

/**
 * Auth Service API Client
 * Handles all authentication-related API calls
 */
class AuthClient {
  constructor() {
    this.baseURL = API_ENDPOINTS.AUTH
  }

  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @param {string} userData.email - User email
   * @param {string} userData.phone - User phone number (will be formatted to E.164)
   * @param {string} userData.password - User password
   * @param {string} userData.firstName - User first name
   * @param {string} userData.lastName - User last name
   * @returns {Promise<Object>} Registration response
   */
  async register(userData) {
    try {
      const response = await axiosInstance.post(`${this.baseURL}/register`, {
        email: userData.email,
        phone: userData.phone, // Phone is already formatted by the form
        password: userData.password,
        full_name: `${userData.firstName} ${userData.lastName}`.trim(),
      })

      return response.data
    } catch (error) {
      throw error
    }
  }

  /**
   * Login user with email/phone and password
   * @param {string} identifier - User email or phone number
   * @param {string} password - User password
   * @returns {Promise<Object>} Login response with tokens
   */
  async login(identifier, password) {
    try {
      const response = await axiosInstance.post(`${this.baseURL}/login`, {
        identifier,
        password,
      })

      const { access_token, refresh_token, user } = response.data

      // Store tokens
      if (access_token && refresh_token) {
        setTokens(access_token, refresh_token)
      }

      return {
        accessToken: access_token,
        refreshToken: refresh_token,
        user,
      }
    } catch (error) {
      throw error
    }
  }

  /**
   * Verify phone number with OTP
   * @param {string} phone - Phone number in E.164 format
   * @param {string} otp - One-time password
   * @returns {Promise<Object>} Verification response
   */
  async verifyPhone(phone, otp) {
    try {
      const response = await axiosInstance.post(`${this.baseURL}/verify-phone`, {
        phone,
        otp,
      })

      const { access_token, refresh_token, user } = response.data

      // Store tokens if provided (in case verification completes authentication)
      if (access_token && refresh_token) {
        setTokens(access_token, refresh_token)
      }

      return {
        accessToken: access_token,
        refreshToken: refresh_token,
        user,
      }
    } catch (error) {
      throw error
    }
  }

  /**
   * Resend OTP for phone verification
   * @param {string} phone - Phone number to resend OTP to
   * @returns {Promise<Object>} Resend response
   */
  async resendOTP(phone) {
    try {
      const response = await axiosInstance.post(`${this.baseURL}/resend-otp`, {
        phone,
      })

      return response.data
    } catch (error) {
      throw error
    }
  }

  /**
   * Get user profile (requires authentication)
   * @returns {Promise<Object>} User profile data
   */
  async getProfile() {
    try {
      const response = await axiosInstance.get(`${this.baseURL}/me`)
      
      // Handle different response structures
      let userData = response.data
      if (response.data.user) {
        userData = response.data.user
      } else if (response.data.data) {
        userData = response.data.data
      }
      
      return userData
    } catch (error) {
      throw error
    }
  }

  /**
   * Update user profile (requires authentication)
   * @param {Object} profileData - Profile update data
   * @param {string} profileData.firstName - User first name
   * @param {string} profileData.lastName - User last name
   * @returns {Promise<Object>} Updated profile data
   */
  async updateProfile(profileData) {
    try {
      const response = await axiosInstance.put(`${this.baseURL}/profile`, {
        first_name: profileData.firstName,
        last_name: profileData.lastName,
      })

      return response.data
    } catch (error) {
      throw error
    }
  }

  /**
   * Submit KYC documents (requires authentication)
   * @param {FileList|File[]} files - KYC document files
   * @returns {Promise<Object>} KYC submission response
   */
  async submitKYC(files) {
    try {
      const formData = new FormData()
      
      // Add files to form data
      if (files instanceof FileList) {
        for (let i = 0; i < files.length; i++) {
          formData.append('documents', files[i])
        }
      } else if (Array.isArray(files)) {
        files.forEach((file) => {
          formData.append('documents', file)
        })
      } else {
        formData.append('documents', files)
      }

      const response = await axiosInstance.post(`${this.baseURL}/kyc/submit`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      return response.data
    } catch (error) {
      throw error
    }
  }

  /**
   * Logout user (clear tokens)
   * @returns {Promise<void>}
   */
  async logout() {
    try {
      // Optionally call logout endpoint on server
      // await axiosInstance.post(`${this.baseURL}/logout`)
      
      // Clear local tokens
      clearTokens()
      
      return { success: true }
    } catch (error) {
      // Even if server logout fails, clear local tokens
      clearTokens()
      throw error
    }
  }

  /**
   * Request password reset
   * @param {string} email - User email
   * @returns {Promise<Object>} Password reset response
   */
  async requestPasswordReset(email) {
    try {
      const response = await axiosInstance.post(`${this.baseURL}/password-reset`, {
        email,
      })

      return response.data
    } catch (error) {
      throw error
    }
  }

  /**
   * Reset password with token
   * @param {string} token - Password reset token
   * @param {string} newPassword - New password
   * @returns {Promise<Object>} Password reset confirmation
   */
  async resetPassword(token, newPassword) {
    try {
      const response = await axiosInstance.post(`${this.baseURL}/password-reset/confirm`, {
        token,
        new_password: newPassword,
      })

      return response.data
    } catch (error) {
      throw error
    }
  }

  /**
   * Change password (requires authentication)
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise<Object>} Password change response
   */
  async changePassword(currentPassword, newPassword) {
    try {
      const response = await axiosInstance.post(`${this.baseURL}/change-password`, {
        current_password: currentPassword,
        new_password: newPassword,
      })

      return response.data
    } catch (error) {
      throw error
    }
  }
}

// Export singleton instance
const authClient = new AuthClient()
export default authClient