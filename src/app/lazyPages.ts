import { lazy } from 'react';

// Not needed to start practicing, so they are kept out of the first download.
export const StatisticsPage = lazy(() =>
  import('../pages/StatisticsPage').then((module) => ({ default: module.StatisticsPage })),
);
export const SettingsPage = lazy(() =>
  import('../pages/SettingsPage').then((module) => ({ default: module.SettingsPage })),
);
