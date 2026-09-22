import React from 'react';
import { AlertCircle, CheckCircle, Info, TriangleAlert, X } from 'lucide-react';
import type { AlertProps } from './Alert.types';
import styles from './Alert.module.css';

export const Alert: React.FC<AlertProps> = ({
  type = 'info',
  title,
  message,
  children,
  onClose,
  className = '',
}) => {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={18} className={styles.icon} />;
      case 'error':
        return <AlertCircle size={18} className={styles.icon} />;
      case 'warning':
        return <TriangleAlert size={18} className={styles.icon} />;
      case 'info':
      default:
        return <Info size={18} className={styles.icon} />;
    }
  };

  return (
    <div className={`${styles.alert} ${styles[type]} ${className}`} role="alert">
      {getIcon()}
      <div className={styles.content}>
        {title && <div className={styles.title}>{title}</div>}
        {message && <div>{message}</div>}
        {children}
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className={styles.closeButton}
          aria-label="Đóng thông báo"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};
