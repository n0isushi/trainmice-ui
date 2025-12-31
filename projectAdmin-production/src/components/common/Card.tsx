import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  action?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, className = '', title, action }) => {
  return (
    <div className={`bg-white rounded-lg shadow-md ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between p-6 border-b">
          {title && <h3 className="text-xl font-semibold text-gray-800">{title}</h3>}
          {action && <div>{action}</div>}
        </div>
      )}
      <div className={title || action ? 'p-6' : ''}>{children}</div>
    </div>
  );
};
