/**
 * Image service for handling responsive image URLs and optimization
 * This would typically integrate with a CDN like Cloudinary, ImageKit, or similar
 */

import { 
  generateResponsiveUrls, 
  generateImageUrl, 
  DEFAULT_BREAKPOINTS,
  IMAGE_QUALITY 
} from '../utils/imageOptimization';

// Configuration for image service
const IMAGE_CONFIG = {
  // Base URL for images (would be your CDN URL in production)
  baseUrl: import.meta.env.VITE_IMAGE_CDN_URL || '/images',
  
  // Default quality settings
  defaultQuality: IMAGE_QUALITY.medium,
  
  // Default breakpoints
  breakpoints: DEFAULT_BREAKPOINTS,
  
  // Supported formats in order of preference
  formats: ['avif', 'webp', 'jpeg'],
  
  // Enable WebP conversion
  enableWebP: true,
  
  // Enable AVIF conversion (newest format)
  enableAVIF: true
};

/**
 * Image service class for handling all image-related operations
 */
class ImageService {
  constructor(config = IMAGE_CONFIG) {
    this.config = { ...IMAGE_CONFIG, ...config };
  }

  /**
   * Get optimized image URL for a specific width and format
   * @param {string} src - Original image source
   * @param {number} width - Target width
   * @param {string} format - Target format
   * @param {number} quality - Image quality
   * @returns {string} Optimized image URL
   */
  getOptimizedUrl(src, width, format = 'jpeg', quality = this.config.defaultQuality) {
    if (!src) return '';

    // If it's already a full URL, return as-is for now
    if (src.startsWith('http')) {
      return src;
    }

    // Remove leading slash if present
    const cleanSrc = src.startsWith('/') ? src.slice(1) : src;
    
    // In production, this would use your CDN's URL transformation API
    // For example, with Cloudinary: 
    // return `${this.config.baseUrl}/w_${width},q_${quality},f_${format}/${cleanSrc}`;
    
    // For now, use simple naming convention
    const lastDotIndex = cleanSrc.lastIndexOf('.');
    const basePath = lastDotIndex !== -1 ? cleanSrc.slice(0, lastDotIndex) : cleanSrc;
    
    return `${this.config.baseUrl}/${basePath}_${width}w_q${quality}.${format}`;
  }

  /**
   * Generate responsive image URLs for all breakpoints
   * @param {string} src - Original image source
   * @param {Object} options - Options for generation
   * @returns {Object} Object with srcSet and individual URLs
   */
  getResponsiveUrls(src, options = {}) {
    const {
      breakpoints = this.config.breakpoints,
      format = 'jpeg',
      quality = this.config.defaultQuality
    } = options;

    if (!src) return { srcSet: '', urls: {} };

    const urls = {};
    const srcSetEntries = [];

    Object.entries(breakpoints).forEach(([key, width]) => {
      const url = this.getOptimizedUrl(src, width, format, quality);
      urls[key] = url;
      srcSetEntries.push(`${url} ${width}w`);
    });

    return {
      srcSet: srcSetEntries.join(', '),
      urls
    };
  }

  /**
   * Generate picture element sources with multiple formats
   * @param {string} src - Original image source
   * @param {Object} options - Options for generation
   * @returns {Array} Array of source objects for picture element
   */
  getPictureSources(src, options = {}) {
    const {
      breakpoints = this.config.breakpoints,
      sizes = '100vw',
      quality = this.config.defaultQuality
    } = options;

    if (!src) return [];

    const sources = [];

    // AVIF source (best compression, newest format)
    if (this.config.enableAVIF) {
      const avifUrls = this.getResponsiveUrls(src, { breakpoints, format: 'avif', quality });
      if (avifUrls.srcSet) {
        sources.push({
          srcSet: avifUrls.srcSet,
          sizes,
          type: 'image/avif'
        });
      }
    }

    // WebP source (good compression, wide support)
    if (this.config.enableWebP) {
      const webpUrls = this.getResponsiveUrls(src, { breakpoints, format: 'webp', quality });
      if (webpUrls.srcSet) {
        sources.push({
          srcSet: webpUrls.srcSet,
          sizes,
          type: 'image/webp'
        });
      }
    }

    return sources;
  }

  /**
   * Get placeholder image URL (low quality, small size)
   * @param {string} src - Original image source
   * @param {number} width - Placeholder width (default: 40px)
   * @returns {string} Placeholder image URL
   */
  getPlaceholderUrl(src, width = 40) {
    return this.getOptimizedUrl(src, width, 'jpeg', 20); // Low quality for fast loading
  }

  /**
   * Preload critical images
   * @param {Array} images - Array of image objects with src and options
   * @returns {Promise} Promise that resolves when images are preloaded
   */
  async preloadImages(images) {
    const preloadPromises = images.map(({ src, width = 800, format = 'webp' }) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        const url = this.getOptimizedUrl(src, width, format);
        
        img.onload = () => resolve({ src, url, loaded: true });
        img.onerror = () => reject({ src, url, loaded: false });
        
        img.src = url;
      });
    });

    try {
      const results = await Promise.allSettled(preloadPromises);
      return results.map(result => 
        result.status === 'fulfilled' ? result.value : result.reason
      );
    } catch (error) {
      console.error('Error preloading images:', error);
      return [];
    }
  }

  /**
   * Generate blur placeholder data URL
   * @param {number} width - Placeholder width
   * @param {number} height - Placeholder height
   * @param {string} color - Base color (hex)
   * @returns {string} Data URL for blur placeholder
   */
  generateBlurPlaceholder(width = 40, height = 40, color = '#e5e7eb') {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    
    const ctx = canvas.getContext('2d');
    
    // Create gradient for more natural look
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, this.adjustBrightness(color, -10));
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    return canvas.toDataURL('image/jpeg', 0.1);
  }

  /**
   * Adjust color brightness
   * @param {string} hex - Hex color
   * @param {number} percent - Brightness adjustment percentage
   * @returns {string} Adjusted hex color
   */
  adjustBrightness(hex, percent) {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    
    return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
  }
}

// Create and export default instance
export const imageService = new ImageService();

// Export class for custom instances
export { ImageService };

// Export configuration for reference
export { IMAGE_CONFIG };