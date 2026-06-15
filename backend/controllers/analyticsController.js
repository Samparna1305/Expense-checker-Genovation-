const Transaction = require('../models/Transaction');

// @desc    Get monthly analytics
// @route   GET /api/analytics/monthly
// @access  Private
const getMonthlyAnalytics = async (req, res) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();

    const data = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          date: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31T23:59:59`)
          }
        }
      },
      {
        $group: {
          _id: {
            month: { $month: '$date' },
            type: '$type'
          },
          total: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.month': 1 } }
    ]);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthly = months.map((month, index) => {
      const incomeEntry = data.find(d => d._id.month === index + 1 && d._id.type === 'income');
      const expenseEntry = data.find(d => d._id.month === index + 1 && d._id.type === 'expense');
      return {
        month,
        income: incomeEntry ? incomeEntry.total : 0,
        expense: expenseEntry ? expenseEntry.total : 0,
        net: (incomeEntry ? incomeEntry.total : 0) - (expenseEntry ? expenseEntry.total : 0)
      };
    });

    res.json({ success: true, year, data: monthly });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error fetching monthly analytics' });
  }
};

// @desc    Get category breakdown
// @route   GET /api/analytics/categories
// @access  Private
const getCategoryBreakdown = async (req, res) => {
  try {
    const { type = 'expense', month, year } = req.query;
    const currentYear = parseInt(year) || new Date().getFullYear();

    const matchFilter = { user: req.user._id, type };

    if (month && year) {
      const startDate = new Date(`${currentYear}-${String(month).padStart(2, '0')}-01`);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);
      matchFilter.date = { $gte: startDate, $lt: endDate };
    } else if (year) {
      matchFilter.date = {
        $gte: new Date(`${currentYear}-01-01`),
        $lte: new Date(`${currentYear}-12-31T23:59:59`)
      };
    }

    const data = await Transaction.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { total: -1 } }
    ]);

    const totalAmount = data.reduce((sum, item) => sum + item.total, 0);
    const breakdown = data.map(item => ({
      category: item._id,
      total: item.total,
      count: item.count,
      percentage: totalAmount > 0 ? ((item.total / totalAmount) * 100).toFixed(1) : 0
    }));

    res.json({ success: true, type, data: breakdown, totalAmount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error fetching category breakdown' });
  }
};

// @desc    Get dashboard summary
// @route   GET /api/analytics/summary
// @access  Private
const getSummary = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const [currentMonth, lastMonth, allTime] = await Promise.all([
      Transaction.aggregate([
        { $match: { user: req.user._id, date: { $gte: startOfMonth, $lte: endOfMonth } } },
        { $group: { _id: '$type', total: { $sum: '$amount' }, count: { $sum: 1 } } }
      ]),
      Transaction.aggregate([
        { $match: { user: req.user._id, date: { $gte: startOfLastMonth, $lte: endOfLastMonth } } },
        { $group: { _id: '$type', total: { $sum: '$amount' } } }
      ]),
      Transaction.aggregate([
        { $match: { user: req.user._id } },
        { $group: { _id: '$type', total: { $sum: '$amount' } } }
      ])
    ]);

    const extract = (arr) => ({
      income: arr.find(x => x._id === 'income')?.total || 0,
      expense: arr.find(x => x._id === 'expense')?.total || 0,
      incomeCount: arr.find(x => x._id === 'income')?.count || 0,
      expenseCount: arr.find(x => x._id === 'expense')?.count || 0
    });

    const cm = extract(currentMonth);
    const lm = extract(lastMonth);
    const at = extract(allTime);

    res.json({
      success: true,
      data: {
        currentMonth: { ...cm, balance: cm.income - cm.expense },
        lastMonth: { ...lm, balance: lm.income - lm.expense },
        allTime: { ...at, balance: at.income - at.expense }
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error fetching summary' });
  }
};

// @desc    Get recent transactions
// @route   GET /api/analytics/recent
// @access  Private
const getRecentTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id })
      .sort('-date')
      .limit(5);

    res.json({ success: true, data: transactions });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getMonthlyAnalytics, getCategoryBreakdown, getSummary, getRecentTransactions };
