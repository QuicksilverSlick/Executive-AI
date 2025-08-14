/*
 * DREAMFORGE HIVE-MIND CHAIN OF CUSTODY
 *
 * @file-purpose: Advanced waveform visualizer with 60fps performance and accessibility support
 * @version: 1.0.0
 * @init-author: real-time-ui-agent
 * @init-cc-sessionId: cc-ui-20250801-006
 * @init-timestamp: 2025-08-01T15:20:00Z
 * @reasoning:
 * - **Objective:** Create professional audio waveform visualization component
 * - **Strategy:** Canvas-based rendering with smooth animations and theme support
 * - **Outcome:** 60fps audio visualization with accessibility features
 */

import React, { useRef, useEffect, useCallback, useState } from 'react';

interface WaveformVisualizerProps {
  isActive: boolean;
  animationState: 'idle' | 'listening' | 'thinking' | 'speaking';
  theme?: 'auto' | 'light' | 'dark' | 'rainbow';
  accessibilityMode?: 'standard' | 'enhanced' | 'high-contrast';
  width?: number;
  height?: number;
  barCount?: number;
  sensitivity?: number;
  smoothing?: number;
  audioLevel?: number;
}

export const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({
  isActive,
  animationState,
  theme = 'auto',
  accessibilityMode = 'standard',
  width = 384,
  height = 128,
  barCount = 64,
  sensitivity = 1.0,
  smoothing = 0.8,
  audioLevel = 0
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const audioContextRef = useRef<AudioContext>();
  const analyserRef = useRef<AnalyserNode>();
  const dataArrayRef = useRef<Uint8Array>();
  const smoothedDataRef = useRef<number[]>(new Array(barCount).fill(0));
  
  const [isInitialized, setIsInitialized] = useState(false);
  const [averageVolume, setAverageVolume] = useState(0);

  // Color schemes based on theme and state
  const getColors = useCallback(() => {
    if (accessibilityMode === 'high-contrast') {
      return {
        primary: '#FFFF00', // High contrast yellow
        secondary: '#000000',
        gradient: ['#FFFF00', '#FFFFFF']
      };
    }

    const colorSchemes = {
      idle: {
        primary: '#6B7280', // Gray
        secondary: '#9CA3AF',
        gradient: ['#6B7280', '#9CA3AF']
      },
      listening: {
        primary: '#3B82F6', // Blue
        secondary: '#60A5FA',
        gradient: ['#3B82F6', '#60A5FA', '#93C5FD']
      },
      thinking: {
        primary: '#F59E0B', // Amber
        secondary: '#FBBF24',
        gradient: ['#F59E0B', '#FBBF24', '#FCD34D']
      },
      speaking: {
        primary: '#10B981', // Emerald
        secondary: '#34D399',
        gradient: ['#10B981', '#34D399', '#6EE7B7']
      }
    };

    if (theme === 'rainbow') {
      return {
        primary: '#FF6B6B',
        secondary: '#4ECDC4',
        gradient: ['#FF6B6B', '#FFE66D', '#4ECDC4', '#45B7D1']
      };
    }

    return colorSchemes[animationState] || colorSchemes.idle;
  }, [theme, animationState, accessibilityMode]);

  // Initialize audio context and analyser
  const initializeAudio = useCallback(async () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      if (!analyserRef.current) {
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 256;
        analyserRef.current.smoothingTimeConstant = smoothing;
        
        dataArrayRef.current = new Uint8Array(analyserRef.current.frequencyBinCount);
      }

      // Connect to microphone if active
      if (isActive && navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: { 
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          } 
        });
        
        const source = audioContextRef.current.createMediaStreamSource(stream);
        source.connect(analyserRef.current);
        
        setIsInitialized(true);
      }
    } catch (error) {
      console.warn('Failed to initialize audio:', error);
      // Continue with mock data for demo purposes
      setIsInitialized(true);
    }
  }, [isActive, smoothing]);

  // Generate mock audio data for demo
  const generateMockData = useCallback(() => {
    if (!dataArrayRef.current) return;
    
    const time = Date.now() * 0.001;
    const baseAmplitude = animationState === 'idle' ? 20 : 
                         animationState === 'listening' ? 80 :
                         animationState === 'thinking' ? 60 :
                         animationState === 'speaking' ? 120 : 40;

    for (let i = 0; i < dataArrayRef.current.length; i++) {
      const frequency = i / dataArrayRef.current.length;
      const amplitude = baseAmplitude * (1 + Math.sin(time * 2 + i * 0.1) * 0.5) * 
                       Math.exp(-frequency * 2) * sensitivity;
      dataArrayRef.current[i] = Math.min(255, Math.max(0, amplitude + Math.random() * 20));
    }
  }, [animationState, sensitivity]);

  // Main render loop
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size with device pixel ratio
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const canvasWidth = rect.width;
    const canvasHeight = rect.height;

    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Get audio data
    if (analyserRef.current && dataArrayRef.current) {
      if (isActive) {
        analyserRef.current.getByteFrequencyData(dataArrayRef.current);
      } else {
        generateMockData();
      }
    } else {
      generateMockData();
    }

    if (!dataArrayRef.current) return;

    // Calculate average volume
    const volume = Array.from(dataArrayRef.current).reduce((sum, val) => sum + val, 0) / dataArrayRef.current.length / 255;
    setAverageVolume(volume);

    const colors = getColors();
    const barWidth = canvasWidth / barCount;
    const barSpacing = barWidth * 0.1;
    const actualBarWidth = barWidth - barSpacing;

    // Create gradient
    const gradient = ctx.createLinearGradient(0, canvasHeight, 0, 0);
    colors.gradient.forEach((color, index) => {
      gradient.addColorStop(index / (colors.gradient.length - 1), color);
    });

    // Draw bars with smoothing
    for (let i = 0; i < barCount; i++) {
      const dataIndex = Math.floor((i / barCount) * dataArrayRef.current.length);
      const rawValue = dataArrayRef.current[dataIndex] / 255;
      
      // Apply smoothing
      const targetValue = rawValue * (canvasHeight * 0.8);
      smoothedDataRef.current[i] += (targetValue - smoothedDataRef.current[i]) * 0.3;
      
      const barHeight = Math.max(2, smoothedDataRef.current[i]);
      const x = i * barWidth + barSpacing / 2;
      const y = canvasHeight - barHeight;

      // Set fill style
      if (accessibilityMode === 'high-contrast') {
        ctx.fillStyle = colors.primary;
      } else {
        ctx.fillStyle = gradient;
      }

      // Draw bar with rounded corners
      ctx.beginPath();
      ctx.roundRect(x, y, actualBarWidth, barHeight, 2);
      ctx.fill();

      // Add glow effect for high frequencies
      if (barHeight > canvasHeight * 0.6 && accessibilityMode !== 'high-contrast') {
        ctx.shadowColor = colors.primary;
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    // Draw center line for reference
    if (animationState === 'idle' && accessibilityMode !== 'high-contrast') {
      ctx.setLineDash([5, 5]);
      ctx.strokeStyle = colors.secondary + '40';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, canvasHeight / 2);
      ctx.lineTo(canvasWidth, canvasHeight / 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Continue animation
    if (isActive || animationState !== 'idle') {
      animationFrameRef.current = requestAnimationFrame(render);
    }
  }, [isActive, animationState, barCount, getColors, generateMockData, accessibilityMode]);

  // Initialize and start rendering
  useEffect(() => {
    if (isActive) {
      initializeAudio();
    }
  }, [isActive, initializeAudio]);

  useEffect(() => {
    if (isInitialized) {
      render();
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isInitialized, render]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        aria-hidden="true"
        style={{ imageRendering: 'crisp-edges' }}
      />

      {/* Accessibility overlay */}
      {accessibilityMode === 'enhanced' && (
        <div className="absolute top-2 left-2 text-xs bg-black/50 text-white px-2 py-1 rounded">
          {animationState === 'idle' && 'Ready'}
          {animationState === 'listening' && `Listening (${Math.round(averageVolume * 100)}%)`}
          {animationState === 'thinking' && 'Processing...'}
          {animationState === 'speaking' && 'Speaking'}
        </div>
      )}

      {/* Volume indicator for screen readers */}
      <div 
        className="sr-only" 
        aria-live="polite" 
        aria-label={`Voice activity: ${Math.round(averageVolume * 100)}%`}
      >
        {animationState} - Volume: {Math.round(averageVolume * 100)}%
      </div>
    </div>
  );
};

export default WaveformVisualizer;