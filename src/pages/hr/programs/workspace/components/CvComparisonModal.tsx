import React from 'react';
import {
  X,
  Award,
  Bookmark,
  CheckCircle2,
  XCircle,
  Calendar,
  Sparkles,
  ExternalLink,
  GraduationCap,
  Briefcase,
  AlertTriangle,
} from 'lucide-react';
import type { InternProfile, ScreeningResultDto } from '../../../../../types';
import styles from './CvComparisonModal.module.css';

interface CandidateComparisonItem {
  intern: InternProfile;
  evaluation: ScreeningResultDto | null;
}

interface CvComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidateA: CandidateComparisonItem;
  candidateB: CandidateComparisonItem;
  bookmarkedIds: number[];
  onToggleBookmark: (internId: number) => void;
  onOpenScheduleModal?: (candidate: { candidateId: number; email: string; fullName: string }) => void;
  onViewInternDetail?: (intern: InternProfile) => void;
}

export const CvComparisonModal: React.FC<CvComparisonModalProps> = ({
  isOpen,
  onClose,
  candidateA,
  candidateB,
  bookmarkedIds,
  onToggleBookmark,
  onOpenScheduleModal,
  onViewInternDetail,
}) => {
  if (!isOpen) return null;

  const scoreA = candidateA.evaluation?.overallScore ?? -1;
  const scoreB = candidateB.evaluation?.overallScore ?? -1;

  const isAWinner = scoreA > scoreB && scoreA >= 0;
  const isBWinner = scoreB > scoreA && scoreB >= 0;

  const isABookmarked = bookmarkedIds.includes(candidateA.intern.id);
  const isBBookmarked = bookmarkedIds.includes(candidateB.intern.id);

  // Tập hợp danh sách kỹ năng duy nhất giữa 2 ứng viên
  const skillsA = candidateA.evaluation?.skillsMatched || [];
  const skillsB = candidateB.evaluation?.skillsMatched || [];
  const allSkills = Array.from(new Set([...skillsA, ...skillsB]));

  const getScoreColor = (score: number) => {
    if (score >= 75) return styles.scoreEmerald;
    if (score >= 50) return styles.scoreAmber;
    if (score >= 0) return styles.scoreRose;
    return styles.scoreSlate;
  };

  const getRecommendationBadge = (rec?: string) => {
    switch (rec) {
      case 'HIGHLY_RECOMMENDED':
        return <span className={`${styles.recBadge} ${styles.recHigh}`}>Ưu tiên tuyển chọn</span>;
      case 'CONSIDER':
        return <span className={`${styles.recBadge} ${styles.recMed}`}>Cần xem xét thêm</span>;
      case 'NOT_RECOMMENDED':
        return <span className={`${styles.recBadge} ${styles.recLow}`}>Không khuyến nghị</span>;
      default:
        return <span className={`${styles.recBadge} ${styles.recNone}`}>Chưa có đánh giá</span>;
    }
  };

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="cv-compare-title">
      <div className={styles.modal}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <div className={styles.headerTitleGroup}>
            <div className={styles.headerIcon} aria-hidden="true">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 id="cv-compare-title" className={styles.title}>
                Đối Soát & So Sánh Ứng Viên Song Song
              </h2>
              <p className={styles.subtitle}>
                Phân tích đối chiếu chỉ số AI, năng lực kỹ năng và tiềm năng giữa 2 hồ sơ
              </p>
            </div>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Đóng bảng so sánh"
          >
            <X size={20} />
          </button>
        </div>

        {/* Comparison Body */}
        <div className={styles.modalBody}>
          <div className={styles.comparisonGrid}>
            {/* Candidate A Column */}
            <div className={`${styles.candidateCol} ${isAWinner ? styles.candidateColWinner : ''}`}>
              {isAWinner && (
                <div className={styles.winnerRibbon}>
                  <Award size={14} /> Điểm AI vượt trội
                </div>
              )}

              <div className={styles.colHeader}>
                <div className={styles.candidateHeaderInfo}>
                  <div className={styles.avatar}>
                    {(candidateA.intern.fullName || 'A').slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className={styles.candidateName}>{candidateA.intern.fullName}</h3>
                    <div className={styles.candidateSub}>{candidateA.intern.email}</div>
                  </div>
                </div>

                <div className={styles.headerActions}>
                  <button
                    type="button"
                    className={`${styles.iconActionBtn} ${isABookmarked ? styles.bookmarked : ''}`}
                    onClick={() => onToggleBookmark(candidateA.intern.id)}
                    title={isABookmarked ? 'Bỏ ghim ứng viên' : 'Ghim ứng viên tiềm năng'}
                    aria-label="Ghim ứng viên A"
                  >
                    <Bookmark size={16} fill={isABookmarked ? 'currentColor' : 'none'} />
                  </button>
                  {onViewInternDetail && (
                    <button
                      type="button"
                      className={styles.iconActionBtn}
                      onClick={() => onViewInternDetail(candidateA.intern)}
                      title="Xem toàn bộ hồ sơ chi tiết"
                      aria-label="Xem chi tiết ứng viên A"
                    >
                      <ExternalLink size={16} />
                    </button>
                  )}
                </div>
              </div>

              {/* Education & GPA */}
              <div className={styles.infoMetaBox}>
                <div className={styles.metaRow}>
                  <GraduationCap size={15} className="text-slate-400" />
                  <span>
                    <strong>Trường:</strong> {candidateA.intern.university || 'Chưa cập nhật'}
                  </span>
                </div>
                <div className={styles.metaRow}>
                  <Briefcase size={15} className="text-slate-400" />
                  <span>
                    <strong>Chuyên ngành:</strong> {candidateA.intern.major || 'Chưa cập nhật'}
                  </span>
                </div>
                <div className={styles.metaRow}>
                  <span className={styles.gpaPill}>
                    GPA: {candidateA.intern.gpa ? candidateA.intern.gpa.toFixed(2) : '--'}
                  </span>
                </div>
              </div>

              {/* AI Score Banner */}
              <div className={styles.scoreBanner}>
                <div className={styles.scoreTextGroup}>
                  <span className={styles.scoreLabel}>Độ tương thích AI</span>
                  <div className={styles.scoreValueGroup}>
                    <span className={`${styles.scoreNumber} ${getScoreColor(scoreA)}`}>
                      {scoreA >= 0 ? `${Math.round(scoreA)}%` : '--'}
                    </span>
                    {getRecommendationBadge(candidateA.evaluation?.recommendation)}
                  </div>
                </div>
              </div>

              {/* AI Summary */}
              <div className={styles.sectionBlock}>
                <h4 className={styles.sectionTitle}>Tóm Tắt Đánh Giá</h4>
                <p className={styles.summaryText}>
                  {candidateA.evaluation?.matchSummary ||
                    'Ứng viên chưa được phân tích hồ sơ qua AI Screening.'}
                </p>
              </div>

              {/* Strengths */}
              <div className={styles.sectionBlock}>
                <h4 className={styles.sectionTitle}>Điểm Mạnh Nổi Bật</h4>
                {candidateA.evaluation?.strengths && candidateA.evaluation.strengths.length > 0 ? (
                  <ul className={styles.bulletList}>
                    {candidateA.evaluation.strengths.map((str: string, idx: number) => (
                      <li key={idx} className={styles.bulletItemGreen}>
                        <CheckCircle2 size={15} className="text-emerald-500 shrink-0 mt-0.5" />
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span className={styles.emptyNote}>Không có thông tin</span>
                )}
              </div>

              {/* Weaknesses */}
              <div className={styles.sectionBlock}>
                <h4 className={styles.sectionTitle}>Điểm Cần Lưu Ý</h4>
                {candidateA.evaluation?.weaknesses && candidateA.evaluation.weaknesses.length > 0 ? (
                  <ul className={styles.bulletList}>
                    {candidateA.evaluation.weaknesses.map((weak: string, idx: number) => (
                      <li key={idx} className={styles.bulletItemRed}>
                        <AlertTriangle size={15} className="text-amber-500 shrink-0 mt-0.5" />
                        <span>{weak}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span className={styles.emptyNote}>Không có điểm trừ đáng chú ý</span>
                )}
              </div>

              {/* Footer CTA */}
              <div className={styles.colFooter}>
                {onOpenScheduleModal && (
                  <button
                    type="button"
                    className={styles.ctaPrimaryBtn}
                    onClick={() =>
                      onOpenScheduleModal({
                        candidateId: candidateA.intern.id,
                        email: candidateA.intern.email || '',
                        fullName: candidateA.intern.fullName || 'Ứng viên',
                      })
                    }
                  >
                    <Calendar size={16} /> Đặt lịch phỏng vấn
                  </button>
                )}
              </div>
            </div>

            {/* Candidate B Column */}
            <div className={`${styles.candidateCol} ${isBWinner ? styles.candidateColWinner : ''}`}>
              {isBWinner && (
                <div className={styles.winnerRibbon}>
                  <Award size={14} /> Điểm AI vượt trội
                </div>
              )}

              <div className={styles.colHeader}>
                <div className={styles.candidateHeaderInfo}>
                  <div className={styles.avatar}>
                    {(candidateB.intern.fullName || 'B').slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className={styles.candidateName}>{candidateB.intern.fullName}</h3>
                    <div className={styles.candidateSub}>{candidateB.intern.email}</div>
                  </div>
                </div>

                <div className={styles.headerActions}>
                  <button
                    type="button"
                    className={`${styles.iconActionBtn} ${isBBookmarked ? styles.bookmarked : ''}`}
                    onClick={() => onToggleBookmark(candidateB.intern.id)}
                    title={isBBookmarked ? 'Bỏ ghim ứng viên' : 'Ghim ứng viên tiềm năng'}
                    aria-label="Ghim ứng viên B"
                  >
                    <Bookmark size={16} fill={isBBookmarked ? 'currentColor' : 'none'} />
                  </button>
                  {onViewInternDetail && (
                    <button
                      type="button"
                      className={styles.iconActionBtn}
                      onClick={() => onViewInternDetail(candidateB.intern)}
                      title="Xem toàn bộ hồ sơ chi tiết"
                      aria-label="Xem chi tiết ứng viên B"
                    >
                      <ExternalLink size={16} />
                    </button>
                  )}
                </div>
              </div>

              {/* Education & GPA */}
              <div className={styles.infoMetaBox}>
                <div className={styles.metaRow}>
                  <GraduationCap size={15} className="text-slate-400" />
                  <span>
                    <strong>Trường:</strong> {candidateB.intern.university || 'Chưa cập nhật'}
                  </span>
                </div>
                <div className={styles.metaRow}>
                  <Briefcase size={15} className="text-slate-400" />
                  <span>
                    <strong>Chuyên ngành:</strong> {candidateB.intern.major || 'Chưa cập nhật'}
                  </span>
                </div>
                <div className={styles.metaRow}>
                  <span className={styles.gpaPill}>
                    GPA: {candidateB.intern.gpa ? candidateB.intern.gpa.toFixed(2) : '--'}
                  </span>
                </div>
              </div>

              {/* AI Score Banner */}
              <div className={styles.scoreBanner}>
                <div className={styles.scoreTextGroup}>
                  <span className={styles.scoreLabel}>Độ tương thích AI</span>
                  <div className={styles.scoreValueGroup}>
                    <span className={`${styles.scoreNumber} ${getScoreColor(scoreB)}`}>
                      {scoreB >= 0 ? `${Math.round(scoreB)}%` : '--'}
                    </span>
                    {getRecommendationBadge(candidateB.evaluation?.recommendation)}
                  </div>
                </div>
              </div>

              {/* AI Summary */}
              <div className={styles.sectionBlock}>
                <h4 className={styles.sectionTitle}>Tóm Tắt Đánh Giá</h4>
                <p className={styles.summaryText}>
                  {candidateB.evaluation?.matchSummary ||
                    'Ứng viên chưa được phân tích hồ sơ qua AI Screening.'}
                </p>
              </div>

              {/* Strengths */}
              <div className={styles.sectionBlock}>
                <h4 className={styles.sectionTitle}>Điểm Mạnh Nổi Bật</h4>
                {candidateB.evaluation?.strengths && candidateB.evaluation.strengths.length > 0 ? (
                  <ul className={styles.bulletList}>
                    {candidateB.evaluation.strengths.map((str: string, idx: number) => (
                      <li key={idx} className={styles.bulletItemGreen}>
                        <CheckCircle2 size={15} className="text-emerald-500 shrink-0 mt-0.5" />
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span className={styles.emptyNote}>Không có thông tin</span>
                )}
              </div>

              {/* Weaknesses */}
              <div className={styles.sectionBlock}>
                <h4 className={styles.sectionTitle}>Điểm Cần Lưu Ý</h4>
                {candidateB.evaluation?.weaknesses && candidateB.evaluation.weaknesses.length > 0 ? (
                  <ul className={styles.bulletList}>
                    {candidateB.evaluation.weaknesses.map((weak: string, idx: number) => (
                      <li key={idx} className={styles.bulletItemRed}>
                        <AlertTriangle size={15} className="text-amber-500 shrink-0 mt-0.5" />
                        <span>{weak}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span className={styles.emptyNote}>Không có điểm trừ đáng chú ý</span>
                )}
              </div>

              {/* Footer CTA */}
              <div className={styles.colFooter}>
                {onOpenScheduleModal && (
                  <button
                    type="button"
                    className={styles.ctaPrimaryBtn}
                    onClick={() =>
                      onOpenScheduleModal({
                        candidateId: candidateB.intern.id,
                        email: candidateB.intern.email || '',
                        fullName: candidateB.intern.fullName || 'Ứng viên',
                      })
                    }
                  >
                    <Calendar size={16} /> Đặt lịch phỏng vấn
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Cross Skills Comparison Matrix */}
          {allSkills.length > 0 && (
            <div className={styles.skillsMatrixBox}>
              <h4 className={styles.matrixTitle}>Bảng Đối Chiếu Kỹ Năng Trùng Khớp</h4>
              <div className={styles.matrixTable}>
                <div className={styles.matrixHeaderRow}>
                  <div className={styles.matrixSkillCol}>Kỹ Năng Yêu Cầu</div>
                  <div className={styles.matrixCandidateCol}>{candidateA.intern.fullName}</div>
                  <div className={styles.matrixCandidateCol}>{candidateB.intern.fullName}</div>
                </div>
                {allSkills.map((skill, idx) => {
                  const hasA = skillsA.includes(skill);
                  const hasB = skillsB.includes(skill);
                  return (
                    <div key={idx} className={styles.matrixRow}>
                      <div className={styles.matrixSkillCol}>
                        <span className={styles.skillPill}>{skill}</span>
                      </div>
                      <div className={styles.matrixCandidateCol}>
                        {hasA ? (
                          <CheckCircle2 size={18} className="text-emerald-500" />
                        ) : (
                          <XCircle size={18} className="text-slate-300" />
                        )}
                      </div>
                      <div className={styles.matrixCandidateCol}>
                        {hasB ? (
                          <CheckCircle2 size={18} className="text-emerald-500" />
                        ) : (
                          <XCircle size={18} className="text-slate-300" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
