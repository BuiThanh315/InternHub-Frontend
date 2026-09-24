import React, { useState, useEffect, useCallback } from 'react';
import { AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Header } from '../../components/layout/Header';
import { Skeleton } from '../../components/common';
import { internService } from '../../services/internService';
import { documentService } from '../../services/documentService';
import { useAuth } from '../../contexts/AuthContext';
import type { InternProfile, DocumentResponse, DocumentType } from '../../types';
import { InternStepper } from './components/InternStepper';
import { InternProfileCard } from './components/InternProfileCard';
import { InternDocumentList } from './components/InternDocumentList';
import { InternUploadForm } from './components/InternUploadForm';
import styles from './InternDashboard.module.css';

export const InternDashboard: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<InternProfile | null>(null);
  const [documents, setDocuments] = useState<DocumentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const loadInternData = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage(null);

      // Tìm hồ sơ TTS tương ứng trong hệ thống
      const internRes = await internService.getInterns();
      const internList = internRes.items || internRes.content || [];

      let currentProfile: InternProfile | null = null;
      if (internList.length > 0) {
        currentProfile =
          internList.find(
            (i) =>
              i.email === user?.username ||
              i.fullName.toLowerCase().includes(user?.username || '')
          ) || internList[0];
        setProfile(currentProfile);
      }

      if (currentProfile) {
        const docRes = await documentService.getDocumentsByInternCode(currentProfile.internCode);
        setDocuments(docRes);
      }
    } catch (err: any) {
      console.error('Lỗi tải dữ liệu Intern Dashboard:', err);
      setErrorMessage(err.message || 'Không thể kết nối đến máy chủ backend');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadInternData();
  }, [loadInternData]);

  const handleUploadDocument = async (file: File, type: DocumentType) => {
    if (!profile?.internCode) {
      toast.warning('Hồ sơ của bạn chưa có mã thực tập sinh để tải lên tài liệu.');
      return;
    }
    setIsUploading(true);
    try {
      const newDoc = await documentService.uploadDocument(profile.internCode, file, type);
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
        title="Không Gian Thực Tập Sinh (Intern Portal)"
        subtitle="Theo dõi lộ trình thực tập, tra cứu kết quả thẩm định hồ sơ và nộp tài liệu trực tuyến"
      />

      {loading ? (
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
          {errorMessage && (
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
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Lộ trình thực tập */}
          <InternStepper status={profile?.status} />

          {/* Thông tin cá nhân & Mentor */}
          {profile && <InternProfileCard profile={profile} />}

          {/* Danh sách tài liệu & Form nộp tài liệu */}
          <div className={styles.contentGrid}>
            <InternDocumentList documents={documents} />
            <InternUploadForm onUpload={handleUploadDocument} isUploading={isUploading} />
          </div>
        </div>
      )}
    </div>
  );
};

export default InternDashboard;
