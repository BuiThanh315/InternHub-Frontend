import React from 'react';
import { Edit3, ExternalLink, Globe } from 'lucide-react';
import { Button } from '../../../../components/common';
import type { InternAcademicTabProps } from './InternAcademicTab.types';
import styles from './InternAcademicTab.module.css';

export const InternAcademicTab: React.FC<InternAcademicTabProps> = ({
  profile,
  onOpenEditAcademic,
}) => {
  // Lấy danh sách kỹ năng (nếu có từ profile)
  const skillsList: string[] = (profile as any)?.skills || [];
  const linkedin = (profile as any)?.linkedinUrl;
  const github = (profile as any)?.githubUrl;

  return (
    <div className={styles.tabCard}>
      <div className={styles.cardHeader}>
        <div className={styles.titleArea}>
          <h3 className={styles.cardTitle}>Học Vấn & Kỹ Năng Chuyên Môn</h3>
          <p className={styles.cardSubtitle}>
            Hồ sơ học thuật, kết quả học tập và năng lực kỹ thuật của thực tập sinh
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={onOpenEditAcademic}
          leftIcon={<Edit3 size={15} />}
        >
          Cập Nhật Học Vấn
        </Button>
      </div>

      <div className={styles.infoGrid}>
        <div className={styles.infoItem}>
          <span className={styles.label}>Trường Đại học / Cao đẳng</span>
          <span className={styles.value}>
            {profile?.university || <em className={styles.emptyValue}>Chưa cập nhật</em>}
          </span>
        </div>

        <div className={styles.infoItem}>
          <span className={styles.label}>Chuyên ngành đào tạo</span>
          <span className={styles.value}>
            {profile?.major || <em className={styles.emptyValue}>Chưa cập nhật</em>}
          </span>
        </div>

        <div className={styles.infoItem}>
          <span className={styles.label}>Niên khóa đào tạo</span>
          <span className={styles.value}>
            {profile?.academicYear || <em className={styles.emptyValue}>Chưa cập nhật</em>}
          </span>
        </div>

        <div className={styles.infoItem}>
          <span className={styles.label}>Điểm trung bình (GPA)</span>
          <span className={styles.value}>
            {profile?.gpa !== null && profile?.gpa !== undefined ? (
              `${profile.gpa} / 4.0`
            ) : (
              <em className={styles.emptyValue}>Chưa cập nhật</em>
            )}
          </span>
        </div>
      </div>

      {/* Kỹ năng chuyên môn (Tags) */}
      <div className={styles.sectionBlock}>
        <span className={styles.label}>Kỹ năng kỹ thuật & Công nghệ</span>
        {skillsList.length > 0 ? (
          <div className={styles.skillsContainer}>
            {skillsList.map((skill, index) => (
              <span key={index} className={styles.skillBadge}>
                {skill}
              </span>
            ))}
          </div>
        ) : (
          <p className={styles.emptyValue}>Chưa thêm thẻ kỹ năng chuyên môn.</p>
        )}
      </div>

      {/* Liên kết cá nhân (LinkedIn / GitHub) - Bảo vệ XSS Safe URL */}
      <div className={styles.sectionBlock}>
        <span className={styles.label}>Liên kết hồ sơ trực tuyến</span>
        <div className={styles.linksList}>
          {linkedin ? (
            <a
              href={linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.linkItem}
            >
              <Globe size={15} />
              <span>LinkedIn Profile</span>
              <ExternalLink size={13} />
            </a>
          ) : (
            <span className={styles.emptyValue}>Chưa liên kết LinkedIn</span>
          )}

          {github ? (
            <a
              href={github}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.linkItem}
            >
              <Globe size={15} />
              <span>GitHub Repository</span>
              <ExternalLink size={13} />
            </a>
          ) : (
            <span className={styles.emptyValue}>Chưa liên kết GitHub</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default InternAcademicTab;
