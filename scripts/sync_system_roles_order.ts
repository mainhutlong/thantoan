import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { FULL_PERSONNEL_245 } from '../src/data/fullPersonnel245.js';

dotenv.config();

export const ORDERED_ROLES = [
  {
    stt: 1,
    name: 'Quản trị viên hệ thống',
    code: 'QUAN_TRI_VIEN_HE_THONG',
    color: '#dc2626',
    desc: 'Quản trị viên hệ thống (Toàn quyền): Toàn quyền truy cập, quản lý và cấu hình mọi phân hệ trên hệ thống.',
  },
  {
    stt: 2,
    name: 'Hội đồng cố vấn',
    code: 'HOI_DONG_CO_VAN',
    color: '#64748b',
    desc: 'Hội đồng Cố vấn cấp cao của Trường Đại học Tây Đô.',
  },
  {
    stt: 3,
    name: 'Hội đồng trường',
    code: 'HOI_DONG_TRUONG',
    color: '#6366f1',
    desc: 'Hội đồng Trường Đại học Tây Đô.',
  },
  {
    stt: 4,
    name: 'Ban Giám hiệu',
    code: 'BAN_GIAM_HIEU',
    color: '#9333ea',
    desc: 'Ban Giám hiệu Trường Đại học Tây Đô - Phê duyệt tổng hợp và chỉ đạo vận hành.',
  },
  {
    stt: 5,
    name: 'Phòng Quản lý Đào tạo',
    code: 'PHONG_QUAN_LY_DAO_TAO',
    color: '#2563eb',
    desc: 'Phòng Quản lý Đào tạo: Thấy được menu Thanh toán giờ giảng (toàn quyền) và Phản hồi của giảng viên.',
  },
  {
    stt: 6,
    name: 'Phòng Quản lý khoa học và Hợp tác quốc tế',
    code: 'PHONG_QLKH_HTQT',
    color: '#0891b2',
    desc: 'Phòng Quản lý khoa học và Hợp tác quốc tế: Thấy được menu Nghiên cứu khoa học (toàn quyền) và Phản hồi của giảng viên.',
  },
  {
    stt: 7,
    name: 'Giảng viên',
    code: 'GIANG_VIEN',
    color: '#0284c7',
    desc: 'Giảng viên: Tra cứu giờ giảng, NCKH, thù lao cá nhân và gửi phản hồi xác nhận.',
  },
  {
    stt: 8,
    name: 'Phòng Tài chính - Kế hoạch',
    code: 'PHONG_TAI_CHINH_KE_HOACH',
    color: '#16a34a',
    desc: 'Phòng Tài chính - Kế hoạch: Xem được toàn bộ số liệu thống kê, tổng hợp thanh toán và chi trả tài chính UNC (ngoại trừ menu Hệ thống).',
  },
  {
    stt: 9,
    name: 'Khoa cơ bản',
    code: 'KHOA_CO_BAN',
    color: '#0284c7',
    desc: 'Khoa Cơ bản - Giảng viên tra cứu thù lao giảng dạy, NCKH cá nhân và gửi phản hồi.',
  },
  {
    stt: 10,
    name: 'Khoa Luật',
    code: 'KHOA_LUAT',
    color: '#0284c7',
    desc: 'Khoa Luật - Giảng viên tra cứu thù lao giảng dạy, NCKH cá nhân và gửi phản hồi.',
  },
  {
    stt: 11,
    name: 'Ban Pháp chế - Kiểm tra',
    code: 'BAN_PHAP_CHE_KIEM_TRA',
    color: '#64748b',
    desc: 'Ban Pháp chế - Kiểm tra.',
  },
  {
    stt: 12,
    name: 'Tạp chí NCKH&PTKT',
    code: 'TAP_CHI_NCKH_PTKT',
    color: '#0d9488',
    desc: 'Tạp chí Nghiên cứu Khoa học & Phát triển Kinh tế.',
  },
  {
    stt: 13,
    name: 'Khoa Dược - Điều dưỡng',
    code: 'KHOA_DUOC_DIEU_DUONG',
    color: '#0284c7',
    desc: 'Khoa Dược - Điều dưỡng - Giảng viên tra cứu thù lao giảng dạy, NCKH cá nhân và gửi phản hồi.',
  },
  {
    stt: 14,
    name: 'Khoa Kế toán - Tài chính - Ngân hàng',
    code: 'KHOA_KT_TC_NH',
    color: '#0284c7',
    desc: 'Khoa Kế toán - Tài chính - Ngân hàng - Giảng viên tra cứu thù lao cá nhân và gửi phản hồi.',
  },
  {
    stt: 15,
    name: 'Khoa Quản trị kinh doanh - Du lịch',
    code: 'KHOA_QTKD_DU_LICH',
    color: '#0284c7',
    desc: 'Khoa Quản trị kinh doanh - Du lịch - Giảng viên tra cứu thù lao cá nhân và gửi phản hồi.',
  },
  {
    stt: 16,
    name: 'Khoa Kỹ thuật - Công nghệ',
    code: 'KHOA_KY_THUAT_CONG_NGHE',
    color: '#0284c7',
    desc: 'Khoa Kỹ thuật - Công nghệ - Giảng viên tra cứu thù lao cá nhân và gửi phản hồi.',
  },
  {
    stt: 17,
    name: 'Khoa Ngoại ngữ - Xã hội nhân văn và Truyền thông',
    code: 'KHOA_NN_XHNV_TT',
    color: '#0284c7',
    desc: 'Khoa Ngoại ngữ - Xã hội nhân văn và Truyền thông - Giảng viên tra cứu thù lao cá nhân và gửi phản hồi.',
  },
  {
    stt: 18,
    name: 'Khoa Sinh học ứng dụng',
    code: 'KHOA_SINH_HOC_UNG_DUNG',
    color: '#0284c7',
    desc: 'Khoa Sinh học ứng dụng - Giảng viên tra cứu thù lao cá nhân và gửi phản hồi.',
  },
  {
    stt: 19,
    name: 'Phòng Tổ chức - Hành chính',
    code: 'PHONG_TO_CHUC_HANH_CHINH',
    color: '#ec4899',
    desc: 'Phòng Tổ chức - Hành chính - Quản lý nhân sự, hồ sơ cán bộ giảng viên.',
  },
  {
    stt: 20,
    name: 'Phòng Công nghệ thông tin',
    code: 'PHONG_CONG_NGHE_THONG_TIN',
    color: '#dc2626',
    desc: 'Phòng Công nghệ thông tin - Quản trị kỹ thuật hạ tầng hệ thống.',
  },
  {
    stt: 21,
    name: 'Phòng Quản trị thiết bị',
    code: 'PHONG_QUAN_TRI_THIET_BI',
    color: '#64748b',
    desc: 'Phòng Quản trị thiết bị.',
  },
  {
    stt: 22,
    name: 'Phòng Công tác chính trị - Quản lý sinh viên',
    code: 'PHONG_CTCT_QLSV',
    color: '#f97316',
    desc: 'Phòng Công tác chính trị - Quản lý sinh viên.',
  },
  {
    stt: 23,
    name: 'Phòng Tuyển sinh và Truyền thông',
    code: 'PHONG_TUYEN_SINH_TRUYEN_THONG',
    color: '#ea580c',
    desc: 'Phòng Tuyển sinh và Truyền thông.',
  },
  {
    stt: 24,
    name: 'Trung tâm Kiểm tra và Đảm bảo chất lượng giáo dục',
    code: 'TT_KT_DBCLGD',
    color: '#7c3aed',
    desc: 'Trung tâm Kiểm tra và Đảm bảo chất lượng giáo dục.',
  },
  {
    stt: 25,
    name: 'Trung tâm Ngoại ngữ - Tin học',
    code: 'TT_NGOAI_NGU_TIN_HOC',
    color: '#0284c7',
    desc: 'Trung tâm Ngoại ngữ - Tin học.',
  },
  {
    stt: 26,
    name: 'Trung tâm Khởi nghiệp Đổi mới sáng tạo Hỗ trợ sinh viên và Hợp tác doanh nghiệp',
    code: 'TT_KHOI_NGHIEP_DOANH_NGHIEP',
    color: '#d97706',
    desc: 'Trung tâm Khởi nghiệp Đổi mới sáng tạo Hỗ trợ sinh viên và Hợp tác doanh nghiệp.',
  },
  {
    stt: 27,
    name: 'Thư viện',
    code: 'THU_VIEN',
    color: '#64748b',
    desc: 'Thư viện Trường Đại học Tây Đô.',
  },
  {
    stt: 28,
    name: 'Văn phòng Đảng',
    code: 'VAN_PHONG_DANG',
    color: '#dc2626',
    desc: 'Văn phòng Đảng ủy Trường Đại học Tây Đô.',
  },
];

