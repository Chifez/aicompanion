import * as React from 'react';

/**
 * Syncs form state with external value changes.
 * Only updates when the external value actually changes (not on every render).
 */
export function useSyncFormState<T>(
  externalValue: T | undefined | null,
  defaultValue: T
) {
  const [formState, setFormState] = React.useState<T>(
    externalValue ?? defaultValue
  );

  // Use ref to track previous external value to avoid unnecessary updates
  const prevExternalValueRef = React.useRef(externalValue);

  React.useEffect(() => {
    // Only update if external value actually changed
    if (prevExternalValueRef.current !== externalValue) {
      prevExternalValueRef.current = externalValue;
      setFormState(externalValue ?? defaultValue);
    }
  }, [externalValue, defaultValue]);

  return [formState, setFormState] as const;
}
