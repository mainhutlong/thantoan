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
  Check,
  Trash2,
  UserPlus,
} from 'lucide-react';
import { RoleGroupPermission } from '../types';
import {
  IconGiangDay,
  IconNghienCuuKH,
  IconNgoaiGio,
  IconThanhToanGroup,
  IconTraCuuGroup,
  IconBaoCaoGroup,
  IconHeThong,
} from './Sidebar3DIcons';

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

// Danh mục chức năng & quyền hạn chuẩn xác theo 7 phân hệ module của Hệ thống Thanh toán Thù lao & Giờ giảng TDU
const MODULE_CATALOG: ModulePermissionCatalog[] = [
  {
    id: 'thanh_toan_gio_giang',
    name: 'Thanh toán giờ giảng',
    icon: <IconGiangDay size={18} />,
    sections: [
      {
        id: 'sec_gio_giang_ke_khai',
        title: 'Kê khai & Quản lý dữ liệu giờ giảng (Lý thuyết & Thực hành)',
        items: [
          { id: 'gg_xem_ds', label: 'Thanh toán giờ giảng - Xem danh sách kê khai giờ giảng toàn trường', enabled: true },
          { id: 'gg_xem_chi_tiet', label: 'Thanh toán giờ giảng - Xem chi tiết bảng kê giờ giảng chuẩn theo giảng viên', enabled: true },
          { id: 'gg_them_moi', label: 'Thanh toán giờ giảng - Thêm mới bản ghi giờ giảng', enabled: true },
          { id: 'gg_tai_mau', label: 'Thanh toán giờ giảng - Tải file mẫu trống Excel chuẩn Phòng Đào tạo', enabled: true },
          { id: 'gg_import_excel', label: 'Thanh toán giờ giảng - Nhập dữ liệu từ file Excel (Import mới)', enabled: true },
          { id: 'gg_import_bo_sung', label: 'Thanh toán giờ giảng - Nhập bổ sung dữ liệu từ Excel', enabled: true },
          { id: 'gg_sua', label: 'Thanh toán giờ giảng - Chỉnh sửa hệ số lớp, số tiết, giờ quy chuẩn và thù lao', enabled: true },
          { id: 'gg_xoa', label: 'Thanh toán giờ giảng - Xóa bản ghi giờ giảng', enabled: true },
          { id: 'gg_export', label: 'Thanh toán giờ giảng - Xuất dữ liệu bảng kê ra Excel', enabled: true },
          { id: 'gg_khoa_ky', label: 'Thanh toán giờ giảng - Khóa / Mở khóa kỳ đối soát giờ giảng', enabled: true },
          { id: 'gg_duyet_dinh_chinh', label: 'Thanh toán giờ giảng - Phê duyệt đề xuất điều chỉnh & Cập nhật Version mới', enabled: true },
        ],
      },
    ],
  },
  {
    id: 'nghien_cuu_khoa_hoc',
    name: 'Nghiên cứu khoa học',
    icon: <IconNghienCuuKH size={18} />,
    sections: [
      {
        id: 'sec_nckh_bai_bao',
        title: '1. Bài báo khoa học (ISI/Scopus, Tạp chí chuyên ngành, Kỷ yếu)',
        items: [
          { id: 'nckh_bb_xem_ds', label: 'Bài báo - Xem danh sách bài báo khoa học', enabled: true },
          { id: 'nckh_bb_xem_chi_tiet', label: 'Bài báo - Xem chi tiết bài báo & danh sách đồng tác giả', enabled: true },
          { id: 'nckh_bb_them_moi', label: 'Bài báo - Thêm mới bài báo khoa học', enabled: true },
          { id: 'nckh_bb_import_excel', label: 'Bài báo - Nhập danh sách bài báo từ file Excel', enabled: true },
          { id: 'nckh_bb_sua', label: 'Bài báo - Chỉnh sửa thông tin bài báo, xếp loại & số giờ QC', enabled: true },
          { id: 'nckh_bb_xoa', label: 'Bài báo - Xóa bài báo khoa học', enabled: true },
          { id: 'nckh_bb_export', label: 'Bài báo - Xuất danh sách bài báo ra Excel', enabled: true },
        ],
      },
      {
        id: 'sec_nckh_seminar',
        title: '2. Seminar học thuật (Hội thảo khoa học, Tọa đàm, Báo cáo chuyên đề)',
        items: [
          { id: 'nckh_sm_xem_ds', label: 'Seminar - Xem danh sách báo cáo seminar học thuật', enabled: true },
          { id: 'nckh_sm_xem_chi_tiet', label: 'Seminar - Xem chi tiết chuyên đề seminar & đơn vị tổ chức', enabled: true },
          { id: 'nckh_sm_them_moi', label: 'Seminar - Thêm mới buổi báo cáo seminar', enabled: true },
          { id: 'nckh_sm_import_excel', label: 'Seminar - Nhập danh sách seminar từ file Excel', enabled: true },
          { id: 'nckh_sm_sua', label: 'Seminar - Chỉnh sửa nội dung, số giờ và thù lao seminar', enabled: true },
          { id: 'nckh_sm_xoa', label: 'Seminar - Xóa bản ghi seminar', enabled: true },
          { id: 'nckh_sm_export', label: 'Seminar - Xuất danh sách seminar ra Excel', enabled: true },
        ],
      },
      {
        id: 'sec_nckh_de_tai',
        title: '3. Nghiên cứu khoa học & Giáo trình (Đề tài các cấp, Luận văn, Sách)',
        items: [
          { id: 'nckh_dt_xem_ds', label: 'Đề tài NCKH - Xem danh sách đề tài NCKH, luận văn, giáo trình', enabled: true },
          { id: 'nckh_dt_xem_bang_ke', label: 'Đề tài NCKH - Xem chi tiết biểu mẫu thống kê NCKH chuẩn', enabled: true },
          { id: 'nckh_dt_them_moi', label: 'Đề tài NCKH - Thêm mới đề tài NCKH / biên soạn giáo trình', enabled: true },
          { id: 'nckh_dt_import_excel', label: 'Đề tài NCKH - Nhập liệu đề tài NCKH từ file Excel', enabled: true },
          { id: 'nckh_dt_sua', label: 'Đề tài NCKH - Cập nhật tiến độ nghiệm thu, định mức và giờ QC', enabled: true },
          { id: 'nckh_dt_xoa', label: 'Đề tài NCKH - Xóa bản ghi đề tài NCKH', enabled: true },
          { id: 'nckh_dt_export', label: 'Đề tài NCKH - Xuất biểu mẫu thống kê NCKH ra Excel', enabled: true },
        ],
      },
    ],
  },
  {
    id: 'cong_tac_khac',
    name: 'Công tác khác',
    icon: <IconNgoaiGio size={18} />,
    sections: [
      {
        id: 'sec_ctk_khao_thi',
        title: 'Coi thi, chấm thi, ra đề kết thúc học phần (TT Khảo thí)',
        items: [
          { id: 'kt_xem_ds', label: 'Khảo thí - Xem danh sách kê khai coi thi, chấm thi, ra đề', enabled: true },
          { id: 'kt_xem_chi_tiet', label: 'Khảo thí - Xem chi tiết công việc khảo thí của giảng viên', enabled: true },
          { id: 'kt_them_moi', label: 'Khảo thí - Thêm mới nhiệm vụ ra đề, coi thi, chấm thi', enabled: true },
          { id: 'kt_tai_mau', label: 'Khảo thí - Tải mẫu trống Excel Trung tâm Khảo thí', enabled: true },
          { id: 'kt_import_excel', label: 'Khảo thí - Nhập liệu từ file Excel Khảo thí', enabled: true },
          { id: 'kt_sua', label: 'Khảo thí - Chỉnh sửa số lượng bài/đề/ca thi và giờ quy đổi', enabled: true },
          { id: 'kt_xoa', label: 'Khảo thí - Xóa bản ghi khảo thí', enabled: true },
          { id: 'kt_export', label: 'Khảo thí - Xuất dữ liệu khảo thí ra Excel', enabled: true },
        ],
      },
      {
        id: 'sec_ctk_tuyen_sinh',
        title: 'Công tác tuyển sinh & Tư vấn hướng nghiệp (P. Tuyển sinh & TT)',
        items: [
          { id: 'ts_xem_ds', label: 'Tuyển sinh - Xem danh sách kê khai công tác tuyển sinh', enabled: true },
          { id: 'ts_them_moi', label: 'Tuyển sinh - Thêm mới đợt công tác tuyển sinh, tư vấn', enabled: true },
          { id: 'ts_import_excel', label: 'Tuyển sinh - Nhập liệu từ Excel Phòng Tuyển sinh', enabled: true },
          { id: 'ts_sua', label: 'Tuyển sinh - Chỉnh sửa số ngày công tác và tiết quy đổi', enabled: true },
          { id: 'ts_xoa', label: 'Tuyển sinh - Xóa bản ghi tuyển sinh', enabled: true },
          { id: 'ts_export', label: 'Tuyển sinh - Xuất dữ liệu tuyển sinh ra Excel', enabled: true },
        ],
      },
      {
        id: 'sec_ctk_cvht',
        title: 'Cố vấn học tập (P. CTSV & Đào tạo)',
        items: [
          { id: 'cvht_xem_ds', label: 'Cố vấn học tập - Xem danh sách phân công cố vấn học tập', enabled: true },
          { id: 'cvht_nhap_lieu', label: 'Cố vấn học tập - Thêm mới / Import danh sách CVHT từ Excel', enabled: true },
          { id: 'cvht_sua_xoa', label: 'Cố vấn học tập - Chỉnh sửa lớp phụ trách và số tiết quy chuẩn', enabled: true },
          { id: 'cvht_export', label: 'Cố vấn học tập - Xuất danh sách CVHT ra Excel', enabled: true },
        ],
      },
      {
        id: 'sec_ctk_chuyen_mon',
        title: 'Nhiệm vụ chuyên môn khác (HĐKH, Thanh tra, Kiểm định, Kiêm nhiệm - 40+ mục)',
        items: [
          { id: 'ctk_xem_ds', label: 'Công tác khác - Xem danh mục nhiệm vụ kiêm nhiệm, thanh tra, hội đồng', enabled: true },
          { id: 'ctk_nhap_lieu', label: 'Công tác khác - Thêm mới / Import nhiệm vụ chuyên môn từ Excel', enabled: true },
          { id: 'ctk_sua', label: 'Công tác khác - Chỉnh sửa nội dung, số giờ và thù lao nhiệm vụ', enabled: true },
          { id: 'ctk_xoa', label: 'Công tác khác - Xóa bản ghi công tác khác', enabled: true },
          { id: 'ctk_export', label: 'Công tác khác - Xuất bảng kê công tác khác ra Excel', enabled: true },
        ],
      },
    ],
  },
  {
    id: 'thanh_toan',
    name: 'Thanh toán',
    icon: <IconThanhToanGroup size={18} />,
    sections: [
      {
        id: 'sec_tt_quan_ly',
        title: 'Quản lý thanh toán tổng hợp toàn trường (Giờ giảng, NCKH, Công tác khác)',
        items: [
          { id: 'tt_xem_tong_hop', label: 'Quản lý thanh toán - Xem bảng tổng hợp thanh toán toàn trường', enabled: true },
          { id: 'tt_xem_chi_tiet_gv', label: 'Quản lý thanh toán - Xem chi tiết bảng kê 3 nguồn của từng giảng viên', enabled: true },
          { id: 'tt_kiem_tra_thue', label: 'Quản lý thanh toán - Đối soát khấu trừ thuế TNCN 10% và thực nhận', enabled: true },
          { id: 'tt_chot_so_lieu', label: 'Quản lý thanh toán - Chốt số liệu chuyển Phòng Kế hoạch - Tài chính', enabled: true },
          { id: 'tt_export_tong', label: 'Quản lý thanh toán - Xuất file Excel tổng hợp thanh toán toàn trường', enabled: true },
        ],
      },
      {
        id: 'sec_tt_chi_tra',
        title: 'Chi trả tài chính & Lệnh Ủy nhiệm chi (UNC)',
        items: [
          { id: 'tc_xem_ds_chi', label: 'Chi trả tài chính - Xem danh sách giảng viên đủ điều kiện chi trả', enabled: true },
          { id: 'tc_lap_lenh_unc', label: 'Chi trả tài chính - Khởi tạo lô thanh toán & Lập lệnh Ủy nhiệm chi (UNC)', enabled: true },
          { id: 'tc_xac_nhan_da_chi', label: 'Chi trả tài chính - Xác nhận đã giải ngân qua ngân hàng', enabled: true },
          { id: 'tc_xuat_unc_excel', label: 'Chi trả tài chính - Xuất bảng kê chuyển khoản ngân hàng & Thuế TNCN', enabled: true },
        ],
      },
    ],
  },
  {
    id: 'tra_cuu_phan_hoi',
    name: 'Tra cứu phản hồi',
    icon: <IconTraCuuGroup size={18} />,
    sections: [
      {
        id: 'sec_tc_gv',
        title: 'Giảng viên tra cứu & Xác nhận khối lượng cá nhân (3 tab: Giờ giảng, NCKH, Công tác khác)',
        items: [
          { id: 'tc_gv_xem', label: 'Giảng viên tra cứu - Xem bảng thống kê thù lao cá nhân 3 tab', enabled: true },
          { id: 'tc_gv_xac_nhan_muc', label: 'Giảng viên tra cứu - Đồng ý xác nhận số liệu từng tab cụ thể', enabled: true },
          { id: 'tc_gv_xac_nhan_all', label: 'Giảng viên tra cứu - Đồng ý xác nhận toàn bộ (3/3 mục) thù lao học kỳ', enabled: true },
          { id: 'tc_gv_in_phieu', label: 'Giảng viên tra cứu - In phiếu xác nhận thù lao cá nhân', enabled: true },
        ],
      },
      {
        id: 'sec_ph_gv',
        title: 'Phản hồi của Giảng viên & Giải trình đối soát',
        items: [
          { id: 'ph_gui_moi', label: 'Phản hồi - Giảng viên gửi phản hồi / khiếu nại sai lệch số liệu', enabled: true },
          { id: 'ph_xem_ds', label: 'Phản hồi - Xem danh sách phản hồi toàn trường', enabled: true },
          { id: 'ph_xu_ly_dinh_chinh', label: 'Phản hồi - Phê duyệt phản hồi & Đề xuất điều chỉnh số liệu (Cập nhật Version)', enabled: true },
          { id: 'ph_tu_choi', label: 'Phản hồi - Từ chối phản hồi kèm lý do giải trình', enabled: true },
        ],
      },
    ],
  },
  {
    id: 'bao_cao',
    name: 'Báo cáo',
    icon: <IconBaoCaoGroup size={18} />,
    sections: [
      {
        id: 'sec_bc_thong_ke',
        title: 'Báo cáo thống kê tổng hợp',
        items: [
          { id: 'bc_xem_thong_ke', label: 'Báo cáo thống kê - Xem biểu đồ & báo cáo tổng hợp theo Khoa / Viện / Đơn vị', enabled: true },
          { id: 'bc_xem_so_sanh', label: 'Báo cáo thống kê - Xem báo cáo phân tích và so sánh các kỳ thanh toán', enabled: true },
          { id: 'bc_xuat_phu_luc', label: 'Báo cáo thống kê - Xuất các biểu mẫu phụ lục báo cáo ra file Excel', enabled: true },
        ],
      },
      {
        id: 'sec_bb_nghiem_thu',
        title: 'Biên bản nghiệm thu số hóa',
        items: [
          { id: 'bb_lap_bien_ban', label: 'Biên bản nghiệm thu - Khởi tạo và đóng gói dữ liệu nghiệm thu số hóa', enabled: true },
          { id: 'bb_ky_so_duyet', label: 'Biên bản nghiệm thu - Ký số phê duyệt biên bản nghiệm thu cấp Trường', enabled: true },
          { id: 'bb_in_xuat_pdf', label: 'Biên bản nghiệm thu - In ấn và xuất biên bản nghiệm thu chuẩn TDU (PDF/Excel)', enabled: true },
        ],
      },
    ],
  },
  {
    id: 'he_thong',
    name: 'Hệ thống',
    icon: <IconHeThong size={18} />,
    sections: [
      {
        id: 'sec_ht_nguoi_dung',
        title: 'Người dùng & Hồ sơ cán bộ giảng viên (20 cột chuẩn TDU)',
        items: [
          { id: 'nd_xem_ds', label: 'Người dùng - Xem danh sách cán bộ giảng viên (Học hàm, Học vị, HĐLĐ, Kiêm nhiệm)', enabled: true },
          { id: 'nd_xem_chi_tiet', label: 'Người dùng - Xem chi tiết hồ sơ nhân sự trên giao diện', enabled: true },
          { id: 'nd_them_moi', label: 'Người dùng - Thêm mới hồ sơ cán bộ giảng viên', enabled: true },
          { id: 'nd_chinh_sua', label: 'Người dùng - Chỉnh sửa thông tin học hàm, học vị, chứng chỉ, kiêm nhiệm', enabled: true },
          { id: 'nd_xoa', label: 'Người dùng - Xóa hồ sơ cán bộ giảng viên khỏi hệ thống', enabled: true },
          { id: 'nd_export_excel', label: 'Người dùng - Xuất danh sách nhân sự ra file Excel', enabled: true },
        ],
      },
      {
        id: 'sec_ht_phan_quyen',
        title: 'Vai trò & Phân quyền theo group',
        items: [
          { id: 'ht_vai_tro_xem', label: 'Vai trò phân quyền - Xem danh sách vai trò hệ thống', enabled: true },
          { id: 'ht_vai_tro_them_sua', label: 'Vai trò phân quyền - Thêm mới, chỉnh sửa thông tin vai trò', enabled: true },
          { id: 'ht_phan_quyen_toggle', label: 'Vai trò phân quyền - Bật / tắt phân quyền theo từng module & chức năng', enabled: true },
          { id: 'ht_phan_cong_thanh_vien', label: 'Vai trò phân quyền - Thêm / xóa cán bộ giảng viên vào nhóm vai trò', enabled: true },
        ],
      },
      {
        id: 'sec_ht_cau_hinh',
        title: 'Cấu hình hệ thống & Định mức',
        items: [
          { id: 'ht_cau_hinh_don_gia', label: 'Hệ thống - Cấu hình đơn giá tiết chuẩn, hệ số học hàm/học vị, hệ số lớp đông', enabled: true },
          { id: 'ht_cau_hinh_dinh_muc', label: 'Hệ thống - Cấu hình định mức giờ chuẩn giảng dạy & định mức NCKH', enabled: true },
        ],
      },
      {
        id: 'sec_ht_nhat_ky',
        title: 'Nhật ký hệ thống (Audit Logs)',
        items: [
          { id: 'ht_nhat_ky_xem', label: 'Nhật ký hệ thống - Xem và tra cứu lịch sử truy cập & thao tác dữ liệu', enabled: true },
          { id: 'ht_nhat_ky_xuat', label: 'Nhật ký hệ thống - Xuất báo cáo nhật ký truy cập ra Excel', enabled: true },
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
      'nckh_bb_xoa',
      'nckh_sm_xoa',
      'nckh_dt_xoa',
      'kt_xoa',
      'ts_xoa',
      'ctk_xoa',
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
    description: 'Phụ trách nhập liệu, kiểm tra, đối soát danh mục Thanh toán giờ giảng, Cố vấn học tập, phê duyệt phản hồi giờ giảng và lập biên bản nghiệm thu.',
    members: [
      { id: 'm5', name: 'TS. Nguyễn Văn Hòa', code: 'TDU00312', unit: 'Phòng Đào tạo', email: 'nvhoa@tdu.edu.vn' },
      { id: 'm6', name: 'CN. Trương Minh Tuấn', code: 'TDU00511', unit: 'Phòng Đào tạo', email: 'tmtuan@tdu.edu.vn' },
    ],
    disabledPermissions: [
      'nckh_bb_them_moi', 'nckh_bb_import_excel', 'nckh_bb_sua', 'nckh_bb_xoa',
      'nckh_sm_them_moi', 'nckh_sm_import_excel', 'nckh_sm_sua', 'nckh_sm_xoa',
      'nckh_dt_them_moi', 'nckh_dt_import_excel', 'nckh_dt_sua', 'nckh_dt_xoa',
      'kt_them_moi', 'kt_import_excel', 'kt_sua', 'kt_xoa',
      'ts_them_moi', 'ts_import_excel', 'ts_sua', 'ts_xoa',
      'tc_lap_lenh_unc', 'tc_xac_nhan_da_chi',
      'nd_them_moi', 'nd_chinh_sua', 'nd_xoa',
      'ht_vai_tro_them_sua', 'ht_phan_quyen_toggle', 'ht_phan_cong_thanh_vien', 'ht_cau_hinh_don_gia', 'ht_cau_hinh_dinh_muc',
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
      'nckh_bb_them_moi', 'nckh_bb_import_excel', 'nckh_bb_xoa',
      'nckh_sm_them_moi', 'nckh_sm_import_excel', 'nckh_sm_xoa',
      'nckh_dt_them_moi', 'nckh_dt_import_excel', 'nckh_dt_xoa',
      'kt_them_moi', 'kt_import_excel', 'kt_xoa',
      'ts_them_moi', 'ts_import_excel', 'ts_xoa',
      'ctk_nhap_lieu', 'ctk_xoa',
      'nd_them_moi', 'nd_chinh_sua', 'nd_xoa',
      'ht_vai_tro_them_sua', 'ht_phan_quyen_toggle', 'ht_phan_cong_thanh_vien',
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
      'nckh_bb_them_moi', 'nckh_bb_import_excel', 'nckh_bb_sua', 'nckh_bb_xoa',
      'nckh_sm_them_moi', 'nckh_sm_import_excel', 'nckh_sm_sua', 'nckh_sm_xoa',
      'nckh_dt_them_moi', 'nckh_dt_import_excel', 'nckh_dt_sua', 'nckh_dt_xoa',
      'ts_them_moi', 'ts_import_excel', 'ts_sua', 'ts_xoa',
      'tc_lap_lenh_unc', 'tc_xac_nhan_da_chi',
      'nd_them_moi', 'nd_chinh_sua', 'nd_xoa',
      'ht_vai_tro_them_sua', 'ht_phan_quyen_toggle', 'ht_phan_cong_thanh_vien', 'ht_cau_hinh_don_gia', 'ht_cau_hinh_dinh_muc',
    ],
  },
  {
    id: 'phong_nckh',
    name: 'Phòng QLKH & HTQT',
    code: 'PHÒNG QLKH & HỢP TÁC QUỐC TẾ',
    dotColor: '#2563eb',
    badgeBg: '#cffafe',
    badgeText: '#0e7490',
    description: 'Thẩm định và nhập liệu danh mục Nghiên cứu Khoa học (3 tab: Bài báo khoa học, Seminar học thuật, Đề tài NCKH), xét duyệt định mức hoàn thành NCKH.',
    members: [
      { id: 'm10', name: 'PGS.TS. Đinh Văn Khải', code: 'TDU00152', unit: 'Phòng QLKH & HTQT', email: 'dvkhai@tdu.edu.vn' },
    ],
    disabledPermissions: [
      'gg_them_moi', 'gg_import_excel', 'gg_import_bo_sung', 'gg_sua', 'gg_xoa', 'gg_khoa_ky',
      'kt_them_moi', 'kt_import_excel', 'kt_sua', 'kt_xoa',
      'ts_them_moi', 'ts_import_excel', 'ts_sua', 'ts_xoa',
      'tc_lap_lenh_unc', 'tc_xac_nhan_da_chi',
      'nd_them_moi', 'nd_chinh_sua', 'nd_xoa',
      'ht_vai_tro_them_sua', 'ht_phan_quyen_toggle', 'ht_phan_cong_thanh_vien', 'ht_cau_hinh_don_gia', 'ht_cau_hinh_dinh_muc',
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
      'nckh_bb_them_moi', 'nckh_bb_import_excel', 'nckh_bb_sua', 'nckh_bb_xoa',
      'nckh_sm_them_moi', 'nckh_sm_import_excel', 'nckh_sm_sua', 'nckh_sm_xoa',
      'nckh_dt_them_moi', 'nckh_dt_import_excel', 'nckh_dt_sua', 'nckh_dt_xoa',
      'kt_them_moi', 'kt_import_excel', 'kt_sua', 'kt_xoa',
      'tc_lap_lenh_unc', 'tc_xac_nhan_da_chi',
      'nd_them_moi', 'nd_chinh_sua', 'nd_xoa',
      'ht_vai_tro_them_sua', 'ht_phan_quyen_toggle', 'ht_phan_cong_thanh_vien', 'ht_cau_hinh_don_gia', 'ht_cau_hinh_dinh_muc',
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
      'nckh_bb_xoa', 'nckh_sm_xoa', 'nckh_dt_xoa',
      'kt_xoa',
      'ts_xoa',
      'ctk_xoa',
      'tc_lap_lenh_unc', 'tc_xac_nhan_da_chi',
      'ht_vai_tro_them_sua', 'ht_phan_quyen_toggle', 'ht_phan_cong_thanh_vien',
    ],
  },
  {
    id: 'lanh_dao_khoa',
    name: 'Ban Chủ nhiệm Khoa / BM',
    code: 'BAN CHỦ NHIỆM KHOA / BỘ MÔN',
    dotColor: '#2563eb',
    badgeBg: '#fef3c7',
    badgeText: '#b45309',
    description: 'Trưởng/Phó Khoa và Trưởng Bộ môn rà soát bảng kê giờ giảng, NCKH, công tác khác của giảng viên thuộc Khoa mình quản lý trước khi trình Nhà trường.',
    members: [
      { id: 'm13', name: 'Mai Như Long', code: 'TDU00128', unit: 'Khoa Công nghệ thông tin', email: 'mnlong@tdu.edu.vn' },
      { id: 'm14', name: 'PGS.TS. Trần Quốc Hùng', code: 'TDU00245', unit: 'Khoa Dược - Điều dưỡng', email: 'tqhung@tdu.edu.vn' },
    ],
    disabledPermissions: [
      'gg_xoa', 'gg_khoa_ky',
      'nckh_bb_xoa', 'nckh_sm_xoa', 'nckh_dt_xoa',
      'kt_xoa',
      'ts_xoa',
      'ctk_xoa',
      'tc_lap_lenh_unc', 'tc_xac_nhan_da_chi',
      'nd_them_moi', 'nd_chinh_sua', 'nd_xoa',
      'ht_vai_tro_them_sua', 'ht_phan_quyen_toggle', 'ht_phan_cong_thanh_vien', 'ht_cau_hinh_don_gia', 'ht_cau_hinh_dinh_muc',
    ],
  },
  {
    id: 'giang_vien',
    name: 'Giảng viên',
    code: 'GIẢNG VIÊN (CƠ HỮU & THỈNH GIẢNG)',
    dotColor: '#2563eb',
    badgeBg: '#f1f5f9',
    badgeText: '#334155',
    description: 'Giảng viên tra cứu bảng thống kê thù lao 3 tab cá nhân (Giờ giảng, NCKH, Công tác khác), đối soát chi tiết, bấm xác nhận (3/3 mục) hoặc gửi phản hồi đính chính.',
    members: [
      { id: 'm15', name: 'TS. Đặng Minh Khôi', code: 'TDU00199', unit: 'Khoa Công nghệ thông tin', email: 'dmkhoi@tdu.edu.vn' },
      { id: 'm16', name: 'ThS. Võ Hoàng Yến', code: 'TDU00288', unit: 'Khoa Kinh tế - Quản trị', email: 'vhyen@tdu.edu.vn' },
    ],
    disabledPermissions: [
      'gg_them_moi', 'gg_import_excel', 'gg_import_bo_sung', 'gg_sua', 'gg_xoa', 'gg_khoa_ky', 'gg_duyet_dinh_chinh',
      'nckh_bb_them_moi', 'nckh_bb_import_excel', 'nckh_bb_sua', 'nckh_bb_xoa',
      'nckh_sm_them_moi', 'nckh_sm_import_excel', 'nckh_sm_sua', 'nckh_sm_xoa',
      'nckh_dt_them_moi', 'nckh_dt_import_excel', 'nckh_dt_sua', 'nckh_dt_xoa',
      'kt_them_moi', 'kt_import_excel', 'kt_sua', 'kt_xoa',
      'ts_them_moi', 'ts_import_excel', 'ts_sua', 'ts_xoa',
      'cvht_nhap_lieu', 'cvht_sua_xoa',
      'ctk_nhap_lieu', 'ctk_sua', 'ctk_xoa',
      'tt_chot_so_lieu', 'tt_export_tong',
      'tc_lap_lenh_unc', 'tc_xac_nhan_da_chi', 'tc_xuat_unc_excel',
      'ph_xu_ly_dinh_chinh', 'ph_tu_choi',
      'bb_lap_bien_ban', 'bb_ky_so_duyet',
      'nd_them_moi', 'nd_chinh_sua', 'nd_xoa', 'nd_export_excel',
      'ht_vai_tro_them_sua', 'ht_phan_quyen_toggle', 'ht_phan_cong_thanh_vien',
      'ht_cau_hinh_don_gia', 'ht_cau_hinh_dinh_muc', 'ht_nhat_ky_xem', 'ht_nhat_ky_xuat',
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
        <div className="flex items-center gap-3">
          <h1 className="text-[18px] font-bold text-slate-800 tracking-tight">Vai trò & Phân quyền hệ thống</h1>
          <span className="text-[11.5px] bg-blue-50 text-blue-700 font-medium px-2.5 py-0.5 rounded-full border border-blue-200">
            7 phân hệ module chuẩn
          </span>
        </div>
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
                <span>Phân quyền chi tiết</span>
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
              <div className="w-[240px] border-r border-slate-100 py-3 px-2.5 overflow-y-auto space-y-1 shrink-0 bg-white">
                {MODULE_CATALOG.map((mod) => {
                  const isModActive = mod.id === selectedModule.id;
                  return (
                    <button
                      key={mod.id}
                      onClick={() => setSelectedModuleId(mod.id)}
                      className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-2.5 text-[12.5px] transition-all cursor-pointer ${
                        isModActive
                          ? 'bg-[#eff6ff] text-[#2563eb] font-semibold shadow-2xs'
                          : 'text-slate-700 hover:bg-slate-50 font-normal'
                      }`}
                    >
                      <span className="shrink-0 flex items-center justify-center">
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
