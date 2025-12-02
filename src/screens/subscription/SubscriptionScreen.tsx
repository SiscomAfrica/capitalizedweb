import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { subscriptionApi } from '@/services/subscriptionService'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Check, Loader2, X } from 'lucide-react'
import type { SubscriptionPlan } from '@/types/api'

export function SubscriptionScreen() {
  const queryClient = useQueryClient()
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)

  const { data: plansData, isLoading } = useQuery({
    queryKey: ['subscription-plans'],
    queryFn: subscriptionApi.getPlans,
  })

  const { data: mySubscription } = useQuery({
    queryKey: ['my-subscription'],
    queryFn: subscriptionApi.getMySubscription,
    retry: false,
  })

  const subscribeMutation = useMutation({
    mutationFn: (planId: string) => subscriptionApi.subscribe(planId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-subscription'] })
      setShowDetailsDialog(false)
      setSelectedPlan(null)
    },
  })

  const startTrialMutation = useMutation({
    mutationFn: subscriptionApi.startFreeTrial,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-subscription'] })
    },
  })

  const handlePlanClick = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan)
    setShowDetailsDialog(true)
  }

  const handleSubscribe = () => {
    if (selectedPlan) {
      subscribeMutation.mutate(selectedPlan.id)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Subscription Plans</h1>
          <p className="text-gray-600 text-sm">Choose a plan that works for you</p>
        </div>

        {mySubscription?.subscription?.plan ? (
          <Card className="border-[#191970] bg-gradient-to-br from-[#191970]/5 to-purple-50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-gray-900">Current Plan: {mySubscription.subscription.plan.name}</CardTitle>
                  <CardDescription className="text-gray-600">
                    {mySubscription.subscription.is_trial && <Badge variant="secondary" className="mr-2 bg-purple-100 text-purple-700">Trial</Badge>}
                    Active until {new Date(mySubscription.subscription.end_date).toLocaleDateString()}
                    {' '}({mySubscription.subscription.days_remaining} days remaining)
                  </CardDescription>
                </div>
                <Badge variant={mySubscription.subscription.status === 'active' ? 'default' : 'secondary'} className="bg-[#191970] text-white">
                  {mySubscription.subscription.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Auto-renew: {mySubscription.subscription.auto_renew ? 'Enabled' : 'Disabled'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-dashed border-gray-300">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">No active subscription</p>
                  <p className="text-sm text-gray-600">Start with a free trial or choose a plan below</p>
                </div>
                <Button onClick={() => startTrialMutation.mutate()} disabled={startTrialMutation.isPending} className="bg-[#191970] hover:bg-[#0f0f45] text-white">
                  {startTrialMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Start Free Trial
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {plansData?.plans?.map((plan) => (
            <Card 
              key={plan.id} 
              className="cursor-pointer hover:border-[#191970] hover:shadow-lg transition-all border-gray-200"
              onClick={() => handlePlanClick(plan)}
            >
              <CardHeader>
                <CardTitle className="text-gray-900">{plan.name}</CardTitle>
                <CardDescription className="line-clamp-2 text-gray-600">{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-3xl font-bold text-gray-900">
                  {plan.currency} {plan.price}
                  <span className="text-sm font-normal text-gray-600">
                    /{plan.duration_days} days
                  </span>
                </div>

                <div className="space-y-2">
                  {plan.features.portfolio_tracking && (
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Check className="h-4 w-4 text-green-600" />
                      <span>Portfolio Tracking</span>
                    </div>
                  )}
                  {plan.features.email_notifications && (
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Check className="h-4 w-4 text-green-600" />
                      <span>Email Notifications</span>
                    </div>
                  )}
                  {plan.features.investment_calculator && (
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Check className="h-4 w-4 text-green-600" />
                      <span>Investment Calculator</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>Up to {plan.features.max_investments} Investments</span>
                  </div>
                </div>

                <Button className="w-full h-11 rounded-xl bg-[#191970] hover:bg-[#0f0f45] text-white transition-colors" variant="default">View Details</Button>
              </CardContent>
            </Card>
          ))}
        </div>

      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedPlan?.name} Plan</DialogTitle>
            <DialogDescription>{selectedPlan?.description}</DialogDescription>
          </DialogHeader>
          
          {selectedPlan && (
            <div className="space-y-6">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold">{selectedPlan.currency} {selectedPlan.price}</span>
                <span className="text-muted-foreground">for {selectedPlan.duration_days} days</span>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold">Features included:</h3>
                <div className="grid gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {selectedPlan.features.api_access ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <X className="h-4 w-4 text-red-600" />
                      )}
                      <span>API Access</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {selectedPlan.features.priority_support ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <X className="h-4 w-4 text-red-600" />
                      )}
                      <span>Priority Support</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {selectedPlan.features.advanced_analytics ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <X className="h-4 w-4 text-red-600" />
                      )}
                      <span>Advanced Analytics</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {selectedPlan.features.portfolio_tracking ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <X className="h-4 w-4 text-red-600" />
                      )}
                      <span>Portfolio Tracking</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {selectedPlan.features.email_notifications ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <X className="h-4 w-4 text-red-600" />
                      )}
                      <span>Email Notifications</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {selectedPlan.features.investment_calculator ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <X className="h-4 w-4 text-red-600" />
                      )}
                      <span>Investment Calculator</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      <span>Maximum Investments</span>
                    </div>
                    <Badge variant="secondary">{selectedPlan.features.max_investments}</Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      <span>Withdrawal Requests</span>
                    </div>
                    <Badge variant="secondary">{selectedPlan.features.withdrawal_requests}</Badge>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button 
                  className="flex-1 h-12 rounded-xl bg-[#191970] hover:bg-[#0f0f45] text-white transition-colors" 
                  onClick={handleSubscribe}
                  disabled={subscribeMutation.isPending}
                >
                  {subscribeMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Subscribe Now
                </Button>
                <Button variant="outline" className="h-12 rounded-xl" onClick={() => setShowDetailsDialog(false)}>
                  Cancel
                </Button>
              </div>

              {subscribeMutation.isError && (
                <p className="text-sm text-destructive">
                  Failed to subscribe. Please try again.
                </p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
      </div>
    </div>
  )
}
