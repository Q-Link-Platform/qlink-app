'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface SimpleAutoReloadState {
  hasError: boolean;
  errorCount: number;
  isRetrying: boolean;
  lastError: Error | null;
}

interface SimpleAutoReloadProps {
  children: ReactNode;
  maxRetries?: number;
  retryDelay?: number;
}

// Simple Auto-Reload Boundary Component
export class SimpleAutoReload extends Component<SimpleAutoReloadProps, SimpleAutoReloadState> {
  private retryTimeout: NodeJS.Timeout | null = null;
  private maxRetries: number;
  private retryDelay: number;

  constructor(props: SimpleAutoReloadProps) {
    super(props);
    
    this.state = {
      hasError: false,
      errorCount: 0,
      isRetrying: false,
      lastError: null
    };
    
    this.maxRetries = props.maxRetries || 3;
    this.retryDelay = props.retryDelay || 1000;
  }

  static getDerivedStateFromError(error: Error): Partial<SimpleAutoReloadState> {
    return {
      hasError: true,
      lastError: error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.log('🔄 Auto-Reload: Error detected', error);
    console.log('📊 Error Info:', errorInfo);
    
    // Start auto-retry process
    this.startAutoRetry();
  }

  componentWillUnmount() {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }
  }

  private startAutoRetry = () => {
    if (this.state.errorCount >= this.maxRetries) {
      console.log('❌ Auto-Reload: Max retries reached');
      return;
    }

    console.log(`🔄 Auto-Reload: Attempting retry ${this.state.errorCount + 1}/${this.maxRetries}`);
    
    this.setState({ isRetrying: true });

    this.retryTimeout = setTimeout(() => {
      this.performRetry();
    }, this.retryDelay);
  };

  private performRetry = () => {
    console.log('🔄 Auto-Reload: Performing retry...');
    
    this.setState(prevState => ({
      hasError: false,
      errorCount: prevState.errorCount + 1,
      isRetrying: false,
      lastError: null
    }));

    // Force a re-render by clearing any cached data
    this.clearCacheIfNeeded();
  };

  private clearCacheIfNeeded = () => {
    // Clear browser cache if needed
    if (typeof window !== 'undefined' && 'caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          caches.delete(name);
        });
      });
    }
  };

  private handleManualRetry = () => {
    this.setState({
      errorCount: 0,
      hasError: false,
      isRetrying: false,
      lastError: null
    });
  };

  render() {
    if (this.state.hasError) {
      // Show minimal error UI with auto-retry
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900">
          <div className="text-center p-6">
            <div className="mb-4">
              {this.state.isRetrying ? (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto"></div>
              ) : (
                <div className="text-4xl">🔄</div>
              )}
            </div>
            
            {this.state.isRetrying ? (
              <p className="text-cyan-400 text-sm mb-2">Auto-recovering...</p>
            ) : (
              <>
                <p className="text-slate-400 text-sm mb-2">Something went wrong</p>
                <p className="text-slate-500 text-xs mb-4">
                  Attempt {this.state.errorCount} of {this.maxRetries}
                </p>
                {this.state.errorCount >= this.maxRetries && (
                  <button
                    onClick={this.handleManualRetry}
                    className="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded text-sm transition-colors"
                  >
                    Try Again
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
