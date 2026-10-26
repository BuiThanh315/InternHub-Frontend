import React from 'react';
import { ShieldCheck, AlertTriangle, ShieldAlert, Clock, Copy, ExternalLink } from 'lucide-react';

interface MentorProctoringSummaryWidgetProps {
  strikeCount?: number;
  maxStrikes?: number;
  pasteCount?: number;
  status?: string;
  onViewDetails?: () => void;
}

export const MentorProctoringSummaryWidget: React.FC<MentorProctoringSummaryWidgetProps> = ({
  strikeCount = 0,
  maxStrikes = 3,
  pasteCount = 0,
  status = 'COMPLETED',
  onViewDetails,
}) => {
  const isViolated = status === 'DISQUALIFIED' || strikeCount >= maxStrikes;
  const isSuspicious = strikeCount > 0 || pasteCount > 0;

  return (
    <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm mt-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {isViolated ? (
            <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500 border border-rose-500/20">
              <ShieldAlert className="w-4 h-4" />
            </div>
          ) : isSuspicious ? (
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <AlertTriangle className="w-4 h-4" />
            </div>
          ) : (
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <ShieldCheck className="w-4 h-4" />
            </div>
          )}
          <div>
            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              Biên Bản Giám Sát AI (Anti-Cheat & Proctoring)
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Dữ liệu telemetry tính trung thực trong suốt phiên phỏng vấn
            </p>
          </div>
        </div>

        {onViewDetails && (
          <button
            type="button"
            onClick={onViewDetails}
            className="text-xs text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 font-medium"
          >
            Chi tiết log <ExternalLink className="w-3 h-3" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40">
          <Clock className="w-4 h-4 text-slate-400" />
          <div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Rời màn hình</span>
            <span
              className={`text-xs font-bold ${
                strikeCount > 0 ? 'text-amber-500 dark:text-amber-400' : 'text-slate-700 dark:text-slate-300'
              }`}
            >
              {strikeCount} / {maxStrikes} lần
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40">
          <Copy className="w-4 h-4 text-slate-400" />
          <div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Dán nội dung ngoài</span>
            <span
              className={`text-xs font-bold ${
                pasteCount > 0 ? 'text-amber-500 dark:text-amber-400' : 'text-slate-700 dark:text-slate-300'
              }`}
            >
              {pasteCount} lần
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40">
          {isViolated ? (
            <ShieldAlert className="w-4 h-4 text-rose-500" />
          ) : isSuspicious ? (
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          ) : (
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          )}
          <div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Kết luận tính trung thực</span>
            <span
              className={`text-xs font-bold ${
                isViolated
                  ? 'text-rose-500'
                  : isSuspicious
                  ? 'text-amber-500'
                  : 'text-emerald-500'
              }`}
            >
              {isViolated
                ? 'VI PHẠM QUY CHẾ'
                : isSuspicious
                ? 'CẦN LƯU Ý (NGHI VẤN)'
                : 'HOÀN TOÀN TRUNG THỰC'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
