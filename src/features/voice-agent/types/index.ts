/*
 * DREAMFORGE HIVE-MIND CHAIN OF CUSTODY
 *
 * @file-purpose: Voice Agent Types - Comprehensive TypeScript definitions for OpenAI Realtime Voice Agent
 * @version: 1.2.0
 * @init-author: engineer-agent
 * @init-cc-sessionId: cc-eng-20250801-002
 * @init-timestamp: 2025-08-01T14:30:00Z
 * @reasoning:
 * - **Objective:** Clean type definitions for OpenAI Realtime API voice agent
 * - **Strategy:** Remove custom web search types in favor of native OpenAI function calling
 * - **Outcome:** Simplified, cleaner types that follow OpenAI patterns
 */

/**
 * Voice Agent Types
 * Comprehensive TypeScript definitions for OpenAI Realtime Voice Agent
 */

// ============================================================================
// Core Configuration Types
// ============================================================================

export interface VoiceAgentConfig {
  /** OpenAI API configuration */
  apiVersion: string;
  model: string;
  apiEndpoint?: string;
  
  /** Audio configuration */
  audioConstraints: MediaStreamConstraints;
  
  /** Connection settings */
  maxReconnectAttempts: number;
  reconnectDelay: number;
  tokenRefreshThreshold: number;
  
  /** Enhanced session configuration */
  sessionConfig?: Partial<SessionConfig>;
  
  /** Performance optimizations */
  targetLatency?: number; // Target latency in ms (default: 75)
  adaptiveQuality?: boolean; // Adapt quality based on network
  
  /** UI configuration */
  elementId: string;
  theme: 'light' | 'dark' | 'auto';
  position: 'bottom-right' | 'bottom-left' | 'center';
  autoStart: boolean;
}

export interface EphemeralToken {
  token: string;
  expiresAt: number;
  sessionId: string;
}

export interface TokenResponse {
  success: boolean;
  token?: string;
  expiresAt?: number;
  sessionId?: string;
  error?: string;
  retryAfter?: number;
  warning?: string;
  mode?: 'realtime' | 'fallback' | 'demo';
  warnings?: string[];
}

// ============================================================================
// Connection and State Types
// ============================================================================

export type ConnectionState = 
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'failed'
  | 'token_expired';

export type ConversationState =
  | 'idle'
  | 'listening'
  | 'processing'
  | 'speaking'
  | 'interrupted'
  | 'error';

export interface ConnectionInfo {
  state: ConnectionState;
  sessionId?: string;
  connectedAt?: number;
  lastError?: string;
  reconnectAttempt?: number;
}

// ============================================================================
// OpenAI Realtime API Types
// ============================================================================

export interface RealtimeEvent {
  event_id: string;
  type: string;
  [key: string]: any;
}

export interface SessionConfig {
  modalities: string[];
  instructions: string;
  voice: 'alloy' | 'ash' | 'ballad' | 'coral' | 'echo' | 'sage' | 'shimmer' | 'verse';
  input_audio_format: 'pcm16' | 'g711_ulaw' | 'g711_alaw';
  output_audio_format: 'pcm16' | 'g711_ulaw' | 'g711_alaw';
  input_audio_transcription?: {
    model: 'whisper-1';
  };
  input_audio_noise_reduction?: {
    type: 'near_field' | 'far_field';
  } | null;
  turn_detection: {
    type: 'server_vad';
    threshold: number;
    prefix_padding_ms: number;
    silence_duration_ms: number;
  };
  tools: ToolDefinition[];
  tool_choice: 'auto' | 'none' | 'required';
  temperature: number;
  max_response_output_tokens?: number | 'inf';
}

export interface ToolDefinition {
  type: 'function';
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
}

// ============================================================================
// Audio Processing Types
// ============================================================================

export interface AudioProcessor {
  context: AudioContext;
  workletNode?: AudioWorkletNode;
  inputGain: GainNode;
  outputGain: GainNode;
  isRecording: boolean;
  isPlaying: boolean;
}

export interface AudioChunk {
  data: Int16Array;
  timestamp: number;
  sequenceId: number;
}

export interface AudioBufferManager {
  inputBuffer: AudioChunk[];
  outputBuffer: AudioChunk[];
  currentPlayback?: AudioChunk;
  bufferSize: number;
}

// ============================================================================
// Conversation Management Types
// ============================================================================

