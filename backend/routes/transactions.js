const express = require('express');
const { body } = require('express-validator');
const {
  getTransactions, getTransaction, createTransaction,
  updateTransaction, deleteTransaction, exportCSV
} = require('../controllers/transactionController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

const transactionValidation = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 100 }).withMessage('Title too long'),
  body('amount').isNumeric().withMessage('Amount must be a number').custom(v => v > 0).withMessage('Amount must be positive'),
  body('type').isIn(['income', 'expense']).withMessage('Type must be income or expense'),
  body('category').notEmpty().withMessage('Category is required'),
  body('date').optional().isISO8601().withMessage('Invalid date format')
];

router.get('/export/csv', exportCSV);
router.get('/', getTransactions);
router.get('/:id', getTransaction);
router.post('/', transactionValidation, createTransaction);
router.put('/:id', transactionValidation, updateTransaction);
router.delete('/:id', deleteTransaction);

module.exports = router;
