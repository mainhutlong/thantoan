import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();

/**
 * GET /api/nckh
 * Lấy toàn bộ danh sách NCKH tổng hợp từ view v_nckh_tong_hop
 */
router.get('/', async (req, res) => {
  try {
    const { dot_id, ma_giang_vien, loai_hoat_dong, phan_loai } = req.query;
    let sql = 'SELECT * FROM v_nckh_tong_hop WHERE 1=1';
    const params: any[] = [];

    if (dot_id) {
      sql += ' AND dot_id = ?';
      params.push(dot_id);
    }
    if (ma_giang_vien) {
      sql += ' AND ma_giang_vien = ?';
      params.push(ma_giang_vien);
    }
    if (loai_hoat_dong) {
      sql += ' AND loai_hoat_dong = ?';
      params.push(loai_hoat_dong);
    }
    if (phan_loai) {
      sql += ' AND phan_loai = ?';
      params.push(phan_loai);
    }

    sql += ' ORDER BY ban_ghi_id DESC';
    const [rows]: any = await pool.query(sql, params);

    res.json({
      success: true,
      total: rows.length,
      data: rows,
    });
  } catch (err: any) {
    console.error('Lỗi khi lấy dữ liệu NCKH:', err);
    res.status(500).json({ success: false, message: 'Lỗi server khi truy vấn NCKH', error: err.message });
  }
});

/**
 * GET /api/nckh/bai-bao
 * Lấy danh sách Bài báo khoa học
 */
