/**
 * Statistics Routes
 */
const express = require('express');
const router = express.Router();
const statisticsController = require('../controllers/statistics.controller');
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');

// Overview statistics - secured for admin only
router.get('/overview', statisticsController.getOverviewStatistics);

// Revenue statistics - secured for admin only
router.get('/revenue/daily', statisticsController.getDailyRevenue);
router.get('/revenue/weekly', statisticsController.getWeeklyRevenue);
router.get('/revenue/monthly', statisticsController.getMonthlyRevenue);
router.get('/revenue/yearly', statisticsController.getYearlyRevenue);
router.get('/revenue/all', statisticsController.getAllRevenueStatistics);

module.exports = router;