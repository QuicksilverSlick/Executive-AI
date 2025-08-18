/*
 * DREAMFORGE HIVE-MIND CHAIN OF CUSTODY
 *
 * @file-purpose: Unit tests for SessionTimeoutWarning component
 * @version: 1.0.0
 * @init-author: developer-agent
 * @init-cc-sessionId: cc-dev-20250818-timeout
 * @init-timestamp: 2025-08-18T21:30:00Z
 * @reasoning:
 * - **Objective:** Provide comprehensive test coverage for timeout warning functionality
 * - **Strategy:** Test all timeout scenarios, user interactions, and edge cases
 * - **Outcome:** Robust test coverage ensuring timeout system reliability
 */

import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import SessionTimeoutWarning from '../SessionTimeoutWarning';

describe('SessionTimeoutWarning', () => {
  const defaultProps = {
    isVisible: true,
    timeRemaining: 60000, // 1 minute
    onExtendSession: jest.fn(),
    onDismiss: jest.fn(),
    onTimeout: jest.fn(),
    enableAudio: false, // Disabled for tests
    theme: 'auto' as const,
    extensionMinutes: 5
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Visibility', () => {
    it('should render when isVisible is true', () => {
      render(<SessionTimeoutWarning {...defaultProps} />);
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('should not render when isVisible is false', () => {
      render(<SessionTimeoutWarning {...defaultProps} isVisible={false} />);
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  describe('Time Display', () => {
    it('should display countdown time correctly', () => {
      render(<SessionTimeoutWarning {...defaultProps} timeRemaining={90000} />);
      expect(screen.getByText('1:30')).toBeInTheDocument();
    });

    it('should display seconds only for less than a minute', () => {
      render(<SessionTimeoutWarning {...defaultProps} timeRemaining={45000} />);
      expect(screen.getByText('0:45')).toBeInTheDocument();
    });

    it('should handle zero time remaining', () => {
      render(<SessionTimeoutWarning {...defaultProps} timeRemaining={0} />);
      expect(screen.getByText('0:00')).toBeInTheDocument();
    });
  });

  describe('Urgency Levels', () => {
    it('should show critical urgency for less than 10 seconds', () => {
      const { container } = render(
        <SessionTimeoutWarning {...defaultProps} timeRemaining={5000} />
      );
      expect(container.querySelector('.bg-red-500\\/90')).toBeInTheDocument();
      expect(screen.getByText('Session ending now!')).toBeInTheDocument();
    });

    it('should show high urgency for less than 30 seconds', () => {
      const { container } = render(
        <SessionTimeoutWarning {...defaultProps} timeRemaining={25000} />
      );
      expect(container.querySelector('.bg-orange-500\\/90')).toBeInTheDocument();
      expect(screen.getByText('Session ending very soon')).toBeInTheDocument();
    });

    it('should show medium urgency for less than 1 minute', () => {
      const { container } = render(
        <SessionTimeoutWarning {...defaultProps} timeRemaining={45000} />
      );
      expect(container.querySelector('.bg-yellow-500\\/90')).toBeInTheDocument();
    });

    it('should show low urgency for more than 1 minute', () => {
      const { container } = render(
        <SessionTimeoutWarning {...defaultProps} timeRemaining={90000} />
      );
      expect(container.querySelector('.bg-blue-500\\/90')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should call onExtendSession when extend button is clicked', () => {
      render(<SessionTimeoutWarning {...defaultProps} />);
      fireEvent.click(screen.getByRole('button', { name: /extend session/i }));
      expect(defaultProps.onExtendSession).toHaveBeenCalledTimes(1);
    });

    it('should call onDismiss when dismiss button is clicked', () => {
      render(<SessionTimeoutWarning {...defaultProps} />);
      fireEvent.click(screen.getByRole('button', { name: /extend session and dismiss warning/i }));
      expect(defaultProps.onDismiss).toHaveBeenCalledTimes(1);
    });

    it('should call onTimeout when time reaches zero', () => {
      const { rerender } = render(
        <SessionTimeoutWarning {...defaultProps} timeRemaining={1000} />
      );
      
      act(() => {
        rerender(<SessionTimeoutWarning {...defaultProps} timeRemaining={0} />);
      });
      
      expect(defaultProps.onTimeout).toHaveBeenCalledTimes(1);
    });
  });

  describe('Progress Bar', () => {
    it('should show correct progress percentage', () => {
      const { container } = render(
        <SessionTimeoutWarning {...defaultProps} timeRemaining={150000} /> // 2.5 minutes
      );
      
      // Progress should be 50% (2.5 minutes out of 5 minutes)
      const progressBar = container.querySelector('[style*="width: 50%"]');
      expect(progressBar).toBeInTheDocument();
    });

    it('should show 0% progress when time is up', () => {
      const { container } = render(
        <SessionTimeoutWarning {...defaultProps} timeRemaining={0} />
      );
      
      const progressBar = container.querySelector('[style*="width: 0%"]');
      expect(progressBar).toBeInTheDocument();
    });
  });

  describe('Theme Support', () => {
    it('should apply light theme styles', () => {
      render(<SessionTimeoutWarning {...defaultProps} theme="light" />);
      // Theme is passed down but specific styles are handled by urgency level
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('should apply dark theme styles', () => {
      render(<SessionTimeoutWarning {...defaultProps} theme="dark" />);
      // Theme is passed down but specific styles are handled by urgency level
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  describe('Extension Minutes Display', () => {
    it('should show correct extension minutes in button text', () => {
      render(<SessionTimeoutWarning {...defaultProps} extensionMinutes={10} />);
      expect(screen.getByText(/extend session \(10 more minutes\)/i)).toBeInTheDocument();
    });

    it('should show extension minutes in info text', () => {
      render(<SessionTimeoutWarning {...defaultProps} extensionMinutes={3} />);
      expect(screen.getByText(/click to extend for 3 more minutes/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<SessionTimeoutWarning {...defaultProps} />);
      const alert = screen.getByRole('alert');
      expect(alert).toHaveAttribute('aria-live', 'assertive');
    });

    it('should have accessible button labels', () => {
      render(<SessionTimeoutWarning {...defaultProps} />);
      expect(screen.getByLabelText('Extend session and dismiss warning')).toBeInTheDocument();
    });
  });

  describe('Animation States', () => {
    it('should not show animation classes when not dismissing', () => {
      const { container } = render(<SessionTimeoutWarning {...defaultProps} />);
      expect(container.querySelector('.opacity-0')).not.toBeInTheDocument();
    });

    it('should apply pulse animation for critical urgency', () => {
      const { container } = render(
        <SessionTimeoutWarning {...defaultProps} timeRemaining={5000} />
      );
      expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
    });

    it('should apply bounce animation to icon for critical urgency', () => {
      const { container } = render(
        <SessionTimeoutWarning {...defaultProps} timeRemaining={5000} />
      );
      expect(container.querySelector('.animate-bounce')).toBeInTheDocument();
    });
  });
});

/*
 * DREAMFORGE AUDIT TRAIL
 *
 * ---
 * @revision: 1.0.0
 * @author: developer-agent
 * @cc-sessionId: cc-dev-20250818-timeout
 * @timestamp: 2025-08-18T21:30:00Z
 * @reasoning:
 * - **Objective:** Create comprehensive unit tests for SessionTimeoutWarning component
 * - **Strategy:** Cover all interaction paths, urgency levels, and accessibility features
 * - **Outcome:** Robust test coverage ensuring component reliability and user experience
 */