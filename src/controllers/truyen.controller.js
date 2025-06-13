/**
 * Truyen (Comic) Controller
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Get all comics with pagination
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - Response with paginated comics
 */
const getAllTruyenPaginated = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const [truyens, total] = await Promise.all([
            prisma.truyen.findMany({
                include: {
                    danhMuc: true,
                },
                orderBy: {
                    ngayTao: 'desc',
                },
                skip,
                take: limit,
            }),
            prisma.truyen.count(),
        ]);

        const totalPages = Math.ceil(total / limit);

        return res.status(200).json({
            success: true,
            data: truyens,
            page,
            limit,
            total,
            totalPages,
        });
    } catch (error) {
        console.error('Get paginated comics error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách truyện',
            error: error.message,
        });
    }
};

/**
 * Get all comics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - Response with all comics
 */
const getAllTruyen = async (req, res) => {
    try {
        const truyens = await prisma.truyen.findMany({
            include: {
                danhMuc: true,
            },
            orderBy: {
                ngayTao: 'desc',
            },
        });

        return res.status(200).json({
            success: true,
            count: truyens.length,
            data: truyens,
        });
    } catch (error) {
        console.error('Get all comics error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách truyện',
            error: error.message,
        });
    }
};

/**
 * Get total number of comics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - Response with total count
 */
const getTotalTruyen = async (req, res) => {
    try {
        const count = await prisma.truyen.count();

        return res.status(200).json({
            success: true,
            count: count,
        });
    } catch (error) {
        console.error('Get total comics error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi khi đếm tổng số truyện',
            error: error.message,
        });
    }
};

/**
 * Get a single comic by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - Response with comic data
 */
const getTruyenById = async (req, res) => {
    try {
        const { id } = req.params;

        const truyen = await prisma.truyen.findUnique({
            where: { id },
            include: {
                danhMuc: true,
                chiTietTruyen: true,
            },
        });

        if (!truyen) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy truyện',
            });
        }

        return res.status(200).json({
            success: true,
            data: truyen,
        });
    } catch (error) {
        console.error('Get comic by ID error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy thông tin truyện',
            error: error.message,
        });
    }
};

/**
 * Search comics by category
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - Response with matching comics
 */
const searchTruyenByDanhMuc = async (req, res) => {
    try {
        const { danhMucId } = req.query;

        if (!danhMucId) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp ID danh mục',
            });
        }

        // Check if category exists
        const danhMuc = await prisma.danhMuc.findUnique({
            where: { id: danhMucId },
        });

        if (!danhMuc) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy danh mục',
            });
        }

        const truyens = await prisma.truyen.findMany({
            where: {
                maDanhMuc: danhMucId,
            },
            include: {
                danhMuc: true,
            },
            orderBy: {
                ngayTao: 'desc',
            },
        });

        return res.status(200).json({
            success: true,
            count: truyens.length,
            data: truyens,
        });
    } catch (error) {
        console.error('Search comics by category error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi khi tìm kiếm truyện theo danh mục',
            error: error.message,
        });
    }
};

/**
 * Search comics by keyword
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - Response with matching comics
 */
const searchTruyenByKeyword = async (req, res) => {
    try {
        const { keyword } = req.query;

        if (!keyword) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp từ khóa tìm kiếm',
            });
        }

        const truyens = await prisma.truyen.findMany({
            where: {
                OR: [
                    {
                        tenTruyen: {
                            contains: keyword,
                            // Removed mode: 'insensitive' as it's not supported
                        },
                    },
                    {
                        moTa: {
                            contains: keyword,
                            // Removed mode: 'insensitive'
                        },
                    },
                    {
                        theLoai: {
                            contains: keyword,
                            // Removed mode: 'insensitive'
                        },
                    },
                    {
                        tacGia: {
                            contains: keyword,
                            // Removed mode: 'insensitive'
                        },
                    },
                ],
            },
            include: {
                danhMuc: true,
            },
            orderBy: {
                ngayTao: 'desc',
            },
        });

        // For case-insensitive matching, we perform manual filtering
        const keywordLower = keyword.toLowerCase();
        const filteredTruyens = truyens.filter((truyen) => {
            return (
                (truyen.tenTruyen && truyen.tenTruyen.toLowerCase().includes(keywordLower)) ||
                (truyen.moTa && truyen.moTa.toLowerCase().includes(keywordLower)) ||
                (truyen.theLoai && truyen.theLoai.toLowerCase().includes(keywordLower)) ||
                (truyen.tacGia && truyen.tacGia.toLowerCase().includes(keywordLower))
            );
        });

        return res.status(200).json({
            success: true,
            count: filteredTruyens.length,
            data: filteredTruyens,
        });
    } catch (error) {
        console.error('Search comics by keyword error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi khi tìm kiếm truyện theo từ khóa',
            error: error.message,
        });
    }
};

