import React, { useState, useEffect } from 'react';
import './RecentProjects.css';

export interface RecentProject {
  id: string;
  name: string;
  path?: string;
  language?: string;
  lastOpened: number;
  thumbnail?: string;
}

interface RecentProjectsProps {
  projects: RecentProject[];
  onSelect: (project: RecentProject) => void;
  onDelete: (projectId: string) => void;
  onClose?: () => void;
}

export function RecentProjects({
  projects,
  onSelect,
  onDelete,
  onClose
}: RecentProjectsProps) {
  const [sortedProjects, setSortedProjects] = useState<RecentProject[]>([]);

  useEffect(() => {
    const sorted = [...projects].sort((a, b) => b.lastOpened - a.lastOpened);
    setSortedProjects(sorted);
  }, [projects]);

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - timestamp;

    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)} 天前`;

    return date.toLocaleDateString('zh-CN');
  };

  const getLanguageColor = (lang?: string): string => {
    switch (lang?.toLowerCase()) {
      case 'zhcode':
        return '#667eea';
      case 'javascript':
        return '#f7df1e';
      case 'typescript':
        return '#3178c6';
      case 'python':
        return '#3776ab';
      case 'java':
        return '#ed8936';
      default:
        return '#a0a0a0';
    }
  };

  const getLanguageIcon = (lang?: string): string => {
    switch (lang?.toLowerCase()) {
      case 'zhcode':
        return 'fa-chinese-y';
      case 'javascript':
        return 'fa-js';
      case 'typescript':
        return 'fa-square';
      case 'python':
        return 'fa-python';
      case 'java':
        return 'fa-java';
      default:
        return 'fa-file-code';
    }
  };

  return (
    <div className="recent-projects">
      {/* Header */}
      <div className="recent-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <i className="fas fa-clock"></i>
          <h2>最近项目</h2>
        </div>
        {onClose && (
          <button className="recent-close-btn" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        )}
      </div>

      {/* Content */}
      <div className="recent-content">
        {sortedProjects.length === 0 ? (
          <div className="recent-empty">
            <i className="fas fa-inbox"></i>
            <p>暂无最近项目</p>
            <span>创建或打开一个项目来开始</span>
          </div>
        ) : (
          <div className="recent-grid">
            {sortedProjects.map((project) => (
              <div
                key={project.id}
                className="project-card"
                onClick={() => onSelect(project)}
              >
                {/* Card Header */}
                <div className="card-header">
                  {project.thumbnail ? (
                    <img src={project.thumbnail} alt={project.name} className="card-thumbnail" />
                  ) : (
                    <div className="card-placeholder">
                      <i className="fas fa-folder-open"></i>
                    </div>
                  )}
                  <button
                    className="card-delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(project.id);
                    }}
                    title="删除"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>

                {/* Card Body */}
                <div className="card-body">
                  <h3 className="card-title">{project.name}</h3>
                  {project.path && <p className="card-path">{project.path}</p>}
                  
                  <div className="card-meta">
                    {project.language && (
                      <span
                        className="card-lang"
                        style={{ borderColor: getLanguageColor(project.language) }}
                      >
                        <i
                          className={`fas ${getLanguageIcon(project.language)}`}
                          style={{ color: getLanguageColor(project.language) }}
                        ></i>
                        {project.language}
                      </span>
                    )}
                    <span className="card-time">
                      <i className="fas fa-calendar"></i>
                      {formatDate(project.lastOpened)}
                    </span>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="card-footer">
                  <span className="card-action">
                    打开
                    <i className="fas fa-arrow-right"></i>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Hook to manage recent projects
 */
export function useRecentProjects() {
  const [projects, setProjects] = useState<RecentProject[]>(() => {
    const stored = localStorage.getItem('zhcode_recent_projects');
    return stored ? JSON.parse(stored) : [];
  });

  const addRecentProject = (project: RecentProject) => {
    setProjects((prev) => {
      // Remove if already exists
      const filtered = prev.filter((p) => p.id !== project.id);
      // Add to top with updated timestamp
      const updated = [
        { ...project, lastOpened: Date.now() },
        ...filtered
      ].slice(0, 15); // Keep only last 15 projects
      
      localStorage.setItem('zhcode_recent_projects', JSON.stringify(updated));
      return updated;
    });
  };

  const removeRecentProject = (projectId: string) => {
    setProjects((prev) => {
      const updated = prev.filter((p) => p.id !== projectId);
      localStorage.setItem('zhcode_recent_projects', JSON.stringify(updated));
      return updated;
    });
  };

  const clearRecentProjects = () => {
    setProjects([]);
    localStorage.removeItem('zhcode_recent_projects');
  };

  return {
    projects,
    addRecentProject,
    removeRecentProject,
    clearRecentProjects
  };
}
