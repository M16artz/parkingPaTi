import React from 'react';

export const Input = ({ type = 'text', placeholder, icon: Icon, ...props }) => {
  return (
    <div className="relative w-full max-w-md mb-4">
      {Icon && (
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
          <Icon size={18} />
        </div>
      )}
      <input
        type={type}
        placeholder={placeholder}
        className={`w-full bg-white text-tertiary placeholder-gray-400 text-sm font-body rounded-2xl py-3.5 ${
          Icon ? 'pl-11' : 'pl-5'
        } pr-5 border border-gray-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200 shadow-sm`}
        {...props}
      />
    </div>
  );
};