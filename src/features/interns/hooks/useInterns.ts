import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { internService } from '../../../services/internService';
import { documentService } from '../../../services/documentService';
import type { CreateInternRequest } from '../../../types';

export interface InternFilterParams {
  keyword?: string;
  status?: string;
  university?: string;
  page?: number;
  size?: number;
}

/**
 * useInterns - Custom hook managing intern listing server state
 */
export function useInterns(filters: InternFilterParams) {
  return useQuery({
    queryKey: ['interns', filters.keyword, filters.status, filters.university, filters.page, filters.size],
    queryFn: () =>
      internService.getInterns({
        keyword: filters.keyword || undefined,
        status: filters.status || undefined,
        university: filters.university || undefined,
        page: filters.page,
        size: filters.size,
      }),
  });
}

/**
 * useCreateIntern - Mutation hook with toast feedback and cache invalidation
 */
export function useCreateIntern() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateInternRequest) => internService.createIntern(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['interns'] });
      toast.success('Tạo hồ sơ thực tập sinh thành công', {
        description: `Mã TTS: ${res.internCode} - ${res.fullName}`,
      });
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || 'Không thể tạo thực tập sinh';
      toast.error('Lỗi khi tạo hồ sơ', { description: msg });
    },
  });
}

/**
 * useUpdateIntern - Mutation hook for updating intern profile (TM-2)
 */
export function useUpdateIntern() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: import('../../../types').UpdateInternRequest }) =>
      internService.updateIntern(id, data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['interns'] });
      toast.success('Cập nhật hồ sơ thành công', {
        description: `Mã TTS: ${res.internCode} - Trạng thái: ${res.status}`,
      });
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || 'Không thể cập nhật hồ sơ thực tập sinh';
      toast.error('Cập nhật thất bại', { description: msg });
    },
  });
}

/**
 * useUploadDocument - Mutation hook for uploading CV & application documents (TM-4)
 */
export function useUploadDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      internCode,
      file,
      documentType,
    }: {
      internCode: string;
      file: File;
      documentType: import('../../../types').DocumentType;
    }) => documentService.uploadDocument(internCode, file, documentType),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['intern-documents', res.internCode] });
      toast.success('Nộp tài liệu thành công', {
        description: `Tệp: ${res.fileName} - Chờ HR xét duyệt`,
      });
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || 'Không thể nộp tài liệu';
      toast.error('Nộp tài liệu thất bại', { description: msg });
    },
  });
}

/**
 * useDocuments - Fetch all documents
 */
export function useDocuments() {
  return useQuery({
    queryKey: ['documents'],
    queryFn: () => documentService.getAllDocuments(),
  });
}

/**
 * useInternDocuments - Fetch documents for a specific intern by internCode
 */
export function useInternDocuments(internCode?: string) {
  return useQuery({
    queryKey: ['intern-documents', internCode],
    queryFn: () => (internCode ? documentService.getDocumentsByInternCode(internCode) : Promise.resolve([])),
    enabled: Boolean(internCode),
  });
}

/**
 * useReviewDocument - Mutation hook for document review (Approve / Reject) (TM-5)
 */
export function useReviewDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      status,
      reason,
    }: {
      id: number;
      status: 'APPROVED' | 'REJECTED';
      reason?: string;
    }) => documentService.reviewDocument(id, { status, rejectionReason: reason }),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['intern-documents'] });
      if (vars.status === 'APPROVED') {
        toast.success('Phê duyệt tài liệu thành công');
      } else {
        toast.info('Đã từ chối tài liệu', { description: `Lý do: ${vars.reason || 'N/A'}` });
      }
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || 'Lỗi thao tác tài liệu';
      toast.error('Thất bại', { description: msg });
    },
  });
}
