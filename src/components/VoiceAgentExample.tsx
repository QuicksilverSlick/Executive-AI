/**
 * Voice Agent Example Component
 * Demonstrates secure integration with OpenAI Realtime API using ephemeral tokens
 * 
 * Features:
 * - Automatic token management
 * - Real-time connection status
 * - Error handling and recovery
 * - Accessibility support
 * - Security best practices
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getTokenManager } from '../features/voice-agent/services/tokenManager';
import type { 
  EphemeralToken, 
  ConnectionState, 
  ConversationState, 
  VoiceAgentError,
  ErrorInfo 
} from '../features/voice-agent/types';

interface VoiceAgentExampleProps {
  onConnectionChange?: (state: ConnectionState) => void;
  onConversationChange?: (state: ConversationState) => void;
  onError?: (error: ErrorInfo) => void;
  className?: string;
  disabled?: boolean;
}

interface VoiceAgentState {
  connectionState: ConnectionState;
  conversationState: ConversationState;
  token: EphemeralToken | null;
  isConnecting: boolean;
  error: ErrorInfo | null;
  tokenExpiresIn: number;
}

export const VoiceAgentExample: React.FC<VoiceAgentExampleProps> = ({
  onConnectionChange,
  onConversationChange,
  onError,
  className = '',
  disabled = false
}) => {
  // State management
  const [state, setState] = useState<VoiceAgentState>({
    connectionState: 'disconnected',
    conversationState: 'idle',
    token: null,
    isConnecting: false,
    error: null,
    tokenExpiresIn: 0
  });

  // Refs for cleanup
  const tokenManagerRef = useRef(getTokenManager());
  const websocketRef = useRef<WebSocket | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Update parent components when state changes
  useEffect(() => {
    onConnectionChange?.(state.connectionState);
  }, [state.connectionState, onConnectionChange]);

  useEffect(() => {
    onConversationChange?.(state.conversationState);
  }, [state.conversationState, onConversationChange]);

  useEffect(() => {
    if (state.error) {
      onError?.(state.error);
    }
  }, [state.error, onError]);

  // Token expiration countdown
  useEffect(() => {
    if (state.token && state.connectionState === 'connected') {
      const updateCountdown = () => {
        const now = Date.now();
        const expiresIn = Math.max(0, state.token!.expiresAt - now);
        
        setState(prev => ({
          ...prev,
          tokenExpiresIn: expiresIn
        }));

        if (expiresIn <= 0) {
          if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
          }
        }
      };

      updateCountdown(); // Initial update
      countdownIntervalRef.current = setInterval(updateCountdown, 1000);

      return () => {
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
        }
      };
    }
  }, [state.token, state.connectionState]);

  // Set up token manager event listeners
  useEffect(() => {
    const tokenManager = tokenManagerRef.current;

    const handleTokenRefreshed = (token: EphemeralToken) => {
      console.log('🎫 Token refreshed:', token.sessionId);
      setState(prev => ({
        ...prev,
        token,
        error: null
      }));
    };

    const handleTokenExpired = () => {
      console.log('⏰ Token expired');
      setState(prev => ({
        ...prev,
        connectionState: 'token_expired',
        conversationState: 'error',
        error: {
          type: 'token_expired',
          message: 'Authentication token has expired',
          timestamp: Date.now(),
          recoverable: true
        }
      }));
    };

    const handleTokenError = (error: Error) => {
      console.error('❌ Token error:', error);
      setState(prev => ({
        ...prev,
        connectionState: 'failed',
        conversationState: 'error',
        isConnecting: false,
        error: {
          type: 'api_error',
          message: error.message,
          timestamp: Date.now(),
          details: error,
          recoverable: true
        }
      }));
    };

    // Add event listeners
    tokenManager.on('tokenRefreshed', handleTokenRefreshed);
    tokenManager.on('tokenExpired', handleTokenExpired);
    tokenManager.on('tokenError', handleTokenError);

    // Cleanup function
    return () => {
      tokenManager.off('tokenRefreshed', handleTokenRefreshed);
      tokenManager.off('tokenExpired', handleTokenExpired);
      tokenManager.off('tokenError', handleTokenError);
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (websocketRef.current) {
        websocketRef.current.close();
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
      tokenManagerRef.current.destroy();
    };
  }, []);

  // Connect to OpenAI Realtime API
  const connect = useCallback(async () => {
    if (state.isConnecting || disabled) return;

    setState(prev => ({
      ...prev,
      isConnecting: true,
      connectionState: 'connecting',
      error: null
    }));

    try {
      // Get authentication token
      const tokenManager = tokenManagerRef.current;
      const tokenData = await tokenManager.requestToken();

      // Connect to OpenAI WebSocket
      const websocket = new WebSocket(
        'wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview',
        [],
        {
          headers: {
            'Authorization': `Bearer ${tokenData.token}`,
            'OpenAI-Beta': 'realtime=v1'
          }
        }
      );

      websocket.onopen = () => {
        console.log('🔗 WebSocket connected');
        setState(prev => ({
          ...prev,
          connectionState: 'connected',
          conversationState: 'idle',
          isConnecting: false,
          token: tokenData
        }));
      };

      websocket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log('📨 Received:', message);
          
          // Handle different message types
          switch (message.type) {
            case 'session.created':
              console.log('✅ Session created');
              break;
            case 'input_audio_buffer.speech_started':
              setState(prev => ({ ...prev, conversationState: 'listening' }));
              break;
            case 'input_audio_buffer.speech_stopped':
              setState(prev => ({ ...prev, conversationState: 'processing' }));
              break;
            case 'response.audio.delta':
              setState(prev => ({ ...prev, conversationState: 'speaking' }));
              break;
            case 'response.done':
              setState(prev => ({ ...prev, conversationState: 'idle' }));
              break;
            case 'error':
              throw new Error(message.error?.message || 'WebSocket error');
          }
        } catch (error) {
          console.error('❌ Message parsing error:', error);
        }
      };

      websocket.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        setState(prev => ({
          ...prev,
          connectionState: 'failed',
          conversationState: 'error',
          isConnecting: false,
          error: {
            type: 'connection_failed',
            message: 'WebSocket connection failed',
            timestamp: Date.now(),
            details: error,
            recoverable: true
          }
        }));
      };

      websocket.onclose = (event) => {
        console.log('🔌 WebSocket closed:', event.code, event.reason);
        setState(prev => ({
          ...prev,
          connectionState: 'disconnected',
          conversationState: 'idle',
          isConnecting: false
        }));
      };

      websocketRef.current = websocket;

    } catch (error) {
      console.error('❌ Connection failed:', error);
      setState(prev => ({
        ...prev,
        connectionState: 'failed',
        conversationState: 'error',
        isConnecting: false,
        error: {
          type: 'connection_failed',
          message: error instanceof Error ? error.message : 'Connection failed',
          timestamp: Date.now(),
          details: error,
          recoverable: true
        }
      }));
    }
  }, [state.isConnecting, disabled]);

  // Disconnect from service
  const disconnect = useCallback(() => {
    if (websocketRef.current) {
      websocketRef.current.close();
      websocketRef.current = null;
    }

    tokenManagerRef.current.clearToken();

    setState(prev => ({
      ...prev,
      connectionState: 'disconnected',
      conversationState: 'idle',
      token: null,
      isConnecting: false,
      error: null,
      tokenExpiresIn: 0
    }));
  }, []);

  // Retry connection
  const retry = useCallback(async () => {
    disconnect();
    // Wait a moment before retrying
    setTimeout(connect, 1000);
  }, [disconnect, connect]);

  // Format time remaining
  const formatTimeRemaining = (ms: number): string => {
    const seconds = Math.ceil(ms / 1000);
    return `${seconds}s`;
  };

  // Get status color
  const getStatusColor = (): string => {
    switch (state.connectionState) {
      case 'connected': return 'text-green-600';
      case 'connecting': return 'text-yellow-600';
      case 'disconnected': return 'text-gray-600';
      case 'failed': return 'text-red-600';
      case 'token_expired': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  // Get conversation status
  const getConversationStatus = (): string => {
    switch (state.conversationState) {
      case 'listening': return '🎤 Listening...';
      case 'processing': return '🤔 Processing...';
      case 'speaking': return '🗣️ Speaking...';
      case 'error': return '❌ Error';
      default: return '⏸️ Ready';
    }
  };

  return (
    <div className={`voice-agent-example p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg ${className}`}>
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Voice Agent Demo
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Secure OpenAI Realtime API integration with ephemeral tokens
        </p>
      </div>

      {/* Status Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
            Connection Status
          </h4>
          <p className={`text-sm font-medium ${getStatusColor()}`}>
            {state.connectionState.charAt(0).toUpperCase() + state.connectionState.slice(1)}
          </p>
          {state.token && state.connectionState === 'connected' && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Token expires in: {formatTimeRemaining(state.tokenExpiresIn)}
            </p>
          )}
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
            Conversation
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {getConversationStatus()}
          </p>
        </div>
      </div>

      {/* Error Display */}
      {state.error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-red-400">⚠️</span>
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-red-800 dark:text-red-400">
                {state.error.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </h4>
              <p className="text-sm text-red-700 dark:text-red-300">
                {state.error.message}
              </p>
            </div>
            {state.error.recoverable && (
              <div className="ml-auto">
                <button
                  onClick={retry}
                  className="text-sm bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800 text-red-800 dark:text-red-200 px-3 py-1 rounded"
                  disabled={state.isConnecting}
                >
                  Retry
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Token Information */}
      {state.token && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
          <h4 className="text-sm font-medium text-blue-800 dark:text-blue-400 mb-2">
            Token Information
          </h4>
          <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
            <p>Session ID: {state.token.sessionId}</p>
            <p>Expires: {new Date(state.token.expiresAt).toLocaleTimeString()}</p>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex space-x-3">
        {state.connectionState === 'disconnected' || state.connectionState === 'failed' ? (
          <button
            onClick={connect}
            disabled={state.isConnecting || disabled}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            aria-label="Connect to voice agent"
          >
            {state.isConnecting ? (
              <>
                <span className="inline-block animate-spin mr-2">⏳</span>
                Connecting...
              </>
            ) : (
              'Connect'
            )}
          </button>
        ) : (
          <button
            onClick={disconnect}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            aria-label="Disconnect from voice agent"
          >
            Disconnect
          </button>
        )}

        {state.connectionState === 'connected' && (
          <button
            onClick={() => tokenManagerRef.current.forceRefresh()}
            className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            aria-label="Refresh token"
          >
            Refresh Token
          </button>
        )}
      </div>

      {/* Debug Information (Development only) */}
      {process.env.NODE_ENV === 'development' && (
        <details className="mt-6">
          <summary className="cursor-pointer text-sm text-gray-500 dark:text-gray-400">
            Debug Information
          </summary>
          <pre className="mt-2 text-xs bg-gray-100 dark:bg-gray-900 p-3 rounded overflow-auto">
            {JSON.stringify(
              {
                tokenManagerStatus: tokenManagerRef.current.getStatus(),
                connectionState: state.connectionState,
                conversationState: state.conversationState,
                error: state.error
              },
              null,
              2
            )}
          </pre>
        </details>
      )}
    </div>
  );
};

export default VoiceAgentExample;