# Security Guide

This document outlines the security measures, best practices, and tools implemented in the Executive AI Training project.

## 🔐 API Key Security System

### Overview

This project implements a comprehensive API key validation and security system with the following components:

1. **Key Validation & Testing** - Automated validation of OpenAI API keys
2. **Secure Environment Setup** - Encrypted storage and secure configuration
3. **Key Rotation System** - Zero-downtime key rotation with rollback
4. **Usage Monitoring** - Real-time monitoring and anomaly detection
5. **Client-Side Security Audit** - Automated scanning for security vulnerabilities

### Quick Start

```bash
# Set up secure environment (run once)
npm run setup-secure-env

# Validate API keys
npm run validate-api-keys

# Monitor API usage
npm run monitor-api-usage

# Audit client-side security
npm run audit-client-security

# Full security audit
npm run security-full-audit
```

## 🛡️ Security Architecture

### Server-Side Only API Keys

All API keys are handled exclusively on the server side:

- ✅ API keys stored in `.env.local` (not committed to git)
- ✅ All OpenAI API calls routed through `/api/` endpoints
- ✅ Client receives only ephemeral session tokens
- ✅ Rate limiting and CORS protection on all endpoints

### Environment Variable Security

```bash
# ✅ SECURE - Server-side only
OPENAI_API_KEY=sk-proj-your-key-here

# ❌ INSECURE - Exposed to client
VITE_OPENAI_API_KEY=sk-proj-your-key-here  # Don't do this!
PUBLIC_OPENAI_API_KEY=sk-proj-your-key-here  # Never do this!
```

### File Structure

```
.security/
├── keys/                    # Encryption keys (git-ignored)
├── backups/                 # Configuration backups
├── rotations/               # Key rotation history
├── api-key-audit.json      # Latest security audit
├── usage-history.json      # API usage tracking
└── client-security-audit.json  # Client-side security scan
```

## 🔍 Security Tools

### 1. API Key Validator (`validate-api-keys`)

Comprehensive validation system that checks:

- **Key Format**: Validates OpenAI key patterns and structure
- **API Access**: Tests connectivity and available models
- **Realtime API**: Verifies access to voice/realtime features
- **Responses API**: Tests tool integration capabilities
- **Rate Limits**: Reports current usage and limits
- **Security Audit**: Identifies configuration issues

```bash
npm run validate-api-keys
```

**Output:**
```
🔐 OpenAI API Key Security Validator

[1/7] Loading environment configuration...
✅ Loaded environment from: .env.local

[2/7] Validating API key format...
✅ Valid Project Key: sk-proj-aQso...YqgA

[3/7] Testing API connectivity...
✅ Connected successfully - 52 models available

[4/7] Testing Realtime API access...
✅ Realtime API available - session expires 2025-08-06T01:00:00.000Z

[5/7] Testing Responses API with tools...
✅ Responses API working - tools supported: true

[6/7] Checking usage and billing...
ℹ Usage information not available

[7/7] Conducting security audit...
✅ No security issues found

🎯 Validation Summary
Security Score: 5/5
🎉 API key configuration is secure and functional
```

### 2. Secure Environment Setup (`setup-secure-env`)

Automated environment security configuration:

- **Backup Creation**: Safely backs up existing configuration
- **Duplicate Removal**: Eliminates unsafe duplicate keys
- **Encryption**: Creates encrypted backups of sensitive data
- **Validation**: Tests new configuration
- **Git Security**: Updates `.gitignore` for security

```bash
npm run setup-secure-env
```

### 3. Key Rotation System (`rotate-keys`)

Zero-downtime API key rotation with safety features:

- **Pre-validation**: Tests new keys before switching
- **Backup & Restore**: Complete rollback capability
- **Session Tracking**: Maintains active session continuity
- **Automated Testing**: Validates functionality post-rotation

```bash
# Interactive rotation
npm run rotate-keys

# Force rotation (skip confirmations)
npm run rotate-keys -- --force

# Rollback to previous key
npm run rotate-keys -- --rollback
```

### 4. Usage Monitoring (`monitor-api-usage`)

Real-time API usage monitoring and anomaly detection:

- **Rate Limit Tracking**: Monitors API quotas and usage
- **Performance Monitoring**: Tracks response times
- **Anomaly Detection**: Identifies unusual patterns
- **Security Alerts**: Notifies of potential security issues
- **Historical Analysis**: Trends and usage patterns

```bash
# Single monitoring run
npm run monitor-api-usage

# Continuous monitoring
npm run monitor-watch

# Custom interval (60 seconds)
npm run monitor-api-usage -- --watch --interval 60
```

### 5. Client-Side Security Audit (`audit-client-security`)

Automated scanning for client-side security vulnerabilities:

- **API Key Exposure**: Detects leaked keys in client code
- **Environment Variable Misuse**: Identifies unsafe env var usage
- **Direct API Calls**: Finds unproxied external API calls
- **Storage Security**: Checks for sensitive data in localStorage
- **Build Output Analysis**: Scans compiled assets for secrets

