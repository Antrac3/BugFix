import { useCallback, useMemo, useRef } from "react";

// Hook per ottimizzare callback e prevenire re-render inutili
export function useMemoizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList,
): T {
  return useCallback(callback, deps);
}

// Hook per debouncing delle chiamate
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
): T {
  const timeoutRef = useRef<NodeJS.Timeout>();

  return useCallback(
    ((...args: any[]) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => callback(...args), delay);
    }) as T,
    [callback, delay],
  );
}

// Hook per memoizzare oggetti complessi
export function useDeepMemo<T>(
  factory: () => T,
  deps: React.DependencyList,
): T {
  return useMemo(factory, deps);
}

// Hook per ottimizzare liste lunghe
export function useVirtualization<T>(
  items: T[],
  containerHeight: number,
  itemHeight: number,
) {
  return useMemo(() => {
    const visibleItems = Math.ceil(containerHeight / itemHeight);
    const buffer = Math.ceil(visibleItems * 0.5); // 50% buffer

    return {
      visibleItems,
      buffer,
      totalHeight: items.length * itemHeight,
    };
  }, [items.length, containerHeight, itemHeight]);
}

// Hook per throttling
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
): T {
  const lastRun = useRef(Date.now());

  return useCallback(
    ((...args: any[]) => {
      if (Date.now() - lastRun.current >= delay) {
        callback(...args);
        lastRun.current = Date.now();
      }
    }) as T,
    [callback, delay],
  );
}
