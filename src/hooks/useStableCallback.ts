import { useCallback, useRef } from 'react';

export function useStableCallback<T extends (...args: any[]) => any>(callback: T) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  return useCallback((...args: Parameters<T>) => {
    return callbackRef.current(...args);
  }, []);
} 