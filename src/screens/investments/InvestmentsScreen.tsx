import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { investmentApi } from '@/services/investmentService'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, Loader2 } from 'lucide-react'

export function InvestmentsScreen() {
  const [filters] = useState({
    status: 'active',
    page: 1,
    page_size: 20,
  })

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['investment-products', filters],
    queryFn: () => investmentApi.getProducts(filters),
  })

  const { data: categories } = useQuery({
    queryKey: ['investment-categories'],
    queryFn: () => investmentApi.getCategories(true),
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const products = productsData?.products || []

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-1">
              Investment Opportunities
            </h1>
            <p className="text-muted-foreground">Explore and invest in various products</p>
          </div>
        </div>

        {categories && categories.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">CATEGORIES</h3>
            <div className="flex flex-wrap gap-2">
              {categories.map((category: any) => (
                <Badge 
                  key={category.id} 
                  variant="outline" 
                  className="cursor-pointer hover:bg-blue-100 hover:border-blue-300 transition-colors px-4 py-2 rounded-full"
                >
                  {category.name}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {products.length > 0 ? (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {products.map((product: any) => (
                <Card key={product.id} className="overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border-0 shadow-lg bg-white rounded-2xl">
                  <CardHeader className="pb-3 bg-gradient-to-br from-blue-50 to-purple-50">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-xl font-bold">{product.name}</CardTitle>
                      <Badge 
                        variant={product.status === 'active' ? 'default' : 'secondary'}
                        className="rounded-full"
                      >
                        {product.status}
                      </Badge>
                    </div>
                    <CardDescription className="line-clamp-2 text-sm">
                      {product.description || 'No description available'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-4">
                    <div className="space-y-3">
                      <div className="bg-slate-50 rounded-xl p-3">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-muted-foreground">Price per unit</span>
                          <span className="font-bold text-lg">${product.price_per_unit?.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Min. Investment</span>
                          <span className="font-semibold">${product.minimum_investment?.toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="bg-green-50 rounded-xl p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-green-700 font-medium">Expected Return</span>
                          <div className="flex items-center gap-1 font-bold text-green-600">
                            <TrendingUp className="h-4 w-4" />
                            <span className="text-lg">{product.expected_annual_return}%</span>
                          </div>
                        </div>
                        <p className="text-xs text-green-600 mt-1">per annum</p>
                      </div>

                      {product.investment_type && (
                        <Badge variant="secondary" className="text-xs px-3 py-1 rounded-full">
                          {product.investment_type}
                        </Badge>
                      )}
                    </div>
                    
                    <Button className="w-full h-11 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium shadow-lg">
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {productsData && productsData.total > products.length && (
              <div className="flex justify-center pt-4">
                <p className="text-sm text-muted-foreground bg-white rounded-full px-6 py-2 shadow">
                  Showing {products.length} of {productsData.total} products
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl shadow">
            <p className="text-muted-foreground text-lg">No investment opportunities available</p>
          </div>
        )}
      </div>
    </div>
  )
}
