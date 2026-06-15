const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please provide a transaction title'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  amount: {
    type: Number,
    required: [true, 'Please provide an amount'],
    min: [0.01, 'Amount must be greater than 0']
  },
  type: {
    type: String,
    enum: ['income', 'expense'],
    required: [true, 'Please specify transaction type']
  },
  category: {
    type: String,
    required: [true, 'Please provide a category'],
    enum: [
      'Salary', 'Freelance', 'Investment', 'Business', 'Gift', 'Other Income',
      'Food & Dining', 'Shopping', 'Transport', 'Housing', 'Utilities',
      'Healthcare', 'Entertainment', 'Education', 'Travel', 'Personal Care',
      'Subscriptions', 'Insurance', 'Other Expense'
    ]
  },
  description: {
    type: String,
    trim: true,
    maxlength: [300, 'Description cannot exceed 300 characters'],
    default: ''
  },
  date: {
    type: Date,
    required: [true, 'Please provide a date'],
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
TransactionSchema.index({ user: 1, date: -1 });
TransactionSchema.index({ user: 1, type: 1 });
TransactionSchema.index({ user: 1, category: 1 });

module.exports = mongoose.model('Transaction', TransactionSchema);
