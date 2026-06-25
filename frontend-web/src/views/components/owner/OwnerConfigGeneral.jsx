import React, { useState } from 'react';
import { Save } from 'lucide-react';

export const OwnerConfigGeneral = () => {
  const [enabledDays, setEnabledDays] = useState({ lun: true, mar: true, mie: true, jue: true, vie: true, sab: false, dom: false });
  const days = [
    { id: 'lun', label: 'Mon' }, { id: 'mar', label: 'Tue' }, { id: 'mie', label: 'Wed' },
    { id: 'jue', label: 'Thu' }, { id: 'vie', label: 'Fri' }, { id: 'sab', label: 'Sat' }, { id: 'dom', label: 'Sun' }
  ];

  return (
    <div className="grid grid-cols-12 gap-6 text-left items-start">
      
      {/* SECCIÓN OPERACIÓN HORARIOS */}
      <div className="col-span-7 bg-white p-8 rounded-[32px] shadow-sm space-y-8">
        <div>
          <h3 className="text-base font-bold text-slate-900">Schedule Configurations</h3>
          <p className="text-xs text-slate-400 mt-0.5">Configure operating time ranges dynamically.</p>
        </div>

        {/* Botones de Días Redondos Impecables */}
        <div className="space-y-3">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Active Days</label>
          <div className="flex gap-2.5">
            {days.map((d) => (
              <button
                key={d.id}
                onClick={() => setEnabledDays({...enabledDays, [d.id]: !enabledDays[d.id]})}
                className={`w-12 h-12 rounded-full font-bold text-xs transition-all duration-200 shadow-sm ${
                  enabledDays[d.id] 
                    ? 'bg-[#3b5998] text-white ring-4 ring-blue-100' 
                    : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Inputs de Horarios Limpios */}
        <div className="grid grid-cols-2 gap-6 pt-2">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500">Opening Time</label>
            <input type="time" defaultValue="07:00" className="w-full px-5 py-3.5 rounded-2xl border-none bg-slate-50 font-semibold text-slate-800 shadow-inner text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500">Closing Time</label>
            <input type="time" defaultValue="22:00" className="w-full px-5 py-3.5 rounded-2xl border-none bg-slate-50 font-semibold text-slate-800 shadow-inner text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10" />
          </div>
        </div>
      </div>

      {/* SECCIÓN COSTOS */}
      <div className="col-span-5 flex flex-col gap-6">
        <div className="bg-white p-8 rounded-[32px] shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">Rates Management</h3>
            <p className="text-xs text-slate-400 mt-0.5">Control pricing modifiers and default values.</p>
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500">Standard Hourly Rate</label>
              <div className="relative rounded-2xl bg-slate-50 px-5 py-3.5 flex items-center justify-between shadow-inner">
                <span className="text-slate-400 font-bold text-sm">$</span>
                <input type="number" step="0.01" defaultValue="1.50" className="w-full bg-transparent text-right font-black text-slate-800 border-none outline-none p-0 text-base focus:ring-0" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500">Fixed Booking Fee</label>
              <div className="relative rounded-2xl bg-slate-50 px-5 py-3.5 flex items-center justify-between shadow-inner">
                <span className="text-slate-400 font-bold text-sm">$</span>
                <input type="number" step="0.01" defaultValue="0.50" className="w-full bg-transparent text-right font-black text-slate-800 border-none outline-none p-0 text-base focus:ring-0" />
              </div>
            </div>
          </div>
        </div>

        <button className="w-full bg-[#3b5998] hover:bg-blue-700 text-white py-4 rounded-[20px] font-bold flex items-center justify-center gap-2.5 shadow-lg shadow-blue-900/10 active:scale-[0.98] transition-all text-sm">
          <Save size={16} /> Save Real-time Changes
        </button>
      </div>

    </div>
  );
};