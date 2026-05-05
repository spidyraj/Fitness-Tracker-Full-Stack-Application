import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import { LogIn, Eye, EyeOff, Shield, Zap, TrendingUp } from 'lucide-react';
import EnhancedButton from '../components/EnhancedButton';
import './EnhancedAuth.css';

const EnhancedLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { showError, showSuccess } = useToast();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', formData);
      login(response.data.token, response.data);
      showSuccess('Welcome back! 🎉');
      navigate('/dashboard');
    } catch (err: unknown) {
      const errorMessage = err && typeof err === 'object' && 'response' in err
        ? (err as any).response?.data?.message || 'Login failed'
        : 'Login failed. Please check your credentials.';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="enhanced-auth-container">
      {/* Background Elements */}
      <div className="auth-bg-elements">
        <div className="floating-card card-1">
          <TrendingUp className="card-icon" />
          <span>Track Progress</span>
        </div>
        <div className="floating-card card-2">
          <Zap className="card-icon" />
          <span>AI Powered</span>
        </div>
        <div className="floating-card card-3">
          <Shield className="card-icon" />
          <span>Secure</span>
        </div>
      </div>

      <div className="enhanced-auth-card">
        {/* Logo Section */}
        <div className="auth-logo">
          <div className="logo-icon">
            <Zap size={32} />
          </div>
          <h1>FIT<span>AI</span></h1>
          <p className="tagline">Your AI-Powered Fitness Companion</p>
        </div>

        {/* Welcome Section */}
        <div className="auth-welcome">
          <h2>Welcome Back! 💪</h2>
          <p>Ready to crush your fitness goals today?</p>
        </div>
        
        {error && (
          <div className="auth-error">
            <Shield size={16} />
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <label className="input-label">Email Address</label>
            <div className="input-wrapper">
              <input 
                type="email" 
                name="email"
                className="enhanced-input" 
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required 
              />
              <div className="input-border"></div>
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Password</label>
            <div className="input-wrapper">
              <input 
                type={showPassword ? "text" : "password"} 
                name="password"
                className="enhanced-input" 
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required 
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
              <div className="input-border"></div>
            </div>
          </div>
          
          <div className="auth-options">
            <label className="checkbox-label">
              <input type="checkbox" />
              <span className="checkmark"></span>
              Remember me
            </label>
            <Link to="/forgot-password" className="forgot-link">
              Forgot password?
            </Link>
          </div>
          
          <EnhancedButton
            type="submit"
            variant="gradient"
            size="lg"
            icon={LogIn}
            loading={loading}
            disabled={loading}
            className="auth-submit-btn"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </EnhancedButton>
        </form>

        {/* Divider */}
        <div className="auth-divider">
          <span>OR</span>
        </div>

        {/* Social Login */}
        <div className="social-login">
          <EnhancedButton variant="glass" size="md" className="social-btn">
            <span className="social-icon">🔗</span>
            Continue with Google
          </EnhancedButton>
        </div>

        {/* Footer */}
        <div className="auth-footer">
          <p>
            New to FITAI? <Link to="/register" className="register-link">
              Create your free account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default EnhancedLogin;
