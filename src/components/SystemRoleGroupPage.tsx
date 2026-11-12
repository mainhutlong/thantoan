import React, { useState, useMemo } from 'react';
import {
  Info,
  LayoutGrid,
  Lock,
  Users,
  Plus,
  Search,
  Save,
  GripVertical,
  FileText,
  BookOpen,
  GraduationCap,
  Megaphone,
  FlaskConical,
  UserCheck,
  Briefcase,
  Banknote,
  CreditCard,
  MessageSquare,
  BarChart3,
  ShieldCheck,
  Check,
  Trash2,
  UserPlus,
} from 'lucide-react';
import { RoleGroupPermission } from '../types';

export const INITIAL_ROLE_GROUPS: RoleGroupPermission[] = [];

interface PermissionSubItem {
  id: string;
  label: string;
  enabled: boolean;
}

interface PermissionGroupSection {
  id: string;
  title: string;
  items: PermissionSubItem[];
}

interface ModulePermissionCatalog {
  id: string;
  name: string;
  icon: React.ReactNode;
  sections: PermissionGroupSection[];
}

interface RoleItem {
  id: string;
  name: string;
  code: string;
  dotColor: string;
  badgeBg: string;
  badgeText: string;
  description: string;
  members: { id: string; name: string; code: string; unit: string; email: string }[];
  disabledPermissions: string[];
}

