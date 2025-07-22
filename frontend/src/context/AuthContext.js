import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Function to load user data
  const loadUser = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['x-auth-token'] = token;
      try {
        const res = await axios.get('/api/auth');
        setUser(res.data);
        setIsAuthenticated(true);
      } catch (err) {
        // If token is invalid, remove it
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['x-auth-token'];
        setIsAuthenticated(false);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    loadUser();
  }, []);

  // Register user
  const register = async (formData) => {
    try {
      await axios.post('/register', formData, {
        headers: { 'Content-Type': 'application/json' },
      });
      // Automatically log in after successful registration
      await login(formData);
    } catch (err) {
      console.error('Registration failed:', err.response.data);
      // Optionally, set an error state to show in the UI
    }
  };

  // Login user
  const login = async (formData) => {
    try {
      const res = await axios.post('/login', formData, {
        headers: { 'Content-Type': 'application/json' },
      });
      localStorage.setItem('token', res.data.token);
      // After logging in, load the user's data
      await loadUser();
    } catch (err) {
      console.error('Login failed:', err.response.data);
      // Optionally, set an error state
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['x-auth-token'];
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        register,
        login,
        logout,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
