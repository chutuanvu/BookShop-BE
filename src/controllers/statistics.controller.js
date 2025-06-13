/**
 * Statistics Controller - Provides statistics data for admin dashboard
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Order statuses
const ORDER_STATUS = {
    PENDING: 'PENDING',
    SHIPPING: 'SHIPPING',
    SUCCESS: 'SUCCESS',
    BACKPENDING: 'BACK_PENDING',
    BACK: 'BACK',
};

/**
 * Get overview statistics (counts of categories, comics, orders by status, users)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - Response with overview statistics data
 */
const getOverviewStatistics = async (req, res) => {
    try {
        // Execute all queries in parallel for better performance
        const [
            totalCategories, 
            totalComics, 
            pendingOrders, 
            shippingOrders, 
            successOrders,
            backPendingOrders,
            returnedOrders,
            totalUsers
        ] = await Promise.all([
            // Count categories
            prisma.danhMuc.count(),
            
            // Count comics
            prisma.truyen.count(),
            
            // Count pending orders
            prisma.donHang.count({
                where: { trangThai: ORDER_STATUS.PENDING }
            }),
            
            // Count shipping orders
            prisma.donHang.count({
                where: { trangThai: ORDER_STATUS.SHIPPING }
            }),
            
            // Count successful orders
            prisma.donHang.count({
                where: { trangThai: ORDER_STATUS.SUCCESS }
            }),
            
            // Count orders pending return
            prisma.donHang.count({
                where: { trangThai: ORDER_STATUS.BACKPENDING }
            }),
            
            // Count returned orders
            prisma.donHang.count({
                where: { trangThai: ORDER_STATUS.BACK }
            }),
            
            // Count users
            prisma.nguoiDung.count()
        ]);

        return res.status(200).json({
            success: true,
            data: {
                totalCategories,
                totalComics,
                pendingOrders,
                shippingOrders,
                successOrders,
                backPendingOrders,
                returnedOrders,
                totalUsers
            }
        });
    } catch (error) {
        console.error('Error getting overview statistics:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy thống kê tổng quan',
            error: error.message
        });
    }
};

/**
 * Get revenue statistics for a specific day
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - Response with hourly revenue data for the specified day
 */
const getDailyRevenue = async (req, res) => {
    try {
        const { date } = req.query;
        const targetDate = date ? new Date(date) : new Date();
        
        // Set to start of the day
        const startDate = new Date(targetDate);
        startDate.setHours(0, 0, 0, 0);
        
        // Set to end of the day
        const endDate = new Date(targetDate);
        endDate.setHours(23, 59, 59, 999);
        
        // Get successful orders for the day
        const orders = await prisma.donHang.findMany({
            where: {
                trangThai: ORDER_STATUS.SUCCESS,
                ngayTao: {
                    gte: startDate,
                    lte: endDate
                }
            },
            select: {
                tongTien: true,
                ngayTao: true
            }
        });
        
        // Group orders by hour
        const hourlyRevenue = Array.from({ length: 24 }, (_, hour) => ({
            label: `${hour}:00`,
            value: 0
        }));
        
        // Calculate revenue for each hour
        orders.forEach(order => {
            const hour = order.ngayTao.getHours();
            hourlyRevenue[hour].value += order.tongTien;
        });
        
        return res.status(200).json({
            success: true,
            data: hourlyRevenue
        });
    } catch (error) {
        console.error('Error getting daily revenue:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy thống kê doanh thu theo ngày',
            error: error.message
        });
    }
};

/**
 * Get revenue statistics for the current week
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - Response with daily revenue data for the current week
 */
