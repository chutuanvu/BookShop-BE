/**
 * ChiTietTruyen (Comic Detail) Controller
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Get all comic details with pagination
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - Response with paginated comic details
 */
const getAllChiTietTruyen = async (req, res) => {
    try {
        // Get pagination parameters
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Get total count
        const totalCount = await prisma.chiTietTruyen.count();

        // Get paginated data
        const chiTietTruyens = await prisma.chiTietTruyen.findMany({
            include: {
                truyen: true,
            },
            orderBy: {
                tenTapTruyen: 'asc',
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
            count: chiTietTruyens.length,
            totalCount,
            currentPage: page,
            totalPages,
            hasNext,
            hasPrev,
            data: chiTietTruyens,
        });
    } catch (error) {
        console.error('Get all comic details error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách chi tiết truyện',
            error: error.message,
        });
    }
};

const getRandomProducts = async (req, res) => {
    try {
        const count = await prisma.chiTietTruyen.count();
        if (count === 0) return [];
        const max = Math.max(0, count - 5);
        const ran = Math.floor(Math.random() * (max + 1));
        const chiTietTruyen = await prisma.chiTietTruyen.findMany({
            skip: ran,
            take: 5,
        });
        return res.status(200).json({
            success: true,
            data: chiTietTruyen,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Opps',
            error: error.message,
        });
    }
};
/**
 * Get a single comic detail by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - Response with comic detail data
 */
const getChiTietTruyenById = async (req, res) => {
    try {
        const { id } = req.params;

        const chiTietTruyen = await prisma.chiTietTruyen.findUnique({
            where: { id },
            include: {
                truyen: true,
            },
        });

        if (!chiTietTruyen) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy chi tiết truyện',
            });
        }

        return res.status(200).json({
            success: true,
            data: chiTietTruyen,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy thông tin chi tiết truyện',
            error: error.message,
        });
    }
};

/**
 * Search comic details by comic ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - Response with matching comic details
 */
const searchChiTietTruyenByTruyen = async (req, res) => {
    try {
        const { truyenId } = req.query;

        if (!truyenId) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp ID truyện',
            });
        }

        // Check if comic exists
        const truyen = await prisma.truyen.findUnique({
            where: { id: truyenId },
        });

        if (!truyen) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy truyện',
            });
        }

        // Get pagination parameters
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Get total count
        const totalCount = await prisma.chiTietTruyen.count({
            where: { maTruyen: truyenId },
        });

        // Get paginated data
        const chiTietTruyens = await prisma.chiTietTruyen.findMany({
            where: {
                maTruyen: truyenId,
            },
            include: {
                truyen: true,
            },
            orderBy: {
                tenTapTruyen: 'asc',
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
            count: chiTietTruyens.length,
            totalCount,
            currentPage: page,
            totalPages,
            hasNext,
            hasPrev,
            data: chiTietTruyens,
        });
    } catch (error) {
        console.error('Search comic details by comic error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi khi tìm kiếm chi tiết truyện theo truyện',
            error: error.message,
        });
    }
};

/**
 * Search comic details by price or name
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - Response with matching comic details
 */
