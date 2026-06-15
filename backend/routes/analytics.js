const express = require('express');
const { getMonthlyAnalytics, getCategoryBreakdown, getSummary, getRecentTransactions } = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/monthly', getMonthlyAnalytics);
router.get('/categories', getCategoryBreakdown);
router.get('/summary', getSummary);
router.get('/recent', getRecentTransactions);

module.exports = router;
