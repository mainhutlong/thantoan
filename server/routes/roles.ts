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
    const { userIds, members } = req.body;

    const rawList = Array.isArray(userIds) ? userIds : (Array.isArray(members) ? members : []);
    if (rawList.length === 0) {
      return res.status(400).json({ success: false, message: 'Danh sách cán bộ không hợp lệ!' });
    }

    // Tìm vai_tro_id dù roleId là ID số hay ma_vai_tro
    let targetRoleId: number | null = null;
    if (/^\d+$/.test(roleId)) {
      targetRoleId = parseInt(roleId, 10);
    } else {
      const [r]: any = await pool.query(
        'SELECT id FROM vai_tro WHERE ma_vai_tro = ? OR LOWER(ma_vai_tro) = LOWER(?) LIMIT 1',
        [roleId, roleId]
      );
      if (r.length > 0) {
        targetRoleId = r[0].id;
      } else {
        const [allRoles]: any = await pool.query('SELECT id, ma_vai_tro FROM vai_tro');
        const found = allRoles.find((ar: any) =>
          ar.ma_vai_tro?.toLowerCase() === roleId.toLowerCase() ||
          ar.ma_vai_tro?.toLowerCase().replace(/_/g, '') === roleId.toLowerCase().replace(/_/g, '')
        );
        if (found) targetRoleId = found.id;
      }
    }

    if (!targetRoleId) {
      return res.status(404).json({ success: false, message: `Không tìm thấy vai trò ${roleId}` });
    }

    let countAdded = 0;
    for (const item of rawList) {
      let resolvedUserId: number | null = null;
      const val = typeof item === 'object' ? (item.code || item.email || item.id) : String(item);

      if (/^\d+$/.test(val)) {
        resolvedUserId = parseInt(val, 10);
      } else {
        const cleanVal = val.replace(/^(u-|staff-)/, '');
        const [u]: any = await pool.query(
          'SELECT id FROM nguoi_dung WHERE ma_nhan_su = ? OR email = ? OR id = ? LIMIT 1',
          [val, val, cleanVal]
        );
        if (u.length > 0) resolvedUserId = u[0].id;
      }

      if (resolvedUserId) {
        await pool.query(
          `INSERT IGNORE INTO nguoi_dung_vai_tro (nguoi_dung_id, vai_tro_id) VALUES (?, ?)`,
          [resolvedUserId, targetRoleId]
        );
        countAdded++;
      }
    }

    return res.json({
      success: true,
      message: `Đã thêm ${countAdded} cán bộ vào vai trò thành công!`,
      addedCount: countAdded,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi gán vai trò', error: error.message });
  }
});

