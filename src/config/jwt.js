/**
 * JWT Configuration
 */
require('dotenv').config();

const jwtConfig = {
  accessKey: process.env.JWT_ACCESS_KEY,
  accessExpiry: process.env.JWT_ACCESS_EXPIRY,
  refreshKey: process.env.JWT_REFRESH_KEY,
  refreshExpiry: process.env.JWT_REFRESH_EXPIRY,
  algorithm: 'HS256',
  issuer: 'comic-store-api',
  audience: 'comic-store-client'
};

module.exports = jwtConfig;