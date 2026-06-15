import React from 'react';
import { Link } from 'react-router-dom';

export const NotFoundPage = () => (
  <div className="min-h-screen flex flex-col items-center justify-center text-white px-4">
    <h1 className="text-8xl font-extrabold text-purple-400 mb-4">404</h1>
    <p className="text-xl text-gray-300 mb-8">Page not found.</p>
    <Link
      to="/"
      className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition"
    >
      Go Home
    </Link>
  </div>
);
