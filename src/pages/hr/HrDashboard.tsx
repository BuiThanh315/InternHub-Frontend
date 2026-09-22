import React, { useState, useEffect } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { internService } from '../../services/internService';
import { documentService } from '../../services/documentService';
import type {
  InternProfile,
  DocumentResponse,
  DocumentType,
  InternStatus,
  CreateInternRequest,
  UpdateInternRequest,
} from '../../types';
import {
  HrMetricsGrid,
  HrDocumentReviewTable,
  HrFilterBar,
  HrInternTable,
  CreateInternModal,
  EditInternModal,
  DetailInternModal,
  UploadDocModal,
  RejectDocModal,
} from './components';

export const HrDashboard: React.FC = () => {
  const [interns, setInterns] = useState<InternProfile[]>([]);
  const [documents, setDocuments] = useState<DocumentResponse[]>([]);
  const [keyword, setKeyword] = useState('');
  const [selectedUniversity, setSelectedUniversity] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Pagination State
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Modal States
  const [detailIntern, setDetailIntern] = useState<InternProfile | null>(null);
  const [editIntern, setEditIntern] = useState<InternProfile | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [uploadDocIntern, setUploadDocIntern] = useState<InternProfile | null>(null);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [reviewModalDoc, setReviewModalDoc] = useState<DocumentResponse | null>(null);

  const loadData = React.useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage(null);

      const internRes = await internService.getInterns({
        keyword: keyword || undefined,
        university: selectedUniversity || undefined,
        status: selectedStatus || undefined,
        page,
        size: 10,
      });

      const loadedInterns = internRes.items || internRes.content || [];
      setInterns(loadedInterns);
      setTotalPages(internRes.totalPages || 1);
      setTotalItems(internRes.totalItems || loadedInterns.length);

      // Nạp tài liệu từ các thực tập sinh
      const internCodes = loadedInterns.map((i) => i.internCode);
      const docRes = await documentService.getAllDocuments(internCodes);
      setDocuments(docRes);
    } catch (err: unknown) {
      console.error('Lỗi nạp dữ liệu HR Dashboard:', err);
      const msg = err instanceof Error ? err.message : 'Không thể nạp dữ liệu từ máy chủ backend';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  }, [keyword, selectedUniversity, selectedStatus, page]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // TM-1: Tạo mới hồ sơ thực tập sinh
  const handleCreateIntern = async (formData: CreateInternRequest) => {
    try {
      await internService.createIntern(formData);
      setShowCreateModal(false);
      loadData();
      alert('Tạo mới hồ sơ thực tập sinh thành công qua API Backend!');
    } catch (err: any) {
      alert(err.message || 'Lỗi tạo hồ sơ thực tập sinh');
    }
  };

  // TM-2: Chỉnh sửa hồ sơ thực tập sinh
  const handleSaveEdit = async (id: number, form: UpdateInternRequest) => {
    try {
      const updated = await internService.updateIntern(id, form);
      setInterns((prev) => prev.map((i) => (i.id === id ? updated : i)));
      if (detailIntern && detailIntern.id === id) {
        setDetailIntern(updated);
      }
      setEditIntern(null);
      alert('Cập nhật hồ sơ thực tập sinh thành công qua API Backend (PUT)!');
    } catch (err: any) {
      alert(err.message || 'Không thể cập nhật hồ sơ');
    }
  };

  // TM-2: Điều phối trạng thái nhanh
  const handleStatusChange = async (internId: number, nextStatus: InternStatus) => {
    const target = interns.find((i) => i.id === internId);
    if (!target) return;

    const updatePayload: UpdateInternRequest = {
      fullName: target.fullName,
      email: target.email,
      phone: target.phone,
      university: target.university,
      major: target.major,
      appliedPosition: target.appliedPosition || 'Thực tập sinh',
      startDate: target.startDate || new Date().toISOString().split('T')[0],
      endDate: target.endDate,
      dateOfBirth: target.dateOfBirth,
      gender: target.gender,
      address: target.address,
      notes: target.notes,
      academicYear: target.academicYear,
      status: nextStatus,
    };

    try {
      const updated = await internService.updateIntern(internId, updatePayload);
      setInterns((prev) => prev.map((i) => (i.id === internId ? updated : i)));
      alert(`Đã cập nhật trạng thái hồ sơ sang [${nextStatus}] thành công!`);
    } catch (err: any) {
      alert(err.message || 'Không thể cập nhật trạng thái hồ sơ');
    }
  };

  // TM-4: Tải lên tài liệu cho TTS
  const handleUploadDocSubmit = async (docType: DocumentType, file: File) => {
    if (!uploadDocIntern) return;
    try {
      setUploadingDoc(true);
      const newDoc = await documentService.uploadDocument(
        uploadDocIntern.internCode,
        file,
        docType
      );
      setDocuments((prev) => [newDoc, ...prev]);
      setUploadDocIntern(null);
      alert('Tải lên tài liệu cho thực tập sinh thành công!');
    } catch (err: any) {
      alert(err.message || 'Lỗi tải lên tài liệu');
    } finally {
      setUploadingDoc(false);
    }
  };

  // TM-5: Phê duyệt tài liệu
  const handleApproveDocument = async (docId: number) => {
    try {
      const updated = await documentService.reviewDocument(docId, { status: 'APPROVED' });
      setDocuments((prev) => prev.map((d) => (d.id === docId ? updated : d)));
      alert('Đã phê duyệt tài liệu thành công!');
    } catch (err: any) {
      alert(err.message || 'Có lỗi xảy ra khi phê duyệt tài liệu');
    }
  };

  // TM-5: Từ chối tài liệu
  const handleRejectDocument = async (reason: string) => {
    if (!reviewModalDoc) return;
    try {
      const updated = await documentService.reviewDocument(reviewModalDoc.id, {
        status: 'REJECTED',
        rejectionReason: reason,
      });
      setDocuments((prev) => prev.map((d) => (d.id === reviewModalDoc.id ? updated : d)));
      setReviewModalDoc(null);
      alert('Đã từ chối tài liệu và phản hồi lại cho thực tập sinh.');
    } catch (err: any) {
      alert(err.message || 'Có lỗi xảy ra khi cập nhật tài liệu');
    }
  };

  const pendingDocuments = documents.filter(
    (d) => d.status === 'PENDING_REVIEW' || (d.status as any) === 'PENDING'
  );
  const countStatus = (s: InternStatus) => interns.filter((i) => i.status === s).length;

  return (
    <div className="animate-fade-in">
      <Header
        title="Bảng Điều Khiển Nhân Sự (HR Portal)"
        subtitle="Quản lý hồ sơ thực tập sinh, thẩm định CV & tài liệu ứng tuyển (TM-1, TM-2, TM-3, TM-5)"
      />

      <div style={{ marginTop: '1.5rem' }}>
        {errorMessage && (
          <div
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid #ef4444',
              borderRadius: '8px',
              padding: '0.75rem 1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.6rem',
              color: '#fca5a5',
              fontSize: '0.85rem',
              marginBottom: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle size={18} />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={loadData}
              className="btn btn-sm btn-secondary"
              style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
            >
              <RefreshCw size={12} /> Thử lại
            </button>
          </div>
        )}

        <HrMetricsGrid
          totalInterns={interns.length}
          pendingInterns={countStatus('PENDING')}
          interningInterns={countStatus('INTERNING')}
          pendingDocuments={pendingDocuments.length}
        />

        <HrDocumentReviewTable
          documents={documents}
          onApprove={handleApproveDocument}
          onOpenRejectModal={(doc) => setReviewModalDoc(doc)}
        />

        <div className="card">
          <HrFilterBar
            keyword={keyword}
            onKeywordChange={setKeyword}
            selectedUniversity={selectedUniversity}
            onUniversityChange={setSelectedUniversity}
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
            onOpenCreateModal={() => setShowCreateModal(true)}
          />

          <HrInternTable
            interns={interns}
            loading={loading}
            page={page}
            totalPages={totalPages}
            totalItems={totalItems}
            onPageChange={setPage}
            onViewDetail={(intern) => setDetailIntern(intern)}
            onOpenEdit={(intern) => setEditIntern(intern)}
            onOpenUpload={(intern) => setUploadDocIntern(intern)}
            onStatusChange={handleStatusChange}
          />
        </div>
      </div>

      <CreateInternModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateIntern}
      />

      <EditInternModal
        intern={editIntern}
        onClose={() => setEditIntern(null)}
        onSave={handleSaveEdit}
      />

      <DetailInternModal
        intern={detailIntern}
        documents={documents}
        onClose={() => setDetailIntern(null)}
        onOpenEdit={(intern) => {
          setDetailIntern(null);
          setEditIntern(intern);
        }}
        onOpenUpload={(intern) => {
          setDetailIntern(null);
          setUploadDocIntern(intern);
        }}
      />

      <UploadDocModal
        intern={uploadDocIntern}
        uploading={uploadingDoc}
        onClose={() => setUploadDocIntern(null)}
        onSubmit={handleUploadDocSubmit}
      />

      <RejectDocModal
        doc={reviewModalDoc}
        onClose={() => setReviewModalDoc(null)}
        onSubmit={handleRejectDocument}
      />
    </div>
  );
};

export default HrDashboard;
