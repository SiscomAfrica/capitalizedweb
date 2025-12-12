/**
 * Country data utilities for parsing and using country codes
 */

// Common phone country codes mapping with validation rules
export const PHONE_COUNTRY_CODES = {
  'US': { code: '+1', name: 'United States', flag: '🇺🇸', minLength: 10, maxLength: 10, pattern: /^\d{10}$/ },
  'CA': { code: '+1', name: 'Canada', flag: '🇨🇦', minLength: 10, maxLength: 10, pattern: /^\d{10}$/ },
  'GB': { code: '+44', name: 'United Kingdom', flag: '🇬🇧', minLength: 10, maxLength: 11, pattern: /^\d{10,11}$/ },
  'KE': { code: '+254', name: 'Kenya', flag: '🇰🇪', minLength: 9, maxLength: 9, pattern: /^[71]\d{8}$/ },
  'UG': { code: '+256', name: 'Uganda', flag: '🇺🇬', minLength: 9, maxLength: 9, pattern: /^[37]\d{8}$/ },
  'TZ': { code: '+255', name: 'Tanzania', flag: '🇹🇿', minLength: 9, maxLength: 9, pattern: /^[67]\d{8}$/ },
  'NG': { code: '+234', name: 'Nigeria', flag: '🇳🇬', minLength: 10, maxLength: 10, pattern: /^[789]\d{9}$/ },
  'ZA': { code: '+27', name: 'South Africa', flag: '🇿🇦', minLength: 9, maxLength: 9, pattern: /^\d{9}$/ },
  'GH': { code: '+233', name: 'Ghana', flag: '🇬🇭', minLength: 9, maxLength: 9, pattern: /^\d{9}$/ },
  'ET': { code: '+251', name: 'Ethiopia', flag: '🇪🇹', minLength: 9, maxLength: 9, pattern: /^9\d{8}$/ },
  'EG': { code: '+20', name: 'Egypt', flag: '🇪🇬', minLength: 10, maxLength: 11, pattern: /^\d{10,11}$/ },
  'MA': { code: '+212', name: 'Morocco', flag: '🇲🇦', minLength: 9, maxLength: 9, pattern: /^[567]\d{8}$/ },
  'IN': { code: '+91', name: 'India', flag: '🇮🇳', minLength: 10, maxLength: 10, pattern: /^[6789]\d{9}$/ },
  'CN': { code: '+86', name: 'China', flag: '🇨🇳', minLength: 11, maxLength: 11, pattern: /^1\d{10}$/ },
  'JP': { code: '+81', name: 'Japan', flag: '🇯🇵', minLength: 10, maxLength: 11, pattern: /^\d{10,11}$/ },
  'KR': { code: '+82', name: 'South Korea', flag: '🇰🇷', minLength: 10, maxLength: 11, pattern: /^\d{10,11}$/ },
  'AU': { code: '+61', name: 'Australia', flag: '🇦🇺', minLength: 9, maxLength: 9, pattern: /^[24578]\d{8}$/ },
  'NZ': { code: '+64', name: 'New Zealand', flag: '🇳🇿', minLength: 8, maxLength: 9, pattern: /^\d{8,9}$/ },
  'DE': { code: '+49', name: 'Germany', flag: '🇩🇪', minLength: 10, maxLength: 12, pattern: /^\d{10,12}$/ },
  'FR': { code: '+33', name: 'France', flag: '🇫🇷', minLength: 9, maxLength: 9, pattern: /^[1-9]\d{8}$/ },
  'IT': { code: '+39', name: 'Italy', flag: '🇮🇹', minLength: 9, maxLength: 10, pattern: /^\d{9,10}$/ },
  'ES': { code: '+34', name: 'Spain', flag: '🇪🇸', minLength: 9, maxLength: 9, pattern: /^[679]\d{8}$/ },
  'BR': { code: '+55', name: 'Brazil', flag: '🇧🇷', minLength: 10, maxLength: 11, pattern: /^\d{10,11}$/ },
  'MX': { code: '+52', name: 'Mexico', flag: '🇲🇽', minLength: 10, maxLength: 10, pattern: /^\d{10}$/ },
  'AR': { code: '+54', name: 'Argentina', flag: '🇦🇷', minLength: 10, maxLength: 11, pattern: /^\d{10,11}$/ },
  'RU': { code: '+7', name: 'Russia', flag: '🇷🇺', minLength: 10, maxLength: 10, pattern: /^\d{10}$/ },
  'TR': { code: '+90', name: 'Turkey', flag: '🇹🇷', minLength: 10, maxLength: 10, pattern: /^5\d{9}$/ },
  'SA': { code: '+966', name: 'Saudi Arabia', flag: '🇸🇦', minLength: 9, maxLength: 9, pattern: /^5\d{8}$/ },
  'AE': { code: '+971', name: 'UAE', flag: '🇦🇪', minLength: 9, maxLength: 9, pattern: /^5\d{8}$/ },
  'SG': { code: '+65', name: 'Singapore', flag: '🇸🇬', minLength: 8, maxLength: 8, pattern: /^[89]\d{7}$/ },
  'MY': { code: '+60', name: 'Malaysia', flag: '🇲🇾', minLength: 9, maxLength: 10, pattern: /^1\d{8,9}$/ },
  'TH': { code: '+66', name: 'Thailand', flag: '🇹🇭', minLength: 9, maxLength: 9, pattern: /^[689]\d{8}$/ },
  'PH': { code: '+63', name: 'Philippines', flag: '🇵🇭', minLength: 10, maxLength: 10, pattern: /^9\d{9}$/ },
  'ID': { code: '+62', name: 'Indonesia', flag: '🇮🇩', minLength: 10, maxLength: 12, pattern: /^8\d{9,11}$/ },
  'VN': { code: '+84', name: 'Vietnam', flag: '🇻🇳', minLength: 9, maxLength: 10, pattern: /^[389]\d{8,9}$/ },
};

