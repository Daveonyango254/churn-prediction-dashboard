import React from 'react';

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

const Container: React.FC<ContainerProps> = ({ 
  children, 
  className = '',
  maxWidth = 'xl'
}) => {
  const maxWidthStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
    '2xl': 'max-w-4xl',
    full: 'max-w-full',
  };

  return (
    <div className={`${maxWidthStyles[maxWidth]} mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  );
};

export default Container;
