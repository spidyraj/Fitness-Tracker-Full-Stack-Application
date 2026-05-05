import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import { UserPlus, Eye, EyeOff, Check, X } from 'lucide-react';
import EnhancedButton from '../components/EnhancedButton';
import './EnhancedAuth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { showError, showSuccess } = useToast();
  const navigate = useNavigate();

  const passwordRequirements = [
    { regex: /.{8,}/, text: "At least 8 characters", met: false },
    { regex: /[A-Z]/, text: "One uppercase letter", met: false },
    { regex: /[a-z]/, text: "One lowercase letter", met: false },
    { regex: /\d/, text: "One number", met: false },
    { regex: /[@$!%*?&]/, text: "One special character (@$!%*?&)", met: false }
  ];

  const [passwordValidation, setPasswordValidation] = useState(passwordRequirements);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Update password validation in real-time
    if (name === 'password') {
      const updatedValidation = passwordRequirements.map(req => ({
        ...req,
        met: req.regex.test(value)
      }));
      setPasswordValidation(updatedValidation);
    }
    
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/auth/register', formData);
      showSuccess('Account created successfully! 🎉');
      navigate('/login');
    } catch (err: unknown) {
      const errorMessage = err && typeof err === 'object' && 'response' in err
        ? (err as any).response?.data?.message || 'Registration failed'
        : 'Registration failed. Try a different email.';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const isPasswordValid = passwordValidation.every(req => req.met);

  return (
    <div className="enhanced-auth-container">
      {/* Background Elements */}
      <div className="auth-bg-elements">
        <div className="floating-card card-1">
          <UserPlus className="card-icon" />
          <span>Join Now</span>
        </div>
        <div className="floating-card card-2">
          <Eye className="card-icon" />
          <span>Secure</span>
        </div>
        <div className="floating-card card-3">
          <Check className="card-icon" />
          <span>Verified</span>
        </div>
      </div>

      <div className="enhanced-auth-card">
        {/* Logo Section */}
        <div className="auth-logo">
          <div className="logo-icon">
            <UserPlus size={32} />
          </div>
          <h1>FIT<span>AI</span></h1>
          <p className="tagline">Start Your Fitness Journey Today</p>
        </div>

        {/* Welcome Section */}
        <div className="auth-welcome">
          <h2>Create Account 🚀</h2>
          <p>Join the AI-powered fitness revolution</p>
        </div>
        
        {error && (
          <div className="auth-error">
            <X size={16} />
            {error}
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group" style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label className="input-label">First Name</label>
              <div className="input-wrapper">
                <input 
                  type="text" 
                  name="firstName" 
                  className="enhanced-input" 
                  placeholder="First name"
                  onChange={handleChange} 
                  required 
                />
                <div className="input-border"></div>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <label className="input-label">Last Name</label>
              <div className="input-wrapper">
                <input 
                  type="text" 
                  name="lastName" 
                  className="enhanced-input" 
                  placeholder="Last name"
                  onChange={handleChange} 
                  required 
                />
                <div className="input-border"></div>
              </div>
            </div>
          </div>
          
          <div className="input-group">
            <label className="input-label">Email Address</label>
            <div className="input-wrapper">
              <input 
                type="email" 
                name="email" 
                className="enhanced-input" 
                placeholder="Enter your email"
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
                placeholder="Create a strong password"
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
            
            {/* Password Requirements */}
            {formData.password && (
              <div className="password-requirements">
                <p className="requirements-title">Password must contain:</p>
                <ul className="requirements-list">
                  {passwordValidation.map((req, index) => (
                    <li key={index} className={req.met ? 'requirement-met' : 'requirement-unmet'}>
                      {req.met ? <Check size={14} /> : <X size={14} />}
                      {req.text}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          <EnhancedButton
            type="submit"
            variant="gradient"
            size="lg"
            icon={UserPlus}
            loading={loading}
            disabled={loading || !isPasswordValid}
            className="auth-submit-btn"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </EnhancedButton>
        </form>

        {/* Footer */}
        <div className="auth-footer">
          <p>
            Already have an account? <Link to="/login" className="register-link">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
