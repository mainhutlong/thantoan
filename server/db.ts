import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

// MySQL Connection Pool cho CSDL tdu_thanhtoan_db
export const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'tdu_thanhtoan_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: '+07:00',
  charset: 'utf8mb4',
});

// Kiểm tra kết nối CSDL khi khởi động server
export async function testDbConnection(): Promise<boolean> {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Kết nối thành công tới CSDL MySQL: [', process.env.DB_NAME || 'tdu_thanhtoan_db', ']');
    connection.release();
    return true;
  } catch (err: any) {
    console.error('⚠️ Chưa kết nối được MySQL:', err.message);
    console.error('👉 Vui lòng kiểm tra file .env hoặc đảm bảo dịch vụ MySQL/XAMPP đang chạy.');
    return false;
  }
}
