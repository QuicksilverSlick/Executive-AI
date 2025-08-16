#!/bin/bash

# ============================================================================
# Vercel Deployment Script for Executive AI Training Voice Agent
# ============================================================================
# This script handles the complete deployment pipeline to Vercel
# with voice application optimizations and monitoring setup.
#
# Usage:
#   ./scripts/deploy-vercel.sh [environment]
#   
# Environments:
#   - production (default)
#   - preview
#   - development
# ============================================================================

set -euo pipefail

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default environment
ENVIRONMENT=${1:-production}

# Deployment configuration
PROJECT_NAME="executive-ai-training"
BUILD_TIMEOUT=600  # 10 minutes
HEALTH_CHECK_TIMEOUT=300  # 5 minutes

echo -e "${BLUE}🚀 Starting Vercel deployment for Executive AI Training${NC}"
echo -e "${BLUE}Environment: ${YELLOW}$ENVIRONMENT${NC}"
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

# Function to check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check if Vercel CLI is installed
    if ! command -v vercel &> /dev/null; then
        log_error "Vercel CLI is not installed. Install it with: npm install -g vercel"
        exit 1
    fi
    
    # Check if user is logged in to Vercel
    if ! vercel whoami &> /dev/null; then
        log_error "Not logged in to Vercel. Please run: vercel login"
        exit 1
    fi
    
    # Check Node.js version
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        log_error "Node.js 18+ is required. Current version: $(node --version)"
        exit 1
    fi
    
    log_success "Prerequisites check passed"
}

# Function to prepare the build
prepare_build() {
    log_info "Preparing build environment..."
    
    # Clean previous builds
    rm -rf dist .astro node_modules/.cache
    log_success "Cleaned previous builds"
    
    # Install dependencies
    log_info "Installing dependencies..."
    npm ci --prefer-offline
    log_success "Dependencies installed"
    
    # Copy Vercel-specific configuration
    if [ ! -f "astro.config.mjs.backup" ]; then
        cp astro.config.mjs astro.config.mjs.backup
        log_info "Backed up original Astro config"
    fi
    
    cp astro.config.vercel.mjs astro.config.mjs
    log_success "Vercel configuration applied"
    
    # Validate environment variables
    log_info "Validating environment configuration..."
    if [ ! -f ".env.local" ] && [ "$ENVIRONMENT" != "production" ]; then
        log_warning "No .env.local file found. Make sure environment variables are set in Vercel dashboard."
    fi
}

# Function to run pre-deployment tests
run_tests() {
    log_info "Running pre-deployment tests..."
    
    # Type checking
    if command -v tsc &> /dev/null; then
        log_info "Running TypeScript checks..."
        npx tsc --noEmit
        log_success "TypeScript checks passed"
    fi
    
    # Run critical tests
    log_info "Running test suite..."
    npm run test:run
    log_success "Tests passed"
    
    # Voice agent specific tests
    if [ -f "src/tests/integration/voice-agent-comprehensive.test.js" ]; then
        log_info "Running voice agent tests..."
        npm run test:voice
        log_success "Voice agent tests passed"
    fi
}

# Function to build the application
build_application() {
    log_info "Building application with Vercel optimizations..."
    
    # Set build environment
    export NODE_ENV=production
    export VERCEL_ENV=$ENVIRONMENT
    
    # Run the build
    timeout $BUILD_TIMEOUT npm run build || {
        log_error "Build failed or timed out after $BUILD_TIMEOUT seconds"
        exit 1
    }
    
    log_success "Build completed successfully"
    
    # Verify critical files exist
    if [ ! -d "dist" ]; then
        log_error "Build output directory 'dist' not found"
        exit 1
    fi
    
    # Check for voice agent API routes
    if [ ! -d "dist/server/chunks/pages/api" ]; then
        log_warning "API routes may not have been built correctly"
    fi
    
    log_success "Build verification completed"
}

