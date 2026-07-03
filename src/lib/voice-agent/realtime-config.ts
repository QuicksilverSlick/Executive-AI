/**
 * Central configuration for the OpenAI Realtime voice agent.
 *
 * Single source of truth for the model, voice, endpoints, and session shape.
 * Migrated 2026-07 from the removed Realtime *beta* interface
 * (POST /v1/realtime/sessions + `OpenAI-Beta: realtime=v1`, removed 2026-05-12)
 * to the GA interface: server mints an ephemeral key at
 * POST /v1/realtime/client_secrets, browser does SDP exchange at
 * POST /v1/realtime/calls. See docs: developers.openai.com/api/docs/guides/realtime-webrtc
 */

/** GA Realtime model. `gpt-realtime-2` = "Realtime 2.0" (released 2026-05-07). */
export const REALTIME_MODEL = 'gpt-realtime-2';

/** Newer natural GA voice. Options incl: marin, cedar, alloy, ash, ballad, coral, echo, sage, shimmer, verse. */
export const REALTIME_VOICE = 'marin';

/** Streaming STT model for input-audio transcription (replaces whisper-1). */
export const TRANSCRIBE_MODEL = 'gpt-4o-transcribe';

/** 24kHz PCM16 both directions (GA nested audio-format shape). */
export const AUDIO_FORMAT = { type: 'audio/pcm', rate: 24000 } as const;

/** OpenAI GA endpoints. */
export const OPENAI_CLIENT_SECRETS_URL = 'https://api.openai.com/v1/realtime/client_secrets';
export const OPENAI_CALLS_URL = 'https://api.openai.com/v1/realtime/calls';

/** WebRTC data-channel name for realtime events. */
export const REALTIME_EVENT_CHANNEL = 'oai-events';

/** Ephemeral client-secret lifetime (seconds). Range 10–7200; used only to open the call. */
export const CLIENT_SECRET_TTL_SECONDS = 600;

export const DEFAULT_INSTRUCTIONS = [
  'You are the voice concierge for Executive AI Training, a premium 1-on-1 AI masterclass for executives and leaders.',
  'Speak concisely and conversationally, like a sharp, warm executive assistant. Keep answers short unless asked for depth.',
  'You can answer questions about the training, its outcomes, and AI strategy for leaders.',
  'When the caller shows buying intent or asks to talk to someone, offer to book a free strategy session and collect their name, email, company, and what they want to achieve.',
  'If asked something time-sensitive or factual you are unsure about, use the web_search tool.',
  'Never invent pricing, guarantees, or scheduling details you were not given.',
].join(' ');

/** The web_search tool the model can call (handled client-side against our search endpoint). */
export const WEB_SEARCH_TOOL = {
  type: 'function',
  name: 'web_search',
  description: 'Search the web for current, factual information to answer the caller accurately.',
  parameters: {
    type: 'object',
    properties: {
      query: { type: 'string', description: 'The search query.' },
    },
    required: ['query'],
  },
} as const;

export interface BuildSessionOptions {
  instructions?: string;
  voice?: string;
  tools?: unknown[];
  /** gpt-realtime-2 reasoning effort: minimal | low | medium | high | xhigh. Omit to use API default (low). */
  reasoningEffort?: 'minimal' | 'low' | 'medium' | 'high' | 'xhigh';
}

/**
 * Build the GA `session` object for POST /v1/realtime/client_secrets.
 * Keep this the ONLY place the session shape is defined.
 */
export function buildRealtimeSession(opts: BuildSessionOptions = {}) {
  const session: Record<string, unknown> = {
    type: 'realtime',
    model: REALTIME_MODEL,
    instructions: opts.instructions ?? DEFAULT_INSTRUCTIONS,
    max_output_tokens: 4096,
    audio: {
      input: {
        format: AUDIO_FORMAT,
        transcription: { model: TRANSCRIBE_MODEL },
        turn_detection: {
          type: 'server_vad',
          threshold: 0.5,
          prefix_padding_ms: 300,
          silence_duration_ms: 500,
        },
      },
      output: {
        voice: opts.voice ?? REALTIME_VOICE,
        format: AUDIO_FORMAT,
        speed: 1.0,
      },
    },
    tools: opts.tools ?? [WEB_SEARCH_TOOL],
    tool_choice: 'auto',
  };

  // gpt-realtime-2 accepts a reasoning effort; only include when explicitly set.
  if (opts.reasoningEffort) {
    session.reasoning = { effort: opts.reasoningEffort };
  }

  return session;
}
