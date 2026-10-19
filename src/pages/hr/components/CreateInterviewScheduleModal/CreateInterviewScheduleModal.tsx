import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Sparkles,
  Clock,
  ShieldAlert,
  Users,
  Plus,
  Trash2,
  FileQuestion,
  HelpCircle,
  UserCheck,
  ClipboardList,
  CheckSquare,
  Square,
  Search,
  Sparkle,
  FileSpreadsheet,
} from 'lucide-react';
import { Modal, Button } from '../../../../components/common';
import { aiInterviewService } from '../../../../services/aiInterviewService';
import { internService } from '../../../../services/internService';
import type { InterviewQuestionSet } from '../../../../types/aiInterview.types';
import type { InternProfile } from '../../../../types';
import type {
  CreateInterviewSchedulePayload,
  InterviewMode,
  CandidateInviteItem,
} from '../../../../types/aiInterviewRoom.types';
import styles from './CreateInterviewScheduleModal.module.css';

interface CreateInterviewScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (scheduleId: number) => void;
  programId?: number;
  initialCandidates?: CandidateInviteItem[];
  editingScheduleId?: number | null;
}

export const CreateInterviewScheduleModal: React.FC<CreateInterviewScheduleModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  programId,
  initialCandidates = [],
  editingScheduleId = null,
}) => {
  const [title, setTitle] = useState('');
  const [questionSets, setQuestionSets] = useState<InterviewQuestionSet[]>([]);
  const [selectedSetId, setSelectedSetId] = useState<number | ''>('');
  const [interviewMode, setInterviewMode] = useState<InterviewMode>('PER_QUESTION');
  const [durationPerQuestionSec, setDurationPerQuestionSec] = useState(180);
  const [totalDurationMinutes, setTotalDurationMinutes] = useState(30);
  const [allowRevisitQuestions, setAllowRevisitQuestions] = useState(false);
  const [maxBlurStrikes, setMaxBlurStrikes] = useState(3);
  const [autoSubmitOnExceed, setAutoSubmitOnExceed] = useState(true);
  const [expireHours, setExpireHours] = useState(48);

  // Danh sách ứng viên mời
  const [candidates, setCandidates] = useState<CandidateInviteItem[]>(initialCandidates);
  const [candidateInputMode, setCandidateInputMode] = useState<'PROGRAM_APPLICANTS' | 'MANUAL' | 'BULK'>(
    programId ? 'PROGRAM_APPLICANTS' : 'MANUAL'
  );

  // Tab 1: Nạp từ danh sách đơn của kỳ
  const [programApplicants, setProgramApplicants] = useState<InternProfile[]>([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);
  const [selectedApplicantIds, setSelectedApplicantIds] = useState<Set<number>>(new Set());
  const [applicantSearch, setApplicantSearch] = useState('');

  // Tab 2: Thêm thủ công từng người
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');

  // Tab 3: Nhập hàng loạt nhiều email
  const [bulkText, setBulkText] = useState('');

  const [loadingSets, setLoadingSets] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadQuestionSets();
      if (programId) {
        loadProgramApplicants();
      }
      if (initialCandidates.length > 0) {
        setCandidates(initialCandidates);
      }
      if (editingScheduleId) {
        loadScheduleDetail(editingScheduleId);
      } else if (!title) {
        setTitle(`Lịch Phỏng Vấn AI - ${new Date().toLocaleDateString('vi-VN')}`);
      }
    }
  }, [isOpen, programId, editingScheduleId]);

  const loadScheduleDetail = async (scheduleId: number) => {
    try {
      const detail = await aiInterviewService.getScheduleDetail(scheduleId);
      if (detail) {
        setTitle(detail.title || '');
        setSelectedSetId(detail.questionSetId || '');
        setInterviewMode(detail.interviewMode || 'PER_QUESTION');
        if (detail.durationPerQuestionSec) setDurationPerQuestionSec(detail.durationPerQuestionSec);
        if (detail.totalDurationMinutes) setTotalDurationMinutes(detail.totalDurationMinutes);
        setAllowRevisitQuestions(Boolean(detail.allowRevisitQuestions));
        if (detail.maxBlurStrikes) setMaxBlurStrikes(detail.maxBlurStrikes);
        setAutoSubmitOnExceed(detail.autoSubmitOnExceed !== false);
      }
    } catch (err) {
      console.error('Không thể nạp thông tin đợt phỏng vấn để sửa:', err);
    }
  };

  const loadQuestionSets = async () => {
    setLoadingSets(true);
    try {
      const sets = await aiInterviewService.getQuestionSets({ programId });
      setQuestionSets(sets);
      if (sets.length > 0 && !selectedSetId) {
        setSelectedSetId(sets[0].id);
      }
    } catch (err) {
      console.error('Không thể nạp danh sách bộ câu hỏi:', err);
    } finally {
      setLoadingSets(false);
    }
  };

  const loadProgramApplicants = async () => {
    if (!programId) return;
    setLoadingApplicants(true);
    try {
      const res = await internService.getInterns({ programId, size: 100 });
      setProgramApplicants(res.items || []);
    } catch (err) {
      console.error('Không thể nạp danh sách ứng viên của kỳ:', err);
    } finally {
      setLoadingApplicants(false);
    }
  };

  const handleToggleApplicant = (applicant: InternProfile) => {
    setSelectedApplicantIds((prev) => {
      const next = new Set(prev);
      if (next.has(applicant.id)) {
        next.delete(applicant.id);
        setCandidates((curr) => curr.filter((c) => c.email !== applicant.email));
      } else {
        next.add(applicant.id);
        if (applicant.email && !candidates.some((c) => c.email === applicant.email)) {
          setCandidates((curr) => [
            ...curr,
            { candidateId: applicant.id, email: applicant.email, fullName: applicant.fullName || 'Ứng viên' },
          ]);
        }
      }
      return next;
    });
  };

  const handleSelectAllApplicants = () => {
    const validApplicants = filteredApplicants.filter((a) => a.email);
    const allSelected = validApplicants.every((a) => selectedApplicantIds.has(a.id));

    if (allSelected) {
      // Bỏ chọn tất cả
      setSelectedApplicantIds(new Set());
      setCandidates([]);
    } else {
      // Chọn tất cả
      const newIds = new Set(validApplicants.map((a) => a.id));
      setSelectedApplicantIds(newIds);
      const newCands = validApplicants.map((a) => ({
        candidateId: a.id,
        email: a.email,
        fullName: a.fullName || 'Ứng viên',
      }));
      setCandidates(newCands);
    }
  };

  const handleAddCandidate = () => {
    if (!newEmail.trim()) return;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      setErrorMessage('Định dạng email ứng viên không hợp lệ');
      return;
    }
    if (candidates.some((c) => c.email.toLowerCase() === newEmail.trim().toLowerCase())) {
      setErrorMessage('Ứng viên với email này đã có trong danh sách');
      return;
    }
    setCandidates((prev) => [
      ...prev,
      { email: newEmail.trim(), fullName: newName.trim() || 'Ứng viên' },
    ]);
    setNewEmail('');
    setNewName('');
    setErrorMessage(null);
  };

  const parseCandidateText = (rawText: string): CandidateInviteItem[] => {
    const lines = rawText.split(/\r?\n/);
    const addedList: CandidateInviteItem[] = [];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) continue;

      // 1. Trường hợp copy từ Excel: có chứa ký tự Tab (\t) hoặc dấu phẩy/chấm phẩy dạng CSV
      // Ví dụ: "Nguyễn Văn A\tnguyenvana@gmail.com" hoặc "nguyenvana@gmail.com\tNguyễn Văn A"
      if (line.includes('\t') || (line.includes(',') && !line.includes('<'))) {
        const parts = line.includes('\t') ? line.split('\t') : line.split(',');
        let email = '';
        let fullName = '';

        for (const part of parts) {
          const cleanPart = part.trim().replace(/^["']|["']$/g, '');
          if (emailRegex.test(cleanPart)) {
            email = cleanPart;
          } else if (cleanPart && !fullName && isNaN(Number(cleanPart))) {
            fullName = cleanPart;
          }
        }

        if (email) {
          if (!fullName) fullName = email.split('@')[0];
          if (
            !candidates.some((c) => c.email.toLowerCase() === email.toLowerCase()) &&
            !addedList.some((c) => c.email.toLowerCase() === email.toLowerCase())
          ) {
            addedList.push({ email, fullName });
            continue;
          }
        }
      }

      // 2. Trường hợp định dạng tiêu chuẩn: "Nguyen Van A <a@gmail.com>" hoặc "a@gmail.com"
      const match = line.match(/(?:(.*)<)?([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})>?/);
      if (match && match[2] && emailRegex.test(match[2].trim())) {
        const email = match[2].trim();
        const fullName = (match[1] || '').trim() || email.split('@')[0];
        if (
          !candidates.some((c) => c.email.toLowerCase() === email.toLowerCase()) &&
          !addedList.some((c) => c.email.toLowerCase() === email.toLowerCase())
        ) {
          addedList.push({ email, fullName });
        }
      }
    }

    return addedList;
  };

  const handleProcessBulk = () => {
    if (!bulkText.trim()) return;
    const addedList = parseCandidateText(bulkText);

    if (addedList.length === 0) {
      setErrorMessage('Không tìm thấy địa chỉ email hợp lệ nào trong đoạn văn bản');
      return;
    }

    setCandidates((prev) => [...prev, ...addedList]);
    setBulkText('');
    setErrorMessage(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) return;
      const parsed = parseCandidateText(content);
      if (parsed.length === 0) {
        setErrorMessage('Không tìm thấy email hợp lệ trong tệp tin vừa tải lên');
      } else {
        setCandidates((prev) => {
          const combined = [...prev];
          for (const item of parsed) {
            if (!combined.some((c) => c.email.toLowerCase() === item.email.toLowerCase())) {
              combined.push(item);
            }
          }
          return combined;
        });
        setErrorMessage(null);
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset file input
  };

  const handleRemoveCandidate = (index: number) => {
    setCandidates((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSetId) {
      setErrorMessage('Vui lòng chọn bộ câu hỏi phỏng vấn chuẩn bị sẵn');
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    const payload: CreateInterviewSchedulePayload = {
      title,
      questionSetId: Number(selectedSetId),
      programId,
      interviewMode,
      durationPerQuestionSec: interviewMode === 'PER_QUESTION' ? durationPerQuestionSec : undefined,
      totalDurationMinutes: interviewMode === 'OVERALL_ASSESSMENT' ? totalDurationMinutes : undefined,
      allowRevisitQuestions,
      maxBlurStrikes,
      autoSubmitOnExceed,
      expireHours,
      candidateList: candidates,
    };

    try {
      if (editingScheduleId) {
        const updated = await aiInterviewService.updateSchedule(editingScheduleId, payload);
        onSuccess(updated.scheduleId);
      } else {
        const res = await aiInterviewService.createSchedule(payload);
        onSuccess(res.scheduleId);
      }
      onClose();
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Có lỗi xảy ra khi lưu thông tin lịch phỏng vấn');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredApplicants = programApplicants.filter(
    (a) =>
      a.fullName?.toLowerCase().includes(applicantSearch.toLowerCase()) ||
      a.email?.toLowerCase().includes(applicantSearch.toLowerCase()) ||
      a.university?.toLowerCase().includes(applicantSearch.toLowerCase())
  );

  const modalTitle = (
    <div className={styles.modalHeaderTitle}>
      <div className={styles.headerIconBadge}>
        <Calendar size={18} className="text-indigo-600" />
      </div>
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-900 text-base">
            {editingScheduleId ? 'Chỉnh Sửa Lịch Phỏng Vấn AI' : 'Tạo Lịch Phỏng Vấn AI'}
          </span>
          <span className={styles.tagAiSmart}>
            <Sparkles size={11} className="text-indigo-600" /> AI Interview Room
          </span>
        </div>
        <p className="text-xs text-slate-500 font-normal mt-0.5">
          {editingScheduleId
            ? 'Cập nhật cấu hình lịch thi và tự động đồng bộ sang tất cả ứng viên'
            : 'Khởi tạo phiên phỏng vấn thông minh, phân quyền link bảo mật và giám sát rủi ro gian lận'}
        </p>
      </div>
    </div>
  );

  const modalFooter = (
    <div className={styles.modalFooterContent}>
      <div className="text-xs text-slate-500 font-medium">
        Tổng số ứng viên sẽ nhận thư mời:{' '}
        <strong className="text-indigo-600 font-bold text-sm bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
          {candidates.length} ứng viên
        </strong>
      </div>
      <div className="flex items-center gap-2.5">
        <Button variant="secondary" size="md" type="button" onClick={onClose} disabled={submitting}>
          Hủy bỏ
        </Button>
        <Button
          variant="primary"
          size="md"
          type="button"
          onClick={(e) => void handleSubmit(e as any)}
          disabled={submitting}
        >
          {submitting
            ? 'Đang lưu...'
            : editingScheduleId
            ? 'Lưu Thay Đổi Đợt Thi'
            : 'Tạo & Gửi Lời Mời AI'}
        </Button>
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={modalTitle}
      footer={modalFooter}
      size="lg"
    >
      <form onSubmit={handleSubmit} className={styles.formContainer}>
        {errorMessage && (
          <div className={styles.errorAlert} role="alert">
            <ShieldAlert size={16} className="text-red-500 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Section 1: Thông tin cơ bản */}
        <div className={styles.formSection}>
          <div className={styles.sectionHeader}>
            <FileQuestion size={15} className="text-indigo-600" />
            <span>Thông tin đợt & Bộ câu hỏi</span>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>
              Tiêu đề đợt phỏng vấn <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className={styles.input}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ví dụ: Phỏng vấn Kỹ thuật Java Core - Kỳ tuyển sinh Mùa Thu"
              required
            />
          </div>

          <div className={styles.gridTwo}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>
                Bộ câu hỏi chuẩn bị <span className="text-red-500">*</span>
                {loadingSets && <span className="text-xs text-indigo-600 font-normal">Đang nạp...</span>}
              </label>
              <select
                className={styles.select}
                value={selectedSetId}
                onChange={(e) => setSelectedSetId(Number(e.target.value))}
                required
              >
                {questionSets.length === 0 && <option value="">(Chưa có bộ câu hỏi - hãy sinh từ JD)</option>}
                {questionSets.map((qs) => (
                  <option key={qs.id} value={qs.id}>
                    {qs.title} ({qs.totalQuestions} câu hỏi)
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Chế độ phòng thi (Timer Mode)</label>
              <select
                className={styles.select}
                value={interviewMode}
                onChange={(e) => setInterviewMode(e.target.value as InterviewMode)}
              >
                <option value="PER_QUESTION">Phỏng vấn AI (Đếm giờ từng câu - Tiêu chuẩn)</option>
                <option value="OVERALL_ASSESSMENT">Đánh giá chung (Tính tổng thời gian)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Thời lượng & Kiểm soát gian lận */}
        <div className={styles.formSection}>
          <div className={styles.sectionHeader}>
            <Clock size={15} className="text-indigo-600" />
            <span>Thời lượng & Quy chế phòng thi</span>
          </div>

          <div className={styles.gridTwo}>
            {interviewMode === 'PER_QUESTION' ? (
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Thời gian trả lời mỗi câu</label>
                <div className={styles.inputGroup}>
                  <input
                    type="number"
                    className={styles.inputGroupField}
                    min={30}
                    max={900}
                    step={15}
                    value={durationPerQuestionSec}
                    onChange={(e) => setDurationPerQuestionSec(Number(e.target.value))}
                  />
                  <span className={styles.inputGroupAddon}>giây / câu</span>
                </div>
              </div>
            ) : (
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Tổng thời lượng làm bài</label>
                <div className={styles.inputGroup}>
                  <input
                    type="number"
                    className={styles.inputGroupField}
                    min={5}
                    max={180}
                    value={totalDurationMinutes}
                    onChange={(e) => setTotalDurationMinutes(Number(e.target.value))}
                  />
                  <span className={styles.inputGroupAddon}>phút</span>
                </div>
              </div>
            )}

            <div className={styles.fieldGroup}>
              <label className={styles.label}>
                Ngưỡng cảnh báo rời tab tối đa
                <span className="text-slate-400 font-normal" title="Số lần ứng viên chuyển sang tab hoặc cửa sổ khác">
                  <HelpCircle size={13} className="inline ml-1" />
                </span>
              </label>
              <div className={styles.inputGroup}>
                <input
                  type="number"
                  className={styles.inputGroupField}
                  min={1}
                  max={10}
                  value={maxBlurStrikes}
                  onChange={(e) => setMaxBlurStrikes(Number(e.target.value))}
                />
                <span className={styles.inputGroupAddon}>lần vi phạm</span>
              </div>
            </div>
          </div>

          <div className={styles.gridTwo}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Thời hạn truy cập link</label>
              <div className={styles.inputGroup}>
                <input
                  type="number"
                  className={styles.inputGroupField}
                  min={1}
                  max={168}
                  value={expireHours}
                  onChange={(e) => setExpireHours(Number(e.target.value))}
                />
                <span className={styles.inputGroupAddon}>giờ</span>
              </div>
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Điều hướng câu hỏi</label>
              <select
                className={styles.select}
                value={allowRevisitQuestions ? 'true' : 'false'}
                onChange={(e) => setAllowRevisitQuestions(e.target.value === 'true')}
              >
                <option value="false">Khóa câu cũ khi chuyển tiếp (Khuyến nghị)</option>
                <option value="true">Cho phép quay lại chỉnh sửa câu trước</option>
              </select>
            </div>
          </div>

          {/* Toggle Vi phạm */}
          <div className={styles.toggleCard}>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-800">
                Tự động thu bài & khóa buồng thi khi vượt ngưỡng vi phạm
              </span>
              <span className="text-[11px] text-slate-500 mt-0.5">
                Nếu ứng viên rời màn hình hoặc chuyển tab quá {maxBlurStrikes} lần, hệ thống lập tức nộp bài và ghi nhận vào biên bản gian lận.
              </span>
            </div>
            <label className={styles.switch}>
              <input
                type="checkbox"
                checked={autoSubmitOnExceed}
                onChange={(e) => setAutoSubmitOnExceed(e.target.checked)}
              />
              <span className={styles.slider}></span>
            </label>
          </div>
        </div>

        {/* Section 3: Danh sách ứng viên nâng cao (UX Pro) */}
        <div className={styles.formSection}>
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800 uppercase tracking-wide">
              <Users size={15} className="text-indigo-600" />
              <span>Danh sách Ứng viên nhận link ({candidates.length})</span>
            </div>

            {/* Chế độ chọn ứng viên */}
            <div className={styles.modeTabs}>
              {programId && (
                <button
                  type="button"
                  className={`${styles.modeTabBtn} ${candidateInputMode === 'PROGRAM_APPLICANTS' ? styles.modeTabBtnActive : ''}`}
                  onClick={() => setCandidateInputMode('PROGRAM_APPLICANTS')}
                >
                  <UserCheck size={13} /> Chọn từ Đợt nộp ({programApplicants.length})
                </button>
              )}
              <button
                type="button"
                className={`${styles.modeTabBtn} ${candidateInputMode === 'MANUAL' ? styles.modeTabBtnActive : ''}`}
                onClick={() => setCandidateInputMode('MANUAL')}
              >
                <Plus size={13} /> Thêm từng người
              </button>
              <button
                type="button"
                className={`${styles.modeTabBtn} ${candidateInputMode === 'BULK' ? styles.modeTabBtnActive : ''}`}
                onClick={() => setCandidateInputMode('BULK')}
              >
                <ClipboardList size={13} /> Dán hàng loạt
              </button>
            </div>
          </div>

          {/* View 1: Chọn trực tiếp từ danh sách đơn của đợt thực tập */}
          {candidateInputMode === 'PROGRAM_APPLICANTS' && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                <div className="relative flex-1">
                  <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Tìm theo tên, email hoặc trường đại học..."
                    className={styles.input}
                    style={{ paddingLeft: '2rem' }}
                    value={applicantSearch}
                    onChange={(e) => setApplicantSearch(e.target.value)}
                  />
                </div>
                <button
                  type="button"
                  className={styles.btnSecondarySmall}
                  onClick={handleSelectAllApplicants}
                >
                  {filteredApplicants.every((a) => selectedApplicantIds.has(a.id)) && filteredApplicants.length > 0 ? (
                    <>
                      <Square size={13} /> Bỏ chọn tất cả
                    </>
                  ) : (
                    <>
                      <CheckSquare size={13} /> Chọn tất cả ({filteredApplicants.length})
                    </>
                  )}
                </button>
              </div>

              {loadingApplicants ? (
                <div className="text-center py-6 text-xs text-slate-400">Đang tải danh sách hồ sơ...</div>
              ) : filteredApplicants.length > 0 ? (
                <div className={styles.applicantPickList}>
                  {filteredApplicants.map((app) => {
                    const isSelected = selectedApplicantIds.has(app.id) || candidates.some((c) => c.email === app.email);
                    return (
                      <div
                        key={app.id}
                        className={`${styles.applicantCard} ${isSelected ? styles.applicantCardSelected : ''}`}
                        onClick={() => handleToggleApplicant(app)}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}} // Handle by parent div
                            className="cursor-pointer accent-indigo-600 rounded"
                          />
                          <div className="flex flex-col">
                            <span className="text-xs font-semibold text-slate-800">{app.fullName}</span>
                            <span className="text-[11px] text-slate-500 font-mono">{app.email || 'Chưa có email'}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 block">{app.university || 'Đại học'}</span>
                          <span className="text-[10px] font-semibold text-emerald-600">GPA {app.gpa ? app.gpa.toFixed(2) : '--'}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-5 text-xs text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                  Không tìm thấy hồ sơ nào phù hợp.
                </div>
              )}
            </div>
          )}

          {/* View 2: Thêm thủ công từng người */}
          {candidateInputMode === 'MANUAL' && (
            <div className={styles.addCandidateRow}>
              <input
                type="text"
                placeholder="Họ và tên ứng viên"
                className={styles.input}
                style={{ flex: 1 }}
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCandidate())}
              />
              <input
                type="email"
                placeholder="Email nhận link phỏng vấn *"
                className={styles.input}
                style={{ flex: 1.5 }}
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCandidate())}
              />
              <button
                type="button"
                className={styles.btnAddCandidate}
                onClick={handleAddCandidate}
              >
                <Plus size={14} /> Thêm
              </button>
            </div>
          )}

          {/* View 3: Nhập dán danh sách hàng loạt & Tải file Excel/CSV */}
          {candidateInputMode === 'BULK' && (
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span className="text-[11px] text-slate-500 font-medium">
                  Hỗ trợ copy trực tiếp các cột từ Excel (Tên, Email) hoặc dán danh sách email:
                </span>
                <label className={styles.btnUploadFile}>
                  <FileSpreadsheet size={13} className="text-emerald-600" />
                  <span>Tải tệp Excel / CSV (.csv, .txt)</span>
                  <input
                    type="file"
                    accept=".csv,.txt,.tsv"
                    style={{ display: 'none' }}
                    onChange={handleFileUpload}
                  />
                </label>
              </div>

              <textarea
                className={styles.bulkTextarea}
                rows={4}
                placeholder={`Mẹo: Copy trực tiếp 2 cột [Họ Tên] và [Email] trong file Excel rồi nhấn Ctrl+V vào đây.\n\nHoặc dán danh sách bất kỳ:\nNguyễn Văn A\tnguyenvana@gmail.com\ntranthib@gmail.com\nLê Hoàng Nam <namle@gmail.com>`}
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
              />
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400 italic">
                  * Tự động lọc trùng lặp và loại bỏ các dòng không hợp lệ
                </span>
                <button
                  type="button"
                  className={styles.btnAddCandidate}
                  onClick={handleProcessBulk}
                >
                  <Sparkle size={13} /> Trích xuất & Thêm vào danh sách
                </button>
              </div>
            </div>
          )}

          {/* Bảng tổng hợp ứng viên đã chọn */}
          <div className="mt-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Ứng viên đã được đưa vào danh sách gửi link ({candidates.length})
              </span>
              {candidates.length > 0 && (
                <button
                  type="button"
                  className="text-[11px] text-red-500 hover:text-red-700 font-medium bg-transparent border-0 cursor-pointer"
                  onClick={() => {
                    setCandidates([]);
                    setSelectedApplicantIds(new Set());
                  }}
                >
                  Xóa tất cả
                </button>
              )}
            </div>

            {candidates.length > 0 ? (
              <div className={styles.tableWrapper}>
                <table className={styles.candidateTable}>
                  <thead>
                    <tr>
                      <th style={{ width: '40px' }}>STT</th>
                      <th>Họ và tên</th>
                      <th>Email nhận lời mời</th>
                      <th style={{ width: '45px', textAlign: 'center' }}>Xóa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {candidates.map((cand, idx) => (
                      <tr key={idx}>
                        <td className="text-slate-400 font-tabular">{idx + 1}</td>
                        <td className="font-semibold text-slate-800">{cand.fullName}</td>
                        <td className="text-indigo-600 font-mono text-xs">{cand.email}</td>
                        <td style={{ textAlign: 'center' }}>
                          <button
                            type="button"
                            className={styles.btnDeleteRow}
                            onClick={() => handleRemoveCandidate(idx)}
                            title="Xóa khỏi danh sách"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className={styles.emptyCandidateNote}>
                Chưa có ứng viên nào được chọn. Hãy tick chọn ứng viên từ danh sách trên hoặc dán danh sách email để tự động gửi link buồng thi AI.
              </div>
            )}
          </div>
        </div>
      </form>
    </Modal>
  );
};