router.get('/bai-bao', async (req, res) => {
  try {
    const { dot_id, ma_giang_vien } = req.query;
    let sql = 'SELECT * FROM nckh_bai_bao WHERE 1=1';
    const params: any[] = [];

    if (dot_id) {
      sql += ' AND dot_id = ?';
      params.push(dot_id);
    }
    if (ma_giang_vien) {
      sql += ' AND ma_giang_vien = ?';
      params.push(ma_giang_vien);
    }

    sql += ' ORDER BY id DESC';
    const [rows]: any = await pool.query(sql, params);
    res.json({ success: true, total: rows.length, data: rows });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * GET /api/nckh/seminar
 * Lấy danh sách Seminar & Báo cáo học thuật
 */
router.get('/seminar', async (req, res) => {
  try {
    const { dot_id, ma_giang_vien } = req.query;
    let sql = 'SELECT * FROM nckh_seminar WHERE 1=1';
    const params: any[] = [];

    if (dot_id) {
      sql += ' AND dot_id = ?';
      params.push(dot_id);
    }
    if (ma_giang_vien) {
      sql += ' AND ma_giang_vien = ?';
      params.push(ma_giang_vien);
    }

    sql += ' ORDER BY id DESC';
    const [rows]: any = await pool.query(sql, params);
    res.json({ success: true, total: rows.length, data: rows });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * GET /api/nckh/de-tai
 * Lấy danh sách Đề tài NCKH & Luận văn
 */
router.get('/de-tai', async (req, res) => {
  try {
    const { dot_id, ma_giang_vien } = req.query;
    let sql = 'SELECT * FROM nckh_de_tai WHERE 1=1';
    const params: any[] = [];

    if (dot_id) {
      sql += ' AND dot_id = ?';
      params.push(dot_id);
    }
    if (ma_giang_vien) {
      sql += ' AND ma_giang_vien = ?';
      params.push(ma_giang_vien);
    }

    sql += ' ORDER BY id DESC';
    const [rows]: any = await pool.query(sql, params);
    res.json({ success: true, total: rows.length, data: rows });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * POST /api/nckh/bai-bao
 * Thêm mới một bài báo khoa học (kèm minh chứng)
 */
router.post('/bai-bao', async (req, res) => {
  try {
    const {
      dot_id = 1,
      stt_file,
      ma_giang_vien,
      ho_ten,
      hoc_vi = 'Thạc sĩ',
      don_vi,
      ten_bai_bao,
      loai_tap_chi = 'Tạp chí Khoa học',
      gio_quy_doi = 0,
      don_gia = 180000,
      thanh_tien,
      ghi_chu,
      file_minh_chung_url,
      ten_file_minh_chung,
      dung_luong_file,
    } = req.body;

    const calcThanhTien = thanh_tien || Number(gio_quy_doi) * Number(don_gia);

    const [result]: any = await pool.query(
      `INSERT INTO nckh_bai_bao
       (dot_id, stt_file, ma_giang_vien, ho_ten, hoc_vi, don_vi, ten_bai_bao, loai_tap_chi, gio_quy_doi, don_gia, thanh_tien, ghi_chu, file_minh_chung_url, ten_file_minh_chung, dung_luong_file)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        dot_id,
        stt_file || null,
        ma_giang_vien,
        ho_ten,
        hoc_vi,
        don_vi,
        ten_bai_bao,
        loai_tap_chi,
        gio_quy_doi,
        don_gia,
        calcThanhTien,
        ghi_chu || null,
        file_minh_chung_url || null,
        ten_file_minh_chung || null,
        dung_luong_file || null,
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Đã thêm bài báo khoa học thành công',
      id: result.insertId,
    });
  } catch (err: any) {
    console.error('Lỗi khi thêm bài báo:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * POST /api/nckh/seminar
 * Thêm mới một Seminar / Hội thảo
 */
router.post('/seminar', async (req, res) => {
  try {
    const {
      dot_id = 1,
      stt_file,
      ma_giang_vien,
      ho_ten,
      hoc_vi = 'Thạc sĩ',
      don_vi,
      ten_seminar,
      cap_to_chuc = 'Cấp Khoa/Bộ môn',
      gio_quy_doi = 0,
      don_gia = 180000,
      thanh_tien,
      ghi_chu,
      file_minh_chung_url,
      ten_file_minh_chung,
      dung_luong_file,
    } = req.body;

    const calcThanhTien = thanh_tien || Number(gio_quy_doi) * Number(don_gia);

    const [result]: any = await pool.query(
      `INSERT INTO nckh_seminar
       (dot_id, stt_file, ma_giang_vien, ho_ten, hoc_vi, don_vi, ten_seminar, cap_to_chuc, gio_quy_doi, don_gia, thanh_tien, ghi_chu, file_minh_chung_url, ten_file_minh_chung, dung_luong_file)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        dot_id,
        stt_file || null,
        ma_giang_vien,
        ho_ten,
        hoc_vi,
        don_vi,
        ten_seminar,
        cap_to_chuc,
        gio_quy_doi,
        don_gia,
        calcThanhTien,
        ghi_chu || null,
        file_minh_chung_url || null,
        ten_file_minh_chung || null,
        dung_luong_file || null,
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Đã thêm báo cáo seminar thành công',
      id: result.insertId,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * POST /api/nckh/de-tai
 * Thêm mới một Đề tài NCKH
 */
router.post('/de-tai', async (req, res) => {
  try {
    const {
      dot_id = 1,
      stt_file,
      ma_giang_vien,
      ho_ten,
      hoc_vi = 'Thạc sĩ',
      don_vi,
      ten_de_tai,
      cap_de_tai = 'Cấp Cơ sở',
      vai_tro_de_tai = 'Chủ nhiệm',
      gio_quy_doi = 0,
      don_gia = 180000,
      thanh_tien,
      ghi_chu,
      file_minh_chung_url,
      ten_file_minh_chung,
      dung_luong_file,
    } = req.body;

    const calcThanhTien = thanh_tien || Number(gio_quy_doi) * Number(don_gia);

    const [result]: any = await pool.query(
      `INSERT INTO nckh_de_tai
       (dot_id, stt_file, ma_giang_vien, ho_ten, hoc_vi, don_vi, ten_de_tai, cap_de_tai, vai_tro_de_tai, gio_quy_doi, don_gia, thanh_tien, ghi_chu, file_minh_chung_url, ten_file_minh_chung, dung_luong_file)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        dot_id,
        stt_file || null,
        ma_giang_vien,
        ho_ten,
        hoc_vi,
        don_vi,
        ten_de_tai,
        cap_de_tai,
        vai_tro_de_tai,
        gio_quy_doi,
        don_gia,
        calcThanhTien,
        ghi_chu || null,
        file_minh_chung_url || null,
        ten_file_minh_chung || null,
        dung_luong_file || null,
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Đã thêm đề tài NCKH thành công',
      id: result.insertId,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * POST /api/nckh/batch-import
 * Import hàng loạt danh sách bản ghi NCKH từ Excel
 */
router.post('/batch-import', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { dot_id = 1, records = [] } = req.body;
    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ success: false, message: 'Danh sách records trống' });
    }

    await connection.beginTransaction();

    let insertedBB = 0;
    let insertedSM = 0;
    let insertedDT = 0;

    for (let i = 0; i < records.length; i++) {
      const r = records[i];
      const text = `${r.tenHocPhan || ''} ${r.noiDungNCKH || ''} ${r.theLoaiNCKH || ''} ${r.loaiHoatDong || ''}`.toLowerCase();

      const stt = r.tt || (i + 1);
      const maGV = r.maGV || '';
      const hoTen = r.hoTen || '';
      const hocVi = r.hocHamHocVi || 'ThS';
      const donVi = r.khoaBoMon || 'Trường Đại học Tây Đô';
      const ten = r.noiDungNCKH || r.tenHocPhan || '';
      const theLoai = r.theLoaiNCKH || r.loaiHoatDong || '';
      const gioQC = Number(r.soGioQCNCKH || r.tongTietQC) || 0;
      const donGia = Number(r.donGiaTiet) || 180000;
      const thanhTien = Number(r.tongTienThuLao) || (gioQC * donGia);

      if (text.includes('seminar') || text.includes('hội thảo') || text.includes('tọa đàm')) {
        await connection.query(
          `INSERT INTO nckh_seminar
           (dot_id, stt_file, ma_giang_vien, ho_ten, hoc_vi, don_vi, ten_seminar, cap_to_chuc, gio_quy_doi, don_gia, thanh_tien, file_minh_chung_url, ten_file_minh_chung, dung_luong_file)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [dot_id, stt, maGV, hoTen, hocVi, donVi, ten, theLoai || 'Cấp Khoa', gioQC, donGia, thanhTien, r.fileMinhChungUrl || null, r.tenFileMinhChung || null, r.dungLuongFile || null]
        );
        insertedSM++;
      } else if (text.includes('đề tài') || text.includes('luận văn') || text.includes('thạc sĩ') || (!text.includes('bài báo') && !text.includes('scopus'))) {
        await connection.query(
          `INSERT INTO nckh_de_tai
           (dot_id, stt_file, ma_giang_vien, ho_ten, hoc_vi, don_vi, ten_de_tai, cap_de_tai, vai_tro_de_tai, gio_quy_doi, don_gia, thanh_tien, file_minh_chung_url, ten_file_minh_chung, dung_luong_file)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [dot_id, stt, maGV, hoTen, hocVi, donVi, ten, theLoai || 'Cấp Cơ sở', 'Chủ nhiệm', gioQC, donGia, thanhTien, r.fileMinhChungUrl || null, r.tenFileMinhChung || null, r.dungLuongFile || null]
        );
        insertedDT++;
      } else {
        await connection.query(
          `INSERT INTO nckh_bai_bao
           (dot_id, stt_file, ma_giang_vien, ho_ten, hoc_vi, don_vi, ten_bai_bao, loai_tap_chi, gio_quy_doi, don_gia, thanh_tien, file_minh_chung_url, ten_file_minh_chung, dung_luong_file)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [dot_id, stt, maGV, hoTen, hocVi, donVi, ten, theLoai || 'Tạp chí Khoa học', gioQC, donGia, thanhTien, r.fileMinhChungUrl || null, r.tenFileMinhChung || null, r.dungLuongFile || null]
        );
        insertedBB++;
      }
    }

    await connection.commit();
    res.json({
      success: true,
      message: `Đã import thành công: ${insertedBB} bài báo, ${insertedSM} seminar, ${insertedDT} đề tài.`,
      stats: { insertedBB, insertedSM, insertedDT, total: records.length },
    });
  } catch (err: any) {
    await connection.rollback();
    console.error('Lỗi khi batch import NCKH:', err);
    res.status(500).json({ success: false, message: 'Lỗi khi lưu dữ liệu import vào CSDL', error: err.message });
  } finally {
    connection.release();
  }
});

/**
 * DELETE /api/nckh/clear
 * Xóa sạch toàn bộ dữ liệu 3 bảng NCKH để chuẩn bị import mới
 */
router.delete('/clear', async (_req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    await connection.query('TRUNCATE TABLE nckh_bai_bao');
    await connection.query('TRUNCATE TABLE nckh_seminar');
    await connection.query('TRUNCATE TABLE nckh_de_tai');
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');

    res.json({
      success: true,
      message: 'Đã xóa sạch toàn bộ dữ liệu 3 bảng NCKH (nckh_bai_bao, nckh_seminar, nckh_de_tai) trong MySQL.',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  } finally {
    connection.release();
  }
});

/**
 * DELETE /api/nckh/:category/:id
 * Xóa một bản ghi theo danh mục
 */
router.delete('/:category/:id', async (req, res) => {
  try {
    const { category, id } = req.params;
    let table = '';
    if (category === 'bai_bao' || category === 'bai-bao') table = 'nckh_bai_bao';
    else if (category === 'seminar') table = 'nckh_seminar';
    else if (category === 'de_tai' || category === 'de-tai') table = 'nckh_de_tai';
    else {
      return res.status(400).json({ success: false, message: 'Danh mục không hợp lệ (chọn bai_bao, seminar, de_tai)' });
    }

    await pool.query(`DELETE FROM ${table} WHERE id = ?`, [id]);
    res.json({ success: true, message: `Đã xóa bản ghi ${id} trong ${table}` });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * DELETE /api/nckh/lecturer/:maGV
 * Xóa toàn bộ dữ liệu NCKH của một giảng viên
 */
router.delete('/lecturer/:maGV', async (req, res) => {
  try {
    const { maGV } = req.params;
    await pool.query('DELETE FROM nckh_bai_bao WHERE ma_giang_vien = ?', [maGV]);
    await pool.query('DELETE FROM nckh_seminar WHERE ma_giang_vien = ?', [maGV]);
    await pool.query('DELETE FROM nckh_de_tai WHERE ma_giang_vien = ?', [maGV]);
    res.json({ success: true, message: `Đã xóa toàn bộ dữ liệu NCKH của giảng viên ${maGV}` });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * POST /api/nckh/save-lecturer
 * Lưu/cập nhật danh sách bản ghi NCKH của một giảng viên (từ ResearchScheduleReport)
 */
router.post('/save-lecturer', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { dot_id = 1, ma_giang_vien, records = [] } = req.body;
    if (!ma_giang_vien) {
      return res.status(400).json({ success: false, message: 'Thiếu ma_giang_vien' });
    }

    await connection.beginTransaction();

    // 1. Xóa các bản ghi cũ của giảng viên này trong 3 bảng
    await connection.query('DELETE FROM nckh_bai_bao WHERE ma_giang_vien = ?', [ma_giang_vien]);
    await connection.query('DELETE FROM nckh_seminar WHERE ma_giang_vien = ?', [ma_giang_vien]);
    await connection.query('DELETE FROM nckh_de_tai WHERE ma_giang_vien = ?', [ma_giang_vien]);

    // 2. Chèn lại danh sách mới
    for (let i = 0; i < records.length; i++) {
      const r = records[i];
      const text = `${r.tenHocPhan || ''} ${r.noiDungNCKH || ''} ${r.theLoaiNCKH || ''} ${r.loaiHoatDong || ''}`.toLowerCase();
      const stt = r.tt || (i + 1);
      const hoTen = r.hoTen || '';
      const hocVi = r.hocHamHocVi || 'ThS';
      const donVi = r.khoaBoMon || 'Trường Đại học Tây Đô';
      const ten = r.noiDungNCKH || r.tenHocPhan || '';
      const theLoai = r.theLoaiNCKH || r.loaiHoatDong || '';
      const gioQC = Number(r.soGioQCNCKH || r.tongTietQC) || 0;
      const donGia = Number(r.donGiaTiet) || 180000;
      const thanhTien = Number(r.tongTienThuLao) || (gioQC * donGia);

      if (text.includes('seminar') || text.includes('hội thảo') || text.includes('tọa đàm')) {
        await connection.query(
          `INSERT INTO nckh_seminar
           (dot_id, stt_file, ma_giang_vien, ho_ten, hoc_vi, don_vi, ten_seminar, cap_to_chuc, gio_quy_doi, don_gia, thanh_tien, file_minh_chung_url, ten_file_minh_chung, dung_luong_file)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [dot_id, stt, ma_giang_vien, hoTen, hocVi, donVi, ten, theLoai || 'Cấp Khoa', gioQC, donGia, thanhTien, r.fileMinhChungUrl || null, r.tenFileMinhChung || null, r.dungLuongFile || null]
        );
      } else if (text.includes('đề tài') || text.includes('luận văn') || text.includes('thạc sĩ') || (!text.includes('bài báo') && !text.includes('scopus'))) {
        await connection.query(
          `INSERT INTO nckh_de_tai
           (dot_id, stt_file, ma_giang_vien, ho_ten, hoc_vi, don_vi, ten_de_tai, cap_de_tai, vai_tro_de_tai, gio_quy_doi, don_gia, thanh_tien, file_minh_chung_url, ten_file_minh_chung, dung_luong_file)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [dot_id, stt, ma_giang_vien, hoTen, hocVi, donVi, ten, theLoai || 'Cấp Cơ sở', 'Chủ nhiệm', gioQC, donGia, thanhTien, r.fileMinhChungUrl || null, r.tenFileMinhChung || null, r.dungLuongFile || null]
        );
      } else {
        await connection.query(
          `INSERT INTO nckh_bai_bao
           (dot_id, stt_file, ma_giang_vien, ho_ten, hoc_vi, don_vi, ten_bai_bao, loai_tap_chi, gio_quy_doi, don_gia, thanh_tien, file_minh_chung_url, ten_file_minh_chung, dung_luong_file)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [dot_id, stt, ma_giang_vien, hoTen, hocVi, donVi, ten, theLoai || 'Tạp chí Khoa học', gioQC, donGia, thanhTien, r.fileMinhChungUrl || null, r.tenFileMinhChung || null, r.dungLuongFile || null]
        );
      }
    }

    await connection.commit();
    res.json({ success: true, message: `Đã lưu thành công ${records.length} mục NCKH cho giảng viên ${ma_giang_vien}` });
  } catch (err: any) {
    await connection.rollback();
    res.status(500).json({ success: false, message: err.message });
  } finally {
    connection.release();
  }
});

export default router;
