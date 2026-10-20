import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { internService } from '../services/internService';
import type { InternProfile } from '../types';

export interface InternProgramContextType {
  profiles: InternProfile[];
  activeProfile: InternProfile | null;
  activeProgramId: number | null;
  isLoading: boolean;
  error: string | null;
  selectProgram: (programId: number) => void;
  clearActiveProgram: () => void;
  refreshProfiles: () => Promise<void>;
}

const InternProgramContext = createContext<InternProgramContextType | undefined>(undefined);

export const InternProgramProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [profiles, setProfiles] = useState<InternProfile[]>([]);
  const [activeProfile, setActiveProfile] = useState<InternProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const urlProgramIdStr = searchParams.get('programId');
  const urlProgramId = urlProgramIdStr ? Number(urlProgramIdStr) : null;

  const fetchProfiles = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setProfiles([]);
      setActiveProfile(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // 1. Thử gọi API lấy danh sách toàn bộ kỳ thực tập (multi-profiles)
      let myProfiles: InternProfile[] = [];
      try {
        myProfiles = await internService.getMyProfiles();
      } catch (listErr: any) {
        console.warn('Không thể gọi getMyProfiles, fallback sang getMyProfile:', listErr);
        try {
          const single = await internService.getMyProfile();
          if (single) {
            myProfiles = [single];
          }
        } catch (singleErr) {
          console.warn('Fallback getMyProfile thất bại:', singleErr);
          throw listErr;
        }
      }

      // 2. Bổ sung kiểm tra cờ hasCv với tài liệu đã nộp nếu có
      const enrichedProfiles = myProfiles.map((p) => {
        const hasLocalCv = p.internCode
          ? internService.getLocalDocuments(p.internCode).some((d) => d.documentType === 'CV')
          : false;
        return {
          ...p,
          hasCv: Boolean(p.hasCv || hasLocalCv),
        };
      });

      setProfiles(enrichedProfiles);

      if (enrichedProfiles.length > 0 && user?.userId) {
        internService.saveLocalProfile(user.userId, enrichedProfiles[0]);
      }

      // Chỉ kích hoạt Workspace khi URL có chỉ định rõ ?programId=
      // Khi người dùng đăng nhập hoặc truy cập Dashboard thông thường (không có ?programId=),
      // hệ thống LUÔN hiển thị Hub thẻ danh sách các kỳ thực tập (MyProgramsHub).
      if (urlProgramId && enrichedProfiles.length > 0) {
        const matched = enrichedProfiles.find((p) => p.programId === urlProgramId) || null;
        setActiveProfile(matched);
        if (matched && user?.userId) {
          internService.setActiveProgramId(user.userId, matched.programId ?? null);
        }
      } else {
        setActiveProfile(null);
      }
    } catch (err: any) {
      console.error('Lỗi khi tải danh sách kỳ thực tập:', err);
      // Fallback an toàn local
      const local = internService.getLocalProfile(user.userId);
      if (local) {
        setProfiles([local]);
        if (urlProgramId && local.programId === urlProgramId) {
          setActiveProfile(local);
        } else {
          setActiveProfile(null);
        }
      } else {
        setError(err.response?.data?.message || err.message || 'Không thể tải danh sách kỳ thực tập.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user, urlProgramId]);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  const selectProgram = useCallback(
    (programId: number) => {
      const found = profiles.find((p) => p.programId === programId);
      if (found) {
        setActiveProfile(found);
      } else {
        // Gọi API nạp trực tiếp profile theo programId nếu chưa có trong list
        internService
          .getMyProfile(programId)
          .then((p) => {
            if (p) {
              setActiveProfile(p);
              setProfiles((prev) => {
                const exists = prev.some((item) => item.programId === p.programId);
                return exists ? prev : [p, ...prev];
              });
            }
          })
          .catch((err) => console.warn('Không thể nạp profile theo programId:', err));
      }

      if (user?.userId) {
        internService.setActiveProgramId(user.userId, programId);
      }

      // Đồng bộ vào searchParams
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.set('programId', String(programId));
          return next;
        },
        { replace: false }
      );
    },
    [profiles, user?.userId, setSearchParams]
  );

  const clearActiveProgram = useCallback(() => {
    setActiveProfile(null);
    if (user?.userId) {
      internService.setActiveProgramId(user.userId, null);
    }
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete('programId');
        return next;
      },
      { replace: false }
    );
  }, [user?.userId, setSearchParams]);

  const activeProgramId = activeProfile?.programId ?? null;

  const value = useMemo(
    () => ({
      profiles,
      activeProfile,
      activeProgramId,
      isLoading,
      error,
      selectProgram,
      clearActiveProgram,
      refreshProfiles: fetchProfiles,
    }),
    [profiles, activeProfile, activeProgramId, isLoading, error, selectProgram, clearActiveProgram, fetchProfiles]
  );

  return <InternProgramContext.Provider value={value}>{children}</InternProgramContext.Provider>;
};

export const useInternProgram = (): InternProgramContextType => {
  const context = useContext(InternProgramContext);
  if (!context) {
    throw new Error('useInternProgram must be used within an InternProgramProvider');
  }
  return context;
};
