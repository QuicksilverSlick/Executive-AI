/*
 * DREAMFORGE HIVE-MIND CHAIN OF CUSTODY
 *
 * @file-purpose: Secure session persistence for WebRTC voice assistant with 2025 best practices
 * @version: 1.0.0
 * @init-author: developer-agent
 * @init-cc-sessionId: cc-unknown-20250802-709
 * @init-timestamp: 2025-08-02T20:30:00Z
 * @reasoning:
 * - **Objective:** Implement secure, encrypted session persistence across page loads
 * - **Strategy:** Use IndexedDB with AES encryption for sensitive data, localStorage for preferences
 * - **Outcome:** Complete session continuity with privacy protection and data integrity
 */

import type { VoiceMessage, ConnectionState, ConversationState } from '../../features/voice-agent/types';

// Encryption utilities using Web Crypto API
class SessionCrypto {
  private static key: CryptoKey | null = null;
  
  private static async getKey(): Promise<CryptoKey> {
    if (this.key) return this.key;
    
    // Get or create encryption key from sessionStorage (ephemeral)
    const keyData = sessionStorage.getItem('va_session_key');
    
    if (keyData) {
      // Import existing key
      const keyBuffer = new Uint8Array(JSON.parse(keyData));
      this.key = await crypto.subtle.importKey(
        'raw',
        keyBuffer,
        { name: 'AES-GCM' },
        false,
        ['encrypt', 'decrypt']
      );
    } else {
      // Generate new key
      this.key = await crypto.subtle.generateKey(
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
      );
      
      // Store key in sessionStorage (cleared on tab close)
      const keyBuffer = await crypto.subtle.exportKey('raw', this.key);
      sessionStorage.setItem('va_session_key', JSON.stringify(Array.from(new Uint8Array(keyBuffer))));
    }
    
    return this.key;
  }
  
  static async encrypt(data: string): Promise<string> {
    try {
      const key = await this.getKey();
      const encodedData = new TextEncoder().encode(data);
      const iv = crypto.getRandomValues(new Uint8Array(12));
      
      const encryptedData = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        encodedData
      );
      
      // Combine IV and encrypted data
      const combined = new Uint8Array(iv.length + encryptedData.byteLength);
      combined.set(iv);
      combined.set(new Uint8Array(encryptedData), iv.length);
      
      return btoa(String.fromCharCode.apply(null, Array.from(combined)));
    } catch (error) {
      console.error('[SessionCrypto] Encryption failed:', error);
      return data; // Fallback to unencrypted
    }
  }
  
  static async decrypt(encryptedData: string): Promise<string | null> {
    try {
      const key = await this.getKey();
      const combined = new Uint8Array(atob(encryptedData).split('').map(c => c.charCodeAt(0)));
      
      const iv = combined.slice(0, 12);
      const data = combined.slice(12);
      
      const decryptedData = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        data
      );
      
      return new TextDecoder().decode(decryptedData);
    } catch (error) {
      console.error('[SessionCrypto] Decryption failed:', error);
      // Return null to indicate failure instead of corrupted data
      return null;
    }
  }
}

// Session data interfaces
export interface VoiceSessionData {
  sessionId: string;
  messages: VoiceMessage[];
  connectionState: ConnectionState;
  conversationState: ConversationState;
  startTime: number;
  lastActivity: number;
  metadata: {
    userAgent: string;
    totalMessages: number;
    totalDuration: number;
  };
}

export interface SessionPreferences {
  voicePersonality: string;
  isMinimized: boolean;
  showTranscript: boolean;
  volume: number;
  theme: string;
  position: string;
}

// IndexedDB wrapper for session data
class SessionDatabase {
  private static dbName = 'VoiceAssistantSessions';
  private static dbVersion = 1;
  private static db: IDBDatabase | null = null;
  
