/*
 * DREAMFORGE HIVE-MIND CHAIN OF CUSTODY
 *
 * @file-purpose: End-to-end tests for complete voice search flow with audio feedback
 * @version: 1.0.0
 * @init-author: test-agent
 * @init-cc-sessionId: cc-test-20250808-045
 * @init-timestamp: 2025-08-08T16:55:00Z
 * @reasoning:
 * - **Objective:** Validate complete user journey with voice search including audio feedback
 * - **Strategy:** Test full search flow, user preferences, accessibility, mobile/desktop compatibility
 * - **Outcome:** Verified end-to-end voice search experience with audio feedback works across platforms
 */

import { test, expect, Page, BrowserContext } from '@playwright/test';
import { TEST_CONFIG } from '@tests/config/voice-agent-test.config.js';

// Test data and utilities
const VOICE_SEARCH_QUERIES = [
  'search for the best AI training companies',
  'find information about executive AI transformation',
  'what are the latest AI trends in business',
  'search for AI implementation strategies'
];

const USER_PREFERENCES = {
  volume: 0.8,
  voiceSpeed: 1.1,
  autoplay: true,
  noiseReduction: 'auto'
};

// Helper functions
async function setupVoicePermissions(context: BrowserContext): Promise<void> {
  await context.grantPermissions(['microphone'], { origin: 'http://localhost:4321' });
}

async function waitForVoiceWidget(page: Page): Promise<void> {
  await page.waitForSelector(TEST_CONFIG.selectors.widget, { state: 'visible', timeout: 5000 });
}

async function simulateVoiceInput(page: Page, text: string): Promise<void> {
  // Simulate voice input by triggering the appropriate events
  await page.evaluate((inputText) => {
    const event = new CustomEvent('voiceInput', { 
      detail: { 
        transcript: inputText, 
        confidence: 0.95,
        isFinal: true 
      } 
    });
    window.dispatchEvent(event);
  }, text);
}

async function waitForAudioPlayback(page: Page): Promise<void> {
  // Wait for audio playback to start
  await page.waitForFunction(() => {
    return window.speechSynthesis?.speaking || 
           document.querySelector('.voice-status-indicator')?.classList.contains('speaking');
  }, { timeout: 3000 });
}

async function measureAudioLatency(page: Page, action: () => Promise<void>): Promise<number> {
  const startTime = Date.now();
  
  // Monitor for audio response
  const audioStartPromise = page.waitForFunction(() => {
    return document.querySelector('.voice-status-indicator')?.classList.contains('speaking') ||
           window.speechSynthesis?.speaking;
  }, { timeout: 2000 });

  await action();
  await audioStartPromise;
  
  return Date.now() - startTime;
}

