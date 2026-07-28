// @ts-nocheck
import { StrictMode, Component, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Error Boundary - catches any crash and shows friendly message instead of black screen
interface EBProps { children: ReactNode; }
interface EBState { hasError: boolean; message: string; }
class ErrorBoundary extends Component<EBProps, EBState> {
  constructor(props: EBProps) {
    super(props);
    this.state = { hasError: false, message: '' };
  }
  static getDerivedStateFromError(error: Error): EBState {
    return { hasError: true, message: error.message };
  }
  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexDirection: 'column', gap: '16px', background: '#fafafa', fontFamily: 'Inter, sans-serif', padding: '24px'
        }}>
          <div style={{ fontSize: '48px' }}>⚠️</div>
          <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#18181b', textAlign: 'center' }}>
            Възникна грешка в приложението
          </h1>
          <p style={{ fontSize: '14px', color: '#71717a', textAlign: 'center', maxWidth: '400px' }}>
            Моля, опреснете страницата. Ако проблемът продължи, данните в Firebase са непроменени.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{ padding: '10px 24px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}
          >
            Опресни страницата
          </button>
          <pre style={{ fontSize: '11px', color: '#a1a1aa', maxWidth: '500px', overflow: 'auto', textAlign: 'left' }}>
            {this.state.message}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

// Hide the loading spinner once React takes over
function hideLoader() {
  const loader = document.getElementById('root-loader');
  if (loader) {
    loader.style.opacity = '0';
    setTimeout(() => loader.remove(), 300);
  }
}

const root = createRoot(document.getElementById('root')!);
root.render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);

// Hide loader after React renders
setTimeout(hideLoader, 100);
