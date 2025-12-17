import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

interface SignupProps {
  onSwitchToLogin: () => void;
}

export function Signup({ onSwitchToLogin }: SignupProps) {
  const { signup, isLoading, error, clearError } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    name: '',
    password: '',
    confirmPassword: '',
  });
  const [localError, setLocalError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.email || !formData.username || !formData.password) {
      setLocalError('Please fill in required fields');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setLocalError('Passwords do not match');
      return false;
    }

    if (formData.password.length < 8) {
      setLocalError('Password must be at least 8 characters');
      return false;
    }

    if (formData.username.length < 3) {
      setLocalError('Username must be at least 3 characters');
      return false;
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(formData.username)) {
      setLocalError('Username can only contain letters, numbers, hyphens, and underscores');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    clearError();

    if (!validateForm()) {
      return;
    }

    try {
      await signup(
        formData.email,
        formData.password,
        formData.username,
        formData.name
      );
    } catch (err: any) {
      setLocalError(err.message || 'Signup failed');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>🔐 ZhCode IDE</h1>
        <h2>Create Account</h2>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              disabled={isLoading}
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="username">Username *</label>
            <input
              id="username"
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="your_username"
              disabled={isLoading}
              autoComplete="username"
              required
            />
            <small>3+ characters, letters/numbers only</small>
          </div>

          <div className="form-group">
            <label htmlFor="name">Display Name</label>
            <input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your Name (optional)"
              disabled={isLoading}
              autoComplete="name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password *</label>
            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              disabled={isLoading}
              autoComplete="new-password"
              required
            />
            <small>8+ characters recommended</small>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password *</label>
            <input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              disabled={isLoading}
              autoComplete="new-password"
              required
            />
          </div>

          {(error || localError) && (
            <div className="error-message">
              ❌ {error || localError}
            </div>
          )}

          <button type="submit" disabled={isLoading} className="auth-button">
            {isLoading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Already have an account?</p>
          <button 
            type="button"
            onClick={onSwitchToLogin}
            className="switch-button"
            disabled={isLoading}
          >
            Login here
          </button>
        </div>
      </div>
    </div>
  );
}
