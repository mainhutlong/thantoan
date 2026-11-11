import React, { useState, useMemo } from 'react';
import {
  Clock,
  Search,
  Filter,
  Download,
  RotateCw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Shield,
  User,
  Activity,
  FileSpreadsheet
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { SystemAuditLog } from '../types';

export const INITIAL_AUDIT_LOGS: SystemAuditLog[] = [
  {
    id: 'log-1',
    timestamp: '10/11/2026 15:42:18',
    userName: 'TS. Mai Như Long',
    userCode: 'TDU00128',
    ipAddress: '192.168.1.45 (Cần Thơ, VN)',
    action: 'Cập nhật hồ sơ giờ giảng',
    module: 'Giờ giảng dạy',
    detail: 'Chỉnh sửa số tiết thực hành học phần Phát triển HTTT Doanh nghiệp từ 24h lên 30h theo đề cương mới.',
    status: 'success',
  },
  {
    id: 'log-2',
    timestamp: '10/11/2026 14:15:02',
    userName: 'Kế toán viên Thanh toán',
    userCode: 'KT_TDU_02',
    ipAddress: '192.168.1.12 (P. KHTC)',
    action: 'Lập lệnh chi trả tài chính',
    module: 'Chi trả tài chính',
    detail: 'Khởi tạo đợt chi trả Đợt 1 Học kỳ 2 cho 12 giảng viên Khoa CNTT với tổng số tiền 89,450,000 đ.',
    status: 'success',
  },
  {
    id: 'log-3',
    timestamp: '10/11/2026 11:30:45',
    userName: 'PGS.TS. Trần Quốc Hùng',
    userCode: 'TDU00245',
    ipAddress: '14.232.18.90 (Chrome / MacOS)',
    action: 'Gửi phản hồi đối soát',
    module: 'Phản hồi giảng viên',
    detail: 'Gửi phản hồi yêu cầu kiểm tra lại hệ số lớp tín chỉ môn Dược lý nâng cao (yêu cầu nâng hệ số từ 1.25 lên 1.40).',
    status: 'success',
  },
  {
    id: 'log-4',
    timestamp: '10/11/2026 10:05:12',
    userName: 'Admin Hệ thống',
    userCode: 'ADMIN_01',
    ipAddress: '192.168.1.2 (Trung tâm CNTT)',
    action: 'Cấu hình hệ thống',
    module: 'Cấu hình hệ thống',
    detail: 'Điều chỉnh đơn giá tiết chuẩn ngạch Tiến sĩ từ 175,000 đ lên 180,000 đ theo Quy chế tài chính năm 2026.',
    status: 'success',
  },
  {
    id: 'log-5',
    timestamp: '10/11/2026 09:20:33',
    userName: 'Chuyên viên Khảo thí',
    userCode: 'KT_EXAM_01',
    ipAddress: '192.168.1.18 (TT Khảo thí)',
    action: 'Import file Excel',
    module: 'Coi thi chấm thi',
    detail: 'Import danh sách 142 ca coi thi kết thúc học phần đợt 2 qua file Excel "Bang_Phan_Cong_Coi_Thi_HK2.xlsx".',
    status: 'success',
  },
  {
    id: 'log-6',
    timestamp: '10/11/2026 08:45:10',
    userName: 'Không xác định',
    userCode: 'GUEST_IP',
    ipAddress: '113.161.42.15 (TP. Hồ Chí Minh)',
    action: 'Đăng nhập thất bại',
    module: 'Xác thực & Bảo mật',
    detail: 'Sai mật khẩu quá 3 lần liên tiếp cho tài khoản "admin_root". Hệ thống đã khóa IP 15 phút.',
    status: 'warning',
  },
  {
    id: 'log-7',
    timestamp: '09/11/2026 16:50:20',
    userName: 'GS.TS. Phạm Hoàng Long',
    userCode: 'TDU00008',
    ipAddress: '192.168.1.8 (Ban Giám hiệu)',
    action: 'Phê duyệt tổng hợp & Khóa sổ',
    module: 'Quản lý thanh toán',
    detail: 'Ký duyệt bảng tổng hợp quyết toán công tác giảng dạy toàn trường Đợt 1 và chuyển trạng thái "Đã khóa".',
    status: 'success',
  },
  {
    id: 'log-8',
    timestamp: '09/11/2026 14:10:00',
    userName: 'Chuyên viên Tuyển sinh',
    userCode: 'TS_OFFICER_02',
    ipAddress: '192.168.1.25 (P. Tuyển sinh)',
    action: 'Thêm mới công tác',
    module: 'Công tác tuyển sinh',
    detail: 'Kê khai công tác tư vấn tuyển sinh tại 3 trường THPT địa bàn Cà Mau và Bạc Liêu cho 5 giảng viên.',
    status: 'success',
  },
];

export const SystemAuditLogPage: React.FC = () => {
  const [logs, setLogs] = useState<SystemAuditLog[]>(INITIAL_AUDIT_LOGS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModule, setSelectedModule] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const modules = useMemo(() => {
    const set = new Set(logs.map((l) => l.module));
    return Array.from(set);
  }, [logs]);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const match =
          log.userName.toLowerCase().includes(q) ||
          log.userCode.toLowerCase().includes(q) ||
          log.action.toLowerCase().includes(q) ||
          log.detail.toLowerCase().includes(q);
        if (!match) return false;
      }
      if (selectedModule !== 'all' && log.module !== selectedModule) return false;
      if (selectedStatus !== 'all' && log.status !== selectedStatus) return false;
      return true;
    });
  }, [logs, searchTerm, selectedModule, selectedStatus]);

  const handleExportExcel = () => {
    const dataToExport = filteredLogs.map((l, idx) => ({
      STT: idx + 1,
      'Thời gian': l.timestamp,
      'Người thực hiện': l.userName,
      'Mã tài khoản': l.userCode,
      'Địa chỉ IP': l.ipAddress,
      'Hành động': l.action,
      'Phân hệ tác động': l.module,
      'Nội dung chi tiết': l.detail,
      'Trạng thái': l.status === 'success' ? 'Thành công' : l.status === 'warning' ? 'Cảnh báo' : 'Lỗi',
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Audit_Logs');
    XLSX.writeFile(workbook, `TDU_Nhat_Ky_He_Thong_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#f8fafc] overflow-y-auto">
      {/* 1. Header Zone */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 shrink-0 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 border border-amber-200/80 flex items-center justify-center shadow-2xs">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-[17px] font-bold text-slate-900 leading-tight">
                NHẬT KÝ HỆ THỐNG (SYSTEM AUDIT LOGS)
              </h1>
              <p className="text-[12px] text-slate-500">
                Ghi nhận chi tiết thời gian, đối tượng, IP và nội dung thay đổi trên toàn hệ thống
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setLogs(INITIAL_AUDIT_LOGS)}
              className="h-[34px] px-3.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-[12.5px] font-medium flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all"
            >
              <RotateCw className="w-4 h-4 text-slate-500" />
              <span>Làm mới</span>
            </button>
            <button
              onClick={handleExportExcel}
              className="h-[34px] px-3.5 rounded-xl bg-[#005325] hover:bg-[#00421e] text-white text-[12.5px] font-medium flex items-center gap-2 cursor-pointer shadow-2xs transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Xuất nhật ký Excel</span>
            </button>
          </div>
        </div>

        {/* 2. Metric Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-3 border-t border-slate-100">
          <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200/80 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[13px]">
              {logs.length}
            </div>
            <div>
              <div className="text-[11px] text-slate-500 uppercase tracking-wider font-medium">Tổng số bản ghi log</div>
              <div className="text-[13px] font-semibold text-slate-800">Lưu trữ toàn vẹn</div>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200/80 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[13px]">
              {logs.filter((l) => l.status === 'success').length}
            </div>
            <div>
              <div className="text-[11px] text-slate-500 uppercase tracking-wider font-medium">Thao tác thành công</div>
              <div className="text-[13px] font-semibold text-emerald-800">Đạt 98.5% chuẩn</div>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200/80 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-[13px]">
              {logs.filter((l) => l.status === 'warning').length}
            </div>
            <div>
              <div className="text-[11px] text-slate-500 uppercase tracking-wider font-medium">Cảnh báo / Thất bại</div>
              <div className="text-[13px] font-semibold text-amber-800">Cần giám sát</div>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200/80 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-[13px]">
              6
            </div>
            <div>
              <div className="text-[11px] text-slate-500 uppercase tracking-wider font-medium">Người dùng trực tuyến</div>
              <div className="text-[13px] font-semibold text-purple-800">Phiên làm việc an toàn</div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Filter Bar */}
      <div className="px-6 py-3 bg-white border-b border-slate-200 flex flex-wrap items-center gap-3 text-[12.5px]">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Tìm theo người thực hiện, mã NV, hành động, chi tiết..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-[12.5px] focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-slate-500 font-medium">Phân hệ:</span>
          <select
            value={selectedModule}
            onChange={(e) => setSelectedModule(e.target.value)}
            className="h-[32px] px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-[12.5px] focus:outline-none"
          >
            <option value="all">Tất cả phân hệ</option>
            {modules.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-slate-500 font-medium">Trạng thái:</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="h-[32px] px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-[12.5px] focus:outline-none"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="success">Thành công</option>
            <option value="warning">Cảnh báo</option>
            <option value="error">Thất bại</option>
          </select>
        </div>

        {(searchTerm || selectedModule !== 'all' || selectedStatus !== 'all') && (
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedModule('all');
              setSelectedStatus('all');
            }}
            className="text-blue-600 hover:underline font-medium ml-auto"
          >
            Đặt lại lọc
          </button>
        )}
      </div>

      {/* 4. Logs Table */}
      <div className="flex-1 overflow-x-auto p-4">
        <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
          <table className="w-full border-collapse text-left text-[12px] min-w-[1000px]">
            <thead className="bg-[#f1f5f9] text-slate-800 font-semibold border-b border-slate-300 h-[38px]">
              <tr>
                <th className="px-2.5 text-center border-r border-slate-300 w-[45px]">STT</th>
                <th className="px-3 border-r border-slate-300 w-[155px]">Thời gian</th>
                <th className="px-3 border-r border-slate-300 min-w-[170px]">Người thực hiện</th>
                <th className="px-3 border-r border-slate-300 w-[170px]">IP & Thiết bị</th>
                <th className="px-3 border-r border-slate-300 w-[160px]">Hành động</th>
                <th className="px-3 border-r border-slate-300 w-[150px]">Phân hệ</th>
                <th className="px-3 border-r border-slate-300 min-w-[300px]">Nội dung chi tiết</th>
                <th className="px-2.5 text-center w-[110px]">Trạng thái</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    Không tìm thấy nhật ký thao tác nào phù hợp.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log, idx) => (
                  <tr key={log.id} className="h-[42px] hover:bg-slate-50 transition-colors">
                    <td className="px-2.5 text-center font-mono text-slate-500 border-r border-slate-200">
                      {idx + 1}
                    </td>

                    {/* Timestamp */}
                    <td className="px-3 font-mono text-slate-600 border-r border-slate-200 whitespace-nowrap">
                      {log.timestamp}
                    </td>

                    {/* User */}
                    <td className="px-3 border-r border-slate-200 whitespace-nowrap">
                      <div className="font-semibold text-slate-900">{log.userName}</div>
                      <div className="font-mono text-[11px] text-blue-700">{log.userCode}</div>
                    </td>

                    {/* IP */}
                    <td className="px-3 font-mono text-[11.5px] text-slate-600 border-r border-slate-200 whitespace-nowrap">
                      {log.ipAddress}
                    </td>

                    {/* Action */}
                    <td className="px-3 font-medium text-slate-800 border-r border-slate-200 whitespace-nowrap">
                      {log.action}
                    </td>

                    {/* Module */}
                    <td className="px-3 border-r border-slate-200 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                        {log.module}
                      </span>
                    </td>

                    {/* Detail */}
                    <td className="px-3 text-slate-700 border-r border-slate-200 text-[12px] leading-relaxed">
                      {log.detail}
                    </td>

                    {/* Status */}
                    <td className="px-2.5 text-center whitespace-nowrap">
                      {log.status === 'success' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-[#005325] border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> Thành công
                        </span>
                      ) : log.status === 'warning' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                          <AlertTriangle className="w-3 h-3" /> Cảnh báo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-200">
                          <XCircle className="w-3 h-3" /> Thất bại
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

