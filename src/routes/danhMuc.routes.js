/**
 * DanhMuc (Category) Routes
 */
const express = require('express');
const router = express.Router();
const danhMucController = require('../controllers/danhMuc.controller');
const { authenticateUser, authorizeAdmin } = require('../middlewares/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: API endpoints for managing categories
 */

/**
 * @swagger
 * /api/danh-muc/paginated:
 *   get:
 *     summary: Get paginated categories
 *     tags: [Categories]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Paginated list of categories
 *       500:
 *         description: Server error
 */
router.get('/paginated', danhMucController.getAllDanhMucPaginated);

/**
 * @swagger
 * /api/danh-muc:
 *   get:
 *     summary: Get all categories
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: List of all categories
 *       500:
 *         description: Server error
 */
router.get('/', danhMucController.getAllDanhMuc);

/**
 * @swagger
 * /api/danh-muc/count:
 *   get:
 *     summary: Get total number of categories
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Total count of categories
 *       500:
 *         description: Server error
 */
router.get('/count', danhMucController.getTotalDanhMuc);

/**
 * @swagger
 * /api/danh-muc/search:
 *   get:
 *     summary: Search categories
 *     tags: [Categories]
 *     parameters:
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         required: true
 *         description: Keyword to search for
 *     responses:
 *       200:
 *         description: List of matching categories
 *       400:
 *         description: Missing keyword
 *       500:
 *         description: Server error
 */
router.get('/search', danhMucController.searchDanhMuc);

/**
 * @swagger
 * /api/danh-muc/{id}:
 *   get:
 *     summary: Get category by ID
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Category data
 *       404:
 *         description: Category not found
 *       500:
 *         description: Server error
 */
router.get('/:id', danhMucController.getDanhMucById);

/**
 * @swagger
 * /api/danh-muc:
 *   post:
 *     summary: Create a new category
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tenDanhMuc
 *             properties:
 *               tenDanhMuc:
 *                 type: string
 *                 description: Category name
 *               moTa:
 *                 type: string
 *                 description: Category description
 *     responses:
 *       201:
 *         description: Category created successfully
 *       400:
 *         description: Invalid input or category name already exists
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Server error
 */
router.post('/', authenticateUser, authorizeAdmin, danhMucController.createDanhMuc);

/**
 * @swagger
 * /api/danh-muc/{id}:
 *   put:
 *     summary: Update a category
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Category ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tenDanhMuc:
 *                 type: string
 *                 description: Category name
 *               moTa:
 *                 type: string
 *                 description: Category description
 *     responses:
 *       200:
 *         description: Category updated successfully
 *       400:
 *         description: Invalid input or category name already exists
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Category not found
 *       500:
 *         description: Server error
 */
router.put('/:id', authenticateUser, authorizeAdmin, danhMucController.updateDanhMuc);

/**
 * @swagger
 * /api/danh-muc/{id}:
 *   delete:
 *     summary: Delete a category
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Category deleted successfully
 *       400:
 *         description: Cannot delete category with related comics
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Category not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', authenticateUser, authorizeAdmin, danhMucController.deleteDanhMuc);

module.exports = router;