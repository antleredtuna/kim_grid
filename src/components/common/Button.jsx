import React from 'react';

const Button = ({ 
  children, 
  onClick, 
  disabled = false, 
  variant = 'primary', 
  className = '',
  type = 'button'
}) => {
  const baseStyles = "px-4 py-2 rounded-md inline-flex items-center font-medium transition-colors duration-200 shadow-sm";
  
  const variantStyles = {
    primary: disabled 
      ? "bg-pink-200 text-pink-400 cursor-not-allowed" 
      : "bg-pink-500 hover:bg-pink-600 text-white",
    secondary: disabled 
      ? "bg-gray-200 text-gray-400 cursor-not-allowed" 
      : "bg-white hover:bg-pink-100 text-pink-700 border border-pink-300",
    danger: disabled 
      ? "bg-red-200 text-red-400 cursor-not-allowed" 
      : "bg-red-500 hover:bg-red-600 text-white"
  };
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
