import React, { useState, useEffect, useMemo } from 'react';
import { ClipboardCheck, Users, Mail, UserX, ArrowUpRight, Calendar } from 'lucide-react';
import { SearchBar, Select, Button } from '../../../../../../components/common';
import { getAvatarUrl } from '../../../../../../utils/avatar';
import type { AssigneeResponse } from '../../../../../../types';
import { MentorWeeklyReportDrawer } from '../components/MentorWeeklyReportDrawer';
import type { MentorWeeklyReportsTabProps } from './MentorWeeklyReportsTab.types';
import styles from './MentorWeeklyReportsTab.module.css';

/**
 * Trích xuất số tuần từ tiêu đề bảng nhiệm vụ (ví dụ: "Tuần 1", "Week 2", "Kỳ 3").
 * Nếu không tìm thấy số trong tiêu đề, fallback về vị trí thứ tự trong danh sách (1-indexed).
 */
export const extractWeekNumber = (boardTitle: string, fallbackIndex: number): number => {
  const weekRegex = /(?:tuần|week)\s*(\d+)/i;
  const digitsRegex = /(\d+)/;
  const match = weekRegex.exec(boardTitle) ?? digitsRegex.exec(boardTitle);
  if (match?.[1]) {
    const num = Number.parseInt(match[1], 10);
    if (!Number.isNaN(num) && num > 0) return num;
  }
  return fallbackIndex + 1;
};