const getWeeklyRevenue = async (req, res) => {
    try {
        // Calculate start and end of the current week (Monday to Sunday)
        const today = new Date();
        const dayOfWeek = today.getDay(); // 0 for Sunday, 1 for Monday, etc.
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
        startDate.setHours(0, 0, 0, 0);
        
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        endDate.setHours(23, 59, 59, 999);
        
        // Get successful orders for the week
        const orders = await prisma.donHang.findMany({
            where: {
                trangThai: ORDER_STATUS.SUCCESS,
                ngayTao: {
                    gte: startDate,
                    lte: endDate
                }
            },
            select: {
                tongTien: true,
                ngayTao: true
            }
        });
        
        // Vietnamese day names
        const dayNames = ['CN', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
        
        // Initialize data structure for 7 days
        const dailyRevenue = Array.from({ length: 7 }, (_, i) => {
            const day = new Date(startDate);
            day.setDate(startDate.getDate() + i);
            return {
                label: dayNames[day.getDay()],
                value: 0,
                date: new Date(day)
            };
        });
        
        // Calculate revenue for each day
        orders.forEach(order => {
            const orderDate = order.ngayTao;
            const dayDiff = Math.floor((orderDate - startDate) / (1000 * 60 * 60 * 24));
            
            if (dayDiff >= 0 && dayDiff < 7) {
                dailyRevenue[dayDiff].value += order.tongTien;
            }
        });
        
        // Remove the date property before sending response
        const response = dailyRevenue.map(({ label, value }) => ({ label, value }));
        
        return res.status(200).json({
            success: true,
            data: response
        });
    } catch (error) {
        console.error('Error getting weekly revenue:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy thống kê doanh thu theo tuần',
            error: error.message
        });
    }
};

/**
 * Get revenue statistics for the current month
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - Response with daily revenue data for the current month
 */
const getMonthlyRevenue = async (req, res) => {
    try {
        const { month, year } = req.query;
        
        // Default to current month and year if not provided
        const now = new Date();
        const targetMonth = month ? parseInt(month) - 1 : now.getMonth(); // 0-indexed
        const targetYear = year ? parseInt(year) : now.getFullYear();
        
        // Get first and last day of the month
        const startDate = new Date(targetYear, targetMonth, 1);
        const endDate = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59, 999);
        
        // Get successful orders for the month
        const orders = await prisma.donHang.findMany({
            where: {
                trangThai: ORDER_STATUS.SUCCESS,
                ngayTao: {
                    gte: startDate,
                    lte: endDate
                }
            },
            select: {
                tongTien: true,
                ngayTao: true
            }
        });
        
        // Get days in month
        const daysInMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
        
        // Initialize data structure for each day of the month
        const dailyRevenue = Array.from({ length: daysInMonth }, (_, i) => ({
            label: `${i + 1}`,
            value: 0
        }));
        
        // Calculate revenue for each day
        orders.forEach(order => {
            const day = order.ngayTao.getDate();
            dailyRevenue[day - 1].value += order.tongTien;
        });
        
        return res.status(200).json({
            success: true,
            data: dailyRevenue
        });
    } catch (error) {
        console.error('Error getting monthly revenue:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy thống kê doanh thu theo tháng',
            error: error.message
        });
    }
};

/**
 * Get revenue statistics for the current year
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - Response with monthly revenue data for the current year
 */
const getYearlyRevenue = async (req, res) => {
    try {
        const { year } = req.query;
        
        // Default to current year if not provided
        const targetYear = year ? parseInt(year) : new Date().getFullYear();
        
        // Get first and last day of the year
        const startDate = new Date(targetYear, 0, 1);
        const endDate = new Date(targetYear, 11, 31, 23, 59, 59, 999);
        
        // Get successful orders for the year
        const orders = await prisma.donHang.findMany({
            where: {
                trangThai: ORDER_STATUS.SUCCESS,
                ngayTao: {
                    gte: startDate,
                    lte: endDate
                }
            },
            select: {
                tongTien: true,
                ngayTao: true
            }
        });
        
        // Vietnamese month names
        const monthNames = [
            'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
            'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
        ];
        
        // Initialize data structure for 12 months
        const monthlyRevenue = Array.from({ length: 12 }, (_, i) => ({
            label: monthNames[i],
            value: 0
        }));
        
        // Calculate revenue for each month
        orders.forEach(order => {
            const month = order.ngayTao.getMonth();
            monthlyRevenue[month].value += order.tongTien;
        });
        
        return res.status(200).json({
            success: true,
            data: monthlyRevenue
        });
    } catch (error) {
        console.error('Error getting yearly revenue:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy thống kê doanh thu theo năm',
            error: error.message
        });
    }
};

/**
 * Get all revenue statistics (daily, weekly, monthly, yearly)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - Response with all revenue statistics
 */
