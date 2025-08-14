/**
 * Demo Mode Endpoint
 * Provides simulated voice agent responses for testing without API access
 * 
 * Features:
 * - Realistic conversation simulation
 * - Predefined response patterns
 * - Function call simulation
 * - Audio placeholder generation
 */

import type { APIRoute } from 'astro';

// Disable prerendering for this API endpoint
export const prerender = false;

interface DemoRequest {
  message: string;
  sessionId: string;
  voice?: string;
  includeAudio?: boolean;
}

interface DemoResponse {
  success: boolean;
  message?: string;
  audioBase64?: string;
  sessionId: string;
  functionCalls?: Array<{
    name: string;
    arguments: any;
  }>;
  error?: string;
  mode: 'demo';
  demoNotice: string;
}

// Demo conversation patterns
const demoResponses = [
  {
    triggers: ['hello', 'hi', 'hey', 'start', 'begin'],
    responses: [
      "Hello! I'm your AI executive assistant. I help business leaders like yourself understand and implement AI solutions. What brings you here today?",
      "Hi there! Welcome to our AI consulting platform. I'd love to learn more about your business and how AI might help you achieve your goals. What's your biggest challenge right now?",
      "Great to meet you! I specialize in helping executives navigate AI transformation. Tell me, what industry are you in?"
    ]
  },
  {
    triggers: ['company', 'business', 'work', 'industry'],
    responses: [
      "That's fascinating! What size is your organization, and what's your current experience with AI technologies?",
      "Excellent! I work with many companies in that space. What specific challenges are you facing that AI might help solve?",
      "Interesting industry! Have you explored any AI solutions yet, or would this be a new initiative for your organization?"
    ]
  },
  {
    triggers: ['challenge', 'problem', 'issue', 'difficulty'],
    responses: [
      "Those are exactly the types of challenges where AI can make a significant impact. Have you considered automating any of these processes?",
      "I see this frequently with organizations your size. AI can really help streamline operations and reduce costs. Would you like to explore some specific solutions?",
      "That's a perfect use case for AI! I'd love to share some case studies of how we've helped similar companies. Should we schedule a deeper conversation?"
    ]
  },
  {
    triggers: ['schedule', 'call', 'meeting', 'consultation', 'talk'],
    responses: [
      "I'd be happy to connect you with our team for a personalized consultation. Can I get your name and email address?",
      "Perfect! Let's get you on the calendar. A discovery call would be ideal to dive deeper into your specific needs. What's your preferred time of day?",
      "Excellent! Our discovery calls typically run 30 minutes and are completely free. When works best for you - mornings, afternoons, or evenings?"
    ],
    functionCall: {
      name: 'schedule_discovery_call',
      arguments: {
        timePreference: 'flexible',
        urgency: 'this_week'
      }
    }
  },
  {
    triggers: ['resources', 'materials', 'guide', 'whitepaper', 'case study'],
    responses: [
      "I have several resources that would be perfect for you! Would you like our AI Strategy Guide or some relevant case studies?",
      "Great question! I can send you our implementation checklist and ROI calculator. What's your email address?",
      "I'd love to share some materials. Our case studies show 40-60% efficiency gains typically. Shall I send those over?"
    ],
    functionCall: {
      name: 'send_resource',
      arguments: {
        resourceType: 'ai_strategy_guide'
      }
    }
  },
  {
    triggers: ['cost', 'price', 'budget', 'investment'],
    responses: [
      "Investment varies based on scope and complexity. Most of our clients see ROI within 6-12 months. Would you like to discuss your specific situation?",
      "Great question! The discovery call will help us understand your needs and provide accurate investment ranges. Most implementations start around $50K for SMBs.",
      "Budget is always important! Our approach is to start with high-impact, low-cost initiatives. Want to explore what that might look like for you?"
    ]
  }
];

const fallbackResponses = [
  "That's interesting! Tell me more about your specific situation so I can provide better guidance.",
  "I understand. Every business is unique. What outcomes are you hoping to achieve?",
  "Good point! What's your timeline for exploring AI solutions?",
  "I see where you're coming from. What's driving this initiative at your company?",
  "That makes sense. Would it help if we scheduled a brief call to discuss your specific needs?"
];

