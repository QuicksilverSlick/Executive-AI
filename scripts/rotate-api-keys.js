#!/usr/bin/env node

/*
 * DREAMFORGE HIVE-MIND CHAIN OF CUSTODY
 *
 * @file-purpose: API key rotation helper with secure backup and testing
 * @version: 1.0.0
 * @init-author: developer-agent
 * @init-cc-sessionId: cc-unknown-20250806-243
 * @init-timestamp: 2025-08-06T00:00:00Z
 * @reasoning:
 * - **Objective:** Implement secure API key rotation workflow
 * - **Strategy:** Backup, validate, rotate, test, commit approach
 * - **Outcome:** Zero-downtime key rotation with rollback capability
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createHash, randomBytes, createCipher, createDecipher } from 'crypto';
import { execSync } from 'child_process';
import { createInterface } from 'readline';

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
 * Create readline interface for user input
 */
const rl = createInterface({
  input: process.stdin,
  output: process.stdout
});

/**
 * Prompt user for input
 */
function prompt(question) {
  return new Promise((resolve) => {
    rl.question(`${colors.cyan}${question}${colors.reset} `, resolve);
  });
}

/**
 * Prompt user for confirmation
 */
async function confirm(question) {
  const answer = await prompt(`${question} (y/N): `);
  return answer.toLowerCase().startsWith('y');
}

/**
 * Load current environment configuration
 */
function loadCurrentConfig() {
  const envLocalPath = join(projectRoot, '.env.local');
  if (!existsSync(envLocalPath)) {
    throw new Error('.env.local file not found - run setup-secure-env.js first');
  }
  
  const content = readFileSync(envLocalPath, 'utf8');
  const vars = {};
  
  content.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        vars[key.trim()] = valueParts.join('=');
      }
    }
  });
  
  return { vars, content };
}

/**
 * Create rotation backup
 */
function createRotationBackup(currentVars) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
  const backupDir = join(projectRoot, '.security', 'rotations', timestamp);
  
  if (!existsSync(backupDir)) {
    mkdirSync(backupDir, { recursive: true });
  }
  
  // Backup current .env.local
  const envLocalPath = join(projectRoot, '.env.local');
  if (existsSync(envLocalPath)) {
    copyFileSync(envLocalPath, join(backupDir, '.env.local.backup'));
  }
  
  // Create rotation metadata
  const metadata = {
    timestamp,
    rotatedKeys: [],
    previousHashes: {},
    rollbackAvailable: true
  };
  
  // Store hashes of current keys (for verification)
  Object.entries(currentVars).forEach(([key, value]) => {
    if (key.includes('API_KEY') || key.includes('_KEY')) {
      metadata.previousHashes[key] = createHash('sha256').update(value).digest('hex').substring(0, 16);
    }
  });
  
  writeFileSync(join(backupDir, 'rotation-metadata.json'), JSON.stringify(metadata, null, 2));
  
  return { backupDir, metadata };
}

/**
 * Validate new API key format and connectivity
 */
async function validateNewKey(newKey, keyType = 'OpenAI') {
  try {
    // Import validator functions
    const { validateKeyFormat, testApiConnectivity } = await import('./api-key-validator.js');
    
    // Format validation
    const formatResult = validateKeyFormat(newKey);
    if (!formatResult.valid) {
      return {
        valid: false,
        error: `Invalid key format: ${formatResult.reason}`
      };
    }
    
    // Connectivity test
    const connectResult = await testApiConnectivity(newKey);
    if (!connectResult.success) {
      return {
        valid: false,
        error: `API connectivity failed: ${connectResult.error}`
      };
    }
    
    return {
      valid: true,
      keyInfo: formatResult,
      apiInfo: connectResult
    };
    
  } catch (error) {
    return {
      valid: false,
      error: `Validation failed: ${error.message}`
    };
  }
}

/**
 * Update environment file with new key
 */
function updateEnvironmentFile(newKey, keyName = 'OPENAI_API_KEY') {
  const envLocalPath = join(projectRoot, '.env.local');
  let content = readFileSync(envLocalPath, 'utf8');
  
  // Find and replace the key line
  const keyRegex = new RegExp(`^${keyName}=.*$`, 'm');
  
  if (keyRegex.test(content)) {
    content = content.replace(keyRegex, `${keyName}=${newKey}`);
  } else {
    // Add key if it doesn't exist
    content += `\n${keyName}=${newKey}\n`;
  }
  
  // Add rotation timestamp comment
  const timestamp = new Date().toISOString();
  content = content.replace(
    /^# Generated by setup-secure-env\.js.*$/m,
    `# Generated by setup-secure-env.js\n# Last key rotation: ${timestamp}`
  );
  
  writeFileSync(envLocalPath, content);
}

