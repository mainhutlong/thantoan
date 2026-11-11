import React, { useState } from 'react';
import { X, Printer, CheckCircle2, ShieldCheck, FileCheck } from 'lucide-react';
import { TDUEmblem } from './TDUEmblem';
import { VbccRecord, TeachingRecord, AppMode } from '../types';

interface MinutesModalProps {
  isOpen: boolean;
  onClose: () => void;
  vbccData: VbccRecord[];
  teachingData: TeachingRecord[];
  appMode: AppMode;
  institutionName: string;
  year: string;
}

export const MinutesModal: React.FC<MinutesModalProps> = ({
  isOpen,
  onClose,
  vbccData,
  teachingData,
  appMode,
  institutionName,
  year,
}) => {
  const [isDigitallySigned, setIsDigitallySigned] = useState(false);
  const [signedDate] = useState(new Date().toLocaleDateString('vi-VN'));

  if (!isOpen) return null;

  const totalTeachingAmount = teachingData.reduce((acc, curr) => acc + curr.thucNhan, 0);
  const totalGrossAmount = teachingData.reduce((acc, curr) => acc + curr.tongTienThuLao, 0);
  const totalTaxAmount = teachingData.reduce((acc, curr) => acc + curr.thueTNCN, 0);
  const totalTeachingHours = Number(teachingData.reduce((acc, curr) => acc + curr.tongTietQC, 0).toFixed(2));

  // Convert numbers to Vietnamese words for currency
  const numberToWordsVN = (num: number) => {
    if (num === 0) return 'Không đồng';
    return (
      new Intl.NumberFormat('vi-VN').format(num) + ' đồng chẵn'
    );
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSignDigital = () => {
    setIsDigitallySigned(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-md shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden border border-slate-300">
        {/* Modal Top Bar in #005325 */}
        <div className="bg-[#005325] text-white px-4 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <TDUEmblem size={22} />
            <h3 className="font-semibold text-[14px]">
              Biên bản nghiệm thu và thanh quyết toán giờ giảng dạy - Trường Đại học Tây Đô
            </h3>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white p-1 rounded cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Toolbar on Modal */}
        <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-slate-600 font-medium">Trạng thái biên bản:</span>
            {isDigitallySigned ? (
              <span className="inline-flex items-center gap-1 text-emerald-800 bg-emerald-100 font-semibold px-2 py-0.5 rounded border border-emerald-300">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                Đã ký số điện tử CA Đại học Tây Đô ({signedDate})
              </span>
            ) : (
              <span className="text-amber-800 bg-amber-100 px-2 py-0.5 rounded font-medium border border-amber-200">
                Dự thảo (Chưa ký duyệt thanh toán)
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!isDigitallySigned ? (
              <button
                onClick={handleSignDigital}
                className="px-3 py-1.5 bg-[#005325] hover:bg-[#00421e] text-white rounded font-medium flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Ký số xác thực (TDU SmartCA)</span>
              </button>
            ) : null}

            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded font-medium flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>In biên bản TDU</span>
            </button>
          </div>
        </div>

        {/* Official Document Paper Body */}
        <div className="p-6 md:p-10 overflow-y-auto bg-white text-slate-900 text-[13px] leading-relaxed font-serif">
          {/* Header 2 columns */}
          <div className="grid grid-cols-2 text-center pb-6 border-b border-slate-200">
            <div>
              <p className="font-sans font-bold text-[12px] uppercase text-[#005325]">
                TRƯỜNG ĐẠI HỌC TÂY ĐÔ
              </p>
              <p className="font-sans text-[11px] font-semibold text-slate-700 uppercase">
                PHÒNG ĐÀO TẠO & PHÒNG KẾ HOẠCH - TÀI CHÍNH
              </p>
              <p className="text-[10.5px] font-sans text-slate-500 mt-1">Số: ... /BB-TTGG-TDU</p>
            </div>
            <div>
              <p className="font-sans font-bold text-[12px] uppercase">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
              <p className="font-sans font-bold text-[11.5px] text-slate-700">Độc lập - Tự do - Hạnh phúc</p>
              <div className="w-28 h-[1px] bg-slate-400 mx-auto my-1"></div>
              <p className="text-[11.5px] italic font-sans text-slate-500">
                Cần Thơ, ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm {new Date().getFullYear()}
              </p>
            </div>
          </div>

          {/* Title */}
          <div className="text-center my-6">
            <h2 className="text-[16px] md:text-[17px] font-sans font-bold uppercase text-[#005325]">
              BIÊN BẢN NGHIỆM THU VÀ BẢNG TỔNG HỢP THANH QUYẾT TOÁN TIỀN GIỜ GIẢNG DẠY
            </h2>
            <p className="text-[12.5px] font-sans text-slate-600 mt-1">
              Niên khóa: {year} - Đợt thanh toán: Học kỳ 2 (Trường Đại học Tây Đô)
            </p>
          </div>

          {/* Legal grounds */}
          <div className="space-y-1.5 text-slate-700 text-[12px] font-sans mb-5">
            <p className="italic">
              - Căn cứ Thông tư của Bộ Giáo dục và Đào tạo về chế độ làm việc và định mức giờ giảng của giảng viên đại học;
            </p>
            <p className="italic">
              - Căn cứ Quy chế chi tiêu nội bộ hiện hành của Trường Đại học Tây Đô (TDU);
            </p>
            <p className="italic">
              - Căn cứ Kế hoạch giảng dạy và bảng tổng hợp khối lượng giờ giảng đã được các Khoa chuyên môn xác nhận.
            </p>
          </div>

          {/* Content summary */}
          <div className="my-4 font-sans text-[12.5px] space-y-2">
            <p>
              Hôm nay, vào hồi {new Date().getHours()} giờ {new Date().getMinutes()} phút, tại Phòng Đào tạo Trường Đại học Tây Đô, Hội đồng xét duyệt gồm có:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-700 text-[12px]">
              <li><strong>Đại diện Ban Giám Hiệu:</strong> GS.TS. Trần Công Chuẩn - Hiệu trưởng</li>
              <li><strong>Đại diện Phòng Đào tạo:</strong> ThS. Nguyễn Thị Lan - Chuyên viên quản lý giờ giảng</li>
              <li><strong>Đại diện Phòng Kế hoạch - Tài chính:</strong> Kế toán trưởng phụ trách thanh toán thù lao</li>
              <li><strong>Đại diện các Khoa:</strong> Lãnh đạo Khoa CNTT, Khoa Dược, Khoa Kinh tế, Khoa Luật, Khoa Ngoại ngữ...</li>
            </ul>

            <p className="font-semibold pt-2 text-[#005325]">Bảng chi tiết khối lượng giờ giảng và tiền thù lao chi trả:</p>
            
            <div className="border border-slate-300 rounded overflow-hidden my-3">
              <table className="w-full text-left text-[11.5px]">
                <thead className="bg-[#f0f6f2] font-bold border-b border-slate-300 text-[#005325]">
                  <tr>
                    <th className="p-2 border-r">TT</th>
                    <th className="p-2 border-r">Giảng viên</th>
                    <th className="p-2 border-r">Khoa / Môn dạy</th>
                    <th className="p-2 border-r text-right">Tiết QC</th>
                    <th className="p-2 border-r text-right">Tổng thù lao</th>
                    <th className="p-2 border-r text-right">Thuế TNCN (10%)</th>
                    <th className="p-2 text-right">Thực nhận (VNĐ)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {teachingData.map((row, i) => (
                    <tr key={row.id}>
                      <td className="p-2 border-r text-center">{i + 1}</td>
                      <td className="p-2 border-r font-medium">
                        {row.hoTen}
                        <div className="text-[10px] text-slate-400 font-mono">{row.maGV}</div>
                      </td>
                      <td className="p-2 border-r">
                        <div className="font-medium">{row.tenHocPhan}</div>
                        <div className="text-[10.5px] text-slate-500">{row.khoaBoMon}</div>
                      </td>
                      <td className="p-2 border-r text-right font-mono font-bold text-slate-700">{row.tongTietQC}</td>
                      <td className="p-2 border-r text-right font-mono">{row.tongTienThuLao.toLocaleString('vi-VN')} đ</td>
                      <td className="p-2 border-r text-right font-mono text-rose-600">{row.thueTNCN.toLocaleString('vi-VN')} đ</td>
                      <td className="p-2 text-right font-mono font-bold text-[#005325]">{row.thucNhan.toLocaleString('vi-VN')} đ</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-[#f8faf9] font-bold border-t border-slate-300 text-[12px]">
                  <tr>
                    <td colSpan={3} className="p-2 text-right text-slate-700">Tổng cộng toàn trường:</td>
                    <td className="p-2 text-right text-[#005325]">{totalTeachingHours} tiết</td>
                    <td className="p-2 text-right text-slate-700">{totalGrossAmount.toLocaleString('vi-VN')} đ</td>
                    <td className="p-2 text-right text-rose-600">{totalTaxAmount.toLocaleString('vi-VN')} đ</td>
                    <td className="p-2 text-right text-[#005325] text-[13px]">{totalTeachingAmount.toLocaleString('vi-VN')} đ</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <p className="font-semibold text-slate-800">
              Tổng số tiền chi trả thực nhận qua tài khoản ngân hàng bằng chữ:{' '}
              <span className="italic text-[#005325] underline">{numberToWordsVN(totalTeachingAmount)}</span>.
            </p>

            <p className="text-slate-700">
              Biên bản được lập thành 03 bản có giá trị pháp lý như nhau, làm căn cứ chuyển khoản qua ngân hàng và lưu hồ sơ quyết toán tài chính năm học tại Trường Đại học Tây Đô.
            </p>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-3 text-center pt-8 text-[12px] font-sans gap-4">
            <div>
              <p className="font-bold uppercase text-slate-800">NGƯỜI LẬP BẢNG KÊ</p>
              <p className="text-slate-500 text-[11px]">(Ký, ghi rõ họ tên)</p>
              <div className="h-16 flex items-center justify-center font-cursive text-slate-700 italic">
                {isDigitallySigned && (
                  <span className="text-emerald-800 font-sans font-bold text-[11px] border border-emerald-600 bg-emerald-50 p-1 rounded">
                    ✓ Ký điện tử: Chuyên viên TDU
                  </span>
                )}
              </div>
              <p className="font-semibold">Chuyên Viên Đào Tạo TDU</p>
            </div>

            <div>
              <p className="font-bold uppercase text-slate-800">TRƯỞNG PHÒNG ĐÀO TẠO</p>
              <p className="text-slate-500 text-[11px]">(Ký, ghi rõ họ tên)</p>
              <div className="h-16 flex items-center justify-center font-cursive text-slate-700 italic">
                {isDigitallySigned && (
                  <span className="text-emerald-800 font-sans font-bold text-[11px] border border-emerald-600 bg-emerald-50 p-1 rounded">
                    ✓ Ký điện tử: PGS.TS. Trần Quốc Hùng
                  </span>
                )}
              </div>
              <p className="font-semibold">PGS.TS. Trần Quốc Hùng</p>
            </div>

            <div>
              <p className="font-bold uppercase text-slate-800">HIỆU TRƯỞNG DUYỆT CHI</p>
              <p className="text-slate-500 text-[11px]">(Ký, đóng dấu)</p>
              <div className="h-16 flex items-center justify-center">
                {isDigitallySigned && (
                  <div className="w-22 h-22 border-2 border-red-600 rounded-full flex flex-col items-center justify-center text-[7.5px] text-red-600 font-bold uppercase rotate-[-6deg] leading-tight shadow-sm">
                    <span>TRƯỜNG ĐẠI HỌC</span>
                    <span className="text-[9px] font-extrabold text-red-700">TÂY ĐÔ</span>
                    <span>ĐÃ DUYỆT CHI</span>
                  </div>
                )}
              </div>
              <p className="font-semibold">Ban Giám Hiệu TDU</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
