import axiosInstance from './axiosConfig'
import { API_ENDPOINTS } from '../utils/constants'

/**
 * Admin API Client
 * Handles all admin-related API calls to the auth service
 */
class AdminClient {
  constructor() {
    this.baseURL = API_ENDPOINTS.AUTH + '/admin'
  }

  /**
   * Get all users with pagination and filtering
   * @param {Object} params - Query parameters
   * @param {number} params.limit - Number of users per page (max 100, default 20)
   * @param {number} params.offset - Number of users to skip (default 0)
   * @param {boolean} params.phoneVerified - Filter by phone verification status
   * @param {boolean} params.profileCompleted - Filter by profile completion status
   * @param {string} params.kycStatus - Filter by KYC status (not_submitted, pending, approved, rejected)
   * @param {string} params.search - Search in full_name, email, or phone
   * @returns {Promise<Object>} Paginated list of users
   */
  async getUsers(params = {}) {
    try {
      const queryParams = new URLSearchParams()
      
      if (params.limit) queryParams.append('limit', params.limit)
      if (params.offset) queryParams.append('offset', params.offset)
      
      // Only add boolean parameters if they have valid boolean values
      if (params.phoneVerified === 'true') {
        queryParams.append('phone_verified', 'true')
      } else if (params.phoneVerified === 'false') {
        queryParams.append('phone_verified', 'false')
      }
      
      if (params.profileCompleted === 'true') {
        queryParams.append('profile_completed', 'true')
      } else if (params.profileCompleted === 'false') {
        queryParams.append('profile_completed', 'false')
      }
      
      if (params.kycStatus && params.kycStatus.trim() !== '') {
        queryParams.append('kyc_status', params.kycStatus)
      }
      
      if (params.search && params.search.trim() !== '') {
        queryParams.append('search', params.search)
      }

      const queryString = queryParams.toString()
      const url = queryString ? `${this.baseURL}/users?${queryString}` : `${this.baseURL}/users`
      
      const response = await axiosInstance.get(url, {
        headers: {
          'x-api-key': import.meta.env.VITE_ADMIN_API_KEY
        }
      })
      return response.data
    } catch (error) {
      throw error
    }
  }

  /**
   * Get user by ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} User details
   */
  async getUser(userId) {
    try {
      const response = await axiosInstance.get(`${this.baseURL}/users/${userId}`, {
        headers: {
          'x-api-key': import.meta.env.VITE_ADMIN_API_KEY
        }
      })
      return response.data
    } catch (error) {
      throw error
    }
  }

  /**
   * Get user statistics
   * @returns {Promise<Object>} User statistics
   */
  async getUserStats() {
    try {
      const response = await axiosInstance.get(`${this.baseURL}/users/stats`, {
        headers: {
          'x-api-key': import.meta.env.VITE_ADMIN_API_KEY
        }
      })
      return response.data
    } catch (error) {
      throw error
    }
  }

  /**
   * Get pending KYC requests
   * @returns {Promise<Object[]>} Array of users with pending KYC
   */
  async getPendingKYC() {
    try {
      const response = await axiosInstance.get(`${this.baseURL}/kyc/pending`, {
        headers: {
          'x-api-key': import.meta.env.VITE_ADMIN_API_KEY
        }
      })
      return response.data
    } catch (error) {
      throw error
    }
  }

  /**
   * Review KYC submission (approve or reject)
   * @param {Object} reviewData - KYC review data
   * @param {string} reviewData.userId - User ID
   * @param {string} reviewData.action - 'approve' or 'reject'
   * @param {string} reviewData.reviewer - Reviewer identifier
   * @param {string} reviewData.rejectionReason - Reason for rejection (required if action is reject)
   * @returns {Promise<Object>} Review response
   */
  async reviewKYC(reviewData) {
    try {
      const response = await axiosInstance.post(`${this.baseURL}/kyc/review`, {
        user_id: reviewData.userId,
        action: reviewData.action,
        reviewer: reviewData.reviewer,
        rejection_reason: reviewData.rejectionReason
      }, {
        headers: {
          'x-api-key': import.meta.env.VITE_ADMIN_API_KEY
        }
      })
      return response.data
    } catch (error) {
      throw error
    }
  }

  /**
   * Get KYC document URLs for viewing
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Document URLs
   */
  async getKYCDocuments(userId) {
    try {
      const response = await axiosInstance.get(`${this.baseURL}/kyc/${userId}/documents`, {
        headers: {
          'x-api-key': import.meta.env.VITE_ADMIN_API_KEY
        }
      })
      return response.data
    } catch (error) {
      throw error
    }
  }
}

// Create and export a singleton instance
const adminClient = new AdminClient()
export default adminClient