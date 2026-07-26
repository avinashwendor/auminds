'use client';

import { useEffect, useState, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export default function NavigationLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startProgress = () => {
    setIsLoading(true);
    setProgress(15);

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 85) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 85;
        }
        return prev + Math.floor(Math.random() * 12) + 5;
      });
    }, 120);
  };

  const completeProgress = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setProgress(100);
    setTimeout(() => {
      setIsLoading(false);
      setProgress(0);
    }, 300);
  };

  // Intercept click on internal links
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.currentTarget as HTMLAnchorElement | null;
      if (!target) return;

      const href = target.getAttribute('href');
      if (
        !href ||
        href.startsWith('#') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        target.target === '_blank' ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return;
      }

      // Check if same origin and different path
      const targetUrl = new URL(target.href, window.location.href);
      if (
        targetUrl.origin === window.location.origin &&
        targetUrl.pathname !== window.location.pathname
      ) {
        startProgress();
      }
    };

    const attachListeners = () => {
      const anchors = document.querySelectorAll<HTMLAnchorElement>('a[href]');
      anchors.forEach((a) => {
        a.removeEventListener('click', handleAnchorClick as EventListener);
        a.addEventListener('click', handleAnchorClick as EventListener);
      });
    };

    attachListeners();
    const observer = new MutationObserver(attachListeners);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Complete progress on pathname/searchParams change
  useEffect(() => {
    completeProgress();
  }, [pathname, searchParams]);

  if (!isLoading && progress === 0) return null;

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '3px',
        zIndex: 99999,
        pointerEvents: 'none',
        background: 'transparent',
      }}
    >
      <div
        style={{
          height: '100%',
          width: `${progress}%`,
          background: 'linear-gradient(90deg, #f3b61f 0%, #ff8c00 50%, #f3b61f 100%)',
          boxShadow: '0 0 10px rgba(243, 182, 31, 0.7), 0 0 5px rgba(243, 182, 31, 0.4)',
          transition: progress === 100 ? 'width 0.2s ease-out, opacity 0.3s ease-out' : 'width 0.3s ease-in-out',
          opacity: progress === 100 ? 0 : 1,
        }}
      />
    </div>
  );
}
