# Executive AI Training Platform

A comprehensive educational platform designed to teach AI/ML concepts through hands-on, practical examples with advanced voice agent capabilities and real-time web search integration.

## 🎯 Features

### Voice Agent Technology
- **OpenAI Realtime API**: Real-time voice conversations with WebRTC support
- **Intelligent Web Search**: Live web search capabilities during voice conversations
- **Multi-tier Support**: Automatic fallback from Realtime API to Chat API + TTS
- **Secure Token Management**: Short-lived ephemeral tokens for enhanced security

### Educational Content
- **Executive AI Training**: Curated training materials for business leaders
- **Interactive Learning**: Hands-on practical examples and case studies
- **Voice-first Learning**: Natural conversation-based learning experience

### Technical Excellence
- **Modern Web Stack**: Built with Astro, TypeScript, React, and Tailwind CSS
- **Performance Optimized**: Lighthouse scores 95+ across all metrics
- **Security First**: Rate limiting, CORS protection, and secure API key management
- **Production Ready**: Node.js server with comprehensive error handling

## 🔧 Quick Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure OpenAI API Key
```bash
# Copy the environment template
cp .env.example .env.local

# Edit .env.local and add your OpenAI API key
OPENAI_API_KEY=sk-your-openai-api-key-here
```

### 3. Verify Setup
```bash
# Run the complete setup verification
npm run setup-complete

# Test OpenAI API connectivity
npm run verify-openai

# Test the token endpoint
npm run test-token
```

### 4. Start Development Server
```bash
npm run dev
```

Visit `http://localhost:4321` to see your application.

## 🚀 Available Commands

| Command | Action |
|---------|--------|
| `npm install` | Install dependencies |
| `npm run dev` | Start development server at `localhost:4321` |
| `npm run build` | Build production site to `./dist/` |
| `npm run build:prod` | Build with production optimizations and analysis |
| `npm run preview` | Preview build locally |
| `npm run setup-complete` | Verify complete setup configuration |
| `npm run verify-openai` | Test OpenAI API key and connectivity |
| `npm run test-token` | Test voice agent token endpoint |
| `npm run setup-check` | Quick setup verification |
| `npm run test` | Run unit tests with Vitest |
| `npm run test:e2e` | Run end-to-end tests with Playwright |
| `npm run test:voice` | Run voice agent integration tests |
| `npm run lighthouse` | Run Lighthouse performance audit |

## 🔒 Security Features

- **Secure API Key Storage**: Environment variables only, never committed to git
- **Rate Limiting**: 10 requests per minute per IP address
- **CORS Protection**: Only allowed origins can access endpoints
- **Short-lived Tokens**: 60-second expiration for voice agent tokens
- **Request Logging**: All API requests logged for security monitoring
- **Error Handling**: Secure error messages without sensitive data exposure

## 📁 Project Structure

```
/
├── public/                 # Static assets
├── src/
│   ├── components/        # Reusable UI components
│   ├── features/          # Feature-specific modules
│   │   └── voice-agent/   # Voice agent implementation
│   ├── pages/            # Astro pages and API routes
│   │   └── api/voice-agent/  # Voice agent API endpoints
│   ├── styles/           # Global styles and CSS
│   └── utils/            # Utility functions
├── scripts/              # Setup and verification scripts
├── docs/                 # Documentation
└── .env.local           # Environment variables (create from .env.example)
```

## 🎤 Voice Agent Setup

The voice agent uses OpenAI's Realtime API for natural voice interactions. Key components:

- **Token Generation** (`/api/voice-agent/token`): Creates ephemeral tokens
- **Health Monitoring** (`/api/voice-agent/health`): System health checks
- **Token Refresh** (`/api/voice-agent/refresh-token`): Extends token lifetime
- **WebRTC Integration**: Real-time voice communication

### Security Architecture

1. **API Key Protection**: Stored in environment variables only
2. **Ephemeral Tokens**: Short-lived tokens (60s) for client-side use
3. **Rate Limiting**: Prevents abuse with configurable limits
4. **CORS Validation**: Only authorized origins can access endpoints
5. **Request Monitoring**: All requests logged with IP and user agent

## 🛠 Development

### Environment Variables

Create `.env.local` with these required variables:

```bash
# OpenAI Configuration
OPENAI_API_KEY=sk-your-openai-api-key-here

# Voice Agent Configuration
ALLOWED_ORIGINS=http://localhost:4321,https://executiveaitraining.com
VOICE_AGENT_RATE_LIMIT=10
VOICE_AGENT_TOKEN_DURATION=60

# Site Configuration
PUBLIC_SITE_URL=https://executiveaitraining.com
PUBLIC_SITE_NAME="Executive AI Training"
```

### Testing

```bash
# Verify OpenAI API key
npm run verify-openai

# Test token generation endpoint
npm run test-token

# Run complete setup verification
npm run setup-complete
```

### Building for Production

```bash
# Build with optimizations
npm run build:prod

# Preview production build
npm run preview
```

## 📚 Documentation

- **Architecture Overview**: [ARCHITECTURE.md](./ARCHITECTURE.md)
- **Deployment Guide**: [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Security Guidelines**: [SECURITY.md](./SECURITY.md)
- **API Documentation**: Embedded in source code with comprehensive TypeScript types

## 🚨 Troubleshooting

### Common Issues

1. **"Service temporarily unavailable"**
   - Ensure `.env.local` exists with valid `OPENAI_API_KEY`

2. **"Invalid origin" errors**
   - Check `ALLOWED_ORIGINS` includes your domain
   - Verify no typos in origin URLs

3. **Rate limit exceeded**
   - Increase `VOICE_AGENT_RATE_LIMIT` if needed
   - Check for excessive requests

4. **Token generation fails**
   - Verify OpenAI API key has Realtime API access
   - Check OpenAI account billing status

### Debug Commands

```bash
# Check environment variables
node -e "console.log(process.env.OPENAI_API_KEY ? 'API Key loaded' : 'API Key missing')"

# View server logs
npm run dev  # Check console output for errors
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run `npm run setup-complete` to verify
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Status**: ✅ **Production Ready** - Secure OpenAI integration configured and tested.