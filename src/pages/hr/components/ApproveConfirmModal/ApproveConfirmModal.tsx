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
          setPrograms(activePrograms);
          if (activePrograms.length > 0) {
            setSelectedProgramId(activePrograms[0].id);
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
  }, [isOpen]);

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
              <span className={styles.summaryLabel}>Họ và tên</span>
              <span className={styles.summaryValue}>{intern.fullName}</span>
            </div>
            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>Vị trí ứng tuyển</span>
              <span className={styles.summaryValue}>{intern.appliedPosition || 'Thực tập sinh'}</span>
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

          {/* Chọn chương trình thực tập (Bắt buộc theo TM-15/18) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <FolderGit2 size={16} />
              Gán vào Chương Trình Thực Tập <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            {isLoadingPrograms ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <Loader2 size={16} className="animate-spin" /> Đang tải danh sách chương trình...
              </div>
            ) : programFetchError ? (
              <p style={{ color: 'var(--danger)', fontSize: '0.825rem', margin: 0 }}>{programFetchError}</p>
            ) : programs.length === 0 ? (
              <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', fontSize: '0.825rem' }}>
                Không có chương trình thực tập nào đang mở tiếp nhận hồ sơ. Vui lòng tạo hoặc mở tuyển ít nhất một chương trình trước khi duyệt.
              </div>
            ) : (
              <select
                value={selectedProgramId}
                onChange={(e) => setSelectedProgramId(Number(e.target.value))}
                disabled={isSubmitting}
                style={{
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-default)',
                  backgroundColor: 'var(--bg-body)',
                  color: 'var(--text-main)',
                  fontSize: '0.875rem',
                  outline: 'none',
                }}
              >
                {programs.map((p) => {
                  const isFull = p.currentInterns >= p.maxInterns;
                  return (
                    <option key={p.id} value={p.id} disabled={isFull}>
                      [{p.programCode}] {p.name} - {p.departmentName} ({p.currentInterns}/{p.maxInterns} TTS){isFull ? ' - ĐÃ ĐẦY' : ''}
                    </option>
                  );
                })}
              </select>
            )}

            {selectedProgram && (
              <div style={{ fontSize: '0.785rem', color: isSelectedFull ? 'var(--danger)' : 'var(--text-muted)', marginTop: '0.2rem' }}>
                Thời gian kỳ thực tập: <strong>{selectedProgram.startDate}</strong> đến <strong>{selectedProgram.endDate}</strong> ({selectedProgram.durationWeeks} tuần)
                {isSelectedFull && <div style={{ fontWeight: 600, color: 'var(--danger)' }}>Chương trình này đã đạt giới hạn chỉ tiêu ({selectedProgram.maxInterns} TTS). Vui lòng chọn chương trình khác.</div>}
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

