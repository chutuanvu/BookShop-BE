/**
 * DiaChiNhanHang (Shipping Address) Routes
 */
const express = require('express');
const router = express.Router();
const diaChiNhanHangController = require('../controllers/diaChiNhanHang.controller');
const { authenticateUser } = require('../middlewares/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Shipping Addresses
 *   description: API endpoints for managing shipping addresses
 */

/**
 * @swagger
 * /api/dia-chi:
 *   get:
 *     summary: Get all shipping addresses by user ID
 *     tags: [Shipping Addresses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of shipping addresses
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                   example: 2
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ShippingAddress'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Server error
 */
router.get('/', authenticateUser, diaChiNhanHangController.getAddressesByUserId);

/**
 * @swagger
 * /api/dia-chi/{id}:
 *   get:
 *     summary: Get shipping address by ID
 *     tags: [Shipping Addresses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Shipping address ID
 *     responses:
 *       200:
 *         description: Shipping address details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/ShippingAddress'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: Address not found or doesn't belong to user
 *       500:
 *         description: Server error
 */
router.get('/:id', authenticateUser, diaChiNhanHangController.getAddressById);

/**
 * @swagger
 * /api/dia-chi/create:
 *   post:
 *     summary: Create a new shipping address
 *     tags: [Shipping Addresses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - diaChi
 *               - tenNguoiNhan
 *               - soDienThoai
 *             properties:
 *               diaChi:
 *                 type: string
 *                 example: '123 Đường Nguyễn Huệ, Quận 1, TP.HCM'
 *               tenNguoiNhan:
 *                 type: string
 *                 example: 'Nguyễn Văn A'
 *               soDienThoai:
 *                 type: string
 *                 example: '0901234567'
 *     responses:
 *       201:
 *         description: Shipping address created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 'Thêm địa chỉ nhận hàng thành công'
 *                 data:
 *                   $ref: '#/components/schemas/ShippingAddress'
 *       400:
 *         description: Invalid input - Missing required fields
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Server error
 */
router.post('/create', authenticateUser, diaChiNhanHangController.createAddress);

/**
 * @swagger
 * /api/dia-chi/update/{id}:
 *   put:
 *     summary: Update a shipping address
 *     tags: [Shipping Addresses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Shipping address ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               diaChi:
 *                 type: string
 *                 example: '456 Đường Lê Lợi, Quận 3, TP.HCM'
 *               tenNguoiNhan:
 *                 type: string
 *                 example: 'Nguyễn Văn B'
 *               soDienThoai:
 *                 type: string
 *                 example: '0909876543'
 *     responses:
 *       200:
 *         description: Shipping address updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 'Cập nhật địa chỉ nhận hàng thành công'
 *                 data:
 *                   $ref: '#/components/schemas/ShippingAddress'
 *       400:
 *         description: Invalid input - No fields to update
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: Address not found or doesn't belong to user
 *       500:
 *         description: Server error
 */
router.put('update/:id', authenticateUser, diaChiNhanHangController.updateAddress);

/**
 * @swagger
 * /api/dia-chi/delete/{id}:
 *   delete:
 *     summary: Delete a shipping address
 *     tags: [Shipping Addresses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Shipping address ID
 *     responses:
 *       200:
 *         description: Shipping address deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 'Xóa địa chỉ nhận hàng thành công'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: Address not found or doesn't belong to user
 *       500:
 *         description: Server error
 */
router.delete('/delete/:id', authenticateUser, diaChiNhanHangController.deleteAddress);

/**
 * @swagger
 * components:
 *   schemas:
 *     ShippingAddress:
 *       type: object
 *       required:
 *         - id
 *         - diaChi
 *         - tenNguoiNhan
 *         - soDienThoai
 *         - userId
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated ID of the shipping address
 *           example: 550e8400-e29b-41d4-a716-446655440000
 *         diaChi:
 *           type: string
 *           description: Full address
 *           example: 123 Đường Nguyễn Huệ, Quận 1, TP.HCM
 *         tenNguoiNhan:
 *           type: string
 *           description: Recipient's name
 *           example: Nguyễn Văn A
 *         soDienThoai:
 *           type: string
 *           description: Contact phone number
 *           example: 0901234567
 *         userId:
 *           type: string
 *           description: ID of the user who owns this address
 *           example: 550e8400-e29b-41d4-a716-446655440001
 */

module.exports = router;