// Danh mục chức năng & quyền hạn chuẩn xác theo 5 phân hệ của Hệ thống Thanh toán Thù lao & Giờ giảng TDU
const MODULE_CATALOG: ModulePermissionCatalog[] = [
  {
    id: 'thanh_toan_gio_giang',
    name: 'Thanh toán giờ giảng',
    icon: <BookOpen className="w-4 h-4" />,
    sections: [
      {
        id: 'sec_gio_giang',
        title: 'Thanh toán giờ giảng (Lý thuyết, Thực hành, Thực tập, Đồ án)',
        items: [
          { id: 'gg_xem_ds', label: 'Thanh toán giờ giảng - Xem danh sách kê khai giờ giảng', enabled: true },
          { id: 'gg_xem_chi_tiet', label: 'Thanh toán giờ giảng - Xem chi tiết bảng kê chuẩn theo giảng viên', enabled: true },
          { id: 'gg_them_moi', label: 'Thanh toán giờ giảng - Thêm mới bản ghi giờ giảng', enabled: true },
          { id: 'gg_tai_mau', label: 'Thanh toán giờ giảng - Tải mẫu trống chuẩn Phòng Đào tạo', enabled: true },
          { id: 'gg_import_excel', label: 'Thanh toán giờ giảng - Nhập liệu từ Excel (Import mới)', enabled: true },
          { id: 'gg_import_bo_sung', label: 'Thanh toán giờ giảng - Nhập bổ sung dữ liệu từ Excel', enabled: true },
          { id: 'gg_sua', label: 'Thanh toán giờ giảng - Chỉnh sửa hệ số lớp, số tiết và giờ quy chuẩn', enabled: true },
          { id: 'gg_xoa', label: 'Thanh toán giờ giảng - Xoá bản ghi kê khai', enabled: true },
          { id: 'gg_export', label: 'Thanh toán giờ giảng - Xuất dữ liệu ra file Excel', enabled: true },
          { id: 'gg_khoa_ky', label: 'Thanh toán giờ giảng - Khóa / Mở khóa kỳ đối soát giờ giảng', enabled: true },
        ],
      },
    ],
  },
  {
    id: 'coi_thi_cham_thi',
    name: 'Coi thi chấm thi ra đề',
    icon: <GraduationCap className="w-4 h-4" />,
    sections: [
      {
        id: 'sec_khao_thi',
        title: 'Coi thi, chấm thi, ra đề kết thúc học phần',
        items: [
          { id: 'kt_xem_ds', label: 'Coi thi chấm thi - Xem danh sách kê khai khảo thí', enabled: true },
          { id: 'kt_xem_chi_tiet', label: 'Coi thi chấm thi - Xem chi tiết công việc khảo thí', enabled: true },
          { id: 'kt_them_moi', label: 'Coi thi chấm thi - Thêm mới công việc ra đề, coi thi, chấm thi', enabled: true },
          { id: 'kt_tai_mau', label: 'Coi thi chấm thi - Tải mẫu trống chuẩn Trung tâm Khảo thí', enabled: true },
          { id: 'kt_import_excel', label: 'Coi thi chấm thi - Nhập liệu từ file Excel Khảo thí', enabled: true },
          { id: 'kt_sua', label: 'Coi thi chấm thi - Chỉnh sửa số lượng đề/bài/ca thi và giờ quy đổi', enabled: true },
          { id: 'kt_xoa', label: 'Coi thi chấm thi - Xoá bản ghi khảo thí', enabled: true },
          { id: 'kt_export', label: 'Coi thi chấm thi - Xuất bảng kê khảo thí ra Excel', enabled: true },
        ],
      },
    ],
  },
  {
    id: 'cong_tac_tuyen_sinh',
    name: 'Công tác tuyển sinh',
    icon: <Megaphone className="w-4 h-4" />,
    sections: [
      {
        id: 'sec_tuyen_sinh',
        title: 'Công tác tuyển sinh & Tư vấn hướng nghiệp',
        items: [
          { id: 'ts_xem_ds', label: 'Công tác tuyển sinh - Xem danh sách kê khai tuyển sinh', enabled: true },
          { id: 'ts_them_moi', label: 'Công tác tuyển sinh - Thêm mới đợt công tác tuyển sinh', enabled: true },
          { id: 'ts_import_excel', label: 'Công tác tuyển sinh - Nhập liệu từ Excel Phòng Tuyển sinh', enabled: true },
          { id: 'ts_sua', label: 'Công tác tuyển sinh - Chỉnh sửa số ngày công tác và tiết quy đổi', enabled: true },
          { id: 'ts_xoa', label: 'Công tác tuyển sinh - Xoá bản ghi tuyển sinh', enabled: true },
          { id: 'ts_export', label: 'Công tác tuyển sinh - Xuất dữ liệu tuyển sinh ra Excel', enabled: true },
        ],
      },
    ],
  },
  {
    id: 'nghien_cuu_khoa_hoc',
    name: 'Nghiên cứu Khoa học',
    icon: <FlaskConical className="w-4 h-4" />,
    sections: [
      {
        id: 'sec_nckh',
        title: 'Nghiên cứu Khoa học (Đề tài, Bài báo, Giáo trình, Hướng dẫn SV)',
        items: [
          { id: 'nckh_xem_ds', label: 'Nghiên cứu Khoa học - Xem danh sách kê khai giờ NCKH', enabled: true },
          { id: 'nckh_xem_bang_ke', label: 'Nghiên cứu Khoa học - Xem chi tiết biểu mẫu thống kê NCKH chuẩn', enabled: true },
          { id: 'nckh_them_moi', label: 'Nghiên cứu Khoa học - Thêm mới công trình / đề tài NCKH', enabled: true },
          { id: 'nckh_import_excel', label: 'Nghiên cứu Khoa học - Nhập liệu từ Excel Phòng QLKH', enabled: true },
          { id: 'nckh_sua', label: 'Nghiên cứu Khoa học - Cập nhật định mức và mức độ hoàn thành NCKH', enabled: true },
          { id: 'nckh_xoa', label: 'Nghiên cứu Khoa học - Xoá bản ghi NCKH', enabled: true },
          { id: 'nckh_export', label: 'Nghiên cứu Khoa học - Xuất bảng thống kê NCKH ra Excel', enabled: true },
        ],
      },
    ],
  },
  {
    id: 'cvht_cong_tac_khac',
    name: 'Cố vấn HT & Công tác khác',
    icon: <Briefcase className="w-4 h-4" />,
    sections: [
      {
        id: 'sec_cvht',
        title: 'Cố vấn học tập (CVHT)',
        items: [
          { id: 'cvht_xem_ds', label: 'Cố vấn học tập - Xem danh sách phân công lớp CVHT', enabled: true },
          { id: 'cvht_nhap_lieu', label: 'Cố vấn học tập - Thêm mới / Import danh sách CVHT', enabled: true },
          { id: 'cvht_sua_xoa', label: 'Cố vấn học tập - Chỉnh sửa và xoá bản ghi CVHT', enabled: true },
        ],
      },
      {
        id: 'sec_cong_tac_khac',
        title: 'Công tác khác (Hội đồng khoa học, Thanh tra, Kiểm định)',
        items: [
          { id: 'ctk_xem_ds', label: 'Công tác khác - Xem danh sách nhiệm vụ công tác khác', enabled: true },
          { id: 'ctk_nhap_lieu', label: 'Công tác khác - Thêm mới / Import nhiệm vụ kiêm nhiệm', enabled: true },
          { id: 'ctk_sua_xoa', label: 'Công tác khác - Chỉnh sửa và xoá bản ghi công tác khác', enabled: true },
        ],
      },
    ],
  },
  {
    id: 'quan_ly_thanh_toan',
    name: 'Quản lý thanh toán',
    icon: <Banknote className="w-4 h-4" />,
    sections: [
      {
        id: 'sec_tong_thanh_toan',
        title: 'Quản lý thanh toán tổng hợp toàn trường (6 nguồn thù lao)',
        items: [
          { id: 'tt_xem_tong_hop', label: 'Quản lý thanh toán - Xem bảng tổng hợp 6 nguồn thù lao toàn trường', enabled: true },
          { id: 'tt_xem_chi_tiet_gv', label: 'Quản lý thanh toán - Xem chi tiết bảng kê từng giảng viên', enabled: true },
          { id: 'tt_kiem_tra_thue', label: 'Quản lý thanh toán - Đối soát thuế TNCN 10% và thực nhận', enabled: true },
          { id: 'tt_chot_so_lieu', label: 'Quản lý thanh toán - Chốt số liệu chuyển Phòng Kế hoạch - Tài chính', enabled: true },
          { id: 'tt_export_tong', label: 'Quản lý thanh toán - Xuất Excel tổng hợp thanh toán toàn trường', enabled: true },
        ],
      },
    ],
  },
  {
    id: 'chi_tra_tai_chinh',
    name: 'Chi trả tài chính',
    icon: <CreditCard className="w-4 h-4" />,
    sections: [
      {
        id: 'sec_chi_tra_unc',
        title: 'Chi trả tài chính & Lệnh Ủy nhiệm chi (UNC)',
        items: [
          { id: 'tc_xem_ds_chi', label: 'Chi trả tài chính - Xem danh sách giảng viên đủ điều kiện chi trả', enabled: true },
          { id: 'tc_lap_lenh_unc', label: 'Chi trả tài chính - Khởi tạo lô thanh toán & Lệnh Ủy nhiệm chi (UNC)', enabled: true },
          { id: 'tc_xac_nhan_da_chi', label: 'Chi trả tài chính - Xác nhận đã giải ngân qua ngân hàng', enabled: true },
          { id: 'tc_xuat_unc_excel', label: 'Chi trả tài chính - Xuất bảng kê chuyển khoản ngân hàng & Thuế TNCN', enabled: true },
        ],
      },
    ],
  },
  {
    id: 'tra_cuu_va_phan_hoi',
    name: 'Tra cứu và phản hồi',
    icon: <MessageSquare className="w-4 h-4" />,
    sections: [
      {
        id: 'sec_gv_tra_cuu',
        title: 'Giảng viên tra cứu & Xác nhận khối lượng cá nhân',
        items: [
          { id: 'tc_gv_xem', label: 'Giảng viên tra cứu - Xem bảng tổng hợp thù lao cá nhân 6 nguồn', enabled: true },
          { id: 'tc_gv_xac_nhan_muc', label: 'Giảng viên tra cứu - Đồng ý xác nhận số liệu từng danh mục', enabled: true },
          { id: 'tc_gv_xac_nhan_all', label: 'Giảng viên tra cứu - Đồng ý xác nhận toàn bộ thù lao học kỳ', enabled: true },
          { id: 'tc_gv_in_phieu', label: 'Giảng viên tra cứu - In phiếu xác nhận thù lao cá nhân', enabled: true },
        ],
      },
      {
        id: 'sec_phan_hoi_gv',
        title: 'Phản hồi của Giảng viên & Giải trình đối soát',
        items: [
          { id: 'ph_gui_moi', label: 'Phản hồi của Giảng viên - Gửi phản hồi / khiếu nại sai lệch số tiết', enabled: true },
          { id: 'ph_xem_ds', label: 'Phản hồi của Giảng viên - Xem danh sách phản hồi toàn trường', enabled: true },
          { id: 'ph_xu_ly_dinh_chinh', label: 'Phản hồi của Giảng viên - Phê duyệt phản hồi & Điều chỉnh nhanh số liệu', enabled: true },
          { id: 'ph_tu_choi', label: 'Phản hồi của Giảng viên - Từ chối phản hồi kèm lý do giải trình', enabled: true },
        ],
      },
    ],
  },
  {
    id: 'bao_cao_bien_ban',
    name: 'Báo cáo & Biên bản',
    icon: <BarChart3 className="w-4 h-4" />,
    sections: [
      {
        id: 'sec_bao_cao_thong_ke',
        title: 'Báo cáo thống kê tổng hợp & Biên bản nghiệm thu số hóa',
        items: [
          { id: 'bc_xem_thong_ke', label: 'Báo cáo thống kê - Xem biểu đồ & báo cáo tổng hợp theo Khoa / Đơn vị', enabled: true },
          { id: 'bc_xuat_phu_luc', label: 'Báo cáo thống kê - Xuất các phụ lục báo cáo tổng hợp ra Excel', enabled: true },
          { id: 'bb_lap_bien_ban', label: 'Biên bản nghiệm thu - Đóng gói dữ liệu và lập biên bản nghiệm thu số hóa', enabled: true },
          { id: 'bb_ky_so_duyet', label: 'Biên bản nghiệm thu - Ký số phê duyệt biên bản nghiệm thu cấp Trường', enabled: true },
          { id: 'bb_in_xuat_pdf', label: 'Biên bản nghiệm thu - In ấn và xuất biên bản nghiệm thu chuẩn TDU', enabled: true },
        ],
      },
    ],
  },
  {
    id: 'quan_ly_nguoi_dung',
    name: 'Người dùng & Nhân sự',
    icon: <UserCheck className="w-4 h-4" />,
    sections: [
      {
        id: 'sec_ho_so_nhan_su',
        title: 'Quản lý Người dùng & Hồ sơ cán bộ giảng viên (20 cột chuẩn file TDU)',
        items: [
          { id: 'nd_xem_ds', label: 'Người dùng - Xem danh sách cán bộ, giảng viên (Học hàm, Học vị, HĐLĐ, Kiêm nhiệm)', enabled: true },
          { id: 'nd_xem_chi_tiet', label: 'Người dùng - Xem chi tiết hồ sơ nhân sự trên giao diện', enabled: true },
          { id: 'nd_them_moi', label: 'Người dùng - Thêm mới hồ sơ cán bộ giảng viên', enabled: true },
          { id: 'nd_chinh_sua', label: 'Người dùng - Chỉnh sửa thông tin học hàm, học vị, chứng chỉ, kiêm nhiệm', enabled: true },
          { id: 'nd_xoa', label: 'Người dùng - Xoá hồ sơ người dùng khỏi hệ thống', enabled: true },
          { id: 'nd_export_excel', label: 'Người dùng - Xuất danh sách nhân sự chuẩn file Excel Đại học Tây Đô', enabled: true },
        ],
      },
    ],
  },
  {
    id: 'quan_tri_he_thong',
    name: 'Cấu hình & Nhật ký HT',
    icon: <ShieldCheck className="w-4 h-4" />,
    sections: [
      {
        id: 'sec_he_thong',
        title: 'Vai trò phân quyền, Cấu hình định mức & Nhật ký hệ thống',
        items: [
          { id: 'ht_vai_tro', label: 'Hệ thống - Quản lý vai trò và phân quyền theo group', enabled: true },
          { id: 'ht_cau_hinh_don_gia', label: 'Hệ thống - Cấu hình đơn giá tiết chuẩn, hệ số học hàm/học vị, hệ số lớp đông', enabled: true },
          { id: 'ht_cau_hinh_dinh_muc', label: 'Hệ thống - Cấu hình định mức giờ chuẩn giảng dạy & định mức NCKH', enabled: true },
          { id: 'ht_nhat_ky', label: 'Hệ thống - Xem và tra cứu Nhật ký hệ thống (Audit Logs)', enabled: true },
          { id: 'ht_xuat_nhat_ky', label: 'Hệ thống - Xuất báo cáo nhật ký truy cập và thao tác dữ liệu', enabled: true },
        ],
      },
    ],
  },
];

