/*
 * DREAMFORGE HIVE-MIND CHAIN OF CUSTODY
 *
 * @file-purpose: Advanced conversation interface with search, export, and navigation
 * @version: 1.0.0
 * @init-author: real-time-ui-agent
 * @init-cc-sessionId: cc-ui-20250801-009
 * @init-timestamp: 2025-08-01T15:35:00Z
 * @reasoning:
 * - **Objective:** Create feature-rich conversation interface for voice interactions
 * - **Strategy:** Timeline-based layout with search, export, and accessibility features
 * - **Outcome:** Professional conversation management interface
 */

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import type { VoiceMessage } from './types';

interface ConversationInterfaceProps {
  messages: VoiceMessage[];
  isTyping?: boolean;
  onMessageSearch?: (query: string) => void;
  onExportConversation?: (format: 'txt' | 'json' | 'pdf') => void;
  onMessageSelect?: (messageId: string) => void;
  showTimestamps?: boolean;
  showSpeakerAvatars?: boolean;
  enableSearch?: boolean;
  enableExport?: boolean;
  maxDisplayedMessages?: number;
  theme?: 'light' | 'dark' | 'auto';
}

interface SearchResult {
  messageId: string;
  content: string;
  timestamp: string;
  type: 'user' | 'assistant';
  matchIndices: [number, number][];
}

