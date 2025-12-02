import { useState } from 'react'
import { useNavigate, useParams } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { investmentApi } from '@/services/investmentService'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, TrendingUp, DollarSign, Calendar, Target, Loader2 } from 'lucide-react'

export function ProductDetailsScreen() {
  const navigate = useNavigate()
  const { productId } = useParams({ from: '/app/investments/$productId' })
  const queryClient = useQueryClient()
  const [investmentAmount, setInvestmentAmount] = useState('')
  const [units, setUnits] = useState('')

  const { data: product, isLoading } = useQuery({
    queryKey: ['investment-product', productId],
    queryFn: () => investmentApi.getProductById(productId),
  })

  const investMutation = useMutation({
    mutationFn: (data: { product_id: string; amount: number; units: number }) =>
      investmentApi.invest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio-investments'] })
      queryClient.invalidateQueries({ queryKey: ['portfolio-summary'] })
      navigate({ to: '/app/portfolio' })
    },
  })

  const handleAmountChange = (value: string) => {
    setInvestmentAmount(value)
    if (product && value) {
      const amount = parseFloat(value)
      const calculatedUnits = amount / product.price_per_unit
      setUnits(calculatedUnits.toFixed(2))
    } else {
      setUnits('')
    }
  }

  const handleUnitsChange = (value: string) => {
    setUnits(value)
    if (product && value) {
      const unitsValue = parseFloat(value)
      const calculatedAmount = unitsValue * product.price_per_unit
      setInvestmentAmount(calculatedAmount.toFixed(2))
    } else {
      setInvestmentAmount('')
    }
  }

  const handleInvest = () => {
    if (!product || !investmentAmount || !units) return

    const amount = parseFloat(investmentAmount)
    const unitsValue = parseFloat(units)

    if (amount < product.minimum_investment) {
      alert(`Minimum investment is $${product.minimum_investment}`)
      return
    }

    investMutation.mutate({
      product_id: product.id,
      amount,
      units: unitsValue,
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#191970]" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Product not found</p>
          <Button onClick={() => navigate({ to: '/app/investments' })} className="bg-[#191970] hover:bg-[#0f0f45]">
            Back to Investments
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 space-y-5">
        <Button
          variant="ghost"
          onClick={() => navigate({ to: '/app/investments' })}
          className="mb-2 text-gray-700 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Investments
        </Button>

        <Card className="border-gray-200">
          <CardHeader>
            <div className="flex items-start justify-between mb-2">
              <div>
                <CardTitle className="text-2xl text-gray-900">{product.name}</CardTitle>
                <Badge variant="secondary" className="mt-2 bg-gray-100 text-gray-700">
                  {product.investment_type}
                </Badge>
              </div>
              <Badge className="bg-[#191970] text-white">
                {product.status}
              </Badge>
            </div>
            {product.description && (
              <CardDescription className="text-gray-600 text-base mt-3">
                {product.description}
              </CardDescription>
            )}
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-[#191970]" />
                  </div>
                  <p className="text-sm text-gray-600">Price per Unit</p>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  ${product.price_per_unit.toLocaleString()}
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-10 w-10 rounded-full bg-purple-50 flex items-center justify-center">
                    <Target className="h-5 w-5 text-purple-600" />
                  </div>
                  <p className="text-sm text-gray-600">Min. Investment</p>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  ${product.minimum_investment.toLocaleString()}
                </p>
              </div>

              <div className="bg-green-50 rounded-xl p-4 md:col-span-2">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                  <p className="text-sm text-green-700">Expected Annual Return</p>
                </div>
                <p className="text-3xl font-bold text-green-600">
                  {product.expected_annual_return}% per annum
                </p>
              </div>

              {product.investment_duration_months && (
                <div className="bg-gray-50 rounded-xl p-4 md:col-span-2">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-10 w-10 rounded-full bg-orange-50 flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-orange-600" />
                    </div>
                    <p className="text-sm text-gray-600">Investment Duration</p>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {product.investment_duration_months} months
                  </p>
                </div>
              )}
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Make an Investment</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-gray-700">Investment Amount ($)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    value={investmentAmount}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    className="h-12 rounded-xl"
                  />
                  <p className="text-xs text-gray-500">
                    Minimum: ${product.minimum_investment.toLocaleString()}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="units" className="text-gray-700">Number of Units</Label>
                  <Input
                    id="units"
                    type="number"
                    placeholder="0.00"
                    value={units}
                    onChange={(e) => handleUnitsChange(e.target.value)}
                    className="h-12 rounded-xl"
                  />
                  <p className="text-xs text-gray-500">
                    @ ${product.price_per_unit.toLocaleString()} per unit
                  </p>
                </div>
              </div>

              {investmentAmount && parseFloat(investmentAmount) >= product.minimum_investment && (
                <div className="bg-blue-50 rounded-xl p-4 mt-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Investment Projection</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Investment Amount:</span>
                      <span className="font-semibold text-gray-900">
                        ${parseFloat(investmentAmount).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Expected Annual Return:</span>
                      <span className="font-semibold text-green-600">
                        ${(parseFloat(investmentAmount) * product.expected_annual_return / 100).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-blue-200 pt-2 mt-2">
                      <span className="text-gray-600">Total Value After 1 Year:</span>
                      <span className="font-bold text-gray-900 text-base">
                        ${(parseFloat(investmentAmount) * (1 + product.expected_annual_return / 100)).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <Button
                onClick={handleInvest}
                disabled={!investmentAmount || !units || investMutation.isPending}
                className="w-full h-12 rounded-xl bg-[#191970] hover:bg-[#0f0f45] text-white font-medium mt-6 transition-colors"
              >
                {investMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Invest Now'
                )}
              </Button>

              {investMutation.isError && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm mt-4">
                  Failed to process investment. Please try again.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
