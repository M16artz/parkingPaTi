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

const inputClass = (error) =>
  `mt-1.5 h-11 w-full rounded-xl border bg-white px-4 text-sm font-bold text-slate-800 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${
    error ? 'border-red-400 bg-red-50/30' : 'border-slate-200 focus:bg-white'
  }`;

const InfoValue = ({ label, value }) => (
  <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3.5">
    <dt className="text-[11px] font-black uppercase tracking-wider text-slate-400">{label}</dt>
    <dd className="mt-1 text-sm font-bold text-slate-800">{value || 'No registrado'}</dd>
  </div>
);

export const OwnerInfoGeneral = ({ parqueadero }) => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');

  useEffect(() => {
    setForm({
      nombre: parqueadero?.nombre || '',
      descripcion: parqueadero?.descripcion || '',
    });
  }, [parqueadero]);

  const validate = (values = form) => {
    const next = {};
    if (!values.nombre || values.nombre !== values.nombre.trim()) {
      next.nombre = 'El nombre es obligatorio y no debe iniciar ni terminar con espacios.';
    } else if (values.nombre.length > 150) {
      next.nombre = 'Máximo 150 caracteres.';
    }
    return next;
  };

  const mutation = useMutation({
    mutationFn: (payload) => parqueaderoService.actualizar(parqueadero.id, payload),
    onSuccess: async (result) => {
      queryClient.setQueryData(['owner', 'parking'], result);
      await queryClient.invalidateQueries({ queryKey: ['owner', 'parking'] });
      setMessage('Información actualizada correctamente.');
    },
    onError: (error) => {
      const apiErrors = extraerErroresApi(error);
      setErrors((current) => ({ ...current, ...apiErrors }));
      setMessage(apiErrors.formulario || 'No se pudo guardar la información.');
    },
  });

  const change = (event) => {
    const { name, value } = event.target;
    const next = { ...form, [name]: value };
    setForm(next);
    setErrors(validate(next));
    setMessage('');
  };

  const submit = (event) => {
    event.preventDefault();
    const next = validate();
    setErrors(next);
    if (!Object.keys(next).length) {
      mutation.mutate({ nombre: form.nombre, descripcion: form.descripcion });
    }
  };

  const latitud = Number(parqueadero?.ubicacion?.latitud);
  const longitud = Number(parqueadero?.ubicacion?.longitud);
  const hasPosition = Number.isFinite(latitud) && Number.isFinite(longitud);
  const position = hasPosition ? [latitud, longitud] : LOJA_CENTER;

  return (
    <form className="space-y-6 owner-view-enter font-sans select-none pb-8" onSubmit={submit} noValidate>
      {/* ALERTA DE MENSAJE */}
      {message && (
        <div
          className={`rounded-2xl border p-4 text-sm font-bold flex items-center gap-2 shadow-xs ${
            mutation.isError
              ? 'border-red-200 bg-red-50 text-red-800'
              : 'border-emerald-200 bg-emerald-50 text-emerald-800'
          }`}
          role="status"
        >
          <span>{message}</span>
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* BLOQUE 1: IDENTIDAD DEL PARQUEADERO                              */}
      {/* ----------------------------------------------------------------- */}
      <section className="bg-[#e2f2fe] rounded-[28px] p-6 sm:p-8 shadow-sm border border-blue-100/60">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-blue-600/10 rounded-2xl text-blue-600">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-black tracking-wider text-slate-800 uppercase font-headline">
              Identidad del parqueadero
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Información básica del establecimiento visible para los clientes.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-50">
          <div className="grid gap-5 lg:grid-cols-2">
            {/* Campo Nombre */}
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400">
                Nombre del Parqueadero *
              </label>
              <input
                className={inputClass(errors.nombre)}
                maxLength={150}
                name="nombre"
                value={form.nombre}
                onChange={change}
                onBlur={() => setErrors(validate())}
              />
              {errors.nombre && <span className="mt-1.5 block text-xs font-bold text-red-600">{errors.nombre}</span>}
            </div>

            {/* Campo Descripción */}
            <div className="lg:col-span-2">
              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400">
                Descripción
              </label>
              <textarea
                className="mt-1.5 min-h-28 w-full rounded-xl border border-slate-200 bg-white p-3.5 text-sm font-bold text-slate-800 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                name="descripcion"
                value={form.descripcion}
                onChange={change}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* BLOQUE 2: UBICACIÓN REGISTRADA                                    */}
      {/* ----------------------------------------------------------------- */}
      <section className="bg-[#e2f2fe] rounded-[28px] p-6 sm:p-8 shadow-sm border border-blue-100/60">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600/10 rounded-2xl text-blue-600">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-wider text-slate-800 uppercase font-headline">
                Ubicación registrada
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                La ubicación aprobada es informativa y no puede modificarse desde el dashboard.
              </p>
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-200/80 px-3 py-1.5 text-xs font-black text-slate-700">
            <LockKeyhole size={13} /> Solo lectura
          </span>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-50 space-y-5">
          <dl className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <InfoValue label="Calle principal" value={parqueadero?.direccion?.calle_principal} />
            <InfoValue label="Calle secundaria" value={parqueadero?.direccion?.calle_secundaria} />
            <InfoValue label="Número de lote" value={parqueadero?.direccion?.numero_lote} />
            <InfoValue label="Latitud" value={parqueadero?.ubicacion?.latitud} />
            <InfoValue label="Longitud" value={parqueadero?.ubicacion?.longitud} />
          </dl>

          {/* Mapa Interactiva */}
          <div className="relative h-80 overflow-hidden rounded-2xl border border-slate-200 shadow-xs">
            <MapContainer
              key={`${position[0]}-${position[1]}`}
              center={position}
              zoom={15}
              zoomControl={false}
              dragging={false}
              scrollWheelZoom={false}
              doubleClickZoom={false}
              boxZoom={false}
              keyboard={false}
              touchZoom={false}
              className="h-full w-full"
            >
              <TileLayer url={MAP_TILE_URL} attribution={MAP_ATTRIBUTION} />
              {hasPosition && <Marker position={position} interactive={false} />}
            </MapContainer>

            <div className="pointer-events-none absolute inset-0 z-[500] grid place-items-center bg-slate-900/5">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-xs font-black text-slate-700 shadow-md">
                <LockKeyhole size={15} /> Ubicación bloqueada
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* BLOQUE 3: ESTADO ADMINISTRATIVO                                   */}
      {/* ----------------------------------------------------------------- */}
      <section className="bg-[#e2f2fe] rounded-[28px] p-6 sm:p-8 shadow-sm border border-blue-100/60">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-blue-600/10 rounded-2xl text-blue-600">
            <FileCheck2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-black tracking-wider text-slate-800 uppercase font-headline">
              Estado administrativo
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Estado operativo y detalles de auditoría en la plataforma.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-50">
          <dl className="grid gap-4 text-sm sm:grid-cols-2 xl:grid-cols-4">
            <div className="bg-slate-50/60 p-3.5 rounded-xl border border-slate-100">
              <dt className="text-[11px] font-black uppercase tracking-wider text-slate-400">Habilitación</dt>
              <dd className="mt-1 font-black text-slate-800">
                {labels[parqueadero?.habilitacion_estado] || parqueadero?.habilitacion_estado}
              </dd>
            </div>

            <div className="bg-slate-50/60 p-3.5 rounded-xl border border-slate-100">
              <dt className="text-[11px] font-black uppercase tracking-wider text-slate-400">Configuración</dt>
              <dd className="mt-1 font-black text-slate-800">
                {parqueadero?.configuracion_completa ? 'Completa' : 'Pendiente'}
              </dd>
            </div>

            <div className="bg-slate-50/60 p-3.5 rounded-xl border border-slate-100">
              <dt className="text-[11px] font-black uppercase tracking-wider text-slate-400">Aprobación</dt>
              <dd className="mt-1 font-black text-slate-800">
                {parqueadero?.approved_at ? new Date(parqueadero.approved_at).toLocaleDateString('es-EC') : 'No disponible'}
              </dd>
            </div>

            <div className="bg-slate-50/60 p-3.5 rounded-xl border border-slate-100">
              <dt className="text-[11px] font-black uppercase tracking-wider text-slate-400">Última actualización</dt>
              <dd className="mt-1 font-black text-slate-800">
                {parqueadero?.updated_at ? new Date(parqueadero.updated_at).toLocaleString('es-EC') : 'No disponible'}
              </dd>
            </div>
          </dl>

          {parqueadero?.motivo_rechazo && (
            <p className="mt-4 rounded-xl bg-rose-50 p-4 text-sm font-bold text-rose-800 border border-rose-100">
              <strong>Motivo de rechazo:</strong> {parqueadero.motivo_rechazo}
            </p>
          )}
        </div>
      </section>

      {/* BOTÓN SUBMIT */}
      <div className="flex justify-end pt-2">
        <button
          className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 px-7 font-black text-xs uppercase tracking-wider text-white shadow-md shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          type="submit"
          disabled={mutation.isPending}
        >
          <Save size={18} />
          <span>{mutation.isPending ? 'Guardando...' : 'Guardar información'}</span>
        </button>
      </div>
    </form>
  );
};