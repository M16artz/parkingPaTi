import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Search, UserCheck, UserX } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { extraerErroresApi } from '../../utils/apiError';
import { FILTRO_ACCESO, normalizarFiltroActivo } from '../../utils/adminFilters';
import { ConfirmDialog } from '../components/admin/ConfirmDialog';
import { EstadoBadge, Paginacion } from '../components/admin/AdminTableParts';

export const AdminAccountsView = () => {
  const queryClient = useQueryClient();
  const [q, setQ] = useState('');
  const [filtroAcceso, setFiltroAcceso] = useState(FILTRO_ACCESO.TODOS);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const [message, setMessage] = useState('');
  const accounts = useQuery({
    queryKey: ['admin', 'accounts', { q, filtroAcceso, page }],
    queryFn: () => adminService.listarCuentas({ q, activo: normalizarFiltroActivo(filtroAcceso), page }),
  });
  const accountAction = useMutation({
    mutationFn: ({ action, id }) => action === 'enable' ? adminService.rehabilitar(id) : adminService.deshabilitar(id),
    onSuccess: async (data) => {
      setMessage(data.detail);
      setSelected(null);
      await queryClient.invalidateQueries({ queryKey: ['admin', 'accounts'] });
      await queryClient.invalidateQueries({ queryKey: ['admin', 'applications'] });
    },
    onError: (error) => setMessage(extraerErroresApi(error).formulario || 'No se pudo actualizar la cuenta.'),
  });

  return <main className="mx-auto max-w-7xl px-5 py-7">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><h1 className="text-2xl font-bold">Cuentas propietarias</h1><p className="mt-1 text-sm text-slate-600">Consulta, bloquea o rehabilita el acceso cuando corresponda.</p></div><div className="flex flex-wrap gap-3"><label className="text-sm font-semibold">Acceso<select className="mt-1 block h-11 border border-slate-300 bg-white px-3" value={filtroAcceso} onChange={(event) => { setFiltroAcceso(event.target.value); setPage(1); }}><option value={FILTRO_ACCESO.TODOS}>Todas</option><option value={FILTRO_ACCESO.HABILITADAS}>Habilitadas</option><option value={FILTRO_ACCESO.DESHABILITADAS}>Deshabilitadas</option></select></label><label className="text-sm font-semibold">Buscar<span className="mt-1 flex h-11 items-center border border-slate-300 bg-white px-3"><Search aria-hidden="true" size={17} className="text-slate-400" /><input className="ml-2 w-56 outline-none" value={q} onChange={(event) => { setQ(event.target.value); setPage(1); }} placeholder="Nombre, cédula o correo" /></span></label></div></div>
    {message && <p className="mt-4 border border-slate-200 bg-white p-3 text-sm text-slate-700" role="status">{message}</p>}
    <section className="mt-6 overflow-hidden border border-slate-200 bg-white">
      {accounts.isPending && <p className="p-6 text-slate-600">Cargando cuentas...</p>}
      {accounts.isError && <div className="p-6"><p className="text-red-700">No se pudieron cargar las cuentas.</p><button className="mt-3 font-bold text-sky-700" type="button" onClick={() => accounts.refetch()}>Reintentar</button></div>}
      {accounts.isSuccess && accounts.data.results.length === 0 && <p className="p-8 text-center text-slate-600">No hay cuentas para los filtros seleccionados.</p>}
      {accounts.isSuccess && accounts.data.results.length > 0 && <><div className="overflow-x-auto"><table className="w-full min-w-[800px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-4 py-3">Propietario</th><th className="px-4 py-3">Identificación</th><th className="px-4 py-3">Parqueadero</th><th className="px-4 py-3">Onboarding</th><th className="px-4 py-3">Acceso</th><th className="px-4 py-3 text-right">Acción</th></tr></thead><tbody className="divide-y divide-slate-100">{accounts.data.results.map((item) => <tr key={item.id}><td className="px-4 py-4"><strong>{item.persona.nombre} {item.persona.apellido}</strong><span className="block text-xs text-slate-500">{item.correo}</span></td><td className="px-4 py-4">{item.persona.identificacion}</td><td className="px-4 py-4">{item.parqueadero_nombre || 'Sin parqueadero'}</td><td className="px-4 py-4"><EstadoBadge estado={item.onboarding_estado} /></td><td className="px-4 py-4">{item.is_active ? 'Habilitada' : 'Deshabilitada'}</td><td className="px-4 py-4 text-right"><button className={`inline-flex min-h-11 items-center gap-2 font-bold ${item.is_active ? 'text-red-700' : 'text-emerald-700'}`} type="button" onClick={() => { setMessage(''); setSelected({ action: item.is_active ? 'disable' : 'enable', item }); }}>{item.is_active ? <><UserX aria-hidden="true" size={17} /> Deshabilitar</> : <><UserCheck aria-hidden="true" size={17} /> Rehabilitar</>}</button></td></tr>)}</tbody></table></div><Paginacion page={page} count={accounts.data.count} onChange={setPage} /></>}
    </section>
    <ConfirmDialog open={Boolean(selected)} title={selected?.action === 'enable' ? 'Rehabilitar cuenta' : 'Deshabilitar cuenta'} description={selected?.action === 'enable' ? `Se restaurará el acceso de ${selected?.item.persona.nombre || ''} en el paso que corresponda a su solicitud.` : `Se bloqueará el acceso de ${selected?.item.persona.nombre || ''} y su parqueadero dejará de mostrarse.`} confirmLabel={selected?.action === 'enable' ? 'Rehabilitar' : 'Deshabilitar'} danger={selected?.action !== 'enable'} pending={accountAction.isPending} onCancel={() => setSelected(null)} onConfirm={() => accountAction.mutate({ action: selected.action, id: selected.item.id })} />
  </main>;
};
