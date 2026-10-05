import React, { useState } from 'react';
import { X, Sparkles, FileText, User, Eye, Download, Award } from 'lucide-react';
import type { InternProfile, DocumentResponse, WeeklyAssessment, CreateWeeklyAssessmentPayload } from '../../../types';
import { MentorWeeklyEvaluationHub } from './MentorWeeklyEvaluationHub';
import { MentorFinalEvaluationTab } from './MentorFinalEvaluationTab';
import { documentService } from '../../../services/documentService';
import { Button } from '../../../components/common/Button/Button';
import styles from './MentorInternDetailDrawer.module.css';

interface MentorInternDetailDrawerProps {
  intern: InternProfile | null;
  isOpen: boolean;
  onClose: () => void;
  documents: DocumentResponse[];
  historyAssessments: WeeklyAssessment[];
  onSaveAssessment: (payload: CreateWeeklyAssessmentPayload) => Promise<void>;
  loading?: boolean;
}

export const MentorInternDetailDrawer: React.FC<MentorInternDetailDrawerProps> = ({
  intern,
  isOpen,
  onClose,
  documents,
  historyAssessments,
  onSaveAssessment,
  loading = false,
}) => {
  const [activeTab, setActiveTab] = useState<'evaluation' | 'final' | 'documents' | 'profile'>('evaluation');

  if (!isOpen || !intern) return null;

  const internDocs = documents.filter((d) => d.internCode === intern.internCode);

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true">
      <div 
        className={styles.drawer} 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Drawer */}
        <div className={styles.drawerHeader}>
          <div className={styles.headerInfo}>
            <div className={styles.avatar}>
              {intern.fullName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className={styles.title}>{intern.fullName}</h2>
              <span className={styles.subtitle}>
                {intern.internCode} • {intern.appliedPosition || 'Thực tập sinh'} • {intern.university}
              </span>
            </div>
          </div>

          <button 
            type="button" 
            className={styles.closeBtn} 
            onClick={onClose} 
            aria-label="Đóng bảng chi tiết"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className={styles.tabNav}>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'evaluation' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('evaluation')}
          >
            <Sparkles size={16} /> Đánh Giá & Đồng Hành Tuần
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'final' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('final')}
          >
            <Award size={16} /> Tổng Kết Kỳ Thực Tập
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'documents' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('documents')}
          >
            <FileText size={16} /> Hồ Sơ & Tài Liệu ({internDocs.length})
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'profile' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <User size={16} /> Thông Tin Tiếp Nhận
          </button>
        </div>

        {/* Tab Content */}
        <div className={styles.drawerContent}>
          {activeTab === 'evaluation' && (
            <MentorWeeklyEvaluationHub
              internCode={intern.internCode}
              internName={intern.fullName}
              currentWeek={8}
              historyAssessments={historyAssessments}
              onSaveAssessment={onSaveAssessment}
              loading={loading}
            />
          )}

          {activeTab === 'final' && (
            <MentorFinalEvaluationTab
              internCode={intern.internCode}
              internName={intern.fullName}
            />
          )}

          {activeTab === 'documents' && (
            <div className={styles.docSection}>
              {internDocs.length === 0 ? (
                <div className={styles.emptyDoc}>Chưa có tài liệu nào được nộp cho thực tập sinh này.</div>
              ) : (
                <div className={styles.docList}>
                  {internDocs.map((doc) => (
                    <div key={doc.id} className={styles.docItem}>
                      <div className={styles.docHeader}>
                        <FileText size={18} color="#6366f1" />
                        <div>
                          <p className={styles.docName}>{doc.originalFileName || doc.fileName}</p>
                          <span className={styles.docMeta}>
                            Loại: {doc.documentType === 'CV' ? 'CV Ứng Tuyển' : 'Tài Liệu'}
                          </span>
                        </div>
                      </div>
                      <div className={styles.docActions}>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => documentService.previewDocumentFile(doc.id)}
                        >
                          <Eye size={12} /> Xem
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => documentService.downloadDocumentFile(doc.id, doc.originalFileName)}
                        >
                          <Download size={12} /> Tải
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'profile' && (
            <div className={styles.profileSection}>
              <div className={styles.profileGrid}>
                <div className={styles.profileItem}>
                  <span className={styles.profileLabel}>Chương trình thực tập:</span>
                  <p className={styles.profileValue}>{intern.programName || 'Chương trình tiêu chuẩn'}</p>
                </div>
                <div className={styles.profileItem}>
                  <span className={styles.profileLabel}>Email liên hệ:</span>
                  <p className={styles.profileValue}>{intern.email}</p>
                </div>
                <div className={styles.profileItem}>
                  <span className={styles.profileLabel}>Số điện thoại:</span>
                  <p className={styles.profileValue}>{intern.phone || '—'}</p>
                </div>
                <div className={styles.profileItem}>
                  <span className={styles.profileLabel}>Trường đào tạo:</span>
                  <p className={styles.profileValue}>{intern.university} ({intern.major})</p>
                </div>
                <div className={styles.profileItem}>
                  <span className={styles.profileLabel}>Thời gian thực tập:</span>
                  <p className={styles.profileValue}>
                    {intern.startDate} → {intern.endDate || 'Hiện tại'}
                  </p>
                </div>
                <div className={styles.profileItem}>
                  <span className={styles.profileLabel}>Trạng thái hiện tại:</span>
                  <div className={styles.profileValue}>
                    <span className={`badge ${intern.status === 'INTERNING' ? 'badge-success' : 'badge-warning'}`}>
                      {intern.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
