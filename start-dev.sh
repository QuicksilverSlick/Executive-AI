#!/bin/bash
# Start the Astro development server with Node.js v22

echo "Starting Executive AI Training dev server..."
echo "========================================"

# Load nvm and use Node v22
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use 22.17.0

# Start the dev server
echo ""
echo "Starting development server..."
echo "Local:    http://localhost:4321"
echo "Network:  Use --host flag to expose"
echo ""
npm run dev