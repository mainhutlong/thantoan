import React, { useState } from 'react';

export interface OtherDutyRow {
  stt: number;
  nhom: string;
  maCV: string;
  tenCV: string;
  dieuKien: string;
  quyDoi: number;
  soLuong: number | '';
  ghiChu: string;
  tongGio: number | null;
  xacNhan: string;
  isCVHTRow?: boolean;
}

export const DEFAULT_OTHER_DUTIES_DATA: OtherDutyRow[] = [
  { stt: 1, nhom: 'Hướng dẫn thực tập', maCV: 'HDTT', tenCV: 'Hướng dẫn thực tập', dieuKien: '1 ngày/1 giáo viên', quyDoi: 2, soLuong: '', ghiChu: '', tongGio: null, xacNhan: '' },
  { stt: 2, nhom: 'Ra đề', maCV: 'RDTL', tenCV: 'Tự luận', dieuKien: '1 đề + 1 đáp án', quyDoi: 1, soLuong: '', ghiChu: '', tongGio: null, xacNhan: '' },
  { stt: 3, nhom: 'Ra đề', maCV: 'RDTN', tenCV: 'Trắc nghiệm', dieuKien: '1 đề + 1 đáp án', quyDoi: 1.5, soLuong: '', ghiChu: '', tongGio: null, xacNhan: '' },
  { stt: 4, nhom: 'Coi thi', maCV: 'CTHK', tenCV: 'Coi thi học kỳ', dieuKien: '1 ca thi', quyDoi: 0.65, soLuong: '', ghiChu: '', tongGio: null, xacNhan: '' },
  { stt: 5, nhom: 'Coi thi', maCV: 'CTHK', tenCV: 'Coi thi học kỳ (Khoa sau ĐH)', dieuKien: '1 ca thi', quyDoi: 1.05, soLuong: '', ghiChu: '', tongGio: null, xacNhan: '' },
  { stt: 6, nhom: 'Chấm bài', maCV: 'CBHK', tenCV: 'Chấm bài học kỳ', dieuKien: '1 bài thi', quyDoi: 0.0625, soLuong: '', ghiChu: '', tongGio: null, xacNhan: '' },
  { stt: 7, nhom: 'Hướng dẫn bài tập lớn', maCV: 'HDBT', tenCV: 'Hướng dẫn bài tập lớn', dieuKien: '3 sinh viên', quyDoi: 1, soLuong: '', ghiChu: '', tongGio: null, xacNhan: '' },
  { stt: 8, nhom: 'Đồ án môn học', maCV: 'DAC1', tenCV: 'Chấm 1', dieuKien: '3 sinh viên', quyDoi: 3, soLuong: '', ghiChu: '', tongGio: null, xacNhan: '' },
  { stt: 9, nhom: 'Đồ án môn học', maCV: 'DAC2', tenCV: 'Chấm 2', dieuKien: '3 sinh viên', quyDoi: 1, soLuong: '', ghiChu: '', tongGio: null, xacNhan: '' },
  { stt: 10, nhom: 'Chuyên đề năm 3', maCV: 'CDC1', tenCV: 'Chấm 1', dieuKien: '3 sinh viên', quyDoi: 5, soLuong: '', ghiChu: '', tongGio: null, xacNhan: '' },
  { stt: 11, nhom: 'Chuyên đề năm 3', maCV: 'CDC2', tenCV: 'Chấm 2', dieuKien: '3 sinh viên', quyDoi: 1, soLuong: '', ghiChu: '', tongGio: null, xacNhan: '' },
  { stt: 12, nhom: 'Niên luận', maCV: 'NLC1', tenCV: 'Chấm 1', dieuKien: '1 sinh viên', quyDoi: 4, soLuong: '', ghiChu: '', tongGio: null, xacNhan: '' },
  { stt: 13, nhom: 'Niên luận', maCV: 'NLC2', tenCV: 'Chấm 2', dieuKien: '1 sinh viên', quyDoi: 1.5, soLuong: '', ghiChu: '', tongGio: null, xacNhan: '' },
  { stt: 14, nhom: 'Thực tập tốt nghiệp', maCV: 'TTC1', tenCV: 'Chấm 1', dieuKien: '1 sinh viên', quyDoi: 4, soLuong: '', ghiChu: '', tongGio: null, xacNhan: '' },
  { stt: 15, nhom: 'Thực tập tốt nghiệp', maCV: 'TTC2', tenCV: 'Chấm 2', dieuKien: '1 sinh viên', quyDoi: 1, soLuong: '', ghiChu: '', tongGio: null, xacNhan: '' },
  { stt: 16, nhom: 'Đồ án, khóa luận đại học', maCV: 'HDDA', tenCV: 'Hướng dẫn chấm', dieuKien: '1 sinh viên', quyDoi: 12, soLuong: '', ghiChu: '', tongGio: null, xacNhan: '' },
  { stt: 17, nhom: 'Đồ án, khóa luận đại học', maCV: 'PBDA', tenCV: 'Phản biện', dieuKien: '1 sinh viên', quyDoi: 3, soLuong: '', ghiChu: '', tongGio: null, xacNhan: '' },
  { stt: 18, nhom: 'Hội đồng đồ án, khóa luận đại học', maCV: 'CTHD', tenCV: 'Chủ tịch hội đồng', dieuKien: '1 sinh viên', quyDoi: 1.5, soLuong: '', ghiChu: '', tongGio: null, xacNhan: '' },
  { stt: 19, nhom: 'Hội đồng đồ án, khóa luận đại học', maCV: 'TKHD', tenCV: 'Thư ký hội đồng', dieuKien: '1 sinh viên', quyDoi: 1, soLuong: '', ghiChu: '', tongGio: null, xacNhan: '' },
  { stt: 20, nhom: 'Hướng dẫn chấm tiểu luận', maCV: 'HTL1', tenCV: 'Chấm 1', dieuKien: '1 sinh viên', quyDoi: 6, soLuong: '', ghiChu: '', tongGio: null, xacNhan: '' },
  { stt: 21, nhom: 'Hướng dẫn chấm tiểu luận', maCV: 'HTL2', tenCV: 'Chấm 2', dieuKien: '1 sinh viên', quyDoi: 1.5, soLuong: '', ghiChu: '', tongGio: null, xacNhan: '' },
  { stt: 22, nhom: 'Quản lý phòng thí nghiệm', maCV: 'QPTN', tenCV: 'Quản lý phòng thí nghiệm', dieuKien: '1 năm', quyDoi: 40, soLuong: '', ghiChu: '', tongGio: null, xacNhan: '' },
  { stt: 23, nhom: 'Công tác dự giờ', maCV: 'CTDG', tenCV: 'Công tác dự giờ', dieuKien: '1 lần', quyDoi: 1, soLuong: '', ghiChu: '', tongGio: null, xacNhan: '' },
  { stt: 24, nhom: 'Tham gia hội giảng', maCV: 'TGHG', tenCV: 'Tham gia hội giảng', dieuKien: '1 lần', quyDoi: 1, soLuong: '', ghiChu: '', tongGio: null, xacNhan: '' },
  { stt: 25, nhom: 'Công tác tuyển sinh', maCV: 'CTTS', tenCV: 'Công tác tuyển sinh', dieuKien: '1 ngày', quyDoi: 2.5, soLuong: '', ghiChu: '', tongGio: null, xacNhan: '' },
  { stt: 26, nhom: 'Tham gia Tổ đảm bảo chất lượng Khoa/ Bộ Môn', maCV: 'DBTT', tenCV: 'Tổ trưởng', dieuKien: '1 năm', quyDoi: 24, soLuong: '', ghiChu: '', tongGio: null, xacNhan: '' },
  { stt: 27, nhom: 'Tham gia Tổ đảm bảo chất lượng Khoa/ Bộ Môn', maCV: 'DBTV', tenCV: 'Thành viên', dieuKien: '1 năm', quyDoi: 18, soLuong: '', ghiChu: '', tongGio: null, xacNhan: '' },
  { stt: 28, nhom: 'Tham gia Hội đồng đảm bảo chất Lượng của Trường', maCV: 'HDCT', tenCV: 'Chủ tịch', dieuKien: '1 năm', quyDoi: 20, soLuong: '', ghiChu: '', tongGio: null, xacNhan: '' },
  { stt: 29, nhom: 'Tham gia Hội đồng đảm bảo chất Lượng của Trường', maCV: 'HPCT', tenCV: 'Phó Chủ tịch', dieuKien: '1 năm', quyDoi: 15, soLuong: '', ghiChu: '', tongGio: null, xacNhan: '' },
  { stt: 30, nhom: 'Tham gia Hội đồng đảm bảo chất Lượng của Trường', maCV: 'HDTK', tenCV: 'Thư ký', dieuKien: '1 năm', quyDoi: 15, soLuong: '', ghiChu: '', tongGio: null, xacNhan: '' },
  { stt: 31, nhom: 'Tham gia Hội đồng đảm bảo chất Lượng của Trường', maCV: 'HDTV', tenCV: 'Thành viên', dieuKien: '1 năm', quyDoi: 10, soLuong: '', ghiChu: '', tongGio: null, xacNhan: '' },
  { stt: 32, nhom: 'Tham gia công tác kiểm định khoa (trước và sau khi chương trình đào tạo được công nhận)', maCV: 'CTKD', tenCV: 'Đóng góp vào công tác kiểm định', dieuKien: '1 năm', quyDoi: 1, soLuong: '', ghiChu: '', tongGio: null, xacNhan: '' },
  { stt: 33, nhom: 'Cố vấn học tập', maCV: 'Lớp thứ nhất', tenCV: 'Xếp loại cố vấn', dieuKien: '', quyDoi: 0, soLuong: '', ghiChu: '', tongGio: null, xacNhan: '', isCVHTRow: true },
  { stt: 34, nhom: 'Cố vấn học tập', maCV: 'Lớp thứ nhất', tenCV: 'Sĩ số lớp', dieuKien: '', quyDoi: 0, soLuong: '', ghiChu: '', tongGio: null, xacNhan: '', isCVHTRow: true },
  { stt: 35, nhom: 'Cố vấn học tập', maCV: 'Lớp thứ nhất', tenCV: 'Số học kỳ cố vấn', dieuKien: '', quyDoi: 0, soLuong: '', ghiChu: '', tongGio: null, xacNhan: '', isCVHTRow: true },
  { stt: 36, nhom: 'Cố vấn học tập', maCV: 'Lớp thứ hai', tenCV: 'Xếp loại cố vấn', dieuKien: '', quyDoi: 0, soLuong: '', ghiChu: '', tongGio: null, xacNhan: '', isCVHTRow: true },
  { stt: 37, nhom: 'Cố vấn học tập', maCV: 'Lớp thứ hai', tenCV: 'Sĩ số lớp', dieuKien: '', quyDoi: 0, soLuong: '', ghiChu: '', tongGio: null, xacNhan: '', isCVHTRow: true },
  { stt: 38, nhom: 'Cố vấn học tập', maCV: 'Lớp thứ hai', tenCV: 'Số học kỳ cố vấn', dieuKien: '', quyDoi: 0, soLuong: '', ghiChu: '', tongGio: null, xacNhan: '', isCVHTRow: true },
  { stt: 39, nhom: 'Cố vấn học tập', maCV: 'Lớp thứ ba', tenCV: 'Xếp loại cố vấn', dieuKien: '', quyDoi: 0, soLuong: '', ghiChu: '', tongGio: null, xacNhan: '', isCVHTRow: true },
  { stt: 40, nhom: 'Cố vấn học tập', maCV: 'Lớp thứ ba', tenCV: 'Sĩ số lớp', dieuKien: '', quyDoi: 0, soLuong: '', ghiChu: '', tongGio: null, xacNhan: '', isCVHTRow: true },
];

