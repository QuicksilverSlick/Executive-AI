#!/bin/bash

# ============================================================================
# Vercel Setup Script for Executive AI Training Voice Agent
# ============================================================================
# This script automates the initial setup process for Vercel deployment
#
# Usage:
#   ./scripts/setup-vercel.sh
# ============================================================================

set -euo pipefail

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Setting up Vercel deployment for Executive AI Training${NC}"
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

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check Node.js version
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        log_error "Node.js 18+ is required. Current version: $(node --version)"
        exit 1
    fi
    
    log_success "Node.js version check passed"
}

# Install dependencies
install_dependencies() {
    log_info "Installing/updating dependencies..."
    
    # Install Vercel CLI globally if not present
    if ! command -v vercel &> /dev/null; then
        log_info "Installing Vercel CLI..."
        npm install -g vercel
        log_success "Vercel CLI installed"
    else
        log_success "Vercel CLI already installed"
    fi
    
    # Install project dependencies
    log_info "Installing project dependencies..."
    npm install
    log_success "Project dependencies installed"
}

# Validate configuration
validate_config() {
    log_info "Validating Vercel configuration..."
    
    if npm run vercel:validate; then
        log_success "Vercel configuration validation passed"
    else
        log_error "Vercel configuration validation failed"
        log_warning "Please check the validation output above and fix any issues"
        exit 1
    fi
}

# Setup environment variables
setup_env_vars() {
    log_info "Setting up environment variables..."
    
    if [ ! -f ".env.local" ]; then
        log_warning "No .env.local file found"
        
        read -p "Would you like to create .env.local from .env.vercel.example? (y/n): " -n 1 -r
        echo
        
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            if [ -f ".env.vercel.example" ]; then
                cp .env.vercel.example .env.local
                log_success "Created .env.local from template"
                log_warning "Please edit .env.local and add your actual API keys and configuration"
                
                if command -v code &> /dev/null; then
                    read -p "Open .env.local in VS Code? (y/n): " -n 1 -r
                    echo
                    if [[ $REPLY =~ ^[Yy]$ ]]; then
                        code .env.local
                    fi
                fi
            else
                log_error ".env.vercel.example not found"
                exit 1
            fi
        fi
    else
        log_success ".env.local already exists"
    fi
}

# Login to Vercel
vercel_login() {
    log_info "Checking Vercel authentication..."
    
    if vercel whoami &> /dev/null; then
        VERCEL_USER=$(vercel whoami)
        log_success "Already logged in to Vercel as: $VERCEL_USER"
    else
        log_info "Logging in to Vercel..."
        log_warning "This will open a browser window for authentication"
        
        read -p "Proceed with Vercel login? (y/n): " -n 1 -r
        echo
        
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            vercel login
            log_success "Successfully logged in to Vercel"
        else
            log_warning "Skipping Vercel login - you can run 'vercel login' later"
        fi
    fi
}

# Create Vercel project
setup_vercel_project() {
    log_info "Setting up Vercel project..."
    
    # Check if already linked to a project
    if [ -f ".vercel/project.json" ]; then
        log_success "Already linked to a Vercel project"
        return
    fi
    
    log_info "Linking to Vercel project..."
    log_warning "This will prompt you to create or link to a Vercel project"
    
    read -p "Proceed with project setup? (y/n): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        vercel link
        log_success "Successfully linked to Vercel project"
    else
        log_warning "Skipping project setup - you can run 'vercel link' later"
    fi
}

# Test local build
test_build() {
    log_info "Testing Vercel build configuration..."
    
    log_info "Running build test..."
    if npm run build:vercel; then
        log_success "Build test passed"
    else
        log_error "Build test failed"
        log_warning "Please check your configuration and try again"
        exit 1
    fi
}

# Main setup process
main() {
    check_prerequisites
    install_dependencies
    validate_config
    setup_env_vars
    vercel_login
    setup_vercel_project
    test_build
    
    echo "============================================================================"
    log_success "🎉 Vercel setup completed successfully!"
    echo
    log_info "Next steps:"
    echo "  1. Edit .env.local with your actual API keys"
    echo "  2. Set environment variables in your Vercel project dashboard"
    echo "  3. Run 'npm run deploy:vercel:preview' to deploy to preview"
    echo "  4. Test the preview deployment thoroughly"
    echo "  5. Run 'npm run deploy:vercel:production' for production deployment"
    echo
    log_info "Useful commands:"
    echo "  - npm run vercel:validate    # Validate configuration"
    echo "  - npm run deploy:vercel:preview    # Deploy to preview"
    echo "  - npm run deploy:vercel:production # Deploy to production"
    echo "  - vercel --help             # Vercel CLI help"
    echo "============================================================================"
}

# Handle script interruption
trap 'log_error "Setup interrupted by user"; exit 1' INT TERM

# Run main setup process
main "$@"