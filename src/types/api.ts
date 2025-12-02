export interface RegisterRequest {
  email: string
  full_name: string
  password: string
  phone: string
}

export interface VerifyPhoneRequest {
  otp: string
  phone: string
}

export interface ResendOtpRequest {
  phone: string
}

export interface LoginRequest {
  identifier: string
  password: string
}

export interface UpdateProfileRequest {
  address?: string
  city?: string
  country?: string
  date_of_birth?: string
}

export interface SubmitKYCRequest {
  id_back_url: string
  id_front_url: string
  id_number: string
  id_type: 'national_id' | 'passport' | 'drivers_license'
  selfie_url: string
}

export interface RegisterResponse {
  user_id: string
  email: string
  phone: string
  message: string
  otp_sent: boolean
}

export interface VerifyPhoneResponse {
  success: boolean
  message: string
  access_token: string
  refresh_token: string
  token_type: string
}

export interface ResendOtpResponse {
  success: boolean
  message: string
}

export interface LoginResponse {
  access_token: string
  refresh_token: string
  token_type: string
  user: UserResponse
}

export interface UserResponse {
  id: string
  full_name: string
  email: string
  phone: string
  phone_verified: boolean
  phone_verified_at: string | null
  profile_completed: boolean
  date_of_birth: string | null
  country: string | null
  city: string | null
  address: string | null
  kyc_status: 'pending' | 'approved' | 'rejected' | 'not_submitted'
  kyc_submitted_at: string | null
  kyc_reviewed_at: string | null
  kyc_rejection_reason: string | null
  has_subscription?: boolean
  subscription_active?: boolean
  subscription_expires_at?: string | null
  is_active: boolean
  is_verified: boolean
  can_invest: boolean
  created_at: string
  updated_at: string
  last_login: string
}

export interface UpdateProfileResponse {
  id: string
  full_name: string
  date_of_birth: string
  country: string
  city: string
  address: string
  profile_completed: boolean
}

export interface DocumentUploadURL {
  upload_url: string
  s3_url: string
}

export interface KYCUploadURLsResponse {
  id_front: DocumentUploadURL
  id_back: DocumentUploadURL
  selfie: DocumentUploadURL
  expires_in: number
}

export interface KYCSubmitResponse {
  success: boolean
  message: string
  kyc_status: 'pending' | 'approved' | 'rejected'
}

export interface KYCStatusResponse {
  status: 'pending' | 'approved' | 'rejected' | 'not_submitted'
  submitted_at?: string
  reviewed_at?: string
  can_invest: boolean
}

export type InvestmentType = 'micro-node' | 'mega-node' | 'full-node' | 'terranode'
export type ProductStatus = 'active' | 'draft' | 'funding_complete' | 'cancelled'

export interface InvestmentProduct {
  id: string
  name: string
  slug: string
  investment_type: InvestmentType
  price_per_unit: number
  minimum_investment: number
  expected_annual_return: number
  status: ProductStatus
  description?: string
  investment_duration_months?: number
  features?: string[]
  technical_specs?: Record<string, any>
  category?: InvestmentCategory
}

export interface InvestmentCategory {
  id: string
  name: string
  slug: string
  description: string
  is_active: boolean
}

export interface InvestmentProductsResponse {
  products: InvestmentProduct[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

export interface CreateInvestmentRequest {
  product_slug: string
  amount: number
  payment_method?: string
}

export interface UserInvestmentResponse {
  id: string
  product: InvestmentProduct
  amount: number
  units: number
  status: 'pending' | 'active' | 'completed' | 'cancelled'
  created_at: string
  updated_at: string
  expected_return: number
  current_value: number
}

export interface SubscriptionPlanFeatures {
  api_access: boolean
  max_investments: string
  priority_support: boolean
  advanced_analytics: boolean
  portfolio_tracking: boolean
  email_notifications: boolean
  withdrawal_requests: string
  investment_calculator: boolean
}

export interface SubscriptionPlan {
  id: string
  name: string
  description: string
  price: string
  currency: string
  duration_days: number
  features: SubscriptionPlanFeatures
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface SubscriptionPlansResponse {
  plans: SubscriptionPlan[]
}

export interface SubscribeRequest {
  plan_id: string
}

export interface SubscribeResponse {
  success: boolean
  message: string
  subscription: any
  payment_info: any
}

export interface UserSubscription {
  id: string
  plan: SubscriptionPlan
  status: string
  start_date: string
  end_date: string
  days_remaining: number
  auto_renew: boolean
  is_trial: boolean
}

export interface MySubscriptionResponse {
  subscription: UserSubscription
}

export interface CancelSubscriptionResponse {
  success: boolean
  message: string
  subscription: any
}

export interface StartTrialResponse {
  success: boolean
  message: string
  subscription: any
}

export interface PortfolioSummary {
  id: string
  user_id: string
  total_invested: string
  current_value: string
  total_earnings: string
  total_withdrawals: string
  roi_percentage: string
  annualized_return: string
  last_calculated: string
  investment_count: number
  active_investments: number
  created_at: string
  updated_at: string
}

export interface UserInvestment {
  id: string
  user_id: string
  product_id: string
  product_name: string
  product_type: string
  amount_invested: string
  units_purchased: string
  purchase_price_per_unit: string
  status: string
  date_invested: string
  activation_date: string
  maturity_date: string
  total_earnings: string
  current_value: string
  yearly_returns_data: Record<string, any>
  investment_year: number
  total_earned_to_date: string
  uses_simple_interest: boolean
  buyout_available: boolean
  certificate_number: string
  certificate_issued: boolean
  created_at: string
  updated_at: string
}

export interface InvestmentProductDetail extends InvestmentProduct {
  category_id: string
  subtitle: string
  short_description: string
  maximum_investment: string
  expected_monthly_return: string
  monthly_payout: string
  annual_payout: string
  use_variable_rates: boolean
  yearly_return_rates: string
  total_units_available: number
  units_sold: number
  funding_goal: string
  total_raised: string
  total_investors: number
  funding_start_date: string
  funding_end_date: string
  use_cases: Record<string, any>
  risk_factors: Record<string, any>
  overview_content: string
  how_it_works: string
  capital_allocation: Record<string, any>
  timeline_data: Record<string, any>
  exit_strategy: string
  featured_image: string
  gallery_images: Record<string, any>
  meta_title: string
  meta_description: string
  display_order: number
}

export interface InvestmentDetails extends UserInvestment {
  product: InvestmentProductDetail
  progress: Record<string, any>
}

export interface PortfolioPerformance {
  period: string
  labels: string[]
  values: number[]
  data_points: number
  current_value: number
  total_invested: number
  total_earnings: number
  roi_percentage: number
  period_start: string
  period_end: string
}

export interface CreateWithdrawalRequest {
  amount_requested: number
  investment_id?: string
  historical_investment_id?: string
  notes?: string
}

export interface WithdrawalRequest {
  id: string
  user_id: string
  investment_id: string
  historical_investment_id: string
  amount_requested: string
  amount_approved: string
  status: string
  request_date: string
  processed_date: string
  processed_by: string
  rejection_reason: string
  payment_reference: string
  notes: string
  created_at: string
  updated_at: string
}

export interface CancelWithdrawalResponse {
  success: boolean
  message: string
}

export interface PortfolioBalance {
  available_balance: string
  total_earnings: string
  total_withdrawals: string
  currency: string
}
