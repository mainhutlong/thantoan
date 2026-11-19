import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function migrate() {
  console.log('Connecting to MySQL tdu_thantoan_db...');
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'tdu_thantoan_db',
    multipleStatements: true,
  });

  console.log('Connected! Executing schema migration...');

  // 1. Table dot_thanh_toan
  await conn.query(`
    CREATE TABLE IF NOT EXISTS \`dot_thanh_toan\` (
      \`id\` int(11) NOT NULL AUTO_INCREMENT,
      \`ma_dot\` varchar(50) NOT NULL COMMENT 'Mã đợt chuẩn hóa: VD DOT1_2026_2027_HK1, QUYET_TOAN_2026_2027',
      \`ten_dot\` varchar(255) NOT NULL COMMENT 'Tên đợt: VD Thanh toán Giờ giảng & Thù lao Đợt 1 - Học kỳ 1 (2026-2027)',
      \`nam_hoc\` varchar(20) NOT NULL DEFAULT '2026 - 2027' COMMENT 'Năm học áp dụng',
      \`hoc_ky\` varchar(20) NOT NULL DEFAULT 'Học kỳ 1' COMMENT 'Học kỳ áp dụng: Học kỳ 1, Học kỳ 2, Học kỳ Hè',
      \`loai_dot\` enum('TAM_UNG','DOT_1','DOT_2','QUYET_TOAN_NAM') NOT NULL DEFAULT 'DOT_1' COMMENT 'Tính chất đợt thanh toán',
      \`trang_thai\` enum('KHOI_TAO','DANG_DOI_SOAT','DA_KHOA_SO','DA_CHI_TRA') NOT NULL DEFAULT 'DANG_DOI_SOAT' COMMENT 'Khóa sổ chống sửa đổi dữ liệu',
      \`ngay_bat_dau\` date DEFAULT NULL,
      \`ngay_ket_thuc\` date DEFAULT NULL,
      \`ngay_khoa_so\` datetime DEFAULT NULL COMMENT 'Thời điểm chốt sổ đóng băng số liệu',
      \`nguoi_khoa_so_id\` bigint(20) DEFAULT NULL COMMENT 'ID cán bộ khóa sổ (FK -> nguoi_dung.id)',
      \`tong_kinh_phi\` decimal(18,2) DEFAULT 0.00 COMMENT 'Tổng kinh phí thực nhận của đợt',
      \`ghi_chu\` text DEFAULT NULL,
      \`created_at\` timestamp NOT NULL DEFAULT current_timestamp(),
      \`updated_at\` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
      PRIMARY KEY (\`id\`),
      UNIQUE KEY \`idx_ma_dot\` (\`ma_dot\`),
      KEY \`fk_dot_nguoi_khoa\` (\`nguoi_khoa_so_id\`),
      CONSTRAINT \`fk_dot_nguoi_khoa\` FOREIGN KEY (\`nguoi_khoa_so_id\`) REFERENCES \`nguoi_dung\` (\`id\`) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Danh mục Đợt thanh toán thù lao toàn trường theo từng kỳ/năm học';
  `);
  console.log('✓ Created/verified table: dot_thanh_toan');

  // 2. Table lich_su_import_file
  await conn.query(`
    CREATE TABLE IF NOT EXISTS \`lich_su_import_file\` (
      \`id\` int(11) NOT NULL AUTO_INCREMENT,
      \`dot_id\` int(11) NOT NULL COMMENT 'FK gắn với đợt thanh toán cụ thể',
      \`phan_he\` enum('NCKH_BAI_BAO','NCKH_SEMINAR','NCKH_DE_TAI','GIO_GIANG','CONG_TAC_KHAC') NOT NULL COMMENT 'Phân hệ import dữ liệu',
      \`ten_file_goc\` varchar(255) NOT NULL COMMENT 'Tên file Excel gốc khi tải lên',
      \`duong_dan_file\` varchar(500) DEFAULT NULL COMMENT 'Nơi lưu file gốc đính kèm trên máy chủ',
      \`so_dong_hop_le\` int(11) DEFAULT 0 COMMENT 'Số dòng import thành công',
      \`so_dong_loi\` int(11) DEFAULT 0 COMMENT 'Số dòng phát hiện lỗi',
      \`tong_gio_qc\` decimal(10,2) DEFAULT 0.00 COMMENT 'Tổng số giờ quy đổi từ file nộp',
      \`nguoi_import_id\` bigint(20) NOT NULL COMMENT 'Tài khoản người thực hiện import (nguoi_dung.id)',
      \`don_vi_id\` int(11) DEFAULT NULL COMMENT 'Đơn vị nộp file (don_vi.id)',
      \`thoi_gian_import\` timestamp NOT NULL DEFAULT current_timestamp(),
      \`ip_address\` varchar(50) DEFAULT NULL,
      \`ghi_chu\` varchar(255) DEFAULT NULL,
      PRIMARY KEY (\`id\`),
      KEY \`fk_import_dot\` (\`dot_id\`),
      KEY \`fk_import_nguoi\` (\`nguoi_import_id\`),
      KEY \`fk_import_don_vi\` (\`don_vi_id\`),
      CONSTRAINT \`fk_import_dot\` FOREIGN KEY (\`dot_id\`) REFERENCES \`dot_thanh_toan\` (\`id\`) ON DELETE CASCADE,
      CONSTRAINT \`fk_import_nguoi\` FOREIGN KEY (\`nguoi_import_id\`) REFERENCES \`nguoi_dung\` (\`id\`),
      CONSTRAINT \`fk_import_don_vi\` FOREIGN KEY (\`don_vi_id\`) REFERENCES \`don_vi\` (\`id\`) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Nhật ký lưu vết trách nhiệm nộp và import dữ liệu Excel';
  `);
  console.log('✓ Created/verified table: lich_su_import_file');

  // 3.1. Table nckh_bai_bao
  await conn.query(`
    CREATE TABLE IF NOT EXISTS \`nckh_bai_bao\` (
      \`id\` bigint(20) NOT NULL AUTO_INCREMENT,
      \`dot_id\` int(11) NOT NULL COMMENT 'FK đợt thanh toán',
      \`import_id\` int(11) DEFAULT NULL COMMENT 'FK file import gốc',
      \`stt_file\` int(11) DEFAULT NULL COMMENT 'STT trên file Excel nộp',
      \`ma_giang_vien\` varchar(50) NOT NULL COMMENT 'Mã nhân sự TDU',
      \`ho_ten\` varchar(150) NOT NULL COMMENT 'Họ tên giảng viên',
      \`hoc_vi\` varchar(50) DEFAULT 'Thạc sĩ' COMMENT 'Học vị: TS, ThS, CN...',
      \`don_vi\` varchar(150) NOT NULL COMMENT 'Khoa / Đơn vị quản lý',
      \`ten_bai_bao\` varchar(500) NOT NULL COMMENT 'Tên bài báo khoa học đã công bố',
      \`loai_tap_chi\` varchar(100) DEFAULT 'Tạp chí Khoa học' COMMENT 'Phân loại Scopus/ISI/Trong nước/Hội thảo',
      \`gio_quy_doi\` decimal(8,2) NOT NULL DEFAULT 0.00 COMMENT 'Số giờ quy chuẩn quy đổi',
      \`don_gia\` decimal(15,2) DEFAULT 120000.00 COMMENT 'Đơn giá định mức thù lao/giờ (VND)',
      \`thanh_tien\` decimal(15,2) DEFAULT 0.00 COMMENT 'Thành tiền = gio_quy_doi * don_gia',
      \`trang_thai_duyet\` enum('CHO_DUYET','DA_DUYET','TU_CHOI') DEFAULT 'CHO_DUYET' COMMENT 'Trạng thái thẩm định',
      \`nguoi_duyet_id\` bigint(20) DEFAULT NULL COMMENT 'Cán bộ QLKH thẩm duyệt (nguoi_dung.id)',
      \`ghi_chu\` text DEFAULT NULL,
      \`created_at\` timestamp NOT NULL DEFAULT current_timestamp(),
      \`updated_at\` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
      PRIMARY KEY (\`id\`),
      KEY \`fk_nckh_bb_dot\` (\`dot_id\`),
      KEY \`fk_nckh_bb_import\` (\`import_id\`),
      KEY \`idx_nckh_bb_magv\` (\`ma_giang_vien\`),
      CONSTRAINT \`fk_nckh_bb_dot\` FOREIGN KEY (\`dot_id\`) REFERENCES \`dot_thanh_toan\` (\`id\`) ON DELETE CASCADE,
      CONSTRAINT \`fk_nckh_bb_import\` FOREIGN KEY (\`import_id\`) REFERENCES \`lich_su_import_file\` (\`id\`) ON DELETE SET NULL,
      CONSTRAINT \`fk_nckh_bb_nguoi_duyet\` FOREIGN KEY (\`nguoi_duyet_id\`) REFERENCES \`nguoi_dung\` (\`id\`) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Dữ liệu Nghiên cứu khoa học: Bài báo khoa học';
  `);
  console.log('✓ Created/verified table: nckh_bai_bao');

  // 3.2. Table nckh_seminar
  await conn.query(`
    CREATE TABLE IF NOT EXISTS \`nckh_seminar\` (
      \`id\` bigint(20) NOT NULL AUTO_INCREMENT,
      \`dot_id\` int(11) NOT NULL COMMENT 'FK đợt thanh toán',
      \`import_id\` int(11) DEFAULT NULL COMMENT 'FK file import gốc',
      \`stt_file\` int(11) DEFAULT NULL COMMENT 'STT trên file Excel nộp',
      \`ma_giang_vien\` varchar(50) NOT NULL COMMENT 'Mã nhân sự TDU',
      \`ho_ten\` varchar(150) NOT NULL COMMENT 'Họ tên giảng viên',
      \`hoc_vi\` varchar(50) DEFAULT 'Thạc sĩ' COMMENT 'Học vị: TS, ThS, CN...',
      \`don_vi\` varchar(150) NOT NULL COMMENT 'Khoa / Đơn vị quản lý',
      \`ten_seminar\` varchar(500) NOT NULL COMMENT 'Tên bài báo cáo Seminar / Chuyên đề học thuật',
      \`cap_to_chuc\` varchar(100) DEFAULT 'Cấp Khoa/Bộ môn' COMMENT 'Cấp Khoa / Cấp Trường',
      \`gio_quy_doi\` decimal(8,2) NOT NULL DEFAULT 0.00 COMMENT 'Số giờ quy chuẩn quy đổi',
      \`don_gia\` decimal(15,2) DEFAULT 120000.00 COMMENT 'Đơn giá định mức thù lao/giờ (VND)',
      \`thanh_tien\` decimal(15,2) DEFAULT 0.00 COMMENT 'Thành tiền = gio_quy_doi * don_gia',
      \`trang_thai_duyet\` enum('CHO_DUYET','DA_DUYET','TU_CHOI') DEFAULT 'CHO_DUYET' COMMENT 'Trạng thái thẩm định',
      \`nguoi_duyet_id\` bigint(20) DEFAULT NULL COMMENT 'Cán bộ QLKH thẩm duyệt (nguoi_dung.id)',
      \`ghi_chu\` text DEFAULT NULL,
      \`created_at\` timestamp NOT NULL DEFAULT current_timestamp(),
      \`updated_at\` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
      PRIMARY KEY (\`id\`),
      KEY \`fk_nckh_sm_dot\` (\`dot_id\`),
      KEY \`fk_nckh_sm_import\` (\`import_id\`),
      KEY \`idx_nckh_sm_magv\` (\`ma_giang_vien\`),
      CONSTRAINT \`fk_nckh_sm_dot\` FOREIGN KEY (\`dot_id\`) REFERENCES \`dot_thanh_toan\` (\`id\`) ON DELETE CASCADE,
      CONSTRAINT \`fk_nckh_sm_import\` FOREIGN KEY (\`import_id\`) REFERENCES \`lich_su_import_file\` (\`id\`) ON DELETE SET NULL,
      CONSTRAINT \`fk_nckh_sm_nguoi_duyet\` FOREIGN KEY (\`nguoi_duyet_id\`) REFERENCES \`nguoi_dung\` (\`id\`) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Dữ liệu Nghiên cứu khoa học: Seminar / Chuyên đề';
  `);
  console.log('✓ Created/verified table: nckh_seminar');

  // 3.3. Table nckh_de_tai
  await conn.query(`
    CREATE TABLE IF NOT EXISTS \`nckh_de_tai\` (
      \`id\` bigint(20) NOT NULL AUTO_INCREMENT,
      \`dot_id\` int(11) NOT NULL COMMENT 'FK đợt thanh toán',
      \`import_id\` int(11) DEFAULT NULL COMMENT 'FK file import gốc',
      \`stt_file\` int(11) DEFAULT NULL COMMENT 'STT trên file Excel nộp',
      \`ma_giang_vien\` varchar(50) NOT NULL COMMENT 'Mã nhân sự TDU',
      \`ho_ten\` varchar(150) NOT NULL COMMENT 'Họ tên giảng viên',
      \`hoc_vi\` varchar(50) DEFAULT 'Thạc sĩ' COMMENT 'Học vị: TS, ThS, CN...',
      \`don_vi\` varchar(150) NOT NULL COMMENT 'Khoa / Đơn vị quản lý',
      \`ten_de_tai\` varchar(500) NOT NULL COMMENT 'Tên đề tài NCKH',
      \`cap_de_tai\` varchar(100) DEFAULT 'Cấp Cơ sở' COMMENT 'Cấp Bộ/Tỉnh, Cấp Cơ sở (Trường)',
      \`vai_tro_de_tai\` varchar(100) DEFAULT 'Chủ nhiệm' COMMENT 'Chủ nhiệm, Thư ký, Thành viên chính',
      \`gio_quy_doi\` decimal(8,2) NOT NULL DEFAULT 0.00 COMMENT 'Số giờ quy chuẩn quy đổi',
      \`don_gia\` decimal(15,2) DEFAULT 120000.00 COMMENT 'Đơn giá định mức thù lao/giờ (VND)',
      \`thanh_tien\` decimal(15,2) DEFAULT 0.00 COMMENT 'Thành tiền = gio_quy_doi * don_gia',
      \`trang_thai_duyet\` enum('CHO_DUYET','DA_DUYET','TU_CHOI') DEFAULT 'CHO_DUYET' COMMENT 'Trạng thái thẩm định',
      \`nguoi_duyet_id\` bigint(20) DEFAULT NULL COMMENT 'Cán bộ QLKH thẩm duyệt (nguoi_dung.id)',
      \`ghi_chu\` text DEFAULT NULL,
      \`created_at\` timestamp NOT NULL DEFAULT current_timestamp(),
      \`updated_at\` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
      PRIMARY KEY (\`id\`),
      KEY \`fk_nckh_dt_dot\` (\`dot_id\`),
      KEY \`fk_nckh_dt_import\` (\`import_id\`),
      KEY \`idx_nckh_dt_magv\` (\`ma_giang_vien\`),
      CONSTRAINT \`fk_nckh_dt_dot\` FOREIGN KEY (\`dot_id\`) REFERENCES \`dot_thanh_toan\` (\`id\`) ON DELETE CASCADE,
      CONSTRAINT \`fk_nckh_dt_import\` FOREIGN KEY (\`import_id\`) REFERENCES \`lich_su_import_file\` (\`id\`) ON DELETE SET NULL,
      CONSTRAINT \`fk_nckh_dt_nguoi_duyet\` FOREIGN KEY (\`nguoi_duyet_id\`) REFERENCES \`nguoi_dung\` (\`id\`) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Dữ liệu Nghiên cứu khoa học: Đề tài NCKH các cấp';
  `);
  console.log('✓ Created/verified table: nckh_de_tai');

  // 4. Table thanh_toan_gio_giang
  await conn.query(`
    CREATE TABLE IF NOT EXISTS \`thanh_toan_gio_giang\` (
      \`id\` bigint(20) NOT NULL AUTO_INCREMENT,
      \`dot_id\` int(11) NOT NULL COMMENT 'FK đợt thanh toán',
      \`import_id\` int(11) DEFAULT NULL COMMENT 'FK file import gốc',
      \`stt_file\` int(11) DEFAULT NULL,
      \`ma_giang_vien\` varchar(50) NOT NULL COMMENT 'Mã nhân sự TDU',
      \`ho_ten\` varchar(150) NOT NULL,
      \`hoc_vi\` varchar(50) DEFAULT 'Thạc sĩ',
      \`don_vi\` varchar(150) NOT NULL COMMENT 'Khoa chuyên môn',
      \`ma_hoc_phan\` varchar(50) NOT NULL COMMENT 'Mã môn học, VD: CS101',
      \`ten_hoc_phan\` varchar(255) NOT NULL COMMENT 'Tên môn học giảng dạy',
      \`ma_lop_hoc_phan\` varchar(50) DEFAULT NULL COMMENT 'Lớp học phần, VD: 24DH_CNTT01',
      \`so_tin_chi\` decimal(4,1) DEFAULT 3.0,
      \`so_sinh_vien\` int(11) DEFAULT 40,
      \`gio_thuc_giang\` decimal(8,2) DEFAULT 45.00 COMMENT 'Số tiết dạy thực tế trên lớp',
      \`he_so_lop\` decimal(4,2) DEFAULT 1.00 COMMENT 'Hệ số sĩ số đông',
      \`he_so_ngoai_gio\` decimal(4,2) DEFAULT 1.00 COMMENT 'Hệ số dạy thứ 7, CN, buổi tối',
      \`gio_quy_chuan\` decimal(8,2) NOT NULL DEFAULT 45.00 COMMENT 'Tiết chuẩn sau khi nhân hệ số',
      \`don_gia\` decimal(15,2) DEFAULT 120000.00 COMMENT 'Đơn giá tiết thù lao',
      \`thanh_tien\` decimal(15,2) DEFAULT 0.00 COMMENT 'Thành tiền = gio_quy_chuan * don_gia',
      \`trang_thai_duyet\` enum('CHO_DUYET','DA_DUYET','TU_CHOI') DEFAULT 'DA_DUYET',
      \`nguoi_duyet_id\` bigint(20) DEFAULT NULL COMMENT 'Phòng QL Đào tạo duyệt (nguoi_dung.id)',
      \`ghi_chu\` text DEFAULT NULL,
      \`created_at\` timestamp NOT NULL DEFAULT current_timestamp(),
      \`updated_at\` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
      PRIMARY KEY (\`id\`),
      KEY \`fk_tt_gg_dot\` (\`dot_id\`),
      KEY \`fk_tt_gg_import\` (\`import_id\`),
      KEY \`idx_tt_gg_magv\` (\`ma_giang_vien\`),
      CONSTRAINT \`fk_tt_gg_dot\` FOREIGN KEY (\`dot_id\`) REFERENCES \`dot_thanh_toan\` (\`id\`) ON DELETE CASCADE,
      CONSTRAINT \`fk_tt_gg_import\` FOREIGN KEY (\`import_id\`) REFERENCES \`lich_su_import_file\` (\`id\`) ON DELETE SET NULL,
      CONSTRAINT \`fk_tt_gg_nguoi_duyet\` FOREIGN KEY (\`nguoi_duyet_id\`) REFERENCES \`nguoi_dung\` (\`id\`) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Dữ liệu chi tiết Thanh toán Giờ giảng dạy lý thuyết, thực hành, đồ án';
  `);
  console.log('✓ Created/verified table: thanh_toan_gio_giang');

  // 5.1. Table dm_cong_tac_khac
  await conn.query(`
    CREATE TABLE IF NOT EXISTS \`dm_cong_tac_khac\` (
      \`id\` int(11) NOT NULL AUTO_INCREMENT,
      \`ma_cong_viec\` varchar(50) NOT NULL COMMENT 'Mã định danh công việc',
      \`ten_cong_viec\` varchar(255) NOT NULL COMMENT 'Tên nội dung công việc theo Quy định TDU',
      \`nhom_cong_tac\` enum('KHAO_THI','TUYEN_SINH','CO_VAN_HOC_TAP','DO_AN_KLTN','HOI_DONG_CHUYEN_MON','KIEM_NHIEM_KHAC') NOT NULL,
      \`don_vi_tinh\` varchar(50) NOT NULL DEFAULT 'Buổi' COMMENT 'Tiết, Buổi, Bài, Đề, Lớp/HK, Đợt',
      \`dinh_muc_gio_qc\` decimal(6,2) NOT NULL DEFAULT 1.00 COMMENT 'Định mức quy đổi ra giờ QC/đơn vị',
      \`don_gia_mac_dinh\` decimal(15,2) DEFAULT 120000.00,
      \`phong_ban_phu_trach\` varchar(100) DEFAULT 'Khảo thí / ĐBCL / CTCT-HSSV',
      \`ghi_chu\` varchar(255) DEFAULT NULL,
      PRIMARY KEY (\`id\`),
      UNIQUE KEY \`idx_ma_cong_viec\` (\`ma_cong_viec\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Bảng chuẩn hóa 40 danh mục công tác khác toàn trường';
  `);
  console.log('✓ Created/verified table: dm_cong_tac_khac');

  // 5.2. Table thanh_toan_cong_tac_khac
  await conn.query(`
    CREATE TABLE IF NOT EXISTS \`thanh_toan_cong_tac_khac\` (
      \`id\` bigint(20) NOT NULL AUTO_INCREMENT,
      \`dot_id\` int(11) NOT NULL COMMENT 'FK đợt thanh toán',
      \`import_id\` int(11) DEFAULT NULL COMMENT 'FK file import gốc',
      \`stt_file\` int(11) DEFAULT NULL,
      \`ma_cong_viec\` varchar(50) NOT NULL COMMENT 'FK -> dm_cong_tac_khac.ma_cong_viec',
      \`ma_giang_vien\` varchar(50) NOT NULL COMMENT 'Mã nhân sự TDU',
      \`ho_ten\` varchar(150) NOT NULL,
      \`hoc_vi\` varchar(50) DEFAULT 'Thạc sĩ',
      \`don_vi\` varchar(150) NOT NULL,
      \`noi_dung_cong_tac\` varchar(500) NOT NULL COMMENT 'Chi tiết nhiệm vụ thực tế (VD: Coi thi HP CS101 phòng A201)',
      \`so_luong\` decimal(8,2) NOT NULL DEFAULT 1.00 COMMENT 'Số bài, số buổi, số đề, số lớp',
      \`don_vi_tinh\` varchar(50) DEFAULT 'Buổi',
      \`gio_quy_chuan\` decimal(8,2) NOT NULL DEFAULT 0.00 COMMENT 'Tổng số giờ quy chuẩn được duyệt',
      \`don_gia\` decimal(15,2) DEFAULT 120000.00,
      \`thanh_tien\` decimal(15,2) DEFAULT 0.00 COMMENT 'Thành tiền = gio_quy_chuan * don_gia',
      \`trang_thai_duyet\` enum('CHO_DUYET','DA_DUYET','TU_CHOI') DEFAULT 'CHO_DUYET',
      \`nguoi_duyet_id\` bigint(20) DEFAULT NULL COMMENT 'Trưởng đơn vị phụ trách thẩm định',
      \`ghi_chu\` text DEFAULT NULL,
      \`created_at\` timestamp NOT NULL DEFAULT current_timestamp(),
      \`updated_at\` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
      PRIMARY KEY (\`id\`),
      KEY \`fk_tt_ctk_dot\` (\`dot_id\`),
      KEY \`fk_tt_ctk_import\` (\`import_id\`),
      KEY \`fk_tt_ctk_macv\` (\`ma_cong_viec\`),
      KEY \`idx_tt_ctk_magv\` (\`ma_giang_vien\`),
      CONSTRAINT \`fk_tt_ctk_dot\` FOREIGN KEY (\`dot_id\`) REFERENCES \`dot_thanh_toan\` (\`id\`) ON DELETE CASCADE,
      CONSTRAINT \`fk_tt_ctk_import\` FOREIGN KEY (\`import_id\`) REFERENCES \`lich_su_import_file\` (\`id\`) ON DELETE SET NULL,
      CONSTRAINT \`fk_tt_ctk_macv\` FOREIGN KEY (\`ma_cong_viec\`) REFERENCES \`dm_cong_tac_khac\` (\`ma_cong_viec\`),
      CONSTRAINT \`fk_tt_ctk_nguoi_duyet\` FOREIGN KEY (\`nguoi_duyet_id\`) REFERENCES \`nguoi_dung\` (\`id\`) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Dữ liệu chi tiết Thanh toán các công tác khác (Khảo thí, Tuyển sinh, Cố vấn...)';
  `);
  console.log('✓ Created/verified table: thanh_toan_cong_tac_khac');

  // 6.1. VIEW v_nckh_tong_hop
  await conn.query(`
    CREATE OR REPLACE VIEW \`v_nckh_tong_hop\` AS
    SELECT 
      'BAI_BAO' AS \`loai_hoat_dong\`,
      \`id\` AS \`ban_ghi_id\`,
      \`dot_id\`,
      \`import_id\`,
      \`ma_giang_vien\`,
      \`ho_ten\`,
      \`hoc_vi\`,
      \`don_vi\`,
      \`ten_bai_bao\` AS \`ten_cong_trinh\`,
      \`loai_tap_chi\` AS \`phan_loai\`,
      \`gio_quy_doi\`,
      \`don_gia\`,
      \`thanh_tien\`,
      \`trang_thai_duyet\`,
      \`nguoi_duyet_id\`,
      \`ghi_chu\`,
      \`created_at\`
    FROM \`nckh_bai_bao\`
    UNION ALL
    SELECT 
      'SEMINAR' AS \`loai_hoat_dong\`,
      \`id\` AS \`ban_ghi_id\`,
      \`dot_id\`,
      \`import_id\`,
      \`ma_giang_vien\`,
      \`ho_ten\`,
      \`hoc_vi\`,
      \`don_vi\`,
      \`ten_seminar\` AS \`ten_cong_trinh\`,
      \`cap_to_chuc\` AS \`phan_loai\`,
      \`gio_quy_doi\`,
      \`don_gia\`,
      \`thanh_tien\`,
      \`trang_thai_duyet\`,
      \`nguoi_duyet_id\`,
      \`ghi_chu\`,
      \`created_at\`
    FROM \`nckh_seminar\`
    UNION ALL
    SELECT 
      'DE_TAI' AS \`loai_hoat_dong\`,
      \`id\` AS \`ban_ghi_id\`,
      \`dot_id\`,
      \`import_id\`,
      \`ma_giang_vien\`,
      \`ho_ten\`,
      \`hoc_vi\`,
      \`don_vi\`,
      \`ten_de_tai\` AS \`ten_cong_trinh\`,
      CONCAT(\`cap_de_tai\`, ' (', \`vai_tro_de_tai\`, ')') AS \`phan_loai\`,
      \`gio_quy_doi\`,
      \`don_gia\`,
      \`thanh_tien\`,
      \`trang_thai_duyet\`,
      \`nguoi_duyet_id\`,
      \`ghi_chu\`,
      \`created_at\`
    FROM \`nckh_de_tai\`;
  `);
  console.log('✓ Created/verified VIEW: v_nckh_tong_hop');

  // 6.2. VIEW v_tong_hop_thu_lao_theo_dot
  await conn.query(`
    CREATE OR REPLACE VIEW \`v_tong_hop_thu_lao_theo_dot\` AS
    SELECT 
      d.\`id\` AS \`dot_id\`,
      d.\`ma_dot\`,
      d.\`ten_dot\`,
      d.\`nam_hoc\`,
      d.\`hoc_ky\`,
      d.\`trang_thai\` AS \`trang_thai_dot\`,
      sub.\`ma_giang_vien\`,
      sub.\`ho_ten\`,
      sub.\`hoc_vi\`,
      sub.\`don_vi\`,
      sub.\`gio_gio_giang\`,
      sub.\`tien_gio_giang\`,
      sub.\`gio_nckh\`,
      sub.\`tien_nckh\`,
      sub.\`gio_cong_tac_khac\`,
      sub.\`tien_cong_tac_khac\`,
      (sub.\`gio_gio_giang\` + sub.\`gio_nckh\` + sub.\`gio_cong_tac_khac\`) AS \`tong_gio_quy_chuan\`,
      (sub.\`tien_gio_giang\` + sub.\`tien_nckh\` + sub.\`tien_cong_tac_khac\`) AS \`tong_thu_lao_truoc_thue\`,
      ROUND((sub.\`tien_gio_giang\` + sub.\`tien_nckh\` + sub.\`tien_cong_tac_khac\`) * 0.10, 0) AS \`thue_tncn_10_phan_tram\`,
      ((sub.\`tien_gio_giang\` + sub.\`tien_nckh\` + sub.\`tien_cong_tac_khac\`) - ROUND((sub.\`tien_gio_giang\` + sub.\`tien_nckh\` + sub.\`tien_cong_tac_khac\`) * 0.10, 0)) AS \`thuc_nhan_sau_thue\`
    FROM \`dot_thanh_toan\` d
    JOIN (
      SELECT 
        t.\`dot_id\`,
        t.\`ma_giang_vien\`,
        MAX(t.\`ho_ten\`) AS \`ho_ten\`,
        MAX(t.\`hoc_vi\`) AS \`hoc_vi\`,
        MAX(t.\`don_vi\`) AS \`don_vi\`,
        SUM(CASE WHEN t.\`khoi\` = 'GIO_GIANG' THEN t.\`gio_qc\` ELSE 0 END) AS \`gio_gio_giang\`,
        SUM(CASE WHEN t.\`khoi\` = 'GIO_GIANG' THEN t.\`tien\` ELSE 0 END) AS \`tien_gio_giang\`,
        SUM(CASE WHEN t.\`khoi\` = 'NCKH' THEN t.\`gio_qc\` ELSE 0 END) AS \`gio_nckh\`,
        SUM(CASE WHEN t.\`khoi\` = 'NCKH' THEN t.\`tien\` ELSE 0 END) AS \`tien_nckh\`,
        SUM(CASE WHEN t.\`khoi\` = 'CONG_TAC_KHAC' THEN t.\`gio_qc\` ELSE 0 END) AS \`gio_cong_tac_khac\`,
        SUM(CASE WHEN t.\`khoi\` = 'CONG_TAC_KHAC' THEN t.\`tien\` ELSE 0 END) AS \`tien_cong_tac_khac\`
      FROM (
        SELECT \`dot_id\`, \`ma_giang_vien\`, \`ho_ten\`, \`hoc_vi\`, \`don_vi\`, 'GIO_GIANG' AS \`khoi\`, \`gio_quy_chuan\` AS \`gio_qc\`, \`thanh_tien\` AS \`tien\`
        FROM \`thanh_toan_gio_giang\`
        WHERE \`trang_thai_duyet\` = 'DA_DUYET'
        UNION ALL
        SELECT \`dot_id\`, \`ma_giang_vien\`, \`ho_ten\`, \`hoc_vi\`, \`don_vi\`, 'NCKH' AS \`khoi\`, \`gio_quy_doi\` AS \`gio_qc\`, \`thanh_tien\` AS \`tien\`
        FROM \`v_nckh_tong_hop\`
        WHERE \`trang_thai_duyet\` = 'DA_DUYET'
        UNION ALL
        SELECT \`dot_id\`, \`ma_giang_vien\`, \`ho_ten\`, \`hoc_vi\`, \`don_vi\`, 'CONG_TAC_KHAC' AS \`khoi\`, \`gio_quy_chuan\` AS \`gio_qc\`, \`thanh_tien\` AS \`tien\`
        FROM \`thanh_toan_cong_tac_khac\`
        WHERE \`trang_thai_duyet\` = 'DA_DUYET'
      ) t
      GROUP BY t.\`dot_id\`, t.\`ma_giang_vien\`
    ) sub ON d.\`id\` = sub.\`dot_id\`;
  `);
  console.log('✓ Created/verified VIEW: v_tong_hop_thu_lao_theo_dot');

  // 7. Seed data
  // 7.1. Seed dot_thanh_toan
  await conn.query(`
    INSERT INTO \`dot_thanh_toan\` (\`id\`, \`ma_dot\`, \`ten_dot\`, \`nam_hoc\`, \`hoc_ky\`, \`loai_dot\`, \`trang_thai\`, \`ngay_bat_dau\`, \`ngay_ket_thuc\`, \`ghi_chu\`)
    VALUES (1, 'DOT1_2026_2027_HK1', 'Thanh toán Giờ giảng & Thù lao Đợt 1 - Học kỳ 1 (2026 - 2027)', '2026 - 2027', 'Học kỳ 1', 'DOT_1', 'DANG_DOI_SOAT', '2026-09-01', '2027-01-31', 'Đợt kê khai và quyết toán thù lao HK1 toàn trường')
    ON DUPLICATE KEY UPDATE \`ten_dot\` = VALUES(\`ten_dot\`);
  `);
  console.log('✓ Seeded dot_thanh_toan (DOT1_2026_2027_HK1)');

  // 7.2. Seed dm_cong_tac_khac
  await conn.query(`
    INSERT INTO \`dm_cong_tac_khac\` (\`ma_cong_viec\`, \`ten_cong_viec\`, \`nhom_cong_tac\`, \`don_vi_tinh\`, \`dinh_muc_gio_qc\`, \`phong_ban_phu_trach\`, \`ghi_chu\`) VALUES
    ('KT_COI_THI_CQ', 'Coi thi kết thúc học phần hệ chính quy', 'KHAO_THI', 'Buổi', 2.00, 'Phòng Khảo thí & ĐBCL', 'Quy đổi 2.0 giờ QC / buổi coi thi'),
    ('KT_CHAM_THI_TL', 'Chấm bài thi tự luận kết thúc học phần', 'KHAO_THI', 'Bài', 0.15, 'Phòng Khảo thí & ĐBCL', 'Quy đổi 0.15 giờ QC / bài thi tự luận'),
    ('KT_RA_DE_TL', 'Ra đề thi tự luận và đáp án chính thức', 'KHAO_THI', 'Đề', 3.00, 'Phòng Khảo thí & ĐBCL', 'Quy đổi 3.0 giờ QC / đề thi có đáp án'),
    ('KT_RA_DE_TN', 'Biên soạn ngân hàng câu hỏi trắc nghiệm', 'KHAO_THI', 'Đề', 4.00, 'Phòng Khảo thí & ĐBCL', 'Quy đổi 4.0 giờ QC / bộ đề trắc nghiệm'),
    ('TS_TU_VAN_TRUONG', 'Tham gia đoàn tư vấn tuyển sinh tại trường THPT', 'TUYEN_SINH', 'Buổi', 4.00, 'Trung tâm Tuyển sinh & Truyền thông', 'Quy đổi 4.0 giờ QC / buổi công tác tư vấn'),
    ('TS_TRUC_ONLINE', 'Trực ban tư vấn tuyển sinh trực tuyến/Fanpage', 'TUYEN_SINH', 'Buổi', 2.50, 'Trung tâm Tuyển sinh & Truyền thông', 'Quy đổi 2.5 giờ QC / ca trực tư vấn'),
    ('CVHT_QUAN_LY_LOP', 'Công tác Cố vấn học tập và Quản lý lớp sinh viên', 'CO_VAN_HOC_TAP', 'Lớp/HK', 15.00, 'Phòng Công tác sinh viên', 'Quy đổi 15.0 giờ QC / lớp quản lý trong 1 học kỳ'),
    ('DA_HUONG_DAN_KLTN', 'Hướng dẫn Khóa luận tốt nghiệp đại học', 'DO_AN_KLTN', 'Sinh viên', 10.00, 'Khoa Chuyên môn', 'Quy đổi 10.0 giờ QC / sinh viên bảo vệ thành công'),
    ('DA_CHAM_HOI_DONG_KLTN', 'Ủy viên chấm Hội đồng Khóa luận tốt nghiệp', 'DO_AN_KLTN', 'Buổi', 3.00, 'Khoa Chuyên môn', 'Quy đổi 3.0 giờ QC / buổi hội đồng bảo vệ'),
    ('HD_THAM_DINH_CTDT', 'Hội đồng thẩm định, rà soát chương trình đào tạo', 'HOI_DONG_CHUYEN_MON', 'Buổi', 3.50, 'Phòng QL Đào tạo', 'Quy đổi 3.5 giờ QC / buổi họp chuyên môn'),
    ('KN_TRUC_PHONG_THI_NGHIEM', 'Trực vận hành phòng thí nghiệm / thực hành thực tế', 'KIEM_NHIEM_KHAC', 'Buổi', 2.00, 'Khoa Chuyên môn', 'Quy đổi 2.0 giờ QC / buổi trực hướng dẫn'),
    ('KN_BAN_THANH_TRA_NOI_BO', 'Tham gia đoàn Thanh tra - Giám sát nội bộ', 'KIEM_NHIEM_KHAC', 'Buổi', 3.00, 'Ban Pháp chế - Kiểm tra', 'Quy đổi 3.0 giờ QC / buổi kiểm tra giám sát')
    ON DUPLICATE KEY UPDATE \`ten_cong_viec\` = VALUES(\`ten_cong_viec\`);
  `);
  console.log('✓ Seeded 12 standardized records in dm_cong_tac_khac');

  // 7.3. Seed lich_su_import_file
  await conn.query(`
    INSERT INTO \`lich_su_import_file\` (\`id\`, \`dot_id\`, \`phan_he\`, \`ten_file_goc\`, \`so_dong_hop_le\`, \`tong_gio_qc\`, \`nguoi_import_id\`, \`don_vi_id\`, \`ghi_chu\`)
    VALUES (1, 1, 'NCKH_BAI_BAO', 'Mau_NCKH_Bai_Bao_Khoa_Hoc_TDU_2026_2027.xlsx', 3, 170.00, 1, 17, 'File import bài báo khoa học Đợt 1 HK1')
    ON DUPLICATE KEY UPDATE \`ten_file_goc\` = VALUES(\`ten_file_goc\`);
  `);
  console.log('✓ Seeded initial import log');

  // 7.4. Seed sample test data for Mai Nhựt Long
  await conn.query(`
    INSERT INTO \`nckh_bai_bao\` (\`dot_id\`, \`import_id\`, \`stt_file\`, \`ma_giang_vien\`, \`ho_ten\`, \`hoc_vi\`, \`don_vi\`, \`ten_bai_bao\`, \`loai_tap_chi\`, \`gio_quy_doi\`, \`don_gia\`, \`thanh_tien\`, \`trang_thai_duyet\`, \`nguoi_duyet_id\`, \`ghi_chu\`)
    VALUES (1, 1, 1, 'TDU00128', 'Mai Nhựt Long', 'Thạc sĩ', 'Khoa Công nghệ thông tin', 'A Novel Hybrid Architecture for Distributed Academic Workload Management', 'Scopus / Q2', 120.00, 120000.00, 14400000.00, 'DA_DUYET', 1, 'Đã thẩm định minh chứng xuất bản')
    ON DUPLICATE KEY UPDATE \`ten_bai_bao\` = VALUES(\`ten_bai_bao\`);

    INSERT INTO \`thanh_toan_gio_giang\` (\`dot_id\`, \`import_id\`, \`stt_file\`, \`ma_giang_vien\`, \`ho_ten\`, \`hoc_vi\`, \`don_vi\`, \`ma_hoc_phan\`, \`ten_hoc_phan\`, \`ma_lop_hoc_phan\`, \`so_tin_chi\`, \`so_sinh_vien\`, \`gio_thuc_giang\`, \`he_so_lop\`, \`gio_quy_chuan\`, \`don_gia\`, \`thanh_tien\`, \`trang_thai_duyet\`, \`nguoi_duyet_id\`, \`ghi_chu\`)
    VALUES (1, 1, 1, 'TDU00128', 'Mai Nhựt Long', 'Thạc sĩ', 'Khoa Công nghệ thông tin', 'CNTT301', 'Lập trình ứng dụng Web nâng cao', '24DH_CNTT01', 3.0, 55, 45.00, 1.10, 49.50, 120000.00, 5940000.00, 'DA_DUYET', 1, 'Đã hoàn thành giảng dạy')
    ON DUPLICATE KEY UPDATE \`ten_hoc_phan\` = VALUES(\`ten_hoc_phan\`);

    INSERT INTO \`thanh_toan_cong_tac_khac\` (\`dot_id\`, \`import_id\`, \`stt_file\`, \`ma_cong_viec\`, \`ma_giang_vien\`, \`ho_ten\`, \`hoc_vi\`, \`don_vi\`, \`noi_dung_cong_tac\`, \`so_luong\`, \`don_vi_tinh\`, \`gio_quy_chuan\`, \`don_gia\`, \`thanh_tien\`, \`trang_thai_duyet\`, \`nguoi_duyet_id\`, \`ghi_chu\`)
    VALUES (1, 1, 1, 'KT_COI_THI_CQ', 'TDU00128', 'Mai Nhựt Long', 'Thạc sĩ', 'Khoa Công nghệ thông tin', 'Coi thi kết thúc HP đợt 1 phòng B204', 3.00, 'Buổi', 6.00, 120000.00, 720000.00, 'DA_DUYET', 1, 'Đầy đủ biên bản phòng thi')
    ON DUPLICATE KEY UPDATE \`noi_dung_cong_tac\` = VALUES(\`noi_dung_cong_tac\`);
  `);
  console.log('✓ Seeded sample calculation records for TDU00128');

  // Verify created tables
  const [allTables]: any = await conn.query('SHOW TABLES');
  console.log('\n--- ALL TABLES & VIEWS IN tdu_thantoan_db ---');
  console.table(allTables);

  // Test calculate view
  const [calc]: any = await conn.query('SELECT * FROM v_tong_hop_thu_lao_theo_dot');
  console.log('\n--- TEST QUERY FROM VIEW v_tong_hop_thu_lao_theo_dot ---');
  console.table(calc);

  await conn.end();
  console.log('\nMigration completed successfully!');
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
