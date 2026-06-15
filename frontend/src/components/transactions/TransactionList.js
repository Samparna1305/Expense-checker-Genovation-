import React, { useState, useEffect, useCallback } from 'react';
import { transactionAPI } from '../../utils/api';
import { formatCurrency, formatDate, CATEGORY_ICONS, ALL_CATEGORIES } from '../../utils/categories';
import TransactionForm from './TransactionForm';
import { FiPlus, FiEdit2, FiTrash2, FiDownload, FiFilter, FiSearch } from 'react-icons/fi';
import toast from 'react-hot-toast';

const TransactionList = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editTx, setEditTx] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [filters, setFilters] = useState({ type: '', category: '', startDate: '', endDate: '', search: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [exporting, setExporting] = useState(false);

  const loadTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page: currentPage, limit: 15 };
      if (filters.type) params.type = filters.type;
      if (filters.category) params.category = filters.category;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;

      const { data } = await transactionAPI.getAll(params);
      setTransactions(data.data);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err) {
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  }, [currentPage, filters]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const handleDelete = async (id) => {
    try {
      await transactionAPI.delete(id);
      toast.success('Transaction deleted');
      setDeleteId(null);
      loadTransactions();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const params = {};
      if (filters.type) params.type = filters.type;
      if (filters.category) params.category = filters.category;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;

      const response = await transactionAPI.exportCSV(params);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success('CSV exported successfully!');
    } catch (err) {
      const msg = err.response?.data?.message || 'Export failed';
      toast.error(msg);
    } finally {
      setExporting(false);
    }
  };

  const resetFilters = () => {
    setFilters({ type: '', category: '', startDate: '', endDate: '', search: '' });
    setCurrentPage(1);
  };

  const selectClass = "px-3 py-2 rounded-xl text-sm border focus:outline-none";
  const selectStyle = { background: '#1e2533', borderColor: '#2d3748', color: '#e9ecef' };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Transactions</h2>
          <p className="text-xs text-gray-500 mt-0.5">{total} total records</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors ${showFilters ? 'text-purple-400' : 'text-gray-400 hover:text-white'}`}
            style={{ background: showFilters ? 'rgba(139,92,246,0.1)' : '#141a26', border: `1px solid ${showFilters ? '#8b5cf6' : '#2d3748'}` }}
          >
            <FiFilter size={14} />
            Filters
          </button>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-gray-400 hover:text-white transition-colors disabled:opacity-50"
            style={{ background: '#141a26', border: '1px solid #2d3748' }}
          >
            <FiDownload size={14} />
            {exporting ? 'Exporting...' : 'Export CSV'}
          </button>
          <button
            onClick={() => { setEditTx(null); setShowForm(true); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white btn-primary"
          >
            <FiPlus size={15} />
            Add
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="glass-card rounded-2xl p-4 animate-fade-in">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <select value={filters.type} onChange={e => { setFilters({ ...filters, type: e.target.value, category: '' }); setCurrentPage(1); }} className={selectClass} style={selectStyle}>
              <option value="">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>

            <select value={filters.category} onChange={e => { setFilters({ ...filters, category: e.target.value }); setCurrentPage(1); }} className={selectClass} style={selectStyle}>
              <option value="">All Categories</option>
              {ALL_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            <input type="date" value={filters.startDate} onChange={e => { setFilters({ ...filters, startDate: e.target.value }); setCurrentPage(1); }}
              className={selectClass} style={{ ...selectStyle, colorScheme: 'dark' }} placeholder="From" />

            <input type="date" value={filters.endDate} onChange={e => { setFilters({ ...filters, endDate: e.target.value }); setCurrentPage(1); }}
              className={selectClass} style={{ ...selectStyle, colorScheme: 'dark' }} placeholder="To" />
          </div>
          <button onClick={resetFilters} className="mt-3 text-xs text-gray-500 hover:text-gray-300 transition-colors">
            Clear all filters ×
          </button>
        </div>
      )}

      {/* Transaction table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        {loading ? (
          <div className="space-y-0">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4 border-b animate-pulse" style={{ borderColor: '#1e2533' }}>
                <div className="w-9 h-9 bg-gray-700 rounded-xl flex-shrink-0"></div>
                <div className="flex-1">
                  <div className="h-3 w-36 bg-gray-700 rounded mb-2"></div>
                  <div className="h-2.5 w-24 bg-gray-700 rounded"></div>
                </div>
                <div className="h-4 w-20 bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-5xl mb-3">📭</p>
            <p className="text-gray-400 font-medium">No transactions found</p>
            <p className="text-gray-600 text-sm mt-1">Try adjusting your filters or add a new transaction</p>
          </div>
        ) : (
          <>
            {/* Desktop header */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ borderBottom: '1px solid #1e2533' }}>
              <div className="col-span-4">Transaction</div>
              <div className="col-span-2">Category</div>
              <div className="col-span-2">Date</div>
              <div className="col-span-2 text-right">Amount</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>

            {transactions.map(tx => (
              <div key={tx._id} className="flex md:grid md:grid-cols-12 gap-4 items-center px-5 py-3.5 border-b hover:bg-white/3 transition-colors" style={{ borderColor: '#1e2533' }}>
                {/* Icon + title */}
                <div className="flex items-center gap-3 md:col-span-4 flex-1 min-w-0">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0" style={{ background: tx.type === 'income' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)' }}>
                    {CATEGORY_ICONS[tx.category] || '💳'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-200 truncate">{tx.title}</p>
                    {tx.description && <p className="text-xs text-gray-500 truncate">{tx.description}</p>}
                    <span className={`md:hidden text-xs px-1.5 py-0.5 rounded mt-0.5 inline-block ${tx.type === 'income' ? 'income-badge' : 'expense-badge'}`}>
                      {tx.type}
                    </span>
                  </div>
                </div>

                {/* Category */}
                <div className="hidden md:block col-span-2">
                  <span className="text-xs text-gray-400 px-2 py-1 rounded-lg" style={{ background: '#1e2533' }}>
                    {tx.category}
                  </span>
                </div>

                {/* Date */}
                <div className="hidden md:block col-span-2 text-xs text-gray-500">{formatDate(tx.date)}</div>

                {/* Amount */}
                <div className="md:col-span-2 md:text-right flex-shrink-0">
                  <span className={`font-semibold text-sm ${tx.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                    {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </span>
                </div>

                {/* Actions */}
                <div className="md:col-span-2 flex items-center justify-end gap-1.5 flex-shrink-0">
                  <button onClick={() => { setEditTx(tx); setShowForm(true); }} className="p-1.5 rounded-lg text-gray-500 hover:text-blue-400 hover:bg-blue-400/10 transition-all">
                    <FiEdit2 size={13} />
                  </button>
                  <button onClick={() => setDeleteId(tx._id)} className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-400/10 transition-all">
                    <FiTrash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded-xl text-sm text-gray-400 disabled:opacity-30 hover:text-white transition-colors"
            style={{ background: '#141a26', border: '1px solid #2d3748' }}
          >
            ← Prev
          </button>
          <span className="text-xs text-gray-500 px-3">Page {currentPage} of {totalPages}</span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 rounded-xl text-sm text-gray-400 disabled:opacity-30 hover:text-white transition-colors"
            style={{ background: '#141a26', border: '1px solid #2d3748' }}
          >
            Next →
          </button>
        </div>
      )}

      {/* Transaction Form Modal */}
      {showForm && (
        <TransactionForm
          transaction={editTx}
          onClose={() => { setShowForm(false); setEditTx(null); }}
          onSave={loadTransactions}
        />
      )}

      {/* Delete confirmation */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
          <div className="rounded-2xl p-6 max-w-sm w-full animate-slide-up" style={{ background: '#141a26', border: '1px solid #2d3748' }}>
            <h3 className="text-base font-semibold text-white mb-2">Delete Transaction?</h3>
            <p className="text-sm text-gray-400 mb-5">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 rounded-xl text-sm text-gray-400 border transition-colors" style={{ borderColor: '#2d3748', background: '#1e2533' }}>
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteId)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-500 transition-colors">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionList;
