import { useEffect, useState } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Check if window is defined (client-side)
    if (typeof window !== 'undefined') {
      const media = window.matchMedia(query);

      // Set initial value
      setMatches(media.matches);

      // Create event listener
      const listener = (event: MediaQueryListEvent) => {
        setMatches(event.matches);
      };

      // Add event listener
      // Use addEventListener for modern browsers
      if (media.addEventListener) {
        media.addEventListener('change', listener);
      } else {
        // Fallback for older browsers
        media.addListener(listener);
      }

      // Clean up
      return () => {
        if (media.removeEventListener) {
          media.removeEventListener('change', listener);
        } else {
          // Fallback for older browsers
          media.removeListener(listener);
        }
      };
    }
  }, [query]);

  return matches;
}

// Preset breakpoint hooks for common use cases
export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 1024px)'); // lg breakpoint
}

export function useIsTablet(): boolean {
  return useMediaQuery('(min-width: 768px) and (max-width: 1023px)'); // md to lg
}

export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 767px)'); // below md
}