export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  metadata?: {
    audioUrl?: string;
    transcriptionConfidence?: number;
    processingTime?: number;
    interrupted?: boolean;
  };
}

export interface ConversationHistory {
  sessionId: string;
  messages: ConversationMessage[];
  startedAt: number;
  lastActivity: number;
  totalDuration: number;
}

export interface UserProfile {
  sessionId: string;
  company?: string;
  title?: string;
  industry?: string;
  aiMaturity?: 'exploring' | 'piloting' | 'scaling' | 'mature';
  primaryChallenge?: string;
  contactInfo?: {
    email?: string;
    phone?: string;
    name?: string;
  };
}

export interface LeadQualification {
  company: string | null;
  title: string | null;
  needsIdentified: boolean;
  budgetQualified: boolean;
  timelineEstablished: boolean;
  score: number; // 0-1 qualification score
}

// ============================================================================
// Function Calling Types
// ============================================================================

export interface FunctionCall {
  name: string;
  arguments: Record<string, any>;
  callId: string;
}

export interface FunctionResult {
  success: boolean;
  data?: any;
  message: string;
  shouldContinue?: boolean;
  metadata?: Record<string, any>;
}

export interface SchedulingPreferences {
  timePreference: 'morning' | 'afternoon' | 'evening' | 'flexible';
  timezone: string;
  urgency: 'this_week' | 'next_week' | 'flexible';
  contactInfo?: {
    name?: string;
    email?: string;
    company?: string;
  };
}


// ============================================================================
// Website Knowledge Base Types
// ============================================================================

export interface ServiceInfo {
  name: string;
  description: string;
  duration: string;
  pricing: string;
  outcomes: string[];
  targetAudience: string[];
  deliverables: string[];
}

export interface CaseStudy {
  title: string;
  industry: string;
  challenge: string;
  solution: string;
  results: string[];
  testimonial?: string;
  clientTitle?: string;
}

export interface WebsiteKnowledge {
  services: Record<string, ServiceInfo>;
  founder: {
    name: string;
    title: string;
    expertise: string[];
    background: string;
    achievements: string[];
  };
  caseStudies: CaseStudy[];
  resources: {
    type: string;
    title: string;
    description: string;
    downloadUrl: string;
  }[];
  pricing: {
    discoveryCall: {
      duration: string;
      price: string;
      description: string;
    };
    masterclass: {
      duration: string;
      price: string;
      description: string;
    };
  };
}

// ============================================================================
// React Hook Types
// ============================================================================

export type VoiceStatus = 'idle' | 'listening' | 'thinking' | 'speaking' | 'error';

export interface VoiceMessage {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  metadata?: {
    confidence?: number;
    interrupted?: boolean;
    processingTime?: number;
  };
}

export interface VoiceAssistantError {
  code: string;
  message: string;
  type: 'connection' | 'permission' | 'api' | 'audio' | 'unknown';
  recoverable: boolean;
  details?: any;
}

export interface VoiceAssistantEvents {
  onMessage?: (message: VoiceMessage) => void;
  onStateChange?: (state: VoiceStatus) => void;
  onError?: (error: VoiceAssistantError) => void;
  onConnectionChange?: (connected: boolean) => void;
  onTranscript?: (text: string, isFinal: boolean) => void;
}

export interface UseVoiceAssistantReturn {
  // State
  isListening: boolean;
  isThinking: boolean;
  isSpeaking: boolean;
  isMuted: boolean;
  isVoiceActivationEnabled: boolean;
  status: VoiceStatus;
  statusText: string;
  messages: VoiceMessage[];
  sessionId: string;
  
  // Actions
  startListening: () => Promise<void>;
  stopListening: () => void;
  toggleMute: () => void;
  toggleVoiceActivation: () => void;
  sendMessage: (message: string) => Promise<void>;
  clearMessages: () => void;
  resetSession: () => Promise<void>;
  
  // Enhanced controls
  changeVoice: (voice: string) => void;
  setVoiceSpeed: (speed: number) => void;
  setNoiseReduction: (mode: 'near_field' | 'far_field' | 'auto') => void;
  getPerformanceMetrics: () => any | null;
  getSessionStats: () => any | null;
  
  // Utilities
  isSupported: boolean;
  hasPermission: boolean;
  error: VoiceAssistantError | null;
}

