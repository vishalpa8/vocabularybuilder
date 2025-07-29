import React, { useEffect, useRef, useState } from 'react';
import AdPlaceholder from './AdPlaceholder';

const AdSense = ({ adSlot, style, height = 100 }) => {
  const [isLoading, setIsLoading] = useState(true);
  const adRef = useRef(null);
  const hasPushed = useRef(false); // Keep track of push attempts

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
            observer.unobserve(currentAdRef); // Stop observing once it's visible and pushed
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
  }, [adSlot]); // Re-run if adSlot changes, which implies a different ad unit.

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
