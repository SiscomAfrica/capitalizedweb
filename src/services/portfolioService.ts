import apiClient from '@/lib/api'
import type {
  PortfolioSummary,
  UserInvestment,
  InvestmentDetails,
  PortfolioPerformance,
  CreateWithdrawalRequest,
  WithdrawalRequest,
  PortfolioBalance,
  CancelWithdrawalResponse,
} from '@/types/api'

export const portfolioApi = {
  getPortfolioSummary: async (): Promise<PortfolioSummary> => {
    const response = await apiClient.get<PortfolioSummary>('/investments/portfolio/')
    return response.data
  },

  getInvestments: async (status?: string): Promise<UserInvestment[]> => {
    const params = status ? { status } : {}
    const response = await apiClient.get<UserInvestment[]>('/investments/portfolio/investments', { params })
    return response.data
  },

  getInvestmentDetails: async (investmentId: string): Promise<InvestmentDetails> => {
    const response = await apiClient.get<InvestmentDetails>(`/investments/portfolio/investments/${investmentId}`)
    return response.data
  },

  getPerformance: async (period?: string): Promise<PortfolioPerformance> => {
    const params = period ? { period } : {}
    const response = await apiClient.get<PortfolioPerformance>('/investments/portfolio/performance', { params })
    return response.data
  },

  getWithdrawals: async (status?: string): Promise<WithdrawalRequest[]> => {
    const params = status ? { status } : {}
    const response = await apiClient.get<WithdrawalRequest[]>('/investments/portfolio/withdrawals', { params })
    return response.data
  },

  getBalance: async (): Promise<PortfolioBalance> => {
    const response = await apiClient.get<PortfolioBalance>('/investments/portfolio/balance')
    return response.data
  },

  createWithdrawal: async (data: CreateWithdrawalRequest): Promise<WithdrawalRequest> => {
    const response = await apiClient.post<WithdrawalRequest>('/investments/portfolio/withdrawals', data)
    return response.data
  },

  cancelWithdrawal: async (withdrawalId: string): Promise<CancelWithdrawalResponse> => {
    const response = await apiClient.delete<CancelWithdrawalResponse>(`/investments/portfolio/withdrawals/${withdrawalId}`)
    return response.data
  },
}
