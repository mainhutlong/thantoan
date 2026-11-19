import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import roleRoutes from './routes/roles.js';
import nckhRoutes from './routes/nckh.js';
import { testDbConnection } from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health Check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    system: 'Hệ thống Quản lý Thanh toán Thù lao & Giờ giảng TDU',
    database: process.env.DB_NAME || 'tdu_thanhtoan_db',
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/nckh', nckhRoutes);

// Start server
app.listen(PORT, async () => {
  console.log('========================================================');
  console.log(`🚀 TDU Backend API Server đang chạy tại: http://localhost:${PORT}`);
  console.log('👉 SSO Endpoint: POST http://localhost:5000/api/auth/google-sso');
  console.log('👉 Users Endpoint: http://localhost:5000/api/users');
  console.log('👉 Roles Endpoint: http://localhost:5000/api/roles');
  console.log('👉 NCKH Endpoint: http://localhost:5000/api/nckh (Bài báo, Seminar, Đề tài)');
  console.log('========================================================');

  await testDbConnection();
});
