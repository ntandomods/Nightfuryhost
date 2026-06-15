import React from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuthStore } from '../store/authStore';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const SettingsPage = () => {
  const { user, token } = useAuthStore();
  const { register, handleSubmit, formState: { isSubmitting } } = useForm({
    defaultValues: { username: user?.username, phoneNumber: user?.phoneNumber || '' }
  });

  const { register: regPwd, handleSubmit: handlePwd, reset: resetPwd, formState: { isSubmitting: pwdSubmitting } } = useForm();

  const onProfile = async (data) => {
    try {
      await axios.put(`${API}/auth/profile`, data, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Update failed');
    }
  };

  const onPassword = async (data) => {
    try {
      await axios.post(`${API}/auth/change-password`, data, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Password changed');
      resetPwd();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed');
    }
  };

  const field = 'w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm';

  return (
    <div className="max-w-lg space-y-8">
      <h1 className="text-2xl font-bold text-gray-800">Settings</h1>

      {/* Profile */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Profile</h2>
        <form onSubmit={handleSubmit(onProfile)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input {...register('username')} className={field} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input {...register('phoneNumber')} className={field} placeholder="+1234567890" />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-5 py-2 rounded-lg text-sm font-medium transition"
          >
            {isSubmitting ? 'Saving…' : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Change Password</h2>
        <form onSubmit={handlePwd(onPassword)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
            <input type="password" {...regPwd('currentPassword', { required: true })} className={field} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input type="password" {...regPwd('newPassword', { required: true, minLength: 6 })} className={field} />
          </div>
          <button
            type="submit"
            disabled={pwdSubmitting}
            className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-5 py-2 rounded-lg text-sm font-medium transition"
          >
            {pwdSubmitting ? 'Updating…' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
};
