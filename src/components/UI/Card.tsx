import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  padding = 'md'
}) => {
  const paddingStyles = {
    none: '',
    sm: 'p-3',
    md: 'p-4 lg:p-6',
    lg: 'p-6 lg:p-8',
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm ${paddingStyles[padding]} ${className}`}>
      {children}
    </div>
  );
};

export default Card;

