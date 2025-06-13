/**
 * GioHang (Cart) Controller
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Get cart items by user ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - Response with cart items
 */
const getCartByUserId = async (req, res) => {
    try {
        const userId = req.user.id;

        const cartItems = await prisma.gioHang.findMany({
            where: {
                userId,
            },
            include: {
                chiTietTruyen: {
                    include: {
                        truyen: true,
                    },
                },
            },
        });

        // Calculate total
        let totalAmount = 0;
        cartItems.forEach((item) => {
            totalAmount += item.chiTietTruyen.giaBan * item.soLuong;
        });

        return res.status(200).json({
            success: true,
            count: cartItems.length,
            totalAmount,
            data: cartItems,
        });
    } catch (error) {
        console.error('Get cart items error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy thông tin giỏ hàng',
            error: error.message,
        });
    }
};

/**
 * Add item to cart
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - Response with added cart item
 */
const addToCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const { maChiTietTruyen, soLuong = 1 } = req.body;

        // Validate required fields
        if (!maChiTietTruyen) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp mã chi tiết truyện',
            });
        }

        // Check if comic detail exists
        const chiTietTruyen = await prisma.chiTietTruyen.findUnique({
            where: { id: maChiTietTruyen },
        });

        if (!chiTietTruyen) {
            return res.status(404).json({
                success: false,
                message: 'Chi tiết truyện không tồn tại',
            });
        }

        // Check if there's enough stock
        if (chiTietTruyen.soLuongTon < soLuong) {
            return res.status(400).json({
                success: false,
                message: 'Số lượng không đủ',
                available: chiTietTruyen.soLuongTon,
            });
        }

        // Check if item already exists in cart
        const existingCartItem = await prisma.gioHang.findFirst({
            where: {
                userId,
                maChiTietTruyen,
            },
        });

        let cartItem;

        if (existingCartItem) {
            // Update quantity if item already exists
            const newQuantity = existingCartItem.soLuong + parseInt(soLuong);

            // Recheck stock with new quantity
            if (chiTietTruyen.soLuongTon < newQuantity) {
                return res.status(400).json({
                    success: false,
                    message: 'Số lượng không đủ',
                    available: chiTietTruyen.soLuongTon,
                    currentlyInCart: existingCartItem.soLuong,
                });
            }

            // Update cart item
            cartItem = await prisma.gioHang.update({
                where: { id: existingCartItem.id },
                data: {
                    soLuong: newQuantity,
                },
                include: {
                    chiTietTruyen: {
                        include: {
                            truyen: true,
                        },
                    },
                },
            });
        } else {
            // Create new cart item
            cartItem = await prisma.gioHang.create({
                data: {
                    userId,
                    maChiTietTruyen,
                    soLuong: parseInt(soLuong),
                },
                include: {
                    chiTietTruyen: {
                        include: {
                            truyen: true,
                        },
                    },
                },
            });
        }

        return res.status(201).json({
            success: true,
            message: 'Thêm vào giỏ hàng thành công',
            data: cartItem,
        });
    } catch (error) {
        console.error('Add to cart error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi khi thêm vào giỏ hàng',
            error: error.message,
        });
    }
};

/**
 * Remove item from cart
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - Response with success message
 */
const removeFromCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        // Check if cart item exists and belongs to user
        const cartItem = await prisma.gioHang.findFirst({
            where: {
                id,
                userId,
            },
        });

        if (!cartItem) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy sản phẩm trong giỏ hàng hoặc bạn không có quyền xóa',
            });
        }

        // Delete cart item
        await prisma.gioHang.delete({
            where: { id },
        });

        return res.status(200).json({
            success: true,
            message: 'Xóa sản phẩm khỏi giỏ hàng thành công',
        });
    } catch (error) {
        console.error('Remove from cart error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi khi xóa sản phẩm khỏi giỏ hàng',
            error: error.message,
        });
    }
};

/**
 * Update cart item quantity
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - Response with updated cart item
 */
const updateCartItemQuantity = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const { soLuong } = req.body;

        // Validate quantity
        if (!soLuong || soLuong < 1) {
            return res.status(400).json({
                success: false,
                message: 'Số lượng phải lớn hơn 0',
            });
        }

        // Check if cart item exists and belongs to user
        const cartItem = await prisma.gioHang.findFirst({
            where: {
                id,
                userId,
            },
            include: {
                chiTietTruyen: true,
            },
        });

        if (!cartItem) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy sản phẩm trong giỏ hàng hoặc bạn không có quyền cập nhật',
            });
        }

        // Check if there's enough stock
        if (cartItem.chiTietTruyen.soLuongTon < soLuong) {
            return res.status(400).json({
                success: false,
                message: 'Số lượng không đủ',
                available: cartItem.chiTietTruyen.soLuongTon,
            });
        }

        // Update cart item
        const updatedCartItem = await prisma.gioHang.update({
            where: { id },
            data: {
                soLuong: parseInt(soLuong),
            },
            include: {
                chiTietTruyen: {
                    include: {
                        truyen: true,
                    },
                },
            },
        });

        return res.status(200).json({
            success: true,
            message: 'Cập nhật số lượng thành công',
            data: updatedCartItem,
        });
    } catch (error) {
        console.error('Update cart item quantity error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi khi cập nhật số lượng sản phẩm',
            error: error.message,
        });
    }
};

/**
 * Clear all items from user's cart
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - Response with success message
 */
const clearCart = async (req, res) => {
    try {
        const userId = req.user.id;

        // Delete all cart items for the user
        await prisma.gioHang.deleteMany({
            where: {
                userId,
            },
        });

        return res.status(200).json({
            success: true,
            message: 'Xóa giỏ hàng thành công',
        });
    } catch (error) {
        console.error('Clear cart error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi khi xóa giỏ hàng',
            error: error.message,
        });
    }
};

module.exports = {
    getCartByUserId,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
};
