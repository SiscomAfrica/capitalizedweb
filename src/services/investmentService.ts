import apiClient from '@/lib/api'
import type {
  InvestmentProductsResponse,
  InvestmentProduct,
  CreateInvestmentRequest,
  UserInvestmentResponse,
} from '@/types/api'

export const investmentApi = {
  getProducts: async (params?: {
    category?: string
    investment_type?: string
    status?: string
    min_price?: number
    max_price?: number
    search?: string
    page?: number
    page_size?: number
  }): Promise<InvestmentProductsResponse> => {
    const response = await apiClient.get<InvestmentProductsResponse>('/investments/products/', { params })
    return response.data
  },

  getCategories: async (activeOnly: boolean = true): Promise<any[]> => {
    const response = await apiClient.get<any[]>('/investments/products/categories', {
      params: { active_only: activeOnly }
    })
    return response.data
  },

  getProductDetails: async (slug: string): Promise<InvestmentProduct> => {
    const response = await apiClient.get<InvestmentProduct>(`/investments/products/${slug}`)
    return response.data
  },

  calculateProjection: async (slug: string, amount: number): Promise<any> => {
    const response = await apiClient.post<any>(`/investments/products/${slug}/projection`, { amount })
    return response.data
  },

  getUserInvestments: async (): Promise<UserInvestmentResponse[]> => {
    const response = await apiClient.get<UserInvestmentResponse[]>('/investments/portfolio/investments')
    return response.data
  },

  createInvestment: async (data: CreateInvestmentRequest): Promise<UserInvestmentResponse> => {
    const response = await apiClient.post<UserInvestmentResponse>('/investments/', data)
    return response.data
  },
}
