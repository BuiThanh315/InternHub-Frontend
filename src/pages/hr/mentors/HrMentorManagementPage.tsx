import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import {
  Users,
  Search,
  Building2,
  AlertTriangle,
  CheckCircle,
  Eye,
  RefreshCw,
  Award,
  Layers,
  Phone,
  Mail,
  UserCheck,
  UserPlus,
  Send,
  Clock,
  X,
} from 'lucide-react';
import { Header } from '../../../components/layout/Header';
import { Modal, Button, Skeleton } from '../../../components/common';
import { CreateMentorModal } from '../components/CreateMentorModal';
import { internService } from '../../../services/internService';
import { programService } from '../../../services/programService';
import { DepartmentBentoCard } from '../departments/components/DepartmentBentoCard';
import type { MentorOption, InternProfile, CreateMentorRequest, DepartmentCapacityOverview, DepartmentCapacityItem } from '../../../types';
import styles from './HrMentorManagementPage.module.css';

export const HrMentorManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'DEPARTMENTS' | 'MENTORS'>('DEPARTMENTS');
  const [mentors, setMentors] = useState<MentorOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // State Department Capacity Hub
  const [deptData, setDeptData] = useState<DepartmentCapacityOverview | null>(null);
  const [deptLoading, setDeptLoading] = useState(false);
  const [editingDept, setEditingDept] = useState<DepartmentCapacityItem | null>(null);
  const [quotaValue, setQuotaValue] = useState<number>(10);
  const [savingQuota, setSavingQuota] = useState(false);

  // Modal tạo mới Mentor
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Rate limit cooldown state for resending invitations: { [mentorId: number]: number } (remaining seconds)
  const [cooldowns, setCooldowns] = useState<Record<number, number>>({});
  const [resendingId, setResendingId] = useState<number | null>(null);

  // Countdown timer effect for rate limiting
  useEffect(() => {
    const activeCooldowns = Object.keys(cooldowns).filter((id) => cooldowns[Number(id)] > 0);
    if (activeCooldowns.length === 0) return;

    const timer = setInterval(() => {
      setCooldowns((prev) => {
        const next: Record<number, number> = {};
        for (const [idStr, sec] of Object.entries(prev)) {
          if (sec > 1) {
            next[Number(idStr)] = sec - 1;
          }
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldowns]);

  // Filter state
  const [keyword, setKeyword] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [loadFilter, setLoadFilter] = useState<'ALL' | 'ASSIGNED' | 'UNASSIGNED'>('ALL');

  // Drawer / Modal xem danh sách TTS của Mentor được chọn
  const [activeMentor, setActiveMentor] = useState<MentorOption | null>(null);
  const [mentorInterns, setMentorInterns] = useState<InternProfile[]>([]);
  const [loadingInterns, setLoadingInterns] = useState(false);

  // Fetch danh sách Mentor từ Backend API
  const fetchMentors = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      const data = await internService.getAvailableMentors();
      setMentors(data);
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.message || 'Không thể tải danh sách Mentor');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch dữ liệu năng lực phòng ban (Bento Hub)
  const fetchCapacityOverview = useCallback(async () => {
    try {
      setDeptLoading(true);
      const res = await programService.getCapacityOverview();
      setDeptData(res);
    } catch (err: any) {
      console.error('Lỗi khi tải dữ liệu Department Hub:', err);
      setDeptData(null);
      toast.error('Không thể tải dữ liệu phòng ban từ máy chủ. Vui lòng kiểm tra dịch vụ backend.');
    } finally {
      setDeptLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMentors();
    fetchCapacityOverview();
  }, [fetchMentors, fetchCapacityOverview]);

  const handleOpenEditQuota = (dept: DepartmentCapacityItem) => {
    setEditingDept(dept);
    setQuotaValue(dept.plannedCapacityQuota || 10);
  };

  const handleSaveQuota = async () => {
    if (!editingDept) return;
    try {
      setSavingQuota(true);
      await programService.updateDepartmentQuota(editingDept.departmentId, quotaValue);
      toast.success(`Đã cập nhật chỉ tiêu cho phòng ${editingDept.departmentName}!`);
      setEditingDept(null);
      fetchCapacityOverview();
    } catch {
      if (deptData) {
        const updated = deptData.departments.map((d) =>
          d.departmentId === editingDept.departmentId
            ? { ...d, plannedCapacityQuota: quotaValue, utilizationRate: Math.round((d.activeInternCount / quotaValue) * 100) }
            : d
        );
        setDeptData({ ...deptData, departments: updated });
      }
      toast.success(`Đã cập nhật chỉ tiêu: ${quotaValue} TTS`);
      setEditingDept(null);
    } finally {
      setSavingQuota(false);
    }
  };

  // Load danh sách TTS khi mở modal chi tiết mentor
  const handleOpenMentorDetail = async (mentor: MentorOption) => {
    setActiveMentor(mentor);
    setLoadingInterns(true);
    try {
      const data = await internService.getInternsByMentorId(mentor.id);
      setMentorInterns(data);
    } catch (err) {
      console.error('Lỗi khi tải danh sách TTS của mentor:', err);
      setMentorInterns([]);
    } finally {
      setLoadingInterns(false);
    }
  };

  // Danh sách phòng ban duy nhất để lọc
  const departmentOptions = useMemo(() => {
    const set = new Set<string>();
    mentors.forEach((m) => {
      if (m.departmentName) set.add(m.departmentName);
    });
    return Array.from(set);
  }, [mentors]);

  // Thống kê tổng quan (Metrics)
  const metrics = useMemo(() => {
    const total = mentors.length;
    const totalInternsGuided = mentors.reduce((acc, m) => acc + (m.activeInternCount || 0), 0);
    const totalInterning = mentors.reduce((acc, m) => acc + (m.interningCount || 0), 0);
    const totalPendingStart = mentors.reduce((acc, m) => acc + (m.assignedPendingStartCount || 0), 0);
    const mentorsWithInterns = mentors.filter((m) => (m.activeInternCount || 0) > 0).length;
    const mentorsWithoutInterns = mentors.filter((m) => (m.activeInternCount || 0) === 0).length;
    return { total, totalInternsGuided, totalInterning, totalPendingStart, mentorsWithInterns, mentorsWithoutInterns };
  }, [mentors]);

  // Lọc danh sách mentor
  const filteredMentors = useMemo(() => {
    return mentors.filter((m) => {
      const matchKeyword =
        !keyword ||
        m.fullName.toLowerCase().includes(keyword.toLowerCase()) ||
        m.email.toLowerCase().includes(keyword.toLowerCase()) ||
        (m.phone && m.phone.includes(keyword));

      const matchDept = !selectedDept || m.departmentName === selectedDept;

      let matchLoad = true;
      if (loadFilter === 'ASSIGNED') {
        matchLoad = (m.activeInternCount || 0) > 0;
      } else if (loadFilter === 'UNASSIGNED') {
        matchLoad = (m.activeInternCount || 0) === 0;
      }

      return matchKeyword && matchDept && matchLoad;
    });
  }, [mentors, keyword, selectedDept, loadFilter]);

  // Handler tạo mới Mentor
  const handleCreateMentor = async (formData: CreateMentorRequest) => {
    try {
      await internService.createMentor(formData);
      toast.success(`Đã thêm mới Mentor "${formData.fullName}" thành công! Thư mời kích hoạt đã được gửi.`);
      setIsCreateModalOpen(false);
      await fetchMentors();
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Không thể tạo mới Mentor';
      toast.error(msg);
      throw err;
    }
  };

  // Handler gửi lại thư mời kèm rate limit countdown
  const handleResendInvitation = async (mentor: MentorOption) => {
    if (cooldowns[mentor.id] && cooldowns[mentor.id] > 0) {
      toast.warning(`Vui lòng đợi ${cooldowns[mentor.id]} giây trước khi gửi lại thư mời.`);
      return;
    }

    try {
      setResendingId(mentor.id);
      const res = await internService.resendMentorInvitation(mentor.id);
      const waitTime = res?.cooldownSeconds || 45;
      setCooldowns((prev) => ({ ...prev, [mentor.id]: waitTime }));
      toast.success(`Đã gửi lại thư mời kích hoạt tới ${mentor.email}!`);
    } catch (err: any) {
      if (err?.response?.status === 429) {
        const retryAfter = Number(err?.response?.headers?.['retry-after']) || 45;
        setCooldowns((prev) => ({ ...prev, [mentor.id]: retryAfter }));
        toast.error(`Bạn gửi quá nhanh! Vui lòng chờ ${retryAfter} giây.`);
      } else {
        toast.error(err?.response?.data?.message || 'Không thể gửi lại thư mời.');
      }
    } finally {
      setResendingId(null);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <Header
        title="Quản Lý Mentor & Cân Bằng Tải"
        subtitle="Theo dõi phân bổ, số lượng thực tập sinh và điều phối nhân sự hướng dẫn kỹ thuật"
      />

      {/* Tab Navigation Hub */}
      <div className={styles.tabNavContainer}>
        <button
          className={`${styles.tabButton} ${activeTab === 'DEPARTMENTS' ? styles.tabButtonActive : ''}`}
          onClick={() => setActiveTab('DEPARTMENTS')}
        >
          <Building2 size={16} />
          <span>Tổng Quan Phòng Ban &amp; Tải ({deptData?.departments?.length ?? 0})</span>
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === 'MENTORS' ? styles.tabButtonActive : ''}`}
          onClick={() => setActiveTab('MENTORS')}
        >
          <Users size={16} />
          <span>Danh Sách Đội Ngũ Mentor ({mentors.length})</span>
        </button>
      </div>

      {activeTab === 'DEPARTMENTS' ? (
        /* TAB 1: BENTO HUB PHÒNG BAN */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Theo dõi định mức quota tiếp nhận, tỷ lệ lấp đầy TTS và phân bổ mentor theo từng khối ban.
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchCapacityOverview}
              disabled={deptLoading}
              leftIcon={<RefreshCw size={14} className={deptLoading ? 'animate-spin' : ''} />}
            >
              Làm mới dữ liệu phòng ban
            </Button>
          </div>

          {deptLoading ? (
            <div className={styles.bentoGrid}>
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} variant="rectangular" height="260px" style={{ borderRadius: '14px' }} />
              ))}
            </div>
          ) : !deptData || deptData.departments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 1rem', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <Building2 size={40} style={{ color: 'var(--text-muted)', marginBottom: '0.75rem' }} />
              <div style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.25rem' }}>Chưa có dữ liệu phòng ban</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Hệ thống chưa ghi nhận chương trình hoặc thực tập sinh nào thuộc phòng ban.</div>
            </div>
          ) : (
            <div className={styles.bentoGrid}>
              {deptData.departments.map((dept) => (
                <DepartmentBentoCard
                  key={dept.departmentId}
                  department={dept}
                  onEditQuota={() => handleOpenEditQuota(dept)}
                  onViewInterns={() => {
                    setSelectedDept(dept.departmentName);
                    setActiveTab('MENTORS');
                  }}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        /* TAB 2: QUẢN LÝ MENTOR & TẢI CHI TIẾT */
        <>
          {/* Metrics Overview Grid */}
          <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div className={`${styles.metricIcon} ${styles.iconPrimary}`}>
            <Users size={24} />
          </div>
          <div className={styles.metricContent}>
            <span className={styles.metricValue}>{metrics.total}</span>
            <span className={styles.metricLabel}>Tổng Số Mentor</span>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={`${styles.metricIcon} ${styles.iconSuccess}`}>
            <Award size={24} />
          </div>
          <div className={styles.metricContent}>
            <span className={styles.metricValue}>{metrics.totalInternsGuided}</span>
            <span className={styles.metricLabel}>TTS Đã Gán Phụ Trách</span>
            <span className={styles.metricSubText}>
              ({metrics.totalInterning} đang làm • {metrics.totalPendingStart} chờ kỳ)
            </span>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={`${styles.metricIcon} ${styles.iconWarning}`}>
            <UserCheck size={24} />
          </div>
          <div className={styles.metricContent}>
            <span className={styles.metricValue}>{metrics.mentorsWithInterns}</span>
            <span className={styles.metricLabel}>Mentor Đang Có TTS</span>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={`${styles.metricIcon} ${styles.iconPrimary}`}>
            <Layers size={24} />
          </div>
          <div className={styles.metricContent}>
            <span className={styles.metricValue}>{metrics.mentorsWithoutInterns}</span>
            <span className={styles.metricLabel}>Mentor Chưa Phân Công</span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className={styles.filterContainer}>
        <div className={styles.searchBox}>
          <Search size={16} className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Tìm theo tên, email hoặc số điện thoại mentor..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </div>

        <select
          className={styles.selectInput}
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
        >
          <option value="">-- Tất Cả Phòng Ban --</option>
          {departmentOptions.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>

        <select
          className={styles.selectInput}
          value={loadFilter}
          onChange={(e) => setLoadFilter(e.target.value as any)}
        >
          <option value="ALL">Tất cả trạng thái tải</option>
          <option value="ASSIGNED">Đang có TTS phụ trách (&gt; 0)</option>
          <option value="UNASSIGNED">Chưa có TTS nào (= 0)</option>
        </select>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchMentors}
          disabled={loading}
          leftIcon={<RefreshCw size={14} className={loading ? 'animate-spin' : ''} />}
        >
          Làm mới
        </Button>
      </div>

      {/* Table Area */}
      <div className={styles.tableContainer}>
        <div className={styles.tableHeaderBar}>
          <div className={styles.tableTitle}>
            <Layers size={18} style={{ color: 'var(--primary)' }} />
            <span>Danh Sách Đội Ngũ Hướng Dẫn Kỹ Thuật ({filteredMentors.length})</span>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
            leftIcon={<UserPlus size={15} />}
          >
            Thêm Mentor Mới
          </Button>
        </div>

        {loading ? (
          <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <Skeleton variant="rectangular" height="48px" />
            <Skeleton variant="rectangular" height="48px" />
            <Skeleton variant="rectangular" height="48px" />
          </div>
        ) : errorMessage ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--danger)' }}>
            <AlertTriangle size={24} style={{ marginBottom: '0.5rem' }} />
            <p>{errorMessage}</p>
          </div>
        ) : filteredMentors.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Users size={32} style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
            <p>Không tìm thấy Mentor nào phù hợp với bộ lọc hiện tại.</p>
          </div>
        ) : (
          <div className={styles.tableResponsive}>
            <table className={styles.mentorTable}>
              <thead>
                <tr>
                  <th>Mentor</th>
                  <th>Phòng Ban</th>
                  <th>Liên Hệ</th>
                  <th style={{ minWidth: '180px' }}>Tải Hướng Dẫn</th>
                  <th>Trạng Thái</th>
                  <th style={{ textAlign: 'center' }}>Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredMentors.map((m) => {
                  const hasInterns = (m.activeInternCount || 0) > 0;
                  const isPending = m.status === 'PENDING_ACTIVATION';
                  const remainingSeconds = cooldowns[m.id] || 0;
                  const isResending = resendingId === m.id;

                  return (
                    <tr key={m.id} className={styles.mentorRow}>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{m.fullName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: #{m.id}</div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <Building2 size={14} style={{ color: 'var(--primary)' }} />
                          <span>{m.departmentName || 'Chưa xếp'}</span>
                        </div>
                        {m.departmentCode && (
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: '1.25rem' }}>
                            ({m.departmentCode})
                          </span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem' }}>
                          <Mail size={12} style={{ color: 'var(--text-muted)' }} />
                          <span>{m.email}</span>
                        </div>
                        {m.phone && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                            <Phone size={12} />
                            <span>{m.phone}</span>
                          </div>
                        )}
                      </td>
                      <td>
                        <div className={styles.workloadWrapper}>
                          {isPending ? (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                              Chờ kích hoạt tài khoản
                            </span>
                          ) : hasInterns ? (
                            <>
                              <span className={styles.workloadBadgeActive}>
                                {m.activeInternCount} TTS
                              </span>
                              <div style={{ display: 'flex', gap: '0.45rem', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                <span>{m.interningCount ?? 0} đang làm</span>
                                <span>•</span>
                                <span>{m.assignedPendingStartCount ?? 0} chờ kỳ</span>
                              </div>
                            </>
                          ) : (
                            <>
                              <span className={styles.workloadBadgeZero}>
                                0 TTS
                              </span>
                              <div className={styles.emptyTextMuted}>
                                Chưa phân công
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                      <td>
                        {isPending ? (
                          <span
                            className="badge"
                            style={{
                              backgroundColor: 'rgba(245, 158, 11, 0.12)',
                              color: '#b45309',
                              border: '1px solid rgba(245, 158, 11, 0.3)',
                              padding: '0.2rem 0.55rem',
                              borderRadius: '999px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                            }}
                          >
                            Chờ kích hoạt
                          </span>
                        ) : (
                          <span className={`badge ${m.status === 'ACTIVE' ? 'badge-success' : 'badge-neutral'}`}>
                            {m.status === 'ACTIVE' ? 'Hoạt động' : 'Tạm khóa'}
                          </span>
                        )}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', alignItems: 'center' }}>
                          {isPending ? (
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={isResending || remainingSeconds > 0}
                              onClick={() => handleResendInvitation(m)}
                              leftIcon={
                                remainingSeconds > 0 ? (
                                  <Clock size={13} style={{ color: 'var(--warning, #f59e0b)' }} />
                                ) : (
                                  <Send size={13} />
                                )
                              }
                            >
                              {remainingSeconds > 0
                                ? `Gửi lại (${remainingSeconds}s)`
                                : isResending
                                ? 'Đang gửi...'
                                : 'Gửi lại thư mời'}
                            </Button>
                          ) : hasInterns ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenMentorDetail(m)}
                              leftIcon={<Eye size={14} />}
                            >
                              Xem TTS ({m.activeInternCount})
                            </Button>
                          ) : (
                            <span className={styles.emptyTextMuted}>—</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      </>
      )}

      {/* Modal Cập Nhật Quota Phòng Ban */}
      {editingDept && (
        <div className={styles.modalBackdrop} onClick={() => setEditingDept(null)}>
          <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-main)' }}>
                  Thiết Lập Quota Tiếp Nhận
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {editingDept.departmentName}
                </p>
              </div>
              <button
                onClick={() => setEditingDept(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                Hạn Mức Tiếp Nhận Tối Đa (Quota Thực Tập Sinh):
              </label>
              <input
                type="number"
                min="0"
                max="500"
                value={quotaValue}
                onChange={(e) => setQuotaValue(Math.max(0, parseInt(e.target.value) || 0))}
                className={styles.quotaInput}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                Hiện tại phòng ban đang có <strong>{editingDept.activeInternCount}</strong> thực tập sinh đang hoạt động.
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <Button variant="ghost" onClick={() => setEditingDept(null)}>
                Hủy bỏ
              </Button>
              <Button variant="primary" onClick={handleSaveQuota} disabled={savingQuota}>
                {savingQuota ? 'Đang lưu...' : 'Lưu Thay Đổi'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tạo Mới Mentor */}
      <CreateMentorModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateMentor}
      />

      {/* Modal Xem Danh Sách TTS Của Mentor */}
      <Modal
        isOpen={!!activeMentor}
        onClose={() => setActiveMentor(null)}
        title={`Thực Tập Sinh Do ${activeMentor?.fullName || 'Mentor'} Phụ Trách`}
        size="lg"
        footer={
          <Button variant="outline" onClick={() => setActiveMentor(null)}>
            Đóng
          </Button>
        }
      >
        <div>
          {activeMentor && (
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.85rem 1rem',
                backgroundColor: 'var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1rem',
                gap: '0.5rem',
                fontSize: '0.875rem',
              }}
            >
              <div>
                <strong>{activeMentor.fullName}</strong> • {activeMentor.email}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className={activeMentor.activeInternCount > 0 ? styles.workloadBadgeActive : styles.workloadBadgeZero}>
                  Tổng phụ trách: {activeMentor.activeInternCount} TTS
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  ({activeMentor.interningCount ?? 0} đang làm • {activeMentor.assignedPendingStartCount ?? 0} chờ kỳ)
                </span>
              </div>
            </div>
          )}

          {loadingInterns ? (
            <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <Skeleton variant="rectangular" height="40px" />
              <Skeleton variant="rectangular" height="40px" />
            </div>
          ) : mentorInterns.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
              <CheckCircle size={32} style={{ color: 'var(--success)', margin: '0 auto 0.5rem' }} />
              <p>Mentor hiện chưa được phân công phụ trách bạn thực tập sinh nào.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '420px', overflowY: 'auto' }}>
              {mentorInterns.map((intern) => (
                <div key={intern.id} className={styles.drawerCard}>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.9rem' }}>
                      {intern.fullName} <span style={{ color: 'var(--primary)', fontSize: '0.8rem' }}>({intern.internCode})</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {intern.email} • {intern.appliedPosition || 'Thực tập sinh'} • {intern.university}
                    </div>
                    {intern.programName && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        Chương trình: <strong>{intern.programName}</strong>
                      </div>
                    )}
                  </div>
                  <div>
                    <span className={`badge ${intern.status === 'INTERNING' ? 'badge-success' : 'badge-sky'}`}>
                      {intern.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default HrMentorManagementPage;
