import React from 'react';
import { Car, LogIn, Mail } from 'lucide-react';

export const PublicFooter = ({ onLogin }) => {
  const currentYear = new Date().getFullYear();
  return <footer id="contacto" className="rounded-t-[2rem] bg-slate-950 px-6 py-12 text-slate-300 sm:px-10">
    <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-3">
      <div><div className="flex items-center gap-2 text-white"><Car aria-hidden="true" /><span className="font-headline text-xl font-bold">ParkingPaTi</span></div><p className="mt-4 max-w-sm text-sm leading-6">Información centralizada para consultar y administrar parqueaderos registrados en Loja.</p></div>
      <div><h2 className="font-bold text-white">Contacto</h2><a className="mt-4 inline-flex items-center gap-2 rounded text-sm hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400" href="mailto:parkingPaTi@gmail.com"><Mail aria-hidden="true" size={17} /> parkingPaTi@gmail.com</a></div>
      <div><h2 className="font-bold text-white">Acceso</h2><button type="button" onClick={onLogin} className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-xl px-1 font-bold text-sky-300 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"><LogIn aria-hidden="true" size={18} /> Iniciar sesión</button></div>
    </div>
    <div className="mx-auto mt-10 max-w-7xl border-t border-white/10 pt-6 text-sm">© {currentYear} ParkingPaTi</div>
  </footer>;
};
