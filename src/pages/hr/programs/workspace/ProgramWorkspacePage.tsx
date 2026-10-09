import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Inbox,
  Users,
  ShieldCheck,
  BarChart3,
  AlertCircle,
} from 'lucide-react';

import { toast } from 'sonner';

import { programService } from '../../../../services/programService';
import { internService } from '../../../../services/internService';
import { documentService } from '../../../../services/documentService';
import { ROUTES } from '../../../../constants/routes';

import type {
  ProgramDetailResponse,
  InternProfile,
  DocumentResponse,
  UpdateProgramRequest,
  ChangeProgramStatusRequest,
} from '../../../../types';

import { ProgramWorkspaceHeader } from './components/ProgramWorkspaceHeader';
import { ApplicationsTab } from './components/tabs/ApplicationsTab';
import { InternsTab } from './components/tabs/InternsTab';
import { MentorsTab } from './components/tabs/MentorsTab';
import { OverviewTab } from './components/tabs/OverviewTab';

// Tái sử dụng các Modals hiện có từ HR Module
import {
  EnrollInternModal,
  EditProgramModal,
  ChangeStatusModal,
  AssignMentorToProgramModal,
} from '../components';
import {
  DetailInternModal,
  EditInternModal,
  AssignMentorModal,
  UploadContractModal,
  UploadDocModal,
} from '../../components';

import type { WorkspaceTabId, WorkspaceTabConfig } from './types/ProgramWorkspace.types';
import styles from './styles/ProgramWorkspace.module.css';

