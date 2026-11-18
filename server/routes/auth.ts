import { Router, Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { pool } from '../db.js';

const router = Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const JWT_SECRET = process.env.JWT_SECRET || 'tdu_thantoan_jwt_secret_key_2026';

// 1. Endpoint xác thực Google SSO ID Token
router.post('/google-sso', async (req: Request, res: Response) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ success: false, message: 'Thiếu Google Credential Token!' });
    }

    // Xác minh token với máy chủ Google
    let payload: any;
    try {
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch (err: any) {
      return res.status(401).json({
        success: false,
        message: 'Google Credential Token không hợp lệ hoặc đã hết hạn!',
        error: err.message,
      });
    }

    const email = payload.email?.toLowerCase().trim();
    const ssoUid = payload.sub;
    const avatarUrl = payload.picture || '';

    // Kiểm tra tên miền email trường Đại học Tây Đô
    if (!email.endsWith('@tdu.edu.vn') && process.env.ALLOW_EXTERNAL_TEST !== 'true') {
      return res.status(403).json({
        success: false,
        message: `Tài khoản (${email}) không thuộc tên miền Đại học Tây Đô (@tdu.edu.vn)!`,
      });
    }

    // Tra cứu người dùng & danh sách quyền từ CSDL MySQL tdu_thanhtoan_db
    const query = `
      SELECT 
        u.id, u.ma_nhan_su, u.ho_ten, u.email, u.chuc_vu, u.trang_thai,
        d.ten_don_vi,
        GROUP_CONCAT(DISTINCT v.ma_vai_tro) AS roles,
        GROUP_CONCAT(DISTINCT v.ten_vai_tro) AS role_names,
        GROUP_CONCAT(DISTINCT q.ma_quyen) AS permissions
      FROM nguoi_dung u
      LEFT JOIN don_vi d ON u.don_vi_id = d.id
      LEFT JOIN nguoi_dung_vai_tro uv ON u.id = uv.nguoi_dung_id
      LEFT JOIN vai_tro v ON uv.vai_tro_id = v.id
      LEFT JOIN vai_tro_quyen vq ON v.id = vq.vai_tro_id
      LEFT JOIN quyen_han q ON vq.quyen_han_id = q.id
      WHERE LOWER(u.email) = ?
      GROUP BY u.id
    `;
    let [rows]: any = await pool.query(query, [email]);

    if (!rows || rows.length === 0) {
      // Tự động kích hoạt tài khoản cán bộ mới từ Google Workspace (@tdu.edu.vn)
      const nameFromGoogle = payload.name || email.split('@')[0];
      const newStaffCode = `TDU${Math.floor(10000 + Math.random() * 90000)}`;

      try {
        const [insertRes]: any = await pool.query(
          `INSERT INTO nguoi_dung (
            ma_nhan_su, ho_ten, email, chuc_vu, don_vi_id,
            sso_provider, sso_uid, avatar_url, trang_thai, lan_dang_nhap_cuoi
          ) VALUES (?, ?, ?, 'Giảng viên', 1, 'GOOGLE', ?, ?, 'HOAT_DONG', NOW())`,
          [newStaffCode, nameFromGoogle, email, ssoUid, avatarUrl]
        );

        const newUserId = insertRes.insertId;
        // Gán vai trò mặc định: GIANG_VIEN (vai_tro_id: 8)
        await pool.query(
          `INSERT INTO nguoi_dung_vai_tro (nguoi_dung_id, vai_tro_id) VALUES (?, 8)`,
          [newUserId]
        );

        const [reQuery]: any = await pool.query(query, [email]);
        rows = reQuery;
      } catch (autoErr: any) {
        return res.status(500).json({
          success: false,
          message: 'Không thể tự động kích hoạt tài khoản: ' + autoErr.message,
        });
      }
    }

    const user = rows[0];

    if (user.trang_thai !== 'HOAT_DONG') {
      return res.status(403).json({
        success: false,
        message: 'Tài khoản cán bộ này đang trong trạng thái bị khóa hoặc đã nghỉ việc!',
      });
    }

    // Cập nhật UID SSO và thời gian đăng nhập
    try {
      await pool.query(
        `UPDATE nguoi_dung SET sso_uid = ?, avatar_url = ?, lan_dang_nhap_cuoi = NOW() WHERE id = ?`,
        [ssoUid, avatarUrl, user.id]
      );
      await pool.query(
        `INSERT INTO nhat_ky_sso (nguoi_dung_id, email, trang_thai) VALUES (?, ?, 'THANH_CONG')`,
        [user.id, email]
      );
    } catch (e) {
      console.warn('Lỗi cập nhật audit log:', e);
    }

    const rolesList = user.roles ? user.roles.split(',') : [];
    const permissionsList = user.permissions ? user.permissions.split(',') : [];

    // Tạo JWT Token có thời hạn 8 tiếng
    const token = jwt.sign(
      {
        userId: user.id,
        maNhanSu: user.ma_nhan_su,
        hoTen: user.ho_ten,
        email: user.email,
        roles: rolesList,
        permissions: permissionsList,
      },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    return res.json({
      success: true,
      message: 'Đăng nhập SSO thành công!',
      token,
      user: {
        id: user.id,
        maNhanSu: user.ma_nhan_su,
        hoTen: user.ho_ten,
        email: user.email,
        chucVu: user.chuc_vu,
        donVi: user.ten_don_vi,
        avatar: avatarUrl,
        roles: rolesList,
        roleNames: user.role_names ? user.role_names.split(',') : [],
        permissions: permissionsList,
      },
    });
  } catch (error: any) {
    console.error('Lỗi SSO:', error);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ khi xác thực SSO', error: error.message });
  }
});

