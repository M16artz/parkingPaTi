import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, ArrowRight, Car, ClipboardList } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import portadaLogin from '../../assets/portadaLogin.png';
import { useLoginController } from '../../controllers/useLoginController';
import { authService } from '../../services/authService';
import { destinoSesion } from '../../utils/adminAccess';
import { LoginForm } from '../components/auth/AuthForms';

const LoginAccessView = () => {
  const navigate = useNavigate();
  const login = useLoginController();
  const session = useQuery({ queryKey: ['auth', 'me'], queryFn: authService.me, retry: false, staleTime: 0 });
  useEffect(() => {
    if (session.isSuccess) navigate(destinoSesion(session.data), { replace: true });
  }, [navigate, session.data, session.isSuccess]);
  if (session.isPending || session.isSuccess) return <main className="grid min-h-screen place-items-center bg-sky-100 font-body text-sky-900"><span className="font-headline font-bold">ParkingPaTi · Validando sesión…</span></main>;

  return <main className="min-h-screen overflow-x-hidden bg-gradient-to-br from-sky-100 via-white to-blue-100 p-3 font-body sm:p-6 lg:grid lg:place-items-center">
    <section className="relative mx-auto w-full max-w-6xl overflow-hidden rounded-[2rem] bg-white shadow-[0_30px_80px_-20px_rgba(15,23,42,0.35)] motion-safe:animate-[owner-view-enter_260ms_ease-out] lg:grid lg:min-h-[620px] lg:grid-cols-2 xl:min-h-[720px]">
      <button type="button" onClick={() => navigate('/')} className="absolute left-4 top-4 z-30 inline-flex min-h-11 items-center gap-2 rounded-xl bg-white/90 px-3 text-sm font-bold text-slate-800 shadow-sm backdrop-blur hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600"><ArrowLeft aria-hidden="true" size={18} /> Volver al inicio</button>
      <div className="relative min-h-56 overflow-hidden lg:order-2 lg:min-h-full"><img src={portadaLogin} alt="Parqueadero iluminado durante la noche" className="absolute inset-0 h-full w-full object-cover" /><div className="absolute inset-0 bg-gradient-to-b from-sky-950/35 to-slate-950/85" /><div className="relative z-10 flex min-h-56 flex-col items-center justify-center px-8 pt-12 text-center text-white lg:min-h-full lg:pt-0"><span className="grid h-14 w-14 place-items-center rounded-2xl bg-white/15 backdrop-blur"><Car aria-hidden="true" size={30} /></span><h2 className="mt-5 font-headline text-3xl font-bold">¡Hola, bienvenido!</h2><p className="mt-3 text-sky-100">¿Aún no tienes una cuenta?</p><button type="button" onClick={() => navigate('/login?mode=register')} className="mt-6 min-h-12 rounded-xl border border-white/70 px-7 font-bold text-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">Crear una cuenta</button></div></div>
      <div className="flex items-center p-6 pt-10 sm:p-10 lg:order-1 lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto xl:p-14"><LoginForm controller={login} onSubmit={(event) => login.handleSubmit(event, (data) => navigate(destinoSesion(data), { replace: true }))} onRegister={() => navigate('/login?mode=register')} /></div>
    </section>
  </main>;
};

const RegisterAccessView = () => {
  const navigate = useNavigate();
  return <main className="min-h-screen overflow-x-hidden bg-gradient-to-br from-sky-100 via-white to-blue-100 p-3 font-body sm:p-6 lg:grid lg:place-items-center">
    <section className="relative mx-auto grid min-h-[620px] w-full max-w-6xl overflow-hidden rounded-[2rem] bg-white shadow-[0_30px_80px_-20px_rgba(15,23,42,0.35)] motion-safe:animate-[owner-view-enter_260ms_ease-out] lg:grid-cols-2 xl:min-h-[720px]">
      <button type="button" onClick={() => navigate('/')} className="absolute left-4 top-4 z-30 inline-flex min-h-11 items-center gap-2 rounded-xl bg-white/90 px-3 text-sm font-bold text-slate-800 shadow-sm backdrop-blur hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600"><ArrowLeft aria-hidden="true" size={18} /> Volver al inicio</button>
      <div className="auth-register-image relative min-h-64 overflow-hidden lg:min-h-full">
        <img src={portadaLogin} alt="Entrada iluminada de un parqueadero" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-sky-950/30 to-slate-950/85" />
        <div className="relative z-10 flex min-h-64 flex-col items-center justify-center px-8 pt-12 text-center text-white lg:min-h-full lg:pt-0">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white/15 backdrop-blur"><Car aria-hidden="true" size={30} /></span>
          <h2 className="mt-5 font-headline text-3xl font-bold">Registra tu parqueadero</h2>
          <p className="mt-3 max-w-sm text-sky-100">Crea tu cuenta de propietario y envía la información necesaria para iniciar el proceso.</p>
        </div>
      </div>
      <div className="auth-register-content flex items-center p-6 sm:p-10 xl:p-14">
        <div className="mx-auto w-full max-w-md text-center">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-sky-100 text-primary"><ClipboardList aria-hidden="true" size={30} /></span>
          <p className="mt-6 text-sm font-black uppercase tracking-widest text-sky-700">Registro de propietario</p>
          <h1 className="mt-2 font-headline text-3xl font-bold text-slate-950 sm:text-4xl">Comienza tu registro</h1>
          <p className="mt-4 leading-7 text-slate-600">El formulario completo se encuentra en una página independiente con tres pasos: datos personales, ubicación del parqueadero y documento.</p>
          <button type="button" onClick={() => navigate('/register')} className="mt-8 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 font-bold text-white shadow-sm transition hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">Continuar al registro <ArrowRight aria-hidden="true" size={19} /></button>
          <p className="mt-6 text-sm text-slate-600">¿Ya tienes una cuenta? <button type="button" onClick={() => navigate('/login', { replace: true })} className="font-bold text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">Iniciar sesión</button></p>
        </div>
      </div>
    </section>
  </main>;
};

export const LoginView = () => {
  const [searchParams] = useSearchParams();
  if (searchParams.get('mode') === 'register') return <RegisterAccessView />;
  return <LoginAccessView />;
};
