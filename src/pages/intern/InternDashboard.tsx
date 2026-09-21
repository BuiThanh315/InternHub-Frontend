import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Clock,
  UploadCloud,
  FileText,
  GraduationCap,
  User,
  ShieldAlert,
} from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { internService } from '../../services/internService';
import { documentService } from '../../services/documentService';
import type { InternProfile, DocumentResponse, DocumentType } from '../../types';

export const InternDashboard: React.FC = () => {
  const [profile, setProfile] = useState<InternProfile | null>(null);
  const [documents, setDocuments] = useState<DocumentResponse[]>([]);
  const [loading, setLoading] = useState(true);

  // Upload new doc state (TM-4)
  const [uploadType, setUploadType] = useState<DocumentType>('CV');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState<string | null>(null);

  const internCode = 'INT-2026-001'; // Default logged-in mock intern

  useEffect(() => {
    loadInternData();
  }, []);

  const loadInternData = async () => {
    try {
      setLoading(true);
      const [internRes, docRes] = await Promise.all([
        internService.getInterns({ keyword: internCode }),
        documentService.getDocumentsByInternCode(internCode),
      ]);

      if (internRes.content.length > 0) {
        setProfile(internRes.content[0]);
      }
      setDocuments(docRes);
    } catch (err) {
      console.error('Lỗi tải dữ liệu Intern Dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      alert('Vui lòng chọn một tệp tin');
      return;
    }

    try {
      setUploading(true);
      const newDoc = await documentService.uploadDocument(internCode, selectedFile, uploadType);
      setDocuments((prev) => [newDoc, ...prev]);
      setSelectedFile(null);
      setUploadSuccessMsg('Tải lên tài liệu thành công! Đang chờ HR thẩm định.');
      setTimeout(() => setUploadSuccessMsg(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Lỗi tải lên tài liệu');
    } finally {
      setUploading(false);
    }
  };

  const getStepStatus = (step: number) => {
    if (!profile) return 'pending';
    const statusMap: Record<string, number> = {
      SUBMITTED: 1,
      APPROVED: 2,
      INTERNING: 3,
      COMPLETED: 4,
    };
    const currentStep = statusMap[profile.status] || 1;
    if (step < currentStep) return 'completed';
    if (step === currentStep) return 'active';
    return 'pending';
  };

  return (
    <div className="animate-fade-in">
      <Header
        title="Không Gian Thực Tập Sinh (Intern Portal)"
        subtitle="Theo dõi lộ trình thực tập, tra cứu kết quả thẩm định hồ sơ và nộp tài liệu trực tuyến (TM-4, TM-5)"
      />

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          Đang tải dữ liệu thực tập sinh...
        </div>
      ) : (
      <div style={{ marginTop: '1.5rem' }}>
        {/* Progress Stepper */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.5rem' }}>
            Lộ Trình Kỳ Thực Tập Của Bạn
          </h3>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative',
          }}>
            {[
              { num: 1, label: 'Nộp Hồ Sơ & CV', desc: 'Đã hoàn tất nộp online' },
              { num: 2, label: 'HR Phê Duyệt', desc: 'Thẩm định hồ sơ' },
              { num: 3, label: 'Đang Thực Tập', desc: 'Làm việc cùng Mentor' },
              { num: 4, label: 'Hoàn Thành', desc: 'Đánh giá & Cấp chứng nhận' },
            ].map((step) => {
              const state = getStepStatus(step.num);
              return (
                <div
                  key={step.num}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    flex: 1,
                    textAlign: 'center',
                    position: 'relative',
                    zIndex: 2,
                  }}
                >
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '1rem',
                    backgroundColor:
                      state === 'completed' ? 'var(--success)' :
                      state === 'active' ? 'var(--primary)' : 'var(--border-subtle)',
                    color: state === 'pending' ? 'var(--text-muted)' : '#fff',
                    boxShadow: state === 'active' ? '0 0 0 5px var(--primary-glow)' : 'none',
                    marginBottom: '0.65rem',
                    transition: 'all 0.2s ease',
                  }}>
                    {state === 'completed' ? <CheckCircle2 size={22} /> : step.num}
                  </div>
                  <p style={{
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    margin: 0,
                    color: state === 'pending' ? 'var(--text-muted)' : 'var(--text-main)',
                  }}>
                    {step.label}
                  </p>
                  <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>{step.desc}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Profile Card & Mentorship Info */}
        {profile && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1.2fr 1fr',
            gap: '1.5rem',
            marginBottom: '2rem',
          }}>
            {/* Student Info */}
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--primary-light)',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <GraduationCap size={24} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>{profile.fullName}</h3>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)' }}>
                      Mã TTS: {profile.internCode}
                    </span>
                  </div>
                </div>
                <span className={`badge ${
                  profile.status === 'INTERNING' ? 'badge-success' : 'badge-info'
                }`}>
                  {profile.status}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.85rem' }}>
                <div>Email: <strong>{profile.email}</strong></div>
                <div>Điện thoại: <strong>{profile.phone}</strong></div>
                <div>Trường: <strong>{profile.university}</strong></div>
                <div>Chuyên ngành: <strong>{profile.major}</strong></div>
                <div>Điểm GPA: <strong>{profile.gpa ? profile.gpa.toFixed(2) : '-'}</strong></div>
                <div>Phòng ban: <strong>{profile.department || 'Đang cập nhật'}</strong></div>
              </div>
            </div>

            {/* Mentor Info */}
            <div className="card" style={{ borderLeft: '4px solid #10b981' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.85rem' }}>
                <User size={20} color="#10b981" />
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>Người Hướng Dẫn Kỹ Thuật (Mentor)</h4>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                Họ và tên: <strong>{profile.mentorName || 'Lê Văn Hướng Dẫn'}</strong>
              </p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                Email hỗ trợ: <strong>mentor@internhub.vn</strong>
              </p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                Thời gian thực tập: <strong>{profile.startDate || '01/03/2026'}</strong> đến <strong>{profile.endDate || '30/06/2026'}</strong>
              </p>
            </div>
          </div>
        )}

        {/* Upload & Document Management Section (TM-4, TM-5) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem' }}>
          {/* Document Status List */}
          <div className="card">
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem' }}>
              Danh Sách Hồ Sơ & Kết Quả Thẩm Định (TM-5)
            </h3>

            {documents.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
                Chưa có tài liệu nào được nộp.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    style={{
                      padding: '1rem',
                      borderRadius: '10px',
                      border: doc.status === 'REJECTED' ? '1px solid #fecaca' : '1px solid var(--border-default)',
                      backgroundColor: doc.status === 'REJECTED' ? 'var(--danger-bg)' : 'var(--bg-surface)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FileText size={18} color="var(--primary)" />
                        <div>
                          <p style={{ fontSize: '0.875rem', fontWeight: 600, margin: 0 }}>{doc.fileName}</p>
                          <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                            Loại: {doc.documentType} • {(doc.fileSize / (1024 * 1024)).toFixed(2)} MB
                          </span>
                        </div>
                      </div>

                      {doc.status === 'APPROVED' && (
                        <span className="badge badge-success">
                          <CheckCircle2 size={12} /> Đã Duyệt
                        </span>
                      )}
                      {doc.status === 'PENDING' && (
                        <span className="badge badge-warning">
                          <Clock size={12} /> Chờ Duyệt
                        </span>
                      )}
                      {doc.status === 'REJECTED' && (
                        <span className="badge badge-danger">
                          <ShieldAlert size={12} /> Bị Từ Chối
                        </span>
                      )}
                    </div>

                    {/* Rejection Reason display if rejected (TM-5) */}
                    {doc.status === 'REJECTED' && doc.rejectionReason && (
                      <div style={{
                        marginTop: '0.5rem',
                        padding: '0.5rem 0.75rem',
                        borderRadius: '6px',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        border: '1px dashed #ef4444',
                        color: '#b91c1c',
                        fontSize: '0.78rem',
                      }}>
                        <strong>Lý do từ chối từ HR:</strong> {doc.rejectionReason}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upload New Document Dropzone (TM-4) */}
          <div className="card">
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.4rem' }}>
              Nộp Thêm Tài Liệu Mới (TM-4)
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Bổ sung tài liệu được yêu cầu hoặc nộp lại hồ sơ bị từ chối
            </p>

            {uploadSuccessMsg && (
              <div style={{
                backgroundColor: 'var(--success-bg)',
                border: '1px solid var(--success-border)',
                borderRadius: '8px',
                padding: '0.65rem 0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: 'var(--success)',
                fontSize: '0.825rem',
                marginBottom: '1rem',
              }}>
                <CheckCircle2 size={16} />
                <span>{uploadSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleUploadSubmit}>
              <div className="form-group">
                <label className="form-label">Loại tài liệu cần nộp</label>
                <select
                  className="form-select"
                  value={uploadType}
                  onChange={(e) => setUploadType(e.target.value as DocumentType)}
                >
                  <option value="CV">CV / Sơ Yếu Lý Lịch</option>
                  <option value="INTERNSHIP_APPLICATION">Đơn Xin Thực Tập</option>
                  <option value="TRANSCRIPT">Bảng Điểm Tích Lũy</option>
                  <option value="RECOMMENDATION_LETTER">Giấy Giới Thiệu Từ Trường</option>
                  <option value="OTHER">Tài Liệu Khác</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Chọn tệp (PDF/DOCX, tối đa 5MB)</label>
                <label style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '1.5rem',
                  border: '2px dashed var(--border-default)',
                  borderRadius: '10px',
                  backgroundColor: 'var(--border-subtle)',
                  cursor: 'pointer',
                }}>
                  <input
                    type="file"
                    accept=".pdf,.docx,.doc"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setSelectedFile(e.target.files[0]);
                      }
                    }}
                  />
                  {selectedFile ? (
                    <div style={{ textAlign: 'center' }}>
                      <FileText size={28} color="var(--primary)" style={{ margin: '0 auto 0.4rem' }} />
                      <p style={{ fontSize: '0.85rem', fontWeight: 600, margin: 0 }}>{selectedFile.name}</p>
                      <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB - Nhấp để chọn lại
                      </span>
                    </div>
                  ) : (
                    <>
                      <UploadCloud size={28} color="var(--primary)" style={{ marginBottom: '0.35rem' }} />
                      <p style={{ fontSize: '0.825rem', fontWeight: 600, margin: 0 }}>Kéo thả hoặc nhấp để chọn tệp</p>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Hỗ trợ PDF, DOCX tối đa 5MB</span>
                    </>
                  )}
                </label>
              </div>

              <button
                type="submit"
                disabled={uploading || !selectedFile}
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem' }}
              >
                {uploading ? 'Đang tải lên...' : 'Tải Lên Hồ Sơ Mới'}
              </button>
            </form>
          </div>
        </div>
      </div>
      )}
    </div>
  );
};
