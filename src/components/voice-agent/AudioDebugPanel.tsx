/*
 * DREAMFORGE HIVE-MIND CHAIN OF CUSTODY
 *
 * @file-purpose: Audio debug panel for testing voice agent audio feedback system
 * @version: 1.0.0
 * @init-author: real-time-ui-agent
 * @init-cc-sessionId: cc-unknown-20250808-354
 * @init-timestamp: 2025-08-08T16:45:00Z
 * @reasoning:
 * - **Objective:** Comprehensive testing interface for audio feedback system
 * - **Strategy:** Interactive controls with state visualization and performance metrics
 * - **Outcome:** Professional debugging tool for audio system development
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AudioState } from './VoiceAgentAudioFeedback';

interface AudioDebugPanelProps {
  audioState: AudioState;
  onAudioStateChange: (newState: Partial<AudioState>) => void;
  onPlayTestSound?: (soundType: 'start' | 'processing' | 'complete' | 'error') => void;
  className?: string;
}

interface PerformanceMetrics {
  animationFrames: number;
  renderTime: number;
  memoryUsage: number;
  audioLatency: number;
  stateChanges: number;
}

interface StateTransition {
  from: string;
  to: string;
  timestamp: number;
  duration?: number;
}

export const AudioDebugPanel: React.FC<AudioDebugPanelProps> = ({
  audioState,
  onAudioStateChange,
  onPlayTestSound,
  className = '',
}) => {
  // Debug state
  const [isExpanded, setIsExpanded] = useState(false);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics>({
    animationFrames: 0,
    renderTime: 0,
    memoryUsage: 0,
    audioLatency: 0,
    stateChanges: 0,
  });
  const [stateHistory, setStateHistory] = useState<StateTransition[]>([]);
  const [isRecordingMetrics, setIsRecordingMetrics] = useState(false);
  const [customAudioLevel, setCustomAudioLevel] = useState(audioState.audioLevel);

  // Refs for performance tracking
  const animationFrameRef = useRef<number>();
  const renderStartTime = useRef<number>(0);
  const stateChangeCount = useRef<number>(0);
  const lastStateRef = useRef<string>('idle');

  // Get current state name
  const getCurrentStateName = useCallback((): string => {
    if (audioState.error) return 'error';
    if (audioState.isResponding) return 'responding';
    if (audioState.isProcessing) return 'processing';
    if (audioState.isListening) return 'listening';
    return 'idle';
  }, [audioState]);

  // Track state transitions
  useEffect(() => {
    const currentState = getCurrentStateName();
    const lastState = lastStateRef.current;
    
    if (currentState !== lastState) {
      const now = Date.now();
      
      // Complete previous transition if exists
      setStateHistory(prev => {
        const updated = [...prev];
        if (updated.length > 0 && !updated[updated.length - 1].duration) {
          updated[updated.length - 1].duration = now - updated[updated.length - 1].timestamp;
        }
        
        // Add new transition
        updated.push({
          from: lastState,
          to: currentState,
          timestamp: now,
        });
        
        // Keep only last 10 transitions
        return updated.slice(-10);
      });
      
      lastStateRef.current = currentState;
      stateChangeCount.current += 1;
    }
  }, [getCurrentStateName]);

  // Performance monitoring
  useEffect(() => {
    if (!isRecordingMetrics) return;

    const updateMetrics = () => {
      renderStartTime.current = performance.now();
      
      setPerformanceMetrics(prev => ({
        ...prev,
        animationFrames: prev.animationFrames + 1,
        renderTime: performance.now() - renderStartTime.current,
        memoryUsage: (performance as any).memory?.usedJSHeapSize || 0,
        stateChanges: stateChangeCount.current,
      }));

      if (isRecordingMetrics) {
        animationFrameRef.current = requestAnimationFrame(updateMetrics);
      }
    };

    animationFrameRef.current = requestAnimationFrame(updateMetrics);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isRecordingMetrics]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const handleStateChange = (newState: Partial<AudioState>) => {
    onAudioStateChange(newState);
  };

  const handlePlayTestSound = (soundType: 'start' | 'processing' | 'complete' | 'error') => {
    if (onPlayTestSound) {
      onPlayTestSound(soundType);
    }
  };

  const toggleMetricsRecording = () => {
    setIsRecordingMetrics(prev => !prev);
    if (!isRecordingMetrics) {
      // Reset metrics when starting
      setPerformanceMetrics({
        animationFrames: 0,
        renderTime: 0,
        memoryUsage: 0,
        audioLatency: 0,
        stateChanges: 0,
      });
      stateChangeCount.current = 0;
    }
  };

  const clearStateHistory = () => {
    setStateHistory([]);
    stateChangeCount.current = 0;
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatDuration = (duration?: number): string => {
    if (!duration) return 'ongoing';
    return `${duration}ms`;
  };

  const getStateColor = (state: string): string => {
    switch (state) {
      case 'listening': return '#1976d2';
      case 'processing': return '#f57c00';
      case 'responding': return '#2e7d32';
      case 'error': return '#d32f2f';
      default: return '#757575';
    }
  };

  return (
    <div className={`audio-debug-panel ${isExpanded ? 'expanded' : 'collapsed'} ${className}`}>
      {/* Header */}
      <div className="debug-header">
        <button
          className="expand-toggle"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-label={isExpanded ? 'Collapse debug panel' : 'Expand debug panel'}
          aria-expanded={isExpanded}
        >
          <span className="toggle-icon" aria-hidden="true">
            {isExpanded ? '▼' : '▶'}
          </span>
          <span className="title">Audio Debug Panel</span>
        </button>
        
        <div className="current-state">
          <span 
            className="state-indicator"
            style={{ backgroundColor: getStateColor(getCurrentStateName()) }}
            aria-hidden="true"
          />
          <span className="state-text">{getCurrentStateName()}</span>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="debug-content">
          
          {/* State Controls */}
          <section className="debug-section">
            <h3>State Controls</h3>
            <div className="control-grid">
              <button
                className={`state-btn ${audioState.isListening ? 'active' : ''}`}
                onClick={() => handleStateChange({ 
                  isListening: !audioState.isListening,
                  isProcessing: false,
                  isResponding: false,
                  error: null 
                })}
              >
                🎤 Listening
              </button>

              <button
                className={`state-btn ${audioState.isProcessing ? 'active' : ''}`}
                onClick={() => handleStateChange({ 
                  isListening: false,
                  isProcessing: !audioState.isProcessing,
                  isResponding: false,
                  error: null 
                })}
              >
                ⚙️ Processing
              </button>

              <button
                className={`state-btn ${audioState.isResponding ? 'active' : ''}`}
                onClick={() => handleStateChange({ 
                  isListening: false,
                  isProcessing: false,
                  isResponding: !audioState.isResponding,
                  error: null 
                })}
              >
                🗣️ Responding
              </button>

              <button
                className={`state-btn ${audioState.error ? 'active error' : ''}`}
                onClick={() => handleStateChange({ 
                  isListening: false,
                  isProcessing: false,
                  isResponding: false,
                  error: audioState.error ? null : 'Test error message' 
                })}
              >
                ⚠️ Error
              </button>

              <button
                className="state-btn"
                onClick={() => handleStateChange({ 
                  isListening: false,
                  isProcessing: false,
                  isResponding: false,
                  error: null 
                })}
              >
                ⏸️ Reset to Idle
              </button>
            </div>
          </section>

          {/* Audio Level Control */}
          <section className="debug-section">
            <h3>Audio Level</h3>
            <div className="audio-level-control">
              <label htmlFor="audio-level-slider">
                Level: {Math.round(customAudioLevel * 100)}%
              </label>
              <input
                id="audio-level-slider"
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={customAudioLevel}
                onChange={(e) => {
                  const newLevel = parseFloat(e.target.value);
                  setCustomAudioLevel(newLevel);
                  handleStateChange({ audioLevel: newLevel });
                }}
                className="level-slider"
              />
              <div 
                className="level-visual"
                style={{ width: `${customAudioLevel * 100}%` }}
              />
            </div>
          </section>

          {/* Test Audio Cues */}
          {onPlayTestSound && (
            <section className="debug-section">
              <h3>Test Audio Cues</h3>
              <div className="test-audio-grid">
                <button
                  className="test-audio-btn start"
                  onClick={() => handlePlayTestSound('start')}
                >
                  🎵 Start Sound
                </button>
                <button
                  className="test-audio-btn processing"
                  onClick={() => handlePlayTestSound('processing')}
                >
                  🔄 Processing Loop
                </button>
                <button
                  className="test-audio-btn complete"
                  onClick={() => handlePlayTestSound('complete')}
                >
                  ✅ Complete Sound
                </button>
                <button
                  className="test-audio-btn error"
                  onClick={() => handlePlayTestSound('error')}
                >
                  ❌ Error Sound
                </button>
              </div>
            </section>
          )}

          {/* State Machine Visualization */}
          <section className="debug-section">
            <h3>State History</h3>
            <div className="state-history-controls">
              <button
                className={`metrics-toggle ${isRecordingMetrics ? 'recording' : ''}`}
                onClick={toggleMetricsRecording}
              >
                {isRecordingMetrics ? '⏹️ Stop Recording' : '▶️ Start Recording'}
              </button>
              <button className="clear-history" onClick={clearStateHistory}>
                🗑️ Clear History
              </button>
            </div>
            
            <div className="state-transitions">
              {stateHistory.length === 0 ? (
                <div className="no-history">No state transitions recorded</div>
              ) : (
                stateHistory.map((transition, index) => (
                  <div key={index} className="transition-item">
                    <div className="transition-arrow">
                      <span 
                        className="from-state"
                        style={{ color: getStateColor(transition.from) }}
                      >
                        {transition.from}
                      </span>
                      <span className="arrow" aria-hidden="true">→</span>
                      <span 
                        className="to-state"
                        style={{ color: getStateColor(transition.to) }}
                      >
                        {transition.to}
                      </span>
                    </div>
                    <div className="transition-meta">
                      <span className="timestamp">
                        {new Date(transition.timestamp).toLocaleTimeString()}
                      </span>
                      <span className="duration">
                        {formatDuration(transition.duration)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Performance Metrics */}
          <section className="debug-section">
            <h3>Performance Metrics</h3>
            <div className="metrics-grid">
              <div className="metric-item">
                <span className="metric-label">Animation Frames</span>
                <span className="metric-value">{performanceMetrics.animationFrames}</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Render Time</span>
                <span className="metric-value">{performanceMetrics.renderTime.toFixed(2)}ms</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Memory Usage</span>
                <span className="metric-value">{formatBytes(performanceMetrics.memoryUsage)}</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">State Changes</span>
                <span className="metric-value">{performanceMetrics.stateChanges}</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Audio Latency</span>
                <span className="metric-value">{performanceMetrics.audioLatency}ms</span>
              </div>
            </div>
          </section>

          {/* Current State Details */}
          <section className="debug-section">
            <h3>Current State Details</h3>
            <div className="state-details">
              <pre>{JSON.stringify(audioState, null, 2)}</pre>
            </div>
          </section>

        </div>
      )}
    </div>
  );
};

export default AudioDebugPanel;