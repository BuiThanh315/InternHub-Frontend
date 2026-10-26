import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Activity,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles,
  Database,
  ShieldAlert,
  Server,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import { auditLogService } from '../../../services/auditLogService';
import type { User, AuditLogStats, AuditLogItem } from '../../../types';
import styles from './AdminAnalyticsHub.module.css';

interface AdminAnalyticsHubProps {
  users: User[];
  onRefreshUsers?: () => void;
}

export const AdminAnalyticsHub: React.FC<AdminAnalyticsHubProps> = ({ users }) => {
  const [auditStats, setAuditStats] = useState<AuditLogStats | null>(null);
  const [recentAudits, setRecentAudits] = useState<AuditLogItem[]>([]);
  const [loadingStats, setLoadingStats] = useState(false);

  // Fetch dữ liệu audit thực tế từ backend reporting service
  const fetchAuditData = useCallback(async () => {
    try {
      setLoadingStats(true);
      const [statsRes, logsRes] = await Promise.allSettled([
        auditLogService.getAuditStatistics(),
        auditLogService.getAuditLogs({ page: 0, size: 8 }),
      ]);

      if (statsRes.status === 'fulfilled') {
        setAuditStats(statsRes.value);
      }
      if (logsRes.status === 'fulfilled') {
        setRecentAudits(logsRes.value.items || logsRes.value.content || []);
      }
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu thống kê Admin Dashboard:', err);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  useEffect(() => {
    fetchAuditData();
  }, [fetchAuditData]);

  // Thống kê người dùng theo vai trò (hỗ trợ cả ADMIN/Admin, MENTOR/Mentor,...)
  const totalUsers = users.length;
  const adminCount = users.filter((u) => u.role?.toUpperCase() === 'ADMIN').length;
  const hrCount = users.filter((u) => u.role?.toUpperCase() === 'HR').length;
  const mentorCount = users.filter((u) => u.role?.toUpperCase() === 'MENTOR').length;
  const internCount = users.filter((u) => {
    const r = u.role?.toUpperCase();
    return r === 'INTERN' || !['ADMIN', 'HR', 'MENTOR'].includes(r || '');
  }).length;

  const activeUsers = users.filter((u) => u.status === 'ACTIVE' || (u as any).active === true).length;
  const inactiveUsers = totalUsers - activeUsers;

  // Tỷ lệ phần trăm chính xác (tổng các phần chiếm đúng tỷ lệ hoặc 0% nếu count = 0)
  const hrPercent = totalUsers ? Math.round((hrCount / totalUsers) * 100) : 0;
  const mentorPercent = totalUsers ? Math.round((mentorCount / totalUsers) * 100) : 0;
  const internPercent = totalUsers ? Math.round((internCount / totalUsers) * 100) : 0;
  const adminPercent = totalUsers ? Math.round((adminCount / totalUsers) * 100) : 0;

  // Lọc các sự kiện cần xử lý / chú ý (Cảnh báo an ninh, lỗi thao tác)
  const failedEvents = recentAudits.filter(
    (log) => log.status === 'FAILED' || log.action?.includes('FAILED')
  );

  return (
    <div className={styles.hubWrapper}>
      {/* 1. HÀNG THẺ KPI TỔNG THỂ */}
      <div className={styles.kpiRow}>
        <div className={`card ${styles.kpiCard}`}>
          <div className={`${styles.kpiIconBox} ${styles.iconTotal}`}>
            <Users size={22} />
          </div>
          <div className={styles.kpiContent}>
            <span className={styles.kpiSub}>Tổng Tài Khoản</span>
            <div className={styles.kpiValueRow}>
              <span className={styles.kpiMainValue}>{totalUsers}</span>
              <span className={styles.kpiBadgeActive}>{activeUsers} Đang Hoạt Động</span>
            </div>
          </div>
        </div>

        <div className={`card ${styles.kpiCard}`}>
          <div className={`${styles.kpiIconBox} ${styles.iconToday}`}>
            <Activity size={22} />
          </div>
          <div className={styles.kpiContent}>
            <span className={styles.kpiSub}>Hoạt Động Hôm Nay</span>
            <div className={styles.kpiValueRow}>
              <span className={styles.kpiMainValue}>
                {loadingStats ? '...' : auditStats?.totalToday ?? recentAudits.length}
              </span>
              <span className={styles.kpiBadgeSuccess}>
                {auditStats?.successRate ? `${auditStats.successRate}% Thành công` : 'Bình thường'}
              </span>
            </div>
          </div>
        </div>

        <div className={`card ${styles.kpiCard}`}>
          <div className={`${styles.kpiIconBox} ${styles.iconAlert}`}>
            <AlertTriangle size={22} />
          </div>
          <div className={styles.kpiContent}>
            <span className={styles.kpiSub}>Cảnh Báo An Ninh / Lỗi</span>
            <div className={styles.kpiValueRow}>
              <span className={styles.kpiMainValue}>
                {loadingStats ? '...' : auditStats?.totalFailed ?? failedEvents.length}
              </span>
              <span className={styles.kpiBadgeWarning}>Cần Chú Ý</span>
            </div>
          </div>
        </div>

        <div className={`card ${styles.kpiCard}`}>
          <div className={`${styles.kpiIconBox} ${styles.iconHealth}`}>
            <Server size={22} />
          </div>
          <div className={styles.kpiContent}>
            <span className={styles.kpiSub}>Trạng Thái Cụm Dịch Vụ</span>
            <div className={styles.kpiValueRow}>
              <span className={styles.kpiHealthStatus}>Trực Tuyến</span>
              <Link to="/admin/system" className={styles.healthLink}>
                Chi tiết <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 2. KHU VỰC BIỂU ĐỒ & PHÂN TÍCH CHUYÊN SÂU */}
      <div className={styles.analysisGrid}>
        {/* Biểu đồ 1: Cơ Cấu Vai Trò & Phân Bổ Người Dùng */}
        <div className={`card ${styles.panelCard}`}>
          <div className={styles.panelHeader}>
            <div className={styles.panelTitleGroup}>
              <Users size={18} className={styles.headerIconBlue} />
              <h3 className={styles.panelTitle}>Cơ Cấu Tài Khoản & Vai Trò</h3>
            </div>
            <Link to="/admin/users" className={styles.panelActionBtn}>
              Quản lý <ArrowRight size={13} />
            </Link>
          </div>

          <div className={styles.barStackWrapper}>
            <div className={styles.barStack}>
              {internPercent > 0 && (
                <div
                  className={styles.barIntern}
                  style={{ width: `${internPercent}%` }}
                  title={`Thực tập sinh: ${internCount} (${internPercent}%)`}
                />
              )}
              {mentorPercent > 0 && (
                <div
                  className={styles.barMentor}
                  style={{ width: `${mentorPercent}%` }}
                  title={`Mentor: ${mentorCount} (${mentorPercent}%)`}
                />
              )}
              {hrPercent > 0 && (
                <div
                  className={styles.barHr}
                  style={{ width: `${hrPercent}%` }}
                  title={`Nhân sự HR: ${hrCount} (${hrPercent}%)`}
                />
              )}
              {adminPercent > 0 && (
                <div
                  className={styles.barAdmin}
                  style={{ width: `${adminPercent}%` }}
                  title={`Quản trị viên: ${adminCount} (${adminPercent}%)`}
                />
              )}
            </div>

            <div className={styles.legendGrid}>
              <div className={styles.legendItem}>
                <div className={`${styles.legendDot} ${styles.dotIntern}`} />
                <div className={styles.legendText}>
                  <span className={styles.legendLabel}>Thực tập sinh</span>
                  <span className={styles.legendVal}>{internCount} ({internPercent}%)</span>
                </div>
              </div>

              <div className={styles.legendItem}>
                <div className={`${styles.legendDot} ${styles.dotMentor}`} />
                <div className={styles.legendText}>
                  <span className={styles.legendLabel}>Mentor</span>
                  <span className={styles.legendVal}>{mentorCount} ({mentorPercent}%)</span>
                </div>
              </div>

              <div className={styles.legendItem}>
                <div className={`${styles.legendDot} ${styles.dotHr}`} />
                <div className={styles.legendText}>
                  <span className={styles.legendLabel}>Nhân sự (HR)</span>
                  <span className={styles.legendVal}>{hrCount} ({hrPercent}%)</span>
                </div>
              </div>

              <div className={styles.legendItem}>
                <div className={`${styles.legendDot} ${styles.dotAdmin}`} />
                <div className={styles.legendText}>
                  <span className={styles.legendLabel}>Quản trị viên</span>
                  <span className={styles.legendVal}>{adminCount} ({adminPercent}%)</span>
                </div>
              </div>
            </div>

            <div className={styles.statusSubDivider}>
              <div className={styles.statusSummaryItem}>
                <span className={styles.statusLabel}>Trạng thái kích hoạt:</span>
                <span className={styles.statusActiveBadge}>
                  <CheckCircle2 size={13} /> {activeUsers} Đang hoạt động
                </span>
                {inactiveUsers > 0 && (
                  <span className={styles.statusInactiveBadge}>
                    <Lock size={13} /> {inactiveUsers} Đã khóa/Chưa kích hoạt
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Biểu đồ 2: Dòng Nhật Ký Hoạt Động & Sự Kiện An Ninh Gần Nhất */}
        <div className={`card ${styles.panelCard}`}>
          <div className={styles.panelHeader}>
            <div className={styles.panelTitleGroup}>
              <TrendingUp size={18} className={styles.headerIconGreen} />
              <h3 className={styles.panelTitle}>Sự Kiện Đăng Nhập & Kiểm Toán Hệ Thống</h3>
            </div>
            <Link to="/admin/system" className={styles.panelActionBtn}>
              Xem tất cả <ArrowRight size={13} />
            </Link>
          </div>

          <div className={styles.activityFeed}>
            {recentAudits.length === 0 ? (
              <div className={styles.emptyFeed}>
                <Clock size={24} className={styles.emptyIcon} />
                <p>Chưa có sự kiện kiểm toán mới trong phiên làm việc này</p>
              </div>
            ) : (
              recentAudits.slice(0, 5).map((log) => {
                const isSuccess = log.status === 'SUCCESS';
                return (
                  <div key={log.id} className={styles.feedRow}>
                    <div
                      className={`${styles.feedStatusIndicator} ${
                        isSuccess ? styles.statusIndicatorSuccess : styles.statusIndicatorFail
                      }`}
                    />
                    <div className={styles.feedMain}>
                      <div className={styles.feedActionLine}>
                        <span className={styles.feedActor}>{log.username || 'Hệ thống'}</span>
                        <span className={styles.feedAction}>{log.action || 'THỰC THI'}</span>
                        <span className={styles.feedModuleBadge}>{log.module || 'SYSTEM'}</span>
                      </div>
                      <p className={styles.feedDesc}>{log.description || 'Thao tác nghiệp vụ hệ thống'}</p>
                    </div>
                    <span className={styles.feedTime}>
                      {log.createdAt ? new Date(log.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : 'Vừa xong'}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* 3. KHỐI TÁC VỤ "CẦN XỬ LÝ & ĐIỀU HƯỚNG CHUYÊN TRÁCH" */}
      <div className={styles.actionsSection}>
        <div className={styles.sectionHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={18} color="var(--primary)" />
            <h3 className={styles.sectionTitle}>Trung Tâm Điều Hành & Vấn Đề Cần Xử Lý</h3>
          </div>
          <span className={styles.sectionSubtitle}>Dẫn lối nhanh đến các phân hệ quản trị lõi</span>
        </div>

        <div className={styles.actionCardsGrid}>
          {/* Card 1: Quản trị tài khoản & Reset Password */}
          <Link to="/admin/users" className={styles.actionCard}>
            <div className={`${styles.actionIcon} ${styles.actionIconUsers}`}>
              <Users size={22} />
            </div>
            <div className={styles.actionInfo}>
              <div className={styles.actionTopRow}>
                <h4 className={styles.actionTitle}>Quản Lý Tài Khoản</h4>
                {inactiveUsers > 0 && (
                  <span className={styles.actionAlertBadge}>{inactiveUsers} Chưa duyệt/Khóa</span>
                )}
              </div>
              <p className={styles.actionDesc}>
                Phân bổ vai trò (Role), đặt lại mật khẩu về mặc định và quản lý trạng thái tài khoản.
              </p>
            </div>
            <ArrowRight size={16} className={styles.actionArrow} />
          </Link>

          {/* Card 2: Ma trận phân quyền 53 quyền */}
          <Link to="/admin/roles" className={styles.actionCard}>
            <div className={`${styles.actionIcon} ${styles.actionIconRoles}`}>
              <ShieldAlert size={22} />
            </div>
            <div className={styles.actionInfo}>
              <div className={styles.actionTopRow}>
                <h4 className={styles.actionTitle}>Phân Quyền & Vai Trò</h4>
                <span className={styles.actionStandardBadge}>53 Đặc Quyền</span>
              </div>
              <p className={styles.actionDesc}>
                Điều chỉnh ma trận quyền RBAC, kiểm soát phân quyền chặt chẽ giữa IT và Nhân sự.
              </p>
            </div>
            <ArrowRight size={16} className={styles.actionArrow} />
          </Link>

          {/* Card 3: Giám sát dịch vụ & Sao lưu MinIO S3 */}
          <Link to="/admin/system" className={styles.actionCard}>
            <div className={`${styles.actionIcon} ${styles.actionIconSystem}`}>
              <Database size={22} />
            </div>
            <div className={styles.actionInfo}>
              <div className={styles.actionTopRow}>
                <h4 className={styles.actionTitle}>Giám Sát Microservices & Sao Lưu</h4>
                <span className={styles.actionOkBadge}>MinIO S3 Ready</span>
              </div>
              <p className={styles.actionDesc}>
                Kiểm tra sức khỏe cụm Microservices, cấu hình snapshot MySQL và sao lưu tài liệu S3.
              </p>
            </div>
            <ArrowRight size={16} className={styles.actionArrow} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalyticsHub;
