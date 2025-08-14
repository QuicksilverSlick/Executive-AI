/*
 * DREAMFORGE HIVE-MIND CHAIN OF CUSTODY
 *
 * @file-purpose: Real-time audio visualization component with customizable waveforms
 * @version: 1.0.0
 * @init-author: real-time-ui-agent
 * @init-cc-sessionId: cc-ui-20250801-001
 * @init-timestamp: 2025-08-01T04:26:00Z
 * @reasoning:
 * - **Objective:** Professional audio visualization with multiple display modes
 * - **Strategy:** Canvas-based rendering with smooth animations and customization
 * - **Outcome:** Responsive audio visualization supporting different themes and styles
 */

import React, { useEffect, useRef, useCallback, useState } from 'react';
import { VoiceVisualizationProps, AudioVisualizationData, CanvasVisualizationConfig } from './types';

type VisualizationMode = 'bars' | 'wave' | 'circular' | 'particles';

interface ExtendedVisualizationProps extends VoiceVisualizationProps {
  mode?: VisualizationMode;
  color?: string;
  responsive?: boolean;
  showVolume?: boolean;
  theme?: 'light' | 'dark';
}

const VoiceVisualization: React.FC<ExtendedVisualizationProps> = ({
  canvasRef,
  audioData,
  config = {},
  isActive,
  mode = 'bars',
  color,
  responsive = true,
  showVolume = false,
  theme = 'dark'
}) => {
  const animationRef = useRef<number | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 320, height: 96 });
  const [currentVolume, setCurrentVolume] = useState(0);

  // Default configuration
  const defaultConfig: CanvasVisualizationConfig = {
    width: 320,
    height: 96,
    backgroundColor: 'transparent',
    waveformColor: color || (theme === 'light' ? '#D4A034' : '#D4A034'),
    barWidth: 2,
    barSpacing: 1,
    smoothing: 0.8,
    responsive
  };

  const fullConfig = { ...defaultConfig, ...config };

  // Update canvas size on resize
  useEffect(() => {
    if (!responsive || !canvasRef.current) return;

    const updateSize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      setCanvasSize({ width: rect.width, height: rect.height });
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [responsive, canvasRef]);

  // Setup canvas with high DPI support
  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const dpr = window.devicePixelRatio || 1;
    const { width, height } = canvasSize;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';

    ctx.scale(dpr, dpr);
    ctx.imageSmoothingEnabled = true;

    return { ctx, width, height };
  }, [canvasRef, canvasSize]);

  // Draw frequency bars visualization
  const drawBars = useCallback((ctx: CanvasRenderingContext2D, data: AudioVisualizationData, width: number, height: number) => {
    const frequencyData = data.frequencyData;
    const barCount = Math.min(frequencyData.length, Math.floor(width / (fullConfig.barWidth + fullConfig.barSpacing)));
    
    ctx.fillStyle = fullConfig.waveformColor;

    for (let i = 0; i < barCount; i++) {
      const dataIndex = Math.floor((i / barCount) * frequencyData.length);
      const barHeight = (frequencyData[dataIndex] / 255) * height * 0.8;
      const x = i * (fullConfig.barWidth + fullConfig.barSpacing);
      const y = height - barHeight;

      // Create gradient
      const gradient = ctx.createLinearGradient(0, y, 0, height);
      gradient.addColorStop(0, fullConfig.waveformColor);
      gradient.addColorStop(1, fullConfig.waveformColor + '40');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(x, y, fullConfig.barWidth, barHeight);

      // Add glow for high frequencies
      if (barHeight > height * 0.6) {
        ctx.shadowBlur = 5;
        ctx.shadowColor = fullConfig.waveformColor;
        ctx.fillRect(x, y, fullConfig.barWidth, barHeight);
        ctx.shadowBlur = 0;
      }
    }
  }, [fullConfig]);

  // Draw waveform visualization
  const drawWave = useCallback((ctx: CanvasRenderingContext2D, data: AudioVisualizationData, width: number, height: number) => {
    const timeDomainData = data.timeDomainData;
    const sliceWidth = width / timeDomainData.length;

    ctx.lineWidth = 2;
    ctx.strokeStyle = fullConfig.waveformColor;
    ctx.beginPath();

    let x = 0;
    for (let i = 0; i < timeDomainData.length; i++) {
      const v = timeDomainData[i] / 128.0;
      const y = (v * height) / 2;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    ctx.stroke();

    // Add glow effect
    ctx.shadowBlur = 10;
    ctx.shadowColor = fullConfig.waveformColor;
    ctx.stroke();
    ctx.shadowBlur = 0;
  }, [fullConfig]);

  // Draw circular visualization
  const drawCircular = useCallback((ctx: CanvasRenderingContext2D, data: AudioVisualizationData, width: number, height: number) => {
    const frequencyData = data.frequencyData;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 4;
    const barCount = 64;

    ctx.lineWidth = 2;
    ctx.strokeStyle = fullConfig.waveformColor;

    for (let i = 0; i < barCount; i++) {
      const dataIndex = Math.floor((i / barCount) * frequencyData.length);
      const barHeight = (frequencyData[dataIndex] / 255) * radius;
      const angle = (i / barCount) * Math.PI * 2;

      const x1 = centerX + Math.cos(angle) * radius;
      const y1 = centerY + Math.sin(angle) * radius;
      const x2 = centerX + Math.cos(angle) * (radius + barHeight);
      const y2 = centerY + Math.sin(angle) * (radius + barHeight);

      // Create gradient for each bar
      const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
      gradient.addColorStop(0, fullConfig.waveformColor + '40');
      gradient.addColorStop(1, fullConfig.waveformColor);
      
      ctx.strokeStyle = gradient;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    // Draw center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.3, 0, Math.PI * 2);
    ctx.strokeStyle = fullConfig.waveformColor + '60';
    ctx.stroke();
  }, [fullConfig]);

  // Draw particle system visualization
  const drawParticles = useCallback((ctx: CanvasRenderingContext2D, data: AudioVisualizationData, width: number, height: number) => {
    const frequencyData = data.frequencyData;
    const particleCount = 50;

    ctx.fillStyle = fullConfig.waveformColor;

    for (let i = 0; i < particleCount; i++) {
      const dataIndex = Math.floor((i / particleCount) * frequencyData.length);
      const intensity = frequencyData[dataIndex] / 255;
      
      if (intensity > 0.1) {
        const x = (i / particleCount) * width;
        const y = height / 2 + (Math.sin(Date.now() * 0.01 + i) * intensity * height * 0.3);
        const size = intensity * 4;

        ctx.globalAlpha = intensity;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.globalAlpha = 1;
  }, [fullConfig]);

  // Main render function
  const render = useCallback(() => {
    const canvasSetup = setupCanvas();
    if (!canvasSetup || !audioData) return;

    const { ctx, width, height } = canvasSetup;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Update volume
    setCurrentVolume(audioData.volume);

    // Draw based on mode
    switch (mode) {
      case 'bars':
        drawBars(ctx, audioData, width, height);
        break;
      case 'wave':
        drawWave(ctx, audioData, width, height);
        break;
      case 'circular':
        drawCircular(ctx, audioData, width, height);
        break;
      case 'particles':
        drawParticles(ctx, audioData, width, height);
        break;
    }

    // Continue animation if active
    if (isActive) {
      animationRef.current = requestAnimationFrame(render);
    }
  }, [setupCanvas, audioData, isActive, mode, drawBars, drawWave, drawCircular, drawParticles]);

  // Handle active state changes
  useEffect(() => {
    if (isActive && audioData) {
      render();
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      
      // Clear canvas when not active
      const canvasSetup = setupCanvas();
      if (canvasSetup) {
        canvasSetup.ctx.clearRect(0, 0, canvasSetup.width, canvasSetup.height);
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [isActive, audioData, render, setupCanvas]);

  // Idle animation when not active
  useEffect(() => {
    if (!isActive) {
      const drawIdleAnimation = () => {
        const canvasSetup = setupCanvas();
        if (!canvasSetup) return;

        const { ctx, width, height } = canvasSetup;
        ctx.clearRect(0, 0, width, height);

        // Draw pulsing dots
        const time = Date.now() * 0.003;
        ctx.fillStyle = fullConfig.waveformColor + '40';

        for (let i = 0; i < 3; i++) {
          const x = width / 2 + (i - 1) * 20;
          const y = height / 2;
          const size = 3 + Math.sin(time + i * 0.5) * 2;
          
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fill();
        }

        animationRef.current = requestAnimationFrame(drawIdleAnimation);
      };

      drawIdleAnimation();
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [isActive, fullConfig.waveformColor, setupCanvas]);

  return (
    <div className="relative w-full h-full">
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        width={canvasSize.width}
        height={canvasSize.height}
        aria-hidden="true"
      />

      {/* Volume indicator */}
      {showVolume && currentVolume > 0 && (
        <div className="absolute top-2 right-2 bg-black/50 rounded px-2 py-1 text-xs text-white">
          Volume: {Math.round(currentVolume * 100)}%
        </div>
      )}

      {/* Status overlay */}
      {!isActive && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center text-gray-500 dark:text-dark-text-muted">
            <div className="text-sm font-medium mb-1">
              {mode === 'bars' && 'Frequency Bars'}
              {mode === 'wave' && 'Waveform'}
              {mode === 'circular' && 'Circular'}
              {mode === 'particles' && 'Particles'}
            </div>
            <div className="text-xs opacity-75">
              Click to start visualization
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceVisualization;