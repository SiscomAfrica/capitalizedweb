import { useQuery } from '@tanstack/react-query'
import { portfolioApi } from '@/services/portfolioService'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Wallet, TrendingUp, DollarSign, ArrowUpRight } from 'lucide-react'

export function PortfolioScreen() {
  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ['portfolio-summary'],
    queryFn: portfolioApi.getPortfolioSummary,
  })

  const { data: investments, isLoading: investmentsLoading } = useQuery({
    queryKey: ['portfolio-investments'],
    queryFn: () => portfolioApi.getInvestments(),
  })

  if (summaryLoading || investmentsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-muted-foreground">Loading portfolio...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Portfolio</h1>
          <p className="text-gray-600 text-sm">Track your investments and earnings</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardDescription className="text-gray-600">Total Invested</CardDescription>
              <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-[#191970]" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                ${parseFloat(summary?.total_invested || '0').toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardDescription className="text-gray-600">Current Value</CardDescription>
              <div className="h-10 w-10 rounded-full bg-purple-50 flex items-center justify-center">
                <Wallet className="h-5 w-5 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                ${parseFloat(summary?.current_value || '0').toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardDescription className="text-gray-600">Total Earnings</CardDescription>
              <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                ${parseFloat(summary?.total_earnings || '0').toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardDescription className="text-gray-600">ROI</CardDescription>
              <div className="h-10 w-10 rounded-full bg-orange-50 flex items-center justify-center">
                <ArrowUpRight className="h-5 w-5 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {parseFloat(summary?.roi_percentage || '0').toFixed(2)}%
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">My Investments</h2>
          <div className="space-y-3">
            {investments?.map((investment: any) => (
              <Card key={investment.id} className="border-gray-200">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base text-gray-900">{investment.product_name}</CardTitle>
                      <CardDescription className="text-gray-600">{investment.product_type}</CardDescription>
                    </div>
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                      investment.status === 'active' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {investment.status}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600 mb-1">Invested</p>
                      <p className="font-semibold text-gray-900">${parseFloat(investment.amount_invested).toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 mb-1">Current Value</p>
                      <p className="font-semibold text-gray-900">${parseFloat(investment.current_value).toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 mb-1">Earnings</p>
                      <p className="font-semibold text-green-600">
                        ${parseFloat(investment.total_earnings).toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 mb-1">Units</p>
                      <p className="font-semibold text-gray-900">{parseFloat(investment.units_purchased).toFixed(2)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {!investments || investments.length === 0 && (
              <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
                <p className="text-gray-600">No investments yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
