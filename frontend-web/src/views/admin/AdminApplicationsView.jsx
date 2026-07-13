import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Eye, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import { EstadoBadge, Paginacion } from '../components/admin/AdminTableParts';

export const AdminApplicationsView = () => {
  const [q, setQ] = useState('');
  const [estado, setEstado] = useState('REVISION_PENDIENTE');
  const [page, setPage] = useState(1);
  const applications = useQuery({
    queryKey: ['admin', 'applications', { q, estado, page }],
    queryFn: () => adminService.listarSolicitudes({ q, onboarding_estado: estado, page }),
  });

  return (
    <main className="mx-auto max-w-7xl px-5 py-7">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Solicitudes de habilitación</h1>
          <p className="mt-1 text-sm text-slate-600">Revisa identidad, ubicación y documento antes de decidir.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <label className="text-sm font-semibold text-slate-700">
            Estado
            <select className="mt-1 block h-11 border border-slate-300 bg-white px-3" value={estado} onChange={(event) => { setEstado(event.target.value); setPage(1); }}>
              <option value="">Todos</option>
              <option value="REVISION_PENDIENTE">Pendientes</option>
              <option value="RECHAZADO">Rechazadas</option>
              <option value="CONFIGURACION_PENDIENTE">Aprobadas</option>
            </select>
          </label>
          <label className="text-sm font-semibold text-slate-700">
            Buscar
            <span className="mt-1 flex h-11 items-center border border-slate-300 bg-white px-3">
              <Search size={17} className="text-slate-400" />
              <input className="ml-2 w-56 outline-none" value={q} onChange={(event) => { setQ(event.target.value); setPage(1); }} placeholder="Nombre, cédula o parqueadero" />
            </span>
          </label>
        </div>
      </div>

      <section className="mt-6 overflow-hidden border border-slate-200 bg-white">
        {applications.isPending && <p className="p-6 text-slate-600">Cargando solicitudes...</p>}
        {applications.isError && <div className="p-6"><p className="text-red-700">No se pudieron cargar las solicitudes.</p><button className="mt-3 font-bold text-sky-700" type="button" onClick={() => applications.refetch()}>Reintentar</button></div>}
        {applications.isSuccess && applications.data.results.length === 0 && <p className="p-8 text-center text-slate-600">No hay solicitudes para los filtros seleccionados.</p>}
        {applications.isSuccess && applications.data.results.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-4 py-3">Propietario</th><th className="px-4 py-3">Identificación</th><th className="px-4 py-3">Parqueadero</th><th className="px-4 py-3">Estado</th><th className="px-4 py-3">Actualización</th><th className="px-4 py-3 text-right">Acción</th></tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {applications.data.results.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-4"><strong>{item.persona.nombre} {item.persona.apellido}</strong><span className="block text-xs text-slate-500">{item.correo}</span></td>
                      <td className="px-4 py-4">{item.persona.identificacion}</td>
                      <td className="px-4 py-4">{item.parqueadero_nombre}</td>
                      <td className="px-4 py-4"><EstadoBadge estado={item.onboarding_estado} /></td>
                      <td className="px-4 py-4 text-slate-600">{new Date(item.actualizada_en).toLocaleDateString()}</td>
                      <td className="px-4 py-4 text-right"><Link className="inline-flex min-h-11 items-center gap-2 font-bold text-sky-700" to={`/admin/applications/${item.id}`}><Eye size={17} /> Revisar</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Paginacion page={page} count={applications.data.count} onChange={setPage} />
          </>
        )}
      </section>
    </main>
  );
};
