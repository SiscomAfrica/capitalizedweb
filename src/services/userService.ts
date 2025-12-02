import apiClient from '@/lib/api'
import type {
  UserResponse,
  UpdateProfileRequest,
  UpdateProfileResponse,
} from '@/types/api'

export const userApi = {
  getProfile: async (): Promise<UserResponse> => {
    const response = await apiClient.get<UserResponse>('/auth/me')
    return response.data
  },

  updateProfile: async (data: UpdateProfileRequest): Promise<UpdateProfileResponse> => {
    const response = await apiClient.put<UpdateProfileResponse>('/auth/profile', data)
    return response.data
  },
}
