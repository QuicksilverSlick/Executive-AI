/**
 * API Compatibility Checker Endpoint
 * Detects OpenAI API tier and provides compatibility information
 * 
 * Features:
 * - OpenAI API tier detection
 * - Feature availability mapping
 * - Recommendation engine
 * - Upgrade path guidance
 */

import type { APIRoute } from 'astro';

// Disable prerendering for this API endpoint
export const prerender = false;

// Environment validation
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

interface CompatibilityResponse {
  success: boolean;
  tier: 'realtime' | 'standard' | 'unknown' | 'none';
  features: {
    realtimeVoice: boolean;
    chatCompletion: boolean;
    textToSpeech: boolean;
    speechToText: boolean;
    functionCalling: boolean;
  };
  limitations: string[];
  recommendations: string[];
  upgradeInfo?: {
    required: boolean;
    tierName: string;
    benefits: string[];
    upgradeUrl: string;
  };
  error?: string;
}

/**
 * Test OpenAI Realtime API availability
 */
async function testRealtimeAPI(): Promise<boolean> {
  if (!OPENAI_API_KEY) return false;

  try {
    const response = await fetch('https://api.openai.com/v1/realtime/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-realtime-preview',
        voice: 'alloy',
        expires_at: Math.floor(Date.now() / 1000) + 60,
      }),
    });

    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Test standard OpenAI API availability
 */
async function testStandardAPI(): Promise<boolean> {
  if (!OPENAI_API_KEY) return false;

  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
    });

    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Test Text-to-Speech API availability
 */
async function testTTSAPI(): Promise<boolean> {
  if (!OPENAI_API_KEY) return false;

  try {
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',
        input: 'test',
        voice: 'alloy',
      }),
    });

    return response.ok || response.status === 400; // 400 is expected for minimal test
  } catch {
    return false;
  }
}

/**
 * GET /api/voice-agent/compatibility
 * Checks API compatibility and returns feature availability
 */
export const GET: APIRoute = async ({ request }) => {
  const startTime = Date.now();
  
  console.log('🔍 API compatibility check requested');
  
  try {
    if (!OPENAI_API_KEY) {
      const response: CompatibilityResponse = {
        success: true,
        tier: 'none',
        features: {
          realtimeVoice: false,
          chatCompletion: false,
          textToSpeech: false,
          speechToText: false,
          functionCalling: false,
        },
        limitations: [
          'No OpenAI API key configured',
          'All AI features disabled',
          'Only demo mode available'
        ],
        recommendations: [
          'Configure OPENAI_API_KEY environment variable',
          'Sign up for OpenAI API access',
          'Start with a standard tier account for basic features'
        ],
        upgradeInfo: {
          required: true,
          tierName: 'OpenAI API Access',
          benefits: [
            'AI-powered conversations',
            'Text-to-speech synthesis',
            'Speech-to-text transcription',
            'Function calling capabilities'
          ],
          upgradeUrl: 'https://platform.openai.com/signup'
        }
      };

      return new Response(JSON.stringify(response), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Test API endpoints in parallel
    const [hasRealtimeAPI, hasStandardAPI, hasTTSAPI] = await Promise.all([
      testRealtimeAPI(),
      testStandardAPI(),
      testTTSAPI()
    ]);

    let tier: 'realtime' | 'standard' | 'unknown';
    let features: CompatibilityResponse['features'];
    let limitations: string[] = [];
    let recommendations: string[] = [];
    let upgradeInfo: CompatibilityResponse['upgradeInfo'];

    if (hasRealtimeAPI) {
      // Full Realtime API access
      tier = 'realtime';
      features = {
        realtimeVoice: true,
        chatCompletion: true,
        textToSpeech: true,
        speechToText: true,
        functionCalling: true,
      };
      recommendations = [
        'You have full access to all voice agent features',
        'Use Realtime API for best performance and latency',
        'Enable advanced features like function calling'
      ];
    } else if (hasStandardAPI && hasTTSAPI) {
      // Standard API with TTS
      tier = 'standard';
      features = {
        realtimeVoice: false,
        chatCompletion: true,
        textToSpeech: true,
        speechToText: true,
        functionCalling: true,
      };
      limitations = [
        'Realtime API not available on current tier',
        'Higher latency with Chat API + TTS approach',
        'Manual audio processing required'
      ];
      recommendations = [
        'Current setup supports Chat API with Text-to-Speech',
        'Consider upgrading for real-time voice features',
        'Fallback mode will be used automatically'
      ];
      upgradeInfo = {
        required: false,
        tierName: 'Realtime API Access',
        benefits: [
          'Ultra-low latency voice conversations',
          'Real-time audio streaming',
          'Advanced voice processing',
          'Better user experience'
        ],
        upgradeUrl: 'https://platform.openai.com/docs/guides/realtime'
      };
    } else if (hasStandardAPI) {
      // Standard API only
      tier = 'standard';
      features = {
        realtimeVoice: false,
        chatCompletion: true,
        textToSpeech: false,
        speechToText: true,
        functionCalling: true,
      };
      limitations = [
        'Realtime API not available',
        'Text-to-Speech API not available',
        'Text-only conversations supported',
        'No voice output capabilities'
      ];
      recommendations = [
        'Text-based chat is available',
        'Upgrade to access voice features',
        'Consider alternative TTS solutions'
      ];
      upgradeInfo = {
        required: true,
        tierName: 'Full API Access',
        benefits: [
          'Text-to-speech synthesis',
          'Voice input/output capabilities',
          'Complete voice agent functionality'
        ],
        upgradeUrl: 'https://platform.openai.com/account/billing'
      };
    } else {
      // No API access or unknown state
      tier = 'unknown';
      features = {
        realtimeVoice: false,
        chatCompletion: false,
        textToSpeech: false,
        speechToText: false,
        functionCalling: false,
      };
      limitations = [
        'Unable to access OpenAI API',
        'API key may be invalid or expired',
        'Network connectivity issues possible',
        'All features disabled'
      ];
      recommendations = [
        'Verify API key is valid and active',
        'Check account billing status',
        'Ensure network connectivity',
        'Contact OpenAI support if issues persist'
      ];
      upgradeInfo = {
        required: true,
        tierName: 'API Access',
        benefits: [
          'Basic chat functionality',
          'AI-powered conversations',
          'Foundation for voice features'
        ],
        upgradeUrl: 'https://platform.openai.com/account/api-keys'
      };
    }

    const response: CompatibilityResponse = {
      success: true,
      tier,
      features,
      limitations,
      recommendations,
      upgradeInfo
    };

    const processingTime = Date.now() - startTime;
    console.log(`✅ Compatibility check completed - Tier: ${tier} - Processing: ${processingTime}ms`);

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
        'X-Processing-Time': processingTime.toString()
      }
    });

  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error('❌ Compatibility check failed:', error);

    const response: CompatibilityResponse = {
      success: false,
      tier: 'unknown',
      features: {
        realtimeVoice: false,
        chatCompletion: false,
        textToSpeech: false,
        speechToText: false,
        functionCalling: false,
      },
      limitations: [
        'Compatibility check failed',
        'Unable to determine API capabilities',
        'System error occurred'
      ],
      recommendations: [
        'Try again in a few moments',
        'Check system status',
        'Contact support if problem persists'
      ],
      error: 'Internal compatibility check error'
    };

    return new Response(JSON.stringify(response), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'X-Processing-Time': processingTime.toString()
      }
    });
  }
};

/**
 * OPTIONS /api/voice-agent/compatibility
 * Handle CORS preflight requests
 */
export const OPTIONS: APIRoute = async () => {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400'
    }
  });
};