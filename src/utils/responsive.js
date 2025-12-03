import React from 'react';

/**
 * Responsive design utilities
 */

// Breakpoint values (matching Tailwind config)
export const BREAKPOINTS = {
  mobile: { min: 320, max: 767 },
  tablet: { min: 768, max: 1023 },
  desktop: { min: 1024, max: Infinity }
};

// Check if current viewport matches a breakpoint
export const useMediaQuery = (query) => {
  if (typeof window === 'undefined') return false;
  
  const [matches, setMatches] = React.useState(() => window.matchMedia(query).matches);
  
  React.useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    const handler = (event) => setMatches(event.matches);
    
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [query]);
  
  return matches;
};

// Predefined media queries
export const useIsMobile = () => useMediaQuery('(max-width: 767px)');
export const useIsTablet = () => useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
export const useIsDesktop = () => useMediaQuery('(min-width: 1024px)');

// Touch-friendly minimum sizes (44x44px as per Apple HIG and WCAG)
export const TOUCH_TARGET_SIZE = {
  min: 'min-h-[44px] min-w-[44px]',
  button: 'h-11 px-4', // 44px height with padding
  icon: 'h-11 w-11', // 44px square for icon buttons
};

// Responsive grid classes
export const RESPONSIVE_GRID = {
  // Single column on mobile, 2 on tablet, 3 on desktop
  products: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6',
  // Single column on mobile, 2 on tablet, 4 on desktop
  cards: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6',
  // Responsive form layout
  form: 'grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6',
};

// Responsive spacing classes
export const RESPONSIVE_SPACING = {
  container: 'px-4 sm:px-6 lg:px-8',
  section: 'py-6 md:py-8 lg:py-12',
  card: 'p-4 md:p-6',
  modal: 'p-4 sm:p-6',
};

// Responsive text classes
export const RESPONSIVE_TEXT = {
  heading: 'text-xl md:text-2xl lg:text-3xl',
  subheading: 'text-lg md:text-xl lg:text-2xl',
  body: 'text-sm md:text-base',
  caption: 'text-xs md:text-sm',
};

// Layout utilities
export const LAYOUT_CLASSES = {
  // Mobile-first container
  container: 'w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
  // Responsive flex layouts
  flexCol: 'flex flex-col',
  flexRow: 'flex flex-col md:flex-row',
  // Responsive gaps
  gap: 'gap-4 md:gap-6 lg:gap-8',
  gapSmall: 'gap-2 md:gap-3 lg:gap-4',
};

// Orientation change handling
export const handleOrientationChange = (callback) => {
  if (typeof window === 'undefined') return;
  
  const handleChange = () => {
    // Small delay to ensure viewport dimensions are updated
    setTimeout(callback, 100);
  };
  
  window.addEventListener('orientationchange', handleChange);
  window.addEventListener('resize', handleChange);
  
  return () => {
    window.removeEventListener('orientationchange', handleChange);
    window.removeEventListener('resize', handleChange);
  };
};