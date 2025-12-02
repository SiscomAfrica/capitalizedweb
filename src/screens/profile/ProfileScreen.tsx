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
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Profile</h1>
        <p className="text-muted-foreground">Manage your account information</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Your account details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Full Name</p>
              <p className="font-medium">{user?.full_name || 'Not provided'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{user?.email || 'Not provided'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Phone className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Phone</p>
              <p className="font-medium">{user?.phone || 'Not provided'}</p>
            </div>
          </div>

          {user?.country && (
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Location</p>
                <p className="font-medium">
                  {user.city && `${user.city}, `}{user.country}
                </p>
              </div>
            </div>
          )}

          {user?.date_of_birth && (
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Date of Birth</p>
                <p className="font-medium">
                  {new Date(user.date_of_birth).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">KYC Status</p>
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
            <Phone className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Phone Verification</p>
              <p className={`font-medium ${user?.phone_verified ? 'text-green-600' : 'text-red-600'}`}>
                {user?.phone_verified ? 'Verified' : 'Not verified'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button
        variant="destructive"
        className="w-full"
        onClick={handleLogout}
      >
        <LogOut className="mr-2 h-4 w-4" />
        Logout
      </Button>
    </div>
  )
}
