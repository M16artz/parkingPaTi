import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, CarFront, Clock3, MapPinned } from 'lucide-react';
import home01 from '../../assets/home01.png';
import quienesSomos1 from '../../assets/quienesSomos1.png';
import quienesSomos2 from '../../assets/quienesSomos2.png';
import quienesSomos3 from '../../assets/quienesSomos3.png';
import nuestrosServiciosImg from '../../assets/nuestrosServicios.png';
import { PublicFooter } from '../components/public/PublicFooter';
import { PublicNavbar } from '../components/public/PublicNavbar';

const BENEFITS = [
  [CarFront, 'Disponibilidad', 'Consulta de espacios', 'Visualiza la disponibilidad reportada por los parqueaderos registrados.'],
  [MapPinned, 'Ubicación', 'Ubicaciones en el mapa', 'Encuentra parqueaderos cercanos y consulta su información antes de dirigirte al lugar.'],
  [Clock3, 'Información', 'Tarifas y horarios', 'Revisa precios y horarios de atención desde una misma vista.'],
];

export const HomeView = () => {
  const navigate = useNavigate();
  const timerRef = useRef(null);
  const [isLeaving, setIsLeaving] = useState(false);
  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const goToAuth = (register = false) => {
    if (isLeaving) return;
    setIsLeaving(true);
    timerRef.current = setTimeout(() => navigate(register ? '/register' : '/login'), 240);
  };

  return <div className="min-h-screen overflow-x-hidden bg-sky-100 font-body text-slate-800">
    <div className={`transition duration-300 motion-reduce:transition-none ${isLeaving ? 'translate-y-2 scale-[0.99] opacity-0' : 'opacity-100'}`}>
      <PublicNavbar onParkings={() => navigate('/parqueaderos')} onLogin={() => goToAuth(false)} onRegister={() => goToAuth(true)} />
      <main className="mx-auto flex max-w-[1800px] flex-col gap-5 px-3 py-4 sm:px-5 lg:px-7">
        <section id="inicio" className="relative flex min-h-[560px] scroll-mt-24 items-center justify-center overflow-hidden rounded-[2rem] px-5 py-20 text-center shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] sm:min-h-[650px]">
          <img src={home01} alt="Acceso a un parqueadero urbano" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-sky-950/45 via-sky-950/65 to-slate-950/90" />
          <div className="relative z-10 flex max-w-3xl flex-col items-center gap-6 text-white">
            <span className="rounded-full border border-white/30 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] backdrop-blur">Parqueaderos de Loja</span>
            <h1 className="font-headline text-4xl font-bold leading-tight sm:text-5xl lg:text-7xl">Encuentra parqueadero sin dar más vueltas</h1>
            <p className="max-w-2xl text-base leading-7 text-sky-100 sm:text-lg">Consulta espacios disponibles, tarifas, horarios y ubicaciones de parqueaderos desde una sola plataforma.</p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button type="button" disabled={isLeaving} onClick={() => goToAuth(false)} className="min-h-12 rounded-2xl bg-white px-8 font-bold text-sky-800 shadow-lg transition hover:-translate-y-0.5 hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:opacity-60 motion-reduce:transform-none">{isLeaving ? 'Abriendo…' : 'Comenzar'}</button>
              <a href="#servicios" className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-white/50 bg-white/10 px-8 font-bold text-white backdrop-blur hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">Conocer más</a>
            </div>
          </div>
        </section>

        <section id="quienes-somos" className="scroll-mt-24 rounded-[2rem] bg-white p-6 shadow-sm sm:p-10 lg:grid lg:grid-cols-12 lg:items-center lg:gap-12 lg:p-14">
          <div className="lg:col-span-5"><p className="text-xs font-black uppercase tracking-[0.2em] text-sky-700">Quiénes somos</p><h2 className="mt-3 font-headline text-3xl font-bold text-slate-950 sm:text-4xl">Información útil para moverte y gestionar mejor</h2><p className="mt-5 text-base leading-7 text-slate-600">ParkingPaTi facilita la búsqueda de parqueaderos registrados, muestra disponibilidad, tarifas y horarios, y ofrece a los propietarios un panel para administrar sus espacios. La meta es reducir recorridos innecesarios mediante una consulta sencilla y centralizada.</p></div>
          <div className="mt-8 grid gap-4 sm:grid-cols-3 lg:col-span-7 lg:mt-0">
            {[[quienesSomos1, 'Consulta visual de parqueaderos'], [quienesSomos2, 'Información del parqueadero registrado'], [quienesSomos3, 'Gestión digital de espacios']].map(([src, alt]) => <figure key={src} className="overflow-hidden rounded-2xl border border-sky-200 bg-sky-50 shadow-sm"><img src={src} alt={alt} loading="lazy" className="aspect-[4/3] h-full w-full object-cover sm:aspect-square" /></figure>)}
          </div>
        </section>

        <section aria-labelledby="benefits-title" className="rounded-[2rem] border border-slate-200 bg-slate-50 p-6 sm:p-9"><h2 id="benefits-title" className="sr-only">Beneficios</h2><div className="grid gap-5 md:grid-cols-3">{BENEFITS.map(([Icon, category, title, description]) => <article key={title} className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md motion-reduce:transform-none"><span className="grid h-12 w-12 place-items-center rounded-xl bg-sky-100 text-sky-800"><Icon aria-hidden="true" /></span><p className="mt-5 text-xs font-black uppercase tracking-widest text-sky-700">{category}</p><h3 className="mt-2 text-xl font-bold text-slate-950">{title}</h3><p className="mt-3 flex-1 text-sm leading-6 text-slate-600">{description}</p></article>)}</div></section>

        <section id="servicios" className="grid scroll-mt-24 gap-5 lg:grid-cols-12">
          <div className="rounded-[2rem] bg-white p-6 shadow-sm sm:p-10 lg:col-span-7"><p className="text-xs font-black uppercase tracking-widest text-sky-700">Servicios</p><h2 className="mt-3 font-headline text-3xl font-bold text-slate-950 sm:text-4xl">Una plataforma, dos experiencias</h2><div className="mt-8 grid gap-5"><article className="flex gap-4 rounded-2xl border border-sky-200 bg-sky-50 p-5"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-sky-700 text-white"><MapPinned aria-hidden="true" /></span><div><h3 className="text-xl font-bold">Encuentra parqueaderos</h3><p className="mt-2 leading-6 text-slate-600">Consulta ubicaciones, disponibilidad, tarifas y horarios de atención.</p><button type="button" onClick={() => navigate('/parqueaderos')} className="mt-3 rounded font-bold text-sky-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600">Explorar parqueaderos</button></div></article><article className="flex gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-5"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-emerald-700 text-white"><Building2 aria-hidden="true" /></span><div><h3 className="text-xl font-bold">Administra tu parqueadero</h3><p className="mt-2 leading-6 text-slate-600">Actualiza la información general, disponibilidad, horarios, tarifas y espacios desde un panel de gestión.</p><button type="button" onClick={() => goToAuth(true)} className="mt-3 rounded font-bold text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600">Crear cuenta</button></div></article></div></div>
          <article className="relative min-h-[420px] overflow-hidden rounded-[2rem] shadow-lg lg:col-span-5"><img src={nuestrosServiciosImg} alt="Movilidad urbana y búsqueda de parqueaderos" loading="lazy" className="absolute inset-0 h-full w-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/65 to-sky-900/20" /><div className="absolute inset-x-0 bottom-0 p-7 text-white sm:p-10"><h3 className="font-headline text-3xl font-bold">Muévete por la ciudad con mejor información</h3><p className="mt-3 leading-7 text-slate-200">Consulta las opciones disponibles antes de iniciar tu recorrido.</p></div></article>
        </section>

        <section className="rounded-[2rem] bg-gradient-to-r from-sky-800 to-blue-800 px-6 py-12 text-center text-white shadow-lg sm:px-10"><h2 className="font-headline text-3xl font-bold">Empieza a utilizar ParkingPaTi</h2><p className="mx-auto mt-4 max-w-2xl text-sky-100">Accede a la plataforma para consultar parqueaderos o administrar uno registrado.</p><div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row"><button type="button" onClick={() => goToAuth(false)} className="min-h-12 rounded-xl bg-white px-7 font-bold text-sky-800">Iniciar sesión</button><button type="button" onClick={() => goToAuth(true)} className="min-h-12 rounded-xl border border-white/60 px-7 font-bold text-white">Crear cuenta</button></div></section>
      </main>
      <PublicFooter onLogin={() => goToAuth(false)} />
    </div>
  </div>;
};
