import React, { useEffect, useRef, useState, useCallback } from 'react';
import './CodeMinimap.css';

interface CodeMinimapProps {
  code: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  editorRef: React.RefObject<any>;
  isVisible: boolean;
}

interface ViewportInfo {
  top: number;      // Y position of viewport in canvas (px)
  height: number;   // Height of viewport in canvas (px)
  percentage: number; // Scroll percentage (0-100)
}

export function CodeMinimap({ code, isVisible }: CodeMinimapProps): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewport, setViewport] = useState<ViewportInfo>({ top: 0, height: 50, percentage: 0 });
  const [isDragging, setIsDragging] = useState(false);

  // Get textarea and calculate viewport position
  const getTextareaMetrics = useCallback(() => {
    const textarea = document.querySelector('.code-editor') as HTMLTextAreaElement;
    if (!textarea) return null;

    return {
      scrollTop: textarea.scrollTop,
      scrollHeight: textarea.scrollHeight,
      clientHeight: textarea.clientHeight,
    };
  }, []);

  // Draw minimap on canvas
  const drawMinimap = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const lines = code.split('\n');
    const charsPerLine = 40; // How many chars to show per line
    const lineHeight = 3; // Pixel height of each line
    const charWidth = 1.5; // Pixel width of each char

    // Clear canvas
    ctx.fillStyle = '#16213e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw code as tiny text
    ctx.font = '1px monospace';
    ctx.fillStyle = '#888';
    
    let y = 1;
    lines.forEach((line) => {
      if (y > canvas.height) return;

      // Determine line color based on content
      let color = '#555';
      
      if (line.trim().length === 0) {
        y += lineHeight;
        return;
      }

      // Smart color detection
      if (line.includes('{') || line.includes('}')) {
        color = '#667eea';
      } else if (line.includes('//') || line.includes('/*')) {
        color = '#666';
      } else if (line.includes('"') || line.includes("'") || line.includes('`')) {
        color = '#10b981';
      } else if (/^\s*(function|const|let|var|class|if|for|while|返回|函数|令)/.test(line)) {
        color = '#667eea';
      } else if (line.includes('=')) {
        color = '#61dafb';
      } else {
        color = '#aaa';
      }

      ctx.fillStyle = color;

      // Draw a condensed version of the line
      const displayLine = line.trim().substring(0, charsPerLine);
      let x = 2;

      for (let i = 0; i < displayLine.length; i++) {
        const char = displayLine[i];
        
        // Skip spaces to make it more compact
        if (char === ' ') {
          x += charWidth * 0.5;
          continue;
        }

        // Draw tiny character blocks
        ctx.fillRect(x, y, Math.max(0.5, charWidth), 1.5);
        x += charWidth;

        if (x > canvas.width - 2) break;
      }

      y += lineHeight;
    });
  }, [code]);

  // Calculate and update viewport position
  const updateViewport = useCallback(() => {
    const canvas = canvasRef.current;
    const metrics = getTextareaMetrics();
    if (!canvas || !metrics) return;

    const { scrollTop, scrollHeight, clientHeight } = metrics;
    const maxScroll = scrollHeight - clientHeight;
    
    // Calculate percentage scrolled
    const scrollPercent = maxScroll > 0 ? scrollTop / maxScroll : 0;
    
    // Calculate viewport size relative to canvas
    const viewportRatio = clientHeight / scrollHeight;
    const viewportHeightPx = Math.max(20, canvas.height * viewportRatio);
    
    // Calculate viewport top position
    const maxViewportTop = canvas.height - viewportHeightPx;
    const viewportTopPx = scrollPercent * maxViewportTop;

    setViewport({
      top: viewportTopPx,
      height: viewportHeightPx,
      percentage: scrollPercent * 100,
    });
  }, [getTextareaMetrics]);

  // Listen to textarea scroll events
  useEffect(() => {
    const textarea = document.querySelector('.code-editor') as HTMLTextAreaElement;
    if (!textarea) return;

    const handleScroll = () => {
      updateViewport();
    };

    textarea.addEventListener('scroll', handleScroll, { passive: true });
    
    // Initial update
    updateViewport();

    return () => {
      textarea.removeEventListener('scroll', handleScroll);
    };
  }, [updateViewport, isVisible]);

  // Initial draw
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        drawMinimap();
        updateViewport();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [code, isVisible, drawMinimap, updateViewport]);

  // Handle minimap click to jump to position
  const handleMinimapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickY = e.clientY - rect.top;
    const clickPercentage = Math.max(0, Math.min(1, clickY / canvas.height));

    scrollToPosition(clickPercentage);
  };

  // Scroll editor to a specific percentage
  const scrollToPosition = (percentage: number) => {
    const textarea = document.querySelector('.code-editor') as HTMLTextAreaElement;
    if (!textarea) return;

    const totalHeight = textarea.scrollHeight;
    const viewportHeight = textarea.clientHeight;
    const maxScroll = totalHeight - viewportHeight;
    const targetScroll = percentage * maxScroll;

    textarea.scrollTop = targetScroll;

    // Also scroll the line numbers to match
    const lineNumbers = document.querySelector('.line-numbers') as HTMLElement;
    if (lineNumbers) {
      lineNumbers.scrollTop = targetScroll;
    }
  };

  // Handle slider drag
  const handleSliderMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  // Handle mouse move during drag
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const mouseY = e.clientY - rect.top;
      const percentage = Math.max(0, Math.min(1, mouseY / canvas.height));

      scrollToPosition(percentage);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  if (!isVisible) return <></>;

  return (
    <div ref={containerRef} className="code-minimap-container">
      <div className="minimap-header">
        <span className="minimap-title">
          <i className="fas fa-map"></i> PREVIEW
        </span>
        <span className="minimap-percent">{viewport.percentage.toFixed(0)}%</span>
      </div>
      <div 
        className="minimap-canvas-wrapper"
        onClick={handleMinimapClick}
      >
        <canvas
          ref={canvasRef}
          className="minimap-canvas"
          width={150}
          height={300}
          title="Click to jump to position"
        />
        {/* Viewport slider */}
        <div
          className={`minimap-slider ${isDragging ? 'dragging' : ''}`}
          style={{
            top: `${viewport.top}px`,
            height: `${viewport.height}px`,
          }}
          onMouseDown={handleSliderMouseDown}
          title="Drag to scroll"
        >
          <div className="slider-grip"></div>
        </div>
      </div>
      <div className="minimap-footer">
        <span className="minimap-lines">{code.split('\n').length} lines</span>
      </div>
    </div>
  );
}
