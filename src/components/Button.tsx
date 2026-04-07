// src/components/Button.tsx
import { LoaderCircle } from 'lucide-react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: ReactNode;
  children: ReactNode;
}

const variantStyles = {
  primary: 'bg-primary-700 text-white border border-primary-700 hover:-translate-y-0.5 hover:bg-primary-600 hover:shadow-medium active:translate-y-0',
  secondary: 'glass-panel-strong theme-text border hover:-translate-y-0.5 hover:shadow-soft active:translate-y-0',
  danger: 'bg-red-600 text-white border border-red-600 hover:-translate-y-0.5 hover:bg-red-700 hover:shadow-medium active:translate-y-0',
  ghost: 'bg-transparent theme-text-soft border theme-border hover:-translate-y-0.5 hover:bg-[var(--chip-bg)] active:translate-y-0',
};

const sizeStyles = {
  sm: 'px-3.5 py-2 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-6 py-3.5 text-base',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  className,
  disabled,
  children,
  ...props
}) => {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-2xl font-semibold tracking-[0.01em] transition-all duration-200 ease-in-out transform ${
        variantStyles[variant]
      } ${sizeStyles[size]} disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none ${className || ''}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <LoaderCircle className="h-4 w-4 animate-spin" />
          {children}
        </>
      ) : (
        <>
          {icon && <span>{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
};
