import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export const Header = () => {
  const { isAuthenticated } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="border-b border-white/10 backdrop-blur-sm bg-black/20">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold text-white flex items-center gap-2">
          🔥 <span className="text-purple-400">NightFury</span>Host
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm text-gray-300">
          <Link to="/" className="hover:text-white transition">Home</Link>
          <Link to="/pricing" className="hover:text-white transition">Pricing</Link>
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className="hover:text-white transition">Login</Link>
              <Link
                to="/register"
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition"
              >
                Get Started
              </Link>
            </>
          )}
        </nav>

        <button
          className="md:hidden text-white"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          ☰
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-gray-900 px-4 pb-4 flex flex-col gap-3 text-sm text-gray-300">
          <Link to="/" onClick={() => setMobileOpen(false)}>Home</Link>
          <Link to="/pricing" onClick={() => setMobileOpen(false)}>Pricing</Link>
          {isAuthenticated ? (
            <Link to="/dashboard" onClick={() => setMobileOpen(false)}>Dashboard</Link>
          ) : (
            <>
              <Link to="/login" onClick={() => setMobileOpen(false)}>Login</Link>
              <Link to="/register" onClick={() => setMobileOpen(false)}>Register</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
};
