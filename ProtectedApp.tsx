import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './style.css';

type AuthStatus = 'checking' | 'authenticated' | 'unauthenticated';

const API_AUTH_ME = '/api/auth/me';

const AuthenticatedApp = () => {
  const [status, setStatus] = useState<AuthStatus>('checking');

  useEffect(() => {
    let cancelled = false;

    const verify = async () => {
      try {
        const response = await fetch(API_AUTH_ME, {
          credentials: 'include',
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error('unauthorized');
        }

        if (!cancelled) {
          setStatus('authenticated');
        }
      } catch {
        if (!cancelled) {
          setStatus('unauthenticated');
          window.location.replace('/login');
        }
      }
    };

    void verify();
    return () => {
      cancelled = true;
    };
  }, []);

  if (status !== 'authenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050812] text-white">
        <div className="rounded-2xl border border-slate-700 bg-slate-900/90 px-6 py-5 text-center shadow-2xl">
          <div className="text-xs uppercase tracking-[0.32em] text-slate-400">COMPASS</div>
          <div className="mt-3 text-lg font-semibold">Verificando acceso...</div>
        </div>
      </div>
    );
  }

  return <App />;
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Could not find root element to mount to');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <AuthenticatedApp />
  </React.StrictMode>
);