// 3. Xóa cán bộ khỏi vai trò
router.delete('/:roleId/members/:userId', async (req: Request, res: Response) => {
  try {
    const { roleId, userId } = req.params;

    let targetRoleId: number | null = null;
    if (/^\d+$/.test(roleId)) {
      targetRoleId = parseInt(roleId, 10);
    } else {
      const [r]: any = await pool.query(
        'SELECT id FROM vai_tro WHERE ma_vai_tro = ? OR LOWER(ma_vai_tro) = LOWER(?) LIMIT 1',
        [roleId, roleId]
      );
      if (r.length > 0) {
        targetRoleId = r[0].id;
      } else {
        const [allRoles]: any = await pool.query('SELECT id, ma_vai_tro FROM vai_tro');
        const found = allRoles.find((ar: any) =>
          ar.ma_vai_tro?.toLowerCase() === roleId.toLowerCase() ||
          ar.ma_vai_tro?.toLowerCase().replace(/_/g, '') === roleId.toLowerCase().replace(/_/g, '')
        );
        if (found) targetRoleId = found.id;
      }
    }

    let resolvedUserId: number | null = null;
    if (/^\d+$/.test(userId)) {
      resolvedUserId = parseInt(userId, 10);
    } else {
      const cleanVal = userId.replace(/^(u-|staff-)/, '');
      const [u]: any = await pool.query(
        'SELECT id FROM nguoi_dung WHERE ma_nhan_su = ? OR email = ? OR id = ? LIMIT 1',
        [userId, userId, cleanVal]
      );
      if (u.length > 0) resolvedUserId = u[0].id;
    }

    if (targetRoleId && resolvedUserId) {
      await pool.query(
        `DELETE FROM nguoi_dung_vai_tro WHERE vai_tro_id = ? AND nguoi_dung_id = ?`,
        [targetRoleId, resolvedUserId]
      );
    }

    return res.json({ success: true, message: 'Đã xóa cán bộ khỏi vai trò!' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi xóa khỏi vai trò', error: error.message });
  }
});

// Helper: Tra cứu vai_tro_id dù roleId là ID số hay ma_vai_tro
async function resolveRoleId(roleId: string): Promise<number | null> {
  if (/^\d+$/.test(roleId)) {
    return parseInt(roleId, 10);
  }
  const [r]: any = await pool.query(
    'SELECT id FROM vai_tro WHERE ma_vai_tro = ? OR LOWER(ma_vai_tro) = LOWER(?) LIMIT 1',
    [roleId, roleId]
  );
  if (r.length > 0) return r[0].id;
  const [allRoles]: any = await pool.query('SELECT id, ma_vai_tro FROM vai_tro');
  const found = allRoles.find(
    (ar: any) =>
      ar.ma_vai_tro?.toLowerCase() === roleId.toLowerCase() ||
      ar.ma_vai_tro?.toLowerCase().replace(/_/g, '') === roleId.toLowerCase().replace(/_/g, '')
  );
  return found ? found.id : null;
}

// 4. Tạo mới một nhóm vai trò
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, code, description, dotColor } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Tên nhóm vai trò là bắt buộc!' });
    }
    const cleanName = name.trim();
    const cleanCode =
      code && code.trim()
        ? code.trim().toUpperCase()
        : cleanName
            .toUpperCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/Đ/g, 'D')
            .replace(/[^A-Z0-9]/g, '_')
            .replace(/_+/g, '_');
    const cleanDesc = description || `Nhóm vai trò ${cleanName} trên hệ thống TDU.`;
    const cleanColor = dotColor || '#2563eb';

    const [result]: any = await pool.query(
      `INSERT INTO vai_tro (ma_vai_tro, ten_vai_tro, mo_ta, mau_sac) VALUES (?, ?, ?, ?)`,
      [cleanCode, cleanName, cleanDesc, cleanColor]
    );

    return res.json({
      success: true,
      message: 'Tạo mới nhóm vai trò thành công!',
      id: String(result.insertId),
      data: {
        id: String(result.insertId),
        code: cleanCode,
        name: cleanName,
        description: cleanDesc,
        dotColor: cleanColor,
        badgeBg: '#eff6ff',
        badgeText: cleanColor,
        members: [],
        enabledPermissions: [],
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi tạo mới vai trò', error: error.message });
  }
});

// 5. Cập nhật thông tin nhóm vai trò
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, code, description, dotColor } = req.body;
    const targetId = await resolveRoleId(id);
    if (!targetId) {
      return res.status(404).json({ success: false, message: `Không tìm thấy vai trò ${id}` });
    }

    const updates: string[] = [];
    const values: any[] = [];
    if (name) {
      updates.push('ten_vai_tro = ?');
      values.push(name.trim());
    }
    if (code) {
      updates.push('ma_vai_tro = ?');
      values.push(code.trim().toUpperCase());
    }
    if (description !== undefined) {
      updates.push('mo_ta = ?');
      values.push(description);
    }
    if (dotColor) {
      updates.push('mau_sac = ?');
      values.push(dotColor);
    }

    if (updates.length > 0) {
      values.push(targetId);
      await pool.query(`UPDATE vai_tro SET ${updates.join(', ')} WHERE id = ?`, values);
    }

    return res.json({ success: true, message: 'Cập nhật thông tin vai trò thành công!' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi cập nhật vai trò', error: error.message });
  }
});

