import { useSyncExternalStore } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

function getMediaQuery() {
  return typeof window.matchMedia === 'function' ? window.matchMedia(QUERY) : null;
}

function subscribe(onChange: () => void) {
  const mediaQuery = getMediaQuery();
  mediaQuery?.addEventListener('change', onChange);
  return () => mediaQuery?.removeEventListener('change', onChange);
}

function getSnapshot() {
  return getMediaQuery()?.matches ?? false;
}

export function usePrefersReducedMotion() {
  return useSyncExternalStore(subscribe, getSnapshot);
}
