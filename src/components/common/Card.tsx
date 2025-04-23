// src/components/common/Card.tsx
import React, { ReactNode } from 'react';

interface CardProps {
  title?: string;
  children: ReactNode;
  className?: string;
  headerAction?: ReactNode;
  variant?: 'default' | 'bordered';
}

export const Card: React.FC<CardProps> = ({
  title,
  children,
  className = '',
  headerAction,
  variant = 'default'
}) => {
  const variantClasses = {
    default: "bg-white shadow-md",
    bordered: "bg-white border border-gray-200"
  };

  return (
    <div className={`rounded-lg overflow-hidden ${variantClasses[variant]} ${className}`}>
      {title && (
        <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100">
          <h3 className="text-sm font-medium">{title}</h3>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      <div className="p-4">
        {children}
      </div>
    </div>
  );
};

