
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  loading, 
  className = '', 
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center font-bold tracking-tight transition-all duration-300 rounded-full focus:outline-none focus:ring-4 focus:ring-purple-500/10 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]";
  
  const variants = {
    // Vibrant gradient for primary actions
    primary: "formly-gradient text-white shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 hover:brightness-110",
    // Dark neutral for grounding secondary actions
    secondary: "bg-slate-900 text-white hover:bg-black shadow-md",
    // High-visibility outline: Purple text on white for "Technical but friendly" feel
    outline: "border-2 border-slate-200 bg-white text-purple-600 hover:border-purple-600 hover:bg-purple-50 shadow-sm",
    // Subtle ghost for tertiary actions
    ghost: "bg-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-900"
  };

  const sizes = {
    sm: "px-5 py-2.5 text-xs uppercase tracking-widest",
    md: "px-7 py-3.5 text-sm",
    lg: "px-10 py-5 text-base"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : null}
      {children}
    </button>
  );
};

export default Button;
