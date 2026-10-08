import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  UserPlus,
  FileText,
  Edit3,
  Eye,
  CheckCircle2,
  Clock,
  UserX,
  RefreshCw,
} from 'lucide-react';
import { Button, Skeleton } from '../../../../../../components/common';
import type { InternsTabProps } from '../../types/ProgramWorkspace.types';
import styles from '../../styles/ProgramWorkspace.module.css';

export const InternsTab: React.FC<InternsTabProps> = ({
  program,
  interns,
  isLoading,
  onRefresh,
  onViewDetail,
  onEditIntern,
  onAssignMentor,
  onUploadContract,
}) => {

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Lọc danh sách TTS nội bộ trong kỳ
  const filteredInterns = useMemo(() => {
    return interns.filter((intern) => {
      const matchSearch =
        searchTerm.trim() === '' ||
        intern.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        intern.internCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        intern.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        intern.university.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus =
        statusFilter === 'ALL' || intern.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [interns, searchTerm, statusFilter]);

  // Trạng thái badge cho Intern
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'INTERNING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
            Đang thực tập
          </span>
        );
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 size={12} />
            Đã tiếp nhận
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
            <CheckCircle2 size={12} />
            Hoàn thành kỳ
          </span>
        );
      case 'ON_HOLD':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <Clock size={12} />
            Tạm hoãn
          </span>
        );
      case 'TERMINATED':
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            <UserX size={12} />
            Đã dừng / Hủy
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            {status}
          </span>
        );
    }
  };

  return (
    <div>
      {/* Section Header with Quick Filters */}
      <div className={styles.sectionHeader}>
        <div>
          <h2 className={styles.sectionTitle}>
            <Users size={20} className="text-indigo-600" aria-hidden="true" />
            Danh Sách Thực Tập Sinh Thuộc Kỳ ({interns.length})
          </h2>
          <p className={styles.sectionSubtitle}>
            Theo dõi tiến độ, phân công Mentor và quản lý hồ sơ thực tập sinh chính thức.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Search Input */}
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              type="text"
              className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-52"
              placeholder="Tìm tên, mã TTS, trường..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <select
            className="py-1.5 px-2.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="INTERNING">Đang thực tập</option>
            <option value="APPROVED">Đã tiếp nhận (chờ onboarding)</option>
            <option value="COMPLETED">Đã hoàn thành</option>
            <option value="ON_HOLD">Tạm hoãn</option>
          </select>

          <Button
            variant="secondary"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center gap-1.5"
          >
            <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} aria-hidden="true" />
            Làm mới
          </Button>
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="space-y-3 py-4">
          <Skeleton height={56} />
          <Skeleton height={56} />
          <Skeleton height={56} />
          <Skeleton height={56} />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredInterns.length === 0 && (
        <div className={styles.emptyState}>
          <div className={styles.emptyIconCircle}>
            <Users size={32} aria-hidden="true" />
          </div>
          <h3 className={styles.emptyTitle}>
            {searchTerm || statusFilter !== 'ALL'
              ? 'Không tìm thấy thực tập sinh phù hợp'
              : 'Chưa có thực tập sinh nào trong kỳ này'}
          </h3>
          <p className={styles.emptyDescription}>
            {searchTerm || statusFilter !== 'ALL'
              ? 'Thử thay đổi từ khóa tìm kiếm hoặc bỏ bộ lọc trạng thái để xem đầy đủ.'
              : `Kỳ thực tập "${program.name}" chưa có học viên nào được tiếp nhận hoặc phân bổ.`}
          </p>
        </div>
      )}

      {/* Interns Table */}
      {!isLoading && filteredInterns.length > 0 && (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Thực Tập Sinh</th>
                <th>Mã TTS</th>
                <th>Trường Đại Học</th>
                <th>Trạng Thái</th>
                <th>Mentor Phụ Trách</th>
                <th style={{ textAlign: 'right' }}>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredInterns.map((intern) => {
                const initials = (intern.fullName || 'U')
                  .split(' ')
                  .map((n) => n[0])
                  .slice(-2)
                  .join('')
                  .toUpperCase();

                return (
                  <tr key={intern.id}>
                    {/* Cột Họ tên & Email */}
                    <td>
                      <div className={styles.internAvatarCell}>
                        <div className={styles.avatarCircle} aria-hidden="true">
                          {initials}
                        </div>
                        <div>
                          <div className={styles.internName}>{intern.fullName}</div>
                          <div className={styles.internEmail}>{intern.email} • {intern.phone}</div>
                        </div>
                      </div>
                    </td>

                    {/* Cột Mã TTS */}
                    <td className="font-tabular">
                      <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                        {intern.internCode || `--`}
                      </span>
                    </td>

                    {/* Cột Trường ĐH */}
                    <td>
                      <div className="font-medium text-slate-800 dark:text-slate-200">
                        {intern.university || 'Chưa cập nhật'}
                      </div>
                      <div className="text-xs text-slate-500">{intern.major || 'Chưa rõ'}</div>
                    </td>

                    {/* Cột Trạng thái */}
                    <td>{renderStatusBadge(intern.status)}</td>

                    {/* Cột Mentor phụ trách */}
                    <td>
                      {intern.mentorName ? (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">
                            {intern.mentorName.charAt(0)}
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                              {intern.mentorName}
                            </div>
                            <button
                              type="button"
                              className="text-[11px] text-indigo-600 hover:underline inline-block"
                              onClick={() => onAssignMentor(intern)}
                            >
                              Đổi Mentor
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/40 px-2 py-1 rounded-md border border-amber-200 dark:border-amber-800 transition-colors"
                          onClick={() => onAssignMentor(intern)}
                        >
                          <UserPlus size={12} />
                          <span>Gán Mentor</span>
                        </button>
                      )}
                    </td>

                    {/* Cột Thao tác */}
                    <td style={{ textAlign: 'right' }}>
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Xem hồ sơ chi tiết */}
                        <button
                          type="button"
                          className={styles.actionIconBtn}
                          onClick={() => onViewDetail(intern, 'profile')}
                          title="Xem chi tiết hồ sơ & lịch sử thực tập"
                          aria-label={`Xem chi tiết ${intern.fullName}`}
                        >
                          <Eye size={15} aria-hidden="true" />
                        </button>

                        {/* Quản lý hợp đồng */}
                        <button
                          type="button"
                          className={styles.actionIconBtn}
                          onClick={() => onUploadContract(intern)}
                          title="Hợp đồng thực tập"
                          aria-label={`Hợp đồng của ${intern.fullName}`}
                        >
                          <FileText size={15} aria-hidden="true" />
                        </button>

                        {/* Sửa thông tin */}
                        <button
                          type="button"
                          className={styles.actionIconBtn}
                          onClick={() => onEditIntern(intern)}
                          title="Chỉnh sửa thông tin hồ sơ"
                          aria-label={`Chỉnh sửa ${intern.fullName}`}
                        >
                          <Edit3 size={15} aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
