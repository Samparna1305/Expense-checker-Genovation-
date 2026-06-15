import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiTrendingUp } from 'react-icons/fi';

const Register = ({ onSwitch }) => {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    else if (form.name.length < 2) errs.name = 'Name too short';
    if (!form.email) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 6) errs.password = 'Minimum 6 characters';
    if (form.password !== form.confirm) errs.confirm = 'Passwords do not match';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    await register(form.name.trim(), form.email, form.password);
    setLoading(false);
  };

  const inputClass = 'w-full pl-10 pr-4 py-3 rounded-xl text-sm border transition-all duration-200 focus:outline-none';

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8" style={{ background: 'radial-gradient(ellipse at top right, rgba(79,70,229,0.1) 0%, #0d1117 50%)' }}>
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4" style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>
            <FiTrendingUp className="text-white" size={26} />
          </div>
          <h1 className="text-3xl font-bold gradient-text mb-2">SpendSmart</h1>
          <p className="text-gray-500 text-sm">Start tracking your finances today</p>
        </div>

        <div className="rounded-2xl p-8 glass-card">
          <h2 className="text-xl font-semibold text-white mb-6">Create account</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Full name</label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="John Doe"
                  className={inputClass}
                  style={{ borderColor: errors.name ? '#ef4444' : '#2d3748' }}
                />
              </div>
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Email address</label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                  className={inputClass}
                  style={{ borderColor: errors.email ? '#ef4444' : '#2d3748' }}
                />
              </div>
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Password</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="Min. 6 characters"
                  className={inputClass}
                  style={{ borderColor: errors.password ? '#ef4444' : '#2d3748' }}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                  {showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Confirm password</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.confirm}
                  onChange={e => setForm({ ...form, confirm: e.target.value })}
                  placeholder="Re-enter password"
                  className={inputClass}
                  style={{ borderColor: errors.confirm ? '#ef4444' : '#2d3748' }}
                />
              </div>
              {errors.confirm && <p className="text-red-400 text-xs mt-1">{errors.confirm}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-white font-semibold text-sm btn-primary disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating account...
                </span>
              ) : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <button onClick={onSwitch} className="text-purple-400 hover:text-purple-300 font-medium">
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
