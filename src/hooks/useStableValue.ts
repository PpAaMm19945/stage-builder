import { useRef } from 'react';

/**
 * Returns a referentially stable version of the value.
 * The value is considered stable if its JSON string representation is identical.
 * This is useful for preventing unnecessary re-renders or effect triggers when objects are recreated but contain the same data.
 *
 * @param value The value to stabilize
 * @returns The referentially stable value
 */
export function useStableValue<T>(value: T): T {
  const ref = useRef(value);
  const previousJsonRef = useRef<string | undefined>(undefined);
  const initializedRef = useRef(false);

  // Initialize on first render to avoid redundant stringify in subsequent renders if value is stable
  if (!initializedRef.current) {
    previousJsonRef.current = JSON.stringify(value);
    initializedRef.current = true;
  }

  // Optimization: If the value is referentially identical to the last stored value,
  // we can skip the expensive JSON serialization.
  if (value === ref.current) {
    return ref.current;
  }

  const valueJson = JSON.stringify(value);

  if (previousJsonRef.current !== valueJson) {
    ref.current = value;
    previousJsonRef.current = valueJson;
  }

  return ref.current;
}
