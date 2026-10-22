import { Suspense, type ReactNode } from 'react';
import type { RouteObject } from 'react-router';
import { PageLoading } from '../components/common/PageLoading';
import { AppLayout } from '../components/layout/AppLayout';
import { ErrorPage } from '../pages/ErrorPage';
import { HomePage } from '../pages/HomePage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { PracticePage } from '../pages/PracticePage';
import { PracticeSetupPage } from '../pages/PracticeSetupPage';
import { SessionSummaryPage } from '../pages/SessionSummaryPage';
import { SettingsPage, StatisticsPage } from './lazyPages';

const withLoading = (page: ReactNode) => <Suspense fallback={<PageLoading />}>{page}</Suspense>;

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <AppLayout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'practice/setup', element: <PracticeSetupPage /> },
      { path: 'practice/session', element: <PracticePage /> },
      { path: 'practice/summary', element: <SessionSummaryPage /> },
      { path: 'statistics', element: withLoading(<StatisticsPage />) },
      { path: 'settings', element: withLoading(<SettingsPage />) },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];
