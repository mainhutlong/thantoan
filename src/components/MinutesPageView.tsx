import React, { useState } from 'react';
import {
  FileCheck,
  Printer,
  Download,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Building,
  Calendar,
  Users,
  DollarSign,
  Clock,
  Layers
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { TDUEmblem } from './TDUEmblem';
import { TeachingRecord, PeriodStatus } from '../types';

interface MinutesPageViewProps {
  teachingData: TeachingRecord[];
  periodStatus: PeriodStatus;
  onTogglePeriodLock: () => void;
  canManagePeriod: boolean;
}

export const MinutesPageView: React.FC<MinutesPageViewProps> = ({
  teachingData,
  periodStatus,
  onTogglePeriodLock,
  canManagePeriod,
}) => {
  const [isDigitallySigned, setIsDigitallySigned] = useState(false);
  const [signedDate] = useState(new Date().toLocaleDateString('vi-VN'));

  const totalTeachingAmount = teachingData.reduce((acc, curr) => acc + curr.thucNhan, 0);
  const totalGrossAmount = teachingData.reduce((acc, curr) => acc + curr.tongTienThuLao, 0);
  const totalTaxAmount = teachingData.reduce((acc, curr) => acc + curr.thueTNCN, 0);
  const totalTeachingHours = Number(teachingData.reduce((acc, curr) => acc + curr.tongTietQC, 0).toFixed(2));
  const uniqueLecturers = new Set(teachingData.map((r) => r.maGV)).size;

  const numberToWordsVN = (num: number) => {
    if (num === 0) return 'Không đồng';
    return new Intl.NumberFormat('vi-VN').format(num) + ' đồng chẵn';
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportMinutesExcel = () => {
    const rows = teachingData.map((item, idx) => ({
      'STT': idx + 1,
      'Mã GV': item.maGV,
      'Họ và tên Giảng viên': item.hoTen,
      'Khoa / Đơn vị': item.khoaBoMon,
      'Học vị': item.hocHamHocVi,
      'Học phần / Công tác': item.tenHocPhan,
      'Mã lớp / Đợt': item.maLopHocPhan,
      'Tiết LT': item.soTietLT,
      'Tiết TH': item.soTietTH,
      'Tổng tiết QC': item.tongTietQC,
      'Đơn giá (VNĐ)': item.donGiaTiet,
      'Tổng thù lao (VNĐ)': item.tongTienThuLao,
      'Thuế TNCN 10% (VNĐ)': item.thueTNCN,
      'Thực nhận (VNĐ)': item.thucNhan,
      'Tài khoản ngân hàng': item.soTaiKhoan,
      'Ngân hàng': item.nganHang,
      'Trạng thái': item.trangThai === 'da_so_hoa' ? 'Đã duyệt chi' : 'Hợp lệ',
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Bien_Ban_Nghiem_Thu_TDU');
    XLSX.writeFile(wb, 'Bien_Ban_Nghiem_Thu_Thanh_Toan_TDU_2024.xlsx');
  };

  return (
    <div className="flex-1 flex flex-col bg-[#f8fafc] text-slate-800 overflow-y-auto">
      {/* 1. Header Bar */}
      <div className="bg-white border-b border-slate-200 px-5 py-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded bg-emerald-50 text-[#005325]">
              <FileCheck className="w-5 h-5" />
            </span>
            <h1 className="text-[17px] font-bold text-slate-900 uppercase tracking-wide">
              BIÊN BẢN NGHIỆM THU VÀ CHỐT KỲ THANH TOÁN TDU
            </h1>
          </div>
          <p className="text-[12px] text-slate-500 mt-1 flex items-center gap-2">
            <span>Học kỳ 2 (Năm học 2023 - 2024)</span>
            <span>·</span>
            <span>Đơn vị lập: <strong>Hội đồng Nghiệm thu & Phòng Kế hoạch - Tài chính TDU</strong></span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!isDigitallySigned ? (
            <button
              onClick={() => setIsDigitallySigned(true)}
              className="h-[34px] px-3.5 bg-[#005325] hover:bg-[#00421e] text-white rounded text-[12px] font-medium flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Ký số TDU SmartCA</span>
            </button>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-emerald-800 bg-emerald-50 font-semibold px-3 py-1 rounded border border-emerald-300 text-[12px]">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              Đã ký số CA ({signedDate})
            </span>
          )}

          <button
            onClick={handleExportMinutesExcel}
            className="h-[34px] px-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded text-[12px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Xuất file Excel</span>
          </button>

          <button
            onClick={handlePrint}
            className="h-[34px] px-3 bg-slate-800 hover:bg-slate-900 text-white rounded text-[12px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>In biên bản</span>
          </button>

          {canManagePeriod && (
            <button
              onClick={onTogglePeriodLock}
              className={`h-[34px] px-3.5 rounded text-[12px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                periodStatus === 'locked'
                  ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300'
                  : 'bg-emerald-800 hover:bg-emerald-900 text-white shadow-xs'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{periodStatus === 'locked' ? 'Mở khóa điều chỉnh' : 'Chốt kỳ & Khóa dữ liệu'}</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Four Mini Metric Badges */}
      <div className="px-5 pt-4 pb-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white p-3 rounded border border-slate-200 shadow-2xs">
          <div className="text-[11px] text-slate-500 font-medium">Tổng thực nhận toàn trường</div>
          <div className="text-[18px] font-bold text-[#005325] mt-0.5 font-mono">
            {totalTeachingAmount.toLocaleString('vi-VN')} đ
          </div>
        </div>

        <div className="bg-white p-3 rounded border border-slate-200 shadow-2xs">
          <div className="text-[11px] text-slate-500 font-medium">Tổng tiết quy chuẩn (QC)</div>
          <div className="text-[18px] font-bold text-sky-800 mt-0.5 font-mono">
            {totalTeachingHours.toFixed(1)} tiết
          </div>
        </div>

        <div className="bg-white p-3 rounded border border-slate-200 shadow-2xs">
          <div className="text-[11px] text-slate-500 font-medium">Thuế TNCN 10% khấu trừ</div>
          <div className="text-[18px] font-bold text-amber-800 mt-0.5 font-mono">
            {totalTaxAmount.toLocaleString('vi-VN')} đ
          </div>
        </div>

        <div className="bg-white p-3 rounded border border-slate-200 shadow-2xs">
          <div className="text-[11px] text-slate-500 font-medium">Giảng viên thụ hưởng</div>
          <div className="text-[18px] font-bold text-purple-800 mt-0.5 font-mono">
            {uniqueLecturers} thầy / cô
          </div>
        </div>
      </div>

      {/* 3. Formal Printable Administrative Document Zone */}
      <div className="p-5 max-w-4xl mx-auto w-full">
        <div className="bg-white p-8 md:p-12 rounded border border-slate-300 shadow-sm text-slate-900 leading-relaxed font-serif">
          {/* Header 2 columns */}
          <div className="grid grid-cols-2 gap-4 pb-6 border-b border-slate-300">
            <div className="text-center font-sans">
              <div className="text-[12px] font-bold uppercase tracking-wider text-slate-800">
                ỦY BAN NHÂN DÂN TP. CẦN THƠ
              </div>
              <div className="text-[13px] font-bold uppercase tracking-wider text-[#005325]">
                TRƯỜNG ĐẠI HỌC TÂY ĐÔ
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Số: 24/BB-ĐHTĐ-KHTC</div>
            </div>

            <div className="text-center font-sans">
              <div className="text-[12px] font-bold uppercase tracking-wider text-slate-800">
                CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
              </div>
              <div className="text-[12px] font-semibold text-slate-700">Độc lập - Tự do - Hạnh phúc</div>
              <div className="text-[11px] text-slate-500 italic mt-0.5">
                Cần Thơ, ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm {new Date().getFullYear()}
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="text-center my-6 font-sans">
            <h2 className="text-[18px] font-bold text-[#005325] uppercase tracking-wide">
              BIÊN BẢN NGHIỆM THU VÀ THANH TOÁN THÙ LAO GIỜ GIẢNG
            </h2>
            <p className="text-[13px] font-medium text-slate-600 mt-1">
              HỌC KỲ 2 - NĂM HỌC 2023 - 2024
            </p>
          </div>

          {/* Legal grounds */}
          <div className="text-[12.5px] space-y-1.5 text-slate-700 italic border-l-2 border-emerald-600 pl-3 my-4 font-sans">
            <p>- Căn cứ Quy chế tổ chức và hoạt động của Trường Đại học Tây Đô;</p>
            <p>- Căn cứ Quy chế chi tiêu nội bộ năm 2024 được Hội đồng trường phê duyệt;</p>
            <p>- Căn cứ Kế hoạch giảng dạy và Bảng tổng hợp giờ giảng của Phòng Đào tạo & các Khoa chuyên môn.</p>
          </div>

          {/* Content */}
          <div className="my-6 space-y-3 font-sans text-[13px]">
            <p className="font-semibold text-slate-800">
              Hôm nay, Hội đồng nghiệm thu và đối soát thanh toán giờ giảng Trường Đại học Tây Đô gồm có:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-700">
              <li>Ông: <strong>PGS.TS. Trần Công Triết</strong> - Phó Hiệu trưởng (Chủ tịch Hội đồng)</li>
              <li>Bà: <strong>ThS. Nguyễn Thị Thu Trang</strong> - Trưởng Phòng Kế hoạch - Tài chính (Ủy viên)</li>
              <li>Ông: <strong>TS. Mai Như Long</strong> - Đại diện Trưởng Khoa / Đơn vị đào tạo (Ủy viên)</li>
              <li>Bà: <strong>ThS. Phan Thị Mỹ Lệ</strong> - Chuyên viên tổng hợp Phòng Đào tạo (Thư ký)</li>
            </ul>

            <div className="mt-4 pt-4 border-t border-slate-200">
              <h4 className="font-bold text-slate-800 uppercase mb-2">I. TỔNG HỢP KHỐI LƯỢNG NGHIỆM THU</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-[12px] border border-slate-300">
                  <thead className="bg-slate-100 font-semibold text-slate-800">
                    <tr>
                      <th className="p-2 border border-slate-300">STT</th>
                      <th className="p-2 border border-slate-300">Hạng mục công tác</th>
                      <th className="p-2 text-right border border-slate-300">Tiết QC</th>
                      <th className="p-2 text-right border border-slate-300">Tổng thù lao (VNĐ)</th>
                      <th className="p-2 text-right border border-slate-300">Thuế TNCN 10%</th>
                      <th className="p-2 text-right border border-slate-300">Thực nhận (VNĐ)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-2 border border-slate-300 text-center font-mono">1</td>
                      <td className="p-2 border border-slate-300 font-medium">Thanh toán giờ giảng (P. Đào tạo)</td>
                      <td className="p-2 border border-slate-300 text-right font-mono">
                        {teachingData.filter((r) => r.phongBanQuanLy === 'dao_tao').reduce((s, r) => s + r.tongTietQC, 0)}
                      </td>
                      <td className="p-2 border border-slate-300 text-right font-mono">
                        {teachingData.filter((r) => r.phongBanQuanLy === 'dao_tao').reduce((s, r) => s + r.tongTienThuLao, 0).toLocaleString('vi-VN')}
                      </td>
                      <td className="p-2 border border-slate-300 text-right font-mono">
                        {teachingData.filter((r) => r.phongBanQuanLy === 'dao_tao').reduce((s, r) => s + r.thueTNCN, 0).toLocaleString('vi-VN')}
                      </td>
                      <td className="p-2 border border-slate-300 text-right font-mono font-bold text-[#005325]">
                        {teachingData.filter((r) => r.phongBanQuanLy === 'dao_tao').reduce((s, r) => s + r.thucNhan, 0).toLocaleString('vi-VN')}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2 border border-slate-300 text-center font-mono">2</td>
                      <td className="p-2 border border-slate-300 font-medium">Coi thi chấm thi ra đề (TT Khảo thí)</td>
                      <td className="p-2 border border-slate-300 text-right font-mono">
                        {teachingData.filter((r) => r.phongBanQuanLy === 'khao_thi').reduce((s, r) => s + r.tongTietQC, 0)}
                      </td>
                      <td className="p-2 border border-slate-300 text-right font-mono">
                        {teachingData.filter((r) => r.phongBanQuanLy === 'khao_thi').reduce((s, r) => s + r.tongTienThuLao, 0).toLocaleString('vi-VN')}
                      </td>
                      <td className="p-2 border border-slate-300 text-right font-mono">
                        {teachingData.filter((r) => r.phongBanQuanLy === 'khao_thi').reduce((s, r) => s + r.thueTNCN, 0).toLocaleString('vi-VN')}
                      </td>
                      <td className="p-2 border border-slate-300 text-right font-mono font-bold text-[#005325]">
                        {teachingData.filter((r) => r.phongBanQuanLy === 'khao_thi').reduce((s, r) => s + r.thucNhan, 0).toLocaleString('vi-VN')}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2 border border-slate-300 text-center font-mono">3</td>
                      <td className="p-2 border border-slate-300 font-medium">Công tác tuyển sinh (P. Tuyển sinh)</td>
                      <td className="p-2 border border-slate-300 text-right font-mono">
                        {teachingData.filter((r) => r.phongBanQuanLy === 'tuyen_sinh').reduce((s, r) => s + r.tongTietQC, 0)}
                      </td>
                      <td className="p-2 border border-slate-300 text-right font-mono">
                        {teachingData.filter((r) => r.phongBanQuanLy === 'tuyen_sinh').reduce((s, r) => s + r.tongTienThuLao, 0).toLocaleString('vi-VN')}
                      </td>
                      <td className="p-2 border border-slate-300 text-right font-mono">
                        {teachingData.filter((r) => r.phongBanQuanLy === 'tuyen_sinh').reduce((s, r) => s + r.thueTNCN, 0).toLocaleString('vi-VN')}
                      </td>
                      <td className="p-2 border border-slate-300 text-right font-mono font-bold text-[#005325]">
                        {teachingData.filter((r) => r.phongBanQuanLy === 'tuyen_sinh').reduce((s, r) => s + r.thucNhan, 0).toLocaleString('vi-VN')}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2 border border-slate-300 text-center font-mono">4</td>
                      <td className="p-2 border border-slate-300 font-medium">Nghiên cứu khoa học (P. NCKH & SĐH)</td>
                      <td className="p-2 border border-slate-300 text-right font-mono">
                        {teachingData.filter((r) => r.phongBanQuanLy === 'nckh').reduce((s, r) => s + r.tongTietQC, 0)}
                      </td>
                      <td className="p-2 border border-slate-300 text-right font-mono">
                        {teachingData.filter((r) => r.phongBanQuanLy === 'nckh').reduce((s, r) => s + r.tongTienThuLao, 0).toLocaleString('vi-VN')}
                      </td>
                      <td className="p-2 border border-slate-300 text-right font-mono">
                        {teachingData.filter((r) => r.phongBanQuanLy === 'nckh').reduce((s, r) => s + r.thueTNCN, 0).toLocaleString('vi-VN')}
                      </td>
                      <td className="p-2 border border-slate-300 text-right font-mono font-bold text-[#005325]">
                        {teachingData.filter((r) => r.phongBanQuanLy === 'nckh').reduce((s, r) => s + r.thucNhan, 0).toLocaleString('vi-VN')}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2 border border-slate-300 text-center font-mono">5</td>
                      <td className="p-2 border border-slate-300 font-medium">Công tác khác & CVHT</td>
                      <td className="p-2 border border-slate-300 text-right font-mono">
                        {teachingData.filter((r) => r.phongBanQuanLy === 'cong_tac_khac').reduce((s, r) => s + r.tongTietQC, 0)}
                      </td>
                      <td className="p-2 border border-slate-300 text-right font-mono">
                        {teachingData.filter((r) => r.phongBanQuanLy === 'cong_tac_khac').reduce((s, r) => s + r.tongTienThuLao, 0).toLocaleString('vi-VN')}
                      </td>
                      <td className="p-2 border border-slate-300 text-right font-mono">
                        {teachingData.filter((r) => r.phongBanQuanLy === 'cong_tac_khac').reduce((s, r) => s + r.thueTNCN, 0).toLocaleString('vi-VN')}
                      </td>
                      <td className="p-2 border border-slate-300 text-right font-mono font-bold text-[#005325]">
                        {teachingData.filter((r) => r.phongBanQuanLy === 'cong_tac_khac').reduce((s, r) => s + r.thucNhan, 0).toLocaleString('vi-VN')}
                      </td>
                    </tr>
                    <tr className="bg-emerald-50 font-bold text-slate-900">
                      <td colSpan={2} className="p-2 border border-slate-300 uppercase text-center">
                        TỔNG CỘNG TOÀN TRƯỜNG
                      </td>
                      <td className="p-2 border border-slate-300 text-right font-mono text-[#005325]">
                        {totalTeachingHours.toFixed(1)}
                      </td>
                      <td className="p-2 border border-slate-300 text-right font-mono">
                        {totalGrossAmount.toLocaleString('vi-VN')}
                      </td>
                      <td className="p-2 border border-slate-300 text-right font-mono text-rose-700">
                        {totalTaxAmount.toLocaleString('vi-VN')}
                      </td>
                      <td className="p-2 border border-slate-300 text-right font-mono text-[13px] text-[#005325]">
                        {totalTeachingAmount.toLocaleString('vi-VN')} đ
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-[12.5px] italic text-slate-600 mt-2">
                Bằng chữ: <strong>{numberToWordsVN(totalTeachingAmount)}</strong>
              </p>
            </div>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-3 gap-4 text-center mt-12 pt-6 font-sans text-[12.5px]">
            <div>
              <div className="font-bold uppercase text-slate-800">PHÒNG ĐÀO TẠO</div>
              <div className="text-[11px] text-slate-400 italic mb-14">(Ký, ghi rõ họ tên)</div>
              <div className="font-semibold text-slate-800">ThS. Phan Thị Mỹ Lệ</div>
            </div>

            <div>
              <div className="font-bold uppercase text-slate-800">PHÒNG KẾ HOẠCH - TÀI CHÍNH</div>
              <div className="text-[11px] text-slate-400 italic mb-14">(Ký, ghi rõ họ tên)</div>
              <div className="font-semibold text-slate-800">ThS. Nguyễn Thị Thu Trang</div>
            </div>

            <div>
              <div className="font-bold uppercase text-[#005325]">HIỆU TRƯỞNG PHÊ DUYỆT</div>
              <div className="text-[11px] text-slate-400 italic mb-14">
                {isDigitallySigned ? (
                  <span className="text-emerald-700 font-bold">ĐÃ KÝ SỐ CA TDU</span>
                ) : (
                  '(Ký, đóng dấu)'
                )}
              </div>
              <div className="font-semibold text-slate-800">PGS.TS. Trần Công Triết</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
