import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuthStore } from '../store/authStore';

const API = process.env.REACT_APP_API_URL || 'https://nightfury-hosting-api.onrender.com/api';

const statusColors = {
  running: 'bg-green-100 text-green-700',
  stopped: 'bg-gray-100 text-gray-600',
  error: 'bg-red-100 text-red-600',
  deploying: 'bg-yellow-100 text-yellow-700',
};

export const HostsPage = () => {
  const { token } = useAuthStore();
  const [hosts, setHosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHosts = () => {
    axios
      .get(`${API}/hosts`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => setHosts(r.data.hosts))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(fetchHosts, [token]);

  const action = async (hostId, act) => {
    try {
      await axios.post(`${API}/hosts/${hostId}/${act}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      toast.success(`Host ${act === 'start' ? 'started' : 'stopped'}`);
      fetchHosts();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Action failed');
    }
  };

  const deleteHost = async (hostId) => {
    if (!window.confirm('Delete this host?')) return;
    try {
      await axios.delete(`${API}/hosts/${hostId}`, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Host deleted');
      fetchHosts();
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  if (loading) return <p className="text-gray-500 p-8">Loading hosts…</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Hosts</h1>
        <Link
          to="/hosts/create"
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          + New Host
        </Link>
      </div>

      {hosts.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-12 text-center">
          <p className="text-gray-400 mb-4">No hosts yet.</p>
          <Link to="/hosts/create" className="text-purple-600 font-medium hover:underline">
            Deploy your first bot →
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {hosts.map((h) => (
            <div key={h._id} className="bg-white rounded-xl shadow p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-800">{h.botName}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{h.hostProvider}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[h.status] || statusColors.stopped}`}>
                  {h.status}
                </span>
              </div>
              {(h.deployUrl || h.deploymentUrl) && (
                <a
                  href={h.deployUrl || h.deploymentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-blue-500 hover:underline break-all block mb-3"
                >
                  {h.deployUrl || h.deploymentUrl}
                </a>
              )}
              {h.status === 'error' && h.errorMessage && (
                <p className="text-xs text-red-500 mb-2">⚠️ {h.errorMessage}</p>
              )}
              <div className="flex gap-2 flex-wrap">
                {h.status !== 'running' && (
                  <button
                    onClick={() => action(h._id, 'start')}
                    className="text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg transition"
                  >
                    Start
                  </button>
                )}
                {h.status === 'running' && (
                  <button
                    onClick={() => action(h._id, 'stop')}
                    className="text-xs bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-lg transition"
                  >
                    Stop
                  </button>
                )}
                <button
                  onClick={() => deleteHost(h._id)}
                  className="text-xs bg-red-100 hover:bg-red-200 text-red-600 px-3 py-1.5 rounded-lg transition"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
