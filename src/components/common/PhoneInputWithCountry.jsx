import { useState, useEffect } from 'react';
import { getCountriesWithPhoneCodes, getPhoneCodeForCountry, formatPhoneWithCountryCode, validatePhoneNumberForCountry, DEFAULT_COUNTRY, POPULAR_COUNTRIES } from '../../utils/countryData';

const PhoneInputWithCountry = ({ 
  label, 
  placeholder = "Enter phone number", 
  value = "", 
  onChange, 
  error, 
  required = false, 
  disabled = false,
  defaultCountry = DEFAULT_COUNTRY,
  className = ""
}) => {
  const [selectedCountry, setSelectedCountry] = useState(defaultCountry);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [localError, setLocalError] = useState('');
  const [showZeroRemovedMessage, setShowZeroRemovedMessage] = useState(false);
  
  const countries = getCountriesWithPhoneCodes();
  const popularCountries = countries.filter(country => POPULAR_COUNTRIES.includes(country.code));
  const otherCountries = countries.filter(country => !POPULAR_COUNTRIES.includes(country.code));

  // Parse initial value
  useEffect(() => {
    if (value) {
      // Extract phone number without country code
      const phoneCode = getPhoneCodeForCountry(selectedCountry);
      if (value.startsWith(phoneCode)) {
        setPhoneNumber(value.substring(phoneCode.length));
      } else {
        setPhoneNumber(value);
      }
    }
  }, [value, selectedCountry]);

  const handleCountryChange = (countryCode) => {
    setSelectedCountry(countryCode);
    setIsDropdownOpen(false);
    setLocalError(''); // Clear any previous errors
    
    // Update the full phone number and revalidate
    if (phoneNumber) {
      // Validate the existing number for the new country
      const validationError = validatePhoneNumber(phoneNumber);
      if (validationError) {
        setLocalError(validationError);
      }
      
      const fullNumber = formatPhoneWithCountryCode(phoneNumber, countryCode);
      if (onChange) {
        onChange({ target: { value: fullNumber } });
      }
    }
  };

  const validatePhoneNumber = (number) => {
    if (!number) return '';
    
    // Use the comprehensive country validation
    const validation = validatePhoneNumberForCountry(number, selectedCountry);
    
    // Only show errors for complete numbers or numbers that are clearly too long
    const countryData = getCountriesWithPhoneCodes().find(c => c.code === selectedCountry);
    const minLength = countryData?.minLength || 7;
    const maxLength = countryData?.maxLength || 15;
    
    // Don't show validation errors while user is still typing (unless clearly too long)
    if (number.length < minLength && number.length < maxLength) {
      return ''; // Let them continue typing
    }
    
    return validation.isValid ? '' : validation.message;
  };

  const handlePhoneChange = (e) => {
    let inputValue = e.target.value.replace(/\D/g, ''); // Only allow digits
    let showMessage = false;
    
    // For Kenya, automatically remove leading 0 and continue seamlessly
    if (selectedCountry === 'KE' && inputValue.startsWith('0')) {
      // Remove the leading 0 silently and continue
      inputValue = inputValue.substring(1);
      // Only show message if there are more digits after the 0
      if (inputValue.length > 0) {
        showMessage = true;
        setShowZeroRemovedMessage(true);
        // Hide the message after 3 seconds
        setTimeout(() => setShowZeroRemovedMessage(false), 3000);
      }
      setLocalError('');
    } else {
      setLocalError('');
      if (!showMessage) {
        setShowZeroRemovedMessage(false);
      }
    }
    
    // Validate the number (but don't show errors for partial input)
    const validationError = validatePhoneNumber(inputValue);
    if (validationError) {
      setLocalError(validationError);
    } else if (!showMessage) {
      setLocalError('');
    }
    
    setPhoneNumber(inputValue);
    
    // Create full phone number with country code
    const fullNumber = inputValue ? formatPhoneWithCountryCode(inputValue, selectedCountry) : '';
    
    if (onChange) {
      onChange({ target: { value: fullNumber } });
    }
  };

  const selectedCountryData = countries.find(c => c.code === selectedCountry);

  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-secondary-700">
          {label}
          {required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <div className="flex">
          {/* Country Selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              disabled={disabled}
              className={`
                flex items-center px-3 py-2 border border-r-0 rounded-l-md bg-white text-sm font-medium
                ${disabled ? 'bg-secondary-50 text-secondary-400 cursor-not-allowed' : 'hover:bg-secondary-50'}
                ${(error || localError) ? 'border-error-300' : 'border-secondary-300'}
                focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
              `}
            >
              <span className="mr-2">{selectedCountryData?.flag}</span>
              <span className="mr-1">{selectedCountryData?.phoneCode}</span>
              <svg className="w-4 h-4 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown */}
            {isDropdownOpen && (
              <div className="absolute z-50 mt-1 w-80 bg-white border border-secondary-300 rounded-md shadow-lg max-h-60 overflow-auto">
                {/* Popular Countries */}
                <div className="py-1">
                  <div className="px-3 py-2 text-xs font-medium text-secondary-500 bg-secondary-50">
                    Popular
                  </div>
                  {popularCountries.map((country) => (
                    <button
                      key={`popular-${country.code}`}
                      type="button"
                      onClick={() => handleCountryChange(country.code)}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-secondary-50 flex items-center"
                    >
                      <span className="mr-3">{country.flag}</span>
                      <span className="flex-1">{country.name}</span>
                      <span className="text-secondary-500">{country.phoneCode}</span>
                    </button>
                  ))}
                </div>

                {/* Divider */}
                <div className="border-t border-secondary-200"></div>

                {/* Other Countries */}
                <div className="py-1">
                  <div className="px-3 py-2 text-xs font-medium text-secondary-500 bg-secondary-50">
                    All Countries
                  </div>
                  {otherCountries.map((country) => (
                    <button
                      key={`other-${country.code}`}
                      type="button"
                      onClick={() => handleCountryChange(country.code)}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-secondary-50 flex items-center"
                    >
                      <span className="mr-3">{country.flag}</span>
                      <span className="flex-1">{country.name}</span>
                      <span className="text-secondary-500">{country.phoneCode}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Phone Number Input */}
          <input
            type="tel"
            placeholder={selectedCountry === 'KE' ? 'e.g., 712345678' : placeholder}
            value={phoneNumber}
            onChange={handlePhoneChange}
            disabled={disabled}
            className={`
              flex-1 px-3 py-2 border rounded-r-md text-sm
              ${disabled ? 'bg-secondary-50 text-secondary-400 cursor-not-allowed' : 'bg-white'}
              ${(error || localError) ? 'border-error-300 focus:border-error-500 focus:ring-error-500' : 'border-secondary-300 focus:border-primary-500 focus:ring-primary-500'}
              focus:outline-none focus:ring-2 focus:ring-opacity-50
              placeholder-secondary-400
            `}
          />
        </div>

        {/* Close dropdown when clicking outside */}
        {isDropdownOpen && (
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsDropdownOpen(false)}
          />
        )}
      </div>

      {/* Show external error first, then local validation error */}
      {error && (
        <p className="text-sm text-error-600 mt-1">{error}</p>
      )}
      
      {localError && !error && (
        <p className="text-sm text-error-600 mt-1">{localError}</p>
      )}
      
      {/* Show message when zero is automatically removed */}
      {showZeroRemovedMessage && (
        <p className="text-xs text-primary-600 mt-1 animate-pulse">
          ✓ Removed leading 0 - Kenyan numbers don't need it
        </p>
      )}
      
      {/* Country-specific format guide */}
      {!phoneNumber && !error && !localError && !showZeroRemovedMessage && (() => {
        const countryData = countries.find(c => c.code === selectedCountry);
        if (!countryData) return null;
        
        const lengthText = countryData.minLength === countryData.maxLength 
          ? `${countryData.minLength} digits`
          : `${countryData.minLength}-${countryData.maxLength} digits`;
        
        let formatExample = '';
        switch (selectedCountry) {
          case 'KE':
            formatExample = 'Start with 7 or 1 (e.g., 712345678). Leading 0 will be removed automatically.';
            break;
          case 'UG':
            formatExample = 'Start with 3 or 7 (e.g., 712345678)';
            break;
          case 'TZ':
            formatExample = 'Start with 6 or 7 (e.g., 712345678)';
            break;
          case 'NG':
            formatExample = 'Start with 7, 8, or 9 (e.g., 8012345678)';
            break;
          case 'US':
          case 'CA':
            formatExample = '10 digits (e.g., 2125551234)';
            break;
          case 'IN':
            formatExample = 'Start with 6, 7, 8, or 9 (e.g., 9876543210)';
            break;
          default:
            formatExample = `${lengthText} required`;
        }
        
        return (
          <p className="text-xs text-secondary-500 mt-1">
            {countryData.flag} {countryData.name}: {formatExample}
          </p>
        );
      })()}
      
      {/* Show validation success message */}
      {phoneNumber && !error && !localError && !showZeroRemovedMessage && (() => {
        const validation = validatePhoneNumberForCountry(phoneNumber, selectedCountry);
        if (validation.isValid) {
          return (
            <p className="text-xs text-success-600 mt-1">
              ✓ Valid {validation.details.country} number: {formatPhoneWithCountryCode(phoneNumber, selectedCountry)}
            </p>
          );
        }
        return null;
      })()}
    </div>
  );
};

export default PhoneInputWithCountry;