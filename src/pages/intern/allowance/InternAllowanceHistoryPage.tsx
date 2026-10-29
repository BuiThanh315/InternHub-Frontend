import React, { useState, useEffect, useCallback } from 'react';
import {
  DollarSign,
  Calendar,
} from 'lucide-react';
import { toast } from 'sonner';
import { allowanceService, type AllowanceRecord } from '../../../services/allowanceService';
import { formatCurrency } from '../../../utils/formatters';

export const InternAllowanceHistoryPage: React.FC = () => {
  const [history, setHistory] = useState<AllowanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      const data = await allowanceService.getMyHistory();
      setHistory(Array.isArray(data) ? data : []);
    } catch (err: any) {
      toast.error('Không thể tải lịch sử phụ cấp: ' + (err.message || 'Lỗi hệ thống'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
          <DollarSign size={22} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Lịch Sử Phụ Cấp Thực Tập</h1>
          <p className="text-xs text-slate-500">
            Minh bạch chi tiết ngày công hợp lệ, mức trợ cấp, thưởng và truy lĩnh/truy thu theo từng tháng
          </p>
        </div>
      </div>

      {/* History Cards / List */}
      {loading ? (
        <div className="text-center py-12 text-slate-500">Đang tải lịch sử phụ cấp...</div>
      ) : history.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500">
          Bạn chưa có bản ghi phụ cấp nào được duyệt hoặc công bố.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {history.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col gap-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Calendar size={18} className="text-emerald-600" />
                  <span className="font-bold text-slate-800 text-base">Tháng {item.periodMonth}</span>
                </div>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                    item.status === 'PAID'
                      ? 'bg-emerald-100 text-emerald-800'
                      : item.status === 'APPROVED'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {item.status === 'PAID' ? 'ĐÃ CHI TRẢ' : item.status === 'APPROVED' ? 'ĐÃ DUYỆT' : 'DỰ THẢO'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-slate-500 text-xs">Ngày công hợp chuẩn:</span>
                  <p className="font-medium text-slate-800">
                    {item.actualWorkingDays} / {item.standardWorkingDays} công
                  </p>
                </div>
                <div>
                  <span className="text-slate-500 text-xs">Mức trợ cấp gốc:</span>
                  <p className="font-medium text-slate-800">{formatCurrency(item.baseAllowance)}</p>
                </div>
                <div>
                  <span className="text-slate-500 text-xs">Phụ cấp theo công:</span>
                  <p className="font-medium text-slate-800">{formatCurrency(item.autoCalculatedAmount || 0)}</p>
                </div>
                <div>
                  <span className="text-slate-500 text-xs">Thưởng / Trừ:</span>
                  <p className="font-medium text-slate-800">
                    <span className="text-emerald-600">+{formatCurrency(item.bonusAmount || 0)}</span> /{' '}
                    <span className="text-red-500">-{formatCurrency(item.deductionAmount || 0)}</span>
                  </p>
                </div>
              </div>

              {item.retroAdjustmentAmount ? (
                <div className="bg-slate-50 p-2.5 rounded-lg text-xs text-slate-700">
                  <span className="font-semibold">Khoản điều chỉnh (truy lĩnh/thu): </span>
                  <span className={item.retroAdjustmentAmount > 0 ? 'text-emerald-600 font-bold' : 'text-red-600 font-bold'}>
                    {formatCurrency(item.retroAdjustmentAmount)}
                  </span>
                  {item.retroReason && <p className="text-slate-500 mt-1 italic">{item.retroReason}</p>}
                </div>
              ) : null}

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="text-sm font-semibold text-slate-700">Thực lĩnh (Net):</span>
                <span className="text-lg font-bold text-emerald-600">{formatCurrency(item.actualAmount || 0)}</span>
              </div>

              {item.paymentDate && (
                <div className="text-[11px] text-slate-400">
                  Ngày chi trả: {new Date(item.paymentDate).toLocaleDateString('vi-VN')}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
