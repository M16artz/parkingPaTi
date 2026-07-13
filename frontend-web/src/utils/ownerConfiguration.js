export const DIAS = [
  ['LUNES', 'Lunes'], ['MARTES', 'Martes'], ['MIERCOLES', 'Miércoles'],
  ['JUEVES', 'Jueves'], ['VIERNES', 'Viernes'], ['SABADO', 'Sábado'],
  ['DOMINGO', 'Domingo'],
];

export const crearFormularioConfiguracion = (data) => {
  const horariosGuardados = Object.fromEntries((data?.horarios || []).map((item) => [item.dia, item]));
  const tarifasGuardadas = Object.fromEntries((data?.tarifas || []).map((item) => [item.codigo, item]));
  return {
    cantidad_espacios: data?.total_espacios || 1,
    horarios: Object.fromEntries(DIAS.map(([codigo]) => [codigo, {
      activo: Boolean(horariosGuardados[codigo]),
      hora_apertura: horariosGuardados[codigo]?.hora_apertura?.slice(0, 5) || '08:00',
      hora_cierre: horariosGuardados[codigo]?.hora_cierre?.slice(0, 5) || '18:00',
    }])),
    tarifas: {
      NORMAL: { activa: true, precio_hora: tarifasGuardadas.NORMAL?.precio_hora || '' },
      DESCUENTO: {
        activa: Boolean(tarifasGuardadas.DESCUENTO?.activa),
        precio_hora: tarifasGuardadas.DESCUENTO?.precio_hora || '',
      },
      INCREMENTO: {
        activa: Boolean(tarifasGuardadas.INCREMENTO?.activa),
        precio_hora: tarifasGuardadas.INCREMENTO?.precio_hora || '',
      },
    },
  };
};

export const crearPayloadConfiguracion = (formulario) => ({
  cantidad_espacios: Number(formulario.cantidad_espacios),
  horarios: Object.entries(formulario.horarios)
    .filter(([, value]) => value.activo)
    .map(([dia, value]) => ({
      dia,
      hora_apertura: value.hora_apertura,
      hora_cierre: value.hora_cierre,
    })),
  tarifas: Object.entries(formulario.tarifas)
    .filter(([codigo, value]) => codigo === 'NORMAL' || value.activa)
    .map(([codigo, value]) => ({
      codigo,
      nombre_visible: codigo.charAt(0) + codigo.slice(1).toLowerCase(),
      precio_hora: value.precio_hora,
      activa: true,
    })),
});

export const validarConfiguracion = (formulario) => {
  if (!Number.isInteger(Number(formulario.cantidad_espacios)) || Number(formulario.cantidad_espacios) < 1) {
    return 'La cantidad de espacios debe ser un entero mayor que cero.';
  }
  const horarios = Object.values(formulario.horarios).filter((item) => item.activo);
  if (!horarios.length) return 'Configura al menos un día de atención.';
  if (horarios.some((item) => item.hora_apertura >= item.hora_cierre)) {
    return 'La apertura debe ser anterior al cierre en todos los días activos.';
  }
  if (formulario.tarifas.NORMAL.precio_hora === '' || Number(formulario.tarifas.NORMAL.precio_hora) < 0) {
    return 'La tarifa NORMAL es obligatoria y no puede ser negativa.';
  }
  const opcionalInvalida = ['DESCUENTO', 'INCREMENTO'].some((codigo) => {
    const tarifa = formulario.tarifas[codigo];
    return tarifa.activa && (tarifa.precio_hora === '' || Number(tarifa.precio_hora) < 0);
  });
  return opcionalInvalida ? 'Toda tarifa activa debe tener un precio no negativo.' : '';
};
