import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Button from '../common/Button';
import { useAuthContext } from '../../contexts/AuthContext';
import authClient from '../../api/authClient';

const PhoneVerification = ({ phone, onSuccess }) => {
  const { verifyPhone } = useAuthContext();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [initialOtpSent, setInitialOtpSent] = useState(false);
  const inputRefs = useRef([]);

  // Send initial OTP when component mounts
  useEffect(() => {
    const sendInitialOtp = async () => {
      if (!phone || initialOtpSent) return;
      
      setResendLoading(true);
      try {
        await authClient.resendOTP(phone);
        setResendTimer(60);
        setInitialOtpSent(true);
        
        // Show success message briefly
        setErrors({ 
          success: 'Verification code sent to your phone!' 
        });
        
        // Clear success message after 4 seconds
        setTimeout(() => {
          setErrors(prev => {
            const { success, ...rest } = prev;
            return rest;
          });
        }, 4000);
        
      } catch (error) {
        console.error('Initial OTP send error:', error);
        setErrors({ 
          general: 'Failed to send verification code. Please try resending.' 
        });
      } finally {
        setResendLoading(false);
      }
    };

    sendInitialOtp();
  }, [phone, initialOtpSent]);

  // Countdown timer effect
  useEffect(() => {
    let interval = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(timer => timer - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [resendTimer]);

  const handleOtpChange = (index, value) => {
    // Only allow digits
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Clear errors when user starts typing
    if (errors.otp || errors.general) {
      setErrors(prev => {
        const { otp, general, ...rest } = prev;
        return rest;
      });
    }

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    
    // Handle paste
    if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      navigator.clipboard.readText().then(text => {
        const digits = text.replace(/\D/g, '').slice(0, 6);
        const newOtp = [...otp];
        for (let i = 0; i < digits.length && i < 6; i++) {
          newOtp[i] = digits[i];
        }
        setOtp(newOtp);
        
        // Focus the next empty input or the last one
        const nextIndex = Math.min(digits.length, 5);
        inputRefs.current[nextIndex]?.focus();
      });
    }
  };

  const validateOtp = () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setErrors({ otp: 'Please enter the complete 6-digit code' });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateOtp()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const otpString = otp.join('');
      const response = await verifyPhone(phone, otpString);
      
      // Call success callback with response data
      if (onSuccess) {
        onSuccess(response);
      }
    } catch (error) {
      console.error('Phone verification error:', error);
      
      // Handle different error types
      if (error.response?.status === 400) {
        setErrors({ 
          otp: 'Invalid verification code. Please check and try again.' 
        });
      } else if (error.response?.status === 410) {
        setErrors({ 
          general: 'Verification code has expired. Please request a new one.' 
        });
      } else if (error.response?.data?.detail) {
        // API returned specific error message
        setErrors({ 
          general: error.response.data.detail 
        });
      } else if (error.message === 'Network Error') {
        setErrors({ 
          general: 'Connection error. Please check your internet connection and try again.' 
        });
      } else {
        setErrors({ 
          general: 'Verification failed. Please try again later.' 
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0 || !phone) return;

    setResendLoading(true);
    setErrors({});

    try {
      await authClient.resendOTP(phone);
      setResendTimer(60); // Reset timer
      
      // Clear current OTP
      setOtp(['', '', '', '', '', '']);
      
      // Focus first input
      inputRefs.current[0]?.focus();
      
      // Show success message briefly
      setErrors({ 
        success: 'New verification code sent to your phone!' 
      });
      
      // Clear success message after 4 seconds
      setTimeout(() => {
        setErrors(prev => {
          const { success, ...rest } = prev;
          return rest;
        });
      }, 4000);
      
    } catch (error) {
      console.error('Resend OTP error:', error);
      
      if (error.response?.data?.detail) {
        setErrors({ 
          general: error.response.data.detail 
        });
      } else if (error.message === 'Network Error') {
        setErrors({ 
          general: 'Connection error. Please check your internet connection and try again.' 
        });
      } else {
        setErrors({ 
          general: 'Failed to resend code. Please try again later.' 
        });
      }
    } finally {
      setResendLoading(false);
    }
  };

  const formatPhoneNumber = (phoneNumber) => {
    if (!phoneNumber) return '';
    // Simple formatting - you can enhance this based on your needs
    return phoneNumber.replace(/(\+?\d{1,3})(\d{3})(\d{3})(\d{4})/, '$1 $2 $3 $4');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-md mx-auto"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-secondary-900 mb-2">
            Verify Your Phone
          </h2>
          <p className="text-secondary-600 mb-4">
            {!initialOtpSent && resendLoading 
              ? 'Sending verification code to'
              : 'We\'ve sent a 6-digit verification code to'
            }
          </p>
          <p className="text-secondary-900 font-medium">
            {formatPhoneNumber(phone)}
          </p>
          {!initialOtpSent && resendLoading && (
            <p className="text-sm text-primary-600 mt-2">
              Please wait...
            </p>
          )}
        </div>

        {errors.general && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-error-50 border border-error-200 rounded-lg p-4 text-error-700 text-sm"
          >
            {errors.general}
          </motion.div>
        )}

        {errors.success && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-success-50 border border-success-200 rounded-lg p-4 text-success-700 text-sm"
          >
            {errors.success}
          </motion.div>
        )}

        <div className="space-y-4">
          <div className="flex justify-center space-x-3">
            {otp.map((digit, index) => (
              <motion.input
                key={index}
                ref={el => inputRefs.current[index] = el}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className={`w-12 h-12 text-center text-lg font-semibold border-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                  errors.otp
                    ? 'border-error-300 text-error-900 focus:border-error-500 focus:ring-error-500 bg-error-50'
                    : 'border-secondary-300 text-secondary-900 focus:border-primary-500 focus:ring-primary-500 bg-white hover:border-secondary-400'
                }`}
                disabled={loading || resendLoading}
                autoComplete="one-time-code"
                whileFocus={{ scale: 1.05 }}
                transition={{ duration: 0.15 }}
              />
            ))}
          </div>

          {errors.otp && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center text-sm text-error-600"
            >
              {errors.otp}
            </motion.div>
          )}
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={loading}
          disabled={loading || resendLoading}
          className="w-full"
        >
          {loading ? 'Verifying...' : 'Verify Phone Number'}
        </Button>

        <div className="text-center">
          <p className="text-sm text-secondary-600 mb-2">
            Didn't receive the code?
          </p>
          <button
            type="button"
            onClick={handleResendOtp}
            disabled={resendTimer > 0 || resendLoading || loading || !initialOtpSent}
            className={`text-sm font-medium transition-colors ${
              resendTimer > 0 || resendLoading || loading || !initialOtpSent
                ? 'text-secondary-400 cursor-not-allowed'
                : 'text-primary-600 hover:text-primary-700'
            }`}
          >
            {!initialOtpSent ? (
              'Sending initial code...'
            ) : resendLoading ? (
              'Sending new code...'
            ) : resendTimer > 0 ? (
              `Resend code in ${resendTimer}s`
            ) : (
              'Resend verification code'
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default PhoneVerification;