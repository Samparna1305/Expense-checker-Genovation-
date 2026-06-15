import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FiMenu, FiX, FiLogOut, FiUser, FiTrendingUp } from 'react-icons/fi';

const Navbar = ({ activeTab, setActiveTab }) => {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'transactions', label: 'Transactions' },
    { id: 'analytics', label: 'Analytics' },
  ];

  return (
    <nav className="sticky top-0 z-50" style={{ background: 'rgba(13,17,23,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #2d3748' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>
              <FiTrendingUp className="text-white" size={16} />
            </div>
            <span className="font-bold text-lg gradient-text">SpendSmart</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === item.id
                    ? 'text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
                style={activeTab === item.id ? { background: 'rgba(139,92,246,0.2)', color: '#a78bfa' } : {}}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* User info */}
          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: '#141a26' }}>
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>
                {user?.name?.charAt(0)?.toUpperCase()}
              </div>
              <span className="text-sm text-gray-300">{user?.name}</span>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-red-400 transition-colors"
              style={{ background: '#141a26' }}
            >
              <FiLogOut size={14} />
              Logout
            </button>
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden text-gray-400 hover:text-white"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t" style={{ borderColor: '#2d3748', background: '#0d1117' }}>
          <div className="px-4 py-3 space-y-1">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setMenuOpen(false); }}
                className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === item.id ? 'text-purple-400' : 'text-gray-400'
                }`}
                style={activeTab === item.id ? { background: 'rgba(139,92,246,0.15)' } : {}}
              >
                {item.label}
              </button>
            ))}
            <div className="pt-2 border-t" style={{ borderColor: '#2d3748' }}>
              <div className="flex items-center gap-2 px-4 py-2 text-sm text-gray-400">
                <FiUser size={14} />
                {user?.name} ({user?.email})
              </div>
              <button
                onClick={() => { logout(); setMenuOpen(false); }}
                className="w-full text-left px-4 py-2 text-sm text-red-400 flex items-center gap-2"
              >
                <FiLogOut size={14} />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
