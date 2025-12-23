import React, { useState, useEffect } from 'react';
import './Autocomplete.css';

export interface Suggestion {
  id: string;
  label: string;
  kind: 'keyword' | 'variable' | 'function' | 'type' | 'snippet';
  detail?: string;
  documentation?: string;
  sortText?: string;
}

interface AutocompleteProps {
  suggestions: Suggestion[];
  visible: boolean;
  position: { x: number; y: number };
  selectedIndex: number;
  onSelect: (suggestion: Suggestion) => void;
  onHover: (index: number) => void;
  filterText?: string;
}

export function Autocomplete({
  suggestions,
  visible,
  position,
  selectedIndex,
  onSelect,
  onHover,
  filterText = ''
}: AutocompleteProps) {
  const getKindIcon = (kind: string): string => {
    switch (kind) {
      case 'keyword':
        return 'fa-code';
      case 'variable':
        return 'fa-box';
      case 'function':
        return 'fa-function';
      case 'type':
        return 'fa-cube';
      case 'snippet':
        return 'fa-file-code';
      default:
        return 'fa-circle';
    }
  };

  const getKindColor = (kind: string): string => {
    switch (kind) {
      case 'keyword':
        return '#667eea';
      case 'variable':
        return '#f59e0b';
      case 'function':
        return '#10b981';
      case 'type':
        return '#ec4899';
      case 'snippet':
        return '#8b5cf6';
      default:
        return '#a0a0a0';
    }
  };

  const highlightMatch = (text: string, filter: string) => {
    if (!filter) return text;
    
    const regex = new RegExp(`(${filter})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, i) => (
      part.toLowerCase() === filter.toLowerCase()
        ? <strong key={i}>{part}</strong>
        : part
    ));
  };

  if (!visible || suggestions.length === 0) {
    return null;
  }

  return (
    <div
      className="autocomplete-container"
      style={{
        top: `${position.y}px`,
        left: `${position.x}px`
      }}
    >
      <div className="autocomplete-list">
        {suggestions.map((suggestion, index) => (
          <div
            key={suggestion.id}
            className={`autocomplete-item ${index === selectedIndex ? 'selected' : ''}`}
            onMouseEnter={() => onHover(index)}
            onClick={() => onSelect(suggestion)}
          >
            <div className="item-icon" style={{ color: getKindColor(suggestion.kind) }}>
              <i className={`fas ${getKindIcon(suggestion.kind)}`}></i>
            </div>
            <div className="item-content">
              <div className="item-label">
                {highlightMatch(suggestion.label, filterText)}
              </div>
              {suggestion.detail && (
                <div className="item-detail">{suggestion.detail}</div>
              )}
            </div>
            <div className="item-kind">
              <span className={`kind-badge kind-${suggestion.kind}`}>
                {suggestion.kind}
              </span>
            </div>
          </div>
        ))}
      </div>

      {suggestions[selectedIndex]?.documentation && (
        <div className="autocomplete-preview">
          <div className="preview-title">
            <i className="fas fa-file-lines"></i>
            文档
          </div>
          <div className="preview-content">
            {suggestions[selectedIndex].documentation}
          </div>
        </div>
      )}
    </div>
  );
}

// Helper function to generate suggestions from code context
export function generateSuggestions(
  filterText: string,
  context: {
    keywords?: string[];
    variables?: string[];
    functions?: string[];
    types?: string[];
  },
  contextInfo?: { inString: boolean; stringChar: string }
): Suggestion[] {
  const suggestions: Suggestion[] = [];
  const filter = filterText.toLowerCase();
  const isInString = contextInfo?.inString || false;

  // ZhCode keywords (skip if in string)
  const defaultKeywords = [
    '函数', '变量', '如果', '循环', '返回', '中止', '继续',
    '真', '假', '无', '类', '导入', '导出', '接口', '扩展'
  ];

  // Only show keywords if not in a string
  if (!isInString) {
    const keywords = context.keywords || defaultKeywords;
    keywords
      .filter(k => k.toLowerCase().startsWith(filter) || k.includes(filter))
      .forEach((keyword, i) => {
        suggestions.push({
          id: `kw-${i}`,
          label: keyword,
          kind: 'keyword',
          detail: 'ZhCode 关键字',
          sortText: `0-${keyword}`
        });
      });
  }

  // Variables
  const variables = context.variables || ['当前日期', '用户名', '项目名'];
  variables
    .filter(v => !isInString && (v.toLowerCase().startsWith(filter) || v.includes(filter)))
    .forEach((variable, i) => {
      suggestions.push({
        id: `var-${i}`,
        label: variable,
        kind: 'variable',
        detail: '变量',
        sortText: `1-${variable}`
      });
    });

  // Functions (only if not in string)
  if (!isInString) {
    const functions = context.functions || [
      { name: '打印', params: '(文本)' },
      { name: '读入', params: '()' },
      { name: '长度', params: '(数组)' },
      { name: '追加', params: '(数组, 值)' },
    ];
    functions
      .filter(f => f.name.toLowerCase().startsWith(filter) || f.name.includes(filter))
      .forEach((func, i) => {
        suggestions.push({
          id: `func-${i}`,
          label: func.name,
          kind: 'function',
          detail: func.params,
          documentation: `调用 ${func.name}${func.params} 函数`,
          sortText: `2-${func.name}`
        });
      });
  }

  // Types (only if not in string)
  if (!isInString) {
    const types = context.types || ['字符串', '数字', '布尔', '数组', '对象'];
    types
      .filter(t => t.toLowerCase().startsWith(filter) || t.includes(filter))
      .forEach((type, i) => {
        suggestions.push({
          id: `type-${i}`,
          label: type,
          kind: 'type',
          detail: '类型',
          sortText: `3-${type}`
        });
      });
  }

  // Common Chinese string suggestions when in string
  if (isInString && filter) {
    const commonStrings = [
      { text: '你好', meaning: '问候' },
      { text: '谢谢', meaning: '感谢' },
      { text: '没关系', meaning: '回应' },
      { text: '再见', meaning: '告别' },
      { text: '是', meaning: '肯定' },
      { text: '否', meaning: '否定' },
      { text: '成功', meaning: '结果' },
      { text: '失败', meaning: '结果' },
      { text: '错误', meaning: '错误' },
      { text: '警告', meaning: '警告' },
    ];
    
    commonStrings
      .filter(s => s.text.includes(filter) || s.meaning.includes(filter))
      .forEach((str, i) => {
        suggestions.push({
          id: `str-${i}`,
          label: str.text,
          kind: 'snippet',
          detail: `字符串 - ${str.meaning}`,
          sortText: `4-${str.text}`
        });
      });
  }

  // Sort by sortText
  suggestions.sort((a, b) => (a.sortText || '').localeCompare(b.sortText || ''));

  return suggestions;
}
