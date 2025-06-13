/**
 * DiaChiNhanHang (Shipping Address) Controller
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Get all shipping addresses by user ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - Response with shipping addresses
 */
const getAddressesByUserId = async (req, res) => {
    try {
        const userId = req.user.id;

        const addresses = await prisma.diaChiNhanHang.findMany({
            where: {
                userId,
            },
        });

        return res.status(200).json({
            success: true,
            count: addresses.length,
            data: addresses,
        });
    } catch (error) {
        console.error('Get shipping addresses error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy thông tin địa chỉ nhận hàng',
            error: error.message,
        });
    }
};

/**
 * Get shipping address by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - Response with shipping address
 */
const getAddressById = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const address = await prisma.diaChiNhanHang.findFirst({
            where: {
                id,
                userId,
            },
        });

        if (!address) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy địa chỉ hoặc bạn không có quyền truy cập',
            });
        }

        return res.status(200).json({
            success: true,
            data: address,
        });
    } catch (error) {
        console.error('Get shipping address error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy thông tin địa chỉ nhận hàng',
            error: error.message,
        });
    }
};

/**
 * Create shipping address
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - Response with created shipping address
 */
const createAddress = async (req, res) => {
    try {
        const userId = req.user.id;
        const { diaChi, tenNguoiNhan, soDienThoai } = req.body;

        // Validate required fields
        if (!diaChi || !tenNguoiNhan || !soDienThoai) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp đầy đủ thông tin: địa chỉ, tên người nhận và số điện thoại',
            });
        }

        // Create new shipping address
        const newAddress = await prisma.diaChiNhanHang.create({
            data: {
                diaChi,
                tenNguoiNhan,
                soDienThoai,
                userId,
            },
        });

        return res.status(201).json({
            success: true,
            message: 'Thêm địa chỉ nhận hàng thành công',
            data: newAddress,
        });
    } catch (error) {
        console.error('Create shipping address error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi khi thêm địa chỉ nhận hàng',
            error: error.message,
        });
    }
};

/**
 * Update shipping address
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - Response with updated shipping address
 */
const updateAddress = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const { diaChi, tenNguoiNhan, soDienThoai } = req.body;

        // Check if at least one field is provided
        if (!diaChi && !tenNguoiNhan && !soDienThoai) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp ít nhất một thông tin để cập nhật',
            });
        }

        // Check if address exists and belongs to user
        const existingAddress = await prisma.diaChiNhanHang.findFirst({
            where: {
                id,
                userId,
            },
        });

        if (!existingAddress) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy địa chỉ hoặc bạn không có quyền cập nhật',
            });
        }

        // Update fields that are provided
        const updateData = {};
        if (diaChi) updateData.diaChi = diaChi;
        if (tenNguoiNhan) updateData.tenNguoiNhan = tenNguoiNhan;
        if (soDienThoai) updateData.soDienThoai = soDienThoai;

        // Update address
        const updatedAddress = await prisma.diaChiNhanHang.update({
            where: { id },
            data: updateData,
        });

        return res.status(200).json({
            success: true,
            message: 'Cập nhật địa chỉ nhận hàng thành công',
            data: updatedAddress,
        });
    } catch (error) {
        console.error('Update shipping address error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi khi cập nhật địa chỉ nhận hàng',
            error: error.message,
        });
    }
};

/**
 * Delete shipping address
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - Response with success message
 */
const deleteAddress = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        // Check if address exists and belongs to user
        const existingAddress = await prisma.diaChiNhanHang.findFirst({
            where: {
                id,
                userId,
            },
        });

        if (!existingAddress) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy địa chỉ hoặc bạn không có quyền xóa',
            });
        }

        // Delete address
        await prisma.diaChiNhanHang.delete({
            where: { id },
        });

        return res.status(200).json({
            success: true,
            message: 'Xóa địa chỉ nhận hàng thành công',
        });
    } catch (error) {
        console.error('Delete shipping address error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi khi xóa địa chỉ nhận hàng',
            error: error.message,
        });
    }
};

module.exports = {
    getAddressesByUserId,
    getAddressById,
    createAddress,
    updateAddress,
    deleteAddress,
};