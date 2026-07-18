export const DIAS = [
  ['LUNES', 'Lunes'], ['MARTES', 'Martes'], ['MIERCOLES', 'Miércoles'],
  ['JUEVES', 'Jueves'], ['VIERNES', 'Viernes'], ['SABADO', 'Sábado'],
  ['DOMINGO', 'Domingo'],
];

export const limpiarDecimalPositivo = (valor) => {
  const limpio = String(valor).replace(/[^\d.]/g, '');
  const [entero = '', ...decimales] = limpio.split('.');
  if (!decimales.length) return entero;
  return `${entero}.${decimales.join('').slice(0, 2)}`;
};

export const limpiarEnteroPositivo = (valor) => String(valor).replace(/\D/g, '');

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

export const validarConfiguracionPorCampo = (formulario) => {
  const errores = { formulario: '', cantidad_espacios: '', horarios: {}, tarifas: {} };
  const cantidadTexto = String(formulario.cantidad_espacios);
  const cantidad = Number(cantidadTexto);
  if (!/^\d+$/.test(cantidadTexto) || !Number.isInteger(cantidad) || cantidad < 1 || cantidad > 500) {
    errores.cantidad_espacios = 'Ingresa un entero entre 1 y 500.';
  }

  const horariosActivos = Object.values(formulario.horarios).filter((item) => item.activo);
  if (!horariosActivos.length) errores.formulario = 'Configura al menos un día de atención.';
  Object.entries(formulario.horarios).forEach(([codigo, horario]) => {
    if (horario.activo && horario.hora_apertura >= horario.hora_cierre) {
      const nombreDia = DIAS.find(([dia]) => dia === codigo)?.[1] || codigo;
      errores.horarios[codigo] = `En ${nombreDia}, la apertura debe ser anterior al cierre.`;
    }
  });

  const precioValido = (valor) => /^\d+(\.\d{1,2})?$/.test(valor) && Number(valor) > 0;
  if (!precioValido(formulario.tarifas.NORMAL.precio_hora)) {
    errores.tarifas.NORMAL = 'Ingresa un precio mayor que 0 usando punto decimal.';
  }
  ['DESCUENTO', 'INCREMENTO'].forEach((codigo) => {
    const tarifa = formulario.tarifas[codigo];
    if (tarifa.activa && !precioValido(tarifa.precio_hora)) {
      errores.tarifas[codigo] = 'Ingresa un precio mayor que 0 usando punto decimal.';
    }
  });
  return errores;
};

export const validarConfiguracion = (formulario) => {
  const errores = validarConfiguracionPorCampo(formulario);
  if (errores.cantidad_espacios) return errores.cantidad_espacios;
  if (errores.formulario) return errores.formulario;
  const primerHorario = Object.values(errores.horarios)[0];
  if (primerHorario) return primerHorario;
  return Object.values(errores.tarifas)[0] || '';
};
