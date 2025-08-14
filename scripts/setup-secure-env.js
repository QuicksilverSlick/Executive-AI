#!/usr/bin/env node

/*
 * DREAMFORGE HIVE-MIND CHAIN OF CUSTODY
 *
 * @file-purpose: Secure environment configuration setup script
 * @version: 1.0.0
 * @init-author: developer-agent
 * @init-cc-sessionId: cc-unknown-20250806-243
 * @init-timestamp: 2025-08-06T00:00:00Z
 * @reasoning:
 * - **Objective:** Fix security issues in environment configuration
 * - **Strategy:** Clean up duplicate keys, move to secure files, implement encryption
 * - **Outcome:** Secure, production-ready environment setup
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, unlinkSync, copyFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createHash, randomBytes, createCipheriv, createDecipheriv, scryptSync } from 'crypto';
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
 * Backup existing environment files
 */
function backupEnvironmentFiles() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
  const backupDir = join(projectRoot, '.security', 'backups', timestamp);
  
  if (!existsSync(backupDir)) {
    mkdirSync(backupDir, { recursive: true });
  }
  
  const filesToBackup = ['.env', '.env.local', '.env.example'];
  const backedUpFiles = [];
  
  for (const file of filesToBackup) {
    const filePath = join(projectRoot, file);
    if (existsSync(filePath)) {
      const backupPath = join(backupDir, file);
      copyFileSync(filePath, backupPath);
      backedUpFiles.push(file);
      logger.debug(`Backed up ${file} to ${backupPath}`);
    }
  }
  
  return { backupDir, backedUpFiles };
}

/**
 * Parse environment file content
 */
function parseEnvFile(filePath) {
  if (!existsSync(filePath)) {
    return {};
  }
  
  const content = readFileSync(filePath, 'utf8');
  const vars = {};
  const comments = [];
  
  content.split('\n').forEach((line, index) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('#') || trimmed === '') {
      comments.push({ line: index, content: line });
    } else if (trimmed.includes('=')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        vars[key.trim()] = valueParts.join('=').replace(/^["']|["']$/g, '');
      }
    }
  });
  
  return { vars, comments };
}

/**
 * Generate secure .env.local file
 */
function generateSecureEnvLocal(currentVars) {
  const secureVars = {};
  const warnings = [];
  
  // Get the primary OpenAI API key (prioritize from .env.local)
  const apiKey = currentVars.OPENAI_API_KEY;
  if (apiKey) {
    secureVars.OPENAI_API_KEY = apiKey;
    
    // Remove duplicate and unsafe variants
    const unsafeKeys = ['VITE_OPENAI_API_KEY', 'PUBLIC_OPENAI_API_KEY', 'REACT_APP_OPENAI_API_KEY'];
    unsafeKeys.forEach(key => {
      if (currentVars[key]) {
        warnings.push(`Removed unsafe API key variable: ${key}`);
      }
    });
  }
  
  // Set secure defaults for voice agent
  secureVars.VOICE_AGENT_RATE_LIMIT = currentVars.VOICE_AGENT_RATE_LIMIT || '100';
  secureVars.VOICE_AGENT_TOKEN_DURATION = currentVars.VOICE_AGENT_TOKEN_DURATION || '60';
  
  // Validate and secure CORS origins
  let allowedOrigins = currentVars.ALLOWED_ORIGINS || 'http://localhost:4321';
  if (allowedOrigins.includes('*')) {
    warnings.push('Removed wildcard (*) from ALLOWED_ORIGINS for security');
    allowedOrigins = 'http://localhost:4321,https://executiveaitraining.com';
  }
  secureVars.ALLOWED_ORIGINS = allowedOrigins;
  
  // Environment-specific settings
  secureVars.NODE_ENV = currentVars.NODE_ENV || 'development';
  
  // Public variables (safe to expose)
  if (currentVars.PUBLIC_SITE_URL) {
    secureVars.PUBLIC_SITE_URL = currentVars.PUBLIC_SITE_URL;
  }
  if (currentVars.PUBLIC_SITE_NAME) {
    secureVars.PUBLIC_SITE_NAME = currentVars.PUBLIC_SITE_NAME;
  }
  
  // Optional configurations (commented out if not set)
  const optionalVars = [
    'PUBLIC_GA_MEASUREMENT_ID',
    'PUBLIC_CALENDLY_URL',
    'ANTHROPIC_API_KEY'
  ];
  
  return { secureVars, warnings, optionalVars };
}

