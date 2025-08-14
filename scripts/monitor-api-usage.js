#!/usr/bin/env node

/*
 * DREAMFORGE HIVE-MIND CHAIN OF CUSTODY
 *
 * @file-purpose: API usage monitoring and security alert system
 * @version: 1.0.0
 * @init-author: developer-agent
 * @init-cc-sessionId: cc-unknown-20250806-243
 * @init-timestamp: 2025-08-06T00:00:00Z
 * @reasoning:
 * - **Objective:** Monitor API usage patterns and detect security issues
 * - **Strategy:** Real-time monitoring with anomaly detection and alerting
 * - **Outcome:** Proactive security monitoring for API key usage
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, appendFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createHash } from 'crypto';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m'
};

const logger = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✅${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}❌${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠️${colors.reset} ${msg}`),
  step: (step, msg) => console.log(`${colors.cyan}[${step}]${colors.reset} ${msg}`),
  header: (msg) => console.log(`\n${colors.bold}${colors.magenta}${msg}${colors.reset}\n`),
  debug: (msg) => console.log(`${colors.dim}${msg}${colors.reset}`)
};

/**
 * Load API key from environment
 */
function loadApiKey() {
  const envLocalPath = join(projectRoot, '.env.local');
  if (!existsSync(envLocalPath)) {
    throw new Error('.env.local file not found');
  }
  
  const content = readFileSync(envLocalPath, 'utf8');
  const match = content.match(/^OPENAI_API_KEY=(.+)$/m);
  
  if (!match || !match[1]) {
    throw new Error('OPENAI_API_KEY not found in .env.local');
  }
  
  return match[1];
}

/**
 * Get current API usage and rate limits
 */
