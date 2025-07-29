import React, { useEffect, useRef, useState } from 'react';
import { Box, useTheme, useMediaQuery } from '@mui/material';
import AdPlaceholder from './AdPlaceholder';

const AdSense = ({ adSlot, style, height = { xs: 100, sm: 120, md: 150 } }) => {
  const [isLoading, setIsLoading] = useState(true);
  const adRef = useRef(null);
  const hasPushed = useRef(false);
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

  useEffect(() => {
    const currentAdRef = adRef.current;
    if (!currentAdRef) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            if (!hasPushed.current) {
              hasPushed.current = true;
              try {
                (window.adsbygoogle = window.adsbygoogle || []).push({});
                setIsLoading(false);
              } catch (e) {
                console.error("AdSense error:", e);
              }
            }
            observer.unobserve(currentAdRef);
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(currentAdRef);

    return () => {
      if (currentAdRef) {
        observer.unobserve(currentAdRef);
      }
    };
  }, [adSlot]);

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
