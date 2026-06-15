import React from 'react';
import { Link } from 'react-router-dom';

export const Footer = () => (
  <footer className="border-t border-white/10 py-8 mt-auto">
    <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-400">
      <p>© {new Date().getFullYear()} NightFury Hosting. All rights reserved.</p>
      <div className="flex gap-6">
        <Link to="/pricing" className="hover:text-white transition">Pricing</Link>
        <a href="mailto:support@nightfuryhost.com" className="hover:text-white transition">Support</a>
      </div>
    </div>
  </footer>
);
