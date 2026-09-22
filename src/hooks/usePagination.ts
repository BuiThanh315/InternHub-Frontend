import { useState, useCallback } from 'react';

export interface UsePaginationOptions {
  initialPage?: number; // 1-indexed UI
  pageSize?: number;
}

export function usePagination(options: UsePaginationOptions = {}) {
  const { initialPage = 1, pageSize = 10 } = options;
  const [pageUI, setPageUI] = useState<number>(initialPage);

  // Backend Spring Boot mong muốn 0-indexed:
  const pageBE = Math.max(0, pageUI - 1);

  const setPage = useCallback((page: number) => {
    setPageUI(Math.max(1, page));
  }, []);

  const resetPage = useCallback(() => {
    setPageUI(1);
  }, []);

  return {
    pageUI, // dùng cho giao diện (1, 2, 3...)
    pageBE, // dùng cho param gửi API (0, 1, 2...)
    pageSize,
    setPage,
    resetPage,
  };
}