async function run() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'tdu_thantoan_db',
  });

  console.log('Connected to MySQL database.');

  await connection.query('SET FOREIGN_KEY_CHECKS = 0');
  await connection.query('TRUNCATE TABLE nguoi_dung_vai_tro');
  await connection.query('TRUNCATE TABLE vai_tro_quyen');
  await connection.query('TRUNCATE TABLE vai_tro');

  // Insert 28 roles in exact order
  for (const r of ORDERED_ROLES) {
    await connection.query(
      `INSERT INTO vai_tro (id, ma_vai_tro, ten_vai_tro, mo_ta, mau_sac)
       VALUES (?, ?, ?, ?, ?)`,
      [r.stt, r.code, r.name, r.desc, r.color]
    );
  }
  console.log('Inserted 28 roles into vai_tro table.');

  // Fetch all users from nguoi_dung
  const [users]: any = await connection.query('SELECT id, ma_nhan_su, ho_ten, email, chuc_vu, don_vi_id FROM nguoi_dung');
  console.log(`Found ${users.length} users in database.`);

  // Fetch all don_vi
  const [donVis]: any = await connection.query('SELECT id, ten_don_vi FROM don_vi');
  const donViMap = new Map<number, string>();
  for (const d of donVis) {
    donViMap.set(d.id, d.ten_don_vi);
  }

  // 1. Quản trị viên hệ thống: id = 1, Add mnlong
  const adminUser = users.find(
    (u: any) =>
      u.email?.toLowerCase().trim() === 'mnlong@tdu.edu.vn' ||
      u.ho_ten?.toLowerCase().includes('mai nhựt long')
  );
  if (adminUser) {
    await connection.query(
      `INSERT INTO nguoi_dung_vai_tro (nguoi_dung_id, vai_tro_id) VALUES (?, 1)`,
      [adminUser.id]
    );
    console.log(`Mapped Admin User: ${adminUser.ho_ten} (${adminUser.email}) -> Quản trị viên hệ thống (vai_tro_id: 1)`);
  }

  // 2. Giảng viên: id = 7, Add all users whose chuc_vu is Giảng viên
  let gvCount = 0;
  for (const u of users) {
    const cv = (u.chuc_vu || '').toLowerCase().trim();
    if (cv.includes('giảng viên')) {
      await connection.query(
        `INSERT IGNORE INTO nguoi_dung_vai_tro (nguoi_dung_id, vai_tro_id) VALUES (?, 7)`,
        [u.id]
      );
      gvCount++;
    }
  }
  console.log(`Mapped ${gvCount} Giảng viên -> vai trò Giảng viên (vai_tro_id: 7)`);

  // 3. Map all users to their unit roles
  let unitMapped = 0;
  for (const u of users) {
    const unitName = donViMap.get(u.don_vi_id) || '';
    const normUnit = unitName.replace(/\s+/g, ' ').toLowerCase().trim();

    let matchedRoleId: number | null = null;
    for (const r of ORDERED_ROLES) {
      if (r.code === 'QUAN_TRI_VIEN_HE_THONG' || r.code === 'GIANG_VIEN') continue;
      const rName = r.name.replace(/\s+/g, ' ').toLowerCase().trim();
      if (normUnit === rName || normUnit.includes(rName) || rName.includes(normUnit)) {
        matchedRoleId = r.stt;
        break;
      }
    }

    if (matchedRoleId) {
      await connection.query(
        `INSERT IGNORE INTO nguoi_dung_vai_tro (nguoi_dung_id, vai_tro_id) VALUES (?, ?)`,
        [u.id, matchedRoleId]
      );
      unitMapped++;
    }
  }

  console.log(`Mapped ${unitMapped} users to their corresponding unit roles.`);

  await connection.query('SET FOREIGN_KEY_CHECKS = 1');
  await connection.end();
  console.log('Database sync complete!');
}

run().catch((err) => {
  console.error('Error syncing:', err);
  process.exit(1);
});
