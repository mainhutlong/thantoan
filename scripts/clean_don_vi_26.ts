import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { FULL_PERSONNEL_245 } from '../src/data/fullPersonnel245.js';

dotenv.config();

export const OFFICIAL_26_UNITS = [
  { id: 1, ma: 'HDCV', ten: 'Hội đồng cố vấn', khoi: 'PHONG_BAN' },
  { id: 2, ma: 'HDT', ten: 'Hội đồng trường', khoi: 'PHONG_BAN' },
  { id: 3, ma: 'BGH', ten: 'Ban Giám hiệu', khoi: 'PHONG_BAN' },
  { id: 4, ma: 'KCB', ten: 'Khoa cơ bản', khoi: 'KHOA' },
  { id: 5, ma: 'KLUAT', ten: 'Khoa Luật', khoi: 'KHOA' },
  { id: 6, ma: 'BPCKT', ten: 'Ban Pháp chế - Kiểm tra', khoi: 'PHONG_BAN' },
  { id: 7, ma: 'TCNCKH', ten: 'Tạp chí NCKH&PTKT', khoi: 'PHONG_BAN' },
  { id: 8, ma: 'KD_DD', ten: 'Khoa Dược - Điều dưỡng', khoi: 'KHOA' },
  { id: 9, ma: 'KT_TC_NH', ten: 'Khoa Kế toán - Tài chính - Ngân hàng', khoi: 'KHOA' },
  { id: 10, ma: 'QTKD_DL', ten: 'Khoa Quản trị kinh doanh - Du lịch', khoi: 'KHOA' },
  { id: 11, ma: 'KT_CN', ten: 'Khoa Kỹ thuật - Công nghệ', khoi: 'KHOA' },
  { id: 12, ma: 'NN_XHNV_TT', ten: 'Khoa Ngoại ngữ - Xã hội nhân văn và Truyền thông', khoi: 'KHOA' },
  { id: 13, ma: 'SHUD', ten: 'Khoa Sinh học ứng dụng', khoi: 'KHOA' },
  { id: 14, ma: 'TCHC', ten: 'Phòng Tổ chức - Hành chính', khoi: 'PHONG_BAN' },
  { id: 15, ma: 'CNTT', ten: 'Phòng Công nghệ thông tin', khoi: 'PHONG_BAN' },
  { id: 16, ma: 'QTTB', ten: 'Phòng Quản trị thiết bị', khoi: 'PHONG_BAN' },
  { id: 17, ma: 'QLDT', ten: 'Phòng Quản lý Đào tạo', khoi: 'PHONG_BAN' },
  { id: 18, ma: 'CTCT_QLSV', ten: 'Phòng Công tác chính trị - Quản lý sinh viên', khoi: 'PHONG_BAN' },
  { id: 19, ma: 'TC_KH', ten: 'Phòng Tài chính - Kế hoạch', khoi: 'PHONG_BAN' },
  { id: 20, ma: 'TS_TT', ten: 'Phòng Tuyển sinh và Truyền thông', khoi: 'PHONG_BAN' },
  { id: 21, ma: 'QLKH_HTQT', ten: 'Phòng Quản lý khoa học và Hợp tác quốc tế', khoi: 'PHONG_BAN' },
  { id: 22, ma: 'KT_DBCLGD', ten: 'Trung tâm Kiểm tra và Đảm bảo chất lượng giáo dục', khoi: 'TRUNG_TAM' },
  { id: 23, ma: 'NN_TH', ten: 'Trung tâm Ngoại ngữ - Tin học', khoi: 'TRUNG_TAM' },
  { id: 24, ma: 'KN_DN', ten: 'Trung tâm Khởi nghiệp Đổi mới sáng tạo Hỗ trợ sinh viên và Hợp tác doanh nghiệp', khoi: 'TRUNG_TAM' },
  { id: 25, ma: 'TV', ten: 'Thư viện', khoi: 'PHONG_BAN' },
  { id: 26, ma: 'VPD', ten: 'Văn phòng Đảng', khoi: 'PHONG_BAN' },
];

async function main() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'tdu_thantoan_db',
  });

  console.log('Connected to MySQL database.');

  await connection.query('SET FOREIGN_KEY_CHECKS = 0');
  await connection.query('TRUNCATE TABLE don_vi');

  for (const d of OFFICIAL_26_UNITS) {
    await connection.query(
      `INSERT INTO don_vi (id, ma_don_vi, ten_don_vi, khoi, trang_thai, created_at)
       VALUES (?, ?, ?, ?, 1, NOW())`,
      [d.id, d.ma, d.ten, d.khoi]
    );
  }
  console.log('Successfully inserted exactly 26 official units into don_vi table (id 1 to 26).');

  // Fetch all users
  const [users]: any = await connection.query('SELECT id, ma_nhan_su, ho_ten, email FROM nguoi_dung');

  let updatedCount = 0;
  for (const u of users) {
    // Find in FULL_PERSONNEL_245
    const p = FULL_PERSONNEL_245.find(
      (item) =>
        item.email?.toLowerCase().trim() === u.email?.toLowerCase().trim() ||
        item.maNhanSu?.toLowerCase().trim() === u.ma_nhan_su?.toLowerCase().trim() ||
        item.hoTen?.toLowerCase().trim() === u.ho_ten?.toLowerCase().trim()
    );

    const rawUnit = (p?.donVi || '').replace(/\r?\n/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();

    let matchedId = 4; // default Khoa cơ bản
    for (const d of OFFICIAL_26_UNITS) {
      const dName = d.ten.replace(/\s+/g, ' ').toLowerCase().trim();
      if (rawUnit === dName || rawUnit.includes(dName) || dName.includes(rawUnit)) {
        matchedId = d.id;
        break;
      }
    }

    await connection.query('UPDATE nguoi_dung SET don_vi_id = ? WHERE id = ?', [matchedId, u.id]);
    updatedCount++;
  }

  console.log(`Updated ${updatedCount} users with normalized don_vi_id (1..26).`);

  await connection.query('SET FOREIGN_KEY_CHECKS = 1');
  await connection.end();
  console.log('Done!');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