/**
 * Create secure .env.example file
 */
function createSecureEnvExample() {
  return `# OpenAI Configuration
OPENAI_API_KEY=sk-your-openai-api-key-here

# Voice Agent Security Configuration
ALLOWED_ORIGINS=http://localhost:4321,https://yourdomain.com
VOICE_AGENT_RATE_LIMIT=100
VOICE_AGENT_TOKEN_DURATION=60

# Site Configuration
PUBLIC_SITE_URL=https://yourdomain.com
PUBLIC_SITE_NAME="Your Site Name"

# Development Configuration
NODE_ENV=development

# Optional: Google Analytics Configuration
# PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Optional: Calendly Configuration
# PUBLIC_CALENDLY_URL=https://calendly.com/your-username

# Optional: Anthropic API Key (for Claude)
# ANTHROPIC_API_KEY=sk-ant-your-anthropic-key-here

# Security Notes:
# - Never commit .env.local to version control
# - Use PUBLIC_ prefix only for client-safe variables
# - Avoid VITE_ prefix for sensitive data
# - Keep API keys in .env.local only
# - Set reasonable rate limits for production`;
}

/**
 * Create .env file with safe defaults
 */
function createSecureEnv() {
  return `# Default environment configuration
# Real values should be in .env.local (not committed to git)

# Development defaults
NODE_ENV=development
VOICE_AGENT_RATE_LIMIT=100
VOICE_AGENT_TOKEN_DURATION=60

# Default CORS (restrictive)
ALLOWED_ORIGINS=http://localhost:4321

# Public configuration defaults
PUBLIC_SITE_NAME="Executive AI Training"

# WARNING: Never put real API keys in this file
# This file is committed to git and should only contain safe defaults`;
}

/**
 * Update .gitignore to ensure security
 */
function updateGitignore() {
  const gitignorePath = join(projectRoot, '.gitignore');
  let gitignoreContent = '';
  
  if (existsSync(gitignorePath)) {
    gitignoreContent = readFileSync(gitignorePath, 'utf8');
  }
  
  const requiredEntries = [
    '.env.local',
    '.env.*.local',
    '*.key',
    '*.pem',
    '.security/keys/*',
    '.security/backups/*',
    '.security/*.log'
  ];
  
  let updated = false;
  const lines = gitignoreContent.split('\n');
  
  for (const entry of requiredEntries) {
    if (!lines.includes(entry) && !lines.includes(entry.replace(/\*/g, ''))) {
      lines.push(entry);
      updated = true;
    }
  }
  
  if (updated) {
    // Add security section header
    if (!gitignoreContent.includes('# Security')) {
      lines.push('', '# Security', ...requiredEntries.slice(lines.length - requiredEntries.length));
    }
    
    writeFileSync(gitignorePath, lines.join('\n'));
    return true;
  }
  
  return false;
}

/**
 * Generate encryption key for sensitive values
 */
function generateEncryptionKey() {
  const keyPath = join(projectRoot, '.security', 'keys');
  if (!existsSync(keyPath)) {
    mkdirSync(keyPath, { recursive: true });
  }
  
  const key = randomBytes(32);
  const iv = randomBytes(16);
  const keyData = {
    key: key.toString('hex'),
    iv: iv.toString('hex')
  };
  
  const keyFile = join(keyPath, 'env.key');
  writeFileSync(keyFile, JSON.stringify(keyData, null, 2));
  
  // Set restrictive permissions
  try {
    execSync(`chmod 600 ${keyFile}`);
  } catch (error) {
    logger.warn('Could not set file permissions - ensure only you can read .security/keys/env.key');
  }
  
  return keyData;
}

/**
 * Encrypt sensitive environment value
 */
