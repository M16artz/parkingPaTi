import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, ChevronDown, CircleHelp, Shield, Phone, Mail } from 'lucide-react';

// Assets e Imágenes
import home01 from '../../assets/home01.png';
import quienesSomos1 from '../../assets/quienesSomos1.png';
import quienesSomos2 from '../../assets/quienesSomos2.png';
import quienesSomos3 from '../../assets/quienesSomos3.png';
import nuestrosServiciosImg from '../../assets/nuestrosServicios.png';

// Componente Navbar Público
import { PublicNavbar } from '../components/public/PublicNavbar';

const FAQS = [
  {
    question: '¿Cómo encuentro un parqueadero disponible?',
    answer: 'Selecciona “Parqueaderos” en el menú para consultar el mapa y la lista de espacios disponibles cerca de tu destino.',
  },
  {
    question: '¿Necesito crear una cuenta para consultar parqueaderos?',
    answer: 'No. Puedes explorar los parqueaderos, revisar su ubicación y consultar su disponibilidad sin iniciar sesión.',
  },
  {
    question: '¿La disponibilidad se actualiza en tiempo real?',
    answer: 'Sí. La plataforma muestra la información más reciente reportada por cada parqueadero para ayudarte a elegir antes de llegar.',
  },
  {
    question: '¿Cómo verifican que los parqueaderos sean confiables?',
    answer: 'Cada establecimiento pasa por un proceso de revisión de su información y de su permiso de funcionamiento antes de publicarse.',
  },
  {
    question: '¿Puedo registrar mi parqueadero en ParkingPaTi?',
    answer: 'Sí. Crea una cuenta desde “Registrarse”, completa los datos de tu establecimiento y envía la documentación solicitada para su revisión.',
  },
  {
    question: '¿Qué tipos de vehículos puedo estacionar?',
    answer: 'Los tipos de espacios dependen de cada establecimiento. Consulta el detalle del parqueadero para conocer las opciones disponibles.',
  },
];

