import { useEffect, useRef, useState } from 'react';

export const usePerformanceMonitor = (componentName) => {
  const renderCount = useRef(0);
  const [performanceMetrics, setPerformanceMetrics] = useState({
    renderCount: 0,
    lastRenderTime: 0,
    averageRenderTime: 0,
  });

  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      renderCount.current += 1;
      
      setPerformanceMetrics(prev => {
        const newMetrics = {
          renderCount: renderCount.current,
          lastRenderTime: renderTime,
          averageRenderTime: (prev.averageRenderTime * (renderCount.current - 1) + renderTime) / renderCount.current,
        };
        
        // Log performance metrics in development
        if (import.meta.env.DEV) {
          console.log(`[Performance] ${componentName}:`, {
            renderCount: renderCount.current,
            renderTime: renderTime.toFixed(2) + 'ms',
            averageRenderTime: newMetrics.averageRenderTime.toFixed(2) + 'ms',
          });
        }
        
        return newMetrics;
      });
    };
  });

  return performanceMetrics;
};

export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export const useMemoizedCallback = (callback, dependencies) => {
  const ref = useRef();
  
  if (!ref.current || dependencies.some((dep, index) => dep !== ref.current.deps[index])) {
    ref.current = {
      callback,
      deps: dependencies,
    };
  }
  
  return ref.current.callback;
};
