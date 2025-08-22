# System Architecture

## Overview

The Executive AI Training Platform is a modern web application built with Astro, featuring advanced voice agent capabilities powered by OpenAI's Realtime API and intelligent web search integration.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend Layer                          │
├─────────────────────────────────────────────────────────────────┤
│  Astro SSR    │  React Components  │  TypeScript  │  Tailwind   │
│  WebRTC       │  Voice Agent UI    │  Responsive  │  Icons      │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API Layer (Astro)                         │
├─────────────────────────────────────────────────────────────────┤
│  /api/voice-agent/token       │  Ephemeral token generation     │
│  /api/voice-agent/health      │  System health monitoring       │
│  /api/voice-agent/refresh     │  Token refresh mechanism        │
│  /api/voice-agent/*-search    │  Web search integration         │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    External Services                            │
├─────────────────────────────────────────────────────────────────┤
│  OpenAI Realtime API          │  Voice conversations           │
│  OpenAI Chat/TTS API          │  Fallback mode                 │
│  Web Search APIs              │  Real-time information         │
└─────────────────────────────────────────────────────────────────┘
```

## Component Architecture

### Frontend Components

```
src/
├── components/                 # Reusable UI components
│   ├── layout/                # Layout components
│   ├── ui/                    # Base UI components  
│   └── forms/                 # Form components
├── features/                  # Feature-specific modules
│   └── voice-agent/           # Voice agent feature
│       ├── components/        # Voice UI components
│       ├── types.ts          # TypeScript definitions
│       └── utils/            # Voice utility functions
├── lib/                      # Core library code
│   └── voice-agent/          # Voice agent implementation
│       ├── webrtc/           # WebRTC integration
│       ├── api/              # API client code
│       └── types/            # Type definitions
└── pages/                    # Astro pages and API routes
    ├── api/voice-agent/      # Voice agent API endpoints
    └── *.astro               # Application pages
```

### Voice Agent Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Voice Agent Flow                            │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│  1. Token Request                                               │
│     │                                                           │
│     ├─ API Tier Detection (Realtime vs Standard)               │
│     ├─ Ephemeral Token Generation                               │
│     ├─ Rate Limiting & CORS Validation                          │
│     └─ Session Registration                                     │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│  2. WebRTC Connection                                           │
│     │                                                           │
│     ├─ Browser WebRTC Setup                                     │
│     ├─ OpenAI Realtime Connection                               │
│     ├─ Audio Stream Configuration                               │
│     └─ Event Handling Setup                                     │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│  3. Conversation Flow                                           │
│     │                                                           │
│     ├─ Speech Input Processing                                  │
│     ├─ AI Response Generation                                   │
│     ├─ Web Search Integration                                   │
│     └─ Audio Output Synthesis                                   │
└─────────────────────────────────────────────────────────────────┘
```

## API Endpoints

### Voice Agent Endpoints

#### `/api/voice-agent/token` (POST)
**Purpose**: Generate ephemeral tokens for OpenAI Realtime API

**Features**:
- Automatic API tier detection (Realtime vs Standard)
- Fallback mode for unsupported tiers
- Rate limiting (configurable per IP)
- CORS validation
- Session tracking

**Request**:
```typescript
// No body required for token generation
POST /api/voice-agent/token
```

**Response**:
```typescript
interface TokenResponse {
  success: boolean;
  token: string;
  expiresAt: number;
  sessionId: string;
  mode: 'realtime' | 'fallback' | 'demo';
  warnings?: string[];
}
```

#### `/api/voice-agent/health` (GET)
**Purpose**: System health monitoring

**Response**:
```typescript
interface HealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  apiKey: boolean;
  realtimeAPI: boolean;
  timestamp: number;
}
```

#### `/api/voice-agent/refresh-token` (POST)
**Purpose**: Extend token lifetime for active sessions

**Request**:
```typescript
interface RefreshRequest {
  sessionId: string;
}
```

### Search Integration

#### Environment-Aware Search Routing
```typescript
// Development: Standalone server (if available)
const DEV_SEARCH_URL = 'http://localhost:3001/search';

// Production: Configured endpoint or built-in route  
const PROD_SEARCH_URL = process.env.PUBLIC_SEARCH_API_URL || 
                        '/api/voice-agent/responses-search';
```

## Data Flow Diagrams

### Voice Conversation Flow

```
User Speech Input
        │
        ▼
┌─────────────────┐
│ Browser WebRTC  │ ──── Audio Stream ────┐
└─────────────────┘                        │
        │                                  ▼
        ▼                         ┌──────────────────┐
┌─────────────────┐              │ OpenAI Realtime  │
│ Token Manager   │ ────Token───▶│     API          │
└─────────────────┘              └──────────────────┘
        │                                  │
        ▼                                  ▼
┌─────────────────┐              ┌──────────────────┐
│ Session Store   │              │ AI Processing    │
└─────────────────┘              └──────────────────┘
                                          │
                                          ▼
                                ┌──────────────────┐
                                │ Function Calls   │
                                │ (Web Search)     │
                                └──────────────────┘
                                          │
                                          ▼
                                ┌──────────────────┐
                                │ Search Service   │
                                └──────────────────┘
                                          │
                                          ▼
                                ┌──────────────────┐
                                │ Audio Response   │
                                └──────────────────┘
                                          │
                                          ▼
                                    User Audio Output
```

### Token Generation Flow

```
Client Request
        │
        ▼
┌─────────────────┐
│ CORS Validation │ ──✗── 403 Forbidden
└─────────────────┘
        │ ✓
        ▼
┌─────────────────┐
│ Rate Limiting   │ ──✗── 429 Too Many Requests  
└─────────────────┘
        │ ✓
        ▼
┌─────────────────┐
│ API Key Check   │ ──✗── 503 Service Unavailable
└─────────────────┘
        │ ✓
        ▼
┌─────────────────┐
│ Tier Detection  │
└─────────────────┘
        │
        ├──── Realtime ────┐
        │                  ▼
        │         ┌─────────────────┐
        │         │ Ephemeral Token │
        │         └─────────────────┘
        │                  │
        ├──── Standard ────┼────┐
        │                  │    ▼
        │                  │ ┌─────────────────┐
        │                  │ │ Fallback Token  │
        │                  │ └─────────────────┘
        │                  │    │
        └──── Unknown ─────┘    │
                               ▼
                    ┌─────────────────┐
                    │ Token Response  │
                    └─────────────────┘
```

## WebRTC Implementation

### Connection Management

```typescript
interface WebRTCConnection {
  // Connection state
  state: 'disconnected' | 'connecting' | 'connected' | 'error';
  
  // Audio streams
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  
  // WebRTC components
  peerConnection: RTCPeerConnection;
  dataChannel: RTCDataChannel;
  
  // OpenAI integration
  realtimeConnection: WebSocket;
  sessionId: string;
}
```

### Audio Processing Pipeline

```
Microphone Input
        │
        ▼
┌─────────────────┐
│ Audio Capture   │ (getUserMedia)
└─────────────────┘
        │
        ▼
┌─────────────────┐
│ Audio Processing│ (PCM16 format)
└─────────────────┘
        │
        ▼
┌─────────────────┐
│ WebSocket Send  │ (to OpenAI)
└─────────────────┘
        │
        ▼
┌─────────────────┐
│ AI Processing   │ (OpenAI Realtime)
└─────────────────┘
        │
        ▼
┌─────────────────┐
│ Response Audio  │ (PCM16 format)
└─────────────────┘
        │
        ▼
┌─────────────────┐
│ Audio Playback  │ (Web Audio API)
└─────────────────┘
        │
        ▼
    Speaker Output
```

## Security Architecture

### Multi-Layer Security

```
┌─────────────────────────────────────────────────────────────────┐
│                      Security Layers                           │
├─────────────────────────────────────────────────────────────────┤
│ 1. Transport Security     │ HTTPS/WSS Required                  │
│ 2. Origin Validation      │ CORS with whitelist                 │
│ 3. Rate Limiting          │ Per-IP request limits               │
│ 4. Token Security         │ Short-lived ephemeral tokens        │
│ 5. API Key Protection     │ Server-side only, env variables     │
│ 6. Input Validation       │ Request sanitization                │
└─────────────────────────────────────────────────────────────────┘
```

### Token Security Model

```
┌─────────────────┐    Generate     ┌─────────────────┐
│ Server          │ ─────────────▶  │ Ephemeral Token │
│ (API Key)       │                 │ (60s lifespan)  │
└─────────────────┘                 └─────────────────┘
                                            │
                                            ▼
                                    ┌─────────────────┐
                                    │ Client Browser  │
                                    │ (Token only)    │
                                    └─────────────────┘
                                            │
                                            ▼
                                    ┌─────────────────┐
                                    │ OpenAI API      │
                                    │ (WebRTC conn)   │
                                    └─────────────────┘
```

## Performance Optimizations

### Build Optimizations

```typescript
// astro.config.mjs optimizations
export default defineConfig({
  build: {
    inlineStylesheets: 'auto',
    assets: '_assets',
  },
  vite: {
    build: {
      cssMinify: 'lightningcss',
      rollupOptions: {
        output: {
          assetFileNames: '_assets/[hash][extname]',
        },
      },
    },
  },
  integrations: [
    compress({
      CSS: true,
      HTML: true,
      JavaScript: true,
      SVG: true,
    }),
  ],
});
```

### Caching Strategy

```
┌─────────────────┐
│ Static Assets   │ ──── CDN Cache (1 year)
└─────────────────┘
┌─────────────────┐
│ API Responses   │ ──── No Cache (dynamic)
└─────────────────┘
┌─────────────────┐
│ Tier Detection  │ ──── Memory Cache (5 min)
└─────────────────┘
┌─────────────────┐
│ Session Data    │ ──── Memory (token lifetime)
└─────────────────┘
```

## Error Handling Strategy

### Graceful Degradation

```
Realtime API Available
        │
        ▼ ✓
┌─────────────────┐
│ Full Voice Mode │ (WebRTC + Realtime)
└─────────────────┘

Realtime API Unavailable
        │
        ▼ ✗
┌─────────────────┐
│ Fallback Mode   │ (Chat API + TTS)
└─────────────────┘

No API Access
        │
        ▼ ✗
┌─────────────────┐
│ Demo Mode       │ (UI testing only)
└─────────────────┘
```

### Error Recovery

```typescript
interface ErrorHandling {
  // Connection errors
  webrtcError: () => attemptReconnection();
  tokenExpired: () => refreshToken();
  rateLimited: () => showRetryTimer();
  
  // API errors  
  realtimeUnavailable: () => switchToFallback();
  searchFailed: () => provideCachedResponse();
  
  // Network errors
  offline: () => enableOfflineMode();
  timeout: () => retryWithBackoff();
}
```

## Monitoring and Observability

### Key Metrics

```typescript
interface Metrics {
  // Performance
  tokenGenerationTime: number;
  webrtcConnectionTime: number;
  searchResponseTime: number;
  
  // Usage
  activeConnections: number;
  tokensGenerated: number;
  searchRequests: number;
  
  // Errors
  failedConnections: number;
  rateLimitHits: number;
  apiErrors: number;
  
  // Business
  sessionDuration: number;
  userEngagement: number;
  conversationLength: number;
}
```

### Logging Strategy

```typescript
interface LogEvents {
  // Security
  corsViolation: { origin: string; ip: string };
  rateLimitExceeded: { ip: string; attempts: number };
  
  // Performance
  slowResponse: { endpoint: string; duration: number };
  tokenGenerated: { mode: string; duration: number };
  
  // Errors
  apiError: { service: string; error: string; statusCode: number };
  connectionFailed: { reason: string; clientInfo: object };
}
```

## Scalability Considerations

### Horizontal Scaling

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Load Balancer │───▶│  App Instance 1 │    │  App Instance N │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                       │
                                ▼                       ▼
                        ┌─────────────────────────────────────────┐
                        │         Shared Resources                │
                        ├─────────────────────────────────────────┤
                        │ • Rate Limiting Store (Redis)           │
                        │ • Session Store (Redis)                 │
                        │ • Monitoring (Prometheus)               │
                        └─────────────────────────────────────────┘
```

### Resource Management

```typescript
interface ResourceLimits {
  // Per instance
  maxConcurrentConnections: 100;
  maxTokensPerMinute: 600;
  memoryLimit: '512MB';
  
  // Per user
  maxSessionsPerIP: 3;
  tokenRefreshLimit: 5;
  
  // Global
  totalActiveConnections: 10000;
  apiRateLimit: 10000; // per minute
}
```

---

**Architecture Status**: ✅ **Production-Ready** - Scalable, secure, and well-monitored architecture with comprehensive error handling and graceful degradation.