import React, { useState, useEffect, useMemo } from 'react';
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
  ExternalLink,
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
import { ConfirmReasonDialog } from '../../components/shared/ConfirmReasonDialog';
import {
  useInterns,
  useCreateIntern,
  useUpdateIntern,
  useDocuments,
  useReviewDocument,
} from '../../features/interns/hooks/useInterns';
import { documentService } from '../../services/documentService';
import type { InternProfile } from '../../types';

/**
 * HrDashboard - Clean Code Refactored Version
 * - Debounced search 300ms
 * - useMemo on Table columns
 * - Custom Hooks (useInterns, useCreateIntern, useDocuments, useReviewDocument)
 * - Mobile card view (docs/spec.md section 4.5)
 * - Sonner Toast notification on actions
 */
export const HrDashboard: React.FC = () => {
  const { role } = useAuth();

  // Search and Filter States
  const [searchInput, setSearchInput] = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedRows, setSelectedRows] = useState<number[]>([]);

  // Dialog States
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingIntern, setEditingIntern] = useState<InternProfile | null>(null);
  const [rejectDialogState, setRejectDialogState] = useState<{
    isOpen: boolean;
    docId?: number;
    internCode?: string;
  }>({ isOpen: false });

  // Debounce search input 300ms (Point B - Anti-spam API)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedKeyword(searchInput.trim());
    }, 300);
    return () => clearTimeout(handler);
  }, [searchInput]);

  // Clean Custom Hooks (Point A)
  const {
    data: internsData,
    isLoading: isLoadingInterns,
    error: internsError,
    refetch: refetchInterns,
  } = useInterns({
    keyword: debouncedKeyword,
    status: selectedStatus,
  });

  const { data: documentsData, isLoading: isLoadingDocs } = useDocuments();
  const createInternMutation = useCreateIntern();
  const updateInternMutation = useUpdateIntern();
  const reviewDocMutation = useReviewDocument();

  const interns = internsData?.content || [];
  const documents = documentsData || [];

  // Calculations for KPI Cards
  const totalCount = interns.length;
  const activeCount = interns.filter(
    (i) => i.status === 'INTERNING' || i.status === 'APPROVED'
  ).length;
  const pendingCount = interns.filter(
    (i) => i.status === 'SUBMITTED' || i.status === 'PENDING'
  ).length;
  const completedCount = interns.filter((i) => i.status === 'COMPLETED').length;

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
            className="rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--primary)]"
          />
        ),
        width: '44px',
        className: 'text-center',
        render: (row) => (
          <input
            type="checkbox"
            checked={selectedRows.includes(row.id)}
            onChange={(e) => {
              e.stopPropagation();
              toggleRow(row.id);
            }}
            className="rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--primary)]"
          />
        ),
      },
      {
        key: 'person',
        header: 'Thực tập sinh',
        width: '210px',
        render: (row) => (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[var(--primary-soft)] text-[var(--primary)] font-bold text-xs flex items-center justify-center border border-[var(--border)] shrink-0">
              {row.fullName.charAt(0)}
            </div>
            <div className="min-w-0">
              <span className="font-semibold text-[var(--text-1)] block text-xs leading-tight truncate">
                {row.fullName}
              </span>
              <span className="text-[11px] text-[var(--text-3)] block mt-0.5 truncate">
                {row.internCode} · {row.email}
              </span>
            </div>
          </div>
        ),
      },
      {
        key: 'education',
        header: 'Học vấn & Ngành',
        width: '160px',
        render: (row) => (
          <div className="min-w-0">
            <span className="font-medium text-xs text-[var(--text-1)] block truncate">
              {row.university}
            </span>
            <span className="text-[11px] text-[var(--text-3)] block truncate">
              {row.major}
            </span>
          </div>
        ),
      },
      {
        key: 'department',
        header: 'Phòng ban & Mentor',
        width: '160px',
        render: (row) => (
          <div className="min-w-0">
            <span className="text-xs font-medium text-[var(--text-1)] block truncate">
              {row.department || 'Chưa phân bổ'}
            </span>
            <span className="text-[11px] text-[var(--text-3)] block truncate">
              {row.mentorName ? `Mentor: ${row.mentorName}` : 'Chưa có mentor'}
            </span>
          </div>
        ),
      },
      {
        key: 'gpa',
        header: 'GPA',
        width: '65px',
        className: 'text-center',
        render: (row) => (
          <span className="inline-block px-1.5 py-0.5 rounded text-[11px] font-bold bg-[var(--surface-2)] text-[var(--text-1)] border border-[var(--border)]">
            {row.gpa ? row.gpa.toFixed(2) : 'N/A'}
          </span>
        ),
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
        width: '70px',
        className: 'text-right',
        render: (row) => (
          <div className="flex items-center justify-end gap-1">
            {canEditIntern(role) && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingIntern(row);
                }}
                title="Chỉnh sửa thông tin"
                className="p-1 rounded-md text-[var(--text-3)] hover:text-[var(--primary)] hover:bg-[var(--surface-2)] transition-colors"
              >
                <Edit size={15} />
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (canEditIntern(role)) {
                  setEditingIntern(row);
                }
              }}
              title="Tùy chọn khác"
              className="p-1 rounded-md text-[var(--text-3)] hover:text-[var(--text-1)] hover:bg-[var(--surface-2)] transition-colors"
            >
              <MoreVertical size={15} />
            </button>
          </div>
        ),
      },
    ];
  }, [interns, selectedRows, role]);

  // Mobile Card List Renderer (Point C - Responsive Mobile UX)
  const renderMobileCard = (row: InternProfile) => (
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-start gap-2.5">
        <div className="w-9 h-9 rounded-full bg-[var(--primary-soft)] text-[var(--primary)] font-bold text-xs flex items-center justify-center shrink-0 border border-[var(--border)]">
          {row.fullName.charAt(0)}
        </div>
        <div>
          <span className="font-semibold text-sm text-[var(--text-1)] block">
            {row.fullName}
          </span>
          <span className="text-xs text-[var(--text-3)] block mt-0.5">
            {row.university} · {row.major}
          </span>
          <span className="text-xs text-[var(--text-2)] block mt-1">
            {row.department || 'Chưa phân bổ'} {row.mentorName ? `· Mentor: ${row.mentorName}` : ''}
          </span>
        </div>
      </div>
      <div className="shrink-0 flex flex-col items-end gap-1.5">
        <div className="flex items-center gap-1.5">
          <StatusBadge status={row.status} />
          {canEditIntern(role) && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setEditingIntern(row);
              }}
              className="p-1 rounded text-text-3 hover:text-primary hover:bg-surface-2 transition-colors"
              title="Chỉnh sửa"
            >
              <Edit size={14} />
            </button>
          )}
        </div>
        {row.gpa && (
          <span className="text-[11px] font-semibold text-[var(--text-2)] bg-[var(--surface-2)] px-1.5 py-0.5 rounded border border-[var(--border)]">
            GPA: {row.gpa.toFixed(2)}
          </span>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-extrabold text-text-1 tracking-tight font-heading"
          >
            Quản Lý Thực Tập Sinh
          </h1>
          <p className="text-sm text-text-2 mt-0.5">
            Theo dõi, phân bổ và xét duyệt toàn bộ tiến trình thực tập sinh
          </p>
        </div>

        {canEditIntern(role) && (
          <button
            onClick={() => setShowCreateDialog(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-primary text-white hover:bg-primary-hover shadow-xs transition-colors self-start sm:self-auto"
          >
            <Plus size={16} /> Thêm Thực Tập Sinh
          </button>
        )}
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <KpiCard
          title="Tổng Thực Tập Sinh"
          value={totalCount}
          icon={Users}
          active={selectedStatus === ''}
          onClick={() => setSelectedStatus('')}
          subtitle="Toàn bộ hồ sơ"
        />
        <KpiCard
          title="Đang Thực Tập"
          value={activeCount}
          icon={GraduationCap}
          accentColor="var(--success)"
          active={selectedStatus === 'INTERNING'}
          onClick={() => setSelectedStatus('INTERNING')}
          subtitle="Đang trong tiến trình"
        />
        <KpiCard
          title="Hồ Sơ Chờ Duyệt"
          value={pendingCount}
          icon={Clock}
          accentColor="var(--warning)"
          active={selectedStatus === 'SUBMITTED'}
          onClick={() => setSelectedStatus('SUBMITTED')}
          subtitle="Cần HR xử lý"
        />
        <KpiCard
          title="Đã Hoàn Thành"
          value={completedCount}
          icon={CheckCircle2}
          accentColor="var(--info)"
          active={selectedStatus === 'COMPLETED'}
          onClick={() => setSelectedStatus('COMPLETED')}
          subtitle="Kết thúc đúng hạn"
        />
      </div>

      {/* Main Grid: 8 cols for Intern List + 4 cols for High Priority Widget (docs/spec.md 3.1) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Intern List Section (8/12 width on xl) */}
        <div className="xl:col-span-8 min-w-0 space-y-4">
          {selectedRows.length > 0 ? (
            <BulkActionsBar
              selectedCount={selectedRows.length}
              onClearSelection={() => setSelectedRows([])}
              canDelete={role === 'ADMIN'}
            />
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-[12px] bg-surface border border-border shadow-card">
              <FilterBar
                currentStatus={selectedStatus}
                onSelectStatus={setSelectedStatus}
                counts={{
                  '': totalCount,
                  INTERNING: activeCount,
                  SUBMITTED: pendingCount,
                  COMPLETED: completedCount,
                }}
              />

              {/* Debounced search input */}
              <div className="relative w-full sm:w-60 flex items-center shrink-0">
                <Search
                  size={14}
                  className="absolute left-3 text-text-3 pointer-events-none z-10"
                />
                <input
                  type="text"
                  placeholder="Tìm theo tên, mã TTS..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full !pl-9 pr-3 py-1.5 text-xs rounded-lg bg-bg border border-border text-text-1 placeholder:text-text-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
          )}

          {/* Table Header Row: Result counter as required by docs/spec.md section 5.2 */}
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-semibold text-text-2">
              Danh sách thực tập sinh ({interns.length} kết quả)
            </span>
          </div>

          {/* DataTable with Mobile Card Support */}
          <DataTable
            columns={columns}
            data={interns}
            loading={isLoadingInterns}
            isFiltered={Boolean(debouncedKeyword || selectedStatus)}
            error={internsError ? 'Không thể kết nối đến máy chủ. Vui lòng thử lại.' : null}
            onRetry={refetchInterns}
            onClearFilter={() => {
              setSearchInput('');
              setDebouncedKeyword('');
              setSelectedStatus('');
            }}
            emptyTitle="Chưa có thực tập sinh nào"
            emptyDescription="Bắt đầu tuyển dụng và thêm hồ sơ thực tập sinh mới vào hệ thống."
            keyExtractor={(row) => row.id}
            renderMobileCard={renderMobileCard}
          />
        </div>

        {/* High Priority Widget: Việc cần xử lý (4/12 width on xl) */}
        <div className="xl:col-span-4 min-w-0 p-5 rounded-[12px] bg-surface border border-border shadow-card space-y-4">
          <div className="flex items-center justify-between border-b border-border-soft pb-3">
            <div>
              <h3 className="text-sm font-bold text-text-1 flex items-center gap-1.5 font-heading">
                <FileCheck2 size={16} className="text-warning" /> Việc Cần Xử Lý
              </h3>
              <span className="text-[11px] text-text-3">
                Ưu tiên cao nhất trong ngày của HR
              </span>
            </div>
            {pendingDocuments.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-warning-soft text-warning">
                {pendingDocuments.length}
              </span>
            )}
          </div>

          {isLoadingDocs ? (
            <div className="space-y-3 animate-pulse">
              <div className="h-14 bg-surface-2 rounded-lg" />
              <div className="h-14 bg-surface-2 rounded-lg" />
            </div>
          ) : pendingDocuments.length === 0 ? (
            <div className="py-8 text-center text-xs text-text-3">
              🎉 Tuyệt vời! Không có tài liệu hoặc CV nào đang chờ duyệt.
            </div>
          ) : (
            <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
              {pendingDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="p-3 rounded-lg border border-border bg-surface-2 hover:border-primary/50 transition-all flex flex-col gap-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <a
                        href={documentService.getDocumentDownloadUrl(doc.id)}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-semibold text-text-1 hover:text-primary block truncate flex items-center gap-1 group"
                        title="Tải xuống / Xem trước tài liệu"
                      >
                        <span className="truncate">{doc.fileName}</span>
                        <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                      </a>
                      <span className="text-[11px] text-text-3 block mt-0.5 truncate">
                        Mã TTS: <span className="font-medium text-text-2">{doc.internCode}</span> · {doc.documentType}
                      </span>
                    </div>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-warning-soft text-warning shrink-0">
                      Chờ duyệt
                    </span>
                  </div>

                  {canApprove(role) && (
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-soft">
                      <button
                        onClick={() =>
                          setRejectDialogState({
                            isOpen: true,
                            docId: doc.id,
                            internCode: doc.internCode,
                          })
                        }
                        className="px-2.5 py-1 text-xs font-semibold rounded-md bg-danger-soft text-danger hover:bg-danger/10 transition-colors"
                      >
                        Từ chối
                      </button>
                      <button
                        onClick={() =>
                          reviewDocMutation.mutate({ id: doc.id, status: 'APPROVED' })
                        }
                        className="px-2.5 py-1 text-xs font-semibold rounded-md bg-success text-white hover:bg-success/90 transition-colors shadow-xs"
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
      </div>

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
    </div>
  );
};