// 2. Endpoint Đăng nhập nhanh cho môi trường Phát triển / Thử nghiệm nội bộ (Dev Mock Login)
router.post('/dev-login', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp email cán bộ!' });
    }

    const query = `
      SELECT 
        u.id, u.ma_nhan_su, u.ho_ten, u.email, u.chuc_vu, u.trang_thai,
        d.ten_don_vi,
        GROUP_CONCAT(DISTINCT v.ma_vai_tro) AS roles,
        GROUP_CONCAT(DISTINCT v.ten_vai_tro) AS role_names,
        GROUP_CONCAT(DISTINCT q.ma_quyen) AS permissions
      FROM nguoi_dung u
      LEFT JOIN don_vi d ON u.don_vi_id = d.id
      LEFT JOIN nguoi_dung_vai_tro uv ON u.id = uv.nguoi_dung_id
      LEFT JOIN vai_tro v ON uv.vai_tro_id = v.id
      LEFT JOIN vai_tro_quyen vq ON v.id = vq.vai_tro_id
      LEFT JOIN quyen_han q ON vq.quyen_han_id = q.id
      WHERE LOWER(u.email) = ?
      GROUP BY u.id
    `;
    let [rows]: any = await pool.query(query, [email.toLowerCase().trim()]);

    if (!rows || rows.length === 0) {
      const cleanEmail = email.toLowerCase().trim();
      const defaultName = cleanEmail.split('@')[0];
      const newStaffCode = `TDU${Math.floor(10000 + Math.random() * 90000)}`;

      const [insertRes]: any = await pool.query(
        `INSERT INTO nguoi_dung (
          ma_nhan_su, ho_ten, email, chuc_vu, don_vi_id,
          sso_provider, trang_thai, lan_dang_nhap_cuoi
        ) VALUES (?, ?, ?, 'Giảng viên', 1, 'LOCAL', 'HOAT_DONG', NOW())`,
        [newStaffCode, defaultName, cleanEmail]
      );

      await pool.query(
        `INSERT INTO nguoi_dung_vai_tro (nguoi_dung_id, vai_tro_id) VALUES (?, 8)`,
        [insertRes.insertId]
      );

      const [reQuery]: any = await pool.query(query, [cleanEmail]);
      rows = reQuery;
    }

    const user = rows[0];
    const rolesList = user.roles ? user.roles.split(',') : [];
    const permissionsList = user.permissions ? user.permissions.split(',') : [];

    const token = jwt.sign(
      {
        userId: user.id,
        maNhanSu: user.ma_nhan_su,
        hoTen: user.ho_ten,
        email: user.email,
        roles: rolesList,
        permissions: permissionsList,
      },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    return res.json({
      success: true,
      token,
      user: {
        id: user.id,
        maNhanSu: user.ma_nhan_su,
        hoTen: user.ho_ten,
        email: user.email,
        chucVu: user.chuc_vu,
        donVi: user.ten_don_vi,
        roles: rolesList,
        roleNames: user.role_names ? user.role_names.split(',') : [],
        permissions: permissionsList,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi truy vấn CSDL', error: error.message });
  }
});

// 3. Endpoint lấy thông tin phiên làm việc hiện tại
router.get('/me', async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Chưa đăng nhập!' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    return res.json({ success: true, user: decoded });
  } catch {
    return res.status(401).json({ success: false, message: 'Phiên làm việc hết hạn!' });
  }
});

export default router;
