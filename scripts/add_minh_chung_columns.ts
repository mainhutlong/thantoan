import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function run() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'tdu_thantoan_db',
  });

  console.log('Connected to MySQL. Updating tables with minh chung columns...');

  const tables = ['nckh_bai_bao', 'nckh_seminar', 'nckh_de_tai'];
  for (const t of tables) {
    try {
      await conn.query(`
        ALTER TABLE \`${t}\`
        ADD COLUMN \`file_minh_chung_url\` varchar(500) DEFAULT NULL COMMENT 'Đường dẫn/URL file minh chứng PDF/ảnh bài báo',
        ADD COLUMN \`ten_file_minh_chung\` varchar(255) DEFAULT NULL COMMENT 'Tên file minh chứng gốc',
        ADD COLUMN \`dung_luong_file\` int(11) DEFAULT NULL COMMENT 'Dung lượng file (bytes)',
        ADD COLUMN \`ngay_upload_minh_chung\` datetime DEFAULT NULL COMMENT 'Thời gian tải file minh chứng lên';
      `);
      console.log(`✓ Added minh chung columns to table ${t}`);
    } catch (err: any) {
      if (err.message.includes('Duplicate column')) {
        console.log(`ℹ Columns already exist in table ${t}`);
      } else {
        console.error(`Error altering ${t}:`, err.message);
      }
    }
  }

  // Update v_nckh_tong_hop
  await conn.query(`
    CREATE OR REPLACE VIEW \`v_nckh_tong_hop\` AS
    SELECT 
      'BAI_BAO' AS \`loai_hoat_dong\`,
      \`id\` AS \`ban_ghi_id\`,
      \`dot_id\`,
      \`import_id\`,
      \`ma_giang_vien\`,
      \`ho_ten\`,
      \`hoc_vi\`,
      \`don_vi\`,
      \`ten_bai_bao\` AS \`ten_cong_trinh\`,
      \`loai_tap_chi\` AS \`phan_loai\`,
      \`gio_quy_doi\`,
      \`don_gia\`,
      \`thanh_tien\`,
      \`file_minh_chung_url\`,
      \`ten_file_minh_chung\`,
      \`dung_luong_file\`,
      \`ngay_upload_minh_chung\`,
      \`trang_thai_duyet\`,
      \`nguoi_duyet_id\`,
      \`ghi_chu\`,
      \`created_at\`
    FROM \`nckh_bai_bao\`
    UNION ALL
    SELECT 
      'SEMINAR' AS \`loai_hoat_dong\`,
      \`id\` AS \`ban_ghi_id\`,
      \`dot_id\`,
      \`import_id\`,
      \`ma_giang_vien\`,
      \`ho_ten\`,
      \`hoc_vi\`,
      \`don_vi\`,
      \`ten_seminar\` AS \`ten_cong_trinh\`,
      \`cap_to_chuc\` AS \`phan_loai\`,
      \`gio_quy_doi\`,
      \`don_gia\`,
      \`thanh_tien\`,
      \`file_minh_chung_url\`,
      \`ten_file_minh_chung\`,
      \`dung_luong_file\`,
      \`ngay_upload_minh_chung\`,
      \`trang_thai_duyet\`,
      \`nguoi_duyet_id\`,
      \`ghi_chu\`,
      \`created_at\`
    FROM \`nckh_seminar\`
    UNION ALL
    SELECT 
      'DE_TAI' AS \`loai_hoat_dong\`,
      \`id\` AS \`ban_ghi_id\`,
      \`dot_id\`,
      \`import_id\`,
      \`ma_giang_vien\`,
      \`ho_ten\`,
      \`hoc_vi\`,
      \`don_vi\`,
      \`ten_de_tai\` AS \`ten_cong_trinh\`,
      CONCAT(\`cap_de_tai\`, ' (', \`vai_tro_de_tai\`, ')') AS \`phan_loai\`,
      \`gio_quy_doi\`,
      \`don_gia\`,
      \`thanh_tien\`,
      \`file_minh_chung_url\`,
      \`ten_file_minh_chung\`,
      \`dung_luong_file\`,
      \`ngay_upload_minh_chung\`,
      \`trang_thai_duyet\`,
      \`nguoi_duyet_id\`,
      \`ghi_chu\`,
      \`created_at\`
    FROM \`nckh_de_tai\`;
  `);
  console.log('✓ Updated VIEW v_nckh_tong_hop successfully');

  // Seed sample proof for Mai Nhựt Long
  await conn.query(`
    UPDATE \`nckh_bai_bao\`
    SET \`file_minh_chung_url\` = '/uploads/minh_chung/Minh_Chung_Bai_Bao_Scopus_Q2_TDU00128.pdf',
        \`ten_file_minh_chung\` = 'Minh_Chung_Bai_Bao_Scopus_Q2_TDU00128.pdf',
        \`dung_luong_file\` = 2458200,
        \`ngay_upload_minh_chung\` = NOW()
    WHERE \`ma_giang_vien\` = 'TDU00128' AND \`stt_file\` = 1;
  `);
  console.log('✓ Seeded sample proof for Mai Nhựt Long (TDU00128)');

  const [cols]: any = await conn.query('DESCRIBE nckh_bai_bao');
  console.log('\nColumns in nckh_bai_bao:');
  console.table(cols.map((c: any) => ({ Field: c.Field, Type: c.Type, Null: c.Null })));

  await conn.end();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
