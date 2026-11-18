import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { TDU_ORGANIZATION_UNITS, TDU_PERSONNEL_DIRECTORY } from '../src/data/personnelCatalog.js';
import { INITIAL_TEACHING_DATA, INITIAL_ACCOUNTS } from '../src/data/mockData.js';

dotenv.config();

// Hàm loại bỏ học hàm / học vị khỏi họ tên
function cleanName(raw: string): string {
  if (!raw) return '';
  return raw
    .replace(/^(GS\.|PGS\.|TS\.|ThS\.|CN\.|BS\.|ThS |TS |PGS |GS |Thạc sĩ |Tiến sĩ |Giáo sư |Phó Giáo sư |Bác sĩ )+/gi, '')
    .trim();
}

// Quy tắc sinh email chuẩn TDU:
// Mai Nhựt Long -> mnlong@tdu.edu.vn
// Nguyễn Văn An -> nvan@tdu.edu.vn
export function generateTduEmail(fullName: string): string {
  const cleaned = cleanName(fullName);
  const normalized = cleaned
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z\s]/g, '')
    .trim();

  const words = normalized.split(/\s+/).filter(Boolean);
  if (words.length === 0) return 'canbo@tdu.edu.vn';
  if (words.length === 1) return `${words[0]}@tdu.edu.vn`;

  // Ngoại lệ tên thường gọi của cán bộ quản trị
  if (normalized.includes('mai') && normalized.includes('long')) {
    return 'mnlong@tdu.edu.vn';
  }

  const last = words[words.length - 1];
  const initials = words.slice(0, -1).map((w) => w[0]).join('');
  return `${initials}${last}@tdu.edu.vn`;
}

