import React, { useEffect, useState } from 'react';
import { analyticsAPI } from '../../utils/api';
import { formatCurrency, CATEGORY_COLORS, CATEGORY_ICONS } from '../../utils/categories';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, ArcElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler);

const AnalyticsPage = () => {
  const [monthlyData, setMonthlyData] = useState([]);
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [incomeCategories, setIncomeCategories] = useState([]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [monthly, expCat, incCat] = await Promise.all([
          analyticsAPI.monthly(year),
          analyticsAPI.categories({ type: 'expense', year }),
          analyticsAPI.categories({ type: 'income', year }),
        ]);
        setMonthlyData(monthly.data.data);
        setExpenseCategories(expCat.data.data);
        setIncomeCategories(incCat.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [year]);

  const lineChartData = {
    labels: monthlyData.map(d => d.month),
    datasets: [
      {
        label: 'Income',
        data: monthlyData.map(d => d.income),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16,185,129,0.08)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#10b981',
        pointRadius: 4,
      },
      {
        label: 'Expense',
        data: monthlyData.map(d => d.expense),
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239,68,68,0.08)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#ef4444',
        pointRadius: 4,
      },
      {
        label: 'Net',
        data: monthlyData.map(d => d.net),
        borderColor: '#8b5cf6',
        backgroundColor: 'transparent',
        tension: 0.4,
        pointBackgroundColor: '#8b5cf6',
        pointRadius: 3,
        borderDash: [4, 4],
      }
    ]
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { position: 'top', labels: { color: '#9ca3af', font: { size: 11 }, padding: 16, usePointStyle: true } },
      tooltip: {
        backgroundColor: '#1e2533', borderColor: '#2d3748', borderWidth: 1,
        titleColor: '#e9ecef', bodyColor: '#9ca3af',
        callbacks: { label: ctx => ` ₹${ctx.parsed.y.toLocaleString('en-IN')}` }
      }
    },
    scales: {
      x: { grid: { color: 'rgba(45,55,72,0.4)' }, ticks: { color: '#6c7585', font: { size: 10 } } },
      y: {
        grid: { color: 'rgba(45,55,72,0.4)' },
        ticks: { color: '#6c7585', font: { size: 10 }, callback: v => '₹' + (v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v) }
      }
    }
  };

  const doughnutOptions = {
    responsive: true, maintainAspectRatio: false, cutout: '65%',
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1e2533', borderColor: '#2d3748', borderWidth: 1,
        titleColor: '#e9ecef', bodyColor: '#9ca3af',
      }
    }
  };

  const totalIncome = monthlyData.reduce((s, d) => s + d.income, 0);
  const totalExpense = monthlyData.reduce((s, d) => s + d.expense, 0);
  const savingsRate = totalIncome > 0 ? (((totalIncome - totalExpense) / totalIncome) * 100).toFixed(1) : 0;
  const avgMonthlyExpense = (totalExpense / 12).toFixed(0);

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-gray-500">Loading analytics...</div>;
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Analytics</h2>
          <p className="text-xs text-gray-500 mt-0.5">Financial insights for {year}</p>
        </div>
        <select
          value={year}
          onChange={e => setYear(parseInt(e.target.value))}
          className="text-sm px-3 py-2 rounded-xl border"
          style={{ background: '#141a26', borderColor: '#2d3748', color: '#e9ecef' }}
        >
          {[2022, 2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Income', value: formatCurrency(totalIncome), color: '#10b981' },
          { label: 'Total Expense', value: formatCurrency(totalExpense), color: '#ef4444' },
          { label: 'Savings Rate', value: `${savingsRate}%`, color: '#8b5cf6' },
          { label: 'Avg Monthly Exp', value: formatCurrency(Number(avgMonthlyExpense)), color: '#f59e0b' },
        ].map(kpi => (
          <div key={kpi.label} className="glass-card rounded-2xl p-4">
            <p className="text-xs text-gray-500 mb-1">{kpi.label}</p>
            <p className="text-xl font-bold" style={{ color: kpi.color }}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Line chart */}
      <div className="glass-card rounded-2xl p-5">
        <h3 className="font-semibold text-white mb-5">Income vs Expense Trend</h3>
        <div style={{ height: 280 }}>
          <Line data={lineChartData} options={lineOptions} />
        </div>
      </div>

      {/* Category breakdowns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { title: 'Expense Categories', data: expenseCategories, color: '#ef4444' },
          { title: 'Income Categories', data: incomeCategories, color: '#10b981' },
        ].map(({ title, data, color }) => (
          <div key={title} className="glass-card rounded-2xl p-5">
            <h3 className="font-semibold text-white mb-4">{title}</h3>
            {data.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-gray-500 text-sm">
                <span className="text-3xl mb-2">📭</span>No data available
              </div>
            ) : (
              <div className="flex gap-4">
                <div style={{ width: 140, height: 140, flexShrink: 0 }}>
                  <Doughnut
                    data={{
                      labels: data.map(d => d.category),
                      datasets: [{ data: data.map(d => d.total), backgroundColor: CATEGORY_COLORS.slice(0, data.length), borderColor: '#141a26', borderWidth: 2 }]
                    }}
                    options={doughnutOptions}
                  />
                </div>
                <div className="flex-1 space-y-2 overflow-y-auto max-h-36">
                  {data.map((item, i) => (
                    <div key={item.category} className="flex items-center gap-2 text-xs">
                      <span className="text-base">{CATEGORY_ICONS[item.category] || '💰'}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-gray-400 truncate">{item.category}</span>
                          <span className="text-gray-300 font-medium ml-1">{item.percentage}%</span>
                        </div>
                        <div className="h-1 rounded-full bg-gray-700">
                          <div className="h-1 rounded-full" style={{ width: `${item.percentage}%`, background: CATEGORY_COLORS[i] }}></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Monthly net table */}
      <div className="glass-card rounded-2xl p-5">
        <h3 className="font-semibold text-white mb-4">Monthly Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-500 uppercase">
                <th className="text-left pb-3 font-medium">Month</th>
                <th className="text-right pb-3 font-medium text-green-500">Income</th>
                <th className="text-right pb-3 font-medium text-red-500">Expense</th>
                <th className="text-right pb-3 font-medium text-purple-400">Net</th>
              </tr>
            </thead>
            <tbody>
              {monthlyData.map(row => (
                <tr key={row.month} className="border-t" style={{ borderColor: '#1e2533' }}>
                  <td className="py-2.5 text-gray-300">{row.month}</td>
                  <td className="py-2.5 text-right text-green-400">{row.income > 0 ? formatCurrency(row.income) : '—'}</td>
                  <td className="py-2.5 text-right text-red-400">{row.expense > 0 ? formatCurrency(row.expense) : '—'}</td>
                  <td className={`py-2.5 text-right font-medium ${row.net >= 0 ? 'text-purple-400' : 'text-red-400'}`}>
                    {row.income === 0 && row.expense === 0 ? '—' : formatCurrency(row.net)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
