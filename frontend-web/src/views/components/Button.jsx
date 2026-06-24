import React from 'react';
import clsx from 'clsx';

/**
 * Reusable Button Component for ParkingPaTi
 * @param {string} variant - primary | secondary | danger | success
 * @param {string} size - sm | md | lg
 */
export const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className, 
  isLoading, 
  ...props 
}) => {
  return (
    <button
      className={clsx(
        // Base professional styling (Focus, transitions, roundness)
        "font-label font-bold rounded-xl transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2",
        
        // Dynamic variants mapped to our custom design system colors
        variant === 'primary' && "bg-primary text-white hover:bg-opacity-90 focus:ring-primary",
        variant === 'secondary' && "bg-secondary text-white hover:bg-opacity-90 focus:ring-secondary",
        variant === 'danger' && "bg-danger text-white hover:bg-opacity-90 focus:ring-danger",
        variant === 'success' && "bg-success text-white hover:bg-opacity-90 focus:ring-success",
        
        // Dynamic sizes matching mobile/desktop touch target standards
        size === 'sm' && "px-3 py-1.5 text-xs",
        size === 'md' && "px-5 py-2.5 text-sm minimum-touch-target", // 44px equivalent target
        size === 'lg' && "px-7 py-3.5 text-base",
        
        className
      )}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? (
        // Simple elegant loading indicator (Spinner)
        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
      ) : (
        children
      )}
    </button>
  );
};