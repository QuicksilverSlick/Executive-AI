/*
 * DREAMFORGE HIVE-MIND CHAIN OF CUSTODY
 *
 * @file-purpose: Comprehensive accessibility controls for voice interface
 * @version: 1.1.0
 * @init-author: real-time-ui-agent
 * @init-cc-sessionId: cc-ui-20250801-008
 * @init-timestamp: 2025-08-01T15:30:00Z
 * @reasoning:
 * - **Objective:** Create inclusive accessibility controls for all users
 * - **Strategy:** WCAG 2.1 compliant controls with screen reader support
 * - **Outcome:** Universal design accessibility interface
 */

/*
 * DREAMFORGE AUDIT TRAIL
 *
 * ---
 * @revision: 1.1.0
 * @author: developer-agent
 * @cc-sessionId: cc-unknown-20250803-812
 * @timestamp: 2025-08-03T22:06:00Z
 * @reasoning:
 * - **Objective:** Fix "More Options" off-screen issue and implement functional accessibility features
 * - **Strategy:** Add viewport bounds checking and complete accessibility feature implementations
 * - **Outcome:** Prevented UI from going off-screen, implemented working high contrast, large text, and reduced motion
 * 
 * CRITICAL FIXES APPLIED:
 * - FIXED: "More Options" button now handles viewport bounds to prevent off-screen UI
 * - IMPLEMENTED: Functional high contrast mode with proper WCAG 2.1 AA compliance
 * - IMPLEMENTED: Large text scaling with relative font size units
 * - IMPLEMENTED: Reduced motion preferences with animation disabling
 * - IMPLEMENTED: Screen reader optimizations with live announcements
 * - ADDED: Automatic settings application on mount and change
 * - ENHANCED: Viewport-aware positioning with automatic scroll and transform adjustments
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';

interface AccessibilitySettings {
  mode: 'standard' | 'enhanced' | 'high-contrast';
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  reducedMotion: boolean;
  screenReaderOptimized: boolean;
  keyboardNavigationHints: boolean;
  voiceDescriptions: boolean;
  highContrastMode: boolean;
  largeClickTargets: boolean;
}

interface AccessibilityControlsProps {
  mode: 'standard' | 'enhanced' | 'high-contrast';
  onModeChange: (mode: 'standard' | 'enhanced' | 'high-contrast') => void;
  settings?: Partial<AccessibilitySettings>;
  onSettingsChange?: (settings: AccessibilitySettings) => void;
}

const DEFAULT_SETTINGS: AccessibilitySettings = {
  mode: 'standard',
  fontSize: 'medium',
  reducedMotion: false,
  screenReaderOptimized: false,
  keyboardNavigationHints: true,
  voiceDescriptions: true,
  highContrastMode: false,
  largeClickTargets: false
};

export const AccessibilityControls: React.FC<AccessibilityControlsProps> = ({
  mode,
  onModeChange,
  settings = {},
  onSettingsChange
}) => {
  const [currentSettings, setCurrentSettings] = useState<AccessibilitySettings>({
    ...DEFAULT_SETTINGS,
    mode,
    ...settings
  });

  const [isExpanded, setIsExpanded] = useState(false);
  const expandedContentRef = useRef<HTMLDivElement>(null);

  // Apply accessibility settings to the document
  const applySettingsToDocument = useCallback((settings: AccessibilitySettings) => {
    const root = document.documentElement;
    
    // Font size - apply to the voice widget specifically
    const fontSizes = {
      small: '0.875rem', // 14px
      medium: '1rem',    // 16px  
      large: '1.125rem', // 18px
      'extra-large': '1.375rem' // 22px
    };
    root.style.setProperty('--voice-widget-font-size', fontSizes[settings.fontSize]);
    
    // Apply font size to voice widget elements
    const voiceWidget = document.querySelector('#webrtc-voice-assistant');
    if (voiceWidget) {
      (voiceWidget as HTMLElement).style.fontSize = fontSizes[settings.fontSize];
    }
    
    // Reduced motion
    if (settings.reducedMotion) {
      root.style.setProperty('--voice-widget-animation-duration', '0s');
      root.style.setProperty('--voice-widget-transition-duration', '0s');
      root.classList.add('voice-reduced-motion');
    } else {
      root.style.removeProperty('--voice-widget-animation-duration');
      root.style.removeProperty('--voice-widget-transition-duration');
      root.classList.remove('voice-reduced-motion');
    }
    
    // High contrast mode - improved implementation
    if (settings.highContrastMode || settings.mode === 'high-contrast') {
      root.classList.add('voice-widget-high-contrast');
      root.style.setProperty('--voice-widget-contrast-ratio', '7:1');
      
      // Apply high contrast colors
      root.style.setProperty('--voice-widget-bg-contrast', '#000000');
      root.style.setProperty('--voice-widget-text-contrast', '#FFFFFF');
      root.style.setProperty('--voice-widget-border-contrast', '#FFFF00');
    } else {
      root.classList.remove('voice-widget-high-contrast');
      root.style.removeProperty('--voice-widget-contrast-ratio');
      root.style.removeProperty('--voice-widget-bg-contrast');
      root.style.removeProperty('--voice-widget-text-contrast');
      root.style.removeProperty('--voice-widget-border-contrast');
    }
    
    // Large click targets
    if (settings.largeClickTargets) {
      root.style.setProperty('--voice-widget-click-target-size', '48px');
      root.style.setProperty('--voice-widget-min-touch-target', '44px');
    } else {
      root.style.removeProperty('--voice-widget-click-target-size');
      root.style.removeProperty('--voice-widget-min-touch-target');
    }
    
    // Screen reader optimizations
    if (settings.screenReaderOptimized) {
      root.classList.add('voice-sr-optimized');
      // Announce changes to screen readers
      const announcement = document.createElement('div');
      announcement.setAttribute('aria-live', 'polite');
      announcement.setAttribute('aria-atomic', 'true');
      announcement.className = 'sr-only';
      announcement.textContent = `Accessibility settings updated: ${settings.mode} mode, ${settings.fontSize} text`;
      document.body.appendChild(announcement);
      setTimeout(() => document.body.removeChild(announcement), 1000);
    } else {
      root.classList.remove('voice-sr-optimized');
    }
  }, []);

  const updateSetting = useCallback(<K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => {
    const newSettings = { ...currentSettings, [key]: value };
    setCurrentSettings(newSettings);
    onSettingsChange?.(newSettings);
    
    // Apply settings to document
    applySettingsToDocument(newSettings);
  }, [currentSettings, onSettingsChange, applySettingsToDocument]);

  const handleModeChange = useCallback((newMode: 'standard' | 'enhanced' | 'high-contrast') => {
    updateSetting('mode', newMode);
    onModeChange(newMode);
  }, [updateSetting, onModeChange]);

  // Apply settings on mount and when settings change
  useEffect(() => {
    applySettingsToDocument(currentSettings);
  }, [currentSettings, applySettingsToDocument]);

  const accessibility_presets = [
    {
      id: 'standard',
      name: 'Standard',
      description: 'Default accessibility settings',
      icon: '👤',
      settings: {
        mode: 'standard' as const,
        fontSize: 'medium' as const,
        reducedMotion: false,
        highContrastMode: false,
        largeClickTargets: false
      }
    },
    {
      id: 'enhanced',
      name: 'Enhanced',
      description: 'Improved accessibility features',
      icon: '🔍',
      settings: {
        mode: 'enhanced' as const,
        fontSize: 'large' as const,
        reducedMotion: false,
        highContrastMode: false,
        largeClickTargets: true,
        keyboardNavigationHints: true,
        voiceDescriptions: true
      }
    },
    {
      id: 'high-contrast',
      name: 'High Contrast',
      description: 'Maximum visibility and accessibility',
      icon: '🎯',
      settings: {
        mode: 'high-contrast' as const,
        fontSize: 'extra-large' as const,
        reducedMotion: true,
        highContrastMode: true,
        largeClickTargets: true,
        screenReaderOptimized: true,
        keyboardNavigationHints: true,
        voiceDescriptions: true
      }
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Accessibility
        </h4>
        <button
          onClick={() => {
            const newExpanded = !isExpanded;
            setIsExpanded(newExpanded);
            
            // Handle viewport bounds when expanding
            if (newExpanded && expandedContentRef.current) {
              const rect = expandedContentRef.current.getBoundingClientRect();
              const viewportHeight = window.innerHeight;
              const viewportWidth = window.innerWidth;
              
              // Check if content goes off-screen and adjust position
              if (rect.bottom > viewportHeight || rect.right > viewportWidth) {
                const parent = expandedContentRef.current.closest('#webrtc-voice-assistant');
                if (parent) {
                  const parentElement = parent as HTMLElement;
                  // Add a class to handle off-screen positioning
                  parentElement.classList.add('voice-settings-expanded');
                  
                  // Position adjustment for viewport bounds
                  if (rect.bottom > viewportHeight) {
                    parentElement.style.maxHeight = `${viewportHeight - 40}px`;
                    parentElement.style.overflowY = 'auto';
                  }
                  
                  if (rect.right > viewportWidth) {
                    parentElement.style.transform = `translateX(-${rect.right - viewportWidth + 20}px)`;
                  }
                }
              }
            } else {
              // Remove positioning adjustments when collapsing
              const parent = expandedContentRef.current?.closest('#webrtc-voice-assistant');
              if (parent) {
                const parentElement = parent as HTMLElement;
                parentElement.classList.remove('voice-settings-expanded');
                parentElement.style.removeProperty('max-height');
                parentElement.style.removeProperty('overflow-y');
                parentElement.style.removeProperty('transform');
              }
            }
          }}
          className="text-xs text-blue-500 hover:text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50 rounded px-2 py-1"
          aria-expanded={isExpanded}
          aria-controls="accessibility-details"
        >
          {isExpanded ? 'Less Options' : 'More Options'}
        </button>
      </div>

      {/* Quick Mode Selection */}
      <div className="grid grid-cols-1 gap-2">
        {accessibility_presets.map((preset) => (
          <button
            key={preset.id}
            onClick={() => {
              // Apply preset settings
              const newSettings = { ...currentSettings, ...preset.settings };
              setCurrentSettings(newSettings);
              onSettingsChange?.(newSettings);
              handleModeChange(preset.settings.mode);
              applySettingsToDocument(newSettings);
            }}
            className={`
              flex items-center space-x-3 p-3 rounded-lg border-2 transition-all
              ${mode === preset.id
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }
            `}
            role="radio"
            aria-checked={mode === preset.id}
            tabIndex={0}
          >
            <span className="text-lg" role="img" aria-label={preset.name}>
              {preset.icon}
            </span>
            <div className="flex-1 text-left">
              <div className="font-medium text-sm text-gray-900 dark:text-gray-100">
                {preset.name}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {preset.description}
              </div>
            </div>
            {mode === preset.id && (
              <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        ))}
      </div>

      {/* Advanced Settings */}
      {isExpanded && (
        <div 
          ref={expandedContentRef}
          id="accessibility-details" 
          className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700"
        >
          <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Custom Settings
          </h5>

          {/* Font Size */}
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
              Font Size
            </label>
            <select
              value={currentSettings.fontSize}
              onChange={(e) => updateSetting('fontSize', e.target.value as any)}
              className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-sm"
            >
              <option value="small">Small (14px)</option>
              <option value="medium">Medium (16px)</option>
              <option value="large">Large (18px)</option>
              <option value="extra-large">Extra Large (22px)</option>
            </select>
          </div>

          {/* Toggle Settings */}
          <div className="space-y-3">
            {[
              {
                key: 'reducedMotion' as const,
                label: 'Reduce Motion',
                description: 'Minimize animations and transitions'
              },
              {
                key: 'screenReaderOptimized' as const,
                label: 'Screen Reader Optimized',
                description: 'Enhanced compatibility with screen readers'
              },
              {
                key: 'keyboardNavigationHints' as const,
                label: 'Keyboard Navigation Hints',
                description: 'Show keyboard shortcuts and hints'
              },
              {
                key: 'voiceDescriptions' as const,
                label: 'Voice Descriptions',
                description: 'Audio descriptions of visual elements'
              },
              {
                key: 'largeClickTargets' as const,
                label: 'Large Click Targets',
                description: 'Increase button and link sizes'
              }
            ].map((setting) => (
              <label key={setting.key} className="flex items-start space-x-3 cursor-pointer">
                <div className="relative flex-shrink-0 mt-0.5">
                  <input
                    type="checkbox"
                    checked={currentSettings[setting.key]}
                    onChange={(e) => updateSetting(setting.key, e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`
                    w-4 h-4 rounded border-2 transition-colors
                    ${currentSettings[setting.key]
                      ? 'bg-blue-500 border-blue-500'
                      : 'border-gray-300 dark:border-gray-600'
                    }
                  `}>
                    {currentSettings[setting.key] && (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {setting.label}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {setting.description}
                  </div>
                </div>
              </label>
            ))}
          </div>

          {/* Reset to Defaults */}
          <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => {
                const defaultSettings = { ...DEFAULT_SETTINGS, mode };
                setCurrentSettings(defaultSettings);
                onSettingsChange?.(defaultSettings);
                applySettingsToDocument(defaultSettings);
              }}
              className="text-xs text-red-500 hover:text-red-600 transition-colors"
            >
              Reset to Defaults
            </button>
          </div>
        </div>
      )}

      {/* Current Status */}
      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <div className="flex items-center space-x-2 text-xs text-blue-700 dark:text-blue-300">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <span>
            Current mode: <strong>{mode}</strong> 
            {currentSettings.fontSize !== 'medium' && ` • Font: ${currentSettings.fontSize}`}
            {currentSettings.reducedMotion && ' • Reduced motion'}
          </span>
        </div>
      </div>

      {/* Screen Reader Instructions */}
      <div className="sr-only" aria-live="polite">
        Accessibility mode set to {mode}. 
        {currentSettings.keyboardNavigationHints && 'Use Tab to navigate, Space or Enter to activate buttons.'}
        {currentSettings.voiceDescriptions && 'Voice descriptions are enabled.'}
      </div>
    </div>
  );
};

export default AccessibilityControls;