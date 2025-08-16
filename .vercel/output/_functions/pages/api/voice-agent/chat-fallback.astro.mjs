export { renderers } from '../../../renderers.mjs';

const prerender = false;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS?.split(",") || ["http://localhost:4321", "http://localhost:4322", "https://executiveaitraining.com"];
async function generateChatCompletion(messages, functions) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages,
      functions,
      function_call: functions ? "auto" : void 0,
      temperature: 0.8,
      max_tokens: 1e3
    })
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Chat completion failed: ${response.status} - ${errorText}`);
  }
  return response.json();
}
async function generateSpeech(text, voice = "alloy") {
  const response = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "tts-1",
      input: text.substring(0, 4096),
      // TTS has input limits
      voice,
      response_format: "mp3"
    })
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`TTS generation failed: ${response.status} - ${errorText}`);
  }
  return response.arrayBuffer();
}
const POST = async ({ request, clientAddress }) => {
  const startTime = Date.now();
  const clientIP = clientAddress || request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
  const origin = request.headers.get("origin");
  console.log(`📞 Chat fallback request from ${clientIP} - Origin: ${origin}`);
  try {
    if (origin && !ALLOWED_ORIGINS.includes(origin)) {
      console.warn(`❌ Invalid origin: ${origin} from ${clientIP}`);
      return new Response(JSON.stringify({
        success: false,
        error: "Invalid origin",
        mode: "fallback"
      }), {
        status: 403,
        headers: { "Content-Type": "application/json" }
      });
    }
    const chatRequest = await request.json();
    const { message, sessionId, voice = "alloy", includeAudio = true, context = [] } = chatRequest;
    if (!message || !sessionId) {
      return new Response(JSON.stringify({
        success: false,
        error: "Message and sessionId are required",
        mode: "fallback"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const systemMessage = {
      role: "system",
      content: `You are an AI executive assistant specializing in helping business leaders understand and implement AI solutions. 

Key responsibilities:
- Qualify leads for AI consulting services
- Provide expert guidance on AI strategy and implementation
- Schedule discovery calls and consultations
- Share relevant resources and case studies

Voice conversation context:
- Keep responses concise and conversational (under 100 words typically)
- Ask follow-up questions to understand business needs
- Guide toward scheduling a discovery call when appropriate
- Maintain a professional yet approachable tone

Available functions:
- schedule_discovery_call: Book a consultation
- send_resource: Share whitepapers, case studies, or guides
- qualify_lead: Capture business information

Current mode: Chat API fallback (standard OpenAI API with TTS)`
    };
    const messages = [
      systemMessage,
      ...context.slice(-10),
      // Keep last 10 messages for context
      { role: "user", content: message }
    ];
    const functions = [
      {
        name: "schedule_discovery_call",
        description: "Schedule a discovery call with the prospect",
        parameters: {
          type: "object",
          properties: {
            name: { type: "string", description: "Contact name" },
            email: { type: "string", description: "Contact email" },
            company: { type: "string", description: "Company name" },
            timePreference: {
              type: "string",
              enum: ["morning", "afternoon", "evening", "flexible"],
              description: "Preferred time of day"
            }
          },
          required: ["name", "email"]
        }
      },
      {
        name: "send_resource",
        description: "Send a relevant resource to the prospect",
        parameters: {
          type: "object",
          properties: {
            resourceType: {
              type: "string",
              enum: ["ai_strategy_guide", "case_study", "roi_calculator", "implementation_checklist"],
              description: "Type of resource to send"
            },
            email: { type: "string", description: "Email address to send to" }
          },
          required: ["resourceType"]
        }
      }
    ];
    const completion = await generateChatCompletion(messages, functions);
    const assistantMessage = completion.choices[0].message;
    let responseData = {
      success: true,
      message: assistantMessage.content,
      sessionId,
      mode: "fallback"
    };
    if (assistantMessage.function_call) {
      responseData.functionCalls = [{
        name: assistantMessage.function_call.name,
        arguments: JSON.parse(assistantMessage.function_call.arguments || "{}")
      }];
    }
    if (includeAudio && assistantMessage.content && assistantMessage.content.trim()) {
      try {
        const audioBuffer = await generateSpeech(assistantMessage.content, voice);
        const audioBase64 = Buffer.from(audioBuffer).toString("base64");
        responseData.audioBase64 = audioBase64;
      } catch (audioError) {
        console.warn("⚠️ TTS generation failed:", audioError);
      }
    }
    const processingTime = Date.now() - startTime;
    console.log(`✅ Chat fallback completed for ${clientIP} - Session: ${sessionId} - Processing: ${processingTime}ms`);
    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "X-Processing-Time": processingTime.toString(),
        ...origin && ALLOWED_ORIGINS.includes(origin) && {
          "Access-Control-Allow-Origin": origin,
          "Access-Control-Allow-Methods": "POST",
          "Access-Control-Allow-Headers": "Content-Type, Authorization"
        }
      }
    });
  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error(`❌ Chat fallback error for ${clientIP}:`, error);
    return new Response(JSON.stringify({
      success: false,
      error: "Chat processing failed",
      sessionId: "unknown",
      mode: "fallback"
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "X-Processing-Time": processingTime.toString()
      }
    });
  }
};
const OPTIONS = async ({ request }) => {
  const origin = request.headers.get("origin");
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    return new Response(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Max-Age": "86400"
      }
    });
  }
  return new Response(null, { status: 404 });
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  OPTIONS,
  POST,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
