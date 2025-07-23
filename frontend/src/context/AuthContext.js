import React, { createContext, useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import { authAPI } from '../services/api';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if token is expired
  const isTokenExpired = (token) => {
    try {
      const decoded = jwtDecode(token);
      return decoded.exp < Date.now() / 1000;
    } catch (err) {
      return true;
    }
  };

  // Set auth token in axios headers
  const setAuthToken = (token) => {
    if (token) {
      axios.defaults.headers.common['x-auth-token'] = token;
      localStorage.setItem('token', token);
    } else {
      delete axios.defaults.headers.common['x-auth-token'];
      localStorage.removeItem('token');
    }
  };

  // Load user data
  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      setLoading(false);
      return;
    }

    if (isTokenExpired(token)) {
      setAuthToken(null);
      setLoading(false);
      return;
    }

    setAuthToken(token);
    
    try {
      const response = await authAPI.getCurrentUser();
      setUser(response.data);
      setIsAuthenticated(true);
    } catch (err) {
      setAuthToken(null);
      setError('Session expired. Please log in again.');
      console.error('Error loading user:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // In AuthContext.js, add this function to the context value
const refreshUser = useCallback(async () => {
  try {
    const response = await authAPI.getCurrentUser();
    setUser(response.data);
    return response.data;
  } catch (err) {
    console.error('Error refreshing user data:', err);
    return null;
  }
}, []);


  // Register user
  const register = async (formData) => {
    try {
      const response = await authAPI.register(formData);
      setAuthToken(response.data.token);
      await loadUser();
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.msg || 'Registration failed';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  // Login user
  const login = async (formData) => {
    try {
      const response = await authAPI.login(formData);
      setAuthToken(response.data.token);
      await loadUser();
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.msg || 'Login failed';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  // Logout user
  const logout = () => {
    setAuthToken(null);
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
  };

  // Clear errors
  const clearErrors = () => setError(null);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        error,
        register,
        login,
        logout,
        clearErrors,
        refreshUser,
        }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };