import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle2, XCircle, FileText, Building, User, Loader2 } from 'lucide-react';

export const AdminApplicationDetailView = ({ cuentaId, solicitud, onBack, onStatusChange }) => {
  const [detalle, setDetalle] = useState(solicitud || null);
  const [loading, setLoading] = useState(!solicitud);
  const [submitting, setSubmitting] = useState(false);

  // 🛡️ Petición protegida para cargar el detalle de la solicitud
  useEffect(() => {
    if (solicitud) {
      setDetalle(solicitud);
      return;
    }

    const fetchDetalle = async () => {
      if (!cuentaId) return;
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/admin/applications/${cuentaId}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setDetalle(data);
        }
      } catch (error) {
        console.error('Error al obtener detalle de solicitud:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetalle();
  }, [cuentaId, solicitud]);

  // 🛡️ Petición protegida para actualizar estado (Aprobar / Rechazar)
  const handleUpdateStatus = async (nuevoEstado) => {
    setSubmitting(true);
    try {
      if (onStatusChange) {
        await onStatusChange(cuentaId, nuevoEstado);
        setDetalle((prev) => (prev ? { ...prev, estado: nuevoEstado } : null));
      } else {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/admin/applications/${cuentaId}/status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ estado: nuevoEstado })
        });
        if (response.ok) {
          setDetalle((prev) => (prev ? { ...prev, estado: nuevoEstado } : null));
        }
      }
    } catch (error) {
      console.error('Error al cambiar el estado de la solicitud:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 font-sans antialiased">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-black uppercase text-slate-500 hover:text-blue-600 transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} /> Volver a Solicitudes
        </button>
        <div className="bg-[#eef7ff] rounded-[24px] p-12 border border-blue-100/80 flex justify-center items-center">
          <div className="inline-flex items-center gap-2 text-slate-600 font-bold text-xs">
            <Loader2 size={18} className="animate-spin text-[#3262ec]" /> Cargando detalles de la solicitud...
          </div>
        </div>
      </div>
    );
  }

  if (!detalle) {
    return (
      <div className="space-y-6 font-sans antialiased">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-black uppercase text-slate-500 hover:text-blue-600 transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} /> Volver a Solicitudes
        </button>
        <div className="bg-white p-8 rounded-[24px] text-center border border-slate-100 text-xs font-bold text-slate-500 uppercase">
          No se encontró información de la solicitud.
        </div>
      </div>
    );
  }

  const estadoActual = detalle.estado || 'PENDIENTE';
  const propietario = detalle.propietario || {};
  const parqueadero = detalle.parqueadero || {};
  const documentos = detalle.documentos || [];

  return (
    <div className="space-y-6 font-sans antialiased">
      {/* BOTÓN VOLVER */}
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-black uppercase text-slate-500 hover:text-blue-600 transition-colors cursor-pointer"
      >
        <ArrowLeft size={16} /> Volver a Solicitudes
      </button>

      {/* CABECERA RESUMEN */}
      <div className="bg-[#eef7ff] rounded-[24px] p-6 border border-blue-100/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-base font-black text-slate-800 uppercase font-headline">
            {parqueadero.nombre || 'Sin nombre'}
          </h2>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            Solicitante: {propietario.nombre || 'N/A'} ({propietario.cedula || propietario.identificacion || 'N/A'})
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span
            className={`px-3 py-1.5 text-xs font-black uppercase rounded-full ${
              estadoActual === 'PENDIENTE'
                ? 'bg-amber-100 text-amber-700'
                : estadoActual === 'APROBADO'
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-rose-100 text-rose-700'
            }`}
          >
            {estadoActual}
          </span>

          <button
            type="button"
            disabled={submitting}
            onClick={() => handleUpdateStatus('APROBADO')}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs uppercase rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer transition-all"
          >
            <CheckCircle2 size={15} /> Aprobar
          </button>

          <button
            type="button"
            disabled={submitting}
            onClick={() => handleUpdateStatus('RECHAZADO')}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold text-xs uppercase rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer transition-all"
          >
            <XCircle size={15} /> Rechazar
          </button>
        </div>
      </div>

      {/* DETALLES DIVIDIDOS EN TARJETAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* DATOS PROPIETARIO */}
        <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 text-blue-600 font-bold text-xs uppercase">
            <User size={18} />
            <span>Información del Propietario</span>
          </div>
          <div className="space-y-2 text-xs">
            <p className="text-slate-500">
              <strong className="text-slate-700">Nombre:</strong> {propietario.nombre || 'N/A'}
            </p>
            <p className="text-slate-500">
              <strong className="text-slate-700">Cédula/RUC:</strong> {propietario.cedula || propietario.identificacion || 'N/A'}
            </p>
            <p className="text-slate-500">
              <strong className="text-slate-700">Correo:</strong> {propietario.correo || 'N/A'}
            </p>
            <p className="text-slate-500">
              <strong className="text-slate-700">Teléfono:</strong> {propietario.telefono || 'N/A'}
            </p>
          </div>
        </div>

        {/* DATOS PARQUEADERO */}
        <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 text-blue-600 font-bold text-xs uppercase">
            <Building size={18} />
            <span>Detalles del Establecimiento</span>
          </div>
          <div className="space-y-2 text-xs">
            <p className="text-slate-500">
              <strong className="text-slate-700">Nombre:</strong> {parqueadero.nombre || 'N/A'}
            </p>
            <p className="text-slate-500">
              <strong className="text-slate-700">Dirección:</strong> {parqueadero.direccion || 'N/A'}
            </p>
            <p className="text-slate-500">
              <strong className="text-slate-700">Plazas Totales:</strong> {parqueadero.plazas ?? 'N/A'} plazas
            </p>
            <p className="text-slate-500">
              <strong className="text-slate-700">Tarifa por Hora:</strong> {parqueadero.tarifaHora || 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* DOCUMENTOS ADJUNTOS */}
      <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 text-blue-600 font-bold text-xs uppercase">
          <FileText size={18} />
          <span>Documentos de Respaldos</span>
        </div>
        {documentos.length === 0 ? (
          <p className="text-xs font-semibold text-slate-400 py-2">No hay documentos adjuntos.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {documentos.map((doc, index) => (
              <div
                key={doc.id || index}
                className="p-3.5 bg-slate-50 border border-slate-200/60 rounded-xl flex items-center justify-between"
              >
                <span className="text-xs font-semibold text-slate-700 truncate">
                  {doc.nombre || `Documento ${index + 1}`}
                </span>
                <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                  {doc.estado || 'Adjuntado'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};