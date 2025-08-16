<!--
 * DREAMFORGE HIVE-MIND CHAIN OF CUSTODY
 *
 * @file-purpose: Deployment checklist for Cloudflare Workers
 * @version: 1.0.0
 * @init-author: deploy-agent
 * @init-cc-sessionId: cc-deploy-20250815-001
 * @init-timestamp: 2025-08-15T20:00:00Z
 * @reasoning:
 * - **Objective:** Provide actionable deployment checklist
 * - **Strategy:** Step-by-step guide for production deployment
 * - **Outcome:** Clear checklist for deployment team
 -->

# Cloudflare Workers Deployment Checklist

## Pre-Deployment Setup

### 1. Account & Authentication
- [ ] Cloudflare account with Workers plan enabled
- [ ] Wrangler CLI installed locally
- [ ] Authenticated with Cloudflare: `wrangler login`
- [ ] Verified authentication: `wrangler whoami`

### 2. API Keys & Secrets
- [ ] OpenAI API key available
- [ ] JWT secret generated (32+ characters)
- [ ] Admin password defined
- [ ] Domain ownership verified

### 3. Environment Configuration
- [ ] Zone ID updated in `wrangler.toml`
- [ ] Domain DNS configured
- [ ] KV namespace limits verified

## Deployment Steps

### 1. Create KV Namespaces
```bash
npm run workers:kv:create
```
- [ ] Production namespaces created
- [ ] Development namespaces created
- [ ] Staging namespaces created
- [ ] Namespace IDs updated in `wrangler.toml`

### 2. Set Environment Secrets
```bash
wrangler secret put OPENAI_API_KEY
wrangler secret put JWT_SECRET
wrangler secret put ADMIN_PASSWORD
```
- [ ] OPENAI_API_KEY configured
- [ ] JWT_SECRET configured
- [ ] ADMIN_PASSWORD configured
- [ ] ALLOWED_ORIGINS configured (if needed)

### 3. Build Application
```bash
npm run build:workers
```
- [ ] Build completed successfully
- [ ] Bundle size verified (< 1MB)
- [ ] Asset optimization completed

### 4. Deploy to Environments

#### Development
```bash
npm run workers:deploy:dev
```
- [ ] Development deployment successful
- [ ] Development URL accessible
- [ ] Basic functionality verified

#### Staging
```bash
npm run workers:deploy:staging
```
- [ ] Staging deployment successful
- [ ] Staging URL accessible
- [ ] Full functionality tested

#### Production
```bash
npm run workers:deploy
```
- [ ] Production deployment successful
- [ ] Production URL accessible
- [ ] Custom domain working

## Post-Deployment Verification

### 1. Functionality Tests
- [ ] Voice agent initialization works
- [ ] WebRTC connection establishes
- [ ] OpenAI API integration functional
- [ ] Session management working
- [ ] Rate limiting active

### 2. Performance Tests
- [ ] Response times < 200ms
- [ ] Voice latency acceptable
- [ ] KV operations responsive
- [ ] Error rates < 1%

### 3. Security Tests
- [ ] CORS headers configured
- [ ] JWT tokens validated
- [ ] Admin endpoints protected
- [ ] Rate limiting effective

## Monitoring Setup

### 1. Logging
```bash
wrangler tail
```
- [ ] Real-time logs accessible
- [ ] Error patterns identified
- [ ] Performance metrics collected

### 2. Alerts
- [ ] Error rate alerts configured
- [ ] Performance degradation alerts
- [ ] KV quota alerts
- [ ] CPU time usage alerts

## Rollback Plan

### If Issues Arise
1. **Immediate Rollback**:
   ```bash
   wrangler rollback [previous-version-id]
   ```

2. **Traffic Redirect**:
   - Update DNS to previous environment
   - Disable problematic routes

3. **Debug & Fix**:
   - Review logs: `wrangler tail`
   - Test locally: `wrangler dev`
   - Deploy fix: `npm run workers:deploy`

## Success Criteria

- [ ] Application loads in < 3 seconds
- [ ] Voice agent responds in < 500ms
- [ ] All API endpoints functional
- [ ] No critical errors in logs
- [ ] Performance metrics within targets
- [ ] Custom domain accessible
- [ ] SSL certificate valid

## Notes

**Deployment URLs**:
- Development: `executive-ai-training-dev.{account}.workers.dev`
- Staging: `executive-ai-training-staging.{account}.workers.dev`
- Production: `executive-ai-training.{account}.workers.dev`

**Key Commands**:
- Build: `npm run build:workers`
- Deploy: `npm run workers:deploy`
- Logs: `wrangler tail`
- Status: `wrangler deployments list`

---

**Created by**: deploy-agent  
**Date**: 2025-08-15T20:00:56Z  
**Version**: 1.0.0

<!--
 * DREAMFORGE AUDIT TRAIL
 *
 * ---
 * @revision: 1.0.0
 * @author: deploy-agent
 * @cc-sessionId: cc-deploy-20250815-001
 * @timestamp: 2025-08-15T20:00:56Z
 * @reasoning:
 * - **Objective:** Create actionable deployment checklist for production team
 * - **Strategy:** Step-by-step checklist with commands and verification steps
 * - **Outcome:** Clear checklist for successful deployment execution
 -->