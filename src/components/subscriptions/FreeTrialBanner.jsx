import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Sparkles, CheckCircle, ArrowRight, Gift } from 'lucide-react';
import { format } from 'date-fns';
import subscriptionClient from '../../api/subscriptionClient';
import useAuth from '../../hooks/useAuth';
import Button from '../common/Button';
import Card from '../common/Card';

/**
 * FreeTrialBanner Component
 * Shows prominent free trial status and benefits
 */
const FreeTrialBanner = ({ className = '' }) => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const response = await subscriptionClient.getMySubscription();
        setSubscription(response);
      } catch (err) {
        // User might not have a subscription
        setSubscription(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, []);

  // Don't show banner if loading or no trial
  if (loading || !subscription || subscription.status !== 'trial') {
    return null;
  }

  const { endDate, startDate, planName } = subscription;

  // Calculate trial progress
  const now = new Date();
  const end = new Date(endDate);
  const start = new Date(startDate);
  const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  const remainingDays = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
  const progressPercentage = Math.min(100, Math.max(0, ((now - start) / (end - start)) * 100));

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`mb-8 ${className}`}
    >
      <Card className="overflow-hidden border-0 shadow-xl">
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-1">
          <div className="bg-white rounded-lg p-6">
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Gift className="w-8 h-8 text-purple-600" />
              </div>

              {/* Content */}
              <div className="flex-grow">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Free Trial Active
                  </h2>
                  <span className="px-3 py-1 bg-gradient-to-r from-blue-100 to-purple-100 text-purple-800 text-sm font-medium rounded-full">
                    PREMIUM ACCESS
                  </span>
                </div>

                <p className="text-gray-700 mb-4">
                  You're enjoying full premium access to <strong>{planName}</strong> until{' '}
                  <strong className="text-purple-600">{formatDate(endDate)}</strong>. 
                  Make the most of your trial period!
                </p>

                {/* Trial Progress */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-medium text-gray-900">Trial Progress</span>
                    </div>
                    <span className="text-sm font-medium text-purple-600">
                      {Math.max(0, remainingDays)} of {totalDays} days remaining
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500 relative overflow-hidden"
                      style={{ width: `${progressPercentage}%` }}
                    >
                      <div className="absolute inset-0 bg-white/20 animate-pulse" />
                    </div>
                  </div>
                  
                  {remainingDays <= 3 && (
                    <p className="text-sm text-orange-600 mt-2 font-medium">
                      Your trial expires soon! Consider upgrading to continue enjoying premium features.
                    </p>
                  )}
                </div>

                {/* Benefits Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Unlimited Inquiries</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Premium Insights</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Advanced Tools</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Priority Support</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="primary"
                    onClick={() => window.location.href = '/subscriptions/plans'}
                    className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
                  >
                    Continue with Premium
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    variant="secondary"
                    onClick={() => window.location.href = '/investments/products'}
                    className="flex items-center gap-2"
                  >
                    Explore Investments
                  </Button>
                  
                  <Button
                    variant="secondary"
                    onClick={() => window.location.href = '/portfolio'}
                    className="flex items-center gap-2"
                  >
                    View Portfolio
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default FreeTrialBanner;