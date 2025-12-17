import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './ProfilePage.css';

interface ProfileEdits {
  name: string;
  bio: string;
  theme: string;
  language: string;
}

export function ProfilePage({ onClose }: { onClose: () => void }) {
  const { user, updateProfile, isLoading } = useAuth();
  const [edits, setEdits] = useState<ProfileEdits>({
    name: (user?.name as string) || '',
    bio: (user?.bio as string) || '',
    theme: (user?.theme as string) || 'dark',
    language: (user?.language as string) || 'en',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setMessage('');
      await updateProfile({
        name: edits.name,
        bio: edits.bio,
        theme: edits.theme,
        language: edits.language,
      });
      setMessage('✅ 资料更新成功!');
      setTimeout(() => onClose(), 1500);
    } catch (error) {
      setMessage(`❌ 更新资料失败: ${String(error)}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="profile-overlay" onClick={onClose}>
      <div className="profile-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
            <i className="fas fa-user" style={{ color: 'var(--primary)', fontSize: '18px' }}></i>
            <h2>我的资料</h2>
          </div>
          <button className="btn-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="modal-body profile-content">
          {/* Avatar Section */}
          <div className="profile-avatar-section">
            <img src={user.avatar as string} alt="Avatar" className="profile-avatar" />
            <div className="avatar-info">
              <p className="avatar-username">@{user.username as string}</p>
              <p className="avatar-email">{user.email as string}</p>
              {user.isVerified && (
                <span className="verified-badge">
                  <i className="fas fa-check-circle"></i> 已验证
                </span>
              )}
              {user.isPremium && (
                <span className="premium-badge">
                  <i className="fas fa-star"></i> 高级
                </span>
              )}
            </div>
          </div>

          {/* Account Stats */}
          <div className="profile-stats">
            <div className="stat">
              <span className="stat-label">注册于</span>
              <span className="stat-value">
                {new Date(user.createdAt as string | number).toLocaleDateString()}
              </span>
            </div>
            <div className="stat">
              <span className="stat-label">最后更新</span>
              <span className="stat-value">
                {new Date(user.updatedAt as string | number).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Editable Fields */}
          <div className="profile-form">
            <div className="form-group">
              <label>全名</label>
              <input
                type="text"
                value={edits.name}
                onChange={(e) => setEdits({ ...edits, name: e.target.value })}
                placeholder="输入您的全名"
                disabled={isSaving || isLoading}
              />
            </div>

            <div className="form-group">
              <label>个人简介</label>
              <textarea
                value={edits.bio}
                onChange={(e) => setEdits({ ...edits, bio: e.target.value })}
                placeholder="告诉我们您的一些信息..."
                maxLength={200}
                disabled={isSaving || isLoading}
                rows={3}
              />
              <span className="char-count">
                {edits.bio.length}/200
              </span>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>主题</label>
                <select
                  value={edits.theme}
                  onChange={(e) => setEdits({ ...edits, theme: e.target.value })}
                  disabled={isSaving || isLoading}
                >
                  <option value="dark">🌙 深色</option>
                  <option value="light">☀️ 浅色</option>
                  <option value="auto">🔄 自动</option>
                </select>
              </div>

              <div className="form-group">
                <label>语言</label>
                <select
                  value={edits.language}
                  onChange={(e) => setEdits({ ...edits, language: e.target.value })}
                  disabled={isSaving || isLoading}
                >
                  <option value="en">🇬🇧 英文</option>
                  <option value="zh">🇨🇳 中文</option>
                </select>
              </div>
            </div>
          </div>

          {/* Message */}
          {message && (
            <div className={`profile-message ${message.includes('✅') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button
            className="btn-cancel"
            onClick={onClose}
            disabled={isSaving || isLoading}
          >
            取消
          </button>
          <button
            className="btn-save"
            onClick={handleSave}
            disabled={isSaving || isLoading}
          >
            {isSaving ? '保存中...' : '保存更改'}
          </button>
        </div>
      </div>
    </div>
  );
}
