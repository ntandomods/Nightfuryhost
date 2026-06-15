import { create } from 'zustand';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null,

  checkAuth: async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        set({ loading: true });
        const { data } = await axios.get(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        set({ user: data.user, isAuthenticated: true, loading: false });
      } catch (error) {
        localStorage.removeItem('token');
        set({ isAuthenticated: false, token: null, user: null, loading: false });
      }
    }
  },

  login: async (email, password) => {
    try {
      set({ loading: true, error: null });
      const { data } = await axios.post(`${API_URL}/auth/login`, { email, password });
      localStorage.setItem('token', data.token);
      set({
        user: data.user,
        token: data.token,
        isAuthenticated: true,
        loading: false
      });
      return data;
    } catch (error) {
      const message = error.response?.data?.error || 'Login failed';
      set({ error: message, loading: false });
      throw error;
    }
  },

  register: async (username, email, password, confirmPassword) => {
    try {
      set({ loading: true, error: null });
      const { data } = await axios.post(`${API_URL}/auth/register`, {
        username,
        email,
        password,
        confirmPassword
      });
      localStorage.setItem('token', data.token);
      set({
        user: data.user,
        token: data.token,
        isAuthenticated: true,
        loading: false
      });
      return data;
    } catch (error) {
      const message = error.response?.data?.error || 'Registration failed';
      set({ error: message, loading: false });
      throw error;
    }
  },

  logout: async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        await axios.post(
          `${API_URL}/auth/logout`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false });
  },

  updateProfile: async (data) => {
    try {
      set({ loading: true });
      const token = localStorage.getItem('token');
      const response = await axios.put(`${API_URL}/auth/profile`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      set({ user: response.data.user, loading: false });
      return response.data;
    } catch (error) {
      set({ error: error.response?.data?.error || 'Update failed', loading: false });
      throw error;
    }
  }
}));