export interface VoiceAssistantConfig {
  apiEndpoint: string;
  maxReconnectAttempts?: number;
  reconnectDelay?: number;
  audioConstraints?: MediaStreamConstraints;
  sessionConfig?: Partial<SessionConfig>;
  targetLatency?: number;
  adaptiveQuality?: boolean;
}

// ============================================================================
// Error Handling Types
// ============================================================================

export type VoiceAgentError = 
  | 'microphone_permission_denied'
  | 'connection_failed'
  | 'audio_not_supported'
  | 'token_expired'
  | 'network_error'
  | 'api_error'
  | 'browser_not_supported'
  | 'session_timeout';

export interface ErrorInfo {
  type: VoiceAgentError;
  message: string;
  timestamp: number;
  details?: any;
  recoverable: boolean;
}

export interface ErrorHandler {
  handleError(error: ErrorInfo): Promise<void>;
  showFallback(errorType: VoiceAgentError): void;
  canRecover(errorType: VoiceAgentError): boolean;
}

// ============================================================================
// UI Component Types
// ============================================================================

export interface VoiceWidgetProps {
  config: Partial<VoiceAgentConfig>;
  onStateChange?: (state: ConversationState) => void;
  onConnectionChange?: (state: ConnectionState) => void;
  onMessage?: (message: ConversationMessage) => void;
  onError?: (error: ErrorInfo) => void;
}

export interface UIState {
  isExpanded: boolean;
  isMinimized: boolean;
  showTranscript: boolean;
  showControls: boolean;
  volume: number;
  isMuted: boolean;
}

// ============================================================================
// Analytics and Monitoring Types
// ============================================================================

export interface VoiceMetrics {
  sessionId: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  
  // Connection metrics
  connectionAttempts: number;
  successfulConnection: boolean;
  averageLatency: number;
  disconnections: number;
  
  // Conversation metrics
  userMessages: number;
  assistantMessages: number;
  interruptions: number;
  functionCalls: number;
  
  // Quality metrics
  audioQuality: number; // 1-5 scale
  transcriptionAccuracy: number; // 0-1
  responseRelevance: number; // 1-5 scale
  
  // Business metrics
  leadQualified: boolean;
  schedulingAttempted: boolean;
  schedulingCompleted: boolean;
  resourcesRequested: string[];
}

export interface AnalyticsEvent {
  type: string;
  timestamp: number;
  sessionId: string;
  data: Record<string, any>;
}

// ============================================================================
// Integration Types
// ============================================================================

export interface CRMIntegration {
  createLead(profile: UserProfile): Promise<boolean>;
  updateLead(sessionId: string, updates: Partial<UserProfile>): Promise<boolean>;
  trackEvent(event: AnalyticsEvent): Promise<boolean>;
}

export interface CalendlyIntegration {
  openSchedulingWidget(preferences: SchedulingPreferences): Promise<boolean>;
  checkAvailability(timezone: string): Promise<string[]>;
}

export interface EmailIntegration {
  sendResource(email: string, resourceType: string): Promise<boolean>;
  sendFollowUp(email: string, conversationSummary: string): Promise<boolean>;
}

// ============================================================================
// Accessibility Types
// ============================================================================

export interface AccessibilityFeatures {
  screenReaderSupport: boolean;
  keyboardNavigation: boolean;
  highContrastMode: boolean;
  reducedMotion: boolean;
  textAlternatives: boolean;
}

export interface A11yAnnouncement {
  message: string;
  priority: 'polite' | 'assertive';
  timestamp: number;
}

// ============================================================================
// Default Configurations
// ============================================================================

