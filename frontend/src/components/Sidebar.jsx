import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiGrid, FiServer, FiDollarSign, FiBarChart2, FiSettings, FiX, FiShield
} from 'react-icons/fi';
import { useAuthStore } from '../store/authStore';

const baseNavItems = [
  { to: '/dashboard', icon: FiGrid, label: 'Dashboard' },
  { to: '/hosts', icon: FiServer, label: 'My Hosts' },
  { to: '/coins', icon: FiDollarSign, label: 'Coins' },
  { to: '/analytics', icon: FiBarChart2, label: 'Analytics' },
  { to: '/settings', icon: FiSettings, label: 'Settings' },
];

export const Sidebar = ({ isOpen, setIsOpen }) => {
  const { user } = useAuthStore();
  const navItems = user?.isAdmin
    ? [...baseNavItems, { to: '/admin', icon: FiShield, label: 'Admin Panel' }]
    : baseNavItems;

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black/40 z-20 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      <motion.aside
        animate={{ width: isOpen ? 240 : 0 }}
        transition={{ duration: 0.25 }}
        className="bg-gray-900 text-white flex-shrink-0 overflow-hidden h-screen z-30"
      >
        <div className="w-60">
          {/* Logo */}
          <div className="flex items-center justify-between px-5 py-5 border-b border-gray-700">
            <span className="text-xl font-bold text-purple-400">🔥 NightFury</span>
            <button
              onClick={() => setIsOpen(false)}
              className="md:hidden text-gray-400 hover:text-white"
            >
              <FiX size={18} />
            </button>
          </div>

          {/* Nav links */}
          <nav className="mt-4 px-3 space-y-1">
            {navItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                    isActive
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`
                }
              >
                <Icon size={18} />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </motion.aside>
    </>
  );
};
