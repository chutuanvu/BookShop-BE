/**
 * ChiTietTruyen (Comic Detail) Routes
 */
const express = require('express');
const router = express.Router();
const chiTietTruyenController = require('../controllers/chiTietTruyen.controller');
const { authenticateUser, authorizeAdmin } = require('../middlewares/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: ComicDetails
 *   description: API endpoints for managing comic details
 */

/**
 * @swagger
 * /api/chi-tiet-truyen:
 *   get:
 *     summary: Get all comic details with pagination
 *     tags: [ComicDetails]
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
 *         description: Paginated list of all comic details
 *       500:
 *         description: Server error
 */
router.get('/', chiTietTruyenController.getAllChiTietTruyen);

router.get('/ran', chiTietTruyenController.getRandomProducts);

/**
 * @swagger
 * /api/chi-tiet-truyen/search/comic:
 *   get:
 *     summary: Search comic details by comic ID
 *     tags: [ComicDetails]
 *     parameters:
 *       - in: query
 *         name: truyenId
 *         schema:
 *           type: string
 *         required: true
 *         description: Comic ID
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
 *         description: Paginated list of matching comic details
 *       400:
 *         description: Missing comic ID
 *       404:
 *         description: Comic not found
 *       500:
 *         description: Server error
 */
router.get('/search/comic', chiTietTruyenController.searchChiTietTruyenByTruyen);

/**
 * @swagger
 * /api/chi-tiet-truyen/search:
 *   get:
 *     summary: Search comic details by price or name
 *     tags: [ComicDetails]
 *     parameters:
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: Keyword to search in name
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Minimum price
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Maximum price
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
 *         description: Paginated list of matching comic details
 *       400:
 *         description: Missing search parameters
 *       500:
 *         description: Server error
 */
router.get('/search', chiTietTruyenController.searchChiTietTruyen);

/**
 * @swagger
 * /api/chi-tiet-truyen/{id}:
 *   get:
 *     summary: Get comic detail by ID
 *     tags: [ComicDetails]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Comic detail ID
 *     responses:
 *       200:
 *         description: Comic detail data
 *       404:
 *         description: Comic detail not found
 *       500:
 *         description: Server error
 */
router.get('/:id', chiTietTruyenController.getChiTietTruyenById);

/**
 * @swagger
 * /api/chi-tiet-truyen:
 *   post:
 *     summary: Create a new comic detail
 *     tags: [ComicDetails]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tenTapTruyen
 *               - hinhAnh
 *               - giaBan
 *               - soTrang
 *               - maTruyen
 *             properties:
 *               tenTapTruyen:
 *                 type: string
 *                 description: Chapter name
 *               hinhAnh:
 *                 type: string
 *                 description: Image URL
 *               giaBan:
 *                 type: number
 *                 description: Price
 *               soTrang:
 *                 type: integer
 *                 description: Number of pages
 *               soLuongTon:
 *                 type: integer
 *                 description: Available quantity
 *               soLuongDaBan:
 *                 type: integer
 *                 description: Sold quantity
 *               maTruyen:
 *                 type: string
 *                 description: Comic ID
 *     responses:
 *       201:
 *         description: Comic detail created successfully
 *       400:
 *         description: Invalid input or missing required fields
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Comic not found
 *       500:
 *         description: Server error
 */
router.post('/', authenticateUser, authorizeAdmin, chiTietTruyenController.createChiTietTruyen);

/**
 * @swagger
 * /api/chi-tiet-truyen/{id}:
 *   put:
 *     summary: Update a comic detail
 *     tags: [ComicDetails]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Comic detail ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tenTapTruyen:
 *                 type: string
 *                 description: Chapter name
 *               hinhAnh:
 *                 type: string
 *                 description: Image URL
 *               giaBan:
 *                 type: number
 *                 description: Price
 *               soTrang:
 *                 type: integer
 *                 description: Number of pages
 *               soLuongTon:
 *                 type: integer
 *                 description: Available quantity
 *               soLuongDaBan:
 *                 type: integer
 *                 description: Sold quantity
 *               maTruyen:
 *                 type: string
 *                 description: Comic ID
 *     responses:
 *       200:
 *         description: Comic detail updated successfully
 *       400:
 *         description: Invalid input or referenced in cart/order
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Comic detail or comic not found
 *       500:
 *         description: Server error
 */
router.put('/:id', authenticateUser, authorizeAdmin, chiTietTruyenController.updateChiTietTruyen);

/**
 * @swagger
 * /api/chi-tiet-truyen/{id}:
 *   delete:
 *     summary: Delete a comic detail
 *     tags: [ComicDetails]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Comic detail ID
 *     responses:
 *       200:
 *         description: Comic detail deleted successfully
 *       400:
 *         description: Cannot delete comic detail referenced in cart/order
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Comic detail not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', authenticateUser, authorizeAdmin, chiTietTruyenController.deleteChiTietTruyen);

module.exports = router;