// 6. Xóa nhóm vai trò
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const targetId = await resolveRoleId(id);
    if (!targetId) {
      return res.status(404).json({ success: false, message: `Không tìm thấy vai trò ${id}` });
    }

    // Không cho xóa vai trò Quản trị viên hệ thống gốc
    const [check]: any = await pool.query('SELECT ma_vai_tro FROM vai_tro WHERE id = ?', [targetId]);
    if (
      check.length > 0 &&
      (check[0].ma_vai_tro === 'QUAN_TRI_VIEN_HE_THONG' || check[0].ma_vai_tro === 'SUPER_ADMIN')
    ) {
      return res.status(400).json({
        success: false,
        message: 'Không thể xóa vai trò Quản trị viên hệ thống mặc định!',
      });
    }

    await pool.query('DELETE FROM nguoi_dung_vai_tro WHERE vai_tro_id = ?', [targetId]);
    await pool.query('DELETE FROM vai_tro_quyen WHERE vai_tro_id = ?', [targetId]);
    await pool.query('DELETE FROM vai_tro WHERE id = ?', [targetId]);

    return res.json({ success: true, message: 'Đã xóa vai trò thành công khỏi CSDL!' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi xóa vai trò', error: error.message });
  }
});

// 7. Cập nhật danh sách quyền hạn đã gán cho vai trò (Lưu phân quyền)
router.put('/:id/permissions', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { enabledPermissions } = req.body;
    const targetId = await resolveRoleId(id);
    if (!targetId) {
      return res.status(404).json({ success: false, message: `Không tìm thấy vai trò ${id}` });
    }

    if (!Array.isArray(enabledPermissions)) {
      return res.status(400).json({ success: false, message: 'Danh sách quyền không hợp lệ!' });
    }

    // 1. Xóa toàn bộ quyền hiện tại của vai trò
    await pool.query('DELETE FROM vai_tro_quyen WHERE vai_tro_id = ?', [targetId]);

    // 2. Tra cứu ID các quyền hạn từ bảng quyen_han và chèn mới
    if (enabledPermissions.length > 0) {
      const [allPerms]: any = await pool.query(
        'SELECT id, ma_quyen FROM quyen_han WHERE ma_quyen IN (?)',
        [enabledPermissions]
      );
      if (allPerms.length > 0) {
        const insertValues = allPerms.map((p: any) => [targetId, p.id]);
        await pool.query(
          'INSERT IGNORE INTO vai_tro_quyen (vai_tro_id, quyen_han_id) VALUES ?',
          [insertValues]
        );
      }
    }

    return res.json({
      success: true,
      message: `Đã lưu thành công ${enabledPermissions.length} quyền hạn cho vai trò vào CSDL!`,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi lưu phân quyền', error: error.message });
  }
});

// 8. Import vai trò hàng loạt từ Excel / JSON
router.post('/import', async (req: Request, res: Response) => {
  try {
    const { roles } = req.body;
    if (!Array.isArray(roles) || roles.length === 0) {
      return res.status(400).json({ success: false, message: 'Không có dữ liệu import vai trò!' });
    }

    let importedCount = 0;
    for (const r of roles) {
      const code = (r.code || r.ma_vai_tro || r.name || '')
        .toUpperCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/Đ/g, 'D')
        .replace(/[^A-Z0-9]/g, '_');
      const name = r.name || r.ten_vai_tro || '';
      if (!name) continue;
      const desc = r.description || r.mo_ta || `Nhóm vai trò ${name}`;
      const color = r.dotColor || r.mau_sac || '#2563eb';

      await pool.query(
        `INSERT INTO vai_tro (ma_vai_tro, ten_vai_tro, mo_ta, mau_sac)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE ten_vai_tro = VALUES(ten_vai_tro), mo_ta = VALUES(mo_ta), mau_sac = VALUES(mau_sac)`,
        [code, name, desc, color]
      );
      importedCount++;
    }

    return res.json({
      success: true,
      message: `Đã nạp thành công ${importedCount} vai trò vào CSDL!`,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Lỗi import vai trò', error: error.message });
  }
});

export default router;
