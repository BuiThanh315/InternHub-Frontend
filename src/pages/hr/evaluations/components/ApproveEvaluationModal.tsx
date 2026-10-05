import React from 'react';
import {
  Award,
  CheckCircle,
  Clock,
  Building2,
  GraduationCap,
  AlertTriangle,
  User,
  Star
} from 'lucide-react';
import type { HrEvaluationSummaryItem } from '../../../../types';
import { Button } from '../../../../components/common/Button/Button';
import styles from './ApproveEvaluationModal.module.css';

interface ApproveEvaluationModalProps {
  isOpen: boolean;
  onClose: () => void;
  intern: HrEvaluationSummaryItem | null;
  onApprove: (internCode: string, payload: { hrComments: string; internshipResult: 'PASSED' | 'EXCELLENT' | 'FAILED' }) => Promise<void>;
  isApproving: boolean;
}

export const ApproveEvaluationModal: React.FC<ApproveEvaluationModalProps> = ({
  isOpen,
  onClose,
  intern,
  onApprove,
  isApproving,
}) => {
  const [hrComments, setHrComments] = React.useState('');
  const [internshipResult, setInternshipResult] = React.useState<'PASSED' | 'EXCELLENT' | 'FAILED'>('PASSED');

  React.useEffect(() => {
    if (intern) {
      setHrComments(intern.hrComments || '');
      setInternshipResult(intern.internshipResult || 'PASSED');
    }
  }, [intern]);

  if (!isOpen || !intern) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onApprove(intern.internCode, {
      hrComments: hrComments.trim(),
      internshipResult,
    });
  };

  const getScoreColor = (score?: number) => {
    if (!score) return 'var(--text-muted)';
    if (score >= 8.5) return 'var(--success, #10b981)';
    if (score >= 7.0) return 'var(--primary, #3b82f6)';
    if (score >= 5.0) return 'var(--warning, #f59e0b)';
    return 'var(--danger, #ef4444)';
  };

  return (
    <div className={styles.modalBackdrop} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <div className={styles.headerTitleWrap}>
            <div className={styles.badgeIcon}>
              <Award size={20} />
            </div>
            <div>
              <h2 className={styles.modalTitle}>Phê Duyệt Đánh Giá Cuối Kỳ</h2>
              <p className={styles.modalSubtitle}>
                Thực tập sinh: <strong>{intern.internName}</strong> ({intern.internCode})
              </p>
            </div>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Đóng modal">
            &times;
          </button>
        </div>

        {/* Content */}
        <div className={styles.modalBody}>
          {/* Sinh viên info card */}
          <div className={styles.infoGrid}>
            <div className={styles.infoCard}>
              <div className={styles.infoLabel}>
                <GraduationCap size={14} /> Trường đào tạo:
              </div>
              <div className={styles.infoValue}>{intern.university || 'N/A'}</div>
            </div>
            <div className={styles.infoCard}>
              <div className={styles.infoLabel}>
                <Building2 size={14} /> Chương trình:
              </div>
              <div className={styles.infoValue}>{intern.programName || 'N/A'}</div>
            </div>
            <div className={styles.infoCard}>
              <div className={styles.infoLabel}>
                <User size={14} /> Mentor hướng dẫn:
              </div>
              <div className={styles.infoValue}>{intern.mentorName || 'Chưa phân công'}</div>
            </div>
            <div className={styles.infoCard}>
              <div className={styles.infoLabel}>
                <Clock size={14} /> Vị trí thực tập:
              </div>
              <div className={styles.infoValue}>{intern.appliedPosition || 'Thực tập sinh'}</div>
            </div>
          </div>

          {/* Bảng điểm chi tiết do Mentor chấm */}
          <div className={styles.sectionCard}>
            <div className={styles.sectionTitle}>
              <Star size={16} style={{ color: 'var(--primary)' }} />
              <span>Bảng Điểm Đánh Giá Từ Mentor Kỹ Thuật</span>
            </div>

            <div className={styles.scoresRow}>
              <div className={styles.scoreItem}>
                <div className={styles.scoreLabel}>Chuyên môn (40%)</div>
                <div className={styles.scoreValue} style={{ color: getScoreColor(intern.technicalScore) }}>
                  {intern.technicalScore != null ? intern.technicalScore.toFixed(1) : '—'}
                </div>
              </div>
              <div className={styles.scoreItem}>
                <div className={styles.scoreLabel}>Thái độ (35%)</div>
                <div className={styles.scoreValue} style={{ color: getScoreColor(intern.attitudeScore) }}>
                  {intern.attitudeScore != null ? intern.attitudeScore.toFixed(1) : '—'}
                </div>
              </div>
              <div className={styles.scoreItem}>
                <div className={styles.scoreLabel}>Kỹ năng mềm (25%)</div>
                <div className={styles.scoreValue} style={{ color: getScoreColor(intern.softSkillsScore) }}>
                  {intern.softSkillsScore != null ? intern.softSkillsScore.toFixed(1) : '—'}
                </div>
              </div>
              <div className={`${styles.scoreItem} ${styles.finalScoreItem}`}>
                <div className={styles.scoreLabel}>ĐIỂM TỔNG KẾT</div>
                <div className={styles.finalScoreValue} style={{ color: getScoreColor(intern.finalScore) }}>
                  {intern.finalScore != null ? intern.finalScore.toFixed(1) : '—'} / 10
                </div>
              </div>
            </div>

            {/* Nhận xét của Mentor */}
            {(intern.strengths || intern.areasForImprovement || intern.recommendation) && (
              <div className={styles.mentorRemarks}>
                {intern.strengths && (
                  <div className={styles.remarkBox}>
                    <strong style={{ color: 'var(--success)' }}>Điểm mạnh ghi nhận:</strong>
                    <p>{intern.strengths}</p>
                  </div>
                )}
                {intern.areasForImprovement && (
                  <div className={styles.remarkBox}>
                    <strong style={{ color: 'var(--warning)' }}>Điểm cần hoàn thiện:</strong>
                    <p>{intern.areasForImprovement}</p>
                  </div>
                )}
                {intern.recommendation && (
                  <div className={styles.recommendationBadgeRow}>
                    <span>Đề xuất từ Mentor:</span>
                    <span className="badge badge-sky">
                      {intern.recommendation === 'HIRE_FULLTIME'
                        ? '🎯 Đề xuất Tuyển dụng Chính thức'
                        : intern.recommendation === 'EXTEND_INTERNSHIP'
                        ? '⏳ Đề xuất Gia hạn Thực tập'
                        : intern.recommendation === 'PASS'
                        ? '✅ Đạt yêu cầu tốt nghiệp'
                        : '❌ Không đạt yêu cầu'}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Form Phê Duyệt Của HR */}
          <form id="approveForm" onSubmit={handleSubmit} className={styles.hrForm}>
            <div className={styles.formGroup}>
              <label htmlFor="internshipResult" className={styles.formLabel}>
                Kết luận kết quả kỳ thực tập của Doanh nghiệp <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <select
                id="internshipResult"
                value={internshipResult}
                onChange={(e) => setInternshipResult(e.target.value as any)}
                className={styles.selectInput}
                required
              >
                <option value="EXCELLENT">🌟 Hoàn Thành Xuất Sắc (Xếp loại Giỏi / Xuất Sắc)</option>
                <option value="PASSED">✅ Hoàn Thành Đạt Yêu Cầu (Xếp loại Khá / Trung Bình Khá)</option>
                <option value="FAILED">❌ Không Đạt Yêu Cầu Thực Tập</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="hrComments" className={styles.formLabel}>
                Ý kiến nhận xét chính thức từ Phòng Nhân sự (Ghi vào phiếu nộp Nhà trường):
              </label>
              <textarea
                id="hrComments"
                rows={3}
                value={hrComments}
                onChange={(e) => setHrComments(e.target.value)}
                placeholder="Nhập nhận xét tổng quan về quá trình thực tập, kỷ luật và tinh thần học hỏi của sinh viên..."
                className={styles.textareaInput}
              />
            </div>

            <div className={styles.alertNotice}>
              <AlertTriangle size={18} style={{ color: 'var(--warning)', flexShrink: 0 }} />
              <span>
                <strong>Lưu ý quan trọng:</strong> Hành động phê duyệt sẽ chuyển trạng thái của hồ sơ thực tập sinh sang{' '}
                <strong>COMPLETED</strong> và khóa điểm chính thức để xuất phiếu gửi Nhà trường.
              </span>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className={styles.modalFooter}>
          <Button variant="ghost" onClick={onClose} disabled={isApproving}>
            Hủy bỏ
          </Button>
          <Button
            variant="primary"
            type="submit"
            form="approveForm"
            disabled={isApproving}
            leftIcon={<CheckCircle size={16} />}
          >
            {isApproving ? 'Đang duyệt...' : 'Phê Duyệt & Chốt Kết Quả'}
          </Button>
        </div>
      </div>
    </div>
  );
};
