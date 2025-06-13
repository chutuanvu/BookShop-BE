/**
 * Authentication utilities
 */
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');

/**
 * Hash a password
 * @param {string} password - Plain text password
 * @returns {Promise<string>} - Hashed password
 */
const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
};

/**
 * Compare password with hashed password
 * @param {string} password - Plain text password
 * @param {string} hashedPassword - Hashed password from database
 * @returns {Promise<boolean>} - True if passwords match
 */
const comparePassword = async (password, hashedPassword) => {
    return bcrypt.compare(password, hashedPassword);
};

/**
 * Generate JWT token
 * @param {Object} payload
 * @returns {string}
 */
const generateAccessToken = (payload) => {
    return jwt.sign(payload, jwtConfig.accessKey, {
        expiresIn: jwtConfig.accessExpiry,
        algorithm: jwtConfig.algorithm,
        issuer: jwtConfig.issuer,
        audience: jwtConfig.audience,
    });
};

const generateRefreshToken = (payload) => {
    return jwt.sign(payload, jwtConfig.refreshKey, {
        expiresIn: jwtConfig.refreshExpiry,
        algorithm: jwtConfig.algorithm,
        issuer: jwtConfig.issuer,
        audience: jwtConfig.audience,
    });
};

/**
 * Verify JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object|null} - Decoded token payload or null if invalid
 */

const verifyRefreshToken = (token) => {
    try {
        return jwt.verify(token, jwtConfig.refreshKey, {
            algorithms: [jwtConfig.algorithm],
            issuer: jwtConfig.issuer,
            audience: jwtConfig.audience,
        });
    } catch (error) {
        return null;
    }
};

module.exports = {
    hashPassword,
    comparePassword,
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken,
};
