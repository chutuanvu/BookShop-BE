/**
 * Authentication Controller
 */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const { verifyRefreshToken, generateAccessToken, generateRefreshToken } = require('../utils/auth.utils');

const prisma = new PrismaClient();

/**
 * Register a new user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - Response with user data and token
 */
const register = async (req, res) => {
    try {
        const { tenDangNhap, matKhau, nickname, fullName } = req.body;

        // Validate input
        if (!tenDangNhap || !matKhau) {
            return res.status(400).json({
                success: false,
                message: 'Tên đăng nhập và mật khẩu là bắt buộc',
            });
        }

        // Check if username already exists
        const existingUser = await prisma.nguoiDung.findUnique({
            where: { tenDangNhap },
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Tên đăng nhập đã tồn tại',
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(matKhau, 10);

        // Create new user
        const newUser = await prisma.nguoiDung.create({
            data: {
                tenDangNhap,
                matKhau: hashedPassword,
                nickname,
                fullName,
                vaiTro: 'USER', // Default role
            },
        });

        res.status(201).json({
            success: true,
            message: 'Đăng ký thành công',
            data: {
                id: newUser.id,
                tenDangNhap: newUser.tenDangNhap,
                vaiTro: newUser.vaiTro,
                nickname: newUser.nickname,
                fullName: newUser.fullName,
            },
        });
    } catch (error) {
        console.error('Error in register:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message,
        });
    }
};

/**
 * Login user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - Response with user data and token
 */
const login = async (req, res) => {
    try {
        const { tenDangNhap, matKhau } = req.body;

        // Validate input
        if (!tenDangNhap || !matKhau) {
            return res.status(400).json({
                success: false,
                message: 'Tên đăng nhập và mật khẩu là bắt buộc',
            });
        }

        const user = await prisma.nguoiDung.findUnique({
            where: { tenDangNhap },
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Tên đăng nhập hoặc mật khẩu không đúng',
            });
        }

        const isPasswordValid = await bcrypt.compare(matKhau, user.matKhau);

        if (!isPasswordValid) {
            return res.status(404).json({
                success: false,
                message: 'Tên đăng nhập hoặc mật khẩu không đúng',
            });
        }

        const accessToken = await generateAccessToken({ id: user.id, role: user.vaiTro });

        const refreshToken = await generateRefreshToken({ id: user.id });

        res.status(200).json({
            success: true,
            message: 'Đăng nhập thành công',
            data: {
                id: user.id,
                tenDangNhap: user.tenDangNhap,
                vaiTro: user.vaiTro,
                nickname: user.nickname,
                fullName: user.fullName,
                accessToken,
                refreshToken,
            },
            accessToken,
            refreshToken,
        });
    } catch (error) {
        console.error('Error in login:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message,
        });
    }
};

/**
 * Refresh Access Token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const refreshToken = async (req, res) => {
    try {
        // Get refresh token from cookie or request body
        const refreshToken = req.headers.refreshtoken;
        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                message: 'Refresh token không tồn tại',
            });
        }

        // Verify refresh token
        let decoded;
        try {
            decoded = verifyRefreshToken(refreshToken);
        } catch (err) {
            return res.status(401).json({
                success: false,
                message: 'Refresh token không hợp lệ hoặc đã hết hạn',
            });
        }

        // Find user
        const user = await prisma.nguoiDung.findUnique({
            where: { id: decoded.id },
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Người dùng không tồn tại',
            });
        }

        const accessToken = await generateAccessToken({ id: user.id, role: user.vaiTro });
        const newRefreshToken = await generateRefreshToken({ id: user.id });

        res.status(200).json({
            accessToken,
            refreshToken: newRefreshToken,
        });
    } catch (error) {
        console.error('Error in refreshToken:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message,
        });
    }
};

/**
 * Get current user profile
 * @param {Object} req
 * @param {Object} res
 * @returns {Object}
 */
const getProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        // Find user by ID
        const user = await prisma.nguoiDung.findUnique({
            where: { id: userId },
            select: {
                id: true,
                tenDangNhap: true,
                vaiTro: true,
                nickname: true,
                fullName: true,
                ngayTao: true,
            },
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Người dùng không tồn tại',
            });
        }

        res.status(200).json({
            success: true,
            data: user,
        });
    } catch (error) {
        console.error('Error in getProfile:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message,
        });
    }
};

module.exports = {
    register,
    login,
    refreshToken,
    getProfile,
};
