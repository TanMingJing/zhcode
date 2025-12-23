import React, { useState } from 'react';
import './ProblemsPanel.css';

export interface Problem {
  id: string;
  file: string;
  line: number;
  column: number;
  message: string;
  severity: 'error' | 'warning' | 'info';
  code?: string;
}

interface ProblemsPanelProps {
  problems: Problem[];
  onProblemClick?: (problem: Problem) => void;
  onClose?: () => void;
}

export function ProblemsPanel({ problems, onProblemClick, onClose: _onClose }: ProblemsPanelProps) {
  const [filter, setFilter] = useState<'all' | 'error' | 'warning' | 'info'>('all');

  const filteredProblems = problems.filter(p => 
    filter === 'all' || p.severity === filter
  );

  const errorCount = problems.filter(p => p.severity === 'error').length;
  const warningCount = problems.filter(p => p.severity === 'warning').length;
  const infoCount = problems.filter(p => p.severity === 'info').length;

  const getSeverityIcon = (severity: Problem['severity']) => {
    switch (severity) {
      case 'error':
        return <i className="fas fa-circle-xmark" style={{ color: '#ef4444' }}></i>;
      case 'warning':
        return <i className="fas fa-triangle-exclamation" style={{ color: '#f59e0b' }}></i>;
      case 'info':
        return <i className="fas fa-circle-info" style={{ color: '#0ea5e9' }}></i>;
    }
  };

  return (
    <div className="problems-panel">
      {/* Filter Tabs */}
      <div className="problems-filter">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          全部 ({problems.length})
        </button>
        <button
          className={`filter-btn ${filter === 'error' ? 'active' : ''}`}
          onClick={() => setFilter('error')}
        >
          错误 ({errorCount})
        </button>
        <button
          className={`filter-btn ${filter === 'warning' ? 'active' : ''}`}
          onClick={() => setFilter('warning')}
        >
          警告 ({warningCount})
        </button>
        <button
          className={`filter-btn ${filter === 'info' ? 'active' : ''}`}
          onClick={() => setFilter('info')}
        >
          信息 ({infoCount})
        </button>
      </div>

      {/* Problems List */}
      <div className="problems-list">
        {filteredProblems.length === 0 ? (
          <div className="problems-empty">
            <i className="fas fa-check-circle"></i>
            <p>没有问题！</p>
          </div>
        ) : (
          filteredProblems.map(problem => (
            <div
              key={problem.id}
              className={`problem-item severity-${problem.severity}`}
              onClick={() => onProblemClick?.(problem)}
            >
              <div className="problem-icon">
                {getSeverityIcon(problem.severity)}
              </div>
              <div className="problem-content">
                <div className="problem-message">
                  {problem.message}
                  {problem.code && <span className="problem-code">[{problem.code}]</span>}
                </div>
                <div className="problem-location">
                  {problem.file} ({problem.line}:{problem.column})
                </div>
              </div>
              <div className="problem-arrow">
                <i className="fas fa-chevron-right"></i>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
