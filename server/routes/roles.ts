import { Router, Request, Response } from 'express';
import { pool } from '../db.js';

const router = Router();

// 1. Lấy danh sách các vai trò kèm thành viên và quyền hạn
router.get('/', async (_req: Request, res: Response) => {
  try {
    const [roles]: any = await pool.query('SELECT * FROM vai_tro ORDER BY id ASC');

    const result = [];
    for (const r of roles) {
      // Lấy danh sách thành viên thuộc vai trò
      const [members]: any = await pool.query(
        `SELECT u.id, u.ho_ten AS name, u.ma_nhan_su AS code, u.email, d.ten_don_vi AS unit
         FROM nguoi_dung u
         JOIN nguoi_dung_vai_tro uv ON u.id = uv.nguoi_dung_id
         LEFT JOIN don_vi d ON u.don_vi_id = d.id
         WHERE uv.vai_tro_id = ?`,
        [r.id]
      );

      // Lấy danh sách quyền hạn đã gán
      const [perms]: any = await pool.query(
        `SELECT q.ma_quyen
         FROM quyen_han q
         JOIN vai_tro_quyen vq ON q.id = vq.quyen_han_id
         WHERE vq.vai_tro_id = ?`,
        [r.id]
      );

      result.push({
        id: String(r.id),
        code: r.ma_vai_tro,
        name: r.ten_vai_tro,
        description: r.mo_ta || '',
        dotColor: r.mau_sac || '#2563eb',
        badgeBg: '#eff6ff',
        badgeText: r.mau_sac || '#2563eb',
        members: members.map((m: any) => ({
          id: String(m.id),
          name: m.name,
          code: m.code,
          email: m.email,
          unit: m.unit || 'Đại học Tây Đô',
        })),
        enabledPermissions: perms.map((p: any) => p.ma_quyen),
      });
    }

    return res.json({ success: true, data: result });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi truy vấn vai trò', error: error.message });
  }
});

// 2. Thêm cán bộ vào vai trò
router.post('/:roleId/members', async (req: Request, res: Response) => {
  try {
    const { roleId } = req.params;
    const { userIds } = req.body; // Mảng id người dùng

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ success: false, message: 'Danh sách cán bộ không hợp lệ!' });
    }

    for (const uid of userIds) {
      await pool.query(
        `INSERT IGNORE INTO nguoi_dung_vai_tro (nguoi_dung_id, vai_tro_id) VALUES (?, ?)`,
        [uid, roleId]
      );
    }

    return res.json({ success: true, message: `Đã thêm ${userIds.length} cán bộ vào vai trò thành công!` });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi gán vai trò', error: error.message });
  }
});

// 3. Xóa cán bộ khỏi vai trò
router.delete('/:roleId/members/:userId', async (req: Request, res: Response) => {
  try {
    const { roleId, userId } = req.params;
    await pool.query(
      `DELETE FROM nguoi_dung_vai_tro WHERE vai_tro_id = ? AND nguoi_dung_id = ?`,
      [roleId, userId]
    );
    return res.json({ success: true, message: 'Đã xóa cán bộ khỏi vai trò!' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi xóa khỏi vai trò', error: error.message });
  }
});

export default router;
