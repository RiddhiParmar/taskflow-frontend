// src/components/Input.tsx
import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className, ...props }, ref) => {
    return (
      <div className="mb-4">
        {label && (
          <label className="mb-2 block text-sm font-semibold theme-text-soft">{label}</label>
        )}
        <input
          ref={ref}
          className={`theme-input w-full rounded-2xl border px-4 py-3.5 outline-none transition-all duration-200 ${
            error
              ? 'border-red-300 bg-red-50/80 focus:border-red-400 focus:ring-4 focus:ring-red-100'
              : 'focus:border-primary-400 focus:ring-4 focus:ring-primary-100'
          } ${className || ''}`}
          {...props}
        />
        {error && <p className="mt-2 text-sm font-medium text-red-600">{error}</p>}
        {helperText && !error && <p className="mt-2 text-sm theme-text-muted">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
