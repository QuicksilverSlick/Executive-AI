#!/usr/bin/env node

/*
 * DREAMFORGE HIVE-MIND CHAIN OF CUSTODY
 *
 * @file-purpose: Client-side security audit to detect API key exposure
 * @version: 1.0.0
 * @init-author: developer-agent
 * @init-cc-sessionId: cc-unknown-20250806-243
 * @init-timestamp: 2025-08-06T00:00:00Z
 * @reasoning:
 * - **Objective:** Audit client-side code for security vulnerabilities
 * - **Strategy:** Static analysis for API key exposure and security issues
 * - **Outcome:** Comprehensive security audit with remediation guidance
 */

import { readFileSync, existsSync, writeFileSync } from 'fs';
import { join, dirname, relative } from 'path';
import { fileURLToPath } from 'url';
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
 * Get list of files to audit
 */
function getFilesToAudit() {
  const extensions = ['.ts', '.js', '.tsx', '.jsx', '.astro', '.vue', '.svelte'];
  const directories = ['src', 'public'];
  const excludePatterns = [
    'node_modules',
    '.git',
    'dist',
    '.astro',
    '*.test.*',
    '*.spec.*',
    'test',
    'tests',
    '__tests__'
  ];
  
  const files = [];
  
  for (const dir of directories) {
    const dirPath = join(projectRoot, dir);
    if (existsSync(dirPath)) {
      try {
        const findCmd = `find ${dirPath} -type f \\( ${extensions.map(ext => `-name "*${ext}"`).join(' -o ')} \\)`;
        const output = execSync(findCmd, { encoding: 'utf8' });
        
        const dirFiles = output
          .split('\n')
          .filter(file => file.trim())
          .filter(file => !excludePatterns.some(pattern => file.includes(pattern)));
        
        files.push(...dirFiles);
      } catch (error) {
        logger.debug(`Could not scan directory ${dir}: ${error.message}`);
      }
    }
  }
  
  return files.sort();
}

/**
 * Analyze file content for security issues
 */
