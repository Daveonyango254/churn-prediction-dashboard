import React from 'react';

interface BadgeProps {
  label: string;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({ 
  label, 
  variant = 'default', 
  size = 'md',
  className = ''
}) => {
  const baseStyles = 'inline-flex items-center font-medium rounded-full transition-all';
  
  const sizeStyles = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  const variantStyles = {
    default: 'bg-tertiary-bg text-text-primary border border-border-color',
    success: 'bg-success/10 text-success border border-success/30',
    warning: 'bg-warning/10 text-warning border border-warning/30',
    error: 'bg-error/10 text-error border border-error/30',
    info: 'bg-accent-primary/10 text-accent-primary border border-accent-primary/30',
  };

  return (
    <span 
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {label}
    </span>
  );
};

export default Badge;
