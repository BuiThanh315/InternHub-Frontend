import { Component, type ErrorInfo } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import type { ErrorBoundaryProps, ErrorBoundaryState } from './ErrorBoundary.types';
import { Button } from '../Button/Button';
import styles from './ErrorBoundary.module.css';

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    if (this.props.onReset) {
      this.props.onReset();
    } else {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className={styles.container}>
          <div className={styles.iconWrapper}>
            <AlertTriangle size={32} />
          </div>
          <h3 className={styles.title}>
            {this.props.fallbackTitle || 'Đã có sự cố hiển thị ở khu vực này'}
          </h3>
          <p className={styles.message}>
            {this.props.fallbackMessage ||
              'Một lỗi không mong muốn đã xảy ra khi dựng giao diện. Bạn có thể nhấn nút thử lại bên dưới.'}
          </p>

          <Button variant="primary" leftIcon={<RefreshCw size={16} />} onClick={this.handleReset}>
            Thử lại
          </Button>

          {import.meta.env.DEV && this.state.error && (
            <pre className={styles.details}>{this.state.error.stack || this.state.error.message}</pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
