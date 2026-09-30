import { useState, useEffect, useCallback, useRef } from 'react';
import { userService } from '../../../services/userService';
import { internService } from '../../../services/internService';
import { useAuth } from '../../../contexts/AuthContext';
import type { User, InternProfile } from '../../../types';

export interface UseProfileDataReturn {
  userProfile: User | null;
  internProfile: InternProfile | null;
  loading: boolean;
  errorMessage: string | null;
  refetch: () => Promise<void>;
  updateLocalUserData: (data: Partial<User>) => void;
  updateLocalInternData: (data: Partial<InternProfile>) => void;
}

export const useProfileData = (): UseProfileDataReturn => {
  const { user, role } = useAuth();
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [internProfile, setInternProfile] = useState<InternProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchProfileData = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      setLoading(true);
      setErrorMessage(null);

      // 1. Luôn tải thông tin User cơ bản (tất cả các role)
      const userPromise = user?.userId
        ? userService.getUserById(user.userId, controller.signal).catch((err) => {
            console.warn('Lỗi nạp User theo ID:', err);
            return null;
          })
        : Promise.resolve(null);

      // 2. Nếu là TTS (INTERN / USER), tải thêm InternProfile
      const isIntern = role === 'INTERN' || role === 'USER';
      const internPromise = isIntern
        ? internService.getMyProfile(controller.signal).catch((err) => {
            console.warn('Lỗi nạp getMyProfile:', err);
            // Fallback sang local profile nếu có
            return internService.getLocalProfile(user?.userId);
          })
        : Promise.resolve(null);

      const [fetchedUser, fetchedIntern] = await Promise.all([userPromise, internPromise]);

      if (fetchedUser) {
        setUserProfile(fetchedUser);
      } else if (user) {
        // Fallback tối thiểu từ session nếu API mạng có sự cố nhẹ
        setUserProfile({
          id: typeof user.userId === 'number' ? user.userId : 0,
          fullName: user.fullName || user.username,
          email: user.email || (user.username.includes('@') ? user.username : ''),
          phone: user.phone || user.phoneNumber || '',
          phoneNumber: user.phone || user.phoneNumber || '',
          avatarUrl: user.avatarUrl,
          role: user.role,
          status: 'ACTIVE',
        });
      }

      setInternProfile(fetchedIntern);
    } catch (err: any) {
      if (err.name !== 'CanceledError' && err.name !== 'AbortError') {
        console.error('Lỗi khi tải dữ liệu Profile:', err);
        setErrorMessage(err.message || 'Không thể tải đầy đủ thông tin hồ sơ.');
      }
    } finally {
      setLoading(false);
    }
  }, [user, role]);

  useEffect(() => {
    fetchProfileData();
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchProfileData]);

  const updateLocalUserData = (data: Partial<User>) => {
    setUserProfile((prev) => (prev ? { ...prev, ...data } : null));
  };

  const updateLocalInternData = (data: Partial<InternProfile>) => {
    setInternProfile((prev) => (prev ? { ...prev, ...data } : null));
  };

  return {
    userProfile,
    internProfile,
    loading,
    errorMessage,
    refetch: fetchProfileData,
    updateLocalUserData,
    updateLocalInternData,
  };
};

export default useProfileData;
