/**
 * DonHang (Order) Routes
 */
const express = require('express');
const router = express.Router();
const donHangController = require('../controllers/donHang.controller');
const { authenticateUser, authorizeAdmin } = require('../middlewares/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: API endpoints for managing orders
 */

/**
 * @swagger
 * /api/don-hang:
 *   post:
 *     summary: Create a new order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - maChiTietTruyen
 *               - soLuong
 *             properties:
 *               maChiTietTruyen:
 *                 type: string
 *                 description: Comic detail ID
 *               soLuong:
 *                 type: integer
 *                 description: Quantity
 *               maGiamGiaId:
 *                 type: string
 *                 description: Discount code ID (optional)
 *     responses:
 *       201:
 *         description: Order created successfully
 *       400:
 *         description: Invalid input, insufficient stock, or invalid/expired discount code
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: Comic detail or discount code not found
 *       500:
 *         description: Server error
 */
router.post('/create', authenticateUser, donHangController.createOrder);

/**
 * @swagger
 * /api/don-hang/{id}/status:
 *   put:
 *     summary: Update order status
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - trangThai
 *             properties:
 *               trangThai:
 *                 type: string
 *                 enum: [PENDING, SHIPPING, SUCCESS, BACK]
 *                 description: Order status
 *     responses:
 *       200:
 *         description: Order status updated successfully
 *       400:
 *         description: Invalid status
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Not authorized to update this order
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 */
router.put('/:id/status', authenticateUser, donHangController.updateOrderStatus);

/**
 * @swagger
 * /api/don-hang:
 *   get:
 *     summary: Get orders by user ID and status
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: trangThai
 *         schema:
 *           type: string
 *           enum: [PENDING, SHIPPING, SUCCESS, BACK]
 *         description: Filter by order status (optional)
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
 *         description: List of orders
 *       400:
 *         description: Invalid status
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Server error
 */
router.get('/', authenticateUser, donHangController.getOrdersByUserAndStatus);

/**
 * @swagger
 * /api/don-hang/pending:
 *   get:
 *     summary: Get pending orders
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
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
 *         description: List of pending orders
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Server error
 */
router.get('/pending', authenticateUser, donHangController.getPendingOrders);

/**
 * @swagger
 * /api/don-hang/success:
 *   get:
 *     summary: Get successful orders
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
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
 *         description: List of successful orders
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Server error
 */
router.get('/success', authenticateUser, donHangController.getSuccessfulOrders);

/**
 * @swagger
 * /api/don-hang/returned:
 *   get:
 *     summary: Get returned orders
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
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
 *         description: List of returned orders
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Server error
 */
router.get('/returned', authenticateUser, donHangController.getReturnedOrders);

module.exports = router;