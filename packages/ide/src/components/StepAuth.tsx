import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './StepAuth.css';

export function StepAuth() {
  const { login, signup, isLoading, error } = useAuth();
  const [step, setStep] = useState(0); // 0: Mode selection, 1: Email, 2: Password, 3: Username, 4: Name (signup only)
  const [mode, setMode] = useState<'login' | 'signup' | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    name: '',
  });
  const [localError, setLocalError] = useState('');

  const handleNext = async () => {
    setLocalError('');

    // Validation for current step
    if (step === 1) {
      // Email validation
      if (!formData.email) {
        setLocalError('Email is required');
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        setLocalError('Please enter a valid email');
        return;
      }
    } else if (step === 2) {
      // Password validation
      if (!formData.password) {
        setLocalError('Password is required');
        return;
      }
      if (formData.password.length < 6) {
        setLocalError('Password must be at least 6 characters');
        return;
      }
    } else if (step === 3 && mode === 'signup') {
      // Username validation
      if (!formData.username) {
        setLocalError('Username is required');
        return;
      }
      if (formData.username.length < 3) {
        setLocalError('Username must be at least 3 characters');
        return;
      }
    }

    // Determine next step
    if (mode === 'login') {
      if (step === 2) {
        // Submit login
        try {
          await login(formData.email, formData.password);
        } catch (err) {
          setLocalError(err instanceof Error ? err.message : 'Login failed');
        }
        return;
      }
    } else if (mode === 'signup') {
      if (step === 4) {
        // Submit signup
        try {
          await signup(formData.email, formData.password, formData.username, formData.name);
        } catch (err) {
          setLocalError(err instanceof Error ? err.message : 'Signup failed');
        }
        return;
      }
    }

    setStep(step + 1);
  };

  const handleBack = () => {
    if (step === 0) return;
    if (step === 1 && mode) {
      setMode(null);
      setStep(0);
    } else {
      setStep(step - 1);
    }
    setLocalError('');
  };

  const handleModeSelect = (selectedMode: 'login' | 'signup') => {
    setMode(selectedMode);
    setStep(1);
    setLocalError('');
  };

  // Step 0: Mode Selection
  if (step === 0) {
    return (
      <div className="step-auth-container">
        <div className="step-auth-bg-shapes">
          <div className="step-auth-shape step-auth-shape-1"></div>
          <div className="step-auth-shape step-auth-shape-2"></div>
          <div className="step-auth-shape step-auth-shape-3"></div>
          <div className="step-auth-shape step-auth-shape-4"></div>
          <div className="step-auth-shape step-auth-shape-5"></div>
        </div>
        <div className="step-auth-card">
          <h1 className="step-auth-title">欢迎来到 ZhCode</h1>
          <p className="step-auth-subtitle">选择一个选项继续</p>
          
          <div className="step-auth-buttons">
            <button
              className="step-auth-btn step-auth-btn-primary"
              onClick={() => handleModeSelect('login')}
            >
              登 录
            </button>
            <button
              className="step-auth-btn step-auth-btn-secondary"
              onClick={() => handleModeSelect('signup')}
            >
              注 册
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Step 1: Email
  if (step === 1) {
    return (
      <div className="step-auth-container">
        <div className="step-auth-bg-shapes">
          <div className="step-auth-shape step-auth-shape-1"></div>
          <div className="step-auth-shape step-auth-shape-2"></div>
          <div className="step-auth-shape step-auth-shape-3"></div>
          <div className="step-auth-shape step-auth-shape-4"></div>
          <div className="step-auth-shape step-auth-shape-5"></div>
        </div>
        <div className="step-auth-card">
          <div className="step-auth-header">
            <button className="step-auth-back-btn" onClick={handleBack}>
              ← 返回
            </button>
            <h2 className="step-auth-step-title">输入您的邮箱</h2>
            <div className="step-auth-progress">
              <span className="step-auth-step-indicator">1 / {mode === 'login' ? '2' : '4'}</span>
            </div>
          </div>

          <input
            type="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="step-auth-input"
            disabled={isLoading}
            onKeyPress={(e) => e.key === 'Enter' && handleNext()}
          />

          {(localError || error) && (
            <p className="step-auth-error">{localError || error}</p>
          )}

          <button
            className="step-auth-btn step-auth-btn-primary step-auth-btn-full"
            onClick={handleNext}
            disabled={isLoading}
          >
            {isLoading ? '加载中...' : '下一步'}
          </button>
        </div>
      </div>
    );
  }

  // Step 2: Password
  if (step === 2) {
    return (
      <div className="step-auth-container">
        <div className="step-auth-bg-shapes">
          <div className="step-auth-shape step-auth-shape-1"></div>
          <div className="step-auth-shape step-auth-shape-2"></div>
          <div className="step-auth-shape step-auth-shape-3"></div>
          <div className="step-auth-shape step-auth-shape-4"></div>
          <div className="step-auth-shape step-auth-shape-5"></div>
        </div>
        <div className="step-auth-card">
          <div className="step-auth-header">
            <button className="step-auth-back-btn" onClick={handleBack}>
              ← 返回
            </button>
            <h2 className="step-auth-step-title">输入您的密码</h2>
            <div className="step-auth-progress">
              <span className="step-auth-step-indicator">2 / {mode === 'login' ? '2' : '4'}</span>
            </div>
          </div>

          <input
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="step-auth-input"
            disabled={isLoading}
            onKeyPress={(e) => e.key === 'Enter' && handleNext()}
          />

          {(localError || error) && (
            <p className="step-auth-error">{localError || error}</p>
          )}

          <button
            className="step-auth-btn step-auth-btn-primary step-auth-btn-full"
            onClick={handleNext}
            disabled={isLoading}
          >
            {isLoading ? '加载中...' : (mode === 'login' ? '登 录' : '下一步')}
          </button>
        </div>
      </div>
    );
  }

  // Step 3: Username (Signup only)
  if (step === 3 && mode === 'signup') {
    return (
      <div className="step-auth-container">
        <div className="step-auth-bg-shapes">
          <div className="step-auth-shape step-auth-shape-1"></div>
          <div className="step-auth-shape step-auth-shape-2"></div>
          <div className="step-auth-shape step-auth-shape-3"></div>
          <div className="step-auth-shape step-auth-shape-4"></div>
          <div className="step-auth-shape step-auth-shape-5"></div>
        </div>
        <div className="step-auth-card">
          <div className="step-auth-header">
            <button className="step-auth-back-btn" onClick={handleBack}>
              ← 返回
            </button>
            <h2 className="step-auth-step-title">选择您的用户名</h2>
            <div className="step-auth-progress">
              <span className="step-auth-step-indicator">3 / 4</span>
            </div>
          </div>

          <input
            type="text"
            placeholder="username"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            className="step-auth-input"
            disabled={isLoading}
            onKeyPress={(e) => e.key === 'Enter' && handleNext()}
          />

          {(localError || error) && (
            <p className="step-auth-error">{localError || error}</p>
          )}

          <button
            className="step-auth-btn step-auth-btn-primary step-auth-btn-full"
            onClick={handleNext}
            disabled={isLoading}
          >
            {isLoading ? '加载中...' : '下一步'}
          </button>
        </div>
      </div>
    );
  }

  // Step 4: Name (Signup only)
  if (step === 4 && mode === 'signup') {
    return (
      <div className="step-auth-container">
        <div className="step-auth-bg-shapes">
          <div className="step-auth-shape step-auth-shape-1"></div>
          <div className="step-auth-shape step-auth-shape-2"></div>
          <div className="step-auth-shape step-auth-shape-3"></div>
          <div className="step-auth-shape step-auth-shape-4"></div>
          <div className="step-auth-shape step-auth-shape-5"></div>
        </div>
        <div className="step-auth-card">
          <div className="step-auth-header">
            <button className="step-auth-back-btn" onClick={handleBack}>
              ← 返回
            </button>
            <h2 className="step-auth-step-title">您叫什么名字?</h2>
            <div className="step-auth-progress">
              <span className="step-auth-step-indicator">4 / 4</span>
            </div>
          </div>

          <input
            type="text"
            placeholder="Full name (optional)"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="step-auth-input"
            disabled={isLoading}
            onKeyPress={(e) => e.key === 'Enter' && handleNext()}
          />

          {(localError || error) && (
            <p className="step-auth-error">{localError || error}</p>
          )}

          <button
            className="step-auth-btn step-auth-btn-primary step-auth-btn-full"
            onClick={handleNext}
            disabled={isLoading}
          >
            {isLoading ? '创建中...' : '创建账户'}
          </button>
        </div>
      </div>
    );
  }

  return null;
}
