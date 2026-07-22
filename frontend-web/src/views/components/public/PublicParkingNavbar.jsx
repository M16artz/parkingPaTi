import React, { useEffect, useState } from 'react';
import { Car, Menu, X } from 'lucide-react';

export const PublicParkingNavbar = ({ onHome, onLogin, onRegister }) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  const run = (callback) => {
    setOpen(false);
    callback();
  };

  return <header className="sticky top-0 z-[1100] border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur-xl">
    <div className="mx-auto flex min-h-16 max-w-[1800px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
      <button type="button" onClick={onHome} className="flex items-center gap-2 rounded-xl text-sky-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600">
        <span className="grid h-10 w-10 place-items-center"><Car aria-hidden="true" size={30} /></span>
        <span className="font-headline text-xl font-bold">ParkingPaTi</span>
      </button>
      <nav aria-label="Navegación pública" className="hidden items-center gap-1 md:flex">
        <button type="button" onClick={onHome} className="min-h-11 rounded-xl px-4 text-sm font-bold text-slate-700 hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600">Inicio</button>
        <span aria-current="page" className="inline-flex min-h-11 items-center rounded-xl bg-sky-50 px-4 text-sm font-bold text-sky-800">Parqueaderos</span>
        <button type="button" onClick={onRegister} className="ml-2 min-h-11 rounded-xl border border-sky-700 px-4 text-sm font-bold text-sky-800 hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600">Crear cuenta</button>
        <button type="button" onClick={onLogin} className="min-h-11 rounded-xl bg-sky-700 px-5 text-sm font-bold text-white shadow-sm hover:bg-sky-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2">Iniciar sesión</button>
      </nav>
      <div className="flex items-center gap-2 md:hidden">
        <button type="button" onClick={onLogin} className="min-h-10 rounded-xl bg-sky-700 px-3 text-sm font-bold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600">Ingresar</button>
        <button type="button" aria-label={open ? 'Cerrar menú' : 'Abrir menú'} aria-expanded={open} aria-controls="parking-mobile-menu" onClick={() => setOpen((value) => !value)} className="grid min-h-11 min-w-11 place-items-center rounded-xl text-slate-800 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600">{open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}</button>
      </div>
    </div>
    <nav id="parking-mobile-menu" aria-label="Navegación móvil" className={`${open ? 'grid' : 'hidden'} gap-2 border-t border-slate-200 bg-white px-4 py-4 shadow-lg md:hidden`}>
      <button type="button" onClick={() => run(onHome)} className="min-h-11 rounded-xl px-4 text-left font-bold text-slate-700 hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600">Inicio</button>
      <span aria-current="page" className="inline-flex min-h-11 items-center rounded-xl bg-sky-50 px-4 font-bold text-sky-800">Parqueaderos</span>
      <button type="button" onClick={() => run(onRegister)} className="min-h-11 rounded-xl border border-sky-700 px-4 font-bold text-sky-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600">Crear cuenta</button>
    </nav>
  </header>;
};
