import { useEffect, type ReactNode } from 'react';
import './PageContainer.css';

interface PageContainerProps {
  title: string;
  children?: ReactNode;
}

export function PageContainer({ title, children }: PageContainerProps) {
  useEffect(() => {
    document.title = title === 'Math Practice' ? title : `${title} | Math Practice`;
  }, [title]);

  return (
    <main id="main-content" className="page" tabIndex={-1}>
      <h1>{title}</h1>
      {children}
    </main>
  );
}
