import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  icon?: React.ReactNode;
  isLoading?: boolean;
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  icon,
  isLoading = false,
  disabled,
  fullWidth = false,
  className = '',
  ...props
}) => {
  const variantClasses = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98] shadow-sm',
    secondary: 'bg-secondary text-foreground hover:bg-secondary/80 border border-border active:scale-[0.98]',
    ghost: 'bg-transparent hover:bg-muted text-foreground border border-border active:scale-[0.98]',
    danger: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 active:scale-[0.98] shadow-sm',
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm min-h-[36px]',
    md: 'px-4 py-2.5 text-sm min-h-[44px]',
    lg: 'px-6 py-3 text-base min-h-[52px]',
  };

  return (
    <button
      className={`
        ${variantClasses[variant]} 
        ${sizeClasses[size]} 
        ${fullWidth ? 'w-full' : ''} 
        ${className} 
        inline-flex items-center justify-center gap-2 
        font-medium rounded-lg 
        transition-all duration-200 
        focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background
        disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
        touch-manipulation
      `}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        icon
      )}
      <span className="truncate">{children}</span>
    </button>
  );
};

export default Button;
