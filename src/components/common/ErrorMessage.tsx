import { useEffect } from 'react';
import { Button } from './Button';
import { EmptyState } from './EmptyState';

interface ErrorMessageProps {
  title?: string;
  message?: string;
  onReturnHome: () => void;
}

// Shown in place of a page that could not be displayed. It never shows the error itself.
export function ErrorMessage({
  title = 'Oops! Something Went Wrong',
  message = "Something on this page didn't work. It's not your fault! Let's go back home and try again.",
  onReturnHome,
}: ErrorMessageProps) {
  useEffect(() => {
    document.title = `${title} | Math Practice`;
  }, [title]);

  return (
    <main id="main-content" className="page" tabIndex={-1}>
      <h1>{title}</h1>
      <EmptyState message={message}>
        <Button size="lg" onClick={onReturnHome}>
          Return Home
        </Button>
      </EmptyState>
    </main>
  );
}
