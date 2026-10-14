import React, { useState, useMemo } from 'react';
import { Users, FolderKanban, Plus, CheckCircle, AlertTriangle } from 'lucide-react';
import { SearchBar, Select, Button, Pagination } from '../../../../../../components/common';
import { getAvatarUrl } from '../../../../../../utils/avatar';
import type { MentorInternsAndGroupsTabProps } from './MentorInternsAndGroupsTab.types';
import styles from './MentorInternsAndGroupsTab.module.css';

const PAGE_SIZE = 10;

export const MentorInternsAndGroupsTab: React.FC<MentorInternsAndGroupsTabProps> = ({
  programInterns,
  groups,
  internWorkloadMap,
  onOpenGroupModal,
  onAssignTaskToIntern,
  isLoading = false,
  className = '',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);

  // Map internId -> Tên nhóm
  const internGroupMap = useMemo(() => {
    const map = new Map<number, string>();
    groups.forEach((g) => {
      if (Array.isArray(g.members)) {
        g.members.forEach((m) => {
          map.set(m.id, g.name);
        });
      }
    });
    return map;
  }, [groups]);

  // Lọc TTS
  const filteredInterns = useMemo(() => {
    return programInterns.filter((intern) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        q === '' ||
        intern.fullName.toLowerCase().includes(q) ||
        intern.internCode.toLowerCase().includes(q) ||
        intern.email.toLowerCase().includes(q);

      let matchesGroup = true;
      if (selectedGroupId !== 'ALL') {
        const targetGroupId = Number(selectedGroupId);
        const group = groups.find((g) => g.id === targetGroupId);
        matchesGroup = Boolean(group && group.members.some((m) => m.id === intern.id));
      }

      return matchesSearch && matchesGroup;
    });
  }, [programInterns, searchQuery, selectedGroupId, groups]);

  // Phân trang 10 dòng/trang (Rule 31)
  const totalPages = Math.ceil(filteredInterns.length / PAGE_SIZE);
  const paginatedInterns = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredInterns.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredInterns, currentPage]);

  const groupOptions = [
    { value: 'ALL', label: 'Tất cả các nhóm' },
    ...groups.map((g) => ({
      value: String(g.id),
      label: `${g.name} (${g.members?.length || 0} bạn)`,
    })),
  ];

  // Render badge tải trọng
  const renderWorkloadBadge = (activeCount: number) => {
    if (activeCount >= 5) {
      return (
        <span className={`${styles.workloadBadge} ${styles.workloadOverload}`} title="Học viên đang nhận từ 5 công việc trở lên">
          <AlertTriangle size={12} />
          {activeCount} việc (Quá tải)
        </span>
      );
    }
    if (activeCount >= 3) {
      return (
        <span className={`${styles.workloadBadge} ${styles.workloadHeavy}`} title="Học viên đang nhận 3-4 công việc">
          {activeCount} việc (Đầy tải)
        </span>
      );
    }
    return (
      <span className={`${styles.workloadBadge} ${styles.workloadNormal}`} title="Học viên có khối lượng công việc lý tưởng">
        <CheckCircle size={12} />
        {activeCount} việc (Bình thường)
      </span>
    );
  };

  return (
    <div className={`${styles.container} ${className}`}>
      {/* Khối 1: Danh Sách Nhóm Dự Án */}
      <div className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <div className={styles.titleGroup}>
            <FolderKanban size={18} />
            <h3 className={styles.sectionTitle}>Các Nhóm Dự Án Chuyên Trách</h3>
            <span className={styles.countPill}>{groups.length} nhóm</span>
          </div>

          <Button variant="primary" size="sm" onClick={onOpenGroupModal} disabled={isLoading}>
            <Users size={14} /> Quản Lý & Chia Nhóm
          </Button>
        </div>

        {groups.length === 0 ? (
          <div className={styles.noGroupsAlert}>
            <p className={styles.noGroupsText}>
              Chương trình hiện có {programInterns.length} học viên nhưng chưa được chia nhóm. Bấm nút Quản Lý & Chia Nhóm để chia tổ đội làm việc.
            </p>
            <Button variant="outline" size="sm" onClick={onOpenGroupModal}>
              Tạo nhóm ngay
            </Button>
          </div>
        ) : (
          <div className={styles.groupsGrid}>
            {groups.map((group) => {
              const count = group.members?.length || 0;
              return (
                <div key={group.id} className={styles.groupCard}>
                  <div className={styles.groupCardHeader}>
                    <h4 className={styles.groupName}>{group.name}</h4>
                    <span className={styles.memberCountBadge}>{count} thành viên</span>
                  </div>

                  <div className={styles.memberListPreview}>
                    {count === 0 ? (
                      <span className={styles.emptyGroupText}>Chưa có thành viên nào</span>
                    ) : (
                      group.members.map((m) => (
                        <div key={m.id} className={styles.memberPreviewItem}>
                          <span>•</span>
                          <span>{m.fullName} ({m.internCode})</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Khối 2: Ma Trận Phân Bổ Tải Trọng Học Viên */}
      <div className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <div className={styles.titleGroup}>
            <Users size={18} />
            <h3 className={styles.sectionTitle}>Ma Trận Phân Bổ Tải Trọng Công Việc</h3>
            <span className={styles.countPill}>{filteredInterns.length} học viên</span>
          </div>
        </div>

        {/* Toolbar */}
        <div className={styles.tableToolbar}>
          <div className={styles.searchWrapper}>
            <SearchBar
              value={searchQuery}
              onChange={(val) => {
                setSearchQuery(val);
                setCurrentPage(1);
              }}
              placeholder="Tìm theo tên, mã học viên hoặc email..."
            />
          </div>

          {groups.length > 0 && (
            <div className={styles.filterWrapper}>
              <Select
                options={groupOptions}
                value={selectedGroupId}
                onChange={(e) => {
                  setSelectedGroupId(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          )}
        </div>

        {/* Bảng Dữ Liệu */}
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: '40px' }}>STT</th>
                <th>Thực Tập Sinh</th>
                <th>Email Liên Hệ</th>
                <th>Nhóm Dự Án</th>
                <th>Khối Lượng Đang Làm</th>
                <th style={{ width: '130px', textAlign: 'center' }}>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {paginatedInterns.length === 0 ? (
                <tr>
                  <td colSpan={6} className={styles.emptyTableRow}>
                    {programInterns.length === 0
                      ? 'Chương trình chưa có thực tập sinh nào'
                      : 'Không tìm thấy thực tập sinh phù hợp với bộ lọc'}
                  </td>
                </tr>
              ) : (
                paginatedInterns.map((intern, index) => {
                  const stt = (currentPage - 1) * PAGE_SIZE + index + 1;
                  const activeTasks = internWorkloadMap[intern.id] || 0;
                  const groupName = internGroupMap.get(intern.id) || 'Chưa vào nhóm';
                  const avatarSrc =
                    intern.avatarUrl ||
                    getAvatarUrl({
                      avatarUrl: intern.avatarUrl,
                      id: intern.id,
                      username: intern.fullName,
                    });

                  return (
                    <tr key={intern.id}>
                      <td>{stt}</td>
                      <td>
                        <div className={styles.internCell}>
                          {avatarSrc ? (
                            <img
                              src={avatarSrc}
                              alt={intern.fullName}
                              className={styles.avatar}
                              onError={(e) => (e.currentTarget.style.display = 'none')}
                            />
                          ) : (
                            <div className={styles.avatarFallback}>
                              {intern.fullName.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className={styles.internMeta}>
                            <span className={styles.internName}>{intern.fullName}</span>
                            <span className={styles.internCode}>{intern.internCode}</span>
                          </div>
                        </div>
                      </td>
                      <td>{intern.email}</td>
                      <td>
                        <span style={{ fontWeight: 500 }}>{groupName}</span>
                      </td>
                      <td>{renderWorkloadBadge(activeTasks)}</td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          className={styles.quickAssignBtn}
                          onClick={() => onAssignTaskToIntern(intern.id)}
                          title={`Giao công việc trực tiếp cho ${intern.fullName}`}
                        >
                          <Plus size={13} /> Giao task
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Phân trang tự động ẩn khi <= 10 dòng (Rule 31) */}
        {filteredInterns.length > PAGE_SIZE && totalPages > 1 && (
          <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'flex-end' }}>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MentorInternsAndGroupsTab;
