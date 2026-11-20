import React, { useState, useMemo, useEffect } from 'react';
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
  X,
  Building2,
  Upload,
  Download,
  Palette,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { createStyledWorksheet, saveWorkbookToFile, TemplateColumn } from '../utils/excelTemplateGenerator';
import { RoleGroupPermission } from '../types';
import { FULL_PERSONNEL_245 } from '../data/fullPersonnel245';
import { useConfirmDelete } from '../context/ConfirmDialogContext';
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

const ALL_PERMISSION_IDS = MODULE_CATALOG.flatMap((m) =>
  m.sections.flatMap((s) => s.items.map((i) => i.id))
);

// Danh sách cấu hình các vai trò chuẩn hệ thống TDU:
// 1. Quản trị viên hệ thống (nằm ở trên cùng, chứa mnlong)
// 2. Hội đồng cố vấn
// 3. Hội đồng trường
// 4. Ban Giám hiệu
// 5. Phòng Quản lý Đào tạo (nằm ngay dưới Ban Giám hiệu)
// 6. Phòng Quản lý khoa học và Hợp tác quốc tế
// 7. Giảng viên (chứa chung toàn bộ cán bộ có chức vụ Giảng viên)
// 8. Phòng Tài chính - Kế hoạch và các Khoa, Phòng ban, Trung tâm tiếp theo
export const SYSTEM_ROLES_CONFIG = [
  {
    id: 'quan_tri_vien_he_thong',
    name: 'Quản trị viên hệ thống',
    code: 'QUAN_TRI_VIEN_HE_THONG',
    color: '#dc2626',
    desc: 'Quản trị viên hệ thống (Toàn quyền): Toàn quyền truy cập, cấu hình và quản trị mọi phân hệ trên hệ thống.',
  },
  {
    id: 'hoi_dong_co_van',
    name: 'Hội đồng cố vấn',
    code: 'HOI_DONG_CO_VAN',
    color: '#64748b',
    desc: 'Hội đồng Cố vấn cấp cao của Trường Đại học Tây Đô.',
  },
  {
    id: 'hoi_dong_truong',
    name: 'Hội đồng trường',
    code: 'HOI_DONG_TRUONG',
    color: '#6366f1',
    desc: 'Hội đồng Trường Đại học Tây Đô.',
  },
  {
    id: 'ban_giam_hieu',
    name: 'Ban Giám hiệu',
    code: 'BAN_GIAM_HIEU',
    color: '#9333ea',
    desc: 'Ban Giám hiệu Trường Đại học Tây Đô - Phê duyệt tổng hợp và chỉ đạo vận hành.',
  },
  {
    id: 'phong_quan_ly_dao_tao',
    name: 'Phòng Quản lý Đào tạo',
    code: 'PHONG_QUAN_LY_DAO_TAO',
    color: '#2563eb',
    desc: 'Phòng Quản lý Đào tạo: Thấy được menu Thanh toán giờ giảng (toàn quyền) và Phản hồi của giảng viên.',
  },
  {
    id: 'phong_qlkh_htqt',
    name: 'Phòng Quản lý khoa học và Hợp tác quốc tế',
    code: 'PHONG_QLKH_HTQT',
    color: '#0891b2',
    desc: 'Phòng Quản lý khoa học và Hợp tác quốc tế: Thấy được menu Nghiên cứu khoa học (toàn quyền) và Phản hồi của giảng viên.',
  },
  {
    id: 'giang_vien',
    name: 'Giảng viên',
    code: 'GIANG_VIEN',
    color: '#0284c7',
    desc: 'Giảng viên: Tra cứu giờ giảng dạy, nghiên cứu khoa học, xem chi tiết thù lao cá nhân và gửi phản hồi xác nhận.',
  },
  {
    id: 'phong_tai_chinh_ke_hoach',
    name: 'Phòng Tài chính - Kế hoạch',
    code: 'PHONG_TAI_CHINH_KE_HOACH',
    color: '#16a34a',
    desc: 'Phòng Tài chính - Kế hoạch: Xem được toàn bộ số liệu thống kê, tổng hợp thanh toán và chi trả tài chính UNC (ngoại trừ menu Hệ thống).',
  },
  {
    id: 'khoa_co_ban',
    name: 'Khoa cơ bản',
    code: 'KHOA_CO_BAN',
    color: '#0284c7',
    desc: 'Khoa Cơ bản - Giảng viên tra cứu thù lao giảng dạy, NCKH cá nhân và gửi phản hồi.',
  },
  {
    id: 'khoa_luat',
    name: 'Khoa Luật',
    code: 'KHOA_LUAT',
    color: '#0284c7',
    desc: 'Khoa Luật - Giảng viên tra cứu thù lao giảng dạy, NCKH cá nhân và gửi phản hồi.',
  },
  {
    id: 'ban_phap_che_kiem_tra',
    name: 'Ban Pháp chế - Kiểm tra',
    code: 'BAN_PHAP_CHE_KIEM_TRA',
    color: '#64748b',
    desc: 'Ban Pháp chế - Kiểm tra.',
  },
  {
    id: 'tap_chi_nckh_ptkt',
    name: 'Tạp chí NCKH&PTKT',
    code: 'TAP_CHI_NCKH_PTKT',
    color: '#0d9488',
    desc: 'Tạp chí Nghiên cứu Khoa học & Phát triển Kinh tế.',
  },
  {
    id: 'khoa_duoc_dieu_duong',
    name: 'Khoa Dược - Điều dưỡng',
    code: 'KHOA_DUOC_DIEU_DUONG',
    color: '#0284c7',
    desc: 'Khoa Dược - Điều dưỡng - Giảng viên tra cứu thù lao giảng dạy, NCKH cá nhân và gửi phản hồi.',
  },
  {
    id: 'khoa_ke_toan_tai_chinh_ngan_hang',
    name: 'Khoa Kế toán - Tài chính - Ngân hàng',
    code: 'KHOA_KT_TC_NH',
    color: '#0284c7',
    desc: 'Khoa Kế toán - Tài chính - Ngân hàng - Giảng viên tra cứu thù lao cá nhân và gửi phản hồi.',
  },
  {
    id: 'khoa_quan_tri_kinh_doanh_du_lich',
    name: 'Khoa Quản trị kinh doanh - Du lịch',
    code: 'KHOA_QTKD_DU_LICH',
    color: '#0284c7',
    desc: 'Khoa Quản trị kinh doanh - Du lịch - Giảng viên tra cứu thù lao cá nhân và gửi phản hồi.',
  },
  {
    id: 'khoa_ky_thuat_cong_nghe',
    name: 'Khoa Kỹ thuật - Công nghệ',
    code: 'KHOA_KY_THUAT_CONG_NGHE',
    color: '#0284c7',
    desc: 'Khoa Kỹ thuật - Công nghệ - Giảng viên tra cứu thù lao cá nhân và gửi phản hồi.',
  },
  {
    id: 'khoa_ngoai_ngu_xhnv_tt',
    name: 'Khoa Ngoại ngữ - Xã hội nhân văn và Truyền thông',
    code: 'KHOA_NN_XHNV_TT',
    color: '#0284c7',
    desc: 'Khoa Ngoại ngữ - Xã hội nhân văn và Truyền thông - Giảng viên tra cứu thù lao cá nhân và gửi phản hồi.',
  },
  {
    id: 'khoa_sinh_hoc_ung_dung',
    name: 'Khoa Sinh học ứng dụng',
    code: 'KHOA_SINH_HOC_UNG_DUNG',
    color: '#0284c7',
    desc: 'Khoa Sinh học ứng dụng - Giảng viên tra cứu thù lao cá nhân và gửi phản hồi.',
  },
  {
    id: 'phong_to_chuc_hanh_chinh',
    name: 'Phòng Tổ chức - Hành chính',
    code: 'PHONG_TO_CHUC_HANH_CHINH',
    color: '#ec4899',
    desc: 'Phòng Tổ chức - Hành chính - Quản lý nhân sự, hồ sơ cán bộ giảng viên.',
  },
  {
    id: 'phong_cong_nghe_thong_tin',
    name: 'Phòng Công nghệ thông tin',
    code: 'PHONG_CONG_NGHE_THONG_TIN',
    color: '#dc2626',
    desc: 'Phòng Công nghệ thông tin - Quản trị kỹ thuật hạ tầng hệ thống.',
  },
  {
    id: 'phong_quan_tri_thiet_bi',
    name: 'Phòng Quản trị thiết bị',
    code: 'PHONG_QUAN_TRI_THIET_BI',
    color: '#64748b',
    desc: 'Phòng Quản trị thiết bị.',
  },
  {
    id: 'phong_ctct_qlsv',
    name: 'Phòng Công tác chính trị - Quản lý sinh viên',
    code: 'PHONG_CTCT_QLSV',
    color: '#f97316',
    desc: 'Phòng Công tác chính trị - Quản lý sinh viên.',
  },
  {
    id: 'phong_tuyen_sinh_truyen_thong',
    name: 'Phòng Tuyển sinh và Truyền thông',
    code: 'PHONG_TUYEN_SINH_TRUYEN_THONG',
    color: '#ea580c',
    desc: 'Phòng Tuyển sinh và Truyền thông.',
  },
  {
    id: 'tt_kiem_tra_dbclgd',
    name: 'Trung tâm Kiểm tra và Đảm bảo chất lượng giáo dục',
    code: 'TT_KT_DBCLGD',
    color: '#7c3aed',
    desc: 'Trung tâm Kiểm tra và Đảm bảo chất lượng giáo dục.',
  },
  {
    id: 'tt_ngoai_ngu_tin_hoc',
    name: 'Trung tâm Ngoại ngữ - Tin học',
    code: 'TT_NGOAI_NGU_TIN_HOC',
    color: '#0284c7',
    desc: 'Trung tâm Ngoại ngữ - Tin học.',
  },
  {
    id: 'tt_khoi_nghiep_doi_moi_sang_tao',
    name: 'Trung tâm Khởi nghiệp Đổi mới sáng tạo Hỗ trợ sinh viên và Hợp tác doanh nghiệp',
    code: 'TT_KHOI_NGHIEP_DOANH_NGHIEP',
    color: '#d97706',
    desc: 'Trung tâm Khởi nghiệp Đổi mới sáng tạo Hỗ trợ sinh viên và Hợp tác doanh nghiệp.',
  },
  {
    id: 'thu_vien',
    name: 'Thư viện',
    code: 'THU_VIEN',
    color: '#64748b',
    desc: 'Thư viện Trường Đại học Tây Đô.',
  },
  {
    id: 'van_phong_dang',
    name: 'Văn phòng Đảng',
    code: 'VAN_PHONG_DANG',
    color: '#dc2626',
    desc: 'Văn phòng Đảng ủy Trường Đại học Tây Đô.',
  },
];

