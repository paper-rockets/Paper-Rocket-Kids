import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#141529] text-white p-6 font-['Fredoka',sans-serif]">
          <div className="bg-[#1E2040] p-8 rounded-3xl border-4 border-black shadow-[6px_6px_0_#FFE600] max-w-lg text-center">
            <span className="text-5xl mb-4 block">🚀</span>
            <h1 className="text-2xl font-black mb-2 text-[#FFE600]">Oops! Studio Reloading...</h1>
            <p className="text-gray-300 text-sm mb-6">
              {this.state.error?.message || 'Something unexpected happened while rendering the 3D studio.'}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="px-6 py-3 bg-[#FF2A6D] text-white font-bold rounded-2xl border-2 border-black shadow-[3px_3px_0_#000] hover:scale-105 active:scale-95 transition-transform cursor-pointer"
            >
              Reload Studio
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
