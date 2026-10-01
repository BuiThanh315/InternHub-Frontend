import React, { useState, useEffect, useCallback } from 'react';
import { Users, CheckCircle2, FolderGit2 } from 'lucide-react';
import { toast } from 'sonner';
import { Header } from '../../components/layout/Header';
import { Skeleton } from '../../components/common';
import { MentorDetailPanel } from './components';
import { internService } from '../../services/internService';
import { documentService } from '../../services/documentService';
import { getInternStatusLabel, formatPhoneNumber } from '../../utils/formatters';
import type { InternProfile, DocumentResponse } from '../../types';
import styles from './MentorDashboard.module.css';

export const MentorDashboard: React.FC = () => {
  const [myInterns, setMyInterns] = useState<InternProfile[]>([]);
  const [documents, setDocuments] = useState<DocumentResponse[]>([]);
  const [selectedInternCode, setSelectedInternCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Ghi chú đánh giá thực tập sinh lưu trữ theo mã TTS thực tế
  const [notes, setNotes] = useState<{ [key: string]: string }>(() => {
    try {
      const saved = localStorage.getItem('internhub_mentor_notes');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [activeNoteText, setActiveNoteText] = useState('');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const internRes = await internService.getInterns();
      const items = internRes.items || internRes.content || [];
      const codes = items.map((i) => i.internCode);
      const docRes = await documentService.getAllDocuments(codes);

      setMyInterns(items);
      setDocuments(docRes);
      if (items.length > 0) {
        setSelectedInternCode(items[0].internCode);
        setActiveNoteText(notes[items[0].internCode] || '');
      }
    } catch (err) {
      console.error('Lỗi tải dữ liệu Mentor Dashboard:', err);
    } finally {
      setLoading(false);
    }
  }, [notes]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSelectIntern = (code: string) => {
    setSelectedInternCode(code);
    setActiveNoteText(notes[code] || '');
  };

  const handleSaveNote = () => {
    if (!selectedInternCode) return;
    const updated = { ...notes, [selectedInternCode]: activeNoteText };
    setNotes(updated);
    localStorage.setItem('internhub_mentor_notes', JSON.stringify(updated));
    toast.success('Đã lưu ghi chú đánh giá thực tập sinh thành công!');
  };

  const selectedInternInfo = myInterns.find((i) => i.internCode === selectedInternCode) || null;

  return (
    <div className="animate-fade-in">
      <Header
        title="Quản Lý Thực Tập Sinh (Mentor)"
        subtitle="Theo dõi tiến độ học việc, đánh giá hồ sơ và phê duyệt tài liệu thực tập"
      />

      <div>
        {/* Metric Overview Cards */}
        <div className={styles.metricsGrid}>
          <div className={styles.kpiCard}>
            <div className={`${styles.iconWrapper} ${styles.iconPrimary}`}>
              <Users size={24} />
            </div>
            <div>
              <p className={styles.kpiLabel}>TTS Phụ Trách</p>
              <h3 className={styles.kpiValue}>{myInterns.length}</h3>
            </div>
          </div>

          <div className={styles.kpiCard}>
            <div className={`${styles.iconWrapper} ${styles.iconSuccess}`}>
              <CheckCircle2 size={24} />
            </div>
            <div>
              <p className={styles.kpiLabel}>Đang Thực Tập</p>
              <h3 className={styles.kpiValue}>
                {myInterns.filter((i) => i.status === 'INTERNING' || i.status === 'APPROVED').length}
              </h3>
            </div>
          </div>

          <div className={styles.kpiCard}>
            <div className={`${styles.iconWrapper} ${styles.iconInfo}`}>
              <FolderGit2 size={24} />
            </div>
            <div>
              <p className={styles.kpiLabel}>Tài Liệu Đã Nộp</p>
              <h3 className={styles.kpiValue}>{documents.length}</h3>
            </div>
          </div>
        </div>

        {/* 2-Column Responsive Layout */}
        <div className={styles.twoColLayout}>
          {/* Left Column: Assigned Interns List */}
          <div className={styles.internListCard}>
            <h3 className={styles.internListHeader}>
              Danh Sách Thực Tập Sinh ({myInterns.length})
            </h3>

            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <Skeleton variant="card" height="110px" />
                <Skeleton variant="card" height="110px" />
                <Skeleton variant="card" height="110px" />
              </div>
            ) : myInterns.length === 0 ? (
              <p className={styles.emptyInternText}>
                Bạn chưa được phân công thực tập sinh nào.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {myInterns.map((intern) => {
                  const isSelected = selectedInternCode === intern.internCode;
                  return (
                    <div
                      key={intern.internCode}
                      onClick={() => handleSelectIntern(intern.internCode)}
                      className={`${styles.internItem} ${isSelected ? styles.internItemSelected : ''}`}
                    >
                      <div className={styles.internItemHeader}>
                        <div>
                          <h4 className={styles.internName}>{intern.fullName}</h4>
                          <span className={styles.internCodeSub}>
                            {intern.internCode} • {intern.appliedPosition}
                          </span>
                        </div>
                        <span className={`badge ${intern.status === 'INTERNING' ? 'badge-success' : 'badge-info'}`}>
                          {getInternStatusLabel(intern.status)}
                        </span>
                      </div>

                      <div className={styles.internDetailsGrid}>
                        <div>Trường: <strong>{intern.university}</strong></div>
                        <div>Ngành: <strong>{intern.major}</strong></div>
                        <div>GPA: <strong>{intern.gpa || '-'}</strong></div>
                        <div>SĐT: <strong>{formatPhoneNumber(intern.phone)}</strong></div>
                      </div>

                      {intern.programName && (
                        <div className={styles.programBadge}>
                          🎯 {intern.programName}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Detail Panel */}
          <MentorDetailPanel
            intern={selectedInternInfo}
            documents={documents}
            noteText={activeNoteText}
            onNoteChange={setActiveNoteText}
            onSaveNote={handleSaveNote}
          />
        </div>
      </div>
    </div>
  );
};

export default MentorDashboard;