```bash
# Audit source code
npm run audit-client-security

# Include build output analysis
npm run audit-client-security -- --include-build
```

## 📋 Security Checklist

### Initial Setup

- [ ] Run `npm run setup-secure-env` to configure secure environment
- [ ] Verify `.env.local` contains only server-side variables
- [ ] Ensure `.env` file has no real API keys
- [ ] Check `.gitignore` excludes all sensitive files
- [ ] Run `npm run validate-api-keys` to confirm setup

### Development Workflow

- [ ] Never use `PUBLIC_` or `VITE_` prefixes for sensitive data
- [ ] Route all API calls through `/src/pages/api/` endpoints
- [ ] Use `import.meta.env.OPENAI_API_KEY` only in server-side code
- [ ] Run `npm run audit-client-security` before commits
- [ ] Monitor API usage with `npm run monitor-api-usage`

### Production Deployment

- [ ] Rotate API keys before production deployment
- [ ] Enable continuous monitoring with `npm run monitor-watch`
- [ ] Set up alerts for critical security events
- [ ] Implement automated security scanning in CI/CD
- [ ] Review security audit reports regularly

### Key Rotation Schedule

- [ ] Rotate keys every 90 days (recommended)
- [ ] Rotate immediately if key compromise suspected
- [ ] Test new keys in staging before production
- [ ] Keep rotation backups for 30 days minimum

## 🚨 Security Incident Response

### If API Key is Compromised

1. **Immediate Actions:**
   ```bash
   # Rotate to new key immediately
   npm run rotate-keys -- --force
   
   # Monitor for unusual activity
   npm run monitor-watch
   ```

2. **Investigation:**
   - Check usage monitoring logs for anomalies
   - Review access logs for unauthorized usage
   - Scan client code for potential exposure points

3. **Recovery:**
   - Generate new API key in OpenAI dashboard
   - Update production environment variables
   - Revoke compromised key in OpenAI dashboard
   - Document incident and lessons learned

### If Security Audit Fails

```bash
# Run comprehensive audit
npm run security-full-audit

# Check specific issues
npm run audit-client-security -- --include-build

# Fix environment issues
npm run setup-secure-env
```

## 📊 Security Metrics & Monitoring

### Key Performance Indicators

- **Security Score**: Automated scoring from security audits
- **API Response Time**: Performance monitoring for anomaly detection
- **Rate Limit Utilization**: Percentage of API quotas used
- **Failed Authentication Rate**: Frequency of auth failures
- **Key Rotation Frequency**: Compliance with rotation schedule

### Alerting Thresholds

- **Critical**: API key exposure, direct API calls from client
- **High**: Rate limit approaching, performance degradation
- **Medium**: Unusual usage patterns, configuration warnings
- **Low**: General security recommendations

### Historical Analysis

All security events and metrics are stored in:
- `.security/usage-history.json` - API usage patterns
- `.security/security-alerts.log` - Security event log
- `.security/rotation-report.json` - Key rotation history

## 🔧 Configuration Reference

### Environment Variables

```bash
# Required - Server-side only
OPENAI_API_KEY=sk-proj-your-project-key

# Security Configuration
VOICE_AGENT_RATE_LIMIT=100        # Requests per minute
VOICE_AGENT_TOKEN_DURATION=60     # Token lifetime in seconds
ALLOWED_ORIGINS=http://localhost:4321,https://yourdomain.com

# Optional - Public variables (safe for client)
PUBLIC_SITE_URL=https://yourdomain.com
PUBLIC_SITE_NAME="Your Site Name"
```

### Security Headers

The application implements security headers:

```javascript
// Automatic CORS protection
'Access-Control-Allow-Origin': 'https://yourdomain.com'
'Access-Control-Allow-Methods': 'POST'
'Access-Control-Allow-Headers': 'Content-Type, Authorization'

// Cache prevention for sensitive endpoints
'Cache-Control': 'no-cache, no-store, must-revalidate'
```

## 🔄 CI/CD Integration

### Pre-commit Hooks

Add to `.git/hooks/pre-commit`:

```bash
#!/bin/bash
npm run audit-client-security
if [ $? -ne 0 ]; then
  echo "❌ Security audit failed - commit blocked"
  exit 1
fi
```

### GitHub Actions

```yaml
name: Security Audit
on: [push, pull_request]

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run security-full-audit
      - run: npm run audit-client-security -- --include-build
```

## 📞 Support & Reporting

### Security Issues

If you discover a security vulnerability:

1. **Do NOT** create a public issue
2. Email security concerns to: [security@executiveaitraining.com]
3. Include detailed description and reproduction steps
4. Allow reasonable time for response before disclosure

### Getting Help

- Run `npm run validate-api-keys -- --help` for tool-specific help
- Check `.security/` directory for detailed audit reports
- Review this documentation for best practices
- Contact support for configuration assistance

---

*This security guide is automatically updated with each security system release. Last updated: 2025-08-06*