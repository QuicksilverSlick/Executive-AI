# Cleanup Plan for Executive AI Training Project

## Files Identified for Removal

### 1. Log Files (Safe to delete - regenerated automatically)
- `search-server.log` - Server log file (3.3KB)
- `test.log` - Test log file (2.4KB)  
- `dev.log` - Development log file (24KB)
- `dev_test.log` - Test development log file (141KB)
- `preview.log` - Preview log file (190 bytes)
- Files in node_modules with .log extension

### 2. Test HTML Files in Root Directory (Temporary debugging files)
- `test-voice-token.html` - Voice token testing (2.9KB)
- `test-webrtc-voice.html` - WebRTC voice testing (4.7KB)
- `test-theme-fixes.html` - Theme testing (8.7KB)  
- `test-voice-assistant.html` - Voice assistant testing (9.7KB)
- `test-voice-assistant-comprehensive.html` - Comprehensive voice testing (41.7KB)
- `debug-voice-issue.html` - Voice debugging (1.9KB)

### 3. Test Files in src/pages/ (Development testing files)
- `test-production.html` - Production testing (6.6KB)
- `test-direct-token.astro` - Token testing (1.5KB)
- `test-voice-chat.astro` - Voice chat testing (4.6KB)
- `test-voice-search.astro` - Voice search testing (9.4KB)
- `voice-agent-compatibility-test.astro` - Compatibility testing (11KB)

### 4. Test Files in public/ (Public test files)
- `public/test-voice-debug.html` - Voice debugging
- `public/test-session-persistence.html` - Session persistence testing

### 5. Test Files in dist/ (Build artifacts - duplicates)
- `dist/client/test-voice-debug.html`
- `dist/client/test-session-persistence.html`

### 6. Test JavaScript Files in Root (Temporary test scripts)
- `test-api-key-availability.js` - API key testing (2KB)
- `test-api-local.js` - Local API testing (3KB)
- `test-drip-city-query.js` - Drip city query testing (6.4KB)
- `test-function-calling.js` - Function calling testing (5KB)
- `test-openai-responses-direct.js` - OpenAI response testing (2.8KB)
- `test-responses-api-diagnostic.js` - API diagnostic testing (16.3KB)
- `test-responses-api-simple.js` - Simple API testing (18.7KB)
- `test-responses-api.js` - API testing (24.6KB)
- `test-search-implementation.js` - Search implementation testing (7.9KB)
- `test-voice-search-e2e.js` - E2E voice search testing (7.8KB)
- `verify-server-restart.js` - Server restart verification (3.2KB)

### 7. Shell Test Scripts
- `test-voice-webrtc.sh` - WebRTC voice testing shell script

### 8. Test Component File
- `src/components/voice-agent/test-ssr-fix.js` - SSR fix testing

### 9. Documentation Files (Potentially outdated/redundant)
Multiple .md files that appear to be historical documentation or fix logs that may no longer be needed.

## Files to PRESERVE (Important for production)

### Essential Configuration
- `.env` - Environment variables (keep)
- `astro.config.mjs` - Astro configuration (keep)
- `package.json` - Dependencies (keep)
- `tailwind.config.mjs` - Tailwind CSS config (keep)
- `tsconfig.json` - TypeScript config (keep)

### Essential Scripts
- `search-server.js` - Main search server (keep)
- `start-all-servers.sh` - Server startup script (keep)
- `start-search-server.sh` - Search server startup (keep)
- `restart-dev.sh` - Development restart script (keep)

### Production Code
- All files in `src/` except test files
- Essential configuration files
- Working deployment documentation

## Space Savings Estimate
- Log files: ~170KB
- Test HTML files: ~85KB  
- Test JS files: ~100KB
- Test artifacts in dist/: ~20KB
- **Total estimated savings: ~375KB of temporary files**

## Recommended Action
Proceed with deletion of identified temporary and test files while preserving all production code and essential configuration.