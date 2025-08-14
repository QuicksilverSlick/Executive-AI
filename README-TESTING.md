# Voice Agent Testing Suite - Quick Start Guide

## 🚀 Installation & Setup

### 1. Install Test Dependencies
```bash
npm install @playwright/test@^1.40.0 @vitest/ui@^1.0.0 jsdom@^23.0.0 vitest@^1.0.0 --save-dev
```

### 2. Install Playwright Browsers
```bash
npx playwright install
```

## 🧪 Running Tests

### Quick Test Commands
```bash
# Run all tests (unit + E2E)
npm run test:all

# Unit tests only
npm run test:run

# E2E tests only  
npm run test:e2e

# Interactive test UI
npm run test:ui

# Voice agent specific tests
npm run test:voice

# Generate coverage report
npm run test:coverage
```

### Manual Testing
Open the comprehensive test page:
```bash
# Start dev server
npm run dev

# Open in browser
http://localhost:4321/test-voice-assistant-comprehensive.html
```

## 📊 Test Coverage

The test suite covers **45 test scenarios** across **8 major categories**:

✅ **Push-to-Talk Functionality** (8 tests)  
✅ **Transcript Display** (6 tests)  
✅ **Voice Activity Visualization** (5 tests)  
✅ **Text Input Functionality** (4 tests)  
✅ **Modern UI/UX** (7 tests)  
✅ **Error Handling** (6 tests)  
✅ **Settings & Features** (5 tests)  
✅ **Performance & Analytics** (4 tests)  

**Target Coverage**: 90%+ across all voice agent components

## 🔧 Test Files Structure

```
tests/
├── integration/
│   └── voice-agent-comprehensive.test.js    # Main integration tests
├── e2e/
│   └── voice-agent-journey.e2e.test.js     # End-to-end user journeys
├── utils/
│   └── voice-agent-test-utils.js           # Test utilities & mocks
├── config/
│   └── voice-agent-test.config.js          # Test configuration
└── setup/
    └── test-setup.js                       # Global test setup

test-voice-assistant-comprehensive.html      # Interactive test page
vitest.config.js                            # Unit test config
playwright.config.js                        # E2E test config
```

## 🎯 Key Testing Features

### Automated Testing
- Cross-browser compatibility (Chrome, Firefox, Safari, Edge)
- Mobile/tablet responsive testing
- Accessibility compliance validation
- Performance benchmarking
- Error scenario coverage

### Interactive Testing
- Real-time test execution dashboard
- Visual feedback for all test results
- Configuration testing options
- Performance metrics display

### Quality Assurance
- WebRTC API mocking
- Canvas visualization testing
- Audio level simulation
- Error injection testing
- Accessibility auditing

## 🚨 Common Issues & Solutions

### 1. WebRTC Permission Errors
```bash
# Chrome flags for testing
--use-fake-ui-for-media-stream
--use-fake-device-for-media-stream
```

### 2. Canvas Context Errors
Canvas mocking is automatically handled in test setup.

### 3. Animation Testing
Reduced motion preferences are respected in tests.

### 4. Audio Testing
Fake audio streams are used to avoid actual microphone access.

## 📈 CI/CD Integration

Test outputs are generated in multiple formats:
- **JSON**: Machine-readable results
- **HTML**: Human-readable reports  
- **JUnit**: CI/CD integration
- **Coverage**: Detailed coverage reports

## 🛡️ Security Testing

Tests validate:
- Microphone permission handling
- Secure WebRTC connections
- Token expiration scenarios
- Input sanitization
- Error message security

---

**Ready to test?** Run `npm run test:all` to validate all voice agent functionality!