/**
 * Generate a demo response based on user input
 */
function generateDemoResponse(message: string): { response: string; functionCall?: any } {
  const messageLower = message.toLowerCase();
  
  // Find matching pattern
  for (const pattern of demoResponses) {
    if (pattern.triggers.some(trigger => messageLower.includes(trigger))) {
      const randomResponse = pattern.responses[Math.floor(Math.random() * pattern.responses.length)];
      return {
        response: randomResponse,
        functionCall: pattern.functionCall
      };
    }
  }
  
  // Fallback response
  const fallbackResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
  return { response: fallbackResponse };
}

/**
 * Generate placeholder audio data (base64 encoded silence)
 */
function generatePlaceholderAudio(): string {
  // Generate a small MP3 header for silence (about 1 second)
  const silentMp3 = Buffer.from([
    0xff, 0xfb, 0x90, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
  ]);
  return silentMp3.toString('base64');
}

/**
 * POST /api/voice-agent/demo
 * Simulate voice agent responses for testing
 */
export const POST: APIRoute = async ({ request, clientAddress }) => {
  const startTime = Date.now();
  // Safe clientAddress handling - fallback to IP from headers if needed
  const clientIP = clientAddress || request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

  console.log(`🎭 Demo mode request from ${clientIP}`);

  try {
    const demoRequest: DemoRequest = await request.json();
    const { message, sessionId, includeAudio = true } = demoRequest;

    if (!message || !sessionId) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Message and sessionId are required',
        mode: 'demo',
        demoNotice: 'This is demo mode - no actual API calls are made'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Add realistic delay to simulate processing
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

    // Generate demo response
    const { response, functionCall } = generateDemoResponse(message);

    const responseData: DemoResponse = {
      success: true,
      message: response,
      sessionId,
      mode: 'demo',
      demoNotice: 'This is a simulated response. No actual AI API was used.'
    };

    // Include function call if applicable
    if (functionCall) {
      responseData.functionCalls = [functionCall];
    }

    // Include placeholder audio if requested
    if (includeAudio) {
      responseData.audioBase64 = generatePlaceholderAudio();
    }

    const processingTime = Date.now() - startTime;
    console.log(`🎭 Demo response generated for ${clientIP} - Session: ${sessionId} - Processing: ${processingTime}ms`);

    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-Processing-Time': processingTime.toString(),
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });

  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error(`❌ Demo mode error for ${clientIP}:`, error);

    return new Response(JSON.stringify({
      success: false,
      error: 'Demo processing failed',
      sessionId: 'unknown',
      mode: 'demo',
      demoNotice: 'Demo mode encountered an error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'X-Processing-Time': processingTime.toString()
      }
    });
  }
};

/**
 * GET /api/voice-agent/demo
 * Get demo mode information
 */
export const GET: APIRoute = async () => {
  const demoInfo = {
    mode: 'demo',
    description: 'Demo mode simulates voice agent responses without making actual API calls',
    features: {
      conversationSimulation: true,
      functionCallSimulation: true,
      audioPlaceholders: true,
      realisticDelay: true
    },
    limitations: [
      'Responses are predefined patterns, not AI-generated',
      'Audio is placeholder silence',
      'Function calls are simulated',
      'No actual data processing occurs'
    ],
    usage: {
      endpoint: '/api/voice-agent/demo',
      method: 'POST',
      requiredFields: ['message', 'sessionId'],
      optionalFields: ['voice', 'includeAudio']
    },
    availablePatterns: demoResponses.map(pattern => ({
      triggers: pattern.triggers,
      hasFunction: !!pattern.functionCall
    }))
  };

  return new Response(JSON.stringify(demoInfo), {
    status: 200,
    headers: { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
};

/**
 * OPTIONS /api/voice-agent/demo
 * Handle CORS preflight requests
 */
export const OPTIONS: APIRoute = async () => {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400'
    }
  });
};