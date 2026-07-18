import React, { useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { authService } from '../../services/authService';

export const VerifyEmailView = () => {
  const [params] = useSearchParams();
  const started = useRef(false);
  const mutation = useMutation({ mutationFn: authService.verifyEmail });
  const verify = mutation.mutate;

  useEffect(() => {
    const token = params.get('token');
    if (token && !started.current) {
      started.current = true;
      verify(token);
    }
  }, [params, verify]);

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <section className="w-full max-w-md bg-white border border-slate-200 p-8 text-center">
        {mutation.isPending && <p>Verificando correo...</p>}
        {mutation.isSuccess && <><h1 className="text-2xl font-bold">Correo verificado</h1><Link className="mt-5 inline-block text-primary font-bold" to="/login">Continuar al ingreso</Link></>}
        {(mutation.isError || !params.get('token')) && <><h1 className="text-2xl font-bold">No se pudo verificar</h1><p className="mt-3 text-slate-600">El enlace no es válido o ha expirado.</p></>}
      </section>
    </main>
  );
};
