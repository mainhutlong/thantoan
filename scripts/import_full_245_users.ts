import mysql from 'mysql2/promise';
import * as XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const xlsxModule: any = (XLSX as any).default || XLSX;

function removeAccents(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

function generateEmail(fullName: string, existingEmails: Set<string>): string {
  // Strip parentheses and status suffixes
  const clean = fullName.replace(/\([^)]*\)/g, '').trim();
  const ascii = removeAccents(clean).toLowerCase().replace(/[^a-z\s]/g, ' ').trim();
  const words = ascii.split(/\s+/).filter(Boolean);
  if (words.length === 0) return 'user@tdu.edu.vn';
  if (words.length === 1) return words[0] + '@tdu.edu.vn';

  const lastName = words[words.length - 1];
  const initials = words.slice(0, words.length - 1).map(w => w[0]).join('');
  let baseEmail = `${initials}${lastName}@tdu.edu.vn`;

  if (!existingEmails.has(baseEmail)) {
    existingEmails.add(baseEmail);
    return baseEmail;
  }

  // Handle collision by appending number
  let counter = 2;
  while (existingEmails.has(`${initials}${lastName}${counter}@tdu.edu.vn`)) {
    counter++;
  }
  const uniqueEmail = `${initials}${lastName}${counter}@tdu.edu.vn`;
  existingEmails.add(uniqueEmail);
  return uniqueEmail;
}

function formatExcelDate(val: any): string {
  if (val === undefined || val === null || val === '') return '';
  if (typeof val === 'number') {
    if (val >= 1900 && val <= 2100) return String(val);
    try {
      const date = new Date(Math.round((val - 25569) * 86400 * 1000));
      const d = String(date.getDate()).padStart(2, '0');
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const y = date.getFullYear();
      if (!isNaN(date.getTime()) && y > 1900 && y < 2100) {
        return `${d}/${m}/${y}`;
      }
    } catch {}
  }
  return String(val).trim();
}

function cleanString(val: any): string {
  if (val === undefined || val === null) return '';
  return String(val).replace(/\r?\n/g, ' ').trim();
}

