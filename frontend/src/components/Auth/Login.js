import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { FcGoogle } from 'react-icons/fc';
import { FaGithub } from 'react-icons/fa';
import './Auth.css';

const Login = () => {
  const { login, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');

  const { email, password } = formData;

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(formData);
    } catch (err) {
      setError(err.response.data.msg || 'Login failed');
      setTimeout(() => setError(''), 5000);
    }
  };

  return (
    <div className="auth-container">
      <div className="form-container">
        <div className="form-header">
          <h2>Welcome back</h2>
          <p>Sign in to your account to continue</p>
        </div>
        
        {error && <div className="alert alert-danger">{error}</div>}
        
        <form onSubmit={onSubmit} className="mt-8 space-y-6">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={onChange}
              placeholder="Enter your email"
              required
              className="mt-1"
            />
          </div>
          
          <div className="form-group">
            <div className="flex items-center justify-between">
              <label htmlFor="password">Password</label>
              <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-800">
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              name="password"
              value={password}
              onChange={onChange}
              placeholder="Enter your password"
              required
              className="mt-1"
            />
          </div>
          
          <div>
            <button type="submit" className="btn-primary">
              Sign In
            </button>
          </div>
        </form>
        
        <div className="divider">
          <span>Or continue with</span>
        </div>
        
        <div className="social-buttons">
          <button type="button" className="social-btn">
            <FcGoogle className="h-5 w-5" />
            <span>Sign in with Google</span>
          </button>
          <button type="button" className="social-btn">
            <FaGithub className="h-5 w-5" />
            <span>Sign in with GitHub</span>
          </button>
        </div>
        
        <div className="form-footer mt-4">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-600 hover:text-blue-800 font-medium">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;

