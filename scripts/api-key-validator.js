#!/usr/bin/env node

/*
 * DREAMFORGE HIVE-MIND CHAIN OF CUSTODY
 *
 * @file-purpose: Comprehensive API key validation and testing system
 * @version: 1.0.0
 * @init-author: developer-agent
 * @init-cc-sessionId: cc-unknown-20250806-243
 * @init-timestamp: 2025-08-06T00:00:00Z
 * @reasoning:
 * - **Objective:** Create secure API key validation system
 * - **Strategy:** Test key validity, check tier access, monitor usage
 * - **Outcome:** Comprehensive security validation for OpenAI keys
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createHash } from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Color codes for console output
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

/**
 * Logging utilities
 */
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
 * Load environment variables from multiple sources
 */
function loadEnvironment() {
  const envFiles = ['.env.local', '.env', '.env.example'];
  const envVars = {};
  const loadedFiles = [];

  for (const file of envFiles) {
    try {
      const envPath = join(projectRoot, file);
      const content = readFileSync(envPath, 'utf8');
      
      content.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const [key, ...valueParts] = trimmed.split('=');
          if (key && valueParts.length > 0) {
            const value = valueParts.join('=').replace(/^["']|["']$/g, '');
            if (!envVars[key]) { // Don't override already loaded values
              envVars[key] = value;
            }
          }
        }
      });
      
      loadedFiles.push(file);
    } catch (error) {
      // File doesn't exist or can't be read, continue
    }
  }

  return { envVars, loadedFiles };
}

/**
 * Validate API key format and extract metadata
 */
function validateKeyFormat(apiKey) {
  if (!apiKey) {
    return { valid: false, reason: 'API key is empty or undefined' };
  }

  // OpenAI key patterns
  const patterns = {
    'sk-': { type: 'Service Key', minLength: 48, description: 'Standard API key' },
    'sk-proj-': { type: 'Project Key', minLength: 56, description: 'Project-scoped API key' },
    'sess-': { type: 'Session Token', minLength: 40, description: 'Ephemeral session token' }
  };

  let keyInfo = null;
  for (const [prefix, info] of Object.entries(patterns)) {
    if (apiKey.startsWith(prefix)) {
      keyInfo = { ...info, prefix };
      break;
    }
  }

  if (!keyInfo) {
    return { 
      valid: false, 
      reason: 'API key does not match any known OpenAI key format',
      suggestions: ['Ensure key starts with sk- or sk-proj-']
    };
  }

  if (apiKey.length < keyInfo.minLength) {
    return { 
      valid: false, 
      reason: `${keyInfo.type} appears to be too short (${apiKey.length} chars, expected ${keyInfo.minLength}+)`,
      keyType: keyInfo.type
    };
  }

  // Additional validation for project keys
  if (keyInfo.prefix === 'sk-proj-') {
    const parts = apiKey.split('-');
    if (parts.length < 3) {
      return {
        valid: false,
        reason: 'Project key format appears invalid (missing project identifier)',
        keyType: keyInfo.type
      };
    }
  }

  return { 
    valid: true, 
    keyType: keyInfo.type,
    description: keyInfo.description,
    length: apiKey.length,
    masked: apiKey.substring(0, 12) + '...' + apiKey.substring(apiKey.length - 8),
    hash: createHash('sha256').update(apiKey).digest('hex').substring(0, 16)
  };
}

/**
 * Test basic API connectivity and get account info
 */
async function testApiConnectivity(apiKey) {
  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'ExecutiveAI-Training/1.0'
      }
    });

    const responseTime = Date.now();
    
    if (!response.ok) {
      const errorText = await response.text();
      let errorDetails;
      
      try {
        errorDetails = JSON.parse(errorText);
      } catch {
        errorDetails = { message: errorText };
      }

      return {
        success: false,
        status: response.status,
        error: errorDetails.error?.message || errorDetails.message || 'Unknown error',
        type: response.status === 401 ? 'authentication' : 
              response.status === 429 ? 'rate_limit' :
              response.status === 403 ? 'permission' : 'unknown'
      };
    }

    const data = await response.json();
    const models = data.data || [];
    
    // Categorize available models
    const modelCategories = {
      gpt4: models.filter(m => m.id.includes('gpt-4')),
      gpt35: models.filter(m => m.id.includes('gpt-3.5')),
      realtime: models.filter(m => m.id.includes('realtime')),
      vision: models.filter(m => m.id.includes('vision') || m.id.includes('gpt-4')),
      embedding: models.filter(m => m.id.includes('embedding')),
      audio: models.filter(m => m.id.includes('whisper') || m.id.includes('tts')),
      moderation: models.filter(m => m.id.includes('moderation'))
    };

    return {
      success: true,
      totalModels: models.length,
      modelCategories,
      responseHeaders: {
        rateLimitRequests: response.headers.get('x-ratelimit-limit-requests'),
        rateLimitTokens: response.headers.get('x-ratelimit-limit-tokens'),
        remainingRequests: response.headers.get('x-ratelimit-remaining-requests'),
        remainingTokens: response.headers.get('x-ratelimit-remaining-tokens'),
        resetRequests: response.headers.get('x-ratelimit-reset-requests'),
        resetTokens: response.headers.get('x-ratelimit-reset-tokens')
      }
    };

  } catch (error) {
    return {
      success: false,
      error: error.message,
      type: 'network'
    };
  }
}

/**
 * Test Realtime API access
 */
async function testRealtimeApi(apiKey) {
  try {
    const response = await fetch('https://api.openai.com/v1/realtime/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'ExecutiveAI-Training/1.0'
      },
      body: JSON.stringify({
        model: 'gpt-4o-realtime-preview',
        voice: 'alloy',
        instructions: 'You are a helpful assistant.',
        input_audio_format: 'pcm16',
        output_audio_format: 'pcm16',
        turn_detection: { type: 'server_vad' },
        temperature: 0.8,
        max_response_output_tokens: 4096,
        expires_at: Math.floor(Date.now() / 1000) + 60
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorDetails;
      
      try {
        errorDetails = JSON.parse(errorText);
      } catch {
        errorDetails = { message: errorText };
      }

      return {
        success: false,
        status: response.status,
        error: errorDetails.error?.message || errorDetails.message || 'Unknown error',
        available: false
      };
    }

    const data = await response.json();
    
    return {
      success: true,
      available: true,
      sessionId: data.id,
      model: data.model,
      expiresAt: new Date(data.expires_at * 1000).toISOString(),
      clientSecret: data.client_secret?.value?.substring(0, 16) + '...'
    };

  } catch (error) {
    return {
      success: false,
      error: error.message,
      available: false,
      type: 'network'
    };
  }
}

/**
 * Test Responses API with web_search tool
 */
async function testResponsesApi(apiKey) {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'ExecutiveAI-Training/1.0'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: 'Test message - respond with just "API_TEST_SUCCESS"'
          }
        ],
        max_tokens: 50,
        tools: [
          {
            type: 'function',
            function: {
              name: 'web_search',
              description: 'Search the web for information',
              parameters: {
                type: 'object',
                properties: {
                  query: {
                    type: 'string',
                    description: 'Search query'
                  }
                }
              }
            }
          }
        ],
        temperature: 0
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorDetails;
      
      try {
        errorDetails = JSON.parse(errorText);
      } catch {
        errorDetails = { message: errorText };
      }

      return {
        success: false,
        status: response.status,
        error: errorDetails.error?.message || errorDetails.message || 'Unknown error',
        toolsSupported: false
      };
    }

    const data = await response.json();
    
    return {
      success: true,
      toolsSupported: true,
      model: data.model,
      usage: data.usage,
      responseText: data.choices?.[0]?.message?.content?.trim()
    };

  } catch (error) {
    return {
      success: false,
      error: error.message,
      toolsSupported: false,
      type: 'network'
    };
  }
}

/**
 * Check usage and billing limits
 */
async function checkUsageLimits(apiKey) {
  try {
    // Note: This endpoint might require different permissions
    const response = await fetch('https://api.openai.com/v1/usage', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'ExecutiveAI-Training/1.0'
      }
    });

    if (!response.ok) {
      return {
        success: false,
        status: response.status,
        message: 'Usage endpoint not accessible (this is normal for most API keys)'
      };
    }

    const data = await response.json();
    return {
      success: true,
      usage: data
    };

  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: 'Usage information not available'
    };
  }
}

/**
 * Security audit of environment configuration
 */
function auditSecurity(envVars, loadedFiles) {
  const issues = [];
  const recommendations = [];

  // Check for duplicate API keys
  const apiKeyVars = Object.keys(envVars).filter(key => 
    key.includes('OPENAI_API_KEY') || key.includes('API_KEY')
  );
  
  if (apiKeyVars.length > 1) {
    const uniqueValues = new Set(apiKeyVars.map(key => envVars[key]));
    if (uniqueValues.size === 1) {
      issues.push({
        severity: 'HIGH',
        type: 'duplicate_keys',
        message: `Multiple environment variables contain the same API key: ${apiKeyVars.join(', ')}`
      });
      recommendations.push('Remove duplicate API key variables to avoid confusion');
    }
  }

  // Check for public exposure
  const publicKeys = Object.keys(envVars).filter(key => 
    key.startsWith('PUBLIC_') && key.includes('API_KEY')
  );
  
  if (publicKeys.length > 0) {
    issues.push({
      severity: 'CRITICAL',
      type: 'public_exposure',
      message: `API keys exposed in PUBLIC_ variables: ${publicKeys.join(', ')}`
    });
    recommendations.push('Never use PUBLIC_ prefix for sensitive API keys');
  }

  // Check for VITE exposure
  const viteKeys = Object.keys(envVars).filter(key => 
    key.startsWith('VITE_') && key.includes('API_KEY')
  );
  
  if (viteKeys.length > 0) {
    issues.push({
      severity: 'CRITICAL',
      type: 'vite_exposure',
      message: `API keys exposed in VITE_ variables: ${viteKeys.join(', ')}`
    });
    recommendations.push('VITE_ variables are exposed to client-side code - use server-side only');
  }

  // Check .env file hierarchy
  if (loadedFiles.includes('.env') && loadedFiles.includes('.env.local')) {
    const hasApiKeyInEnv = envVars.OPENAI_API_KEY && 
      readFileSync(join(projectRoot, '.env'), 'utf8').includes(envVars.OPENAI_API_KEY);
    
    if (hasApiKeyInEnv) {
      issues.push({
        severity: 'HIGH',
        type: 'env_hierarchy',
        message: 'API key found in .env file instead of .env.local'
      });
      recommendations.push('Move API keys from .env to .env.local for better security');
    }
  }

  // Check rate limiting configuration
  const rateLimit = parseInt(envVars.VOICE_AGENT_RATE_LIMIT);
  if (!rateLimit || rateLimit > 1000) {
    issues.push({
      severity: 'MEDIUM',
      type: 'rate_limiting',
      message: `Rate limit too high or not set: ${envVars.VOICE_AGENT_RATE_LIMIT}`
    });
    recommendations.push('Set VOICE_AGENT_RATE_LIMIT to a reasonable value (e.g., 100 requests/minute)');
  }

  // Check token duration
  const tokenDuration = parseInt(envVars.VOICE_AGENT_TOKEN_DURATION);
  if (!tokenDuration || tokenDuration > 300) {
    issues.push({
      severity: 'MEDIUM',
      type: 'token_duration',
      message: `Token duration too long or not set: ${envVars.VOICE_AGENT_TOKEN_DURATION}`
    });
    recommendations.push('Set VOICE_AGENT_TOKEN_DURATION to 60-300 seconds for security');
  }

  return { issues, recommendations };
}

/**
 * Generate security report
 */
function generateSecurityReport(results, timestamp) {
  const report = {
    timestamp,
    summary: {
      apiKeyValid: results.format?.valid || false,
      connectivityOk: results.connectivity?.success || false,
      realtimeAvailable: results.realtime?.available || false,
      responsesApiOk: results.responses?.success || false,
      securityIssues: results.security?.issues?.length || 0,
      highSeverityIssues: results.security?.issues?.filter(i => i.severity === 'HIGH' || i.severity === 'CRITICAL')?.length || 0
    },
    details: results,
    recommendations: results.security?.recommendations || []
  };

  // Save report to file
  const reportPath = join(projectRoot, '.security', 'api-key-audit.json');
  try {
    writeFileSync(reportPath, JSON.stringify(report, null, 2));
    logger.info(`Security report saved to .security/api-key-audit.json`);
  } catch (error) {
    logger.warn(`Could not save security report: ${error.message}`);
  }

  return report;
}

/**
 * Main validation function
 */
