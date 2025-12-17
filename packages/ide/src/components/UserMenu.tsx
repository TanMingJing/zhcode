import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './UserMenu.css';

export function UserMenu() {
  const { user, logout, isLoading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isLogoutLoading, setIsLogoutLoading] = useState(false);

  if (!user) {
    return null;
  }

  const handleLogout = async () => {
    try {
      setIsLogoutLoading(true);
      await logout();
      setIsOpen(false);
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLogoutLoading(false);
    }
  };

  return (
    <>
      <div className="user-menu">
        <button 
          className="user-button"
          onClick={() => setIsOpen(!isOpen)}
          disabled={isLoading}
          title={user.name || user.username}
        >
          <img 
            src={user.avatar} 
            alt={user.username}
            className="user-avatar"
          />
          <span className="user-name">{user.name || user.username}</span>
        </button>

        {isOpen && (
          <div className="user-dropdown">
            <div className="user-info">
              <img 
                src={user.avatar} 
                alt={user.username}
                className="dropdown-avatar"
              />
              <div className="user-details">
                <div className="user-display-name">{user.name || user.username}</div>
                <div className="user-email">{user.email}</div>
                {user.isPremium && (
                <div className="premium-badge">⭐ 高级会员</div>
                )}
              </div>
            </div>

            <div className="user-actions">
              <a href="#" className="action-link" onClick={(e) => {
                e.preventDefault();
                setIsOpen(false);
              }}>
                ⚙️ 设置
              </a>
            </div>

            <div className="user-footer">
              <button 
                className="logout-button"
                onClick={handleLogout}
                disabled={isLogoutLoading}
              >
                {isLogoutLoading ? '⏳ 登出中...' : '🚪 登出'}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
