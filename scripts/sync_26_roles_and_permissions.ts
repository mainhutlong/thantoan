import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

function removeAccents(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

export const UNIT_ROLES_26 = [
  {
    stt: 1,
    name: 'Hội đồng cố vấn',
    code: 'HOI_DONG_CO_VAN',
    color: '#64748b',
    desc: 'Hội đồng Cố vấn cấp cao của Trường Đại học Tây Đô.',
  },
  {
    stt: 2,
    name: 'Hội đồng trường',
    code: 'HOI_DONG_TRUONG',
    color: '#6366f1',
    desc: 'Hội đồng Trường Đại học Tây Đô.',
  },
  {
    stt: 3,
    name: 'Ban Giám hiệu',
    code: 'BAN_GIAM_HIEU',
    color: '#9333ea',
    desc: 'Ban Giám hiệu Trường Đại học Tây Đô - Phê duyệt tổng hợp và chỉ đạo vận hành.',
  },
  {
    stt: 4,
    name: 'Khoa cơ bản',
    code: 'KHOA_CO_BAN',
    color: '#0284c7',
    desc: 'Khoa Cơ bản - Giảng viên tra cứu thù lao giảng dạy, NCKH cá nhân và gửi phản hồi.',
  },
  {
    stt: 5,
    name: 'Khoa Luật',
    code: 'KHOA_LUAT',
    color: '#0284c7',
    desc: 'Khoa Luật - Giảng viên tra cứu thù lao giảng dạy, NCKH cá nhân và gửi phản hồi.',
  },
  {
    stt: 6,
    name: 'Ban Pháp chế - Kiểm tra',
    code: 'BAN_PHAP_CHE_KIEM_TRA',
    color: '#64748b',
    desc: 'Ban Pháp chế - Kiểm tra.',
  },
  {
    stt: 7,
    name: 'Tạp chí NCKH&PTKT',
    code: 'TAP_CHI_NCKH_PTKT',
    color: '#0d9488',
    desc: 'Tạp chí Nghiên cứu Khoa học & Phát triển Kinh tế.',
  },
  {
    stt: 8,
    name: 'Khoa Dược - Điều dưỡng',
    code: 'KHOA_DUOC_DIEU_DUONG',
    color: '#0284c7',
    desc: 'Khoa Dược - Điều dưỡng - Giảng viên tra cứu thù lao giảng dạy, NCKH cá nhân và gửi phản hồi.',
  },
  {
    stt: 9,
    name: 'Khoa Kế toán - Tài chính - Ngân hàng',
    code: 'KHOA_KT_TC_NH',
    color: '#0284c7',
    desc: 'Khoa Kế toán - Tài chính - Ngân hàng - Giảng viên tra cứu thù lao cá nhân và gửi phản hồi.',
  },
  {
    stt: 10,
    name: 'Khoa Quản trị kinh doanh - Du lịch',
    code: 'KHOA_QTKD_DU_LICH',
    color: '#0284c7',
    desc: 'Khoa Quản trị kinh doanh - Du lịch - Giảng viên tra cứu thù lao cá nhân và gửi phản hồi.',
  },
  {
    stt: 11,
    name: 'Khoa Kỹ thuật - Công nghệ',
    code: 'KHOA_KY_THUAT_CONG_NGHE',
    color: '#0284c7',
    desc: 'Khoa Kỹ thuật - Công nghệ - Giảng viên tra cứu thù lao cá nhân và gửi phản hồi.',
  },
  {
    stt: 12,
    name: 'Khoa Ngoại ngữ - Xã hội nhân văn và Truyền thông',
    code: 'KHOA_NN_XHNV_TT',
    color: '#0284c7',
    desc: 'Khoa Ngoại ngữ - XHNV & TT - Giảng viên tra cứu thù lao cá nhân và gửi phản hồi.',
  },
  {
    stt: 13,
    name: 'Khoa Sinh học ứng dụng',
    code: 'KHOA_SINH_HOC_UNG_DUNG',
    color: '#0284c7',
    desc: 'Khoa Sinh học ứng dụng - Giảng viên tra cứu thù lao cá nhân và gửi phản hồi.',
  },
  {
    stt: 14,
    name: 'Phòng Tổ chức - Hành chính',
    code: 'PHONG_TO_CHUC_HANH_CHINH',
    color: '#ec4899',
    desc: 'Phòng Tổ chức - Hành chính.',
  },
  {
    stt: 15,
    name: 'Phòng Công nghệ thông tin',
    code: 'PHONG_CONG_NGHE_THONG_TIN',
    color: '#dc2626',
    desc: 'Quản trị hệ thống (Toàn quyền) - Toàn bộ phân hệ giờ giảng, NCKH, thù lao, thanh toán, báo cáo và hệ thống người dùng.',
  },
  {
    stt: 16,
    name: 'Phòng Quản trị thiết bị',
    code: 'PHONG_QUAN_TRI_THIET_BI',
    color: '#64748b',
    desc: 'Phòng Quản trị thiết bị.',
  },
  {
    stt: 17,
    name: 'Phòng Quản lý Đào tạo',
    code: 'PHONG_QUAN_LY_DAO_TAO',
    color: '#2563eb',
    desc: 'Toàn quyền quản lý phân hệ Thanh toán giờ giảng (kê khai, import, chỉnh sửa, khóa kỳ) và giải trình phản hồi giờ giảng của Giảng viên.',
  },
  {
    stt: 18,
    name: 'Phòng Công tác chính trị - Quản lý sinh viên',
    code: 'PHONG_CTCT_QLSV',
    color: '#f97316',
    desc: 'Phòng Công tác chính trị - Quản lý sinh viên.',
  },
  {
    stt: 19,
    name: 'Phòng Tài chính - Kế hoạch',
    code: 'PHONG_TAI_CHINH_KE_HOACH',
    color: '#16a34a',
    desc: 'Xem toàn bộ số liệu giờ giảng, NCKH, khảo thí, tổng hợp thanh toán thù lao toàn trường và lập lệnh chi trả tài chính UNC (ngoại trừ menu Hệ thống).',
  },
  {
    stt: 20,
    name: 'Phòng Tuyển sinh và Truyền thông',
    code: 'PHONG_TUYEN_SINH_TRUYEN_THONG',
    color: '#ea580c',
    desc: 'Phòng Tuyển sinh và Truyền thông.',
  },
  {
    stt: 21,
    name: 'Phòng Quản lý khoa học và Hợp tác quốc tế',
    code: 'PHONG_QLKH_HTQT',
    color: '#0891b2',
    desc: 'Toàn quyền quản lý phân hệ Nghiên cứu khoa học (Bài báo khoa học, Seminar, Đề tài NCKH) và giải trình phản hồi NCKH của Giảng viên.',
  },
  {
    stt: 22,
    name: 'Trung tâm Kiểm tra và Đảm bảo chất lượng giáo dục',
    code: 'TT_KT_DBCLGD',
    color: '#7c3aed',
    desc: 'Trung tâm Kiểm tra và Đảm bảo chất lượng giáo dục.',
  },
  {
    stt: 23,
    name: 'Trung tâm Ngoại ngữ - Tin học',
    code: 'TT_NGOAI_NGU_TIN_HOC',
    color: '#0284c7',
    desc: 'Trung tâm Ngoại ngữ - Tin học.',
  },
  {
    stt: 24,
    name: 'Trung tâm Khởi nghiệp Đổi mới sáng tạo Hỗ trợ sinh viên và Hợp tác doanh nghiệp',
    code: 'TT_KHOI_NGHIEP_DOANH_NGHIEP',
    color: '#d97706',
    desc: 'Trung tâm Khởi nghiệp Đổi mới sáng tạo Hỗ trợ sinh viên và Hợp tác doanh nghiệp.',
  },
  {
    stt: 25,
    name: 'Thư viện',
    code: 'THU_VIEN',
    color: '#64748b',
    desc: 'Thư viện Trường Đại học Tây Đô.',
  },
  {
    stt: 26,
    name: 'Văn phòng Đảng',
    code: 'VAN_PHONG_DANG',
    color: '#dc2626',
    desc: 'Văn phòng Đảng ủy Trường Đại học Tây Đô.',
  },
];

async function run() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'tdu_thantoan_db',
  });

  console.log('Connected to MySQL tdu_thantoan_db.');

  // 1. Clear old roles in vai_tro and re-seed 26 roles
  console.log('Clearing old vai_tro and re-inserting 26 roles...');
  await conn.query('DELETE FROM nguoi_dung_vai_tro');
  await conn.query('DELETE FROM vai_tro');
  await conn.query('ALTER TABLE vai_tro AUTO_INCREMENT = 1');

  const roleCodeToId = new Map<string, number>();

  for (const r of UNIT_ROLES_26) {
    const [res]: any = await conn.query(
      'INSERT INTO vai_tro (id, ma_vai_tro, ten_vai_tro, mo_ta, mau_sac) VALUES (?, ?, ?, ?, ?)',
      [r.stt, r.code, r.name, r.desc, r.color]
    );
    roleCodeToId.set(r.name.toLowerCase().trim(), r.stt);
    console.log(`Inserted role [${r.stt}]: ${r.name} (${r.code})`);
  }

  // 2. Map all 245 users in nguoi_dung to their unit's role in vai_tro
  console.log('Mapping all users from nguoi_dung to their corresponding role in vai_tro...');
  const [users]: any = await conn.query(
    'SELECT u.id, u.ho_ten, u.email, u.chuc_vu, d.ten_don_vi FROM nguoi_dung u LEFT JOIN don_vi d ON u.don_vi_id = d.id'
  );

  let mappedCount = 0;
  for (const u of users) {
    const unitName = (u.ten_don_vi || '').replace(/\r?\n/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();
    
    // Find role matching unitName
    let roleId = roleCodeToId.get(unitName);

    // Fallback if newline or minor variance
    if (!roleId) {
      for (const [rName, rId] of roleCodeToId.entries()) {
        const cleanRName = rName.replace(/\s+/g, ' ');
        if (unitName.includes(cleanRName) || cleanRName.includes(unitName)) {
          roleId = rId;
          break;
        }
      }
    }

    if (!roleId) {
      console.warn(`Could not find role for user: ${u.ho_ten} (Unit: ${u.ten_don_vi})`);
      roleId = 4; // Khoa co ban
    }

    await conn.query(
      'INSERT INTO nguoi_dung_vai_tro (nguoi_dung_id, vai_tro_id) VALUES (?, ?)',
      [u.id, roleId]
    );
    mappedCount++;
  }

  console.log(`Successfully mapped ${mappedCount} users into 26 role groups.`);

  // 3. Verify counts per role
  const [counts]: any = await conn.query(`
    SELECT v.id, v.ma_vai_tro, v.ten_vai_tro, COUNT(uv.nguoi_dung_id) as member_count
    FROM vai_tro v
    LEFT JOIN nguoi_dung_vai_tro uv ON v.id = uv.vai_tro_id
    GROUP BY v.id
    ORDER BY v.id ASC
  `);

  console.log('=== ROLE DISTRIBUTION VERIFICATION ===');
  counts.forEach((c: any) => {
    console.log(`[${String(c.id).padStart(2, ' ')}] ${c.ten_vai_tro} (${c.ma_vai_tro}): ${c.member_count} thành viên`);
  });

  await conn.end();
}

run().catch(console.error);
