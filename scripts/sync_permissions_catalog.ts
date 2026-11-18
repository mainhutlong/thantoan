import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

export const GRANULAR_PERMISSIONS = [
  // 1. THANH TOÁN GIỜ GIẢNG
  { ma: 'gg_xem_ds', ten: 'Xem danh sách kê khai giờ giảng toàn trường', module: 'THANH_TOAN_GIO_GIANG', nhom: 'Kê khai giờ giảng' },
  { ma: 'gg_xem_chi_tiet', ten: 'Xem chi tiết bảng kê giờ giảng theo giảng viên', module: 'THANH_TOAN_GIO_GIANG', nhom: 'Kê khai giờ giảng' },
  { ma: 'gg_them_moi', ten: 'Thêm mới bản ghi giờ giảng', module: 'THANH_TOAN_GIO_GIANG', nhom: 'Kê khai giờ giảng' },
  { ma: 'gg_tai_mau', ten: 'Tải file mẫu trống Excel chuẩn Phòng Đào tạo', module: 'THANH_TOAN_GIO_GIANG', nhom: 'Kê khai giờ giảng' },
  { ma: 'gg_import_excel', ten: 'Nhập dữ liệu từ file Excel (Import mới)', module: 'THANH_TOAN_GIO_GIANG', nhom: 'Kê khai giờ giảng' },
  { ma: 'gg_import_bo_sung', ten: 'Nhập bổ sung dữ liệu từ Excel', module: 'THANH_TOAN_GIO_GIANG', nhom: 'Kê khai giờ giảng' },
  { ma: 'gg_sua', ten: 'Chỉnh sửa hệ số lớp, số tiết, giờ quy chuẩn và thù lao', module: 'THANH_TOAN_GIO_GIANG', nhom: 'Kê khai giờ giảng' },
  { ma: 'gg_xoa', ten: 'Xóa bản ghi giờ giảng', module: 'THANH_TOAN_GIO_GIANG', nhom: 'Kê khai giờ giảng' },
  { ma: 'gg_export', ten: 'Xuất dữ liệu bảng kê ra Excel', module: 'THANH_TOAN_GIO_GIANG', nhom: 'Kê khai giờ giảng' },
  { ma: 'gg_khoa_ky', ten: 'Khóa / Mở khóa kỳ đối soát giờ giảng', module: 'THANH_TOAN_GIO_GIANG', nhom: 'Kê khai giờ giảng' },
  { ma: 'gg_duyet_dinh_chinh', ten: 'Phê duyệt đề xuất điều chỉnh & Cập nhật Version mới', module: 'THANH_TOAN_GIO_GIANG', nhom: 'Kê khai giờ giảng' },

  // 2. NGHIÊN CỨU KHOA HỌC
  { ma: 'nckh_bb_xem_ds', ten: 'Xem danh sách bài báo khoa học', module: 'NGHIEN_CUU_KHOA_HOC', nhom: 'Bài báo' },
  { ma: 'nckh_bb_xem_chi_tiet', ten: 'Xem chi tiết bài báo & danh sách đồng tác giả', module: 'NGHIEN_CUU_KHOA_HOC', nhom: 'Bài báo' },
  { ma: 'nckh_bb_them_moi', ten: 'Thêm mới bài báo khoa học', module: 'NGHIEN_CUU_KHOA_HOC', nhom: 'Bài báo' },
  { ma: 'nckh_bb_import_excel', ten: 'Nhập danh sách bài báo từ file Excel', module: 'NGHIEN_CUU_KHOA_HOC', nhom: 'Bài báo' },
  { ma: 'nckh_bb_sua', ten: 'Chỉnh sửa thông tin bài báo, xếp loại & số giờ QC', module: 'NGHIEN_CUU_KHOA_HOC', nhom: 'Bài báo' },
  { ma: 'nckh_bb_xoa', ten: 'Xóa bài báo khoa học', module: 'NGHIEN_CUU_KHOA_HOC', nhom: 'Bài báo' },
  { ma: 'nckh_bb_export', ten: 'Xuất danh sách bài báo ra Excel', module: 'NGHIEN_CUU_KHOA_HOC', nhom: 'Bài báo' },

  { ma: 'nckh_sm_xem_ds', ten: 'Xem danh sách báo cáo seminar học thuật', module: 'NGHIEN_CUU_KHOA_HOC', nhom: 'Seminar' },
  { ma: 'nckh_sm_xem_chi_tiet', ten: 'Xem chi tiết chuyên đề seminar & đơn vị tổ chức', module: 'NGHIEN_CUU_KHOA_HOC', nhom: 'Seminar' },
  { ma: 'nckh_sm_them_moi', ten: 'Thêm mới buổi báo cáo seminar', module: 'NGHIEN_CUU_KHOA_HOC', nhom: 'Seminar' },
  { ma: 'nckh_sm_import_excel', ten: 'Nhập danh sách seminar từ file Excel', module: 'NGHIEN_CUU_KHOA_HOC', nhom: 'Seminar' },
  { ma: 'nckh_sm_sua', ten: 'Chỉnh sửa nội dung, số giờ và thù lao seminar', module: 'NGHIEN_CUU_KHOA_HOC', nhom: 'Seminar' },
  { ma: 'nckh_sm_xoa', ten: 'Xóa bản ghi seminar', module: 'NGHIEN_CUU_KHOA_HOC', nhom: 'Seminar' },
  { ma: 'nckh_sm_export', ten: 'Xuất danh sách seminar ra Excel', module: 'NGHIEN_CUU_KHOA_HOC', nhom: 'Seminar' },

  { ma: 'nckh_dt_xem_ds', ten: 'Xem danh sách đề tài NCKH, luận văn, giáo trình', module: 'NGHIEN_CUU_KHOA_HOC', nhom: 'Đề tài & Giáo trình' },
  { ma: 'nckh_dt_xem_bang_ke', ten: 'Xem chi tiết biểu mẫu thống kê NCKH chuẩn', module: 'NGHIEN_CUU_KHOA_HOC', nhom: 'Đề tài & Giáo trình' },
  { ma: 'nckh_dt_them_moi', ten: 'Thêm mới đề tài NCKH / biên soạn giáo trình', module: 'NGHIEN_CUU_KHOA_HOC', nhom: 'Đề tài & Giáo trình' },
  { ma: 'nckh_dt_import_excel', ten: 'Nhập liệu đề tài NCKH từ file Excel', module: 'NGHIEN_CUU_KHOA_HOC', nhom: 'Đề tài & Giáo trình' },
  { ma: 'nckh_dt_sua', ten: 'Cập nhật tiến độ nghiệm thu, định mức và giờ QC', module: 'NGHIEN_CUU_KHOA_HOC', nhom: 'Đề tài & Giáo trình' },
  { ma: 'nckh_dt_xoa', ten: 'Xóa bản ghi đề tài NCKH', module: 'NGHIEN_CUU_KHOA_HOC', nhom: 'Đề tài & Giáo trình' },
  { ma: 'nckh_dt_export', ten: 'Xuất biểu mẫu thống kê NCKH ra Excel', module: 'NGHIEN_CUU_KHOA_HOC', nhom: 'Đề tài & Giáo trình' },

  // 3. CÔNG TÁC KHÁC
  { ma: 'ctk_kt_xem_ds', ten: 'Xem danh sách thù lao coi thi & chấm thi', module: 'CONG_TAC_KHAC', nhom: 'Khảo thí' },
  { ma: 'ctk_kt_them_moi', ten: 'Thêm mới ca coi thi / chấm thi', module: 'CONG_TAC_KHAC', nhom: 'Khảo thí' },
  { ma: 'ctk_kt_import', ten: 'Nhập dữ liệu coi thi từ file Excel', module: 'CONG_TAC_KHAC', nhom: 'Khảo thí' },
  { ma: 'ctk_kt_sua', ten: 'Sửa thông tin ca thi và thù lao', module: 'CONG_TAC_KHAC', nhom: 'Khảo thí' },
  { ma: 'ctk_kt_xoa', ten: 'Xóa ca thi', module: 'CONG_TAC_KHAC', nhom: 'Khảo thí' },
  { ma: 'ctk_kt_export', ten: 'Xuất danh sách coi thi ra Excel', module: 'CONG_TAC_KHAC', nhom: 'Khảo thí' },

  { ma: 'ctk_ts_xem_ds', ten: 'Xem danh sách công tác tư vấn tuyển sinh', module: 'CONG_TAC_KHAC', nhom: 'Tuyển sinh' },
  { ma: 'ctk_ts_them_moi', ten: 'Thêm mới đợt tư vấn tuyển sinh', module: 'CONG_TAC_KHAC', nhom: 'Tuyển sinh' },
  { ma: 'ctk_ts_import', ten: 'Nhập dữ liệu tuyển sinh từ Excel', module: 'CONG_TAC_KHAC', nhom: 'Tuyển sinh' },
  { ma: 'ctk_ts_sua', ten: 'Sửa ngày công và mức hỗ trợ tuyển sinh', module: 'CONG_TAC_KHAC', nhom: 'Tuyển sinh' },
  { ma: 'ctk_ts_xoa', ten: 'Xóa bản ghi tuyển sinh', module: 'CONG_TAC_KHAC', nhom: 'Tuyển sinh' },
  { ma: 'ctk_ts_export', ten: 'Xuất báo cáo tuyển sinh ra Excel', module: 'CONG_TAC_KHAC', nhom: 'Tuyển sinh' },

  { ma: 'ctk_cvht_xem_ds', ten: 'Xem danh sách phụ cấp Cố vấn học tập', module: 'CONG_TAC_KHAC', nhom: 'Cố vấn học tập' },
  { ma: 'ctk_cvht_them_moi', ten: 'Thêm mới phân công CVHT', module: 'CONG_TAC_KHAC', nhom: 'Cố vấn học tập' },
  { ma: 'ctk_cvht_import', ten: 'Nhập danh sách CVHT từ Excel', module: 'CONG_TAC_KHAC', nhom: 'Cố vấn học tập' },
  { ma: 'ctk_cvht_sua', ten: 'Sửa lớp chủ nhiệm và phụ cấp CVHT', module: 'CONG_TAC_KHAC', nhom: 'Cố vấn học tập' },
  { ma: 'ctk_cvht_xoa', ten: 'Xóa phân công CVHT', module: 'CONG_TAC_KHAC', nhom: 'Cố vấn học tập' },
  { ma: 'ctk_cvht_export', ten: 'Xuất danh sách CVHT ra Excel', module: 'CONG_TAC_KHAC', nhom: 'Cố vấn học tập' },

  // 4. THANH TOÁN
  { ma: 'tt_ql_xem_tong_hop', ten: 'Xem tổng hợp thanh toán toàn trường', module: 'THANH_TOAN', nhom: 'Quản lý thanh toán' },
  { ma: 'tt_ql_khoa_so', ten: 'Khóa sổ kỳ thanh toán thù lao', module: 'THANH_TOAN', nhom: 'Quản lý thanh toán' },
  { ma: 'tt_ql_mo_khoa', ten: 'Mở khóa sổ để điều chỉnh bổ sung', module: 'THANH_TOAN', nhom: 'Quản lý thanh toán' },
  { ma: 'tt_ql_xuat_excel', ten: 'Xuất bảng tổng hợp thanh toán ra Excel', module: 'THANH_TOAN', nhom: 'Quản lý thanh toán' },

  { ma: 'tt_chi_tra_xem_ds', ten: 'Xem danh sách chi trả tài chính', module: 'THANH_TOAN', nhom: 'Chi trả tài chính' },
  { ma: 'tt_chi_tra_lap_lenh_unc', ten: 'Lập lệnh Ủy nhiệm chi (UNC) ngân hàng', module: 'THANH_TOAN', nhom: 'Chi trả tài chính' },
  { ma: 'tt_chi_tra_duyet_chi', ten: 'Phê duyệt trạng thái đã chi trả', module: 'THANH_TOAN', nhom: 'Chi trả tài chính' },
  { ma: 'tt_chi_tra_in_unc', ten: 'In phiếu Ủy nhiệm chi (UNC)', module: 'THANH_TOAN', nhom: 'Chi trả tài chính' },
  { ma: 'tt_chi_tra_xuat_excel', ten: 'Xuất danh sách chi trả ra Excel', module: 'THANH_TOAN', nhom: 'Chi trả tài chính' },

  // 5. TRA CỨU VÀ PHẢN HỒI
  { ma: 'tc_gv_xem_thu_lao', ten: 'Giảng viên tra cứu thù lao cá nhân (3 tab)', module: 'TRA_CUU_PHAN_HOI', nhom: 'Tra cứu cá nhân' },
  { ma: 'tc_gv_xem_chi_tiet', ten: 'Xem chi tiết từng môn dạy, lớp, số tiết thực tế', module: 'TRA_CUU_PHAN_HOI', nhom: 'Tra cứu cá nhân' },
  { ma: 'tc_gv_xac_nhan', ten: 'Giảng viên bấm nút xác nhận số liệu thù lao', module: 'TRA_CUU_PHAN_HOI', nhom: 'Tra cứu cá nhân' },
  { ma: 'tc_gv_in_phieu', ten: 'In phiếu xác nhận thù lao cá nhân', module: 'TRA_CUU_PHAN_HOI', nhom: 'Tra cứu cá nhân' },

  { ma: 'ph_xem_ds', ten: 'Xem danh sách ý kiến phản hồi / đính chính của GV', module: 'TRA_CUU_PHAN_HOI', nhom: 'Phản hồi' },
  { ma: 'ph_gui_moi', ten: 'Gửi phản hồi / khiếu nại số liệu mới', module: 'TRA_CUU_PHAN_HOI', nhom: 'Phản hồi' },
  { ma: 'ph_xu_ly_dinh_chinh', ten: 'Xử lý, chấp thuận và cập nhật số liệu đính chính', module: 'TRA_CUU_PHAN_HOI', nhom: 'Phản hồi' },
  { ma: 'ph_tu_choi', ten: 'Từ chối phản hồi kèm lý do giải thích', module: 'TRA_CUU_PHAN_HOI', nhom: 'Phản hồi' },

  // 6. BÁO CÁO
  { ma: 'bc_th_xem_tong_hop', ten: 'Xem báo cáo thống kê tổng hợp số giờ & kinh phí', module: 'BAO_CAO', nhom: 'Báo cáo tổng hợp' },
  { ma: 'bc_th_xuat_excel', ten: 'Xuất báo cáo thống kê ra Excel', module: 'BAO_CAO', nhom: 'Báo cáo tổng hợp' },
  { ma: 'bc_bb_xem_bien_ban', ten: 'Xem danh sách biên bản nghiệm thu số hóa', module: 'BAO_CAO', nhom: 'Biên bản số hóa' },
  { ma: 'bc_bb_tao_moi', ten: 'Tạo mới biên bản nghiệm thu số hóa', module: 'BAO_CAO', nhom: 'Biên bản số hóa' },
  { ma: 'bc_bb_ky_so', ten: 'Ký số / Xác nhận biên bản nghiệm thu', module: 'BAO_CAO', nhom: 'Biên bản số hóa' },
  { ma: 'bc_bb_in_pdf', ten: 'In biên bản nghiệm thu ra file PDF', module: 'BAO_CAO', nhom: 'Biên bản số hóa' },

  // 7. HỆ THỐNG
  { ma: 'ht_nd_xem_ds', ten: 'Xem danh sách người dùng hệ thống', module: 'HE_THONG', nhom: 'Người dùng' },
  { ma: 'ht_nd_them_moi', ten: 'Thêm mới tài khoản người dùng', module: 'HE_THONG', nhom: 'Người dùng' },
  { ma: 'ht_nd_sua', ten: 'Chỉnh sửa thông tin người dùng', module: 'HE_THONG', nhom: 'Người dùng' },
  { ma: 'ht_nd_khoa_tk', ten: 'Khóa / Mở khóa tài khoản', module: 'HE_THONG', nhom: 'Người dùng' },
  { ma: 'ht_nd_import', ten: 'Nhập danh sách người dùng từ Excel', module: 'HE_THONG', nhom: 'Người dùng' },
  { ma: 'ht_nd_export', ten: 'Xuất danh sách người dùng ra Excel', module: 'HE_THONG', nhom: 'Người dùng' },

  { ma: 'ht_pq_xem_ds', ten: 'Xem vai trò & ma trận phân quyền', module: 'HE_THONG', nhom: 'Vai trò & Phân quyền' },
  { ma: 'ht_pq_tao_vai_tro', ten: 'Thêm mới vai trò', module: 'HE_THONG', nhom: 'Vai trò & Phân quyền' },
  { ma: 'ht_pq_gan_quyen', ten: 'Bật / Tắt quyền hạn chi tiết cho từng vai trò', module: 'HE_THONG', nhom: 'Vai trò & Phân quyền' },
  { ma: 'ht_pq_them_thanh_vien', ten: 'Gán người dùng vào vai trò', module: 'HE_THONG', nhom: 'Vai trò & Phân quyền' },
  { ma: 'ht_pq_xoa_thanh_vien', ten: 'Xóa người dùng khỏi vai trò', module: 'HE_THONG', nhom: 'Vai trò & Phân quyền' },

  { ma: 'ht_ch_xem', ten: 'Xem cấu hình định mức & đơn giá thù lao', module: 'HE_THONG', nhom: 'Cấu hình hệ thống' },
  { ma: 'ht_ch_cap_nhat', ten: 'Cập nhật định mức thù lao, hệ số lớp và thuế TNCN', module: 'HE_THONG', nhom: 'Cấu hình hệ thống' },

  { ma: 'ht_nk_xem_ds', ten: 'Xem nhật ký truy cập & thao tác hệ thống', module: 'HE_THONG', nhom: 'Nhật ký hệ thống' },
  { ma: 'ht_nk_export', ten: 'Xuất nhật ký hệ thống ra Excel', module: 'HE_THONG', nhom: 'Nhật ký hệ thống' },
];