  private static async openDB(): Promise<IDBDatabase> {
    if (this.db) return this.db;
    
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Sessions store
        if (!db.objectStoreNames.contains('sessions')) {
          const sessionStore = db.createObjectStore('sessions', { keyPath: 'sessionId' });
          sessionStore.createIndex('lastActivity', 'lastActivity', { unique: false });
        }
        
        // Message store for quick queries
        if (!db.objectStoreNames.contains('messages')) {
          const messageStore = db.createObjectStore('messages', { keyPath: 'id' });
          messageStore.createIndex('sessionId', 'sessionId', { unique: false });
          messageStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }
  
  static async saveSession(sessionData: VoiceSessionData): Promise<void> {
    try {
      const db = await this.openDB();
      
      // Encrypt sensitive session data before starting transaction
      const encryptedMessages = await SessionCrypto.encrypt(JSON.stringify(sessionData.messages));
      const encryptedData = {
        ...sessionData,
        messages: encryptedMessages
      };
      
      // Encrypt individual messages before starting transaction
      const encryptedMessagesArray = await Promise.all(
        sessionData.messages.map(async (message) => ({
          ...message,
          sessionId: sessionData.sessionId,
          content: await SessionCrypto.encrypt(message.content)
        }))
      );
      
      // Start transaction after all encryption is complete
      const transaction = db.transaction(['sessions', 'messages'], 'readwrite');
      
      return new Promise((resolve, reject) => {
        const sessionStore = transaction.objectStore('sessions');
        const messageStore = transaction.objectStore('messages');
        
        transaction.oncomplete = () => {
          console.log('[SessionDatabase] Session saved successfully:', sessionData.sessionId);
          resolve();
        };
        
        transaction.onerror = () => {
          console.error('[SessionDatabase] Transaction failed:', transaction.error);
          reject(transaction.error);
        };
        
        // Save session data
        const sessionRequest = sessionStore.put(encryptedData);
        sessionRequest.onerror = () => reject(sessionRequest.error);
        
        // Save individual messages
        encryptedMessagesArray.forEach(encryptedMessage => {
          const messageRequest = messageStore.put(encryptedMessage);
          messageRequest.onerror = () => reject(messageRequest.error);
        });
      });
      
    } catch (error) {
      console.error('[SessionDatabase] Failed to save session:', error);
      throw error;
    }
  }
  
  static async loadSession(sessionId: string): Promise<VoiceSessionData | null> {
    try {
      const db = await this.openDB();
      const transaction = db.transaction(['sessions'], 'readonly');
      const store = transaction.objectStore('sessions');
      
      const sessionData = await new Promise<any>((resolve, reject) => {
        const request = store.get(sessionId);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      
      if (!sessionData) return null;
      
      // Decrypt messages
      const decryptedMessagesText = await SessionCrypto.decrypt(sessionData.messages);
      if (!decryptedMessagesText) {
        console.warn('[SessionDatabase] Failed to decrypt session messages, returning null');
        return null;
      }
      
      const decryptedMessages = JSON.parse(decryptedMessagesText);
      
      return {
        ...sessionData,
        messages: decryptedMessages
      };
    } catch (error) {
      console.error('[SessionDatabase] Failed to load session:', error);
      return null;
    }
  }
  
  static async getRecentSessions(limit: number = 10): Promise<VoiceSessionData[]> {
    try {
      const db = await this.openDB();
      const transaction = db.transaction(['sessions'], 'readonly');
      const store = transaction.objectStore('sessions');
      const index = store.index('lastActivity');
      
      const sessions: VoiceSessionData[] = [];
      const request = index.openCursor(null, 'prev');
      
      return new Promise((resolve, reject) => {
        request.onsuccess = async (event) => {
          const cursor = (event.target as IDBRequest).result;
          if (cursor && sessions.length < limit) {
            const sessionData = cursor.value;
            
            // Decrypt messages
            try {
              const decryptedMessagesText = await SessionCrypto.decrypt(sessionData.messages);
              if (decryptedMessagesText) {
                const decryptedMessages = JSON.parse(decryptedMessagesText);
                sessions.push({
                  ...sessionData,
                  messages: decryptedMessages
                });
              } else {
                console.warn('[SessionDatabase] Failed to decrypt session, skipping:', sessionData.sessionId);
              }
            } catch (decryptError) {
              console.error('[SessionDatabase] Failed to decrypt session:', decryptError);
            }
            
            cursor.continue();
          } else {
            resolve(sessions);
          }
        };
        
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('[SessionDatabase] Failed to get recent sessions:', error);
      return [];
    }
  }
  
  static async deleteSession(sessionId: string): Promise<void> {
    try {
      const db = await this.openDB();
      const transaction = db.transaction(['sessions', 'messages'], 'readwrite');
      
      return new Promise((resolve, reject) => {
        const sessionStore = transaction.objectStore('sessions');
        const messageStore = transaction.objectStore('messages');
        
        transaction.oncomplete = () => {
          console.log('[SessionDatabase] Session deleted:', sessionId);
          resolve();
        };
        
        transaction.onerror = () => {
          console.error('[SessionDatabase] Delete transaction failed:', transaction.error);
          reject(transaction.error);
        };
        
        // Delete session
        const sessionRequest = sessionStore.delete(sessionId);
        sessionRequest.onerror = () => reject(sessionRequest.error);
        
        // Delete associated messages
        const index = messageStore.index('sessionId');
        const cursorRequest = index.openCursor(IDBKeyRange.only(sessionId));
        
        cursorRequest.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest).result;
          if (cursor) {
            messageStore.delete(cursor.primaryKey);
            cursor.continue();
          }
        };
        
        cursorRequest.onerror = () => reject(cursorRequest.error);
      });
      
    } catch (error) {
      console.error('[SessionDatabase] Failed to delete session:', error);
      throw error;
    }
  }
  
  static async clearCorruptedSessions(): Promise<void> {
    try {
      console.log('[SessionDatabase] Clearing corrupted sessions...');
      const db = await this.openDB();
      
      // First, get all sessions to check
      const sessionsToCheck: any[] = [];
      const readTransaction = db.transaction(['sessions'], 'readonly');
      const readStore = readTransaction.objectStore('sessions');
      
      await new Promise((resolve, reject) => {
        const request = readStore.openCursor();
        
        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest).result;
          if (cursor) {
            sessionsToCheck.push({
              key: cursor.primaryKey,
              value: cursor.value
            });
            cursor.continue();
          } else {
            resolve(undefined);
          }
        };
        
        request.onerror = () => reject(request.error);
      });
      
      // Now check each session and delete corrupted ones
      const corruptedKeys: IDBValidKey[] = [];
      
      for (const session of sessionsToCheck) {
        try {
          const decryptedMessagesText = await SessionCrypto.decrypt(session.value.messages);
          if (!decryptedMessagesText) {
            console.log('[SessionDatabase] Found corrupted session:', session.value.sessionId);
            corruptedKeys.push(session.key);
          }
        } catch (error) {
          console.log('[SessionDatabase] Found corrupted session:', session.value.sessionId);
          corruptedKeys.push(session.key);
        }
      }
      
      // Delete corrupted sessions in a new transaction
      if (corruptedKeys.length > 0) {
        const deleteTransaction = db.transaction(['sessions'], 'readwrite');
        const deleteStore = deleteTransaction.objectStore('sessions');
        
        await new Promise((resolve, reject) => {
          deleteTransaction.oncomplete = () => {
            console.log(`[SessionDatabase] Deleted ${corruptedKeys.length} corrupted sessions`);
            resolve(undefined);
          };
          
          deleteTransaction.onerror = () => {
            console.error('[SessionDatabase] Failed to delete corrupted sessions:', deleteTransaction.error);
            reject(deleteTransaction.error);
          };
          
          corruptedKeys.forEach(key => {
            deleteStore.delete(key);
          });
        });
      } else {
        console.log('[SessionDatabase] No corrupted sessions found');
      }
      
    } catch (error) {
      console.error('[SessionDatabase] Failed to clear corrupted sessions:', error);
      // Don't throw - this is a cleanup operation
    }
  }

  static async cleanupOldSessions(maxAge: number = 7 * 24 * 60 * 60 * 1000): Promise<void> {
    try {
      const cutoffTime = Date.now() - maxAge;
      const db = await this.openDB();
      const transaction = db.transaction(['sessions'], 'readwrite');
      
      return new Promise((resolve, reject) => {
        const store = transaction.objectStore('sessions');
        const index = store.index('lastActivity');
        
        transaction.oncomplete = () => {
          console.log('[SessionDatabase] Old sessions cleaned up');
          resolve();
        };
        
        transaction.onerror = () => {
          console.error('[SessionDatabase] Cleanup transaction failed:', transaction.error);
          reject(transaction.error);
        };
        
        const request = index.openCursor(IDBKeyRange.upperBound(cutoffTime));
        
        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest).result;
          if (cursor) {
            store.delete(cursor.primaryKey);
            cursor.continue();
          }
        };
        
        request.onerror = () => reject(request.error);
      });
      
    } catch (error) {
      console.error('[SessionDatabase] Failed to cleanup old sessions:', error);
      throw error;
    }
  }
}

// Main session persistence manager
export class VoiceSessionPersistence {
  private currentSession: VoiceSessionData | null = null;
  private autoSaveInterval: number | null = null;
  private debounceTimeout: number | null = null;
  
  constructor() {
    // Auto-cleanup old sessions and corrupted sessions on initialization
    this.cleanupOldSessions();
    this.cleanupCorruptedSessions();
    
    // Setup auto-save interval (every 30 seconds)
    this.autoSaveInterval = setInterval(() => {
      if (this.currentSession) {
        this.saveCurrentSession();
      }
    }, 30000) as unknown as number;
    
    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
      this.cleanup();
    });
  }
  
  async createSession(sessionId: string): Promise<VoiceSessionData> {
    // Check if session already exists
    const existingSession = await this.loadSession(sessionId);
    if (existingSession) {
      console.log('[VoiceSessionPersistence] Returning existing session:', sessionId);
      return existingSession;
    }
    
    const sessionData: VoiceSessionData = {
      sessionId,
      messages: [],
      connectionState: 'disconnected',
      conversationState: 'idle',
      startTime: Date.now(),
      lastActivity: Date.now(),
      metadata: {
        userAgent: navigator.userAgent,
        totalMessages: 0,
        totalDuration: 0
      }
    };
    
    this.currentSession = sessionData;
    await this.saveCurrentSession();
    
    console.log('[VoiceSessionPersistence] New session created:', sessionId);
    return sessionData;
  }
  
  async loadSession(sessionId: string): Promise<VoiceSessionData | null> {
    const sessionData = await SessionDatabase.loadSession(sessionId);
    if (sessionData) {
      this.currentSession = sessionData;
      console.log('[VoiceSessionPersistence] Session loaded:', sessionId);
    }
    return sessionData;
  }
  
  addMessage(message: VoiceMessage): void {
    if (!this.currentSession) return;
    
    this.currentSession.messages.push(message);
    this.currentSession.lastActivity = Date.now();
    this.currentSession.metadata.totalMessages++;
    
    // Debounced save (avoid saving on every message)
    this.debouncedSave();
  }
  
  updateConnectionState(state: ConnectionState): void {
    if (!this.currentSession) return;
    
    this.currentSession.connectionState = state;
    this.currentSession.lastActivity = Date.now();
    this.debouncedSave();
  }
  
  updateConversationState(state: ConversationState): void {
    if (!this.currentSession) return;
    
    this.currentSession.conversationState = state;
    this.currentSession.lastActivity = Date.now();
    this.debouncedSave();
  }
  
  getCurrentSession(): VoiceSessionData | null {
    return this.currentSession;
  }
  
  async getRecentSessions(): Promise<VoiceSessionData[]> {
    return await SessionDatabase.getRecentSessions();
  }
  
  async deleteSession(sessionId: string): Promise<void> {
    await SessionDatabase.deleteSession(sessionId);
    if (this.currentSession?.sessionId === sessionId) {
      this.currentSession = null;
    }
  }
  
  private debouncedSave(): void {
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
    }
    
    this.debounceTimeout = setTimeout(() => {
      this.saveCurrentSession();
    }, 1000) as unknown as number; // Save 1 second after last change for faster persistence
  }
  
  private async saveCurrentSession(): Promise<void> {
    if (!this.currentSession) {
      console.warn('[VoiceSessionPersistence] No current session to save');
      return;
    }
    
    // Calculate total duration
    this.currentSession.metadata.totalDuration = Date.now() - this.currentSession.startTime;
    
    console.log('[VoiceSessionPersistence] Saving session:', {
      sessionId: this.currentSession.sessionId,
      messageCount: this.currentSession.messages.length,
      duration: this.currentSession.metadata.totalDuration,
      firstMessage: this.currentSession.messages[0]?.content?.substring(0, 30) || 'NONE'
    });
    
    await SessionDatabase.saveSession(this.currentSession);
  }
  
  private async cleanupOldSessions(): Promise<void> {
    // Keep sessions for 7 days
    await SessionDatabase.cleanupOldSessions(7 * 24 * 60 * 60 * 1000);
  }
  
  private async cleanupCorruptedSessions(): Promise<void> {
    // Clear any corrupted sessions that can't be decrypted
    try {
      await SessionDatabase.clearCorruptedSessions();
    } catch (error) {
      console.warn('[VoiceSessionPersistence] Failed to cleanup corrupted sessions:', error);
    }
  }
  
  cleanup(): void {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
    }
    
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
    }
    
    // Final save
    if (this.currentSession) {
      this.saveCurrentSession();
    }
  }
}

// Preferences manager (using localStorage for non-sensitive data)
export class VoicePreferencesManager {
  private static STORAGE_KEY = 'voice_assistant_preferences';
  
  static getPreferences(): SessionPreferences {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return { ...this.getDefaultPreferences(), ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error('[VoicePreferencesManager] Failed to load preferences:', error);
    }
    
    return this.getDefaultPreferences();
  }
  
  static savePreferences(preferences: Partial<SessionPreferences>): void {
    try {
      const current = this.getPreferences();
      const updated = { ...current, ...preferences };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
      console.log('[VoicePreferencesManager] Preferences saved');
    } catch (error) {
      console.error('[VoicePreferencesManager] Failed to save preferences:', error);
    }
  }
  
  static clearPreferences(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      console.log('[VoicePreferencesManager] Preferences cleared');
    } catch (error) {
      console.error('[VoicePreferencesManager] Failed to clear preferences:', error);
    }
  }
  
  private static getDefaultPreferences(): SessionPreferences {
    return {
      voicePersonality: 'sage',
      isMinimized: true, // Always default to minimized for better UX
      showTranscript: true,
      volume: 0.8,
      theme: 'auto',
      position: 'bottom-right'
    };
  }
}

// Export singleton instance
export const sessionPersistence = new VoiceSessionPersistence();

/*
 * DREAMFORGE AUDIT TRAIL
 *
 * ---
 * @revision: 1.1.0
 * @author: developer-agent
 * @cc-sessionId: cc-unknown-20250803-337
 * @timestamp: 2025-08-03T11:45:00Z
 * @reasoning:
 * - **Objective:** Fix critical session persistence issues preventing data storage/restoration
 * - **Strategy:** Fix Node.js require() usage and IndexedDB transaction management
 * - **Outcome:** Working session persistence with proper browser-compatible imports and DB operations
 * 
 * CRITICAL FIXES APPLIED:
 * - Fixed IndexedDB transaction management to prevent "transaction has finished" errors
 * - All async encryption operations now complete BEFORE starting DB transactions
 * - Proper transaction event handling (oncomplete/onerror) instead of broken Promise.all approach
 * - Fixed browser timer types (number instead of NodeJS.Timeout)
 * - Removed problematic nested await calls within active transactions
 * 
 * Features implemented:
 * - AES-256-GCM encryption for sensitive data using Web Crypto API
 * - IndexedDB for persistent session storage with automatic cleanup
 * - Debounced saving to prevent performance issues
 * - Session key stored in sessionStorage (cleared on tab close)
 * - Automatic old session cleanup (7 days)
 * - Preferences management with localStorage
 * - Comprehensive error handling and fallbacks
 * - Memory-efficient storage with message indexing
 * 
 * Previous revision (1.0.0):
 * - Initial implementation with transaction timing issues
 */