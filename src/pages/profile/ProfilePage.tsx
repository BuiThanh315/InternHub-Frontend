import React, { useState } from 'react';
import { User as UserIcon, GraduationCap, Briefcase, Shield } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Skeleton, Alert, Button } from '../../components/common';
import { useProfileData } from './hooks/useProfileData';
import {
  ProfileHeader,
  PersonalInfoTab,
  InternAcademicTab,
  InternshipDetailTab,
  StaffProfessionalTab,
  AccountSecurityTab,
  EditProfileModal,
  EditAcademicModal,
  AvatarUploadModal,
} from './components';
import type { User, InternProfile } from '../../types';
import styles from './ProfilePage.module.css';

type ProfileTabKey = 'personal' | 'academic' | 'internship' | 'staff' | 'security';

export const ProfilePage: React.FC = () => {
  const { user, role, updateUser } = useAuth();
  const {
    userProfile,
    internProfile,
    loading,
    errorMessage,
    refetch,
    updateLocalUserData,
    updateLocalInternData,
  } = useProfileData();

  const [activeTab, setActiveTab] = useState<ProfileTabKey>('personal');
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isEditAcademicOpen, setIsEditAcademicOpen] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

  const isIntern = role === 'INTERN' || role === 'USER';

  const handleProfileUpdated = (updatedUser: User) => {
    updateLocalUserData(updatedUser);
    updateUser({
      fullName: updatedUser.fullName,
      email: updatedUser.email,
      phone: updatedUser.phone || updatedUser.phoneNumber,
      address: updatedUser.address,
    });
  };

  const handleAcademicUpdated = (updatedIntern: InternProfile) => {
    updateLocalInternData(updatedIntern);
  };

  const handleAvatarUpdated = (newAvatarUrl: string) => {
    updateLocalUserData({ avatarUrl: newAvatarUrl });
  };

  if (loading && !userProfile) {
    return (
      <div className={styles.pageContainer}>
        <Skeleton variant="rectangular" height={220} style={{ borderRadius: '16px' }} />
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
          <Skeleton variant="rectangular" width={160} height={40} style={{ borderRadius: '8px' }} />
          <Skeleton variant="rectangular" width={160} height={40} style={{ borderRadius: '8px' }} />
          <Skeleton variant="rectangular" width={160} height={40} style={{ borderRadius: '8px' }} />
        </div>
        <div style={{ marginTop: '1.5rem' }}>
          <Skeleton variant="rectangular" height={360} style={{ borderRadius: '16px' }} />
        </div>
      </div>
    );
  }

  if (errorMessage && !userProfile) {
    return (
      <div className={styles.pageContainer}>
        <Alert type="error" title="Không thể tải thông tin hồ sơ" message={errorMessage}>
          <div style={{ marginTop: '0.75rem' }}>
            <Button variant="secondary" size="sm" onClick={() => refetch()}>
              Thử lại
            </Button>
          </div>
        </Alert>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      {/* 1. Header Banner & Avatar */}
      <ProfileHeader
        user={userProfile}
        role={role}
        onOpenAvatarUpload={() => setIsAvatarModalOpen(true)}
      />

      {/* 2. Navigation Tabs */}
      <div className={styles.tabNavigation} role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'personal'}
          className={`${styles.tabButton} ${activeTab === 'personal' ? styles.tabButtonActive : ''}`}
          onClick={() => setActiveTab('personal')}
        >
          <UserIcon size={17} className={styles.tabIcon} />
          <span>Thông Tin Cá Nhân</span>
        </button>

        {isIntern ? (
          <>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'academic'}
              className={`${styles.tabButton} ${activeTab === 'academic' ? styles.tabButtonActive : ''}`}
              onClick={() => setActiveTab('academic')}
            >
              <GraduationCap size={17} className={styles.tabIcon} />
              <span>Học Vấn & Kỹ Năng</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'internship'}
              className={`${styles.tabButton} ${activeTab === 'internship' ? styles.tabButtonActive : ''}`}
              onClick={() => setActiveTab('internship')}
            >
              <Briefcase size={17} className={styles.tabIcon} />
              <span>Kỳ Thực Tập & Mentor</span>
            </button>
          </>
        ) : (
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'staff'}
            className={`${styles.tabButton} ${activeTab === 'staff' ? styles.tabButtonActive : ''}`}
            onClick={() => setActiveTab('staff')}
          >
            <Briefcase size={17} className={styles.tabIcon} />
            <span>Biên Chế & Công Tác</span>
          </button>
        )}

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'security'}
          className={`${styles.tabButton} ${activeTab === 'security' ? styles.tabButtonActive : ''}`}
          onClick={() => setActiveTab('security')}
        >
          <Shield size={17} className={styles.tabIcon} />
          <span>Bảo Mật & Mật Khẩu</span>
        </button>
      </div>

      {/* 3. Tab Contents */}
      <div className={styles.tabContentArea}>
        {activeTab === 'personal' && (
          <PersonalInfoTab
            user={userProfile}
            onOpenEditModal={() => setIsEditProfileOpen(true)}
          />
        )}

        {activeTab === 'academic' && isIntern && (
          <InternAcademicTab
            profile={internProfile}
            onOpenEditAcademic={() => setIsEditAcademicOpen(true)}
          />
        )}

        {activeTab === 'internship' && isIntern && (
          <InternshipDetailTab profile={internProfile} />
        )}

        {activeTab === 'staff' && !isIntern && (
          <StaffProfessionalTab user={userProfile} role={role} />
        )}

        {activeTab === 'security' && (
          <AccountSecurityTab onSuccess={() => {}} />
        )}
      </div>

      {/* 4. Modals */}
      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        user={userProfile}
        internProfile={internProfile}
        onSuccess={handleProfileUpdated}
      />

      {isIntern && (
        <EditAcademicModal
          isOpen={isEditAcademicOpen}
          onClose={() => setIsEditAcademicOpen(false)}
          profile={internProfile}
          onSuccess={handleAcademicUpdated}
        />
      )}

      <AvatarUploadModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        currentAvatarUrl={userProfile?.avatarUrl}
        userId={userProfile?.id || user?.userId}
        onAvatarUpdated={handleAvatarUpdated}
      />
    </div>
  );
};

export default ProfilePage;
