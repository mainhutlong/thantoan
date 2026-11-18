import { Router, Request, Response } from 'express';
import { pool } from '../db.js';

const router = Router();

// 1. Lấy danh sách toàn bộ Người dùng & Hồ sơ nhân sự
router.get('/', async (_req: Request, res: Response) => {
  try {
    const query = `
      SELECT 
        u.id, u.ma_nhan_su AS maNhanSu, u.ho_ten AS hoTen, u.email,
        u.chuc_vu AS chucVu, u.don_vi_id AS donViId, d.ten_don_vi AS donVi,
        u.gioi_tinh AS gioiTinh, u.ngay_sinh AS ngaySinh,
        u.hoc_ham AS hocHam, u.hoc_vi AS hocVi, u.chuyen_mon AS chuyenMon,
        u.nam_tuyen_dung AS namTuyenDung, u.ngay_ky_hdld AS ngayKyHDLD,
        u.nam_tot_nghiep AS namTotNghiep, u.nam_cong_nhan_pgs AS namCongNhanPGS,
        u.nam_cong_nhan_gs AS namCongNhanGS, u.ccsp, u.anh_van AS anhVan,
        u.tin_hoc AS tinHoc, u.kiem_nhiem AS kiemNhiem,
        u.don_vi_kiem_nhiem AS donViKiemNhiem, u.trang_thai AS trangThai,
        u.lan_dang_nhap_cuoi AS lanDangNhapCuoi
      FROM nguoi_dung u
      LEFT JOIN don_vi d ON u.don_vi_id = d.id
      ORDER BY u.id DESC
    `;
    const [rows]: any = await pool.query(query);
    return res.json({ success: true, data: rows });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi truy vấn danh sách người dùng', error: error.message });
  }
});

