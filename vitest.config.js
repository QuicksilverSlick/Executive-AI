/*
 * DREAMFORGE HIVE-MIND CHAIN OF CUSTODY
 *
 * @file-purpose: Vitest configuration for voice agent testing
 * @version: 1.0.0
 * @init-author: test-agent
 * @init-cc-sessionId: cc-test-20250802-001
 * @init-timestamp: 2025-08-02T17:00:00Z
 * @reasoning:
 * - **Objective:** Configure Vitest for comprehensive unit and integration testing
 * - **Strategy:** Setup test environment with proper mocks and coverage
 * - **Outcome:** Reliable test environment for voice agent validation
 */

import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    // Test environment configuration
    environment: 'jsdom',
    
    // Global test settings
    globals: true,
    setupFiles: ['./tests/setup/test-setup.js'],
    
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/',
        'dist/',
        '.astro/',
        'tests/',
        '**/*.config.js',
        '**/*.test.js'
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        },
        // Specific thresholds for voice agent
        './src/components/voice-agent/': {
          branches: 85,
          functions: 85,
          lines: 85,
          statements: 85
        }
      }
    },

    // Test file patterns
    include: [
      'tests/**/*.test.js',
      'src/**/*.test.js',
      'src/**/*.test.ts'
    ],
    exclude: [
      'tests/e2e/**',
      'node_modules/**',
      'dist/**'
    ],

    // Timeout configuration
    testTimeout: 10000,
    hookTimeout: 5000,

    // Reporter configuration
    reporter: ['verbose', 'json', 'html'],
    outputFile: {
      json: './test-results/unit-tests.json',
      html: './test-results/unit-tests.html'
    },

    // Watch mode configuration
    watch: false,
    watchExclude: ['**/node_modules/**', '**/dist/**'],

    // Mock configuration
    deps: {
      inline: ['webrtc-adapter']
    },

    // TypeScript support
    transformers: {
      'src/**/*.ts': 'typescript'
    }
  },

  // Resolve configuration for module imports
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@tests': path.resolve(__dirname, './tests'),
      '@components': path.resolve(__dirname, './src/components'),
      '@lib': path.resolve(__dirname, './src/lib'),
      '@features': path.resolve(__dirname, './src/features')
    }
  },

  // Define global constants for tests
  define: {
    '__TEST_ENV__': true,
    '__VOICE_AGENT_DEBUG__': true
  }
});