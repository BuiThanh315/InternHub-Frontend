import React, { useState, useEffect } from 'react';
import { Award, Code, Smile, ThumbsUp, Send, CheckCircle, Save } from 'lucide-react';
import { Button } from '../../../components/common/Button/Button';
import { assessmentService } from '../../../services/assessmentService';
import type { InternEvaluation, CreateInternEvaluationPayload, RecommendationType } from '../../../types';
import { toast } from 'sonner';
import styles from './MentorFinalEvaluationTab.module.css';

interface MentorFinalEvaluationTabProps {
  internCode: string;
  internName: string;
}

export const MentorFinalEvaluationTab: React.FC<MentorFinalEvaluationTabProps> = ({
  internCode,
  internName,
}) => {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [existingEval, setExistingEval] = useState<InternEvaluation | null>(null);

  // Form states
  const [technicalScore, setTechnicalScore] = useState<number>(8.0);
  const [technicalComments, setTechnicalComments] = useState<string>('');
  const [attitudeScore, setAttitudeScore] = useState<number>(8.5);
  const [attitudeComments, setAttitudeComments] = useState<string>('');
  const [softSkillsScore, setSoftSkillsScore] = useState<number>(8.0);
  const [strengths, setStrengths] = useState<string>('');
  const [areasForImprovement, setAreasForImprovement] = useState<string>('');
  const [recommendation, setRecommendation] = useState<RecommendationType>('HIRE_FULLTIME');
  const [recommendationNote, setRecommendationNote] = useState<string>('');

  useEffect(() => {
    loadExistingEvaluation();
  }, [internCode]);

  const loadExistingEvaluation = async () => {
    try {
      setLoading(true);
      const data = await assessmentService.getEvaluation(internCode, 'FINAL');
      if (data) {
        setExistingEval(data);
        setTechnicalScore(data.technicalScore || 8.0);
        setTechnicalComments(data.technicalComments || '');
        setAttitudeScore(data.attitudeScore || 8.5);
        setAttitudeComments(data.attitudeComments || '');
        setSoftSkillsScore(data.softSkillsScore || 8.0);
        setStrengths(data.strengths || '');
        setAreasForImprovement(data.areasForImprovement || '');
        setRecommendation(data.recommendation || 'HIRE_FULLTIME');
        setRecommendationNote(data.recommendationNote || '');
      }
    } catch (err) {
      console.error('Lỗi khi tải thông tin đánh giá tổng kết:', err);
    } finally {
      setLoading(false);
    }
  };

  // Tính điểm tổng kết theo trọng số: Technical 40% + Attitude 35% + SoftSkills 25%
  const calculateFinalScore = () => {
    const score = technicalScore * 0.4 + attitudeScore * 0.35 + softSkillsScore * 0.25;
    return Math.round(score * 10) / 10;
  };

  const handleSubmit = async (isSubmit: boolean) => {
    if (!technicalComments.trim()) {
      toast.error('Vui lòng nhập nhận xét Kỹ năng chuyên môn');
      return;
    }
    if (!attitudeComments.trim()) {
      toast.error('Vui lòng nhập nhận xét Thái độ & Tác phong làm việc');
      return;
    }

    const payload: CreateInternEvaluationPayload = {
      evaluationType: 'FINAL',
      technicalScore,
      technicalComments,
      attitudeScore,
      attitudeComments,
      softSkillsScore,
      strengths,
      areasForImprovement,
      recommendation,
      recommendationNote,
      isSubmit,
    };

    try {
      setSubmitting(true);
      const res = await assessmentService.saveEvaluation(internCode, payload);
      setExistingEval(res);
      toast.success(
        isSubmit
          ? 'Đã nộp đánh giá tổng kết cho bộ phận HR thành công!'
          : 'Đã lưu bản nháp đánh giá tổng kết!'
      );
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Có lỗi xảy ra khi lưu đánh giá');
    } finally {
      setSubmitting(false);
    }
  };

  const isSubmitted = existingEval?.status === 'SUBMITTED' || existingEval?.status === 'APPROVED';

  return (
    <div className={styles.container}>
      {/* Banner Điểm Tham Chiếu Tuần */}
      <div className={styles.banner}>
        <div className={styles.bannerInfo}>
          <h3>Tổng Kết Thực Tập & Đánh Giá Kỹ Năng - {internName}</h3>
          <p>Đánh giá toàn diện năng lực thực tế, tác phong làm việc và khuyến nghị nhân sự cho kỳ thực tập.</p>
        </div>
        <div className={styles.refScoreBadge}>
          <div>
            <span className={styles.refLabel}>ĐTB Tuần Tích Lũy</span>
            <div className={styles.refVal}>
              {existingEval?.weeklyAssessmentAvgScore ? `${existingEval.weeklyAssessmentAvgScore} ⭐` : '4.6 ⭐'}
            </div>
          </div>
          {isSubmitted && (
            <span className="badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <CheckCircle size={14} /> Đã nộp HR
            </span>
          )}
        </div>
      </div>

      <div className={styles.gridSection}>
        {/* Phần 1: Kỹ Năng Chuyên Môn */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <Code size={18} color="#6366f1" />
            <span>1. Kỹ Năng Chuyên Môn (Technical)</span>
          </div>

          <div className={styles.scoreRow}>
            <div className={styles.scoreLabelRow}>
              <span className={styles.scoreLabel}>Điểm chuyên môn (Hệ số 40%)</span>
              <span className={styles.scoreValue}>{technicalScore} / 10</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              step="0.5"
              value={technicalScore}
              disabled={isSubmitted}
              onChange={(e) => setTechnicalScore(parseFloat(e.target.value))}
              className={styles.sliderInput}
            />
          </div>

          <textarea
            className={styles.textareaField}
            placeholder="Nhận xét cụ thể về kiến thức công nghệ, khả năng giải quyết vấn đề, chất lượng mã nguồn..."
            value={technicalComments}
            disabled={isSubmitted}
            onChange={(e) => setTechnicalComments(e.target.value)}
          />
        </div>

        {/* Phần 2: Thái Độ & Tác Phong Làm Việc */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <Smile size={18} color="#10b981" />
            <span>2. Thái Độ & Tác Phong Nghề Nghiệp</span>
          </div>

          <div className={styles.scoreRow}>
            <div className={styles.scoreLabelRow}>
              <span className={styles.scoreLabel}>Thái độ & Trách nhiệm (Hệ số 35%)</span>
              <span className={styles.scoreValue}>{attitudeScore} / 10</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              step="0.5"
              value={attitudeScore}
              disabled={isSubmitted}
              onChange={(e) => setAttitudeScore(parseFloat(e.target.value))}
              className={styles.sliderInput}
            />
          </div>

          <div className={styles.scoreRow}>
            <div className={styles.scoreLabelRow}>
              <span className={styles.scoreLabel}>Kỹ năng mềm & Giao tiếp (Hệ số 25%)</span>
              <span className={styles.scoreValue}>{softSkillsScore} / 10</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              step="0.5"
              value={softSkillsScore}
              disabled={isSubmitted}
              onChange={(e) => setSoftSkillsScore(parseFloat(e.target.value))}
              className={styles.sliderInput}
            />
          </div>

          <textarea
            className={styles.textareaField}
            placeholder="Nhận xét về tinh thần học hỏi, tính kỷ luật, đúng giờ, chủ động trao đổi với đồng nghiệp..."
            value={attitudeComments}
            disabled={isSubmitted}
            onChange={(e) => setAttitudeComments(e.target.value)}
          />
        </div>
      </div>

      {/* Điểm Tổng Kết Tính Tự Động */}
      <div className={styles.summaryScoreCard}>
        <div>
          <h4>Điểm Đánh Giá Tổng Kết Chung (Final Score)</h4>
          <p>Tính tự động dựa trên trọng số chuẩn hóa: Chuyên môn (40%) + Thái độ (35%) + Kỹ năng mềm (25%)</p>
        </div>
        <div className={styles.totalScoreNum}>{calculateFinalScore()}</div>
      </div>

      <div className={styles.gridSection}>
        {/* Điểm mạnh & Điểm cần cải thiện */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <ThumbsUp size={18} color="#3b82f6" />
            <span>3. Nhận Xét Điểm Mạnh & Định Hướng Phát Triển</span>
          </div>

          <div>
            <span className={styles.scoreLabel}>Điểm mạnh nổi bật:</span>
            <textarea
              className={styles.textareaField}
              style={{ minHeight: '60px', marginTop: '0.25rem' }}
              placeholder="VD: Nắm bắt nhanh kiến trúc mới, tư duy giải thuật tốt..."
              value={strengths}
              disabled={isSubmitted}
              onChange={(e) => setStrengths(e.target.value)}
            />
          </div>

          <div>
            <span className={styles.scoreLabel}>Điểm cần rèn luyện thêm:</span>
            <textarea
              className={styles.textareaField}
              style={{ minHeight: '60px', marginTop: '0.25rem' }}
              placeholder="VD: Cần tự tin thuyết trình tài liệu kiến trúc trước nhóm..."
              value={areasForImprovement}
              disabled={isSubmitted}
              onChange={(e) => setAreasForImprovement(e.target.value)}
            />
          </div>
        </div>

        {/* Khuyến nghị tuyển dụng */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <Award size={18} color="#f59e0b" />
            <span>4. Khuyến Nghị Nhân Sự Chính Thức</span>
          </div>

          <div className={styles.recommendationGrid}>
            <div
              className={`${styles.recommendationPill} ${recommendation === 'HIRE_FULLTIME' ? styles.recommendationPillActive : ''}`}
              onClick={() => !isSubmitted && setRecommendation('HIRE_FULLTIME')}
            >
              <span>🚀</span>
              <span className={styles.pillLabel}>Tuyển Dụng Full-time</span>
            </div>

            <div
              className={`${styles.recommendationPill} ${recommendation === 'EXTEND_INTERNSHIP' ? styles.recommendationPillActive : ''}`}
              onClick={() => !isSubmitted && setRecommendation('EXTEND_INTERNSHIP')}
            >
              <span>⏳</span>
              <span className={styles.pillLabel}>Gia Hạn Thực Tập</span>
            </div>

            <div
              className={`${styles.recommendationPill} ${recommendation === 'PASS' ? styles.recommendationPillActive : ''}`}
              onClick={() => !isSubmitted && setRecommendation('PASS')}
            >
              <span>✅</span>
              <span className={styles.pillLabel}>Đạt (Cấp Chứng Chỉ)</span>
            </div>

            <div
              className={`${styles.recommendationPill} ${recommendation === 'FAIL' ? styles.recommendationPillActive : ''}`}
              onClick={() => !isSubmitted && setRecommendation('FAIL')}
            >
              <span>❌</span>
              <span className={styles.pillLabel}>Không Đạt Yêu Cầu</span>
            </div>
          </div>

          <div>
            <span className={styles.scoreLabel}>Ghi chú chi tiết cho Ban Quản Lý / HR:</span>
            <textarea
              className={styles.textareaField}
              style={{ minHeight: '60px', marginTop: '0.25rem' }}
              placeholder="Đề xuất vị trí, phòng ban hoặc lý do cụ thể..."
              value={recommendationNote}
              disabled={isSubmitted}
              onChange={(e) => setRecommendationNote(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Action Bar */}
      {!isSubmitted && (
        <div className={styles.actionBar}>
          <Button
            variant="outline"
            disabled={submitting || loading}
            onClick={() => handleSubmit(false)}
          >
            <Save size={16} /> Lưu Bản Nháp
          </Button>
          <Button
            variant="primary"
            disabled={submitting || loading}
            onClick={() => handleSubmit(true)}
          >
            <Send size={16} /> Nộp Đánh Giá Cho HR
          </Button>
        </div>
      )}
    </div>
  );
};
