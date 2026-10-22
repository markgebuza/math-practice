import '@testing-library/jest-dom/vitest';
import { cleanup, configure } from '@testing-library/react';
import { afterEach } from 'vitest';

// The Statistics and Settings pages are lazy-loaded; loading them can pass the 1 s default when
// many test files run in parallel.
configure({ asyncUtilTimeout: 5000 });

// jsdom has no scrolling; React Router's ScrollRestoration calls this on every navigation.
window.scrollTo = () => {};

afterEach(() => {
  cleanup();
  localStorage.clear();
});
