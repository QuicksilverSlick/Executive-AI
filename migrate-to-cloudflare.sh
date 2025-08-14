#!/bin/bash

#
# DREAMFORGE HIVE-MIND CHAIN OF CUSTODY
#
# @file-purpose: Automated migration script for Cloudflare Pages deployment
# @version: 1.0.0
# @init-author: developer-agent
# @init-cc-sessionId: cc-unknown-20250813-657
# @init-timestamp: 2025-08-14T00:00:00Z
# @reasoning:
# - **Objective:** Automate the complete migration from Node.js to Cloudflare Pages
# - **Strategy:** Step-by-step deployment with validation and rollback capability
# - **Outcome:** Production-ready voice agent application on Cloudflare Pages
#

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Executive AI Training - Cloudflare Pages Migration${NC}"
echo "================================================================"

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check environment variables
check_env_vars() {
    echo -e "${YELLOW}📋 Checking environment variables...${NC}"
    
    if [ -z "$OPENAI_API_KEY" ]; then
        echo -e "${RED}❌ OPENAI_API_KEY not set${NC}"
        echo "Please set your OpenAI API key:"
        echo "export OPENAI_API_KEY=your_api_key_here"
        exit 1
    fi
    
    if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
        echo -e "${YELLOW}⚠️  CLOUDFLARE_API_TOKEN not set (required for automated deployment)${NC}"
        echo "You can set it later or deploy manually via the Cloudflare dashboard"
    fi
    
    echo -e "${GREEN}✅ Environment variables checked${NC}"
}

# Function to check prerequisites
check_prerequisites() {
    echo -e "${YELLOW}🔍 Checking prerequisites...${NC}"
    
    if ! command_exists node; then
        echo -e "${RED}❌ Node.js is not installed${NC}"
        exit 1
    fi
    
    if ! command_exists npm; then
        echo -e "${RED}❌ npm is not installed${NC}"
        exit 1
    fi
    
    if ! command_exists wrangler; then
        echo -e "${YELLOW}⚠️  Wrangler CLI not found. Installing...${NC}"
        npm install -g wrangler
    fi
    
    echo -e "${GREEN}✅ Prerequisites checked${NC}"
}

# Function to backup current configuration
backup_config() {
    echo -e "${YELLOW}💾 Creating backup of current configuration...${NC}"
    
    mkdir -p .migration-backup
    
    if [ -f "astro.config.mjs" ]; then
        cp astro.config.mjs .migration-backup/astro.config.mjs.backup
    fi
    
    if [ -f "package.json" ]; then
        cp package.json .migration-backup/package.json.backup
    fi
    
    if [ -f ".env" ]; then
        cp .env .migration-backup/.env.backup
    fi
    
    echo -e "${GREEN}✅ Configuration backed up to .migration-backup/${NC}"
}

# Function to install Cloudflare adapter
install_cloudflare_adapter() {
    echo -e "${YELLOW}📦 Installing Cloudflare adapter...${NC}"
    
    npm install @astrojs/cloudflare --save-dev
    
    echo -e "${GREEN}✅ Cloudflare adapter installed${NC}"
}

# Function to update Astro configuration
update_astro_config() {
    echo -e "${YELLOW}⚙️  Updating Astro configuration for Cloudflare...${NC}"
    
    if [ -f "astro.config.cloudflare.mjs" ]; then
        cp astro.config.cloudflare.mjs astro.config.mjs
        echo -e "${GREEN}✅ Astro configuration updated for Cloudflare${NC}"
    else
        echo -e "${RED}❌ astro.config.cloudflare.mjs not found${NC}"
        echo "Please run this script from the project root directory"
        exit 1
    fi
}

# Function to create environment file
create_env_file() {
    echo -e "${YELLOW}🔧 Creating Cloudflare environment configuration...${NC}"
    
    if [ ! -f ".env.cloudflare.example" ]; then
        echo -e "${RED}❌ .env.cloudflare.example not found${NC}"
        exit 1
    fi
    
    cp .env.cloudflare.example .env.production
    
    echo -e "${BLUE}📝 Please update .env.production with your production values${NC}"
    echo "The following variables need to be set:"
    echo "- OPENAI_API_KEY (already set in environment)"
    echo "- ALLOWED_ORIGINS (update with your production domain)"
    echo "- PUBLIC_SITE_URL (update with your production domain)"
    echo ""
}

