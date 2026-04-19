import React from 'react';

interface SkeletonProps {
  className?: string;
  width?: string;
  height?: string;
}

const Skeleton: React.FC<SkeletonProps> = ({ 
  className = '', 
  width = 'w-full', 
  height = 'h-4' 
}) => {
  return (
    <div
      className={`${width} ${height} bg-tertiary-bg rounded animate-pulse ${className}`}
      style={{
        background: 'linear-gradient(90deg, var(--tertiary-bg) 25%, var(--hover-bg) 50%, var(--tertiary-bg) 75%)',
        backgroundSize: '200% 100%',
        animation: 'pulse-skeleton 1.5s infinite'
      }}
    />
  );
};

export default Skeleton;
