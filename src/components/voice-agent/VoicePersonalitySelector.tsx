/*
 * DREAMFORGE HIVE-MIND CHAIN OF CUSTODY
 *
 * @file-purpose: Voice personality selector with preview capabilities
 * @version: 1.0.0
 * @init-author: real-time-ui-agent
 * @init-cc-sessionId: cc-ui-20250801-007
 * @init-timestamp: 2025-08-01T15:25:00Z
 * @reasoning:
 * - **Objective:** Create intuitive voice personality selection interface
 * - **Strategy:** Card-based layout with audio previews and visual feedback
 * - **Outcome:** User-friendly personality selector with accessibility support
 */

import React, { useState, useCallback, useRef } from 'react';
import type { VoicePersonality } from './types';

interface VoicePersonalityConfig {
  id: VoicePersonality;
  name: string;
  description: string;
  icon: string;
  color: string;
  gradient: string;
  sampleText: string;
  characteristics: string[];
}

interface VoicePersonalitySelectorProps {
  currentPersonality: VoicePersonality;
  onPersonalityChange: (personality: VoicePersonality) => void;
  theme?: 'auto' | 'light' | 'dark' | 'rainbow';
  showPreviews?: boolean;
  compact?: boolean;
}

const PERSONALITY_CONFIGS: VoicePersonalityConfig[] = [
  {
    id: 'sage',
    name: 'The Sage',
    description: 'Wise, thoughtful, and measured in speech',
    icon: '🧙‍♂️',
    color: '#6366F1',
    gradient: 'from-indigo-500 to-purple-600',
    sampleText: 'Let me guide you through this learning journey with wisdom and patience.',
    characteristics: ['Thoughtful', 'Patient', 'Wise', 'Calm']
  },
  {
    id: 'mentor',
    name: 'The Mentor',
    description: 'Encouraging, supportive, and educational',
    icon: '👨‍🏫',
    color: '#059669',
    gradient: 'from-emerald-500 to-teal-600',
    sampleText: 'You\'re doing great! Let\'s explore this concept together step by step.',
    characteristics: ['Encouraging', 'Educational', 'Supportive', 'Clear']
  },
  {
    id: 'friend',
    name: 'The Friend',
    description: 'Casual, friendly, and approachable',
    icon: '😊',
    color: '#F59E0B',
    gradient: 'from-amber-500 to-orange-600',
    sampleText: 'Hey there! I\'m here to help you learn in a fun and relaxed way.',
    characteristics: ['Casual', 'Friendly', 'Warm', 'Approachable']
  },
  {
    id: 'expert',
    name: 'The Expert',
    description: 'Professional, precise, and knowledgeable',
    icon: '👩‍💼',
    color: '#DC2626',
    gradient: 'from-red-500 to-pink-600',
    sampleText: 'Based on current research and best practices, here\'s what you need to know.',
    characteristics: ['Professional', 'Precise', 'Authoritative', 'Detailed']
  },
  {
    id: 'enthusiast',
    name: 'The Enthusiast',
    description: 'Energetic, passionate, and inspiring',
    icon: '🚀',
    color: '#8B5CF6',
    gradient: 'from-violet-500 to-purple-600',
    sampleText: 'This is so exciting! Let\'s dive deep into this amazing topic together!',
    characteristics: ['Energetic', 'Passionate', 'Inspiring', 'Dynamic']
  }
];

