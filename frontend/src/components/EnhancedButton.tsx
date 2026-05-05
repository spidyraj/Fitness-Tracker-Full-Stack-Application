import React from 'react';
import { LucideIcon } from 'lucide-react';
import './EnhancedButton.css';

interface EnhancedButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'gradient' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit';
  className?: string;
}

const EnhancedButton: React.FC<EnhancedButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  loading = false,
  disabled = false,
  onClick,
  type = 'button',
  className = ''
}) => {
  const baseClasses = 'enhanced-btn';
  const variantClasses = `enhanced-btn--${variant}`;
  const sizeClasses = `enhanced-btn--${size}`;
  const stateClasses = (loading || disabled) ? 'enhanced-btn--disabled' : '';
  
  const classes = [
    baseClasses,
    variantClasses,
    sizeClasses,
    stateClasses,
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={loading || disabled}
    >
      {loading && (
        <div className="enhanced-btn__spinner">
          <div className="spinner"></div>
        </div>
      )}
      
      {!loading && Icon && (
        <Icon className="enhanced-btn__icon" size={18} />
      )}
      
      <span className="enhanced-btn__text">{children}</span>
      
      <div className="enhanced-btn__ripple"></div>
    </button>
  );
};

export default EnhancedButton;
