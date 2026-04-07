// src/components/LoadingSpinner.tsx
import { LoaderCircle } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'h-8 w-8',
  md: 'h-12 w-12',
  lg: 'h-16 w-16',
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message, size = 'md' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="glass-panel flex items-center justify-center rounded-full p-4">
        <LoaderCircle className={`${sizeClasses[size]} animate-spin text-primary-600`} />
      </div>
      {message && (
        <p className="mt-5 text-center font-medium text-secondary-600 animate-pulse-slow">
          {message}
        </p>
      )}
    </div>
  );
};
