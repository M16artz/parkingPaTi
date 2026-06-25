import React from 'react';
import { MoreHorizontal } from 'lucide-react';

export const OwnerInfoGeneral = () => {
  // Datos simulados para recrear las barras del gráfico de rendimiento
  const performanceData = [
    { label: 'Lun', val: 85.3, h: 'h-[140px]' },
    { label: 'Mar', val: 64.7, h: 'h-[100px]' },
    { label: 'Mié', val: 84.2, h: 'h-[135px]' },
    { label: 'Jue', val: 45.6, h: 'h-[75px]' },
    { label: 'Vie', val: 43.5, h: 'h-[70px]' },
    { label: 'Sáb', val: 74.4, h: 'h-[120px]' },
  ];

  return (
    <div className="grid grid-cols-12 gap-6 text-left items-start">
      
      {/* SECCIÓN IZQUIERDA: BIENVENIDA Y GRÁFICOS */}
      <div className="col-span-8 flex flex-col gap-6">
        
        {/* BANNER DE BIENVENIDA CON PERSONAJE */}
        <div className="bg-white rounded-[32px] p-8 relative overflow-hidden shadow-sm flex items-center justify-between min-h-[180px]">
          <div className="space-y-2 max-w-md z-10">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Hello Grace!</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              You have 3 new tasks. It is a lot of work for today! So let's start!
            </p>
            <a href="#tasks" className="inline-block text-xs font-bold text-blue-600 underline pt-1">review it</a>
          </div>
          {/* Ilustración o Decorativo Flotante */}
          <div className="w-32 h-32 bg-sky-100 rounded-full flex items-center justify-center text-4xl mr-4 relative animate-pulse">
            🚗
          </div>
        </div>

        
      </div>

      
    </div>
  );
};