const getAllRevenueStatistics = async (req, res) => {
    try {
        // Using Promise.all to fetch all statistics in parallel
        // But we need to implement each function directly here since they expect res.json
        
        const today = new Date();
        
        // Get start and end of day for daily revenue
        const startOfDay = new Date(today);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(today);
        endOfDay.setHours(23, 59, 59, 999);
        
        // Get start and end of week for weekly revenue
        const dayOfWeek = today.getDay();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
        startOfWeek.setHours(0, 0, 0, 0);
        
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);
        
        // Get start and end of month for monthly revenue
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
        
        // Get start and end of year for yearly revenue
        const startOfYear = new Date(today.getFullYear(), 0, 1);
        const endOfYear = new Date(today.getFullYear(), 11, 31, 23, 59, 59, 999);
        
        // Get orders for daily, weekly, monthly, and yearly periods
        const [dailyOrders, weeklyOrders, monthlyOrders, yearlyOrders] = await Promise.all([
            // Daily orders
            prisma.donHang.findMany({
                where: {
                    trangThai: ORDER_STATUS.SUCCESS,
                    ngayTao: {
                        gte: startOfDay,
                        lte: endOfDay
                    }
                },
                select: {
                    tongTien: true,
                    ngayTao: true
                }
            }),
            
            // Weekly orders
            prisma.donHang.findMany({
                where: {
                    trangThai: ORDER_STATUS.SUCCESS,
                    ngayTao: {
                        gte: startOfWeek,
                        lte: endOfWeek
                    }
                },
                select: {
                    tongTien: true,
                    ngayTao: true
                }
            }),
            
            // Monthly orders
            prisma.donHang.findMany({
                where: {
                    trangThai: ORDER_STATUS.SUCCESS,
                    ngayTao: {
                        gte: startOfMonth,
                        lte: endOfMonth
                    }
                },
                select: {
                    tongTien: true,
                    ngayTao: true
                }
            }),
            
            // Yearly orders
            prisma.donHang.findMany({
                where: {
                    trangThai: ORDER_STATUS.SUCCESS,
                    ngayTao: {
                        gte: startOfYear,
                        lte: endOfYear
                    }
                },
                select: {
                    tongTien: true,
                    ngayTao: true
                }
            })
        ]);
        
        // Process daily revenue
        const hourlyRevenue = Array.from({ length: 24 }, (_, hour) => ({
            label: `${hour}:00`,
            value: 0
        }));
        
        dailyOrders.forEach(order => {
            const hour = order.ngayTao.getHours();
            hourlyRevenue[hour].value += order.tongTien;
        });
        
        // Process weekly revenue
        const dayNames = ['CN', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
        
        const dailyRevenue = Array.from({ length: 7 }, (_, i) => {
            const day = new Date(startOfWeek);
            day.setDate(startOfWeek.getDate() + i);
            return {
                label: dayNames[day.getDay()],
                value: 0,
                date: new Date(day)
            };
        });
        
        weeklyOrders.forEach(order => {
            const orderDate = order.ngayTao;
            const dayDiff = Math.floor((orderDate - startOfWeek) / (1000 * 60 * 60 * 24));
            
            if (dayDiff >= 0 && dayDiff < 7) {
                dailyRevenue[dayDiff].value += order.tongTien;
            }
        });
        
        // Remove the date property before sending response
        const weeklyRevenueData = dailyRevenue.map(({ label, value }) => ({ label, value }));
        
        // Process monthly revenue
        const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
        
        const monthlyRevenue = Array.from({ length: daysInMonth }, (_, i) => ({
            label: `${i + 1}`,
            value: 0
        }));
        
        monthlyOrders.forEach(order => {
            const day = order.ngayTao.getDate();
            monthlyRevenue[day - 1].value += order.tongTien;
        });
        
        // Process yearly revenue
        const monthNames = [
            'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
            'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
        ];
        
        const yearlyRevenue = Array.from({ length: 12 }, (_, i) => ({
            label: monthNames[i],
            value: 0
        }));
        
        yearlyOrders.forEach(order => {
            const month = order.ngayTao.getMonth();
            yearlyRevenue[month].value += order.tongTien;
        });
        
        return res.status(200).json({
            success: true,
            data: {
                daily: hourlyRevenue,
                weekly: weeklyRevenueData,
                monthly: monthlyRevenue,
                yearly: yearlyRevenue
            }
        });
    } catch (error) {
        console.error('Error getting all revenue statistics:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy tất cả thống kê doanh thu',
            error: error.message
        });
    }
};

module.exports = {
    getOverviewStatistics,
    getDailyRevenue,
    getWeeklyRevenue,
    getMonthlyRevenue,
    getYearlyRevenue,
    getAllRevenueStatistics
};