/**
 * Parse CSV country data and extract relevant information
 * @param {string} csvData - Raw CSV data
 * @returns {Array} Array of country objects
 */
export const parseCountryData = (csvData) => {
  const lines = csvData.trim().split('\n');
  const headers = lines[0].split(',');
  
  return lines.slice(1).map(line => {
    const values = line.split(',');
    const country = {};
    
    headers.forEach((header, index) => {
      country[header.trim()] = values[index]?.replace(/"/g, '').trim() || '';
    });
    
    return country;
  });
};

/**
 * Get countries with phone codes for dropdown
 * @returns {Array} Array of countries with phone codes
 */
export const getCountriesWithPhoneCodes = () => {
  return Object.entries(PHONE_COUNTRY_CODES).map(([countryCode, data]) => ({
    code: countryCode, // Country code (e.g., 'US', 'CA')
    phoneCode: data.code, // Phone code (e.g., '+1', '+44')
    name: data.name,
    flag: data.flag,
    value: countryCode,
    label: `${data.flag} ${data.name} (${data.code})`,
    id: countryCode // Use country code as unique identifier
  })).sort((a, b) => a.name.localeCompare(b.name));
};

/**
 * Get phone code for a country
 * @param {string} countryCode - Two letter country code
 * @returns {string} Phone code with + prefix
 */
export const getPhoneCodeForCountry = (countryCode) => {
  return PHONE_COUNTRY_CODES[countryCode]?.code || '+1';
};

/**
 * Format phone number with country code
 * @param {string} phoneNumber - Phone number without country code
 * @param {string} countryCode - Two letter country code
 * @returns {string} Formatted phone number with country code
 */
export const formatPhoneWithCountryCode = (phoneNumber, countryCode) => {
  const phoneCode = getPhoneCodeForCountry(countryCode);
  let cleanPhone = phoneNumber.replace(/\D/g, ''); // Remove non-digits
  
  // Special handling for Kenyan numbers
  if (countryCode === 'KE') {
    // Remove leading zero if present (common for users typing local format)
    while (cleanPhone.startsWith('0')) {
      cleanPhone = cleanPhone.substring(1);
    }
    // For Kenyan numbers, we expect them to start with 7 or 1 after removing zeros
    // If they don't, still format but let validation handle the error
  } else {
    // For other countries, remove leading zeros
    if (cleanPhone.startsWith('0')) {
      cleanPhone = cleanPhone.substring(1);
    }
  }
  
  // Remove country code if it's already in the number
  const codeWithoutPlus = phoneCode.substring(1);
  if (cleanPhone.startsWith(codeWithoutPlus)) {
    cleanPhone = cleanPhone.substring(codeWithoutPlus.length);
  }
  
  return `${phoneCode}${cleanPhone}`;
};

/**
 * Detect country from phone number
 * @param {string} phoneNumber - Phone number with or without country code
 * @returns {string|null} Two letter country code or null if not found
 */
export const detectCountryFromPhone = (phoneNumber) => {
  const cleanPhone = phoneNumber.replace(/\D/g, '');
  
  // Try to match country codes
  for (const [countryCode, data] of Object.entries(PHONE_COUNTRY_CODES)) {
    const codeWithoutPlus = data.code.substring(1);
    if (cleanPhone.startsWith(codeWithoutPlus)) {
      return countryCode;
    }
  }
  
  return null;
};

/**
 * Validate phone number for a specific country
 * @param {string} phoneNumber - Phone number without country code
 * @param {string} countryCode - Two letter country code
 * @returns {Object} Validation result with isValid, message, and details
 */
export const validatePhoneNumberForCountry = (phoneNumber, countryCode) => {
  const countryData = PHONE_COUNTRY_CODES[countryCode];
  
  if (!countryData) {
    return {
      isValid: false,
      message: 'Unsupported country',
      details: { expectedLength: '7-15 digits' }
    };
  }
  
  const cleanNumber = phoneNumber.replace(/\D/g, '');
  
  if (!cleanNumber) {
    return {
      isValid: false,
      message: 'Phone number is required',
      details: { expectedLength: `${countryData.minLength}-${countryData.maxLength} digits` }
    };
  }
  
  // Check length
  if (cleanNumber.length < countryData.minLength) {
    return {
      isValid: false,
      message: `Phone number is too short. Expected ${countryData.minLength}-${countryData.maxLength} digits for ${countryData.name}`,
      details: { 
        currentLength: cleanNumber.length,
        expectedLength: `${countryData.minLength}-${countryData.maxLength} digits`,
        country: countryData.name
      }
    };
  }
  
  if (cleanNumber.length > countryData.maxLength) {
    return {
      isValid: false,
      message: `Phone number is too long. Expected ${countryData.minLength}-${countryData.maxLength} digits for ${countryData.name}`,
      details: { 
        currentLength: cleanNumber.length,
        expectedLength: `${countryData.minLength}-${countryData.maxLength} digits`,
        country: countryData.name
      }
    };
  }
  
  // Check pattern if available
  if (countryData.pattern && !countryData.pattern.test(cleanNumber)) {
    let patternMessage = `Invalid format for ${countryData.name}`;
    
    // Provide specific guidance for common countries
    switch (countryCode) {
      case 'KE':
        patternMessage = 'Kenyan numbers should start with 7 or 1 (e.g., 712345678)';
        break;
      case 'UG':
        patternMessage = 'Ugandan numbers should start with 3 or 7 (e.g., 712345678)';
        break;
      case 'TZ':
        patternMessage = 'Tanzanian numbers should start with 6 or 7 (e.g., 712345678)';
        break;
      case 'NG':
        patternMessage = 'Nigerian numbers should start with 7, 8, or 9 (e.g., 8012345678)';
        break;
      case 'US':
      case 'CA':
        patternMessage = 'North American numbers should be 10 digits (e.g., 2125551234)';
        break;
      case 'IN':
        patternMessage = 'Indian numbers should start with 6, 7, 8, or 9 (e.g., 9876543210)';
        break;
      default:
        patternMessage = `Invalid format for ${countryData.name}. Please check the number format.`;
    }
    
    return {
      isValid: false,
      message: patternMessage,
      details: { 
        currentLength: cleanNumber.length,
        expectedLength: `${countryData.minLength}-${countryData.maxLength} digits`,
        country: countryData.name,
        pattern: 'Invalid format'
      }
    };
  }
  
  return {
    isValid: true,
    message: `Valid ${countryData.name} phone number`,
    details: { 
      currentLength: cleanNumber.length,
      expectedLength: `${countryData.minLength}-${countryData.maxLength} digits`,
      country: countryData.name
    }
  };
};

// Default country for the application (Kenya)
export const DEFAULT_COUNTRY = 'KE';

// Popular countries to show at the top of dropdowns
export const POPULAR_COUNTRIES = ['KE', 'UG', 'TZ', 'NG', 'ZA', 'GH', 'US', 'GB', 'CA'];