// Danh sách Vai trò sát với cơ cấu vận hành thực tế tại Trường Đại học Tây Đô (TDU)
const INITIAL_ROLES: RoleItem[] = [
  {
    id: 'super_admin',
    name: 'Quản trị hệ thống',
    code: 'QUẢN TRỊ HỆ THỐNG (SUPER ADMIN)',
    dotColor: '#2563eb',
    badgeBg: '#f3e8ff',
    badgeText: '#9333ea',
    description: 'Toàn quyền quản trị hệ thống Thanh toán giờ giảng TDU, quản lý người dùng, phân quyền group, cấu hình đơn giá và nhật ký kiểm toán.',
    members: [
      { id: 'm1', name: 'Mai Như Long', code: 'TDU00128', unit: 'Khoa Công nghệ thông tin', email: 'mnlong@tdu.edu.vn' },
      { id: 'm2', name: 'Quản trị viên Hệ thống', code: 'ADMIN01', unit: 'Phòng CNTT', email: 'admin@tdu.edu.vn' },
    ],
    disabledPermissions: [],
  },
  {
    id: 'ban_giam_hieu',
    name: 'Ban Giám hiệu',
    code: 'BAN GIÁM HIỆU (PHÊ DUYỆT)',
    dotColor: '#2563eb',
    badgeBg: '#dcfce7',
    badgeText: '#15803d',
    description: 'Xem toàn bộ báo cáo thống kê tổng hợp, phê duyệt bảng tổng hợp thanh toán toàn trường, ký số biên bản nghiệm thu và khóa kỳ thanh toán.',
    members: [
      { id: 'm3', name: 'GS.TS. Phạm Hoàng Long', code: 'TDU00008', unit: 'Ban Giám hiệu', email: 'phlong@tdu.edu.vn' },
      { id: 'm4', name: 'PGS.TS. Trần Quốc Hùng', code: 'TDU00245', unit: 'Ban Giám hiệu', email: 'tqhung@tdu.edu.vn' },
    ],
    disabledPermissions: [
      'gg_xoa',
      'kt_xoa',
      'ts_xoa',
      'nckh_xoa',
      'nd_xoa',
    ],
  },
  {
    id: 'phong_dao_tao',
    name: 'Phòng Đào tạo',
    code: 'PHÒNG ĐÀO TẠO',
    dotColor: '#2563eb',
    badgeBg: '#e0f2fe',
    badgeText: '#0284c7',
    description: 'Phụ trách nhập liệu, kiểm tra, đối soát danh mục Thanh toán giờ giảng, Cố vấn học tập, xử lý phản hồi giờ giảng và lập biên bản nghiệm thu.',
    members: [
      { id: 'm5', name: 'TS. Nguyễn Văn Hòa', code: 'TDU00312', unit: 'Phòng Đào tạo', email: 'nvhoa@tdu.edu.vn' },
      { id: 'm6', name: 'CN. Trương Minh Tuấn', code: 'TDU00511', unit: 'Phòng Đào tạo', email: 'tmtuan@tdu.edu.vn' },
    ],
    disabledPermissions: [
      'kt_them_moi', 'kt_import_excel', 'kt_sua', 'kt_xoa',
      'ts_them_moi', 'ts_import_excel', 'ts_sua', 'ts_xoa',
      'nckh_them_moi', 'nckh_import_excel', 'nckh_sua', 'nckh_xoa',
      'tc_lap_lenh_unc', 'tc_xac_nhan_da_chi',
      'nd_them_moi', 'nd_chinh_sua', 'nd_xoa',
      'ht_vai_tro', 'ht_cau_hinh_don_gia', 'ht_cau_hinh_dinh_muc',
    ],
  },
  {
    id: 'phong_tai_chinh',
    name: 'Phòng Kế hoạch - Tài chính',
    code: 'PHÒNG KẾ HOẠCH - TÀI CHÍNH',
    dotColor: '#16a34a',
    badgeBg: '#dcfce7',
    badgeText: '#15803d',
    description: 'Quản lý bảng tổng hợp thanh toán toàn trường, kiểm soát khấu trừ thuế TNCN 10%, lập lệnh Ủy nhiệm chi (UNC) và xác nhận giải ngân tài chính.',
    members: [
      { id: 'm7', name: 'ThS. Lê Thị Kim Ngân', code: 'TDU00105', unit: 'Phòng Kế hoạch - Tài chính', email: 'ltkngan@tdu.edu.vn' },
      { id: 'm8', name: 'CN. Phạm Văn Đạt', code: 'TDU00422', unit: 'Phòng Kế hoạch - Tài chính', email: 'pvdat@tdu.edu.vn' },
    ],
    disabledPermissions: [
      'gg_them_moi', 'gg_import_excel', 'gg_import_bo_sung', 'gg_xoa',
      'kt_them_moi', 'kt_import_excel', 'kt_xoa',
      'ts_them_moi', 'ts_import_excel', 'ts_xoa',
      'nckh_them_moi', 'nckh_import_excel', 'nckh_xoa',
      'nd_them_moi', 'nd_chinh_sua', 'nd_xoa',
      'ht_vai_tro',
    ],
  },
  {
    id: 'trung_tam_khao_thi',
    name: 'Trung tâm Khảo thí',
    code: 'TRUNG TÂM KHẢO THÍ & ĐBCL',
    dotColor: '#2563eb',
    badgeBg: '#f3e8ff',
    badgeText: '#7e22ce',
    description: 'Chịu trách nhiệm nhập liệu, rà soát danh mục Coi thi, chấm thi, ra đề kết thúc học phần và giải trình phản hồi khảo thí của giảng viên.',
    members: [
      { id: 'm9', name: 'ThS. Lê Thị Mỹ Hạnh', code: 'TDU00409', unit: 'Trung tâm Khảo thí', email: 'ltmhanh@tdu.edu.vn' },
    ],
    disabledPermissions: [
      'gg_them_moi', 'gg_import_excel', 'gg_import_bo_sung', 'gg_sua', 'gg_xoa', 'gg_khoa_ky',
      'ts_them_moi', 'ts_import_excel', 'ts_sua', 'ts_xoa',
      'nckh_them_moi', 'nckh_import_excel', 'nckh_sua', 'nckh_xoa',
      'tc_lap_lenh_unc', 'tc_xac_nhan_da_chi',
      'nd_them_moi', 'nd_chinh_sua', 'nd_xoa',
      'ht_vai_tro', 'ht_cau_hinh_don_gia', 'ht_cau_hinh_dinh_muc',
    ],
  },
  {
    id: 'phong_nckh',
    name: 'Phòng QLKH & HTQT',
    code: 'PHÒNG QLKH & HỢP TÁC QUỐC TẾ',
    dotColor: '#2563eb',
    badgeBg: '#cffafe',
    badgeText: '#0e7490',
    description: 'Thẩm định và nhập liệu danh mục Nghiên cứu Khoa học (Đề tài, bài báo ISI/Scopus, giáo trình), xét duyệt định mức hoàn thành NCKH.',
    members: [
      { id: 'm10', name: 'PGS.TS. Đinh Văn Khải', code: 'TDU00152', unit: 'Phòng QLKH & HTQT', email: 'dvkhai@tdu.edu.vn' },
    ],
    disabledPermissions: [
      'gg_them_moi', 'gg_import_excel', 'gg_import_bo_sung', 'gg_sua', 'gg_xoa', 'gg_khoa_ky',
      'kt_them_moi', 'kt_import_excel', 'kt_sua', 'kt_xoa',
      'ts_them_moi', 'ts_import_excel', 'ts_sua', 'ts_xoa',
      'tc_lap_lenh_unc', 'tc_xac_nhan_da_chi',
      'nd_them_moi', 'nd_chinh_sua', 'nd_xoa',
      'ht_vai_tro', 'ht_cau_hinh_don_gia', 'ht_cau_hinh_dinh_muc',
    ],
  },
  {
    id: 'phong_tuyen_sinh_ctsv',
    name: 'P. Tuyển sinh & CTSV',
    code: 'PHÒNG TUYỂN SINH & CÔNG TÁC SV',
    dotColor: '#2563eb',
    badgeBg: '#ffedd5',
    badgeText: '#c2410c',
    description: 'Quản lý kê khai giờ chuẩn Công tác tuyển sinh, Tư vấn hướng nghiệp và danh sách phân công Cố vấn học tập các lớp sinh viên.',
    members: [
      { id: 'm11', name: 'ThS. Huỳnh Quốc Bảo', code: 'TDU00377', unit: 'Phòng Tuyển sinh & Truyền thông', email: 'hqbao@tdu.edu.vn' },
    ],
    disabledPermissions: [
      'gg_them_moi', 'gg_import_excel', 'gg_import_bo_sung', 'gg_sua', 'gg_xoa', 'gg_khoa_ky',
      'kt_them_moi', 'kt_import_excel', 'kt_sua', 'kt_xoa',
      'nckh_them_moi', 'nckh_import_excel', 'nckh_sua', 'nckh_xoa',
      'tc_lap_lenh_unc', 'tc_xac_nhan_da_chi',
      'nd_them_moi', 'nd_chinh_sua', 'nd_xoa',
      'ht_vai_tro', 'ht_cau_hinh_don_gia', 'ht_cau_hinh_dinh_muc',
    ],
  },
  {
    id: 'phong_tchc',
    name: 'Phòng Tổ chức - Hành chính',
    code: 'PHÒNG TỔ CHỨC - HÀNH CHÍNH',
    dotColor: '#ec4899',
    badgeBg: '#fce7f3',
    badgeText: '#db2777',
    description: 'Quản lý danh sách Người dùng & Hồ sơ cán bộ giảng viên (20 cột thông tin: học hàm, học vị, hợp đồng lao động, chứng chỉ, kiêm nhiệm).',
    members: [
      { id: 'm12', name: 'ThS. Phan Thanh Thảo', code: 'TDU00055', unit: 'Phòng Tổ chức - Hành chính', email: 'ptthao@tdu.edu.vn' },
    ],
    disabledPermissions: [
      'gg_xoa', 'gg_khoa_ky',
      'kt_xoa',
      'ts_xoa',
      'nckh_xoa',
      'tc_lap_lenh_unc', 'tc_xac_nhan_da_chi',
      'ht_vai_tro',
    ],
  },
  {
    id: 'lanh_dao_khoa',
    name: 'Ban Chủ nhiệm Khoa / BM',
    code: 'BAN CHỦ NHIỆM KHOA / BỘ MÔN',
    dotColor: '#2563eb',
    badgeBg: '#fef3c7',
    badgeText: '#b45309',
    description: 'Trưởng/Phó Khoa và Trưởng Bộ môn rà soát bảng kê giờ giảng, NCKH của giảng viên thuộc Khoa mình quản lý trước khi trình Phòng Đào tạo.',
    members: [
      { id: 'm13', name: 'Mai Như Long', code: 'TDU00128', unit: 'Khoa Công nghệ thông tin', email: 'mnlong@tdu.edu.vn' },
      { id: 'm14', name: 'PGS.TS. Trần Quốc Hùng', code: 'TDU00245', unit: 'Khoa Dược - Điều dưỡng', email: 'tqhung@tdu.edu.vn' },
    ],
    disabledPermissions: [
      'gg_xoa', 'gg_khoa_ky',
      'kt_xoa',
      'ts_xoa',
      'nckh_xoa',
      'tc_lap_lenh_unc', 'tc_xac_nhan_da_chi',
      'nd_them_moi', 'nd_chinh_sua', 'nd_xoa',
      'ht_vai_tro', 'ht_cau_hinh_don_gia', 'ht_cau_hinh_dinh_muc',
    ],
  },
  {
    id: 'giang_vien',
    name: 'Giảng viên',
    code: 'GIẢNG VIÊN (CƠ HỮU & THỈNH GIẢNG)',
    dotColor: '#2563eb',
    badgeBg: '#f1f5f9',
    badgeText: '#334155',
    description: 'Giảng viên tra cứu bảng thống kê 6 khoản thù lao cá nhân, đối soát chi tiết giờ giảng/NCKH, bấm đồng ý xác nhận hoặc gửi phản hồi đính chính.',
    members: [
      { id: 'm15', name: 'TS. Đặng Minh Khôi', code: 'TDU00199', unit: 'Khoa Công nghệ thông tin', email: 'dmkhoi@tdu.edu.vn' },
      { id: 'm16', name: 'ThS. Võ Hoàng Yến', code: 'TDU00288', unit: 'Khoa Kinh tế - Quản trị', email: 'vhyen@tdu.edu.vn' },
    ],
    disabledPermissions: [
      'gg_them_moi', 'gg_import_excel', 'gg_import_bo_sung', 'gg_sua', 'gg_xoa', 'gg_khoa_ky',
      'kt_them_moi', 'kt_import_excel', 'kt_sua', 'kt_xoa',
      'ts_them_moi', 'ts_import_excel', 'ts_sua', 'ts_xoa',
      'nckh_them_moi', 'nckh_import_excel', 'nckh_sua', 'nckh_xoa',
      'cvht_nhap_lieu', 'cvht_sua_xoa', 'ctk_nhap_lieu', 'ctk_sua_xoa',
      'tt_chot_so_lieu', 'tt_export_tong',
      'tc_lap_lenh_unc', 'tc_xac_nhan_da_chi', 'tc_xuat_unc_excel',
      'ph_xu_ly_dinh_chinh', 'ph_tu_choi',
      'bb_lap_bien_ban', 'bb_ky_so_duyet',
      'nd_them_moi', 'nd_chinh_sua', 'nd_xoa', 'nd_export_excel',
      'ht_vai_tro', 'ht_cau_hinh_don_gia', 'ht_cau_hinh_dinh_muc', 'ht_nhat_ky', 'ht_xuat_nhat_ky',
    ],
  },
];

