/*
 * DREAMFORGE HIVE-MIND CHAIN OF CUSTODY
 *
 * @file-purpose: Voice transcript component with accessibility features
 * @version: 1.0.0
 * @init-author: real-time-ui-agent
 * @init-cc-sessionId: cc-ui-20250801-001
 * @init-timestamp: 2025-08-01T04:26:00Z
 * @reasoning:
 * - **Objective:** Accessible transcript display with smooth animations
 * - **Strategy:** WCAG compliant component with keyboard navigation
 * - **Outcome:** Professional transcript UI with full accessibility support
 */

import React, { useEffect, useRef, useCallback } from 'react';
import { VoiceMessage, VoiceTranscriptProps } from './types';

const VoiceTranscript: React.FC<VoiceTranscriptProps> = ({
  messages,
  maxMessages = 20,
  showTimestamps = true,
  showMetadata = false,
  onMessageClick
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const lastMessageRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'nearest' 
      });
    }
  }, [messages]);

  // Format timestamp for display
  const formatTimestamp = useCallback((timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }, []);

  // Format confidence percentage
  const formatConfidence = useCallback((confidence?: number) => {
    if (confidence === undefined) return '';
    return `${Math.round(confidence * 100)}%`;
  }, []);

  // Get icon for message type
  const getMessageIcon = useCallback((type: VoiceMessage['type']) => {
    switch (type) {
      case 'user':
        return (
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
        );
      case 'assistant':
        return (
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
            <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
          </svg>
        );
      case 'system':
        return (
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
      default:
        return null;
    }
  }, []);

  // Get styling classes for message type
  const getMessageClasses = useCallback((type: VoiceMessage['type']) => {
    switch (type) {
      case 'user':
        return {
          avatar: 'bg-accent-sky',
          bubble: 'bg-gray-100 dark:bg-dark-surface-3',
          text: 'text-gray-900 dark:text-dark-text'
        };
      case 'assistant':
        return {
          avatar: 'bg-accent-gold',
          bubble: 'bg-gradient-to-r from-accent-gold/10 to-brand-gold-warm/10 border border-accent-gold/20',
          text: 'text-gray-900 dark:text-dark-text'
        };
      case 'system':
        return {
          avatar: 'bg-gray-500 dark:bg-dark-text-muted',
          bubble: 'bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-dark-border',
          text: 'text-gray-700 dark:text-dark-text-secondary'
        };
      default:
        return {
          avatar: 'bg-gray-400',
          bubble: 'bg-gray-100 dark:bg-dark-surface-3',
          text: 'text-gray-900 dark:text-dark-text'
        };
    }
  }, []);

  // Handle message click
  const handleMessageClick = useCallback((message: VoiceMessage) => {
    onMessageClick?.(message);
  }, [onMessageClick]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((event: React.KeyboardEvent, message: VoiceMessage) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleMessageClick(message);
    }
  }, [handleMessageClick]);

  // Limit messages displayed
  const displayMessages = messages.slice(-maxMessages);

  if (displayMessages.length === 0) {
    return (
      <div 
        className="flex items-center justify-center h-32 text-gray-500 dark:text-dark-text-muted"
        role="status"
        aria-label="No messages in transcript"
      >
        <div className="text-center">
          <svg className="w-8 h-8 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <p className="text-sm">No conversation yet</p>
          <p className="text-xs mt-1">Start talking to see messages here</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="voice-transcript max-h-48 overflow-y-auto scroll-smooth"
      role="log"
      aria-label="Voice conversation transcript"
      aria-live="polite"
      aria-atomic="false"
    >
      <div className="space-y-3 p-1">
        {displayMessages.map((message, index) => {
          const isLast = index === displayMessages.length - 1;
          const classes = getMessageClasses(message.type);
          
          return (
            <div 
              key={message.id}
              ref={isLast ? lastMessageRef : undefined}
              className={`voice-message transform transition-all duration-300 ease-out ${
                onMessageClick ? 'cursor-pointer hover:scale-[1.01] focus-within:scale-[1.01]' : ''
              }`}
              role={onMessageClick ? 'button' : 'article'}
              tabIndex={onMessageClick ? 0 : undefined}
              onClick={() => handleMessageClick(message)}
              onKeyDown={(e) => handleKeyDown(e, message)}
              aria-label={`${message.type} message: ${message.content}`}
            >
              <div className="flex items-start space-x-3">
                {/* Avatar */}
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${classes.avatar}`}
                  aria-hidden="true"
                >
                  {getMessageIcon(message.type)}
                </div>

                {/* Message Content */}
                <div className="flex-1 min-w-0">
                  {/* Message Bubble */}
                  <div className={`text-sm rounded-lg px-3 py-2 ${classes.bubble} ${classes.text}`}>
                    <p className="break-words">{message.content}</p>
                    
                    {/* Metadata */}
                    {showMetadata && message.metadata && (
                      <div className="mt-2 text-xs opacity-75 space-y-1">
                        {message.metadata.confidence !== undefined && (
                          <div className="flex items-center space-x-2">
                            <span>Confidence:</span>
                            <div className="flex-1 bg-gray-200 dark:bg-dark-surface-4 rounded-full h-1.5">
                              <div 
                                className="bg-accent-gold h-1.5 rounded-full transition-all duration-300"
                                style={{ width: `${(message.metadata.confidence || 0) * 100}%` }}
                              />
                            </div>
                            <span>{formatConfidence(message.metadata.confidence)}</span>
                          </div>
                        )}
                        {message.metadata.duration && (
                          <div>Duration: {message.metadata.duration}ms</div>
                        )}
                        {message.metadata.isInterim && (
                          <div className="text-semantic-warning">Interim result</div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Timestamp */}
                  {showTimestamps && (
                    <span 
                      className="text-xs text-gray-500 dark:text-dark-text-muted mt-1 block"
                      aria-label={`Sent at ${formatTimestamp(message.timestamp)}`}
                    >
                      {formatTimestamp(message.timestamp)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Scroll indicator for long conversations */}
      {messages.length > maxMessages && (
        <div className="sticky bottom-0 bg-gradient-to-t from-white dark:from-dark-surface-2 to-transparent pt-4 mt-2">
          <div className="text-center">
            <span className="text-xs text-gray-500 dark:text-dark-text-muted bg-white dark:bg-dark-surface-2 px-2 py-1 rounded-full">
              Showing last {maxMessages} of {messages.length} messages
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceTranscript;