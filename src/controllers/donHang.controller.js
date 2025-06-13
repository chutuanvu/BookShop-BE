/**
 * DonHang (Order) Controller
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Order statuses
const ORDER_STATUS = {
    PENDING: 'PENDING',
    SHIPPING: 'SHIPPING',
    SUCCESS: 'SUCCESS',
    BACKPENDING: 'BACK_PENDING',
    BACK: 'BACK',
};

/**
 * Create a new order
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - Response with created order
 */
const createOrder = async (req, res) => {
    try {
        const userId = req.user.id;
        const { maChiTietTruyen, soLuong, maGiamGiaId, maDiaChi, phuongThucThanhToan } = req.body;
        if (!maChiTietTruyen || !soLuong) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp đầy đủ thông tin: mã chi tiết truyện và số lượng',
            });
        }

        const chiTietTruyen = await prisma.chiTietTruyen.findFirst({
            where: { id: maChiTietTruyen },
        });
        if (chiTietTruyen.soLuongTon < soLuong) {
            return res.status(400).json({
                success: false,
                message: 'Số lượng không đủ',
                available: chiTietTruyen.soLuongTon,
            });
        }

        const tongTien = chiTietTruyen.giaBan * soLuong;

        const order = await prisma.$transaction(async (prisma) => {
            const newOrder = await prisma.donHang.create({
                data: {
                    userId,
                    maChiTietTruyen,
                    tongTien,
                    soLuong,
                    maDiaChi,
                    phuongThucThanhToan,
                    trangThai: ORDER_STATUS.PENDING,
                },
                include: {
                    nguoiDung: {
                        select: {
                            id: true,
                            tenDangNhap: true,
                            nickname: true,
                            fullName: true,
                        },
                    },
                    chiTietTruyen: {
                        include: {
                            truyen: true,
                        },
                    },
                    maGiamGia: true,
                    diaChiNhanHang: true,
                },
            });

            if (maGiamGiaId) {
                await prisma.maGiamGia.update({
                    where: { id: maGiamGiaId },
                    data: {
                        soLuongDung: {
                            increment: 1,
                        },
                    },
                });
            }

            await prisma.chiTietTruyen.update({
                where: { id: maChiTietTruyen },
                data: {
                    soLuongTon: {
                        decrement: soLuong,
                    },
                    soLuongDaBan: {
                        increment: soLuong,
                    },
                },
            });

            const cartItem = await prisma.gioHang.findFirst({
                where: {
                    userId,
                    maChiTietTruyen,
                },
            });

            if (cartItem) {
                await prisma.gioHang.delete({
                    where: { id: cartItem.id },
                });
            }

            return newOrder;
        });

        return res.status(201).json({
            success: true,
            message: 'Đặt hàng thành công',
            data: order,
        });
    } catch (error) {
        console.error('Create order error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi khi tạo đơn hàng',
            error: error.message,
        });
    }
};

/**
 * Update order status
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - Response with updated order
 */
const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { trangThai } = req.body;
        const isAdmin = req.user.vaiTro === 'admin';

        // Validate status
        if (!trangThai || !Object.values(ORDER_STATUS).includes(trangThai)) {
            return res.status(400).json({
                success: false,
                message: 'Trạng thái không hợp lệ. Trạng thái phải là một trong: PENDING, SHIPPING, SUCCESS, BACK',
                validStatuses: Object.values(ORDER_STATUS),
            });
        }

        // Check if order exists
        const existingOrder = await prisma.donHang.findUnique({
            where: { id },
            include: {
                chiTietTruyen: true,
            },
        });

        if (!existingOrder) {
            return res.status(404).json({
                success: false,
                message: 'Đơn hàng không tồn tại',
            });
        }

        // Only admin can update any order, users can only update their own orders
        if (!isAdmin && existingOrder.userId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Bạn không có quyền cập nhật đơn hàng này',
            });
        }

        // Handle special case: changing from SUCCESS/SHIPPING to BACK (return order)
        let shouldUpdateStock = false;
        if ((existingOrder.trangThai === ORDER_STATUS.SUCCESS || existingOrder.trangThai === ORDER_STATUS.SHIPPING) && trangThai === ORDER_STATUS.BACK) {
            shouldUpdateStock = true;
        }

        // Create transaction to ensure data consistency
        const updatedOrder = await prisma.$transaction(async (prisma) => {
            // Update order status
            const order = await prisma.donHang.update({
                where: { id },
                data: {
                    trangThai,
                },
                include: {
                    nguoiDung: {
                        select: {
                            id: true,
                            tenDangNhap: true,
                            nickname: true,
                            fullName: true,
                        },
                    },
                    chiTietTruyen: {
                        include: {
                            truyen: true,
                        },
                    },
                    maGiamGia: true,
                },
            });

            // If returned, restore stock
            if (shouldUpdateStock) {
                await prisma.chiTietTruyen.update({
                    where: { id: existingOrder.maChiTietTruyen },
                    data: {
                        soLuongTon: {
                            increment: existingOrder.soLuong,
                        },
                        soLuongDaBan: {
                            decrement: existingOrder.soLuong,
                        },
                    },
                });
            }

            return order;
        });

        return res.status(200).json({
            success: true,
            message: 'Cập nhật trạng thái đơn hàng thành công',
            data: updatedOrder,
        });
    } catch (error) {
        console.error('Update order status error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi khi cập nhật trạng thái đơn hàng',
            error: error.message,
        });
    }
};

/**
 * Get orders by user ID and status
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - Response with orders
 */
const getOrdersByUserAndStatus = async (req, res) => {
    try {
        const userId = req.user.id;
        const { trangThai } = req.query;
        const isAdmin = req.user.vaiTro === 'admin';

        // Validate status if provided
        if (trangThai && !Object.values(ORDER_STATUS).includes(trangThai)) {
            return res.status(400).json({
                success: false,
                message: 'Trạng thái không hợp lệ. Trạng thái phải là một trong: PENDING, SHIPPING, SUCCESS, BACK',
                validStatuses: Object.values(ORDER_STATUS),
            });
        }

        // Prepare filter conditions
        const whereCondition = {};

        // Non-admin users can only see their own orders
        if (!isAdmin) {
            whereCondition.userId = userId;
        }

        // Add status filter if provided
        if (trangThai) {
            whereCondition.trangThai = trangThai;
        }

        // Get pagination parameters
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Get total count
        const totalCount = await prisma.donHang.count({
            where: whereCondition,
        });

        // Get paginated data
        const orders = await prisma.donHang.findMany({
            where: whereCondition,
            include: {
                nguoiDung: {
                    select: {
                        id: true,
                        tenDangNhap: true,
                        nickname: true,
                        fullName: true,
                    },
                },
                chiTietTruyen: {
                    include: {
                        truyen: true,
                    },
                },
                maGiamGia: true,
                diaChiNhanHang: true,
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
            count: orders.length,
            totalCount,
            currentPage: page,
            totalPages,
            hasNext,
            hasPrev,
            data: orders,
        });
    } catch (error) {
        console.error('Get orders error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách đơn hàng',
            error: error.message,
        });
    }
};

/**
 * Get pending orders
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - Response with pending orders
 */
const getPendingOrders = async (req, res) => {
    req.query.trangThai = ORDER_STATUS.PENDING;
    return getOrdersByUserAndStatus(req, res);
};

/**
 * Get successful orders
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - Response with successful orders
 */
const getSuccessfulOrders = async (req, res) => {
    req.query.trangThai = ORDER_STATUS.SUCCESS;
    return getOrdersByUserAndStatus(req, res);
};

/**
 * Get returned orders
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - Response with returned orders
 */
const getReturnedOrders = async (req, res) => {
    req.query.trangThai = ORDER_STATUS.BACK;
    return getOrdersByUserAndStatus(req, res);
};

module.exports = {
    createOrder,
    updateOrderStatus,
    getOrdersByUserAndStatus,
    getPendingOrders,
    getSuccessfulOrders,
    getReturnedOrders,
};
