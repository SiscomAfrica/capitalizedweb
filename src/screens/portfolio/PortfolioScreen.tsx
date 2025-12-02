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
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Portfolio</h1>
        <p className="text-muted-foreground">Track your investments and earnings</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Total Invested</CardDescription>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${parseFloat(summary?.total_invested || '0').toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Current Value</CardDescription>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${parseFloat(summary?.current_value || '0').toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Total Earnings</CardDescription>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${parseFloat(summary?.total_earnings || '0').toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>ROI</CardDescription>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {parseFloat(summary?.roi_percentage || '0').toFixed(2)}%
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">My Investments</h2>
        <div className="space-y-3">
          {investments?.map((investment: any) => (
            <Card key={investment.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{investment.product_name}</CardTitle>
                    <CardDescription>{investment.product_type}</CardDescription>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
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
                    <p className="text-muted-foreground">Invested</p>
                    <p className="font-semibold">${parseFloat(investment.amount_invested).toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Current Value</p>
                    <p className="font-semibold">${parseFloat(investment.current_value).toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Earnings</p>
                    <p className="font-semibold text-green-600">
                      ${parseFloat(investment.total_earnings).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Units</p>
                    <p className="font-semibold">{parseFloat(investment.units_purchased).toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {!investments || investments.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No investments yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
