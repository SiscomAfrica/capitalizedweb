import axios from 'axios'
import apiClient from '@/lib/api'
import type {
  KYCStatusResponse,
  KYCUploadURLsResponse,
  SubmitKYCRequest,
  KYCSubmitResponse,
} from '@/types/api'

export const kycApi = {
  getKYCStatus: async (): Promise<KYCStatusResponse> => {
    const response = await apiClient.get<KYCStatusResponse>('/kyc/status')
    return response.data
  },

  getUploadUrls: async (): Promise<KYCUploadURLsResponse> => {
    const response = await apiClient.get<KYCUploadURLsResponse>('/kyc/upload-urls')
    return response.data
  },

  uploadFileToS3: async (uploadUrl: string, file: File, contentType?: string): Promise<void> => {
    await axios.put(uploadUrl, file, {
      headers: {
        'Content-Type': contentType || file.type,
      },
    })
  },

  submitKYC: async (data: SubmitKYCRequest): Promise<KYCSubmitResponse> => {
    const response = await apiClient.post<KYCSubmitResponse>('/kyc/submit', data)
    return response.data
  },
}
