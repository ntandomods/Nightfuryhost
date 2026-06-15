import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { toast } from 'react-toastify';

const API = process.env.REACT_APP_API_URL || 'https://nightfury-hosting-api.onrender.com/api';

const StatCard = ({ label, value, color }) => (
  <div className={"rounded-xl p-5 text-white " + color}>
    <p className="text-sm opacity-75">{label}</p>
    <p className="text-3xl font-bold mt-1">{value ?? 0}</p>
  </div>
);

export const AdminPage = () => {
  const { token, user } = useAuthStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [hosts, setHosts] = useState([]);
  const [tab, setTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [bonusModal, setBonusModal] = useState(null);
  const [bonusAmount, setBonusAmount] = useState('');
  const [bonusReason, setBonusReason] = useState('');

  // Guard: non-admins get bounced immediately
  useEffect(() => {
    if (user && !user.isAdmin) {
      toast.error('Admin access required');
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const headers = { Authorization: 'Bearer ' + token };

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes, hostsRes] = await Promise.all([
        axios.get(API + '/admin/stats', { headers }),
        axios.get(API + '/admin/users', { headers }),
        axios.get(API + '/admin/hosts', { headers }),
      ]);
      setStats(statsRes.data.stats);
      setUsers(usersRes.data.users || []);
      setHosts(hostsRes.data.hosts || []);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleSuspend = async (userId, currentStatus) => {
    const suspended = currentStatus !== 'suspended';
    try {
      await axios.post(API + '/admin/users/' + userId + '/suspend', { suspended }, { headers });
      toast.success(suspended ? 'User suspended' : 'User unsuspended');
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed');
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Delete this user and all their hosts?')) return;
    try {
      await axios.delete(API + '/admin/users/' + userId, { headers });
      toast.success('User deleted');
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed');
    }
  };

  const handleMakeAdmin = async (userId) => {
    if (!window.confirm('Promote this user to admin?')) return;
    try {
      await axios.post(API + '/admin/users/' + userId + '/make-admin', {}, { headers });
      toast.success('User promoted to admin');
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed');
    }
  };

  const handleBonus = async () => {
    if (!bonusAmount || isNaN(bonusAmount) || Number(bonusAmount) <= 0) {
      toast.error('Enter a valid coin amount');
      return;
    }
    try {
      await axios.post(API + '/admin/users/' + bonusModal._id + '/bonus-coins',
        { amount: Number(bonusAmount), reason: bonusReason || 'Admin bonus' },
        { headers });
      toast.success(bonusAmount + ' coins added to ' + bonusModal.username);
      setBonusModal(null);
      setBonusAmount('');
      setBonusReason('');
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed');
    }
  };

  const handleDeleteHost = async (hostId) => {
    if (!window.confirm('Delete this host?')) return;
    try {
      await axios.delete(API + '/admin/hosts/' + hostId, { headers });
      toast.success('Host deleted');
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed');
    }
  };

  if (!user?.isAdmin) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-red-400">
          <p className="text-4xl mb-2">🚫</p>
          <p className="text-lg font-semibold">Admin access required</p>
        </div>
      </div>
    );
  }

  if (loading) return <p className="text-gray-400 p-8">Loading admin panel…</p>;

  const tabs = ['overview', 'users', 'hosts'];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">⚡ Admin Panel</h1>
        <button onClick={fetchAll} className="text-sm bg-purple-600 text-white px-3 py-1.5 rounded-lg hover:bg-purple-700">Refresh</button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={"px-4 py-2 rounded-lg text-sm font-medium capitalize transition " + (tab === t ? 'bg-purple-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border')}>
            {t}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'overview' && stats && (
        <div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard label="Total Users" value={stats.totalUsers} color="bg-purple-600" />
            <StatCard label="Total Hosts" value={stats.totalHosts} color="bg-blue-600" />
            <StatCard label="Active Hosts" value={stats.activeHosts} color="bg-green-600" />
            <StatCard label="Transactions" value={stats.totalTransactions} color="bg-orange-500" />
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="font-semibold text-gray-700 mb-4">Recent Users</h2>
            <table className="w-full text-sm">
              <thead><tr className="text-left text-gray-500 border-b">
                <th className="pb-2">Username</th><th className="pb-2">Email</th><th className="pb-2">Tier</th><th className="pb-2">Coins</th><th className="pb-2">Admin</th>
              </tr></thead>
              <tbody>
                {(stats.recentUsers || []).map(u => (
                  <tr key={u._id} className="border-b last:border-0">
                    <td className="py-2 font-medium">{u.username}</td>
                    <td className="py-2 text-gray-500">{u.email}</td>
                    <td className="py-2"><span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-xs">{u.tier || 'free'}</span></td>
                    <td className="py-2">{u.coins || 0}</td>
                    <td className="py-2">{u.isAdmin ? '✅' : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Users */}
      {tab === 'users' && (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="bg-gray-50 text-left text-gray-500 border-b">
                <th className="p-3">User</th><th className="p-3">Tier</th><th className="p-3">Coins</th>
                <th className="p-3">Status</th><th className="p-3">Admin</th><th className="p-3">Actions</th>
              </tr></thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="p-3">
                      <p className="font-medium text-gray-800">{u.username}</p>
                      <p className="text-gray-400 text-xs">{u.email}</p>
                    </td>
                    <td className="p-3"><span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-xs">{u.tier || 'free'}</span></td>
                    <td className="p-3 font-mono">{u.coins || 0}</td>
                    <td className="p-3">
                      <span className={"px-2 py-0.5 rounded text-xs font-medium " + (u.subscriptionStatus === 'suspended' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700')}>
                        {u.subscriptionStatus || 'inactive'}
                      </span>
                    </td>
                    <td className="p-3">{u.isAdmin ? '✅' : '—'}</td>
                    <td className="p-3">
                      <div className="flex gap-1 flex-wrap">
                        <button onClick={() => setBonusModal(u)} className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded hover:bg-yellow-200">+ Coins</button>
                        <button onClick={() => handleSuspend(u._id, u.subscriptionStatus)}
                          className={"text-xs px-2 py-1 rounded " + (u.subscriptionStatus === 'suspended' ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200')}>
                          {u.subscriptionStatus === 'suspended' ? 'Unsuspend' : 'Suspend'}
                        </button>
                        {!u.isAdmin && <button onClick={() => handleMakeAdmin(u._id)} className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded hover:bg-purple-200">Make Admin</button>}
                        <button onClick={() => handleDelete(u._id)} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded hover:bg-red-100 hover:text-red-600">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && <p className="text-gray-400 text-sm text-center py-8">No users yet.</p>}
          </div>
        </div>
      )}

      {/* Hosts */}
      {tab === 'hosts' && (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="bg-gray-50 text-left text-gray-500 border-b">
                <th className="p-3">Bot Name</th><th className="p-3">Provider</th><th className="p-3">Status</th><th className="p-3">User</th><th className="p-3">Actions</th>
              </tr></thead>
              <tbody>
                {hosts.map(h => (
                  <tr key={h._id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="p-3 font-medium">{h.botName || h.name}</td>
                    <td className="p-3 text-gray-500">{h.hostProvider}</td>
                    <td className="p-3">
                      <span className={"px-2 py-0.5 rounded text-xs font-medium " +
                        (h.status === 'running' ? 'bg-green-100 text-green-700' :
                         h.status === 'stopped' ? 'bg-gray-100 text-gray-600' :
                         h.status === 'error' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700')}>
                        {h.status}
                      </span>
                    </td>
                    <td className="p-3 text-gray-500 text-xs">{h.userId}</td>
                    <td className="p-3">
                      <button onClick={() => handleDeleteHost(h._id)} className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {hosts.length === 0 && <p className="text-gray-400 text-sm text-center py-8">No hosts yet.</p>}
          </div>
        </div>
      )}

      {/* Bonus Coins Modal */}
      {bonusModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-lg font-bold mb-4">Add Bonus Coins to {bonusModal.username}</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Coins Amount</label>
                <input type="number" min="1" value={bonusAmount} onChange={e => setBonusAmount(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500" placeholder="e.g. 100" />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Reason (optional)</label>
                <input type="text" value={bonusReason} onChange={e => setBonusReason(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500" placeholder="Admin bonus" />
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={handleBonus} className="flex-1 bg-purple-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-purple-700">Add Coins</button>
              <button onClick={() => setBonusModal(null)} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-200">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
