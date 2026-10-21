import type { RouteObject } from 'react-router';
import { AppLayout } from '../components/layout/AppLayout';
import { HomePage } from '../pages/HomePage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { PracticePage } from '../pages/PracticePage';
import { PracticeSetupPage } from '../pages/PracticeSetupPage';
import { SessionSummaryPage } from '../pages/SessionSummaryPage';
import { SettingsPage } from '../pages/SettingsPage';
import { StatisticsPage } from '../pages/StatisticsPage';

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'practice/setup', element: <PracticeSetupPage /> },
      { path: 'practice/session', element: <PracticePage /> },
      { path: 'practice/summary', element: <SessionSummaryPage /> },
      { path: 'statistics', element: <StatisticsPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];
