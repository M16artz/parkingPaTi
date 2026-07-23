import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Check, LoaderCircle, LogIn, X } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { authService } from '../../services/authService';

export const VerifyEmailView = () => {
  const [params] = useSearchParams();
  const token = params.get('token');
  const started = useRef(false);
  const [status, setStatus] = useState(token ? 'pending' : 'error');

  useEffect(() => {
    if (!token || started.current) return;

    started.current = true;
    authService.verifyEmail(token)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [token]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-sky-100 p-6 font-body text-slate-800">
      <section className="w-full max-w-lg rounded-[32px] border border-white/70 bg-white px-7 py-12 text-center shadow-[0_25px_60px_-20px_rgba(2,132,199,0.3)] sm:px-12">
        {status === 'pending' && (
          <div className="flex flex-col items-center" role="status" aria-live="polite">
            <div className="grid h-24 w-24 place-items-center rounded-full bg-sky-100 text-sky-700">
              <LoaderCircle aria-hidden="true" className="animate-spin" size={44} />
            </div>
            <h1 className="mt-7 font-headline text-3xl font-bold text-slate-900">
              Verificando correo…
            </h1>
            <p className="mt-3 text-slate-500">Esto tomará solo un momento.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center" aria-live="polite">
            <div className="grid h-28 w-28 place-items-center rounded-full bg-emerald-100 text-emerald-600 ring-8 ring-emerald-50">
              <Check aria-hidden="true" strokeWidth={3} size={54} />
            </div>
            <span className="mt-8 text-xs font-black uppercase tracking-[0.2em] text-emerald-600">
              Verificación completada
            </span>
            <h1 className="mt-3 font-headline text-3xl font-bold text-slate-900 sm:text-4xl">
              Correo verificado
            </h1>
            <p className="mt-4 max-w-sm leading-relaxed text-slate-500">
              Tu dirección de correo fue confirmada correctamente. Ya puedes iniciar sesión en ParkingPaTi.
            </p>
            <div className="mt-9 grid w-full gap-3 sm:grid-cols-2">
              <Link
                to="/"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-sky-700 px-5 font-bold text-sky-800 transition-colors hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2"
              >
                <ArrowLeft aria-hidden="true" size={19} />
                Regresar al inicio
              </Link>
              <Link
                to="/login"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-sky-700 px-5 font-bold text-white shadow-md transition-colors hover:bg-sky-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2"
              >
                Iniciar sesión
                <LogIn aria-hidden="true" size={19} />
              </Link>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center" role="alert">
            <div className="grid h-24 w-24 place-items-center rounded-full bg-rose-100 text-rose-600">
              <X aria-hidden="true" strokeWidth={3} size={46} />
            </div>
            <h1 className="mt-7 font-headline text-3xl font-bold text-slate-900">
              No se pudo verificar
            </h1>
            <p className="mt-3 max-w-sm leading-relaxed text-slate-500">
              El enlace no es válido, ya fue utilizado o ha expirado. Solicita una nueva confirmación e inténtalo otra vez.
            </p>
            <Link
              to="/"
              className="mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-sky-700 px-7 font-bold text-white shadow-md hover:bg-sky-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2"
            >
              <ArrowLeft aria-hidden="true" size={19} />
              Regresar al inicio
            </Link>
          </div>
        )}
      </section>
    </main>
  );
};