interface OtherDutiesSectionProps {
  isEditable?: boolean;
  onTotalHoursChange?: (total: number) => void;
}

export const OtherDutiesSection: React.FC<OtherDutiesSectionProps> = ({
  isEditable = true,
  onTotalHoursChange,
}) => {
  const [rows, setRows] = useState<OtherDutyRow[]>(DEFAULT_OTHER_DUTIES_DATA);

  const handleCellChange = (index: number, field: 'soLuong' | 'ghiChu' | 'xacNhan', val: any) => {
    setRows((prev) => {
      const updated = [...prev];
      const target = { ...updated[index] };

      if (field === 'soLuong') {
        const numVal = val === '' ? '' : Number(val);
        target.soLuong = numVal;
        if (target.quyDoi > 0 && numVal !== '') {
          target.tongGio = Number((target.quyDoi * Number(numVal)).toFixed(2));
        } else {
          target.tongGio = null;
        }
      } else if (field === 'ghiChu') {
        target.ghiChu = val;
      } else if (field === 'xacNhan') {
        target.xacNhan = val;
      }

      updated[index] = target;

      // Calculate new total
      const newTotal = updated.reduce((sum, r) => sum + (r.tongGio || 0), 0);
      if (onTotalHoursChange) {
        onTotalHoursChange(newTotal);
      }

      return updated;
    });
  };

  const totalOtherHours = rows.reduce((sum, r) => sum + (r.tongGio || 0), 0);

  // Group spans for "Nhóm công việc"
  const getGroupSpan = (index: number): { rowSpan: number; isFirst: boolean } => {
    const current = rows[index];
    if (index > 0 && rows[index - 1].nhom === current.nhom) {
      return { rowSpan: 0, isFirst: false };
    }
    let count = 0;
    for (let i = index; i < rows.length; i++) {
      if (rows[i].nhom === current.nhom) count++;
      else break;
    }
    return { rowSpan: count, isFirst: true };
  };

  // Subgroup span for "Cố vấn học tập" -> "Lớp thứ nhất / hai / ba"
  const getSubGroupSpan = (index: number): { rowSpan: number; isFirst: boolean } => {
    const current = rows[index];
    if (!current.isCVHTRow) return { rowSpan: 1, isFirst: true };
    if (index > 0 && rows[index - 1].maCV === current.maCV) {
      return { rowSpan: 0, isFirst: false };
    }
    let count = 0;
    for (let i = index; i < rows.length; i++) {
      if (rows[i].maCV === current.maCV) count++;
      else break;
    }
    return { rowSpan: count, isFirst: true };
  };

  return (
    <div className="w-full mt-6">
      {/* SECTION HEADER: B. CÔNG TÁC KHÁC */}
      <div className="border-t-2 border-black pt-1 mb-0.5">
        <h3 className="text-[13px] font-bold text-red-600 uppercase tracking-wide">
          B. CÔNG TÁC KHÁC
        </h3>
      </div>

      <div className="w-full border-t border-black overflow-x-auto">
        <table className="w-full border-collapse border border-black text-[11px] leading-tight font-sans">
          <thead>
            <tr className="bg-[#bfbfbf] text-black h-[32px] font-bold text-center">
              <th className="w-[34px] px-1 py-1 border border-black font-semibold">STT</th>
              <th className="w-[180px] px-1.5 py-1 border border-black font-semibold text-center">Nhóm công việc</th>
              <th className="w-[75px] px-1 py-1 border border-black font-semibold">Mã CV</th>
              <th className="w-[210px] px-2 py-1 border border-black font-semibold text-center">Tên công việc</th>
              <th className="w-[120px] px-1.5 py-1 border border-black font-semibold text-center">Điều kiện</th>
              <th className="w-[65px] px-1 py-1 border border-black font-semibold text-center">
                Quy đổi<br />số giờ
              </th>
              <th className="w-[65px] px-1 py-1 border border-black font-semibold text-center bg-[#ffff99]">
                Số<br />Lượng
              </th>
              <th className="w-[130px] px-1.5 py-1 border border-black font-semibold text-center bg-[#ffff99]">
                Ghi chú<br />thông tin
              </th>
              <th className="w-[75px] px-1 py-1 border border-black font-semibold text-center">
                Tổng số giờ<br />theo công việc
              </th>
              <th className="w-[110px] px-1.5 py-1 border border-black font-semibold text-center">
                Xác nhận<br />của các đơn vị
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => {
              const group = getGroupSpan(index);
              const subGroup = getSubGroupSpan(index);

              const hasQuantity = row.soLuong !== '' && Number(row.soLuong) > 0;
              const hasNote = row.ghiChu && row.ghiChu.trim() !== '';

              return (
                <tr key={row.stt} className="hover:bg-slate-50 transition-colors h-[24px]">
                  {/* STT */}
                  <td className="px-1 py-0.5 border border-black text-center font-normal">
                    {row.stt}
                  </td>

                  {/* Nhóm công việc (Merged by group) */}
                  {group.isFirst && (
                    <td
                      rowSpan={group.rowSpan}
                      className="px-2 py-1 border border-black font-medium text-black align-middle bg-white"
                    >
                      {row.nhom}
                    </td>
                  )}

                  {/* Mã CV (Or Subgroup like Lớp thứ nhất for CVHT) */}
                  {subGroup.isFirst && (
                    <td
                      rowSpan={subGroup.rowSpan}
                      className="px-1 py-0.5 border border-black text-center font-medium text-black align-middle"
                    >
                      {row.maCV}
                    </td>
                  )}

                  {/* Tên công việc */}
                  <td className="px-2 py-0.5 border border-black text-left text-black">
                    {row.tenCV}
                  </td>

                  {/* Điều kiện */}
                  <td className="px-1.5 py-0.5 border border-black text-center text-black">
                    {row.dieuKien || ''}
                  </td>

                  {/* Quy đổi số giờ */}
                  <td className="px-1 py-0.5 border border-black text-center text-black font-medium">
                    {row.quyDoi > 0 ? (row.quyDoi % 1 === 0 ? row.quyDoi : row.quyDoi.toString().replace('.', ',')) : ''}
                  </td>

                  {/* Số Lượng (Yellow highlight input) */}
                  <td
                    className={`px-1 py-0 border border-black text-center ${
                      hasQuantity ? 'bg-white' : 'bg-[#ffff99]'
                    }`}
                  >
                    {isEditable ? (
                      <input
                        type="number"
                        step="any"
                        value={row.soLuong}
                        onChange={(e) => handleCellChange(index, 'soLuong', e.target.value)}
                        className="w-full bg-transparent border-none outline-none text-[11px] text-center text-black"
                        placeholder="-"
                      />
                    ) : (
                      <span>{row.soLuong !== '' ? row.soLuong : '-'}</span>
                    )}
                  </td>

                  {/* Ghi chú thông tin (Yellow highlight input) */}
                  <td
                    className={`px-1.5 py-0 border border-black ${
                      hasNote ? 'bg-white' : 'bg-[#ffff99]'
                    }`}
                  >
                    {isEditable ? (
                      <input
                        type="text"
                        value={row.ghiChu}
                        onChange={(e) => handleCellChange(index, 'ghiChu', e.target.value)}
                        className="w-full bg-transparent border-none outline-none text-[10.5px] text-black"
                        placeholder="..."
                      />
                    ) : (
                      <span>{row.ghiChu || ''}</span>
                    )}
                  </td>

                  {/* Tổng số giờ theo công việc */}
                  <td className="px-1 py-0.5 border border-black text-center font-medium text-red-600 bg-white">
                    {row.tongGio !== null && row.tongGio > 0
                      ? row.tongGio.toFixed(row.tongGio % 1 === 0 ? 0 : 2).replace('.', ',')
                      : '-'}
                  </td>

                  {/* Xác nhận của các đơn vị */}
                  <td className="px-1 py-0 border border-black text-center text-[10px] bg-white">
                    {isEditable ? (
                      <input
                        type="text"
                        value={row.xacNhan}
                        onChange={(e) => handleCellChange(index, 'xacNhan', e.target.value)}
                        className="w-full bg-transparent border-none outline-none text-[10.5px] text-center text-black"
                        placeholder=""
                      />
                    ) : (
                      <span>{row.xacNhan || ''}</span>
                    )}
                  </td>
                </tr>
              );
            })}

            {/* FOOTER ROW: TỔNG SỐ GIỜ CÔNG TÁC KHÁC */}
            <tr className="bg-white font-bold h-[28px]">
              <td colSpan={8} className="px-2 py-1 text-center font-bold text-blue-700 border border-black text-[12px]">
                Tổng số giờ công tác khác (B)
              </td>
              <td className="px-1 py-1 text-center font-bold text-red-600 border border-black text-[12px]">
                {totalOtherHours > 0
                  ? totalOtherHours.toFixed(totalOtherHours % 1 === 0 ? 0 : 2).replace('.', ',')
                  : '-'}
              </td>
              <td className="px-1 py-1 text-center border border-black bg-white"></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

