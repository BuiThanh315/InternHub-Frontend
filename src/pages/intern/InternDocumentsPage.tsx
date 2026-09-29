import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FileText, ArrowRight, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

import { Header } from '../../components/layout/Header';
import { Skeleton } from '../../components/common';
import { internService } from '../../services/internService';
import { documentService } from '../../services/documentService';
import { useAuth } from '../../contexts/AuthContext';
import { ROUTES } from '../../constants/routes';
import type { InternProfile, DocumentResponse, DocumentType } from '../../types';
import { InternContractSection } from './components/InternContractSection';
import { InternDocumentList } from './components/InternDocumentList';
import { InternUploadForm } from './components/InternUploadForm';

import styles from './InternDashboard.module.css';

export const InternDocumentsPage: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<InternProfile | null>(null);
  const [documents, setDocuments] = useState<DocumentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage(null);

      // 1. Tải hồ sơ thực tập sinh mới nhất từ Backend (có fallback an toàn)
      let currentProfile: InternProfile | null = null;
      try {
        currentProfile = await internService.getMyProfile();
      } catch {
        currentProfile = internService.getLocalProfile(user?.userId);
      }
      setProfile(currentProfile);

      // 2. Tải danh sách tài liệu
      if (currentProfile?.internCode) {
        try {
          const remoteDocs = await documentService.getDocumentsByInternCode(currentProfile.internCode);
          setDocuments(remoteDocs);
        } catch {
          const localDocs = internService.getLocalDocuments(currentProfile.internCode);
          setDocuments(localDocs);
        }
      } else {
        setDocuments([]);
      }
    } catch (err: any) {
      console.error('Lỗi tải dữ liệu tài liệu Intern:', err);
      setErrorMessage(err.message || 'Không thể tải dữ liệu tài liệu');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleUploadDocument = async (file: File, type: DocumentType) => {
    if (!profile?.internCode) {
      toast.warning('Bạn cần hoàn tất nộp đơn ứng tuyển để nhận Mã Thực Tập Sinh trước khi tải lên tài liệu.');
      return;
    }
    setIsUploading(true);
    try {
      const newDoc = await documentService.uploadDocument(profile.internCode, file, type);
      internService.saveLocalDocument(profile.internCode, newDoc);
      setDocuments((prev) => [newDoc, ...prev]);
      toast.success('Đã tải tài liệu lên thành công!');
    } catch (err: any) {
      toast.error(err.message || 'Tải tài liệu thất bại');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <Header
        title="Quản Lý Hợp Đồng & Tài Liệu Trực Tuyến"
        subtitle="Xem trước và ký kết hợp đồng thực tập trực tuyến, theo dõi kết quả thẩm định và bổ sung hồ sơ theo yêu cầu"
      />

      {loading ? (
        <div className={styles.skeletonContainer}>
          <Skeleton variant="card" height="180px" />
          <div className={styles.contentGrid}>
            <Skeleton variant="card" height="320px" />
            <Skeleton variant="card" height="320px" />
          </div>
        </div>
      ) : (
        <div className={styles.dashboardContainer}>
          {errorMessage && (
            <div
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid #ef4444',
                borderRadius: '8px',
                padding: '0.75rem 1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                color: '#ef4444',
                fontSize: '0.85rem',
                marginBottom: '1.25rem',
              }}
            >
              <AlertCircle size={18} />
              <span>{errorMessage}</span>
            </div>
          )}

          {!profile ? (
            <div
              style={{
                background: 'var(--bg-card, #ffffff)',
                border: '1px solid var(--border-default, #e2e8f0)',
                borderRadius: '16px',
                padding: '3rem 2rem',
                textAlign: 'center',
                boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
                maxWidth: '680px',
                margin: '2rem auto',
              }}
            >
              <div
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '12px',
                  background: 'var(--primary-light, #eef2ff)',
                  color: 'var(--primary, #4f46e5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.25rem auto',
                }}
              >
                <FileText size={28} />
              </div>
              <h3
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  color: 'var(--text-main, #0f172a)',
                  marginBottom: '0.5rem',
                }}
              >
                Chưa Có Hồ Sơ Thực Tập Sinh
              </h3>
              <p
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--text-secondary, #475569)',
                  lineHeight: 1.6,
                  marginBottom: '1.5rem',
                }}
              >
                Bạn chưa nộp đơn ứng tuyển trực tuyến. Hãy nộp hồ sơ để được cấp Mã Thực Tập Sinh và mở
                khóa chức năng tiếp nhận hợp đồng và quản lý tài liệu.
              </p>
              <Link
                to={ROUTES.INTERN.APPLY}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.75rem',
                  borderRadius: '8px',
                  background: 'var(--primary-gradient, linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%))',
                  color: '#ffffff',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  textDecoration: 'none',
                  boxShadow: '0 4px 14px rgba(79, 70, 229, 0.35)',
                }}
              >
                <span>Nộp Hồ Sơ Ứng Tuyển Ngay</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          ) : (
            <>
              {/* TM-14: Khối Quản lý Hợp Đồng & Ký Kết Trực Tuyến */}
              <InternContractSection
                internName={profile.fullName || user?.fullName}
                internCode={profile.internCode}
                onContractUpdated={loadData}
              />

              {/* Danh sách tài liệu bổ sung & Form nộp */}
              <div className={styles.contentGrid}>
                <InternDocumentList documents={documents} />
                <InternUploadForm onUpload={handleUploadDocument} isUploading={isUploading} />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default InternDocumentsPage;
