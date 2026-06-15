import React, { useEffect, useState } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { analyticsAPI } from '../../utils/api';
import { CATEGORY_COLORS, formatCurrency } from '../../utils/categories';

ChartJS.register(ArcElement, Tooltip, Legend);

const CategoryChart = () => {
  const [data, setData] = useState([]);
  const [type, setType] = useState('expense');
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data: res } = await analyticsAPI.categories({ type, year: new Date().getFullYear() });
        setData(res.data);
        setTotal(res.totalAmount);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [type]);

  const chartData = {
    labels: data.map(d => d.category),
    datasets: [{
      data: data.map(d => d.total),
      backgroundColor: CATEGORY_COLORS.slice(0, data.length),
      borderColor: '#141a26',
      borderWidth: 3,
      hoverOffset: 8
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '68%',
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1e2533',
        borderColor: '#2d3748',
        borderWidth: 1,
        titleColor: '#e9ecef',
        bodyColor: '#9ca3af',
        callbacks: {
          label: (ctx) => ` ${ctx.label}: ₹${ctx.raw.toLocaleString('en-IN')} (${data[ctx.dataIndex]?.percentage}%)`
        }
      }
    }
  };

  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-semibold text-white">Category Breakdown</h3>
        <div className="flex gap-1 p-1 rounded-lg" style={{ background: '#141a26' }}>
          {['expense', 'income'].map(t => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all capitalize ${type === t ? 'text-white' : 'text-gray-500'}`}
              style={type === t ? { background: t === 'expense' ? '#ef4444' : '#10b981' } : {}}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48 text-gray-600 text-sm">Loading...</div>
      ) : data.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-gray-500 text-sm">
          <p className="text-3xl mb-2">📭</p>
          No {type} data yet
        </div>
      ) : (
        <>
          <div style={{ height: 180 }} className="relative">
            <Doughnut data={chartData} options={options} />
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <p className="text-xs text-gray-500">Total</p>
              <p className="text-base font-bold text-white">₹{(total / 1000).toFixed(1)}k</p>
            </div>
          </div>

          <div className="mt-4 space-y-1.5 max-h-40 overflow-y-auto">
            {data.slice(0, 6).map((item, i) => (
              <div key={item.category} className="flex items-center gap-2.5 text-xs">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: CATEGORY_COLORS[i] }}></div>
                <span className="text-gray-400 flex-1 truncate">{item.category}</span>
                <span className="text-gray-300 font-medium">{item.percentage}%</span>
                <span className="text-gray-500">{formatCurrency(item.total)}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default CategoryChart;
