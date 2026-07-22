import React, { useId, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export const AuthField = ({ label, error, icon: Icon, type = 'text', className = '', ...props }) => {
  const generatedId = useId();
  const [visible, setVisible] = useState(false);
  const id = props.id || `auth-${props.name || generatedId}`;
  const errorId = `${id}-error`;
  const isPassword = type === 'password';
  return <div className={className}>
    <label htmlFor={id} className="mb-1.5 block text-sm font-bold text-slate-800">{label}</label>
    <div className="relative">
      {Icon && <Icon aria-hidden="true" size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sky-700" />}
      <input {...props} id={id} type={isPassword && visible ? 'text' : type} aria-invalid={Boolean(error)} aria-describedby={error ? errorId : undefined} className={`min-h-12 w-full rounded-xl border bg-white py-3 text-slate-950 outline-none transition focus:ring-2 ${Icon ? 'pl-11' : 'pl-4'} ${isPassword ? 'pr-12' : 'pr-4'} ${error ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:border-sky-600 focus:ring-sky-100'}`} />
      {isPassword && <button type="button" onClick={() => setVisible((current) => !current)} className="absolute right-1 top-1/2 grid min-h-10 min-w-10 -translate-y-1/2 place-items-center rounded-lg text-slate-600 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600" aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}>{visible ? <EyeOff aria-hidden="true" size={18} /> : <Eye aria-hidden="true" size={18} />}</button>}
    </div>
    {error && <p id={errorId} className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-bold text-red-800 shadow-sm">{error}</p>}
  </div>;
};
