import React from 'react';
import { Video, Mic, Wifi, AlertTriangle, ShieldAlert, CheckCircle2, UserX } from 'lucide-react';
import type { CandidateLiveProctoringState } from '../../../../../types/proctoring.types';

interface CandidateLiveCardProps {
  candidate: CandidateLiveProctoringState;
  onDisqualify: (sessionId: number, candidateName: string) => void;
}

export const CandidateLiveCard: React.FC<CandidateLiveCardProps> = ({ candidate, onDisqualify }) => {
  const isViolated = candidate.status === 'DISQUALIFIED' || candidate.strikeCount >= candidate.maxStrikes;
  const isWarning = candidate.strikeCount > 0 && !isViolated;

  let borderColor = 'border-emerald-500/30 shadow-emerald-500/10';
  let badgeBg = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
  let statusText = 'Ổn định & Trung thực';

  if (isViolated) {
    borderColor = 'border-rose-500/60 shadow-rose-500/20 animate-pulse';
    badgeBg = 'bg-rose-500/20 text-rose-400 border-rose-500/40';
    statusText = 'ĐÃ ĐÌNH CHỈ / VI PHẠM';
  } else if (isWarning) {
    borderColor = 'border-amber-500/50 shadow-amber-500/20';
    badgeBg = 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    statusText = `Cảnh báo: ${candidate.strikeCount}/${candidate.maxStrikes} vi phạm`;
  }

  return (
    <div
      className={`relative flex flex-col justify-between p-4 rounded-xl border bg-slate-900/90 backdrop-blur-md shadow-lg transition-all duration-300 ${borderColor}`}
    >
      {/* Top Header Card */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-100 truncate text-sm">
              {candidate.candidateName}
            </span>
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${badgeBg}`}
            >
              {isViolated ? (
                <ShieldAlert className="w-3 h-3" />
              ) : isWarning ? (
                <AlertTriangle className="w-3 h-3" />
              ) : (
                <CheckCircle2 className="w-3 h-3" />
              )}
              {statusText}
            </span>
          </div>
          <p className="text-xs text-slate-400 truncate mt-0.5">{candidate.candidateEmail}</p>
        </div>
      </div>

      {/* Video Simulated Box */}
      <div className="relative aspect-video w-full rounded-lg bg-slate-950 flex flex-col items-center justify-center overflow-hidden border border-slate-800">
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />

        {isViolated ? (
          <div className="flex flex-col items-center text-center p-3 text-rose-400 z-10">
            <UserX className="w-10 h-10 mb-1" />
            <span className="text-xs font-semibold">Thí sinh đã bị khóa quyền thi</span>
          </div>
        ) : (
          <div className="flex flex-col items-center text-slate-400 z-10">
            <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-200 font-bold mb-1 border border-slate-700">
              {candidate.candidateName.charAt(0)}
            </div>
            <span className="text-[11px] text-slate-400">Luồng Telemetry Trực Tiếp</span>
          </div>
        )}

        {/* Telemetry Status Badges overlay */}
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between z-10 text-[11px] text-slate-300">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-700">
              <Video className="w-3 h-3 text-emerald-400" /> Cam
            </span>
            <span className="flex items-center gap-1 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-700">
              <Mic className="w-3 h-3 text-emerald-400" /> Mic
            </span>
          </div>
          <span className="flex items-center gap-1 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-700">
            <Wifi className="w-3 h-3 text-emerald-400" /> Ping 24ms
          </span>
        </div>
      </div>

      {/* Vi phạm chi tiết & Action Buttons */}
      <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
        <div className="text-xs">
          <span className="text-slate-400">Số lần rời tab: </span>
          <span
            className={`font-semibold ${
              candidate.strikeCount > 0 ? 'text-rose-400' : 'text-emerald-400'
            }`}
          >
            {candidate.strikeCount}/{candidate.maxStrikes}
          </span>
        </div>

        {!isViolated && (
          <button
            type="button"
            onClick={() => onDisqualify(candidate.sessionId, candidate.candidateName)}
            className="px-2.5 py-1 text-xs font-medium text-rose-300 hover:text-white bg-rose-500/10 hover:bg-rose-600 border border-rose-500/30 rounded-lg transition-colors flex items-center gap-1"
          >
            <UserX className="w-3 h-3" /> Đình chỉ thi
          </button>
        )}
      </div>
    </div>
  );
};
