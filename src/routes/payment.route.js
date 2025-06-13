const express = require('express');
const router = express.Router();
const {taoDuongDanThanhToan, truyVanThanhToan, xacThucCallbackVNPay} = require('../controllers/payment.controller')



/**
 * @swagger
 * tags:
 *   name: Payment
 *   description: API endpoints for managing paymet
 */



/**
 * @swagger
 * /api/payment/create:
 *   post:
 *     summary: Create a payment link
 *     tags: [Payment]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *             properties:
 *               amount:
 *                 type: number
 *                 description: Payment amount
 *               bankCode:
 *                 type: string
 *                 description: Bank code (optional)
 *               orderInfo:
 *                 type: string
 *                 description: Order information (optional)
 *               returnUrl:
 *                 type: string
 *                 description: URL to redirect after payment (optional)
 *     responses:
 *       200:
 *         description: Payment link created successfully
 *       400:
 *         description: Invalid request parameters
 *       500:
 *         description: Server error
 */
router.post('/create', taoDuongDanThanhToan);


/**
 * @swagger
 * /api/payment/query:
 *   post:
 *     summary: Query payment status
 *     tags: [Payment]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *               - transDate
 *             properties:
 *               orderId:
 *                 type: string
 *                 description: Order ID
 *               transDate:
 *                 type: string
 *                 description: Transaction date
 *     responses:
 *       200:
 *         description: Payment information retrieved successfully
 *       400:
 *         description: Invalid parameters
 *       500:
 *         description: Server error
 */
router.post('/query', truyVanThanhToan);

/**
 * @swagger
 * /api/payment/ipn:
 *   get:
 *     summary: Payment callback verification endpoint (IPN)
 *     tags: [Payment]
 *     parameters:
 *       - in: query
 *         name: vnp_Amount
 *         schema:
 *           type: string
 *         required: true
 *         description: Payment amount
 *       - in: query
 *         name: vnp_ResponseCode
 *         schema:
 *           type: string
 *         required: true
 *         description: Response code (00 = success)
 *       - in: query
 *         name: vnp_TxnRef
 *         schema:
 *           type: string
 *         required: true
 *         description: Order reference ID
 *       - in: query
 *         name: vnp_SecureHash
 *         schema:
 *           type: string
 *         required: true
 *         description: Secure hash for verification
 *     responses:
 *       200:
 *         description: Payment verified successfully
 *       400:
 *         description: Invalid payment verification
 *       500:
 *         description: Server error
 */
router.get('/ipn', xacThucCallbackVNPay);

module.exports = router;