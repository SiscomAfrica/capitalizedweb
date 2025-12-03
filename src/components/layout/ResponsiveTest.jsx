import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Smartphone, Tablet, Monitor, RotateCcw } from 'lucide-react';
import { ResponsiveGrid, ResponsiveFlex, ResponsiveSection, TouchTarget } from './ResponsiveContainer';
import Button from '../common/Button';
import Card from '../common/Card';
import Input from '../common/Input';

/**
 * Test component to verify responsive design implementation
 * This component demonstrates all responsive breakpoints and touch-friendly controls
 */
const ResponsiveTest = () => {
  const [screenInfo, setScreenInfo] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
    orientation: typeof window !== 'undefined' ? window.screen?.orientation?.type : 'unknown'
  });

  // Update screen info on resize and orientation change
  useEffect(() => {
    const updateScreenInfo = () => {
      setScreenInfo({
        width: window.innerWidth,
        height: window.innerHeight,
        orientation: window.screen?.orientation?.type || 'unknown'
      });
    };

    window.addEventListener('resize', updateScreenInfo);
    window.addEventListener('orientationchange', updateScreenInfo);

    return () => {
      window.removeEventListener('resize', updateScreenInfo);
      window.removeEventListener('orientationchange', updateScreenInfo);
    };
  }, []);

  // Determine current breakpoint
  const getBreakpoint = () => {
    if (screenInfo.width <= 767) return 'mobile';
    if (screenInfo.width <= 1023) return 'tablet';
    return 'desktop';
  };

  const currentBreakpoint = getBreakpoint();

  // Test data
  const testCards = Array.from({ length: 6 }, (_, i) => ({
    id: i + 1,
    title: `Test Card ${i + 1}`,
    description: 'This is a test card to demonstrate responsive grid layout.'
  }));

  return (
    <div className="min-h-screen bg-secondary-50 p-4 md:p-6 lg:p-8">
      {/* Screen Info Header */}
      <Card className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-secondary-900 mb-2">
              Responsive Design Test
            </h1>
            <p className="text-secondary-600">
              Testing mobile-first responsive design implementation
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {currentBreakpoint === 'mobile' && <Smartphone className="h-5 w-5 text-primary-600" />}
              {currentBreakpoint === 'tablet' && <Tablet className="h-5 w-5 text-primary-600" />}
              {currentBreakpoint === 'desktop' && <Monitor className="h-5 w-5 text-primary-600" />}
              <span className="font-medium text-secondary-900 capitalize">
                {currentBreakpoint}
              </span>
            </div>
            
            <div className="text-sm text-secondary-600">
              {screenInfo.width} × {screenInfo.height}
            </div>
          </div>
        </div>
        
        {/* Breakpoint Indicators */}
        <div className="mt-4 flex flex-wrap gap-2">
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            currentBreakpoint === 'mobile' 
              ? 'bg-primary-100 text-primary-700' 
              : 'bg-secondary-100 text-secondary-600'
          }`}>
            Mobile (≤767px)
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            currentBreakpoint === 'tablet' 
              ? 'bg-primary-100 text-primary-700' 
              : 'bg-secondary-100 text-secondary-600'
          }`}>
            Tablet (768-1023px)
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            currentBreakpoint === 'desktop' 
              ? 'bg-primary-100 text-primary-700' 
              : 'bg-secondary-100 text-secondary-600'
          }`}>
            Desktop (≥1024px)
          </div>
        </div>
      </Card>

      {/* Touch Target Test */}
      <ResponsiveSection spacing="md">
        <Card>
          <h2 className="text-lg font-semibold text-secondary-900 mb-4">
            Touch-Friendly Controls (44×44px minimum)
          </h2>
          
          <ResponsiveFlex direction="row" gap="md" className="flex-wrap">
            <Button variant="primary" size="sm">
              Small Button
            </Button>
            <Button variant="secondary" size="md">
              Medium Button
            </Button>
            <Button variant="danger" size="lg">
              Large Button
            </Button>
            
            <TouchTarget className="bg-primary-600 text-white rounded-lg">
              <RotateCcw className="h-5 w-5" />
            </TouchTarget>
          </ResponsiveFlex>
          
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Touch-friendly Input"
              placeholder="Minimum 44px height"
              type="text"
            />
            <select className="px-3 py-3 border border-secondary-300 rounded-lg text-sm min-h-[44px] focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
              <option>Touch-friendly Select</option>
              <option>Option 1</option>
              <option>Option 2</option>
            </select>
          </div>
        </Card>
      </ResponsiveSection>

      {/* Responsive Grid Test */}
      <ResponsiveSection spacing="md">
        <Card>
          <h2 className="text-lg font-semibold text-secondary-900 mb-4">
            Responsive Grid Layout
          </h2>
          <p className="text-secondary-600 mb-6">
            1 column on mobile, 2 on tablet, 3 on desktop
          </p>
          
          <ResponsiveGrid 
            columns={{ mobile: 1, tablet: 2, desktop: 3 }}
            gap="md"
          >
            {testCards.map((card) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: card.id * 0.1 }}
              >
                <Card className="h-full">
                  <h3 className="font-semibold text-secondary-900 mb-2">
                    {card.title}
                  </h3>
                  <p className="text-sm text-secondary-600 mb-4">
                    {card.description}
                  </p>
                  <Button variant="secondary" size="sm" className="w-full">
                    Action
                  </Button>
                </Card>
              </motion.div>
            ))}
          </ResponsiveGrid>
        </Card>
      </ResponsiveSection>

      {/* Responsive Flex Test */}
      <ResponsiveSection spacing="md">
        <Card>
          <h2 className="text-lg font-semibold text-secondary-900 mb-4">
            Responsive Flex Layout
          </h2>
          <p className="text-secondary-600 mb-6">
            Column on mobile, row on tablet and desktop
          </p>
          
          <ResponsiveFlex direction="row" gap="md" align="stretch">
            <Card className="flex-1">
              <h3 className="font-semibold text-secondary-900 mb-2">
                Flex Item 1
              </h3>
              <p className="text-sm text-secondary-600">
                This item adapts to the available space in the flex container.
              </p>
            </Card>
            
            <Card className="flex-1">
              <h3 className="font-semibold text-secondary-900 mb-2">
                Flex Item 2
              </h3>
              <p className="text-sm text-secondary-600">
                Equal width distribution on larger screens, stacked on mobile.
              </p>
            </Card>
            
            <Card className="flex-1">
              <h3 className="font-semibold text-secondary-900 mb-2">
                Flex Item 3
              </h3>
              <p className="text-sm text-secondary-600">
                Responsive flex layout ensures optimal use of screen space.
              </p>
            </Card>
          </ResponsiveFlex>
        </Card>
      </ResponsiveSection>

      {/* Orientation Change Test */}
      <ResponsiveSection spacing="md">
        <Card>
          <h2 className="text-lg font-semibold text-secondary-900 mb-4">
            Orientation Handling
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-secondary-600 mb-2">Current Orientation:</p>
              <p className="font-medium text-secondary-900">{screenInfo.orientation}</p>
            </div>
            <div>
              <p className="text-sm text-secondary-600 mb-2">Viewport Dimensions:</p>
              <p className="font-medium text-secondary-900">
                {screenInfo.width}px × {screenInfo.height}px
              </p>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-secondary-50 rounded-lg">
            <p className="text-sm text-secondary-600">
              Rotate your device to see how the layout adapts to orientation changes.
              The layout preserves state and adjusts spacing appropriately.
            </p>
          </div>
        </Card>
      </ResponsiveSection>
    </div>
  );
};

export default ResponsiveTest;