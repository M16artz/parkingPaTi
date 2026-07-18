import React from 'react';
import { FileCheck2, LogOut, Users } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';
import { useLogoutController } from '../../controllers/useLogoutController';

const enlaceClase = ({ isActive }) => `flex min-h-11 items-center gap-2 border-b-2 px-3 text-sm font-semibold ${
  isActive ? 'border-sky-700 text-sky-800' : 'border-transparent text-slate-600 hover:text-slate-900'
}`;

export const AdminLayout = () => {
  const logout = useLogoutController();
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3">
          <div>
            <p className="font-headline text-lg font-bold text-sky-800">ParkingPaTi</p>
            <p className="text-xs text-slate-500">Administración</p>
          </div>
          <button
            className="minimum-touch-target grid place-items-center text-slate-600 hover:text-slate-950"
            type="button"
            title="Cerrar sesión"
            aria-label="Cerrar sesión"
            onClick={logout}
          >
            <LogOut size={20} />
          </button>
        </div>
        <nav className="mx-auto flex max-w-7xl gap-2 px-5" aria-label="Administración">
          <NavLink className={enlaceClase} to="/admin/applications"><FileCheck2 size={18} /> Solicitudes</NavLink>
          <NavLink className={enlaceClase} to="/admin/accounts"><Users size={18} /> Cuentas</NavLink>
        </nav>
      </header>
      <Outlet />
    </div>
  );
};
