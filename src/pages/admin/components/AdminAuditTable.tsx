import React from 'react';
import { RefreshCw, CheckCircle2, AlertCircle, Eye } from 'lucide-react';

import { Button } from '../../../components/common/Button/Button';
import { formatDateTime } from '../../../utils/formatters';
import type { AuditLogItem } from '../../../types';
import styles from './AdminAuditTable.module.css';

interface AdminAuditTableProps {
  logs: AuditLogItem[];
  loading: boolean;
  onOpenDetail: (id: number) => void;
}

export const AdminAuditTable: React.FC<AdminAuditTableProps> = ({
  logs,
  loading,
  onOpenDetail,
}) => {
  const getModuleBadgeClass = (module: string) => {
    switch (module) {
      case 'AUTH': return 'badge-warning';
      case 'INTERN': return 'badge-primary';
      case 'DOCUMENT': return 'badge-info';
      case 'SYSTEM': return 'badge-danger';
      case 'USER': return 'badge-success';
      default: return 'badge-secondary';
    }
  };

  return (
    <div className="table-container">
      <table className="modern-table">
        <thead>
          <tr>
            <th>Thời Gian</th>
            <th>Người Thực Hiện</th>
            <th>Phân Hệ</th>
            <th>Hành Động</th>
            <th>Mô Tả Chi Tiết</th>
            <th>IP Máy Trạm</th>
            <th>Trạng Thái</th>
            <th>Thao Tác</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={8} className={styles.tableMessage}>
                <RefreshCw size={20} className="animate-spin" style={{ margin: '0 auto 0.5rem auto' }} />
                <p style={{ margin: 0 }}>Đang tải dữ liệu nhật ký hoạt động từ Backend...</p>
              </td>
            </tr>
          ) : logs.length === 0 ? (
            <tr>
              <td colSpan={8} className={styles.tableMessage}>
                Không tìm thấy bản ghi nhật ký nào phù hợp với bộ lọc hiện tại
              </td>
            </tr>
          ) : (
            logs.map((log) => (
              <tr key={log.id}>
                <td className={styles.dateCell}>{formatDateTime(log.createdAt)}</td>
                <td>
                  <div className={styles.userCell}>{log.username}</div>
                  {log.userRole && <span className={styles.roleSub}>({log.userRole})</span>}
                </td>
                <td>
                  <span className={`badge ${getModuleBadgeClass(log.module)}`}>
                    {log.module}
                  </span>
                </td>
                <td>
                  <span className={styles.actionMono}>{log.action}</span>
                </td>
                <td className={styles.descCell}>
                  <div className={styles.descText} title={log.description}>
                    {log.description}
                  </div>
                  <span className={styles.endpointSub}>
                    {log.httpMethod} {log.endpoint}
                  </span>
                </td>
                <td className={styles.ipCell}>{log.clientIp || '127.0.0.1'}</td>
                <td>
                  {log.status === 'SUCCESS' ? (
                    <span className="badge badge-success">
                      <CheckCircle2 size={12} /> Thành Công
                    </span>
                  ) : (
                    <span className="badge badge-danger">
                      <AlertCircle size={12} /> Thất Bại
                    </span>
                  )}
                </td>
                <td>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onOpenDetail(log.id)}
                    title="Xem chi tiết sự kiện"
                  >
                    <Eye size={14} />
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AdminAuditTable;
