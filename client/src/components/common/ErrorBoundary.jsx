import React from 'react';
import { ErrorState } from './ErrorState.jsx';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log error internally in dev mode without exposing stack traces to end users
    console.error('ErrorBoundary caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[300px] flex items-center justify-center p-6">
          <ErrorState
            title="Something went wrong"
            message="An unexpected error occurred while loading this view."
            onRetry={() => this.setState({ hasError: false, error: null })}
          />
        </div>
      );
    }

    return this.props.children;
  }
}
