import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  FileCheck2,
  Clock,
  CheckCircle2,
  Search,
  Plus,
  FileText,
  Download,
  X,
} from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { internService } from '../../services/internService';
import { documentService } from '../../services/documentService';
import type { InternProfile, DocumentResponse, InternStatus, CreateInternRequest } from '../../types';

export const HrDashboard: React.FC = () => {
  const [interns, setInterns] = useState<InternProfile[]>([]);
  const [documents, setDocuments] = useState<DocumentResponse[]>([]);
  const [keyword, setKeyword] = useState('');
  const [selectedUniversity, setSelectedUniversity] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [loading, setLoading] = useState(true);

  // Review Modal State (TM-5)
  const [reviewModalDoc, setReviewModalDoc] = useState<DocumentResponse | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Create Intern Modal State (TM-1)
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newInternForm, setNewInternForm] = useState<CreateInternRequest>({
    fullName: '',
    email: '',
    phone: '',
    university: 'Đại Học Bách Khoa',
    major: 'Khoa Học Máy Tính',
    gpa: 3.5,
  });

  useEffect(() => {
    loadData();
  }, [keyword, selectedUniversity, selectedStatus]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [internRes, docRes] = await Promise.all([
        internService.getInterns({
          keyword: keyword || undefined,
          university: selectedUniversity || undefined,
          status: selectedStatus || undefined,
        }),
        documentService.getAllDocuments(),
      ]);
      setInterns(internRes.content);
      setDocuments(docRes);
    } catch (err) {
      console.error('Lỗi nạp dữ liệu HR Dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  // Xét duyệt tài liệu TM-5
  const handleApproveDocument = async (docId: number) => {
    try {
      const updated = await documentService.reviewDocument(docId, { status: 'APPROVED' });
      setDocuments((prev) => prev.map((d) => (d.id === docId ? updated : d)));
      alert('Đã phê duyệt tài liệu thành công!');
    } catch (err) {
      alert('Có lỗi xảy ra khi phê duyệt');
    }
  };

  const handleRejectDocument = async () => {
    if (!reviewModalDoc) return;
    if (!rejectionReason.trim()) {
      alert('Vui lòng nhập lý do từ chối để thực tập sinh có thể bổ sung hồ sơ!');
      return;
    }

    try {
      const updated = await documentService.reviewDocument(reviewModalDoc.id, {
        status: 'REJECTED',
        rejectionReason,
      });
      setDocuments((prev) => prev.map((d) => (d.id === reviewModalDoc.id ? updated : d)));
      setReviewModalDoc(null);
      setRejectionReason('');
      alert('Đã từ chối tài liệu và gửi phản hồi cho thực tập sinh.');
    } catch (err) {
      alert('Có lỗi xảy ra khi cập nhật');
    }
  };

  // Cập nhật trạng thái TTS TM-2
  const handleStatusChange = async (internId: number, nextStatus: InternStatus) => {
    try {
      const updated = await internService.updateIntern(internId, { status: nextStatus });
      setInterns((prev) => prev.map((i) => (i.id === internId ? updated : i)));
    } catch (err) {
      alert('Không thể cập nhật trạng thái');
    }
  };

  // Tạo hồ sơ TTS TM-1
  const handleCreateIntern = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await internService.createIntern(newInternForm);
      setShowCreateModal(false);
      setNewInternForm({
        fullName: '',
        email: '',
        phone: '',
        university: 'Đại Học Bách Khoa',
        major: 'Khoa Học Máy Tính',
        gpa: 3.5,
      });
      loadData();
      alert('Tạo mới hồ sơ thực tập sinh thành công!');
    } catch (err: any) {
      alert(err.message || 'Lỗi tạo hồ sơ');
    }
  };

  const pendingDocuments = documents.filter((d) => d.status === 'PENDING');
  const countStatus = (s: InternStatus) => interns.filter((i) => i.status === s).length;

  return (
    <div className="animate-fade-in">
      <Header
        title="Bảng Điều Khiển Nhân Sự (HR Portal)"
        subtitle="Quản lý hồ sơ thực tập sinh, thẩm định CV & tài liệu ứng tuyển (TM-1, TM-2, TM-3, TM-5)"
      />

      <div style={{ marginTop: '1.5rem' }}>
        {/* Metric Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem',
        }}>
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              backgroundColor: 'var(--primary-light)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <GraduationCap size={24} />
            </div>
            <div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>Tổng Thực Tập Sinh</p>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>{interns.length}</h3>
            </div>
          </div>

          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              backgroundColor: 'rgba(245, 158, 11, 0.1)',
              color: '#f59e0b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Clock size={24} />
            </div>
            <div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>Hồ Sơ Mới Chờ Duyệt</p>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>{countStatus('SUBMITTED')}</h3>
            </div>
          </div>

          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '46px',
              height: '46px',
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
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>Đang Thực Tập</p>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>{countStatus('INTERNING')}</h3>
            </div>
          </div>

          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              color: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <FileCheck2 size={24} />
            </div>
            <div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>CV Chờ Thẩm Định</p>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>{pendingDocuments.length}</h3>
            </div>
          </div>
        </div>

        {/* Document Review Queue TM-5 */}
        <div className="card" style={{ marginBottom: '2rem', borderLeft: '4px solid var(--primary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileCheck2 size={20} color="var(--primary)" />
                <span>Hàng Đợi Thẩm Định CV & Tài Liệu Ứng Tuyển (TM-5)</span>
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                Xét duyệt các tài liệu và hồ sơ ứng tuyển mới nộp trực tuyến
              </p>
            </div>
            <span className="badge badge-warning">
              {pendingDocuments.length} tài liệu chờ duyệt
            </span>
          </div>

          {pendingDocuments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              🎉 Tất cả tài liệu ứng tuyển hiện tại đều đã được thẩm định!
            </div>
          ) : (
            <div className="table-container">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Mã TTS</th>
                    <th>Loại Tài Liệu</th>
                    <th>Tên Tệp Tin</th>
                    <th>Dung Lượng</th>
                    <th>Thời Gian Nộp</th>
                    <th>Hành Động Xét Duyệt</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingDocuments.map((doc) => (
                    <tr key={doc.id}>
                      <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{doc.internCode}</td>
                      <td>
                        <span className="badge badge-primary">{doc.documentType}</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <FileText size={16} color="#64748b" />
                          <span style={{ fontWeight: 500 }}>{doc.fileName}</span>
                        </div>
                      </td>
                      <td>{(doc.fileSize / (1024 * 1024)).toFixed(2)} MB</td>
                      <td>{new Date(doc.createdAt).toLocaleDateString('vi-VN')}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <a
                            href={documentService.getDocumentDownloadUrl(doc.id, 'inline')}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-sm btn-secondary"
                            title="Xem trước"
                          >
                            <Download size={13} /> Xem Tệp
                          </a>
                          <button
                            onClick={() => handleApproveDocument(doc.id)}
                            className="btn btn-sm btn-success"
                          >
                            Duyệt
                          </button>
                          <button
                            onClick={() => {
                              setReviewModalDoc(doc);
                              setRejectionReason('');
                            }}
                            className="btn btn-sm btn-danger"
                          >
                            Từ Chối
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Intern List Management TM-3 */}
        <div className="card">
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '1.25rem',
          }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>Danh Sách Hồ Sơ Thực Tập Sinh (TM-3)</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                Tìm kiếm, lọc theo trường/ngành và điều phối trạng thái thực tập (TM-2)
              </p>
            </div>

            <button
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary"
            >
              <Plus size={16} /> Thêm Hồ Sơ Mới (TM-1)
            </button>
          </div>

          {/* Search & Filter Bar */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.75rem',
            marginBottom: '1.25rem',
          }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
              <Search size={16} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '2.2rem', width: '100%' }}
                placeholder="Tìm tên, mã TTS, email, SĐT..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </div>

            <select
              className="form-select"
              value={selectedUniversity}
              onChange={(e) => setSelectedUniversity(e.target.value)}
            >
              <option value="">Tất cả trường đại học</option>
              <option value="Đại Học Bách Khoa">ĐH Bách Khoa</option>
              <option value="Đại Học Quốc Gia">ĐH Quốc Gia</option>
              <option value="Đại Học FPT">ĐH FPT</option>
              <option value="Đại Học Kinh Tế Quốc Dân">ĐH Kinh Tế Quốc Dân</option>
            </select>

            <select
              className="form-select"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="SUBMITTED">SUBMITTED (Chờ duyệt)</option>
              <option value="APPROVED">APPROVED (Đã duyệt)</option>
              <option value="INTERNING">INTERNING (Đang thực tập)</option>
              <option value="COMPLETED">COMPLETED (Hoàn thành)</option>
            </select>
          </div>

          {/* Table */}
          <div className="table-container">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Mã TTS</th>
                  <th>Họ và Tên</th>
                  <th>Trường & Chuyên Ngành</th>
                  <th>GPA</th>
                  <th>Mentor Hướng Dẫn</th>
                  <th>Trạng Thái</th>
                  <th>Hành Động (TM-2)</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>
                      Đang tải hồ sơ...
                    </td>
                  </tr>
                ) : interns.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      Không tìm thấy hồ sơ thực tập sinh phù hợp
                    </td>
                  </tr>
                ) : (
                  interns.map((intern) => (
                    <tr key={intern.id}>
                      <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{intern.internCode}</td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{intern.fullName}</div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{intern.email}</span>
                      </td>
                      <td>
                        <div>{intern.university}</div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{intern.major}</span>
                      </td>
                      <td>
                        <span style={{
                          fontWeight: 700,
                          color: (intern.gpa || 0) >= 3.5 ? '#10b981' : '#f59e0b',
                        }}>
                          {intern.gpa ? intern.gpa.toFixed(2) : '-'}
                        </span>
                      </td>
                      <td>
                        {intern.mentorName ? (
                          <span className="badge badge-primary">{intern.mentorName}</span>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Chưa gán</span>
                        )}
                      </td>
                      <td>
                        <span className={`badge ${
                          intern.status === 'INTERNING' ? 'badge-success' :
                          intern.status === 'APPROVED' ? 'badge-info' :
                          intern.status === 'COMPLETED' ? 'badge-neutral' : 'badge-warning'
                        }`}>
                          {intern.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.35rem' }}>
                          {intern.status === 'SUBMITTED' && (
                            <button
                              onClick={() => handleStatusChange(intern.id, 'APPROVED')}
                              className="btn btn-sm btn-primary"
                            >
                              Duyệt Tiếp Nhận
                            </button>
                          )}
                          {intern.status === 'APPROVED' && (
                            <button
                              onClick={() => handleStatusChange(intern.id, 'INTERNING')}
                              className="btn btn-sm btn-success"
                            >
                              Bắt Đầu TT
                            </button>
                          )}
                          {intern.status === 'INTERNING' && (
                            <button
                              onClick={() => handleStatusChange(intern.id, 'COMPLETED')}
                              className="btn btn-sm btn-secondary"
                            >
                              Hoàn Thành
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Reject Modal TM-5 */}
      {reviewModalDoc && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '480px', margin: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'var(--danger)' }}>
                Từ Chối Tài Liệu ({reviewModalDoc.internCode})
              </h4>
              <button
                onClick={() => setReviewModalDoc(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Tệp: <strong>{reviewModalDoc.fileName}</strong>
            </p>

            <div className="form-group">
              <label className="form-label">Lý do từ chối (Bắt buộc theo TM-5) *</label>
              <textarea
                rows={3}
                className="form-textarea"
                placeholder="Ví dụ: Thiếu xác nhận của nhà trường, CV chưa đúng mẫu..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
              <button
                onClick={() => setReviewModalDoc(null)}
                className="btn btn-secondary"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleRejectDocument}
                className="btn btn-danger"
              >
                Xác Nhận Từ Chối
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Intern Modal TM-1 */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '520px', margin: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h4 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>
                Thêm Hồ Sơ Thực Tập Sinh Mới (TM-1)
              </h4>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateIntern}>
              <div className="form-group">
                <label className="form-label">Họ và tên *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={newInternForm.fullName}
                  onChange={(e) => setNewInternForm({ ...newInternForm, fullName: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input
                    type="email"
                    required
                    className="form-input"
                    value={newInternForm.email}
                    onChange={(e) => setNewInternForm({ ...newInternForm, email: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Số điện thoại *</label>
                  <input
                    type="tel"
                    required
                    className="form-input"
                    value={newInternForm.phone}
                    onChange={(e) => setNewInternForm({ ...newInternForm, phone: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Trường Đại Học</label>
                  <input
                    type="text"
                    className="form-input"
                    value={newInternForm.university}
                    onChange={(e) => setNewInternForm({ ...newInternForm, university: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Điểm GPA</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-input"
                    value={newInternForm.gpa || ''}
                    onChange={(e) => setNewInternForm({ ...newInternForm, gpa: parseFloat(e.target.value) })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Chuyên ngành</label>
                <input
                  type="text"
                  className="form-input"
                  value={newInternForm.major}
                  onChange={(e) => setNewInternForm({ ...newInternForm, major: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.25rem' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn btn-secondary"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Tạo Hồ Sơ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
