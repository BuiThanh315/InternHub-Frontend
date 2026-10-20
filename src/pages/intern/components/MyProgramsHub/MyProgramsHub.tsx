import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Calendar,
  UserCheck,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Plus,
  Sparkles,
  Award,
  Layers,
  Hash,
  GraduationCap,
} from 'lucide-react';
import type { InternProfile, InternStatus } from '../../../../types';
import { ROUTES } from '../../../../constants/routes';
import { internService } from '../../../../services/internService';
import styles from './MyProgramsHub.module.css';

interface MyProgramsHubProps {
  profiles: InternProfile[];
  onSelectProgram: (programId: number) => void;
}

type FilterTab = 'ALL' | 'INTERNING' | 'PENDING' | 'COMPLETED';

export const MyProgramsHub: React.FC<MyProgramsHubProps> = ({ profiles, onSelectProgram }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<FilterTab>('ALL');

  // Thống kê nhanh
  const stats = useMemo(() => {
    let interning = 0;
    let pending = 0;
    let completed = 0;

    profiles.forEach((p) => {
      if (p.status === 'INTERNING') interning++;
      else if (p.status === 'PENDING' || p.status === 'APPROVED') pending++;
      else if (p.status === 'COMPLETED') completed++;
    });

    return { interning, pending, completed, total: profiles.length };
  }, [profiles]);

  // Bộ lọc danh sách
  const filteredProfiles = useMemo(() => {
    if (activeTab === 'ALL') return profiles;
    if (activeTab === 'INTERNING') return profiles.filter((p) => p.status === 'INTERNING');
    if (activeTab === 'PENDING')
      return profiles.filter((p) => p.status === 'PENDING' || p.status === 'APPROVED');
    if (activeTab === 'COMPLETED') return profiles.filter((p) => p.status === 'COMPLETED');
    return profiles;
  }, [profiles, activeTab]);

  const getStatusConfig = (status: InternStatus) => {
    switch (status) {
      case 'INTERNING':
        return {
          label: 'Đang Thực Tập',
          pillClass: `${styles.statusPill} ${styles.interning}`,
          cardTheme: styles.statusInterning,
          actionClass: `${styles.actionBtn} ${styles.interning}`,
          actionText: 'Vào Workspace Làm Việc',
          icon: <span className={styles.pulsingDot} />,
        };
      case 'APPROVED':
        return {
          label: 'Đã Duyệt Hồ Sơ',
          pillClass: `${styles.statusPill} ${styles.approved}`,
          cardTheme: styles.statusApproved,
          actionClass: `${styles.actionBtn} ${styles.approved}`,
          actionText: 'Ký Hợp Đồng & Hoàn Tất',
          icon: <CheckCircle2 size={13} />,
        };
      case 'PENDING':
        return {
          label: 'Chờ Thẩm Định',
          pillClass: `${styles.statusPill} ${styles.pending}`,
          cardTheme: styles.statusPending,
          actionClass: `${styles.actionBtn} ${styles.pending}`,
          actionText: 'Theo Dõi Tiến Độ & Bổ Sung',
          icon: <Clock size={13} />,
        };
      case 'COMPLETED':
        return {
          label: 'Đã Hoàn Thành',
          pillClass: `${styles.statusPill} ${styles.completed}`,
          cardTheme: styles.statusCompleted,
          actionClass: `${styles.actionBtn} ${styles.default}`,
          actionText: 'Xem Báo Cáo & Chứng Nhận',
          icon: <Award size={13} />,
        };
      case 'REJECTED':
        return {
          label: 'Không Tiếp Nhận',
          pillClass: `${styles.statusPill} ${styles.rejected}`,
          cardTheme: styles.statusRejected,
          actionClass: `${styles.actionBtn} ${styles.default}`,
          actionText: 'Xem Lý Do & Tra Cứu',
          icon: <AlertTriangle size={13} />,
        };
      default:
        return {
          label: status,
          pillClass: `${styles.statusPill} ${styles.completed}`,
          cardTheme: '',
          actionClass: `${styles.actionBtn} ${styles.default}`,
          actionText: 'Xem Chi Tiết Kỳ Thực Tập',
          icon: <Layers size={13} />,
        };
    }
  };

  const formatDateRange = (start?: string, end?: string) => {
    if (!start) return 'Thời gian linh hoạt';
    const s = new Date(start).toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' });
    const e = end
      ? new Date(end).toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' })
      : 'Hiện tại';
    return `${s} - ${e}`;
  };

  return (
    <div className={styles.hubContainer}>
      {/* Hero Banner */}
      <div className={styles.heroBanner}>
        <div className={styles.heroContent}>
          <div className={styles.heroEyebrow}>
            <Sparkles size={16} />
            <span>Trung Tâm Kỳ Thực Tập Đa Nhiệm (Multi-Program Hub)</span>
          </div>
          <h2 className={styles.heroTitle}>Kỳ Thực Tập Của Tôi</h2>
          <p className={styles.heroSubtitle}>
            Hệ thống hỗ trợ tham gia đồng thời nhiều chương trình đào tạo &amp; dự án. Nhấn vào từng
            thẻ chương trình để mở không gian làm việc hoặc theo dõi tiến trình phê duyệt hồ sơ.
          </p>
        </div>

        <div className={styles.heroStats}>
          <div className={styles.statBox}>
            <div className={`${styles.statNumber} ${styles.active}`}>{stats.interning}</div>
            <div className={styles.statLabel}>Đang thực tập</div>
          </div>
          <div className={styles.statBox}>
            <div className={`${styles.statNumber} ${styles.pending}`}>{stats.pending}</div>
            <div className={styles.statLabel}>Đang xét duyệt</div>
          </div>
          <div className={styles.statBox}>
            <div className={styles.statNumber}>{stats.total}</div>
            <div className={styles.statLabel}>Tổng chương trình</div>
          </div>
        </div>
      </div>

      {/* Control Bar & Filter Tabs */}
      <div className={styles.controlBar}>
        <div className={styles.tabsList}>
          <button
            className={`${styles.tabBtn} ${activeTab === 'ALL' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('ALL')}
          >
            Tất cả
            <span className={styles.tabCount}>{stats.total}</span>
          </button>
          <button
            className={`${styles.tabBtn} ${activeTab === 'INTERNING' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('INTERNING')}
          >
            Đang thực tập
            <span className={styles.tabCount}>{stats.interning}</span>
          </button>
          <button
            className={`${styles.tabBtn} ${activeTab === 'PENDING' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('PENDING')}
          >
            Chờ thẩm định / Duyệt
            <span className={styles.tabCount}>{stats.pending}</span>
          </button>
          <button
            className={`${styles.tabBtn} ${activeTab === 'COMPLETED' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('COMPLETED')}
          >
            Đã hoàn thành
            <span className={styles.tabCount}>{stats.completed}</span>
          </button>
        </div>

        <button
          className={styles.applyLinkBtn}
          onClick={() => navigate(ROUTES.INTERN.APPLY)}
        >
          <Plus size={16} />
          <span>Khám phá &amp; Đăng ký kỳ mới</span>
        </button>
      </div>

      {/* Cards Grid */}
      <div className={styles.cardsGrid}>
        {filteredProfiles.map((p) => {
          const cfg = getStatusConfig(p.status);
          const programId = p.programId ?? p.id;
          const displayTitle =
            p.programName || `Chương Trình Thực Tập #${p.programCode || programId}`;

          return (
            <div
              key={p.id}
              className={`${styles.programCard} ${cfg.cardTheme}`}
              onClick={() => onSelectProgram(programId)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectProgram(programId);
                }
              }}
            >
              {/* Header */}
              <div className={styles.cardHeader}>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {p.programCode && (
                    <span className={styles.codeBadge} title="Mã chương trình">
                      <Briefcase size={12} />
                      {p.programCode}
                    </span>
                  )}
                  {p.internCode && (
                    <span className={styles.codeBadge} title="Mã thực tập sinh">
                      <Hash size={12} />
                      {p.internCode}
                    </span>
                  )}
                  {!p.programCode && !p.internCode && (
                    <span className={styles.codeBadge}>
                      <Briefcase size={12} />
                      {`ID-${programId}`}
                    </span>
                  )}
                </div>
                <span className={cfg.pillClass}>
                  {cfg.icon}
                  {cfg.label}
                </span>
              </div>

              {/* Body */}
              <div className={styles.cardBody}>
                <h3 className={styles.programTitle} title={displayTitle}>
                  {displayTitle}
                </h3>

                <div className={styles.positionDeptRow}>
                  <strong>{p.appliedPosition || 'Thực tập sinh'}</strong>
                  {p.desiredDepartmentName && (
                    <span className={styles.deptBadge}>{p.desiredDepartmentName}</span>
                  )}
                </div>

                {p.university && (
                  <div className={styles.universityRow}>
                    <GraduationCap size={13} />
                    <span>
                      {p.university}
                      {p.major ? ` · ${p.major}` : ''}
                    </span>
                  </div>
                )}

                <div className={styles.infoDetailsList}>
                  <div className={styles.infoItem}>
                    <Calendar size={14} />
                    <span>{formatDateRange(p.startDate, p.endDate)}</span>
                  </div>

                  <div className={styles.infoItem}>
                    <UserCheck size={14} />
                    <span>Mentor: {p.mentorName || 'Chưa phân công'}</span>
                  </div>

                  {(() => {
                    const hasLocalCv = p.internCode
                      ? internService.getLocalDocuments(p.internCode).some((d) => d.documentType === 'CV')
                      : false;
                    const isCvUploaded = Boolean(p.hasCv || hasLocalCv);

                    return (
                      <div className={styles.infoItem}>
                        <FileText size={14} />
                        <span>Hồ sơ CV:</span>
                        {isCvUploaded ? (
                          <span className={`${styles.cvStatusChip} ${styles.hasCv}`}>
                            ✓ Đã tải lên
                          </span>
                        ) : (
                          <span className={`${styles.cvStatusChip} ${styles.noCv}`}>
                            ! Chưa nộp CV
                          </span>
                        )}
                      </div>
                    );
                  })()}
                </div>

                {p.status === 'REJECTED' && p.rejectionReason && (
                  <div className={styles.rejectionAlertBox}>
                    <strong>Lý do từ chối:</strong> {p.rejectionReason}
                  </div>
                )}
              </div>

              {/* Action Footer */}
              <div className={styles.cardFooter}>
                <div className={cfg.actionClass}>
                  <span>{cfg.actionText}</span>
                  <ArrowRight size={15} />
                </div>
              </div>
            </div>
          );
        })}

        {/* Thẻ mời đăng ký thêm chương trình mới */}
        <div
          className={styles.addNewCard}
          onClick={() => navigate(ROUTES.INTERN.APPLY)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              navigate(ROUTES.INTERN.APPLY);
            }
          }}
        >
          <div className={styles.addIconCircle}>
            <Plus size={28} />
          </div>
          <h4 className={styles.addNewTitle}>Đăng Ký Thêm Kỳ Thực Tập</h4>
          <p className={styles.addNewSubtitle}>
            Khám phá danh sách các vị trí tuyển dụng mở cho sinh viên và đăng ký ứng tuyển trực tuyến.
          </p>
        </div>
      </div>

      {filteredProfiles.length === 0 && (
        <div className={styles.emptyDeck}>
          <Layers size={36} color="var(--text-muted)" />
          <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
            Không tìm thấy chương trình thực tập nào trong danh mục đã chọn.
          </p>
          <button
            className={styles.applyLinkBtn}
            onClick={() => navigate(ROUTES.INTERN.APPLY)}
          >
            Đăng ký tham gia ngay
          </button>
        </div>
      )}
    </div>
  );
};
