/**
 * GioHang (Cart) Routes
 */
const express = require('express');
const router = express.Router();
const gioHangController = require('../controllers/gioHang.controller');
const { authenticateUser } = require('../middlewares/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Cart
 *   description: API endpoints for managing shopping cart
 */

/**
 * @swagger
 * /api/gio-hang:
 *   get:
 *     summary: Get cart items by user ID
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of cart items
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Server error
 */
router.get('/', authenticateUser, gioHangController.getCartByUserId);

/**
 * @swagger
 * /api/gio-hang:
 *   post:
 *     summary: Add item to cart
 *     tags: [Cart]
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
 *             properties:
 *               maChiTietTruyen:
 *                 type: string
 *                 description: Comic detail ID
 *               soLuong:
 *                 type: integer
 *                 default: 1
 *                 description: Quantity
 *     responses:
 *       201:
 *         description: Item added to cart successfully
 *       400:
 *         description: Invalid input or insufficient stock
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: Comic detail not found
 *       500:
 *         description: Server error
 */
router.post('/', authenticateUser, gioHangController.addToCart);

/**
 * @swagger
 * /api/gio-hang/{id}:
 *   delete:
 *     summary: Remove item from cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Cart item ID
 *     responses:
 *       200:
 *         description: Item removed from cart successfully
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: Cart item not found or doesn't belong to user
 *       500:
 *         description: Server error
 */
// router.delete('/:id', authenticateUser, gioHangController.removeFromCart);

/**
 * @swagger
 * /api/gio-hang/{id}:
 *   put:
 *     summary: Update cart item quantity
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Cart item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - soLuong
 *             properties:
 *               soLuong:
 *                 type: integer
 *                 description: New quantity
 *     responses:
 *       200:
 *         description: Cart item quantity updated successfully
 *       400:
 *         description: Invalid quantity or insufficient stock
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: Cart item not found or doesn't belong to user
 *       500:
 *         description: Server error
 */
router.put('/:id', authenticateUser, gioHangController.updateCartItemQuantity);

/**
 * @swagger
 * /api/gio-hang/clear:
 *   delete:
 *     summary: Clear all items from user's cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart cleared successfully
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Server error
 */
router.delete('/clear', authenticateUser, gioHangController.clearCart);

module.exports = router;