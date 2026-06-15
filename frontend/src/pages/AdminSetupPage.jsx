import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuthStore } from '../store/authStore';

const API = process.env.REACT_APP_API_URL || 'https://nightfury-hosting-api.onrender.com/api';

/**
 * AdminSetupPage — creates the first admin account.
 * Route: /admin-setup
 * Only usable once (server rejects if an admin already exists).
 * After success, logs the user in automatically and redirects to /admin.
 */
export const AdminSetupPage = () => {
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm();
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [done, setDone] = useState(false);

  const onSubmit = async (data) => {
    try {
      await axios.post(`${API.replace('/api', '')}/api/init-admin`, {
        email:    data.email,
        password: data.password,
        secret:   data.secret,
      });

      toast.success('Admin account created! Logging you in…');

      // Auto-login with the new admin credentials
      await login(data.email, data.password);
      setDone(true);
      setTimeout(() => navigate('/admin'), 1500);
    } catch (err) {
      const msg = err.response?.data?.error || 'Setup failed';
      toast.error(msg);
      if (msg === 'Admin already exists') {
        toast.info('Head to /login and sign in with your admin account.');
      }
    }
  };

  const field =
    'w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 text-sm';

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-950">
      <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-2xl p-8 text-white">
        {/* Header */}
        <div className="text-center mb-6">
          <span className="text-4xl">🔥</span>
          <h1 className="text-2xl font-bold mt-2">Admin Setup</h1>
          <p className="text-gray-400 text-sm mt-1">
            One-time setup — creates the platform admin account.
          </p>
        </div>

        {done ? (
          <div className="text-center py-8">
            <p className="text-green-400 text-lg font-semibold">✅ Admin created!</p>
            <p className="text-gray-400 text-sm mt-2">Redirecting to admin panel…</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">Admin Email</label>
              <input
                type="email"
                {...register('email', { required: 'Email is required' })}
                className={field}
                placeholder="admin@nightfuryhost.com"
              />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">Password</label>
              <input
                type="password"
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 8, message: 'Minimum 8 characters' },
                })}
                className={field}
                placeholder="••••••••"
              />
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">Confirm Password</label>
              <input
                type="password"
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: (v) => v === watch('password') || 'Passwords do not match',
                })}
                className={field}
                placeholder="••••••••"
              />
              {errors.confirmPassword && (
                <p className="text-red-400 text-xs mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Init Secret */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Setup Secret{' '}
                <span className="text-gray-500 text-xs">(set via ADMIN_INIT_SECRET env var)</span>
              </label>
              <input
                type="password"
                {...register('secret', { required: 'Setup secret is required' })}
                className={field}
                placeholder="nightfury-init"
                autoComplete="off"
              />
              {errors.secret && <p className="text-red-400 text-xs mt-1">{errors.secret.message}</p>}
              <p className="text-xs text-gray-500 mt-1">
                Default is <code className="bg-white/10 px-1 rounded">nightfury-init</code> — change it in your Render env vars.
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 py-2.5 rounded-lg font-semibold transition mt-2"
            >
              {isSubmitting ? 'Creating admin…' : '🚀 Create Admin Account'}
            </button>
          </form>
        )}

        <p className="text-center text-gray-500 text-xs mt-6">
          Already set up?{' '}
          <Link to="/login" className="text-purple-400 hover:text-purple-300">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};
