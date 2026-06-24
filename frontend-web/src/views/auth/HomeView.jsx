import React, { useState } from 'react';
import { Phone, Mail, Car, MapPin, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import home01 from '../../assets/home01.png';
import logoSimple from '../../assets/logoSimple.png';
import quienesSomosImg from '../../assets/home01.png';

export const HomeView = () => {
  const navigate = useNavigate();
  const [isLeaving, setIsLeaving] = useState(false);

  const handleComenzar = () => {
    setIsLeaving(true); 
    
    // Bajamos a 400ms para que sea una transición rápida pero fluida
    setTimeout(() => {
      navigate('/login'); 
    }, 400); 
  };

  return (
    <div className="w-full min-h-screen overflow-x-hidden bg-sky-100">
      <div 
        className={`min-h-screen text-slate-700 antialiased select-none font-body flex flex-col relative transition-all duration-[400ms] ease-out ${
          isLeaving ? '-translate-x-1/2 opacity-0' : 'translate-x-0 opacity-100'
        }`}
      >

        {/* ========================================================= */}
        {/* NAVBAR ESTÁTICA                                           */}
        {/* ========================================================= */}
        <div className="sticky top-0 left-0 right-0 z-50 w-full bg-white/95 backdrop-blur-md px-10 py-7 flex items-center shadow-[0_10px_30px_rgba(0,0,0,0.1)] border-b border-slate-200/50">
          <div className="w-full max-w-[1800px] mx-auto flex items-center gap-2 text-sky-600">
            <Car size={32} className="text-sky-600" />
            <span className="text-2xl font-bold tracking-wide font-headline">ParkingPaTi</span>
          </div>
        </div>

        <div className="p-6 flex flex-col gap-6 w-full max-w-[1800px] mx-auto">

          {/* ========================================================= */}
          {/* 1. HERO SECTION                                           */}
          {/* ========================================================= */}
          <header className="relative w-full h-[80vh] rounded-[32px] overflow-hidden flex flex-col justify-center items-center pb-16 text-center shadow-[0_25px_60px_-15px_rgba(0,0,0,0.2)]">
            <img
              src={home01}
              alt="Parking Background"
              className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none select-none"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-sky-950/40 via-sky-900/60 to-slate-950/80 z-10" />

            <div className="relative z-20 max-w-2xl mx-auto flex flex-col items-center text-white pt-24 pb-12">
              <h1 className="text-5xl md:text-7xl font-bold font-headline tracking-tight leading-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.4)]">
                Hecho con confianza
              </h1>
              <p className="text-base md:text-lg text-sky-100 max-w-md font-light leading-relaxed drop-shadow-[0_1px_4px_rgba(0,0,0,0.2)] mt-6">
                Tu espacio seguro y reservado en las mejores ubicaciones de la ciudad. Sin vueltas, sin estrés.
              </p>

              <button 
                onClick={handleComenzar}
                className="mt-40 px-14 py-4 bg-white text-sky-700 border-none outline-none rounded-2xl text-base font-bold font-label shadow-lg hover:bg-sky-50 hover:scale-105 active:scale-95 transition-all duration-200 uppercase tracking-wider"
              >
                Comenzar
              </button>
            </div>
          </header>

          {/* ========================================================= */}
          {/* 2. SECCIÓN: QUIÉNES SOMOS (3 Columnas)                    */}
          {/* ========================================================= */}
          <section className="bg-white rounded-[32px] p-12 md:p-16 grid grid-cols-1 md:grid-cols-12 gap-10 items-center shadow-[0_15px_40px_-15px_rgba(0,0,0,0.05)]">
            <div className="md:col-span-4 flex flex-col gap-6 text-center md:text-left items-center md:items-start">
              <h2 className="text-5xl font-bold font-headline text-[#0284c7] tracking-tight w-full">
                Quiénes somos
              </h2>
              <p className="text-slate-900 text-lg md:text-xl leading-relaxed text-justify w-full">
                En ParkingPaTi transformamos la tediosa búsqueda de estacionamiento en una{" "}
                <span className="bg-sky-100 text-sky-900 px-2 py-0.5 rounded-md font-medium inline-block my-0.5">
                  experiencia fluida
                </span>{" "}
                y digital. Optimizamos espacios privados para brindarte comodidad y una{" "}
                <span className="bg-sky-100 text-sky-900 px-2 py-0.5 rounded-md font-medium inline-block my-0.5">
                  seguridad garantizada
                </span>{" "}
                cerca de tus destinos favoritos.
              </p>
            </div>

            <div className="md:col-span-8 grid grid-cols-3 gap-5 w-full aspect-[32/9]">
              <div className="rounded-[40px] overflow-hidden bg-[#248296] shadow-sm">
                <img src={home01} alt="Servicio 1" className="w-full h-full object-cover pointer-events-none select-none" />
              </div>
              <div className="rounded-[40px] overflow-hidden bg-[#248296] shadow-sm">
                <img src={home01} alt="Servicio 2" className="w-full h-full object-cover pointer-events-none select-none" />
              </div>
              <div className="rounded-[40px] overflow-hidden bg-[#248296] shadow-sm">
                <img src={home01} alt="Servicio 3" className="w-full h-full object-cover pointer-events-none select-none" />
              </div>
            </div>
          </section>

          {/* ========================================================= */}
          {/* 3. PANEL INTERMEDIO: INFORMACIÓN ADICIONAL                */}
          {/* ========================================================= */}
          <section className="w-full bg-slate-50 rounded-[32px] p-8 md:p-10 border border-slate-200/60 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
              <div className="flex flex-col gap-2 p-4 rounded-2xl hover:bg-white transition-all duration-300">
                <span className="text-xs font-bold text-sky-600 uppercase tracking-widest">Cobertura</span>
                <h4 className="text-xl font-bold text-slate-800">Puntos Estratégicos</h4>
                <p className="text-sm text-slate-500 leading-relaxed">Ubicaciones clave en las zonas de mayor afluencia corporativa.</p>
              </div>
              <div className="flex flex-col gap-2 p-4 rounded-2xl hover:bg-white transition-all duration-300 md:border-x md:border-slate-200 px-6">
                <span className="text-xs font-bold text-sky-600 uppercase tracking-widest">Tecnología</span>
                <h4 className="text-xl font-bold text-slate-800">Monitoreo 24/7</h4>
                <p className="text-sm text-slate-500 leading-relaxed">Sistemas automatizados de lectura de patentes.</p>
              </div>
              <div className="flex flex-col gap-2 p-4 rounded-2xl hover:bg-white transition-all duration-300">
                <span className="text-xs font-bold text-sky-600 uppercase tracking-widest">Comunidad</span>
                <h4 className="text-xl font-bold text-slate-800">Soporte Inmediato</h4>
                <p className="text-sm text-slate-500 leading-relaxed">Asistencia al usuario integrada en la app al instante.</p>
              </div>
            </div>
          </section>

          {/* ========================================================= */}
          {/* 4. ACERCA DE NUESTROS SERVICIOS                            */}
          {/* ========================================================= */}
          <section className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-7 bg-white rounded-[32px] p-10 md:p-14 flex flex-col justify-between gap-10 shadow-[0_15px_40px_-15px_rgba(0,0,0,0.05)]">
              <div>
                <span className="text-xs font-black text-sky-600 uppercase tracking-widest bg-sky-50 px-3 py-1.5 rounded-lg">Nuestra Tecnología</span>
                <h3 className="text-4xl font-extrabold font-headline text-slate-900 mt-4 tracking-tight">Acerca de nuestros servicios</h3>
                <p className="text-base text-slate-400 mt-2">La forma más inteligente y segura de gestionar tu estacionamiento.</p>
              </div>

              <div className="grid grid-cols-1 gap-6 w-full">
                <div className="flex flex-col sm:flex-row items-start gap-5 bg-sky-50/60 p-6 md:p-8 rounded-[24px] border border-sky-300">
                  <div className="p-4 bg-sky-600 text-white rounded-2xl shrink-0"><Car size={26} /></div>
                  <div className="flex flex-col gap-2">
                    <h4 className="font-extrabold text-slate-900 text-xl">Búsqueda de Espacios Libres</h4>
                    <p className="text-slate-600 text-base md:text-lg">Visualizar y localizar parqueaderos privados disponibles en tiempo real.</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-start gap-5 bg-sky-50/60 p-6 md:p-8 rounded-[24px] border border-sky-300">
                  <div className="p-4 bg-emerald-600 text-white rounded-2xl shrink-0"><Shield size={26} /></div>
                  <div className="flex flex-col gap-2">
                    <h4 className="font-extrabold text-slate-900 text-xl">Parqueaderos 100% Confiables</h4>
                    <p className="text-slate-600 text-base md:text-lg">Revisión física y legal de su permiso de funcionamiento.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="md:col-span-5 text-white rounded-[32px] p-12 text-center flex flex-col items-center justify-center gap-6 shadow-xl relative overflow-hidden min-h-[450px]">
              <img src={home01} alt="Nuestros Servicios" className="absolute inset-0 w-full h-full object-cover z-0" />
              <div className="absolute inset-0 bg-slate-950/40 z-10" />
              <div className="relative z-20 flex flex-col items-center gap-4">
                <span className="px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-xs font-black">Innovación Urbana</span>
                <h4 className="text-3xl md:text-4xl font-extrabold">Tu escape seguro a la ciudad</h4>
                <div className="w-12 h-1 bg-sky-400 rounded-full my-2" />
                <p className="text-base text-sky-100 font-light max-w-xs">Diseñado exclusivamente para conductores que valoran la integridad de sus vehículos.</p>
              </div>
            </div>
          </section>

          {/* ========================================================= */}
          {/* 5. CORPORATE FOOTER                                       */}
          {/* ========================================================= */}
          <footer className="w-full bg-[#0b1329] text-white rounded-[32px] pt-12 border border-slate-800/60 overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center px-12 pb-12">
              <div className="md:col-span-7 flex flex-col gap-3">
                <span className="text-xs font-bold text-sky-400 uppercase">Grupo corporativo</span>
                <p className="text-sm text-slate-300 leading-relaxed">Armas Ordoñes Miguel, Buri Camacho María, Chamba Santín Richard, Flores Gallardo Emilio, Rosillo Gaona Odalis, Orozco Guamán Marco.</p>
              </div>
              <div className="md:col-span-5 flex flex-col gap-3 text-sm text-slate-300 md:pl-4">
                <span className="text-xs font-bold text-sky-400 uppercase">Contacto directo</span>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex items-center gap-3 bg-slate-800/30 px-4 py-2.5 rounded-xl border border-slate-700/40">+593 95 994 8917</div>
                  <div className="flex items-center gap-3 bg-slate-800/30 px-4 py-2.5 rounded-xl border border-slate-700/40">parkingPaTi@gmail.com</div>
                </div>
              </div>
            </div>
            <div className="w-full bg-[#050b18] py-5 text-center text-base font-bold text-white border-t border-slate-800/40">
              © ParkingPaTi.com - 2026
            </div>
          </footer>

        </div>
      </div>
    </div>
  );
};