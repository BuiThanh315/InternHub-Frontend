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

import { Button } from '../../../components/common/Button/Button';
import { Alert } from '../../../components/common/Alert/Alert';
import { backupService } from '../../../services/backupService';
import { formatDateTime, formatFileSize } from '../../../utils/formatters';
import type { BackupHistoryItem } from '../../../types';
import styles from './AdminBackupTab.module.css';

export const AdminBackupTab: React.FC = () => {
  const [backups, setBackups] = useState<BackupHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [triggering, setTriggering] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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
      setSuccessMessage(null);
      const newBackup = await backupService.triggerManualBackup();
      setBackups((prev) => [newBackup, ...prev]);
      setSuccessMessage(`Đã khởi tạo bản sao lưu thành công: ${newBackup.fileName}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể kích hoạt sao lưu thủ công';
      setErrorMessage(msg);
    } finally {
      setTriggering(false);
    }
  };

  const handleDownloadBackup = async (b: BackupHistoryItem) => {
    try {
      setErrorMessage(null);
      await backupService.downloadBackup(b.id, b.fileName);
      setSuccessMessage(`Đang tải tệp sao lưu: ${b.fileName}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể tải tệp sao lưu từ máy chủ.';
      setErrorMessage(msg);
    }
  };

  const handleDeleteBackup = async (id: number) => {
    const isConfirmed = window.confirm('Bạn có chắc chắn muốn xóa bản sao lưu này? Thao tác này không thể hoàn tác.');
    if (!isConfirmed) return;

    try {
      setErrorMessage(null);
      await backupService.deleteBackup(id);
      setBackups((prev) => prev.filter((b) => b.id !== id));
      setSuccessMessage('Đã xóa bản sao lưu thành công khỏi máy chủ.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể xóa bản sao lưu từ máy chủ.';
      setErrorMessage(msg);
    }
  };

  return (
    <div className="card">
      <div className={styles.headerRow}>
        <div>
          <h3 className={styles.titleWithIcon}>
            <Database size={20} color="var(--primary)" />
            Sao Lưu Dữ Liệu Hệ Thống Định Kỳ (TM-8)
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
          >
            <Play size={16} />
            {triggering ? 'Đang sao lưu...' : 'Sao Lưu Ngay'}
          </Button>
        </div>
      </div>

      {successMessage && (
        <Alert
          type="success"
          message={successMessage}
          onClose={() => setSuccessMessage(null)}
        />
      )}

      {errorMessage && (
        <Alert
          type="error"
          message={errorMessage}
          onClose={() => setErrorMessage(null)}
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
              <tr>
                <td colSpan={7} className={styles.tableMessage}>
                  Đang tải danh sách bản sao lưu từ API Backend...
                </td>
              </tr>
            ) : backups.length === 0 ? (
              <tr>
                <td colSpan={7} className={styles.tableMessage}>
                  Chưa có bản sao lưu nào trong hệ thống
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
                  <td className={styles.sizeText}>
                    {b.formattedSize || formatFileSize(b.fileSize)}
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        b.backupType === 'AUTOMATIC' ? 'badge-info' : 'badge-primary'
                      }`}
                    >
                      {b.backupType === 'AUTOMATIC' ? 'Tự Động' : 'Thủ Công'}
                    </span>
                  </td>
                  <td>
                    {b.status === 'SUCCESS' && (
                      <span className="badge badge-success">
                        <CheckCircle2 size={12} /> Thành Công
                      </span>
                    )}
                    {b.status === 'IN_PROGRESS' && (
                      <span className="badge badge-warning">
                        <RefreshCw size={12} className="animate-spin" /> Đang Chạy
                      </span>
                    )}
                    {b.status === 'FAILED' && (
                      <span className="badge badge-danger">
                        <AlertCircle size={12} /> Thất Bại
                      </span>
                    )}
                  </td>
                  <td>
                    <div className={styles.dateText}>{formatDateTime(b.createdAt)}</div>
                    {b.durationMs && (
                      <span className={styles.durationText}>
                        Thời gian chạy: {(b.durationMs / 1000).toFixed(2)}s
                      </span>
                    )}
                  </td>
                  <td className={styles.creatorText}>{b.createdBy}</td>
                  <td>
                    <div className={styles.actionButtons}>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadBackup(b)}
                        disabled={b.status !== 'SUCCESS'}
                        title="Tải tệp .sql.gz"
                      >
                        <Download size={14} />
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDeleteBackup(b.id)}
                        title="Xóa bản sao lưu"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminBackupTab;
