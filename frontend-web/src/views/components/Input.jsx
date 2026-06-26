import React from 'react';
import clsx from 'clsx';

/**
 * COMPONENTE ATÓMICO REUTILIZABLE: Input
 * Representa un campo de texto estandarizado con soporte para iconos de Lucide React,
 * etiquetas semánticas y mensajes de error de validación integrados.
 * * @param {Object} props
 * @param {'text'|'email'|'password'|'number'} [props.type='text'] - Tipo nativo HTML del input.
 * @param {string} props.placeholder - Texto de guía interno.
 * @param {React.ElementType} [props.icon] - Componente de icono de Lucide React (ej. User, Lock).
 * @param {string} [props.label] - Etiqueta visible y accesible sobre el campo.
 * @param {string} [props.error] - Mensaje de error de validación inferior.
 * @param {string} [props.className=''] - Clases Tailwind de maquetación externa (ej. márgenes).
 */
export const Input = ({
  type = 'text',
  placeholder,
  icon: Icon,
  label,
  error,
  className,
  ...props
}) => {
  return (
    <div className="relative w-full max-w-md mb-4">
      
      {/* 1. ETIQUETA ACCESIBLE */}
      {label && (
        <label className="block text-sm font-bold text-tertiary font-body mb-1.5 ml-1">
          {label}
        </label>
      )}

      {/* Contenedor relativo para superponer el icono sobre el input */}
      <div className="relative">
        
        {/* 2. ICONO OPCIONAL DE LUCIDE */}
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-secondary">
            <Icon size={18} />
          </div>
        )}

        {/* 3. CAMPO DE ENTRADA PRINCIPAL */}
        <input
          type={type}
          placeholder={placeholder}
          className={clsx(
            // Estilos Base: Forma, fuentes oficiales (Inter/font-body) y transiciones
            'w-full py-3 rounded-xl border outline-none transition-all duration-200 font-body text-tertiary bg-white shadow-sm minimum-touch-target',
            
            // Ajuste dinámico de padding izquierdo según la presencia del icono
            Icon ? 'pl-11 pr-4' : 'px-4',
            
            // Estados dinámicos: Normal vs Validación de Error (colores de Paleta Alexandria)
            error 
              ? 'border-danger focus:border-danger focus:ring-2 focus:ring-danger/20 text-danger' 
              : 'border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20',
            
            // Estado Inhabilitado genérico
            'disabled:opacity-50 disabled:bg-gray-50 disabled:cursor-not-allowed',
            
            // Inyección de clases externas (opcional)
            className
          )}
          {...props}
        />
      </div>

      {/* 4. MENSAJE DE ERROR SEMÁNTICO */}
      {error && (
        <p className="text-xs font-medium text-danger font-body mt-1 ml-1 animate-fadeIn">
          {error}
        </p>
      )}
    </div>
  );
};