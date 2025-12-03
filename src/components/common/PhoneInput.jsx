import React, { useState } from 'react';
import { COUNTRY_CODES } from '../../utils/constants';
import { formatPhoneNumber } from '../../utils/formatters';

const PhoneInput = ({ 
  value, 
  onChange, 
  error, 
  label = 'Phone Number',
  placeholder = 'Enter your phone number',
  disabled = false,
  required = false,
  className = '',
  showCountrySelector = false,
  defaultCountry = 'KENYA'
}) => {
  const [selectedCountry, setSelectedCountry] = useState(defaultCountry);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const currentCountry = COUNTRY_CODES[selectedCountry];
  
  // Format the display value directly from props
  const formattedValue = value ? formatPhoneNumber(value, 'national') : '';

  const handleInputChange = (e) => {
    const inputValue = e.target.value;
    
    // Remove non-digit characters except for leading +
    const cleanValue = inputValue.replace(/[^\d+]/g, '');
    
    // Call onChange with the clean value
    if (onChange) {
      onChange({
        target: {
          value: cleanValue
        }
      });
    }
  };

  const handleCountryChange = (countryKey) => {
    setSelectedCountry(countryKey);
    setIsDropdownOpen(false);
    
    // Clear the input when country changes
    if (onChange) {
      onChange({
        target: {
          value: ''
        }
      });
    }
  };

  const handleInputFocus = () => {
    // Auto-add country code prefix if empty
    if (!value && !showCountrySelector) {
      const prefixedValue = currentCountry.code;
      if (onChange) {
        onChange({
          target: {
            value: prefixedValue
          }
        });
      }
    }
  };

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-secondary-700">
          {label}
          {required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <div className="flex">
          {/* Country Selector */}
          {showCountrySelector ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                disabled={disabled}
                className="flex items-center px-3 py-2 border border-r-0 border-secondary-300 rounded-l-lg bg-secondary-50 text-secondary-700 hover:bg-secondary-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="mr-2">{currentCountry.flag}</span>
                <span className="text-sm font-medium">{currentCountry.code}</span>
                <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown */}
              {isDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-secondary-300 rounded-lg shadow-lg z-50">
                  {Object.entries(COUNTRY_CODES).map(([key, country]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleCountryChange(key)}
                      className="w-full flex items-center px-3 py-2 text-left hover:bg-secondary-50 first:rounded-t-lg last:rounded-b-lg"
                    >
                      <span className="mr-3">{country.flag}</span>
                      <span className="flex-1 text-sm">{country.name}</span>
                      <span className="text-sm text-secondary-500">{country.code}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Fixed Country Prefix */
            <div className="flex items-center px-3 py-2 border border-r-0 border-secondary-300 rounded-l-lg bg-secondary-50 text-secondary-700">
              <span className="mr-2">{currentCountry.flag}</span>
              <span className="text-sm font-medium">{currentCountry.code}</span>
            </div>
          )}

          {/* Phone Input */}
          <input
            type="tel"
            value={formattedValue}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            className={`
              flex-1 px-3 py-2 border border-secondary-300 rounded-r-lg
              focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
              disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-secondary-50
              ${error ? 'border-error-300 focus:border-error-500 focus:ring-error-500' : ''}
              ${className}
            `}
            autoComplete="tel"
          />
        </div>

        {/* Format Helper Text */}
        {!error && (
          <div className="mt-1 text-xs text-secondary-500">
            Format: 712345678 or 0712345678
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="text-sm text-error-600 flex items-center">
          <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      {/* Click outside handler */}
      {isDropdownOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </div>
  );
};

export default PhoneInput;