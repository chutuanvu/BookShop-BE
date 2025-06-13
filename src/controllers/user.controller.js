/**
 * User Management Controller
 */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

/**
 * Get all users with pagination
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - Response with paginated users
 */
const getAllUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Get total count
        const totalCount = await prisma.nguoiDung.count();

        // Get paginated data
        const users = await prisma.nguoiDung.findMany({
            select: {
                id: true,
                tenDangNhap: true,
                vaiTro: true,
                nickname: true,
                fullName: true,
                ngayTao: true,
                _count: {
                    select: {
                        donHang: true,
                        gioHang: true,
                    },
                },
            },
            orderBy: {
                ngayTao: 'desc',
            },
            skip,
            take: limit,
        });

        // Calculate pagination details
        const totalPages = Math.ceil(totalCount / limit);
        const hasNext = page < totalPages;
        const hasPrev = page > 1;

        return res.status(200).json({
            success: true,
            count: users.length,
            totalCount,
            currentPage: page,
            totalPages,
            hasNext,
            hasPrev,
            data: users,
        });
    } catch (error) {
        console.error('Error in getAllUsers:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách người dùng',
            error: error.message,
        });
    }
};

/**
 * Search users
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - Response with matching users
 */
const searchUsers = async (req, res) => {
    try {
        const { keyword } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        if (!keyword) {
            return res.status(400).json({
                success: false,
                message: 'Từ khóa tìm kiếm là bắt buộc',
            });
        }

        // Search condition
        const whereCondition = {
            OR: [{ tenDangNhap: { contains: keyword } }, { nickname: { contains: keyword } }, { fullName: { contains: keyword } }],
        };

        // Get total count
        const totalCount = await prisma.nguoiDung.count({
            where: whereCondition,
        });

        // Get matching users
        const users = await prisma.nguoiDung.findMany({
            where: whereCondition,
            select: {
                id: true,
                tenDangNhap: true,
                vaiTro: true,
                nickname: true,
                fullName: true,
                ngayTao: true,
                _count: {
                    select: {
                        donHang: true,
                        gioHang: true,
                    },
                },
            },
            orderBy: {
                ngayTao: 'desc',
            },
            skip,
            take: limit,
        });

        // Calculate pagination details
        const totalPages = Math.ceil(totalCount / limit);
        const hasNext = page < totalPages;
        const hasPrev = page > 1;

        return res.status(200).json({
            success: true,
            count: users.length,
            totalCount,
            currentPage: page,
            totalPages,
            hasNext,
            hasPrev,
            data: users,
        });
    } catch (error) {
        console.error('Error in searchUsers:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi khi tìm kiếm người dùng',
            error: error.message,
        });
    }
};

/**
 * Get user by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - Response with user data
 */
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await prisma.nguoiDung.findUnique({
            where: { id },
            select: {
                id: true,
                tenDangNhap: true,
                vaiTro: true,
                nickname: true,
                fullName: true,
                ngayTao: true,
                _count: {
                    select: {
                        donHang: true,
                        gioHang: true,
                    },
                },
            },
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Người dùng không tồn tại',
            });
        }

        return res.status(200).json({
            success: true,
            data: user,
        });
    } catch (error) {
        console.error('Error in getUserById:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy thông tin người dùng',
            error: error.message,
        });
    }
};

/**
 * Update user role
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - Response with updated user
 */
const updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { vaiTro } = req.body;

        // Validate role
        if (!vaiTro || !['admin', 'user'].includes(vaiTro)) {
            return res.status(400).json({
                success: false,
                message: 'Vai trò không hợp lệ. Vai trò phải là admin hoặc user',
            });
        }

        // Check if user exists
        const existingUser = await prisma.nguoiDung.findUnique({
            where: { id },
        });

        if (!existingUser) {
            return res.status(404).json({
                success: false,
                message: 'Người dùng không tồn tại',
            });
        }

        // Update user role
        const updatedUser = await prisma.nguoiDung.update({
            where: { id },
            data: { vaiTro },
            select: {
                id: true,
                tenDangNhap: true,
                vaiTro: true,
                nickname: true,
                fullName: true,
                ngayTao: true,
            },
        });

        return res.status(200).json({
            success: true,
            message: 'Cập nhật vai trò người dùng thành công',
            data: updatedUser,
        });
    } catch (error) {
        console.error('Error in updateUserRole:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi khi cập nhật vai trò người dùng',
            error: error.message,
        });
    }
};

/**
 * Block/unblock user (simulated since we don't have a trangThai field)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - Response with user data
 */
const toggleUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { action } = req.body;

        // Validate action
        if (!action || !['block', 'unblock'].includes(action)) {
            return res.status(400).json({
                success: false,
                message: 'Hành động không hợp lệ. Hành động phải là block hoặc unblock',
            });
        }

        // Check if user exists
        const existingUser = await prisma.nguoiDung.findUnique({
            where: { id },
        });

        if (!existingUser) {
            return res.status(404).json({
                success: false,
                message: 'Người dùng không tồn tại',
            });
        }

        // Prevent blocking yourself
        if (req.user.id === id && action === 'block') {
            return res.status(400).json({
                success: false,
                message: 'Không thể khóa tài khoản của chính mình',
            });
        }

        // In a real implementation, we would update a status field
        // Since we can't modify the database, we'll just return a success message
        // In a production app, you would store this status in a separate table or implement
        // a different approach

        const statusMessage = action === 'block' ? 'khóa' : 'mở khóa';

        return res.status(200).json({
            success: true,
            message: `${statusMessage} tài khoản người dùng thành công (mô phỏng)`,
            data: {
                ...existingUser,
                trangThai: action === 'block' ? 'BLOCKED' : 'ACTIVE', // Simulated status
            },
        });
    } catch (error) {
        console.error('Error in toggleUserStatus:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi khi cập nhật trạng thái người dùng',
            error: error.message,
        });
    }
};

/**
 * Delete user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - Response with success message
 */
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if user exists
        const existingUser = await prisma.nguoiDung.findUnique({
            where: { id },
        });

        if (!existingUser) {
            return res.status(404).json({
                success: false,
                message: 'Người dùng không tồn tại',
            });
        }

        // Prevent deleting yourself
        if (req.user.id === id) {
            return res.status(400).json({
                success: false,
                message: 'Không thể xóa tài khoản của chính mình',
            });
        }

        // Check if user has orders
        const userOrders = await prisma.donHang.count({
            where: { userId: id },
        });

        if (userOrders > 0) {
            return res.status(400).json({
                success: false,
                message: 'Không thể xóa người dùng đã có đơn hàng. Hãy khóa tài khoản thay vì xóa',
            });
        }

        // Transaction to delete user-related data
        await prisma.$transaction([
            // Delete user's cart items
            prisma.gioHang.deleteMany({
                where: { userId: id },
            }),
            // Delete user's shipping addresses
            prisma.diaChiNhanHang.deleteMany({
                where: { userId: id },
            }),
            // Delete the user
            prisma.nguoiDung.delete({
                where: { id },
            }),
        ]);

        return res.status(200).json({
            success: true,
            message: 'Xóa người dùng thành công',
        });
    } catch (error) {
        console.error('Error in deleteUser:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi khi xóa người dùng',
            error: error.message,
        });
    }
};

module.exports = {
    getAllUsers,
    getUserById,
    searchUsers,
    updateUserRole,
    toggleUserStatus,
    deleteUser,
};
