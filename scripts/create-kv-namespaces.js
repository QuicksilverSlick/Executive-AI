/*
 * DREAMFORGE HIVE-MIND CHAIN OF CUSTODY
 *
 * @file-purpose: Script to create and configure KV namespaces for Workers deployment
 * @version: 1.0.0
 * @init-author: developer-agent
 * @init-cc-sessionId: cc-unknown-20250815-296
 * @init-timestamp: 2025-08-15T17:30:00Z
 * @reasoning:
 * - **Objective:** Automate KV namespace creation for session management and rate limiting
 * - **Strategy:** Create all required KV namespaces and update wrangler.toml with actual IDs
 * - **Outcome:** Streamlined deployment process with proper KV configuration
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import path from 'path';

const PROJECT_ROOT = process.cwd();
const WRANGLER_CONFIG = path.join(PROJECT_ROOT, 'wrangler.toml');

function log(message) {
  console.log(`🔑 [KV Setup] ${message}`);
}

function error(message) {
  console.error(`❌ [KV Setup] ${message}`);
}

function success(message) {
  console.log(`✅ [KV Setup] ${message}`);
}

/**
 * Create a KV namespace using Wrangler CLI
 */
function createKVNamespace(name, env = 'production') {
  log(`Creating KV namespace: ${name} (${env})`);
  
  try {
    const envSuffix = env === 'production' ? '' : `-${env}`;
    const namespaceName = `executive-ai-training-${name}${envSuffix}`;
    
    const result = execSync(`wrangler kv:namespace create "${namespaceName}"`, {
      encoding: 'utf-8'
    });
    
    // Extract namespace ID from wrangler output
    const match = result.match(/id = "([a-f0-9]+)"/);
    if (match) {
      const id = match[1];
      success(`Created ${namespaceName}: ${id}`);
      return { name, id, env };
    } else {
      error(`Failed to extract ID from wrangler output: ${result}`);
      return null;
    }
  } catch (err) {
    error(`Failed to create KV namespace ${name}: ${err.message}`);
    return null;
  }
}

/**
 * Update wrangler.toml with actual KV namespace IDs
 */
function updateWranglerConfig(namespaces) {
  log('Updating wrangler.toml with KV namespace IDs...');
  
  try {
    let config = readFileSync(WRANGLER_CONFIG, 'utf-8');
    
    // Group namespaces by environment
    const envGroups = {
      production: [],
      development: [],
      staging: []
    };
    
    namespaces.forEach(ns => {
      if (ns) {
        envGroups[ns.env].push(ns);
      }
    });
    
    // Update production namespaces
    envGroups.production.forEach(ns => {
      const bindingName = ns.name.toUpperCase();
      const regex = new RegExp(`(binding = "${bindingName}"\\s*\\n\\s*id = ")[^"]*"`);
      config = config.replace(regex, `$1${ns.id}"`);
    });
    
    // Update development namespaces
    envGroups.development.forEach(ns => {
      const bindingName = ns.name.toUpperCase();
      const regex = new RegExp(`(\\[env\\.development\\.kv_namespaces\\]\\s*\\n\\s*binding = "${bindingName}"\\s*\\n\\s*id = ")[^"]*"`);
      config = config.replace(regex, `$1${ns.id}"`);
    });
    
    // Update staging namespaces
    envGroups.staging.forEach(ns => {
      const bindingName = ns.name.toUpperCase();
      const regex = new RegExp(`(\\[env\\.staging\\.kv_namespaces\\]\\s*\\n\\s*binding = "${bindingName}"\\s*\\n\\s*id = ")[^"]*"`);
      config = config.replace(regex, `$1${ns.id}"`);
    });
    
    writeFileSync(WRANGLER_CONFIG, config);
    success('wrangler.toml updated with KV namespace IDs');
  } catch (err) {
    error(`Failed to update wrangler.toml: ${err.message}`);
  }
}

/**
 * Create preview namespaces
 */
function createPreviewNamespaces() {
  log('Creating preview namespaces...');
  
  const previewNamespaces = [];
  const namespaceNames = ['sessions', 'rate_limits', 'voice_tokens', 'performance_logs'];
  
  for (const name of namespaceNames) {
    const ns = createKVNamespace(`${name}_preview`, 'preview');
    if (ns) {
      previewNamespaces.push(ns);
    }
  }
  
  return previewNamespaces;
}

/**
 * Display setup instructions
 */
function displayInstructions(namespaces) {
  console.log('\n📋 KV Namespace Setup Complete!\n');
  console.log('Created namespaces:');
  
  namespaces.forEach(ns => {
    if (ns) {
      console.log(`  - ${ns.name} (${ns.env}): ${ns.id}`);
    }
  });
  
  console.log('\n🔐 Next steps:');
  console.log('1. Set up secrets:');
  console.log('   wrangler secret put OPENAI_API_KEY');
  console.log('   wrangler secret put ALLOWED_ORIGINS');
  console.log('   wrangler secret put JWT_SECRET');
  console.log('');
  console.log('2. Update zone_id in wrangler.toml for custom domains');
  console.log('');
  console.log('3. Test deployment:');
  console.log('   npm run workers:deploy:dev');
  console.log('');
  console.log('4. Deploy to production:');
  console.log('   npm run workers:deploy');
}

/**
 * Main setup process
 */
function main() {
  console.log('🚀 Setting up KV namespaces for Executive AI Training Workers deployment\n');
  
  const namespaces = [];
  const namespaceNames = ['sessions', 'rate_limits', 'voice_tokens', 'performance_logs'];
  
  try {
    // Create production namespaces
    log('Creating production namespaces...');
    for (const name of namespaceNames) {
      const ns = createKVNamespace(name, 'production');
      if (ns) {
        namespaces.push(ns);
      }
    }
    
    // Create development namespaces
    log('Creating development namespaces...');
    for (const name of namespaceNames) {
      const ns = createKVNamespace(name, 'development');
      if (ns) {
        namespaces.push(ns);
      }
    }
    
    // Create staging namespaces
    log('Creating staging namespaces...');
    for (const name of namespaceNames) {
      const ns = createKVNamespace(name, 'staging');
      if (ns) {
        namespaces.push(ns);
      }
    }
    
    // Update wrangler.toml with the new IDs
    updateWranglerConfig(namespaces);
    
    // Display completion instructions
    displayInstructions(namespaces);
    
  } catch (err) {
    error(`Setup failed: ${err.message}`);
    process.exit(1);
  }
}

// Check if wrangler is available
try {
  execSync('wrangler --version', { stdio: 'pipe' });
} catch (err) {
  error('Wrangler CLI not found. Please install with: npm install -g wrangler');
  process.exit(1);
}

// Run the setup process
main();

/*
 * DREAMFORGE AUDIT TRAIL
 *
 * ---
 * @revision: 1.0.0
 * @author: developer-agent
 * @cc-sessionId: cc-unknown-20250815-296
 * @timestamp: 2025-08-15T17:30:00Z
 * @reasoning:
 * - **Objective:** Created automated KV namespace setup script for Workers deployment
 * - **Strategy:** Generate all required namespaces for different environments and update configuration automatically
 * - **Outcome:** Streamlined deployment process with proper KV infrastructure setup
 */