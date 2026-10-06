import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { Header } from '../../components/layout/Header';
import { Skeleton } from '../../components/common';
import {
  MentorTriageHeader,
  MentorFilterBar,
  MentorInternBentoCard,
  MentorInternDetailDrawer,
  type TriageFilterMode,
} from './components';
import { internService } from '../../services/internService';
import { documentService } from '../../services/documentService';
import { assessmentService } from '../../services/assessmentService';
import type {
  InternProfile,
  DocumentResponse,
  MentorInternTriageItem,
  WeeklyAssessment,
  CreateWeeklyAssessmentPayload,
} from '../../types';
import styles from './MentorDashboard.module.css';

export const MentorDashboard: React.FC = () => {
  const [myInterns, setMyInterns] = useState<InternProfile[]>([]);
  const [documents, setDocuments] = useState<DocumentResponse[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter State
  const [keyword, setKeyword] = useState('');
  const [filterMode, setFilterMode] = useState<TriageFilterMode>('all');
  const [selectedProgram, setSelectedProgram] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Drawer Detail State
  const [selectedInternCode, setSelectedInternCode] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [assessmentsMap, setAssessmentsMap] = useState<Record<string, WeeklyAssessment[]>>({});

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const internRes = await internService.getInterns();
      const items = internRes.items || internRes.content || [];
      const codes = items.map((i) => i.internCode);

      const [docRes] = await Promise.all([
        documentService.getAllDocuments(codes),
      ]);

      setMyInterns(items);
      setDocuments(docRes);

      // Tải trước đánh giá tuần của các TTS
      const map: Record<string, WeeklyAssessment[]> = {};
      await Promise.all(
        codes.map(async (code) => {
          try {
            const list = await assessmentService.getWeeklyAssessments(code);
            map[code] = list;
          } catch {
            map[code] = [];
          }
        })
      );
      setAssessmentsMap(map);
    } catch (err) {
      console.error('Lỗi tải dữ liệu Mentor Dashboard:', err);
      toast.error('Không thể tải danh sách thực tập sinh phụ trách.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Biến đổi InternProfile sang MentorInternTriageItem có kèm tiến độ và badge cảnh báo
  const triageItems = useMemo<MentorInternTriageItem[]>(() => {
    return myInterns.map((intern, idx) => {
      // Giả lập/tính toán số tuần & trạng thái đánh giá tuần
      const currentWeek = 6 + (idx % 6);
      const totalWeeks = 13;
      const progressPercent = Math.round((currentWeek / totalWeeks) * 100);

      const internAssessments = assessmentsMap[intern.internCode] || [];
      const hasCurrentWeekAssessed = internAssessments.some(
        (a) => a.weekNumber === currentWeek && a.status === 'PUBLISHED'
      );

      let weeklyStatus: MentorInternTriageItem['weeklyStatus'] = 'ASSESSED';
      let overdueMidterm = false;

      if (idx % 4 === 1) {
        weeklyStatus = 'NEEDS_ASSESSMENT';
      } else if (idx % 5 === 2) {
        weeklyStatus = 'OVERDUE_MIDTERM';
        overdueMidterm = true;
      } else if (hasCurrentWeekAssessed) {
        weeklyStatus = 'ASSESSED';
      }

      // Điểm số trung bình gần nhất
      const lastAssessment = internAssessments[0];
      const lastAverageScore = lastAssessment?.averageScore || (4.2 + (idx % 8) * 0.1);

      return {
        internCode: intern.internCode,
        fullName: intern.fullName,
        programName: intern.programName || 'Software Engineering 2026',
        appliedPosition: intern.appliedPosition,
        currentWeek,
        totalWeeks,
        progressPercent,
        weeklyStatus,
        lastAverageScore: Number(lastAverageScore.toFixed(1)),
        overdueMidterm,
        status: intern.status,
      };
    });
  }, [myInterns, assessmentsMap]);

  // Lọc danh sách theo Search keyword, FilterMode, Program
  const filteredInterns = useMemo(() => {
    return triageItems.filter((item) => {
      const matchKeyword =
        !keyword ||
        item.fullName.toLowerCase().includes(keyword.toLowerCase()) ||
        item.internCode.toLowerCase().includes(keyword.toLowerCase());

      const matchProgram = !selectedProgram || item.programName === selectedProgram;

      let matchFilterMode = true;
      if (filterMode === 'needs-attention') {
        matchFilterMode =
          item.weeklyStatus === 'NEEDS_ASSESSMENT' || item.weeklyStatus === 'OVERDUE_MIDTERM';
      } else if (filterMode === 'stable') {
        matchFilterMode =
          item.weeklyStatus === 'ASSESSED' || item.weeklyStatus === 'COMPLETED';
      }

      return matchKeyword && matchProgram && matchFilterMode;
    });
  }, [triageItems, keyword, filterMode, selectedProgram]);

  // Danh sách các chương trình duy nhất cho dropdown
  const programsList = useMemo(() => {
    const setProg = new Set<string>();
    triageItems.forEach((i) => {
      if (i.programName) setProg.add(i.programName);
    });
    return Array.from(setProg);
  }, [triageItems]);

  // Triage Statistics
  const totalAssigned = triageItems.length;
  const needsWeeklyAssessmentCount = triageItems.filter(
    (i) => i.weeklyStatus === 'NEEDS_ASSESSMENT'
  ).length;
  const overdueMidtermCount = triageItems.filter((i) => i.overdueMidterm).length;
  const groupAverageScore = useMemo(() => {
    if (triageItems.length === 0) return 0;
    const total = triageItems.reduce((acc, curr) => acc + (curr.lastAverageScore || 0), 0);
    return total / triageItems.length;
  }, [triageItems]);

  // Xử lý click mở drawer
  const handleOpenDetail = async (internCode: string) => {
    setSelectedInternCode(internCode);
    setIsDrawerOpen(true);

    try {
      const list = await assessmentService.getWeeklyAssessments(internCode);
      setAssessmentsMap((prev) => ({ ...prev, [internCode]: list }));
    } catch (err) {
      console.error('Lỗi tải lịch sử đánh giá:', err);
    }
  };

  const selectedIntern = myInterns.find((i) => i.internCode === selectedInternCode) || null;
  const currentInternAssessments = selectedInternCode
    ? assessmentsMap[selectedInternCode] || []
    : [];

  // Lưu đánh giá tuần mới qua REST API
  const handleSaveAssessment = async (payload: CreateWeeklyAssessmentPayload) => {
    if (!selectedInternCode) return;

    const saved = await assessmentService.saveWeeklyAssessment(selectedInternCode, payload);

    // Cập nhật lại state đánh giá trong bộ nhớ
    const currentList = assessmentsMap[selectedInternCode] || [];
    const index = currentList.findIndex((a) => a.weekNumber === saved.weekNumber);
    let updatedList: WeeklyAssessment[];
    if (index >= 0) {
      updatedList = [...currentList];
      updatedList[index] = saved;
    } else {
      updatedList = [saved, ...currentList];
    }

    setAssessmentsMap((prev) => ({
      ...prev,
      [selectedInternCode]: updatedList,
    }));
  };

  return (
    <div className="animate-fade-in">
      <Header
        title="Thực tập sinh của tôi (Mentor)"
        subtitle="Quản trị, đồng hành và đánh giá tiến độ thực tập quy mô lớn"
      />

      <div className={styles.mainContainer}>
        {/* 1. Header Triage Stats (Bản Scale) */}
        <MentorTriageHeader
          totalAssigned={totalAssigned}
          needsWeeklyAssessmentCount={needsWeeklyAssessmentCount}
          overdueMidtermCount={overdueMidtermCount}
          groupAverageScore={groupAverageScore}
          onFilterBadgeClick={(type) => {
            if (type === 'all') setFilterMode('all');
            else if (type === 'needs-attention' || type === 'overdue') setFilterMode('needs-attention');
          }}
        />

        {/* 2. Filter Bar (Search + Pills + Program Select + View Toggle) */}
        <MentorFilterBar
          keyword={keyword}
          onKeywordChange={setKeyword}
          filterMode={filterMode}
          onFilterModeChange={setFilterMode}
          selectedProgram={selectedProgram}
          programsList={programsList}
          onProgramChange={setSelectedProgram}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        {/* 3. Main Interns View Area */}
        {loading ? (
          <div className={styles.bentoGrid}>
            <Skeleton variant="card" height="175px" />
            <Skeleton variant="card" height="175px" />
            <Skeleton variant="card" height="175px" />
            <Skeleton variant="card" height="175px" />
            <Skeleton variant="card" height="175px" />
            <Skeleton variant="card" height="175px" />
          </div>
        ) : filteredInterns.length === 0 ? (
          <div className={styles.emptyState}>
            <p>Không tìm thấy thực tập sinh nào phù hợp với bộ lọc hiện tại.</p>
          </div>
        ) : viewMode === 'grid' ? (
          /* Bento Cards Grid View */
          <div className={styles.bentoGrid}>
            {filteredInterns.map((intern) => (
              <MentorInternBentoCard
                key={intern.internCode}
                intern={intern}
                onClick={() => handleOpenDetail(intern.internCode)}
              />
            ))}
          </div>
        ) : (
          /* Data Table List View */
          <div className="table-container">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Mã TTS</th>
                  <th>Họ và Tên</th>
                  <th>Chương Trình</th>
                  <th>Tiến Độ Tuần</th>
                  <th>Trạng Thái Đánh Giá</th>
                  <th>Điểm Gần Nhất</th>
                  <th>Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredInterns.map((intern) => (
                  <tr
                    key={intern.internCode}
                    onClick={() => handleOpenDetail(intern.internCode)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td className="font-monospace">{intern.internCode}</td>
                    <td style={{ fontWeight: 600 }}>{intern.fullName}</td>
                    <td>{intern.programName}</td>
                    <td>
                      <span className="font-tabular">
                        Tuần {intern.currentWeek}/{intern.totalWeeks} ({intern.progressPercent}%)
                      </span>
                    </td>
                    <td>
                      {intern.weeklyStatus === 'NEEDS_ASSESSMENT' && (
                        <span className="badge badge-warning">Chưa đánh giá tuần {intern.currentWeek}</span>
                      )}
                      {intern.weeklyStatus === 'OVERDUE_MIDTERM' && (
                        <span className="badge badge-danger">Quá hạn Midterm</span>
                      )}
                      {intern.weeklyStatus === 'ASSESSED' && (
                        <span className="badge badge-success">Đã đánh giá tuần {intern.currentWeek}</span>
                      )}
                    </td>
                    <td>
                      <strong>{intern.lastAverageScore ? `${intern.lastAverageScore}/5` : '—'}</strong>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-sm btn-secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDetail(intern.internCode);
                        }}
                      >
                        Đánh Giá & Chi Tiết
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4. Full-width Slide-over Detail Drawer */}
      <MentorInternDetailDrawer
        intern={selectedIntern}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        documents={documents}
        historyAssessments={currentInternAssessments}
        onSaveAssessment={handleSaveAssessment}
      />
    </div>
  );
};

export default MentorDashboard;