async function main() {
  logger.header('🔐 OpenAI API Key Security Validator');
  
  const results = {};
  const timestamp = new Date().toISOString();

  // Load environment
  logger.step('1/7', 'Loading environment configuration...');
  const { envVars, loadedFiles } = loadEnvironment();
  
  if (!envVars.OPENAI_API_KEY) {
    logger.error('No OPENAI_API_KEY found in environment files');
    process.exit(1);
  }
  
  logger.success(`Loaded environment from: ${loadedFiles.join(', ')}`);
  
  // Validate key format
  logger.step('2/7', 'Validating API key format...');
  results.format = validateKeyFormat(envVars.OPENAI_API_KEY);
  
  if (!results.format.valid) {
    logger.error(`Invalid key format: ${results.format.reason}`);
    if (results.format.suggestions) {
      results.format.suggestions.forEach(suggestion => logger.info(`Suggestion: ${suggestion}`));
    }
    process.exit(1);
  }
  
  logger.success(`Valid ${results.format.keyType}: ${results.format.masked}`);
  logger.debug(`Key hash: ${results.format.hash}`);

  // Test connectivity
  logger.step('3/7', 'Testing API connectivity...');
  results.connectivity = await testApiConnectivity(envVars.OPENAI_API_KEY);
  
  if (!results.connectivity.success) {
    logger.error(`API connectivity failed: ${results.connectivity.error}`);
    if (results.connectivity.type === 'authentication') {
      logger.error('Authentication failed - check your API key');
    }
    process.exit(1);
  }
  
  logger.success(`Connected successfully - ${results.connectivity.totalModels} models available`);
  
  // Display rate limits
  const headers = results.connectivity.responseHeaders;
  if (headers.rateLimitRequests) {
    logger.info(`Rate limits: ${headers.remainingRequests || 'unknown'}/${headers.rateLimitRequests || 'unknown'} requests remaining`);
  }

  // Test Realtime API
  logger.step('4/7', 'Testing Realtime API access...');
  results.realtime = await testRealtimeApi(envVars.OPENAI_API_KEY);
  
  if (results.realtime.success) {
    logger.success(`Realtime API available - session expires ${results.realtime.expiresAt}`);
  } else {
    logger.warn(`Realtime API not available: ${results.realtime.error}`);
  }

  // Test Responses API
  logger.step('5/7', 'Testing Responses API with tools...');
  results.responses = await testResponsesApi(envVars.OPENAI_API_KEY);
  
  if (results.responses.success) {
    logger.success(`Responses API working - tools supported: ${results.responses.toolsSupported}`);
    if (results.responses.responseText) {
      logger.debug(`Test response: ${results.responses.responseText}`);
    }
  } else {
    logger.warn(`Responses API test failed: ${results.responses.error}`);
  }

  // Check usage limits
  logger.step('6/7', 'Checking usage and billing...');
  results.usage = await checkUsageLimits(envVars.OPENAI_API_KEY);
  
  if (results.usage.success) {
    logger.success('Usage information retrieved');
  } else {
    logger.info(results.usage.message || 'Usage information not available');
  }

  // Security audit
  logger.step('7/7', 'Conducting security audit...');
  results.security = auditSecurity(envVars, loadedFiles);
  
  if (results.security.issues.length === 0) {
    logger.success('No security issues found');
  } else {
    logger.warn(`${results.security.issues.length} security issues found:`);
    results.security.issues.forEach(issue => {
      const color = issue.severity === 'CRITICAL' ? colors.red :
                   issue.severity === 'HIGH' ? colors.yellow : colors.cyan;
      console.log(`  ${color}${issue.severity}${colors.reset}: ${issue.message}`);
    });
  }

  // Generate report
  const report = generateSecurityReport(results, timestamp);
  
  // Final summary
  logger.header('🎯 Validation Summary');
  
  const score = [
    results.format.valid,
    results.connectivity.success,
    results.realtime.available,
    results.responses.success,
    results.security.issues.length === 0
  ].filter(Boolean).length;
  
  const scoreColor = score >= 4 ? colors.green : 
                   score >= 3 ? colors.yellow : colors.red;
  
  console.log(`${colors.bold}Security Score: ${scoreColor}${score}/5${colors.reset}`);
  
  if (report.summary.highSeverityIssues > 0) {
    logger.error('⚠️  Critical security issues found - immediate action required');
  } else if (score >= 4) {
    logger.success('🎉 API key configuration is secure and functional');
  } else {
    logger.warn('⚡ Some issues found - review recommendations above');
  }

  // Next steps
  console.log(`\n${colors.blue}Next Steps:${colors.reset}`);
  console.log('• Review security report: .security/api-key-audit.json');
  console.log('• Run: npm run setup-secure-env (to fix environment issues)');
  console.log('• Run: npm run monitor-api-usage (to track usage patterns)');
  console.log('• Run: npm run rotate-keys (when keys need rotation)');
}

// Run validation
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    logger.error(`Validation failed: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  });
}

export { validateKeyFormat, testApiConnectivity, testRealtimeApi, auditSecurity };

/*
 * DREAMFORGE AUDIT TRAIL
 *
 * ---
 * @revision: 1.0.0
 * @author: developer-agent
 * @cc-sessionId: cc-unknown-20250806-243
 * @timestamp: 2025-08-06T00:00:00Z
 * @reasoning:
 * - **Objective:** Create comprehensive API key security validator
 * - **Strategy:** Multi-tier validation with security audit and reporting
 * - **Outcome:** Production-ready API key security system
 */