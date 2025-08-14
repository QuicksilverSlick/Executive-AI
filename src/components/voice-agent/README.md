# Voice Assistant Widget Components

/*
 * DREAMFORGE HIVE-MIND CHAIN OF CUSTODY
 *
 * @file-purpose: Comprehensive documentation for voice assistant components
 * @version: 1.0.0
 * @init-author: real-time-ui-agent
 * @init-cc-sessionId: cc-ui-20250801-001
 * @init-timestamp: 2025-08-01T04:26:00Z
 * @reasoning:
 * - **Objective:** Complete documentation for voice assistant widget system
 * - **Strategy:** Clear usage examples with accessibility and customization guides
 * - **Outcome:** Developer-friendly documentation enabling easy implementation
 */

A modern, accessible voice assistant widget built for the AI Masterclass platform. Features real-time audio visualization, speech recognition, and a responsive UI that works across desktop and mobile devices.

## Features

- 🎤 **Voice Recognition**: Browser-native speech recognition with interim results
- 🔊 **Text-to-Speech**: Natural voice responses with customizable voices
- 📊 **Real-time Visualization**: Multiple audio waveform display modes
- ♿ **Accessibility**: WCAG 2.1 AA compliant with screen reader support
- 📱 **Mobile Responsive**: Touch-friendly interface with gesture support
- 🌙 **Theme Support**: Light/dark theme with custom color schemes
- ⌨️ **Keyboard Shortcuts**: Push-to-talk with Space bar and other shortcuts
- 🔄 **Session Management**: Persistent conversations with message history
- 🚫 **Error Handling**: Graceful degradation and user-friendly error messages

## Quick Start

### Astro Component (Recommended)

```astro
---
// src/pages/index.astro
import VoiceAssistantWidget from '../components/voice-agent/VoiceAssistantWidget.astro';
---

<html>
<head>
  <title>AI Masterclass</title>
</head>
<body>
  <main>
    <!-- Your main content -->
  </main>
  
  <!-- Voice Assistant Widget -->
  <VoiceAssistantWidget 
    position="bottom-right"
    theme="auto"
    apiEndpoint="/api/voice-assistant"
    showTranscript={true}
    enableKeyboardShortcut={true}
  />
</body>
</html>
```

### React Component

```tsx
import React from 'react';
import { WebRTCVoiceAssistant } from '../components/voice-agent';

function App() {
  return (
    <div className="app">
      {/* Your main content */}
      
      <WebRTCVoiceAssistant
        position="bottom-right"
        theme="auto"
        apiEndpoint="/api/voice-assistant"
        showTranscript={true}
        enableKeyboardShortcut={true}
        onMessage={(message) => console.log('New message:', message)}
        onStatusChange={(status) => console.log('Status changed:', status)}
        onError={(error) => console.error('Voice error:', error)}
      />
    </div>
  );
}
```

### Using React Hooks

```tsx
import React from 'react';
import { useVoiceAssistant, useAudioVisualization } from '../components/voice-agent';

function CustomVoiceComponent() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const {
    isListening,
    messages,
    startListening,
    stopListening,
    toggleMute,
    status
  } = useVoiceAssistant({
    apiEndpoint: '/api/voice-assistant',
    showTranscript: true
  });

  const { startVisualization, stopVisualization } = useAudioVisualization(
    canvasRef,
    isListening
  );

  return (
    <div className="custom-voice-widget">
      <button onClick={isListening ? stopListening : startListening}>
        {isListening ? 'Stop' : 'Start'} Listening
      </button>
      
      <canvas ref={canvasRef} width="320" height="96" />
      
      <div className="messages">
        {messages.map(message => (
          <div key={message.id}>
            <strong>{message.type}:</strong> {message.content}
          </div>
        ))}
      </div>
    </div>
  );
}
```

## Component Props

