import React, { useRef, useState, useEffect, useCallback } from 'react';
import { RotateCcw, PenTool, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import styles from './SignatureCanvasPad.module.css';

interface SignatureCanvasPadProps {
  onSignatureChange: (signatureData: string | null) => void;
  height?: number;
}

export const SignatureCanvasPad: React.FC<SignatureCanvasPadProps> = ({
  onSignatureChange,
  height = 190,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [strokeColor, setStrokeColor] = useState<'#1e3a8a' | '#0f172a'>('#1e3a8a'); // Mực Xanh Doanh Nghiệp hoặc Mực Đen Ký Kết

  // Tự động điều chỉnh kích thước Canvas theo đúng bề rộng thực tế của container (Responsive)
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const wrapper = containerRef.current;
    if (!canvas || !wrapper) return;

    const rect = wrapper.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const displayWidth = rect.width;

    // Lưu lại nét vẽ hiện tại trước khi resize nếu có
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    if (tempCtx && canvas.width > 0 && canvas.height > 0) {
      tempCtx.drawImage(canvas, 0, 0);
    }

    canvas.width = displayWidth * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${displayWidth}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Vẽ lại nét cũ
    if (tempCanvas.width > 0 && hasDrawn) {
      ctx.drawImage(tempCanvas, 0, 0, displayWidth, height);
    }
  }, [height, strokeColor, hasDrawn]);

  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [resizeCanvas]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.strokeStyle = strokeColor;
  }, [strokeColor]);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      const touch = e.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = (e?: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    if (e) e.preventDefault();
    setIsDrawing(false);

    const canvas = canvasRef.current;
    if (canvas && hasDrawn) {
      const dataUrl = canvas.toDataURL('image/png');
      onSignatureChange(dataUrl);
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
    onSignatureChange(null);
  };

  return (
    <div className={styles.container} ref={containerRef}>
      {/* Thanh công cụ bút vẽ */}
      <div className={styles.toolbar}>
        <div className={styles.toolTitle}>
          <PenTool size={14} className={styles.toolIcon} />
          <span>Bảng Ký Điện Tử Trực Quan</span>
        </div>
        <div className={styles.colorPicker}>
          <span className={styles.colorLabel}>Màu mực:</span>
          <button
            type="button"
            className={`${styles.colorBtn} ${strokeColor === '#1e3a8a' ? styles.colorActive : ''}`}
            onClick={() => setStrokeColor('#1e3a8a')}
            title="Mực Xanh Doanh Nghiệp (Khuyến nghị)"
          >
            <span className={styles.blueDot} />
            <span>Xanh</span>
          </button>
          <button
            type="button"
            className={`${styles.colorBtn} ${strokeColor === '#0f172a' ? styles.colorActive : ''}`}
            onClick={() => setStrokeColor('#0f172a')}
            title="Mực Đen Ký Kết"
          >
            <span className={styles.blackDot} />
            <span>Đen</span>
          </button>
        </div>
      </div>

      {/* Vùng vẽ Canvas */}
      <div className={`${styles.canvasWrapper} ${hasDrawn ? styles.canvasWrapperActive : ''}`}>
        <canvas
          ref={canvasRef}
          className={styles.canvas}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />

        {/* Đường mờ hướng dẫn vị trí đặt bút */}
        <div className={styles.baselineGuide} />

        {!hasDrawn && (
          <div className={styles.guideline}>
            <Sparkles size={16} className={styles.guideIcon} />
            <span>Vẽ hoặc chạm ngón tay vào đây để ký tên</span>
          </div>
        )}
      </div>

      {/* Thanh chân trang điều khiển & chứng nhận */}
      <div className={styles.actions}>
        <button
          type="button"
          onClick={clearSignature}
          className={styles.clearBtn}
          disabled={!hasDrawn}
        >
          <RotateCcw size={13} />
          <span>Ký lại</span>
        </button>

        <div className={styles.statusInfo}>
          {hasDrawn ? (
            <span className={styles.badgeSuccess}>
              <CheckCircle2 size={13} />
              <span>Đã ghi nhận chữ ký</span>
            </span>
          ) : (
            <span className={styles.badgePending}>
              <ShieldCheck size={13} />
              <span>Chưa có chữ ký</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
