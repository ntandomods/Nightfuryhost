import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const StatCard = ({ label, value, color }) => (
  <div className={`bg-white rounded-xl shadow p-5 border-l-4 ${color}`}>
    <p className="text-sm text-gray-500">{label}</p>
    <p className="text-3xl font-bold text-gray-800 mt-1">{value ?? '—'}</p>
  </div>
);

export const DashboardPage = () => {
  const { token } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${API}/dashboard`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => setStats(r.data.stats))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <p className="text-gray-500 p-8">Loading dashboard…</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <Link
          to="/hosts/create"
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          + New Host
        </Link>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Coins Balance" value={stats?.coins} color="border-purple-500" />
        <StatCard label="Total Hosts" value={stats?.hosts} color="border-blue-500" />
        <StatCard label="Active Hosts" value={stats?.activeHosts} color="border-green-500" />
        <StatCard label="Coins Spent" value={stats?.totalSpent} color="border-orange-500" />
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Recent Transactions</h2>
        {stats?.recentTransactions?.length ? (
          <ul className="divide-y">
            {stats.recentTransactions.map((t) => (
              <li key={t._id} className="py-3 flex justify-between text-sm">
                <span className="text-gray-600">{t.description}</span>
                <span className={t.type === 'spent' ? 'text-red-500' : 'text-green-500'}>
                  {t.type === 'spent' ? '-' : '+'}{t.amount} coins
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-400 text-sm">No transactions yet.</p>
        )}
      </div>
    </div>
  );
};