async function run() {
  const excelFile = path.resolve('data_import/DS_can_bo_giang_vien_245.xlsx');
  if (!fs.existsSync(excelFile)) {
    console.error('File not found:', excelFile);
    process.exit(1);
  }

  const wb = xlsxModule.readFile(excelFile);
  const raw: any[][] = xlsxModule.utils.sheet_to_json(wb.Sheets['Sheet1'], { header: 1 });

  // Locate header row
  let headerIdx = -1;
  for (let i = 0; i < 10; i++) {
    if (raw[i] && raw[i].some((c: any) => typeof c === 'string' && c.includes('Họ tên'))) {
      headerIdx = i;
      break;
    }
  }

  if (headerIdx === -1) {
    console.error('Cannot find header row');
    process.exit(1);
  }

  const existingEmails = new Set<string>();
  const parsedPeople: any[] = [];

  for (let i = headerIdx + 1; i < raw.length; i++) {
    const r = raw[i];
    if (!r) continue;
    const hoTenRaw = cleanString(r[1]);
    if (!hoTenRaw || hoTenRaw === 'Họ tên') continue;

    const stt = Number(r[0]) || parsedPeople.length + 1;
    const chucVu = cleanString(r[2]);
    const donVi = cleanString(r[3]);
    const maNhanSu = cleanString(r[4]) || `TDU${String(stt).padStart(5, '0')}`;
    const gioiTinh = cleanString(r[5]) || 'Nam';
    const ngaySinh = formatExcelDate(r[6]);
    const hocHam = cleanString(r[7]);
    const hocVi = cleanString(r[8]);
    const chuyenMon = cleanString(r[9]);
    const namTuyenDung = Number(r[10]) || undefined;
    const ngayKyHDLD = formatExcelDate(r[11]);
    const namTotNghiep = Number(r[12]) || undefined;
    const namPGS = cleanString(r[13]);
    const namGS = cleanString(r[14]);
    const ccsp = cleanString(r[15]);
    const anhVan = cleanString(r[16]);
    const tinHoc = cleanString(r[17]);
    const kiemNhiem = cleanString(r[18]);
    const donViKiemNhiem = cleanString(r[19]);

    const email = generateEmail(hoTenRaw, existingEmails);

    parsedPeople.push({
      stt,
      hoTen: hoTenRaw,
      chucVu,
      donVi,
      maNhanSu,
      gioiTinh: gioiTinh === 'Nữ' ? 'Nữ' : 'Nam',
      ngaySinh,
      hocHam,
      hocVi,
      chuyenMon,
      namTuyenDung,
      ngayKyHDLD,
      namTotNghiep,
      namPGS,
      namGS,
      ccsp,
      anhVan,
      tinHoc,
      kiemNhiem,
      donViKiemNhiem,
      email,
      trangThai: 'HOAT_DONG'
    });
  }

  console.log(`Successfully parsed ${parsedPeople.length} people from Excel.`);

  // Connect to MySQL
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'tdu_thantoan_db'
  });

  console.log('Connected to MySQL tdu_thantoan_db.');

  // 1. Ensure all Don Vi exist in database
  const [existingUnits]: any = await conn.query('SELECT id, ten_don_vi FROM don_vi');
  const unitMap = new Map<string, number>();
  for (const u of existingUnits) {
    unitMap.set(u.ten_don_vi.toLowerCase().trim(), u.id);
  }

  for (const p of parsedPeople) {
    if (!p.donVi) continue;
    const norm = p.donVi.toLowerCase().trim();
    if (!unitMap.has(norm)) {
      const maDonVi = removeAccents(p.donVi).toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 15) || 'DV' + Math.floor(Math.random() * 1000);
      let khoi = 'PHONG_BAN';
      if (p.donVi.toLowerCase().includes('khoa')) khoi = 'KHOA';
      else if (p.donVi.toLowerCase().includes('trung tâm')) khoi = 'TRUNG_TAM';

      try {
        const [res]: any = await conn.query(
          'INSERT INTO don_vi (ma_don_vi, ten_don_vi, khoi, trang_thai) VALUES (?, ?, ?, 1)',
          [maDonVi, p.donVi, khoi]
        );
        unitMap.set(norm, res.insertId);
        console.log(`Inserted new don_vi: ${p.donVi} (ID: ${res.insertId})`);
      } catch (err: any) {
        // In case of ma_don_vi collision
        const randMa = maDonVi + Math.floor(Math.random() * 99);
        const [res]: any = await conn.query(
          'INSERT INTO don_vi (ma_don_vi, ten_don_vi, khoi, trang_thai) VALUES (?, ?, ?, 1)',
          [randMa, p.donVi, khoi]
        );
        unitMap.set(norm, res.insertId);
      }
    }
  }

  // 2. Clear old test records from nguoi_dung_vai_tro and nguoi_dung
  console.log('Clearing old nguoi_dung and nguoi_dung_vai_tro records...');
  await conn.query('DELETE FROM nguoi_dung_vai_tro');
  await conn.query('DELETE FROM nguoi_dung');
  await conn.query('ALTER TABLE nguoi_dung AUTO_INCREMENT = 1');

  // 3. Insert all 245 people
  console.log('Inserting 245 users into nguoi_dung...');
  for (const p of parsedPeople) {
    const donViId = unitMap.get(p.donVi.toLowerCase().trim()) || null;

    const [userRes]: any = await conn.query(
      `INSERT INTO nguoi_dung (
        ma_nhan_su, ho_ten, email, chuc_vu, don_vi_id, gioi_tinh, ngay_sinh,
        hoc_ham, hoc_vi, chuyen_mon, nam_tuyen_dung, ngay_ky_hdld,
        nam_tot_nghiep, nam_cong_nhan_pgs, nam_cong_nhan_gs, ccsp,
        anh_van, tin_hoc, kiem_nhiem, don_vi_kiem_nhiem, trang_thai, sso_provider
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'GOOGLE')`,
      [
        p.maNhanSu,
        p.hoTen,
        p.email,
        p.chucVu,
        donViId,
        p.gioiTinh,
        p.ngaySinh,
        p.hocHam,
        p.hocVi,
        p.chuyenMon,
        p.namTuyenDung || null,
        p.ngayKyHDLD,
        p.namTotNghiep || null,
        p.namPGS,
        p.namGS,
        p.ccsp,
        p.anhVan,
        p.tinHoc,
        p.kiemNhiem,
        p.donViKiemNhiem,
        p.trangThai
      ]
    );

    const userId = userRes.insertId;

    // Determine role
    let roleId = 8; // Default GIANG_VIEN
    const emailLower = p.email.toLowerCase();
    const hoTenLower = p.hoTen.toLowerCase();
    const chucVuLower = (p.chucVu || '').toLowerCase();
    const donViLower = (p.donVi || '').toLowerCase();

    if (emailLower === 'mnlong@tdu.edu.vn' || hoTenLower.includes('mai nhựt long')) {
      roleId = 1; // SUPER_ADMIN
    } else if (donViLower.includes('ban giám hiệu') || donViLower.includes('hội đồng trường') || chucVuLower.includes('hiệu trưởng') || chucVuLower.includes('chủ tịch')) {
      roleId = 2; // BAN_GIAM_HIEU
    } else if (donViLower.includes('đào tạo')) {
      roleId = 3; // PHONG_DAO_TAO
    } else if (donViLower.includes('tài chính') || donViLower.includes('kế hoạch')) {
      roleId = 4; // PHONG_TAI_CHINH
    } else if (donViLower.includes('khảo thí') || donViLower.includes('đảm bảo chất lượng')) {
      roleId = 5; // TRUNG_TAM_KHAO_THI
    } else if (donViLower.includes('quản lý khoa học')) {
      roleId = 6; // PHONG_QLKH
    } else if (chucVuLower.includes('trưởng khoa') || chucVuLower.includes('phó trưởng khoa') || chucVuLower.includes('trưởng bộ môn')) {
      roleId = 7; // LANH_DAO_KHOA
    }

    await conn.query(
      'INSERT INTO nguoi_dung_vai_tro (nguoi_dung_id, vai_tro_id) VALUES (?, ?)',
      [userId, roleId]
    );
  }

  // 4. Verify count in MySQL
  const [countRes]: any = await conn.query('SELECT COUNT(*) as total FROM nguoi_dung');
  console.log(`Verify: Total users in database = ${countRes[0].total}`);

  // 5. Check Mai Nhựt Long
  const [mnlRes]: any = await conn.query(
    `SELECT u.id, u.ma_nhan_su, u.ho_ten, u.email, u.chuc_vu, d.ten_don_vi, v.ma_vai_tro 
     FROM nguoi_dung u 
     LEFT JOIN don_vi d ON u.don_vi_id = d.id 
     LEFT JOIN nguoi_dung_vai_tro nv ON u.id = nv.nguoi_dung_id 
     LEFT JOIN vai_tro v ON nv.vai_tro_id = v.id 
     WHERE u.email = 'mnlong@tdu.edu.vn'`
  );
  console.log('Super Admin verification:', mnlRes[0]);

  await conn.end();

  // 6. Export to TypeScript file for front-end initial state
  const tsContent = `// Auto-generated 245 personnel records from master file
import { SystemUserProfile } from '../types';

export const FULL_PERSONNEL_245: SystemUserProfile[] = ${JSON.stringify(
    parsedPeople.map((p, idx) => ({
      id: `user-${idx + 1}`,
      stt: p.stt,
      hoTen: p.hoTen,
      chucVu: p.chucVu,
      donVi: p.donVi,
      maNhanSu: p.maNhanSu,
      email: p.email,
      gioiTinh: p.gioiTinh,
      ngaySinh: p.ngaySinh,
      hocHam: p.hocHam,
      hocVi: p.hocVi,
      chuyenMon: p.chuyenMon,
      namTuyenDung: p.namTuyenDung,
      ngayKyHDLD: p.ngayKyHDLD,
      namTotNghiep: p.namTotNghiep,
      namCongNhanPGS: p.namPGS,
      namCongNhanGS: p.namGS,
      ccsp: p.ccsp,
      anhVan: p.anhVan,
      tinHoc: p.tinHoc,
      kiemNhiem: p.kiemNhiem,
      donViKiemNhiem: p.donViKiemNhiem,
      trangThai: 'hoat_dong',
    })),
    null,
    2
  )};
`;

  fs.writeFileSync('src/data/fullPersonnel245.ts', tsContent, 'utf8');
  console.log('Wrote src/data/fullPersonnel245.ts successfully.');
}

run().catch(console.error);
