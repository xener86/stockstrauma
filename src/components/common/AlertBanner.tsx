// src/components/common/AlertBanner.tsx
import React from 'react';
import { Button } from './Button';

type AlertSeverity = 'info' | 'warning' | 'critical';

interface AlertBannerProps {
  title: string;
  message?: string;
  severity?: AlertSeverity;
  onDismiss?: () => void;
  onAction?: () => void;
  actionLabel?: string;
  className?: string;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({
  title,
  message,
  severity = 'info',
  onDismiss,
  onAction,
  actionLabel = 'Action',
  className = ''
}) => {
  // Style selon la sévérité
  const severityStyles = {
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-500',
      icon: '📋',
      title: 'text-blue-800',
      message: 'text-blue-700'
    },
    warning: {
      bg: 'bg-warning-50',
      border: 'border-warning-500',
      icon: '⚠️',
      title: 'text-warning-800',
      message: 'text-warning-700'
    },
    critical: {
      bg: 'bg-danger-50',
      border: 'border-danger-500',
      icon: '⚠️',
      title: 'text-danger-800',
      message: 'text-danger-700'
    }
  };

  const styles = severityStyles[severity];

  return (
    <div className={`${styles.bg} ${styles.border} border-l-4 p-4 rounded mb-6 flex items-start ${className}`}>
      <div className="flex-shrink-0 mr-3">
        <span className="text-xl">{styles.icon}</span>
      </div>
      <div className="flex-grow">
        <h3 className={`text-sm font-medium ${styles.title}`}>{title}</h3>
        {message && <p className={`text-sm mt-1 ${styles.message}`}>{message}</p>}
      </div>
      <div className="flex-shrink-0 flex space-x-2">
        {onAction && (
          <Button 
            variant="outline"
            size="sm"
            onClick={onAction}
          >
            {actionLabel}
          </Button>
        )}
        {onDismiss && (
          <button 
            className="text-gray-400 hover:text-gray-600"
            onClick={onDismiss}
            aria-label="Fermer"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};