// 2. Thêm mới một cán bộ / giảng viên
router.post('/', async (req: Request, res: Response) => {
  try {
    const data = req.body;
    if (!data.hoTen || !data.maNhanSu) {
      return res.status(400).json({ success: false, message: 'Họ tên và Mã nhân sự là bắt buộc!' });
    }

    // Tự sinh email nếu không có
    const email = (data.email || `${data.maNhanSu.toLowerCase()}@tdu.edu.vn`).trim();

    // Tìm hoặc liên kết đơn vị
    let donViId = null;
    if (data.donVi) {
      const [dRows]: any = await pool.query('SELECT id FROM don_vi WHERE ten_don_vi = ? LIMIT 1', [data.donVi]);
      if (dRows && dRows.length > 0) {
        donViId = dRows[0].id;
      }
    }

    const insertSql = `
      INSERT INTO nguoi_dung (
        ma_nhan_su, ho_ten, email, chuc_vu, don_vi_id, gioi_tinh, ngay_sinh,
        hoc_ham, hoc_vi, chuyen_mon, nam_tuyen_dung, ngay_ky_hdld,
        nam_tot_nghiep, nam_cong_nhan_pgs, nam_cong_nhan_gs, ccsp,
        anh_van, tin_hoc, kiem_nhiem, don_vi_kiem_nhiem
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      data.maNhanSu,
      data.hoTen,
      email,
      data.chucVu || 'Giảng viên',
      donViId,
      data.gioiTinh || 'Nam',
      data.ngaySinh || '',
      data.hocHam || '',
      data.hocVi || 'Thạc sĩ',
      data.chuyenMon || '',
      Number(data.namTuyenDung) || new Date().getFullYear(),
      data.ngayKyHDLD || '',
      Number(data.namTotNghiep) || 2015,
      data.namCongNhanPGS || '',
      data.namCongNhanGS || '',
      data.ccsp || 'Đã có',
      data.anhVan || 'B2',
      data.tinHoc || 'Ứng dụng CNTT Nâng cao',
      data.kiemNhiem || '',
      data.donViKiemNhiem || '',
    ];

    const [result]: any = await pool.query(insertSql, values);
    return res.json({ success: true, message: 'Thêm mới cán bộ thành công!', id: result.insertId });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi thêm cán bộ vào CSDL', error: error.message });
  }
});

// 3. Cập nhật hồ sơ cán bộ
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;

    let donViId = null;
    if (data.donVi) {
      const [dRows]: any = await pool.query('SELECT id FROM don_vi WHERE ten_don_vi = ? LIMIT 1', [data.donVi]);
      if (dRows && dRows.length > 0) donViId = dRows[0].id;
    }

    const updateSql = `
      UPDATE nguoi_dung SET
        ma_nhan_su = ?, ho_ten = ?, chuc_vu = ?, don_vi_id = COALESCE(?, don_vi_id),
        gioi_tinh = ?, ngay_sinh = ?, hoc_ham = ?, hoc_vi = ?, chuyen_mon = ?,
        nam_tuyen_dung = ?, ngay_ky_hdld = ?, nam_tot_nghiep = ?,
        nam_cong_nhan_pgs = ?, nam_cong_nhan_gs = ?, ccsp = ?,
        anh_van = ?, tin_hoc = ?, kiem_nhiem = ?, don_vi_kiem_nhiem = ?
      WHERE id = ?
    `;

    const values = [
      data.maNhanSu,
      data.hoTen,
      data.chucVu,
      donViId,
      data.gioiTinh,
      data.ngaySinh,
      data.hocHam || '',
      data.hocVi,
      data.chuyenMon,
      Number(data.namTuyenDung) || null,
      data.ngayKyHDLD,
      Number(data.namTotNghiep) || null,
      data.namCongNhanPGS || '',
      data.namCongNhanGS || '',
      data.ccsp,
      data.anhVan,
      data.tinHoc,
      data.kiemNhiem || '',
      data.donViKiemNhiem || '',
      id,
    ];

    await pool.query(updateSql, values);
    return res.json({ success: true, message: 'Cập nhật cán bộ thành công!' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi cập nhật CSDL', error: error.message });
  }
});

// 4. Xóa cán bộ theo ID
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM nguoi_dung WHERE id = ?', [id]);
    return res.json({ success: true, message: 'Đã xóa cán bộ khỏi CSDL!' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi xóa cán bộ', error: error.message });
  }
});

// 5. Xóa hàng loạt cán bộ (Batch delete)
router.post('/batch-delete', async (req: Request, res: Response) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'Danh sách ID không hợp lệ!' });
    }
    await pool.query('DELETE FROM nguoi_dung WHERE id IN (?)', [ids]);
    return res.json({ success: true, message: `Đã xóa thành công ${ids.length} cán bộ!` });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi xóa hàng loạt', error: error.message });
  }
});

// 6. Import danh sách cán bộ từ Excel (Hàng loạt)
router.post('/import', async (req: Request, res: Response) => {
  try {
    const { users, overwrite } = req.body;
    if (!Array.isArray(users) || users.length === 0) {
      return res.status(400).json({ success: false, message: 'Không có dữ liệu import!' });
    }

    if (overwrite) {
      await pool.query('DELETE FROM nguoi_dung');
    }

    // Insert từng người hoặc theo bulk
    for (const u of users) {
      const email = (u.email || `${(u.maNhanSu || 'canbo').toLowerCase()}@tdu.edu.vn`).trim();
      await pool.query(
        `INSERT INTO nguoi_dung (
          ma_nhan_su, ho_ten, email, chuc_vu, gioi_tinh, ngay_sinh,
          hoc_ham, hoc_vi, chuyen_mon, nam_tuyen_dung, ngay_ky_hdld,
          nam_tot_nghiep, nam_cong_nhan_pgs, nam_cong_nhan_gs, ccsp,
          anh_van, tin_hoc, kiem_nhiem, don_vi_kiem_nhiem
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE ho_ten = VALUES(ho_ten), chuc_vu = VALUES(chuc_vu)`,
        [
          u.maNhanSu,
          u.hoTen,
          email,
          u.chucVu || 'Giảng viên',
          u.gioiTinh || 'Nam',
          u.ngaySinh || '',
          u.hocHam || '',
          u.hocVi || 'Thạc sĩ',
          u.chuyenMon || '',
          Number(u.namTuyenDung) || 2020,
          u.ngayKyHDLD || '',
          Number(u.namTotNghiep) || 2015,
          u.namCongNhanPGS || '',
          u.namCongNhanGS || '',
          u.ccsp || 'Đã có',
          u.anhVan || 'B2',
          u.tinHoc || 'Ứng dụng CNTT Nâng cao',
          u.kiemNhiem || '',
          u.donViKiemNhiem || '',
        ]
      );
    }

    return res.json({ success: true, message: `Đã nạp thành công ${users.length} cán bộ vào CSDL!` });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi import CSDL', error: error.message });
  }
});

export default router;
