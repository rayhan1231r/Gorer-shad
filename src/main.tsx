import React, { Component, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Applet uncaught render error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: 'system-ui, sans-serif', backgroundColor: '#f8fafc', color: '#0f172a' }}>
          <div style={{ maxWidth: '480px', width: '100%', backgroundColor: '#ffffff', borderRadius: '16px', padding: '32px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', textAlign: 'center' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#fef2f2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto', fontSize: '24px' }}>
              ⚠️
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>পেজ লোড হতে সাময়িক সমস্যা হয়েছে</h2>
            <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '20px', lineHeight: '1.5' }}>
              অনুগ্রহ করে নিচের বাটনে ক্লিক করে পেজটি রিলোড দিন।
            </p>
            {this.state.error?.message && (
              <div style={{ backgroundColor: '#f1f5f9', padding: '12px', borderRadius: '8px', fontSize: '12px', color: '#334155', textAlign: 'left', overflowX: 'auto', marginBottom: '20px', fontFamily: 'monospace' }}>
                {this.state.error.message}
              </div>
            )}
            <button
              onClick={() => {
                localStorage.removeItem('ghorer_shad_cart');
                window.location.reload();
              }}
              style={{ backgroundColor: '#166534', color: '#ffffff', border: 'none', padding: '10px 24px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
            >
              পুনরায় রিলোড করুন (Reload)
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
