import React from 'react';
import type { HrEvaluationSummaryItem } from '../../../../types/assessment.types';
import styles from './InternshipTranscriptPrintView.module.css';

interface InternshipTranscriptPrintViewProps {
  items: HrEvaluationSummaryItem[];
  isPrintMode?: boolean;
}

export const InternshipTranscriptPrintView: React.FC<InternshipTranscriptPrintViewProps> = ({
  items,
  isPrintMode = true
}) => {
  const currentDateStr = new Date().toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  const getResultBadgeClass = (res?: string) => {
    switch (res) {
      case 'EXCELLENT':
        return styles.badgeExcellent;
      case 'PASSED':
        return styles.badgePassed;
      case 'FAILED':
        return styles.badgeFailed;
      default:
        return styles.badgePassed;
    }
  };

  const getResultLabel = (res?: string) => {
    switch (res) {
      case 'EXCELLENT':
        return 'XUẤT SẮC (EXCELLENT)';
      case 'PASSED':
        return 'ĐẠT YÊU CẦU (PASSED)';
      case 'FAILED':
        return 'KHÔNG ĐẠT (FAILED)';
      default:
        return 'ĐẠT (PASSED)';
    }
  };

  const getRecommendationLabel = (rec?: string) => {
    switch (rec) {
      case 'HIRE_FULLTIME':
      case 'HIRE_FULL_TIME':
        return 'Đề xuất tuyển dụng chính thức (Offer Full-time)';
      case 'EXTEND_INTERNSHIP':
        return 'Đề xuất gia hạn thực tập (Extend Internship)';
      case 'PASS':
        return 'Đạt yêu cầu tốt nghiệp thực tập (Pass)';
      case 'FAIL':
      case 'DO_NOT_HIRE':
        return 'Không đạt yêu cầu (Fail)';
      default:
        return 'Chưa có ghi chú';
    }
  };

  return (
    <div className={isPrintMode ? styles.printRoot : styles.screenPreviewContainer}>
      {items.map((item) => (
        <section key={item.internId} className={styles.transcriptPage}>
          {/* Header */}
          <div className={styles.headerRow}>
            <div className={styles.companyInfo}>
              <div className={styles.companyName}>INTERNHUB ENTERPRISE</div>
              <div className={styles.companySub}>Hệ Thống Quản Trị Thực Tập Sinh & Phát Triển Nhân Tài</div>
              <div className={styles.companySub}>Địa chỉ: Tòa nhà Tech Center, Quận Cầu Giấy, Hà Nội</div>
            </div>
            <div className={styles.metaInfo}>
              <div><strong>Số VB:</strong> IH-BĐ/{item.programId || '2026'}/{item.internCode}</div>
              <div><strong>Ngày cấp:</strong> {currentDateStr}</div>
              <div><strong>Bảo mật:</strong> Lưu hành nội bộ / Nhà trường</div>
            </div>
          </div>

          {/* Title */}
          <div className={styles.docTitleSection}>
            <h1 className={styles.docTitle}>PHIẾU ĐÁNH GIÁ KẾT QUẢ THỰC TẬP</h1>
            <p className={styles.docSub}>INTERNSHIP EVALUATION &amp; OFFICIAL TRANSCRIPT</p>
          </div>

          {/* Intern Information */}
          <div className={styles.sectionBox}>
            <div className={styles.sectionHeader}>I. THÔNG TIN THỰC TẬP SINH</div>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Họ và tên:</span>
                <span className={styles.infoValue}>{item.internName}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Mã thực tập sinh:</span>
                <span className={styles.infoValue}>{item.internCode}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Trường Đại học:</span>
                <span className={styles.infoValue}>{item.university || 'N/A'}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Email liên hệ:</span>
                <span className={styles.infoValue}>{item.email}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Chương trình:</span>
                <span className={styles.infoValue}>{item.programName || 'Chương trình thực tập 2026'}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Vị trí thực tập:</span>
                <span className={styles.infoValue}>{item.appliedPosition || 'Software Engineer Intern'}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Phòng ban:</span>
                <span className={styles.infoValue}>{item.departmentName || 'N/A'}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Mentor hướng dẫn:</span>
                <span className={styles.infoValue}>{item.mentorName || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Score Table */}
          <div className={styles.sectionBox}>
            <div className={styles.sectionHeader}>II. KẾT QUẢ ĐÁNH GIÁ CHI TIẾT</div>
            <table className={styles.scoreTable}>
              <thead>
                <tr>
                  <th style={{ width: '40px' }}>STT</th>
                  <th>Tiêu chí đánh giá</th>
                  <th className={styles.weightCol}>Trọng số</th>
                  <th className={styles.scoreValueCol}>Điểm (10)</th>
                  <th>Ghi chú tiêu chí</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ textAlign: 'center' }}>1</td>
                  <td><strong>Năng lực chuyên môn (Technical Skills)</strong></td>
                  <td className={styles.weightCol}>40%</td>
                  <td className={styles.scoreValueCol}>{item.technicalScore != null ? item.technicalScore.toFixed(1) : '-'}</td>
                  <td>Chất lượng code, kiến trúc, mức độ giải quyết bài toán</td>
                </tr>
                <tr>
                  <td style={{ textAlign: 'center' }}>2</td>
                  <td><strong>Thái độ &amp; Tác phong (Attitude &amp; Discipline)</strong></td>
                  <td className={styles.weightCol}>35%</td>
                  <td className={styles.scoreValueCol}>{item.attitudeScore != null ? item.attitudeScore.toFixed(1) : '-'}</td>
                  <td>Chuyên cần, trách nhiệm, tuân thủ kỷ luật dự án</td>
                </tr>
                <tr>
                  <td style={{ textAlign: 'center' }}>3</td>
                  <td><strong>Kỹ năng mềm &amp; Làm việc nhóm (Soft Skills)</strong></td>
                  <td className={styles.weightCol}>25%</td>
                  <td className={styles.scoreValueCol}>{item.softSkillsScore != null ? item.softSkillsScore.toFixed(1) : '-'}</td>
                  <td>Giao tiếp, báo cáo, phối hợp đồng đội</td>
                </tr>
                <tr>
                  <td style={{ textAlign: 'center' }}>*</td>
                  <td><em>Điểm trung bình theo dõi tuần (Weekly Tracking)</em></td>
                  <td className={styles.weightCol}>Tham chiếu</td>
                  <td className={styles.scoreValueCol}>{item.weeklyAssessmentAvgScore != null ? item.weeklyAssessmentAvgScore.toFixed(1) : '-'}</td>
                  <td>Điểm snapshot lũy kế các tuần thực tập</td>
                </tr>
                <tr className={styles.totalRow}>
                  <td colSpan={2} style={{ textAlign: 'right', paddingRight: '16px' }}>
                    <strong>ĐIỂM TỔNG KẾT CUỐI KỲ (FINAL SCORE):</strong>
                  </td>
                  <td className={styles.weightCol}>100%</td>
                  <td className={styles.totalScore}>
                    {item.finalScore != null ? item.finalScore.toFixed(1) : '-'}
                  </td>
                  <td>
                    <span className={`${styles.badgeResult} ${getResultBadgeClass(item.internshipResult)}`}>
                      {getResultLabel(item.internshipResult)}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Feedback Section */}
          <div className={styles.sectionBox}>
            <div className={styles.sectionHeader}>III. Ý KIẾN NHẬN XÉT CỦA ĐƠN VỊ THỰC TẬP</div>

            <div className={styles.commentCard}>
              <div className={styles.commentLabel}>
                <span>📌 Điểm mạnh nổi bật (Strengths):</span>
              </div>
              <div className={styles.commentText}>
                {item.strengths || 'Thực tập sinh nắm bắt công việc nhanh, hoàn thành tốt các nhiệm vụ được giao.'}
              </div>
            </div>

            <div className={styles.commentCard}>
              <div className={styles.commentLabel}>
                <span>💡 Điểm cần phát triển thêm (Areas for Improvement):</span>
              </div>
              <div className={styles.commentText}>
                {item.areasForImprovement || 'Cần chủ động đào sâu hơn về kiến thức tối ưu hiệu năng và quy trình CI/CD.'}
              </div>
            </div>

            <div className={styles.commentCard}>
              <div className={styles.commentLabel}>
                <span>💼 Đề xuất nhân sự của Mentor (Mentor Recommendation):</span>
              </div>
              <div className={styles.commentText}>
                <strong>{getRecommendationLabel(item.recommendation)}</strong>
                {item.recommendationNote && <div>Ghi chú: {item.recommendationNote}</div>}
              </div>
            </div>

            {item.hrComments && (
              <div className={styles.commentCard} style={{ borderColor: '#2563eb', backgroundColor: '#eff6ff' }}>
                <div className={styles.commentLabel} style={{ color: '#1d4ed8' }}>
                  <span>🏛️ Xác nhận &amp; Nhận xét của Phòng Nhân Sự (HR Department):</span>
                </div>
                <div className={styles.commentText}>
                  {item.hrComments}
                </div>
              </div>
            )}
          </div>

          {/* Signatures */}
          <div className={styles.signatureSection}>
            <div className={styles.signatureBox}>
              <div className={styles.signRole}>NGƯỜI HƯỚNG DẪN (MENTOR)</div>
              <div className={styles.signSub}>(Ký và ghi rõ họ tên)</div>
              <div className={styles.stampSpace}></div>
              <div className={styles.signerName}>{item.mentorName || 'Mentor phụ trách'}</div>
            </div>

            <div className={styles.signatureBox}>
              <div className={styles.signRole}>ĐẠI DIỆN PHÒNG NHÂN SỰ (HR)</div>
              <div className={styles.signSub}>(Ký, đóng dấu công ty)</div>
              <div className={styles.stampSpace}>
                <span className={styles.sealMark}>[ ĐÃ PHÊ DUYỆT CHÍNH THỨC ]</span>
              </div>
              <div className={styles.signerName}>{item.hrApprovedBy || 'Bộ Phận Tuyển Dụng & Đào Tạo'}</div>
            </div>
          </div>
        </section>
      ))}
    </div>
  );
};