# Function to deploy to Vercel
deploy_to_vercel() {
    log_info "Deploying to Vercel ($ENVIRONMENT)..."
    
    local deploy_flags=""
    
    case $ENVIRONMENT in
        production)
            deploy_flags="--prod"
            ;;
        preview)
            deploy_flags="--target preview"
            ;;
        development)
            deploy_flags="--target development"
            ;;
        *)
            log_error "Unknown environment: $ENVIRONMENT"
            exit 1
            ;;
    esac
    
    # Deploy with appropriate flags
    DEPLOYMENT_URL=$(vercel deploy $deploy_flags --yes 2>&1 | tee /tmp/vercel-deploy.log | grep -E '^https://' | tail -1)
    
    if [ -z "$DEPLOYMENT_URL" ]; then
        log_error "Deployment failed. Check the output above."
        cat /tmp/vercel-deploy.log
        exit 1
    fi
    
    log_success "Deployment completed successfully"
    log_info "Deployment URL: ${YELLOW}$DEPLOYMENT_URL${NC}"
}

# Function to run health checks
run_health_checks() {
    log_info "Running post-deployment health checks..."
    
    if [ -z "$DEPLOYMENT_URL" ]; then
        log_warning "No deployment URL available for health checks"
        return 0
    fi
    
    # Wait for deployment to be ready
    log_info "Waiting for deployment to be ready..."
    sleep 30
    
    # Check if the main page loads
    log_info "Checking main page..."
    if curl -f -s "$DEPLOYMENT_URL" > /dev/null; then
        log_success "Main page is accessible"
    else
        log_error "Main page is not accessible"
        return 1
    fi
    
    # Check API health endpoint if it exists
    log_info "Checking API endpoints..."
    if curl -f -s "$DEPLOYMENT_URL/api/health" > /dev/null 2>&1; then
        log_success "API health endpoint is responding"
    else
        log_warning "API health endpoint not found or not responding"
    fi
    
    # Check voice agent API
    log_info "Checking voice agent API..."
    if curl -f -s -X OPTIONS "$DEPLOYMENT_URL/api/voice-agent/session" > /dev/null 2>&1; then
        log_success "Voice agent API is accessible"
    else
        log_warning "Voice agent API may not be accessible"
    fi
    
    log_success "Health checks completed"
}

# Function to setup monitoring
setup_monitoring() {
    log_info "Setting up monitoring and analytics..."
    
    # Vercel Analytics is automatically enabled via vercel.json
    log_success "Vercel Analytics enabled"
    
    # Speed Insights is configured in astro.config.vercel.mjs
    log_success "Vercel Speed Insights enabled"
    
    log_info "Monitoring setup completed"
    log_info "Visit your Vercel dashboard to view analytics and performance metrics"
}

# Function to restore original configuration
restore_config() {
    if [ -f "astro.config.mjs.backup" ]; then
        mv astro.config.mjs.backup astro.config.mjs
        log_info "Original Astro configuration restored"
    fi
}

# Function to cleanup
cleanup() {
    log_info "Cleaning up temporary files..."
    rm -f /tmp/vercel-deploy.log
    restore_config
    log_success "Cleanup completed"
}

# Main deployment process
main() {
    echo "Starting deployment process..."
    
    # Set up trap to ensure cleanup on exit
    trap cleanup EXIT
    
    check_prerequisites
    prepare_build
    run_tests
    build_application
    deploy_to_vercel
    run_health_checks
    setup_monitoring
    
    echo "============================================================================"
    log_success "🎉 Deployment completed successfully!"
    echo -e "${GREEN}Environment: ${YELLOW}$ENVIRONMENT${NC}"
    if [ -n "$DEPLOYMENT_URL" ]; then
        echo -e "${GREEN}URL: ${YELLOW}$DEPLOYMENT_URL${NC}"
    fi
    echo -e "${BLUE}View deployment details: https://vercel.com/dashboard${NC}"
    echo "============================================================================"
}

# Handle script interruption
trap 'log_error "Deployment interrupted by user"; cleanup; exit 1' INT TERM

# Run main deployment process
main "$@"