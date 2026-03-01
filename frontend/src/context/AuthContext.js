'use client';

export const dynamic = 'force-dynamic';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '../lib/axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const loadUser = async () => {
    try {
      const { data } = await api.get('/users/me');
      setUser(data.data);
      localStorage.setItem('user', JSON.stringify(data.data));
    } catch (error) {
      console.error('Failed to load user:', error);
      logout();
    }
  };

  const refreshUser = loadUser; // expose under more intuitive name

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
      loadUser();
    }
    setLoading(false);
  }, []);

  const register = async (userData) => {
    try {
      const { data } = await api.post('/users/register', userData);
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data));
      setUser(data.data);
      toast.success('Registration successful!');
      router.push('/dashboard');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  const login = async (credentials) => {
    try {
      const { data } = await api.post('/users/login', credentials);
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data));
      setUser(data.data);
      toast.success('Login successful!');
      router.push('/dashboard');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/login');
    toast.success('Logged out successfully');
  };

  const updateProfile = async (updates) => {
    try {
      const { data } = await api.put('/users/me', updates);
      setUser(data.data);
      localStorage.setItem('user', JSON.stringify(data.data));
      toast.success('Profile updated successfully');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Update failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        register,
        login,
        logout,
        updateProfile,
        refreshUser,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
