#!/bin/bash

#
# DREAMFORGE HIVE-MIND CHAIN OF CUSTODY
#
# @file-purpose: Complete deployment script for Executive AI Training Workers with static assets
# @version: 1.0.0
# @init-author: developer-agent
# @init-cc-sessionId: cc-unknown-20250815-296
# @init-timestamp: 2025-08-15T17:30:00Z
# @reasoning:
# - **Objective:** Create comprehensive deployment script for Workers with proper validation and setup
# - **Strategy:** Check prerequisites, build application, configure secrets, and deploy with validation
# - **Outcome:** One-command deployment process for reliable Workers deployment
#

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Emojis for better UX
ROCKET="🚀"
CHECK="✅"
ERROR="❌"
WARNING="⚠️"
INFO="ℹ️"

# Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
LOG_FILE="$PROJECT_ROOT/deploy-workers.log"

# Environment (default to production)
ENVIRONMENT=${1:-production}

# Logging functions
log() {
    echo -e "${BLUE}${INFO}${NC} $1" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}${CHECK}${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}${ERROR}${NC} $1" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}${WARNING}${NC} $1" | tee -a "$LOG_FILE"
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check if wrangler is installed
    if ! command -v wrangler &> /dev/null; then
        error "Wrangler CLI not found. Install with: npm install -g wrangler"
        exit 1
    fi
    
    # Check if wrangler is authenticated
    if ! wrangler whoami &> /dev/null; then
        error "Wrangler not authenticated. Run: wrangler auth login"
        exit 1
    fi
    
    # Check if package.json exists
    if [ ! -f "$PROJECT_ROOT/package.json" ]; then
        error "package.json not found in project root"
        exit 1
    fi
    
    # Check if wrangler.toml exists
    if [ ! -f "$PROJECT_ROOT/wrangler.toml" ]; then
        error "wrangler.toml not found in project root"
        exit 1
    fi
    
    success "Prerequisites check passed"
}

# Check environment variables and secrets
check_secrets() {
    log "Checking required secrets..."
    
    local env_flag=""
    if [ "$ENVIRONMENT" != "production" ]; then
        env_flag="--env $ENVIRONMENT"
    fi
    
    # List current secrets
    local secrets_output
    secrets_output=$(wrangler secret list $env_flag 2>/dev/null || echo "")
    
    # Check for required secrets
    local required_secrets=("OPENAI_API_KEY" "ALLOWED_ORIGINS" "JWT_SECRET")
    local missing_secrets=()
    
    for secret in "${required_secrets[@]}"; do
        if ! echo "$secrets_output" | grep -q "$secret"; then
            missing_secrets+=("$secret")
        fi
    done
    
    if [ ${#missing_secrets[@]} -gt 0 ]; then
        warning "Missing required secrets: ${missing_secrets[*]}"
        echo "Set them with:"
        for secret in "${missing_secrets[@]}"; do
            echo "  wrangler secret put $secret $env_flag"
        done
        
        read -p "Continue without these secrets? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    else
        success "All required secrets are configured"
    fi
}

# Check KV namespaces
check_kv_namespaces() {
    log "Checking KV namespaces..."
    
    # Check if KV namespaces exist
    local kv_output
    kv_output=$(wrangler kv:namespace list 2>/dev/null || echo "")
    
    if [ -z "$kv_output" ] || [ "$kv_output" = "[]" ]; then
        warning "No KV namespaces found"
        read -p "Create KV namespaces now? (Y/n): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Nn]$ ]]; then
            log "Creating KV namespaces..."
            cd "$PROJECT_ROOT"
            npm run workers:kv:create
            success "KV namespaces created"
        fi
    else
        success "KV namespaces are configured"
    fi
}

# Build the application
build_application() {
    log "Building application for Workers deployment..."
    
    cd "$PROJECT_ROOT"
    
    # Clean previous build
    if [ -d "dist" ]; then
        rm -rf dist
    fi
    
    # Build for workers
    npm run workers:build
    
    # Verify build output
    if [ ! -d "dist/_worker.js" ]; then
        error "Worker build failed - missing _worker.js directory"
        exit 1
    fi
    
    if [ ! -f "dist/_worker.js/index.js" ]; then
        error "Worker build failed - missing index.js"
        exit 1
    fi
    
    if [ ! -f "src/worker.js" ]; then
        error "Worker entry point missing - src/worker.js not found"
        exit 1
    fi
    
    success "Application built successfully"
}

# Deploy to Workers
deploy_to_workers() {
    log "Deploying to Cloudflare Workers ($ENVIRONMENT)..."
    
    cd "$PROJECT_ROOT"
    
    local deploy_cmd="wrangler deploy"
    if [ "$ENVIRONMENT" != "production" ]; then
        deploy_cmd="$deploy_cmd --env $ENVIRONMENT"
    fi
    
    # Deploy with proper logging
    if $deploy_cmd 2>&1 | tee -a "$LOG_FILE"; then
        success "Deployment completed successfully"
        
        # Extract deployment URL
        local worker_url
        if [ "$ENVIRONMENT" = "production" ]; then
            worker_url="https://executive-ai-training.workers.dev"
        else
            worker_url="https://executive-ai-training-$ENVIRONMENT.workers.dev"
        fi
        
        echo
        echo -e "${GREEN}${ROCKET} Deployment successful!${NC}"
        echo -e "${BLUE}URL: $worker_url${NC}"
        echo
        
        # Test the deployment
        test_deployment "$worker_url"
    else
        error "Deployment failed"
        exit 1
    fi
}

# Test the deployment
test_deployment() {
    local url=$1
    log "Testing deployment at $url..."
    
    # Test basic connectivity
    if curl -s -f "$url" > /dev/null; then
        success "Basic connectivity test passed"
    else
        warning "Basic connectivity test failed - but deployment may still be successful"
    fi
    
    # Test API health endpoint
    if curl -s -f "$url/api/voice-agent/health" > /dev/null; then
        success "API health check passed"
    else
        warning "API health check failed - API routes may need time to propagate"
    fi
}

# Display post-deployment instructions
show_post_deployment_info() {
    echo
    echo -e "${BLUE}${ROCKET} Post-Deployment Checklist:${NC}"
    echo
    echo "1. Test the voice agent functionality:"
    if [ "$ENVIRONMENT" = "production" ]; then
        echo "   https://executive-ai-training.workers.dev"
    else
        echo "   https://executive-ai-training-$ENVIRONMENT.workers.dev"
    fi
    echo
    echo "2. Monitor logs:"
    echo "   npm run workers:tail"
    if [ "$ENVIRONMENT" != "production" ]; then
        echo "   npm run workers:tail:staging"
    fi
    echo
    echo "3. Check KV storage usage:"
    echo "   wrangler kv:namespace list"
    echo
    echo "4. Monitor performance:"
    echo "   Check Cloudflare Workers dashboard"
    echo
    if [ -f "$PROJECT_ROOT/dist/deployment-info.json" ]; then
        echo "5. Deployment info available at:"
        echo "   $PROJECT_ROOT/dist/deployment-info.json"
        echo
    fi
}

# Main execution
main() {
    echo -e "${GREEN}${ROCKET} Executive AI Training - Workers Deployment${NC}"
    echo -e "${BLUE}Environment: $ENVIRONMENT${NC}"
    echo -e "${BLUE}Log file: $LOG_FILE${NC}"
    echo
    
    # Clear log file
    > "$LOG_FILE"
    
    # Run deployment steps
    check_prerequisites
    check_secrets
    check_kv_namespaces
    build_application
    deploy_to_workers
    show_post_deployment_info
    
    success "Deployment process completed!"
}

# Handle script interruption
trap 'error "Deployment interrupted"; exit 1' INT TERM

# Show usage if help requested
if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    echo "Usage: $0 [environment]"
    echo
    echo "Environments:"
    echo "  production (default)"
    echo "  staging"
    echo "  development"
    echo
    echo "Examples:"
    echo "  $0                    # Deploy to production"
    echo "  $0 staging           # Deploy to staging"
    echo "  $0 development       # Deploy to development"
    exit 0
fi

# Validate environment
if [ "$ENVIRONMENT" != "production" ] && [ "$ENVIRONMENT" != "staging" ] && [ "$ENVIRONMENT" != "development" ]; then
    error "Invalid environment: $ENVIRONMENT"
    error "Valid environments: production, staging, development"
    exit 1
fi

# Run main function
main

#
# DREAMFORGE AUDIT TRAIL
#
# ---
# @revision: 1.0.0
# @author: developer-agent
# @cc-sessionId: cc-unknown-20250815-296
# @timestamp: 2025-08-15T17:30:00Z
# @reasoning:
# - **Objective:** Created comprehensive deployment script for Workers with validation and testing
# - **Strategy:** Step-by-step deployment process with proper error handling and user feedback
# - **Outcome:** Reliable one-command deployment process for all environments
#