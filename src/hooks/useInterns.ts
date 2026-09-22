import { useState, useEffect, useCallback, useRef } from 'react';
import { internService } from '../services/internService';
import type { CreateInternRequest, InternProfile, PageResponse, UpdateInternRequest } from '../types';
import type { AppError } from '../services/api';

export interface UseInternsParams {
  keyword?: string;
  university?: string;
  major?: string;
  appliedPosition?: string;
  status?: string;
  pageUI?: number; // 1-indexed UI
  pageSize?: number;
}

export function useInterns(params: UseInternsParams = {}) {
  const {
    keyword = '',
    university = '',
    major = '',
    appliedPosition = '',
    status = '',
    pageUI = 1,
    pageSize = 10,
  } = params;

  const [data, setData] = useState<PageResponse<InternProfile> | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<AppError | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchInterns = useCallback(async () => {
    // Hủy request trước đó nếu còn đang chờ
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    setError(null);

    try {
      // Chuyển đổi 1-indexed UI sang 0-indexed Backend
      const pageBE = Math.max(0, pageUI - 1);
      const res = await internService.getInterns(
        {
          keyword: keyword || undefined,
          university: university || undefined,
          major: major || undefined,
          appliedPosition: appliedPosition || undefined,
          status: status || undefined,
          page: pageBE,
          size: pageSize,
        },
        controller.signal
      );
      setData(res);
    } catch (err: any) {
      if (err.name !== 'CanceledError' && err.name !== 'AbortError') {
        setError(err);
      }
    } finally {
      setIsLoading(false);
    }
  }, [keyword, university, major, appliedPosition, status, pageUI, pageSize]);

  useEffect(() => {
    fetchInterns();
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchInterns]);

  const createIntern = async (request: CreateInternRequest) => {
    const created = await internService.createIntern(request);
    await fetchInterns();
    return created;
  };

  const updateIntern = async (id: number, request: UpdateInternRequest) => {
    const updated = await internService.updateIntern(id, request);
    await fetchInterns();
    return updated;
  };

  const updateStatus = async (id: number, newStatus: string) => {
    const target = data?.items?.find((i) => i.id === id);
    const updated = await internService.updateStatus(id, newStatus, target);
    await fetchInterns();
    return updated;
  };

  return {
    interns: data?.items || [],
    pageResponse: data,
    isLoading,
    error,
    refetch: fetchInterns,
    createIntern,
    updateIntern,
    updateStatus,
  };
}
