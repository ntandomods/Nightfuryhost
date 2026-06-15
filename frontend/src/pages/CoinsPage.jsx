import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuthStore } from '../store/authStore';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const CoinsPage = () => {
  const { token } = useAuthStore();
  const [balance, setBalance] = useState(null);
  const [packages, setPackages] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const headers = { Authorization: `Bearer ${token}` };
    Promise.all([
      axios.get(`${API}/coins/packages`),
      axios.get(`${API}/coins/user/balance`, { headers }),
      axios.get(`${API}/coins/history`, { headers }),
    ])
      .then(([pkgs, bal, hist]) => {
        setPackages(pkgs.data.packages);
        setBalance(bal.data.coins);
        setHistory(hist.data.transactions || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  const purchase = async (packageId) => {
    try {
      const { data } = await axios.post(
        `${API}/coins/purchase`,
        { packageId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.info('Redirecting to payment…');
      // In a real app, use Stripe.js to confirm payment with data.clientSecret
      console.log('Payment intent:', data.clientSecret);
      toast.success('Payment flow initiated — integrate Stripe.js to complete.');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Purchase failed');
    }
  };

  if (loading) return <p className="text-gray-500 p-8">Loading…</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Coins</h1>
      <p className="text-gray-500 mb-6">
        Current balance: <span className="font-bold text-purple-600 text-xl">{balance} coins</span>
      </p>

      {/* Packages */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-10">
        {packages.map((p) => (
          <div key={p.id} className="bg-white rounded-xl shadow p-5 flex flex-col items-center text-center hover:shadow-md transition">
            <p className="text-2xl font-extrabold text-purple-600">{p.coins}</p>
            <p className="text-xs text-gray-400 mb-1">coins</p>
            <p className="font-bold text-gray-800 mb-1">{p.name}</p>
            <p className="text-lg font-semibold text-gray-700 mb-1">${p.price}</p>
            {p.bonus !== 'No bonus' && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full mb-2">{p.bonus}</span>
            )}
            <button
              onClick={() => purchase(p.id)}
              className="mt-auto w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg text-sm font-medium transition"
            >
              Buy
            </button>
          </div>
        ))}
      </div>

      {/* Transaction history */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Transaction History</h2>
        {history.length === 0 ? (
          <p className="text-gray-400 text-sm">No transactions yet.</p>
        ) : (
          <ul className="divide-y">
            {history.map((t) => (
              <li key={t._id} className="py-3 flex justify-between text-sm">
                <span className="text-gray-600">{t.description}</span>
                <span className={t.type === 'spent' ? 'text-red-500' : 'text-green-500'}>
                  {t.type === 'spent' ? '-' : '+'}{t.amount}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