export const HomeView = () => {
  const navigate = useNavigate();
  const timerRef = useRef(null);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const goToAuth = (register = false) => {
    if (isLeaving) return;
    setIsLeaving(true);
    timerRef.current = setTimeout(() => navigate(register ? '/register' : '/login'), 400);
  };

  return (
    <div className="w-full min-h-screen bg-sky-100 font-body text-slate-800 relative">
      {/* ========================================================= */}
      {/* ENCABEZADO FIJO A LA PANTALLA (SIEMPRE VISIBLE AL SCROLL) */}
      {/* ========================================================= */}
      <header className="fixed top-0 left-0 right-0 z-50 w-full bg-white/95 backdrop-blur-md px-6 md:px-12 py-3 md:py-4 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
        <div className="max-w-[1800px] mx-auto w-full">
          <PublicNavbar
            onParkings={() => navigate('/parqueaderos')}
            onLogin={() => goToAuth(false)}
            onRegister={() => goToAuth(true)}
          />
        </div>
      </header>

      {/* CONTENEDOR DE PÁGINA CON ANIMACIÓN DE SALIDA */}
      <div
        className={`min-h-screen flex flex-col relative transition-all duration-300 ${isLeaving ? '-translate-x-1/2 opacity-0' : 'opacity-100'
          }`}
      >
        {/* CONTENEDOR PRINCIPAL */}
        <main className="mx-auto flex max-w-[1800px] w-full flex-col gap-6 p-6 pt-20 sm:pt-24 md:pt-28">

          {/* ========================================================= */}
          {/* 1. HERO SECTION                                           */}
          {/* ========================================================= */}
          <header
            id="inicio"
            className="
              relative 
              w-full h-[80vh] min-h-[560px] 
              rounded-[32px] overflow-hidden 
              flex flex-col justify-center items-center 
              pb-16 text-center 
              shadow-[0_25px_60px_-15px_rgba(0,0,0,0.2)]
            "
          >
            {/* Imagen de fondo */}
            <img
              src={home01}
              alt="Acceso a un parqueadero urbano"
              className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none select-none"
            />

            {/* Capa de degradado oscuro */}
            <div className="absolute inset-0 bg-gradient-to-b from-sky-950/40 via-sky-900/60 to-slate-950/80 z-10" />

            <div className="relative z-20 max-w-2xl mx-auto flex flex-col items-center text-white pt-16 pb-12 px-4">
              {/* LABEL EN EL HERO */}
              <span className="px-6 py-2.5 bg-white/20 backdrop-blur-md border-2 border-white rounded-full text-xs sm:text-sm font-black uppercase tracking-[0.2em] text-white shadow-md">
                Parqueaderos de Loja
              </span>

              {/* TÍTULO */}
              <h1 className="mt-6 text-5xl md:text-7xl font-bold font-headline tracking-tight leading-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.4)]">
                Hecho con confianza
              </h1>

              {/* SUBTÍTULO */}
              <p className="mt-6 text-base md:text-lg text-sky-100 max-w-md font-light leading-relaxed drop-shadow-[0_1px_4px_rgba(0,0,0,0.2)]">
                Tu espacio seguro y reservado en las mejores ubicaciones de la ciudad. Sin vueltas, sin estrés.
              </p>

              {/* BOTÓN COMENZAR */}
              <button
                type="button"
                disabled={isLeaving}
                onClick={() => goToAuth(false)}
                className="
                  mt-12 
                  px-14 py-4 
                  bg-white text-sky-700 
                  border-none outline-none 
                  rounded-2xl 
                  text-base font-bold font-label 
                  shadow-lg 
                  hover:bg-sky-50 hover:scale-105 
                  active:scale-95 
                  transition-all duration-200 
                  uppercase tracking-wider
                  disabled:opacity-60
                "
              >
                {isLeaving ? 'Abriendo…' : 'Comenzar'}
              </button>
            </div>
          </header>

          {/* ========================================================= */}
          {/* 2. SECCIÓN: QUIÉNES SOMOS                                 */}
          {/* ========================================================= */}
          <section
            id="quienes-somos"
            className="
              bg-white 
              rounded-[32px] 
              p-12 md:p-16 
              grid grid-cols-1 md:grid-cols-12 gap-10 
              items-center 
              shadow-[0_15px_40px_-15px_rgba(0,0,0,0.05)]
            "
          >
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

            <div className="md:col-span-8 grid grid-cols-3 gap-5 w-full">
              {[quienesSomos1, quienesSomos2, quienesSomos3].map((imgSrc, idx) => (
                <div
                  key={idx}
                  className="
                    rounded-[24px] overflow-hidden 
                    border-4 border-sky-400 
                    bg-white shadow-md 
                    aspect-square 
                    flex items-center justify-center 
                    p-2
                  "
                >
                  <img
                    src={imgSrc}
                    alt={`Quienes Somos ${idx + 1}`}
                    className="max-w-full max-h-full object-contain pointer-events-none select-none"
                  />
                </div>
              ))}
            </div>
          </section>

          {/* ========================================================= */}
          {/* 3. PANEL INTERMEDIO: INFORMACIÓN ADICIONAL                */}
          {/* ========================================================= */}
          <section
            className="
              w-full bg-slate-50 
              rounded-[32px] 
              p-8 md:p-10 
              border border-slate-200/60 
              shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]
            "
          >
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
          <section id="servicios" className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-7 bg-white rounded-[32px] p-10 md:p-14 flex flex-col justify-between gap-10 shadow-[0_15px_40px_-15px_rgba(0,0,0,0.05)]">
              <div>
                <span className="text-xs font-black text-sky-600 uppercase tracking-widest bg-sky-50 px-3 py-1.5 rounded-lg">
                  Nuestra Tecnología
                </span>
                <h3 className="text-4xl font-extrabold font-headline text-slate-900 mt-4 tracking-tight">
                  Acerca de nuestros servicios
                </h3>
                <p className="text-base text-slate-400 mt-2">
                  La forma más inteligente y segura de gestionar tu estacionamiento.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6 w-full">
                <div className="flex flex-col sm:flex-row items-start gap-5 bg-sky-50/60 p-6 md:p-8 rounded-[24px] border border-sky-300">
                  <div className="p-4 bg-sky-600 text-white rounded-2xl shrink-0">
                    <Car size={26} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <h4 className="font-extrabold text-slate-900 text-xl">Búsqueda de Espacios Libres</h4>
                    <p className="text-slate-600 text-base md:text-lg">Visualizar y localizar parqueaderos privados disponibles en tiempo real.</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start gap-5 bg-sky-50/60 p-6 md:p-8 rounded-[24px] border border-sky-300">
                  <div className="p-4 bg-emerald-600 text-white rounded-2xl shrink-0">
                    <Shield size={26} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <h4 className="font-extrabold text-slate-900 text-xl">Parqueaderos 100% Confiables</h4>
                    <p className="text-slate-600 text-base md:text-lg">Revisión física y legal de su permiso de funcionamiento.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="md:col-span-5 text-white rounded-[32px] p-12 text-center flex flex-col items-center justify-center gap-6 shadow-xl relative overflow-hidden min-h-[450px]">
              <img
                src={nuestrosServiciosImg}
                alt="Nuestros Servicios"
                className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none select-none"
              />
              <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-[1px] z-10" />

              <div className="relative z-20 flex flex-col items-center gap-4">
                <span className="px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-xs font-black">
                  Innovación Urbana
                </span>
                <h4 className="text-3xl md:text-4xl font-extrabold">Tu escape seguro a la ciudad</h4>
                <div className="w-12 h-1 bg-sky-400 rounded-full my-2" />
                <p className="text-base text-sky-100 font-light max-w-xs">
                  Diseñado exclusivamente para conductores que valoran la integridad de sus vehículos.
                </p>
              </div>
            </div>
          </section>

          {/* ========================================================= */}
          {/* 5. PREGUNTAS FRECUENTES                                   */}
          {/* ========================================================= */}
          <section
            id="faq"
            aria-labelledby="faq-title"
            className="scroll-mt-28 rounded-[32px] bg-white p-8 shadow-[0_15px_40px_-15px_rgba(0,0,0,0.05)] md:p-14"
          >
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14">
              <div className="lg:col-span-4">
                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
                  <CircleHelp aria-hidden="true" size={26} />
                </div>
                <span className="block text-xs font-black uppercase tracking-widest text-sky-600">
                  Resolvemos tus dudas
                </span>
                <h2 id="faq-title" className="mt-3 text-4xl font-extrabold font-headline tracking-tight text-slate-900 md:text-5xl">
                  Preguntas frecuentes
                </h2>
                <p className="mt-4 max-w-md text-base leading-relaxed text-slate-500">
                  Todo lo que necesitas saber para encontrar o registrar un parqueadero con ParkingPaTi.
                </p>
              </div>

              <div className="grid gap-3 lg:col-span-8">
                {FAQS.map(({ question, answer }, index) => (
                  <details
                    key={question}
                    className="group rounded-2xl border border-slate-200 bg-slate-50/70 transition-colors open:border-sky-300 open:bg-sky-50/60"
                    open={index === 0}
                  >
                    <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 rounded-2xl px-5 py-4 font-bold text-slate-800 outline-none transition-colors hover:text-sky-800 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sky-600 [&::-webkit-details-marker]:hidden md:px-6">
                      <span>{question}</span>
                      <ChevronDown
                        aria-hidden="true"
                        size={20}
                        className="shrink-0 text-sky-600 transition-transform duration-200 group-open:rotate-180"
                      />
                    </summary>
                    <p className="px-5 pb-5 pr-12 leading-relaxed text-slate-600 md:px-6 md:pb-6 md:pr-14">
                      {answer}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          </section>

          {/* ========================================================= */}
          {/* 6. FOOTER CORPORATIVO                                     */}
          {/* ========================================================= */}
          <footer
            className="
              w-full bg-[#0b1329] text-white 
              rounded-[32px] pt-12 
              border border-slate-800/60 
              overflow-hidden mt-2
            "
          >
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center px-8 md:px-12 pb-12">
              <div className="md:col-span-7 flex flex-col gap-3">
                <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">Grupo corporativo</span>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Armas Ordoñes Miguel, Buri Camacho María, Chamba Santín Richard, Flores Gallardo Emilio, Rosillo Gaona Odalis.
                </p>
              </div>
              <div className="md:col-span-5 flex flex-col gap-3 text-sm text-slate-300 md:pl-4">
                <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">Contacto directo</span>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex items-center gap-2.5 bg-slate-800/40 px-4 py-2.5 rounded-xl border border-slate-700/50">
                    <Phone size={16} className="text-sky-400 shrink-0" />
                    <span>+593 95 994 8917</span>
                  </div>
                  <div className="flex items-center gap-2.5 bg-slate-800/40 px-4 py-2.5 rounded-xl border border-slate-700/50">
                    <Mail size={16} className="text-sky-400 shrink-0" />
                    <span>parkingpatiunl@gmail.com</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full bg-[#050b18] py-5 text-center text-base font-bold text-white border-t border-slate-800/40">
              © ParkingPaTi.com - 2026
            </div>
          </footer>

        </main>
      </div>
    </div>
  );
};