/**
 * Create a new comic
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - Response with created comic
 */
const createTruyen = async (req, res) => {
    try {
        const { tenTruyen, hinhAnh, moTa, theLoai, soTapHienTai, tacGia, maDanhMuc } = req.body;

        // Validate required fields
        if (!tenTruyen || !hinhAnh || !theLoai || !tacGia || !maDanhMuc) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp đầy đủ thông tin: tên truyện, hình ảnh, thể loại, tác giả và mã danh mục',
            });
        }

        // Check if category exists
        const existingDanhMuc = await prisma.danhMuc.findUnique({
            where: { id: maDanhMuc },
        });

        if (!existingDanhMuc) {
            return res.status(404).json({
                success: false,
                message: 'Danh mục không tồn tại',
            });
        }

        // Create new comic
        const newTruyen = await prisma.truyen.create({
            data: {
                tenTruyen,
                hinhAnh,
                moTa,
                theLoai,
                soTapHienTai: soTapHienTai || 0,
                tacGia,
                maDanhMuc,
            },
        });

        return res.status(201).json({
            success: true,
            message: 'Tạo truyện thành công',
            data: newTruyen,
        });
    } catch (error) {
        console.error('Create comic error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi khi tạo truyện',
            error: error.message,
        });
    }
};

/**
 * Update a comic
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - Response with updated comic
 */
const updateTruyen = async (req, res) => {
    try {
        const { id } = req.params;
        const { tenTruyen, hinhAnh, moTa, theLoai, soTapHienTai, tacGia, maDanhMuc } = req.body;

        // Check if comic exists
        const existingTruyen = await prisma.truyen.findUnique({
            where: { id },
        });

        if (!existingTruyen) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy truyện',
            });
        }

        // If updating category, check if it exists
        if (maDanhMuc && maDanhMuc !== existingTruyen.maDanhMuc) {
            const existingDanhMuc = await prisma.danhMuc.findUnique({
                where: { id: maDanhMuc },
            });

            if (!existingDanhMuc) {
                return res.status(404).json({
                    success: false,
                    message: 'Danh mục không tồn tại',
                });
            }
        }

        // Update comic
        const updatedTruyen = await prisma.truyen.update({
            where: { id },
            data: {
                tenTruyen: tenTruyen || existingTruyen.tenTruyen,
                hinhAnh: hinhAnh || existingTruyen.hinhAnh,
                moTa: moTa !== undefined ? moTa : existingTruyen.moTa,
                theLoai: theLoai || existingTruyen.theLoai,
                soTapHienTai: soTapHienTai !== undefined ? soTapHienTai : existingTruyen.soTapHienTai,
                tacGia: tacGia || existingTruyen.tacGia,
                maDanhMuc: maDanhMuc || existingTruyen.maDanhMuc,
            },
        });

        return res.status(200).json({
            success: true,
            message: 'Cập nhật truyện thành công',
            data: updatedTruyen,
        });
    } catch (error) {
        console.error('Update comic error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi khi cập nhật truyện',
            error: error.message,
        });
    }
};

/**
 * Delete a comic
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - Response with success message
 */
const deleteTruyen = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if comic exists
        const existingTruyen = await prisma.truyen.findUnique({
            where: { id },
            include: {
                chiTietTruyen: true,
            },
        });

        if (!existingTruyen) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy truyện',
            });
        }

        // Check if comic has any related comic details
        if (existingTruyen.chiTietTruyen.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Không thể xóa truyện này vì có chi tiết truyện liên quan. Vui lòng xóa chi tiết truyện trước.',
            });
        }

        // Delete comic
        await prisma.truyen.delete({
            where: { id },
        });

        return res.status(200).json({
            success: true,
            message: 'Xóa truyện thành công',
        });
    } catch (error) {
        console.error('Delete comic error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi khi xóa truyện',
            error: error.message,
        });
    }
};

module.exports = {
    getAllTruyen,
    getAllTruyenPaginated,
    getTotalTruyen,
    getTruyenById,
    searchTruyenByDanhMuc,
    searchTruyenByKeyword,
    createTruyen,
    updateTruyen,
    deleteTruyen,
};
