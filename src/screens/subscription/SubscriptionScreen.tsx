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
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Subscription Plans</h1>
        <p className="text-muted-foreground">Choose a plan that works for you</p>
      </div>

      {mySubscription?.subscription?.plan ? (
        <Card className="border-primary">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Current Plan: {mySubscription.subscription.plan.name}</CardTitle>
                <CardDescription>
                  {mySubscription.subscription.is_trial && <Badge variant="secondary" className="mr-2">Trial</Badge>}
                  Active until {new Date(mySubscription.subscription.end_date).toLocaleDateString()}
                  {' '}({mySubscription.subscription.days_remaining} days remaining)
                </CardDescription>
              </div>
              <Badge variant={mySubscription.subscription.status === 'active' ? 'default' : 'secondary'}>
                {mySubscription.subscription.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Auto-renew: {mySubscription.subscription.auto_renew ? 'Enabled' : 'Disabled'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-dashed">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">No active subscription</p>
                <p className="text-sm text-muted-foreground">Start with a free trial or choose a plan below</p>
              </div>
              <Button onClick={() => startTrialMutation.mutate()} disabled={startTrialMutation.isPending}>
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
            className="cursor-pointer hover:border-primary transition-colors"
            onClick={() => handlePlanClick(plan)}
          >
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription className="line-clamp-2">{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-3xl font-bold">
                {plan.currency} {plan.price}
                <span className="text-sm font-normal text-muted-foreground">
                  /{plan.duration_days} days
                </span>
              </div>

              <div className="space-y-2">
                {plan.features.portfolio_tracking && (
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>Portfolio Tracking</span>
                  </div>
                )}
                {plan.features.email_notifications && (
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>Email Notifications</span>
                  </div>
                )}
                {plan.features.investment_calculator && (
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>Investment Calculator</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Up to {plan.features.max_investments} Investments</span>
                </div>
              </div>

              <Button className="w-full" variant="outline">View Details</Button>
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
                  className="flex-1" 
                  onClick={handleSubscribe}
                  disabled={subscribeMutation.isPending}
                >
                  {subscribeMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Subscribe Now
                </Button>
                <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
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
  )
}