const searchChiTietTruyen = async (req, res) => {
    try {
        const { minPrice, maxPrice, author, category, keyword } = req.query;
        const whereConditions = {};

        if (minPrice || maxPrice) {
            whereConditions.giaBan = {};

            if (minPrice) {
                whereConditions.giaBan.gte = parseFloat(minPrice);
            }

            if (maxPrice) {
                whereConditions.giaBan.lte = parseFloat(maxPrice);
            }
        }

        whereConditions.truyen = {};

        if (category && category !== 'all') {
            whereConditions.truyen.maDanhMuc = category;
        }

        if (author && author !== 'all') {
            whereConditions.truyen.tacGia = author;
        }

        if (!category && !author) {
            delete whereConditions.truyen;
        }

        if (keyword) {
            whereConditions.OR = [
                {
                    tenTapTruyen: {
                        contains: keyword,
                    },
                },
                {
                    truyen: {
                        tenTruyen: {
                            contains: keyword,
                        },
                    },
                },
            ];
        }
        // Get pagination parameters
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Get total count
        // Clone the conditions to ensure they match
        const countQuery = JSON.parse(JSON.stringify(whereConditions));
        const totalCount = await prisma.chiTietTruyen.count({
            where: countQuery,
        });

        // Get paginated data with the same conditions
        const chiTietTruyens = await prisma.chiTietTruyen.findMany({
            where: whereConditions,
            include: {
                truyen: {
                    include: {
                        danhMuc: true, // Include category info for UI display
                    },
                },
            },
            orderBy: {
                tenTapTruyen: 'asc',
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
            count: chiTietTruyens.length,
            total: totalCount,
            currentPage: page,
            totalPages,
            hasNext,
            hasPrev,
            data: chiTietTruyens,
            // Return the query for debugging
            debug: { query: whereConditions },
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi khi tìm kiếm chi tiết truyện',
            error: error.message,
        });
    }
};

/**
 * Create a new comic detail
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - Response with created comic detail
 */
const createChiTietTruyen = async (req, res) => {
    try {
        const { tenTapTruyen, hinhAnh, giaBan, soTrang, soLuongTon, soLuongDaBan, maTruyen } = req.body;

        // Validate required fields
        if (!tenTapTruyen || !hinhAnh || !giaBan || !soTrang || !maTruyen) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp đầy đủ thông tin: tên tập truyện, hình ảnh, giá bán, số trang và mã truyện',
            });
        }

        // Check if comic exists
        const existingTruyen = await prisma.truyen.findUnique({
            where: { id: maTruyen },
        });

        if (!existingTruyen) {
            return res.status(404).json({
                success: false,
                message: 'Truyện không tồn tại',
            });
        }

        // Create new comic detail
        const newChiTietTruyen = await prisma.chiTietTruyen.create({
            data: {
                tenTapTruyen,
                hinhAnh,
                giaBan: parseFloat(giaBan),
                soTrang: parseInt(soTrang),
                soLuongTon: soLuongTon ? parseInt(soLuongTon) : 0,
                soLuongDaBan: soLuongDaBan ? parseInt(soLuongDaBan) : 0,
                maTruyen,
            },
        });

        // Increment the comic's current chapter count if needed
        const currentChapterCount = await prisma.chiTietTruyen.count({
            where: { maTruyen },
        });

        if (currentChapterCount > existingTruyen.soTapHienTai) {
            await prisma.truyen.update({
                where: { id: maTruyen },
                data: { soTapHienTai: currentChapterCount },
            });
        }

        return res.status(201).json({
            success: true,
            message: 'Tạo chi tiết truyện thành công',
            data: newChiTietTruyen,
        });
    } catch (error) {
        console.error('Create comic detail error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi khi tạo chi tiết truyện',
            error: error.message,
        });
    }
};

/**
 * Update a comic detail
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - Response with updated comic detail
 */
