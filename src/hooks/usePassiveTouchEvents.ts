import { useEffect, useRef } from 'react';

/**
 * Hook to add passive event listeners for better Android 16 Chrome scrolling performance
 * Addresses passive event listener warnings and improves touch scrolling responsiveness
 */
export function usePassiveTouchEvents(): React.Ref<HTMLDivElement> {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    // Handle touch events with passive listeners for Android 16 Chrome
    const handleTouchStart = (e: TouchEvent) => {
      // Allow default scrolling behavior
      // Don't call preventDefault() to avoid blocking scroll
    };

    const handleTouchMove = (e: TouchEvent) => {
      // Allow default scrolling behavior
      // Don't call preventDefault() to avoid blocking scroll
    };

    // Add passive event listeners
    element.addEventListener('touchstart', handleTouchStart, { 
      passive: true,
      capture: false 
    });
    
    element.addEventListener('touchmove', handleTouchMove, { 
      passive: true,
      capture: false 
    });

    // Cleanup
    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  return containerRef;
}

/**
 * Hook to optimize scroll containers for Android 16 Chrome
 * Removes passive event conflicts and ensures smooth scrolling
 */
export function useAndroidScrollOptimization(): React.Ref<HTMLDivElement> {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;

    // Force GPU acceleration for smooth scrolling
    element.style.transform = 'translateZ(0)';
    element.style.webkitTransform = 'translateZ(0)';
    
    // Remove any conflicting touch-action
    element.style.touchAction = 'manipulation';
    
    // Ensure proper overflow handling
    element.style.overflowY = 'auto';
    element.style.overflowX = 'hidden';
    (element.style as any).webkitOverflowScrolling = 'touch';

    // Handle wheel events with passive listener
    const handleWheel = (e: WheelEvent) => {
      // Allow default scrolling
      // Don't prevent default to avoid scroll blocking
    };

    element.addEventListener('wheel', handleWheel, { 
      passive: true 
    });

    return () => {
      element.removeEventListener('wheel', handleWheel);
    };
  }, []);

  return scrollRef;
}
