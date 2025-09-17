import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-gray-900 border border-gold-400/20 rounded-xl p-6 shadow-lg hover:border-gold-400 transition-all duration-300 ${className}`}>
      {children}
    </div>
  );
};

export default Card;