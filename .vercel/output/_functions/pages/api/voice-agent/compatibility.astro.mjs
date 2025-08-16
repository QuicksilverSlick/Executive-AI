export { renderers } from '../../../renderers.mjs';

const prerender = false;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
async function testRealtimeAPI() {
  if (!OPENAI_API_KEY) return false;
  try {
    const response = await fetch("https://api.openai.com/v1/realtime/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-realtime-preview",
        voice: "alloy",
        expires_at: Math.floor(Date.now() / 1e3) + 60
      })
    });
    return response.ok;
  } catch {
    return false;
  }
}
async function testStandardAPI() {
  if (!OPENAI_API_KEY) return false;
  try {
    const response = await fetch("https://api.openai.com/v1/models", {
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      }
    });
    return response.ok;
  } catch {
    return false;
  }
}
async function testTTSAPI() {
  if (!OPENAI_API_KEY) return false;
  try {
    const response = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "tts-1",
        input: "test",
        voice: "alloy"
      })
    });
    return response.ok || response.status === 400;
  } catch {
    return false;
  }
}
const GET = async ({ request }) => {
  const startTime = Date.now();
  console.log("🔍 API compatibility check requested");
  try {
    if (!OPENAI_API_KEY) {
      const response2 = {
        success: true,
        tier: "none",
        features: {
          realtimeVoice: false,
          chatCompletion: false,
          textToSpeech: false,
          speechToText: false,
          functionCalling: false
        },
        limitations: [
          "No OpenAI API key configured",
          "All AI features disabled",
          "Only demo mode available"
        ],
        recommendations: [
          "Configure OPENAI_API_KEY environment variable",
          "Sign up for OpenAI API access",
          "Start with a standard tier account for basic features"
        ],
        upgradeInfo: {
          required: true,
          tierName: "OpenAI API Access",
          benefits: [
            "AI-powered conversations",
            "Text-to-speech synthesis",
            "Speech-to-text transcription",
            "Function calling capabilities"
          ],
          upgradeUrl: "https://platform.openai.com/signup"
        }
      };
      return new Response(JSON.stringify(response2), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
    const [hasRealtimeAPI, hasStandardAPI, hasTTSAPI] = await Promise.all([
      testRealtimeAPI(),
      testStandardAPI(),
      testTTSAPI()
    ]);
    let tier;
    let features;
    let limitations = [];
    let recommendations = [];
    let upgradeInfo;
    if (hasRealtimeAPI) {
      tier = "realtime";
      features = {
        realtimeVoice: true,
        chatCompletion: true,
        textToSpeech: true,
        speechToText: true,
        functionCalling: true
      };
      recommendations = [
        "You have full access to all voice agent features",
        "Use Realtime API for best performance and latency",
        "Enable advanced features like function calling"
      ];
    } else if (hasStandardAPI && hasTTSAPI) {
      tier = "standard";
      features = {
        realtimeVoice: false,
        chatCompletion: true,
        textToSpeech: true,
        speechToText: true,
        functionCalling: true
      };
      limitations = [
        "Realtime API not available on current tier",
        "Higher latency with Chat API + TTS approach",
        "Manual audio processing required"
      ];
      recommendations = [
        "Current setup supports Chat API with Text-to-Speech",
        "Consider upgrading for real-time voice features",
        "Fallback mode will be used automatically"
      ];
      upgradeInfo = {
        required: false,
        tierName: "Realtime API Access",
        benefits: [
          "Ultra-low latency voice conversations",
          "Real-time audio streaming",
          "Advanced voice processing",
          "Better user experience"
        ],
        upgradeUrl: "https://platform.openai.com/docs/guides/realtime"
      };
    } else if (hasStandardAPI) {
      tier = "standard";
      features = {
        realtimeVoice: false,
        chatCompletion: true,
        textToSpeech: false,
        speechToText: true,
        functionCalling: true
      };
      limitations = [
        "Realtime API not available",
        "Text-to-Speech API not available",
        "Text-only conversations supported",
        "No voice output capabilities"
      ];
      recommendations = [
        "Text-based chat is available",
        "Upgrade to access voice features",
        "Consider alternative TTS solutions"
      ];
      upgradeInfo = {
        required: true,
        tierName: "Full API Access",
        benefits: [
          "Text-to-speech synthesis",
          "Voice input/output capabilities",
          "Complete voice agent functionality"
        ],
        upgradeUrl: "https://platform.openai.com/account/billing"
      };
    } else {
      tier = "unknown";
      features = {
        realtimeVoice: false,
        chatCompletion: false,
        textToSpeech: false,
        speechToText: false,
        functionCalling: false
      };
      limitations = [
        "Unable to access OpenAI API",
        "API key may be invalid or expired",
        "Network connectivity issues possible",
        "All features disabled"
      ];
      recommendations = [
        "Verify API key is valid and active",
        "Check account billing status",
        "Ensure network connectivity",
        "Contact OpenAI support if issues persist"
      ];
      upgradeInfo = {
        required: true,
        tierName: "API Access",
        benefits: [
          "Basic chat functionality",
          "AI-powered conversations",
          "Foundation for voice features"
        ],
        upgradeUrl: "https://platform.openai.com/account/api-keys"
      };
    }
    const response = {
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
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=300",
        // Cache for 5 minutes
        "X-Processing-Time": processingTime.toString()
      }
    });
  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error("❌ Compatibility check failed:", error);
    const response = {
      success: false,
      tier: "unknown",
      features: {
        realtimeVoice: false,
        chatCompletion: false,
        textToSpeech: false,
        speechToText: false,
        functionCalling: false
      },
      limitations: [
        "Compatibility check failed",
        "Unable to determine API capabilities",
        "System error occurred"
      ],
      recommendations: [
        "Try again in a few moments",
        "Check system status",
        "Contact support if problem persists"
      ],
      error: "Internal compatibility check error"
    };
    return new Response(JSON.stringify(response), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "X-Processing-Time": processingTime.toString()
      }
    });
  }
};
const OPTIONS = async () => {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400"
    }
  });
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  OPTIONS,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
