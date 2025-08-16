#!/bin/bash

# ============================================================================
# Vercel Deployment Preparation Script
# ============================================================================
# This script prepares the project for Vercel deployment without requiring
# interactive login. It validates the build and creates deployment artifacts.
#
# Usage:
#   ./scripts/prepare-vercel-deployment.sh
# ============================================================================

set -euo pipefail

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Preparing Vercel Deployment for Executive AI Training${NC}"
echo "============================================================================"

# Function to print colored messages
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if build was successful
check_build() {
    log_info "Checking build output..."
    
    if [ ! -d ".vercel/output" ]; then
        log_error "Vercel output directory not found. Please run 'npm run build:vercel' first."
        exit 1
    fi
    
    if [ ! -f ".vercel/output/config.json" ]; then
        log_error "Vercel config.json not found in output directory."
        exit 1
    fi
    
    log_success "Build output verified"
}

# Validate environment
validate_environment() {
    log_info "Validating environment..."
    
    # Check for environment file
    if [ ! -f ".env.local" ]; then
        log_warning "No .env.local file found"
        log_info "Creating .env.local from template..."
        
        if [ -f ".env.vercel.example" ]; then
            cp .env.vercel.example .env.local
            log_success "Created .env.local from template"
            log_warning "Please edit .env.local and add your actual API keys"
        else
            log_error ".env.vercel.example not found"
            exit 1
        fi
    else
        log_success ".env.local exists"
    fi
    
    # Check for critical environment variables
    if [ -f ".env.local" ]; then
        if grep -q "OPENAI_API_KEY=your-" .env.local; then
            log_warning "OPENAI_API_KEY appears to be a placeholder. Please update it."
        fi
    fi
}

# Create deployment info
create_deployment_info() {
    log_info "Creating deployment info..."
    
    TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")
    GIT_BRANCH=$(git branch --show-current 2>/dev/null || echo "main")
    GIT_COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
    
    cat > .vercel/deployment-info.json <<EOF
{
  "timestamp": "${TIMESTAMP}",
  "git_branch": "${GIT_BRANCH}",
  "git_commit": "${GIT_COMMIT}",
  "build_type": "vercel",
  "node_version": "$(node --version)",
  "npm_version": "$(npm --version)"
}
EOF
    
    log_success "Deployment info created"
}

# Package deployment artifacts
package_artifacts() {
    log_info "Packaging deployment artifacts..."
    
    # Create deployment package directory
    mkdir -p deployment-package
    
    # Copy essential files
    cp -r .vercel/output deployment-package/
    cp vercel.json deployment-package/
    cp package.json deployment-package/
    cp package-lock.json deployment-package/
    
    # Create deployment README
    cat > deployment-package/README.md <<EOF
# Vercel Deployment Package

This package contains all necessary files for deploying to Vercel.

## Deployment Steps

1. Log in to Vercel:
   \`\`\`bash
   vercel login
   \`\`\`

2. Deploy to preview:
   \`\`\`bash
   vercel deploy --prebuilt
   \`\`\`

3. Deploy to production:
   \`\`\`bash
   vercel deploy --prod --prebuilt
   \`\`\`

## Build Info

- Timestamp: ${TIMESTAMP}
- Git Branch: ${GIT_BRANCH}
- Git Commit: ${GIT_COMMIT}

## Environment Variables

Make sure to set the following in your Vercel project:
- OPENAI_API_KEY
- ALLOWED_ORIGINS
- VOICE_AGENT_RATE_LIMIT
- PUBLIC_SITE_URL
EOF
    
    log_success "Deployment package created in ./deployment-package/"
}

# Generate deployment command
generate_deployment_command() {
    log_info "Generating deployment commands..."
    
    cat > deploy-commands.txt <<EOF
# Vercel Deployment Commands
# Generated: $(date)

# 1. First, log in to Vercel (run this in your terminal):
vercel login

# 2. Link to a Vercel project (first time only):
vercel link

# 3. Deploy to preview environment:
vercel deploy --prebuilt

# 4. Deploy to production (after testing preview):
vercel deploy --prod --prebuilt

# Alternative: Deploy without prebuilt (builds on Vercel):
vercel deploy

# To set environment variables:
vercel env add OPENAI_API_KEY
vercel env add ALLOWED_ORIGINS
vercel env add VOICE_AGENT_RATE_LIMIT
vercel env add PUBLIC_SITE_URL
EOF
    
    log_success "Deployment commands saved to deploy-commands.txt"
}

# Main preparation process
main() {
    check_build
    validate_environment
    create_deployment_info
    package_artifacts
    generate_deployment_command
    
    echo "============================================================================"
    log_success "🎉 Vercel deployment preparation completed!"
    echo
    log_info "Next steps:"
    echo "  1. Review and update .env.local with your actual API keys"
    echo "  2. Log in to Vercel CLI: vercel login"
    echo "  3. Deploy to preview: vercel deploy --prebuilt"
    echo "  4. Set environment variables in Vercel dashboard"
    echo
    log_info "Deployment package location: ./deployment-package/"
    log_info "Deployment commands: ./deploy-commands.txt"
    echo "============================================================================"
}

# Handle script interruption
trap 'log_error "Preparation interrupted by user"; exit 1' INT TERM

# Run main preparation process
main "$@"