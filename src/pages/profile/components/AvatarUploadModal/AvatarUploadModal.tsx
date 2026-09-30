import React, { useState, useRef } from 'react';
import { UploadCloud, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Modal, Button } from '../../../../components/common';
import { profileService, validateImageMagicBytes } from '../../../../services/profileService';
import { useAuth } from '../../../../contexts/AuthContext';
import { getAvatarUrl } from '../../../../utils/avatar';
import type { AvatarUploadModalProps } from './AvatarUploadModal.types';
import styles from './AvatarUploadModal.module.css';

export const AvatarUploadModal: React.FC<AvatarUploadModalProps> = ({
  isOpen,
  onClose,
  currentAvatarUrl,
  userId,
  onAvatarUpdated,
}) => {
  const { updateUserAvatar } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [zoomScale, setZoomScale] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const defaultAvatar = getAvatarUrl({ avatarUrl: currentAvatarUrl, id: userId });

  const resetState = () => {
    setSelectedFile(null);
    setPreviewSrc(null);
    setZoomScale(1);
    setErrorMessage(null);
    setIsSubmitting(false);
  };

  const handleClose = () => {
    if (isSubmitting) return;
    resetState();
    onClose();
  };

  const handleFileProcess = async (file: File) => {
    setErrorMessage(null);

    // 1. Kiểm tra dung lượng (< 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Dung lượng tệp ảnh không được vượt quá 5MB.');
      return;
    }

    // 2. Kiểm tra Magic Bytes thật của file
    const isValidMagic = await validateImageMagicBytes(file);
    if (!isValidMagic) {
      setErrorMessage('Định dạng tệp không hợp lệ. Vui lòng chọn ảnh định dạng JPEG, PNG hoặc WebP.');
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewSrc(objectUrl);
    setZoomScale(1);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileProcess(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleSaveAvatar = async () => {
    if (!selectedFile) {
      setErrorMessage('Vui lòng chọn một tệp ảnh đại diện.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      // Bước 1: Xin Presigned Upload URL từ identity-service
      const { presignedUrl, avatarKey } = await profileService.requestAvatarUploadUrl(selectedFile);

      // Bước 2: Tải binary trực tiếp lên S3/MinIO
      await profileService.uploadBinaryToS3(presignedUrl, selectedFile);

      // Bước 3: Xác nhận đổi avatar và nhận URL kèm Cache-Busting query
      const { avatarUrl } = await profileService.confirmAvatarUpdate(avatarKey);

      // Bước 4: Thêm timestamp cache-busting để trình duyệt tự refresh ảnh mới
      const finalAvatarUrl = avatarUrl.includes('?') 
        ? `${avatarUrl}&v=${Date.now()}` 
        : `${avatarUrl}?v=${Date.now()}`;

      // Bước 5: Cập nhật AuthContext và callback
      updateUserAvatar(finalAvatarUrl);
      onAvatarUpdated(finalAvatarUrl);

      toast.success('Ảnh đại diện đã được cập nhật thành công!');
      handleClose();
    } catch (err: unknown) {
      console.error('Lỗi tải ảnh đại diện:', err);
      const msg = err instanceof Error ? err.message : 'Không thể lưu ảnh đại diện. Vui lòng thử lại.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Cập Nhật Ảnh Đại Diện Cá Nhân"
      size="md"
      footer={
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', width: '100%' }}>
          <Button variant="secondary" onClick={handleClose} disabled={isSubmitting}>
            Hủy Bỏ
          </Button>
          <Button
            variant="primary"
            onClick={handleSaveAvatar}
            isLoading={isSubmitting}
            disabled={!selectedFile || isSubmitting}
          >
            Lưu Ảnh Đại Diện
          </Button>
        </div>
      }
    >
      <div className={styles.container}>
        {errorMessage && (
          <div className={styles.errorBanner} role="alert">
            <AlertCircle size={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Khung tròn xem trước avatar */}
        <div className={styles.previewCircleContainer}>
          <img
            src={previewSrc || defaultAvatar}
            alt="Xem trước ảnh đại diện"
            className={styles.previewImage}
            style={{ transform: `scale(${zoomScale})` }}
          />
        </div>

        {/* Thanh trượt Zoom khi đã chọn ảnh */}
        {previewSrc && (
          <div className={styles.zoomControl}>
            <div className={styles.zoomLabelRow}>
              <span>Thu phóng ảnh</span>
              <span>{Math.round(zoomScale * 100)}%</span>
            </div>
            <input
              type="range"
              min="1"
              max="2.5"
              step="0.05"
              value={zoomScale}
              onChange={(e) => setZoomScale(parseFloat(e.target.value))}
              className={styles.zoomSlider}
              aria-label="Thanh trượt phóng to thu nhỏ ảnh đại diện"
            />
          </div>
        )}

        {/* Khu vực chọn / Kéo thả tệp */}
        <div
          className={`${styles.dropZone} ${isDragging ? styles.dropZoneActive : ''}`}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          aria-label="Khu vực tải lên tệp ảnh đại diện"
        >
          <UploadCloud size={32} className={styles.uploadIcon} />
          <p className={styles.dropText}>
            {selectedFile ? `Đã chọn: ${selectedFile.name}` : 'Nhấp để chọn ảnh hoặc kéo thả vào đây'}
          </p>
          <p className={styles.dropHint}>Định dạng hỗ trợ: JPG, PNG, WebP (Tối đa 5MB)</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className={styles.hiddenInput}
            onChange={handleFileChange}
          />
        </div>
      </div>
    </Modal>
  );
};

export default AvatarUploadModal;
