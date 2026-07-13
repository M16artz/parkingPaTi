import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, ExternalLink, FileText, MapPin, X } from 'lucide-react';
import { MapContainer, Marker, TileLayer } from 'react-leaflet';
import { Link, useParams } from 'react-router-dom';
import { LOJA_BOUNDS } from '../../config/loja';
import { MAP_ATTRIBUTION, MAP_TILE_URL } from '../../config/env';
import { adminService } from '../../services/adminService';
import { extraerErroresApi } from '../../utils/apiError';
import { ConfirmDialog } from '../components/admin/ConfirmDialog';
import { EstadoBadge } from '../components/admin/AdminTableParts';

export const AdminApplicationDetailView = () => {
  const { cuentaId } = useParams();
  const queryClient = useQueryClient();
  const [dialog, setDialog] = useState(null);
  const [motivo, setMotivo] = useState('');
  const [message, setMessage] = useState('');
  const detail = useQuery({
    queryKey: ['admin', 'applications', cuentaId],
    queryFn: () => adminService.obtenerSolicitud(cuentaId),
  });
  const decision = useMutation({
    mutationFn: ({ action }) => action === 'approve'
      ? adminService.aprobar(cuentaId)
      : adminService.rechazar(cuentaId, motivo),
    onSuccess: async (data) => {
      setMessage(data.email_enviado ? data.detail : `${data.detail} El correo no pudo enviarse.`);
      setDialog(null);
      setMotivo('');
      await queryClient.invalidateQueries({ queryKey: ['admin', 'applications'] });
      await queryClient.invalidateQueries({ queryKey: ['admin', 'accounts'] });
    },
    onError: (error) => {
      setMessage(extraerErroresApi(error).formulario || 'No se pudo registrar la decisión.');
      setDialog(null);
    },
  });
  const documentAccess = useMutation({
    mutationFn: () => adminService.abrirDocumento(cuentaId),
    onSuccess: ({ url }) => window.open(url, '_blank', 'noopener,noreferrer'),
    onError: (error) => setMessage(extraerErroresApi(error).formulario || 'No se pudo abrir el documento.'),
  });

  if (detail.isPending) return <main className="mx-auto max-w-6xl p-6">Cargando solicitud...</main>;
  if (detail.isError) return <main className="mx-auto max-w-6xl p-6"><p className="text-red-700">No se pudo cargar la solicitud.</p><button className="mt-3 font-bold text-sky-700" type="button" onClick={() => detail.refetch()}>Reintentar</button></main>;

  const item = detail.data;
  const position = [Number(item.parqueadero.latitud), Number(item.parqueadero.longitud)];
  const pendiente = item.onboarding_estado === 'REVISION_PENDIENTE';
  return (
    <main className="mx-auto max-w-6xl px-5 py-7">
      <Link className="text-sm font-bold text-sky-700" to="/admin/applications">Volver a solicitudes</Link>
      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div><h1 className="text-2xl font-bold">{item.persona.nombre} {item.persona.apellido}</h1><p className="mt-1 text-slate-600">{item.correo} · {item.persona.tipo_identificacion} {item.persona.identificacion}</p></div>
        <EstadoBadge estado={item.onboarding_estado} />
      </div>
      {message && <p className="mt-4 border border-slate-200 bg-white p-3 text-sm" role="status">{message}</p>}

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-6">
          <section className="border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-bold">Parqueadero</h2>
            <dl className="mt-4 grid gap-3 text-sm"><div><dt className="text-slate-500">Nombre</dt><dd className="font-semibold">{item.parqueadero.nombre}</dd></div><div><dt className="text-slate-500">Dirección</dt><dd>{item.parqueadero.calle_principal}{item.parqueadero.calle_secundaria ? ` y ${item.parqueadero.calle_secundaria}` : ''}{item.parqueadero.numero_lote ? `, lote ${item.parqueadero.numero_lote}` : ''}</dd></div><div><dt className="text-slate-500">Descripción</dt><dd>{item.parqueadero.descripcion || 'Sin descripción'}</dd></div></dl>
          </section>
          <section className="border border-slate-200 bg-white p-5">
            <h2 className="flex items-center gap-2 text-lg font-bold"><FileText size={19} /> Documento</h2>
            <dl className="mt-4 grid gap-3 text-sm"><div><dt className="text-slate-500">Archivo</dt><dd className="font-semibold">{item.documento.nombre_original}</dd></div><div><dt className="text-slate-500">Formato y tamaño</dt><dd>{item.documento.mime_type} · {Math.ceil(item.documento.size_bytes / 1024)} KB</dd></div><div><dt className="text-slate-500">Estado</dt><dd><EstadoBadge estado={item.documento.estado} /></dd></div></dl>
            <button className="mt-5 inline-flex min-h-11 items-center gap-2 font-bold text-sky-700" type="button" disabled={documentAccess.isPending} onClick={() => documentAccess.mutate()}><ExternalLink size={18} /> {documentAccess.isPending ? 'Abriendo...' : 'Revisar documento privado'}</button>
          </section>
        </div>
        <section className="border border-slate-200 bg-white p-5">
          <h2 className="flex items-center gap-2 text-lg font-bold"><MapPin size={19} /> Ubicación declarada</h2>
          <div className="mt-4 h-[420px] min-h-[320px] border border-slate-200">
            <MapContainer center={position} zoom={16} maxBounds={LOJA_BOUNDS} maxBoundsViscosity={1} className="h-full w-full">
              <TileLayer url={MAP_TILE_URL} attribution={MAP_ATTRIBUTION} />
              <Marker position={position} />
            </MapContainer>
          </div>
          <p className="mt-3 text-xs text-slate-500">{item.parqueadero.latitud}, {item.parqueadero.longitud}</p>
        </section>
      </div>

      {pendiente && <section className="mt-6 flex flex-wrap justify-end gap-3 border-t border-slate-300 pt-5"><button className="inline-flex min-h-11 items-center gap-2 border border-red-300 px-4 font-bold text-red-700" type="button" onClick={() => { setMessage(''); setDialog('reject'); }}><X size={18} /> Rechazar</button><button className="inline-flex min-h-11 items-center gap-2 bg-emerald-700 px-4 font-bold text-white" type="button" onClick={() => { setMessage(''); setDialog('approve'); }}><Check size={18} /> Aprobar</button></section>}

      <ConfirmDialog open={dialog === 'approve'} title="Aprobar solicitud" description="La cuenta podrá continuar con la configuración final del parqueadero." confirmLabel="Aprobar solicitud" pending={decision.isPending} onCancel={() => setDialog(null)} onConfirm={() => decision.mutate({ action: 'approve' })} />
      <ConfirmDialog open={dialog === 'reject'} title="Rechazar solicitud" description="El propietario podrá corregir y reenviar todo el onboarding." confirmLabel="Rechazar solicitud" danger disabled={motivo.trim().length < 3} pending={decision.isPending} onCancel={() => setDialog(null)} onConfirm={() => decision.mutate({ action: 'reject' })}>
        <label className="block text-sm font-semibold text-slate-700">Motivo<textarea className="mt-2 min-h-28 w-full border border-slate-300 p-3 font-normal" maxLength={1000} value={motivo} onChange={(event) => setMotivo(event.target.value)} placeholder="Describe claramente qué debe corregirse" /></label>
      </ConfirmDialog>
    </main>
  );
};