# Function to build for Cloudflare
build_for_cloudflare() {
    echo -e "${YELLOW}🏗️  Building for Cloudflare Pages...${NC}"
    
    # Clean previous builds
    npm run clean
    
    # Build with Cloudflare-specific configuration
    NODE_ENV=production npm run build
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Build completed successfully${NC}"
    else
        echo -e "${RED}❌ Build failed${NC}"
        exit 1
    fi
}

# Function to test build locally
test_build() {
    echo -e "${YELLOW}🧪 Testing build locally...${NC}"
    
    echo "Starting preview server..."
    echo "Visit http://localhost:4321 to test the build"
    echo "Press Ctrl+C to stop the server and continue with deployment"
    
    npm run preview
}

# Function to deploy to Cloudflare
deploy_to_cloudflare() {
    echo -e "${YELLOW}🚀 Deploying to Cloudflare Pages...${NC}"
    
    if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
        echo -e "${BLUE}📱 Manual deployment required:${NC}"
        echo "1. Go to https://dash.cloudflare.com/pages"
        echo "2. Create a new project"
        echo "3. Connect your GitHub repository"
        echo "4. Set build command: npm run build"
        echo "5. Set build output directory: dist"
        echo "6. Add environment variables from .env.production"
        echo ""
        echo "Or set CLOUDFLARE_API_TOKEN to deploy automatically"
    else
        echo "Deploying with Wrangler..."
        wrangler pages deploy dist --project-name executive-ai-training
    fi
}

# Function to set up environment variables in Cloudflare
setup_cloudflare_env() {
    echo -e "${YELLOW}🔐 Setting up environment variables in Cloudflare...${NC}"
    
    if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
        echo -e "${BLUE}📝 Manual environment variable setup required:${NC}"
        echo "In the Cloudflare dashboard, add these environment variables:"
        echo ""
        echo "Production Environment Variables:"
        echo "- OPENAI_API_KEY: $OPENAI_API_KEY"
        echo "- ALLOWED_ORIGINS: https://your-domain.pages.dev,https://your-custom-domain.com"
        echo "- VOICE_AGENT_RATE_LIMIT: 50"
        echo "- VOICE_AGENT_TOKEN_DURATION: 1800"
        echo "- PUBLIC_SITE_URL: https://your-domain.pages.dev"
        echo "- PUBLIC_SITE_NAME: Executive AI Training"
        echo "- NODE_ENV: production"
        echo ""
    else
        echo "Setting environment variables via Wrangler..."
        echo "Note: Environment variables must be set manually in Cloudflare dashboard"
        echo "Wrangler pages secret command is limited to secrets, not environment variables"
    fi
}

# Function to validate deployment
validate_deployment() {
    echo -e "${YELLOW}🔍 Deployment validation checklist:${NC}"
    echo ""
    echo "✅ Build completed without errors"
    echo "⏳ Manual checks required:"
    echo "   1. Visit your Cloudflare Pages URL"
    echo "   2. Test voice agent functionality"
    echo "   3. Verify API endpoints work"
    echo "   4. Check browser console for errors"
    echo "   5. Test WebRTC voice features"
    echo "   6. Verify search functionality"
    echo ""
    echo "📊 Monitor these metrics:"
    echo "   - Response times < 200ms"
    echo "   - No 5xx errors"
    echo "   - Voice agent connections succeed"
    echo ""
}

# Function to cleanup
cleanup() {
    echo -e "${YELLOW}🧹 Cleaning up temporary files...${NC}"
    
    # Remove any temporary files created during migration
    if [ -d "node_modules/.cache" ]; then
        rm -rf node_modules/.cache
    fi
    
    echo -e "${GREEN}✅ Cleanup completed${NC}"
}

