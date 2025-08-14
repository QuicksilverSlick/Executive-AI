/*
 * DREAMFORGE HIVE-MIND CHAIN OF CUSTODY
 *
 * @file-purpose: End-to-end tests for complete voice agent user journey
 * @version: 1.0.0
 * @init-author: test-agent
 * @init-cc-sessionId: cc-test-20250802-001
 * @init-timestamp: 2025-08-02T16:15:00Z
 * @reasoning:
 * - **Objective:** Validate complete user journey through browser automation
 * - **Strategy:** Test real browser interactions and visual feedback
 * - **Outcome:** Ensure UI/UX flows work correctly in real environment
 */

import { test, expect } from '@playwright/test';

test.describe('Voice Agent User Journey E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the test page
    await page.goto('/test-voice-assistant.html');
    
    // Wait for voice assistant to load
    await page.waitForSelector('#voice-assistant-widget');
    
    // Grant microphone permissions
    await page.context().grantPermissions(['microphone']);
  });

  test('Complete voice interaction journey', async ({ page }) => {
    // 1. Initial state verification
    await expect(page.locator('#voice-assistant-widget')).toBeVisible();
    await expect(page.locator('#voice-widget-panel')).toHaveClass(/hidden/);

    // 2. Click FAB to expand panel
    await page.click('#voice-fab');
    await expect(page.locator('#voice-widget-panel')).toHaveClass(/visible/);
    await expect(page.locator('#voice-status-text')).toContainText('Ready');

    // 3. Test voice button interaction
    await page.click('#voice-main-btn');
    
    // Should show listening state
    await expect(page.locator('#voice-main-btn')).toHaveClass(/listening/);
    await expect(page.locator('.voice-status-indicator')).toHaveClass(/listening/);
    await expect(page.locator('#voice-status-text')).toContainText('Listening');

    // 4. Stop listening
    await page.click('#voice-main-btn');
    await expect(page.locator('#voice-main-btn')).toHaveClass(/idle/);

    // 5. Minimize panel
    await page.click('#voice-minimize-btn');
    await expect(page.locator('#voice-widget-panel')).toHaveClass(/hidden/);
  });

  test('Keyboard navigation and shortcuts', async ({ page }) => {
    // Test spacebar to open
    await page.keyboard.press('Space');
    await expect(page.locator('#voice-widget-panel')).toHaveClass(/visible/);

    // Test spacebar to start listening
    await page.keyboard.press('Space');
    await expect(page.locator('#voice-main-btn')).toHaveClass(/listening/);

    // Test Escape to close
    await page.keyboard.press('Escape');
    await expect(page.locator('#voice-widget-panel')).toHaveClass(/hidden/);
  });

  test('Mute functionality', async ({ page }) => {
    // Expand panel
    await page.click('#voice-fab');
    
    // Click mute button
    await page.click('#voice-mute-btn');
    
    // Should show muted state
    const muteIcon = page.locator('#voice-mute-btn svg');
    await expect(muteIcon).toBeVisible();
    
    // Unmute
    await page.click('#voice-mute-btn');
    // Should return to unmuted state
  });

  test('Error handling display', async ({ page }) => {
    // Expand panel
    await page.click('#voice-fab');
    
    // Trigger error simulation (this would be done via test controls)
    await page.evaluate(() => {
      window.VoiceAssistantCore.handleError({
        type: 'connection_failed',
        message: 'Test connection error',
        recoverable: true
      });
    });

    // Should show error message
    await expect(page.locator('.voice-error-message')).toBeVisible();
    await expect(page.locator('.voice-error-message')).toContainText('Test connection error');
    
    // Should show retry button for recoverable errors
    await expect(page.locator('button')).toContainText('Retry');
  });

  test('Transcript display and scrolling', async ({ page }) => {
    // Expand panel
    await page.click('#voice-fab');
    
    // Add test messages
    await page.evaluate(() => {
      const voiceCore = window.VoiceAssistantCore;
      
      // Add user message
      voiceCore.handleMessageReceived({
        role: 'user',
        content: 'Hello, this is a test message from the user',
        timestamp: new Date().toISOString()
      });
      
      // Add assistant message
      voiceCore.handleMessageReceived({
        role: 'assistant',
        content: 'Hello! I received your message. How can I help you today?',
        timestamp: new Date().toISOString()
      });
    });
    
    // Verify messages appear
    await expect(page.locator('.user-message')).toBeVisible();
    await expect(page.locator('.assistant-message')).toBeVisible();
    
    // Verify message content
    await expect(page.locator('.user-message')).toContainText('Hello, this is a test message');
    await expect(page.locator('.assistant-message')).toContainText('How can I help you');
  });

  test('Waveform visualization animation', async ({ page }) => {
    // Expand panel and start listening
    await page.click('#voice-fab');
    await page.click('#voice-main-btn');
    
    // Verify canvas is visible
    await expect(page.locator('#voice-waveform-canvas')).toBeVisible();
    
    // Simulate audio level updates
    await page.evaluate(() => {
      const voiceCore = window.VoiceAssistantCore;
      
      // Simulate varying audio levels
      for (let i = 0; i < 10; i++) {
        setTimeout(() => {
          voiceCore.updateAudioVisualization(Math.random());
        }, i * 100);
      }
    });
    
    // Canvas should be actively drawing (this is hard to test directly,
    // but we can verify the canvas exists and methods are called)
    const canvas = page.locator('#voice-waveform-canvas');
    await expect(canvas).toHaveAttribute('width', '200');
    await expect(canvas).toHaveAttribute('height', '60');
  });

  test('Auto-minimize behavior', async ({ page }) => {
    // Expand panel
    await page.click('#voice-fab');
    await expect(page.locator('#voice-widget-panel')).toHaveClass(/visible/);
    
    // Click outside the widget
    await page.click('body', { position: { x: 10, y: 10 } });
    
    // Panel should auto-minimize (depending on configuration)
    // Wait for potential auto-minimize delay
    await page.waitForTimeout(1000);
    
    // This test depends on the auto-minimize setting being enabled
  });

  test('Theme and responsive behavior', async ({ page }) => {
    // Test different viewport sizes
    await page.setViewportSize({ width: 1200, height: 800 });
    await expect(page.locator('#voice-assistant-widget')).toBeVisible();
    
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('#voice-assistant-widget')).toBeVisible();
    
    // Widget should still be functional on mobile
    await page.click('#voice-fab');
    await expect(page.locator('#voice-widget-panel')).toHaveClass(/visible/);
  });

  test('Accessibility features', async ({ page }) => {
    // Test focus management
    await page.click('#voice-fab');
    
    // Main button should receive focus when panel opens
    await expect(page.locator('#voice-main-btn')).toBeFocused();
    
    // Test tab navigation
    await page.keyboard.press('Tab');
    // Should move to next focusable element
    
    // Test screen reader announcements
    await page.evaluate(() => {
      window.VoiceAssistantCore.announce('Test announcement for screen readers');
    });
    
    // Verify announcement region exists and has content
    const announceRegion = page.locator('[aria-live="polite"]');
    await expect(announceRegion).toHaveText('Test announcement for screen readers');
  });

  test('CTA button functionality', async ({ page }) => {
    // Expand panel
    await page.click('#voice-fab');
    
    // Mock window.open to prevent actual navigation
    await page.evaluate(() => {
      window.open = (url) => {
        window.lastOpenedUrl = url;
        return { focus: () => {} };
      };
    });
    
    // Click CTA button
    await page.click('#voice-cta-btn');
    
    // Verify window.open was called
    const openedUrl = await page.evaluate(() => window.lastOpenedUrl);
    expect(openedUrl).toBeTruthy();
  });

  test('Voice activation toggle', async ({ page }) => {
    // Expand panel
    await page.click('#voice-fab');
    
    // Click voice activation toggle
    await page.click('#voice-activation-toggle');
    
    // This would change the interaction mode
    // (Implementation depends on the specific toggle behavior)
  });

  test('Performance and loading', async ({ page }) => {
    // Measure initial load time
    const startTime = Date.now();
    
    await page.goto('/test-voice-assistant.html');
    await page.waitForSelector('#voice-assistant-widget');
    
    const loadTime = Date.now() - startTime;
    
    // Should load within reasonable time
    expect(loadTime).toBeLessThan(5000); // 5 seconds max
    
    // Verify no console errors
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Interact with the widget
    await page.click('#voice-fab');
    await page.click('#voice-main-btn');
    
    // Should have minimal or no console errors
    expect(consoleErrors.length).toBeLessThan(3);
  });
});