export const SystemRoleGroupPage: React.FC = () => {
  const [roles, setRoles] = useState<RoleItem[]>(INITIAL_ROLES);
  const [selectedRoleId, setSelectedRoleId] = useState<string>('super_admin');
  const [activeTopTab, setActiveTopTab] = useState<'thong_tin' | 'module' | 'quyen_han' | 'thanh_vien'>('quyen_han');
  const [selectedModuleId, setSelectedModuleId] = useState<string>('thanh_toan_gio_giang');
  const [permissionSearch, setPermissionSearch] = useState<string>('');
  const [savedToast, setSavedToast] = useState<boolean>(false);
  const [isAddRoleOpen, setIsAddRoleOpen] = useState<boolean>(false);
  const [newRoleName, setNewRoleName] = useState<string>('');

  const selectedRole = useMemo(
    () => roles.find((r) => r.id === selectedRoleId) || roles[0],
    [roles, selectedRoleId]
  );

  const selectedModule = useMemo(
    () => MODULE_CATALOG.find((m) => m.id === selectedModuleId) || MODULE_CATALOG[0],
    [selectedModuleId]
  );

  // Check if a sub-permission is enabled for the selected role
  const isPermEnabled = (permId: string) => {
    return !selectedRole.disabledPermissions.includes(permId);
  };

  // Toggle single permission
  const handleTogglePerm = (permId: string) => {
    setRoles((prev) =>
      prev.map((role) => {
        if (role.id !== selectedRole.id) return role;
        const exists = role.disabledPermissions.includes(permId);
        return {
          ...role,
          disabledPermissions: exists
            ? role.disabledPermissions.filter((id) => id !== permId)
            : [...role.disabledPermissions, permId],
        };
      })
    );
  };

  // Toggle entire section
  const handleToggleSection = (section: PermissionGroupSection) => {
    const allIds = section.items.map((i) => i.id);
    const allEnabled = allIds.every((id) => isPermEnabled(id));

    setRoles((prev) =>
      prev.map((role) => {
        if (role.id !== selectedRole.id) return role;
        const nextDisabled = new Set(role.disabledPermissions);
        if (allEnabled) {
          allIds.forEach((id) => nextDisabled.add(id));
        } else {
          allIds.forEach((id) => nextDisabled.delete(id));
        }
        return {
          ...role,
          disabledPermissions: Array.from(nextDisabled),
        };
      })
    );
  };

  // Toggle entire module (used in Module tab)
  const handleToggleEntireModule = (mod: ModulePermissionCatalog) => {
    const allIds = mod.sections.flatMap((s) => s.items.map((i) => i.id));
    const allEnabled = allIds.every((id) => isPermEnabled(id));

    setRoles((prev) =>
      prev.map((role) => {
        if (role.id !== selectedRole.id) return role;
        const nextDisabled = new Set(role.disabledPermissions);
        if (allEnabled) {
          allIds.forEach((id) => nextDisabled.add(id));
        } else {
          allIds.forEach((id) => nextDisabled.delete(id));
        }
        return {
          ...role,
          disabledPermissions: Array.from(nextDisabled),
        };
      })
    );
  };

  const handleSave = () => {
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
  };

  const handleAddRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;
    const id = `role_${Date.now()}`;
    const created: RoleItem = {
      id,
      name: newRoleName.trim(),
      code: newRoleName.trim().toUpperCase(),
      dotColor: '#2563eb',
      badgeBg: '#f3e8ff',
      badgeText: '#9333ea',
      description: `Nhóm vai trò ${newRoleName.trim()} trên hệ thống Thanh toán giờ giảng TDU.`,
      members: [],
      disabledPermissions: [],
    };
    setRoles((prev) => [...prev, created]);
    setSelectedRoleId(id);
    setNewRoleName('');
    setIsAddRoleOpen(false);
  };

  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden select-none font-sans">
      {/* Top Title Bar: "Vai trò" */}
      <div className="px-6 py-3.5 border-b border-slate-200 flex items-center justify-between shrink-0 bg-white">
        <h1 className="text-[18px] font-bold text-slate-800 tracking-tight">Vai trò</h1>
        {savedToast && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[12px] font-medium animate-fadeIn">
            <Check className="w-3.5 h-3.5" />
            <span>Đã lưu thay đổi phân quyền!</span>
          </div>
        )}
      </div>

      {/* Main Content Split: Left Role List + Right Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* ============================================================
            LEFT COLUMN: DANH SÁCH VAI TRÒ
            ============================================================ */}
        <div className="w-[240px] border-r border-slate-200 flex flex-col shrink-0 bg-white">
          <div className="px-4 pt-4 pb-2 flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              DANH SÁCH VAI TRÒ
            </span>
            <button
              onClick={() => setIsAddRoleOpen(true)}
              className="w-6 h-6 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 flex items-center justify-center transition-colors cursor-pointer"
              title="Thêm vai trò mới"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-2 py-1 space-y-0.5">
            {roles.map((role) => {
              const isSelected = role.id === selectedRole.id;
              return (
                <button
                  key={role.id}
                  onClick={() => setSelectedRoleId(role.id)}
                  className={`w-full text-left px-2.5 py-2.5 rounded-r-full flex items-center gap-2 transition-all cursor-pointer relative ${
                    isSelected
                      ? 'bg-[#eff6ff] text-[#1d4ed8] font-semibold'
                      : 'text-slate-700 hover:bg-slate-50 font-normal'
                  }`}
                >
                  {/* Left active blue bar indicator */}
                  {isSelected && (
                    <span className="absolute left-0 top-1 bottom-1 w-[3.5px] bg-[#2563eb] rounded-r" />
                  )}

                  {/* Drag handle 6 dots */}
                  <GripVertical className="w-3.5 h-3.5 text-slate-300 shrink-0" />

                  {/* Colored status dot */}
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: role.dotColor }}
                  />

                  {/* Role Name */}
                  <span className="text-[12.5px] truncate">{role.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ============================================================
            RIGHT WORKSPACE: ROLE HEADER + TABS + MODULE & PERMISSIONS
            ============================================================ */}
        <div className="flex-1 flex flex-col overflow-hidden bg-white">
          {/* Role Header & 4 Horizontal Tabs */}
          <div className="px-6 pt-4 border-b border-slate-200 shrink-0 bg-white">
            {/* Role Badge Header */}
            <div className="flex items-center gap-2.5 mb-3">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: selectedRole.badgeBg }}
              >
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: selectedRole.badgeText }}
                />
              </div>
              <span
                className="text-[12.5px] font-bold uppercase tracking-wide"
                style={{ color: selectedRole.badgeText }}
              >
                {selectedRole.code}
              </span>
            </div>

            {/* 4 Tabs: Thông tin | Module | Quyền hạn (Dev) | Thành viên */}
            <div className="flex items-center gap-6 text-[13px]">
              <button
                onClick={() => setActiveTopTab('thong_tin')}
                className={`pb-2.5 flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
                  activeTopTab === 'thong_tin'
                    ? 'border-[#2563eb] text-[#2563eb] font-semibold'
                    : 'border-transparent text-slate-600 hover:text-slate-900 font-normal'
                }`}
              >
                <Info className="w-4 h-4" />
                <span>Thông tin</span>
              </button>

              <button
                onClick={() => setActiveTopTab('module')}
                className={`pb-2.5 flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
                  activeTopTab === 'module'
                    ? 'border-[#2563eb] text-[#2563eb] font-semibold'
                    : 'border-transparent text-slate-600 hover:text-slate-900 font-normal'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
                <span>Module</span>
              </button>

              <button
                onClick={() => setActiveTopTab('quyen_han')}
                className={`pb-2.5 flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
                  activeTopTab === 'quyen_han'
                    ? 'border-[#2563eb] text-[#2563eb] font-semibold'
                    : 'border-transparent text-slate-600 hover:text-slate-900 font-normal'
                }`}
              >
                <Lock className="w-4 h-4" />
                <span>Quyền hạn (Dev)</span>
              </button>

              <button
                onClick={() => setActiveTopTab('thanh_vien')}
                className={`pb-2.5 flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
                  activeTopTab === 'thanh_vien'
                    ? 'border-[#2563eb] text-[#2563eb] font-semibold'
                    : 'border-transparent text-slate-600 hover:text-slate-900 font-normal'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Thành viên</span>
              </button>
            </div>
          </div>

          {/* ============================================================
              TAB 3 (DEFAULT): QUYỀN HẠN (DEV) - MATCHING SCREENSHOT
              ============================================================ */}
          {activeTopTab === 'quyen_han' && (
            <div className="flex-1 flex overflow-hidden">
              {/* Sub-column 1: Module Vertical List */}
              <div className="w-[225px] border-r border-slate-100 py-3 px-2.5 overflow-y-auto space-y-1 shrink-0 bg-white">
                {MODULE_CATALOG.map((mod) => {
                  const isModActive = mod.id === selectedModule.id;
                  return (
                    <button
                      key={mod.id}
                      onClick={() => setSelectedModuleId(mod.id)}
                      className={`w-full text-left px-3 py-2.5 rounded-full flex items-center gap-2.5 text-[12.5px] transition-all cursor-pointer ${
                        isModActive
                          ? 'bg-[#eff6ff] text-[#2563eb] font-medium'
                          : 'text-slate-700 hover:bg-slate-50 font-normal'
                      }`}
                    >
                      <span className={isModActive ? 'text-[#2563eb]' : 'text-slate-400'}>
                        {mod.icon}
                      </span>
                      <span className="truncate">{mod.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Sub-column 2: Permission Toggles Panel */}
              <div className="flex-1 flex flex-col overflow-hidden bg-white">
                {/* Search Bar & Save Changes Button */}
                <div className="px-6 py-3.5 flex items-center justify-between gap-4 shrink-0">
                  <div className="relative w-full max-w-[340px]">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={permissionSearch}
                      onChange={(e) => setPermissionSearch(e.target.value)}
                      placeholder="Tìm kiếm quyền hạn..."
                      className="w-full h-[34px] pl-9 pr-3 rounded-full border border-slate-200 text-[12.5px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-blue-400 bg-white shadow-2xs"
                    />
                  </div>

                  <button
                    onClick={handleSave}
                    className="h-[34px] px-4 rounded-full bg-[#7da2f8] hover:bg-[#5b89f7] text-white text-[12.5px] font-medium flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer shrink-0"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Lưu thay đổi</span>
                  </button>
                </div>

                {/* Scrollable Permission Sections */}
                <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-5">
                  {selectedModule.sections.map((section) => {
                    const filteredItems = section.items.filter((item) =>
                      item.label.toLowerCase().includes(permissionSearch.trim().toLowerCase())
                    );
                    const isSectionAllOn = section.items.every((item) => isPermEnabled(item.id));

                    return (
                      <div
                        key={section.id}
                        className="bg-[#f8fafc] rounded-2xl p-4 border border-slate-100 max-w-[720px]"
                      >
                        {/* Section Header with Master Toggle */}
                        <div className="flex items-center justify-between pb-3 px-1 gap-3">
                          <span className="text-[14px] font-medium text-slate-800">
                            {section.title}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleToggleSection(section)}
                            className={`w-[42px] h-[22px] rounded-full transition-colors p-0.5 cursor-pointer flex items-center shrink-0 ${
                              isSectionAllOn ? 'bg-[#2563eb] justify-end' : 'bg-slate-300 justify-start'
                            }`}
                            title="Bật / tắt toàn bộ nhóm quyền này"
                          >
                            <span className="w-[18px] h-[18px] rounded-full bg-white shadow-2xs block" />
                          </button>
                        </div>

                        {/* Inner White Card with Individual Permission Rows */}
                        <div className="bg-white rounded-xl border border-slate-100 divide-y divide-slate-100 overflow-hidden">
                          {filteredItems.length === 0 ? (
                            <div className="py-6 text-center text-[12.5px] text-slate-400">
                              Không tìm thấy quyền hạn phù hợp.
                            </div>
                          ) : (
                            filteredItems.map((item) => {
                              const enabled = isPermEnabled(item.id);
                              return (
                                <div
                                  key={item.id}
                                  className="px-4 py-3 flex items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors"
                                >
                                  <span className="text-[12.5px] font-semibold text-slate-700">
                                    {item.label}
                                  </span>

                                  <button
                                    type="button"
                                    onClick={() => handleTogglePerm(item.id)}
                                    className={`w-[42px] h-[22px] rounded-full transition-colors p-0.5 cursor-pointer flex items-center shrink-0 ${
                                      enabled ? 'bg-[#2563eb] justify-end' : 'bg-slate-300 justify-start'
                                    }`}
                                  >
                                    <span className="w-[18px] h-[18px] rounded-full bg-white shadow-2xs block" />
                                  </button>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ============================================================
              TAB 1: THÔNG TIN VAI TRÒ
              ============================================================ */}
          {activeTopTab === 'thong_tin' && (
            <div className="p-6 max-w-[680px] space-y-4">
              <div className="bg-[#f8fafc] rounded-2xl p-5 border border-slate-200/80 space-y-4">
                <div>
                  <label className="block text-[12px] text-slate-500 mb-1">Tên vai trò</label>
                  <input
                    type="text"
                    value={selectedRole.name}
                    onChange={(e) => {
                      const val = e.target.value;
                      setRoles((prev) =>
                        prev.map((r) => (r.id === selectedRole.id ? { ...r, name: val } : r))
                      );
                    }}
                    className="w-full h-[36px] px-3 rounded-lg border border-slate-300 bg-white text-[13px] text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[12px] text-slate-500 mb-1">Mã định danh vai trò</label>
                  <input
                    type="text"
                    value={selectedRole.code}
                    onChange={(e) => {
                      const val = e.target.value;
                      setRoles((prev) =>
                        prev.map((r) => (r.id === selectedRole.id ? { ...r, code: val } : r))
                      );
                    }}
                    className="w-full h-[36px] px-3 rounded-lg border border-slate-300 bg-white text-[13px] text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[12px] text-slate-500 mb-1">Mô tả chức năng & phạm vi</label>
                  <textarea
                    rows={3}
                    value={selectedRole.description}
                    onChange={(e) => {
                      const val = e.target.value;
                      setRoles((prev) =>
                        prev.map((r) => (r.id === selectedRole.id ? { ...r, description: val } : r))
                      );
                    }}
                    className="w-full p-3 rounded-lg border border-slate-300 bg-white text-[13px] text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleSave}
                    className="h-[34px] px-4 rounded-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-[12.5px] font-medium flex items-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Lưu thông tin</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================
              TAB 2: MODULE TRUY CẬP
              ============================================================ */}
          {activeTopTab === 'module' && (
            <div className="p-6 flex-1 overflow-y-auto">
              <div className="max-w-[680px] bg-[#f8fafc] rounded-2xl p-4 border border-slate-100">
                <div className="pb-3 px-1 flex items-center justify-between">
                  <span className="text-[14px] font-medium text-slate-800">
                    Danh sách phân hệ (Module) được phép truy cập
                  </span>
                  <button
                    onClick={handleSave}
                    className="h-[32px] px-3.5 rounded-full bg-[#7da2f8] hover:bg-[#5b89f7] text-white text-[12px] font-medium flex items-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Lưu thay đổi</span>
                  </button>
                </div>

                <div className="bg-white rounded-xl border border-slate-100 divide-y divide-slate-100">
                  {MODULE_CATALOG.map((mod) => {
                    const allIds = mod.sections.flatMap((s) => s.items.map((i) => i.id));
                    const enabled = allIds.some((id) => isPermEnabled(id));
                    return (
                      <div
                        key={mod.id}
                        className="px-4 py-3 flex items-center justify-between hover:bg-slate-50/60"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-slate-500">{mod.icon}</span>
                          <span className="text-[13px] font-medium text-slate-700">{mod.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleToggleEntireModule(mod)}
                          className={`w-[42px] h-[22px] rounded-full transition-colors p-0.5 cursor-pointer flex items-center ${
                            enabled ? 'bg-[#2563eb] justify-end' : 'bg-slate-300 justify-start'
                          }`}
                        >
                          <span className="w-[18px] h-[18px] rounded-full bg-white shadow-2xs block" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ============================================================
              TAB 4: THÀNH VIÊN TRONG VAI TRÒ
              ============================================================ */}
          {activeTopTab === 'thanh_vien' && (
            <div className="p-6 flex-1 overflow-y-auto">
              <div className="max-w-[760px] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[13.5px] font-semibold text-slate-700">
                    Thành viên thuộc vai trò {selectedRole.name} ({selectedRole.members.length})
                  </span>
                  <button
                    onClick={() => {
                      const name = prompt('Nhập họ tên cán bộ / giảng viên cần thêm vào vai trò:');
                      if (!name || !name.trim()) return;
                      setRoles((prev) =>
                        prev.map((r) =>
                          r.id === selectedRole.id
                            ? {
                                ...r,
                                members: [
                                  ...r.members,
                                  {
                                    id: `m_${Date.now()}`,
                                    name: name.trim(),
                                    code: `TDU${Math.floor(100 + Math.random() * 899)}`,
                                    unit: 'Trường Đại học Tây Đô',
                                    email: 'cb@tdu.edu.vn',
                                  },
                                ],
                              }
                            : r
                        )
                      );
                    }}
                    className="h-[32px] px-3.5 rounded-full bg-blue-50 hover:bg-blue-100 text-[#2563eb] text-[12px] font-medium flex items-center gap-1.5 cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Thêm thành viên</span>
                  </button>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
                  {selectedRole.members.length === 0 ? (
                    <div className="py-8 text-center text-[12.5px] text-slate-400">
                      Chưa có thành viên nào trong vai trò này.
                    </div>
                  ) : (
                    selectedRole.members.map((mem) => (
                      <div
                        key={mem.id}
                        className="px-4 py-3 flex items-center justify-between hover:bg-slate-50"
                      >
                        <div>
                          <div className="text-[13px] font-medium text-slate-800">
                            {mem.name}{' '}
                            <span className="text-slate-400 text-[12px]">({mem.code})</span>
                          </div>
                          <div className="text-[11.5px] text-slate-500">
                            {mem.unit} • {mem.email}
                          </div>
                        </div>
                        <button
                          onClick={() =>
                            setRoles((prev) =>
                              prev.map((r) =>
                                r.id === selectedRole.id
                                  ? {
                                      ...r,
                                      members: r.members.filter((m) => m.id !== mem.id),
                                    }
                                  : r
                              )
                            )
                          }
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer"
                          title="Xóa khỏi vai trò"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Role Inline Modal */}
      {isAddRoleOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <form
            onSubmit={handleAddRole}
            className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-[400px] p-5 space-y-4"
          >
            <h3 className="text-[15px] font-bold text-slate-800">Thêm vai trò mới</h3>
            <div>
              <label className="block text-[12px] text-slate-500 mb-1">Tên vai trò</label>
              <input
                type="text"
                required
                autoFocus
                placeholder="VD: Kiểm toán nội bộ..."
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                className="w-full h-[36px] px-3 rounded-lg border border-slate-300 text-[13px] focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddRoleOpen(false)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-[12.5px] cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-[#2563eb] text-white text-[12.5px] font-medium cursor-pointer"
              >
                Tạo vai trò
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
