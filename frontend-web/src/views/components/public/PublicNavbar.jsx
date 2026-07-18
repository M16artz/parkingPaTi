import React, { useEffect, useState } from 'react';
import { Car, Menu, X } from 'lucide-react';

const LINKS = [
  ['inicio', 'Inicio'], ['quienes-somos', 'Quiénes somos'],
  ['servicios', 'Servicios'], ['contacto', 'Contacto'],
];

export const PublicNavbar = ({ onParkings, onLogin, onRegister }) => {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const closeOnEscape = (event) => { if (event.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, []);
  const close = () => setOpen(false);

  return <header className="sticky top-0 z-[1000] border-b border-slate-200/70 bg-white/90 backdrop-blur-xl">
    <div className="mx-auto flex min-h-16 max-w-[1800px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-10">
      <a href="#inicio" onClick={close} className="flex items-center gap-2 rounded-lg text-sky-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-sky-700 text-white"><Car aria-hidden="true" size={24} /></span>
        <span className="font-headline text-xl font-bold">ParkingPaTi</span>
      </a>
      <nav className="hidden items-center gap-1 lg:flex" aria-label="Navegación principal">
        {LINKS.map(([id, label]) => <a key={id} href={`#${id}`} className="rounded-lg px-3 py-2 text-sm font-bold text-slate-700 hover:bg-sky-50 hover:text-sky-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600">{label}</a>)}
        <button type="button" onClick={onParkings} className="rounded-lg px-3 py-2 text-sm font-bold text-slate-700 hover:bg-sky-50 hover:text-sky-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600">Parqueaderos</button>
        <button type="button" onClick={onRegister} className="ml-2 min-h-11 rounded-xl border border-sky-700 px-4 text-sm font-bold text-sky-800 hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600">Registrarse</button>
        <button type="button" onClick={onLogin} className="min-h-11 rounded-xl bg-sky-700 px-5 text-sm font-bold text-white shadow-sm hover:bg-sky-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2">Iniciar sesión</button>
      </nav>
      <button type="button" className="grid min-h-11 min-w-11 place-items-center rounded-xl text-slate-800 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 lg:hidden" aria-label={open ? 'Cerrar menú' : 'Abrir menú'} aria-expanded={open} aria-controls="public-mobile-menu" onClick={() => setOpen((current) => !current)}>{open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}</button>
    </div>
    <nav id="public-mobile-menu" className={`${open ? 'grid' : 'hidden'} gap-1 border-t border-slate-200 bg-white px-4 py-4 shadow-lg lg:hidden`} aria-label="Navegación móvil">
      {LINKS.map(([id, label]) => <a key={id} href={`#${id}`} onClick={close} className="rounded-xl px-4 py-3 font-bold text-slate-700 hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600">{label}</a>)}
      <button type="button" onClick={() => { close(); onParkings(); }} className="rounded-xl px-4 py-3 text-left font-bold text-slate-700 hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600">Parqueaderos</button>
      <button type="button" onClick={() => { close(); onLogin(); }} className="mt-2 min-h-11 rounded-xl bg-sky-700 px-4 font-bold text-white">Iniciar sesión</button>
      <button type="button" onClick={() => { close(); onRegister(); }} className="min-h-11 rounded-xl border border-sky-700 px-4 font-bold text-sky-800">Registrarse</button>
    </nav>
  </header>;
};