export const ConversationInterface: React.FC<ConversationInterfaceProps> = ({
  messages,
  isTyping = false,
  onMessageSearch,
  onExportConversation,
  onMessageSelect,
  showTimestamps = true,
  showSpeakerAvatars = true,
  enableSearch = true,
  enableExport = true,
  maxDisplayedMessages = 100,
  theme = 'auto'
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [currentSearchIndex, setCurrentSearchIndex] = useState(0);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesContainerRef.current && !searchQuery) {
      const container = messagesContainerRef.current;
      container.scrollTop = container.scrollHeight;
    }
  }, [messages.length, searchQuery]);

  // Handle search
  const performSearch = useCallback((query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setCurrentSearchIndex(0);
      return;
    }

    const results: SearchResult[] = [];
    const queryLower = query.toLowerCase();

    messages.forEach((message) => {
      const contentLower = message.content.toLowerCase();
      const matchIndices: [number, number][] = [];
      
      let startIndex = 0;
      while (true) {
        const index = contentLower.indexOf(queryLower, startIndex);
        if (index === -1) break;
        
        matchIndices.push([index, index + query.length]);
        startIndex = index + 1;
      }

      if (matchIndices.length > 0) {
        results.push({
          messageId: message.id,
          content: message.content,
          timestamp: message.timestamp,
          type: message.type,
          matchIndices
        });
      }
    });

    setSearchResults(results);
    setCurrentSearchIndex(0);
    onMessageSearch?.(query);
  }, [messages, onMessageSearch]);

  // Debounced search
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchQuery !== '') {
        performSearch(searchQuery);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, performSearch]);

  // Highlight search matches in text
  const highlightMatches = useCallback((text: string, matches: [number, number][]) => {
    if (!matches.length) return text;

    const parts: React.ReactNode[] = [];
    let lastIndex = 0;

    matches.forEach(([start, end], index) => {
      // Add text before match
      if (start > lastIndex) {
        parts.push(text.slice(lastIndex, start));
      }
      
      // Add highlighted match
      parts.push(
        <mark 
          key={index} 
          className="bg-yellow-200 dark:bg-yellow-800 text-yellow-900 dark:text-yellow-100 px-1 rounded"
        >
          {text.slice(start, end)}
        </mark>
      );
      
      lastIndex = end;
    });

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    return <>{parts}</>;
  }, []);

  // Navigate search results
  const navigateToSearchResult = useCallback((index: number) => {
    if (index < 0 || index >= searchResults.length) return;
    
    const result = searchResults[index];
    setCurrentSearchIndex(index);
    setSelectedMessageId(result.messageId);
    
    // Scroll to message
    const messageElement = document.getElementById(`message-${result.messageId}`);
    if (messageElement) {
      messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [searchResults]);

  // Export conversation
  const exportConversation = useCallback((format: 'txt' | 'json' | 'pdf') => {
    if (!onExportConversation) return;
    
    onExportConversation(format);
    setShowExportMenu(false);
  }, [onExportConversation]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl/Cmd + F to focus search
      if ((event.ctrlKey || event.metaKey) && event.key === 'f') {
        event.preventDefault();
        setIsSearchExpanded(true);
        searchInputRef.current?.focus();
      }
      
      // Escape to clear search
      if (event.key === 'Escape') {
        setSearchQuery('');
        setSearchResults([]);
        setIsSearchExpanded(false);
      }
      
      // Navigate search results with F3/Shift+F3
      if (event.key === 'F3' && searchResults.length > 0) {
        event.preventDefault();
        const direction = event.shiftKey ? -1 : 1;
        const newIndex = (currentSearchIndex + direction + searchResults.length) % searchResults.length;
        navigateToSearchResult(newIndex);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [searchResults.length, currentSearchIndex, navigateToSearchResult]);

  // Click outside to close export menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false);
      }
    };

    if (showExportMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showExportMenu]);

  // Format timestamp
  const formatTimestamp = useCallback((timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
  }, []);

  // Display messages (limited for performance)
  const displayedMessages = useMemo(() => {
    return messages.slice(-maxDisplayedMessages);
  }, [messages, maxDisplayedMessages]);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* Header with search and controls */}
      <div className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Conversation
          </h3>
          
          <div className="flex items-center space-x-2">
            {/* Search toggle */}
            {enableSearch && (
              <button
                onClick={() => {
                  setIsSearchExpanded(!isSearchExpanded);
                  if (!isSearchExpanded) {
                    setTimeout(() => searchInputRef.current?.focus(), 100);
                  }
                }}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Search conversation"
                title="Search (Ctrl+F)"
              >
                <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            )}
            
            {/* Export menu */}
            {enableExport && (
              <div className="relative" ref={exportMenuRef}>
                <button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  aria-label="Export conversation"
                >
                  <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </button>
                
                {showExportMenu && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                    <div className="p-2">
                      <button
                        onClick={() => exportConversation('txt')}
                        className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
                      >
                        Export as Text
                      </button>
                      <button
                        onClick={() => exportConversation('json')}
                        className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
                      >
                        Export as JSON
                      </button>
                      <button
                        onClick={() => exportConversation('pdf')}
                        className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
                      >
                        Export as PDF
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Search bar */}
        {enableSearch && isSearchExpanded && (
          <div className="space-y-2">
            <div className="relative">
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversation..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
            {/* Search navigation */}
            {searchResults.length > 0 && (
              <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>
                  {currentSearchIndex + 1} of {searchResults.length} results
                </span>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => navigateToSearchResult(currentSearchIndex - 1)}
                    disabled={searchResults.length === 0}
                    className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
                    aria-label="Previous result"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => navigateToSearchResult(currentSearchIndex + 1)}
                    disabled={searchResults.length === 0}
                    className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
                    aria-label="Next result"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Messages container */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
        role="log"
        aria-live="polite"
        aria-label="Conversation messages"
      >
        {displayedMessages.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-lg font-medium mb-2">No messages yet</p>
            <p className="text-sm">Start a conversation to see messages here</p>
          </div>
        ) : (
          displayedMessages.map((message, index) => {
            const searchResult = searchResults.find(r => r.messageId === message.id);
            const isSelected = selectedMessageId === message.id;
            
            return (
              <div
                key={message.id}
                id={`message-${message.id}`}
                className={`
                  flex items-start space-x-3 p-3 rounded-lg transition-colors
                  ${isSelected ? 'bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-500' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}
                  ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}
                `}
                onClick={() => {
                  setSelectedMessageId(message.id);
                  onMessageSelect?.(message.id);
                }}
              >
                {/* Avatar */}
                {showSpeakerAvatars && (
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                    ${message.type === 'user' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-green-500 text-white'
                    }
                  `}>
                    {message.type === 'user' ? (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                        <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                      </svg>
                    )}
                  </div>
                )}

                {/* Message content */}
                <div className={`flex-1 min-w-0 ${message.type === 'user' ? 'text-right' : ''}`}>
                  <div className={`
                    inline-block p-3 rounded-2xl max-w-lg
                    ${message.type === 'user' 
                      ? 'bg-blue-500 text-white ml-auto' 
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                    }
                  `}>
                    <p className="text-sm whitespace-pre-wrap">
                      {searchResult 
                        ? highlightMatches(message.content, searchResult.matchIndices)
                        : message.content
                      }
                    </p>
                  </div>
                  
                  {showTimestamps && (
                    <p className={`
                      text-xs text-gray-500 dark:text-gray-400 mt-1
                      ${message.type === 'user' ? 'text-right' : ''}
                    `}>
                      {formatTimestamp(message.timestamp)}
                    </p>
                  )}
                </div>
              </div>
            );
          })
        )}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
              </svg>
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-3">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Keyboard shortcuts help */}
      <div className="sr-only">
        Keyboard shortcuts: Ctrl+F to search, F3 to navigate results, Escape to clear search
      </div>
    </div>
  );
};

export default ConversationInterface;