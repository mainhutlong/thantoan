import React, { useState } from 'react';
import {
  Shield,
  Users,
  CheckCircle2,
  Lock,
  Plus,
  Trash2,
  Save,
  Search,
  Check,
  Building,
  Key,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { RoleGroupPermission } from '../types';

export const INITIAL_ROLE_GROUPS: RoleGroupPermission[] = [
  {
    id: 'grp-admin',
    name: 'Quản trị viên hệ thống',
    code: 'ADMIN_GROUP',
    description: 'Toàn quyền cấu hình hệ thống, quản lý tài khoản, dữ liệu và nhật ký kiểm toán.',
    memberCount: 2,
    members: ['TS. Mai Như Long (TDU00128)', 'Admin Hệ thống (admin)'],
    permissions: [
      { moduleId: 'ke_khai', moduleName: 'Danh mục thống kê & Kê khai', view: true, create: true, edit: true, delete: true, approve: true, export: true },
      { moduleId: 'thanh_toan', moduleName: 'Quản lý thanh toán & Đối soát', view: true, create: true, edit: true, delete: true, approve: true, export: true },
      { moduleId: 'chi_tra', moduleName: 'Chi trả tài chính', view: true, create: true, edit: true, delete: true, approve: true, export: true },
      { moduleId: 'tra_cuu', moduleName: 'Tra cứu & Phản hồi giảng viên', view: true, create: true, edit: true, delete: true, approve: true, export: true },
      { moduleId: 'bao_cao', moduleName: 'Báo cáo & Biên bản nghiệm thu', view: true, create: true, edit: true, delete: true, approve: true, export: true },
      { moduleId: 'nguoi_dung', moduleName: 'Quản lý Người dùng & Nhân sự', view: true, create: true, edit: true, delete: true, approve: true, export: true },
      { moduleId: 'he_thong', moduleName: 'Cấu hình hệ thống & Nhật ký', view: true, create: true, edit: true, delete: true, approve: true, export: true },
    ],
  },
  {
    id: 'grp-bgh',
    name: 'Ban Giám hiệu (Phê duyệt)',
    code: 'BGH_APPROVER',
    description: 'Phê duyệt tổng hợp thanh toán toàn trường, ký số biên bản nghiệm thu và khóa kỳ thanh toán.',
    memberCount: 3,
    members: ['GS.TS. Phạm Hoàng Long (TDU00008)', 'Ban Giám hiệu TDU'],
    permissions: [
      { moduleId: 'ke_khai', moduleName: 'Danh mục thống kê & Kê khai', view: true, create: false, edit: false, delete: false, approve: true, export: true },
      { moduleId: 'thanh_toan', moduleName: 'Quản lý thanh toán & Đối soát', view: true, create: false, edit: false, delete: false, approve: true, export: true },
      { moduleId: 'chi_tra', moduleName: 'Chi trả tài chính', view: true, create: false, edit: false, delete: false, approve: true, export: true },
      { moduleId: 'tra_cuu', moduleName: 'Tra cứu & Phản hồi giảng viên', view: true, create: false, edit: false, delete: false, approve: true, export: true },
      { moduleId: 'bao_cao', moduleName: 'Báo cáo & Biên bản nghiệm thu', view: true, create: false, edit: false, delete: false, approve: true, export: true },
      { moduleId: 'nguoi_dung', moduleName: 'Quản lý Người dùng & Nhân sự', view: true, create: false, edit: false, delete: false, approve: false, export: true },
      { moduleId: 'he_thong', moduleName: 'Cấu hình hệ thống & Nhật ký', view: true, create: false, edit: false, delete: false, approve: true, export: true },
    ],
  },
  {
    id: 'grp-dao-tao',
    name: 'Phòng Đào tạo',
    code: 'DAO_TAO_OFFICER',
    description: 'Chịu trách nhiệm import, kiểm tra và chuẩn hóa dữ liệu giờ giảng dạy lý thuyết, thực hành, thực tập.',
    memberCount: 4,
    members: ['Chuyên viên Đào tạo 1', 'Chuyên viên Đào tạo 2'],
    permissions: [
      { moduleId: 'ke_khai', moduleName: 'Danh mục thống kê & Kê khai', view: true, create: true, edit: true, delete: false, approve: false, export: true },
      { moduleId: 'thanh_toan', moduleName: 'Quản lý thanh toán & Đối soát', view: true, create: false, edit: false, delete: false, approve: false, export: true },
      { moduleId: 'chi_tra', moduleName: 'Chi trả tài chính', view: false, create: false, edit: false, delete: false, approve: false, export: false },
      { moduleId: 'tra_cuu', moduleName: 'Tra cứu & Phản hồi giảng viên', view: true, create: false, edit: true, delete: false, approve: false, export: true },
      { moduleId: 'bao_cao', moduleName: 'Báo cáo & Biên bản nghiệm thu', view: true, create: true, edit: false, delete: false, approve: false, export: true },
      { moduleId: 'nguoi_dung', moduleName: 'Quản lý Người dùng & Nhân sự', view: true, create: false, edit: false, delete: false, approve: false, export: false },
      { moduleId: 'he_thong', moduleName: 'Cấu hình hệ thống & Nhật ký', view: false, create: false, edit: false, delete: false, approve: false, export: false },
    ],
  },
  {
    id: 'grp-tai-chinh',
    name: 'Phòng Kế hoạch - Tài chính',
    code: 'TAI_CHINH_OFFICER',
    description: 'Kiểm tra thuế TNCN, tạo lệnh chi trả, giải ngân vào tài khoản ngân hàng và xuất báo cáo tài chính.',
    memberCount: 3,
    members: ['Kế toán viên Thanh toán', 'Trưởng phòng KHTC'],
    permissions: [
      { moduleId: 'ke_khai', moduleName: 'Danh mục thống kê & Kê khai', view: true, create: false, edit: false, delete: false, approve: false, export: true },
      { moduleId: 'thanh_toan', moduleName: 'Quản lý thanh toán & Đối soát', view: true, create: true, edit: true, delete: false, approve: true, export: true },
      { moduleId: 'chi_tra', moduleName: 'Chi trả tài chính', view: true, create: true, edit: true, delete: false, approve: true, export: true },
      { moduleId: 'tra_cuu', moduleName: 'Tra cứu & Phản hồi giảng viên', view: true, create: false, edit: false, delete: false, approve: false, export: true },
      { moduleId: 'bao_cao', moduleName: 'Báo cáo & Biên bản nghiệm thu', view: true, create: true, edit: true, delete: false, approve: true, export: true },
      { moduleId: 'nguoi_dung', moduleName: 'Quản lý Người dùng & Nhân sự', view: true, create: false, edit: false, delete: false, approve: false, export: true },
      { moduleId: 'he_thong', moduleName: 'Cấu hình hệ thống & Nhật ký', view: true, create: false, edit: false, delete: false, approve: false, export: false },
    ],
  },
  {
    id: 'grp-khao-thi',
    name: 'Trung tâm Khảo thí',
    code: 'KHAO_THI_OFFICER',
    description: 'Quản lý import và thẩm định dữ liệu coi thi, chấm thi tự luận/trắc nghiệm, ra đề và duyệt đề thi.',
    memberCount: 3,
    members: ['Chuyên viên Khảo thí 1', 'Chuyên viên Khảo thí 2'],
    permissions: [
      { moduleId: 'ke_khai', moduleName: 'Danh mục thống kê & Kê khai', view: true, create: true, edit: true, delete: false, approve: false, export: true },
      { moduleId: 'thanh_toan', moduleName: 'Quản lý thanh toán & Đối soát', view: true, create: false, edit: false, delete: false, approve: false, export: true },
      { moduleId: 'chi_tra', moduleName: 'Chi trả tài chính', view: false, create: false, edit: false, delete: false, approve: false, export: false },
      { moduleId: 'tra_cuu', moduleName: 'Tra cứu & Phản hồi giảng viên', view: true, create: false, edit: true, delete: false, approve: false, export: true },
      { moduleId: 'bao_cao', moduleName: 'Báo cáo & Biên bản nghiệm thu', view: true, create: false, edit: false, delete: false, approve: false, export: true },
      { moduleId: 'nguoi_dung', moduleName: 'Quản lý Người dùng & Nhân sự', view: false, create: false, edit: false, delete: false, approve: false, export: false },
      { moduleId: 'he_thong', moduleName: 'Cấu hình hệ thống & Nhật ký', view: false, create: false, edit: false, delete: false, approve: false, export: false },
    ],
  },
  {
    id: 'grp-nckh',
    name: 'Phòng QLKH & Hợp tác Quốc tế',
    code: 'QLKH_OFFICER',
    description: 'Thẩm định hồ sơ bài báo khoa học, đề tài nghiên cứu, sách giáo trình và tính mức độ hoàn thành NCKH.',
    memberCount: 2,
    members: ['Chuyên viên QLKH'],
    permissions: [
      { moduleId: 'ke_khai', moduleName: 'Danh mục thống kê & Kê khai', view: true, create: true, edit: true, delete: false, approve: false, export: true },
      { moduleId: 'thanh_toan', moduleName: 'Quản lý thanh toán & Đối soát', view: true, create: false, edit: false, delete: false, approve: false, export: true },
      { moduleId: 'chi_tra', moduleName: 'Chi trả tài chính', view: false, create: false, edit: false, delete: false, approve: false, export: false },
      { moduleId: 'tra_cuu', moduleName: 'Tra cứu & Phản hồi giảng viên', view: true, create: false, edit: true, delete: false, approve: false, export: true },
      { moduleId: 'bao_cao', moduleName: 'Báo cáo & Biên bản nghiệm thu', view: true, create: false, edit: false, delete: false, approve: false, export: true },
      { moduleId: 'nguoi_dung', moduleName: 'Quản lý Người dùng & Nhân sự', view: false, create: false, edit: false, delete: false, approve: false, export: false },
      { moduleId: 'he_thong', moduleName: 'Cấu hình hệ thống & Nhật ký', view: false, create: false, edit: false, delete: false, approve: false, export: false },
    ],
  },
  {
    id: 'grp-giang-vien',
    name: 'Giảng viên (Cơ hữu & Thỉnh giảng)',
    code: 'LECTURER_USER',
    description: 'Đăng nhập xem bảng thống kê cá nhân, xác nhận giờ giảng, ký số điện tử và gửi phản hồi đối soát.',
    memberCount: 156,
    members: ['Toàn thể Cán bộ - Giảng viên TDU'],
    permissions: [
      { moduleId: 'ke_khai', moduleName: 'Danh mục thống kê & Kê khai', view: false, create: false, edit: false, delete: false, approve: false, export: false },
      { moduleId: 'thanh_toan', moduleName: 'Quản lý thanh toán & Đối soát', view: false, create: false, edit: false, delete: false, approve: false, export: false },
      { moduleId: 'chi_tra', moduleName: 'Chi trả tài chính', view: false, create: false, edit: false, delete: false, approve: false, export: false },
      { moduleId: 'tra_cuu', moduleName: 'Tra cứu & Phản hồi giảng viên', view: true, create: true, edit: true, delete: false, approve: false, export: true },
      { moduleId: 'bao_cao', moduleName: 'Báo cáo & Biên bản nghiệm thu', view: true, create: false, edit: false, delete: false, approve: false, export: true },
      { moduleId: 'nguoi_dung', moduleName: 'Quản lý Người dùng & Nhân sự', view: false, create: false, edit: false, delete: false, approve: false, export: false },
      { moduleId: 'he_thong', moduleName: 'Cấu hình hệ thống & Nhật ký', view: false, create: false, edit: false, delete: false, approve: false, export: false },
    ],
  },
];

export const SystemRoleGroupPage: React.FC = () => {
  const [roleGroups, setRoleGroups] = useState<RoleGroupPermission[]>(INITIAL_ROLE_GROUPS);
  const [selectedGroupId, setSelectedGroupId] = useState<string>('grp-admin');
  const [activeTab, setActiveTab] = useState<'matrix' | 'members'>('matrix');
  const [savedNotification, setSavedNotification] = useState(false);

  const selectedGroup = roleGroups.find((g) => g.id === selectedGroupId) || roleGroups[0];

  // Toggle single permission check
  const handleTogglePermission = (moduleId: string, action: 'view' | 'create' | 'edit' | 'delete' | 'approve' | 'export') => {
    setRoleGroups((prev) =>
      prev.map((grp) => {
        if (grp.id !== selectedGroupId) return grp;
        return {
          ...grp,
          permissions: grp.permissions.map((p) => {
            if (p.moduleId !== moduleId) return p;
            return {
              ...p,
              [action]: !p[action],
            };
          }),
        };
      })
    );
  };

  // Select all for a module
  const handleToggleModuleAll = (moduleId: string) => {
    setRoleGroups((prev) =>
      prev.map((grp) => {
        if (grp.id !== selectedGroupId) return grp;
        const currentPerm = grp.permissions.find((p) => p.moduleId === moduleId);
        const allActive = currentPerm?.view && currentPerm?.create && currentPerm?.edit && currentPerm?.delete && currentPerm?.approve && currentPerm?.export;

        return {
          ...grp,
          permissions: grp.permissions.map((p) => {
            if (p.moduleId !== moduleId) return p;
            return {
              ...p,
              view: !allActive,
              create: !allActive,
              edit: !allActive,
              delete: !allActive,
              approve: !allActive,
              export: !allActive,
            };
          }),
        };
      })
    );
  };

  const handleSave = () => {
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 3000);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#f8fafc] overflow-y-auto">
      {/* 1. Header Zone */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 shrink-0 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 border border-purple-200/80 flex items-center justify-center shadow-2xs">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-[17px] font-bold text-slate-900 leading-tight">
                VAI TRÒ & PHÂN QUYỀN THEO GROUP (NHÓM QUYỀN)
              </h1>
              <p className="text-[12px] text-slate-500">
                Phân quyền chức năng theo ma trận quyền (Xem, Thêm, Sửa, Xóa, Duyệt, Xuất file) cho từng nhóm đối tượng
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {savedNotification && (
              <span className="text-[12px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 animate-fadeIn">
                <Check className="w-4 h-4 text-emerald-600" /> Đã lưu quyền thành công!
              </span>
            )}
            <button
              onClick={handleSave}
              className="h-[34px] px-4 rounded-xl bg-[#005325] hover:bg-[#00421e] text-white text-[12.5px] font-medium flex items-center gap-2 cursor-pointer shadow-2xs transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Lưu cấu hình phân quyền</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Two-Column Layout */}
      <div className="flex-1 flex flex-col md:flex-row p-4 gap-4 overflow-hidden">
        {/* Left Column: List of Role Groups */}
        <div className="w-full md:w-[320px] bg-white rounded-xl border border-slate-200 flex flex-col shrink-0 shadow-2xs overflow-hidden">
          <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <span className="font-bold text-[13px] text-slate-800 flex items-center gap-2">
              <Users className="w-4 h-4 text-[#005325]" /> Danh sách Group ({roleGroups.length})
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
            {roleGroups.map((group) => {
              const isSelected = group.id === selectedGroupId;
              return (
                <button
                  key={group.id}
                  onClick={() => setSelectedGroupId(group.id)}
                  className={`w-full text-left p-3 rounded-xl transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-purple-50/70 border-purple-300 text-purple-900 shadow-2xs'
                      : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-[13px] truncate">{group.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono">
                      {group.memberCount} thành viên
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-purple-700 mb-1">{group.code}</div>
                  <p className="text-[11.5px] text-slate-500 line-clamp-2 leading-relaxed">
                    {group.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Permission Matrix or Member List */}
        <div className="flex-1 bg-white rounded-xl border border-slate-200 flex flex-col shadow-2xs overflow-hidden">
          {/* Group Header & Tabs */}
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[15px] font-bold text-slate-900">{selectedGroup.name}</span>
                <span className="font-mono text-[11px] bg-purple-100 text-purple-800 px-2 py-0.5 rounded font-medium">
                  {selectedGroup.code}
                </span>
              </div>
              <p className="text-[12px] text-slate-600 mt-0.5">{selectedGroup.description}</p>
            </div>

            <div className="flex items-center gap-1 bg-slate-200/60 p-1 rounded-xl self-start sm:self-auto text-[12px]">
              <button
                onClick={() => setActiveTab('matrix')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                  activeTab === 'matrix' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Ma trận phân quyền
              </button>
              <button
                onClick={() => setActiveTab('members')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                  activeTab === 'members' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Thành viên ({selectedGroup.memberCount})
              </button>
            </div>
          </div>

          {/* Matrix Content */}
          {activeTab === 'matrix' ? (
            <div className="flex-1 overflow-x-auto p-4">
              <table className="w-full border-collapse text-left text-[12.5px] min-w-[700px]">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-semibold border-b border-slate-300 h-[36px]">
                    <th className="px-3 border-r border-slate-200 min-w-[220px]">Phân hệ / Module nghiệp vụ</th>
                    <th className="px-2.5 text-center border-r border-slate-200 w-[80px]">Xem</th>
                    <th className="px-2.5 text-center border-r border-slate-200 w-[80px]">Thêm mới</th>
                    <th className="px-2.5 text-center border-r border-slate-200 w-[80px]">Sửa</th>
                    <th className="px-2.5 text-center border-r border-slate-200 w-[80px]">Xóa</th>
                    <th className="px-2.5 text-center border-r border-slate-200 w-[85px]">Duyệt/Khóa</th>
                    <th className="px-2.5 text-center border-r border-slate-200 w-[85px]">Xuất file</th>
                    <th className="px-2.5 text-center w-[90px]">Tất cả</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200">
                  {selectedGroup.permissions.map((p) => {
                    const isAll = p.view && p.create && p.edit && p.delete && p.approve && p.export;
                    return (
                      <tr key={p.moduleId} className="h-[42px] hover:bg-slate-50 transition-colors">
                        <td className="px-3 font-medium text-slate-800 border-r border-slate-200">
                          {p.moduleName}
                        </td>

                        {/* View */}
                        <td className="px-2.5 text-center border-r border-slate-200">
                          <input
                            type="checkbox"
                            checked={p.view}
                            onChange={() => handleTogglePermission(p.moduleId, 'view')}
                            className="w-4 h-4 rounded text-[#005325] focus:ring-0 cursor-pointer"
                          />
                        </td>

                        {/* Create */}
                        <td className="px-2.5 text-center border-r border-slate-200">
                          <input
                            type="checkbox"
                            checked={p.create}
                            onChange={() => handleTogglePermission(p.moduleId, 'create')}
                            className="w-4 h-4 rounded text-[#005325] focus:ring-0 cursor-pointer"
                          />
                        </td>

                        {/* Edit */}
                        <td className="px-2.5 text-center border-r border-slate-200">
                          <input
                            type="checkbox"
                            checked={p.edit}
                            onChange={() => handleTogglePermission(p.moduleId, 'edit')}
                            className="w-4 h-4 rounded text-[#005325] focus:ring-0 cursor-pointer"
                          />
                        </td>

                        {/* Delete */}
                        <td className="px-2.5 text-center border-r border-slate-200">
                          <input
                            type="checkbox"
                            checked={p.delete}
                            onChange={() => handleTogglePermission(p.moduleId, 'delete')}
                            className="w-4 h-4 rounded text-rose-600 focus:ring-0 cursor-pointer"
                          />
                        </td>

                        {/* Approve */}
                        <td className="px-2.5 text-center border-r border-slate-200">
                          <input
                            type="checkbox"
                            checked={p.approve}
                            onChange={() => handleTogglePermission(p.moduleId, 'approve')}
                            className="w-4 h-4 rounded text-purple-600 focus:ring-0 cursor-pointer"
                          />
                        </td>

                        {/* Export */}
                        <td className="px-2.5 text-center border-r border-slate-200">
                          <input
                            type="checkbox"
                            checked={p.export}
                            onChange={() => handleTogglePermission(p.moduleId, 'export')}
                            className="w-4 h-4 rounded text-blue-600 focus:ring-0 cursor-pointer"
                          />
                        </td>

                        {/* Toggle All */}
                        <td className="px-2.5 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleModuleAll(p.moduleId)}
                            className={`px-2 py-0.5 rounded text-[11px] font-medium cursor-pointer transition-colors ${
                              isAll
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                            }`}
                          >
                            {isAll ? 'Bỏ chọn' : 'Chọn hết'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            /* Members List */
            <div className="p-5 flex-1 overflow-y-auto space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-semibold text-slate-800 text-[13px]">
                  Danh sách thành viên thuộc nhóm {selectedGroup.name}
                </span>
                <button className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium text-[12px] flex items-center gap-1.5 cursor-pointer">
                  <Plus className="w-3.5 h-3.5" /> Thêm thành viên vào nhóm
                </button>
              </div>

              <div className="space-y-2">
                {selectedGroup.members?.map((member, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-200 text-purple-800 font-bold flex items-center justify-center text-[12px]">
                        {member.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-800">{member}</div>
                        <div className="text-[11px] text-slate-500">Trạng thái: Đang hoạt động • Toàn quyền nhóm</div>
                      </div>
                    </div>
                    <button className="text-slate-400 hover:text-rose-600 p-1.5 rounded cursor-pointer">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

