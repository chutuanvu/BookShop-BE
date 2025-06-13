/**
 * Authentication Routes
 */
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticateUser } = require('../middlewares/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: API endpoints for user authentication
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tenDangNhap
 *               - matKhau
 *             properties:
 *               tenDangNhap:
 *                 type: string
 *                 description: Username for the user
 *               matKhau:
 *                 type: string
 *                 description: Password for the user
 *               nickname:
 *                 type: string
 *                 description: User's nickname
 *               fullName:
 *                 type: string
 *                 description: User's full name
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Invalid input or username already exists
 *       500:
 *         description: Server error
 */
router.post('/register', authController.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tenDangNhap
 *               - matKhau
 *             properties:
 *               tenDangNhap:
 *                 type: string
 *                 description: Username for the user
 *               matKhau:
 *                 type: string
 *                 description: Password for the user
 *     responses:
 *       200:
 *         description: User logged in successfully
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Server error
 */
router.post('/login', authController.login);

/**
 * @swagger
 * /api/auth/refresh-token:
 *   get:
 *     summary: Refresh access token
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: New access token generated successfully
 *       401:
 *         description: Invalid or expired refresh token
 *       500:
 *         description: Server error
 */
router.get('/refresh-token', authController.refreshToken);

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile fetched successfully
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get('/profile', authenticateUser, authController.getProfile);

module.exports = router;
