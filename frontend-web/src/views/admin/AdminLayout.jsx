import React from 'react';
import { Outlet } from 'react-router-dom';
import { AdminSidebar } from '../../components/admin/AdminSidebar';

export const AdminLayout = () => {
  return (
    <div className="w-screen h-screen bg-[#e8f1fa] p-4 sm:p-6 flex items-center justify-center overflow-hidden font-sans antialiased">
      {/* MARCO CONTENEDOR TIPO TARJETA */}
      <div className="w-full h-full max-w-[1600px] bg-white rounded-[28px] shadow-lg flex overflow-hidden border border-slate-200/60">
        
        {/* BARRA LATERAL AZUL */}
        <AdminSidebar />

        {/* CONTENIDO DERECHO CON SCROLL INDEPENDIENTE */}
        <div className="flex-1 flex flex-col h-full overflow-y-auto bg-white p-6 sm:p-8">
          <Outlet />
        </div>

      </div>
    </div>
  );
};

export default AdminLayout;