/**
 * DanhMuc (Category) Controller
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Get all categories with pagination
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - Response with paginated categories
 */
const getAllDanhMucPaginated = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const [danhMucs, total] = await Promise.all([
            prisma.danhMuc.findMany({
                orderBy: {
                    ngayTao: 'desc',
                },
                skip,
                take: limit,
            }),
            prisma.danhMuc.count(),
        ]);

        const totalPages = Math.ceil(total / limit);

        return res.status(200).json({
            success: true,
            data: danhMucs,
            page,
            limit,
            total,
            totalPages,
        });
    } catch (error) {
        console.error('Get paginated categories error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách danh mục',
            error: error.message,
        });
    }
};

/**
 * Get all categories
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - Response with all categories
 */
const getAllDanhMuc = async (req, res) => {
    try {
        const danhMucs = await prisma.danhMuc.findMany({
            orderBy: {
                ngayTao: 'desc',
            },
        });

        return res.status(200).json({
            success: true,
            count: danhMucs.length,
            data: danhMucs,
        });
    } catch (error) {
        console.error('Get all categories error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách danh mục',
            error: error.message,
        });
    }
};

/**
 * Get total number of categories
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - Response with total count
 */
const getTotalDanhMuc = async (req, res) => {
    try {
        const count = await prisma.danhMuc.count();

        return res.status(200).json({
            success: true,
            count: count,
        });
    } catch (error) {
        console.error('Get total categories error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi khi đếm tổng số danh mục',
            error: error.message,
        });
    }
};

/**
 * Get a single category by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - Response with category data
 */
const getDanhMucById = async (req, res) => {
    try {
        const { id } = req.params;

        const danhMuc = await prisma.danhMuc.findUnique({
            where: { id },
        });

        if (!danhMuc) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy danh mục',
            });
        }

        return res.status(200).json({
            success: true,
            data: danhMuc,
        });
    } catch (error) {
        console.error('Get category by ID error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy thông tin danh mục',
            error: error.message,
        });
    }
};

/**
 * Search categories
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - Response with matching categories
 */
const searchDanhMuc = async (req, res) => {
    try {
        const { keyword } = req.query;

        if (!keyword) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp từ khóa tìm kiếm',
            });
        }

        const danhMucs = await prisma.danhMuc.findMany({
            where: {
                OR: [
                    {
                        tenDanhMuc: {
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
                ],
            },
            orderBy: {
                ngayTao: 'desc',
            },
        });

        // For case-insensitive matching, we perform manual filtering
        const keywordLower = keyword.toLowerCase();
        const filteredDanhMucs = danhMucs.filter((danhMuc) => {
            return (danhMuc.tenDanhMuc && danhMuc.tenDanhMuc.toLowerCase().includes(keywordLower)) || (danhMuc.moTa && danhMuc.moTa.toLowerCase().includes(keywordLower));
        });

        return res.status(200).json({
            success: true,
            count: filteredDanhMucs.length,
            data: filteredDanhMucs,
        });
    } catch (error) {
        console.error('Search categories error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi khi tìm kiếm danh mục',
            error: error.message,
        });
    }
};

/**
 * Create a new category
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - Response with created category
 */
const createDanhMuc = async (req, res) => {
    try {
        const { tenDanhMuc, moTa } = req.body;

        if (!tenDanhMuc) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp tên danh mục',
            });
        }

        // Check if category with same name already exists
        const existingDanhMuc = await prisma.danhMuc.findUnique({
            where: { tenDanhMuc },
        });

        if (existingDanhMuc) {
            return res.status(400).json({
                success: false,
                message: 'Danh mục với tên này đã tồn tại',
            });
        }

        // Create new category
        const newDanhMuc = await prisma.danhMuc.create({
            data: {
                tenDanhMuc,
                moTa,
            },
        });

        return res.status(201).json({
            success: true,
            message: 'Tạo danh mục thành công',
            data: newDanhMuc,
        });
    } catch (error) {
        console.error('Create category error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi khi tạo danh mục',
            error: error.message,
        });
    }
};

/**
 * Update a category
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - Response with updated category
 */
const updateDanhMuc = async (req, res) => {
    try {
        const { id } = req.params;
        const { tenDanhMuc, moTa } = req.body;

        // Check if category exists
        const existingDanhMuc = await prisma.danhMuc.findUnique({
            where: { id },
        });

        if (!existingDanhMuc) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy danh mục',
            });
        }

        // If changing name, check if new name conflicts with another category
        if (tenDanhMuc && tenDanhMuc !== existingDanhMuc.tenDanhMuc) {
            const duplicateName = await prisma.danhMuc.findUnique({
                where: { tenDanhMuc },
            });

            if (duplicateName) {
                return res.status(400).json({
                    success: false,
                    message: 'Danh mục với tên này đã tồn tại',
                });
            }
        }

        // Update category
        const updatedDanhMuc = await prisma.danhMuc.update({
            where: { id },
            data: {
                tenDanhMuc: tenDanhMuc || existingDanhMuc.tenDanhMuc,
                moTa: moTa !== undefined ? moTa : existingDanhMuc.moTa,
            },
        });

        return res.status(200).json({
            success: true,
            message: 'Cập nhật danh mục thành công',
            data: updatedDanhMuc,
        });
    } catch (error) {
        console.error('Update category error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi khi cập nhật danh mục',
            error: error.message,
        });
    }
};

/**
 * Delete a category
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - Response with success message
 */
const deleteDanhMuc = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if category exists
        const existingDanhMuc = await prisma.danhMuc.findUnique({
            where: { id },
        });

        if (!existingDanhMuc) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy danh mục',
            });
        }

        // Check if category has any associated comics
        const relatedTruyen = await prisma.truyen.findFirst({
            where: { maDanhMuc: id },
        });

        if (relatedTruyen) {
            return res.status(400).json({
                success: false,
                message: 'Không thể xóa danh mục này vì có truyện liên quan đến danh mục',
            });
        }

        // Delete category
        await prisma.danhMuc.delete({
            where: { id },
        });

        return res.status(200).json({
            success: true,
            message: 'Xóa danh mục thành công',
        });
    } catch (error) {
        console.error('Delete category error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi khi xóa danh mục',
            error: error.message,
        });
    }
};

module.exports = {
    getAllDanhMuc,
    getAllDanhMucPaginated,
    getTotalDanhMuc,
    getDanhMucById,
    searchDanhMuc,
    createDanhMuc,
    updateDanhMuc,
    deleteDanhMuc,
};