export const buildInitialRoles = (): RoleItem[] => {
  const membersMap: Record<string, { id: string; name: string; code: string; unit: string; email: string }[]> = {};
  for (const cfg of SYSTEM_ROLES_CONFIG) {
    membersMap[cfg.id] = [];
  }

  // 1. Quản trị viên hệ thống: Thêm tài khoản mnlong, lvlinh và cvdanh
  const adminStaffs = FULL_PERSONNEL_245.filter(
    (p) =>
      p.email?.toLowerCase().trim() === 'mnlong@tdu.edu.vn' ||
      p.hoTen.toLowerCase().includes('mai nhựt long') ||
      p.email?.toLowerCase().trim() === 'lvlinh@tdu.edu.vn' ||
      p.hoTen.toLowerCase().includes('lê vũ linh') ||
      p.email?.toLowerCase().trim() === 'cvdanh@tdu.edu.vn' ||
      p.hoTen.toLowerCase().includes('cao văn danh') ||
      p.maNhanSu === '01067017'
  );
  for (const staff of adminStaffs) {
    membersMap['quan_tri_vien_he_thong'].push({
      id: `u-${staff.stt}`,
      name: staff.hoTen,
      code: staff.maNhanSu,
      unit: staff.donVi,
      email: staff.email || '',
    });
  }

  // 2. Giảng viên: Cho toàn bộ người dùng có chức vụ là Giảng viên vào chung 1 vai trò
  for (const p of FULL_PERSONNEL_245) {
    const cv = (p.chucVu || '').toLowerCase().trim();
    if (cv.includes('giảng viên')) {
      membersMap['giang_vien'].push({
        id: `u-${p.stt}`,
        name: p.hoTen,
        code: p.maNhanSu,
        unit: p.donVi,
        email: p.email || '',
      });
    }
  }

  // 3. Phân bổ cán bộ vào từng vai trò đơn vị
  for (const p of FULL_PERSONNEL_245) {
    const rawDonVi = (p.donVi || '').replace(/\r?\n/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();
    const item = {
      id: `u-${p.stt}`,
      name: p.hoTen,
      code: p.maNhanSu,
      unit: p.donVi,
      email: p.email || '',
    };

    let matchedKey: string | null = null;
    for (const cfg of SYSTEM_ROLES_CONFIG) {
      if (cfg.id === 'quan_tri_vien_he_thong' || cfg.id === 'giang_vien') continue;
      const cfgName = cfg.name.replace(/\s+/g, ' ').toLowerCase();
      if (rawDonVi === cfgName || rawDonVi.includes(cfgName) || cfgName.includes(rawDonVi)) {
        matchedKey = cfg.id;
        break;
      }
    }

    if (matchedKey && membersMap[matchedKey]) {
      membersMap[matchedKey].push(item);
    } else {
      membersMap['khoa_co_ban']?.push(item);
    }
  }

  // 4. Bổ sung các thành viên được thêm tùy biến lưu trong localStorage
  try {
    const customRoleMembers = JSON.parse(localStorage.getItem('tdu_custom_role_members') || '{}');
    for (const [rId, list] of Object.entries(customRoleMembers)) {
      if (Array.isArray(list) && membersMap[rId]) {
        const existingCodes = new Set(membersMap[rId].map((m) => m.code?.toLowerCase()));
        for (const item of list as any[]) {
          if (item && item.code && !existingCodes.has(item.code.toLowerCase())) {
            membersMap[rId].push(item);
          }
        }
      }
    }
  } catch {}

  return SYSTEM_ROLES_CONFIG.map((cfg) => {
    let disabled: string[] = [];

    if (cfg.id === 'quan_tri_vien_he_thong' || cfg.id === 'phong_cong_nghe_thong_tin') {
      disabled = [];
    } else if (cfg.id === 'phong_quan_ly_dao_tao') {
      disabled = ALL_PERMISSION_IDS.filter(
        (id) => !id.startsWith('gg_') && id !== 'ph_xem_ds' && id !== 'ph_xu_ly_dinh_chinh' && id !== 'ph_tu_choi'
      );
    } else if (cfg.id === 'phong_qlkh_htqt') {
      disabled = ALL_PERMISSION_IDS.filter(
        (id) => !id.startsWith('nckh_') && id !== 'ph_xem_ds' && id !== 'ph_xu_ly_dinh_chinh' && id !== 'ph_tu_choi'
      );
    } else if (cfg.id === 'giang_vien') {
      disabled = ALL_PERMISSION_IDS.filter((id) => !id.startsWith('tc_gv_') && id !== 'ph_gui_moi');
    } else if (cfg.id === 'phong_tai_chinh_ke_hoach') {
      disabled = ALL_PERMISSION_IDS.filter((id) => id.startsWith('nd_') || id.startsWith('ht_'));
    } else if (cfg.name.toLowerCase().startsWith('khoa')) {
      disabled = ALL_PERMISSION_IDS.filter((id) => !id.startsWith('tc_gv_') && id !== 'ph_gui_moi');
    } else {
      disabled = [...ALL_PERMISSION_IDS];
    }

    return {
      id: cfg.id,
      name: cfg.name,
      code: cfg.code,
      dotColor: cfg.color,
      badgeBg: '#eff6ff',
      badgeText: cfg.color,
      description: cfg.desc,
      members: membersMap[cfg.id] || [],
      disabledPermissions: disabled,
    };
  });
};

const INITIAL_ROLES: RoleItem[] = buildInitialRoles();

export interface StaffCandidate {
  id: string;
  name: string;
  code: string;
  unit: string;
  email: string;
  chucVu?: string;
}

const DEFAULT_STAFF_CANDIDATES: StaffCandidate[] = FULL_PERSONNEL_245.map((p) => ({
  id: `staff-${p.stt}`,
  name: p.hoTen,
  code: p.maNhanSu,
  unit: p.donVi,
  email: p.email || '',
  chucVu: p.chucVu,
}));

export const SystemRoleGroupPage: React.FC = () => {
  const { confirmDelete } = useConfirmDelete();
  const [roles, setRoles] = useState<RoleItem[]>(() => {
    try {
      const cached = localStorage.getItem('tdu_roles_state_v3');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Chuẩn hóa và bảo đảm mọi RoleItem luôn có đầy đủ các thuộc tính bắt buộc
          return INITIAL_ROLES.map((initRole) => {
            const found = parsed.find(
              (p: any) =>
                p.code?.toLowerCase() === initRole.code?.toLowerCase() ||
                p.id === initRole.id ||
                String(p.id) === String(initRole.id) ||
                p.name?.toLowerCase() === initRole.name?.toLowerCase()
            );
            if (!found) return initRole;
            return {
              ...initRole,
              ...found,
              id: initRole.id, // Giữ ID chuẩn (quan_tri_vien_he_thong,...)
              dotColor: found.dotColor || initRole.dotColor || '#2563eb',
              badgeBg: found.badgeBg || initRole.badgeBg || '#eff6ff',
              badgeText: found.badgeText || initRole.badgeText || '#2563eb',
              members: Array.isArray(found.members) ? found.members : initRole.members || [],
              disabledPermissions: Array.isArray(found.disabledPermissions)
                ? found.disabledPermissions
                : initRole.disabledPermissions || [],
            };
          });
        }
      }
    } catch {}
    return INITIAL_ROLES;
  });

  // Fetch danh sách vai trò và thành viên thực tế từ CSDL MySQL qua API
  useEffect(() => {
    fetch('/api/roles')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.success && Array.isArray(data.data) && data.data.length > 0) {
          setRoles((prev) => {
            const merged = prev.map((r) => {
              const fromApi = data.data.find(
                (d: any) =>
                  d.code?.toLowerCase() === r.code?.toLowerCase() ||
                  d.name?.toLowerCase() === r.name?.toLowerCase() ||
                  String(d.id) === String(r.id)
              );
              if (fromApi && Array.isArray(fromApi.members)) {
                // Hợp nhất thành viên từ API với thành viên hiện tại (tránh ghi đè mất thành viên)
                const apiCodes = new Set(fromApi.members.map((m: any) => m.code?.toLowerCase()));
                const localExtra = (r.members || []).filter((m) => !apiCodes.has(m.code?.toLowerCase()));
                return {
                  ...r,
                  members: [...fromApi.members, ...localExtra],
                  disabledPermissions: Array.isArray(r.disabledPermissions) ? r.disabledPermissions : [],
                };
              }
              return {
                ...r,
                members: Array.isArray(r.members) ? r.members : [],
                disabledPermissions: Array.isArray(r.disabledPermissions) ? r.disabledPermissions : [],
              };
            });
            try {
              localStorage.setItem('tdu_roles_state_v3', JSON.stringify(merged));
            } catch {}
            return merged;
          });
        }
      })
      .catch((err) => {
        console.warn('Could not fetch /api/roles, using local roles state', err);
      });
  }, []);
  const [selectedRoleId, setSelectedRoleId] = useState<string>('quan_tri_vien_he_thong');
  const [roleSearchQuery, setRoleSearchQuery] = useState<string>('');
  const [activeTopTab, setActiveTopTab] = useState<'thong_tin' | 'module' | 'quyen_han' | 'thanh_vien'>('quyen_han');
  const [selectedModuleId, setSelectedModuleId] = useState<string>('thanh_toan_gio_giang');
  const [permissionSearch, setPermissionSearch] = useState<string>('');
  const [moduleSearch, setModuleSearch] = useState<string>('');
  const [roleMemberSearch, setRoleMemberSearch] = useState<string>('');
  const [savedToast, setSavedToast] = useState<boolean>(false);
  const [isAddRoleOpen, setIsAddRoleOpen] = useState<boolean>(false);
  const [newRoleName, setNewRoleName] = useState<string>('');

  // State cho Modal Import vai trò từ Excel
  const [isImportRoleModalOpen, setIsImportRoleModalOpen] = useState<boolean>(false);
  const [importRoleFile, setImportRoleFile] = useState<File | null>(null);
  const [parsedImportRoles, setParsedImportRoles] = useState<any[]>([]);
  const [importRoleError, setImportRoleError] = useState<string | null>(null);
  const [isProcessingRoleFile, setIsProcessingRoleFile] = useState<boolean>(false);

  // State cho Popup Modal thêm thành viên vào vai trò
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState<boolean>(false);
  const [memberUnitFilter, setMemberUnitFilter] = useState<string>('ALL');
  const [memberSearchQuery, setMemberSearchQuery] = useState<string>('');
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<string[]>([]);

  const selectedRole = useMemo(
    () => roles.find((r) => r.id === selectedRoleId) || roles[0] || INITIAL_ROLES[0],
    [roles, selectedRoleId]
  );

  const selectedModule = useMemo(
    () => MODULE_CATALOG.find((m) => m.id === selectedModuleId) || MODULE_CATALOG[0],
    [selectedModuleId]
  );

  // Danh sách thành viên trong vai trò được lọc theo ô tìm kiếm
  const filteredRoleMembers = useMemo(() => {
    const members = Array.isArray(selectedRole?.members) ? selectedRole.members : [];
    if (!roleMemberSearch.trim()) return members;
    const q = roleMemberSearch.toLowerCase().trim();
    return members.filter(
      (m) =>
        (m.name && m.name.toLowerCase().includes(q)) ||
        (m.code && m.code.toLowerCase().includes(q)) ||
        (m.email && m.email.toLowerCase().includes(q)) ||
        (m.unit && m.unit.toLowerCase().includes(q))
    );
  }, [selectedRole?.members, roleMemberSearch]);

  // Danh sách module được lọc theo ô tìm kiếm
  const filteredModuleCatalog = useMemo(() => {
    if (!moduleSearch.trim()) return MODULE_CATALOG;
    const q = moduleSearch.toLowerCase().trim();
    return MODULE_CATALOG.filter((m) => m.name.toLowerCase().includes(q));
  }, [moduleSearch]);

  // Check if a sub-permission is enabled for the selected role
  const isPermEnabled = (permId: string) => {
    if (!selectedRole || !Array.isArray(selectedRole.disabledPermissions)) return true;
    return !selectedRole.disabledPermissions.includes(permId);
  };

  // Toggle single permission
  const handleTogglePerm = (permId: string) => {
    setRoles((prev) =>
      prev.map((role) => {
        if (role.id !== selectedRole.id) return role;
        const curDisabled = Array.isArray(role.disabledPermissions) ? role.disabledPermissions : [];
        const exists = curDisabled.includes(permId);
        return {
          ...role,
          disabledPermissions: exists
            ? curDisabled.filter((id) => id !== permId)
            : [...curDisabled, permId],
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
        const curDisabled = Array.isArray(role.disabledPermissions) ? role.disabledPermissions : [];
        const nextDisabled = new Set(curDisabled);
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
        const curDisabled = Array.isArray(role.disabledPermissions) ? role.disabledPermissions : [];
        const nextDisabled = new Set(curDisabled);
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

  // 1. Lưu thay đổi phân quyền vào CSDL MySQL (bảng vai_tro_quyen)
  const handleSavePermissions = async () => {
    const curDisabled = Array.isArray(selectedRole.disabledPermissions) ? selectedRole.disabledPermissions : [];
    const enabledPermissions = ALL_PERMISSION_IDS.filter(
      (id) => !curDisabled.includes(id)
    );

    try {
      await fetch(`/api/roles/${selectedRole.id}/permissions`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabledPermissions }),
      });
    } catch (err) {
      console.warn('Could not save permissions to MySQL:', err);
    }

    try {
      await fetch(`/api/roles/${selectedRole.id}/permissions`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabledPermissions }),
      });
    } catch (err) {
      console.warn('Could not save permissions to MySQL:', err);
    }

    try {
      localStorage.setItem('tdu_roles_state_v3', JSON.stringify(roles));
    } catch {}

    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
  };

  // Alias tương thích cho các chỗ gọi handleSave
  const handleSave = handleSavePermissions;

  // 2. Thêm vai trò mới (lưu vào MySQL bảng vai_tro)
  const handleAddRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;

    const cleanCode = newRoleName
      .trim()
      .toUpperCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/Đ/g, 'D')
      .replace(/[^A-Z0-9]/g, '_')
      .replace(/_+/g, '_');

    let createdId = `role_${Date.now()}`;

    try {
      const res = await fetch('/api/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newRoleName.trim(),
          code: cleanCode,
          description: `Nhóm vai trò ${newRoleName.trim()} trên hệ thống Thanh toán giờ giảng TDU.`,
          dotColor: '#2563eb',
        }),
      });
      const data = await res.json();
      if (data && data.success && data.id) {
        createdId = String(data.id);
      }
    } catch (err) {
      console.warn('Lỗi tạo vai trò trong MySQL:', err);
    }

    const created: RoleItem = {
      id: createdId,
      name: newRoleName.trim(),
      code: cleanCode,
      dotColor: '#2563eb',
      badgeBg: '#eff6ff',
      badgeText: '#2563eb',
      description: `Nhóm vai trò ${newRoleName.trim()} trên hệ thống Thanh toán giờ giảng TDU.`,
      members: [],
      disabledPermissions: [],
    };

    setRoles((prev) => {
      const next = [...prev, created];
      try {
        localStorage.setItem('tdu_roles_state_v3', JSON.stringify(next));
      } catch {}
      return next;
    });

    setSelectedRoleId(createdId);
    setNewRoleName('');
    setIsAddRoleOpen(false);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
  };

  // 3. Cập nhật thông tin vai trò (Tên, Mã, Mô tả, Màu sắc) vào MySQL
  const handleSaveRoleInfo = async () => {
    try {
      await fetch(`/api/roles/${selectedRole.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: selectedRole.name,
          code: selectedRole.code,
          description: selectedRole.description,
          dotColor: selectedRole.dotColor,
        }),
      });
    } catch (err) {
      console.warn('Lỗi cập nhật vai trò vào MySQL:', err);
    }

    try {
      localStorage.setItem('tdu_roles_state_v3', JSON.stringify(roles));
    } catch {}

    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
  };

  // 4. Xóa vai trò khỏi CSDL MySQL
  const handleDeleteRole = async (roleId: string) => {
    if (roleId === 'quan_tri_vien_he_thong' || selectedRole.code === 'QUAN_TRI_VIEN_HE_THONG') {
      alert('Không thể xóa vai trò Quản trị viên hệ thống!');
      return;
    }

    const ok = await confirmDelete({
      title: 'Xác nhận xóa vai trò hệ thống',
      targetName: selectedRole.name,
      targetType: selectedRole.code,
      message: `Bạn có chắc chắn muốn xóa vai trò "${selectedRole.name}" không?`,
      dangerNotice: 'Thao tác này sẽ xóa vai trò cùng toàn bộ liên kết phân quyền và thành viên trong CSDL MySQL.',
      confirmText: 'Xóa vai trò',
    });

    if (!ok) {
      return;
    }

    try {
      await fetch(`/api/roles/${roleId}`, {
        method: 'DELETE',
      });
    } catch (err) {
      console.warn('Lỗi xóa vai trò khỏi MySQL:', err);
    }

    const nextRoles = roles.filter((r) => r.id !== roleId);
    setRoles(nextRoles);
    setSelectedRoleId('quan_tri_vien_he_thong');
    try {
      localStorage.setItem('tdu_roles_state_v3', JSON.stringify(nextRoles));
    } catch {}

    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2000);
  };

  // 5. Tải file mẫu Import vai trò chuẩn hóa
  const handleDownloadRoleTemplate = () => {
    const columns: TemplateColumn[] = [
      { header: 'STT', key: 'stt', width: 6, align: 'center' },
      { header: 'Tên vai trò (*)', key: 'ten_vai_tro', width: 28, isYellow: true, align: 'left' },
      { header: 'Mã vai trò (*)', key: 'ma_vai_tro', width: 22, isYellow: true, align: 'center' },
      { header: 'Mô tả vai trò', key: 'mo_ta', width: 45, align: 'left' },
      { header: 'Màu sắc (Mã Hex)', key: 'mau_sac', width: 18, align: 'center' },
    ];

    const sampleRows = [
      [1, 'Ban Đảm bảo chất lượng', 'BAN_DBCL', 'Ban Kiểm tra và Đảm bảo chất lượng giáo dục TDU', '#7c3aed'],
      [2, 'Bộ môn Giáo dục thể chất', 'BM_GDTC', 'Giảng viên bộ môn GDTC tra cứu thù lao và kê khai giờ dạy', '#0284c7'],
      [3, 'Thanh tra nội bộ', 'THANH_TRA_NOI_BO', 'Ban Thanh tra nội bộ giám sát giờ giảng và chi trả', '#dc2626'],
    ];

    const ws = createStyledWorksheet(
      'MẪU NHẬP DỮ LIỆU NHÓM VAI TRÒ & PHÂN QUYỀN HỆ THỐNG - TRƯỜNG ĐH TÂY ĐÔ',
      columns,
      sampleRows,
      undefined,
      {
        unitName: 'PHÒNG CÔNG NGHỆ THÔNG TIN',
        subTitle: 'Năm học 2026 - 2027 (Cột màu vàng là thông tin bắt buộc)',
        documentNo: 'BM-TDU-VT-01-IMPORT',
      }
    );

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Mau_Import_Vai_Tro');
    saveWorkbookToFile(wb, 'TDU_Mau_Import_Vai_Tro.xlsx');
  };

  // 6. Xuất danh sách toàn bộ vai trò ra Excel chuẩn TDU
  const handleExportRolesExcel = () => {
    const columns: TemplateColumn[] = [
      { header: 'STT', key: 'stt', width: 6, align: 'center' },
      { header: 'Mã vai trò (*)', key: 'ma_vai_tro', width: 22, isYellow: true, align: 'center' },
      { header: 'Tên nhóm vai trò (*)', key: 'ten_vai_tro', width: 30, isYellow: true, align: 'left' },
      { header: 'Số lượng thành viên', key: 'so_luong_thanh_vien', width: 20, align: 'center' },
      { header: 'Số quyền được kích hoạt', key: 'so_quyen_kich_hoat', width: 22, align: 'center' },
      { header: 'Màu sắc đại diện', key: 'mau_sac', width: 18, align: 'center' },
      { header: 'Mô tả chức năng & phạm vi', key: 'mo_ta', width: 50, align: 'left' },
    ];

    const dataRows = roles.map((r, idx) => {
      const curDisabled = Array.isArray(r.disabledPermissions) ? r.disabledPermissions : [];
      const curMembers = Array.isArray(r.members) ? r.members : [];
      const activePermCount = ALL_PERMISSION_IDS.filter((id) => !curDisabled.includes(id)).length;
      return [
        idx + 1,
        r.code,
        r.name,
        curMembers.length,
        `${activePermCount}/${ALL_PERMISSION_IDS.length} quyền`,
        r.dotColor,
        r.description,
      ];
    });

    const summaryRow = [
      `TỔNG CỘNG (${roles.length} vai trò)`,
      '', '',
      roles.reduce((s, r) => s + (Array.isArray(r.members) ? r.members.length : 0), 0),
      '', '', ''
    ];

    const ws = createStyledWorksheet(
      'BẢNG TỔNG HỢP DANH SÁCH VAI TRÒ & PHÂN QUYỀN HỆ THỐNG - TRƯỜNG ĐH TÂY ĐÔ',
      columns,
      dataRows,
      summaryRow,
      {
        unitName: 'PHÒNG CÔNG NGHỆ THÔNG TIN',
        subTitle: `Năm học 2026 - 2027 (Cập nhật ngày ${new Date().toLocaleDateString('vi-VN')})`,
        documentNo: 'BM-TDU-VT-01',
      }
    );

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Danh_Sach_Vai_Tro');
    saveWorkbookToFile(wb, `TDU_Danh_Sach_Vai_Tro_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // 7. Xử lý đọc file Excel Import vai trò
  const handleProcessRoleExcelFile = (file: File) => {
    setImportRoleFile(file);
    setImportRoleError(null);
    setIsProcessingRoleFile(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rawJson: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

        if (!rawJson || rawJson.length < 2) {
          setImportRoleError('File Excel không có dữ liệu hoặc chỉ có dòng tiêu đề.');
          setIsProcessingRoleFile(false);
          return;
        }

        let headerRowIdx = -1;
        for (let i = 0; i < Math.min(rawJson.length, 12); i++) {
          const rowStr = rawJson[i].map((c) => String(c).toLowerCase()).join(' ');
          if (rowStr.includes('tên vai trò') || rowStr.includes('mã vai trò') || rowStr.includes('vai trò')) {
            headerRowIdx = i;
            break;
          }
        }

        if (headerRowIdx === -1) {
          headerRowIdx = 0;
        }

        const parsed: any[] = [];
        for (let r = headerRowIdx + 1; r < rawJson.length; r++) {
          const row = rawJson[r];
          if (!row || row.length === 0) continue;

          const firstCell = String(row[0] || '').trim();
          if (firstCell.startsWith('stt') || firstCell.startsWith('ten_') || firstCell.startsWith('ma_')) continue;

          const name = String(row[1] || row[0] || '').trim();
          if (!name || name.toLowerCase().includes('tổng cộng') || name.startsWith('(')) continue;

          const code = String(row[2] || name)
            .trim()
            .toUpperCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/Đ/g, 'D')
            .replace(/[^A-Z0-9]/g, '_')
            .replace(/_+/g, '_');

          const desc = String(row[3] || `Nhóm vai trò ${name}`).trim();
          const color = String(row[4] || '#2563eb').trim();

          parsed.push({
            name,
            code,
            description: desc,
            dotColor: color.startsWith('#') ? color : '#2563eb',
          });
        }

        if (parsed.length === 0) {
          setImportRoleError('Không tìm thấy dòng dữ liệu vai trò hợp lệ. Vui lòng tải file mẫu để kiểm tra.');
        } else {
          setParsedImportRoles(parsed);
        }
      } catch (err: any) {
        setImportRoleError('Lỗi đọc file Excel: ' + (err.message || 'Lỗi không xác định'));
      } finally {
        setIsProcessingRoleFile(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  // 8. Xác nhận nạp danh sách vai trò vào MySQL
  const handleConfirmImportRoles = async () => {
    if (parsedImportRoles.length === 0) return;

    try {
      await fetch('/api/roles/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roles: parsedImportRoles }),
      });
    } catch (err) {
      console.warn('Lỗi gửi import vai trò tới MySQL:', err);
    }

    const newItems: RoleItem[] = parsedImportRoles.map((p, idx) => ({
      id: `role_imp_${Date.now()}_${idx}`,
      name: p.name,
      code: p.code,
      dotColor: p.dotColor,
      badgeBg: '#eff6ff',
      badgeText: p.dotColor,
      description: p.description,
      members: [],
      disabledPermissions: [],
    }));

    setRoles((prev) => {
      const existingCodes = new Set(prev.map((r) => r.code.toUpperCase()));
      const toAdd = newItems.filter((item) => !existingCodes.has(item.code.toUpperCase()));
      const next = [...prev, ...toAdd];
      try {
        localStorage.setItem('tdu_roles_state_v3', JSON.stringify(next));
      } catch {}
      return next;
    });

    const count = parsedImportRoles.length;
    setIsImportRoleModalOpen(false);
    setImportRoleFile(null);
    setParsedImportRoles([]);
    setImportRoleError(null);
    alert(`Import thành công! Đã nạp ${count} vai trò vào CSDL MySQL.`);
  };

  // Aggregate available staff (from localStorage + defaults)
  const allCandidates = useMemo<StaffCandidate[]>(() => {
    let importedCandidates: StaffCandidate[] = [];
    try {
      const raw = localStorage.getItem('tdu_system_users_v2');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          importedCandidates = parsed.map((u: any, idx: number) => ({
            id: u.id || `imp_${idx}`,
            name: u.hoTen,
            code: u.maNhanSu || `TDU${String(idx + 1).padStart(5, '0')}`,
            unit: u.donVi || 'Trường Đại học Tây Đô',
            email: u.email || `${(u.maNhanSu || 'canbo').toLowerCase()}@tdu.edu.vn`,
            chucVu: u.chucVu || 'Cán bộ',
          }));
        }
      }
    } catch {
      // fallback
    }

    const map = new Map<string, StaffCandidate>();
    DEFAULT_STAFF_CANDIDATES.forEach((c) => map.set(c.code.toLowerCase(), c));
    importedCandidates.forEach((c) => map.set(c.code.toLowerCase(), c));
    return Array.from(map.values());
  }, []);

  // Unique units for dropdown
  const availableUnits = useMemo(() => {
    const set = new Set<string>();
    allCandidates.forEach((c) => {
      if (c.unit) set.add(c.unit.trim());
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'vi'));
  }, [allCandidates]);

  // Filtered candidates according to unit filter & search
  const filteredCandidates = useMemo(() => {
    return allCandidates.filter((c) => {
      if (memberUnitFilter !== 'ALL' && c.unit !== memberUnitFilter) {
        return false;
      }
      if (memberSearchQuery.trim()) {
        const q = memberSearchQuery.toLowerCase().trim();
        const matchName = c.name.toLowerCase().includes(q);
        const matchEmail = c.email.toLowerCase().includes(q);
        const matchCode = c.code.toLowerCase().includes(q);
        if (!matchName && !matchEmail && !matchCode) return false;
      }
      return true;
    });
  }, [allCandidates, memberUnitFilter, memberSearchQuery]);

  // Selectable candidates (not yet in current role)
  const selectableCandidates = useMemo(() => {
    return filteredCandidates.filter(
      (c) => !selectedRole.members.some((m) => m.id === c.id || m.code.toLowerCase() === c.code.toLowerCase())
    );
  }, [filteredCandidates, selectedRole.members]);

  const handleToggleSelectCandidate = (candidateId: string) => {
    setSelectedCandidateIds((prev) =>
      prev.includes(candidateId) ? prev.filter((id) => id !== candidateId) : [...prev, candidateId]
    );
  };

  const handleToggleSelectAll = () => {
    const selectableIds = selectableCandidates.map((c) => c.id);
    const allSelected = selectableIds.length > 0 && selectableIds.every((id) => selectedCandidateIds.includes(id));
    if (allSelected) {
      setSelectedCandidateIds((prev) => prev.filter((id) => !selectableIds.includes(id)));
    } else {
      setSelectedCandidateIds((prev) => Array.from(new Set([...prev, ...selectableIds])));
    }
  };

  const handleConfirmAddMembers = async () => {
    const toAdd = allCandidates.filter((c) => selectedCandidateIds.includes(c.id));
    if (toAdd.length === 0) return;

    const existingCodes = new Set(selectedRole.members.map((m) => m.code.toLowerCase()));
    const newMembers = toAdd
      .filter((c) => !existingCodes.has(c.code.toLowerCase()))
      .map((c) => ({
        id: c.id,
        name: c.name,
        code: c.code,
        unit: c.unit,
        email: c.email,
      }));

    if (newMembers.length === 0) {
      setIsAddMemberModalOpen(false);
      setSelectedCandidateIds([]);
      return;
    }

    // 1. Cập nhật state & lưu cache toàn bộ roles
    setRoles((prev) => {
      const nextRoles = prev.map((role) => {
        if (role.id !== selectedRole.id) return role;
        return {
          ...role,
          members: [...role.members, ...newMembers],
        };
      });
      try {
        localStorage.setItem('tdu_roles_state_v3', JSON.stringify(nextRoles));
      } catch {}
      return nextRoles;
    });

    // 2. Gửi API backend MySQL POST /api/roles/:roleId/members
    try {
      fetch(`/api/roles/${selectedRole.id}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userIds: newMembers.map((m) => m.code || m.email || m.id),
        }),
      }).catch((e) => console.warn('Could not post to /api/roles/.../members:', e));
    } catch {}

    // 3. Lưu vào localStorage cache
    try {
      const cache = JSON.parse(localStorage.getItem('tdu_custom_role_members') || '{}');
      const cur = cache[selectedRole.id] || [];
      const curCodes = new Set(cur.map((x: any) => x.code?.toLowerCase()));
      const toCache = [...cur, ...newMembers.filter((m) => !curCodes.has(m.code?.toLowerCase()))];
      cache[selectedRole.id] = toCache;
      localStorage.setItem('tdu_custom_role_members', JSON.stringify(cache));

      // Nếu thêm vào Quản trị viên hệ thống (quan_tri_vien_he_thong)
      const authUserStr = localStorage.getItem('tdu_auth_user');
      if (authUserStr && selectedRole.id === 'quan_tri_vien_he_thong') {
        const authUser = JSON.parse(authUserStr);
        const isSelf = newMembers.some(
          (m) =>
            m.email.toLowerCase() === (authUser.email || '').toLowerCase() ||
            m.code.toLowerCase() === (authUser.maNhanSu || '').toLowerCase()
        );
        if (isSelf) {
          const roles = Array.isArray(authUser.roles) ? authUser.roles : [];
          if (!roles.includes('QUAN_TRI_VIEN_HE_THONG')) {
            roles.push('QUAN_TRI_VIEN_HE_THONG');
            authUser.roles = roles;
            localStorage.setItem('tdu_auth_user', JSON.stringify(authUser));
          }
        }
      }
    } catch {}

    setIsAddMemberModalOpen(false);
    setSelectedCandidateIds([]);
    setActiveTopTab('thanh_vien');
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
  };

  const handleRemoveMember = async (mem: { id: string; name: string; code: string; unit: string; email: string }) => {
    const ok = await confirmDelete({
      title: 'Xác nhận xóa thành viên',
      targetName: `${mem.name} (${mem.code || mem.email})`,
      targetType: selectedRole?.name || 'Vai trò',
      message: `Bạn có chắc chắn muốn gỡ bỏ thành viên này khỏi vai trò "${selectedRole?.name}" không?`,
      dangerNotice: 'Thành viên sẽ mất các quyền truy cập thuộc vai trò này sau khi xóa.',
      confirmText: 'Xóa khỏi vai trò',
    });

    if (!ok) {
      return;
    }

    // 1. Cập nhật state & lưu cache toàn bộ roles
    setRoles((prev) => {
      const nextRoles = prev.map((r) =>
        r.id === selectedRole.id
          ? {
              ...r,
              members: r.members.filter((m) => m.id !== mem.id && m.code !== mem.code),
            }
          : r
      );
      try {
        localStorage.setItem('tdu_roles_state_v3', JSON.stringify(nextRoles));
      } catch {}
      return nextRoles;
    });

    // 2. Gửi API DELETE /api/roles/:roleId/members/:userId
    try {
      fetch(`/api/roles/${selectedRole.id}/members/${mem.code || mem.id}`, {
        method: 'DELETE',
      }).catch((e) => console.warn('Could not delete from /api/roles/.../members:', e));
    } catch {}

    // 3. Cập nhật localStorage
    try {
      const cache = JSON.parse(localStorage.getItem('tdu_custom_role_members') || '{}');
      if (cache[selectedRole.id]) {
        cache[selectedRole.id] = cache[selectedRole.id].filter(
          (m: any) => m.id !== mem.id && m.code !== mem.code
        );
        localStorage.setItem('tdu_custom_role_members', JSON.stringify(cache));
      }

      const authUserStr = localStorage.getItem('tdu_auth_user');
      if (authUserStr && selectedRole.id === 'quan_tri_vien_he_thong') {
        const authUser = JSON.parse(authUserStr);
        if (
          mem.email.toLowerCase() === (authUser.email || '').toLowerCase() ||
          mem.code.toLowerCase() === (authUser.maNhanSu || '').toLowerCase()
        ) {
          if (Array.isArray(authUser.roles)) {
            authUser.roles = authUser.roles.filter((x: string) => x !== 'QUAN_TRI_VIEN_HE_THONG');
            localStorage.setItem('tdu_auth_user', JSON.stringify(authUser));
          }
        }
      }
    } catch {}

    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2000);
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
        <div className="w-[285px] border-r border-slate-200 flex flex-col shrink-0 bg-white">
          <div className="px-3.5 pt-3.5 pb-2 flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              DANH SÁCH VAI TRÒ ({roles.length})
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setIsImportRoleModalOpen(true)}
                className="w-6 h-6 rounded-md hover:bg-slate-100 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
                title="Nhập danh sách vai trò từ Excel"
              >
                <Upload className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleExportRolesExcel}
                className="w-6 h-6 rounded-md hover:bg-slate-100 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
                title="Xuất danh sách vai trò ra Excel"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsAddRoleOpen(true)}
                className="w-6 h-6 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-600 flex items-center justify-center transition-colors cursor-pointer"
                title="Thêm vai trò mới"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            </div>
          </div>

          {/* Quick search among 26 unit roles */}
          <div className="px-2.5 pb-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm vai trò / đơn vị..."
                value={roleSearchQuery}
                onChange={(e) => setRoleSearchQuery(e.target.value)}
                className="w-full pl-8 pr-7 py-1.5 text-[12px] bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white text-slate-700"
              />
              {roleSearchQuery && (
                <button
                  type="button"
                  onClick={() => setRoleSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-2 py-1 space-y-0.5">
            {roles
              .filter((role) => {
                if (!roleSearchQuery.trim()) return true;
                const q = roleSearchQuery.toLowerCase().trim();
                return role.name.toLowerCase().includes(q) || role.code.toLowerCase().includes(q);
              })
              .map((role) => {
                const isSelected = selectedRole && role.id === selectedRole.id;
                const memCount = (role.members || []).length;
                return (
                  <button
                    key={role.id}
                    onClick={() => setSelectedRoleId(role.id)}
                    title={`${role.name} (${memCount} thành viên)`}
                    className={`w-full text-left px-2.5 py-2 rounded-lg flex items-center gap-2 transition-all cursor-pointer relative ${
                      isSelected
                        ? 'bg-[#eff6ff] text-[#1d4ed8] font-semibold shadow-2xs'
                        : 'text-slate-700 hover:bg-slate-50 font-normal'
                    }`}
                  >
                    {/* Left active blue bar indicator */}
                    {isSelected && (
                      <span className="absolute left-0 top-1 bottom-1 w-[3.5px] bg-[#2563eb] rounded-r" />
                    )}

                    {/* Colored status dot */}
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: role.dotColor || '#2563eb' }}
                    />

                    {/* Role Name */}
                    <span className="text-[12px] truncate flex-1">{role.name}</span>

                    {/* Member count badge */}
                    <span
                      className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full shrink-0 ${
                        isSelected
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {memCount}
                    </span>
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
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: selectedRole?.badgeBg || '#eff6ff' }}
                >
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: selectedRole?.badgeText || '#2563eb' }}
                  />
                </div>
                <span
                  className="text-[12.5px] font-bold uppercase tracking-wide"
                  style={{ color: selectedRole?.badgeText || '#2563eb' }}
                >
                  {selectedRole?.code || ''}
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-[13px] font-semibold text-slate-800">
                  {selectedRole?.name || ''}
                </span>
                <span className="text-[11.5px] bg-slate-100 text-slate-600 font-medium px-2 py-0.5 rounded-full border border-slate-200">
                  {(selectedRole?.members || []).length} thành viên
                </span>
              </div>

              {/* Action Button: Thêm mới thành viên vào vai trò đang chọn */}
              <button
                onClick={() => {
                  setSelectedCandidateIds([]);
                  setIsAddMemberModalOpen(true);
                }}
                className="h-[32px] px-3.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#2563eb] text-[12px] font-medium flex items-center gap-1.5 cursor-pointer border border-blue-200/80 transition-colors shadow-2xs"
                title={`Thêm mới thành viên vào vai trò ${selectedRole?.name || ''}`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Thêm mới</span>
              </button>
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
                      className="w-full h-[34px] pl-9 pr-8 rounded-full border border-slate-200 text-[12.5px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-blue-400 bg-white shadow-2xs"
                    />
                    {permissionSearch && (
                      <button
                        type="button"
                        onClick={() => setPermissionSearch('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
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
                    className="w-full h-[36px] px-3 rounded-lg border border-slate-300 bg-white text-[13px] text-slate-800 focus:outline-none focus:border-blue-500 font-mono text-[12.5px]"
                  />
                </div>

                <div>
                  <label className="block text-[12px] text-slate-500 mb-1.5 flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-slate-400" />
                    <span>Màu sắc nhận diện</span>
                  </label>
                  <div className="flex items-center gap-2">
                    {[
                      '#2563eb', // Blue
                      '#16a34a', // Green
                      '#9333ea', // Purple
                      '#dc2626', // Red
                      '#ea580c', // Orange
                      '#0891b2', // Cyan
                      '#0d9488', // Teal
                      '#64748b', // Slate
                      '#d97706', // Amber
                    ].map((color) => {
                      const isSelected = selectedRole.dotColor === color;
                      return (
                        <button
                          key={color}
                          type="button"
                          onClick={() => {
                            setRoles((prev) =>
                              prev.map((r) =>
                                r.id === selectedRole.id
                                  ? { ...r, dotColor: color, badgeText: color }
                                  : r
                              )
                            );
                          }}
                          className={`w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                            isSelected ? 'ring-2 ring-offset-2 ring-blue-500 scale-110' : 'hover:scale-105'
                          }`}
                          style={{ backgroundColor: color }}
                          title={`Chọn màu ${color}`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                        </button>
                      );
                    })}
                  </div>
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

                <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between">
                  {selectedRole.code === 'QUAN_TRI_VIEN_HE_THONG' || selectedRole.id === 'quan_tri_vien_he_thong' ? (
                    <span className="text-[11.5px] text-slate-400 italic flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Vai trò quản trị mặc định (không được xóa)</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleDeleteRole(selectedRole.id)}
                      className="h-[34px] px-3.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-[12.5px] font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Xóa vai trò</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleSaveRoleInfo}
                    className="h-[34px] px-4 rounded-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-[12.5px] font-medium flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Lưu thông tin vai trò</span>
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
              <div className="max-w-[720px] bg-[#f8fafc] rounded-2xl p-4 border border-slate-100">
                <div className="pb-3 px-1 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <span className="text-[14px] font-medium text-slate-800">
                    Danh sách phân hệ (Module) được phép truy cập
                  </span>
                  <div className="flex items-center gap-2.5 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-[220px]">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={moduleSearch}
                        onChange={(e) => setModuleSearch(e.target.value)}
                        placeholder="Tìm kiếm module..."
                        className="w-full h-[32px] pl-8 pr-7 rounded-lg border border-slate-200 text-[12px] text-slate-700 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-2xs"
                      />
                      {moduleSearch && (
                        <button
                          type="button"
                          onClick={() => setModuleSearch('')}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <button
                      onClick={handleSave}
                      className="h-[32px] px-3.5 rounded-full bg-[#7da2f8] hover:bg-[#5b89f7] text-white text-[12px] font-medium flex items-center gap-1.5 cursor-pointer shrink-0"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Lưu thay đổi</span>
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-100 divide-y divide-slate-100">
                  {filteredModuleCatalog.length === 0 ? (
                    <div className="py-8 text-center text-[12.5px] text-slate-400">
                      Không tìm thấy module nào khớp với từ khóa "{moduleSearch}".
                    </div>
                  ) : (
                    filteredModuleCatalog.map((mod) => {
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
                    })
                  )}
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
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <span className="text-[13.5px] font-semibold text-slate-700">
                    Thành viên thuộc vai trò {selectedRole?.name || ''} ({(selectedRole?.members || []).length})
                  </span>
                  <div className="flex items-center gap-2.5 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-[240px]">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={roleMemberSearch}
                        onChange={(e) => setRoleMemberSearch(e.target.value)}
                        placeholder="Tìm kiếm thành viên theo tên, email..."
                        className="w-full h-[32px] pl-8 pr-7 rounded-lg border border-slate-200 text-[12px] text-slate-700 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-2xs"
                      />
                      {roleMemberSearch && (
                        <button
                          type="button"
                          onClick={() => setRoleMemberSearch('')}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setSelectedCandidateIds([]);
                        setIsAddMemberModalOpen(true);
                      }}
                      className="h-[32px] px-3.5 rounded-full bg-blue-50 hover:bg-blue-100 text-[#2563eb] text-[12px] font-medium flex items-center gap-1.5 cursor-pointer border border-blue-200 transition-colors shadow-2xs shrink-0"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>+ Thêm mới thành viên</span>
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
                  {(selectedRole?.members || []).length === 0 ? (
                    <div className="py-8 text-center text-[12.5px] text-slate-400">
                      Chưa có thành viên nào trong vai trò này.
                    </div>
                  ) : filteredRoleMembers.length === 0 ? (
                    <div className="py-8 text-center text-[12.5px] text-slate-400">
                      Không tìm thấy thành viên nào khớp với từ khóa "{roleMemberSearch}".
                    </div>
                  ) : (
                    filteredRoleMembers.map((mem) => (
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
                          onClick={() => handleRemoveMember(mem)}
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

      {/* ============================================================
          POPUP MODAL GIỮA: THÊM MỚI THÀNH VIÊN VÀO VAI TRÒ
          - Giao diện trắng (White clean interface)
          - Bộ lọc theo đơn vị
          - Tìm kiếm theo tên, email, mã nhân sự
          - Dưới có bảng thông tin: Tên, Email, Đơn vị
          - Bấm chọn và thêm mới
          ============================================================ */}
      {isAddMemberModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-3 sm:p-5 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[840px] max-h-[88vh] flex flex-col border border-slate-200 overflow-hidden">
            {/* 1. Modal Header - Giao diện trắng sạch sẽ */}
            <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 border border-blue-200/80 flex items-center justify-center shadow-2xs">
                  <UserPlus className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-[16px] text-slate-800 leading-tight">
                  Thêm thành viên
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsAddMemberModalOpen(false);
                  setSelectedCandidateIds([]);
                }}
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-lg cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 2. Filter Toolbar - Bộ lọc theo đơn vị & Ô tìm kiếm tên, email */}
            <div className="px-6 py-3.5 bg-slate-50/70 border-b border-slate-200 flex flex-col sm:flex-row items-center gap-3 shrink-0">
              {/* Bộ lọc theo đơn vị */}
              <div className="w-full sm:w-[280px]">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Bộ lọc theo đơn vị
                </label>
                <div className="relative">
                  <select
                    value={memberUnitFilter}
                    onChange={(e) => setMemberUnitFilter(e.target.value)}
                    className="w-full h-[36px] pl-3 pr-8 bg-white border border-slate-300 rounded-xl text-[12.5px] text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer shadow-2xs"
                  >
                    <option value="ALL">Tất cả đơn vị ({allCandidates.length})</option>
                    {availableUnits.map((u) => {
                      const count = allCandidates.filter((c) => c.unit === u).length;
                      return (
                        <option key={u} value={u}>
                          {u} ({count})
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              {/* Tìm kiếm theo tên, email, mã nhân sự */}
              <div className="w-full sm:flex-1">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Tìm kiếm theo tên, email...
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={memberSearchQuery}
                    onChange={(e) => setMemberSearchQuery(e.target.value)}
                    placeholder="Nhập họ tên, email hoặc mã nhân sự..."
                    className="w-full h-[36px] pl-9 pr-3 bg-white border border-slate-300 rounded-xl text-[12.5px] text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-slate-400 shadow-2xs"
                  />
                  {memberSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setMemberSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer p-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* 3. Bảng thông tin: Tên, Email, Đơn vị */}
            <div className="flex-1 overflow-y-auto px-6 py-2">
              <table className="w-full border-collapse text-left text-[12.5px]">
                <thead className="bg-slate-50 text-slate-700 font-semibold sticky top-0 z-10 border-b border-slate-200">
                  <tr className="h-[38px]">
                    <th className="px-3 text-center w-[50px]">
                      <input
                        type="checkbox"
                        checked={
                          selectableCandidates.length > 0 &&
                          selectableCandidates.every((c) => selectedCandidateIds.includes(c.id))
                        }
                        onChange={handleToggleSelectAll}
                        disabled={selectableCandidates.length === 0}
                        className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                        title="Chọn tất cả danh sách đang hiển thị"
                      />
                    </th>
                    <th className="px-3.5 py-2">Tên</th>
                    <th className="px-3.5 py-2">Email</th>
                    <th className="px-3.5 py-2">Đơn vị</th>
                    <th className="px-3 py-2 text-center w-[120px]">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCandidates.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-500">
                        <div className="flex flex-col items-center justify-center">
                          <Users className="w-8 h-8 text-slate-300 mb-2" />
                          <p className="font-medium text-[13px]">Không tìm thấy cán bộ nào phù hợp</p>
                          <p className="text-[12px] text-slate-400 mt-0.5">
                            Thử thay đổi từ khóa tìm kiếm hoặc chọn "Tất cả đơn vị"
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredCandidates.map((staff) => {
                      const isAlreadyMember = selectedRole.members.some(
                        (m) => m.id === staff.id || m.code.toLowerCase() === staff.code.toLowerCase()
                      );
                      const isSelected = selectedCandidateIds.includes(staff.id);

                      return (
                        <tr
                          key={staff.id}
                          onClick={() => {
                            if (!isAlreadyMember) handleToggleSelectCandidate(staff.id);
                          }}
                          className={`h-[44px] transition-colors ${
                            isAlreadyMember
                              ? 'bg-slate-50/60 opacity-60 cursor-not-allowed'
                              : isSelected
                              ? 'bg-blue-50/60 cursor-pointer'
                              : 'hover:bg-slate-50 cursor-pointer'
                          }`}
                        >
                          {/* Checkbox */}
                          <td className="px-3 text-center" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={isAlreadyMember || isSelected}
                              disabled={isAlreadyMember}
                              onChange={() => handleToggleSelectCandidate(staff.id)}
                              className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer disabled:cursor-not-allowed"
                            />
                          </td>

                          {/* Tên */}
                          <td className="px-3.5 py-2">
                            <div className="font-semibold text-slate-800 flex items-center gap-2">
                              <span>{staff.name}</span>
                              <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                                {staff.code}
                              </span>
                            </div>
                            {staff.chucVu && (
                              <div className="text-[11.5px] text-slate-500 font-normal">
                                {staff.chucVu}
                              </div>
                            )}
                          </td>

                          {/* Email */}
                          <td className="px-3.5 py-2 font-mono text-slate-600 text-[12px]">
                            {staff.email}
                          </td>

                          {/* Đơn vị */}
                          <td className="px-3.5 py-2">
                            <span className="inline-block px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11.5px] font-medium border border-slate-200">
                              {staff.unit}
                            </span>
                          </td>

                          {/* Trạng thái */}
                          <td className="px-3 py-2 text-center whitespace-nowrap">
                            {isAlreadyMember ? (
                              <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Đã trong vai trò
                              </span>
                            ) : isSelected ? (
                              <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                                Đã chọn
                              </span>
                            ) : (
                              <span className="text-[11.5px] text-slate-400">Chưa chọn</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* 4. Modal Footer - Nút Hủy và Nút "Bấm chọn và thêm mới" */}
            <div className="bg-white border-t border-slate-200 px-6 py-3.5 flex items-center justify-between shrink-0">
              <div className="text-[12.5px] text-slate-600">
                Đã chọn:{' '}
                <span className="font-bold text-blue-700 text-[13.5px]">
                  {selectedCandidateIds.length}
                </span>{' '}
                thành viên
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddMemberModalOpen(false);
                    setSelectedCandidateIds([]);
                  }}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 cursor-pointer text-[12.5px] transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  disabled={selectedCandidateIds.length === 0}
                  onClick={handleConfirmAddMembers}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium flex items-center gap-2 cursor-pointer shadow-xs text-[12.5px] transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>
                    Bấm chọn và thêm mới {selectedCandidateIds.length > 0 ? `(${selectedCandidateIds.length})` : ''}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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

      {/* Import Roles Modal */}
      {isImportRoleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-[700px] max-h-[85vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-200">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-[16px] font-bold text-slate-800">Nhập danh sách vai trò từ Excel</h3>
                  <p className="text-[12px] text-slate-500">Cập nhật và nạp nhóm vai trò trực tiếp vào CSDL MySQL</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsImportRoleModalOpen(false);
                  setImportRoleFile(null);
                  setParsedImportRoles([]);
                  setImportRoleError(null);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto space-y-4">
              {/* Template Download Banner */}
              <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200/80 flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-[13px] font-semibold text-blue-900">Chưa có file mẫu chuẩn?</h4>
                  <p className="text-[12px] text-blue-700 mt-0.5">Tải file mẫu Excel chuẩn Trường Đại học Tây Đô để chuẩn bị dữ liệu vai trò.</p>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadRoleTemplate}
                  className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-medium flex items-center gap-1.5 shrink-0 cursor-pointer shadow-2xs transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Tải file mẫu</span>
                </button>
              </div>

              {/* Upload Dropzone */}
              <div className="border-2 border-dashed border-slate-300 hover:border-blue-400 rounded-xl p-6 text-center cursor-pointer transition-colors bg-slate-50/50 relative">
                <input
                  type="file"
                  accept=".xlsx, .xls"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleProcessRoleExcelFile(f);
                  }}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <Upload className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-[13px] font-medium text-slate-700">
                  {importRoleFile ? importRoleFile.name : 'Kéo thả hoặc nhấp để chọn file Excel (.xlsx, .xls)'}
                </p>
                <p className="text-[11.5px] text-slate-400 mt-1">Hỗ trợ các cột: Tên vai trò, Mã vai trò, Mô tả, Màu sắc</p>
              </div>

              {importRoleError && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-[12.5px] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{importRoleError}</span>
                </div>
              )}

              {/* Preview table of parsed roles */}
              {parsedImportRoles.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[12.5px] font-semibold text-slate-700">
                      Tìm thấy {parsedImportRoles.length} vai trò hợp lệ:
                    </span>
                  </div>
                  <div className="max-h-[220px] overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100">
                    {parsedImportRoles.map((r, i) => (
                      <div key={i} className="px-3.5 py-2 flex items-center justify-between text-[12px]">
                        <div className="flex items-center gap-2.5">
                          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: r.dotColor }} />
                          <div>
                            <span className="font-semibold text-slate-800">{r.name}</span>
                            <span className="text-slate-400 font-mono ml-2">({r.code})</span>
                          </div>
                        </div>
                        <span className="text-slate-500 truncate max-w-[240px]">{r.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <span className="text-[12px] text-slate-500">
                {parsedImportRoles.length > 0 ? `Sẵn sàng nạp ${parsedImportRoles.length} vai trò` : 'Chọn file để bắt đầu'}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsImportRoleModalOpen(false);
                    setImportRoleFile(null);
                    setParsedImportRoles([]);
                    setImportRoleError(null);
                  }}
                  className="px-4 py-1.5 rounded-lg border border-slate-300 text-slate-700 text-[12.5px] hover:bg-white cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  disabled={parsedImportRoles.length === 0 || isProcessingRoleFile}
                  onClick={handleConfirmImportRoles}
                  className="px-5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[12.5px] font-medium disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-2xs transition-colors"
                >
                  Xác nhận nạp vào MySQL
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
