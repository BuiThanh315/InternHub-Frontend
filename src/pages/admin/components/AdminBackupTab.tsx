import React, { useState, useEffect, useCallback } from 'react';
import {
  Database,
  RefreshCw,
  Play,
  FileArchive,
  CheckCircle2,
  AlertCircle,
  Download,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button, Alert, Skeleton, ConfirmModal } from '../../../components/common';
import { backupService } from '../../../services/backupService';
import { formatDateTime, formatFileSize } from '../../../utils/formatters';
import type { BackupHistoryItem } from '../../../types';
import styles from './AdminBackupTab.module.css';

export const AdminBackupTab: React.FC = () => {
  const [backups, setBackups] = useState<BackupHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [triggering, setTriggering] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Confirm delete modal state
  const [backupToDelete, setBackupToDelete] = useState<BackupHistoryItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadBackups = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      const res = await backupService.getBackups({ page: 0, size: 20 });
      setBackups(res.items || res.content || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể tải danh sách bản sao lưu từ máy chủ.';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBackups();
  }, [loadBackups]);

  const handleTriggerBackup = async () => {
    try {
      setTriggering(true);
      setErrorMessage(null);
      const newBackup = await backupService.triggerManualBackup();
      setBackups((prev) => [newBackup, ...prev]);
      toast.success(`Đã khởi tạo bản sao lưu thành công: ${newBackup.fileName}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể kích hoạt sao lưu thủ công';
      toast.error(msg);
    } finally {
      setTriggering(false);
    }
  };

  const handleDownloadBackup = async (b: BackupHistoryItem) => {
    try {
      setErrorMessage(null);
      await backupService.downloadBackup(b.id, b.fileName);
      toast.success(`Đang tải tệp sao lưu: ${b.fileName}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể tải tệp sao lưu từ máy chủ.';
      toast.error(msg);
    }
  };

  const executeDeleteBackup = async (b: BackupHistoryItem) => {
    try {
      setDeleting(true);
      setErrorMessage(null);
      await backupService.deleteBackup(b.id);
      setBackups((prev) => prev.filter((item) => item.id !== b.id));
      toast.success('Đã xóa bản sao lưu thành công khỏi máy chủ.');
      setBackupToDelete(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể xóa bản sao lưu từ máy chủ.';
      toast.error(msg);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="card">
      <div className={styles.headerRow}>
        <div>
          <h3 className={styles.titleWithIcon}>
            <Database size={20} color="var(--primary)" />
            Sao Lưu Dữ Liệu Hệ Thống Định Kỳ
          </h3>
          <p className={styles.subtitle}>
            Snapshot toàn bộ cơ sở dữ liệu MySQL, nén định dạng .sql.gz và tự động xoay vòng 30 ngày
          </p>
        </div>

        <div className={styles.actionGroup}>
          <Button
            variant="outline"
            size="sm"
            onClick={loadBackups}
            disabled={loading}
            title="Tải lại danh sách sao lưu"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            Làm mới
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleTriggerBackup}
            disabled={triggering}
            isLoading={triggering}
          >
            <Play size={16} />
            {triggering ? 'Đang sao lưu...' : 'Sao Lưu Ngay'}
          </Button>
        </div>
      </div>

      {errorMessage && (
        <Alert
          type="error"
          message={errorMessage}
          onClose={() => setErrorMessage(null)}
          className="mb-4"
        />
      )}

      {/* Backup Table */}
      <div className="table-container">
        <table className="modern-table">
          <thead>
            <tr>
              <th>Tên Tệp Sao Lưu</th>
              <th>Dung Lượng</th>
              <th>Loại</th>
              <th>Trạng Thái</th>
              <th>Thời Gian Thực Hiện</th>
              <th>Người Khởi Tạo</th>
              <th>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <tr key={`skeleton-${index}`}>
                  <td><Skeleton width="180px" height="18px" /></td>
                  <td><Skeleton width="70px" height="18px" /></td>
                  <td><Skeleton width="60px" height="24px" style={{ borderRadius: '12px' }} /></td>
                  <td><Skeleton width="90px" height="24px" style={{ borderRadius: '12px' }} /></td>
                  <td><Skeleton width="140px" height="18px" /></td>
                  <td><Skeleton width="100px" height="18px" /></td>
                  <td><Skeleton width="120px" height="30px" /></td>
                </tr>
              ))
            ) : backups.length === 0 ? (
              <tr>
                <td colSpan={7} className={styles.tableMessage}>
                  Chưa có bản ghi sao lưu nào trong hệ thống
                </td>
              </tr>
            ) : (
              backups.map((b) => (
                <tr key={b.id}>
                  <td>
                    <div className={styles.fileNameCell}>
                      <FileArchive size={16} color="var(--primary)" />
                      <span className={styles.fileNameText}>{b.fileName}</span>
                    </div>
                  </td>
                  <td className={styles.metaText}>{formatFileSize(b.fileSize)}</td>
                  <td>
                    <span className="badge badge-secondary">{b.backupType}</span>
                  </td>
                  <td>
                    {b.status === 'SUCCESS' ? (
                      <span className="badge badge-success">
                        <CheckCircle2 size={12} /> Thành Công
                      </span>
                    ) : (
                      <span className="badge badge-danger">
                        <AlertCircle size={12} /> Thất Bại
                      </span>
                    )}
                  </td>
                  <td className={styles.metaText}>{formatDateTime(b.createdAt)}</td>
                  <td className={styles.metaText}>{b.createdBy}</td>
                  <td>
                    <div className={styles.actions}>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadBackup(b)}
                        title="Tải tệp .sql.gz về máy"
                      >
                        <Download size={14} /> Tải
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => setBackupToDelete(b)}
                        title="Xóa bản sao lưu khỏi ổ đĩa"
                      >
                        <Trash2 size={14} /> Xóa
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Confirm Delete Modal */}
      {backupToDelete && (
        <ConfirmModal
          isOpen={!!backupToDelete}
          title="Xác nhận xóa bản sao lưu"
          message={`Bạn có chắc chắn muốn xóa bản sao lưu ${backupToDelete.fileName}? Thao tác này sẽ xóa vĩnh viễn tệp nén khỏi máy chủ và không thể hoàn tác.`}
          confirmText="Xóa Bản Sao Lưu"
          cancelText="Hủy Bỏ"
          variant="danger"
          isLoading={deleting}
          onConfirm={() => executeDeleteBackup(backupToDelete)}
          onClose={() => setBackupToDelete(null)}
        />
      )}
    </div>
  );
};

export default AdminBackupTab;
