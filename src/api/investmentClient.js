import axiosInstance from './axiosConfig'
import { API_ENDPOINTS } from '../utils/constants'

/**
 * Investment Service API Client
 * Handles all investment-related API calls
 */
class InvestmentClient {
  constructor() {
    this.baseURL = API_ENDPOINTS.INVESTMENT
  }

  /**
   * Get all investment products
   * @param {Object} filters - Optional filters
   * @param {string} filters.category - Product category
   * @param {string} filters.riskLevel - Risk level (low, medium, high)
   * @param {string} filters.sortBy - Sort field (return, duration, etc.)
   * @param {string} filters.sortOrder - Sort order (asc, desc)
   * @returns {Promise<Object[]>} Array of investment products
   */
  async getProducts(filters = {}) {
    try {
      const params = new URLSearchParams()
      
      // Map frontend filters to API parameters
      if (filters.category) params.append('category', filters.category)
      if (filters.riskLevel) params.append('risk_level', filters.riskLevel)
      if (filters.sortBy) {
        // Map frontend sort fields to API fields
        const sortMapping = {
          'expectedReturn': 'expected_annual_return',
          'minimumInvestment': 'minimum_investment',
          'duration': 'investment_duration_months',
          'name': 'name'
        }
        params.append('sort_by', sortMapping[filters.sortBy] || filters.sortBy)
      }
      if (filters.sortOrder) params.append('sort_order', filters.sortOrder)
      
      // Add default parameters
      params.append('status', 'active')
      params.append('page', filters.page || 1)
      params.append('page_size', filters.pageSize || 20)

      const queryString = params.toString()
      // Ensure no trailing slash issues
      const baseUrl = this.baseURL.endsWith('/') ? this.baseURL.slice(0, -1) : this.baseURL
      const url = queryString ? `${baseUrl}/products?${queryString}` : `${baseUrl}/products`
      
      const response = await axiosInstance.get(url, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        timeout: 15000, // 15 second timeout
      })
      return response.data
    } catch (error) {
      console.error('Investment API error:', error.message)
      throw error
    }
  }

  /**
   * Get specific investment product by slug
   * @param {string} productSlug - Product slug
   * @returns {Promise<Object>} Investment product details
   */
  async getProduct(productSlug) {
    try {
      const response = await axiosInstance.get(`${this.baseURL}/products/${productSlug}`)
      return response.data
    } catch (error) {
      throw error
    }
  }

  /**
   * Create investment inquiry (requires authentication)
   * @param {Object} inquiryData - Inquiry data
   * @param {string} inquiryData.productId - Product ID
   * @param {number} inquiryData.amount - Investment amount
   * @returns {Promise<Object>} Created inquiry
   */
  async createInquiry(inquiryData) {
    try {
      console.log('Creating inquiry with data:', inquiryData)
      console.log('Inquiry endpoint:', `${this.baseURL}/inquiries/`)
      
      // Check if user is authenticated
      const token = localStorage.getItem('africa_access_token')
      console.log('Access token available:', !!token)
      console.log('Token preview:', token ? `${token.substring(0, 20)}...` : 'No token')
      
      const requestData = {
        product_id: inquiryData.productId,
        investment_amount: inquiryData.amount,
        currency: inquiryData.currency || 'USD',
        duration_months: inquiryData.durationMonths || 0,
        message: inquiryData.message || '',
        phone: inquiryData.phone || '',
      }
      
      console.log('Request payload:', requestData)
      
      const response = await axiosInstance.post(`${this.baseURL}/inquiries/`, requestData)
      
      console.log('Inquiry created successfully:', response.data)
      return response.data
    } catch (error) {
      console.error('Error creating inquiry:', error)
      console.error('Error details:', {
        status: error.status,
        message: error.message,
        data: error.data
      })
      throw error
    }
  }

  /**
   * Get user's investment inquiries (requires authentication)
   * @param {Object} filters - Optional filters
   * @param {string} filters.status - Inquiry status (pending, paid, cancelled)
   * @param {string} filters.sortBy - Sort field
   * @param {string} filters.sortOrder - Sort order (asc, desc)
   * @returns {Promise<Object[]>} Array of user inquiries
   */
  async getInquiries(filters = {}) {
    try {
      const params = new URLSearchParams()
      
      if (filters.status) params.append('status', filters.status)
      if (filters.sortBy) params.append('sort_by', filters.sortBy)
      if (filters.sortOrder) params.append('sort_order', filters.sortOrder)
      if (filters.limit) params.append('limit', filters.limit)
      if (filters.offset) params.append('offset', filters.offset)

      const queryString = params.toString()
      const url = queryString ? `${this.baseURL}/inquiries/?${queryString}` : `${this.baseURL}/inquiries/`
      
      const response = await axiosInstance.get(url)
      return response.data
    } catch (error) {
      throw error
    }
  }

  /**
   * Get specific inquiry by ID (requires authentication)
   * @param {string} inquiryId - Inquiry ID
   * @returns {Promise<Object>} Inquiry details
   */
  async getInquiry(inquiryId) {
    try {
      const response = await axiosInstance.get(`${this.baseURL}/inquiries/${inquiryId}/`)
      return response.data
    } catch (error) {
      throw error
    }
  }

  /**
   * Update inquiry status (requires authentication)
   * @param {string} inquiryId - Inquiry ID
   * @param {Object} updateData - Update data
   * @param {string} updateData.status - New status
   * @returns {Promise<Object>} Updated inquiry
   */
  async updateInquiry(inquiryId, updateData) {
    try {
      const response = await axiosInstance.put(`${this.baseURL}/inquiries/${inquiryId}/`, updateData)
      return response.data
    } catch (error) {
      throw error
    }
  }

  /**
   * Get user's investment portfolio (requires authentication)
   * @returns {Promise<Object>} Portfolio data with summary and investments
   */
  async getPortfolio() {
    try {
      const response = await axiosInstance.get(`${this.baseURL}/portfolio`)
      return response.data
    } catch (error) {
      throw error
    }
  }

  /**
   * Get specific investment details (requires authentication)
   * @param {string} investmentId - Investment ID
   * @returns {Promise<Object>} Investment details
   */
  async getInvestment(investmentId) {
    try {
      const response = await axiosInstance.get(`${this.baseURL}/portfolio/investments/${investmentId}`)
      return response.data
    } catch (error) {
      throw error
    }
  }

  /**
   * Create withdrawal request (requires authentication)
   * @param {Object} withdrawalData - Withdrawal data
   * @param {number} withdrawalData.amount - Withdrawal amount
   * @param {string} withdrawalData.reason - Withdrawal reason (optional)
   * @returns {Promise<Object>} Created withdrawal request
   */
  async createWithdrawal(withdrawalData) {
    try {
      const response = await axiosInstance.post(`${this.baseURL}/portfolio/withdrawals`, {
        amount: withdrawalData.amount,
        reason: withdrawalData.reason,
      })

      return response.data
    } catch (error) {
      throw error
    }
  }

  /**
   * Get user's withdrawal history (requires authentication)
   * @param {Object} filters - Optional filters
   * @param {string} filters.status - Withdrawal status (pending, processing, completed, rejected)
   * @param {string} filters.sortBy - Sort field
   * @param {string} filters.sortOrder - Sort order (asc, desc)
   * @returns {Promise<Object[]>} Array of withdrawal requests
   */
  async getWithdrawals(filters = {}) {
    try {
      const params = new URLSearchParams()
      
      if (filters.status) params.append('status', filters.status)
      if (filters.sortBy) params.append('sort_by', filters.sortBy)
      if (filters.sortOrder) params.append('sort_order', filters.sortOrder)
      if (filters.limit) params.append('limit', filters.limit)
      if (filters.offset) params.append('offset', filters.offset)

      const queryString = params.toString()
      const url = queryString ? `${this.baseURL}/portfolio/withdrawals?${queryString}` : `${this.baseURL}/portfolio/withdrawals`
      
      const response = await axiosInstance.get(url)
      return response.data
    } catch (error) {
      throw error
    }
  }

  /**
   * Get specific withdrawal request (requires authentication)
   * @param {string} withdrawalId - Withdrawal ID
   * @returns {Promise<Object>} Withdrawal details
   */
  async getWithdrawal(withdrawalId) {
    try {
      const response = await axiosInstance.get(`${this.baseURL}/portfolio/withdrawals/${withdrawalId}`)
      return response.data
    } catch (error) {
      throw error
    }
  }

  /**
   * Cancel withdrawal request (requires authentication)
   * @param {string} withdrawalId - Withdrawal ID
   * @returns {Promise<Object>} Cancellation response
   */
  async cancelWithdrawal(withdrawalId) {
    try {
      const response = await axiosInstance.post(`${this.baseURL}/portfolio/withdrawals/${withdrawalId}/cancel`)
      return response.data
    } catch (error) {
      throw error
    }
  }

  /**
   * Get investment performance data (requires authentication)
   * @param {Object} filters - Optional filters
   * @param {string} filters.period - Time period (1m, 3m, 6m, 1y, all)
   * @param {string} filters.investmentId - Specific investment ID
   * @returns {Promise<Object>} Performance data
   */
  async getPerformance(filters = {}) {
    try {
      const params = new URLSearchParams()
      
      if (filters.period) params.append('period', filters.period)
      if (filters.investmentId) params.append('investment_id', filters.investmentId)

      const queryString = params.toString()
      const url = queryString ? `${this.baseURL}/portfolio/performance?${queryString}` : `${this.baseURL}/portfolio/performance`
      
      const response = await axiosInstance.get(url)
      return response.data
    } catch (error) {
      throw error
    }
  }

  /**
   * Get investment categories
   * @returns {Promise<Object[]>} Array of investment categories
   */
  async getCategories() {
    try {
      const response = await axiosInstance.get(`${this.baseURL}/categories`)
      return response.data
    } catch (error) {
      throw error
    }
  }

  /**
   * Get investment statistics
   * @returns {Promise<Object>} Investment statistics
   */
  async getStatistics() {
    try {
      const response = await axiosInstance.get(`${this.baseURL}/statistics`, {
        timeout: 10000,
        headers: {
          'Accept': 'application/json',
        }
      })
      return response.data
    } catch (error) {
      console.error('Failed to fetch investment statistics:', error)
      throw error
    }
  }

  /**
   * Health check for investment service
   * @returns {Promise<Object>} Health status
   */
  async healthCheck() {
    try {
      const baseUrl = this.baseURL.endsWith('/') ? this.baseURL.slice(0, -1) : this.baseURL
      const response = await axiosInstance.get(`${baseUrl}/health`, {
        timeout: 5000,
        headers: {
          'Accept': 'application/json',
        }
      })
      return response.data
    } catch (error) {
      console.error('Health check failed:', error)
      throw error
    }
  }
}

// Export singleton instance
const investmentClient = new InvestmentClient()
export default investmentClient