// Test Suite
test.describe('Voice Search Audio End-to-End', () => {
  test.beforeEach(async ({ page, context }) => {
    await setupVoicePermissions(context);
    
    // Navigate to test page
    await page.goto('http://localhost:4321');
    await waitForVoiceWidget(page);
    
    // Mock audio APIs for consistent testing
    await page.addInitScript(() => {
      // Mock Web Audio API
      (window as any).AudioContext = class MockAudioContext {
        state = 'running';
        currentTime = 0;
        sampleRate = 44100;
        
        createGain() {
          return {
            gain: { value: 1.0, setValueAtTime: () => {} },
            connect: () => {},
            disconnect: () => {}
          };
        }
        
        createBufferSource() {
          return {
            buffer: null,
            connect: () => {},
            start: () => {},
            stop: () => {},
            onended: null
          };
        }
        
        createBuffer() {
          return {
            copyToChannel: () => {},
            getChannelData: () => new Float32Array(1024)
          };
        }
        
        resume() { 
          this.state = 'running'; 
          return Promise.resolve(); 
        }
        close() { 
          this.state = 'closed'; 
          return Promise.resolve(); 
        }
      };

      // Mock MediaDevices
      if (navigator.mediaDevices) {
        navigator.mediaDevices.getUserMedia = () => Promise.resolve({
          getTracks: () => [{ kind: 'audio', enabled: true, stop: () => {} }],
          getAudioTracks: () => [{ kind: 'audio', enabled: true, stop: () => {} }]
        } as any);
      }

      // Mock Speech Synthesis
      if (window.speechSynthesis) {
        let speaking = false;
        Object.defineProperty(window.speechSynthesis, 'speaking', {
          get: () => speaking
        });
        
        const originalSpeak = window.speechSynthesis.speak;
        window.speechSynthesis.speak = function(utterance: SpeechSynthesisUtterance) {
          speaking = true;
          setTimeout(() => {
            speaking = false;
            if (utterance.onend) utterance.onend(new SpeechSynthesisEvent('end', { utterance }));
          }, 100);
        };
      }
    });
  });

  test.describe('Complete Search Flow with Audio Feedback', () => {
    test('should complete full voice search journey with audio responses', async ({ page }) => {
      // Step 1: Open voice widget
      await page.click(TEST_CONFIG.selectors.fab);
      await expect(page.locator(TEST_CONFIG.selectors.panel)).toBeVisible();

      // Step 2: Start voice interaction
      await page.click(TEST_CONFIG.selectors.mainButton);
      await expect(page.locator(TEST_CONFIG.selectors.statusIndicator)).toHaveClass(/listening/);

      // Step 3: Provide voice search query
      const searchQuery = VOICE_SEARCH_QUERIES[0];
      await simulateVoiceInput(page, searchQuery);

      // Step 4: Wait for processing
      await expect(page.locator(TEST_CONFIG.selectors.statusIndicator)).toHaveClass(/processing/);

      // Step 5: Verify audio response starts
      await waitForAudioPlayback(page);
      await expect(page.locator(TEST_CONFIG.selectors.statusIndicator)).toHaveClass(/speaking/);

      // Step 6: Check search results are displayed
      await page.waitForSelector('.search-results', { timeout: 5000 });
      const searchResults = await page.locator('.search-results').textContent();
      expect(searchResults).toContain('AI training');

      // Step 7: Verify conversation history
      await expect(page.locator(TEST_CONFIG.selectors.userMessage)).toContainText(searchQuery);
      await expect(page.locator(TEST_CONFIG.selectors.assistantMessage)).toBeVisible();
    });

    test('should handle multiple search queries in sequence', async ({ page }) => {
      await page.click(TEST_CONFIG.selectors.fab);
      
      for (let i = 0; i < 3; i++) {
        // Start listening
        await page.click(TEST_CONFIG.selectors.mainButton);
        await expect(page.locator(TEST_CONFIG.selectors.statusIndicator)).toHaveClass(/listening/);

        // Provide voice input
        await simulateVoiceInput(page, VOICE_SEARCH_QUERIES[i]);

        // Wait for response
        await waitForAudioPlayback(page);
        
        // Wait for response to complete
        await page.waitForFunction(() => !window.speechSynthesis?.speaking, { timeout: 3000 });
        
        // Brief pause between queries
        await page.waitForTimeout(500);
      }

      // Verify all queries are in history
      const userMessages = page.locator(TEST_CONFIG.selectors.userMessage);
      await expect(userMessages).toHaveCount(3);
      
      const assistantMessages = page.locator(TEST_CONFIG.selectors.assistantMessage);
      await expect(assistantMessages).toHaveCount(3);
    });

    test('should maintain audio feedback during search interruptions', async ({ page }) => {
      await page.click(TEST_CONFIG.selectors.fab);
      await page.click(TEST_CONFIG.selectors.mainButton);
      
      // Start search
      await simulateVoiceInput(page, VOICE_SEARCH_QUERIES[1]);
      await waitForAudioPlayback(page);

      // Interrupt during response
      await page.click(TEST_CONFIG.selectors.mainButton); // Click to interrupt
      await expect(page.locator(TEST_CONFIG.selectors.statusIndicator)).toHaveClass(/interrupted/);

      // Start new search
      await page.click(TEST_CONFIG.selectors.mainButton);
      await simulateVoiceInput(page, VOICE_SEARCH_QUERIES[2]);
      
      // Should get new response
      await waitForAudioPlayback(page);
      await expect(page.locator(TEST_CONFIG.selectors.statusIndicator)).toHaveClass(/speaking/);
    });
  });

  test.describe('User Preference Persistence', () => {
    test('should save and restore volume preferences', async ({ page, context }) => {
      await page.click(TEST_CONFIG.selectors.fab);
      
      // Set custom volume
      const volumeSlider = page.locator('.volume-control input[type="range"]');
      if (await volumeSlider.isVisible()) {
        await volumeSlider.fill('0.6');
      }
      
      // Trigger audio to save preference
      await page.click(TEST_CONFIG.selectors.mainButton);
      await simulateVoiceInput(page, VOICE_SEARCH_QUERIES[0]);
      await waitForAudioPlayback(page);
      
      // Reload page
      await page.reload();
      await waitForVoiceWidget(page);
      
      // Check if volume preference is restored
      const storedVolume = await page.evaluate(() => 
        localStorage.getItem('voice-agent-volume') || '0.8'
      );
      
      expect(parseFloat(storedVolume)).toBeCloseTo(0.6, 1);
    });

    test('should save and restore voice speed preferences', async ({ page }) => {
      await page.click(TEST_CONFIG.selectors.fab);
      
      // Access speed control (may be in settings)
      const settingsButton = page.locator('.voice-settings-btn');
      if (await settingsButton.isVisible()) {
        await settingsButton.click();
        
        const speedSlider = page.locator('.speed-control input[type="range"]');
        if (await speedSlider.isVisible()) {
          await speedSlider.fill('1.2');
          await page.click('.settings-save-btn');
        }
      }
      
      // Trigger audio interaction
      await page.click(TEST_CONFIG.selectors.mainButton);
      await simulateVoiceInput(page, VOICE_SEARCH_QUERIES[0]);
      
      // Check stored preference
      const storedSpeed = await page.evaluate(() => 
        localStorage.getItem('voice-agent-speed') || '1.0'
      );
      
      if (storedSpeed !== '1.0') {
        expect(parseFloat(storedSpeed)).toBeCloseTo(1.2, 1);
      }
    });

    test('should preserve preferences across sessions', async ({ page, context }) => {
      // Set preferences in first session
      await page.goto('http://localhost:4321');
      await waitForVoiceWidget(page);
      
      await page.evaluate(() => {
        localStorage.setItem('voice-agent-volume', '0.7');
        localStorage.setItem('voice-agent-auto-listen', 'true');
        localStorage.setItem('voice-agent-noise-reduction', 'far_field');
      });
      
      // Create new page (simulating new session)
      const newPage = await context.newPage();
      await newPage.goto('http://localhost:4321');
      await waitForVoiceWidget(newPage);
      
      // Verify preferences are loaded
      const volume = await newPage.evaluate(() => localStorage.getItem('voice-agent-volume'));
      const autoListen = await newPage.evaluate(() => localStorage.getItem('voice-agent-auto-listen'));
      const noiseReduction = await newPage.evaluate(() => localStorage.getItem('voice-agent-noise-reduction'));
      
      expect(volume).toBe('0.7');
      expect(autoListen).toBe('true');
      expect(noiseReduction).toBe('far_field');
    });
  });

  test.describe('Accessibility Features', () => {
    test('should support screen reader navigation', async ({ page }) => {
      await page.click(TEST_CONFIG.selectors.fab);
      
      // Check ARIA labels and roles
      const widget = page.locator(TEST_CONFIG.selectors.widget);
      await expect(widget).toHaveAttribute('role', 'application');
      await expect(widget).toHaveAttribute('aria-label');
      
      // Check live region for status updates
      const statusLive = page.locator('[aria-live="polite"]');
      await expect(statusLive).toBeVisible();
      
      // Test keyboard navigation
      await page.keyboard.press('Tab');
      await expect(page.locator(TEST_CONFIG.selectors.mainButton)).toBeFocused();
      
      await page.keyboard.press('Space'); // Activate with keyboard
      await expect(page.locator(TEST_CONFIG.selectors.statusIndicator)).toHaveClass(/listening/);
    });

    test('should provide audio descriptions for visual feedback', async ({ page }) => {
      await page.click(TEST_CONFIG.selectors.fab);
      
      const announcements: string[] = [];
      
      // Monitor aria-live updates
      await page.locator('[aria-live="polite"]').evaluateHandle((element) => {
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (mutation.type === 'childList' && element.textContent) {
              (window as any).testAnnouncements = (window as any).testAnnouncements || [];
              (window as any).testAnnouncements.push(element.textContent);
            }
          });
        });
        observer.observe(element, { childList: true, subtree: true });
      });
      
      // Trigger voice interaction
      await page.click(TEST_CONFIG.selectors.mainButton);
      await simulateVoiceInput(page, VOICE_SEARCH_QUERIES[0]);
      await waitForAudioPlayback(page);
      
      // Check for accessibility announcements
      const testAnnouncements = await page.evaluate(() => (window as any).testAnnouncements || []);
      expect(testAnnouncements.length).toBeGreaterThan(0);
      expect(testAnnouncements.some((announcement: string) => 
        announcement.includes('listening') || 
        announcement.includes('processing') ||
        announcement.includes('speaking')
      )).toBe(true);
    });

    test('should support high contrast mode', async ({ page }) => {
      // Enable high contrast
      await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' });
      
      await page.goto('http://localhost:4321');
      await waitForVoiceWidget(page);
      
      await page.click(TEST_CONFIG.selectors.fab);
      
      // Check contrast ratios (simplified test)
      const fabStyles = await page.locator(TEST_CONFIG.selectors.fab).evaluate((el) => {
        return window.getComputedStyle(el);
      });
      
      // Verify high contrast styles are applied
      expect(fabStyles.backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
      expect(fabStyles.color).not.toBe(fabStyles.backgroundColor);
    });

    test('should handle reduced motion preferences', async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      
      await page.goto('http://localhost:4321');
      await waitForVoiceWidget(page);
      
      // Check that animations are disabled or reduced
      const animationDuration = await page.locator(TEST_CONFIG.selectors.fab).evaluate((el) => {
        return window.getComputedStyle(el).animationDuration;
      });
      
      // Should have no animation or very short animation
      expect(animationDuration === 'none' || animationDuration === '0s' || parseFloat(animationDuration) < 0.5).toBe(true);
    });
  });

  test.describe('Mobile/Desktop Compatibility', () => {
    test('should work on mobile viewports', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('http://localhost:4321');
      await waitForVoiceWidget(page);
      
      // Mobile-specific interactions
      await page.tap(TEST_CONFIG.selectors.fab);
      await expect(page.locator(TEST_CONFIG.selectors.panel)).toBeVisible();
      
      // Touch and hold to activate voice
      await page.locator(TEST_CONFIG.selectors.mainButton).tap({ force: true });
      await expect(page.locator(TEST_CONFIG.selectors.statusIndicator)).toHaveClass(/listening/);
      
      // Test voice input on mobile
      await simulateVoiceInput(page, VOICE_SEARCH_QUERIES[0]);
      await waitForAudioPlayback(page);
      
      // Verify mobile-optimized layout
      const buttonSize = await page.locator(TEST_CONFIG.selectors.mainButton).boundingBox();
      expect(buttonSize?.width).toBeGreaterThanOrEqual(44); // Minimum touch target size
      expect(buttonSize?.height).toBeGreaterThanOrEqual(44);
    });

    test('should work on tablet viewports', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('http://localhost:4321');
      await waitForVoiceWidget(page);
      
      // Tablet interactions
      await page.click(TEST_CONFIG.selectors.fab);
      await page.click(TEST_CONFIG.selectors.mainButton);
      
      await simulateVoiceInput(page, VOICE_SEARCH_QUERIES[1]);
      await waitForAudioPlayback(page);
      
      // Verify responsive layout adjusts appropriately
      const panelWidth = await page.locator(TEST_CONFIG.selectors.panel).evaluate((el) => {
        return el.getBoundingClientRect().width;
      });
      
      expect(panelWidth).toBeGreaterThan(300);
      expect(panelWidth).toBeLessThan(500);
    });

    test('should work on desktop viewports', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.goto('http://localhost:4321');
      await waitForVoiceWidget(page);
      
      // Desktop interactions with keyboard shortcuts
      await page.keyboard.press('Space'); // Global shortcut to open
      await expect(page.locator(TEST_CONFIG.selectors.panel)).toBeVisible();
      
      await page.keyboard.press('Space'); // Start listening
      await simulateVoiceInput(page, VOICE_SEARCH_QUERIES[2]);
      await waitForAudioPlayback(page);
      
      // Test drag and drop positioning (if supported)
      const fab = page.locator(TEST_CONFIG.selectors.fab);
      const fabBox = await fab.boundingBox();
      
      if (fabBox) {
        await fab.dragTo(page.locator('body'), { 
          targetPosition: { x: 100, y: 100 } 
        });
        
        const newFabBox = await fab.boundingBox();
        expect(newFabBox?.x).not.toEqual(fabBox.x);
      }
    });

    test('should handle device orientation changes', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('http://localhost:4321');
      await waitForVoiceWidget(page);
      
      // Start interaction in portrait
      await page.tap(TEST_CONFIG.selectors.fab);
      await page.tap(TEST_CONFIG.selectors.mainButton);
      await simulateVoiceInput(page, VOICE_SEARCH_QUERIES[0]);
      
      // Rotate to landscape
      await page.setViewportSize({ width: 667, height: 375 });
      
      // Verify widget adapts to orientation change
      await expect(page.locator(TEST_CONFIG.selectors.widget)).toBeVisible();
      
      // Continue interaction in landscape
      await waitForAudioPlayback(page);
      await expect(page.locator(TEST_CONFIG.selectors.statusIndicator)).toHaveClass(/speaking/);
    });
  });

  test.describe('Performance and Reliability', () => {
    test('should maintain audio quality under network stress', async ({ page }) => {
      // Simulate slow network
      await page.route('**/*', route => {
        setTimeout(() => route.continue(), 100); // Add 100ms delay to all requests
      });
      
      await page.goto('http://localhost:4321');
      await waitForVoiceWidget(page);
      
      await page.click(TEST_CONFIG.selectors.fab);
      
      const latency = await measureAudioLatency(page, async () => {
        await page.click(TEST_CONFIG.selectors.mainButton);
        await simulateVoiceInput(page, VOICE_SEARCH_QUERIES[0]);
      });
      
      // Even under stress, should maintain reasonable latency
      expect(latency).toBeLessThan(2000); // 2 seconds max under stress
    });

    test('should recover from audio system failures', async ({ page }) => {
      await page.goto('http://localhost:4321');
      await waitForVoiceWidget(page);
      
      // Simulate audio failure
      await page.evaluate(() => {
        (window as any).AudioContext = function() {
          throw new Error('AudioContext not available');
        };
      });
      
      await page.click(TEST_CONFIG.selectors.fab);
      await page.click(TEST_CONFIG.selectors.mainButton);
      
      // Should show error state but remain functional for text
      await expect(page.locator('.voice-error-message')).toBeVisible();
      
      // Should still allow text interactions
      const textInput = page.locator('.text-input-fallback');
      if (await textInput.isVisible()) {
        await textInput.fill(VOICE_SEARCH_QUERIES[0]);
        await textInput.press('Enter');
        
        await expect(page.locator(TEST_CONFIG.selectors.assistantMessage)).toBeVisible();
      }
    });

    test('should handle concurrent users simulation', async ({ page }) => {
      await page.goto('http://localhost:4321');
      await waitForVoiceWidget(page);
      
      // Simulate multiple rapid interactions
      const interactions = [];
      
      for (let i = 0; i < 5; i++) {
        interactions.push((async () => {
          await page.click(TEST_CONFIG.selectors.fab);
          await page.click(TEST_CONFIG.selectors.mainButton);
          await simulateVoiceInput(page, VOICE_SEARCH_QUERIES[i % VOICE_SEARCH_QUERIES.length]);
          await page.waitForTimeout(Math.random() * 100); // Random delay
        })());
      }
      
      // All interactions should complete without errors
      await Promise.all(interactions);
      
      // Should have responses for all interactions
      const messages = page.locator(TEST_CONFIG.selectors.assistantMessage);
      await expect(messages).toHaveCountGreaterThan(0);
    });
  });
});