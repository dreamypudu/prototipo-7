import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const AuthGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email.trim() || !password) return;
    setIsSubmitting(true);
    setError('');
    try {
      await login(email.trim(), password);
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'No se pudo iniciar sesion.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
        <div className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-200">Cargando sesion</div>
      </div>
    );
  }

  if (user) return <>{children}</>;

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-lg border border-white/10 bg-slate-900 p-6 shadow-2xl"
      >
        <div className="mb-6">
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-200">COMPASS</div>
          <h1 className="mt-2 text-2xl font-bold text-white">Acceso a la plataforma</h1>
        </div>

        <label className="block text-sm font-semibold text-slate-200">
          Email
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-2 w-full rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-white outline-none transition focus:border-cyan-300"
          />
        </label>

        <label className="mt-4 block text-sm font-semibold text-slate-200">
          Password
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-2 w-full rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-white outline-none transition focus:border-cyan-300"
          />
        </label>

        {error && (
          <div className="mt-4 rounded-md border border-rose-300/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-100">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting || !email.trim() || !password}
          className="mt-6 w-full rounded-md bg-cyan-500 px-4 py-2 font-bold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
        >
          {isSubmitting ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>
    </div>
  );
};

export default AuthGate;
