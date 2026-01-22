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
  const valueJson = JSON.stringify(value);

  // We use a ref to track the last JSON string to avoid re-parsing if possible,
  // but we need to compare the current valueJson with the previous one.
  const previousJsonRef = useRef(valueJson);

  if (previousJsonRef.current !== valueJson) {
    ref.current = value;
    previousJsonRef.current = valueJson;
  }

  return ref.current;
}
