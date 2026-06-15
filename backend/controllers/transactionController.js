const Transaction = require('../models/Transaction');
const { validationResult } = require('express-validator');
const { Parser } = require('json2csv');

// @desc    Get all transactions for user
// @route   GET /api/transactions
// @access  Private
const getTransactions = async (req, res) => {
  try {
    const { type, category, startDate, endDate, page = 1, limit = 20, sort = '-date' } = req.query;

    const filter = { user: req.user.id };
    if (type) filter.type = type;
    if (category) filter.category = category;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.date.$lte = end;
      }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Transaction.countDocuments(filter);

    const transactions = await Transaction.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: transactions.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: transactions
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error fetching transactions' });
  }
};

// @desc    Get single transaction
// @route   GET /api/transactions/:id
// @access  Private
const getTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({ _id: req.params.id, user: req.user.id });
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }
    res.json({ success: true, data: transaction });
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Create transaction
// @route   POST /api/transactions
// @access  Private
const createTransaction = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { title, amount, type, category, description, date } = req.body;
    const transaction = await Transaction.create({
      user: req.user.id,
      title,
      amount,
      type,
      category,
      description,
      date: date || Date.now()
    });

    res.status(201).json({ success: true, message: 'Transaction added successfully', data: transaction });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error creating transaction' });
  }
};

// @desc    Update transaction
// @route   PUT /api/transactions/:id
// @access  Private
const updateTransaction = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    let transaction = await Transaction.findOne({ _id: req.params.id, user: req.user.id });
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    const { title, amount, type, category, description, date } = req.body;
    transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      { title, amount, type, category, description, date },
      { new: true, runValidators: true }
    );

    res.json({ success: true, message: 'Transaction updated successfully', data: transaction });
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }
    res.status(500).json({ success: false, message: 'Server error updating transaction' });
  }
};

// @desc    Delete transaction
// @route   DELETE /api/transactions/:id
// @access  Private
const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({ _id: req.params.id, user: req.user.id });
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    await Transaction.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Transaction deleted successfully' });
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }
    res.status(500).json({ success: false, message: 'Server error deleting transaction' });
  }
};

// @desc    Export transactions as CSV
// @route   GET /api/transactions/export/csv
// @access  Private
const exportCSV = async (req, res) => {
  try {
    const { type, category, startDate, endDate } = req.query;

    const filter = { user: req.user.id };
    if (type) filter.type = type;
    if (category) filter.category = category;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.date.$lte = end;
      }
    }

    const transactions = await Transaction.find(filter).sort('-date');

    if (transactions.length === 0) {
      return res.status(404).json({ success: false, message: 'No transactions found to export' });
    }

    const fields = [
      { label: 'Title', value: 'title' },
      { label: 'Amount', value: 'amount' },
      { label: 'Type', value: 'type' },
      { label: 'Category', value: 'category' },
      { label: 'Description', value: 'description' },
      { label: 'Date', value: row => new Date(row.date).toLocaleDateString('en-IN') }
    ];

    const parser = new Parser({ fields });
    const csv = parser.parse(transactions);

    res.header('Content-Type', 'text/csv');
    res.attachment(`transactions_${Date.now()}.csv`);
    res.send(csv);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error exporting CSV' });
  }
};

module.exports = { getTransactions, getTransaction, createTransaction, updateTransaction, deleteTransaction, exportCSV };