export const MentorWeeklyReportsTab: React.FC<MentorWeeklyReportsTabProps> = ({
  program,
  programInterns,
  groups,
  boards = [],
  activeBoardId = null,
  onSelectBoard,
  internWorkloadMap = {},
  className = '',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState<string>('ALL');
  const [selectedIntern, setSelectedIntern] = useState<AssigneeResponse | null>(null);

  // Quản lý tuần / bảng nhiệm vụ được chọn để kiểm tra báo cáo
  const [selectedBoardId, setSelectedBoardId] = useState<number | null>(() => {
    if (activeBoardId && boards.some((b) => b.id === activeBoardId)) {
      return activeBoardId;
    }
    return boards[0]?.id ?? null;
  });

  // Đồng bộ khi activeBoardId thay đổi từ bên ngoài (workspace tab)
  useEffect(() => {
    if (activeBoardId && boards.some((b) => b.id === activeBoardId)) {
      setSelectedBoardId(activeBoardId);
    } else if (selectedBoardId === null && boards.length > 0) {
      setSelectedBoardId(boards[0].id);
    }
  }, [activeBoardId, boards, selectedBoardId]);

  const selectedBoardIndex = useMemo(() => {
    if (!selectedBoardId) return 0;
    const idx = boards.findIndex((b) => b.id === selectedBoardId);
    return Math.max(idx, 0);
  }, [boards, selectedBoardId]);

  const selectedBoard = useMemo(() => {
    if (!selectedBoardId) return boards[0] ?? null;
    return boards.find((b) => b.id === selectedBoardId) ?? boards[0] ?? null;
  }, [boards, selectedBoardId]);

  // Số tuần tương ứng của bảng nhiệm vụ đang được chọn
  const currentWeekNumber = useMemo(() => {
    if (selectedBoard) {
      return extractWeekNumber(selectedBoard.title, selectedBoardIndex);
    }
    if (!program.startDate) return 1;
    const start = new Date(program.startDate);
    const now = new Date();
    const diffTime = now.getTime() - start.getTime();
    if (diffTime < 0) return 1;
    const diffWeeks = Math.floor(diffTime / (7 * 24 * 60 * 60 * 1000)) + 1;
    return Math.min(Math.max(diffWeeks, 1), 16);
  }, [selectedBoard, selectedBoardIndex, program.startDate]);

  const handleSelectBoard = (boardId: number) => {
    setSelectedBoardId(boardId);
    onSelectBoard?.(boardId);
  };

  // Options lọc nhóm dự án
  const groupFilterOptions = useMemo(() => {
    const list = [{ value: 'ALL', label: 'Tất cả nhóm dự án' }];
    groups.forEach((g) => {
      list.push({ value: String(g.id), label: `${g.name} (${g.memberCount} TTS)` });
    });
    return list;
  }, [groups]);

  // Lọc TTS theo từ khóa và theo nhóm
  const filteredInterns = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return programInterns.filter((intern) => {
      const matchesSearch =
        q === '' ||
        intern.fullName.toLowerCase().includes(q) ||
        intern.internCode.toLowerCase().includes(q) ||
        intern.email.toLowerCase().includes(q);

      let matchesGroup = true;
      if (selectedGroupId !== 'ALL') {
        const targetGroupId = Number(selectedGroupId);
        const group = groups.find((g) => g.id === targetGroupId);
        matchesGroup = Boolean(group?.members.some((m) => m.id === intern.id));
      }

      return matchesSearch && matchesGroup;
    });
  }, [programInterns, searchQuery, selectedGroupId, groups]);

  return (
    <div className={`${styles.container} ${className}`}>
      {/* Banner & Thống kê tiến độ đối soát */}
      <div className={styles.banner}>
        <div className={styles.bannerInfo}>
          <div className={styles.bannerIconWrapper}>
            <ClipboardCheck size={24} />
          </div>
          <div>
            <h3 className={styles.bannerTitle}>
              {selectedBoard
                ? `Kiểm Tra & Đánh Giá: ${selectedBoard.title}`
                : 'Kiểm Tra & Đánh Giá Báo Cáo Tuần'}
            </h3>
            <p className={styles.bannerSubtitle}>
              Đối soát kết quả công việc, link PR và phản hồi báo cáo định kỳ cho từng thực tập sinh trong kỳ
            </p>
          </div>
        </div>

        <div className={styles.statsRow}>
          <div className={styles.statBadge}>
            <span className={styles.statValue}>Tuần {currentWeekNumber}</span>
            <span className={styles.statLabel}>Bảng nhiệm vụ đang chọn</span>
          </div>
          <div className={styles.statBadge}>
            <span className={styles.statValue}>{programInterns.length}</span>
            <span className={styles.statLabel}>Tổng số thực tập sinh</span>
          </div>
          <div className={styles.statBadge}>
            <span className={styles.statValue}>{groups.length}</span>
            <span className={styles.statLabel}>Nhóm dự án</span>
          </div>
        </div>
      </div>

      {/* Thanh Pills Chọn Tuần (Đồng bộ với các bảng nhiệm vụ của Mentor) */}
      {boards.length > 0 && (
        <div className={styles.boardPillsContainer}>
          <div className={styles.pillsScrollList}>
            {boards.map((b, idx) => {
              const isSelected = b.id === (selectedBoard?.id ?? selectedBoardId);
              const weekNum = extractWeekNumber(b.title, idx);
              return (
                <div
                  key={b.id}
                  className={`${styles.boardPill} ${isSelected ? styles.boardPillActive : ''}`}
                >
                  <button
                    type="button"
                    className={styles.boardPillBtn}
                    onClick={() => handleSelectBoard(b.id)}
                    title={`Chuyển sang kiểm tra báo cáo ${b.title} (Tuần ${weekNum})`}
                  >
                    <Calendar size={13} />
                    <span>{b.title}</span>
                    <span className={styles.weekTag}>Tuần {weekNum}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Toolbar lọc và tìm kiếm */}
      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Tìm thực tập sinh theo tên, mã TTS, email..."
          />
        </div>

        <div className={styles.filterControls}>
          {groups.length > 0 && (
            <div className={styles.filterSelect}>
              <Select
                options={groupFilterOptions}
                value={selectedGroupId}
                onChange={(e) => setSelectedGroupId(e.target.value)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Danh sách thẻ TTS */}
      {filteredInterns.length === 0 ? (
        <div className={styles.emptyCard}>
          <div className={styles.emptyIconWrapper}>
            <UserX size={26} />
          </div>
          <h4 className={styles.emptyTitle}>Không Tìm Thấy Thực Tập Sinh Nào</h4>
          <p className={styles.emptyDescription}>
            {programInterns.length === 0
              ? 'Chương trình thực tập này hiện chưa có thực tập sinh nào được phân công.'
              : 'Hãy thử thay đổi từ khóa tìm kiếm hoặc đặt lại bộ lọc nhóm dự án.'}
          </p>
          {programInterns.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setSelectedGroupId('ALL');
              }}
            >
              Đặt lại bộ lọc
            </Button>
          )}
        </div>
      ) : (
        <div className={styles.grid}>
          {filteredInterns.map((intern) => {
            const avatarSrc =
              intern.avatarUrl ||
              getAvatarUrl({
                avatarUrl: intern.avatarUrl,
                id: intern.id,
                username: intern.fullName,
              });

            // Tìm nhóm dự án của TTS
            const internGroup = groups.find((g) =>
              g.members.some((m) => m.id === intern.id)
            );
            const workload = internWorkloadMap[intern.id] ?? 0;

            return (
              <div
                key={intern.id}
                className={styles.card}
              >
                <div>
                  <div className={styles.cardHeader}>
                    <div className={styles.cardAvatar}>
                      {avatarSrc ? (
                        <img
                          src={avatarSrc}
                          alt={intern.fullName}
                          className={styles.avatarImg}
                          onError={(e) => (e.currentTarget.style.display = 'none')}
                        />
                      ) : (
                        intern.fullName.charAt(0).toUpperCase()
                      )}
                    </div>

                    <div className={styles.cardInfo}>
                      <h4 className={styles.cardName}>{intern.fullName}</h4>
                      <span className={styles.cardCodeBadge}>{intern.internCode}</span>
                    </div>
                  </div>

                  <div className={styles.cardMeta}>
                    <div className={styles.cardMetaItem} title={intern.email}>
                      <Mail size={13} />
                      <span>{intern.email}</span>
                    </div>
                    {internGroup && (
                      <div className={styles.cardMetaItem}>
                        <span className={styles.groupTag}>
                          <Users size={12} />
                          {internGroup.name}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className={styles.cardFooter}>
                  <span className={styles.taskStats}>
                    Đang phụ trách: <strong>{workload}</strong> task
                  </span>

                  <button
                    type="button"
                    className={styles.reviewBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedIntern(intern);
                    }}
                    title={`Kiểm tra báo cáo Tuần ${currentWeekNumber} cho ${intern.fullName}`}
                  >
                    <span>Kiểm Tra (Tuần {currentWeekNumber})</span>
                    <ArrowUpRight size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Side Drawer Dual-Pane Đối Soát Báo Cáo Tuần */}
      <MentorWeeklyReportDrawer
        intern={selectedIntern}
        isOpen={Boolean(selectedIntern)}
        onClose={() => setSelectedIntern(null)}
        currentWeekNumber={currentWeekNumber}
      />
    </div>
  );
};

export default MentorWeeklyReportsTab;
