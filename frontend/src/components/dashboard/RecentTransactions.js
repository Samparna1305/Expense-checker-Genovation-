import React, { useEffect, useState } from 'react';
import { analyticsAPI } from '../../utils/api';
import { formatCurrency, formatDate, CATEGORY_ICONS } from '../../utils/categories';

const RecentTransactions = ({ onViewAll }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await analyticsAPI.recent();
        setTransactions(data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-semibold text-white">Recent Activity</h3>
        <button onClick={onViewAll} className="text-xs text-purple-400 hover:text-purple-300 transition-colors">
          View all →
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="w-9 h-9 bg-gray-700 rounded-xl flex-shrink-0"></div>
              <div className="flex-1">
                <div className="h-3 w-28 bg-gray-700 rounded mb-2"></div>
                <div className="h-2 w-16 bg-gray-700 rounded"></div>
              </div>
              <div className="h-4 w-20 bg-gray-700 rounded"></div>
            </div>
          ))}
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-4xl mb-2">📊</p>
          <p className="text-gray-500 text-sm">No transactions yet</p>
          <p className="text-gray-600 text-xs mt-1">Add your first income or expense</p>
        </div>
      ) : (
        <div className="space-y-2">
          {transactions.map(tx => (
            <div key={tx._id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-colors">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0" style={{ background: tx.type === 'income' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)' }}>
                {CATEGORY_ICONS[tx.category] || '💳'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-200 truncate">{tx.title}</p>
                <p className="text-xs text-gray-500">{tx.category} · {formatDate(tx.date)}</p>
              </div>
              <span className={`text-sm font-semibold flex-shrink-0 ${tx.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentTransactions;
