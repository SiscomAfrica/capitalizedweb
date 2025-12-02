import { useState } from 'react'
import { useNavigate, Link } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import { authApi } from '@/services/authService'
import { tokenManager, STORAGE_KEYS } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Mail, Lock } from 'lucide-react'

export function LoginScreen() {
  const navigate = useNavigate()
  const setAuthenticated = useAuthStore((state: any) => state.setAuthenticated)
  const setUser = useAuthStore((state: any) => state.setUser)
  
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data: any) => {
      tokenManager.setTokens(data.access_token, data.refresh_token)
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(data.user))
      setUser(data.user)
      setAuthenticated(true)
      navigate({ to: '/app/investments' })
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Login failed')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    loginMutation.mutate({ identifier, password })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Capitalized
          </h1>
          <p className="text-muted-foreground">Welcome back! Sign in to continue</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="identifier" className="text-sm font-medium">
                Email or Phone
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="identifier"
                  type="text"
                  placeholder="Enter your email or phone"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="pl-10 h-12 rounded-xl"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-12 rounded-xl"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium shadow-lg"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>

            <div className="text-center pt-4">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Link to="/auth/register" className="text-blue-600 hover:text-blue-700 font-medium">
                  Create Account
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