### VoiceAssistantWidget (Astro)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `position` | `'bottom-right' \| 'bottom-left' \| 'top-right' \| 'top-left'` | `'bottom-right'` | Widget position on screen |
| `theme` | `'auto' \| 'light' \| 'dark'` | `'auto'` | Color theme |
| `apiEndpoint` | `string` | `'/api/voice-assistant'` | API endpoint for voice processing |
| `showTranscript` | `boolean` | `true` | Show conversation transcript |
| `enableKeyboardShortcut` | `boolean` | `true` | Enable Space bar push-to-talk |
| `autoMinimize` | `boolean` | `true` | Auto-minimize on outside click |

### WebRTCVoiceAssistant

All Astro props plus:

| Prop | Type | Description |
|------|------|-------------|
| `onMessage` | `(message: VoiceMessage) => void` | Callback for new messages |
| `onStatusChange` | `(status: VoiceStatus) => void` | Callback for status changes |
| `onError` | `(error: VoiceAssistantError) => void` | Callback for errors |

## API Integration

### Backend Endpoint

Create an API endpoint at `/api/voice-assistant` to handle voice requests:

```javascript
// api/voice-assistant.js (or similar)
export async function POST({ request }) {
  try {
    const { message, sessionId, timestamp } = await request.json();
    
    // Process the voice message with your AI service
    const response = await yourAIService.processMessage(message, sessionId);
    
    return new Response(JSON.stringify({
      message: response.text,
      sessionId,
      timestamp: new Date().toISOString(),
      metadata: {
        confidence: response.confidence,
        audioUrl: response.audioUrl // Optional TTS audio
      }
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Failed to process voice message',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
```

### Request Format

```typescript
interface APIRequest {
  message: string;        // Transcribed user speech
  sessionId: string;      // Unique session identifier
  timestamp: string;      // ISO timestamp
  metadata?: {
    audioData?: ArrayBuffer;  // Optional raw audio
    confidence?: number;      // Speech recognition confidence
    language?: string;        // Detected language
  };
}
```

### Response Format

```typescript
interface APIResponse {
  message: string;        // AI response text
  sessionId: string;      // Session identifier
  timestamp: string;      // Response timestamp
  metadata?: {
    audioUrl?: string;        // Optional TTS audio URL
    confidence?: number;      // Response confidence
    suggestions?: string[];   // Follow-up suggestions
    actions?: VoiceAction[];  // UI actions to perform
  };
}
```

## Customization

### Styling

The components use Tailwind CSS classes and can be customized through:

1. **CSS Custom Properties**: Override theme colors
2. **Tailwind Config**: Extend the existing color palette
3. **Custom Classes**: Add your own styling classes

```css
/* Custom styling example */
.voice-widget-container {
  --voice-primary: #your-brand-color;
  --voice-secondary: #your-accent-color;
}

.voice-widget-panel {
  backdrop-filter: blur(20px);
  border: 2px solid var(--voice-primary);
}
```

### Audio Visualization

Multiple visualization modes are available:

```tsx
<VoiceVisualization
  canvasRef={canvasRef}
  audioData={audioData}
  isActive={isListening}
  mode="bars"           // 'bars' | 'wave' | 'circular' | 'particles'
  color="#D4A034"       // Custom color
  showVolume={true}     // Show volume indicator
  responsive={true}     // Responsive canvas
/>
```

### Configuration Options

```typescript
const config: VoiceAssistantConfig = {
  apiEndpoint: '/api/voice-assistant',
  showTranscript: true,
  enableKeyboard: true,
  autoMinimize: true,
  waveformColors: {
    idle: '#D4A034',
    listening: '#10B981',
    thinking: '#F59E0B',
    speaking: '#3B82F6',
    error: '#F43F5E'
  },
  audioConfig: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
    sampleRate: 44100
  },
  speechConfig: {
    language: 'en-US',
    continuous: false,
    interimResults: true,
    maxAlternatives: 1
  },
  synthConfig: {
    rate: 0.9,
    pitch: 1.0,
    volume: 0.8
  }
};
```

