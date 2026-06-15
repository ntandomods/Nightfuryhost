import React from 'react';
import { FiMenu, FiBell, FiUser } from 'react-icons/fi';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';

export const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
      <button
        onClick={onMenuClick}
        className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition"
      >
        <FiMenu size={20} />
      </button>

      <div className="flex items-center gap-3">
        <button className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition relative">
          <FiBell size={20} />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white font-semibold text-sm">
            {user?.username?.[0]?.toUpperCase() || 'U'}
          </div>
          <span className="text-sm text-gray-700 font-medium hidden md:block">
            {user?.username || 'User'}
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="text-sm text-gray-500 hover:text-red-500 transition px-2"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};
