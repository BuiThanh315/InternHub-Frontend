import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import {
  Users,
  GraduationCap,
  Clock,
  CheckCircle2,
  Search,
  Plus,
  FileCheck2,
  MoreVertical,
  Edit,
  Download,
  Loader2,
  X,
  SlidersHorizontal,
  Eye,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { canEditIntern, canApprove } from '../../lib/permissions';
import { KpiCard } from '../../components/shared/KpiCard';
import { DataTable, type Column } from '../../components/shared/DataTable';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { FilterBar } from '../../features/interns/components/FilterBar';
import { BulkActionsBar } from '../../features/interns/components/BulkActionsBar';
import { InternFormDialog } from '../../features/interns/components/InternFormDialog';
import { InternEditDialog } from '../../features/interns/components/InternEditDialog';
import { InternDocumentsModal } from '../../features/interns/components/InternDocumentsModal';
import { ConfirmReasonDialog } from '../../components/shared/ConfirmReasonDialog';
import { AdvancedFilterDrawer } from '../../features/interns/components/AdvancedFilterDrawer';
import { InternDetailModal } from '../../features/interns/components/InternDetailModal';
import {
  useInterns,
  useAllInterns,
  useCreateIntern,
  useUpdateIntern,
  useDocuments,
  useReviewDocument,
} from '../../features/interns/hooks/useInterns';
import { documentService } from '../../services/documentService';
import type { InternProfile } from '../../types';

/**
 * HrDashboard - Clean Code Refactored Version adhering to docs/spec.md
 * - Debounced search 300ms with spinner
 * - Search + filter synced into URL query parameters (spec.md 5.2)
 * - Persistent KPI & Quick filter baseline counts (spec.md 5.1 & 5.2)
 * - Two-tier filter: Quick filter chips + Advanced Filter Drawer (spec.md 5.1)
 * - Row click to view Intern Detail Modal (spec.md 4.3 & 8)
 * - Safe status transition requiring reason (spec.md 9.2)
 * - useMemo on Table columns
 * - Mobile card view (docs/spec.md section 4.5)
 * - Sonner Toast notification on actions
 */
export const HrDashboard: React.FC = () => {
  const { role } = useAuth();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPath = location.pathname;

  // URL search params as single source of truth for query
  const urlKeyword = searchParams.get('keyword') || '';
  const urlStatus = searchParams.get('status') || '';
  const urlUniversity = searchParams.get('university') || '';
  const urlDepartment = searchParams.get('department') || '';

  // Search and Filter States (initialize from URL)
  const [searchInput, setSearchInput] = useState(urlKeyword);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // Dialog States
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [viewingDetailIntern, setViewingDetailIntern] = useState<InternProfile | null>(null);
  const [editingIntern, setEditingIntern] = useState<InternProfile | null>(null);
  const [viewingDocumentsIntern, setViewingDocumentsIntern] = useState<InternProfile | null>(null);
  const [rejectDialogState, setRejectDialogState] = useState<{
    isOpen: boolean;
    docId?: number;
    internCode?: string;
  }>({ isOpen: false });
  const [statusChangeConfirm, setStatusChangeConfirm] = useState<{
    isOpen: boolean;
    intern?: InternProfile;
    nextStatus?: import('../../types').InternStatus;
    updatePayload?: any;
  }>({ isOpen: false });

  // Debounce search input 300ms and sync to URL (spec.md 5.2 & 5.3)
  useEffect(() => {
    const handler = setTimeout(() => {
      const trimmed = searchInput.trim();
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (trimmed) {
          next.set('keyword', trimmed);
        } else {
          next.delete('keyword');
        }
        return next;
      }, { replace: true });
    }, 300);
    return () => clearTimeout(handler);
  }, [searchInput, setSearchParams]);

  // Keep searchInput in sync if URL changes externally (e.g. Back/Forward)
  useEffect(() => {
    if (urlKeyword !== searchInput.trim() && searchInput === '') {
      setSearchInput(urlKeyword);
    }
  }, [urlKeyword]);

  // Filter setters that sync directly with URL search params
  const handleSelectStatus = (status: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (status) {
        next.set('status', status);
      } else {
        next.delete('status');
      }
      return next;
    }, { replace: true });
  };

  const handleSelectUniversity = (university: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (university) {
        next.set('university', university);
      } else {
        next.delete('university');
      }
      return next;
    }, { replace: true });
  };

  // Clean Custom Hooks (Point A)
  const {
    data: internsData,
    isLoading: isLoadingInterns,
    isFetching: isFetchingInterns,
    error: internsError,
    refetch: refetchInterns,
  } = useInterns({
    keyword: urlKeyword,
    status: urlStatus,
    university: urlUniversity,
  });

  // Baseline interns query for accurate KPI counters and chip badges regardless of current filter
  const { data: allInternsData } = useAllInterns();
  const baselineInterns = allInternsData?.content || [];

  const { data: documentsData, isLoading: isLoadingDocs } = useDocuments();
  const createInternMutation = useCreateIntern();
  const updateInternMutation = useUpdateIntern();
  const reviewDocMutation = useReviewDocument();

  const interns = internsData?.content || [];
  const documents = documentsData || [];

  // Accurate baseline counts for KPI Cards and FilterBar chips (spec.md 5.1 & 5.2)
  const totalCount = baselineInterns.length > 0 ? baselineInterns.length : interns.length;
  const activeCount = (baselineInterns.length > 0 ? baselineInterns : interns).filter(
    (i) => i.status === 'INTERNING' || i.status === 'APPROVED'
  ).length;
  const pendingCount = (baselineInterns.length > 0 ? baselineInterns : interns).filter(
    (i) => i.status === 'SUBMITTED' || i.status === 'PENDING'
  ).length;
  const completedCount = (baselineInterns.length > 0 ? baselineInterns : interns).filter(
    (i) => i.status === 'COMPLETED'
  ).length;
  const rejectedCount = (baselineInterns.length > 0 ? baselineInterns : interns).filter(
    (i) => i.status === 'REJECTED'
  ).length;

  // Documents waiting for review (Việc cần xử lý widget)
  const pendingDocuments = documents.filter((d) => d.status === 'PENDING');

  // Checkbox Selection Handlers
  const toggleRow = (id: number) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedRows.length === interns.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(interns.map((i) => i.id));
    }
  };

  // useMemo for Columns (Point C - Senior Frontend Performance)
  const columns: Column<InternProfile>[] = useMemo(() => {
    return [
      {
        key: 'select',
        header: (
          <input
            type="checkbox"
            checked={interns.length > 0 && selectedRows.length === interns.length}
            onChange={toggleAll}
            className="rounded border-border text-primary focus:ring-primary accent-primary"
          />
        ),
        width: '40px',
        className: 'text-center',
        render: (row) => (
          <input
            type="checkbox"
            checked={selectedRows.includes(row.id)}
            onChange={(e) => {
              e.stopPropagation();
              toggleRow(row.id);
            }}
            className="rounded border-border text-primary focus:ring-primary accent-primary"
          />
        ),
      },
      {
        key: 'person',
        header: 'Thực tập sinh',
        width: '200px',
        render: (row) => (
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-primary-soft text-primary font-bold text-xs flex items-center justify-center border border-border shrink-0">
              {row.fullName.charAt(0)}
            </div>
            <div className="min-w-0">
              <span className="font-semibold text-text-1 block text-xs leading-tight truncate">
                {row.fullName}
              </span>
              <span className="text-[11px] text-text-3 block mt-0.5 truncate">
                {row.internCode} · {row.email}
              </span>
            </div>
          </div>
        ),
      },
      {
        key: 'education',
        header: 'Học vấn & Ngành',
        width: '150px',
        render: (row) => (
          <div className="min-w-0">
            <span className="font-medium text-xs text-text-1 block truncate">
              {row.university}
            </span>
            <span className="text-[11px] text-text-3 block truncate">
              {row.major}
            </span>
          </div>
        ),
      },
      {
        key: 'department',
        header: 'Phòng ban & Mentor',
        width: '150px',
        render: (row) => (
          <div className="min-w-0">
            <span className="text-xs font-medium text-text-1 block truncate">
              {row.department || 'Chưa phân bổ'}
            </span>
            <span className="text-[11px] text-text-3 block truncate">
              {row.mentorName ? `Mentor: ${row.mentorName}` : 'Chưa có mentor'}
            </span>
          </div>
        ),
      },
      {
        key: 'gpa',
        header: 'GPA',
        width: '55px',
        className: 'text-center',
        render: (row) => (
          <span className="inline-block px-1.5 py-0.5 rounded text-[11px] font-bold bg-surface-2 text-text-1 border border-border">
            {row.gpa ? row.gpa.toFixed(2) : 'N/A'}
          </span>
        ),
      },
      {
        key: 'documents',
        header: 'Hồ sơ & CV',
        width: '140px',
        render: (row) => {
          const docs = documents.filter((d) => d.internCode === row.internCode);
          const pendingDocCount = docs.filter((d) => d.status === 'PENDING').length;
          
          if (docs.length === 0) {
            return (
              <span className="text-[11px] text-text-3 italic">
                Chưa nộp CV
              </span>
            );
          }

          return (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setViewingDocumentsIntern(row);
              }}
              className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-semibold bg-surface-2 hover:bg-primary-soft hover:text-primary border border-border transition-colors cursor-pointer text-text-2 group"
              title="Bấm để xem và duyệt tài liệu của TTS này"
            >
              <span>📄 {docs.length} tài liệu</span>
              {pendingDocCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-warning text-white">
                  {pendingDocCount} chờ
                </span>
              )}
            </button>
          );
        },
      },
      {
        key: 'status',
        header: 'Trạng thái',
        width: '130px',
        render: (row) => <StatusBadge status={row.status} />,
      },
      {
        key: 'actions',
        header: '',
        width: '80px',
        className: 'text-right',
        render: (row) => (
          <div className="flex items-center justify-end gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setViewingDetailIntern(row);
              }}
              title="Xem chi tiết hồ sơ"
              className="p-1 rounded-md text-text-3 hover:text-primary hover:bg-surface-2 transition-colors cursor-pointer"
            >
              <Eye size={15} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setViewingDocumentsIntern(row);
              }}
              title="Xem và duyệt tài liệu"
              className="p-1 rounded-md text-text-3 hover:text-primary hover:bg-surface-2 transition-colors cursor-pointer"
            >
              <FileCheck2 size={15} />
            </button>
            {canEditIntern(role) && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingIntern(row);
                }}
                title="Chỉnh sửa thông tin"
                className="p-1 rounded-md text-text-3 hover:text-primary hover:bg-surface-2 transition-colors cursor-pointer"
              >
                <Edit size={15} />
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setViewingDetailIntern(row);
              }}
              title="Tùy chọn khác"
              className="p-1 rounded-md text-text-3 hover:text-text-1 hover:bg-surface-2 transition-colors cursor-pointer"
            >
              <MoreVertical size={15} />
            </button>
          </div>
        ),
      },
    ];
  }, [interns, documents, selectedRows, role]);

  // Mobile Card List Renderer (Point C - Responsive Mobile UX)
  const renderMobileCard = (row: InternProfile) => (
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-start gap-2.5 min-w-0">
        <div className="w-9 h-9 rounded-full bg-primary-soft text-primary font-bold text-xs flex items-center justify-center shrink-0 border border-border">
          {row.fullName.charAt(0)}
        </div>
        <div className="min-w-0">
          <span className="font-semibold text-sm text-text-1 block truncate">
            {row.fullName}
          </span>
          <span className="text-xs text-text-3 block mt-0.5 truncate">
            {row.university} · {row.major}
          </span>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <StatusBadge status={row.status} />
            <span className="text-[11px] text-text-3">
              GPA: <strong>{row.gpa?.toFixed(2) || 'N/A'}</strong>
            </span>
          </div>
        </div>
      </div>
      {canEditIntern(role) && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setEditingIntern(row);
          }}
          className="p-1.5 rounded-lg border border-border text-text-3 hover:text-primary hover:bg-surface-2 transition-colors"
        >
          <Edit size={16} />
        </button>
      )}
    </div>
  );

  // Tiêu đề và mô tả động theo URL trên Sidebar
  const pageHeader = useMemo(() => {
    if (currentPath === '/hr/review') {
      return {
        title: 'Duyệt Tài Liệu & CV',
        subtitle: 'Thẩm định hồ sơ, phê duyệt hoặc từ chối CV và tài liệu do ứng viên thực tập sinh nộp',
      };
    }
    if (currentPath === '/hr/interns') {
      return {
        title: 'Hồ Sơ Thực Tập Sinh',
        subtitle: 'Tra cứu, lọc, thêm mới và quản lý chi tiết toàn bộ danh sách thực tập sinh',
      };
    }
    return {
      title: 'Bảng Điều Khiển HR',
      subtitle: 'Tổng quan chỉ số hoạt động, việc cần xử lý và danh sách thực tập sinh',
    };
  }, [currentPath]);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-extrabold text-text-1 tracking-tight font-heading"
          >
            {pageHeader.title}
          </h1>
          <p className="text-sm text-text-2 mt-0.5">
            {pageHeader.subtitle}
          </p>
        </div>

        {canEditIntern(role) && currentPath !== '/hr/review' && (
          <button
            onClick={() => setShowCreateDialog(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-primary text-white hover:bg-primary-hover shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
          >
            <Plus size={16} /> Thêm Hồ Sơ Thực Tập Sinh
          </button>
        )}
      </div>

      {/* Top Banner: Metric counters - Hiển thị ở /hr/dashboard và /hr/interns */}
      {currentPath !== '/hr/review' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
          <KpiCard
            title="Tổng Thực Tập Sinh"
            value={totalCount}
            icon={Users}
            accentColor="var(--primary)"
            active={urlStatus === ''}
            onClick={() => handleSelectStatus('')}
            subtitle="Toàn bộ hồ sơ"
          />
          <KpiCard
            title="Đang Thực Tập"
            value={activeCount}
            icon={GraduationCap}
            accentColor="var(--success)"
            active={urlStatus === 'INTERNING'}
            onClick={() => handleSelectStatus(urlStatus === 'INTERNING' ? '' : 'INTERNING')}
            subtitle="Đang trong tiến trình"
          />
          <KpiCard
            title="Hồ Sơ Chờ Duyệt"
            value={pendingCount}
            icon={Clock}
            accentColor="var(--warning)"
            active={urlStatus === 'PENDING'}
            onClick={() => handleSelectStatus(urlStatus === 'PENDING' ? '' : 'PENDING')}
            subtitle="Cần HR xử lý"
          />
          <KpiCard
            title="Đã Hoàn Thành"
            value={completedCount}
            icon={CheckCircle2}
            accentColor="var(--info)"
            active={urlStatus === 'COMPLETED'}
            onClick={() => handleSelectStatus(urlStatus === 'COMPLETED' ? '' : 'COMPLETED')}
            subtitle="Kết thúc đúng hạn"
          />
        </div>
      )}

      {/* Main Table Section - Hiển thị ở /hr/dashboard và /hr/interns */}
      {currentPath !== '/hr/review' && (
        <div className="w-full space-y-4">
          {selectedRows.length > 0 ? (
            <BulkActionsBar
              selectedCount={selectedRows.length}
              onClearSelection={() => setSelectedRows([])}
              canDelete={role === 'ADMIN'}
            />
          ) : (
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3.5 rounded-[12px] bg-surface border border-border shadow-card">
              <div className="overflow-x-auto pb-1 md:pb-0 scrollbar-none">
                <FilterBar
                  currentStatus={urlStatus}
                  onSelectStatus={handleSelectStatus}
                  counts={{
                    '': totalCount,
                    INTERNING: activeCount,
                    PENDING: pendingCount,
                    COMPLETED: completedCount,
                    REJECTED: rejectedCount,
                  }}
                />
              </div>

              {/* Search Input & Advanced Filter Trigger Button (spec.md 5.1 & 7.3) */}
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full md:w-auto">
                {/* Nút mở Drawer Bộ lọc nâng cao (spec.md 5.1) */}
                <button
                  onClick={() => setIsFilterDrawerOpen(true)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer shrink-0 ${
                    urlUniversity || urlDepartment
                      ? 'bg-primary text-white border-primary shadow-xs'
                      : 'bg-surface text-text-2 border-border hover:bg-surface-2 hover:text-text-1'
                  }`}
                  title="Mở bộ lọc nâng cao"
                >
                  <SlidersHorizontal size={13} />
                  <span>Lọc thêm</span>
                  {(urlUniversity || urlDepartment) && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white text-primary font-bold">
                      {(urlUniversity ? 1 : 0) + (urlDepartment ? 1 : 0)}
                    </span>
                  )}
                </button>

                {/* Debounced search input with loading spinner (spec.md 5.3) */}
                <div className="relative w-full sm:w-60 flex items-center shrink-0">
                  <Search
                    size={14}
                    className="absolute left-3 text-text-3 pointer-events-none z-10"
                  />
                  <input
                    type="text"
                    placeholder="Tìm tên, trường, ngành, mã..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="w-full !pl-9 !pr-8 py-1.5 text-xs rounded-lg bg-bg border border-border text-text-1 placeholder:text-text-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                  {/* Spinner hoặc nút Clear */}
                  <div className="absolute right-2.5 flex items-center">
                    {isFetchingInterns ? (
                      <Loader2 size={13} className="animate-spin text-primary" />
                    ) : searchInput ? (
                      <button
                        onClick={() => {
                          setSearchInput('');
                          setSearchParams((prev) => {
                            const next = new URLSearchParams(prev);
                            next.delete('keyword');
                            return next;
                          }, { replace: true });
                        }}
                        className="text-text-3 hover:text-text-1 p-0.5"
                        title="Xoá tìm kiếm"
                      >
                        <X size={13} />
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Applied Filter Chips row (spec.md 5.2) */}
          {(urlKeyword || urlStatus || urlUniversity || urlDepartment) && (
            <div className="flex items-center gap-2 flex-wrap px-1">
              <span className="text-[11px] font-medium text-text-3">Đang lọc:</span>
              {urlKeyword && (
                <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-surface border border-border text-text-1">
                  Từ khóa: <strong>{urlKeyword}</strong>
                  <button
                    onClick={() => {
                      setSearchInput('');
                      setSearchParams((p) => {
                        const n = new URLSearchParams(p);
                        n.delete('keyword');
                        return n;
                      }, { replace: true });
                    }}
                    className="text-text-3 hover:text-danger ml-0.5"
                  >
                    <X size={11} />
                  </button>
                </span>
              )}
              {urlUniversity && (
                <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-surface border border-border text-text-1">
                  Trường: <strong>{urlUniversity}</strong>
                  <button
                    onClick={() => handleSelectUniversity('')}
                    className="text-text-3 hover:text-danger ml-0.5"
                  >
                    <X size={11} />
                  </button>
                </span>
              )}
              {urlDepartment && (
                <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-surface border border-border text-text-1">
                  Phòng ban: <strong>{urlDepartment}</strong>
                  <button
                    onClick={() => {
                      setSearchParams((p) => {
                        const n = new URLSearchParams(p);
                        n.delete('department');
                        return n;
                      }, { replace: true });
                    }}
                    className="text-text-3 hover:text-danger ml-0.5"
                  >
                    <X size={11} />
                  </button>
                </span>
              )}
              <button
                onClick={() => {
                  setSearchInput('');
                  setSearchParams(new URLSearchParams(), { replace: true });
                }}
                className="text-[11px] font-semibold text-primary hover:underline ml-1"
              >
                Xóa tất cả
              </button>
            </div>
          )}

          {/* Table Header Row with active filter indicator */}
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-semibold text-text-2">
              Danh sách thực tập sinh ({interns.length} kết quả)
            </span>
          </div>

          {/* DataTable - Full-Width Adaptive with Row Click (spec.md 4.3 & 8) */}
          <DataTable
            columns={columns}
            data={interns}
            loading={isLoadingInterns}
            isFiltered={Boolean(urlKeyword || urlStatus || urlUniversity || urlDepartment)}
            error={
              internsError
                ? ((internsError as any)?.response?.data?.message || (internsError as any)?.message || 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra đăng nhập hoặc thử lại.')
                : null
            }
            onRetry={refetchInterns}
            onRowClick={(row) => setViewingDetailIntern(row)}
            onClearFilter={() => {
              setSearchInput('');
              setSearchParams(new URLSearchParams(), { replace: true });
            }}
            emptyTitle="Chưa có thực tập sinh nào"
            emptyDescription="Bắt đầu tuyển dụng và thêm hồ sơ thực tập sinh mới vào hệ thống."
            keyExtractor={(row) => row.id}
            renderMobileCard={renderMobileCard}
          />
        </div>
      )}

      {/* Dedicated Section: Việc Cần Xử Lý (Hiện ở /hr/dashboard và chuyên biệt ở /hr/review) */}
      {(currentPath === '/hr/dashboard' || currentPath === '/hr/review') && (
        <div className="w-full p-5 rounded-[12px] bg-surface border border-border shadow-card space-y-4">
        <div className="flex items-center justify-between border-b border-border-soft pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-warning-soft text-warning">
              <FileCheck2 size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-text-1 flex items-center gap-2 font-heading">
                Việc Cần Xử Lý
                {pendingDocuments.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-warning-soft text-warning">
                    {pendingDocuments.length} tài liệu chờ duyệt
                  </span>
                )}
              </h3>
              <span className="text-xs text-text-3">
                Các hồ sơ ứng tuyển, CV và giấy tờ sinh viên mới nộp cần HR thẩm định và phê duyệt
              </span>
            </div>
          </div>
        </div>

        {isLoadingDocs ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 animate-pulse">
            <div className="h-24 bg-surface-2 rounded-lg" />
            <div className="h-24 bg-surface-2 rounded-lg" />
            <div className="h-24 bg-surface-2 rounded-lg" />
          </div>
        ) : pendingDocuments.length === 0 ? (
          <div className="py-8 text-center text-xs text-text-3">
            🎉 Tuyệt vời! Tất cả tài liệu và CV đã được xử lý xong, không có mục nào đang tồn đọng.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {pendingDocuments.map((doc) => (
              <div
                key={doc.id}
                className="p-3.5 rounded-lg border border-border bg-surface-2 hover:border-primary/50 transition-all flex flex-col justify-between gap-3"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <button
                      onClick={() => documentService.downloadDocumentFile(doc.id, doc.fileName)}
                      className="text-xs font-semibold text-text-1 hover:text-primary truncate flex items-center gap-1 group text-left cursor-pointer"
                      title="Bấm để tải xuống tài liệu"
                    >
                      <span className="truncate">{doc.fileName}</span>
                      <Download size={12} className="opacity-60 group-hover:opacity-100 transition-opacity shrink-0 text-primary" />
                    </button>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-warning-soft text-warning shrink-0">
                      Chờ duyệt
                    </span>
                  </div>
                  <div className="text-[11px] text-text-3 mt-1.5 flex items-center gap-2">
                    <span>Mã TTS: <strong className="text-text-2">{doc.internCode}</strong></span>
                    <span>·</span>
                    <span className="text-primary font-medium">{doc.documentType}</span>
                  </div>
                </div>

                {canApprove(role) && (
                  <div className="flex items-center justify-end gap-2 pt-2.5 border-t border-border-soft">
                    <button
                      onClick={() =>
                        setRejectDialogState({
                          isOpen: true,
                          docId: doc.id,
                          internCode: doc.internCode,
                        })
                      }
                      className="px-2.5 py-1 text-xs font-semibold rounded-md bg-danger-soft text-danger hover:bg-danger/15 transition-colors cursor-pointer"
                    >
                      Từ chối
                    </button>
                    <button
                      onClick={() =>
                        reviewDocMutation.mutate({ id: doc.id, status: 'APPROVED' })
                      }
                      className="px-3 py-1 text-xs font-semibold rounded-md bg-success text-white hover:bg-success/90 transition-colors shadow-xs cursor-pointer"
                    >
                      Phê duyệt
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      )}

      {/* Create Modal */}
      <InternFormDialog
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSubmit={async (values) => {
          await createInternMutation.mutateAsync(values);
        }}
      />

      {/* Edit Modal (TM-2: Chỉnh sửa thông tin & Trạng thái TTS) */}
      <InternEditDialog
        isOpen={Boolean(editingIntern)}
        intern={editingIntern}
        onClose={() => setEditingIntern(null)}
        onSubmit={async (values) => {
          if (editingIntern) {
            // Nếu đổi trạng thái sang REJECTED hoặc DROPPED, bắt buộc qua ConfirmReasonDialog (spec.md 9.2)
            if (
              values.status !== editingIntern.status &&
              (values.status === 'REJECTED' || values.status === 'DROPPED')
            ) {
              setStatusChangeConfirm({
                isOpen: true,
                intern: editingIntern,
                nextStatus: values.status,
                updatePayload: values,
              });
              return;
            }

            await updateInternMutation.mutateAsync({
              id: editingIntern.id,
              data: values,
            });
            setEditingIntern(null);
          }
        }}
      />

      {/* Reject Modal */}
      <ConfirmReasonDialog
        isOpen={rejectDialogState.isOpen}
        title="Từ Chối Tài Liệu"
        description={`Bạn đang từ chối tài liệu của TTS ${rejectDialogState.internCode}. Thao tác này sẽ gửi thông báo và lưu lại vào audit log.`}
        isDangerous={true}
        confirmLabel="Xác nhận từ chối"
        onConfirm={async (reason) => {
          if (rejectDialogState.docId) {
            await reviewDocMutation.mutateAsync({
              id: rejectDialogState.docId,
              status: 'REJECTED',
              reason,
            });
          }
        }}
        onClose={() => setRejectDialogState({ isOpen: false })}
      />

      {/* Advanced Filter Drawer (docs/spec.md section 5.1 & 7.3) */}
      <AdvancedFilterDrawer
        isOpen={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        university={urlUniversity}
        onSelectUniversity={(uni) => handleSelectUniversity(uni)}
        department={urlDepartment}
        onSelectDepartment={(dept) => {
          setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            if (dept) {
              next.set('department', dept);
            } else {
              next.delete('department');
            }
            return next;
          }, { replace: true });
        }}
        onReset={() => {
          setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            next.delete('university');
            next.delete('department');
            return next;
          }, { replace: true });
        }}
        activeCount={(urlUniversity ? 1 : 0) + (urlDepartment ? 1 : 0)}
      />

      {/* Intern Detail Modal (docs/spec.md section 8 & 4.3) */}
      <InternDetailModal
        isOpen={Boolean(viewingDetailIntern)}
        intern={viewingDetailIntern}
        documents={documents}
        onClose={() => setViewingDetailIntern(null)}
        onEdit={(intern) => setEditingIntern(intern)}
      />

      {/* Status Change Reason Confirm Dialog (docs/spec.md section 7.1 & 9.2) */}
      <ConfirmReasonDialog
        isOpen={statusChangeConfirm.isOpen}
        title={`Xác Nhận Chuyển Trạng Thái: ${statusChangeConfirm.nextStatus}`}
        description={`Chuyển trạng thái sang "${statusChangeConfirm.nextStatus}" là hành động quan trọng cần ghi nhận lý do rõ ràng vào audit log của hệ thống.`}
        isDangerous={statusChangeConfirm.nextStatus === 'REJECTED' || statusChangeConfirm.nextStatus === 'DROPPED'}
        requireReason={true}
        confirmLabel="Lưu và ghi log"
        onConfirm={async (reason) => {
          if (statusChangeConfirm.intern && statusChangeConfirm.updatePayload) {
            await updateInternMutation.mutateAsync({
              id: statusChangeConfirm.intern.id,
              data: {
                ...statusChangeConfirm.updatePayload,
                notes: statusChangeConfirm.updatePayload.notes
                  ? `${statusChangeConfirm.updatePayload.notes}\n[Lý do đổi trạng thái sang ${statusChangeConfirm.nextStatus}]: ${reason}`
                  : `[Lý do đổi trạng thái sang ${statusChangeConfirm.nextStatus}]: ${reason}`,
              },
            });
            setStatusChangeConfirm({ isOpen: false });
            setEditingIntern(null);
          }
        }}
        onClose={() => setStatusChangeConfirm({ isOpen: false })}
      />

      {/* Intern Documents Review Modal (TM-5: AC-5 View & Review Documents) */}
      <InternDocumentsModal
        isOpen={Boolean(viewingDocumentsIntern)}
        intern={viewingDocumentsIntern}
        documents={documents}
        onClose={() => setViewingDocumentsIntern(null)}
        onApprove={async (docId) => {
          await reviewDocMutation.mutateAsync({ id: docId, status: 'APPROVED' });
        }}
        onReject={(docId, internCode) => {
          setRejectDialogState({
            isOpen: true,
            docId,
            internCode,
          });
        }}
      />
    </div>
  );
};
