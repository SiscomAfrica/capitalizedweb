import { useState, useEffect } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import { authApi } from '@/services/authService'
import { tokenManager } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, CheckCircle, RefreshCw } from 'lucide-react'

export function VerifyPhoneScreen() {
  const navigate = useNavigate()
  const search = useSearch({ from: '/auth/verify' }) as any
  const setAuthenticated = useAuthStore((state: any) => state.setAuthenticated)
  
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const phone = search.phone || ''

  useEffect(() => {
    if (!phone) {
      navigate({ to: '/auth/register' })
    }
  }, [phone, navigate])

  const verifyMutation = useMutation({
    mutationFn: authApi.verifyPhone,
    onSuccess: (data: any) => {
      tokenManager.setTokens(data.access_token, data.refresh_token)
      setAuthenticated(true)
      navigate({ to: '/app/investments' })
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Verification failed')
    },
  })

  const resendMutation = useMutation({
    mutationFn: authApi.resendOtp,
    onSuccess: () => {
      setError('')
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to resend OTP')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    verifyMutation.mutate({ otp, phone })
  }

  const handleResend = () => {
    setError('')
    resendMutation.mutate({ phone })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 mb-4">
            <CheckCircle className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Verify Your Phone
          </h1>
          <p className="text-muted-foreground">
            Enter the 6-digit code sent to<br />
            <span className="font-semibold text-foreground">{phone}</span>
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="otp" className="text-sm font-medium">
                Verification Code
              </Label>
              <Input
                id="otp"
                type="text"
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                className="h-14 text-center text-2xl tracking-widest font-semibold rounded-xl"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium shadow-lg"
              disabled={verifyMutation.isPending}
            >
              {verifyMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-5 w-5" />
                  Verify Phone
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full h-12 rounded-xl hover:bg-slate-100"
              onClick={handleResend}
              disabled={resendMutation.isPending}
            >
              {resendMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resending...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Resend Code
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
