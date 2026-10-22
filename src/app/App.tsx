import { createBrowserRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { ErrorBoundary } from '../components/common/ErrorBoundary';
import { AppProvider } from './AppProvider';
import { routes } from './AppRoutes';

const router = createBrowserRouter(routes);

// A full reload starts again from the validated stored data.
function reloadHome() {
  window.location.assign('/');
}

// Render errors are logged once by the root's onCaughtError (main.tsx); without this handler
// React Router would also log them in production.
function ignoreRouteError() {}

function App() {
  return (
    <ErrorBoundary onReturnHome={reloadHome}>
      <AppProvider>
        <RouterProvider router={router} onError={ignoreRouteError} />
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App;