# Function to rollback if needed
rollback() {
    echo -e "${YELLOW}🔄 Rolling back to previous configuration...${NC}"
    
    if [ -d ".migration-backup" ]; then
        if [ -f ".migration-backup/astro.config.mjs.backup" ]; then
            cp .migration-backup/astro.config.mjs.backup astro.config.mjs
        fi
        
        if [ -f ".migration-backup/package.json.backup" ]; then
            cp .migration-backup/package.json.backup package.json
        fi
        
        echo -e "${GREEN}✅ Rollback completed${NC}"
        echo "Run 'npm install' to restore previous dependencies"
    else
        echo -e "${RED}❌ No backup found for rollback${NC}"
    fi
}

# Main migration flow
main() {
    echo "Starting migration process..."
    echo ""
    
    # Check if DEPLOYMENT_CHECKLIST.md exists
    if [ ! -f "DEPLOYMENT_CHECKLIST.md" ]; then
        echo -e "${RED}❌ DEPLOYMENT_CHECKLIST.md not found${NC}"
        echo "Please ensure all deployment files are created first"
        exit 1
    fi
    
    # Trap for cleanup on exit
    trap cleanup EXIT
    
    # Migration steps
    check_prerequisites
    check_env_vars
    backup_config
    install_cloudflare_adapter
    update_astro_config
    create_env_file
    
    echo -e "${BLUE}🛑 PAUSE: Please review and update .env.production with your production values${NC}"
    echo "Press Enter to continue with the build process..."
    read -r
    
    build_for_cloudflare
    
    echo -e "${BLUE}🛑 PAUSE: Would you like to test the build locally? (y/n)${NC}"
    read -r test_choice
    if [ "$test_choice" = "y" ] || [ "$test_choice" = "Y" ]; then
        test_build
    fi
    
    echo -e "${BLUE}🛑 PAUSE: Ready to deploy to Cloudflare? (y/n)${NC}"
    read -r deploy_choice
    if [ "$deploy_choice" = "y" ] || [ "$deploy_choice" = "Y" ]; then
        deploy_to_cloudflare
        setup_cloudflare_env
        validate_deployment
    else
        echo -e "${YELLOW}⏸️  Deployment skipped. Build is ready in ./dist${NC}"
    fi
    
    echo ""
    echo -e "${GREEN}🎉 Migration process completed!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Review DEPLOYMENT_CHECKLIST.md for detailed steps"
    echo "2. Set up custom domain in Cloudflare (if needed)"
    echo "3. Configure DNS records"
    echo "4. Set up monitoring and analytics"
    echo "5. Test all functionality thoroughly"
    echo ""
    echo "If you encounter issues, run './migrate-to-cloudflare.sh rollback' to revert changes"
}

# Handle script arguments
case "${1:-}" in
    "rollback")
        rollback
        exit 0
        ;;
    "help"|"-h"|"--help")
        echo "Executive AI Training - Cloudflare Migration Script"
        echo ""
        echo "Usage:"
        echo "  ./migrate-to-cloudflare.sh         # Run full migration"
        echo "  ./migrate-to-cloudflare.sh rollback # Rollback changes"
        echo "  ./migrate-to-cloudflare.sh help     # Show this help"
        echo ""
        echo "Prerequisites:"
        echo "  - Node.js and npm installed"
        echo "  - OPENAI_API_KEY environment variable set"
        echo "  - Optional: CLOUDFLARE_API_TOKEN for automated deployment"
        echo ""
        exit 0
        ;;
    "")
        main
        ;;
    *)
        echo "Unknown option: $1"
        echo "Use './migrate-to-cloudflare.sh help' for usage information"
        exit 1
        ;;
esac

#
# DREAMFORGE AUDIT TRAIL
#
# ---
# @revision: 1.0.0
# @author: developer-agent
# @cc-sessionId: cc-unknown-20250813-657
# @timestamp: 2025-08-14T00:00:00Z
# @reasoning:
# - **Objective:** Create comprehensive migration script with error handling and rollback
# - **Strategy:** Modular functions with validation and user prompts for safety
# - **Outcome:** Production-ready automated migration script with manual fallbacks
#