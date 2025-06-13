/**
 * ChiTietHuyDonHang Controller
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Create a new ChiTietHuyDonHang record
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - Response with created ChiTietHuyDonHang record
 */
const createChiTietHuyDonHang = async (req, res) => {
    try {
        const userId = req.user.id;
        const { maDonHang, reasonBack } = req.body;

        // Validate required fields
        if (!maDonHang || !reasonBack) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp đầy đủ thông tin: mã đơn hàng và lý do huỷ',
            });
        }

        // Check if order exists
        const donHang = await prisma.donHang.findUnique({
            where: { id: maDonHang },
        });

        if (!donHang) {
            return res.status(404).json({
                success: false,
                message: 'Đơn hàng không tồn tại',
            });
        }

        // Check if user is authorized to cancel this order
        if (donHang.userId !== userId && req.user.vaiTro !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Bạn không có quyền huỷ đơn hàng này',
            });
        }

        // Create ChiTietHuyDonHang record
        const chiTietHuyDonHang = await prisma.chiTietHuyDonHang.create({
            data: {
                maDonHang,
                userId,
                reasonBack,
                isAccept: 0, // Default to not accepted
            },
            include: {
                donHang: {
                    include: {
                        chiTietTruyen: true,
                    },
                },
                nguoiDUng: {
                    select: {
                        id: true,
                        tenDangNhap: true,
                        nickname: true,
                        fullName: true,
                    },
                },
            },
        });

        return res.status(201).json({
            success: true,
            message: 'Tạo yêu cầu huỷ đơn hàng thành công',
            data: chiTietHuyDonHang,
        });
    } catch (error) {
        console.error('Create ChiTietHuyDonHang error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi khi tạo yêu cầu huỷ đơn hàng',
            error: error.message,
        });
    }
};

/**
 * Delete a ChiTietHuyDonHang record
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - Response with deletion result
 */
const deleteChiTietHuyDonHang = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const isAdmin = req.user.vaiTro === 'admin';

        // Check if record exists
        const chiTietHuyDonHang = await prisma.chiTietHuyDonHang.findUnique({
            where: { id },
        });

        if (!chiTietHuyDonHang) {
            return res.status(404).json({
                success: false,
                message: 'Yêu cầu huỷ đơn hàng không tồn tại',
            });
        }

        // Check if user is authorized to delete this record
        if (!isAdmin && chiTietHuyDonHang.userId !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Bạn không có quyền xoá yêu cầu huỷ đơn hàng này',
            });
        }

        // Delete record
        await prisma.chiTietHuyDonHang.delete({
            where: { id },
        });

        return res.status(200).json({
            success: true,
            message: 'Xoá yêu cầu huỷ đơn hàng thành công',
        });
    } catch (error) {
        console.error('Delete ChiTietHuyDonHang error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi khi xoá yêu cầu huỷ đơn hàng',
            error: error.message,
        });
    }
};

/**
 * Get ChiTietHuyDonHang records by user ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - Response with ChiTietHuyDonHang records
 */
const getChiTietHuyDonHangByUserId = async (req, res) => {
    try {
        const userId = req.params.userId || req.user.id;
        const isAdmin = req.user.vaiTro === 'admin';

        // Non-admin users can only view their own records
        if (!isAdmin && userId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Bạn không có quyền xem yêu cầu huỷ đơn hàng của người khác',
            });
        }

        // Get pagination parameters
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Prepare filter conditions
        const whereCondition = { userId };

        // Get total count
        const totalCount = await prisma.chiTietHuyDonHang.count({
            where: whereCondition,
        });

        // Get paginated data
        const chiTietHuyDonHangRecords = await prisma.chiTietHuyDonHang.findMany({
            where: whereCondition,
            include: {
                donHang: {
                    include: {
                        chiTietTruyen: {
                            include: {
                                truyen: true,
                            },
                        },
                    },
                },
                nguoiDUng: {
                    select: {
                        id: true,
                        tenDangNhap: true,
                        nickname: true,
                        fullName: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
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
            count: chiTietHuyDonHangRecords.length,
            totalCount,
            currentPage: page,
            totalPages,
            hasNext,
            hasPrev,
            data: chiTietHuyDonHangRecords,
        });
    } catch (error) {
        console.error('Get ChiTietHuyDonHang by user ID error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách yêu cầu huỷ đơn hàng',
            error: error.message,
        });
    }
};

/**
 * Update a ChiTietHuyDonHang record
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - Response with updated ChiTietHuyDonHang record
 */
const updateChiTietHuyDonHang = async (req, res) => {
    try {
        const { id } = req.params;
        const { reasonBack, isAccept, replyContent } = req.body;
        const userId = req.user.id;
        const isAdmin = req.user.vaiTro === 'admin';

        // Check if record exists
        const chiTietHuyDonHang = await prisma.chiTietHuyDonHang.findUnique({
            where: { id },
        });

        if (!chiTietHuyDonHang) {
            return res.status(404).json({
                success: false,
                message: 'Yêu cầu huỷ đơn hàng không tồn tại',
            });
        }

        // Regular users can only update their own records and only the reasonBack field
        // Admin can update any record and all fields
        if (!isAdmin && chiTietHuyDonHang.userId !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Bạn không có quyền cập nhật yêu cầu huỷ đơn hàng này',
            });
        }

        const updateData = {};

        // Regular users can only update reasonBack
        if (!isAdmin) {
            if (reasonBack) {
                updateData.reasonBack = reasonBack;
            }
        } else {
            // Admin can update all fields
            if (reasonBack !== undefined) {
                updateData.reasonBack = reasonBack;
            }

            if (isAccept !== undefined) {
                updateData.isAccept = parseInt(isAccept);
            }

            if (replyContent) {
                updateData.replyContent = replyContent;
                updateData.replyAt = new Date();
            }
        }

        // If no fields to update
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Không có thông tin cập nhật',
            });
        }

        // Update record
        const updatedRecord = await prisma.chiTietHuyDonHang.update({
            where: { id },
            data: updateData,
            include: {
                donHang: {
                    include: {
                        chiTietTruyen: {
                            include: {
                                truyen: true,
                            },
                        },
                    },
                },
                nguoiDUng: {
                    select: {
                        id: true,
                        tenDangNhap: true,
                        nickname: true,
                        fullName: true,
                    },
                },
            },
        });

        return res.status(200).json({
            success: true,
            message: 'Cập nhật yêu cầu huỷ đơn hàng thành công',
            data: updatedRecord,
        });
    } catch (error) {
        console.error('Update ChiTietHuyDonHang error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi khi cập nhật yêu cầu huỷ đơn hàng',
            error: error.message,
        });
    }
};

module.exports = {
    createChiTietHuyDonHang,
    deleteChiTietHuyDonHang,
    getChiTietHuyDonHangByUserId,
    updateChiTietHuyDonHang,
};