async function runSeed() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'tdu_thantoan_db',
    waitForConnections: true,
    connectionLimit: 10,
    charset: 'utf8mb4',
  });

  console.log('========================================================');
  console.log('🚀 BẮT ĐẦU IMPORT DỮ LIỆU CÁN BỘ & SINH EMAIL VÀO MYSQL');
  console.log('CSDL Target:', process.env.DB_NAME || 'tdu_thantoan_db');
  console.log('========================================================');

  // 1. Đồng bộ toàn bộ các đơn vị / Khoa / Phòng ban vào bảng don_vi
  console.log('1. Cập nhật danh mục Đơn vị (Khoa / Phòng ban / Trung tâm)...');
  for (const org of TDU_ORGANIZATION_UNITS) {
    const maDonVi = (org.shortName || org.id)
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, 10);

    await pool.query(
      `INSERT INTO don_vi (ma_don_vi, ten_don_vi, khoi)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE ten_don_vi = VALUES(ten_don_vi)`,
      [
        maDonVi,
        org.name,
        org.category === 'khoi_khoa' ? 'Khối Khoa' : org.category === 'khoi_phong_ban' ? 'Khối Phòng ban' : 'Khối Trung tâm',
      ]
    );
  }

  // Đọc lại danh sách đơn vị để map id
  const [dbUnits]: any = await pool.query('SELECT id, ten_don_vi FROM don_vi');
  const unitMap = new Map<string, number>();
  dbUnits.forEach((u: any) => {
    unitMap.set(u.ten_don_vi.toLowerCase().trim(), u.id);
  });

  const getUnitId = (unitName: string): number => {
    if (!unitName) return 1;
    const lower = unitName.toLowerCase().trim();
    if (unitMap.has(lower)) return unitMap.get(lower)!;
    // Tìm tương đối
    for (const [name, id] of unitMap.entries()) {
      if (lower.includes(name) || name.includes(lower)) return id;
    }
    return 1; // Default CNTT
  };

  // 2. Thu thập dữ liệu nhân sự duy nhất từ các danh bạ có sẵn
  const personnelMap = new Map<string, any>();

  // A. Giảng viên từ bảng kê giờ giảng
  INITIAL_TEACHING_DATA.forEach((r) => {
    const hoTen = cleanName(r.hoTen);
    const email = generateTduEmail(hoTen);
    if (!personnelMap.has(email)) {
      personnelMap.set(email, {
        maNhanSu: r.maGV,
        hoTen,
        email,
        donVi: r.khoaBoMon,
        chucVu: 'Giảng viên',
        hocVi: r.hocHamHocVi || 'ThS',
        ngaySinh: r.ngaySinh,
      });
    }
  });

  // B. Danh bạ cán bộ các Khối TDU
  TDU_PERSONNEL_DIRECTORY.forEach((p) => {
    const hoTen = cleanName(p.hoTen);
    const email = generateTduEmail(hoTen);
    if (!personnelMap.has(email)) {
      personnelMap.set(email, {
        maNhanSu: p.maNhanSu,
        hoTen,
        email,
        donVi: p.donVi,
        chucVu: p.chucVu || 'Chuyên viên',
        hocVi: p.hocVi || 'ThS',
      });
    }
  });

  // C. Đảm bảo tài khoản Super Admin Mai Như Long luôn chuẩn xác
  personnelMap.set('mnlong@tdu.edu.vn', {
    maNhanSu: 'TDU00128',
    hoTen: 'Mai Như Long',
    email: 'mnlong@tdu.edu.vn',
    donVi: 'Khoa Công nghệ thông tin',
    chucVu: 'Phó Trưởng phòng CNTT',
    hocVi: 'ThS',
    roleOverride: 1, // SUPER_ADMIN
  });

  const allPersonnel = Array.from(personnelMap.values());
  console.log(`2. Tìm thấy ${allPersonnel.length} cán bộ, giảng viên sẵn sàng import.`);

  // 3. Import từng cán bộ vào bảng nguoi_dung và phân quyền trong nguoi_dung_vai_tro
  let importedCount = 0;

  for (const p of allPersonnel) {
    const donViId = getUnitId(p.donVi);
    const email = (p.email || generateTduEmail(p.hoTen)).toLowerCase().trim();

    // Xác định vai trò theo quy chuẩn trường TDU
    // 1: SUPER_ADMIN, 2: BAN_GIAM_HIEU, 3: PHONG_DAO_TAO, 4: PHONG_TAI_CHINH,
    // 5: TRUNG_TAM_KHAO_THI, 6: PHONG_QLKH, 7: LANH_DAO_KHOA, 8: GIANG_VIEN
    let vaiTroId = 8; // Mặc định Giảng viên

    if (p.roleOverride === 1 || email === 'mnlong@tdu.edu.vn' || p.maNhanSu === 'TDU00128') {
      vaiTroId = 1; // SUPER_ADMIN
    } else if (p.donVi?.toLowerCase().includes('đào tạo')) {
      vaiTroId = 3; // PHONG_DAO_TAO
    } else if (p.donVi?.toLowerCase().includes('tài chính') || p.donVi?.toLowerCase().includes('kế toán')) {
      vaiTroId = 4; // PHONG_TAI_CHINH
    } else if (p.donVi?.toLowerCase().includes('khảo thí')) {
      vaiTroId = 5; // TRUNG_TAM_KHAO_THI
    } else if (p.donVi?.toLowerCase().includes('khoa học') || p.donVi?.toLowerCase().includes('qlkh')) {
      vaiTroId = 6; // PHONG_QLKH
    } else if (p.chucVu?.toLowerCase().includes('trưởng khoa') || p.chucVu?.toLowerCase().includes('phó trưởng khoa')) {
      vaiTroId = 7; // LANH_DAO_KHOA
    } else if (p.chucVu?.toLowerCase().includes('giám hiệu') || p.chucVu?.toLowerCase().includes('hiệu trưởng')) {
      vaiTroId = 2; // BAN_GIAM_HIEU
    }

    // Insert / Update nguoi_dung
    await pool.query(
      `INSERT INTO nguoi_dung (
        ma_nhan_su, ho_ten, email, chuc_vu, don_vi_id,
        gioi_tinh, ngay_sinh, hoc_vi, trang_thai
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'HOAT_DONG')
      ON DUPLICATE KEY UPDATE
        ho_ten = VALUES(ho_ten),
        email = VALUES(email),
        chuc_vu = VALUES(chuc_vu),
        don_vi_id = VALUES(don_vi_id),
        hoc_vi = VALUES(hoc_vi),
        trang_thai = 'HOAT_DONG'`,
      [
        p.maNhanSu,
        p.hoTen,
        email,
        p.chucVu,
        donViId,
        p.gioiTinh || 'Nam',
        p.ngaySinh || '1985-01-01',
        p.hocVi || 'Thạc sĩ',
      ]
    );

    // Lấy user ID vừa chèn
    const [uRows]: any = await pool.query('SELECT id FROM nguoi_dung WHERE email = ? LIMIT 1', [email]);
    if (uRows && uRows.length > 0) {
      const userId = uRows[0].id;
      // Gán vai trò
      await pool.query(
        `INSERT INTO nguoi_dung_vai_tro (nguoi_dung_id, vai_tro_id)
         VALUES (?, ?)
         ON DUPLICATE KEY UPDATE vai_tro_id = VALUES(vai_tro_id)`,
        [userId, vaiTroId]
      );
    }

    importedCount++;
    console.log(` ✅ [${p.maNhanSu}] ${p.hoTen.padEnd(24)} -> ${email.padEnd(25)} (Vai trò ID: ${vaiTroId})`);
  }

  console.log('========================================================');
  console.log(`🎉 ĐÃ IMPORT THÀNH CÔNG ${importedCount} CÁN BỘ VÀO CSDL MYSQL!`);
  console.log('========================================================');

  await pool.end();
  process.exit(0);
}

runSeed().catch((err) => {
  console.error('❌ Lỗi import:', err);
  process.exit(1);
});
