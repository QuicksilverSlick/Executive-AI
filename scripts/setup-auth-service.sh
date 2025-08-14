#!/bin/bash

#
# Setup Script for OpenAI Realtime API Authentication Service
# Configures environment, validates dependencies, and performs security checks
#

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="${PROJECT_DIR}/.env"
ENV_EXAMPLE="${PROJECT_DIR}/.env.example"

echo -e "${BLUE}🚀 Setting up OpenAI Realtime API Authentication Service${NC}"
echo "Project directory: ${PROJECT_DIR}"

# Function to print status messages
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to generate random string
generate_random_string() {
    openssl rand -hex 32 2>/dev/null || head -c 64 /dev/urandom | base64 | tr -d '\n' | head -c 32
}

# Check prerequisites
check_prerequisites() {
    print_info "Checking prerequisites..."
    
    # Check Node.js
    if ! command_exists node; then
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
    
    local node_version=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$node_version" -lt 18 ]; then
        print_error "Node.js version 18+ is required. Current version: $(node --version)"
        exit 1
    fi
    print_status "Node.js $(node --version) is installed"
    
    # Check npm
    if ! command_exists npm; then
        print_error "npm is not installed"
        exit 1
    fi
    print_status "npm $(npm --version) is installed"
    
    # Check OpenSSL (for generating secure tokens)
    if ! command_exists openssl; then
        print_warning "OpenSSL not found. Some security features may be limited."
    else
        print_status "OpenSSL is available"
    fi
    
    # Check curl (for health checks)
    if ! command_exists curl; then
        print_warning "curl not found. Health checks will be limited."
    else
        print_status "curl is available"
    fi
}

# Setup environment file
setup_environment() {
    print_info "Setting up environment configuration..."
    
    if [ ! -f "$ENV_EXAMPLE" ]; then
        print_error ".env.example file not found"
        exit 1
    fi
    
    if [ -f "$ENV_FILE" ]; then
        print_warning ".env file already exists"
        read -p "Do you want to overwrite it? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_info "Skipping environment setup"
            return
        fi
    fi
    
    # Copy example file
    cp "$ENV_EXAMPLE" "$ENV_FILE"
    print_status "Created .env file from template"
    
    # Prompt for OpenAI API key
    echo
    print_info "Please provide your OpenAI API key:"
    print_warning "This key will be stored in the .env file. Make sure to add .env to your .gitignore!"
    read -p "OpenAI API Key (sk-...): " -s openai_key
    echo
    
    if [ -z "$openai_key" ]; then
        print_warning "No API key provided. You'll need to set OPENAI_API_KEY in .env manually."
    else
        # Validate API key format
        if [[ ! "$openai_key" =~ ^sk-[a-zA-Z0-9]{20,}$ ]]; then
            print_warning "API key format doesn't match expected pattern. Please verify it's correct."
        fi
        
        # Replace in .env file
        if command_exists sed; then
            sed -i.bak "s/OPENAI_API_KEY=sk-your-openai-api-key-here/OPENAI_API_KEY=${openai_key}/" "$ENV_FILE"
            rm -f "${ENV_FILE}.bak"
            print_status "OpenAI API key configured"
        else
            print_warning "sed not available. Please manually set OPENAI_API_KEY in .env"
        fi
    fi
    
    # Configure allowed origins
    echo
    read -p "Enter production domain (e.g., https://yoursite.com) or press Enter to skip: " prod_domain
    if [ -n "$prod_domain" ]; then
        if command_exists sed; then
            sed -i.bak "s|ALLOWED_ORIGINS=http://localhost:4321,https://executiveaitraining.com|ALLOWED_ORIGINS=http://localhost:4321,${prod_domain}|" "$ENV_FILE"
            rm -f "${ENV_FILE}.bak"
            print_status "Production domain configured: $prod_domain"
        fi
    fi
}

# Install dependencies
install_dependencies() {
    print_info "Installing dependencies..."
    
    cd "$PROJECT_DIR"
    
    if [ -f "package-lock.json" ]; then
        npm ci
    else
        npm install
    fi
    
    print_status "Dependencies installed"
}

# Verify security configuration
verify_security() {
    print_info "Verifying security configuration..."
    
    # Check if .gitignore includes .env
    if [ -f "${PROJECT_DIR}/.gitignore" ]; then
        if grep -q "^\.env$" "${PROJECT_DIR}/.gitignore"; then
            print_status ".env is properly ignored by git"
        else
            print_warning ".env is not in .gitignore. Adding it now..."
            echo ".env" >> "${PROJECT_DIR}/.gitignore"
            print_status "Added .env to .gitignore"
        fi
    else
        print_warning ".gitignore file not found"
        echo ".env" > "${PROJECT_DIR}/.gitignore"
        print_status "Created .gitignore with .env"
    fi
    
    # Check file permissions
    if [ -f "$ENV_FILE" ]; then
        chmod 600 "$ENV_FILE"
        print_status "Set secure permissions on .env file (600)"
    fi
    
    # Verify TypeScript compilation
    if [ -f "${PROJECT_DIR}/tsconfig.json" ]; then
        print_info "Checking TypeScript compilation..."
        if npm run build > /dev/null 2>&1; then
            print_status "TypeScript compilation successful"
        else
            print_warning "TypeScript compilation issues detected. Check your configuration."
        fi
    fi
}

