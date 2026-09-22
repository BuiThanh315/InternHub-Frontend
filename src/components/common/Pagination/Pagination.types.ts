export interface PaginationProps {
  currentPage: number; // 1-indexed UI
  totalPages: number;
  totalItems?: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
  className?: string;
  showInfo?: boolean;
}