async function run() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'tdu_thantoan_db',
  });

  console.log('Connected to MySQL.');
  await connection.query('SET FOREIGN_KEY_CHECKS = 0');
  await connection.query('TRUNCATE TABLE vai_tro_quyen');
  await connection.query('TRUNCATE TABLE quyen_han');

  for (let i = 0; i < GRANULAR_PERMISSIONS.length; i++) {
    const p = GRANULAR_PERMISSIONS[i];
    await connection.query(
      `INSERT INTO quyen_han (id, ma_quyen, ten_quyen, module, nhom_chuc_nang)
       VALUES (?, ?, ?, ?, ?)`,
      [i + 1, p.ma, p.ten, p.module, p.nhom]
    );
  }
  console.log(`Inserted ${GRANULAR_PERMISSIONS.length} granular permissions into quyen_han table.`);

  // Lấy danh sách vai trò
  const [roles]: any = await connection.query('SELECT id, ma_vai_tro FROM vai_tro');

  // Gán quyền cho từng vai trò theo quy tắc hệ thống
  for (const r of roles) {
    let allowedPrefixes: string[] = [];

    if (r.ma_vai_tro === 'QUAN_TRI_VIEN_HE_THONG' || r.ma_vai_tro === 'PHONG_CONG_NGHE_THONG_TIN') {
      // Toàn quyền: tất cả các quyền
      allowedPrefixes = ['*'];
    } else if (r.ma_vai_tro === 'PHONG_QUAN_LY_DAO_TAO') {
      // Giờ giảng toàn quyền + phản hồi
      allowedPrefixes = ['gg_', 'ph_xem_ds', 'ph_xu_ly_dinh_chinh', 'ph_tu_choi'];
    } else if (r.ma_vai_tro === 'PHONG_QLKH_HTQT') {
      // NCKH toàn quyền + phản hồi
      allowedPrefixes = ['nckh_', 'ph_xem_ds', 'ph_xu_ly_dinh_chinh', 'ph_tu_choi'];
    } else if (r.ma_vai_tro === 'PHONG_TAI_CHINH_KE_HOACH') {
      // Toàn bộ ngoại trừ hệ thống
      allowedPrefixes = ['gg_', 'nckh_', 'ctk_', 'tt_', 'tc_', 'ph_', 'bc_'];
    } else if (r.ma_vai_tro === 'GIANG_VIEN') {
      // Giảng viên tra cứu & phản hồi
      allowedPrefixes = ['tc_gv_', 'ph_gui_moi'];
    } else if (r.ma_vai_tro.startsWith('KHOA_')) {
      // Khoa: Tra cứu thù lao cá nhân + gửi phản hồi
      allowedPrefixes = ['tc_gv_', 'ph_gui_moi'];
    } else {
      // Đơn vị khác không có quyền nghiệp vụ
      allowedPrefixes = [];
    }

    const [allPerms]: any = await connection.query('SELECT id, ma_quyen FROM quyen_han');
    for (const p of allPerms) {
      let isAllowed = false;
      if (allowedPrefixes.includes('*')) {
        isAllowed = true;
      } else {
        for (const pref of allowedPrefixes) {
          if (p.ma_quyen.startsWith(pref) || p.ma_quyen === pref) {
            isAllowed = true;
            break;
          }
        }
      }

      if (isAllowed) {
        await connection.query(
          `INSERT IGNORE INTO vai_tro_quyen (vai_tro_id, quyen_han_id) VALUES (?, ?)`,
          [r.id, p.id]
        );
      }
    }
  }

  const [countRes]: any = await connection.query('SELECT count(*) as count FROM vai_tro_quyen');
  console.log(`Successfully mapped permissions: ${countRes[0].count} records in vai_tro_quyen.`);

  await connection.query('SET FOREIGN_KEY_CHECKS = 1');
  await connection.end();
  console.log('Permission sync complete!');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
