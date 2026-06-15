export const INCOME_CATEGORIES = [
  'Salary', 'Freelance', 'Investment', 'Business', 'Gift', 'Other Income'
];

export const EXPENSE_CATEGORIES = [
  'Food & Dining', 'Shopping', 'Transport', 'Housing', 'Utilities',
  'Healthcare', 'Entertainment', 'Education', 'Travel', 'Personal Care',
  'Subscriptions', 'Insurance', 'Other Expense'
];

export const ALL_CATEGORIES = [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES];

export const CATEGORY_ICONS = {
  'Salary': '💼', 'Freelance': '💻', 'Investment': '📈', 'Business': '🏢',
  'Gift': '🎁', 'Other Income': '💰', 'Food & Dining': '🍽️', 'Shopping': '🛍️',
  'Transport': '🚗', 'Housing': '🏠', 'Utilities': '⚡', 'Healthcare': '🏥',
  'Entertainment': '🎬', 'Education': '📚', 'Travel': '✈️', 'Personal Care': '💅',
  'Subscriptions': '📱', 'Insurance': '🛡️', 'Other Expense': '📝'
};

export const CATEGORY_COLORS = [
  '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
  '#06b6d4', '#ec4899', '#84cc16', '#f97316', '#6366f1',
  '#14b8a6', '#a855f7', '#eab308', '#64748b', '#22c55e'
];

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount);
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric', month: 'short', day: 'numeric'
  });
};
