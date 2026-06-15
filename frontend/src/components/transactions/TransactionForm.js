import React, { useState, useEffect } from 'react';
import { transactionAPI } from '../../utils/api';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../../utils/categories';
import { FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';

const TransactionForm = ({ transaction, onClose, onSave }) => {
  const isEdit = !!transaction?._id;

  const [form, setForm] = useState({
    title: '', amount: '', type: 'expense', category: '',
    description: '', date: new Date().toISOString().split('T')[0]
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (transaction) {
      setForm({
        title: transaction.title || '',
        amount: transaction.amount || '',
        type: transaction.type || 'expense',
        category: transaction.category || '',
        description: transaction.description || '',
        date: transaction.date ? new Date(transaction.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
      });
    }
  }, [transaction]);

  const categories = form.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0) errs.amount = 'Enter a valid amount';
    if (!form.category) errs.category = 'Category is required';
    if (!form.date) errs.date = 'Date is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = { ...form, amount: Number(form.amount) };
      if (isEdit) {
        await transactionAPI.update(transaction._id, payload);
        toast.success('Transaction updated!');
      } else {
        await transactionAPI.create(payload);
        toast.success('Transaction added!');
      }
      onSave();
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Something went wrong';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field) =>
    `w-full px-3 py-2.5 rounded-xl text-sm border transition-all focus:outline-none ${errors[field] ? 'border-red-500' : ''}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
      <div className="w-full max-w-md rounded-2xl p-6 animate-slide-up" style={{ background: '#141a26', border: '1px solid #2d3748' }}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-white">{isEdit ? 'Edit Transaction' : 'Add Transaction'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <FiX size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type toggle */}
          <div className="grid grid-cols-2 gap-2">
            {['expense', 'income'].map(t => (
              <button
                key={t}
                type="button"
                onClick={() => { setForm({ ...form, type: t, category: '' }); setErrors({ ...errors, category: '' }); }}
                className={`py-2.5 rounded-xl text-sm font-semibold capitalize transition-all ${form.type === t ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
                style={{
                  background: form.type === t ? (t === 'income' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)') : '#1e2533',
                  border: `1px solid ${form.type === t ? (t === 'income' ? '#10b981' : '#ef4444') : '#2d3748'}`,
                  color: form.type === t ? (t === 'income' ? '#10b981' : '#ef4444') : undefined
                }}
              >
                {t === 'income' ? '↑ Income' : '↓ Expense'}
              </button>
            ))}
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Title</label>
            <input
              type="text"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Monthly salary"
              className={inputClass('title')}
              style={{ borderColor: errors.title ? '#ef4444' : '#2d3748' }}
            />
            {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title}</p>}
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Amount (₹)</label>
            <input
              type="number"
              value={form.amount}
              onChange={e => setForm({ ...form, amount: e.target.value })}
              placeholder="0.00"
              min="0.01"
              step="0.01"
              className={inputClass('amount')}
              style={{ borderColor: errors.amount ? '#ef4444' : '#2d3748' }}
            />
            {errors.amount && <p className="text-red-400 text-xs mt-1">{errors.amount}</p>}
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Category</label>
            <select
              value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value })}
              className={inputClass('category')}
              style={{ borderColor: errors.category ? '#ef4444' : '#2d3748' }}
            >
              <option value="">Select a category</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            {errors.category && <p className="text-red-400 text-xs mt-1">{errors.category}</p>}
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Date</label>
            <input
              type="date"
              value={form.date}
              onChange={e => setForm({ ...form, date: e.target.value })}
              className={inputClass('date')}
              style={{ borderColor: errors.date ? '#ef4444' : '#2d3748', colorScheme: 'dark' }}
            />
            {errors.date && <p className="text-red-400 text-xs mt-1">{errors.date}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Description <span className="text-gray-600">(optional)</span></label>
            <textarea
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Additional notes..."
              rows={2}
              className="w-full px-3 py-2.5 rounded-xl text-sm border focus:outline-none resize-none"
              style={{ borderColor: '#2d3748' }}
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-400 border transition-colors hover:text-white" style={{ borderColor: '#2d3748', background: '#1e2533' }}>
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white btn-primary disabled:opacity-60">
              {loading ? 'Saving...' : isEdit ? 'Update' : 'Add Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionForm;
