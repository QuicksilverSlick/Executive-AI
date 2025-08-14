/*
 * DREAMFORGE HIVE-MIND CHAIN OF CUSTODY
 *
 * @file-purpose: Audio visualization hook for real-time waveform display
 * @version: 1.0.0
 * @init-author: real-time-ui-agent
 * @init-cc-sessionId: cc-ui-20250801-001
 * @init-timestamp: 2025-08-01T04:26:00Z
 * @reasoning:
 * - **Objective:** Real-time audio visualization with Web Audio API
 * - **Strategy:** Custom hook for canvas-based waveform visualization
 * - **Outcome:** Smooth 60fps audio visualization with customizable styling
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import type {
  AudioVisualizationData,
  UseAudioVisualizationReturn,
  CanvasVisualizationConfig
} from '../types';

// Define AudioContextState locally to avoid import issues
interface AudioContextState {
  context: AudioContext | null;
  analyser: AnalyserNode | null;
  mediaStream: MediaStream | null;
  source: MediaStreamAudioSourceNode | null;
  isInitialized: boolean;
}

const DEFAULT_VISUALIZATION_CONFIG: CanvasVisualizationConfig = {
  width: 320,
  height: 96,
  backgroundColor: 'transparent',
  waveformColor: '#D4A034',
  barWidth: 2,
  barSpacing: 1,
  smoothing: 0.8,
  responsive: true
};

export const useAudioVisualization = (
  canvasRef: React.RefObject<HTMLCanvasElement>,
  isActive: boolean,
  config: Partial<CanvasVisualizationConfig> = {}
): UseAudioVisualizationReturn => {
  const fullConfig = { ...DEFAULT_VISUALIZATION_CONFIG, ...config };
  
  // State
  const [isVisualizing, setIsVisualizing] = useState(false);
  const [audioData, setAudioData] = useState<AudioVisualizationData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Refs
  const audioContextRef = useRef<AudioContextState>({
    context: null,
    analyser: null,
    mediaStream: null,
    source: null,
    isInitialized: false
  });
  const animationIdRef = useRef<number | null>(null);
  const canvasContextRef = useRef<CanvasRenderingContext2D | null>(null);
  const frequencyDataRef = useRef<Uint8Array | null>(null);
  const timeDomainDataRef = useRef<Uint8Array | null>(null);

  // Initialize audio context and analyser
  const initializeAudioContext = useCallback(async () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) {
        throw new Error('Web Audio API not supported');
      }

      const context = new AudioContext();
      const analyser = context.createAnalyser();
      
      // Configure analyser
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = fullConfig.smoothing;
      analyser.minDecibels = -90;
      analyser.maxDecibels = -10;

      const bufferLength = analyser.frequencyBinCount;
      const frequencyData = new Uint8Array(bufferLength);
      const timeDomainData = new Uint8Array(analyser.fftSize);

      audioContextRef.current = {
        context,
        analyser,
        mediaStream: null,
        source: null,
        isInitialized: true
      };

      frequencyDataRef.current = frequencyData;
      timeDomainDataRef.current = timeDomainData;

      console.log('Audio context initialized for visualization');
    } catch (initError) {
      console.error('Failed to initialize audio context:', initError);
      setError('Failed to initialize audio visualization');
    }
  }, [fullConfig.smoothing]);

  // Setup canvas context
  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI displays
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    canvas.width = (fullConfig.responsive ? rect.width : fullConfig.width) * dpr;
    canvas.height = (fullConfig.responsive ? rect.height : fullConfig.height) * dpr;

    ctx.scale(dpr, dpr);
    canvas.style.width = (fullConfig.responsive ? rect.width : fullConfig.width) + 'px';
    canvas.style.height = (fullConfig.responsive ? rect.height : fullConfig.height) + 'px';

    canvasContextRef.current = ctx;
  }, [canvasRef, fullConfig.width, fullConfig.height, fullConfig.responsive]);

  // Connect media stream to analyser
  const connectAudioStream = useCallback(async () => {
    let audioState = audioContextRef.current;
    if (!audioState.context || !audioState.analyser || !audioState.isInitialized) {
      await initializeAudioContext();
      audioState = audioContextRef.current;
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      if (!audioState.context || !audioState.analyser) {
        console.error('Audio context not initialized properly');
        await initializeAudioContext();
        audioState = audioContextRef.current;
      }
      
      if (audioState.context && audioState.analyser) {
        const source = audioState.context.createMediaStreamSource(mediaStream);
        source.connect(audioState.analyser);
        
        audioContextRef.current.mediaStream = mediaStream;
        audioContextRef.current.source = source;
      } else {
        throw new Error('Failed to initialize audio context');
      }

      console.log('Audio stream connected to analyser');
    } catch (streamError) {
      console.error('Failed to connect audio stream:', streamError);
      setError('Failed to access microphone for visualization');
    }
  }, [initializeAudioContext]);

  // Disconnect audio stream
  const disconnectAudioStream = useCallback(() => {
    const audioState = audioContextRef.current;
    
    if (audioState.source) {
      audioState.source.disconnect();
      audioState.source = null;
    }

    if (audioState.mediaStream) {
      audioState.mediaStream.getTracks().forEach(track => track.stop());
      audioState.mediaStream = null;
    }
  }, []);

  // Draw waveform visualization
  const drawVisualization = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvasContextRef.current;
    const analyser = audioContextRef.current.analyser;
    const frequencyData = frequencyDataRef.current;
    const timeDomainData = timeDomainDataRef.current;

    if (!canvas || !ctx || !analyser || !frequencyData || !timeDomainData) {
      return;
    }

    // Get audio data
    analyser.getByteFrequencyData(frequencyData);
    analyser.getByteTimeDomainData(timeDomainData);

    // Calculate volume level
    const volume = frequencyData.reduce((sum, value) => sum + value, 0) / frequencyData.length / 255;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width / (window.devicePixelRatio || 1), canvas.height / (window.devicePixelRatio || 1));

    const canvasWidth = canvas.width / (window.devicePixelRatio || 1);
    const canvasHeight = canvas.height / (window.devicePixelRatio || 1);

    // Draw frequency bars
    const barCount = Math.min(frequencyData.length, Math.floor(canvasWidth / (fullConfig.barWidth + fullConfig.barSpacing)));
    const barWidth = fullConfig.barWidth;
    const barSpacing = fullConfig.barSpacing;

    ctx.fillStyle = fullConfig.waveformColor;

    for (let i = 0; i < barCount; i++) {
      const dataIndex = Math.floor((i / barCount) * frequencyData.length);
      const barHeight = (frequencyData[dataIndex] / 255) * canvasHeight * 0.8;
      const x = i * (barWidth + barSpacing);
      const y = canvasHeight - barHeight;

      // Add gradient effect
      const gradient = ctx.createLinearGradient(0, y, 0, canvasHeight);
      gradient.addColorStop(0, fullConfig.waveformColor);
      gradient.addColorStop(1, fullConfig.waveformColor + '80');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(x, y, barWidth, barHeight);

      // Add glow effect for higher frequencies
      if (barHeight > canvasHeight * 0.5) {
        ctx.shadowBlur = 10;
        ctx.shadowColor = fullConfig.waveformColor;
        ctx.fillRect(x, y, barWidth, barHeight);
        ctx.shadowBlur = 0;
      }
    }

    // Update audio data state
    const currentAudioData: AudioVisualizationData = {
      frequencyData: new Uint8Array(frequencyData),
      timeDomainData: new Uint8Array(timeDomainData),
      volume,
      isActive: true
    };

    setAudioData(currentAudioData);
  }, [canvasRef, fullConfig]);

  // Animation loop
  const startAnimationLoop = useCallback(() => {
    const animate = () => {
      drawVisualization();
      animationIdRef.current = requestAnimationFrame(animate);
    };
    animate();
  }, [drawVisualization]);

  const stopAnimationLoop = useCallback(() => {
    if (animationIdRef.current) {
      cancelAnimationFrame(animationIdRef.current);
      animationIdRef.current = null;
    }
  }, []);

  // Public API
  const startVisualization = useCallback(async () => {
    if (isVisualizing) return;

    try {
      setupCanvas();
      await connectAudioStream();
      startAnimationLoop();
      setIsVisualizing(true);
      setError(null);
    } catch (startError) {
      console.error('Failed to start visualization:', startError);
      setError('Failed to start audio visualization');
    }
  }, [isVisualizing, setupCanvas, connectAudioStream, startAnimationLoop]);

  const stopVisualization = useCallback(() => {
    if (!isVisualizing) return;

    stopAnimationLoop();
    disconnectAudioStream();
    
    // Clear canvas
    const canvas = canvasRef.current;
    const ctx = canvasContextRef.current;
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width / (window.devicePixelRatio || 1), canvas.height / (window.devicePixelRatio || 1));
    }

    setIsVisualizing(false);
    setAudioData(null);
  }, [isVisualizing, stopAnimationLoop, disconnectAudioStream, canvasRef]);

  // Handle active state changes
  useEffect(() => {
    if (isActive && !isVisualizing) {
      startVisualization();
    } else if (!isActive && isVisualizing) {
      stopVisualization();
    }
  }, [isActive, isVisualizing, startVisualization, stopVisualization]);

  // Handle canvas resize
  useEffect(() => {
    if (!fullConfig.responsive) return;

    const handleResize = () => {
      if (isVisualizing) {
        setupCanvas();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isVisualizing, fullConfig.responsive, setupCanvas]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopVisualization();
      
      // Close audio context
      const audioState = audioContextRef.current;
      if (audioState.context && audioState.context.state !== 'closed') {
        audioState.context.close();
      }
    };
  }, [stopVisualization]);

  return {
    startVisualization,
    stopVisualization,
    isVisualizing,
    audioData,
    error
  };
};