export const VoicePersonalitySelector: React.FC<VoicePersonalitySelectorProps> = ({
  currentPersonality,
  onPersonalityChange,
  theme = 'auto',
  showPreviews = true,
  compact = false
}) => {
  const [previewingId, setPreviewingId] = useState<VoicePersonality | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext>();
  const currentAudioRef = useRef<HTMLAudioElement>();

  // Play preview audio (simulated with speech synthesis)
  const playPreview = useCallback(async (personality: VoicePersonalityConfig) => {
    if (!showPreviews || !('speechSynthesis' in window)) return;

    try {
      // Stop any currently playing audio
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = undefined;
      }
      
      speechSynthesis.cancel();
      
      setPreviewingId(personality.id);
      setIsPlaying(true);

      const utterance = new SpeechSynthesisUtterance(personality.sampleText);
      
      // Configure voice characteristics based on personality
      switch (personality.id) {
        case 'sage':
          utterance.rate = 0.8;
          utterance.pitch = 0.9;
          utterance.volume = 0.9;
          break;
        case 'mentor':
          utterance.rate = 0.9;
          utterance.pitch = 1.0;
          utterance.volume = 1.0;
          break;
        case 'friend':
          utterance.rate = 1.0;
          utterance.pitch = 1.1;
          utterance.volume = 1.0;
          break;
        case 'expert':
          utterance.rate = 0.95;
          utterance.pitch = 0.95;
          utterance.volume = 0.95;
          break;
        case 'enthusiast':
          utterance.rate = 1.1;
          utterance.pitch = 1.2;
          utterance.volume = 1.0;
          break;
      }

      utterance.onend = () => {
        setPreviewingId(null);
        setIsPlaying(false);
      };

      utterance.onerror = () => {
        setPreviewingId(null);
        setIsPlaying(false);
      };

      speechSynthesis.speak(utterance);
    } catch (error) {
      console.warn('Preview playback failed:', error);
      setPreviewingId(null);
      setIsPlaying(false);
    }
  }, [showPreviews]);

  const stopPreview = useCallback(() => {
    speechSynthesis.cancel();
    setPreviewingId(null);
    setIsPlaying(false);
  }, []);

  const handlePersonalitySelect = useCallback((personality: VoicePersonality) => {
    onPersonalityChange(personality);
  }, [onPersonalityChange]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Voice Personality
        </h4>
        {isPlaying && (
          <button
            onClick={stopPreview}
            className="text-xs text-red-500 hover:text-red-600 transition-colors"
          >
            Stop Preview
          </button>
        )}
      </div>

      <div className={`grid gap-3 ${compact ? 'grid-cols-2' : 'grid-cols-1'}`}>
        {PERSONALITY_CONFIGS.map((personality) => {
          const isSelected = currentPersonality === personality.id;
          const isPreviewing = previewingId === personality.id;

          return (
            <div
              key={personality.id}
              className={`
                relative p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer
                ${isSelected 
                  ? 'border-current bg-gradient-to-r ' + personality.gradient + ' text-white shadow-lg scale-105' 
                  : 'border-gray-200 dark:border-gray-700 bg-white/20 dark:bg-gray-800/20 hover:border-gray-300 dark:hover:border-gray-600'
                }
                ${isPreviewing ? 'animate-pulse ring-2 ring-current' : ''}
              `}
              onClick={() => handlePersonalitySelect(personality.id)}
              role="button"
              tabIndex={0}
              aria-pressed={isSelected}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handlePersonalitySelect(personality.id);
                }
              }}
            >
              {/* Selection indicator */}
              {isSelected && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <svg className="w-4 h-4 text-current" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}

              <div className="flex items-start space-x-3">
                {/* Icon */}
                <div className="text-2xl flex-shrink-0" role="img" aria-label={personality.name}>
                  {personality.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h5 className={`font-semibold text-sm ${isSelected ? 'text-white' : 'text-gray-900 dark:text-gray-100'}`}>
                      {personality.name}
                    </h5>
                    
                    {/* Preview button */}
                    {showPreviews && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isPreviewing) {
                            stopPreview();
                          } else {
                            playPreview(personality);
                          }
                        }}
                        className={`
                          p-1 rounded-full transition-colors text-xs
                          ${isSelected 
                            ? 'hover:bg-white/20 text-white' 
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400'
                          }
                        `}
                        aria-label={isPreviewing ? 'Stop preview' : 'Play preview'}
                        disabled={isPlaying && !isPreviewing}
                      >
                        {isPreviewing ? (
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                    )}
                  </div>

                  <p className={`text-xs mb-2 ${isSelected ? 'text-white/90' : 'text-gray-600 dark:text-gray-400'}`}>
                    {personality.description}
                  </p>

                  {/* Characteristics */}
                  {!compact && (
                    <div className="flex flex-wrap gap-1">
                      {personality.characteristics.map((trait) => (
                        <span
                          key={trait}
                          className={`
                            px-2 py-0.5 rounded-full text-xs font-medium
                            ${isSelected 
                              ? 'bg-white/20 text-white' 
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                            }
                          `}
                        >
                          {trait}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Sample text preview */}
              {!compact && isSelected && (
                <div className="mt-3 pt-3 border-t border-white/20">
                  <p className="text-xs text-white/80 italic">
                    "{personality.sampleText}"
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Additional settings */}
      <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>Voice customization affects response tone and style</span>
          {showPreviews && (
            <span className="flex items-center space-x-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.794L4.168 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.168l4.215-3.794zm5.617 5.11L13.414 10l1.586 1.586a1 1 0 01-1.414 1.414L12 11.414l-1.586 1.586a1 1 0 01-1.414-1.414L10.586 10 9 8.414a1 1 0 011.414-1.414L12 8.586l1.586-1.586a1 1 0 011.414 1.414z" clipRule="evenodd" />
              </svg>
              <span>Click play to preview</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoicePersonalitySelector;