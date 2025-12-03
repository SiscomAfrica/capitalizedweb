/**
 * Image optimization utilities for responsive image serving
 * Implements Requirements 12.5: responsive image serving
 */

// Default breakpoints for responsive images
export const DEFAULT_BREAKPOINTS = {
  mobile: 400,
  tablet: 800,
  desktop: 1200,
  xl: 1600
};

// Image quality settings
export const IMAGE_QUALITY = {
  low: 60,
  medium: 80,
  high: 95
};

// Supported image formats
export const SUPPORTED_FORMATS = {
  webp: 'image/webp',
  avif: 'image/avif',
  jpeg: 'image/jpeg',
  png: 'image/png'
};

/**
 * Generate responsive image URLs for different breakpoints
 * @param {string} baseSrc - Base image URL
 * @param {Object} breakpoints - Breakpoint widths
 * @param {string} format - Image format (jpg, png, webp)
 * @param {number} quality - Image quality (1-100)
 * @returns {Object} Object with srcSet and individual URLs
 */
export const generateResponsiveUrls = (baseSrc, breakpoints = DEFAULT_BREAKPOINTS, format = 'jpg', quality = IMAGE_QUALITY.medium) => {
  if (!baseSrc) return { srcSet: '', urls: {} };

  const urls = {};
  const srcSetEntries = [];

  Object.entries(breakpoints).forEach(([key, width]) => {
    // For now, we'll use a simple naming convention
    // In a real app, this would integrate with an image CDN like Cloudinary or ImageKit
    const url = generateImageUrl(baseSrc, width, format, quality);
    urls[key] = url;
    srcSetEntries.push(`${url} ${width}w`);
  });

  return {
    srcSet: srcSetEntries.join(', '),
    urls
  };
};

/**
 * Generate a single optimized image URL
 * @param {string} baseSrc - Base image URL
 * @param {number} width - Target width
 * @param {string} format - Image format
 * @param {number} quality - Image quality
 * @returns {string} Optimized image URL
 */
export const generateImageUrl = (baseSrc, width, format = 'jpg', quality = IMAGE_QUALITY.medium) => {
  if (!baseSrc) return '';

  // Extract file extension and path
  const lastDotIndex = baseSrc.lastIndexOf('.');
  const extension = lastDotIndex !== -1 ? baseSrc.slice(lastDotIndex) : '';
  const basePath = lastDotIndex !== -1 ? baseSrc.slice(0, lastDotIndex) : baseSrc;

  // Simple naming convention for responsive images
  // In production, this would use an image CDN
  return `${basePath}_${width}w.${format}`;
};

/**
 * Generate WebP and fallback sources for a picture element
 * @param {string} baseSrc - Base image URL
 * @param {Object} breakpoints - Breakpoint widths
 * @param {string} sizes - Sizes attribute value
 * @returns {Array} Array of source objects
 */
export const generatePictureSources = (baseSrc, breakpoints = DEFAULT_BREAKPOINTS, sizes = '100vw') => {
  if (!baseSrc) return [];

  const sources = [];

  // WebP source (modern browsers)
  const webpUrls = generateResponsiveUrls(baseSrc, breakpoints, 'webp');
  if (webpUrls.srcSet) {
    sources.push({
      srcSet: webpUrls.srcSet,
      sizes,
      type: SUPPORTED_FORMATS.webp
    });
  }

  // AVIF source (newest format, best compression)
  const avifUrls = generateResponsiveUrls(baseSrc, breakpoints, 'avif');
  if (avifUrls.srcSet) {
    sources.unshift({ // Add at beginning for priority
      srcSet: avifUrls.srcSet,
      sizes,
      type: SUPPORTED_FORMATS.avif
    });
  }

  return sources;
};

/**
 * Check if browser supports a specific image format
 * @param {string} format - Image format to check
 * @returns {Promise<boolean>} Promise resolving to support status
 */
export const checkImageFormatSupport = (format) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0, 0, 1, 1);
    
    const dataURL = canvas.toDataURL(`image/${format}`);
    resolve(dataURL.indexOf(`data:image/${format}`) === 0);
  });
};

/**
 * Preload critical images for better performance
 * @param {Array} imageUrls - Array of image URLs to preload
 * @returns {Promise<Array>} Promise resolving when all images are loaded
 */
export const preloadImages = (imageUrls) => {
  const promises = imageUrls.map(url => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });
  });

  return Promise.allSettled(promises);
};

/**
 * Calculate optimal image dimensions based on container size and device pixel ratio
 * @param {number} containerWidth - Container width in CSS pixels
 * @param {number} containerHeight - Container height in CSS pixels
 * @param {number} devicePixelRatio - Device pixel ratio (default: window.devicePixelRatio)
 * @returns {Object} Optimal dimensions
 */
export const calculateOptimalDimensions = (
  containerWidth, 
  containerHeight, 
  devicePixelRatio = typeof window !== 'undefined' ? window.devicePixelRatio : 1
) => {
  return {
    width: Math.ceil(containerWidth * devicePixelRatio),
    height: Math.ceil(containerHeight * devicePixelRatio)
  };
};

/**
 * Generate sizes attribute for responsive images
 * @param {Array} breakpoints - Array of breakpoint objects with { breakpoint, size }
 * @returns {string} Sizes attribute value
 */
export const generateSizesAttribute = (breakpoints) => {
  if (!Array.isArray(breakpoints) || breakpoints.length === 0) {
    return '100vw';
  }

  const sizesArray = breakpoints.map(({ breakpoint, size }) => {
    if (breakpoint) {
      return `(max-width: ${breakpoint}px) ${size}`;
    }
    return size;
  });

  return sizesArray.join(', ');
};

/**
 * Lazy loading intersection observer options
 */
export const LAZY_LOADING_OPTIONS = {
  rootMargin: '50px 0px', // Start loading 50px before entering viewport
  threshold: 0.01 // Trigger when 1% of the image is visible
};

/**
 * Create an intersection observer for lazy loading
 * @param {Function} callback - Callback function when image enters viewport
 * @param {Object} options - Intersection observer options
 * @returns {IntersectionObserver} Intersection observer instance
 */
export const createLazyLoadObserver = (callback, options = LAZY_LOADING_OPTIONS) => {
  if (typeof IntersectionObserver === 'undefined') {
    // Fallback for browsers without IntersectionObserver support
    setTimeout(callback, 0);
    return null;
  }

  return new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        callback(entry.target);
      }
    });
  }, options);
};

/**
 * Get the best image format supported by the browser
 * @returns {Promise<string>} Promise resolving to the best supported format
 */
export const getBestSupportedFormat = async () => {
  // Check formats in order of preference (best compression first)
  const formats = ['avif', 'webp', 'jpeg'];
  
  for (const format of formats) {
    const isSupported = await checkImageFormatSupport(format);
    if (isSupported) {
      return format;
    }
  }
  
  return 'jpeg'; // Fallback
};