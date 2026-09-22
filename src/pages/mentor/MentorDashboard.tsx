import React, { useState, useEffect } from 'react';
import {
  Users,
  CheckCircle2,
  FolderGit2,
  FileText,
  Download,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { internService } from '../../services/internService';
import { documentService } from '../../services/documentService';
import type { InternProfile, DocumentResponse } from '../../types';

export const MentorDashboard: React.FC = () => {
  const [myInterns, setMyInterns] = useState<InternProfile[]>([]);
  const [documents, setDocuments] = useState<DocumentResponse[]>([]);
  const [selectedInternCode, setSelectedInternCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Mentorship notes state
  const [notes, setNotes] = useState<{ [key: string]: string }>({
    'INT-2026-001': 'Hoàn thành tốt tuần Onboarding, đang tìm hiểu kiến trúc Microservices và Spring Cloud.',
    'INT-2026-002': 'Cần hỗ trợ thêm về React Router và quản lý State.',
  });
  const [activeNoteText, setActiveNoteText] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [internRes, docRes] = await Promise.all([
        internService.getInterns(),
        documentService.getAllDocuments(),
      ]);

      // Lọc các thực tập sinh thuộc mentorId = 3 hoặc được gán tên mentor
      const filtered = internRes.content.filter(
        (i) => i.mentorId === 3 || i.mentorName?.includes('Hướng Dẫn')
      );
      setMyInterns(filtered);
      setDocuments(docRes);
      if (filtered.length > 0) {
        setSelectedInternCode(filtered[0].internCode);
        setActiveNoteText(notes[filtered[0].internCode] || '');
      }
    } catch (err) {
      console.error('Lỗi tải dữ liệu Mentor Dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectIntern = (code: string) => {
    setSelectedInternCode(code);
    setActiveNoteText(notes[code] || '');
  };

  const handleSaveNote = () => {
    if (!selectedInternCode) return;
    setNotes((prev) => ({ ...prev, [selectedInternCode]: activeNoteText }));
    alert('Đã lưu ghi chú hướng dẫn thành công!');
  };

  const selectedInternDocs = documents.filter((d) => d.internCode === selectedInternCode);
  const selectedInternInfo = myInterns.find((i) => i.internCode === selectedInternCode);

  return (
    <div className="animate-fade-in">
      <Header
        title="Bảng Điều Khiển Người Hướng Dẫn (Mentor Portal)"
        subtitle="Quản lý nhóm thực tập sinh phụ trách, theo dõi tài liệu và ghi chú tiến độ chuyên môn"
      />

      <div style={{ marginTop: '1.5rem' }}>
        {/* Metric Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem',
        }}>
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              color: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Users size={24} />
            </div>
            <div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>TTS Phụ Trách</p>
              <h3 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0 }}>{myInterns.length}</h3>
            </div>
          </div>

          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              color: '#3b82f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <CheckCircle2 size={24} />
            </div>
            <div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Đang Hoạt Động (Interning)</p>
              <h3 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0 }}>
                {myInterns.filter((i) => i.status === 'INTERNING').length}
              </h3>
            </div>
          </div>

          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: 'var(--primary-light)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <FolderGit2 size={24} />
            </div>
            <div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Tài Liệu Của Nhóm</p>
              <h3 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0 }}>
                {documents.filter((d) => myInterns.some((i) => i.internCode === d.internCode)).length}
              </h3>
            </div>
          </div>
        </div>

        {/* Master-Detail Workspace */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem' }}>
          {/* Left Column: My Interns List */}
          <div className="card">
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.25rem' }}>
              Danh Sách Thực Tập Sinh Nhóm Tôi
            </h3>

            {loading ? (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>Đang tải...</p>
            ) : myInterns.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                Hiện tại chưa có thực tập sinh nào được phân công.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {myInterns.map((intern) => {
                  const isSelected = intern.internCode === selectedInternCode;
                  return (
                    <div
                      key={intern.id}
                      onClick={() => handleSelectIntern(intern.internCode)}
                      style={{
                        padding: '1.1rem',
                        borderRadius: '10px',
                        border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-default)',
                        backgroundColor: isSelected ? 'var(--primary-light)' : 'var(--bg-surface)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.35rem' }}>
                        <div>
                          <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>{intern.fullName}</h4>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)' }}>
                            {intern.internCode}
                          </span>
                        </div>
                        <span className={`badge ${
                          intern.status === 'INTERNING' ? 'badge-success' : 'badge-info'
                        }`}>
                          {intern.status}
                        </span>
                      </div>

                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', marginTop: '0.5rem' }}>
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

          {/* Right Column: Detail & Documents for Selected Intern */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {selectedInternInfo ? (
              <>
                {/* Documents Widget */}
                <div className="card">
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <BookOpen size={18} color="var(--primary)" />
                    <span>Tài Liệu & CV Của {selectedInternInfo.fullName}</span>
                  </h4>

                  {selectedInternDocs.length === 0 ? (
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                      Thực tập sinh chưa nộp tài liệu nào.
                    </p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                      {selectedInternDocs.map((doc) => (
                        <div
                          key={doc.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '0.65rem 0.85rem',
                            borderRadius: '8px',
                            backgroundColor: 'var(--border-subtle)',
                            border: '1px solid var(--border-default)',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FileText size={16} color="var(--primary)" />
                            <div>
                              <p style={{ fontSize: '0.825rem', fontWeight: 600, margin: 0 }}>{doc.fileName}</p>
                              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{doc.documentType}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => documentService.previewDocumentFile(doc.id)}
                            className="btn btn-sm btn-secondary"
                            style={{ cursor: 'pointer' }}
                          >
                            <Download size={12} /> Xem CV
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Mentorship Notes Widget */}
                <div className="card">
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Sparkles size={18} color="#f59e0b" />
                    <span>Sổ Tay Hướng Dẫn & Đánh Giá</span>
                  </h4>
                  <div className="form-group">
                    <textarea
                      rows={4}
                      className="form-textarea"
                      placeholder="Ghi chú mục tiêu tuần, kết quả giao việc, điểm mạnh, điểm cần cải thiện..."
                      value={activeNoteText}
                      onChange={(e) => setActiveNoteText(e.target.value)}
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      onClick={handleSaveNote}
                      className="btn btn-primary btn-sm"
                    >
                      Lưu Ghi Chú Tiến Độ
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                Chọn một thực tập sinh bên trái để xem chi tiết
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
