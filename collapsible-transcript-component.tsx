/*
 * DREAMFORGE HIVE-MIND CHAIN OF CUSTODY
 *
 * @file-purpose: Collapsible transcript component with progressive disclosure for mobile
 * @version: 1.0.0
 * @init-author: planner-agent
 * @init-cc-sessionId: cc-plan-20250817-mobile-ui
 * @init-timestamp: 2025-08-17T18:50:00Z
 * @reasoning:
 * - **Objective:** Create space-efficient transcript display with progressive disclosure
 * - **Strategy:** Collapsible panel with smooth animations and touch gestures
 * - **Outcome:** Mobile-optimized transcript with swipe gestures and auto-scroll
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { VoiceMessage } from '../types';

interface CollapsibleTranscriptProps {
  messages: VoiceMessage[];
  isExpanded: boolean;
  onExpandChange: (expanded: boolean) => void;
  isTyping?: boolean;
  showTextInput?: boolean;
  textInput?: string;
  onTextInputChange?: (value: string) => void;
  onTextSend?: () => void;
  isSending?: boolean;
  isConnected?: boolean;
  enableGestures?: boolean;
  maxHeight?: string;
  theme?: 'light' | 'dark' | 'auto';
}

const CollapsibleTranscript: React.FC<CollapsibleTranscriptProps> = ({
  messages,
  isExpanded,
  onExpandChange,
  isTyping = false,
  showTextInput = true,
  textInput = '',
  onTextInputChange,
  onTextSend,
  isSending = false,
  isConnected = true,
  enableGestures = true,
  maxHeight = '50vh',
  theme = 'auto'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ y: number; time: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);

  // Auto-scroll to latest message
  useEffect(() => {
    if (isExpanded && scrollAreaRef.current) {
      const scrollArea = scrollAreaRef.current;
      scrollArea.scrollTo({
        top: scrollArea.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isExpanded]);

  // Gesture handling
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!enableGestures) return;
    
    const touch = e.touches[0];
    dragStartRef.current = {
      y: touch.clientY,
      time: Date.now()
    };
    setIsDragging(true);
  }, [enableGestures]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!enableGestures || !dragStartRef.current || !isDragging) return;
    
    const touch = e.touches[0];
    const deltaY = touch.clientY - dragStartRef.current.y;
    
    // Only allow swiping down when expanded, up when collapsed
    if (isExpanded && deltaY > 0) {
      setDragOffset(Math.min(deltaY, 100));
    } else if (!isExpanded && deltaY < 0) {
      setDragOffset(Math.max(deltaY, -100));
    }
  }, [enableGestures, isDragging, isExpanded]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!enableGestures || !dragStartRef.current) return;
    
    const deltaTime = Date.now() - dragStartRef.current.time;
    const velocity = Math.abs(dragOffset) / deltaTime;
    
    // Determine if gesture should trigger expand/collapse
    const shouldToggle = Math.abs(dragOffset) > 50 || velocity > 0.3;
    
    if (shouldToggle) {
      if (isExpanded && dragOffset > 0) {
        onExpandChange(false);
      } else if (!isExpanded && dragOffset < 0) {
        onExpandChange(true);
      }
    }
    
    // Reset drag state
    setIsDragging(false);
    setDragOffset(0);
    dragStartRef.current = null;
  }, [enableGestures, dragOffset, isExpanded, onExpandChange]);

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Handle text input
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onTextSend?.();
    }
  }, [onTextSend]);

  return (
    <div 
      ref={containerRef}
      className={`
        fixed bottom-0 left-0 right-0 bg-brand-pearl/95 dark:bg-dark-surface/95
        backdrop-blur-xl border-t border-brand-navy/10 dark:border-dark-gold/10
        transition-all duration-300 ease-out z-[1001]
        ${isExpanded ? 'translate-y-0' : 'translate-y-full'}
      `}
      style={{
        marginBottom: '80px', // Account for bottom control bar
        maxHeight: isExpanded ? maxHeight : '0px',
        transform: `translateY(${isExpanded ? dragOffset : 100 + dragOffset}%)`,
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Drag Handle */}
      <div className="flex justify-center py-2">
        <div className="w-12 h-1 bg-brand-charcoal/30 dark:bg-dark-text-muted/30 rounded-full" />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-brand-navy/10 dark:border-dark-gold/10">
        <h3 className="text-sm font-semibold text-brand-charcoal dark:text-dark-text">
          Conversation
        </h3>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-brand-charcoal/70 dark:text-dark-text-secondary">
            {messages.length} message{messages.length !== 1 ? 's' : ''}
          </span>
          <button
            onClick={() => onExpandChange(false)}
            className="p-1 rounded hover:bg-brand-navy/10 dark:hover:bg-dark-gold/10 transition-colors"
            aria-label="Close transcript"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div 
        ref={scrollAreaRef}
        className="flex-1 overflow-y-auto px-4 py-3 space-y-3"
        style={{
          maxHeight: `calc(${maxHeight} - 120px)`, // Account for header and input
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'contain'
        }}
      >
        {messages.length === 0 ? (
          <div className="text-center py-8 text-brand-charcoal/70 dark:text-dark-text-secondary">
            <p className="text-sm">Ready to assist with your learning journey!</p>
            <p className="text-xs mt-2">Start speaking or type a message to begin</p>
          </div>
        ) : (
          <>
            {/* Show only last 10 messages for performance */}
            {messages.slice(-10).map((message) => (
              <div
                key={message.id}
                className={`
                  flex items-start space-x-3 p-3 rounded-2xl transition-all duration-200 animate-slide-in
                  ${message.type === 'user' 
                    ? 'bg-brand-navy/10 ml-8 border-l-2 border-brand-navy dark:bg-dark-gold/10 dark:border-dark-gold' 
                    : 'bg-brand-gold/10 mr-8 border-l-2 border-brand-gold dark:bg-accent-gold/10 dark:border-accent-gold'
                  }
                `}
              >
                <div className={`
                  w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0
                  ${message.type === 'user' ? 'bg-brand-navy dark:bg-dark-gold' : 'bg-brand-gold dark:bg-accent-gold'}
                `}>
                  {message.type === 'user' ? (
                    <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  ) : (
                    <svg className="w-3.5 h-3.5 text-white dark:text-dark-base" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                    </svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-brand-charcoal/80 dark:text-dark-text-secondary">
                      {message.type === 'user' ? 'You' : 'Assistant'}
                    </span>
                    <span className="text-xs text-brand-charcoal/60 dark:text-dark-text-muted">
                      {formatTimestamp(message.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm text-brand-charcoal dark:text-dark-text leading-relaxed break-words">
                    {message.content}
                  </p>
                </div>
              </div>
            ))}
            
            {/* Typing indicator */}
            {isTyping && (
              <div className="flex items-start space-x-3 p-3 rounded-2xl bg-brand-gold/10 mr-8 border-l-2 border-brand-gold dark:bg-accent-gold/10 dark:border-accent-gold">
                <div className="w-7 h-7 rounded-full bg-brand-gold dark:bg-accent-gold flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-white dark:text-dark-base" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <span className="text-xs font-medium text-brand-charcoal/80 dark:text-dark-text-secondary mb-1 block">
                    Assistant
                  </span>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-brand-gold rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-brand-gold rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-brand-gold rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Text Input Area */}
      {showTextInput && (
        <div className="px-4 py-3 border-t border-brand-navy/10 dark:border-dark-gold/10">
          <div className="flex items-center space-x-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={textInput}
                onChange={(e) => onTextInputChange?.(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={
                  isConnected 
                    ? "Type a message..." 
                    : "Disconnected"
                }
                disabled={!isConnected || isSending}
                className="
                  w-full px-4 py-3 bg-brand-pearl/50 dark:bg-dark-surface-2 
                  backdrop-blur-sm border border-brand-navy/20 dark:border-dark-gold/20 
                  rounded-xl text-sm text-brand-charcoal dark:text-dark-text 
                  placeholder-brand-charcoal/50 dark:placeholder-dark-text-muted 
                  focus:outline-none focus:ring-2 focus:ring-brand-gold/50 focus:border-brand-gold/50 
                  disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200
                  min-h-[44px] touch-manipulation
                "
                style={{ fontSize: '16px' }} // Prevent zoom on iOS
                aria-label="Type a message"
              />
              
              {/* Send button */}
              <button
                onClick={onTextSend}
                disabled={!textInput.trim() || !isConnected || isSending}
                className="
                  absolute right-2 top-1/2 transform -translate-y-1/2 
                  p-2 rounded-lg bg-brand-gold hover:bg-brand-gold-warm 
                  disabled:bg-brand-charcoal/40 disabled:cursor-not-allowed 
                  transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-gold/50
                  min-w-[44px] min-h-[44px] touch-manipulation
                "
                aria-label="Send message"
              >
                {isSending ? (
                  <svg className="w-4 h-4 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          
          {/* Helper text */}
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-brand-charcoal/60 dark:text-dark-text-muted">
              {enableGestures ? 'Swipe down to close • ' : ''}Press Enter to send
            </p>
            {isSending && (
              <span className="text-xs text-brand-gold animate-pulse">Sending...</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CollapsibleTranscript;