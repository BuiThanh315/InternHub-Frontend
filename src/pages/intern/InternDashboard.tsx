import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Header } from '../../components/layout/Header';
import { Skeleton } from '../../components/common';
import { documentService } from '../../services/documentService';
import { internService } from '../../services/internService';
import { useAuth } from '../../contexts/AuthContext';
import { useInternProgram } from '../../contexts/InternProgramContext';
import type { DocumentResponse, DocumentType } from '../../types';
import { InternEmptyState } from './components/InternEmptyState';
import { MyProgramsHub } from './components/MyProgramsHub';
import {
  WorkspaceHeader,
  ApplicationProgressWorkspace,
  ActiveProductionWorkspace,
} from './components/Workspaces';
import styles from './InternDashboard.module.css';

export const InternDashboard: React.FC = () => {
  const { user } = useAuth();
  const {
    profiles,
    activeProfile,
    isLoading,
    error: programError,
    selectProgram,
    clearActiveProgram,
    refreshProfiles,
  } = useInternProgram();

  const [documents, setDocuments] = useState<DocumentResponse[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Tải tài liệu tương ứng với hồ sơ/kỳ thực tập đang active
  useEffect(() => {
    if (activeProfile?.internCode) {
      documentService
        .getDocumentsByInternCode(activeProfile.internCode)
        .then(setDocuments)
        .catch((err) => {
          console.warn('Lỗi lấy tài liệu từ máy chủ, nạp dữ liệu cục bộ:', err);
          const localDocs = internService.getLocalDocuments(activeProfile.internCode);
          setDocuments(localDocs);
        });
    } else {
      setDocuments([]);
    }
  }, [activeProfile?.internCode]);

  const handleUploadDocument = async (file: File, type: DocumentType) => {
    if (!activeProfile?.internCode) {
      toast.warning('Hồ sơ của bạn chưa có mã thực tập sinh để tải lên tài liệu.');
      return;
    }
    setIsUploading(true);
    try {
      const newDoc = await documentService.uploadDocument(activeProfile.internCode, file, type);
      internService.saveLocalDocument(activeProfile.internCode, newDoc);
      setDocuments((prev) => [newDoc, ...prev]);
      toast.success('Đã tải tài liệu lên thành công!');
      // Làm mới danh sách để cập nhật cờ hasCv nếu vừa tải CV
      refreshProfiles();
    } catch (err: any) {
      toast.error(err.message || 'Tải tài liệu thất bại');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <Header
        title="Không Gian Thực Tập Sinh (Intern Portal)"
        subtitle="Quản lý đồng thời các kỳ thực tập, theo dõi tiến trình phê duyệt hồ sơ và thực thi nhiệm vụ hàng ngày"
      />

      {isLoading ? (
        <div className={styles.skeletonContainer}>
          <Skeleton variant="rectangular" height="90px" />
          <div className={styles.contentGrid}>
            <Skeleton variant="card" height="240px" />
            <Skeleton variant="card" height="240px" />
          </div>
          <div className={styles.contentGrid}>
            <Skeleton variant="card" height="320px" />
            <Skeleton variant="card" height="320px" />
          </div>
        </div>
      ) : (
        <div className={styles.dashboardContainer}>
          {programError && (
            <div
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid #ef4444',
                borderRadius: '8px',
                padding: '0.75rem 1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                color: '#fca5a5',
                fontSize: '0.85rem',
                marginBottom: '1.25rem',
              }}
            >
              <AlertCircle size={18} />
              <span>{programError}</span>
            </div>
          )}

          {/* Trường hợp 1: Chưa chọn kỳ thực tập nào -> Hiển thị Hub Thẻ Kỳ Thực Tập */}
          {!activeProfile ? (
            profiles.length === 0 ? (
              <InternEmptyState userName={user?.fullName || user?.username} />
            ) : (
              <MyProgramsHub profiles={profiles} onSelectProgram={selectProgram} />
            )
          ) : (
            /* Trường hợp 2: Đã chọn 1 kỳ thực tập -> Mở Workspace tương ứng */
            <>
              <WorkspaceHeader
                activeProfile={activeProfile}
                allProfiles={profiles}
                onBackToHub={clearActiveProgram}
                onSwitchProgram={selectProgram}
              />

              {activeProfile.status === 'INTERNING' ? (
                /* Mode A: Active Production Workspace (Điểm danh GPS, Kanban, Báo cáo tuần) */
                <ActiveProductionWorkspace
                  profile={activeProfile}
                  documents={documents}
                  onUploadDocument={handleUploadDocument}
                  isUploading={isUploading}
                  onRefresh={refreshProfiles}
                />
              ) : (
                /* Mode B: Application Progress Workspace (Lộ trình Stepper, CV, Phỏng vấn AI, Hợp đồng) */
                <ApplicationProgressWorkspace
                  profile={activeProfile}
                  documents={documents}
                  onUploadDocument={handleUploadDocument}
                  isUploading={isUploading}
                  onRefresh={refreshProfiles}
                />
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default InternDashboard;