/**
 * Test application functionality with new key
 */
async function testApplicationFunctionality() {
  logger.info('Testing application functionality with new key...');
  
  const tests = [
    {
      name: 'API Key Validation',
      command: 'node scripts/api-key-validator.js'
    },
    {
      name: 'Token Generation Test',
      command: 'node scripts/verify-openai-setup.js'
    }
  ];
  
  const results = [];
  
  for (const test of tests) {
    try {
      logger.debug(`Running: ${test.command}`);
      const output = execSync(test.command, { 
        cwd: projectRoot, 
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      results.push({
        name: test.name,
        success: true,
        output: output.trim()
      });
      
      logger.success(`${test.name}: ✓`);
      
    } catch (error) {
      results.push({
        name: test.name,
        success: false,
        error: error.message,
        output: error.stdout || error.stderr
      });
      
      logger.error(`${test.name}: ✗`);
    }
  }
  
  return results;
}

/**
 * Rollback to previous configuration
 */
async function rollbackToPrevious(backupDir) {
  const confirmed = await confirm('Rollback to previous configuration?');
  if (!confirmed) {
    return false;
  }
  
  try {
    const backupFile = join(backupDir, '.env.local.backup');
    if (existsSync(backupFile)) {
      copyFileSync(backupFile, join(projectRoot, '.env.local'));
      logger.success('Configuration rolled back successfully');
      
      // Test rollback
      const rollbackTest = await testApplicationFunctionality();
      const allPassed = rollbackTest.every(test => test.success);
      
      if (allPassed) {
        logger.success('Rollback verification passed');
        return true;
      } else {
        logger.error('Rollback verification failed - manual intervention required');
        return false;
      }
    } else {
      logger.error('Backup file not found - cannot rollback');
      return false;
    }
  } catch (error) {
    logger.error(`Rollback failed: ${error.message}`);
    return false;
  }
}

/**
 * Generate rotation report
 */
function generateRotationReport(rotationData) {
  const report = {
    timestamp: new Date().toISOString(),
    rotation: rotationData,
    summary: {
      success: rotationData.success,
      keysRotated: rotationData.rotatedKeys?.length || 0,
      testsPassed: rotationData.testResults?.filter(t => t.success)?.length || 0,
      totalTests: rotationData.testResults?.length || 0
    }
  };
  
  const reportPath = join(projectRoot, '.security', 'rotation-report.json');
  writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  return reportPath;
}

/**
 * Main rotation workflow
 */
async function main() {
  logger.header('🔄 API Key Rotation Assistant');
  
  const args = process.argv.slice(2);
  const isRollback = args.includes('--rollback');
  const isForce = args.includes('--force');
  
  if (isRollback) {
    logger.warn('Rollback mode activated');
    const backupDirs = execSync('ls -1t .security/rotations/ 2>/dev/null || echo ""', {
      cwd: projectRoot,
      encoding: 'utf8'
    }).trim().split('\n').filter(Boolean);
    
    if (backupDirs.length === 0) {
      logger.error('No rotation backups found');
      process.exit(1);
    }
    
    logger.info(`Latest backup: ${backupDirs[0]}`);
    const backupDir = join(projectRoot, '.security', 'rotations', backupDirs[0]);
    
    const rollbackSuccess = await rollbackToPrevious(backupDir);
    process.exit(rollbackSuccess ? 0 : 1);
  }
  
  try {
    // Step 1: Load current configuration
    logger.step('1/8', 'Loading current configuration...');
    const { vars: currentVars } = loadCurrentConfig();
    
    if (!currentVars.OPENAI_API_KEY) {
      logger.error('No OpenAI API key found in current configuration');
      process.exit(1);
    }
    
    const currentKeyHash = createHash('sha256').update(currentVars.OPENAI_API_KEY).digest('hex').substring(0, 16);
    logger.info(`Current key hash: ${currentKeyHash}`);
    
    // Step 2: Create backup
    logger.step('2/8', 'Creating rotation backup...');
    const { backupDir, metadata } = createRotationBackup(currentVars);
    logger.success(`Backup created: ${backupDir}`);
    
    // Step 3: Get new API key
    logger.step('3/8', 'Getting new API key...');
    
    if (!isForce) {
      console.log(`\n${colors.yellow}Please obtain a new OpenAI API key:${colors.reset}`);
      console.log('1. Visit: https://platform.openai.com/api-keys');
      console.log('2. Create a new key (preferably project-scoped)');
      console.log('3. Copy the key and paste it below');
      console.log('4. The old key will be safely backed up\n');
    }
    
    const newKey = await prompt('Enter new OpenAI API key: ');
    
    if (!newKey || newKey.trim() === '') {
      logger.error('No key provided');
      process.exit(1);
    }
    
    if (newKey === currentVars.OPENAI_API_KEY) {
      logger.error('New key is the same as current key');
      process.exit(1);
    }
    
    // Step 4: Validate new key
    logger.step('4/8', 'Validating new API key...');
    const validation = await validateNewKey(newKey.trim());
    
    if (!validation.valid) {
      logger.error(`Key validation failed: ${validation.error}`);
      process.exit(1);
    }
    
    logger.success(`New key validated: ${validation.keyInfo.keyType}`);
    logger.info(`Key preview: ${validation.keyInfo.masked}`);
    logger.info(`Available models: ${validation.apiInfo.totalModels}`);
    
    // Step 5: Confirm rotation
    if (!isForce) {
      logger.step('5/8', 'Confirming rotation...');
      console.log(`\n${colors.yellow}Rotation Summary:${colors.reset}`);
      console.log(`• Current key: ${currentKeyHash}`);
      console.log(`• New key: ${validation.keyInfo.hash}`);
      console.log(`• Key type: ${validation.keyInfo.keyType}`);
      console.log(`• Backup location: ${backupDir}`);
      
      const confirmed = await confirm('\nProceed with key rotation?');
      if (!confirmed) {
        logger.warn('Key rotation cancelled by user');
        process.exit(0);
      }
    } else {
      logger.step('5/8', 'Force mode - skipping confirmation');
    }
    
    // Step 6: Update configuration
    logger.step('6/8', 'Updating configuration...');
    updateEnvironmentFile(newKey.trim());
    logger.success('Configuration updated with new key');
    
    // Step 7: Test functionality
    logger.step('7/8', 'Testing application functionality...');
    const testResults = await testApplicationFunctionality();
    const allTestsPassed = testResults.every(test => test.success);
    
    if (allTestsPassed) {
      logger.success('All functionality tests passed');
    } else {
      logger.error('Some tests failed - consider rollback');
      
      const failedTests = testResults.filter(test => !test.success);
      failedTests.forEach(test => {
        logger.error(`Failed test: ${test.name}`);
        if (test.error) logger.debug(`Error: ${test.error}`);
      });
      
      const shouldRollback = await confirm('Rollback to previous key?');
      if (shouldRollback) {
        await rollbackToPrevious(backupDir);
        process.exit(1);
      }
    }
    
    // Step 8: Finalize and report
    logger.step('8/8', 'Finalizing rotation...');
    
    const rotationData = {
      timestamp: new Date().toISOString(),
      success: allTestsPassed,
      rotatedKeys: ['OPENAI_API_KEY'],
      previousKeyHash: currentKeyHash,
      newKeyHash: validation.keyInfo.hash,
      newKeyType: validation.keyInfo.keyType,
      backupLocation: backupDir,
      testResults
    };
    
    const reportPath = generateRotationReport(rotationData);
    
    // Update backup metadata
    metadata.rotatedKeys = rotationData.rotatedKeys;
    metadata.success = rotationData.success;
    writeFileSync(join(backupDir, 'rotation-metadata.json'), JSON.stringify(metadata, null, 2));
    
    logger.success('Key rotation completed successfully');
    
    // Final summary
    logger.header('✨ Rotation Complete');
    
    console.log(`${colors.green}New API key is active:${colors.reset}`);
    console.log(`• Key type: ${validation.keyInfo.keyType}`);
    console.log(`• Hash: ${validation.keyInfo.hash}`);
    console.log(`• Available models: ${validation.apiInfo.totalModels}`);
    console.log(`• Tests passed: ${testResults.filter(t => t.success).length}/${testResults.length}`);
    
    console.log(`\n${colors.blue}Backup information:${colors.reset}`);
    console.log(`• Previous key hash: ${currentKeyHash}`);
    console.log(`• Backup location: ${backupDir}`);
    console.log(`• Report: ${reportPath}`);
    
    console.log(`\n${colors.yellow}Important reminders:${colors.reset}`);
    console.log('• Revoke the old key in OpenAI dashboard');
    console.log('• Update any other applications using the old key');
    console.log('• Test production deployments with new key');
    console.log('• Keep rotation backup for at least 30 days');
    
    console.log(`\n${colors.cyan}Rollback command (if needed):${colors.reset}`);
    console.log('npm run rotate-keys -- --rollback');
    
  } catch (error) {
    logger.error(`Rotation failed: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Run rotation
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
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
 * - **Objective:** Create comprehensive key rotation system
 * - **Strategy:** Backup, validate, rotate, test, rollback workflow
 * - **Outcome:** Zero-downtime key rotation with full recovery options
 */