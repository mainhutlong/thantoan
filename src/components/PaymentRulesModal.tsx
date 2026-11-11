import React, { useState } from 'react';
import { X, Save, Sliders, CheckCircle2, RotateCcw } from 'lucide-react';
import { TDUEmblem } from './TDUEmblem';
import { PaymentRuleConfig } from '../types';

interface PaymentRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: PaymentRuleConfig;
  onSaveConfig: (newConfig: PaymentRuleConfig) => void;
}

export const PaymentRulesModal: React.FC<PaymentRulesModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
}) => {
  const [rates, setRates] = useState({ ...config.rates });
  const [theoryCoeff, setTheoryCoeff] = useState(config.theoryCoeff);
  const [practiceCoeff, setPracticeCoeff] = useState(config.practiceCoeff);
  const [taxRate, setTaxRate] = useState(config.taxRate * 100);

  if (!isOpen) return null;

  const handleRateChange = (degree: string, value: number) => {
    setRates((prev) => ({
      ...prev,
      [degree]: value,
    }));
  };

  const handleReset = () => {
    setRates({
      'GS.TS': 260000,
      'PGS.TS': 220000,
      'TS': 180000,
      'ThS': 140000,
      'CN': 120000,
    });
    setTheoryCoeff(1.0);
    setPracticeCoeff(0.7);
    setTaxRate(10);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig({
      rates,
      theoryCoeff,
      practiceCoeff,
      taxRate: taxRate / 100,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded shadow-2xl w-full max-w-xl overflow-hidden border border-slate-300">
        {/* Header #005325 */}
        <div className="bg-[#005325] text-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-300" />
            <h3 className="font-semibold text-[13.5px]">
              Cấu hình quy tắc & đơn giá thù lao giờ giảng TDU
            </h3>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white p-1 rounded cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4 text-[12.5px]">
          <div className="p-2.5 bg-emerald-50/70 border border-emerald-200 rounded text-[11.5px] text-emerald-900">
            <strong>Căn cứ pháp lý:</strong> Quy chế chi tiêu nội bộ Trường Đại học Tây Đô (TDU). Khi cập nhật quy tắc, hệ thống sẽ tự động tính lại số tiết quy chuẩn và thù lao cho toàn bộ hồ sơ trong kỳ.
          </div>

          {/* Hourly Rates by Degree */}
          <div>
            <h4 className="font-semibold text-slate-800 mb-2 text-[12px] uppercase tracking-wide">
              1. Đơn giá tiết chuẩn theo học hàm / học vị (VNĐ / tiết)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-slate-600 text-[11.5px] mb-0.5">Giáo sư - GS.TS:</label>
                <input
                  type="number"
                  step="10000"
                  value={rates['GS.TS'] || 260000}
                  onChange={(e) => handleRateChange('GS.TS', Number(e.target.value))}
                  className="w-full h-8 px-2 border border-slate-300 rounded font-mono text-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-600 text-[11.5px] mb-0.5">Phó Giáo sư - PGS.TS:</label>
                <input
                  type="number"
                  step="10000"
                  value={rates['PGS.TS'] || 220000}
                  onChange={(e) => handleRateChange('PGS.TS', Number(e.target.value))}
                  className="w-full h-8 px-2 border border-slate-300 rounded font-mono text-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-600 text-[11.5px] mb-0.5">Tiến sĩ - TS:</label>
                <input
                  type="number"
                  step="10000"
                  value={rates['TS'] || 180000}
                  onChange={(e) => handleRateChange('TS', Number(e.target.value))}
                  className="w-full h-8 px-2 border border-slate-300 rounded font-mono text-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-600 text-[11.5px] mb-0.5">Thạc sĩ - ThS:</label>
                <input
                  type="number"
                  step="10000"
                  value={rates['ThS'] || 140000}
                  onChange={(e) => handleRateChange('ThS', Number(e.target.value))}
                  className="w-full h-8 px-2 border border-slate-300 rounded font-mono text-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-600 text-[11.5px] mb-0.5">Cử nhân / Kỹ sư:</label>
                <input
                  type="number"
                  step="10000"
                  value={rates['CN'] || 120000}
                  onChange={(e) => handleRateChange('CN', Number(e.target.value))}
                  className="w-full h-8 px-2 border border-slate-300 rounded font-mono text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Coefficients */}
          <div>
            <h4 className="font-semibold text-slate-800 mb-2 text-[12px] uppercase tracking-wide">
              2. Hệ số quy đổi & Thuế TNCN
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="block text-slate-600 text-[11.5px] mb-0.5">Hệ số Lý thuyết (LT):</label>
                <input
                  type="number"
                  step="0.1"
                  value={theoryCoeff}
                  onChange={(e) => setTheoryCoeff(Number(e.target.value))}
                  className="w-full h-8 px-2 border border-slate-300 rounded font-mono text-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-600 text-[11.5px] mb-0.5">Hệ số Thực hành (TH):</label>
                <input
                  type="number"
                  step="0.05"
                  value={practiceCoeff}
                  onChange={(e) => setPracticeCoeff(Number(e.target.value))}
                  className="w-full h-8 px-2 border border-slate-300 rounded font-mono text-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-600 text-[11.5px] mb-0.5">Thuế suất TNCN (%):</label>
                <input
                  type="number"
                  step="1"
                  value={taxRate}
                  onChange={(e) => setTaxRate(Number(e.target.value))}
                  className="w-full h-8 px-2 border border-slate-300 rounded font-mono text-slate-800"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={handleReset}
              className="text-slate-500 hover:text-slate-800 text-[11.5px] flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Khôi phục mặc định TDU</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded border border-slate-300 cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-[#005325] hover:bg-[#00421e] text-white rounded font-medium flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Lưu & Tái tính toán</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
