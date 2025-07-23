import React, { useEffect, useRef, useState } from 'react';
import { Box, useTheme, useMediaQuery } from '@mui/material';
import AdPlaceholder from './AdPlaceholder';

const AdSense = ({ adSlot, style, height = { xs: 100, sm: 120, md: 150 } }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;
  const adRef = useRef(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  const getResponsiveHeight = () => {
    if (typeof height === 'object') {
      if (isMobile) return height.xs || 100;
      if (isTablet) return height.sm || 120;
      return height.md || 150;
    }
    return height;
  };

  const initAd = async () => {
    try {
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Ad loading timeout'));
        }, 5000);

        (window.adsbygoogle = window.adsbygoogle || []).push({
          callback: () => {
            clearTimeout(timeout);
            resolve();
          }
        });
      });

      setIsLoading(false);
      setHasError(false);
    } catch (err) {
      console.error('AdSense error:', err);
      setHasError(true);
      
      if (retryCount < maxRetries) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          initAd();
        }, Math.pow(2, retryCount) * 1000);
      }
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !hasError) {
            initAd();
          }
        });
      },
      { threshold: 0.1 }
    );

    if (adRef.current) {
      observer.observe(adRef.current);
    }

    return () => {
      if (adRef.current) {
        observer.unobserve(adRef.current);
      }
    };
  }, [hasError, retryCount]);

  if (hasError && retryCount >= maxRetries) {
    return null;
  }

  return (
    <Box sx={{ 
      width: '100%',
      px: { xs: 2, sm: 0 },
      height: getResponsiveHeight(),
      position: 'relative'
    }}>
      {isLoading && <AdPlaceholder height={getResponsiveHeight()} />}
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{
          display: isLoading ? 'none' : 'block',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          ...style
        }}
        data-ad-client="ca-pub-3402658627618101"
        data-ad-slot={adSlot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </Box>
  );
};

export default AdSense;
