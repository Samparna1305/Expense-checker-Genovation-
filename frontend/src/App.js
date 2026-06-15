import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Navbar from './components/layout/Navbar';
import SummaryCards from './components/dashboard/SummaryCards';
import RecentTransactions from './components/dashboard/RecentTransactions';
import MonthlyChart from './components/charts/MonthlyChart';
import CategoryChart from './components/charts/CategoryChart';
import TransactionList from './components/transactions/TransactionList';
import AnalyticsPage from './components/dashboard/AnalyticsPage';

const AuthGate = () => {
  const [showLogin, setShowLogin] = useState(true);
  return showLogin
    ? <Login onSwitch={() => setShowLogin(false)} />
    : <Register onSwitch={() => setShowLogin(true)} />;
};

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="min-h-screen" style={{ background: '#0d1117' }}>
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <div className="space-y-5 animate-fade-in">
            <SummaryCards />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <MonthlyChart />
              </div>
              <div>
                <CategoryChart />
              </div>
            </div>
            <RecentTransactions onViewAll={() => setActiveTab('transactions')} />
          </div>
        )}
        {activeTab === 'transactions' && (
          <div className="animate-fade-in">
            <TransactionList />
          </div>
        )}
        {activeTab === 'analytics' && (
          <div className="animate-fade-in">
            <AnalyticsPage />
          </div>
        )}
      </main>
    </div>
  );
};

const AppContent = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0d1117' }}>
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-500 text-sm">Loading SpendSmart...</p>
        </div>
      </div>
    );
  }

  return user ? <Dashboard /> : <AuthGate />;
};

const App = () => (
  <AuthProvider>
    <AppContent />
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: '#1e2533',
          color: '#e9ecef',
          border: '1px solid #2d3748',
          borderRadius: '12px',
          fontSize: '13px',
        },
        success: { iconTheme: { primary: '#10b981', secondary: '#1e2533' } },
        error: { iconTheme: { primary: '#ef4444', secondary: '#1e2533' } },
      }}
    />
  </AuthProvider>
);

export default App;
