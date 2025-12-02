import { useState } from 'react'
import { Link } from '@tanstack/react-router'
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
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              Investment Opportunities
            </h1>
            <p className="text-gray-600 text-sm">Explore and invest in various products</p>
          </div>
        </div>

        {categories && categories.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <h3 className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">Categories</h3>
            <div className="flex flex-wrap gap-2">
              {categories.map((category: any) => (
                <Badge 
                  key={category.id} 
                  variant="outline" 
                  className="cursor-pointer hover:bg-[#191970] hover:text-white hover:border-[#191970] transition-all px-4 py-2 rounded-full border-gray-300"
                >
                  {category.name}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {products.length > 0 ? (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {products.map((product: any) => (
                <Card key={product.id} className="overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-200 bg-white rounded-2xl">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg font-bold text-gray-900">{product.name}</CardTitle>
                      <Badge 
                        variant={product.status === 'active' ? 'default' : 'secondary'}
                        className="rounded-full bg-[#191970] text-white"
                      >
                        {product.status}
                      </Badge>
                    </div>
                    <CardDescription className="line-clamp-2 text-sm text-gray-600">
                      {product.description || 'No description available'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-4">
                    <div className="space-y-3">
                      <div className="bg-gray-50 rounded-xl p-3">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-gray-600">Price per unit</span>
                          <span className="font-bold text-lg text-gray-900">${product.price_per_unit?.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Min. Investment</span>
                          <span className="font-semibold text-gray-900">${product.minimum_investment?.toLocaleString()}</span>
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
                        <Badge variant="secondary" className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-700">
                          {product.investment_type}
                        </Badge>
                      )}
                    </div>
                    
                    <Link 
                      to="/app/investments/$productId" 
                      params={{ productId: product.id }}
                      className="block"
                    >
                      <Button 
                        className="w-full h-11 rounded-xl bg-[#191970] hover:bg-[#0f0f45] text-white font-medium transition-colors"
                      >
                        View Details
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>

            {productsData && productsData.total > products.length && (
              <div className="flex justify-center pt-4">
                <p className="text-sm text-gray-600 bg-white rounded-full px-6 py-2 shadow-sm border border-gray-200">
                  Showing {products.length} of {productsData.total} products
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
            <p className="text-gray-600 text-base">No investment opportunities available</p>
          </div>
        )}
      </div>
    </div>
  )
}
