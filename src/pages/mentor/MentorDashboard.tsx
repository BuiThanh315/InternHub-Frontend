import React, { useState, useEffect, useCallback } from 'react';
import { Users, CheckCircle2, FolderGit2 } from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { MentorDetailPanel } from './components';
import { internService } from '../../services/internService';
import { documentService } from '../../services/documentService';
import type { InternProfile, DocumentResponse } from '../../types';

export const MentorDashboard: React.FC = () => {
  const [myInterns, setMyInterns] = useState<InternProfile[]>([]);
  const [documents, setDocuments] = useState<DocumentResponse[]>([]);
  const [selectedInternCode, setSelectedInternCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Mentorship notes state stored in localStorage per real intern
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
    alert('Đã lưu ghi chú đánh giá thực tập sinh thành công!');
  };

  const selectedInternInfo = myInterns.find((i) => i.internCode === selectedInternCode) || null;

  return (
    <div className="animate-fade-in">
      <Header
        title="Quản Lý Thực Tập Sinh (Mentor)"
        subtitle="Theo dõi tiến độ học việc, đánh giá hồ sơ và phê duyệt tài liệu thực tập"
      />

      <div style={{ marginTop: '1.5rem' }}>
        {/* Metric Overview Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.25rem',
            marginBottom: '2rem',
          }}
        >
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Users size={24} />
            </div>
            <div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>TTS Phụ Trách</p>
              <h3 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0 }}>{myInterns.length}</h3>
            </div>
          </div>

          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CheckCircle2 size={24} />
            </div>
            <div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Đang Thực Tập</p>
              <h3 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0 }}>
                {myInterns.filter((i) => i.status === 'INTERNING' || i.status === 'APPROVED').length}
              </h3>
            </div>
          </div>

          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                color: '#3b82f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FolderGit2 size={24} />
            </div>
            <div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Tài Liệu Đã Nộp</p>
              <h3 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0 }}>{documents.length}</h3>
            </div>
          </div>
        </div>

        {/* 2-Column Layout */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(320px, 1fr) minmax(360px, 1fr)',
            gap: '1.5rem',
            alignItems: 'start',
          }}
        >
          {/* Left Column: Assigned Interns List */}
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>
              Danh Sách Thực Tập Sinh ({myInterns.length})
            </h3>

            {loading ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
                Đang nạp danh sách thực tập sinh...
              </p>
            ) : myInterns.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
                Bạn chưa được phân công thực tập sinh nào.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {myInterns.map((intern) => {
                  const isSelected = selectedInternCode === intern.internCode;
                  return (
                    <div
                      key={intern.internCode}
                      onClick={() => handleSelectIntern(intern.internCode)}
                      style={{
                        padding: '1rem',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-default)',
                        backgroundColor: isSelected ? 'var(--primary-light)' : 'var(--bg-surface)',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>{intern.fullName}</h4>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                            {intern.internCode} • {intern.appliedPosition}
                          </span>
                        </div>
                        <span className={`badge ${intern.status === 'INTERNING' ? 'badge-success' : 'badge-info'}`}>
                          {intern.status}
                        </span>
                      </div>

                      <div
                        style={{
                          fontSize: '0.8rem',
                          color: 'var(--text-secondary)',
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr',
                          gap: '0.4rem',
                          marginTop: '0.5rem',
                        }}
                      >
                        <div>Trường: <strong>{intern.university}</strong></div>
                        <div>Ngành: <strong>{intern.major}</strong></div>
                        <div>GPA: <strong>{intern.gpa || '-'}</strong></div>
                        <div>SĐT: <strong>{intern.phone}</strong></div>
                      </div>
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
