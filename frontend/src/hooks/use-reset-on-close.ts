import * as React from 'react';

/**
 * Resets state when a dialog/component closes.
 * Useful for resetting form state, selections, etc. when closing dialogs.
 */
export function useResetOnClose<T>(
  isOpen: boolean,
  resetValue: T,
  resetFn: (value: T) => void
) {
  const prevOpenRef = React.useRef(isOpen);

  React.useEffect(() => {
    // Only reset when transitioning from open to closed
    if (prevOpenRef.current && !isOpen) {
      resetFn(resetValue);
    }
    prevOpenRef.current = isOpen;
  }, [isOpen, resetValue, resetFn]);
}
