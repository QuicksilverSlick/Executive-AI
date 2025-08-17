/*
 * DREAMFORGE HIVE-MIND CHAIN OF CUSTODY
 *
 * @file-purpose: Minimized waveform visualizer component for mobile-first design
 * @version: 1.0.0
 * @init-author: planner-agent
 * @init-cc-sessionId: cc-plan-20250817-mobile-ui
 * @init-timestamp: 2025-08-17T18:55:00Z
 * @reasoning:
 * - **Objective:** Create space-efficient visualizer that shows voice activity without consuming vertical space
 * - **Strategy:** Simplified waveform bars with tap-to-expand functionality
 * - **Outcome:** Minimal 24px height visualizer with smooth expand animations
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';

interface MinimizedVisualizerProps {
  isActive: boolean;
  audioLevel: number;
  animationState: 'idle' | 'listening' | 'thinking' | 'speaking';
  isExpanded: boolean;
  onExpandChange: (expanded: boolean) => void;
  theme?: 'light' | 'dark' | 'auto';
  enableTapToExpand?: boolean;
  enableDoubleTap?: boolean;
  accessibilityMode?: 'standard' | 'enhanced' | 'high-contrast';
}

const MinimizedVisualizer: React.FC<MinimizedVisualizerProps> = ({
  isActive,
  audioLevel,
  animationState,
  isExpanded,
  onExpandChange,
  theme = 'auto',
  enableTapToExpand = true,
  enableDoubleTap = true,
  accessibilityMode = 'standard'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const lastTapRef = useRef<number>(0);
  const [tapCount, setTapCount] = useState(0);

  // Generate waveform bars
  const generateWaveformBars = useCallback(() => {
    const bars = [];
    const barCount = isExpanded ? 20 : 8;
    
    for (let i = 0; i < barCount; i++) {
      const height = isActive ? 
        Math.random() * (audioLevel * 100) + 10 : 
        4 + Math.sin(i * 0.5) * 2;
      
      const animationDelay = i * 0.1;
      const barColor = 
        animationState === 'listening' ? '#10B981' :
        animationState === 'thinking' ? '#F59E0B' :
        animationState === 'speaking' ? '#3B82F6' :
        theme === 'dark' ? '#D4A034' : '#0A2240';

      bars.push(
        <div
          key={i}
          className={`
            bg-current rounded-full transition-all duration-300
            ${isActive ? 'animate-pulse' : ''}
            ${isExpanded ? 'w-2' : 'w-1.5'}
          `}
          style={{
            height: `${Math.max(height, 4)}px`,
            maxHeight: isExpanded ? '80px' : '20px',
            animationDelay: `${animationDelay}s`,
            color: barColor,
            animationDuration: isActive ? '1.5s' : '3s'
          }}
        />
      );
    }
    
    return bars;
  }, [isActive, audioLevel, animationState, isExpanded, theme]);

  // Handle tap/click events
  const handleTap = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!enableTapToExpand) return;
    
    e.preventDefault();
    const now = Date.now();
    
    if (enableDoubleTap) {
      // Double tap detection
      if (now - lastTapRef.current < 300) {
        setTapCount(prev => prev + 1);
        if (tapCount >= 1) {
          onExpandChange(!isExpanded);
          setTapCount(0);
        }
      } else {
        setTapCount(1);
      }
      lastTapRef.current = now;
      
      // Reset tap count after timeout
      setTimeout(() => {
        setTapCount(0);
      }, 400);
    } else {
      // Single tap
      onExpandChange(!isExpanded);
    }
  }, [enableTapToExpand, enableDoubleTap, isExpanded, onExpandChange, tapCount]);

  // Canvas-based visualizer for smooth animations
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);
    
    const barCount = isExpanded ? 40 : 16;
    const barWidth = width / barCount * 0.6;
    const barSpacing = width / barCount * 0.4;
    
    for (let i = 0; i < barCount; i++) {
      const x = i * (barWidth + barSpacing);
      const baseHeight = 4;
      const maxHeight = isExpanded ? height * 0.8 : height * 0.6;
      
      let barHeight = baseHeight;
      if (isActive) {
        barHeight = baseHeight + (Math.random() * audioLevel * maxHeight);
      } else {
        barHeight = baseHeight + Math.sin(Date.now() * 0.001 + i * 0.3) * 6;
      }
      
      barHeight = Math.min(barHeight, maxHeight);
      
      const y = (height - barHeight) / 2;
      
      // Color based on state
      let color = theme === 'dark' ? '#D4A034' : '#0A2240';
      if (animationState === 'listening') color = '#10B981';
      else if (animationState === 'thinking') color = '#F59E0B';
      else if (animationState === 'speaking') color = '#3B82F6';
      
      ctx.fillStyle = color;
      ctx.fillRect(x, y, barWidth, barHeight);
    }
  }, [isActive, audioLevel, animationState, isExpanded, theme]);

  // Animation loop
  useEffect(() => {
    if (isActive || animationState !== 'idle') {
      const animate = () => {
        drawCanvas();
        animationFrameRef.current = requestAnimationFrame(animate);
      };
      animate();
    } else {
      drawCanvas();
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isActive, animationState, drawCanvas]);

  const containerHeight = isExpanded ? '128px' : '24px';
  const containerClasses = `
    relative rounded-xl overflow-hidden transition-all duration-500 ease-out cursor-pointer
    ${isExpanded ? 'bg-brand-navy/10 dark:bg-dark-gold/10 p-4' : 'bg-brand-navy/5 dark:bg-dark-gold/5 px-3 py-1'}
    ${enableTapToExpand ? 'hover:bg-brand-navy/15 dark:hover:bg-dark-gold/15' : ''}
    ${accessibilityMode === 'high-contrast' ? 'border-2 border-current' : 'border border-brand-navy/20 dark:border-dark-gold/20'}
    focus:outline-none focus:ring-2 focus:ring-brand-gold/50
  `;

  return (
    <div
      ref={containerRef}
      className={containerClasses}
      style={{ height: containerHeight }}
      onClick={handleTap}
      onTouchEnd={handleTap}
      role="button"
      tabIndex={enableTapToExpand ? 0 : -1}
      aria-label={
        isExpanded ? 
        'Waveform visualizer - tap to minimize' : 
        enableDoubleTap ? 
        'Waveform visualizer - double tap to expand' :
        'Waveform visualizer - tap to expand'
      }
      aria-expanded={isExpanded}
    >
      {/* Canvas visualizer */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        width={isExpanded ? 400 : 200}
        height={isExpanded ? 96 : 16}
        style={{ imageRendering: 'pixelated' }}
      />
      
      {/* Fallback bars for older browsers */}
      <div className={`
        flex items-center justify-center h-full space-x-1
        ${canvasRef.current ? 'hidden' : 'flex'}
      `}>
        {generateWaveformBars()}
      </div>
      
      {/* Expand indicator */}
      {enableTapToExpand && !isExpanded && (
        <div className="absolute top-1 right-1">
          <div className="w-2 h-2 bg-brand-gold/60 rounded-full animate-pulse" />
        </div>
      )}
      
      {/* State indicator */}
      <div className={`
        absolute top-2 left-2 flex items-center space-x-1
        ${isExpanded ? 'opacity-100' : 'opacity-0'}
        transition-opacity duration-300
      `}>
        <div className={`w-2 h-2 rounded-full ${
          animationState === 'listening' ? 'bg-green-500 animate-pulse' :
          animationState === 'thinking' ? 'bg-yellow-500 animate-bounce' :
          animationState === 'speaking' ? 'bg-blue-500 animate-pulse' :
          'bg-gray-400'
        }`} />
        <span className="text-xs font-medium text-brand-charcoal dark:text-dark-text capitalize">
          {animationState}
        </span>
      </div>
      
      {/* Double tap hint */}
      {enableDoubleTap && tapCount === 1 && !isExpanded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-brand-navy/90 dark:bg-dark-gold/90 text-white text-xs px-2 py-1 rounded-full animate-fade-in">
            Tap again to expand
          </div>
        </div>
      )}
      
      {/* Audio level indicator (when expanded) */}
      {isExpanded && isActive && (
        <div className="absolute bottom-2 right-2 flex items-center space-x-1">
          <span className="text-xs text-brand-charcoal/70 dark:text-dark-text-secondary">
            {Math.round(audioLevel * 100)}%
          </span>
          <div className="w-8 h-1 bg-brand-navy/20 dark:bg-dark-gold/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-brand-gold transition-all duration-100"
              style={{ width: `${audioLevel * 100}%` }}
            />
          </div>
        </div>
      )}
      
      {/* Accessibility enhancement */}
      <div className="sr-only" aria-live="polite">
        Voice visualizer is {animationState}. 
        Audio level: {Math.round(audioLevel * 100)}%.
        {enableTapToExpand && (enableDoubleTap ? 'Double tap' : 'Tap')} to {isExpanded ? 'minimize' : 'expand'}.
      </div>
    </div>
  );
};

export default MinimizedVisualizer;