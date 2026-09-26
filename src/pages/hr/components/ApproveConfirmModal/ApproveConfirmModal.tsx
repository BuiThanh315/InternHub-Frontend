import React, { useEffect, useState } from 'react';
import { CheckCircle2, X, AlertCircle, Info, Loader2, FolderGit2 } from 'lucide-react';
import type { ApproveConfirmModalProps } from './ApproveConfirmModal.types';
import type { ProgramDetailResponse } from '../../../../types';
import { programService } from '../../../../services/programService';
import styles from './ApproveConfirmModal.module.css';

export const ApproveConfirmModal: React.FC<ApproveConfirmModalProps> = ({
  intern,
  isOpen,
  isSubmitting,
  errorMessage,
  onClose,
  onConfirm,
}) => {
  const [programs, setPrograms] = useState<ProgramDetailResponse[]>([]);
  const [selectedProgramId, setSelectedProgramId] = useState<number | ''>('');
  const [isLoadingPrograms, setIsLoadingPrograms] = useState<boolean>(false);
  const [programFetchError, setProgramFetchError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setIsLoadingPrograms(true);
      setProgramFetchError(null);
      setSelectedProgramId('');
      programService.getPrograms({ size: 100 })
        .then((res) => {
          // Lọc các chương trình đang mở tuyển hoặc đang hoạt động (PLANNING hoặc OPEN)
          const activePrograms = (res.items || []).filter(
            (p) => (p.status === 'PLANNING' || p.status === 'OPEN') && p.isRecruitmentOpen
          );

          // Thuật toán Smart Matching: Sắp xếp các chương trình khớp nguyện vọng lên đầu
          const internPos = (intern?.appliedPosition || '').toLowerCase().trim();
          const internDept = (intern?.desiredDepartmentName || '').toLowerCase().trim();

          const calcScore = (p: ProgramDetailResponse) => {
            const pName = p.name.toLowerCase();
            const pDept = p.departmentName.toLowerCase();
            let score = 0;

            // 1. Khớp trực tiếp cả cụm từ
            if (internPos && (pName.includes(internPos) || pDept.includes(internPos))) {
              score += 10;
            }

            // 2. Phân tích từ khóa chuyên môn (Fullstack, Backend, Frontend, QA, Devops...)
            const isFullstack = internPos.includes('fullstack') || internPos.includes('full stack');
            const isBackend = internPos.includes('backend') || internPos.includes('back-end');
            const isFrontend = internPos.includes('frontend') || internPos.includes('front-end');
            const isTester = internPos.includes('qa') || internPos.includes('test') || internPos.includes('kiểm thử');

            if (isFullstack && (pName.includes('fullstack') || (pName.includes('backend') && pName.includes('frontend')) || pName.includes('phần mềm') || pDept.includes('phần mềm'))) {
              score += 8;
            } else if (isBackend && (pName.includes('backend') || pName.includes('phần mềm') || pDept.includes('phần mềm'))) {
              score += 6;
            } else if (isFrontend && (pName.includes('frontend') || pName.includes('phần mềm') || pDept.includes('phần mềm'))) {
              score += 6;
            } else if (isTester && (pName.includes('kiểm thử') || pName.includes('test') || pName.includes('qa') || pDept.includes('chất lượng'))) {
              score += 8;
            }

            // 3. Khớp phòng ban
            if (internDept && (pDept.includes(internDept) || pName.includes(internDept))) {
              score += 3;
            }

            // Ưu tiên chương trình còn slot
            if (p.currentInterns < p.maxInterns) {
              score += 1;
            }

            return score;
          };

          const sortedPrograms = [...activePrograms].sort((a, b) => {
            return calcScore(b) - calcScore(a);
          });

          setPrograms(sortedPrograms);
          if (sortedPrograms.length > 0) {
            // Tự động chọn chương trình có điểm khớp cao nhất mà chưa đầy
            const bestFit = sortedPrograms.find(p => p.currentInterns < p.maxInterns) || sortedPrograms[0];
            setSelectedProgramId(bestFit.id);
          }
        })
        .catch((err) => {
          console.error('Failed to load programs:', err);
          setProgramFetchError('Không thể tải danh sách chương trình thực tập.');
        })
        .finally(() => {
          setIsLoadingPrograms(false);
        });
    }
  }, [isOpen, intern]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen || !intern) return null;

  const selectedProgram = programs.find((p) => p.id === selectedProgramId);
  const isSelectedFull = selectedProgram ? selectedProgram.currentInterns >= selectedProgram.maxInterns : false;

  const isMatchedProgram = (p: ProgramDetailResponse) => {
    const pos = (intern?.appliedPosition || '').toLowerCase().trim();
    const dept = (intern?.desiredDepartmentName || '').toLowerCase().trim();
    const pName = p.name.toLowerCase();
    const pDept = p.departmentName.toLowerCase();

    if (pos && (pName.includes(pos) || pDept.includes(pos))) return true;
    if (dept && (pDept.includes(dept) || pName.includes(dept))) return true;

    const isFullstack = pos.includes('fullstack') || pos.includes('full stack');
    const isBackend = pos.includes('backend') || pos.includes('back-end');
    const isFrontend = pos.includes('frontend') || pos.includes('front-end');
    const isTester = pos.includes('qa') || pos.includes('test') || pos.includes('kiểm thử');

    if (isFullstack && ((pName.includes('backend') && pName.includes('frontend')) || pName.includes('phần mềm') || pDept.includes('phần mềm'))) return true;
    if (isBackend && (pName.includes('backend') || pName.includes('phần mềm') || pDept.includes('phần mềm'))) return true;
    if (isFrontend && (pName.includes('frontend') || pName.includes('phần mềm') || pDept.includes('phần mềm'))) return true;
    if (isTester && (pName.includes('kiểm thử') || pName.includes('test') || pName.includes('qa') || pDept.includes('chất lượng'))) return true;

    return false;
  };

  const handleSubmit = () => {
    if (selectedProgramId && !isSelectedFull) {
      onConfirm(selectedProgramId as number);
    }
  };

  return (
    <div
      className={styles.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) {
          onClose();
        }
      }}
    >
      <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="approve-modal-title">
        {/* Khối 1: Header cố định */}
        <div className={styles.header}>
          <div className={styles.headerTitleWrapper}>
            <div className={styles.iconWrapper}>
              <CheckCircle2 size={22} />
            </div>
            <h3 id="approve-modal-title" className={styles.title}>
              Phê Duyệt Tiếp Nhận Hồ Sơ
            </h3>
          </div>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Đóng hộp thoại"
          >
            <X size={20} />
          </button>
        </div>

        {/* Khối 2: Body cuộn độc lập */}
        <div className={styles.body}>
          {errorMessage && (
            <div className={styles.alertError} role="alert">
              <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Không thể duyệt hồ sơ:</strong> {errorMessage}
              </div>
            </div>
          )}

          <p className={styles.description}>
            Bạn có chắc chắn muốn phê duyệt tiếp nhận ứng viên{' '}
            <span className={styles.highlightName}>{intern.fullName}</span> vào danh sách thực tập sinh chính thức không?
          </p>

          <div className={styles.internSummaryCard}>
            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>Mã thực tập sinh</span>
              <span className={styles.codeBadge}>{intern.internCode}</span>
            </div>
            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>Loại ứng viên</span>
              <span style={{ fontWeight: 600, color: intern.candidateType === 'FREE_APPLICANT' ? 'var(--primary)' : 'var(--text-main)' }}>
                {intern.candidateType === 'FREE_APPLICANT' ? '🌟 Ứng viên tự do (Theo nguyện vọng)' : '🏫 Sinh viên liên kết trường'}
              </span>
            </div>
            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>Họ và tên</span>
              <span className={styles.summaryValue}>{intern.fullName}</span>
            </div>
            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>Vị trí nguyện vọng</span>
              <span className={styles.summaryValue} style={{ fontWeight: 600, color: 'var(--primary)' }}>
                {intern.appliedPosition || 'Thực tập sinh'}
              </span>
            </div>
            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>Trường Đại học</span>
              <span className={styles.summaryValue}>{intern.university}</span>
            </div>
            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>Chuyên ngành</span>
              <span className={styles.summaryValue}>{intern.major}</span>
            </div>
          </div>

          {/* Chọn chương trình thực tập (Nâng cấp giao diện thẻ trực quan theo frontend-design) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <FolderGit2 size={16} />
                Gán vào Chương Trình Thực Tập <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {programs.length} chương trình khả dụng
              </span>
            </div>

            {isLoadingPrograms ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <Loader2 size={16} className="animate-spin" /> Đang tải danh sách chương trình thực tập...
              </div>
            ) : programFetchError ? (
              <p style={{ color: 'var(--danger)', fontSize: '0.825rem', margin: 0 }}>{programFetchError}</p>
            ) : programs.length === 0 ? (
              <div style={{ padding: '0.85rem', borderRadius: 'var(--radius-md)', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', fontSize: '0.825rem' }}>
                Không có chương trình thực tập nào đang mở tiếp nhận hồ sơ. Vui lòng tạo hoặc mở tuyển chương trình trước khi phê duyệt.
              </div>
            ) : (
              <div className={styles.programList} role="radiogroup" aria-label="Danh sách chương trình thực tập">
                {programs.map((p) => {
                  const isFull = p.currentInterns >= p.maxInterns;
                  const isSelected = selectedProgramId === p.id;
                  const matched = isMatchedProgram(p);
                  const percent = Math.min(100, Math.round((p.currentInterns / Math.max(1, p.maxInterns)) * 100));

                  return (
                    <div
                      key={p.id}
                      role="radio"
                      aria-checked={isSelected}
                      tabIndex={isFull ? -1 : 0}
                      className={`${styles.programCard} ${isSelected ? styles.programCardSelected : ''} ${isFull ? styles.programCardDisabled : ''}`}
                      onClick={() => {
                        if (!isFull && !isSubmitting) {
                          setSelectedProgramId(p.id);
                        }
                      }}
                      onKeyDown={(e) => {
                        if ((e.key === ' ' || e.key === 'Enter') && !isFull && !isSubmitting) {
                          setSelectedProgramId(p.id);
                        }
                      }}
                    >
                      <div className={styles.programCardHeader}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span className={styles.programCodeTag}>{p.programCode}</span>
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                            {p.departmentName}
                          </span>
                        </div>
                        {matched && (
                          <span className={styles.recommendBadge}>
                            ⭐ Khớp nguyện vọng
                          </span>
                        )}
                        {isFull && (
                          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--danger)', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                            ĐÃ ĐẦY
                          </span>
                        )}
                      </div>

                      <div className={styles.programTitle}>
                        {p.name}
                      </div>

                      <div className={styles.programMeta}>
                        <span>Kỳ: {p.startDate} ~ {p.endDate} ({p.durationWeeks} tuần)</span>
                        <div className={styles.capacityBarWrapper}>
                          <span>{p.currentInterns}/{p.maxInterns} TTS</span>
                          <div className={styles.capacityProgressBar}>
                            <div
                              className={styles.capacityProgressFill}
                              style={{
                                width: `${percent}%`,
                                backgroundColor: isFull ? 'var(--danger)' : percent > 80 ? '#f59e0b' : 'var(--primary)',
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className={styles.noteBanner}>
            <Info size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>
              Sau khi được tiếp nhận, hồ sơ sẽ chuyển sang trạng thái <strong>ĐÃ DUYỆT (APPROVED)</strong> và tự động liên kết với kỳ thực tập đã chọn.
            </span>
          </div>
        </div>

        {/* Khối 3: Sticky Footer */}
        <div className={styles.footer}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Hủy
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedProgramId || isSelectedFull || programs.length === 0}
            style={{ minWidth: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Đang xử lý...</span>
              </>
            ) : (
              <>
                <CheckCircle2 size={16} />
                <span>Xác Nhận Tiếp Nhận</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

