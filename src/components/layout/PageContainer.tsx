import { useEffect, useRef, type ReactNode } from 'react';
import { useLocation } from 'react-router';
import './PageContainer.css';

interface PageContainerProps {
  title: string;
  children?: ReactNode;
}

export function PageContainer({ title, children }: PageContainerProps) {
  const mainRef = useRef<HTMLElement>(null);
  const { key } = useLocation();

  useEffect(() => {
    document.title = title === 'Math Practice' ? title : `${title} | Math Practice`;
  }, [title]);

  // After in-app navigation, start keyboard and screen-reader users at the new page, not the old link.
  // 'default' is the location the app opened on, where the browser's own focus handling applies.
  useEffect(() => {
    if (key !== 'default') {
      mainRef.current?.focus({ preventScroll: true });
    }
  }, [key]);

  return (
    <main id="main-content" className="page" tabIndex={-1} ref={mainRef}>
      <h1>{title}</h1>
      {children}
    </main>
  );
}
