import axiosInstance from './axiosConfig'
import { API_ENDPOINTS } from '../utils/constants'

/**
 * Subscription Service API Client
 * Handles all subscription-related API calls
 */
class SubscriptionClient {
  constructor() {
    this.baseURL = API_ENDPOINTS.SUBSCRIPTION
  }

  /**
   * Get all subscription plans
   * @param {Object} filters - Optional filters
   * @param {boolean} filters.activeOnly - Only return active plans
   * @param {string} filters.sortBy - Sort field
   * @param {string} filters.sortOrder - Sort order (asc, desc)
   * @returns {Promise<Object[]>} Array of subscription plans
   */
  async getPlans(filters = {}) {
    try {
      const params = new URLSearchParams()
      
      if (filters.activeOnly) params.append('active_only', filters.activeOnly)
      if (filters.sortBy) params.append('sort_by', filters.sortBy)
      if (filters.sortOrder) params.append('sort_order', filters.sortOrder)

      const queryString = params.toString()
      const url = queryString ? `${this.baseURL}/plans?${queryString}` : `${this.baseURL}/plans`
      
      const response = await axiosInstance.get(url)
      return response.data
    } catch (error) {
      throw error
    }
  }

  /**
   * Get specific subscription plan by ID
   * @param {string} planId - Plan ID
   * @returns {Promise<Object>} Subscription plan details
   */
  async getPlan(planId) {
    try {
      const response = await axiosInstance.get(`${this.baseURL}/plans/${planId}`)
      return response.data
    } catch (error) {
      throw error
    }
  }

  /**
   * Create subscription (requires authentication)
   * @param {Object} subscriptionData - Subscription data
   * @param {string} subscriptionData.planId - Plan ID
   * @returns {Promise<Object>} Created subscription
   */
  async createSubscription(subscriptionData) {
    try {
      const response = await axiosInstance.post(`${this.baseURL}`, {
        plan_id: subscriptionData.planId,
      })

      return response.data
    } catch (error) {
      throw error
    }
  }

  /**
   * Get user's active subscription (requires authentication)
   * @returns {Promise<Object>} User's subscription details
   */
  async getMySubscription() {
    try {
      const response = await axiosInstance.get(`${this.baseURL}/my-subscription`)
      return response.data
    } catch (error) {
      throw error
    }
  }

  /**
   * Cancel subscription (requires authentication)
   * @param {string} subscriptionId - Subscription ID
   * @param {Object} cancellationData - Cancellation data
   * @param {string} cancellationData.reason - Cancellation reason
   * @returns {Promise<Object>} Cancellation response
   */
  async cancelSubscription(subscriptionId, cancellationData = {}) {
    try {
      const response = await axiosInstance.post(`${this.baseURL}/${subscriptionId}/cancel`, {
        reason: cancellationData.reason,
      })

      return response.data
    } catch (error) {
      throw error
    }
  }

  /**
   * Get subscription history (requires authentication)
   * @param {Object} filters - Optional filters
   * @param {string} filters.status - Subscription status
   * @param {string} filters.sortBy - Sort field
   * @param {string} filters.sortOrder - Sort order (asc, desc)
   * @returns {Promise<Object[]>} Array of user subscriptions
   */
  async getSubscriptionHistory(filters = {}) {
    try {
      const params = new URLSearchParams()
      
      if (filters.status) params.append('status', filters.status)
      if (filters.sortBy) params.append('sort_by', filters.sortBy)
      if (filters.sortOrder) params.append('sort_order', filters.sortOrder)
      if (filters.limit) params.append('limit', filters.limit)
      if (filters.offset) params.append('offset', filters.offset)

      const queryString = params.toString()
      const url = queryString ? `${this.baseURL}/history?${queryString}` : `${this.baseURL}/history`
      
      const response = await axiosInstance.get(url)
      return response.data
    } catch (error) {
      throw error
    }
  }

  /**
   * Update subscription (requires authentication)
   * @param {string} subscriptionId - Subscription ID
   * @param {Object} updateData - Update data
   * @param {string} updateData.planId - New plan ID (for upgrades/downgrades)
   * @param {boolean} updateData.autoRenew - Auto-renewal setting
   * @returns {Promise<Object>} Updated subscription
   */
  async updateSubscription(subscriptionId, updateData) {
    try {
      const response = await axiosInstance.put(`${this.baseURL}/${subscriptionId}`, {
        plan_id: updateData.planId,
        auto_renew: updateData.autoRenew,
      })

      return response.data
    } catch (error) {
      throw error
    }
  }

  /**
   * Get subscription usage/billing information (requires authentication)
   * @param {string} subscriptionId - Subscription ID
   * @returns {Promise<Object>} Usage and billing data
   */
  async getSubscriptionUsage(subscriptionId) {
    try {
      const response = await axiosInstance.get(`${this.baseURL}/${subscriptionId}/usage`)
      return response.data
    } catch (error) {
      throw error
    }
  }

  /**
   * Get payment methods (requires authentication)
   * @returns {Promise<Object[]>} Array of payment methods
   */
  async getPaymentMethods() {
    try {
      const response = await axiosInstance.get(`${this.baseURL}/payment-methods`)
      return response.data
    } catch (error) {
      throw error
    }
  }

  /**
   * Add payment method (requires authentication)
   * @param {Object} paymentMethodData - Payment method data
   * @returns {Promise<Object>} Added payment method
   */
  async addPaymentMethod(paymentMethodData) {
    try {
      const response = await axiosInstance.post(`${this.baseURL}/payment-methods`, paymentMethodData)
      return response.data
    } catch (error) {
      throw error
    }
  }

  /**
   * Remove payment method (requires authentication)
   * @param {string} paymentMethodId - Payment method ID
   * @returns {Promise<Object>} Removal response
   */
  async removePaymentMethod(paymentMethodId) {
    try {
      const response = await axiosInstance.delete(`${this.baseURL}/payment-methods/${paymentMethodId}`)
      return response.data
    } catch (error) {
      throw error
    }
  }

  /**
   * Start free trial (requires authentication)
   * @returns {Promise<Object>} Trial start response
   */
  async startFreeTrial() {
    try {
      const response = await axiosInstance.post(`${this.baseURL}/start-trial`, {}, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      })
      return response.data
    } catch (error) {
      console.error('Start trial API error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      throw error
    }
  }
}

// Export singleton instance
const subscriptionClient = new SubscriptionClient()
export default subscriptionClient