async function getApiUsage(apiKey) {
  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'ExecutiveAI-Training-Monitor/1.0'
      }
    });
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    // Extract rate limit information from headers
    const rateLimitInfo = {
      requestsLimit: response.headers.get('x-ratelimit-limit-requests'),
      requestsRemaining: response.headers.get('x-ratelimit-remaining-requests'),
      requestsReset: response.headers.get('x-ratelimit-reset-requests'),
      tokensLimit: response.headers.get('x-ratelimit-limit-tokens'),
      tokensRemaining: response.headers.get('x-ratelimit-remaining-tokens'),
      tokensReset: response.headers.get('x-ratelimit-reset-tokens'),
      timestamp: new Date().toISOString()
    };
    
    return {
      success: true,
      rateLimits: rateLimitInfo,
      responseTime: Date.now()
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Test API with a small request to measure performance
 */
async function performanceTest(apiKey) {
  const startTime = Date.now();
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'ExecutiveAI-Training-Monitor/1.0'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 1,
        temperature: 0
      })
    });
    
    const responseTime = Date.now() - startTime;
    
    if (!response.ok) {
      throw new Error(`Performance test failed: ${response.status}`);
    }
    
    const data = await response.json();
    
    return {
      success: true,
      responseTime,
      usage: data.usage,
      model: data.model,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.message,
      responseTime: Date.now() - startTime,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Load historical usage data
 */
function loadHistoricalData() {
  const dataPath = join(projectRoot, '.security', 'usage-history.json');
  
  if (!existsSync(dataPath)) {
    return { entries: [] };
  }
  
  try {
    const content = readFileSync(dataPath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    logger.warn(`Could not load historical data: ${error.message}`);
    return { entries: [] };
  }
}

/**
 * Save usage data
 */
function saveUsageData(data) {
  const securityDir = join(projectRoot, '.security');
  if (!existsSync(securityDir)) {
    mkdirSync(securityDir, { recursive: true });
  }
  
  const dataPath = join(securityDir, 'usage-history.json');
  const historical = loadHistoricalData();
  
  historical.entries.push(data);
  
  // Keep only last 1000 entries to prevent file from growing too large
  if (historical.entries.length > 1000) {
    historical.entries = historical.entries.slice(-1000);
  }
  
  writeFileSync(dataPath, JSON.stringify(historical, null, 2));
}

/**
 * Analyze usage patterns for anomalies
 */
function analyzeUsagePatterns(currentData, historical) {
  const alerts = [];
  
  if (historical.entries.length < 5) {
    // Not enough historical data for analysis
    return alerts;
  }
  
  const recentEntries = historical.entries.slice(-10);
  
  // Check response time anomalies
  const avgResponseTime = recentEntries
    .filter(e => e.performanceTest?.success)
    .reduce((sum, e) => sum + e.performanceTest.responseTime, 0) / recentEntries.length;
  
  if (currentData.performanceTest?.success && currentData.performanceTest.responseTime > avgResponseTime * 3) {
    alerts.push({
      type: 'performance',
      severity: 'HIGH',
      message: `Response time (${currentData.performanceTest.responseTime}ms) is 3x higher than average (${Math.round(avgResponseTime)}ms)`
    });
  }
  
  // Check rate limit consumption
  if (currentData.rateLimits?.requestsRemaining && currentData.rateLimits?.requestsLimit) {
    const remainingPercentage = (parseInt(currentData.rateLimits.requestsRemaining) / parseInt(currentData.rateLimits.requestsLimit)) * 100;
    
    if (remainingPercentage < 10) {
      alerts.push({
        type: 'rate_limit',
        severity: 'HIGH',
        message: `Only ${Math.round(remainingPercentage)}% of API requests remaining`
      });
    } else if (remainingPercentage < 25) {
      alerts.push({
        type: 'rate_limit',
        severity: 'MEDIUM',
        message: `${Math.round(remainingPercentage)}% of API requests remaining`
      });
    }
  }
  
  // Check for consecutive failures
  const recentFailures = recentEntries.slice(-5).filter(e => !e.rateLimits || e.rateLimits.error);
  if (recentFailures.length >= 3) {
    alerts.push({
      type: 'connectivity',
      severity: 'CRITICAL',
      message: `${recentFailures.length} consecutive API failures detected`
    });
  }
  
  // Check for unusual token consumption
  const recentUsage = recentEntries
    .filter(e => e.performanceTest?.usage?.total_tokens)
    .map(e => e.performanceTest.usage.total_tokens);
  
  if (recentUsage.length > 3 && currentData.performanceTest?.usage?.total_tokens) {
    const avgTokens = recentUsage.reduce((sum, tokens) => sum + tokens, 0) / recentUsage.length;
    const currentTokens = currentData.performanceTest.usage.total_tokens;
    
    if (currentTokens > avgTokens * 5) {
      alerts.push({
        type: 'usage',
        severity: 'MEDIUM',
        message: `Token usage (${currentTokens}) is 5x higher than average (${Math.round(avgTokens)})`
      });
    }
  }
  
  return alerts;
}

/**
 * Log security alert
 */
function logSecurityAlert(alert) {
  const alertsDir = join(projectRoot, '.security');
  if (!existsSync(alertsDir)) {
    mkdirSync(alertsDir, { recursive: true });
  }
  
  const alertLogPath = join(alertsDir, 'security-alerts.log');
  const logEntry = `${new Date().toISOString()} [${alert.severity}] ${alert.type}: ${alert.message}\n`;
  
  appendFileSync(alertLogPath, logEntry);
}

/**
 * Generate usage report
 */
function generateUsageReport(currentData, historical, alerts) {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      apiConnectivity: currentData.rateLimits ? 'OK' : 'FAILED',
      performanceTest: currentData.performanceTest?.success ? 'PASSED' : 'FAILED',
      alertsCount: alerts.length,
      criticalAlerts: alerts.filter(a => a.severity === 'CRITICAL').length
    },
    currentStatus: {
      rateLimits: currentData.rateLimits,
      performance: currentData.performanceTest,
      responseTime: currentData.performanceTest?.responseTime
    },
    alerts: alerts,
    historicalSummary: {
      totalEntries: historical.entries.length,
      averageResponseTime: historical.entries
        .filter(e => e.performanceTest?.success)
        .reduce((sum, e, _, arr) => sum + e.performanceTest.responseTime / arr.length, 0),
      successRate: historical.entries.length > 0 ? 
        (historical.entries.filter(e => e.rateLimits && !e.rateLimits.error).length / historical.entries.length) * 100 : 0
    }
  };
  
  const reportPath = join(projectRoot, '.security', 'usage-report.json');
  writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  return { report, reportPath };
}

/**
 * Send alert notifications (placeholder for future implementation)
 */
function sendAlertNotifications(alerts) {
  // This could be extended to send:
  // - Email notifications
  // - Slack messages
  // - Webhook calls
  // - SMS alerts for critical issues
  
  const criticalAlerts = alerts.filter(a => a.severity === 'CRITICAL');
  const highAlerts = alerts.filter(a => a.severity === 'HIGH');
  
  if (criticalAlerts.length > 0) {
    logger.error(`🚨 CRITICAL: ${criticalAlerts.length} critical alerts detected!`);
  }
  
  if (highAlerts.length > 0) {
    logger.warn(`⚠️ WARNING: ${highAlerts.length} high-priority alerts detected`);
  }
  
  // Log all alerts to file
  alerts.forEach(alert => {
    logSecurityAlert(alert);
    
    const color = alert.severity === 'CRITICAL' ? colors.red :
                 alert.severity === 'HIGH' ? colors.yellow : colors.cyan;
    
    console.log(`  ${color}${alert.severity}${colors.reset}: ${alert.message}`);
  });
}

/**
 * Check for suspicious activities in logs
 */
function checkForSuspiciousActivity() {
  const suspicious = [];
  
  try {
    // Check for common attack patterns in logs
    const logFiles = [
      join(projectRoot, '.security', 'security-alerts.log'),
      join(projectRoot, '.security', 'api-access.log')
    ];
    
    logFiles.forEach(logFile => {
      if (existsSync(logFile)) {
        const content = readFileSync(logFile, 'utf8');
        const lines = content.split('\n').slice(-100); // Check last 100 lines
        
        // Check for rapid consecutive requests (potential DoS)
        const timestamps = lines
          .map(line => {
            const match = line.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})/);
            return match ? new Date(match[1]) : null;
          })
          .filter(Boolean);
        
        if (timestamps.length > 10) {
          const rapidRequests = timestamps.filter((ts, i) => {
            if (i === 0) return false;
            return ts - timestamps[i - 1] < 1000; // Less than 1 second apart
          });
          
          if (rapidRequests.length > 5) {
            suspicious.push({
              type: 'rapid_requests',
              severity: 'HIGH',
              message: `${rapidRequests.length} rapid API requests detected in logs`
            });
          }
        }
        
        // Check for authentication failures
        const authFailures = lines.filter(line => 
          line.includes('401') || line.includes('authentication') || line.includes('unauthorized')
        );
        
        if (authFailures.length > 3) {
          suspicious.push({
            type: 'auth_failures',
            severity: 'HIGH',
            message: `${authFailures.length} authentication-related errors in recent logs`
          });
        }
      }
    });
    
  } catch (error) {
    logger.debug(`Could not analyze logs for suspicious activity: ${error.message}`);
  }
  
  return suspicious;
}

/**
 * Main monitoring function
 */
