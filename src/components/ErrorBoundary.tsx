import React, { Component, ErrorInfo, ReactNode } from 'react';
import Button from './Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
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
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      let errorDetails = null;
      try {
        if (this.state.error?.message) {
          errorDetails = JSON.parse(this.state.error.message);
        }
      } catch (e) {
        // Not a JSON error
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4" dir="rtl">
          <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-slate-200">
            <div className="bg-red-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 mx-auto">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-black text-slate-900 text-center mb-4">عذراً، حدث خطأ ما</h2>
            <p className="text-slate-600 text-center mb-8">
              واجهنا مشكلة تقنية. يرجى المحاولة مرة أخرى لاحقاً.
            </p>
            
            {errorDetails && (
              <div className="bg-slate-100 rounded-2xl p-4 mb-8 text-xs font-mono overflow-auto max-h-40">
                <p className="font-bold mb-2 text-slate-700">تفاصيل الخطأ:</p>
                <pre>{JSON.stringify(errorDetails, null, 2)}</pre>
              </div>
            )}

            <Button
              onClick={() => window.location.reload()}
              className="w-full py-4 shadow-blue-200"
            >
              إعادة تحميل الصفحة
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
