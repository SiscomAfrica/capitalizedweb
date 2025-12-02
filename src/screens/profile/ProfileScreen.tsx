import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { userApi } from '@/services/userService'
import { useAuthStore } from '@/store/authStore'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { User, Mail, Phone, MapPin, Calendar, Shield, LogOut } from 'lucide-react'

export function ProfileScreen() {
  const navigate = useNavigate()
  const logout = useAuthStore((state: any) => state.logout)

  const { data: user, isLoading } = useQuery({
    queryKey: ['user-profile'],
    queryFn: userApi.getProfile,
  })

  const handleLogout = () => {
    logout()
    navigate({ to: '/auth/login' })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Profile</h1>
          <p className="text-gray-600 text-sm">Manage your account information</p>
        </div>

        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-gray-900">Personal Information</CardTitle>
            <CardDescription className="text-gray-600">Your account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
                <User className="h-5 w-5 text-[#191970]" />
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Full Name</p>
                <p className="font-medium text-gray-900">{user?.full_name || 'Not provided'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-purple-50 flex items-center justify-center">
                <Mail className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Email</p>
                <p className="font-medium text-gray-900">{user?.email || 'Not provided'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center">
                <Phone className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Phone</p>
                <p className="font-medium text-gray-900">{user?.phone || 'Not provided'}</p>
              </div>
            </div>

            {user?.country && (
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-orange-50 flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Location</p>
                  <p className="font-medium text-gray-900">
                    {user.city && `${user.city}, `}{user.country}
                  </p>
                </div>
              </div>
            )}

            {user?.date_of_birth && (
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-pink-50 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-pink-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Date of Birth</p>
                  <p className="font-medium text-gray-900">
                    {new Date(user.date_of_birth).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-gray-900">Account Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
                <Shield className="h-5 w-5 text-[#191970]" />
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">KYC Status</p>
                <p className={`font-medium ${
                  user?.kyc_status === 'approved' 
                    ? 'text-green-600' 
                    : user?.kyc_status === 'pending'
                    ? 'text-yellow-600'
                    : 'text-red-600'
                }`}>
                  {user?.kyc_status || 'Not submitted'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center">
                <Phone className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Phone Verification</p>
                <p className={`font-medium ${user?.phone_verified ? 'text-green-600' : 'text-red-600'}`}>
                  {user?.phone_verified ? 'Verified' : 'Not verified'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button
          variant="destructive"
          className="w-full h-12 rounded-xl font-medium"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  )
}