async function main() {
  const args = process.argv.slice(2);
  const isWatch = args.includes('--watch');
  const interval = args.includes('--interval') ? 
    parseInt(args[args.indexOf('--interval') + 1]) * 1000 : 30000; // Default 30 seconds
  
  logger.header('🔍 API Usage Security Monitor');
  
  if (isWatch) {
    logger.info(`Starting continuous monitoring (${interval/1000}s intervals)`);
    logger.info('Press Ctrl+C to stop');
  }
  
  const runMonitoring = async () => {
    try {
      // Load API key
      const apiKey = loadApiKey();
      const keyHash = createHash('sha256').update(apiKey).digest('hex').substring(0, 16);
      
      logger.debug(`Monitoring key: ${keyHash}`);
      
      // Get current usage data
      logger.step('1/6', 'Checking API connectivity and rate limits...');
      const rateLimitData = await getApiUsage(apiKey);
      
      if (rateLimitData.success) {
        const remaining = rateLimitData.rateLimits.requestsRemaining;
        const limit = rateLimitData.rateLimits.requestsLimit;
        logger.success(`API accessible - ${remaining}/${limit} requests remaining`);
      } else {
        logger.error(`API check failed: ${rateLimitData.error}`);
      }
      
      // Performance test
      logger.step('2/6', 'Running performance test...');
      const performanceData = await performanceTest(apiKey);
      
      if (performanceData.success) {
        logger.success(`Performance test passed - ${performanceData.responseTime}ms response time`);
      } else {
        logger.error(`Performance test failed: ${performanceData.error}`);
      }
      
      // Combine data
      const currentData = {
        timestamp: new Date().toISOString(),
        keyHash,
        rateLimits: rateLimitData.success ? rateLimitData.rateLimits : { error: rateLimitData.error },
        performanceTest: performanceData
      };
      
      // Load historical data
      logger.step('3/6', 'Loading historical usage data...');
      const historical = loadHistoricalData();
      logger.info(`Loaded ${historical.entries.length} historical entries`);
      
      // Analyze patterns
      logger.step('4/6', 'Analyzing usage patterns...');
      const alerts = analyzeUsagePatterns(currentData, historical);
      
      // Check for suspicious activity
      logger.step('5/6', 'Checking for suspicious activity...');
      const suspiciousActivity = checkForSuspiciousActivity();
      alerts.push(...suspiciousActivity);
      
      // Generate report
      logger.step('6/6', 'Generating usage report...');
      const { report, reportPath } = generateUsageReport(currentData, historical, alerts);
      
      // Save current data to history
      saveUsageData(currentData);
      
      // Handle alerts
      if (alerts.length > 0) {
        logger.warn(`${alerts.length} security alerts detected:`);
        sendAlertNotifications(alerts);
      } else {
        logger.success('No security alerts detected');
      }
      
      // Display summary
      if (!isWatch) {
        logger.header('📊 Monitoring Summary');
        
        console.log(`${colors.blue}Current Status:${colors.reset}`);
        console.log(`• API Connectivity: ${report.summary.apiConnectivity}`);
        console.log(`• Performance Test: ${report.summary.performanceTest}`);
        console.log(`• Response Time: ${currentData.performanceTest?.responseTime || 'N/A'}ms`);
        console.log(`• Alerts: ${alerts.length} (${report.summary.criticalAlerts} critical)`);
        
        if (historical.entries.length > 0) {
          console.log(`\n${colors.blue}Historical Summary:${colors.reset}`);
          console.log(`• Success Rate: ${Math.round(report.historicalSummary.successRate)}%`);
          console.log(`• Average Response Time: ${Math.round(report.historicalSummary.averageResponseTime)}ms`);
          console.log(`• Total Monitored Requests: ${report.historicalSummary.totalEntries}`);
        }
        
        console.log(`\n${colors.blue}Reports:${colors.reset}`);
        console.log(`• Usage Report: ${reportPath}`);
        console.log(`• Alert Log: .security/security-alerts.log`);
        console.log(`• Usage History: .security/usage-history.json`);
        
        console.log(`\n${colors.yellow}Next Steps:${colors.reset}`);
        console.log('• Review alerts and take action if needed');
        console.log('• Run with --watch for continuous monitoring');
        console.log('• Check usage trends in historical data');
        
        if (alerts.some(a => a.severity === 'CRITICAL')) {
          console.log(`\n${colors.red}⚠️  CRITICAL ALERTS DETECTED${colors.reset}`);
          console.log('Immediate action may be required - check alert details above');
        }
      }
      
    } catch (error) {
      logger.error(`Monitoring failed: ${error.message}`);
      if (!isWatch) {
        console.error(error.stack);
        process.exit(1);
      }
    }
  };
  
  // Run monitoring
  if (isWatch) {
    // Continuous monitoring mode
    await runMonitoring();
    setInterval(runMonitoring, interval);
  } else {
    // Single run mode
    await runMonitoring();
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  logger.info('\nMonitoring stopped by user');
  process.exit(0);
});

// Run monitor
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    logger.error(`Monitor failed: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  });
}

/*
 * DREAMFORGE AUDIT TRAIL
 *
 * ---
 * @revision: 1.0.0
 * @author: developer-agent
 * @cc-sessionId: cc-unknown-20250806-243
 * @timestamp: 2025-08-06T00:00:00Z
 * @reasoning:
 * - **Objective:** Create comprehensive API usage monitoring system
 * - **Strategy:** Real-time monitoring with pattern analysis and alerting
 * - **Outcome:** Proactive security monitoring with historical analysis
 */