import React, { useEffect, useState } from 'react';
import { analyticsAPI } from '../../utils/api';
import { formatCurrency } from '../../utils/categories';
import { FiArrowUp, FiArrowDown, FiDollarSign, FiActivity } from 'react-icons/fi';

const StatCard = ({ label, value, icon: Icon, color, subLabel, subValue, trend }) => (
  <div className="glass-card rounded-2xl p-5 animate-fade-in">
    <div className="flex items-start justify-between mb-4">
      <div className="flex-1">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">{label}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
      </div>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: color + '22' }}>
        <Icon size={18} style={{ color }} />
      </div>
    </div>
    {subLabel && (
      <div className="flex items-center gap-1.5 text-xs">
        <span className="text-gray-500">{subLabel}:</span>
        <span style={{ color }} className="font-medium">{subValue}</span>
        {trend !== undefined && (
          <span className={`ml-auto text-xs ${trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend).toFixed(0)}%
          </span>
        )}
      </div>
    )}
  </div>
);

const SummaryCards = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await analyticsAPI.summary();
        setSummary(data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="glass-card rounded-2xl p-5 h-28 animate-pulse">
            <div className="h-3 w-24 bg-gray-700 rounded mb-3"></div>
            <div className="h-7 w-32 bg-gray-700 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!summary) return null;

  const { currentMonth, lastMonth } = summary;
  const incomeTrend = lastMonth.income > 0 ? ((currentMonth.income - lastMonth.income) / lastMonth.income) * 100 : 0;
  const expenseTrend = lastMonth.expense > 0 ? ((currentMonth.expense - lastMonth.expense) / lastMonth.expense) * 100 : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        label="Monthly Income"
        value={formatCurrency(currentMonth.income)}
        icon={FiArrowUp}
        color="#10b981"
        subLabel="Last month"
        subValue={formatCurrency(lastMonth.income)}
        trend={incomeTrend}
      />
      <StatCard
        label="Monthly Expenses"
        value={formatCurrency(currentMonth.expense)}
        icon={FiArrowDown}
        color="#ef4444"
        subLabel="Last month"
        subValue={formatCurrency(lastMonth.expense)}
        trend={-expenseTrend}
      />
      <StatCard
        label="Net Balance"
        value={formatCurrency(currentMonth.balance)}
        icon={FiDollarSign}
        color={currentMonth.balance >= 0 ? '#8b5cf6' : '#ef4444'}
        subLabel="Transactions"
        subValue={`${currentMonth.incomeCount + currentMonth.expenseCount} this month`}
      />
      <StatCard
        label="All-Time Balance"
        value={formatCurrency(summary.allTime.balance)}
        icon={FiActivity}
        color="#3b82f6"
        subLabel="Total tracked"
        subValue={formatCurrency(summary.allTime.income + summary.allTime.expense)}
      />
    </div>
  );
};

export default SummaryCards;
