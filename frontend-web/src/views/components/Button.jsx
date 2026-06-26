import React from 'react';

/**
 * 1. MAPEO ESTRICTO DE VARIANTES VISUALES
 * Mantiene las clases de Tailwind agrupadas por propósito semántico fuera del renderizado.
 * Esto evita strings gigantes desordenados y facilita cambios globales de diseño.
 */
/**
 * 1. MAPEO ESTRICTO DE VARIANTES VISUALES (Unificado con Paleta Real)
 * Mantiene las clases de Tailwind agrupadas por propósito semántico.
 * Ahora referencian los colores de marca reales (celeste, slate, oscuro) definidos en index.css.
 */
const VARIANT_MAP = {
  // Variantes Principales de Marca
  primary: 'bg-primary hover:bg-primary-hover text-white focus:ring-primary/50 border-transparent',
  secondary: 'bg-secondary hover:bg-slate-800 text-white focus:ring-secondary/50 border-transparent',
  tertiary: 'bg-tertiary hover:bg-black text-white focus:ring-tertiary/50 border-transparent', // Variante para el footer oscuro

  // Variantes de Estado y Utilidad
  danger: 'bg-danger hover:bg-red-700 text-white focus:ring-danger/50 border-transparent',
  outline: 'bg-transparent border border-secondary text-neutral hover:bg-sky-50 focus:ring-secondary/50'
};

/**
 * COMPONENTE ATÓMICO REUTILIZABLE: Button
 * Cumple con las directrices de exportación nombrada, legibilidad y accesibilidad.
 * * @param {Object} props
 * @param {string} [props.variant='primary'] - Variante visual del botón.
 * @param {boolean} [props.isLoading=false] - Estado que bloquea interacciones y renderiza un spinner de carga.
 * @param {boolean} [props.disabled=false] - Inhabilita la interacción por validaciones de formulario.
 * @param {string} [props.type='button'] - Atributo nativo HTML ('button', 'submit', 'reset').
 * @param {string} [props.className=''] - Clases utilitarias adicionales de espaciado o layouts externos.
 * @param {React.ReactNode} props.children - Texto o elementos que van dentro del botón.
 */
export const Button = ({
  variant = 'primary',
  isLoading = false,
  disabled = false,
  type = 'button',
  className = '',
  children,
  ...props
}) => {
  
  // Clases base compartidas por todos los botones (estructura, transiciones suaves y tamaño táctil móvil)
  const baseClasses = 'inline-flex items-center justify-center font-label font-medium rounded-lg text-sm px-5 py-2.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed minimum-touch-target';
  
  // Selección segura de la variante (utiliza primary por defecto si el string no coincide)
  const variantClasses = VARIANT_MAP[variant] || VARIANT_MAP.primary;

  return (
    <button
      type={type}
      // Se bloquea el botón si está cargando de forma asíncrona o deshabilitado manualmente
      disabled={disabled || isLoading}
      className={`${baseClasses} ${variantClasses} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          {/* Spinner SVG optimizado y adaptado al color actual del texto */}
          <svg 
            className="animate-spin -ml-1 mr-3 h-5 w-5 text-current" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Cargando...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};