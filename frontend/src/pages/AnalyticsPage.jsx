import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useAuthStore } from '../store/authStore';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const AnalyticsPage = () => {
  const { token } = useAuthStore();
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${API}/analytics/overview`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => setOverview(r.data.overview || r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <p className="text-gray-500 p-8">Loading analytics…</p>;

  // overview.hosts is not available from /analytics/overview;
  // build a simple summary chart from the top-level fields instead
  const chartData = overview
    ? [
        { name: 'Messages', value: overview.totalMessages || 0 },
        { name: 'Commands', value: overview.totalCommands || 0 },
      ]
    : [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Analytics</h1>

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Messages', value: overview?.totalMessages ?? 0 },
          { label: 'Active Hosts', value: overview?.activeHosts ?? 0 },
          { label: 'Avg Uptime', value: `${Math.round(overview?.averageUptime ?? 0)}%` },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl shadow p-5">
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className="text-3xl font-bold text-gray-800 mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {chartData.length > 0 && (
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Messages per Host</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="value" fill="#7c3aed" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {chartData.length === 0 && (
        <div className="bg-white rounded-xl shadow p-12 text-center text-gray-400">
          No analytics data yet. Deploy and run a host to see stats.
        </div>
      )}
    </div>
  );
};
