import React from 'react';
import { Save } from 'lucide-react';

export const OwnerConfigEspacios = () => {
  return (
    <div className="max-w-4xl bg-white p-8 md:p-10 rounded-[32px] shadow-sm text-left space-y-8">
      
      <div className="flex items-center justify-between border-b border-slate-100 pb-5">
        <div>
          <h3 className="text-base font-bold text-slate-900">Plazas Availability Settings</h3>
          <p className="text-xs text-slate-400 mt-0.5">Configure individual vehicle slot threshold counts.</p>
        </div>
        <div className="bg-slate-100 text-slate-700 px-4 py-2 rounded-2xl font-bold text-xs">
          Total Slots Capacity: 120
        </div>
      </div>

      <div className="space-y-4">
        {[
          { title: 'Regular Car Spaces', desc: 'Standard parking sizes and SUVs.', def: '80', color: 'border-l-blue-500' },
          { title: 'Motorcycle Dedicated Slots', desc: 'Optimized narrow two-wheeler rows.', def: '30', color: 'border-l-orange-400' },
          { title: 'Preferential Access Spaces', desc: 'Wider areas near main entry gates.', def: '10', color: 'border-l-purple-500' }
        ].map((item, idx) => (
          <div key={idx} className={`flex items-center justify-between p-5 bg-slate-50/60 rounded-[22px] border border-slate-100 border-l-4 ${item.color} shadow-sm`}>
            <div>
              <h4 className="font-bold text-slate-800 text-sm">{item.title}</h4>
              <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
            </div>
            <div className="flex items-center gap-2">
              <input 
                type="number" 
                defaultValue={item.def} 
                className="w-20 text-center py-2.5 rounded-xl border-none font-bold text-slate-800 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm" 
              />
              <span className="text-xs font-bold text-slate-400 bg-white border border-slate-100 px-3 py-2.5 rounded-xl shadow-sm">units</span>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-4 flex justify-end">
        <button className="bg-[#3b5998] hover:bg-blue-700 text-white px-8 py-4 rounded-[20px] font-bold flex items-center gap-2 shadow-md text-sm transition-all active:scale-95">
          <Save size={16} /> Save Slot Distribution
        </button>
      </div>

    </div>
  );
};