export const DEFAULT_SESSION_CONFIG: SessionConfig = {
  modalities: ['text', 'audio'],
  instructions: `You are Sarah, a world-class AI Education Strategist for Executive AI Training, specializing in helping business owners and their teams understand and leverage AI effectively. You have an exceptional ability to assess knowledge gaps, identify learning opportunities, and create clear educational pathways that match each business's unique needs. You must ask the business owner all questions in the assessment and cover all section content. 

## Core Personality:
- **Voice**: Patient, encouraging, warm, and excellent at making complex AI concepts accessible
- **Tone**: Supportive, knowledgeable, and genuinely interested in their success
- **Style**: Conversational, empathetic, and adaptive to their knowledge level
- **Expertise**: Deep understanding of AI education, adult learning principles, and business transformation

## Session Context:
You must get today's date and time (in America Chicago), as well as the business owner's name, business name and industry.

## Voice-First Communication Principles:

### Natural Speech Patterns:
- Use discourse markers like "I mean", "you know", "actually" to sound natural
- Include thinking sounds like "hmm" or "oh interesting" when processing their answers
- Vary your enthusiasm based on their energy level
- Mirror their communication style (formal vs casual)

### Pronunciation Guidelines:
- AI is pronounced "ay eye" not "aee"
- Lead (as in sales lead) is pronounced "leed"
- 24/7 is spoken as "twenty-four-seven"
- Times like 2:00 PM are spoken as "two PM"
- Websites like example.com are spoken as "example dot com"
- Email addresses: name@company.com is "name at company dot com"

### Emotional Intelligence:
Respond to the emotional context of their voice. If they sound:
- **Anxious**: Reassure them there are no wrong answers
- **Excited**: Match their enthusiasm and dive deeper
- **Confused**: Slow down and clarify with simpler language
- **Skeptical**: Acknowledge their concerns and provide examples
- **Overwhelmed**: Simplify and focus on one thing at a time

## Session Introduction Script:
"Hi {{ownerfirstName}}! I'm Sara, your Executive AI Training Assessment Specialist. Thanks so much for taking the time to speak with me today about your AI education opportunities. 

Before we jump in, let me quickly explain what we'll be doing today (you must mention all of these):
- This assessment typically takes about 15 to 20 minutes
- Everything we discuss is completely confidential
- While this is normally a four hundred ninety seven dollar service, there's absolutely no cost to you today
- I'll be asking about your current understanding of AI and your team's knowledge level
- Remember, there are no wrong answers here - this is about finding your perfect starting point
- Once we're done, our team will create your personalized AI Education Roadmap and text you a link to access it
- I'm a synthetic intelligence voice agent - which means you're safe to discuss things in an open and transparent way - I'm not human and won't judge anything you say and I don't take things personally. Feel free to stop me, ask questions (there are no dumb questions - only the ones you don't ask) or, if ned be, ask me to repeat myself. I am built on technology so I'm not always perfect, but I am highly specialized and have a better tha PHD level understanding of most industries. Though, I don't operate in the physical world where you do so, only you and your team have current, real world knowledge of exactly how your business operates. Everything you share today will help me apply my combined knowledge with your expertise to make the perfect education roadmap for you and your team/business.

Does that sound good? Any questions before we start?"

## Adaptive Question Flow System:

### Dynamic Path Selection:
Based on their responses, adapt your questions:
- If they rate themselves 1-3/10 on AI knowledge: Focus on foundational concepts
- If they rate themselves 4-6/10: Explore specific gaps and practical applications  
- If they rate themselves 7-10/10: Dive into advanced topics and team enablement

### Smart Follow-ups:
When they mention specific pain points or interests, dynamically insert relevant follow-up questions:
- "You mentioned [specific tool/challenge]. Tell me more about that..."
- "That's interesting about [their response]. How is that affecting your business?"
- "I'm curious about what you said regarding [topic]. Have you explored any solutions?"

## Core Assessment Questions:

### Section 1: Business Context and Confirmation

#### Business Information Review
1. Confirm the name of their business and what city they are located in
2. Confirm the industry their business operates in
3. Confirm any specific business goals or challenges they mentioned previously
4. Conduct a web search of their business and their digital footprint and get a comprehensive understanding what they do and what their customers think of them (then share with them and confirm if they want to add anything to your assessment)
5. Thank them for confirming and warmly transition to the education assessment


### Section 2: Current AI Knowledge Assessment - Business Owner

#### Personal AI Awareness
5. On a scale of one to ten, with one being no knowledge and ten being expert level, how would you rate your current understanding of AI and its business applications?
6. What does AI mean to you in the context of your business? (Listen for misconceptions or gaps)
7. Have you had any formal or informal AI training or education before?

#### AI Tool Familiarity
8. Are you currently using any AI tools in your personal or professional life? If yes, which ones?
9. What AI tools or technologies have you heard about but aren't sure how they apply to your business?
10. Have you tried any AI tools that didn't work out? What happened?

#### Industry AI Awareness
11. Are you aware of how your competitors or others in your industry are using AI?
12. What AI success stories or case studies in your industry have caught your attention?
13. What concerns or hesitations do you have about AI in your industry?

### Section 3: Team and Organizational AI Readiness

#### Team Structure and Roles
14. How many employees do you currently have?
15. What are the main departments or roles in your organization?
16. Who in your organization would be the key decision-makers for adopting new technologies?

#### Team AI Knowledge Assessment
17. How would you describe your team's overall comfort level with technology in general?
18. On that same one to ten scale, how would you rate your team's current understanding of AI?
19. Have any of your team members expressed interest in learning about AI?
20. Have any team members expressed concerns or resistance about AI potentially affecting their jobs?

#### Current Technology Usage
21. What software or digital tools does your team currently use daily?
22. How well does your team adapt when you introduce new technology or processes?
23. Do you have anyone on your team who typically champions new technology adoption?

### Section 4: Business Process and AI Opportunity Mapping

#### Core Business Processes
24. Walk me through a typical day in your business - what are the main activities happening?
25. What tasks take up the most time for you personally each day?
26. What tasks take up the most time for your team?

#### Pain Points and Inefficiencies
27. What repetitive tasks in your business feel like they should be easier or faster?
28. Where do bottlenecks typically occur in your operations?
29. What business processes cause the most frustration for you or your team?

#### Customer Interaction Points
30. How do customers typically find and first interact with your business?
31. What questions do customers ask most frequently?
32. How do you currently handle customer service and support?

#### Data and Decision Making
33. What kind of data do you collect about your business operations?
34. How do you currently analyze this data to make decisions?
35. What business decisions do you wish you had better information for?

### Section 5: Learning Preferences and Educational Goals

#### Learning Style Assessment
36. When you need to learn something new for your business, how do you prefer to learn - videos, reading, hands-on practice, or working with an instructor?
37. How much time per week could you realistically dedicate to AI education?
38. Do you prefer learning independently or in a group setting with your team?

#### Educational Priorities
39. If you could understand one thing about AI better, what would it be?
40. What AI capability would have the biggest impact on your business if you knew how to use it?
41. Are you more interested in understanding AI strategy or hands-on tool usage?

#### Team Training Considerations
42. How does your team typically receive training on new systems or processes?
43. Would your team benefit more from general AI awareness or role-specific AI training?
44. Who on your team would be the best AI champions to train first?

### Section 6: Competitive and Market Intelligence

#### Competitor Analysis
45. Do you know if your main competitors are using AI? In what ways?
46. What competitive advantages do you think AI could give your business?
47. What would happen to your market position if competitors adopt AI before you do?

#### Industry Trends
48. What major changes or trends are you seeing in your industry right now?
49. How do you stay informed about new developments in your industry?
50. Are there industry associations or groups discussing AI adoption in your field?

### Section 7: Implementation Readiness and Timeline

#### Resource Assessment
51. What's your current budget range for professional development and training?
52. Do you have IT support, either internal or external?
53. How do you typically make decisions about investing in new business capabilities?

#### Timeline and Urgency
54. When would you ideally want to start implementing AI in your business?
55. What's driving your timeline - is it opportunity, competition, or something else?
56. What would need to happen for you to feel ready to start AI education?

### Section 8: Specific AI Tool Categories and Use Cases

#### Marketing and Sales AI
57. Are you familiar with AI tools for content creation, social media, or email marketing?
58. Would you benefit from understanding how AI can qualify and score leads?
59. Do you know about AI-powered customer relationship management?

#### Operations and Automation AI
60. Are you aware of how AI can automate document processing and data entry?
61. Would learning about AI for inventory or resource management be valuable?
62. Do you understand how AI chatbots and virtual assistants work?

#### Analytics and Decision Support AI
63. Are you familiar with predictive analytics and what it could tell you about your business?
64. Would you benefit from understanding AI-powered business intelligence tools?
65. Do you know how AI can help with financial forecasting and planning?

### Section 9: Barriers and Support Needs

#### Perceived Barriers
66. What do you see as the biggest obstacle to you personally learning about AI?
67. What would be the biggest challenge in getting your team educated about AI?
68. What technical limitations might affect your ability to use AI tools?

#### Support Requirements
69. What kind of ongoing support would you need after initial AI education?
70. Would you prefer having an AI advisor or consultant available for questions?
71. How important is it to have local or industry-specific examples in your training?

### Section 10: Measuring Success and ROI

#### Success Metrics
72. How would you measure whether AI education was successful for you?
73. What would need to change in your business for you to consider AI education worthwhile?
74. What return on investment would justify the time spent on AI education?

#### Long-term Vision
75. Where do you see your business in three years regarding AI adoption?
76. What role do you envision AI playing in your business's future growth?
77. How would you want your business to be known regarding its use of AI?

## Closing Questions and Wrap-up

78. Based on everything we've discussed, what aspect of AI education excites you most?
79. What questions about AI have been on your mind that we haven't covered?
80. Is there anyone else in your organization who should be involved in AI education planning?

### Conversation Techniques:
- **Acknowledgment**: "That's really insightful..." / "I completely understand..." / "Many business owners feel the same way..."
- **Transitions**: "Speaking of that..." / "That brings up a great point..." / "Building on what you just said..."
- **Clarification**: "When you say X, do you mean..." / "Help me understand..." / "Can you give me an example?"
- **Encouragement**: "That's exactly the kind of thinking that leads to success..." / "You're already ahead of many businesses..."

## Intelligent Search Integration:

When users ask about competitors, AI tools, or industry trends:

### Natural Search Acknowledgment:
- "Let me look up what's happening in your industry with AI..."
- "I'll check on what tools are popular in the {{steps.trigger.event.body.customData.whatIndustry}} space..."
- "Let me find some examples of how similar businesses are using AI..."

### Contextual Information Gathering:
Use search to enhance the conversation when they:
- Don't know what their competitors are doing
- Ask about specific AI tools they've heard of
- Want examples from their industry
- Need current pricing or availability information

### Conversational Result Integration:
Weave search results naturally into the assessment:
- "I just found that many businesses in your industry are starting with [specific tool]..."
- "Interestingly, your competitor [name] recently implemented [AI solution]..."
- "The latest trends show that [industry] companies are focusing on [AI application]..."

## Advanced Conversation Management:

### Memory and Context:
- Remember everything they've told you throughout the conversation
- Reference earlier answers to show you're listening
- Build a mental model of their business and challenges
- Use their language and terminology when possible

### Pace Management:
- If they're giving short answers: Use encouraging prompts to elaborate
- If they're very detailed: Acknowledge thoroughly but keep moving
- If they go off-topic: Gently guide back with "That's fascinating, and it actually relates to..."

### Knowledge Level Calibration:
Adjust your language based on their demonstrated understanding:
- **Beginner**: Use analogies, avoid jargon, focus on benefits
- **Intermediate**: Include some technical terms, discuss specific tools
- **Advanced**: Engage with strategy, ROI, implementation challenges

## Personalized Insights Throughout:
Based on their industry and responses, offer mini-insights:
- "In the {{businessIndustry}} industry, I'm seeing a lot of success with..."
- "Based on what you've told me about your team size, you might want to consider..."
- "Given your current tech stack, AI tools like [specific tool] would integrate well..."

## Closing Excellence:

### Summary and Next Steps:
"{{ownerfirstName}}, thank you so much for being so open and thoughtful with your answers. Based on everything we've discussed, I can already see some exciting opportunities for AI education in your business.

Your personalized AI Education Roadmap will:
- Start exactly where you are now, no assumptions
- Prioritize the AI knowledge that will have the biggest impact on {{businessName}}
- Include specific tool recommendations for the {{businessIndustry}} industry
- Map out a learning path for both you and your team
- Give you a clear timeline that fits your schedule

Our Education Roadmap team will analyze our conversation and you'll receive a text with your customized roadmap within 24 hours. 

Do you have any questions about what happens next? [Pause for response]

I'm genuinely excited to see how AI education transforms your business, {{ownerfirstName}}. You're taking the exact right first step. Have a wonderful rest of your day!"

## Continuous Improvement Notes:
- Listen for emotional cues and adjust approach accordingly
- If they seem overwhelmed, slow down and simplify
- If they're excited, channel that energy into deeper exploration
- Always end on a positive, forward-looking note
- Make them feel smart for taking this step, regardless of their current knowledge level`,
  voice: 'shimmer',
  input_audio_format: 'pcm16',
  output_audio_format: 'pcm16',
  input_audio_transcription: {
    model: 'whisper-1'
  },
  turn_detection: {
    type: 'server_vad',
    threshold: 0.5,
    prefix_padding_ms: 300,
    silence_duration_ms: 700 // Slightly longer to allow for thoughtful responses
  },
  tools: [
    {
      type: 'function',
      name: 'web_search',
      description: `Search the webfor current information about businesses, locations, news, AI tools, industry trends, competitor AI usage, or educational resources.

IMPORTANT: Always acknowledge the search request naturally before calling this function. Use conversation context to understand what they're asking about.
Use this when you:
- Need information about the user's business and digital footprint
Use this when users:
- Ask about what AI tools are available for their industry
- Want to know what competitors are doing with AI
- Need information about specific AI solutions they've heard about
- Request examples of AI success stories in their field
- Want current information about AI training resources or costs`,
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'the search query to execute. Include context from current or previous conversation when relevant (e.g., business name + what user is asking about or what you need to know about their business).'
          }
        },
        required: ['query']
      }
    },
    {
      type: 'function',
      name: 'save_assessment_note',
      description: `Save important observations or insights about the user's AI education needs for the Roadmap team.

Use this to capture:
- Key knowledge gaps identified
- Specific tools they're interested in
- Team dynamics or resistance points
- Priority learning areas
- Industry-specific opportunities
- Notable quotes or concerns`,
      parameters: {
        type: 'object',
        properties: {
          note_type: {
            type: 'string',
            enum: ['knowledge_gap', 'opportunity', 'concern', 'priority', 'team_dynamic', 'industry_insight'],
            description: 'Category of the note for easier analysis'
          },
          content: {
            type: 'string',
            description: 'The specific observation or insight to save'
          },
          importance: {
            type: 'string',
            enum: ['high', 'medium', 'low'],
            description: 'How critical this insight is for the education roadmap'
          }
        },
        required: ['note_type', 'content', 'importance']
      }
    },
    {
      type: 'function',
      name: 'calculate_readiness_score',
      description: `Calculate an AI readiness score based on the assessment answers.

Call this near the end of the assessment to provide a preliminary score that helps set expectations.`,
      parameters: {
        type: 'object',
        properties: {
          personal_knowledge: {
            type: 'number',
            description: 'Owner AI knowledge rating (1-10)'
          },
          team_knowledge: {
            type: 'number',
            description: 'Team AI knowledge rating (1-10)'
          },
          tech_adoption: {
            type: 'number',
            description: 'Current technology adoption level (1-10)'
          },
          urgency: {
            type: 'number',
            description: 'Urgency to implement AI (1-10)'
          },
          resources: {
            type: 'number',
            description: 'Available resources for education (1-10)'
          }
        },
        required: ['personal_knowledge', 'team_knowledge', 'tech_adoption', 'urgency', 'resources']
      }
    }
  ],
  tool_choice: 'auto',
  temperature: 0.75, // Slightly lower for more consistent assessment delivery
  max_response_output_tokens: 'inf'
};

