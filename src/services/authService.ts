import apiClient from '@/lib/api'
import type {
  RegisterRequest,
  RegisterResponse,
  VerifyPhoneRequest,
  VerifyPhoneResponse,
  ResendOtpRequest,
  ResendOtpResponse,
  LoginRequest,
  LoginResponse,
} from '@/types/api'

export const authApi = {
  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    const response = await apiClient.post<RegisterResponse>('/auth/register', data)
    return response.data
  },

  verifyPhone: async (data: VerifyPhoneRequest): Promise<VerifyPhoneResponse> => {
    const response = await apiClient.post<VerifyPhoneResponse>('/auth/verify-phone', data)
    return response.data
  },

  resendOtp: async (data: ResendOtpRequest): Promise<ResendOtpResponse> => {
    const response = await apiClient.post<ResendOtpResponse>('/auth/resend-otp', data)
    return response.data
  },

  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/login', data)
    return response.data
  },
}