export const ProgramWorkspacePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const programId = Number(id);

  // Dữ liệu chính của Workspace
  const [program, setProgram] = useState<ProgramDetailResponse | null>(null);
  const [interns, setInterns] = useState<InternProfile[]>([]);
  const [mentors, setMentors] = useState<any[]>([]);
  const [documents, setDocuments] = useState<DocumentResponse[]>([]);
  const [pendingCount, setPendingCount] = useState(0);

  // State điều khiển giao diện
  const [activeTab, setActiveTab] = useState<WorkspaceTabId>('applications');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isTogglingRecruitment, setIsTogglingRecruitment] = useState(false);

  // Modals state
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isAssignProgramMentorModalOpen, setIsAssignProgramMentorModalOpen] = useState(false);

  // Modal thao tác với Thực tập sinh cá nhân
  const [detailIntern, setDetailIntern] = useState<InternProfile | null>(null);
  const [detailTab, setDetailTab] = useState<'profile' | 'history'>('profile');
  const [editingIntern, setEditingIntern] = useState<InternProfile | null>(null);
  const [assigningMentorIntern, setAssigningMentorIntern] = useState<InternProfile | null>(null);
  const [contractIntern, setContractIntern] = useState<InternProfile | null>(null);
  const [uploadDocIntern, setUploadDocIntern] = useState<InternProfile | null>(null);
  const [uploadingDoc, setUploadingDoc] = useState(false);

  // Nạp toàn bộ dữ liệu của kỳ thực tập
  const loadWorkspaceData = useCallback(async () => {
    if (!programId || Number.isNaN(programId)) {
      setErrorMessage('Mã kỳ thực tập không hợp lệ.');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage(null);

      // Gọi đồng thời các API cần thiết
      const [progData, internRes, pendingRes, mentorList] = await Promise.all([
        programService.getProgramById(programId),
        programService.getProgramInterns(programId).catch(async () => {
          // Fallback sang internService nếu endpoint trả về cấu trúc phân trang
          const res = await internService.getInterns({ programId, size: 100 });
          return res.items || res.content || [];
        }),
        internService.getInterns({ programId, status: 'PENDING', size: 1 }).catch(() => null),
        programService.getProgramMentors(programId).catch(() => []),
      ]);

      const detailedProg = progData as ProgramDetailResponse;
      setProgram(detailedProg);
      setInterns(internRes);
      setMentors(mentorList);
      setPendingCount(pendingRes?.totalItems ?? 0);

      // Nếu có học viên, nạp danh sách tài liệu
      if (internRes.length > 0) {
        const codes = internRes.map((i) => i.internCode).filter(Boolean);
        if (codes.length > 0) {
          const docList = await documentService.getAllDocuments(codes).catch(() => []);
          setDocuments(docList);
        }
      }
    } catch (err: any) {
      console.error('Lỗi khi nạp thông tin kỳ thực tập:', err);
      setErrorMessage(err.response?.data?.message || err.message || 'Không thể tải dữ liệu Workspace.');
    } finally {
      setIsLoading(false);
    }
  }, [programId]);

  useEffect(() => {
    void loadWorkspaceData();
  }, [loadWorkspaceData]);

  // Đổi trạng thái nhận hồ sơ
  const handleToggleRecruitment = async () => {
    if (!program) return;
    try {
      setIsTogglingRecruitment(true);
      const updated = await programService.toggleRecruitment(program.id);
      setProgram((prev) => (prev ? { ...prev, isRecruitmentOpen: updated.isRecruitmentOpen } : null));
      toast.success(
        `Đã ${updated.isRecruitmentOpen ? 'mở' : 'đóng'} tiếp nhận hồ sơ cho "${program.name}".`
      );
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Không thể đổi trạng thái nhận hồ sơ.');
    } finally {
      setIsTogglingRecruitment(false);
    }
  };

  // Cập nhật thông tin chương trình
  const handleEditProgramSubmit = async (id: number, form: UpdateProgramRequest) => {
    try {
      await programService.updateProgram(id, form);
      toast.success('Đã cập nhật thông tin kỳ thực tập thành công!');
      setIsEditModalOpen(false);
      void loadWorkspaceData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Không thể cập nhật kỳ thực tập.');
    }
  };

  // Chuyển đổi trạng thái kỳ thực tập
  const handleChangeStatusSubmit = async (id: number, form: ChangeProgramStatusRequest) => {
    try {
      await programService.changeStatus(id, form);
      toast.success(`Đã chuyển trạng thái kỳ thực tập sang "${form.targetStatus}".`);
      setIsStatusModalOpen(false);
      void loadWorkspaceData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Không thể thay đổi trạng thái.');
    }
  };

  // Cập nhật thông tin thực tập sinh
  const handleSaveEditIntern = async (internId: number, form: any) => {
    try {
      await internService.updateIntern(internId, form);
      toast.success('Đã lưu thay đổi thông tin thực tập sinh!');
      setEditingIntern(null);
      void loadWorkspaceData();
    } catch (err: any) {
      toast.error(err.message || 'Lỗi cập nhật thực tập sinh');
    }
  };

  // Upload tài liệu cho TTS
  const handleUploadDocSubmit = async (docType: any, file: File) => {
    if (!uploadDocIntern) return;
    try {
      setUploadingDoc(true);
      await documentService.uploadDocument(uploadDocIntern.internCode, file, docType);
      toast.success('Tải lên tài liệu thành công!');
      setUploadDocIntern(null);
      void loadWorkspaceData();
    } catch (err: any) {
      toast.error(err.message || 'Lỗi tải lên tài liệu');
    } finally {
      setUploadingDoc(false);
    }
  };


  // Cấu hình Tabs
  const tabsConfig: WorkspaceTabConfig[] = [
    {
      id: 'applications',
      label: 'Tiếp Nhận Đơn',
      iconName: 'Inbox',
      badgeCount: pendingCount,
    },
    {
      id: 'interns',
      label: 'Thực Tập Sinh',
      iconName: 'Users',
      badgeCount: interns.length,
    },
    {
      id: 'mentors',
      label: 'Đội Ngũ Mentors',
      iconName: 'ShieldCheck',
      badgeCount: mentors.length,
    },
    {
      id: 'overview',
      label: 'Tổng Quan & Quota',
      iconName: 'BarChart3',
    },
  ];

  if (errorMessage && !program) {
    return (
      <div className={styles.workspaceContainer}>
        <div className={styles.errorBanner} role="alert">
          <div className={styles.errorBannerContent}>
            <AlertCircle size={20} />
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            className="btn btn-sm btn-secondary"
            onClick={() => navigate(ROUTES.HR.PROGRAMS)}
          >
            Quay lại danh sách chương trình
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.workspaceContainer}>
      {program && (
        <>
          {/* Header Workspace */}
          <ProgramWorkspaceHeader
            program={program}
            pendingCount={pendingCount}
            internsCount={interns.length}
            mentorsCount={mentors.length}
            onBack={() => navigate(ROUTES.HR.PROGRAMS)}
            onOpenEnroll={() => setIsEnrollModalOpen(true)}
            onOpenEdit={() => setIsEditModalOpen(true)}
            onOpenStatus={() => setIsStatusModalOpen(true)}
            onToggleRecruitment={handleToggleRecruitment}
            isTogglingRecruitment={isTogglingRecruitment}
          />

          {/* Tab Navigation Bar */}
          <div className={styles.tabsContainer} role="tablist">
            {tabsConfig.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={`${styles.tabItem} ${isActive ? styles.tabItemActive : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.id === 'applications' && <Inbox size={16} aria-hidden="true" />}
                  {tab.id === 'interns' && <Users size={16} aria-hidden="true" />}
                  {tab.id === 'mentors' && <ShieldCheck size={16} aria-hidden="true" />}
                  {tab.id === 'overview' && <BarChart3 size={16} aria-hidden="true" />}

                  <span>{tab.label}</span>

                  {tab.badgeCount !== undefined && (
                    <span
                      className={`${styles.tabCountBadge} ${
                        tab.id === 'applications' && tab.badgeCount > 0 ? styles.tabCountBadgeHighlight : ''
                      }`}
                    >
                      {tab.badgeCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Active Tab Content Card */}
          <div className={styles.contentCard} role="tabpanel">
            {activeTab === 'applications' && (
              <ApplicationsTab
                program={program}
                onEnrollSuccess={() => void loadWorkspaceData()}
                onViewInternDetail={(intern) => {
                  setDetailTab('profile');
                  setDetailIntern(intern);
                }}
              />
            )}

            {activeTab === 'interns' && (
              <InternsTab
                program={program}
                interns={interns}
                isLoading={isLoading}
                onRefresh={() => void loadWorkspaceData()}
                onViewDetail={(intern, tab) => {
                  setDetailTab(tab || 'profile');
                  setDetailIntern(intern);
                }}
                onEditIntern={(intern) => setEditingIntern(intern)}
                onAssignMentor={(intern) => setAssigningMentorIntern(intern)}
                onUploadContract={(intern) => setContractIntern(intern)}
                onStatusChange={() => void loadWorkspaceData()}
              />
            )}

            {activeTab === 'mentors' && (
              <MentorsTab
                program={program}
                mentors={mentors}
                isLoading={isLoading}
                onRefresh={() => void loadWorkspaceData()}
                onAssignProgramMentor={() => setIsAssignProgramMentorModalOpen(true)}
              />
            )}

            {activeTab === 'overview' && (
              <OverviewTab
                program={program}
                interns={interns}
                pendingCount={pendingCount}
              />
            )}
          </div>

          {/* Modals Tái Sử Dụng */}
          <EnrollInternModal
            isOpen={isEnrollModalOpen}
            program={program}
            onClose={() => setIsEnrollModalOpen(false)}
            onSuccess={() => {
              void loadWorkspaceData();
              toast.success('Đã cập nhật danh sách học viên của kỳ!');
            }}
          />

          <EditProgramModal
            isOpen={isEditModalOpen}
            program={program}
            departments={[]}
            onClose={() => setIsEditModalOpen(false)}
            onSubmit={handleEditProgramSubmit}
          />

          <ChangeStatusModal
            isOpen={isStatusModalOpen}
            program={program}
            onClose={() => setIsStatusModalOpen(false)}
            onSubmit={handleChangeStatusSubmit}
          />

          <AssignMentorToProgramModal
            isOpen={isAssignProgramMentorModalOpen}
            program={program}
            onClose={() => setIsAssignProgramMentorModalOpen(false)}
            onSuccess={() => {
              void loadWorkspaceData();
            }}
          />

          {/* Detail Intern Modal */}
          <DetailInternModal
            intern={detailIntern}
            documents={documents}
            initialTab={detailTab}
            onClose={() => setDetailIntern(null)}
            onOpenEdit={(intern) => {
              setDetailIntern(null);
              setEditingIntern(intern);
            }}
            onOpenUpload={(intern) => {
              setDetailIntern(null);
              setUploadDocIntern(intern);
            }}
            onOpenApprove={() => {}}
            onOpenReject={() => {}}
            onOpenContract={(intern) => setContractIntern(intern)}
            onUpdateIntern={(updated) => {
              setDetailIntern(updated);
              setInterns((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
            }}
          />

          {/* Edit Intern Modal */}
          <EditInternModal
            intern={editingIntern}
            onClose={() => setEditingIntern(null)}
            onSave={handleSaveEditIntern}
          />

          {/* Assign Mentor Modal */}
          {assigningMentorIntern && (
            <AssignMentorModal
              intern={assigningMentorIntern}
              onClose={() => setAssigningMentorIntern(null)}
              onSuccess={() => {
                setAssigningMentorIntern(null);
                void loadWorkspaceData();
              }}
            />
          )}

          {/* Upload Contract Modal */}
          {contractIntern && (
            <UploadContractModal
              isOpen={!!contractIntern}
              intern={contractIntern}
              onClose={() => setContractIntern(null)}
              onSuccess={() => {
                setContractIntern(null);
                void loadWorkspaceData();
              }}
            />
          )}


          {/* Upload Doc Modal */}
          <UploadDocModal
            intern={uploadDocIntern}
            uploading={uploadingDoc}
            onClose={() => setUploadDocIntern(null)}
            onSubmit={handleUploadDocSubmit}
          />
        </>
      )}
    </div>
  );
};

export default ProgramWorkspacePage;
