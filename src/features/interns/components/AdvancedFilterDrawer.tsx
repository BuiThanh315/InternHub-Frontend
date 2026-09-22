import React from 'react';
import { X, RotateCcw, Check } from 'lucide-react';

interface AdvancedFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  university: string;
  onSelectUniversity: (uni: string) => void;
  department: string;
  onSelectDepartment: (dept: string) => void;
  onReset: () => void;
  activeCount: number;
}

export const AdvancedFilterDrawer: React.FC<AdvancedFilterDrawerProps> = ({
  isOpen,
  onClose,
  university,
  onSelectUniversity,
  department,
  onSelectDepartment,
  onReset,
  activeCount,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-[1px] animate-in fade-in duration-200">
      <div
        className="w-full max-w-sm bg-surface border-l border-border h-full flex flex-col shadow-pop animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-soft">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-text-1 font-heading">
              Bộ Lọc Nâng Cao
            </h3>
            {activeCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-primary text-white">
                {activeCount}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-3 hover:text-text-1 hover:bg-surface-2 transition-colors cursor-pointer"
            title="Đóng bộ lọc"
          >
            <X size={18} />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Lọc theo Trường */}
          <div>
            <label className="block text-xs font-bold text-text-2 uppercase tracking-wider mb-2">
              Trường Đại Học
            </label>
            <div className="space-y-1.5">
              {[
                { label: 'Tất cả trường', value: '' },
                { label: 'ĐH Bách Khoa', value: 'Bách Khoa' },
                { label: 'ĐH FPT', value: 'FPT' },
                { label: 'ĐH Quốc Gia', value: 'Quốc Gia' },
                { label: 'ĐH Kinh Tế Quốc Dân', value: 'Kinh Tế Quốc Dân' },
              ].map((item) => (
                <button
                  key={item.value}
                  onClick={() => onSelectUniversity(item.value)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium border transition-colors text-left ${
                    university === item.value
                      ? 'bg-primary-soft text-primary border-primary font-semibold'
                      : 'bg-bg text-text-2 border-border hover:bg-surface-2 hover:text-text-1'
                  }`}
                >
                  <span>{item.label}</span>
                  {university === item.value && <Check size={14} className="text-primary shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          {/* Lọc theo Phòng ban */}
          <div>
            <label className="block text-xs font-bold text-text-2 uppercase tracking-wider mb-2">
              Phòng Ban Tiếp Nhận
            </label>
            <div className="space-y-1.5">
              {[
                { label: 'Tất cả phòng ban', value: '' },
                { label: 'Kỹ thuật phần mềm', value: 'Kỹ thuật phần mềm' },
                { label: 'Phát triển Backend', value: 'Backend' },
                { label: 'Phát triển Frontend', value: 'Frontend' },
                { label: 'Kiểm thử & QA', value: 'QA' },
                { label: 'Data & AI', value: 'Data' },
              ].map((item) => (
                <button
                  key={item.value}
                  onClick={() => onSelectDepartment(item.value)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium border transition-colors text-left ${
                    department === item.value
                      ? 'bg-primary-soft text-primary border-primary font-semibold'
                      : 'bg-bg text-text-2 border-border hover:bg-surface-2 hover:text-text-1'
                  }`}
                >
                  <span>{item.label}</span>
                  {department === item.value && <Check size={14} className="text-primary shrink-0" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-border-soft flex items-center justify-between gap-3 bg-surface-2/40">
          <button
            onClick={onReset}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-text-3 hover:text-text-1 hover:bg-surface-2 transition-colors cursor-pointer"
          >
            <RotateCcw size={13} /> Đặt lại
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg text-xs font-semibold bg-primary text-white hover:bg-primary-hover transition-colors shadow-xs cursor-pointer"
          >
            Áp Dụng ({activeCount})
          </button>
        </div>
      </div>
    </div>
  );
};