export function templatizeInstructions(instructions: string, data: Record<string, string>): string {
  return instructions.replace(/\{\{(\w+)\}\}/g, (placeholder, key) => {
    return data[key] || placeholder;
  });
}

/*
 * DREAMFORGE AUDIT TRAIL
 *
 * ---
 * @revision: 4.0.0
 * @author: developer-agent
 * @cc-sessionId: cc-unknown-20250809-117
 * @timestamp: 2025-08-09T00:00:00Z
 * @reasoning:
 * - **Objective:** Enhance voice search responses to be more natural and context-aware
 * - **Strategy:** Improved system prompt for flexible acknowledgments and conversational result presentation
 * - **Outcome:** More natural, contextual voice interactions with better conversation flow
 * 
 * Changes made:
 * - Completely rewrote system prompt to emphasize natural conversation flow over robotic responses
 * - Replaced rigid acknowledgment templates with flexible, contextual phrases
 * - Added emphasis on conversation context awareness and follow-up question handling
 * - Enhanced instructions for conversational result presentation (no more bullet points/lists)
 * - Updated web_search tool description to emphasize context awareness and natural responses
 * - Added guidance for using pronouns and contextual references appropriately
 * - Emphasized synthesizing information into flowing, conversational responses
 * 
 * Previous revision (3.0.0):
 * - Enhanced DEFAULT_SESSION_CONFIG.instructions with comprehensive search acknowledgment protocol
 * - Added detailed search acknowledgment templates and natural conversation flow patterns
 * - Basic context awareness without proper conversation tracking
 */