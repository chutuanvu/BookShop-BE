/**
 * Authentication Middleware
 */
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// JWT Secret Keys
const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_KEY || 'your_jwt_secret';

/**
 * Check if user is authenticated
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 * @returns {void}
 */
const authenticateUser = async (req, res, next) => {
    try {
        // Get token from cookies or authorization header
        const token = req.cookies.accessToken || (req.headers.authorization && req.headers.authorization.startsWith('Bearer ') && req.headers.authorization.split(' ')[1]);

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Không có token xác thực',
            });
        }

        // Verify token
        let decoded;
        try {
            decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);
        } catch (err) {
            return res.status(401).json({
                success: false,
                message: 'Token không hợp lệ hoặc đã hết hạn',
            });
        }

        // Check if user exists
        const user = await prisma.nguoiDung.findUnique({
            where: { id: decoded.id },
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Người dùng không tồn tại',
            });
        }

        // Add user to request object
        req.user = {
            id: user.id,
            tenDangNhap: user.tenDangNhap,
            vaiTro: user.vaiTro,
        };

        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi xác thực người dùng',
        });
    }
};

/**
 * Check if user is admin
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 * @returns {void}
 */
const authorizeAdmin = (req, res, next) => {
    if (!req.user || req.user.vaiTro !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Không có quyền truy cập. Yêu cầu quyền quản trị viên',
        });
    }
    next();
};

module.exports = {
    authenticateUser,
    authorizeAdmin,
};
