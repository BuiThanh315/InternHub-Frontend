import React, { useState } from 'react';
import {
  X,
  ShieldAlert,
  Wifi,
  Users,
  AlertTriangle,
  Radio,
  Clock,
  Search,
} from 'lucide-react';
import { useLiveProctoring } from '../../../../../hooks/useLiveProctoring';
import { CandidateLiveCard } from './CandidateLiveCard';
import { aiInterviewService } from '../../../../../services/aiInterviewService';
import type {
  CandidateLiveProctoringState,
  ProctoringAlertEvent,
} from '../../../../../types/proctoring.types';
import { toast } from 'sonner';
import { ConfirmModal } from '../../../../../components/common/Modal/ConfirmModal';

interface LiveProctoringModalProps {
  isOpen: boolean;
  onClose: () => void;
  scheduleId: number;
  scheduleTitle?: string;
}

export const LiveProctoringModal: React.FC<LiveProctoringModalProps> = ({
  isOpen,
  onClose,
  scheduleId,
  scheduleTitle = 'Ca Phỏng Vấn Trực Tuyến AI',
}) => {
  const { candidates, eventFeed, isConnected } = useLiveProctoring(isOpen ? scheduleId : null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<'ALL' | 'WARNING' | 'VIOLATED'>('ALL');
  const [disqualifyTarget, setDisqualifyTarget] = useState<{ sessionId: number; candidateName: string } | null>(null);
  const [isDisqualifying, setIsDisqualifying] = useState(false);

  const handleDisqualify = (sessionId: number, candidateName: string) => {
    setDisqualifyTarget({ sessionId, candidateName });
  };

  const handleConfirmDisqualify = async () => {
    if (!disqualifyTarget) return;

    try {
      setIsDisqualifying(true);
      await aiInterviewService.disqualifySession(
        disqualifyTarget.sessionId,
        'Giám thị phát hiện gian lận và chủ động đình chỉ thi.'
      );
      toast.success(`Đã đình chỉ thành công thí sinh ${disqualifyTarget.candidateName}.`);
      setDisqualifyTarget(null);
    } catch (err: any) {
      toast.error('Lỗi khi thực hiện đình chỉ thi: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsDisqualifying(false);
    }
  };

  if (!isOpen) return null;

  const filteredCandidates = candidates.filter((c: CandidateLiveProctoringState) => {
    const matchSearch =
      c.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.candidateEmail.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchSearch) return false;

    if (filterSeverity === 'WARNING') {
      return c.strikeCount > 0 && c.status !== 'DISQUALIFIED';
    }
    if (filterSeverity === 'VIOLATED') {
      return c.status === 'DISQUALIFIED' || c.strikeCount >= c.maxStrikes;
    }
    return true;
  });

  const totalInExam = candidates.length;
  const totalWarning = candidates.filter(
    (c: CandidateLiveProctoringState) => c.strikeCount > 0 && c.status !== 'DISQUALIFIED'
  ).length;
  const totalViolated = candidates.filter(
    (c: CandidateLiveProctoringState) => c.status === 'DISQUALIFIED' || c.strikeCount >= c.maxStrikes
  ).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-7xl h-[92vh] flex flex-col bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/20">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-wide">
                  PHÒNG GIÁM SÁT THI TRỰC TIẾP (LIVE PROCTORING)
                </h2>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                    isConnected
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                  }`}
                >
                  <Wifi className="w-3 h-3" />
                  {isConnected ? 'LIVE WEBSOCKET' : 'ĐANG KẾT NỐI...'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {scheduleTitle} • Mã ca thi: #{scheduleId}
              </p>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-3 bg-slate-900/80 px-4 py-2 rounded-xl border border-slate-800 text-xs">
              <div className="flex items-center gap-1.5 text-slate-300">
                <Users className="w-4 h-4 text-sky-400" />
                <span>Tổng thí sinh:</span>
                <span className="font-bold text-white">{totalInExam}</span>
              </div>
              <div className="w-px h-3.5 bg-slate-800" />
              <div className="flex items-center gap-1.5 text-amber-300">
                <AlertTriangle className="w-4 h-4" />
                <span>Cảnh báo:</span>
                <span className="font-bold">{totalWarning}</span>
              </div>
              <div className="w-px h-3.5 bg-slate-800" />
              <div className="flex items-center gap-1.5 text-rose-400">
                <ShieldAlert className="w-4 h-4" />
                <span>Đình chỉ:</span>
                <span className="font-bold">{totalViolated}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Controls & Filters */}
        <div className="px-6 py-3 bg-slate-900/30 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 max-w-md bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo tên hoặc email ứng viên..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFilterSeverity('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filterSeverity === 'ALL'
                  ? 'bg-sky-500 text-white'
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
              }`}
            >
              Tất cả ({candidates.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterSeverity('WARNING')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filterSeverity === 'WARNING'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
              }`}
            >
              Có Cảnh Báo ({totalWarning})
            </button>
            <button
              type="button"
              onClick={() => setFilterSeverity('VIOLATED')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filterSeverity === 'VIOLATED'
                  ? 'bg-rose-500 text-white font-bold'
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
              }`}
            >
              Đã Đình Chỉ ({totalViolated})
            </button>
          </div>
        </div>

        {/* Main Content Area: Candidate Grid (Left) + Live Telemetry Feed (Right) */}
        <div className="flex-1 flex overflow-hidden">
          {/* Candidate Grid */}
          <div className="flex-1 overflow-y-auto p-6">
            {filteredCandidates.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-500">
                <Users className="w-12 h-12 mb-2 stroke-1" />
                <p className="text-sm font-medium">Chưa có dữ liệu thí sinh nào trong ca thi này</p>
                <p className="text-xs text-slate-600 mt-1">
                  Khi ứng viên truy cập phòng thi và gửi telemetry, thẻ giám sát sẽ xuất hiện tại đây.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCandidates.map((c: CandidateLiveProctoringState) => (
                  <CandidateLiveCard
                    key={c.sessionId}
                    candidate={c}
                    onDisqualify={handleDisqualify}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Sidebar Live Feed */}
          <div className="w-80 border-l border-slate-800 bg-slate-900/40 flex flex-col">
            <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-sky-400" /> Dòng Sự Kiện Trực Tiếp
              </span>
              <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">
                {eventFeed.length}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {eventFeed.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-slate-600 p-4">
                  <Radio className="w-8 h-8 mb-2 stroke-1" />
                  <p className="text-xs">Chưa ghi nhận sự kiện vi phạm nào</p>
                </div>
              ) : (
                eventFeed.map((evt: ProctoringAlertEvent) => (
                  <div
                    key={evt.eventId}
                    className={`p-2.5 rounded-lg border text-xs ${
                      evt.severity === 'DISQUALIFIED'
                        ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                        : evt.severity === 'CRITICAL'
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                        : 'bg-slate-800/60 border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="font-semibold truncate">{evt.candidateName}</span>
                      <span className="text-[10px] text-slate-500">
                        {new Date(evt.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-[11px] leading-tight text-slate-400">
                      {evt.details || `Vi phạm: ${evt.eventType}`}
                    </p>
                    <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500">
                      <span>Vi phạm: {evt.strikeCount}/{evt.maxStrikes}</span>
                      <span className="uppercase font-mono">{evt.severity}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={disqualifyTarget !== null}
        title="Xác nhận đình chỉ thi"
        message={`Bạn có chắc chắn muốn ĐÌNH CHỈ THI và THU BÀI của thí sinh ${disqualifyTarget?.candidateName || ''}? Hành động này sẽ lập tức kết thúc buổi thi của thí sinh và không thể hoàn tác.`}
        confirmText="Đình chỉ thi"
        cancelText="Quay lại"
        variant="danger"
        isLoading={isDisqualifying}
        onConfirm={handleConfirmDisqualify}
        onClose={() => setDisqualifyTarget(null)}
      />
    </div>
  );
};