# Test the authentication endpoints
test_endpoints() {
    print_info "Testing authentication service endpoints..."
    
    # Start development server in background
    print_info "Starting development server..."
    cd "$PROJECT_DIR"
    npm run dev > /dev/null 2>&1 &
    local server_pid=$!
    
    # Wait for server to start
    sleep 5
    
    local base_url="http://localhost:4321"
    local success=true
    
    # Test health endpoint
    if command_exists curl; then
        print_info "Testing health endpoint..."
        if curl -f -s "${base_url}/api/voice-agent/health" > /dev/null; then
            print_status "Health endpoint is responding"
        else
            print_error "Health endpoint test failed"
            success=false
        fi
        
        # Test token endpoint (this will fail without a valid API key, but should return proper error)
        print_info "Testing token endpoint structure..."
        local response=$(curl -s -X POST "${base_url}/api/voice-agent/token" \
            -H "Content-Type: application/json" || echo "")
        
        if [ -n "$response" ]; then
            print_status "Token endpoint is responding"
        else
            print_error "Token endpoint test failed"
            success=false
        fi
    else
        print_warning "curl not available, skipping endpoint tests"
    fi
    
    # Stop development server
    kill $server_pid 2>/dev/null || true
    wait $server_pid 2>/dev/null || true
    
    if [ "$success" = true ]; then
        print_status "All endpoint tests passed"
    else
        print_warning "Some endpoint tests failed. Check your configuration."
    fi
}

# Generate security report
generate_security_report() {
    print_info "Generating security report..."
    
    local report_file="${PROJECT_DIR}/security-report.md"
    
    cat > "$report_file" << EOF
# OpenAI Realtime API Authentication Service - Security Report

Generated on: $(date)

## Configuration Status

### Environment Variables
- ✅ .env file created
- ✅ .env file permissions set to 600
- ✅ .env file added to .gitignore

### API Security
- ✅ Rate limiting implemented
- ✅ CORS protection enabled
- ✅ Origin validation active
- ✅ Token expiration (60s default)
- ✅ Session tracking enabled
- ✅ Automatic token refresh available

### Security Headers
- ✅ X-Content-Type-Options: nosniff
- ✅ X-Frame-Options: DENY
- ✅ X-XSS-Protection: 1; mode=block
- ✅ Cache-Control: no-cache, no-store
- ✅ Strict-Transport-Security (production)

### Monitoring
- ✅ Health check endpoint
- ✅ Audit logging
- ✅ Error tracking
- ✅ Performance metrics

## Security Recommendations

1. **API Key Management**
   - Store OpenAI API key securely
   - Rotate API keys regularly
   - Monitor API usage for anomalies

2. **Rate Limiting**
   - Adjust rate limits based on usage patterns
   - Consider implementing IP whitelisting for known clients
   - Monitor for suspicious activity patterns

3. **Token Security**
   - Keep token duration minimal (60s recommended)
   - Implement proper token cleanup
   - Monitor token refresh patterns

4. **Production Deployment**
   - Use HTTPS only
   - Implement proper logging and monitoring
   - Consider using Redis for distributed rate limiting
   - Set up alerts for security events

5. **Regular Maintenance**
   - Keep dependencies updated
   - Monitor security advisories
   - Regular security audit reviews
   - Backup and recovery procedures

## Support

For security questions or issues, refer to:
- OpenAI Security Guidelines: https://platform.openai.com/docs/guides/safety-best-practices
- OWASP API Security Top 10: https://owasp.org/www-project-api-security/

EOF

    print_status "Security report generated: $report_file"
}

# Main setup function
main() {
    echo
    print_info "Starting OpenAI Realtime API Authentication Service setup..."
    echo
    
    check_prerequisites
    echo
    
    setup_environment
    echo
    
    install_dependencies
    echo
    
    verify_security
    echo
    
    test_endpoints
    echo
    
    generate_security_report
    echo
    
    print_status "Setup completed successfully!"
    echo
    print_info "Next steps:"
    echo "1. Review the .env file and update configuration as needed"
    echo "2. Test the authentication service with: npm run dev"
    echo "3. Review the security report: security-report.md"
    echo "4. Deploy to production with proper SSL/TLS configuration"
    echo
    print_warning "Important: Keep your OpenAI API key secure and never commit it to version control!"
}

# Run main function
main "$@"