## Accessibility Features

### Screen Reader Support

- Full ARIA labeling for all interactive elements
- Live regions for status announcements
- Semantic HTML structure
- Keyboard navigation support

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Space` | Push-to-talk (hold to record) |
| `Escape` | Close widget panel |
| `Ctrl/Cmd + M` | Toggle mute |
| `Tab` | Navigate through controls |
| `Enter/Space` | Activate focused button |

### High Contrast Support

The widget automatically adapts to system high contrast preferences and includes:

- Enhanced focus indicators
- Increased border widths
- High contrast color combinations
- Reduced motion options

### Mobile Accessibility

- Touch-friendly button sizes (minimum 44px)
- Swipe gestures for navigation
- Voice-over/TalkBack compatibility
- Haptic feedback support

## Error Handling

The widget includes comprehensive error handling for:

### Permission Errors
- Microphone access denied
- Audio context blocked
- HTTPS requirement not met

### Technical Errors
- Speech recognition not supported
- Network connectivity issues
- API endpoint failures
- Audio capture problems

### User Experience
- Graceful degradation when features aren't supported
- User-friendly error messages
- Automatic retry mechanisms
- Fallback to text input

## Browser Support

### Full Support
- Chrome 60+ (desktop/mobile)
- Edge 79+ (desktop/mobile)
- Safari 14.1+ (desktop/mobile)
- Firefox 84+ (desktop only)

### Partial Support
- Firefox Mobile (no speech recognition)
- Older browsers (text-only mode)

### Required Features
- Web Audio API
- MediaDevices API
- Speech Recognition API (optional)
- Speech Synthesis API (optional)

## Performance Considerations

### Optimization Features
- Canvas rendering at 60fps
- Audio buffer management
- Message history limiting (50 messages max)
- Automatic cleanup on unmount
- Debounced resize handling

### Memory Management
- Audio context cleanup
- MediaStream track stopping
- Animation frame cancellation
- Event listener removal

## Development

### File Structure
```
voice-agent/
├── VoiceAssistantWidget.astro    # Main Astro component
├── WebRTCVoiceAssistant.tsx       # Main React component with voice + text input
├── VoiceTranscript.tsx           # Message transcript
├── VoiceVisualization.tsx        # Audio visualization
├── voice-assistant-core.js       # Core JavaScript logic
├── types.ts                      # TypeScript definitions
├── hooks/
│   ├── useVoiceAssistant.ts     # Main voice hook
│   └── useAudioVisualization.ts # Visualization hook
├── index.ts                      # Export barrel
└── README.md                     # This file
```

### Building for Production

1. **Astro**: Components are automatically optimized during build
2. **React**: Use your standard React build process
3. **TypeScript**: Ensure proper type checking
4. **Assets**: Audio files and icons are automatically optimized

### Testing

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Test accessibility
npm run test:a11y

# Test performance
npm run test:performance
```

## Troubleshooting

### Common Issues

**Microphone not working**
- Check HTTPS requirement
- Verify browser permissions
- Test with different browsers

**Audio visualization not showing**
- Check Web Audio API support
- Verify canvas element exists
- Monitor console for errors

**Speech recognition fails**
- Verify browser support
- Check network connectivity
- Test with different languages

**API errors**
- Verify endpoint configuration
- Check CORS settings
- Monitor network requests

### Debug Mode

Enable debug logging:

```javascript
window.voiceAssistantDebug = true;
```

This will log detailed information about:
- Audio context initialization
- Speech recognition events
- API requests/responses
- Canvas rendering performance

## Examples

See the `/examples` directory for complete implementation examples:

- Basic Astro integration
- Advanced React customization
- Custom API implementation
- Accessibility demonstrations
- Performance optimization

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Update documentation
6. Submit a pull request

## License

MIT License - see LICENSE file for details.