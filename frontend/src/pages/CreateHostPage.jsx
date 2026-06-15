import React, { useState } from 'react';
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
  const [showSessionHelp, setShowSessionHelp] = useState(false);

  const onSubmit = async (data) => {
    try {
      await axios.post(`${API}/hosts`, data, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Host created! Deploying to Render…');
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

          {/* Bot Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bot Name</label>
            <input
              {...register('botName', { required: 'Bot name is required' })}
              className={field}
              placeholder="My NightFury Bot"
            />
            {errors.botName && <p className="text-red-500 text-xs mt-1">{errors.botName.message}</p>}
          </div>

          {/* Git Repository */}
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-3">
            <p className="text-sm font-semibold text-gray-700">📦 Bot Repository</p>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                GitHub Repo URL <span className="text-red-500">*</span>
              </label>
              <input
                {...register('gitRepo', {
                  required: 'GitHub repo URL is required',
                  pattern: {
                    value: /^https:\/\/github\.com\/[^/]+\/[^/]+/,
                    message: 'Must be a valid GitHub URL — e.g. https://github.com/yourname/NightFuryBot',
                  },
                })}
                className={field}
                placeholder="https://github.com/yourname/NightFuryBot"
                defaultValue="https://github.com/ntando-deeev/NightFuryBot"
              />
              {errors.gitRepo && <p className="text-red-500 text-xs mt-1">{errors.gitRepo.message}</p>}
              <p className="text-xs text-gray-400 mt-1">
                Fork <a href="https://github.com/ntando-deeev/NightFuryBot" target="_blank" rel="noreferrer" className="text-purple-500 hover:underline">ntando-deeev/NightFuryBot</a> to your GitHub account, then paste your fork URL here. The repo must be <strong>public</strong> or connected to Render.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
              <input
                {...register('gitBranch')}
                className={field}
                placeholder="main"
                defaultValue="main"
              />
              <p className="text-xs text-gray-400 mt-1">Leave as <code className="bg-gray-100 px-1 rounded">main</code> unless you use a different branch.</p>
            </div>
          </div>

          {/* Divider */}
          <hr className="border-gray-200" />
            <label className="block text-sm font-medium text-gray-700 mb-1">Host Provider</label>
            <select {...register('hostProvider')} className={field}>
              <option value="render">Render.com (recommended)</option>
              <option value="railway">Railway</option>
              <option value="heroku">Heroku</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          {/* Session ID — required for WhatsApp auth */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">
                Session ID <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setShowSessionHelp(h => !h)}
                className="text-xs text-purple-600 hover:underline"
              >
                How do I get this?
              </button>
            </div>
            <input
              {...register('sessionId', { required: 'Session ID is required to connect to WhatsApp' })}
              className={field}
              placeholder="NightFury!eyJ..."
              autoComplete="off"
            />
            {errors.sessionId && <p className="text-red-500 text-xs mt-1">{errors.sessionId.message}</p>}
            {showSessionHelp && (
              <div className="mt-2 bg-purple-50 border border-purple-200 rounded-lg p-3 text-xs text-purple-800 space-y-1">
                <p className="font-semibold">How to get your Session ID:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Run NightFuryBot locally: <code className="bg-purple-100 px-1 rounded">node launcher.js</code></li>
                  <li>Scan the QR code with your WhatsApp</li>
                  <li>Once connected, the session string is saved in the <code className="bg-purple-100 px-1 rounded">session/</code> folder</li>
                  <li>Or use the <strong>Session Generator</strong> tool — ask the admin for the link</li>
                </ol>
                <p className="text-purple-600">The session ID starts with <code className="bg-purple-100 px-1 rounded">NightFury!</code> followed by a long base64 string.</p>
              </div>
            )}
          </div>

          {/* Owner Numbers */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Owner Number(s) <span className="text-red-500">*</span>
            </label>
            <input
              {...register('ownerNumbers', { required: 'At least one owner number is required' })}
              className={field}
              placeholder="27812345678,27987654321"
            />
            {errors.ownerNumbers && <p className="text-red-500 text-xs mt-1">{errors.ownerNumbers.message}</p>}
            <p className="text-xs text-gray-400 mt-1">
              Your WhatsApp number(s) without + sign, comma-separated. These get full bot owner access.
            </p>
          </div>

          {/* WhatsApp Phone Number (display label only, optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Phone Number (optional)</label>
            <input
              {...register('whatsappPhoneNumber')}
              className={field}
              placeholder="+27812345678"
            />
            <p className="text-xs text-gray-400 mt-1">Used for display purposes only.</p>
          </div>

          {/* OpenAI Key (optional, for AI commands) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">OpenAI API Key (optional)</label>
            <input
              {...register('openaiKey')}
              className={field}
              placeholder="sk-..."
              autoComplete="off"
              type="password"
            />
            <p className="text-xs text-gray-400 mt-1">
              Required for AI commands (.gpt, .ask, etc.). Leave blank to disable AI features.
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-700">
            ⚠️ Deploying costs <strong>50 coins</strong> from your balance. The bot will be live on Render.com within ~2 minutes.
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white py-2.5 rounded-lg font-semibold transition"
            >
              {isSubmitting ? 'Deploying…' : '🚀 Deploy Bot'}
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
