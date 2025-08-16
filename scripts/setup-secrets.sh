#!/bin/bash

# Setup secrets for Cloudflare Workers deployment
# This script helps configure all required secrets

echo "🔐 Setting up Cloudflare Workers secrets..."
echo ""

# Function to set secret for all environments
set_secret_all() {
    local SECRET_NAME=$1
    local SECRET_DESC=$2
    
    echo "📝 Setting ${SECRET_NAME}: ${SECRET_DESC}"
    echo ""
    
    # Production
    echo "  → Production environment:"
    npx wrangler secret put ${SECRET_NAME} --env=""
    
    # Development
    echo "  → Development environment:"
    npx wrangler secret put ${SECRET_NAME} --env=development
    
    # Staging
    echo "  → Staging environment:"
    npx wrangler secret put ${SECRET_NAME} --env=staging
    
    echo "✅ ${SECRET_NAME} configured for all environments"
    echo ""
}

# Main setup
echo "This script will help you configure secrets for all environments."
echo "You'll be prompted to enter each secret value."
echo ""

read -p "Do you want to set up all secrets now? (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "Setting up OPENAI_API_KEY..."
    echo "This is required for the voice agent functionality."
    set_secret_all "OPENAI_API_KEY" "OpenAI API key for voice agent"
    
    echo "Setting up JWT_SECRET..."
    echo "This is used for session token signing (should be 32+ characters)."
    echo "You can generate one with: openssl rand -base64 32"
    set_secret_all "JWT_SECRET" "Secret for JWT token signing"
    
    echo "Setting up ADMIN_PASSWORD..."
    echo "This is used for admin endpoint access."
    set_secret_all "ADMIN_PASSWORD" "Admin access password"
    
    echo ""
    echo "🎉 All secrets configured successfully!"
    echo ""
    echo "You can now deploy with: npm run workers:deploy"
else
    echo ""
    echo "You can set secrets individually with:"
    echo "  npx wrangler secret put OPENAI_API_KEY --env=\"\""
    echo "  npx wrangler secret put JWT_SECRET --env=\"\""
    echo "  npx wrangler secret put ADMIN_PASSWORD --env=\"\""
fi