import type { ReactNode } from 'react';
import './EmptyState.css';

interface EmptyStateProps {
  message: string;
  children?: ReactNode;
}

export function EmptyState({ message, children }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <p className="empty-state__message">{message}</p>
      {children}
    </div>
  );
}
