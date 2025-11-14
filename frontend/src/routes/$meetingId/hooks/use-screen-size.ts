import * as React from 'react';
import type { ScreenSize } from '@/components/utils/layout-engine';

export function useScreenSize(): ScreenSize {
  const [size, setSize] = React.useState<ScreenSize>(() =>
    typeof window === 'undefined' ? 'desktop' : getScreenSize(window.innerWidth)
  );

  React.useEffect(() => {
    const handleResize = () => {
      setSize(getScreenSize(window.innerWidth));
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return size;
}

function getScreenSize(width: number): ScreenSize {
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}