const updateChiTietTruyen = async (req, res) => {
    try {
        const { id } = req.params;
        const { tenTapTruyen, hinhAnh, giaBan, soTrang, soLuongTon, soLuongDaBan, maTruyen } = req.body;

        // Check if comic detail exists
        const existingChiTietTruyen = await prisma.chiTietTruyen.findUnique({
            where: { id },
        });

        if (!existingChiTietTruyen) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy chi tiết truyện',
            });
        }

        // If updating the comic reference, check if it exists
        if (maTruyen && maTruyen !== existingChiTietTruyen.maTruyen) {
            const existingTruyen = await prisma.truyen.findUnique({
                where: { id: maTruyen },
            });

            if (!existingTruyen) {
                return res.status(404).json({
                    success: false,
                    message: 'Truyện không tồn tại',
                });
            }
        }

        // Check if this comic detail is referenced in any cart or order
        const isReferenced = await checkIfChiTietTruyenIsReferenced(id);

        if (isReferenced) {
            return res.status(400).json({
                success: false,
                message: 'Không thể cập nhật chi tiết truyện này vì đang được tham chiếu trong giỏ hàng hoặc đơn hàng',
            });
        }

        // Update comic detail
        const updatedChiTietTruyen = await prisma.chiTietTruyen.update({
            where: { id },
            data: {
                tenTapTruyen: tenTapTruyen || existingChiTietTruyen.tenTapTruyen,
                hinhAnh: hinhAnh || existingChiTietTruyen.hinhAnh,
                giaBan: giaBan ? parseFloat(giaBan) : existingChiTietTruyen.giaBan,
                soTrang: soTrang ? parseInt(soTrang) : existingChiTietTruyen.soTrang,
                soLuongTon: soLuongTon !== undefined ? parseInt(soLuongTon) : existingChiTietTruyen.soLuongTon,
                soLuongDaBan: soLuongDaBan !== undefined ? parseInt(soLuongDaBan) : existingChiTietTruyen.soLuongDaBan,
                maTruyen: maTruyen || existingChiTietTruyen.maTruyen,
            },
        });

        return res.status(200).json({
            success: true,
            message: 'Cập nhật chi tiết truyện thành công',
            data: updatedChiTietTruyen,
        });
    } catch (error) {
        console.error('Update comic detail error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi khi cập nhật chi tiết truyện',
            error: error.message,
        });
    }
};

/**
 * Delete a comic detail
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - Response with success message
 */
const deleteChiTietTruyen = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if comic detail exists
        const existingChiTietTruyen = await prisma.chiTietTruyen.findUnique({
            where: { id },
        });

        if (!existingChiTietTruyen) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy chi tiết truyện',
            });
        }

        // Check if this comic detail is referenced in any cart or order
        const isReferenced = await checkIfChiTietTruyenIsReferenced(id);

        if (isReferenced) {
            return res.status(400).json({
                success: false,
                message: 'Không thể xóa chi tiết truyện này vì đang được tham chiếu trong giỏ hàng hoặc đơn hàng',
            });
        }

        // Delete comic detail
        await prisma.chiTietTruyen.delete({
            where: { id },
        });

        // Update the comic's current chapter count if needed
        const { maTruyen } = existingChiTietTruyen;
        const currentChapterCount = await prisma.chiTietTruyen.count({
            where: { maTruyen },
        });

        await prisma.truyen.update({
            where: { id: maTruyen },
            data: { soTapHienTai: currentChapterCount },
        });

        return res.status(200).json({
            success: true,
            message: 'Xóa chi tiết truyện thành công',
        });
    } catch (error) {
        console.error('Delete comic detail error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi khi xóa chi tiết truyện',
            error: error.message,
        });
    }
};

/**
 * Helper function to check if a comic detail is referenced in any cart or order
 * @param {string} chiTietTruyenId - Comic detail ID
 * @returns {Promise<boolean>} - True if referenced, false otherwise
 */
const checkIfChiTietTruyenIsReferenced = async (chiTietTruyenId) => {
    // Check if referenced in any cart
    const cartReference = await prisma.gioHang.findFirst({
        where: { maChiTietTruyen: chiTietTruyenId },
    });

    if (cartReference) {
        return true;
    }

    // Check if referenced in any order
    const orderReference = await prisma.donHang.findFirst({
        where: { maChiTietTruyen: chiTietTruyenId },
    });

    return !!orderReference;
};

module.exports = {
    getAllChiTietTruyen,
    getChiTietTruyenById,
    searchChiTietTruyenByTruyen,
    searchChiTietTruyen,
    createChiTietTruyen,
    updateChiTietTruyen,
    deleteChiTietTruyen,
    getRandomProducts,
};
