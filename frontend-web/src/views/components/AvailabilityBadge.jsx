import React from 'react';
import clsx from 'clsx';

/**
 * 1. MAPEO DE CONFIGURACIÓN POR ESTADO EN TIEMPO REAL
 * Centraliza las clases utilitarias de la paleta oficial Alexandria.
 * Añade soporte para el estado 'disabled' proveniente de los modelos del backend
 * e implementa de forma limpia la bandera para el efecto de onda/pulso (pulse).
 */
const STATUS_CONFIG = {
  available: { 
    bg: 'bg-success/10', 
    text: 'text-success', 
    dot: 'bg-success', 
    pulse: true, 
    label: 'Disponible' 
  },
  almost_full: { 
    bg: 'bg-warning/10', 
    text: 'text-warning', 
    dot: 'bg-warning', 
    pulse: false, 
    label: 'Casi Lleno' 
  },
  full: { 
    bg: 'bg-danger/10', 
    text: 'text-danger', 
    dot: 'bg-danger', 
    pulse: false, 
    label: 'Lleno' 
  },
  disabled: { 
    bg: 'bg-gray-100', 
    text: 'text-gray-400', 
    dot: 'bg-gray-400', 
    pulse: false, 
    label: 'Inhabilitado' 
  },
};

/**
 * COMPONENTE ATÓMICO REUTILIZABLE: AvailabilityBadge
 * Renderiza de forma elegante un indicador de estado dinámico tipo píldora
 * para espacios individuales de parqueo o resúmenes de paneles generales.
 * * @param {Object} props
 * @param {'available'|'almost_full'|'full'|'disabled'} [props.status='available'] - Estado actual.
 * @param {string} [props.className=''] - Clases utilitarias adicionales para espaciados externos.
 */
export const AvailabilityBadge = ({ status = 'available', className = '' }) => {
  
  // Selección segura de la configuración del estado (usa 'available' como fallback ante datos inesperados)
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.available;

  return (
    <div
      className={clsx(
        // Clases de Estructura: Diseño en fila compacta, bordes redondeados de tipo píldora, tipografía font-label
        'inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold font-label select-none transition-all duration-200 w-fit',
        config.bg,
        config.text,
        className
      )}
    >
      {/* Contenedor relativo para posicionar el punto sólido y su animación concéntrica */}
      <div className="relative flex h-2 w-2">
        
        {/* Efecto Ping/Onda expansiva: Solo se activa dinámicamente si la propiedad pulse es verdadera */}
        {config.pulse && (
          <span className={clsx(
            'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
            config.dot
          )} />
        )}
        
        {/* Punto sólido indicador de color estable */}
        <span className={clsx(
          'relative inline-flex rounded-full h-2 w-2',
          config.dot
        )} />
      </div>

      {/* Etiqueta textual del estado unificado en español */}
      <span>{config.label}</span>
    </div>
  );
};