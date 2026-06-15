import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuthStore } from '../store/authStore';

const API = process.env.REACT_APP_API_URL || 'https://nightfury-hosting-api.onrender.com/api';

export const CreateHostPage = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { hostProvider: 'render' }
  });
  const { token } = useAuthStore();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      await axios.post(`${API}/hosts`, data, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Host created! Deploying…');
      navigate('/hosts');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create host');
    }
  };

  const field = 'w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm';

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Deploy New Bot</h1>
      <div className="bg-white rounded-xl shadow p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bot Name</label>
            <input
              {...register('botName', { required: 'Bot name is required' })}
              className={field}
              placeholder="My NightFury Bot"
            />
            {errors.botName && <p className="text-red-500 text-xs mt-1">{errors.botName.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Host Provider</label>
            <select {...register('hostProvider')} className={field}>
              <option value="render">Render.com</option>
              <option value="railway">Railway</option>
              <option value="heroku">Heroku</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Phone Number (optional)</label>
            <input
              {...register('whatsappPhoneNumber')}
              className={field}
              placeholder="+1234567890"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Owner Numbers (comma separated)</label>
            <input
              {...register('ownerNumbers')}
              className={field}
              placeholder="+1234567890,+0987654321"
            />
            <p className="text-xs text-gray-400 mt-1">These numbers will have admin access to the bot.</p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-700">
            ⚠️ Deploying costs <strong>50 coins</strong> from your balance.
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white py-2.5 rounded-lg font-semibold transition"
            >
              {isSubmitting ? 'Deploying…' : 'Deploy Bot'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/hosts')}
              className="px-4 py-2.5 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
