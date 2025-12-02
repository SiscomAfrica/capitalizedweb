import apiClient from '@/lib/api'
import type {
  SubscriptionPlansResponse,
  SubscriptionPlan,
  MySubscriptionResponse,
  SubscribeResponse,
  CancelSubscriptionResponse,
  StartTrialResponse,
} from '@/types/api'

export const subscriptionApi = {
  getPlans: async (): Promise<SubscriptionPlansResponse> => {
    const response = await apiClient.get<SubscriptionPlansResponse>('/subscriptions/plans')
    return response.data
  },

  getPlanDetails: async (planId: string): Promise<SubscriptionPlan> => {
    const response = await apiClient.get<SubscriptionPlan>(`/subscriptions/plans/${planId}`)
    return response.data
  },

  getMySubscription: async (): Promise<MySubscriptionResponse> => {
    const response = await apiClient.get<MySubscriptionResponse>('/subscriptions/my-subscription')
    return response.data
  },

  subscribe: async (planId: string): Promise<SubscribeResponse> => {
    const response = await apiClient.post<SubscribeResponse>('/subscriptions/subscribe', { plan_id: planId })
    return response.data
  },

  cancelSubscription: async (): Promise<CancelSubscriptionResponse> => {
    const response = await apiClient.post<CancelSubscriptionResponse>('/subscriptions/cancel')
    return response.data
  },

  startFreeTrial: async (): Promise<StartTrialResponse> => {
    const response = await apiClient.post<StartTrialResponse>('/subscriptions/start-trial')
    return response.data
  },
}
