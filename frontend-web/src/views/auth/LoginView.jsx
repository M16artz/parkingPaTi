// ============================================================================
// 1. IMPORTACIONES
// ============================================================================
import React, { useState, useEffect } from 'react';
import { User, Lock, Mail, Car } from 'lucide-react';

// Componentes Atómicos Reutilizables
import { Button } from '../components/Button'; // Ajustado según tu árbol de carpetas
import { Input } from '../components/Input';

// Controladores Custom Hooks Desacoplados
import { useLoginController } from '../../controllers/useLoginController'; // Ruta corregida con ../../
import { useRegisterController } from '../../controllers/useRegisterController'; // Ruta corregida con ../../

// Assets e Imágenes de la Vista
import portadaLogin from '../../assets/portadaLogin.png';

// ============================================================================
// 2. DEFINICIÓN DEL COMPONENTE
// ============================================================================
export const LoginView = () => {
  // Estados de maquetación y animación visual
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Inyección de los controladores limpios de Login y Registro
  const loginCtrl = useLoginController();
  const registerCtrl = useRegisterController();

  // Control de animación de entrada fluida
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Callbacks de éxito para las APIs
  const handleLoginSuccess = (data) => {
    alert("¡Login validado correctamente de forma limpia! Datos listos para la API: " + JSON.stringify(data));
  };

  const handleRegisterSuccess = (data) => {
    alert("¡Registro validado correctamente de forma limpia! Datos listos para la API.");
  };

  return (
    <div 
      className={
        "w-full " +
        "min-h-screen " +
        "overflow-x-hidden " +
        "bg-bg " + 
        "flex items-center justify-center " +
        "p-6 " +
        "select-none"
      }
    >
      <div 
        className={`
          relative 
          bg-white 
          w-full max-w-[1400px] h-[85vh] 
          rounded-[32px] overflow-hidden 
          border-none 
          flex 
          shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] 
          transition-all duration-[400ms] ease-out 
          ${isLoaded ? 'translate-x-0 opacity-100' : 'translate-x-1/4 opacity-0'}
        `}
      >
        
        {/* ========================================================= */}
        {/* 1. SIGN IN FORM PANEL (Fondo Blanco)                      */}
        {/* ========================================================= */}
        <div 
          className={`
            w-1/2 h-full 
            bg-white 
            flex flex-col items-center justify-center 
            px-16 
            transition-all duration-500 ease-in-out 
            z-10 
            ${isSignUp ? 'translate-x-full opacity-0 pointer-events-none' : 'translate-x-0 opacity-100'}
          `}
        >
          {/* Logo y Branding */}
          <div className="flex flex-col items-center justify-center mb-6 text-primary gap-2">
            <Car size={40} />
            <span className="text-xl font-bold font-headline text-primary tracking-wide">
              ParkingPaTi
            </span>
          </div>
          
          <h1 className="text-5xl font-bold font-body text-tertiary mb-10 tracking-tight text-center">
            Iniciar Sesión
          </h1>
          
          {/* Formulario e Inputs Envalidados */}
          <form 
            onSubmit={(e) => loginCtrl.handleSubmit(e, handleLoginSuccess)}
            className="w-full max-w-md flex flex-col items-center gap-4"
          >
            {/* Campo Correo */}
            <div className="w-full flex flex-col gap-1.5">
              <label className="text-sm font-bold text-slate-600 text-left self-start">
                Correo electrónico <span className="text-red-500 font-black ml-0.5">*</span>
              </label>
              <Input 
                name="correo"
                value={loginCtrl.formData.correo}
                onChange={loginCtrl.handleChange}
                placeholder="ejemplo@correo.com" 
                icon={Mail} 
              />
              {loginCtrl.errors.correo && (
                <span className="text-xs font-bold text-red-500 px-1 text-left self-start animate-fadeIn">{loginCtrl.errors.correo}</span>
              )}
            </div>

            {/* Campo Contraseña */}
            <div className="w-full flex flex-col gap-1.5">
              <label className="text-sm font-bold text-slate-600 text-left self-start">
                Contraseña <span className="text-red-500 font-black ml-0.5">*</span>
              </label>
              <Input 
                type="password" 
                name="password"
                value={loginCtrl.formData.password}
                onChange={loginCtrl.handleChange}
                placeholder="••••••••" 
                icon={Lock} 
              />
              {loginCtrl.errors.password && (
                <span className="text-xs font-bold text-red-500 px-1 text-left self-start animate-fadeIn">{loginCtrl.errors.password}</span>
              )}
            </div>
            
            <Button 
              type="submit"
              variant="primary" 
              className="w-full py-4 text-base font-bold rounded-2xl mt-4 shadow-md shadow-primary/10"
            >
              Iniciar Sesión
            </Button>

            <a 
              href="#forgot" 
              className="text-sm text-gray-400 hover:text-primary transition-colors mt-8 font-label"
            >
              ¿Olvidaste tu contraseña?
            </a>
          </form>
        </div>

        {/* ========================================================= */}
        {/* 2. SIGN UP FORM PANEL (Fondo Blanco)                      */}
        {/* ========================================================= */}
        <div 
          className={`
            w-1/2 h-full 
            bg-white 
            flex flex-col items-center justify-center 
            px-16 
            transition-all duration-500 ease-in-out 
            z-10 
            ${isSignUp ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0 pointer-events-none'}
          `}
        >
          {/* Logo y Branding */}
          <div className="flex flex-col items-center justify-center mb-6 text-primary gap-2">
            <Car size={40} />
            <span className="text-xl font-bold font-headline text-primary tracking-wide">
              ParkingPaTi
            </span>
          </div>
          
          <h1 className="text-5xl font-bold font-body text-tertiary mb-8 tracking-tight text-center">
            Crear Cuenta
          </h1>
          
          {/* Formulario de registro Envalidado */}
          <form 
            onSubmit={(e) => registerCtrl.handleSubmit(e, handleRegisterSuccess)}
            className="w-full max-w-md flex flex-col items-center gap-4"
          >
            {/* Campo Nombres */}
            <div className="w-full flex flex-col gap-1.5">
              <label className="text-sm font-bold text-slate-600 text-left self-start">
                Nombres <span className="text-red-500 font-black ml-0.5">*</span>
              </label>
              <Input 
                name="nombres"
                value={registerCtrl.formData.nombres}
                onChange={registerCtrl.handleChange}
                placeholder="Tus nombres" 
                icon={User} 
              />
              {registerCtrl.errors.nombres && (
                <span className="text-xs font-bold text-red-500 px-1 text-left self-start animate-fadeIn">{registerCtrl.errors.nombres}</span>
              )}
            </div>

            {/* Campo Apellidos */}
            <div className="w-full flex flex-col gap-1.5">
              <label className="text-sm font-bold text-slate-600 text-left self-start">
                Apellidos <span className="text-red-500 font-black ml-0.5">*</span>
              </label>
              <Input 
                name="apellidos"
                value={registerCtrl.formData.apellidos}
                onChange={registerCtrl.handleChange}
                placeholder="Tus apellidos" 
                icon={User} 
              />
              {registerCtrl.errors.apellidos && (
                <span className="text-xs font-bold text-red-500 px-1 text-left self-start animate-fadeIn">{registerCtrl.errors.apellidos}</span>
              )}
            </div>
            
            <Button 
              type="submit"
              variant="primary" 
              className="w-full py-4 text-base font-bold rounded-2xl mt-4 shadow-md shadow-primary/10"
            >
              Registrarse
            </Button>

            <p className="text-xs text-gray-400 text-center mt-8 max-w-xs leading-relaxed font-body">
              Al crear una cuenta aceptas los{" "}
              <span className="text-primary cursor-pointer hover:underline">Términos de Servicio</span> y las{" "}
              <span className="text-primary cursor-pointer hover:underline">Políticas de Privacidad</span> de ParkingPaTi.
            </p>
          </form>
        </div>

        {/* ========================================================= */}
        {/* 3. SLIDING OVERLAY PANEL (Panel Deslizable con Portada)   */}
        {/* ========================================================= */}
        <div 
          className={`
            absolute top-0 left-1/2 
            w-1/2 h-full 
            bg-primary 
            transition-all duration-500 ease-in-out 
            z-20 overflow-hidden 
            flex flex-col items-center justify-end 
            pb-48 px-16 
            text-center text-white 
            ${isSignUp ? '-translate-x-full rounded-l-[32px] rounded-r-0' : 'translate-x-0 rounded-r-[32px] rounded-l-0'}
          `}
          style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
        >
          {/* Imagen de Portada de Fondo */}
          <img 
            src={portadaLogin} 
            alt="Portada Login" 
            className="absolute inset-0 w-full h-full object-cover z-0 select-none pointer-events-none"
          />

          {/* Capa de Degradado sobre la Imagen */}
          <div className="absolute inset-0 bg-gradient-to-b from-primary/30 to-tertiary/60 z-10" />
          
          {/* Contenido Dinámico según Estado de Registro/Login */}
          <div 
            className="relative z-20 flex flex-col items-center gap-4 transform-none select-text"
            style={{ textRendering: 'geometricPrecision', WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' }}
          >
            {!isSignUp ? (
              <>
                <h2 className="text-5xl font-bold font-headline leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]">
                  ¡Hola, Bienvenido!
                </h2>
                <button 
                  onClick={() => setIsSignUp(true)}
                  className="mt-2 px-14 py-3.5 bg-transparent border-2 border-white text-white rounded-2xl text-base font-bold font-label outline-none focus:outline-none hover:bg-white hover:text-primary hover:scale-105 shadow-lg transition-all duration-200"
                >
                  REGISTRARSE
                </button>
              </>
            ) : (
              <>
                <h2 className="text-5xl font-bold font-headline leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]">
                  ¡Te extrañamos!
                </h2>
                <button 
                  onClick={() => setIsSignUp(false)}
                  className="mt-2 px-14 py-3.5 bg-transparent border-2 border-white text-white rounded-2xl text-base font-bold font-label outline-none focus:outline-none hover:bg-white hover:text-primary hover:scale-105 shadow-lg transition-all duration-200"
                >
                  INGRESAR
                </button>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};