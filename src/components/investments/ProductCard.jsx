import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Clock, Shield, DollarSign } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import ResponsiveImage from '../common/ResponsiveImage';
import {
  formatCurrency,
  formatPercentage,
  parseProductData,
  getRiskLevelDetails,
  getStatusStyling
} from '../../utils/investmentHelpers';

const ProductCard = ({ product, onClick }) => {
  if (!product) return null;

  // Parse product data using helper function
  const productData = parseProductData(product);
  const riskDetails = getRiskLevelDetails(productData.riskFactors);
  const statusDetails = getStatusStyling(productData.status);

  const handleCardClick = () => {
    if (onClick) {
      onClick(productData.slug || productData.id); // Use slug if available, fallback to id
    }
  };

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
    >
      <Card
        onClick={handleCardClick}
        className="h-full flex flex-col overflow-hidden group"
        padding="none"
        shadow="soft"
      >
        {/* Product Image */}
        <div className="relative h-48 overflow-hidden">
          <ResponsiveImage
            src={productData.featuredImage}
            alt={productData.name}
            className="transition-transform duration-300 group-hover:scale-105"
            aspectRatio="16/9"
            objectFit="cover"
            lazy={true}
            webp={true}
            sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 33vw"
            breakpoints={{
              mobile: 400,
              tablet: 600,
              desktop: 800
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>

        <div className="p-4 flex-1 flex flex-col">
          {/* Header with badges */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-secondary-900 mb-1 line-clamp-2">
                {productData.name}
              </h3>
              {productData.subtitle && (
                <p className="text-sm text-secondary-600 mb-1">
                  {productData.subtitle}
                </p>
              )}
              <p className="text-xs text-secondary-500 capitalize">
                {productData.investmentType.replace('-', ' ')}
              </p>
            </div>
            <div className="flex flex-col gap-1 ml-3">
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full border ${statusDetails.bgColor} ${statusDetails.color} ${statusDetails.borderColor}`}
              >
                {productData.status}
              </span>
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full border ${riskDetails.bgColor} ${riskDetails.color} ${riskDetails.borderColor}`}
              >
                {riskDetails.level.toLowerCase()} risk
              </span>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-secondary-600 mb-4 line-clamp-3 flex-1">
            {productData.shortDescription || productData.description}
          </p>

          {/* Key metrics */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-primary-100 rounded-lg">
                <DollarSign className="h-4 w-4 text-primary-600" />
              </div>
              <div>
                <p className="text-xs text-secondary-500">Min. Investment</p>
                <p className="text-sm font-semibold text-secondary-900">
                  {formatCurrency(productData.minimumInvestment)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-success-100 rounded-lg">
                <TrendingUp className="h-4 w-4 text-success-600" />
              </div>
              <div>
                <p className="text-xs text-secondary-500">Expected Return</p>
                <p className="text-sm font-semibold text-success-600">
                  {formatPercentage(productData.expectedAnnualReturn)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 col-span-2">
              <div className="p-1.5 bg-warning-100 rounded-lg">
                <Clock className="h-4 w-4 text-warning-600" />
              </div>
              <div>
                <p className="text-xs text-secondary-500">Duration</p>
                <p className="text-sm font-semibold text-secondary-900">
                  {productData.duration} {productData.duration === 1 ? 'month' : 'months'}
                </p>
              </div>
            </div>
          </div>

          {/* Action button */}
          <Button
            variant="primary"
            size="sm"
            className="w-full mt-auto"
            onClick={(e) => {
              e.stopPropagation();
              handleCardClick();
            }}
          >
            View Details
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};

export default ProductCard;