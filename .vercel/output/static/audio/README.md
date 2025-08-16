/*
 * DREAMFORGE HIVE-MIND CHAIN OF CUSTODY
 *
 * @file-purpose: Documentation for voice agent audio assets
 * @version: 1.0.0
 * @init-author: real-time-ui-agent
 * @init-cc-sessionId: cc-unknown-20250808-354
 * @init-timestamp: 2025-08-08T16:45:00Z
 * @reasoning:
 * - **Objective:** Document required audio files for voice agent feedback
 * - **Strategy:** Provide specifications and generation instructions
 * - **Outcome:** Clear guidance for audio asset creation
 */

# Voice Agent Audio Assets

This directory contains audio files used for voice agent feedback and state transitions.

## Required Audio Files

### 1. search-start.webm
**Purpose**: Played when voice agent starts listening or begins a search
**Duration**: 0.5-1.0 seconds
**Type**: Soft, pleasant chime or bell sound
**Volume**: Gentle, non-intrusive
**Frequency**: 800-1200 Hz range for clarity

### 2. processing-loop.webm
**Purpose**: Ambient background sound during AI processing
**Duration**: 3-5 seconds (seamless loop)
**Type**: Soft ambient hum, subtle white noise, or gentle synthesizer pad
**Volume**: Very low, almost subliminal
**Frequency**: Low-mid range (200-600 Hz) to avoid fatigue

### 3. search-complete.webm
**Purpose**: Indicates successful completion of search/response
**Duration**: 0.8-1.2 seconds
**Type**: Success chime, ascending notes, or confirmation bell
**Volume**: Clear but not startling
**Frequency**: Ascending tones from 600-1600 Hz

### 4. search-error.webm
**Purpose**: Gentle notification of errors or issues
**Duration**: 0.6-1.0 seconds
**Type**: Soft, non-alarming error sound (avoid harsh beeps)
**Volume**: Noticeable but not jarring
**Frequency**: Descending tones from 800-400 Hz

## Audio Specifications

- **Format**: WebM (Opus codec) for web compatibility and small file size
- **Quality**: 32kbps mono (sufficient for UI sounds)
- **Sample Rate**: 44.1kHz or 48kHz
- **Bit Depth**: 16-bit
- **Peak Volume**: -6dB to prevent clipping
- **No DC Offset**: Ensure audio is centered around zero

## Accessibility Considerations

- All sounds should be distinguishable for users with hearing impairments
- Provide visual feedback alternatives for each audio cue
- Sounds should not interfere with screen readers
- Volume should be adjustable or mutable
- Consider frequency ranges that work well with hearing aids

## Generation Tools

You can generate these audio files using:

1. **Audacity** (Free, Open Source)
   - Built-in tone generator for chimes
   - Noise generator for ambient sounds
   - Export to WebM format

2. **Online Tools**
   - Freesound.org for royalty-free sounds
   - Zapsplat.com for professional audio
   - Adobe Audition or Logic Pro for custom creation

3. **Web Audio API** (Programmatic generation)
   - Use JavaScript's AudioContext to generate tones
   - Create procedural audio that matches the UI theme

## Sample Generation Script

See `generate-audio-files.js` for a Web Audio API implementation that creates the required audio files programmatically.

## Usage in Components

```typescript
// Import in React component
const audioFiles = {
  start: '/audio/search-start.webm',
  processing: '/audio/processing-loop.webm',
  complete: '/audio/search-complete.webm',
  error: '/audio/search-error.webm'
};

// Play audio file
const playAudio = (type: keyof typeof audioFiles) => {
  const audio = new Audio(audioFiles[type]);
  audio.volume = 0.5; // Adjustable
  audio.play().catch(console.error);
};
```

## File Status

- [ ] search-start.webm - To be generated
- [ ] processing-loop.webm - To be generated  
- [ ] search-complete.webm - To be generated
- [ ] search-error.webm - To be generated

Replace this README with actual audio files once generated.