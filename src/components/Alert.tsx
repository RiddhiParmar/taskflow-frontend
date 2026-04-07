// src/components/Alert.tsx
import { AlertCircle, CheckCircle2, Info, X, AlertTriangle } from 'lucide-react';

interface AlertProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  onClose?: () => void;
  dismissible?: boolean;
}

const alertStyles = {
  success: 'border-emerald-200 bg-emerald-50/90 text-emerald-900',
  error: 'border-red-200 bg-red-50/90 text-red-900',
  warning: 'border-amber-200 bg-amber-50/90 text-amber-900',
  info: 'border-sky-200 bg-sky-50/90 text-sky-900',
};

const iconMarkup = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

export const Alert: React.FC<AlertProps> = ({
  type,
  message,
  onClose,
  dismissible = true,
}) => {
  const Icon = iconMarkup[type];

  return (
    <div
      className={`mb-4 flex items-start justify-between rounded-2xl border px-4 py-3 shadow-soft ${alertStyles[type]}`}
    >
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 h-5 w-5 shrink-0" />
        <p className="text-sm font-medium">{message}</p>
      </div>
      {dismissible && onClose && (
        <button
          onClick={onClose}
          className="ml-3 rounded-full p-1 opacity-70 transition hover:bg-black/5 hover:opacity-100"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};
