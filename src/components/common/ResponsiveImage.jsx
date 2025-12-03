import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { imageService } from '../../services/imageService';

/**
 * Responsive image component with lazy loading, srcset, and WebP support
 * Implements Requirements 12.5: responsive image serving
 */
const ResponsiveImage = ({
  src,
  alt,
  className = '',
  sizes = '(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 33vw',
  lazy = true,
  webp = true,
  placeholder = 'blur',
  aspectRatio,
  objectFit = 'cover',
  quality = 80,
  breakpoints = {
    mobile: 400,
    tablet: 800,
    desktop: 1200
  },
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(!lazy);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef(null);
  const observerRef = useRef(null);

  // Generate responsive image URLs using image service
  const generateImageUrls = (baseSrc) => {
    if (!baseSrc) return { src: '', srcSet: '', webpSrcSet: '', pictureSources: [] };

    // Get responsive URLs for JPEG
    const jpegUrls = imageService.getResponsiveUrls(baseSrc, { 
      breakpoints, 
      format: 'jpeg', 
      quality 
    });

    // Get WebP URLs if enabled
    const webpUrls = webp ? imageService.getResponsiveUrls(baseSrc, { 
      breakpoints, 
      format: 'webp', 
      quality 
    }) : { srcSet: '' };

    // Get picture sources (includes AVIF and WebP)
    const pictureSources = imageService.getPictureSources(baseSrc, { 
      breakpoints, 
      sizes, 
      quality 
    });

    return {
      src: baseSrc,
      srcSet: jpegUrls.srcSet,
      webpSrcSet: webpUrls.srcSet,
      pictureSources
    };
  };

  const { src: imageSrc, srcSet, webpSrcSet, pictureSources } = generateImageUrls(src);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy || isInView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px', // Start loading 50px before the image comes into view
        threshold: 0.1
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    observerRef.current = observer;

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [lazy, isInView]);

  // Handle image load
  const handleLoad = () => {
    setIsLoaded(true);
    setHasError(false);
  };

  // Handle image error
  const handleError = () => {
    setHasError(true);
    setIsLoaded(false);
  };

  // Placeholder styles
  const placeholderStyles = {
    blur: 'bg-secondary-200 animate-pulse',
    solid: 'bg-secondary-300',
    none: 'bg-transparent'
  };

  // Container styles
  const containerStyles = [
    'relative overflow-hidden',
    aspectRatio && `aspect-[${aspectRatio}]`,
    className
  ].filter(Boolean).join(' ');

  // Image styles
  const imageStyles = [
    'w-full h-full transition-opacity duration-300',
    objectFit === 'cover' && 'object-cover',
    objectFit === 'contain' && 'object-contain',
    objectFit === 'fill' && 'object-fill',
    objectFit === 'scale-down' && 'object-scale-down',
    isLoaded ? 'opacity-100' : 'opacity-0'
  ].filter(Boolean).join(' ');

  return (
    <div ref={imgRef} className={containerStyles} {...props}>
      {/* Placeholder */}
      {(!isLoaded || !isInView) && placeholder !== 'none' && (
        <div 
          className={`absolute inset-0 ${placeholderStyles[placeholder]} flex items-center justify-center`}
        >
          {placeholder === 'blur' && (
            <div className="w-8 h-8 border-2 border-secondary-400 border-t-transparent rounded-full animate-spin" />
          )}
        </div>
      )}

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 bg-secondary-100 flex items-center justify-center">
          <div className="text-center text-secondary-500">
            <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-xs">Image not available</p>
          </div>
        </div>
      )}

      {/* Actual image */}
      {isInView && (
        <motion.picture
          initial={{ opacity: 0 }}
          animate={{ opacity: isLoaded ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Modern format sources (AVIF, WebP) */}
          {pictureSources.map((source, index) => (
            <source
              key={index}
              srcSet={source.srcSet}
              sizes={source.sizes}
              type={source.type}
            />
          ))}
          
          {/* WebP source for backward compatibility */}
          {webp && webpSrcSet && !pictureSources.some(s => s.type === 'image/webp') && (
            <source
              srcSet={webpSrcSet}
              sizes={sizes}
              type="image/webp"
            />
          )}
          
          {/* Fallback image */}
          <img
            src={imageSrc}
            srcSet={srcSet}
            sizes={sizes}
            alt={alt}
            className={imageStyles}
            onLoad={handleLoad}
            onError={handleError}
            loading={lazy ? 'lazy' : 'eager'}
            decoding="async"
          />
        </motion.picture>
      )}
    </div>
  );
};

/**
 * Utility function to generate responsive image URLs
 * Can be used for background images or other use cases
 */
export const generateResponsiveImageUrls = (src, breakpoints = { mobile: 400, tablet: 800, desktop: 1200 }) => {
  if (!src) return {};

  const lastDotIndex = src.lastIndexOf('.');
  const extension = lastDotIndex !== -1 ? src.slice(lastDotIndex) : '';
  const basePath = lastDotIndex !== -1 ? src.slice(0, lastDotIndex) : src;

  return Object.entries(breakpoints).reduce((acc, [key, width]) => {
    acc[key] = {
      jpg: `${basePath}_${width}w${extension}`,
      webp: `${basePath}_${width}w.webp`
    };
    return acc;
  }, {});
};

/**
 * Hook for detecting WebP support
 */
export const useWebPSupport = () => {
  const [supportsWebP, setSupportsWebP] = useState(false);

  useEffect(() => {
    const checkWebPSupport = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      
      const dataURL = canvas.toDataURL('image/webp');
      setSupportsWebP(dataURL.indexOf('data:image/webp') === 0);
    };

    checkWebPSupport();
  }, []);

  return supportsWebP;
};

/**
 * Preload images for better performance
 */
export const preloadImage = (src, srcSet) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => resolve(img);
    img.onerror = reject;
    
    if (srcSet) {
      img.srcset = srcSet;
    }
    img.src = src;
  });
};

export default ResponsiveImage;