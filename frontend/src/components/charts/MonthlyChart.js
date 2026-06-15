import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  LineElement, PointElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { analyticsAPI } from '../../utils/api';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, Filler);

const MonthlyChart = () => {
  const [chartData, setChartData] = useState(null);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await analyticsAPI.monthly(year);
        const months = data.data.map(d => d.month);
        setChartData({
          labels: months,
          datasets: [
            {
              label: 'Income',
              data: data.data.map(d => d.income),
              backgroundColor: 'rgba(16,185,129,0.7)',
              borderColor: '#10b981',
              borderWidth: 1,
              borderRadius: 6,
            },
            {
              label: 'Expense',
              data: data.data.map(d => d.expense),
              backgroundColor: 'rgba(239,68,68,0.7)',
              borderColor: '#ef4444',
              borderWidth: 1,
              borderRadius: 6,
            }
          ]
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [year]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: {
        position: 'top',
        labels: { color: '#9ca3af', font: { size: 12 }, padding: 16, usePointStyle: true }
      },
      tooltip: {
        backgroundColor: '#1e2533',
        borderColor: '#2d3748',
        borderWidth: 1,
        titleColor: '#e9ecef',
        bodyColor: '#9ca3af',
        callbacks: {
          label: (ctx) => ` ₹${ctx.parsed.y.toLocaleString('en-IN')}`
        }
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(45,55,72,0.5)', drawBorder: false },
        ticks: { color: '#6c7585', font: { size: 11 } }
      },
      y: {
        grid: { color: 'rgba(45,55,72,0.5)', drawBorder: false },
        ticks: {
          color: '#6c7585', font: { size: 11 },
          callback: (v) => '₹' + (v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v)
        }
      }
    }
  };

  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-semibold text-white">Monthly Overview</h3>
        <select
          value={year}
          onChange={e => setYear(parseInt(e.target.value))}
          className="text-xs px-3 py-1.5 rounded-lg border text-gray-300"
          style={{ background: '#141a26', borderColor: '#2d3748' }}
        >
          {[2022, 2023, 2024, 2025, 2026].map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>
      <div style={{ height: 260 }}>
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-600 text-sm">Loading chart...</div>
          </div>
        ) : chartData ? (
          <Bar data={chartData} options={options} />
        ) : null}
      </div>
    </div>
  );
};

export default MonthlyChart;
