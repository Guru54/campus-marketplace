import { useState, useEffect } from 'react';

/**
 * useDebounce Hook
 * Delays state updates until user stops typing/interacting
 * 
 * @param {*} value - The value to debounce
 * @param {number} delay - Delay in milliseconds (default: 300ms)
 * @returns {*} - Debounced value
 * 
 * @example
 * const [searchInput, setSearchInput] = useState("");
 * const debouncedSearch = useDebounce(searchInput, 500);
 * 
 * // debouncedSearch only updates 500ms after user stops typing
 * const { data } = useQuery({
 *   queryFn: () => api.search(debouncedSearch),
 *   enabled: debouncedSearch.length > 1
 * });
 */
export const useDebounce = (value, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Set up timer
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup: clear timer if value changes before delay completes
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

export default useDebounce;