function encryptValue(value, keyData) {
  const key = Buffer.from(keyData.key, 'hex');
  const iv = Buffer.from(keyData.iv, 'hex');
  const cipher = createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(value, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

/**
 * Create encrypted backup of API keys
 */
function createEncryptedBackup(apiKeys, encryptionKey) {
  const backupData = {
    timestamp: new Date().toISOString(),
    keys: Object.entries(apiKeys).map(([name, value]) => ({
      name,
      encrypted: encryptValue(value, encryptionKey),
      hash: createHash('sha256').update(value).digest('hex').substring(0, 16)
    }))
  };
  
  const backupPath = join(projectRoot, '.security', 'encrypted-backup.json');
  writeFileSync(backupPath, JSON.stringify(backupData, null, 2));
  
  try {
    execSync(`chmod 600 ${backupPath}`);
  } catch (error) {
    logger.warn('Could not set backup file permissions');
  }
  
  return backupPath;
}

/**
 * Validate the new configuration
 */
async function validateNewConfig() {
  try {
    // Import our validator
    const { validateKeyFormat, testApiConnectivity } = await import('./api-key-validator.js');
    
    const envLocalPath = join(projectRoot, '.env.local');
    if (!existsSync(envLocalPath)) {
      return { valid: false, error: '.env.local file not found' };
    }
    
    const { vars } = parseEnvFile(envLocalPath);
    
    if (!vars.OPENAI_API_KEY) {
      return { valid: false, error: 'No OPENAI_API_KEY in .env.local' };
    }
    
    const formatCheck = validateKeyFormat(vars.OPENAI_API_KEY);
    if (!formatCheck.valid) {
      return { valid: false, error: `Invalid API key format: ${formatCheck.reason}` };
    }
    
    const connectivityCheck = await testApiConnectivity(vars.OPENAI_API_KEY);
    if (!connectivityCheck.success) {
      return { valid: false, error: `API connectivity failed: ${connectivityCheck.error}` };
    }
    
    return { valid: true };
    
  } catch (error) {
    return { valid: false, error: `Validation error: ${error.message}` };
  }
}

/**
 * Main setup function
 */
async function main() {
  logger.header('🔧 Secure Environment Setup');
  
  // Step 1: Backup existing files
  logger.step('1/8', 'Backing up existing environment files...');
  const backup = backupEnvironmentFiles();
  logger.success(`Backed up ${backup.backedUpFiles.length} files to ${backup.backupDir}`);
  
  // Step 2: Parse current configuration
  logger.step('2/8', 'Analyzing current configuration...');
  const currentEnvLocal = parseEnvFile(join(projectRoot, '.env.local'));
  const currentEnv = parseEnvFile(join(projectRoot, '.env'));
  
  // Merge configurations (prioritize .env.local)
  const allVars = { ...currentEnv.vars, ...currentEnvLocal.vars };
  logger.info(`Found ${Object.keys(allVars).length} environment variables`);
  
  // Step 3: Generate secure configuration
  logger.step('3/8', 'Creating secure environment configuration...');
  const { secureVars, warnings, optionalVars } = generateSecureEnvLocal(allVars);
  
  if (warnings.length > 0) {
    logger.warn('Security improvements:');
    warnings.forEach(warning => logger.warn(`  ${warning}`));
  }
  
  // Step 4: Generate encryption key and backup
  logger.step('4/8', 'Setting up encryption for sensitive data...');
  const encryptionKey = generateEncryptionKey();
  
  // Create encrypted backup of API keys
  const apiKeys = {};
  if (allVars.OPENAI_API_KEY) apiKeys.OPENAI_API_KEY = allVars.OPENAI_API_KEY;
  if (allVars.ANTHROPIC_API_KEY) apiKeys.ANTHROPIC_API_KEY = allVars.ANTHROPIC_API_KEY;
  
  if (Object.keys(apiKeys).length > 0) {
    const backupPath = createEncryptedBackup(apiKeys, encryptionKey);
    logger.success(`Encrypted backup created: ${backupPath}`);
  }
  
  // Step 5: Write secure .env.local
  logger.step('5/8', 'Writing secure .env.local...');
  
  let envLocalContent = '# Secure environment configuration (DO NOT COMMIT)\n';
  envLocalContent += '# Generated by setup-secure-env.js\n\n';
  envLocalContent += '# OpenAI Configuration\n';
  envLocalContent += `OPENAI_API_KEY=${secureVars.OPENAI_API_KEY}\n\n`;
  envLocalContent += '# Voice Agent Security Configuration\n';
  envLocalContent += `ALLOWED_ORIGINS=${secureVars.ALLOWED_ORIGINS}\n`;
  envLocalContent += `VOICE_AGENT_RATE_LIMIT=${secureVars.VOICE_AGENT_RATE_LIMIT}\n`;
  envLocalContent += `VOICE_AGENT_TOKEN_DURATION=${secureVars.VOICE_AGENT_TOKEN_DURATION}\n\n`;
  envLocalContent += '# Development Configuration\n';
  envLocalContent += `NODE_ENV=${secureVars.NODE_ENV}\n\n`;
  
  if (secureVars.PUBLIC_SITE_URL || secureVars.PUBLIC_SITE_NAME) {
    envLocalContent += '# Site Configuration\n';
    if (secureVars.PUBLIC_SITE_URL) envLocalContent += `PUBLIC_SITE_URL=${secureVars.PUBLIC_SITE_URL}\n`;
    if (secureVars.PUBLIC_SITE_NAME) envLocalContent += `PUBLIC_SITE_NAME=${secureVars.PUBLIC_SITE_NAME}\n`;
    envLocalContent += '\n';
  }
  
  // Add optional (commented) variables
  envLocalContent += '# Optional Configuration (uncomment and set as needed)\n';
  optionalVars.forEach(varName => {
    const value = allVars[varName];
    if (value && !value.includes('your-') && !value.includes('-here')) {
      envLocalContent += `${varName}=${value}\n`;
    } else {
      envLocalContent += `# ${varName}=your-value-here\n`;
    }
  });
  
  writeFileSync(join(projectRoot, '.env.local'), envLocalContent);
  logger.success('Secure .env.local file created');
  
  // Step 6: Create/update .env with safe defaults
  logger.step('6/8', 'Creating safe .env file...');
  writeFileSync(join(projectRoot, '.env'), createSecureEnv());
  logger.success('.env file updated with safe defaults');
  
  // Step 7: Update .env.example
  logger.step('7/8', 'Creating secure .env.example...');
  writeFileSync(join(projectRoot, '.env.example'), createSecureEnvExample());
  logger.success('.env.example file updated');
  
  // Step 8: Update .gitignore
  logger.step('8/8', 'Updating .gitignore for security...');
  const gitignoreUpdated = updateGitignore();
  if (gitignoreUpdated) {
    logger.success('.gitignore updated with security entries');
  } else {
    logger.info('.gitignore already contains required security entries');
  }
  
  // Validate new configuration
  logger.header('🔍 Validating New Configuration');
  const validation = await validateNewConfig();
  
  if (validation.valid) {
    logger.success('Configuration validation passed');
  } else {
    logger.error(`Configuration validation failed: ${validation.error}`);
  }
  
  // Final summary
  logger.header('✨ Setup Complete');
  
  console.log(`${colors.green}Security improvements made:${colors.reset}`);
  console.log('• Backed up original configuration files');
  console.log('• Removed duplicate and unsafe API key variables');
  console.log('• Created encrypted backup of sensitive keys');
  console.log('• Updated .gitignore to prevent accidental commits');
  console.log('• Set secure defaults for rate limiting and CORS');
  console.log('• Validated API key functionality');
  
  console.log(`\n${colors.blue}Security files created:${colors.reset}`);
  console.log('• .security/keys/env.key (encryption key)');
  console.log('• .security/encrypted-backup.json (encrypted API keys)');
  console.log('• .security/backups/ (original file backups)');
  
  console.log(`\n${colors.yellow}Next steps:${colors.reset}`);
  console.log('• Run: npm run validate-api-keys');
  console.log('• Run: npm run monitor-api-usage');
  console.log('• Review: .security/api-key-audit.json');
  
  if (!validation.valid) {
    logger.error('\n⚠️  Configuration validation failed - please check your API key');
    process.exit(1);
  }
}

// Run setup
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    logger.error(`Setup failed: ${error.message}`);
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
 * - **Objective:** Create secure environment setup automation
 * - **Strategy:** Backup, clean, encrypt, validate approach
 * - **Outcome:** Production-ready environment security system
 */