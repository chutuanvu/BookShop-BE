/**
 * ChiTietHuyDonHang (Order Cancellation Detail) Routes
 */
const express = require('express');
const router = express.Router();
const chiTietHuyDonHangController = require('../controllers/chiTietHuyDonHang.controller');
const { authenticateUser, authorizeAdmin } = require('../middlewares/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: OrderCancellations
 *   description: API endpoints for managing order cancellation requests
 */

/**
 * @swagger
 * /api/chi-tiet-huy-don-hang:
 *   post:
 *     summary: Create a new order cancellation request
 *     tags: [OrderCancellations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - maDonHang
 *               - reasonBack
 *             properties:
 *               maDonHang:
 *                 type: string
 *                 description: Order ID
 *               reasonBack:
 *                 type: string
 *                 description: Reason for cancellation
 *     responses:
 *       201:
 *         description: Order cancellation request created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Not authorized to cancel this order
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 */
router.post('/', authenticateUser, chiTietHuyDonHangController.createChiTietHuyDonHang);

/**
 * @swagger
 * /api/chi-tiet-huy-don-hang/{id}:
 *   delete:
 *     summary: Delete an order cancellation request
 *     tags: [OrderCancellations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Order cancellation request ID
 *     responses:
 *       200:
 *         description: Order cancellation request deleted successfully
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Not authorized to delete this request
 *       404:
 *         description: Order cancellation request not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', authenticateUser, chiTietHuyDonHangController.deleteChiTietHuyDonHang);

/**
 * @swagger
 * /api/chi-tiet-huy-don-hang/user/{userId}:
 *   get:
 *     summary: Get order cancellation requests by user ID
 *     tags: [OrderCancellations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
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
 *         description: List of order cancellation requests
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Not authorized to view these requests
 *       500:
 *         description: Server error
 */
router.get('/user/:userId', authenticateUser, chiTietHuyDonHangController.getChiTietHuyDonHangByUserId);

/**
 * @swagger
 * /api/chi-tiet-huy-don-hang/user:
 *   get:
 *     summary: Get order cancellation requests for the current user
 *     tags: [OrderCancellations]
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
 *         description: List of order cancellation requests
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Server error
 */
router.get('/user', authenticateUser, chiTietHuyDonHangController.getChiTietHuyDonHangByUserId);

/**
 * @swagger
 * /api/chi-tiet-huy-don-hang/{id}:
 *   put:
 *     summary: Update an order cancellation request
 *     tags: [OrderCancellations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Order cancellation request ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reasonBack:
 *                 type: string
 *                 description: Updated reason for cancellation
 *               isAccept:
 *                 type: integer
 *                 description: Acceptance status (0=pending, 1=accepted, 2=rejected) - Admin only
 *               replyContent:
 *                 type: string
 *                 description: Admin reply to the cancellation request - Admin only
 *     responses:
 *       200:
 *         description: Order cancellation request updated successfully
 *       400:
 *         description: Invalid input or no fields to update
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Not authorized to update this request
 *       404:
 *         description: Order cancellation request not found
 *       500:
 *         description: Server error
 */
router.put('/:id', authenticateUser, chiTietHuyDonHangController.updateChiTietHuyDonHang);

module.exports = router;