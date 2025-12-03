import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  TrendingUp, 
  Clock, 
  Shield, 
  DollarSign, 
  Users, 
  Target,
  AlertTriangle,
  CheckCircle,
  Info,
  Calendar,
  Percent
} from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import ResponsiveImage from '../common/ResponsiveImage';
import investmentClient from '../../api/investmentClient';
import {
  formatCurrency,
  formatPercentage,
  formatLargeNumber,
  calculateFundingProgress,
  calculateProjectedReturns,
  calculateMonthlyReturns,
  parseProductData,
  getRiskLevelDetails,
  getStatusStyling,
  formatDuration
} from '../../utils/investmentHelpers';

const ProductDetail = ({ productId: productSlug, onBack, onCreateInquiry }) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch product details
  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await investmentClient.getProduct(productSlug);
      setProduct(response);
    } catch (err) {
      console.error('Error fetching product:', err);
      setError(err.response?.data?.message || 'Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productSlug) {
      fetchProduct();
    }
  }, [productSlug]);

  // Get icon for risk level
  const getRiskIcon = (level) => {
    switch (level) {
      case 'Low':
        return CheckCircle;
      case 'Medium':
        return Info;
      case 'High':
        return AlertTriangle;
      default:
        return Info;
    }
  };

  // Handle create inquiry
  const handleCreateInquiry = () => {
    if (onCreateInquiry) {
      onCreateInquiry(product);
    }
  };

  // Handle retry
  const handleRetry = () => {
    fetchProduct();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorMessage
        message={error}
        onRetry={handleRetry}
      />
    );
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <p className="text-secondary-600">Product not found</p>
        {onBack && (
          <Button
            variant="secondary"
            onClick={onBack}
            className="mt-4"
          >
            Go Back
          </Button>
        )}
      </div>
    );
  }

  const productData = parseProductData(product);
  const riskDetails = getRiskLevelDetails(productData.riskFactors);
  const statusDetails = getStatusStyling(productData.status);
  const RiskIcon = getRiskIcon(riskDetails.level);
  const fundingProgress = calculateFundingProgress(productData.totalRaised, productData.fundingGoal);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-4">
        {onBack && (
          <Button
            variant="secondary"
            size="sm"
            onClick={onBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        )}
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">
            {productData.name}
          </h1>
          {productData.subtitle && (
            <p className="text-lg text-secondary-700 mt-1">
              {productData.subtitle}
            </p>
          )}
          <p className="text-secondary-600 capitalize mt-1">
            {productData.investmentType.replace('-', ' ')} Investment
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Product Image */}
          <Card padding="none" className="overflow-hidden">
            <ResponsiveImage
              src={productData.featuredImage}
              alt={productData.name}
              className="w-full h-64 object-cover"
              aspectRatio="16/9"
              objectFit="cover"
              lazy={true}
              webp={true}
            />
          </Card>

          {/* Funding Progress */}
          <Card>
            <h2 className="text-lg font-semibold text-secondary-900 mb-4">
              Funding Progress
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-secondary-600">Total Raised</span>
                <span className="font-semibold text-secondary-900">
                  {formatCurrency(productData.totalRaised)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-secondary-600">Funding Goal</span>
                <span className="font-semibold text-secondary-900">
                  {formatCurrency(productData.fundingGoal)}
                </span>
              </div>
              <div className="w-full bg-secondary-200 rounded-full h-2">
                <div 
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${fundingProgress}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-secondary-600">
                  {fundingProgress.toFixed(1)}% funded
                </span>
                <span className="text-secondary-600">
                  {formatLargeNumber(productData.totalInvestors)} investors
                </span>
              </div>
            </div>
          </Card>

          {/* Description */}
          <Card>
            <h2 className="text-lg font-semibold text-secondary-900 mb-3">
              About This Investment
            </h2>
            <div className="space-y-4">
              <p className="text-secondary-700 leading-relaxed">
                {productData.description}
              </p>
              {productData.overviewContent && productData.overviewContent !== productData.description && (
                <p className="text-secondary-700 leading-relaxed">
                  {productData.overviewContent}
                </p>
              )}
            </div>
          </Card>

          {/* How It Works */}
          {productData.howItWorks && (
            <Card>
              <h2 className="text-lg font-semibold text-secondary-900 mb-3">
                How It Works
              </h2>
              <p className="text-secondary-700 leading-relaxed">
                {productData.howItWorks}
              </p>
            </Card>
          )}

          {/* Key Features */}
          {Object.keys(productData.features).length > 0 && (
            <Card>
              <h2 className="text-lg font-semibold text-secondary-900 mb-4">
                Key Features
              </h2>
              <div className="grid grid-cols-1 gap-3">
                {Object.entries(productData.features).map(([key, feature]) => (
                  <div key={key} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-success-600 mt-0.5 flex-shrink-0" />
                    <span className="text-secondary-700">{feature}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Technical Specifications */}
          {(productData.technicalSpecs.hardware_specs || productData.technicalSpecs.network_infrastructure) && (
            <Card>
              <h2 className="text-lg font-semibold text-secondary-900 mb-4">
                Technical Specifications
              </h2>
              <div className="space-y-4">
                {productData.technicalSpecs.hardware_specs && (
                  <div>
                    <h3 className="font-medium text-secondary-900 mb-2">Hardware Specifications</h3>
                    <ul className="space-y-1">
                      {productData.technicalSpecs.hardware_specs.map((spec, index) => (
                        <li key={index} className="text-sm text-secondary-700 flex items-start gap-2">
                          <span className="w-1.5 h-1.5 bg-primary-600 rounded-full mt-2 flex-shrink-0" />
                          {spec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {productData.technicalSpecs.network_infrastructure && (
                  <div>
                    <h3 className="font-medium text-secondary-900 mb-2">Network Infrastructure</h3>
                    <ul className="space-y-1">
                      {productData.technicalSpecs.network_infrastructure.map((spec, index) => (
                        <li key={index} className="text-sm text-secondary-700 flex items-start gap-2">
                          <span className="w-1.5 h-1.5 bg-primary-600 rounded-full mt-2 flex-shrink-0" />
                          {spec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Use Cases */}
          {Object.keys(productData.useCases).length > 0 && (
            <Card>
              <h2 className="text-lg font-semibold text-secondary-900 mb-4">
                Use Cases
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(productData.useCases).map(([key, useCase]) => (
                  <div key={key} className="flex items-center gap-3 p-3 bg-secondary-50 rounded-lg">
                    <Target className="h-5 w-5 text-primary-600 flex-shrink-0" />
                    <span className="text-secondary-700">{useCase}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Risk Factors */}
          {Object.keys(productData.riskFactors).length > 0 && (
            <Card>
              <h2 className="text-lg font-semibold text-secondary-900 mb-4">
                Risk Assessment
              </h2>
              <div className="space-y-4">
                {Object.entries(productData.riskFactors).map(([key, risk]) => {
                  if (!risk.name) return null;
                  const riskLevelColor = risk.level === 'High' ? 'text-error-600 bg-error-100' :
                                       risk.level === 'Medium' ? 'text-warning-600 bg-warning-100' :
                                       'text-success-600 bg-success-100';
                  return (
                    <div key={key} className="border border-secondary-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium text-secondary-900">{risk.name}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${riskLevelColor}`}>
                          {risk.level} Risk
                        </span>
                      </div>
                      <p className="text-sm text-secondary-600">{risk.description}</p>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* Capital Allocation */}
          {productData.capitalAllocation.funding_breakdown && (
            <Card>
              <h2 className="text-lg font-semibold text-secondary-900 mb-4">
                Capital Allocation
              </h2>
              <div className="space-y-4">
                {productData.capitalAllocation.description && (
                  <p className="text-secondary-700">{productData.capitalAllocation.description}</p>
                )}
                <div className="space-y-3">
                  {productData.capitalAllocation.funding_breakdown.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-secondary-900">{item.category}</h4>
                        <p className="text-sm text-secondary-600">{item.description}</p>
                      </div>
                      <span className="font-semibold text-primary-600">{item.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Key Metrics */}
          <Card>
            <h2 className="text-lg font-semibold text-secondary-900 mb-4">
              Investment Details
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <DollarSign className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <p className="text-sm text-secondary-500">Minimum Investment</p>
                  <p className="font-semibold text-secondary-900">
                    {formatCurrency(productData.minimumInvestment)}
                  </p>
                </div>
              </div>

              {productData.maximumInvestment > 0 && (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <Target className="h-5 w-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-sm text-secondary-500">Maximum Investment</p>
                    <p className="font-semibold text-secondary-900">
                      {formatCurrency(productData.maximumInvestment)}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <div className="p-2 bg-success-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-success-600" />
                </div>
                <div>
                  <p className="text-sm text-secondary-500">Expected Annual Return</p>
                  <p className="font-semibold text-success-600">
                    {formatPercentage(productData.expectedAnnualReturn)}
                  </p>
                </div>
              </div>

              {productData.expectedMonthlyReturn > 0 && (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-success-100 rounded-lg">
                    <Percent className="h-5 w-5 text-success-600" />
                  </div>
                  <div>
                    <p className="text-sm text-secondary-500">Expected Monthly Return</p>
                    <p className="font-semibold text-success-600">
                      {formatPercentage(productData.expectedMonthlyReturn)}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <div className="p-2 bg-warning-100 rounded-lg">
                  <Clock className="h-5 w-5 text-warning-600" />
                </div>
                <div>
                  <p className="text-sm text-secondary-500">Investment Duration</p>
                  <p className="font-semibold text-secondary-900">
                    {formatDuration(productData.duration)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${riskDetails.bgColor}`}>
                  <Shield className={`h-5 w-5 ${riskDetails.color}`} />
                </div>
                <div>
                  <p className="text-sm text-secondary-500">Risk Level</p>
                  <p className={`font-semibold ${riskDetails.color}`}>
                    {riskDetails.level}
                  </p>
                </div>
              </div>

              {productData.totalUnitsAvailable > 0 && (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-info-100 rounded-lg">
                    <Users className="h-5 w-5 text-info-600" />
                  </div>
                  <div>
                    <p className="text-sm text-secondary-500">Units Available</p>
                    <p className="font-semibold text-secondary-900">
                      {formatLargeNumber(productData.totalUnitsAvailable - productData.unitsSold)} / {formatLargeNumber(productData.totalUnitsAvailable)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Projected Returns Calculator */}
          <Card>
            <h3 className="font-semibold text-secondary-900 mb-3">
              Projected Returns
            </h3>
            <div className="space-y-4">
              {/* Annual Returns */}
              <div>
                <h4 className="text-sm font-medium text-secondary-700 mb-2">Annual Returns</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-secondary-600">
                      On minimum investment:
                    </span>
                    <span className="font-semibold text-success-600">
                      {formatCurrency(calculateProjectedReturns(productData.minimumInvestment, productData.expectedAnnualReturn))}
                    </span>
                  </div>
                  
                  {productData.maximumInvestment > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-secondary-600">
                        On maximum investment:
                      </span>
                      <span className="font-semibold text-success-600">
                        {formatCurrency(calculateProjectedReturns(productData.maximumInvestment, productData.expectedAnnualReturn))}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Monthly Returns */}
              {productData.expectedMonthlyReturn > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-secondary-700 mb-2">Monthly Returns</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-secondary-600">
                        On minimum investment:
                      </span>
                      <span className="font-semibold text-primary-600">
                        {formatCurrency(calculateMonthlyReturns(productData.minimumInvestment, productData.expectedMonthlyReturn))}
                      </span>
                    </div>
                    
                    {productData.maximumInvestment > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-secondary-600">
                          On maximum investment:
                        </span>
                        <span className="font-semibold text-primary-600">
                          {formatCurrency(calculateMonthlyReturns(productData.maximumInvestment, productData.expectedMonthlyReturn))}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Variable Rates Information */}
              {productData.useVariableRates && productData.yearlyReturnRates.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-secondary-700 mb-2">Yearly Return Rates</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {productData.yearlyReturnRates.map((rate, index) => (
                      <div key={index} className="text-center p-2 bg-secondary-50 rounded">
                        <div className="text-xs text-secondary-500">Year {index + 1}</div>
                        <div className="font-semibold text-secondary-900">{formatPercentage(rate)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-4 p-3 bg-secondary-50 rounded-lg">
              <p className="text-xs text-secondary-600">
                * Projected returns are estimates based on expected performance and are not guaranteed.
                {productData.useVariableRates && " Returns may vary based on market conditions."}
              </p>
            </div>
          </Card>

          {/* Action Button */}
          <Button
            variant="primary"
            size="lg"
            onClick={handleCreateInquiry}
            className="w-full"
            disabled={productData.status !== 'active'}
          >
            {productData.status === 'active' ? 'Create Investment Inquiry' : statusDetails.label}
          </Button>

          {/* Status Badge */}
          <div className="text-center">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusDetails.bgColor} ${statusDetails.color} border ${statusDetails.borderColor}`}
            >
              {statusDetails.label}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductDetail;