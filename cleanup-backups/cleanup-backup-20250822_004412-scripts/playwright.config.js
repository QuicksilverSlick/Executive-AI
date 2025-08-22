/*
 * DREAMFORGE HIVE-MIND CHAIN OF CUSTODY
 *
 * @file-purpose: Playwright configuration for voice agent E2E testing
 * @version: 1.0.0
 * @init-author: test-agent
 * @init-cc-sessionId: cc-test-20250802-001
 * @init-timestamp: 2025-08-02T17:05:00Z
 * @reasoning:
 * - **Objective:** Configure Playwright for comprehensive E2E testing
 * - **Strategy:** Multi-browser testing with proper video/screenshot capture
 * - **Outcome:** Reliable E2E testing environment for voice agent features
 */

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // Test directory
  testDir: './tests/e2e',
  
  // Global test settings
  timeout: 30 * 1000, // 30 seconds
  expect: {
    timeout: 5 * 1000, // 5 seconds for assertions
  },

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry configuration
  retries: process.env.CI ? 2 : 0,

  // Parallel workers
  workers: process.env.CI ? 1 : undefined,

  // Reporter configuration
  reporter: [
    ['html', { outputFolder: './test-results/e2e-report' }],
    ['json', { outputFile: './test-results/e2e-results.json' }],
    ['junit', { outputFile: './test-results/e2e-junit.xml' }]
  ],

  // Global setup and teardown
  globalSetup: './tests/setup/global-setup.js',
  globalTeardown: './tests/setup/global-teardown.js',

  // Shared settings for all projects
  use: {
    // Base URL for tests
    baseURL: 'http://localhost:4321',

    // Browser context options
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    
    // Capture options
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',

    // Permissions for voice agent testing
    permissions: ['microphone'],
    
    // Geolocation (if needed for testing)
    geolocation: { longitude: -122.4194, latitude: 37.7749 },
    
    // Locale and timezone
    locale: 'en-US',
    timezoneId: 'America/New_York',

    // Action timeout
    actionTimeout: 10 * 1000,
  },

  // Project configurations for different browsers
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Chrome-specific settings for WebRTC
        launchOptions: {
          args: [
            '--use-fake-ui-for-media-stream',
            '--use-fake-device-for-media-stream',
            '--allow-running-insecure-content',
            '--disable-web-security',
            '--autoplay-policy=no-user-gesture-required'
          ]
        }
      },
    },

    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        // Firefox-specific settings
        launchOptions: {
          firefoxUserPrefs: {
            'media.navigator.streams.fake': true,
            'media.navigator.permission.disabled': true
          }
        }
      },
    },

    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
      },
    },

    // Mobile testing
    {
      name: 'Mobile Chrome',
      use: {
        ...devices['Pixel 5'],
        launchOptions: {
          args: [
            '--use-fake-ui-for-media-stream',
            '--use-fake-device-for-media-stream'
          ]
        }
      },
    },

    {
      name: 'Mobile Safari',
      use: {
        ...devices['iPhone 12'],
      },
    },

    // Tablet testing
    {
      name: 'Tablet',
      use: {
        ...devices['iPad Pro'],
      },
    },
  ],

  // Web server configuration
  webServer: {
    command: 'npm run preview',
    url: 'http://localhost:4321',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000, // 2 minutes for server startup
  },

  // Output directories
  outputDir: './test-results/e2e-artifacts',
  
  // Test match patterns
  testMatch: [
    '**/*.(test|spec).e2e.js',
    '**/e2e/**/*.(test|spec).js'
  ],

  // Test ignore patterns
  testIgnore: [
    '**/node_modules/**',
    '**/dist/**',
    '**/coverage/**'
  ]
});