function analyzeFile(filePath) {
  const issues = [];
  const relativePath = relative(projectRoot, filePath);
  
  try {
    const content = readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      const lineNum = index + 1;
      const trimmedLine = line.trim();
      
      // Check for API keys in client-side code
      const apiKeyPatterns = [
        {
          pattern: /sk-[a-zA-Z0-9]{48}/g,
          type: 'api_key_exposure',
          severity: 'CRITICAL',
          message: 'OpenAI API key detected in client-side code'
        },
        {
          pattern: /sk-proj-[a-zA-Z0-9\-_]{64,}/g,
          type: 'api_key_exposure',
          severity: 'CRITICAL',
          message: 'OpenAI Project API key detected in client-side code'
        },
        {
          pattern: /VITE_.*API_KEY/gi,
          type: 'env_exposure',
          severity: 'HIGH',
          message: 'VITE environment variable exposes API key to client'
        },
        {
          pattern: /PUBLIC_.*API_KEY/gi,
          type: 'env_exposure',
          severity: 'CRITICAL',
          message: 'PUBLIC environment variable exposes API key to client'
        },
        {
          pattern: /import\.meta\.env\.PUBLIC_.*API_KEY/gi,
          type: 'env_exposure',
          severity: 'CRITICAL',
          message: 'PUBLIC environment variable accessed in client code'
        }
      ];
      
      // Security anti-patterns
      const securityPatterns = [
        {
          pattern: /fetch\s*\(\s*['"`]https:\/\/api\.openai\.com/gi,
          type: 'direct_api_call',
          severity: 'HIGH',
          message: 'Direct OpenAI API call from client-side code'
        },
        {
          pattern: /Authorization.*Bearer.*\$\{/gi,
          type: 'auth_injection',
          severity: 'HIGH',
          message: 'Authorization header with variable interpolation'
        },
        {
          pattern: /localStorage.*[Aa][Pp][Ii].*[Kk]ey/g,
          type: 'storage_exposure',
          severity: 'HIGH',
          message: 'API key stored in localStorage'
        },
        {
          pattern: /sessionStorage.*[Aa][Pp][Ii].*[Kk]ey/g,
          type: 'storage_exposure',
          severity: 'HIGH',
          message: 'API key stored in sessionStorage'
        },
        {
          pattern: /console\.log.*[Aa][Pp][Ii].*[Kk]ey/g,
          type: 'logging_exposure',
          severity: 'MEDIUM',
          message: 'Potential API key logging to console'
        }
      ];
      
      // Check for hardcoded secrets
      const secretPatterns = [
        {
          pattern: /password\s*[=:]\s*['"`][^'"`\s]{8,}/gi,
          type: 'hardcoded_secret',
          severity: 'HIGH',
          message: 'Hardcoded password detected'
        },
        {
          pattern: /token\s*[=:]\s*['"`][a-zA-Z0-9+/]{20,}/gi,
          type: 'hardcoded_secret',
          severity: 'HIGH',
          message: 'Hardcoded token detected'
        }
      ];
      
      const allPatterns = [...apiKeyPatterns, ...securityPatterns, ...secretPatterns];
      
      allPatterns.forEach(({ pattern, type, severity, message }) => {
        const matches = line.match(pattern);
        if (matches) {
          matches.forEach(match => {
            issues.push({
              file: relativePath,
              line: lineNum,
              column: line.indexOf(match) + 1,
              type,
              severity,
              message,
              code: trimmedLine,
              match: match.substring(0, 50) + (match.length > 50 ? '...' : '')
            });
          });
        }
      });
    });
    
    // Check for import.meta.env usage patterns
    if (content.includes('import.meta.env')) {
      const envMatches = content.match(/import\.meta\.env\.([A-Z_]+)/g);
      if (envMatches) {
        envMatches.forEach(match => {
          const varName = match.replace('import.meta.env.', '');
          if (!varName.startsWith('PUBLIC_') && !relativePath.includes('/api/') && !relativePath.includes('pages/api/')) {
            issues.push({
              file: relativePath,
              line: content.split('\n').findIndex(line => line.includes(match)) + 1,
              column: 0,
              type: 'env_usage',
              severity: 'MEDIUM',
              message: `Non-public environment variable ${varName} accessed in client code`,
              code: match,
              match: match
            });
          }
        });
      }
    }
    
  } catch (error) {
    issues.push({
      file: relativePath,
      line: 0,
      column: 0,
      type: 'file_error',
      severity: 'LOW',
      message: `Could not read file: ${error.message}`,
      code: '',
      match: ''
    });
  }
  
  return issues;
}

/**
 * Check build output for secrets
 */
function auditBuildOutput() {
  const buildDir = join(projectRoot, 'dist');
  if (!existsSync(buildDir)) {
    return [];
  }
  
  const issues = [];
  
  try {
    // Find all JS and HTML files in build output
    const findCmd = `find ${buildDir} -type f \\( -name "*.js" -o -name "*.html" -o -name "*.css" \\)`;
    const files = execSync(findCmd, { encoding: 'utf8' })
      .split('\n')
      .filter(file => file.trim());
    
    files.forEach(file => {
      if (existsSync(file)) {
        const content = readFileSync(file, 'utf8');
        
        // Look for API key patterns in built files
        const patterns = [
          /sk-[a-zA-Z0-9]{48}/g,
          /sk-proj-[a-zA-Z0-9\-_]{64,}/g
        ];
        
        patterns.forEach((pattern, patternIndex) => {
          const matches = content.match(pattern);
          if (matches) {
            matches.forEach(match => {
              issues.push({
                file: relative(projectRoot, file),
                line: 0,
                column: 0,
                type: 'build_exposure',
                severity: 'CRITICAL',
                message: 'API key found in build output',
                code: '',
                match: match.substring(0, 20) + '...'
              });
            });
          }
        });
      }
    });
    
  } catch (error) {
    logger.debug(`Could not audit build output: ${error.message}`);
  }
  
  return issues;
}

/**
 * Generate security recommendations
 */
function generateRecommendations(issues) {
  const recommendations = [];
  const issueTypes = new Set(issues.map(issue => issue.type));
  
  if (issueTypes.has('api_key_exposure') || issueTypes.has('env_exposure')) {
    recommendations.push({
      priority: 'CRITICAL',
      title: 'Remove API Keys from Client Code',
      actions: [
        'Move all API key usage to server-side endpoints (/api/ routes)',
        'Use import.meta.env.OPENAI_API_KEY only in server-side code',
        'Never use PUBLIC_ or VITE_ prefixes for sensitive data',
        'Implement proxy endpoints for API calls'
      ]
    });
  }
  
  if (issueTypes.has('direct_api_call')) {
    recommendations.push({
      priority: 'HIGH',
      title: 'Eliminate Direct API Calls',
      actions: [
        'Create server-side proxy endpoints in /src/pages/api/',
        'Route all OpenAI API calls through your backend',
        'Implement proper authentication and rate limiting',
        'Add CORS protection for API endpoints'
      ]
    });
  }
  
  if (issueTypes.has('storage_exposure')) {
    recommendations.push({
      priority: 'HIGH',
      title: 'Secure Client-Side Storage',
      actions: [
        'Remove API keys from localStorage/sessionStorage',
        'Use short-lived session tokens instead',
        'Implement secure session management',
        'Consider using HTTP-only cookies for sensitive data'
      ]
    });
  }
  
  if (issueTypes.has('build_exposure')) {
    recommendations.push({
      priority: 'CRITICAL',
      title: 'Clean Build Output',
      actions: [
        'Rebuild the application after removing secrets',
        'Check build configuration for environment variable exposure',
        'Use build-time secret replacement if needed',
        'Add build validation to CI/CD pipeline'
      ]
    });
  }
  
  // General recommendations
  recommendations.push({
    priority: 'MEDIUM',
    title: 'Implement Security Best Practices',
    actions: [
      'Add pre-commit hooks to scan for secrets',
      'Use environment variable validation',
      'Implement Content Security Policy (CSP)',
      'Regular security audits and dependency updates',
      'Add API key rotation procedures'
    ]
  });
  
  return recommendations;
}

/**
 * Generate security report
 */
function generateSecurityReport(issues, recommendations) {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalIssues: issues.length,
      criticalIssues: issues.filter(i => i.severity === 'CRITICAL').length,
      highIssues: issues.filter(i => i.severity === 'HIGH').length,
      mediumIssues: issues.filter(i => i.severity === 'MEDIUM').length,
      lowIssues: issues.filter(i => i.severity === 'LOW').length
    },
    issues: issues.map(issue => ({
      ...issue,
      // Truncate sensitive data in report
      match: issue.match && issue.match.length > 20 ? 
        issue.match.substring(0, 20) + '...' : issue.match
    })),
    recommendations,
    scanDetails: {
      filesScanned: 0,
      patterns: [
        'API key patterns (sk-*, sk-proj-*)',
        'Environment variable exposure (VITE_*, PUBLIC_*)',
        'Direct API calls to external services',
        'Client-side storage of sensitive data',
        'Hardcoded secrets and tokens'
      ]
    }
  };
  
  const reportPath = join(projectRoot, '.security', 'client-security-audit.json');
  writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  return { report, reportPath };
}

/**
 * Main audit function
 */
async function main() {
  logger.header('🛡️  Client-Side Security Audit');
  
  const args = process.argv.slice(2);
  const includeBuild = args.includes('--include-build');
  const fixIssues = args.includes('--fix');
  
  let allIssues = [];
  
  // Step 1: Get files to audit
  logger.step('1/5', 'Scanning for files to audit...');
  const files = getFilesToAudit();
  logger.info(`Found ${files.length} files to scan`);
  
  // Step 2: Analyze source files
  logger.step('2/5', 'Analyzing source code for security issues...');
  let filesScanned = 0;
  
  files.forEach(file => {
    const issues = analyzeFile(file);
    allIssues.push(...issues);
    filesScanned++;
    
    if (filesScanned % 10 === 0) {
      logger.debug(`Scanned ${filesScanned}/${files.length} files`);
    }
  });
  
  logger.info(`Scanned ${filesScanned} source files`);
  
  // Step 3: Audit build output if requested
  if (includeBuild) {
    logger.step('3/5', 'Auditing build output...');
    const buildIssues = auditBuildOutput();
    allIssues.push(...buildIssues);
    logger.info(`Found ${buildIssues.length} build-related issues`);
  } else {
    logger.step('3/5', 'Skipping build output audit (use --include-build to enable)');
  }
  
  // Step 4: Generate recommendations
  logger.step('4/5', 'Generating security recommendations...');
  const recommendations = generateRecommendations(allIssues);
  logger.info(`Generated ${recommendations.length} recommendations`);
  
  // Step 5: Generate report
  logger.step('5/5', 'Generating security report...');
  const { report, reportPath } = generateSecurityReport(allIssues, recommendations);
  report.scanDetails.filesScanned = filesScanned;
  
  // Display results
  logger.header('🎯 Security Audit Results');
  
  const { summary } = report;
  const totalScore = Math.max(0, 100 - (summary.criticalIssues * 25) - (summary.highIssues * 10) - (summary.mediumIssues * 2));
  
  console.log(`${colors.bold}Security Score: ${totalScore >= 80 ? colors.green : totalScore >= 60 ? colors.yellow : colors.red}${totalScore}/100${colors.reset}`);
  console.log(`${colors.blue}Issues Found:${colors.reset}`);
  console.log(`• Critical: ${summary.criticalIssues}`);
  console.log(`• High: ${summary.highIssues}`);
  console.log(`• Medium: ${summary.mediumIssues}`);
  console.log(`• Low: ${summary.lowIssues}`);
  
  // Display critical issues
  const criticalIssues = allIssues.filter(i => i.severity === 'CRITICAL');
  if (criticalIssues.length > 0) {
    console.log(`\n${colors.red}${colors.bold}🚨 CRITICAL ISSUES:${colors.reset}`);
    criticalIssues.forEach(issue => {
      console.log(`${colors.red}•${colors.reset} ${issue.file}:${issue.line} - ${issue.message}`);
      if (issue.code) {
        console.log(`  ${colors.dim}Code: ${issue.code}${colors.reset}`);
      }
    });
  }
  
  // Display high priority issues
  const highIssues = allIssues.filter(i => i.severity === 'HIGH');
  if (highIssues.length > 0) {
    console.log(`\n${colors.yellow}${colors.bold}⚠️  HIGH PRIORITY ISSUES:${colors.reset}`);
    highIssues.slice(0, 5).forEach(issue => {
      console.log(`${colors.yellow}•${colors.reset} ${issue.file}:${issue.line} - ${issue.message}`);
    });
    if (highIssues.length > 5) {
      console.log(`  ${colors.dim}... and ${highIssues.length - 5} more (see full report)${colors.reset}`);
    }
  }
  
  // Display recommendations
  const criticalRecs = recommendations.filter(r => r.priority === 'CRITICAL');
  if (criticalRecs.length > 0) {
    console.log(`\n${colors.red}${colors.bold}🔧 CRITICAL ACTIONS NEEDED:${colors.reset}`);
    criticalRecs.forEach(rec => {
      console.log(`${colors.red}▶${colors.reset} ${rec.title}`);
      rec.actions.slice(0, 2).forEach(action => {
        console.log(`  • ${action}`);
      });
    });
  }
  
  // Summary and next steps
  console.log(`\n${colors.blue}Report Details:${colors.reset}`);
  console.log(`• Full Report: ${reportPath}`);
  console.log(`• Files Scanned: ${filesScanned}`);
  console.log(`• Build Output: ${includeBuild ? 'Included' : 'Skipped'}`);
  
  console.log(`\n${colors.yellow}Next Steps:${colors.reset}`);
  console.log('• Review the full security report');
  console.log('• Address critical and high-priority issues first');
  console.log('• Run: npm run setup-secure-env (if not done already)');
  console.log('• Add security checks to your CI/CD pipeline');
  console.log('• Re-run audit after fixes: npm run audit-client-security');
  
  if (summary.criticalIssues > 0) {
    console.log(`\n${colors.red}⚠️  IMMEDIATE ACTION REQUIRED${colors.reset}`);
    console.log('Critical security issues detected - fix before deploying to production');
    process.exit(1);
  } else if (summary.highIssues > 0) {
    console.log(`\n${colors.yellow}⚡ High-priority issues found${colors.reset}`);
    console.log('Review and address these issues promptly');
    process.exit(0);
  } else {
    console.log(`\n${colors.green}✅ No critical security issues found${colors.reset}`);
    console.log('Your client-side code appears secure');
    process.exit(0);
  }
}

// Run audit
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    logger.error(`Security audit failed: ${error.message}`);
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
 * - **Objective:** Create comprehensive client-side security audit tool
 * - **Strategy:** Static analysis with pattern matching for security vulnerabilities
 * - **Outcome:** Automated security scanning with actionable recommendations
 */