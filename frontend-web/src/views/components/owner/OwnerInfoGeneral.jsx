import React, { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { MapContainer, Marker, TileLayer } from 'react-leaflet';
import { Building2, FileCheck2, LockKeyhole, MapPin, Save } from 'lucide-react';
import { LOJA_CENTER } from '../../../config/loja';
import { MAP_ATTRIBUTION, MAP_TILE_URL } from '../../../config/env';
import { parqueaderoService } from '../../../services/parqueaderoService';
import { extraerErroresApi } from '../../../utils/apiError';

const EMPTY = { nombre: '', descripcion: '' };
const labels = { APROBADO: 'Aprobado', PENDIENTE: 'Pendiente', RECHAZADO: 'Rechazado', BORRADOR: 'Borrador' };
const inputClass = (error) => `mt-1 h-11 w-full rounded-xl border bg-white px-3 outline-none transition focus:ring-2 focus:ring-sky-200 ${error ? 'border-red-400' : 'border-slate-300 focus:border-sky-500'}`;
const InfoValue = ({ label, value }) => <div className="rounded-xl border border-slate-200 bg-white p-4"><dt className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</dt><dd className="mt-1 font-bold text-slate-800">{value || 'No registrado'}</dd></div>;

export const OwnerInfoGeneral = ({ parqueadero }) => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  useEffect(() => setForm({ nombre: parqueadero?.nombre || '', descripcion: parqueadero?.descripcion || '' }), [parqueadero]);

  const validate = (values = form) => {
    const next = {};
    if (!values.nombre || values.nombre !== values.nombre.trim()) next.nombre = 'El nombre es obligatorio y no debe iniciar ni terminar con espacios.';
    else if (values.nombre.length > 150) next.nombre = 'Máximo 150 caracteres.';
    return next;
  };
  const mutation = useMutation({
    mutationFn: (payload) => parqueaderoService.actualizar(parqueadero.id, payload),
    onSuccess: async (result) => { queryClient.setQueryData(['owner', 'parking'], result); await queryClient.invalidateQueries({ queryKey: ['owner', 'parking'] }); setMessage('Información actualizada correctamente.'); },
    onError: (error) => { const apiErrors = extraerErroresApi(error); setErrors((current) => ({ ...current, ...apiErrors })); setMessage(apiErrors.formulario || 'No se pudo guardar la información.'); },
  });
  const change = (event) => { const { name, value } = event.target; const next = { ...form, [name]: value }; setForm(next); setErrors(validate(next)); setMessage(''); };
  const submit = (event) => { event.preventDefault(); const next = validate(); setErrors(next); if (!Object.keys(next).length) mutation.mutate({ nombre: form.nombre, descripcion: form.descripcion }); };
  const latitud = Number(parqueadero?.ubicacion?.latitud);
  const longitud = Number(parqueadero?.ubicacion?.longitud);
  const hasPosition = Number.isFinite(latitud) && Number.isFinite(longitud);
  const position = hasPosition ? [latitud, longitud] : LOJA_CENTER;

  return <form className="space-y-6 owner-view-enter" onSubmit={submit} noValidate>
    {message && <p className={`rounded-xl border p-3 text-sm font-semibold ${mutation.isError ? 'border-red-200 bg-red-50 text-red-700' : 'border-emerald-200 bg-emerald-50 text-emerald-800'}`} role="status">{message}</p>}
    <section className="rounded-2xl border border-slate-200 bg-slate-50 p-6"><h2 className="flex items-center gap-3 text-lg font-black"><Building2 className="text-sky-700" /> Identidad del parqueadero</h2><div className="mt-5 grid gap-5 lg:grid-cols-2"><label className="text-sm font-bold">Nombre *<input className={inputClass(errors.nombre)} maxLength={150} name="nombre" value={form.nombre} onChange={change} onBlur={() => setErrors(validate())} />{errors.nombre && <span className="mt-1 block text-xs text-red-600">{errors.nombre}</span>}</label><label className="text-sm font-bold lg:col-span-2">Descripción<textarea className="mt-1 min-h-28 w-full rounded-xl border border-slate-300 bg-white p-3 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200" name="descripcion" value={form.descripcion} onChange={change} /></label></div></section>

    <section className="rounded-2xl border border-slate-200 bg-slate-50 p-6"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="flex items-center gap-3 text-lg font-black"><MapPin className="text-sky-700" /> Ubicación registrada</h2><span className="inline-flex items-center gap-2 rounded-full bg-slate-200 px-3 py-1.5 text-xs font-black text-slate-700"><LockKeyhole size={14} /> Solo lectura</span></div><p className="mt-2 text-sm text-slate-600">La ubicación aprobada es informativa y no puede modificarse desde el dashboard del propietario.</p><dl className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3"><InfoValue label="Calle principal" value={parqueadero?.direccion?.calle_principal} /><InfoValue label="Calle secundaria" value={parqueadero?.direccion?.calle_secundaria} /><InfoValue label="Número de lote" value={parqueadero?.direccion?.numero_lote} /><InfoValue label="Latitud" value={parqueadero?.ubicacion?.latitud} /><InfoValue label="Longitud" value={parqueadero?.ubicacion?.longitud} /></dl><div className="relative mt-5 h-80 overflow-hidden rounded-2xl border border-slate-300"><MapContainer key={`${position[0]}-${position[1]}`} center={position} zoom={15} zoomControl={false} dragging={false} scrollWheelZoom={false} doubleClickZoom={false} boxZoom={false} keyboard={false} touchZoom={false} className="h-full w-full"><TileLayer url={MAP_TILE_URL} attribution={MAP_ATTRIBUTION} />{hasPosition && <Marker position={position} interactive={false} />}</MapContainer><div className="pointer-events-none absolute inset-0 z-[500] grid place-items-center bg-slate-900/5"><span className="inline-flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-xs font-black text-slate-700 shadow-lg"><LockKeyhole size={15} /> Ubicación bloqueada</span></div></div></section>

    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="flex items-center gap-3 text-lg font-black"><FileCheck2 className="text-sky-700" /> Estado administrativo</h2><dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2 xl:grid-cols-4"><div><dt className="text-slate-500">Habilitación</dt><dd className="font-black">{labels[parqueadero?.habilitacion_estado] || parqueadero?.habilitacion_estado}</dd></div><div><dt className="text-slate-500">Configuración</dt><dd className="font-black">{parqueadero?.configuracion_completa ? 'Completa' : 'Pendiente'}</dd></div><div><dt className="text-slate-500">Aprobación</dt><dd className="font-black">{parqueadero?.approved_at ? new Date(parqueadero.approved_at).toLocaleDateString('es-EC') : 'No disponible'}</dd></div><div><dt className="text-slate-500">Última actualización</dt><dd className="font-black">{parqueadero?.updated_at ? new Date(parqueadero.updated_at).toLocaleString('es-EC') : 'No disponible'}</dd></div></dl>{parqueadero?.motivo_rechazo && <p className="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-800"><strong>Motivo de rechazo:</strong> {parqueadero.motivo_rechazo}</p>}</section>
    <div className="flex justify-end"><button className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-sky-700 px-6 font-black text-white shadow-lg transition hover:bg-sky-800 disabled:opacity-50" type="submit" disabled={mutation.isPending}><Save size={19} /> {mutation.isPending ? 'Guardando...' : 'Guardar información'}</button></div>
  </form>;
};
