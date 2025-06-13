require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const { swaggerDocs } = require('./config/swagger');
const path = require('path');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/auth.routes');
const danhMucRoutes = require('./routes/danhMuc.routes');
const truyenRoutes = require('./routes/truyen.routes');
const chiTietTruyenRoutes = require('./routes/chiTietTruyen.routes');
const gioHangRoutes = require('./routes/gioHang.routes');
const donHangRoutes = require('./routes/donHang.routes');
const chiTietHuyDonHangRoutes = require('./routes/chiTietHuyDonHang.routes');
const diaChiNhanHangRoutes = require('./routes/diaChiNhanHang.routes');
const userRoutes = require('./routes/user.routes');
const paymentRoute = require('./routes/payment.route');
const uploadRoute = require('./routes/upload.route');
const statisticsRoutes = require('./routes/statistics.routes');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

app.use(
    cors({
        origin: 'http://localhost:3000',
        credentials: true,
    }),
);
app.use(express.json());
app.use(cookieParser());

const uploadConfig = require('./config/upload');
const { initializeUploadDirs } = require('./utils/file.utils');
initializeUploadDirs(uploadConfig);
app.use('/uploads', express.static(path.join(__dirname, uploadConfig.uploadsDir)));

app.use('/api/auth', authRoutes);
app.use('/api/danh-muc', danhMucRoutes);
app.use('/api/truyen', truyenRoutes);
app.use('/api/chi-tiet-truyen', chiTietTruyenRoutes);
app.use('/api/gio-hang', gioHangRoutes);
app.use('/api/don-hang', donHangRoutes);
app.use('/api/chi-tiet-huy-don-hang', chiTietHuyDonHangRoutes);
app.use('/api/dia-chi', diaChiNhanHangRoutes);
app.use('/api/users', userRoutes);
app.use('/api/payment', paymentRoute);
app.use('/api/upload', uploadRoute);
app.use('/api/statistics', statisticsRoutes);

app.get('/', (req, res) => {
    res.redirect('/api-docs');
});

app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    swaggerDocs(app);
    try {
        await prisma.$connect();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
});
process.on('SIGINT', async () => {
    await prisma.$disconnect();
    process.exit(0);
});
