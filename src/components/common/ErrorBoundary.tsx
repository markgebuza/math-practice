import { Component, type ReactNode } from 'react';
import { ErrorMessage } from './ErrorMessage';

interface ErrorBoundaryProps {
  children: ReactNode;
  onReturnHome: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

// Catches errors outside the router (route errors use the routes' errorElement).
// Logging happens once, in the root's onCaughtError (main.tsx).
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  handleReturnHome = () => {
    this.setState({ hasError: false });
    this.props.onReturnHome();
  };

  render() {
    if (this.state.hasError) {
      return <ErrorMessage onReturnHome={this.handleReturnHome} />;
    }
    return this.props.children;
  }
}
