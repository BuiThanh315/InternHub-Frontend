import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Header } from '../../components/layout/Header';
import { internService } from '../../services/internService';
import { documentService } from '../../services/documentService';
import { programService } from '../../services/programService';
import { ROUTES } from '../../constants/routes';
import type {
  InternProfile,
  DocumentResponse,
  DocumentType,
  InternStatus,
  CreateInternRequest,
  UpdateInternRequest,
  ProgramDetailResponse,
} from '../../types';
import {
  HrMetricsGrid,
  HrActiveProgramsGrid,
  HrDocumentReviewTable,
  HrFilterBar,
  HrInternTable,

  CreateInternModal,
  EditInternModal,
  DetailInternModal,
  UploadDocModal,
  RejectDocModal,
  ApproveConfirmModal,
  RejectInternModal,
  AssignMentorModal,
  RevokeMentorModal,
} from './components';
import { RemoveProgramMemberModal } from './components/RemoveProgramMemberModal';
import { ContractBuilderModal } from './contracts/components/ContractBuilderModal/ContractBuilderModal';
import { groupService } from '../../services/groupService';

export const HrDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [interns, setInterns] = useState<InternProfile[]>([]);
  const [activePrograms, setActivePrograms] = useState<ProgramDetailResponse[]>([]);
  const [pendingCountsMap, setPendingCountsMap] = useState<Record<number, number>>({});
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
  const [totalPending, setTotalPending] = useState(0);
  const [totalInterning, setTotalInterning] = useState(0);

  // Modal States
  const [detailIntern, setDetailIntern] = useState<InternProfile | null>(null);
  const [detailTab, setDetailTab] = useState<'profile' | 'history'>('profile');
  const [editIntern, setEditIntern] = useState<InternProfile | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [uploadDocIntern, setUploadDocIntern] = useState<InternProfile | null>(null);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [reviewModalDoc, setReviewModalDoc] = useState<DocumentResponse | null>(null);

  // TM-11 Decision Modal States
  const [approveIntern, setApproveIntern] = useState<InternProfile | null>(null);
  const [rejectIntern, setRejectIntern] = useState<InternProfile | null>(null);
  const [isSubmittingDecision, setIsSubmittingDecision] = useState(false);
  const [decisionError, setDecisionError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // TM-13 Contract Upload Modal State
  const [contractIntern, setContractIntern] = useState<InternProfile | null>(null);

  // TM-16 Mentor Assignment Modal States
  const [assignMentorIntern, setAssignMentorIntern] = useState<InternProfile | null>(null);
  const [revokeMentorIntern, setRevokeMentorIntern] = useState<InternProfile | null>(null);

  // TM-31 Remove Program Member Modal State
  const [removeProgramIntern, setRemoveProgramIntern] = useState<InternProfile | null>(null);
  const [isRemovingProgram, setIsRemovingProgram] = useState(false);

  const handleConfirmRemoveProgram = async (intern: InternProfile) => {
    if (!intern.programId) return;
    try {
      setIsRemovingProgram(true);
      await groupService.removeInternFromProgram(intern.programId, intern.id);
      setSuccessToast(`Đã gỡ thực tập sinh ${intern.fullName} khỏi chương trình`);
      setRemoveProgramIntern(null);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Lỗi khi gỡ thực tập sinh khỏi chương trình');
    } finally {
      setIsRemovingProgram(false);
    }
  };

  const loadData = React.useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage(null);

      const [internRes, pendingRes, interningRes, progRes, allPendingRes] = await Promise.all([
        internService.getInterns({
          keyword: keyword || undefined,
          university: selectedUniversity || undefined,
          status: selectedStatus || undefined,
          page,
          size: 10,
        }),
        internService.getInterns({ status: 'PENDING', size: 1 }).catch(() => null),
        internService.getInterns({ status: 'INTERNING', size: 1 }).catch(() => null),
        programService.getPrograms({ size: 6, sort: 'createdAt,desc' }).catch(() => null),
        internService.getInterns({ status: 'PENDING', size: 100 }).catch(() => null),
      ]);

      const loadedInterns = internRes.items || internRes.content || [];
      setInterns(loadedInterns);
      setTotalPages(internRes.totalPages || 1);
      setTotalItems(internRes.totalItems || loadedInterns.length);

      if (pendingRes) {
        setTotalPending(pendingRes.totalItems ?? 0);
      }
      if (interningRes) {
        setTotalInterning(interningRes.totalItems ?? 0);
      }
      if (progRes) {
        setActivePrograms(progRes.items || []);
      }
      if (allPendingRes) {
        const items = allPendingRes.items || allPendingRes.content || [];
        const counts: Record<number, number> = {};
        items.forEach((intern) => {
          if (intern.programId) {
            counts[intern.programId] = (counts[intern.programId] || 0) + 1;
          }
        });
        setPendingCountsMap(counts);
      }



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

  useEffect(() => {
    if (successToast) {
      const timer = setTimeout(() => {
        setSuccessToast(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [successToast]);

  // TM-1: Tạo mới hồ sơ thực tập sinh
  const handleCreateIntern = async (formData: CreateInternRequest) => {
    try {
      await internService.createIntern(formData);
      setShowCreateModal(false);
      loadData();
      toast.success('Tạo mới hồ sơ thực tập sinh thành công!');
    } catch (err: any) {
      toast.error(err.message || 'Lỗi tạo hồ sơ thực tập sinh');
    }
  };

  // Chỉnh sửa hồ sơ thực tập sinh
  const handleSaveEdit = async (id: number, form: UpdateInternRequest) => {
    try {
      const updated = await internService.updateIntern(id, form);
      setInterns((prev) => prev.map((i) => (i.id === id ? updated : i)));
      if (detailIntern && detailIntern.id === id) {
        setDetailIntern(updated);
      }
      setEditIntern(null);
      toast.success('Cập nhật hồ sơ thực tập sinh thành công!');
    } catch (err: any) {
      toast.error(err.message || 'Không thể cập nhật hồ sơ');
    }
  };

  // Điều phối trạng thái nhanh
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
      toast.success(`Đã cập nhật trạng thái hồ sơ sang [${nextStatus}] thành công!`);
    } catch (err: any) {
      toast.error(err.message || 'Không thể cập nhật trạng thái hồ sơ');
    }
  };

  // Tải lên tài liệu cho TTS
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
      toast.success('Tải lên tài liệu cho thực tập sinh thành công!');
    } catch (err: any) {
      toast.error(err.message || 'Lỗi tải lên tài liệu');
    } finally {
      setUploadingDoc(false);
    }
  };

  // Phê duyệt tài liệu
  const handleApproveDocument = async (docId: number) => {
    try {
      const updated = await documentService.reviewDocument(docId, { status: 'APPROVED' });
      setDocuments((prev) => prev.map((d) => (d.id === docId ? updated : d)));
      toast.success('Đã phê duyệt tài liệu thành công!');
    } catch (err: any) {
      toast.error(err.message || 'Có lỗi xảy ra khi phê duyệt tài liệu');
    }
  };

  // Từ chối tài liệu
  const handleRejectDocument = async (reason: string) => {
    if (!reviewModalDoc) return;
    try {
      const updated = await documentService.reviewDocument(reviewModalDoc.id, {
        status: 'REJECTED',
        rejectionReason: reason,
      });
      setDocuments((prev) => prev.map((d) => (d.id === reviewModalDoc.id ? updated : d)));
      setReviewModalDoc(null);
      toast.success('Đã từ chối tài liệu và phản hồi lại cho thực tập sinh.');
    } catch (err: any) {
      toast.error(err.message || 'Có lỗi xảy ra khi cập nhật tài liệu');
    }
  };

  // TM-11 & TM-15: Phê duyệt hồ sơ TTS và gán vào chương trình thực tập
  const handleApproveDecision = async (programId: number) => {
    if (!approveIntern) return;
    try {
      setIsSubmittingDecision(true);
      setDecisionError(null);
      await internService.submitDecision(approveIntern.id, { decision: 'APPROVED', programId });
      setSuccessToast(`Đã phê duyệt tiếp nhận hồ sơ thực tập sinh ${approveIntern.fullName} (${approveIntern.internCode}) thành công!`);
      setApproveIntern(null);
      if (detailIntern && detailIntern.id === approveIntern.id) {
        setDetailIntern(null);
      }
      await loadData();
    } catch (err: any) {
      console.error('Lỗi khi phê duyệt hồ sơ:', err);
      setDecisionError(err.response?.data?.message || err.message || 'Không thể phê duyệt hồ sơ.');
    } finally {
      setIsSubmittingDecision(false);
    }
  };

  // TM-11: Từ chối hồ sơ TTS
  const handleRejectDecision = async (reason: string) => {
    if (!rejectIntern) return;
    try {
      setIsSubmittingDecision(true);
      setDecisionError(null);
      await internService.submitDecision(rejectIntern.id, {
        decision: 'REJECTED',
        rejectionReason: reason,
      });
      setSuccessToast(`Đã từ chối hồ sơ của ứng viên ${rejectIntern.fullName} (${rejectIntern.internCode}).`);
      setRejectIntern(null);
      if (detailIntern && detailIntern.id === rejectIntern.id) {
        setDetailIntern(null);
      }
      await loadData();
    } catch (err: any) {
      console.error('Lỗi khi từ chối hồ sơ:', err);
      setDecisionError(err.response?.data?.message || err.message || 'Không thể từ chối hồ sơ.');
    } finally {
      setIsSubmittingDecision(false);
    }
  };

  const pendingDocuments = documents.filter(
    (d) => d.status === 'PENDING_REVIEW' || (d.status as any) === 'PENDING'
  );

  return (
    <div className="animate-fade-in">
      <Header
        title="Bảng Điều Khiển Nhân Sự (HR Portal)"
        subtitle="Quản lý hồ sơ thực tập sinh, thẩm định CV & tài liệu ứng tuyển doanh nghiệp"
      />

      <div style={{ marginTop: '1.5rem' }}>
        {successToast && (
          <div
            style={{
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid var(--success)',
              borderRadius: 'var(--radius-md)',
              padding: '0.85rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.75rem',
              color: 'var(--success)',
              fontSize: '0.875rem',
              fontWeight: 600,
              marginBottom: '1.25rem',
              animation: 'fadeIn 0.25s ease',
            }}
          >
            <span>✓ {successToast}</span>
            <button
              type="button"
              onClick={() => setSuccessToast(null)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--success)',
                cursor: 'pointer',
                fontWeight: 700,
              }}
            >
              ✕
            </button>
          </div>
        )}

        {errorMessage && (
          <div
            style={{
              backgroundColor: 'var(--danger-bg)',
              border: '1px solid var(--danger-border)',
              borderRadius: '8px',
              padding: '0.75rem 1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.6rem',
              color: 'var(--danger)',
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
          totalInterns={totalItems}
          pendingInterns={totalPending}
          interningInterns={totalInterning}
          pendingDocuments={pendingDocuments.length}
        />

        <HrActiveProgramsGrid
          programs={activePrograms}
          pendingCountsMap={pendingCountsMap}
          onViewAll={() => navigate(ROUTES.HR.PROGRAMS)}
          onEnterWorkspace={(prog) => navigate(`/hr/programs/${prog.id}`)}
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
            onViewDetail={(intern, tab) => {
              setDetailTab(tab || 'profile');
              setDetailIntern(intern);
            }}
            onOpenEdit={(intern) => setEditIntern(intern)}
            onOpenUpload={(intern) => setUploadDocIntern(intern)}
            onOpenApprove={(intern) => {
              setDecisionError(null);
              setApproveIntern(intern);
            }}
            onOpenReject={(intern) => {
              setDecisionError(null);
              setRejectIntern(intern);
            }}
            onOpenContract={(intern) => setContractIntern(intern)}
            onStatusChange={handleStatusChange}
            onOpenAssignMentor={(intern) => setAssignMentorIntern(intern)}
            onOpenRevokeMentor={(intern) => setRevokeMentorIntern(intern)}
            onOpenRemoveProgram={(intern) => setRemoveProgramIntern(intern)}
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
        initialTab={detailTab}
        onClose={() => setDetailIntern(null)}
        onOpenEdit={(intern) => {
          setDetailIntern(null);
          setEditIntern(intern);
        }}
        onOpenUpload={(intern) => {
          setDetailIntern(null);
          setUploadDocIntern(intern);
        }}
        onOpenApprove={(intern) => {
          setDecisionError(null);
          setApproveIntern(intern);
        }}
        onOpenReject={(intern) => {
          setDecisionError(null);
          setRejectIntern(intern);
        }}
        onOpenContract={(intern) => setContractIntern(intern)}
        onUpdateIntern={(updated) => {
          setDetailIntern(updated);
          setInterns((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
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

      {/* TM-11: Modals Phê Duyệt & Từ Chối Hồ Sơ */}
      <ApproveConfirmModal
        intern={approveIntern}
        isOpen={Boolean(approveIntern)}
        isSubmitting={isSubmittingDecision}
        errorMessage={decisionError}
        onClose={() => {
          setApproveIntern(null);
          setDecisionError(null);
        }}
        onConfirm={handleApproveDecision}
      />

      <RejectInternModal
        intern={rejectIntern}
        isOpen={Boolean(rejectIntern)}
        isSubmitting={isSubmittingDecision}
        errorMessage={decisionError}
        onClose={() => {
          setRejectIntern(null);
          setDecisionError(null);
        }}
        onConfirm={handleRejectDecision}
      />

      {/* Hợp Đồng Thực Tập Sinh Điện Tử Động (Dynamic Contract & E-Signature) */}
      {contractIntern && (
        <ContractBuilderModal
          isOpen={Boolean(contractIntern)}
          intern={contractIntern}
          onClose={() => setContractIntern(null)}
          onSuccess={() => {
            setContractIntern(null);
            loadData();
            toast.success('Hợp đồng điện tử đã được xử lý thành công!');
          }}
        />
      )}

      {/* TM-16: Modals Phân công & Thu hồi Mentor */}
      <AssignMentorModal
        intern={assignMentorIntern}
        onClose={() => setAssignMentorIntern(null)}
        onSuccess={(updated) => {
          setAssignMentorIntern(null);
          setInterns((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
          if (detailIntern && detailIntern.id === updated.id) {
            setDetailIntern(updated);
          }
          toast.success('Phân công mentor thành công!');
        }}
      />

      <RevokeMentorModal
        intern={revokeMentorIntern}
        isOpen={Boolean(revokeMentorIntern)}
        onClose={() => setRevokeMentorIntern(null)}
        onSuccess={() => {
          setRevokeMentorIntern(null);
          loadData();
          toast.success('Đã thu hồi mentor thành công!');
        }}
      />

      {/* TM-31: Modal Gỡ Thực Tập Sinh Khỏi Chương Trình */}
      <RemoveProgramMemberModal
        intern={removeProgramIntern}
        isOpen={Boolean(removeProgramIntern)}
        isLoading={isRemovingProgram}
        onClose={() => setRemoveProgramIntern(null)}
        onConfirm={handleConfirmRemoveProgram}
      />
    </div>
  );
};

export default HrDashboard;
