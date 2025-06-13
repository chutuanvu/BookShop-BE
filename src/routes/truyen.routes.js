/**
 * Truyen (Comic) Routes
 */
const express = require('express');
const router = express.Router();
const truyenController = require('../controllers/truyen.controller');
const { authenticateUser, authorizeAdmin } = require('../middlewares/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Comics
 *   description: API endpoints for managing comics
 */

/**
 * @swagger
 * /api/truyen/paginated:
 *   get:
 *     summary: Get paginated comics
 *     tags: [Comics]
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
 *         description: Paginated list of comics
 *       500:
 *         description: Server error
 */
router.get('/paginated', truyenController.getAllTruyenPaginated);

/**
 * @swagger
 * /api/truyen:
 *   get:
 *     summary: Get all comics
 *     tags: [Comics]
 *     responses:
 *       200:
 *         description: List of all comics
 *       500:
 *         description: Server error
 */
router.get('/', truyenController.getAllTruyen);

/**
 * @swagger
 * /api/truyen/count:
 *   get:
 *     summary: Get total number of comics
 *     tags: [Comics]
 *     responses:
 *       200:
 *         description: Total count of comics
 *       500:
 *         description: Server error
 */
router.get('/count', truyenController.getTotalTruyen);

/**
 * @swagger
 * /api/truyen/search/category:
 *   get:
 *     summary: Search comics by category
 *     tags: [Comics]
 *     parameters:
 *       - in: query
 *         name: danhMucId
 *         schema:
 *           type: string
 *         required: true
 *         description: Category ID
 *     responses:
 *       200:
 *         description: List of matching comics
 *       400:
 *         description: Missing category ID
 *       404:
 *         description: Category not found
 *       500:
 *         description: Server error
 */
router.get('/search/category', truyenController.searchTruyenByDanhMuc);

/**
 * @swagger
 * /api/truyen/search/keyword:
 *   get:
 *     summary: Search comics by keyword
 *     tags: [Comics]
 *     parameters:
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         required: true
 *         description: Keyword to search for
 *     responses:
 *       200:
 *         description: List of matching comics
 *       400:
 *         description: Missing keyword
 *       500:
 *         description: Server error
 */
router.get('/search/keyword', truyenController.searchTruyenByKeyword);

/**
 * @swagger
 * /api/truyen/{id}:
 *   get:
 *     summary: Get comic by ID
 *     tags: [Comics]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Comic ID
 *     responses:
 *       200:
 *         description: Comic data
 *       404:
 *         description: Comic not found
 *       500:
 *         description: Server error
 */
router.get('/:id', truyenController.getTruyenById);

/**
 * @swagger
 * /api/truyen:
 *   post:
 *     summary: Create a new comic
 *     tags: [Comics]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tenTruyen
 *               - hinhAnh
 *               - theLoai
 *               - tacGia
 *               - maDanhMuc
 *             properties:
 *               tenTruyen:
 *                 type: string
 *                 description: Comic title
 *               hinhAnh:
 *                 type: string
 *                 description: Image URL for the comic
 *               moTa:
 *                 type: string
 *                 description: Comic description
 *               theLoai:
 *                 type: string
 *                 description: Comic genre
 *               soTapHienTai:
 *                 type: integer
 *                 description: Current number of chapters
 *               tacGia:
 *                 type: string
 *                 description: Comic author
 *               maDanhMuc:
 *                 type: string
 *                 description: Category ID
 *     responses:
 *       201:
 *         description: Comic created successfully
 *       400:
 *         description: Invalid input or missing required fields
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Category not found
 *       500:
 *         description: Server error
 */
router.post('/', authenticateUser, authorizeAdmin, truyenController.createTruyen);

/**
 * @swagger
 * /api/truyen/{id}:
 *   put:
 *     summary: Update a comic
 *     tags: [Comics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Comic ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tenTruyen:
 *                 type: string
 *                 description: Comic title
 *               hinhAnh:
 *                 type: string
 *                 description: Image URL for the comic
 *               moTa:
 *                 type: string
 *                 description: Comic description
 *               theLoai:
 *                 type: string
 *                 description: Comic genre
 *               soTapHienTai:
 *                 type: integer
 *                 description: Current number of chapters
 *               tacGia:
 *                 type: string
 *                 description: Comic author
 *               maDanhMuc:
 *                 type: string
 *                 description: Category ID
 *     responses:
 *       200:
 *         description: Comic updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Comic or category not found
 *       500:
 *         description: Server error
 */
router.put('/:id', authenticateUser, authorizeAdmin, truyenController.updateTruyen);

/**
 * @swagger
 * /api/truyen/{id}:
 *   delete:
 *     summary: Delete a comic
 *     tags: [Comics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Comic ID
 *     responses:
 *       200:
 *         description: Comic deleted successfully
 *       400:
 *         description: Cannot delete comic with related comic details
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Comic not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', authenticateUser, authorizeAdmin, truyenController.deleteTruyen);

module.exports = router;