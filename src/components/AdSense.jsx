import React, { useEffect, useRef, useState } from 'react';
import AdPlaceholder from './AdPlaceholder';

const AdSense = ({ adSlot, style, height = 100 }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;
  const adRef = useRef(null);

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
      
      // Retry logic
      if (retryCount < maxRetries) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          initAd();
        }, Math.pow(2, retryCount) * 1000); // Exponential backoff
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
    return null; // Hide the ad space if all retries failed
  }

  return (
    <>
      {isLoading && <AdPlaceholder height={height} />}
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{
          display: isLoading ? 'none' : 'block',
          ...style,
          minHeight: height,
        }}
        data-ad-client="ca-pub-3402658627618101"
        data-ad-slot={adSlot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </>
  );
};

export default AdSense;
