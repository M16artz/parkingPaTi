import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, ArrowRight, Car } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

// Assets e Imágenes
import portadaLogin from '../../assets/portadaLogin.png';

// Controladores, Servicios y Componentes
import { useLoginController } from '../../controllers/useLoginController';
import { authService } from '../../services/authService';
import { destinoSesion } from '../../utils/adminAccess';
import { LoginForm } from '../components/auth/AuthForms';

export const LoginView = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const login = useLoginController();

  // Determinar si estamos en modo registro según la URL
  const isSignUp = searchParams.get('mode') === 'register';

  // Cambiar de pestaña con animación y actualizar la URL
  const handleToggleMode = (signUp) => {
    if (signUp) {
      setSearchParams({ mode: 'register' });
    } else {
      setSearchParams({});
    }
  };

  // Validación de sesión activa
  const session = useQuery({ 
    queryKey: ['auth', 'me'], 
    queryFn: authService.me, 
    retry: false, 
    staleTime: 0 
  });

  useEffect(() => {
    if (session.isSuccess) {
      navigate(destinoSesion(session.data), { replace: true });
    }
  }, [navigate, session.data, session.isSuccess]);

  if (session.isPending || session.isSuccess) {
    return (
      <main className="grid min-h-screen place-items-center bg-sky-100 font-body text-sky-900">
        <span className="font-headline font-bold text-lg animate-pulse">
          ParkingPaTi · Validando sesión…
        </span>
      </main>
    );
  }

  return (
    <main className="w-full min-h-screen overflow-x-hidden bg-sky-100 font-body text-slate-800 flex items-center justify-center p-4 sm:p-6 select-none">
      <div className="relative bg-white w-full max-w-[1400px] h-[85vh] min-h-[650px] rounded-[32px] overflow-hidden border-none flex shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)]">
        
        {/* Botón Volver al Inicio (Fijo) */}
        <button 
          type="button" 
          onClick={() => navigate('/')} 
          className="absolute left-6 top-6 z-30 inline-flex items-center gap-2 rounded-2xl bg-white/90 px-4 py-2.5 text-sm font-bold text-slate-800 shadow-md backdrop-blur-md hover:bg-white hover:scale-105 active:scale-95 transition-all duration-200"
        >
          <ArrowLeft aria-hidden="true" size={18} /> Volver al inicio
        </button>

        {/* ========================================================= */}
        {/* 1. PANEL FORMULARIO DE INICIAR SESIÓN (Lado Izquierdo)    */}
        {/* ========================================================= */}
        <div 
          className={`
            w-full lg:w-1/2 h-full bg-white 
            flex flex-col items-center justify-center 
            px-8 sm:px-12 md:px-16 py-12 z-10 overflow-y-auto
            transition-all duration-500 ease-in-out
            ${isSignUp ? 'lg:translate-x-full lg:opacity-0 pointer-events-none' : 'translate-x-0 opacity-100'}
          `}
        >
          {/* Logo y Branding */}
          <div className="flex flex-col items-center justify-center mb-3 text-primary gap-2">
            <Car size={42} className="text-primary" />
            <span className="text-2xl font-bold font-headline text-primary tracking-wide">
              ParkingPaTi
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold font-headline text-slate-900 mb-8 tracking-tight text-center">
            Iniciar sesión
          </h1>

          {/* Formulario de Login */}
          <div className="w-full max-w-md [&>div>:first-child:not(form)]:hidden [&_h1]:hidden [&_h2]:hidden [&_span]:hidden [&_p]:hidden">
            <LoginForm 
              controller={login} 
              onSubmit={(event) => 
                login.handleSubmit(event, (data) => 
                  navigate(destinoSesion(data), { replace: true })
                )
              } 
              onRegister={() => handleToggleMode(true)} 
            />
          </div>
        </div>

        {/* ========================================================= */}
        {/* 2. PANEL DE ACCESO A REGISTRO (Lado Derecho)              */}
        {/* ========================================================= */}
        <div 
          className={`
            w-full lg:w-1/2 h-full bg-white 
            flex flex-col items-center justify-center 
            px-8 sm:px-12 md:px-16 py-12 z-10 overflow-y-auto
            transition-all duration-500 ease-in-out
            ${isSignUp ? 'translate-x-0 opacity-100' : 'lg:-translate-x-full lg:opacity-0 pointer-events-none'}
          `}
        >
          {/* Logo y Branding */}
          <div className="flex flex-col items-center justify-center mb-3 text-primary gap-2">
            <Car size={42} className="text-primary" />
            <span className="text-2xl font-bold font-headline text-primary tracking-wide">
              ParkingPaTi
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold font-headline text-slate-900 mb-6 tracking-tight text-center">
            Comienza tu registro
          </h1>

          <p className="text-slate-600 text-base md:text-lg leading-relaxed text-center mb-8 max-w-md">
            El formulario completo se encuentra en una página independiente con tres pasos: datos personales, ubicación del parqueadero y documento.
          </p>

          {/* Botón Principal (Mismo tamaño text-base y formato minúscula) */}
          <button 
            type="button" 
            onClick={() => navigate('/register')} 
            className="w-full max-w-md py-4 px-8 bg-primary hover:opacity-90 text-white font-bold text-base rounded-2xl shadow-md shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all duration-200 flex items-center justify-center gap-2"
          >
            Continuar al registro <ArrowRight size={20} />
          </button>

          <p className="mt-8 text-sm text-slate-500 font-body">
            ¿Ya tienes una cuenta?{' '}
            <button 
              type="button" 
              onClick={() => handleToggleMode(false)} 
              className="font-bold text-primary hover:underline underline-offset-4 focus:outline-none"
            >
              Iniciar sesión
            </button>
          </p>
        </div>

        {/* ========================================================= */}
        {/* 3. PANEL SLIDER INTERACTIVO (DESLIZABLE CON PORTADA)       */}
        {/* ========================================================= */}
        <div 
          className={`
            hidden lg:flex absolute top-0 left-1/2 
            w-1/2 h-full 
            transition-all duration-500 ease-in-out 
            z-20 overflow-hidden 
            flex-col items-center justify-center 
            px-16 text-center text-white
            ${isSignUp ? '-translate-x-full rounded-l-[32px] rounded-r-0' : 'translate-x-0 rounded-r-[32px] rounded-l-0'}
          `}
          style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
        >
          {/* Imagen de Portada */}
          <img 
            src={portadaLogin} 
            alt="Portada Parqueadero" 
            className="absolute inset-0 w-full h-full object-cover z-0 select-none pointer-events-none"
          />

          {/* Capa de Degradado Oscuro */}
          <div className="absolute inset-0 bg-gradient-to-b from-sky-950/40 via-sky-900/60 to-slate-950/85 z-10" />

          {/* Contenido Dinámico */}
          <div className="relative z-20 flex flex-col items-center gap-4 max-w-md">
            {!isSignUp ? (
              <>
                <h2 className="text-4xl md:text-5xl font-bold font-headline leading-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.4)]">
                  ¡Hola, bienvenido!
                </h2>
                <p className="text-sky-100 text-lg font-light leading-relaxed">
                  ¿Aún no tienes una cuenta de propietario?
                </p>
                <button 
                  type="button" 
                  onClick={() => handleToggleMode(true)}
                  className="mt-4 px-12 py-4 bg-transparent border-2 border-white text-white rounded-2xl text-base font-bold outline-none hover:bg-white hover:text-primary hover:scale-105 active:scale-95 shadow-lg transition-all duration-200"
                >
                  Crear una cuenta
                </button>
              </>
            ) : (
              <>
                <h2 className="text-4xl md:text-5xl font-bold font-headline leading-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.4)]">
                  Registra tu parqueadero
                </h2>
                <p className="text-sky-100 text-lg font-light leading-relaxed">
                  Crea tu cuenta de propietario y envía la información necesaria para iniciar el proceso.
                </p>
                <button 
                  type="button" 
                  onClick={() => handleToggleMode(false)}
                  className="mt-4 px-12 py-4 bg-transparent border-2 border-white text-white rounded-2xl text-base font-bold outline-none hover:bg-white hover:text-primary hover:scale-105 active:scale-95 shadow-lg transition-all duration-200"
                >
                  Iniciar sesión
                </button>
              </>
            )}
          </div>
        </div>

      </div>
    </main>
  );
};